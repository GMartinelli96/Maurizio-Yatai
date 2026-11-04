import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compra, livelloDi, opzioniSerata, vociDellaBottega, voceDi } from '../src/bottega.js';
import { PAZIENZA, POSTI, POTENZIAMENTI } from '../src/config.js';
import { CHIAVE_SALVATAGGIO, Salvataggio } from '../src/salvataggio.js';
import { Serata } from '../src/serata/Serata.js';
import { BRAVURA, media } from './bot-bottega.js';

function storageFinto(iniziale = {}) {
  const dati = new Map(Object.entries(iniziale));
  return { dati, getItem: (k) => (dati.has(k) ? dati.get(k) : null), setItem: (k, v) => dati.set(k, String(v)) };
}

// Un salvataggio con già `yen` Yen in tasca.
function conYen(yen, storage = storageFinto()) {
  const s = new Salvataggio(storage);
  s.accreditaIncasso(yen);
  return s;
}

const prezzo = (id, livello) => POTENZIAMENTI[id].livelli[livello - 1].prezzo;

// --- Comprare ---

test('la Bottega mostra i due Potenziamenti con livello e prezzo del prossimo', () => {
  const voci = vociDellaBottega(conYen(0));
  assert.deepEqual(voci.map((v) => v.id), ['postoInPiu', 'ventaglio']);
  assert.deepEqual(voci.map((v) => [v.livello, v.livelloMax, v.prezzo]), [[0, 1, prezzo('postoInPiu', 1)], [0, 3, prezzo('ventaglio', 1)]]);
  assert.ok(voci.every((v) => !v.comprabile), 'senza Yen non si compra niente');
});

test('i prezzi del ventaglio salgono a ogni livello e la Pazienza anche', () => {
  const { livelli } = POTENZIAMENTI.ventaglio;
  for (let i = 1; i < livelli.length; i++) {
    assert.ok(livelli[i].prezzo > livelli[i - 1].prezzo, `il livello ${i + 1} costa meno del ${i}`);
    assert.ok(livelli[i].pazienza > livelli[i - 1].pazienza, `il livello ${i + 1} non allunga di più il ${i}`);
  }
  assert.equal(livelli[0].pazienza, 1.2, 'il primo livello è +20% (deciso con Giuseppe)');
});

test('comprare costa Yen e porta il Potenziamento al livello successivo', () => {
  const s = conYen(5000);
  assert.equal(compra(s, 'ventaglio'), true);
  assert.equal(s.yen, 5000 - prezzo('ventaglio', 1));
  assert.equal(livelloDi(s, 'ventaglio'), 1);
  assert.equal(voceDi(s, 'ventaglio').prezzo, prezzo('ventaglio', 2), 'ora il prezzo è quello del livello 2');
  assert.equal(compra(s, 'ventaglio'), true);
  assert.equal(livelloDi(s, 'ventaglio'), 2);
});

test('con pochi Yen non si compra e non si scende mai sotto zero', () => {
  const s = conYen(prezzo('postoInPiu', 1) - 1);
  assert.equal(voceDi(s, 'postoInPiu').comprabile, false);
  assert.equal(compra(s, 'postoInPiu'), false);
  assert.equal(s.yen, prezzo('postoInPiu', 1) - 1);
  assert.equal(livelloDi(s, 'postoInPiu'), 0);

  const preciso = conYen(prezzo('ventaglio', 1));
  assert.equal(compra(preciso, 'ventaglio'), true);
  assert.equal(preciso.yen, 0, 'con gli Yen giusti si arriva a zero, non sotto');
  assert.equal(compra(preciso, 'ventaglio'), false);
  assert.equal(preciso.yen, 0);
});

