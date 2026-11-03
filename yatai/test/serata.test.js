import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Serata, calcolaMancia, calcolaStelle, costoPiatto, cuoriDa, espressioneDa, fasiDellaSerata, segnoDa } from '../src/serata/Serata.js';
import { TESTI } from '../src/i18n.js';
import { CLIENTI, FRAME_MS, LAMENTO, ONDATE, PAZIENZA, PIATTI, POSTI, SERATA, SERATA_PRIMA } from '../src/config.js';

const SEC = 1000;

// Avanza il tempo come fa la scena: a passi da un sessantesimo di secondo. Restituisce gli eventi.
function avanza(serata, ms) {
  const eventi = [];
  for (let t = 0; t < ms - 1e-6; t += FRAME_MS) eventi.push(...serata.update(Math.min(FRAME_MS, ms - t)));
  return eventi;
}

const tipi = (eventi) => eventi.map((e) => e.tipo);

// Una Serata in cui il primo Cliente è già al suo Posto, con la Pazienza piena.
function conPrimoCliente(opzioni = {}) {
  const serata = new Serata({ seed: 'prova', ...opzioni });
  avanza(serata, CLIENTI.primoArrivoSec * SEC + 50);
  return serata;
}

// Prepara un onigiri come dice la ricetta (riso, alga) e lo prende: ora è sul Bancone.
function preparaOnigiri(serata) {
  for (const { ingrediente } of PIATTI.onigiri.ricetta) serata.tocca(ingrediente);
  serata.tocca('tagliere');
}

// Un giocatore che fa sempre la mossa ovvia: serve chi può, poi cucina.
function giocaTutta(serata) {
  while (serata.stato().fase === 'in corso') {
    avanza(serata, 100);
    const stato = serata.stato();
    for (const posto of stato.posti) if (posto.cliente) serata.servi(posto.posto);
    for (const postazione of stato.postazioni) serata.tocca(postazione.prossimo ?? postazione.id);
  }
}

test('la Serata parte vuota: 3 Posti liberi, Incasso a zero, 120 secondi da giocare', () => {
  const stato = new Serata({ seed: 'a' }).stato();
  assert.equal(stato.fase, 'in corso');
  assert.equal(stato.posti.length, POSTI.quanti);
  assert.ok(stato.posti.every((p) => p.cliente === null));
  assert.equal(stato.incasso, 0);
  assert.equal(stato.restaMs, SERATA.durationSec * SEC);
  assert.deepEqual(stato.bancone, []);
  assert.equal(stato.postazioni[0].id, 'tagliere');
  assert.equal(stato.postazioni[0].stato, 'libera');
});

test('il primo Cliente arriva a un Posto con un Ordine di onigiri e la Pazienza piena', () => {
  const serata = new Serata({ seed: 'a' });
  const eventi = avanza(serata, CLIENTI.primoArrivoSec * SEC + 50);
  const arrivo = eventi.find((e) => e.tipo === 'clienteArrivato');
  assert.ok(arrivo, 'nessun Cliente è arrivato');
  assert.ok(CLIENTI.passaggio.includes(arrivo.cliente.tipo));
  assert.deepEqual(arrivo.cliente.ordine, ['onigiri']);
  const cliente = serata.stato().posti[arrivo.posto].cliente;
  assert.equal(cliente.cuori, PAZIENZA.hearts);
  assert.deepEqual(cliente.ordine, ['onigiri']);
});

test('la ricetta dell’onigiri è riso, alga e si prende: 3 tocchi, 30 Yen di Ingredienti', () => {
  assert.deepEqual(PIATTI.onigiri.ricetta.map((r) => r.ingrediente), ['riso', 'alga']);
  assert.equal(costoPiatto('onigiri'), 30, 'riso 20 e alga 10 (GAME_SPEC.md)');
  assert.ok(costoPiatto('onigiri') <= PIATTI.onigiri.price / 3, 'il costo è circa un terzo del prezzo, non di più');
  assert.equal(costoPiatto('taiyaki'), 0, 'i Piatti senza ricetta (ancora da fare, ticket 08) non hanno Ingredienti');
});

test('lo Yatai ha una Scorta per Ingrediente e poi la Postazione, nell’ordine della ricetta', () => {
  const stato = new Serata({ seed: 'a' }).stato();
  assert.deepEqual(stato.fila.map((f) => `${f.voce}:${f.id}`), ['scorta:riso', 'scorta:alga', 'postazione:tagliere']);
  assert.deepEqual(stato.scorte.map((s) => [s.id, s.costo]), [['riso', 20], ['alga', 10]]);
  assert.equal(stato.postazioni[0].prossimo, 'riso');
});

test('l’onigiri si fa a tocchi: riso, alga, poi si prende; ogni Ingrediente si paga subito', () => {
  const serata = conPrimoCliente();

  const riso = serata.tocca('riso');
  assert.deepEqual(tipi(riso), ['ingrediente']);
  assert.deepEqual([riso[0].postazione, riso[0].scorta, riso[0].costo, riso[0].fatti, riso[0].di], ['tagliere', 'riso', 20, 1, 2]);
  assert.equal(serata.stato().postazioni[0].stato, 'inPreparazione');
  assert.equal(serata.stato().postazioni[0].prossimo, 'alga');
  assert.equal(serata.stato().spesa, 20);
  assert.equal(serata.stato().incasso, -20, 'l’Incasso scende subito di 20');

  const alga = serata.tocca('alga');
  assert.deepEqual(tipi(alga), ['ingrediente', 'piattoPronto']);
  assert.equal(serata.stato().postazioni[0].stato, 'pronto');
  assert.equal(serata.stato().postazioni[0].prossimo, null);
  assert.equal(serata.stato().spesa, 30);
  assert.deepEqual(serata.stato().bancone, [], 'finché non lo si prende non è sul Bancone');

  assert.deepEqual(tipi(serata.tocca('tagliere')), ['sulBancone']);
  assert.deepEqual(serata.stato().bancone, ['onigiri']);
  assert.equal(serata.stato().postazioni[0].stato, 'libera');
  assert.equal(serata.stato().postazioni[0].prossimo, 'riso');
});

