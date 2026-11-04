import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ONDATE, PAZIENZA, PIATTI, VIZI } from '../src/config.js';
import { Serata, calcolaMancia, costoPiatto, moltiplicatoreSerie } from '../src/serata/Serata.js';

// I Vizi del cast che non dipendono dalla cucina (ticket 09): Carlotta paga il doppio ma è impaziente, finché Balosso è
// a un Posto la Pazienza di tutti scende più piano, Nella a volte lascia lo Yen d'oro. Ogni Vizio ha i suoi test, che
// girano senza browser. Per avere un peluche preciso a un Posto si cerca un seme in cui arriva (SEMI): niente codice di
// produzione solo per i test.

const SEC = 1000;
const PREZZO = PIATTI.onigiri.price;

// Fa arrivare e siedere `tipo`; si ferma appena è seduto. Torna la Serata e il suo Posto, o null se in questo seme non
// arriva entro `entroMs`.
function conPeluche(tipo, seed, entroMs = 70 * SEC) {
  const serata = new Serata({ seed });
  while (!serata.finita && serata.tempoMs < entroMs) {
    for (const evento of serata.update(10)) {
      if (evento.tipo === 'clienteArrivato' && evento.cliente.tipo === tipo) return { serata, posto: evento.posto, id: evento.cliente.id };
    }
  }
  return null;
}

// Il primo seme, tra i primi `quanti`, in cui `tipo` arriva e la prova `riesce` (la prova dice null per scartare il seme).
function provaSu(tipo, riesce, quanti = 60) {
  for (let i = 0; i < quanti; i++) {
    const trovato = conPeluche(tipo, `vizi-${tipo}-${i}`);
    if (!trovato) continue;
    const esito = riesce(trovato);
    if (esito !== null) return esito;
  }
  throw new Error(`nessun seme di ${quanti} dà una prova valida per ${tipo}`);
}

// Un onigiri sul Bancone e il Cliente servito subito: gli eventi di servi().
function cucinaEServi(serata, posto) {
  for (const { ingrediente } of PIATTI.onigiri.ricetta) serata.tocca(ingrediente);
  serata.tocca('tagliere');
  return serata.servi(posto);
}

const clienteA = (serata, posto) => serata.stato().posti[posto].cliente;

// --- Che cosa dicono i dati ---

// I test sotto leggono i numeri da VIZI, quindi seguono i ritocchi del ticket 29. Questo fissa invece cosa significa ogni
// Vizio nella spec (GAME_SPEC.md): il doppio e il triplo sono 2 e 3, "più piano" e "impaziente" sono meno di 1, e "a volte"
// non è mai né mai né sempre. Se un ritocco esce da qui, è un altro Vizio.
test('i numeri dei Vizi dicono quello che dice la spec: il doppio, il triplo, più piano, più impaziente, a volte', () => {
  assert.equal(VIZI.carlotta.prezzoX, 2, 'Carlotta paga il doppio');
  assert.ok(VIZI.carlotta.pazienzaX > 0 && VIZI.carlotta.pazienzaX < 1, 'Carlotta è impaziente: la sua Pazienza dura meno');
  assert.ok(VIZI.balosso.ritmoPazienza > 0 && VIZI.balosso.ritmoPazienza < 1, 'con Balosso la Pazienza scende più piano');
  assert.equal(VIZI.nella.manciaX, 3, 'lo Yen d’oro triplica la Mancia');
  assert.ok(VIZI.nella.yenDOro >= 0.1 && VIZI.nella.yenDOro <= 0.6, 'lo Yen d’oro arriva a volte: né quasi mai né quasi sempre');
});

// --- Carlotta ---