test('al livello massimo non si compra più e il prezzo non c’è', () => {
  const s = conYen(100000);
  for (let i = 0; i < 5; i++) compra(s, 'ventaglio');
  const voce = voceDi(s, 'ventaglio');
  assert.equal(voce.livello, voce.livelloMax);
  assert.equal(voce.prezzo, null);
  assert.equal(voce.comprabile, false);
  const yen = s.yen;
  assert.equal(compra(s, 'ventaglio'), false);
  assert.equal(s.yen, yen);
  compra(s, 'postoInPiu');
  assert.equal(compra(s, 'postoInPiu'), false, 'il Posto in più è uno solo');
});

test('Yen e livelli comprati restano sul dispositivo, anche ricaricando', () => {
  const storage = storageFinto();
  const prima = conYen(6000, storage);
  compra(prima, 'postoInPiu');
  compra(prima, 'ventaglio');
  const dopo = new Salvataggio(storage);
  assert.equal(dopo.yen, 6000 - prezzo('postoInPiu', 1) - prezzo('ventaglio', 1));
  assert.deepEqual([livelloDi(dopo, 'postoInPiu'), livelloDi(dopo, 'ventaglio')], [1, 1]);
});

test('con lo storage bloccato si compra lo stesso, per la sessione', () => {
  const s = new Salvataggio({ getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); } });
  s.accreditaIncasso(2000);
  assert.equal(compra(s, 'ventaglio'), true);
  assert.equal(livelloDi(s, 'ventaglio'), 1);
  assert.equal(s.salvato, false);
});

test('un livello salvato più alto di quelli che esistono vale l’ultimo, e uno senza senso vale zero', () => {
  const grezzo = (potenziamenti) => storageFinto({ [CHIAVE_SALVATAGGIO]: JSON.stringify({ versione: 2, yen: 10, potenziamenti }) });
  assert.equal(livelloDi(new Salvataggio(grezzo({ ventaglio: 99 })), 'ventaglio'), 3);
  for (const livello of [-1, 1.5, 'tre', null]) assert.equal(livelloDi(new Salvataggio(grezzo({ ventaglio: livello })), 'ventaglio'), 0, `livello ${livello}`);
  assert.equal(livelloDi(new Salvataggio(grezzo('molti')), 'ventaglio'), 0);
});

test('un salvataggio della versione 1 (solo Yen) si legge e diventa della 2 senza perdere gli Yen', () => {
  const storage = storageFinto({ [CHIAVE_SALVATAGGIO]: JSON.stringify({ versione: 1, yen: 750 }) });
  const s = new Salvataggio(storage);
  assert.equal(s.yen, 750);
  assert.equal(livelloDi(s, 'ventaglio'), 0);
  s.accreditaIncasso(50);
  const scritto = JSON.parse(storage.getItem(CHIAVE_SALVATAGGIO));
  assert.deepEqual(scritto, { versione: 2, yen: 800, potenziamenti: {} });
});

// --- Cambiare la Serata ---

test('senza Potenziamenti la Serata è quella di sempre: 3 Posti e Pazienza normale', () => {
  assert.deepEqual(opzioniSerata(conYen(0)), { posti: POSTI.quanti, pazienzaMoltiplicatore: 1 });
});

test('il Posto in più dà il quarto Posto', () => {
  const s = conYen(5000);
  compra(s, 'postoInPiu');
  const opzioni = opzioniSerata(s);
  assert.equal(opzioni.posti, 4);
  assert.equal(new Serata({ seed: 'a', ...opzioni }).stato().posti.length, 4);
});