test('sbagliare l’ordine non costa niente e non cambia niente: il tocco è rifiutato', () => {
  const serata = conPrimoCliente();
  // L'alga prima del riso.
  const alga = serata.tocca('alga');
  assert.deepEqual(tipi(alga), ['ingredienteRifiutato']);
  assert.deepEqual([alga[0].scorta, alga[0].motivo], ['alga', 'ordine']);
  assert.equal(serata.stato().spesa, 0);
  assert.equal(serata.stato().incasso, 0);
  assert.equal(serata.stato().postazioni[0].stato, 'libera');

  // Il riso due volte: il secondo è fuori ordine.
  serata.tocca('riso');
  const duplicato = serata.tocca('riso');
  assert.deepEqual([tipi(duplicato)[0], duplicato[0].motivo], ['ingredienteRifiutato', 'ordine']);
  assert.equal(serata.stato().spesa, 20, 'solo il primo riso si è pagato');
  assert.equal(serata.stato().postazioni[0].fatti, 1);

  // La ricetta si può comunque finire: il tocco sbagliato ha fatto perdere solo un tocco.
  assert.deepEqual(tipi(serata.tocca('alga')), ['ingrediente', 'piattoPronto']);
  assert.equal(serata.stato().fase, 'in corso', 'nessun game over');
});

test('con l’onigiri finito sul tagliere un altro Ingrediente è rifiutato come "occupato"', () => {
  const serata = conPrimoCliente();
  serata.tocca('riso');
  serata.tocca('alga');
  const rifiuto = serata.tocca('riso');
  assert.deepEqual([tipi(rifiuto)[0], rifiuto[0].motivo], ['ingredienteRifiutato', 'occupato']);
  assert.equal(serata.stato().spesa, 30);
});

test('toccare il tagliere prima che l’onigiri sia finito non fa niente', () => {
  const serata = conPrimoCliente();
  assert.deepEqual(tipi(serata.tocca('tagliere')), ['nienteDaPrendere']);
  serata.tocca('riso');
  assert.deepEqual(tipi(serata.tocca('tagliere')), ['nienteDaPrendere']);
  assert.deepEqual(serata.stato().bancone, []);
  assert.equal(serata.stato().postazioni[0].fatti, 1, 'il riso è ancora lì');
});

test('una Postazione sconosciuta viene ignorata', () => {
  const serata = conPrimoCliente();
  assert.deepEqual(tipi(serata.tocca('piastra')), ['postazioneSconosciuta']);
});

test('se il Bancone è pieno il Piatto pronto resta sulla Postazione', () => {
  const serata = new Serata({ seed: 'a', banconeCapienza: 1 });
  preparaOnigiri(serata);
  assert.deepEqual(serata.stato().bancone, ['onigiri']);
  serata.tocca('riso');
  serata.tocca('alga');
  assert.deepEqual(tipi(serata.tocca('tagliere')), ['banconePieno']);
  assert.equal(serata.stato().postazioni[0].stato, 'pronto');
  assert.equal(serata.stato().bancone.length, 1);
});

test('l’Incasso è il netto: Vendite meno Spesa, e un onigiri servito non lascia Spreco', () => {
  const serata = conPrimoCliente();
  preparaOnigiri(serata);
  const [servito] = serata.servi(0);
  const stato = serata.stato();
  assert.equal(stato.vendite, servito.totale);
  assert.equal(stato.spesa, 30);
  assert.equal(stato.incasso, servito.totale - 30);
  assert.equal(stato.spreco, 0);
});

test('lo Spreco sono gli Ingredienti pagati che non finiscono in un onigiri servito, e non si rimborsa', () => {
  const serata = new Serata({ seed: 'a' });
  avanza(serata, SEC * 2);
  // Un onigiri finito ma mai servito, e un riso lasciato a metà.
  serata.tocca('riso');
  serata.tocca('alga');
  assert.equal(serata.stato().spreco, 30);
  const eventi = avanza(serata, SERATA.durationSec * SEC);
  const fine = eventi.find((e) => e.tipo === 'serataFinita');
  assert.deepEqual([fine.vendite, fine.spesa, fine.spreco, fine.incasso], [0, 30, 30, -30]);
});

test('una Serata può chiudere in rosso: niente stelle, ma nessun game over e si arriva alla fine', () => {
  const serata = new Serata({ seed: 'a' });
  avanza(serata, SEC);
  serata.tocca('riso');
  assert.equal(serata.stato().incasso, -20);
  assert.equal(serata.stato().stelle, 0);
  assert.equal(serata.stato().fase, 'in corso');
  const fine = avanza(serata, SERATA.durationSec * SEC).find((e) => e.tipo === 'serataFinita');
  assert.ok(fine.incasso < 0);
  assert.equal(fine.stelle, 0);
});

test('le stelle si contano sul netto, non sulle Vendite', () => {
  const serata = new Serata({ seed: 'a', obiettivo: 100 });
  avanza(serata, SEC * 2);
  preparaOnigiri(serata);
  const [servito] = serata.servi(serata.stato().posti.findIndex((p) => p.cliente));
  // Vendite 150 (100 + 50 di Mancia): sulle Vendite sarebbero ★★ (130), sul netto 120 è ★.
  assert.equal(servito.totale, 150);
  assert.equal(serata.stato().incasso, 120);
  assert.equal(serata.stato().stelle, 1);
});