test('Carlotta paga il doppio: il prezzo dell’Ordine e la Mancia che ne segue, non la Spesa', () => {
  provaSu('carlotta', ({ serata, posto }) => {
    assert.equal(clienteA(serata, posto).vizio, 'carlotta');
    const eventi = cucinaEServi(serata, posto);
    const servito = eventi.find((e) => e.tipo === 'servito');
    assert.ok(servito, 'Carlotta non è stata servita');
    assert.equal(servito.prezzo, 2 * PREZZO, 'il doppio di un onigiri');
    assert.equal(servito.prezzo, PREZZO * VIZI.carlotta.prezzoX);
    assert.equal(servito.mancia, calcolaMancia(PREZZO * VIZI.carlotta.prezzoX, servito.cuori, servito.moltiplicatoreSerie));
    assert.equal(servito.totale, servito.prezzo + servito.mancia);
    const stato = serata.stato();
    assert.equal(stato.vendite, servito.totale);
    // Gli Ingredienti costano come per chiunque: è un guadagno in più, non una spesa in più.
    assert.equal(stato.spesa, costoPiatto('onigiri'));
    assert.equal(stato.spreco, 0);
    assert.equal(stato.incasso, servito.totale - costoPiatto('onigiri'));
    return true;
  });
});

test('un Cliente di passaggio, a parità di Ordine, paga il prezzo normale', () => {
  const serata = new Serata({ seed: 'vizi-passaggio' });
  let arrivo = null;
  while (!arrivo) arrivo = serata.update(10).find((e) => e.tipo === 'clienteArrivato');
  assert.equal(clienteA(serata, arrivo.posto).vizio, null);
  const servito = cucinaEServi(serata, arrivo.posto).find((e) => e.tipo === 'servito');
  assert.equal(servito.prezzo, PREZZO);
});

test('Carlotta è impaziente: la sua Pazienza dura i 3/5 di quella normale, e se ne va prima', () => {
  provaSu('carlotta', ({ serata, posto, id }) => {
    const carlotta = clienteA(serata, posto);
    const inOndata = serata.stato().andamento.inOndata;
    const normaleMs = (inOndata ? ONDATE.pazienzaSec : PAZIENZA.durationSec) * SEC;
    assert.equal(carlotta.pazienzaTotaleMs, Math.round(normaleMs * VIZI.carlotta.pazienzaX));
    assert.ok(carlotta.pazienzaTotaleMs < normaleMs);
    // Se ne va quando la sua Pazienza finisce, non dopo quella di un Cliente normale: e solo se nessun Balosso la rallenta.
    const arrivo = serata.tempoMs;
    const lamenti = [];
    while (!serata.finita) {
      if (serata.ritmoPazienza() !== 1) return null;
      const eventi = serata.update(10);
      for (const e of eventi) if (e.tipo === 'lamento' && e.clienteId === id) lamenti.push({ ...e, tempoMs: serata.tempoMs });
      if (eventi.some((e) => e.tipo === 'clienteVaVia' && e.clienteId === id)) break;
    }
    if (serata.finita) return null;
    assert.equal(serata.tempoMs - arrivo, carlotta.pazienzaTotaleMs);
    // Anche i cuoricini sono più corti: il Lamento (2 e 1 cuoricini) arriva prima, in proporzione.
    const quintoMs = carlotta.pazienzaTotaleMs / PAZIENZA.hearts;
    assert.deepEqual(lamenti.map((l) => l.cuori), [2, 1]);
    assert.deepEqual(lamenti.map((l) => l.tempoMs - arrivo), [carlotta.pazienzaTotaleMs - 2 * quintoMs, carlotta.pazienzaTotaleMs - quintoMs]);
    return true;
  });
});

// --- Balosso ---

// Quanto scende la Pazienza dei Clienti seduti in `ms`, per ognuno di quelli che stanno ai Posti all'inizio e alla fine.
function cali(serata, ms) {
  const prima = new Map(serata.stato().posti.filter((p) => p.cliente).map((p) => [p.cliente.id, p.cliente.pazienzaMs]));
  serata.update(ms);
  const dopo = new Map(serata.stato().posti.filter((p) => p.cliente).map((p) => [p.cliente.id, p.cliente.pazienzaMs]));
  return Object.fromEntries([...prima].filter(([id]) => dopo.has(id)).map(([id, p]) => [id, p - dopo.get(id)]));
}