test('ogni livello del ventaglio allunga la Pazienza di chi arriva, in calma e in ondata', () => {
  const s = conYen(100000);
  // La Pazienza totale del primo Cliente che arriva nella fase giusta (calma oppure ondata).
  const pazienza = (opzioni, ondata) => {
    const serata = new Serata({ seed: 'a', ...opzioni });
    for (let t = 0; t < 120000; t += 10) {
      serata.update(10);
      const { andamento, posti } = serata.stato();
      const cliente = posti.find((p) => p.cliente)?.cliente;
      if (cliente && andamento.inOndata === ondata) return cliente.pazienzaTotaleMs;
    }
    return null;
  };
  const base = { calma: pazienza({}, false), ondata: pazienza({}, true) };
  assert.equal(base.calma, PAZIENZA.durationSec * 1000);
  for (let livello = 1; livello <= 3; livello++) {
    compra(s, 'ventaglio');
    const { pazienza: moltiplicatore } = POTENZIAMENTI.ventaglio.livelli[livello - 1];
    const opzioni = opzioniSerata(s);
    assert.equal(opzioni.pazienzaMoltiplicatore, moltiplicatore);
    assert.equal(pazienza(opzioni, false), Math.round(base.calma * moltiplicatore), `livello ${livello}, in calma`);
    assert.equal(pazienza(opzioni, true), Math.round(base.ondata * moltiplicatore), `livello ${livello}, in ondata`);
  }
});

// --- Misurati con il bot (media di 6 semi, Hanami, obiettivo 1920) ---

const STELLA_1 = 1920;
const STELLA_2 = 2496;
const STELLA_3 = 3072;
const ventaglio = (livello) => ({ pazienzaMoltiplicatore: POTENZIAMENTI.ventaglio.livelli[livello - 1].pazienza });

test('con ogni Potenziamento (e con tutti insieme) il lento prende ★ e il rapido ★★★', () => {
  const casi = {
    'Posto in più': { posti: 4 },
    'ventaglio 1': ventaglio(1),
    'ventaglio 2': ventaglio(2),
    'ventaglio 3': ventaglio(3),
    '4 Posti e ventaglio 1': { posti: 4, ...ventaglio(1) },
    '4 Posti e ventaglio 3': { posti: 4, ...ventaglio(3) },
  };
  for (const [nome, opzioni] of Object.entries(casi)) {
    const lento = media('incasso', BRAVURA.lento, opzioni);
    const rapido = media('incasso', BRAVURA.rapido, opzioni);
    assert.ok(lento >= STELLA_1, `${nome}: il lento fa ${lento}, sotto ★ (${STELLA_1})`);
    assert.ok(rapido >= STELLA_3, `${nome}: il rapido fa ${rapido}, sotto ★★★ (${STELLA_3})`);
  }
});

test('il ventaglio aiuta davvero: il lento perde meno Clienti e a ogni livello incassa almeno quanto senza', () => {
  const senza = { persi: media('persi', BRAVURA.lento), incasso: media('incasso', BRAVURA.lento) };
  for (const livello of [1, 2, 3]) {
    const persi = media('persi', BRAVURA.lento, ventaglio(livello));
    const incasso = media('incasso', BRAVURA.lento, ventaglio(livello));
    assert.ok(persi < senza.persi, `livello ${livello}: il lento perde ${persi} Clienti, senza ventaglio ${senza.persi}`);
    assert.ok(incasso >= senza.incasso, `livello ${livello}: il lento incassa ${incasso}, senza ventaglio ${senza.incasso}`);
  }
});

test('il quarto Posto non toglie ★ al lento né ★★ all’attento, e da solo non regala ★★ al lento', () => {
  const lento3 = media('incasso', BRAVURA.lento);
  const lento4 = media('incasso', BRAVURA.lento, { posti: 4 });
  const attento4 = media('incasso', BRAVURA.attento, { posti: 4 });
  assert.ok(lento4 >= STELLA_1, `il lento con 4 Posti fa ${lento4}, sotto ★`);
  assert.ok(lento4 > lento3 * 0.9, `il lento con 4 Posti fa ${lento4}, con 3 ${lento3}: perde più del 10%`);
  assert.ok(attento4 >= STELLA_2, `l'attento con 4 Posti fa ${attento4}, sotto ★★`);
  assert.ok(lento4 < STELLA_2, `il lento con 4 Posti fa ${lento4}: non deve prendere ★★ da solo`);
});