test("se sul Bancone manca l'Ordine il Cliente non è servito e scuote la testa", () => {
  const serata = conPrimoCliente();
  const prima = serata.stato().posti[0].cliente;
  const eventi = serata.servi(0);
  assert.deepEqual(tipi(eventi), ['scuoteTesta']);
  assert.deepEqual(eventi[0].mancano, ['onigiri']);
  const dopo = serata.stato();
  assert.equal(dopo.incasso, 0);
  assert.equal(dopo.serviti, 0);
  assert.equal(dopo.posti[0].cliente.id, prima.id);
  assert.equal(dopo.posti[0].cliente.cuori, prima.cuori);
});

test('servire un Posto senza Cliente non fa niente', () => {
  const serata = new Serata({ seed: 'a' });
  assert.deepEqual(tipi(serata.servi(1)), ['postoVuoto']);
});

test('servire a Pazienza piena paga il prezzo più la Mancia massima', () => {
  const serata = conPrimoCliente();
  preparaOnigiri(serata);
  // Il tempo passato a cuocere ha già tolto qualche cuoricino? No: bastano 1,1 s su 25.
  const eventi = serata.servi(0);
  const mancia = Math.round(PIATTI.onigiri.price * PAZIENZA.maxManciaRatio);
  assert.deepEqual(tipi(eventi), ['servito', 'mancia', 'moneta']);
  assert.equal(eventi[0].prezzo, PIATTI.onigiri.price);
  assert.equal(eventi[0].cuori, PAZIENZA.hearts);
  assert.equal(eventi[0].mancia, mancia);
  assert.equal(eventi[2].yen, PIATTI.onigiri.price + mancia);

  const stato = serata.stato();
  // L'Incasso è il netto: il prezzo e la Mancia meno i 30 Yen di Ingredienti.
  assert.equal(stato.incasso, PIATTI.onigiri.price + mancia - costoPiatto('onigiri'));
  assert.equal(stato.vendite, PIATTI.onigiri.price + mancia);
  assert.equal(stato.serviti, 1);
  assert.deepEqual(stato.bancone, []);
  assert.equal(stato.posti[0].cliente, null);
});

test('la Mancia scende coi cuoricini e a zero cuori non c è', () => {
  assert.equal(calcolaMancia(100, 5), 50);
  assert.equal(calcolaMancia(100, 4), 40);
  assert.equal(calcolaMancia(100, 3), 30);
  assert.equal(calcolaMancia(100, 2), 20);
  assert.equal(calcolaMancia(100, 1), 10);
  assert.equal(calcolaMancia(100, 0), 0);
  // Gli Yen sono interi.
  assert.equal(calcolaMancia(250, 3), 75);
  assert.equal(calcolaMancia(300, 1), 30);
  assert.ok(Number.isInteger(calcolaMancia(333, 2)));
});

test('i cuoricini si spengono col tempo: 5 pieni, uno in meno ogni quinto della Pazienza', () => {
  const quinto = (PAZIENZA.durationSec * SEC) / PAZIENZA.hearts;
  assert.equal(cuoriDa(PAZIENZA.durationSec * SEC), 5);
  assert.equal(cuoriDa(4 * quinto + 1), 5);
  assert.equal(cuoriDa(4 * quinto), 4);
  assert.equal(cuoriDa(quinto + 1), 2);
  assert.equal(cuoriDa(1), 1);
  assert.equal(cuoriDa(0), 0);
});

test('aspettare riduce la Mancia: servito a metà Pazienza dà meno che a Pazienza piena', () => {
  const serata = conPrimoCliente();
  avanza(serata, PAZIENZA.durationSec * SEC * 0.5);
  preparaOnigiri(serata);
  const [servito] = serata.servi(0);
  assert.equal(servito.tipo, 'servito');
  assert.ok(servito.cuori < PAZIENZA.hearts);
  assert.equal(servito.mancia, calcolaMancia(PIATTI.onigiri.price, servito.cuori));
  assert.ok(servito.mancia < PIATTI.onigiri.price * PAZIENZA.maxManciaRatio);
});

test('quando la Pazienza finisce il Cliente se ne va imbronciato e non paga', () => {
  const serata = conPrimoCliente();
  const eventi = avanza(serata, PAZIENZA.durationSec * SEC + 100);
  const via = eventi.find((e) => e.tipo === 'clienteVaVia');
  assert.ok(via, 'il Cliente non se n è andato');
  assert.equal(via.motivo, 'pazienza');
  assert.equal(via.posto, 0);
  const cuori = eventi.filter((e) => e.tipo === 'cuoreSpento' && e.posto === 0).map((e) => e.cuori);
  assert.deepEqual(cuori, [4, 3, 2, 1, 0]);
  const stato = serata.stato();
  assert.equal(stato.incasso, 0);
  assert.equal(stato.serviti, 0);
  assert.equal(stato.persi, 1);
  assert.equal(stato.fase, 'in corso', 'nessun game over a metà Serata');
});

test('Lamento: l espressione e il segno seguono i cuoricini, con le soglie di config.js', () => {
  assert.deepEqual(LAMENTO, { perplessaA: 2, imbronciataA: 1 });
  const attesi = {
    5: ['neutra', null],
    4: ['neutra', null],
    3: ['neutra', null],
    2: ['perplessa', 'goccia'],
    1: ['imbronciata', 'sbuffo'],
    0: ['imbronciata', 'sbuffo'],
  };
  for (const [cuori, [espressione, segno]] of Object.entries(attesi)) {
    assert.equal(espressioneDa(Number(cuori)), espressione, `espressione a ${cuori} cuoricini`);
    assert.equal(segnoDa(Number(cuori)), segno, `segno a ${cuori} cuoricini`);
  }
});