test('finché Balosso è a un Posto la Pazienza di tutti scende più piano, lui compreso; quando se ne va torna normale', () => {
  provaSu('balosso', ({ serata, posto, id }) => {
    // Serve un altro Cliente seduto insieme a lui, con Pazienza abbastanza per tutta la misura.
    const altro = () => serata.stato().posti.find((p) => p.cliente && p.cliente.id !== id && p.cliente.pazienzaMs > 5 * SEC);
    while (!altro() && !serata.finita && serata.tempoMs < 80 * SEC) serata.update(10);
    if (!altro() || clienteA(serata, posto)?.id !== id) return null;
    const stato = serata.stato();
    assert.equal(stato.ritmoPazienza, VIZI.balosso.ritmoPazienza);

    const conBalosso = cali(serata, 2 * SEC);
    const attesi = 2 * SEC * VIZI.balosso.ritmoPazienza;
    assert.ok(attesi < 2 * SEC, 'con Balosso la Pazienza scende meno del tempo che passa');
    assert.ok(Object.keys(conBalosso).length >= 2, 'servono almeno due Clienti da confrontare');
    for (const [clienteId, calo] of Object.entries(conBalosso)) {
      assert.ok(Math.abs(calo - attesi) <= 10, `il Cliente ${clienteId} è sceso di ${calo} ms invece di ${attesi}`);
    }
    // I cuoricini seguono la Pazienza, non il tempo: ognuno dura più a lungo, senza altro da fare.
    const balosso = clienteA(serata, posto);
    assert.equal(balosso.pazienzaTotaleMs, (serata.faseA(serata.tempoMs).ondata ? ONDATE.pazienzaSec : PAZIENZA.durationSec) * SEC, 'Balosso ha la Pazienza di tutti, solo che scende più piano');

    // Balosso è servito: se ne va, e la Pazienza di chi resta torna a scendere alla velocità di sempre.
    cucinaEServi(serata, posto);
    assert.equal(clienteA(serata, posto), null, 'Balosso è ancora al suo Posto');
    if (!serata.stato().posti.some((p) => p.cliente && p.cliente.pazienzaMs > 3 * SEC)) return null;
    assert.equal(serata.ritmoPazienza(), 1);
    const senza = cali(serata, 1 * SEC);
    assert.equal(serata.stato().ritmoPazienza, 1);
    for (const calo of Object.values(senza)) assert.ok(Math.abs(calo - 1 * SEC) <= 10, `senza Balosso la Pazienza è scesa di ${calo} ms invece di ${SEC}`);
    return true;
  });
});

test('Balosso non si somma a sé stesso, e senza di lui il ritmo è sempre quello normale', () => {
  const serata = new Serata({ seed: 'vizi-ritmo' });
  assert.equal(serata.stato().ritmoPazienza, 1);
  let visto = { con: 0, senza: 0 };
  while (!serata.finita) {
    serata.update(10);
    const balosso = serata.stato().posti.filter((p) => p.cliente?.tipo === 'balosso').length;
    assert.ok(balosso <= 1, 'due Balosso ai Posti');
    const atteso = balosso ? VIZI.balosso.ritmoPazienza : 1;
    assert.equal(serata.stato().ritmoPazienza, atteso);
    visto[balosso ? 'con' : 'senza'] += 1;
  }
  assert.ok(visto.senza > 0);
});

// --- Nella ---

