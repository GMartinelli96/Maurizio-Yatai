import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Serata, calcolaMancia, calcolaStelle, cuoriDa } from '../src/serata/Serata.js';
import { TESTI } from '../src/i18n.js';
import { CLIENTI, FRAME_MS, PAZIENZA, PIATTI, POSTI, SERATA, SERATA_PRIMA } from '../src/config.js';

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

// Mette un onigiri sul Bancone passando dal tagliere.
function preparaOnigiri(serata) {
  serata.tocca('tagliere');
  avanza(serata, PIATTI.onigiri.cookSec * SEC + 50);
  serata.tocca('tagliere');
}

// Un giocatore che fa sempre la mossa ovvia: serve chi può, poi cucina.
function giocaTutta(serata) {
  while (serata.stato().fase === 'in corso') {
    avanza(serata, 100);
    const stato = serata.stato();
    for (const posto of stato.posti) if (posto.cliente) serata.servi(posto.posto);
    for (const postazione of stato.postazioni) serata.tocca(postazione.id);
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

test("l'onigiri cuoce da solo sul tagliere e passa sul Bancone toccandolo", () => {
  const serata = conPrimoCliente();
  assert.deepEqual(tipi(serata.tocca('tagliere')), ['cotturaIniziata']);
  assert.equal(serata.stato().postazioni[0].stato, 'cuoce');

  // Toccare mentre cuoce non fa niente.
  assert.deepEqual(tipi(serata.tocca('tagliere')), ['postazioneOccupata']);

  const eventi = avanza(serata, PIATTI.onigiri.cookSec * SEC + 50);
  assert.ok(tipi(eventi).includes('piattoPronto'));
  assert.equal(serata.stato().postazioni[0].stato, 'pronto');
  assert.deepEqual(serata.stato().bancone, []);

  assert.deepEqual(tipi(serata.tocca('tagliere')), ['sulBancone']);
  assert.deepEqual(serata.stato().bancone, ['onigiri']);
  assert.equal(serata.stato().postazioni[0].stato, 'libera');
});

test('una Postazione sconosciuta viene ignorata', () => {
  const serata = conPrimoCliente();
  assert.deepEqual(tipi(serata.tocca('piastra')), ['postazioneSconosciuta']);
});

test('se il Bancone è pieno il Piatto pronto resta sulla Postazione', () => {
  const serata = new Serata({ seed: 'a', banconeCapienza: 1 });
  preparaOnigiri(serata);
  assert.deepEqual(serata.stato().bancone, ['onigiri']);
  serata.tocca('tagliere');
  avanza(serata, PIATTI.onigiri.cookSec * SEC + 50);
  assert.deepEqual(tipi(serata.tocca('tagliere')), ['banconePieno']);
  assert.equal(serata.stato().postazioni[0].stato, 'pronto');
  assert.equal(serata.stato().bancone.length, 1);
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
  assert.equal(stato.incasso, PIATTI.onigiri.price + mancia);
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
  assert.deepEqual(stato.sogliaStelle, [3100, 4030, 4960]);
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
  assert.ok(stato.incasso >= stato.serviti * PIATTI.onigiri.price);
  assert.ok(stato.stelle >= 1, `Incasso ${stato.incasso}: nemmeno una stella`);
  assert.equal(stato.stelle, calcolaStelle(stato.incasso, stato.obiettivo));
});

test('gli arrivi seguono gli intervalli della configurazione', () => {
  const serata = new Serata({ seed: 'ritmo' });
  const arrivi = [];
  // Nei primi secondi i Posti sono liberi, quindi nessun arrivo deve aspettare.
  for (let t = 10; t <= 22 * SEC; t += 10) {
    if (serata.update(10).some((e) => e.tipo === 'clienteArrivato')) arrivi.push(t);
  }
  assert.equal(arrivi[0], CLIENTI.primoArrivoSec * SEC);
  assert.equal(arrivi.length, 3);
  for (let i = 1; i < arrivi.length; i++) {
    const attesa = arrivi[i] - arrivi[i - 1];
    assert.ok(attesa >= CLIENTI.arrivoSec.min * SEC && attesa <= CLIENTI.arrivoSec.max * SEC, `attesa di ${attesa} ms`);
  }
});

test('i testi della fine Serata esistono in italiano, inglese e giapponese', () => {
  for (const chiave of ['endTitle', 'endIncasso', 'endObiettivo', 'endRigioca']) {
    for (const lingua of ['it', 'en', 'ja']) {
      assert.ok(TESTI[lingua][chiave]?.trim(), `${lingua}.${chiave} manca`);
    }
  }
});

// Un giocatore che fa una mossa ogni `reazioneMs`: serve chi ha l'Ordine sul Bancone (prima chi ha meno
// cuoricini), porta sul Bancone i Piatti pronti e cuoce solo ciò che serve.
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
    const libera = stato.postazioni.find((p) => p.stato === 'libera');
    const inCorso = stato.postazioni.filter((p) => p.stato === 'cuoce').length;
    const bisogni = stato.posti.filter(({ cliente }) => cliente).length;
    if (servibili.length) serata.servi(servibili[0].posto);
    else if (pronta) serata.tocca(pronta.id);
    else if (libera && bisogni > stato.bancone.length + inCorso) serata.tocca(libera.id);
  }
  return serata.stato();
}

test('l’Incasso dipende dalla bravura: chi è più rapido incassa molto di più (ticket 05: prima era uguale per tutti)', () => {
  const media = (reazioneMs) => {
    const semi = ['a', 'b', 'c', 'd', 'e', 'f'];
    return semi.reduce((somma, seme) => somma + giocaServata(reazioneMs, seme).incasso, 0) / semi.length;
  };
  const rapido = media(300);
  const attento = media(800);
  const lento = media(1400);
  assert.ok(attento > lento * 1.15, `attento ${attento}, lento ${lento}`);
  assert.ok(rapido >= attento, `rapido ${rapido}, attento ${attento}`);
});

test('la prima Serata: un giocatore lento prende ★, uno attento ★★ (valori provvisori, ticket 29)', () => {
  const stelle = (reazioneMs) => giocaServata(reazioneMs, 'prova').stelle;
  assert.ok(stelle(1400) >= 1, 'un giocatore lento prende almeno ★');
  assert.ok(stelle(800) >= 2, 'un giocatore attento prende almeno ★★');
});