test('Lamento: un evento a 2 cuoricini e uno a 1, uno per scalino, dopo il cuoricino che si spegne', () => {
  const serata = conPrimoCliente();
  const eventi = avanza(serata, PAZIENZA.durationSec * SEC + 100);
  // Solo il primo Cliente (al Posto 0): intanto ne arrivano altri, con i loro Lamenti.
  const lamenti = eventi.filter((e) => e.tipo === 'lamento' && e.posto === 0 && e.clienteId === 1);
  assert.deepEqual(lamenti.map((e) => [e.cuori, e.espressione, e.segno]), [[2, 'perplessa', 'goccia'], [1, 'imbronciata', 'sbuffo']]);
  // Ogni Lamento viene subito dopo il cuoricino che lo provoca.
  for (const lamento of lamenti) {
    const i = eventi.indexOf(lamento);
    assert.deepEqual([eventi[i - 1].tipo, eventi[i - 1].cuori], ['cuoreSpento', lamento.cuori]);
  }
  // E prima di 3 cuoricini non c'è nessun Lamento.
  const finoATre = eventi.slice(0, eventi.findIndex((e) => e.tipo === 'cuoreSpento' && e.cuori === 2));
  assert.ok(!finoATre.some((e) => e.tipo === 'lamento'));
});

test('Lamento: il Cliente servito a 2 cuoricini non ne ha altri, e il prossimo ricomincia da capo', () => {
  const serata = conPrimoCliente();
  const primo = serata.stato().posti[0].cliente;
  const fino = avanza(serata, PAZIENZA.durationSec * SEC * 0.65);
  assert.equal(serata.stato().posti[0].cliente.cuori, 2);
  assert.equal(fino.filter((e) => e.tipo === 'lamento').length, 1);
  preparaOnigiri(serata);
  assert.equal(serata.servi(0)[0].tipo, 'servito');
  const dopo = avanza(serata, 40 * SEC);
  const lamenti = dopo.filter((e) => e.tipo === 'lamento');
  assert.ok(lamenti.length >= 2, 'un Cliente nuovo deve lamentarsi per conto suo');
  assert.ok(lamenti.every((e) => e.clienteId !== primo.id), 'il Cliente servito non si lamenta più');
  for (const id of new Set(lamenti.map((e) => e.clienteId))) {
    assert.ok(lamenti.filter((e) => e.clienteId === id).length <= 2, 'più di un evento per scalino');
  }
});

test('Lamento: gli scalini sono quelli dei cuoricini, qualunque sia la velocità della Pazienza', () => {
  // Una Pazienza che scende a passi di durata diversa (come con un Vizio che la accelera o la rallenta).
  const scalini = (passoMs) => {
    const serata = conPrimoCliente();
    const posto = serata.posti[0];
    const eventi = [];
    while (posto.cliente) serata.aspetta(posto, 0, passoMs, eventi);
    return eventi.filter((e) => e.tipo === 'lamento').map((e) => [e.cuori, e.espressione, e.segno]);
  };
  const attesi = [[2, 'perplessa', 'goccia'], [1, 'imbronciata', 'sbuffo']];
  for (const passoMs of [1, 10, 40, 333]) assert.deepEqual(scalini(passoMs), attesi, `passo da ${passoMs} ms`);
  // Un frame lunghissimo che salta due scalini in un colpo: nessuno si perde, e in ordine.
  const serata = conPrimoCliente();
  const eventi = [];
  serata.aspetta(serata.posti[0], 0, PAZIENZA.durationSec * SEC * 0.85, eventi);
  assert.deepEqual(eventi.filter((e) => e.tipo === 'lamento').map((e) => e.cuori), [2, 1]);
});

test('in un Posto appena liberato non arriva nessuno prima della pausa di ricambio', () => {
  const serata = new Serata({ seed: 'ricambio' });
  const partenze = new Map();
  let controllati = 0;
  const guarda = (eventi) => {
    for (const e of eventi) {
      if (e.tipo === 'servito' || e.tipo === 'clienteVaVia') partenze.set(e.posto, serata.stato().tempoMs);
      if (e.tipo === 'clienteArrivato' && partenze.has(e.posto)) {
        controllati++;
        assert.ok(serata.stato().tempoMs - partenze.get(e.posto) >= POSTI.ricambioSec * SEC);
      }
    }
  };
  while (serata.stato().fase === 'in corso') {
    guarda(serata.update(100));
    for (const posto of serata.stato().posti) if (posto.cliente) guarda(serata.servi(posto.posto));
    for (const postazione of serata.stato().postazioni) serata.tocca(postazione.id);
  }
  assert.ok(controllati > 3, 'il test non ha visto abbastanza ricambi');
});

test('i Clienti non superano mai i Posti', () => {
  const serata = new Serata({ seed: 'folla' });
  for (let i = 0; i < SERATA.durationSec * 60; i++) {
    serata.update(FRAME_MS);
    const presenti = serata.stato().posti.filter((p) => p.cliente).length;
    assert.ok(presenti <= POSTI.quanti);
  }
});

test('un Ordine è una lista di Piatti: si serve solo con tutti sul Bancone', () => {
  const serata = new Serata({ seed: 'a', piattiPerOrdine: { min: 2, max: 2 } });
  avanza(serata, CLIENTI.primoArrivoSec * SEC + 50);
  assert.deepEqual(serata.stato().posti.find((p) => p.cliente).cliente.ordine, ['onigiri', 'onigiri']);
  const posto = serata.stato().posti.find((p) => p.cliente).posto;

  preparaOnigiri(serata);
  const rifiuto = serata.servi(posto);
  assert.deepEqual(tipi(rifiuto), ['scuoteTesta']);
  assert.deepEqual(rifiuto[0].mancano, ['onigiri']);
  assert.deepEqual(serata.stato().bancone, ['onigiri'], 'il Bancone non si svuota se il Cliente rifiuta');

  preparaOnigiri(serata);
  const eventi = serata.servi(posto);
  assert.equal(eventi[0].tipo, 'servito');
  assert.equal(eventi[0].prezzo, 2 * PIATTI.onigiri.price);
  assert.deepEqual(serata.stato().bancone, []);
});