test('Nella a volte lascia lo Yen d’oro, che triplica la sua Mancia e non conta come Serie', () => {
  let nella = 0;
  let oro = 0;
  for (let i = 0; i < 300; i++) {
    const trovato = conPeluche('nella', `vizi-oro-${i}`);
    if (!trovato) continue;
    const { serata, posto } = trovato;
    assert.equal(clienteA(serata, posto).vizio, 'nella');
    const eventi = cucinaEServi(serata, posto);
    const servito = eventi.find((e) => e.tipo === 'servito');
    nella += 1;
    assert.equal(servito.prezzo, PREZZO, 'Nella paga il prezzo normale');
    assert.equal(servito.serie, 1);
    const yenDOro = eventi.find((e) => e.tipo === 'yenDOro');
    assert.equal(servito.yenDOro, Boolean(yenDOro));
    if (yenDOro) {
      oro += 1;
      assert.equal(servito.mancia, calcolaMancia(PREZZO, servito.cuori, VIZI.nella.manciaX), 'la Mancia è tripla');
      assert.ok(servito.mancia > 2 * calcolaMancia(PREZZO, servito.cuori, 1), 'più del doppio di una Mancia normale');
      assert.deepEqual([yenDOro.posto, yenDOro.clienteId, yenDOro.yen], [posto, servito.clienteId, servito.mancia]);
      assert.ok(servito.mancia > 0);
    } else {
      assert.equal(servito.mancia, calcolaMancia(PREZZO, servito.cuori, 1));
    }
    // Lo Yen d'oro non è un merito della Serie: la Mancia "da Serie" resta zero con un solo Ordine servito.
    assert.equal(serata.stato().manciaDaSerie, 0);
  }
  assert.ok(nella >= 60, `Nella è arrivata in soli ${nella} semi`);
  // La probabilità dei dati è 0,35: con qualche decina di prove il conto sta vicino, ma non è mai 0 né tutti.
  const quota = oro / nella;
  assert.ok(quota > VIZI.nella.yenDOro - 0.15 && quota < VIZI.nella.yenDOro + 0.15, `${oro} Yen d’oro su ${nella} Ordini di Nella (${quota.toFixed(2)})`);
});

test('lo Yen d’oro è sempre lo stesso con lo stesso seme, e non cambia nient’altro della Serata', () => {
  const esito = (seed) => {
    const trovato = conPeluche('nella', seed);
    if (!trovato) return null;
    const servito = cucinaEServi(trovato.serata, trovato.posto).find((e) => e.tipo === 'servito');
    return `${servito.yenDOro}:${servito.mancia}`;
  };
  const semi = Array.from({ length: 30 }, (_, i) => `vizi-oro-${i}`);
  assert.deepEqual(semi.map(esito), semi.map(esito));
  assert.ok(new Set(semi.map(esito)).size > 1, 'tutti uguali: nessuna variazione');
});

// --- Tutti insieme ---

test('ogni Ordine servito paga prezzo e Mancia secondo i Vizi, e solo Nella lascia lo Yen d’oro', () => {
  let serviti = 0;
  let conOro = 0;
  const visti = { carlotta: 0, nella: 0, balosso: 0 };
  for (let i = 0; i < 30; i++) {
    const serata = new Serata({ seed: `vizi-tutti-${i}` });
    while (!serata.finita) {
      // Il Bancone ha sempre tutto: ogni Cliente è servito subito, quindi si vedono tutti i Vizi con la Serie che cresce.
      serata.bancone = ['onigiri', 'onigiri', 'onigiri'];
      serata.update(10);
      for (const { posto, cliente } of serata.stato().posti) {
        if (!cliente) continue;
        for (const evento of serata.servi(posto)) {
          if (evento.tipo !== 'servito') continue;
          serviti += 1;
          const vizio = VIZI[cliente.vizio];
          const oro = evento.yenDOro;
          if (oro) conOro += 1;
          assert.ok(!oro || cliente.tipo === 'nella', `${cliente.tipo} ha lasciato lo Yen d'oro`);
          assert.equal(evento.prezzo, PREZZO * (vizio?.prezzoX ?? 1));
          assert.equal(evento.mancia, calcolaMancia(evento.prezzo, evento.cuori, moltiplicatoreSerie(evento.serie) * (oro ? VIZI.nella.manciaX : 1)));
          assert.equal(evento.totale, evento.prezzo + evento.mancia);
          if (cliente.vizio) visti[cliente.vizio] += 1;
        }
      }
    }
  }
  assert.ok(serviti > 400);
  assert.ok(conOro > 0, 'nessuno Yen d’oro in 30 Serate');
  for (const [vizio, n] of Object.entries(visti)) assert.ok(n > 0, `${vizio} non è mai stato servito`);
});