test('le soglie delle stelle: ★ all obiettivo, ★★ a ×1,3, ★★★ a ×1,6', () => {
  assert.equal(calcolaStelle(0, 1000), 0);
  assert.equal(calcolaStelle(999, 1000), 0);
  assert.equal(calcolaStelle(1000, 1000), 1);
  assert.equal(calcolaStelle(1299, 1000), 1);
  assert.equal(calcolaStelle(1300, 1000), 2);
  assert.equal(calcolaStelle(1599, 1000), 2);
  assert.equal(calcolaStelle(1600, 1000), 3);
  assert.equal(calcolaStelle(5000, 1000), 3);
  // Le moltiplicazioni a virgola mobile non tolgono stelle: 1200 × 1,3 è 1560.
  assert.equal(calcolaStelle(1560, 1200), 2);
  assert.equal(calcolaStelle(1920, 1200), 3);
});

test('lo stato dice quanti Yen servono per ogni stella', () => {
  const stato = new Serata({ seed: 'a' }).stato();
  assert.equal(stato.obiettivo, SERATA_PRIMA.obiettivo);
  assert.deepEqual(stato.sogliaStelle, [1920, 2496, 3072]);
  assert.equal(stato.stelle, 0);
});

test('la Serata finisce a 120 secondi, assegna le stelle e poi non cambia più', () => {
  const serata = new Serata({ seed: 'a', obiettivo: 100 });
  avanza(serata, 2 * SEC);
  preparaOnigiri(serata);
  serata.servi(serata.stato().posti.findIndex((p) => p.cliente));
  const incasso = serata.stato().incasso;
  assert.ok(incasso >= 100);

  const prima = avanza(serata, (SERATA.durationSec - 10) * SEC);
  assert.ok(!tipi(prima).includes('serataFinita'), 'finita troppo presto');
  assert.equal(serata.stato().fase, 'in corso');

  const eventi = avanza(serata, 20 * SEC);
  const fine = eventi.filter((e) => e.tipo === 'serataFinita');
  assert.equal(fine.length, 1);
  assert.equal(fine[0].incasso, incasso);
  assert.equal(fine[0].stelle, calcolaStelle(incasso, 100));

  const stato = serata.stato();
  assert.equal(stato.fase, 'finita');
  assert.equal(stato.restaMs, 0);
  assert.equal(stato.stelle, fine[0].stelle);

  // Dopo la fine il tempo e le azioni non cambiano niente.
  const congelato = JSON.stringify(stato);
  assert.deepEqual(avanza(serata, 5 * SEC), []);
  assert.deepEqual(serata.tocca('tagliere'), []);
  assert.deepEqual(serata.servi(0), []);
  assert.equal(JSON.stringify(serata.stato()), congelato);
});

test('un update molto lungo arriva alla fine senza oltrepassarla', () => {
  const serata = new Serata({ seed: 'a' });
  const eventi = serata.update(10 * 60 * SEC);
  assert.equal(tipi(eventi).filter((t) => t === 'serataFinita').length, 1);
  assert.equal(serata.stato().restaMs, 0);
});

test('perdere Clienti non ferma la Serata: senza servire nessuno arriva comunque a 120 secondi', () => {
  const serata = new Serata({ seed: 'a' });
  const eventi = avanza(serata, SERATA.durationSec * SEC + 100);
  const stato = serata.stato();
  assert.equal(stato.fase, 'finita');
  assert.equal(stato.incasso, 0);
  assert.equal(stato.stelle, 0);
  assert.ok(stato.persi >= 3);
  assert.equal(tipi(eventi).filter((t) => t === 'serataFinita').length, 1);
});

test('lo stesso seme dà la stessa Serata, un seme diverso un\'altra', () => {
  const gioca = (seed) => {
    const serata = new Serata({ seed });
    giocaTutta(serata);
    return JSON.stringify(serata.stato());
  };
  assert.equal(gioca('lunedi'), gioca('lunedi'));
  assert.notEqual(gioca('lunedi'), gioca('martedi'));
});

test('la durata dei singoli update non cambia la Serata', () => {
  const a = new Serata({ seed: 'x' });
  const b = new Serata({ seed: 'x' });
  const eventiA = [];
  const eventiB = [];
  for (let i = 0; i < 12000; i++) eventiA.push(...a.update(10));
  for (let i = 0; i < 120; i++) eventiB.push(...b.update(1000));
  assert.deepEqual(eventiA, eventiB);
  assert.equal(JSON.stringify(a.stato()), JSON.stringify(b.stato()));
});

test('un giocatore attento fa Incasso e prende le stelle; lo stato è JSON e dice tutto', () => {
  const serata = new Serata({ seed: 'attento' });
  giocaTutta(serata);
  const stato = JSON.parse(JSON.stringify(serata.stato()));
  assert.equal(stato.fase, 'finita');
  assert.ok(stato.serviti > 5, `serviti solo ${stato.serviti}`);
  assert.ok(stato.vendite >= stato.serviti * PIATTI.onigiri.price);
  assert.equal(stato.incasso, stato.vendite - stato.spesa, 'l’Incasso è il netto');
  assert.ok(stato.stelle >= 1, `Incasso ${stato.incasso}: nemmeno una stella`);
  assert.equal(stato.stelle, calcolaStelle(stato.incasso, stato.obiettivo));
});

test('nella calma gli arrivi seguono l’intervallo della prima fase', () => {
  const serata = new Serata({ seed: 'ritmo' });
  const arrivi = [];
  // Nei primi secondi i Posti sono liberi, quindi nessun arrivo deve aspettare (il quarto aspetterebbe un Posto).
  for (let t = 10; t <= 20 * SEC; t += 10) {
    if (serata.update(10).some((e) => e.tipo === 'clienteArrivato')) arrivi.push(t);
  }
  assert.equal(arrivi[0], CLIENTI.primoArrivoSec * SEC);
  assert.equal(arrivi.length, 3);
  const { min, max } = ONDATE.fasi[0].arrivoSec;
  for (let i = 1; i < arrivi.length; i++) {
    const attesa = arrivi[i] - arrivi[i - 1];
    assert.ok(attesa >= min * SEC && attesa <= max * SEC, `attesa di ${attesa} ms`);
  }
});

// Una Serata in cui i Posti non sono mai pieni: a ogni passo il Bancone ha tutto e ogni Cliente è servito
// subito. Così gli arrivi cadono esattamente agli intervalli della curva. Restituisce gli arrivi (tempo e fase
// al momento dell'arrivo) e quanta Pazienza aveva ognuno.
function arriviSenzaAttese(seed) {
  const serata = new Serata({ seed });
  const arrivi = [];
  while (!serata.finita) {
    serata.bancone = ['onigiri', 'onigiri', 'onigiri'];
    for (const e of serata.update(10)) {
      if (e.tipo !== 'clienteArrivato') continue;
      const { andamento, tempoMs, posti } = serata.stato();
      arrivi.push({ tempoMs, fase: andamento.fase, inOndata: andamento.inOndata, pazienzaTotaleMs: posti[e.posto].cliente.pazienzaTotaleMs });
    }
    for (const { posto, cliente } of serata.stato().posti) if (cliente) serata.servi(posto);
  }
  return arrivi;
}

test('la curva ha quattro fasi nei dati: calma, ondata, respiro, ondata finale, con gli intervalli della spec', () => {
  assert.deepEqual(ONDATE.fasi.map((f) => [f.nome, f.daSec, f.ondata]), [['calma', 0, false], ['ondata', 30, true], ['respiro', 55, false], ['finale', 80, true]]);
  assert.deepEqual(ONDATE.fasi.map((f) => [f.arrivoSec.min, f.arrivoSec.max]), [[3.5, 5], [1.2, 2.2], [4, 6], [1.0, 2.0]]);
  assert.deepEqual([ONDATE.scostoSec, ONDATE.avvisoSec, ONDATE.pazienzaSec], [5, 2, 15]);
  // Senza Pazienza spostata dal seme, fuori dalle ondate resta quella di sempre.
  assert.equal(PAZIENZA.durationSec, 25);
});

test('ogni arrivo segue l’intervallo della fase in cui era la Serata, e arriva in tutte e quattro le fasi', () => {
  for (const seme of ['a', 'b', 'c']) {
    const arrivi = arriviSenzaAttese(seme);
    const fasi = new Serata({ seed: seme }).stato().andamento.fasi;
    const faseA = (t) => ONDATE.fasi[fasi.findLastIndex((f) => f.inizioMs <= t)];
    assert.equal(arrivi[0].tempoMs, CLIENTI.primoArrivoSec * SEC);
    for (let i = 1; i < arrivi.length; i++) {
      const { min, max } = faseA(arrivi[i - 1].tempoMs).arrivoSec;
      const attesa = arrivi[i].tempoMs - arrivi[i - 1].tempoMs;
      assert.ok(attesa >= min * SEC && attesa <= max * SEC, `seme ${seme}: attesa di ${attesa} ms dopo l’arrivo a ${arrivi[i - 1].tempoMs}`);
    }
    assert.deepEqual([...new Set(arrivi.map((a) => a.fase))], ['calma', 'ondata', 'respiro', 'finale'], `seme ${seme}: manca una fase`);
  }
});

test('l’ondata porta più arrivi della calma e del respiro, a parità di secondi', () => {
  const arrivi = arriviSenzaAttese('a');
  const fasi = new Serata({ seed: 'a' }).stato().andamento.fasi;
  const arriviAlSecondo = (nome) => {
    const i = fasi.findIndex((f) => f.nome === nome);
    const durataSec = ((fasi[i + 1]?.inizioMs ?? SERATA.durationSec * SEC) - fasi[i].inizioMs) / SEC;
    return arrivi.filter((a) => a.fase === nome).length / durataSec;
  };
  assert.ok(arriviAlSecondo('ondata') > 1.8 * arriviAlSecondo('calma'), 'l’ondata deve essere un picco');
  assert.ok(arriviAlSecondo('finale') > 1.8 * arriviAlSecondo('respiro'), 'anche la finale');
  assert.ok(arriviAlSecondo('respiro') < arriviAlSecondo('calma'), 'il respiro respira');
});

test('la Pazienza si decide all’arrivo: 15 s in ondata, 25 s altrimenti', () => {
  const arrivi = arriviSenzaAttese('b');
  assert.ok(arrivi.some((a) => a.inOndata) && arrivi.some((a) => !a.inOndata));
  for (const a of arrivi) {
    assert.equal(a.pazienzaTotaleMs, (a.inOndata ? ONDATE.pazienzaSec : PAZIENZA.durationSec) * SEC, `arrivo a ${a.tempoMs} in ${a.fase}`);
  }
});

test('i cuoricini sono sempre 5 e durano un quinto della Pazienza di quel Cliente', () => {
  const totale = ONDATE.pazienzaSec * SEC;
  const quinto = totale / PAZIENZA.hearts;
  assert.equal(quinto, 3 * SEC, '3 s a cuoricino in ondata');
  assert.equal(cuoriDa(totale, totale), 5);
  assert.equal(cuoriDa(4 * quinto + 1, totale), 5);
  assert.equal(cuoriDa(4 * quinto, totale), 4);
  assert.equal(cuoriDa(quinto + 1, totale), 2);
  assert.equal(cuoriDa(1, totale), 1);
  assert.equal(cuoriDa(0, totale), 0);
  // Senza il totale vale quello di sempre.
  assert.equal(cuoriDa(PAZIENZA.durationSec * SEC), 5);
});

// Un Cliente arrivato negli ultimi secondi di un'ondata, tra i primi che si trovano, per un seme.
function clienteChiArrivaPocoPrimaDellaFineDellOndata() {
  for (const seme of 'abcdefghij') {
    const serata = new Serata({ seed: seme });
    const { fasi } = serata.stato().andamento;
    const fineOndata = fasi[2].inizioMs;
    let arrivo = null;
    while (!serata.finita && serata.stato().tempoMs < fineOndata) {
      const eventi = serata.update(10);
      const arrivato = eventi.find((e) => e.tipo === 'clienteArrivato');
      const t = serata.stato().tempoMs;
      if (arrivato && t > fineOndata - 8 * SEC && t < fineOndata) arrivo = { id: arrivato.cliente.id, posto: arrivato.posto, tempoMs: t };
    }
    if (arrivo) return { serata, arrivo, fineOndata };
  }
  throw new Error('nessun Cliente arriva alla fine dell’ondata in questi semi');
}

test('un Cliente arrivato in ondata tiene i suoi 15 s anche se l’ondata finisce mentre aspetta', () => {
  const { serata, arrivo, fineOndata } = clienteChiArrivaPocoPrimaDellaFineDellOndata();
  const eventi = [];
  // Siamo a fineOndata: l'ondata è appena finita e il Cliente è ancora al suo Posto.
  assert.equal(serata.stato().andamento.inOndata, false);
  const cliente = () => serata.stato().posti[arrivo.posto].cliente;
  assert.equal(cliente().id, arrivo.id);
  assert.equal(cliente().pazienzaTotaleMs, ONDATE.pazienzaSec * SEC);
  // E se ne va 15 s dopo il suo arrivo, non 25.
  while (cliente()?.id === arrivo.id) eventi.push(...serata.update(10));
  const via = eventi.find((e) => e.tipo === 'clienteVaVia' && e.clienteId === arrivo.id);
  assert.ok(via, 'il Cliente non se n’è andato');
  assert.equal(serata.stato().tempoMs - arrivo.tempoMs, ONDATE.pazienzaSec * SEC);
  assert.ok(serata.stato().tempoMs > fineOndata);
  // I suoi cuoricini si sono spenti uno ogni 3 s, anche dopo la fine dell'ondata.
  const spenti = eventi.filter((e) => e.tipo === 'cuoreSpento' && e.posto === arrivo.posto).map((e) => e.cuori);
  assert.deepEqual(spenti.slice(-5), [4, 3, 2, 1, 0]);
});

test('il seme sposta i confini delle fasi di al più 5 s, e lo stesso seme dà le stesse fasi', () => {
  const inizi = (seme) => fasiDellaSerata(seme).map((f) => f.inizioMs);
  const diversi = new Set();
  for (const seme of ['a', 'b', 'c', 'd', 'e', 'f', 'lunedi', 'martedi', 'x1', 'x2', 'x3', 'x4']) {
    const fasi = fasiDellaSerata(seme);
    assert.deepEqual(inizi(seme), inizi(seme), 'lo stesso seme, le stesse fasi');
    assert.equal(fasi[0].inizioMs, 0, 'la calma comincia con la Serata');
    for (let i = 1; i < fasi.length; i++) {
      const teorico = ONDATE.fasi[i].daSec * SEC;
      assert.ok(Math.abs(fasi[i].inizioMs - teorico) <= ONDATE.scostoSec * SEC, `seme ${seme}: la fase ${i} è a ${fasi[i].inizioMs} ms`);
      assert.equal(fasi[i].inizioMs % 10, 0, 'un multiplo del passo del motore');
    }
    diversi.add(inizi(seme).join());
  }
  assert.ok(diversi.size >= 10, 'due semi diversi danno quasi sempre ondate in punti diversi');
});

test('qualunque seme dà una Serata giocabile: nessuna fase è troppo corta e l’ondata finale ha tempo per finire', () => {
  for (let i = 0; i < 200; i++) {
    const fasi = fasiDellaSerata(`prova-${i}`);
    const fine = [...fasi.slice(1).map((f) => f.inizioMs), SERATA.durationSec * SEC];
    fasi.forEach((fase, k) => {
      const durataSec = (fine[k] - fase.inizioMs) / SEC;
      assert.ok(durataSec >= 15, `seme prova-${i}: ${fase.nome} dura solo ${durataSec} s`);
    });
  }
});

test('lo stato dice dove siamo nella curva e quanto manca alla prossima ondata', () => {
  const serata = new Serata({ seed: 'a' });
  const { fasi } = serata.stato().andamento;
  assert.deepEqual(serata.stato().andamento.fase, 'calma');
  assert.equal(serata.stato().andamento.inOndata, false);
  assert.equal(serata.stato().andamento.prossimaOndataTraMs, fasi[1].inizioMs);
  avanza(serata, fasi[1].inizioMs + 20);
  const dentro = serata.stato().andamento;
  assert.deepEqual([dentro.fase, dentro.inOndata], ['ondata', true]);
  assert.equal(dentro.prossimaOndataTraMs, fasi[3].inizioMs - serata.stato().tempoMs, 'la prossima è la finale');
  avanza(serata, fasi[3].inizioMs - serata.stato().tempoMs + 20);
  const finale = serata.stato().andamento;
  assert.deepEqual([finale.fase, finale.inOndata, finale.prossimaOndataTraMs], ['finale', true, null]);
  // Cambia l'ondata, non gli Ordini né i Clienti: l'andamento è dello stato, e lo stato è JSON.
  assert.doesNotThrow(() => JSON.stringify(serata.stato()));
});

test('con le ondate lo stesso seme dà la stessa Serata fino all’ultimo dato, e un altro seme sposta l’ondata', () => {
  const gioca = (seed) => {
    const serata = new Serata({ seed });
    giocaTutta(serata);
    return JSON.stringify(serata.stato());
  };
  assert.equal(gioca('ondata-1'), gioca('ondata-1'));
  assert.notEqual(JSON.parse(gioca('ondata-1')).andamento.fasi[1].inizioMs, JSON.parse(gioca('ondata-2')).andamento.fasi[1].inizioMs);
});

test('i testi della fine Serata esistono in italiano, inglese e giapponese', () => {
  for (const chiave of ['endTitle', 'endIncasso', 'endObiettivo', 'endRigioca', 'endVendite', 'endSpesa', 'endSpreco', 'endRosso']) {
    for (const lingua of ['it', 'en', 'ja']) {
      assert.ok(TESTI[lingua][chiave]?.trim(), `${lingua}.${chiave} manca`);
    }
  }
});

// La bravura di un giocatore è quanto tempo passa tra un tocco e l'altro. Ogni onigiri sono 3 tocchi
// (riso, alga, prendi) più quello per servire: i livelli sono più lenti di quando bastava un tocco
// per preparare (ticket 33), perché la stessa persona ci mette di più.
const BRAVURA = { rapido: 600, attento: 1000, lento: 1400 };
const SEMI = ['a', 'b', 'c', 'd', 'e', 'f'];

// Un giocatore che fa una mossa ogni `reazioneMs`: serve chi ha l'Ordine sul Bancone (prima chi ha meno
// cuoricini), porta sul Bancone i Piatti pronti, completa quelli cominciati con la Scorta che manca e
// ne comincia di nuovi solo se servono.
function giocaServata(reazioneMs, seed) {
  const serata = new Serata({ seed });
  for (let t = 10; !serata.finita; t += 10) {
    serata.update(10);
    if (t % reazioneMs !== 0) continue;
    const stato = serata.stato();
    const servibili = stato.posti
      .filter(({ cliente }) => cliente && cliente.ordine.every((piatto) => stato.bancone.includes(piatto)))
      .sort((a, b) => a.cliente.cuori - b.cliente.cuori);
    const pronta = stato.postazioni.find((p) => p.stato === 'pronto');
    const cominciata = stato.postazioni.find((p) => p.stato === 'inPreparazione');
    const libera = stato.postazioni.find((p) => p.stato === 'libera');
    const inCorso = stato.postazioni.filter((p) => p.stato !== 'libera').length;
    const bisogni = stato.posti.filter(({ cliente }) => cliente).length;
    if (servibili.length) serata.servi(servibili[0].posto);
    else if (pronta) serata.tocca(pronta.id);
    else if (cominciata) serata.tocca(cominciata.prossimo);
    else if (libera && bisogni > stato.bancone.length + inCorso) serata.tocca(libera.prossimo);
  }
  return serata.stato();
}

const mediaIncasso = (reazioneMs) => SEMI.reduce((somma, seme) => somma + giocaServata(reazioneMs, seme).incasso, 0) / SEMI.length;

test('l’Incasso dipende dalla bravura: chi è più rapido incassa molto di più (ticket 05: prima era uguale per tutti)', () => {
  const rapido = mediaIncasso(BRAVURA.rapido);
  const attento = mediaIncasso(BRAVURA.attento);
  const lento = mediaIncasso(BRAVURA.lento);
  assert.ok(attento > lento * 1.15, `attento ${attento}, lento ${lento}`);
  assert.ok(rapido >= attento, `rapido ${rapido}, attento ${attento}`);
});

test('la prima Serata sul netto: un giocatore lento prende ★, uno attento ★★, ★★★ è per i rapidi (valori provvisori, ticket 29)', () => {
  const [uno, due, tre] = new Serata({ seed: 'a' }).stato().sogliaStelle;
  const lento = mediaIncasso(BRAVURA.lento);
  const attento = mediaIncasso(BRAVURA.attento);
  const rapido = mediaIncasso(BRAVURA.rapido);
  assert.ok(lento >= uno, `lento ${lento}: sotto ★ (${uno})`);
  assert.ok(attento >= due && attento < tre, `attento ${attento}: non è ★★ (${due}-${tre})`);
  assert.ok(rapido >= tre, `rapido ${rapido}: non arriva a ★★★ (${tre})`);
});

test('con le ondate nessun seme è impossibile per il lento: ogni Serata gli dà ★ e non si ferma a metà', () => {
  const [uno] = new Serata({ seed: 'a' }).stato().sogliaStelle;
  for (const seme of SEMI) {
    const stato = giocaServata(BRAVURA.lento, seme);
    assert.equal(stato.fase, 'finita', `seme ${seme}: la Serata non è arrivata alla fine`);
    assert.ok(stato.incasso >= uno, `seme ${seme}: il lento fa ${stato.incasso}, sotto ★ (${uno})`);
  }
});

test('ogni Serata dei giocatori finisce con la Spesa pagata e lo Spreco piccolo, mai un Incasso fuori conto', () => {
  for (const seme of SEMI) {
    const stato = giocaServata(BRAVURA.attento, seme);
    assert.equal(stato.incasso, stato.vendite - stato.spesa);
    assert.ok(stato.spreco >= 0 && stato.spreco <= 60, `Spreco ${stato.spreco}: un attento non butta più di un paio di onigiri`);
    assert.equal(stato.spesa, stato.serviti * costoPiatto('onigiri') + stato.spreco);
  }
});

