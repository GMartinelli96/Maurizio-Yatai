import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compra, livelloDi, opzioniSerata, vociDellaBottega, voceDi } from '../src/bottega.js';
import { LAMENTO, ONDATE, PAZIENZA, POSTI, POTENZIAMENTI } from '../src/config.js';
import { DISEGNI } from '../src/disegni/catalogo.js';
import { TESTI } from '../src/i18n.js';
import { CHIAVE_SALVATAGGIO, Salvataggio } from '../src/salvataggio.js';
import { Serata, calcolaMancia, cuoriDa } from '../src/serata/Serata.js';
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

// --- I testi ---

test('la schermata Bottega e ogni Potenziamento hanno i testi in italiano, inglese e giapponese', () => {
  const chiavi = ['bottega', 'bottegaPotenziamenti', 'bottegaIndietro', 'bottegaAlMassimo', 'bottegaNonSalvato'];
  for (const id of Object.keys(POTENZIAMENTI)) chiavi.push(`potenziamento_${id}`, `potenziamentoDesc_${id}`);
  for (const lingua of ['it', 'en', 'ja']) {
    for (const chiave of chiavi) assert.ok(TESTI[lingua][chiave]?.trim(), `${lingua}.${chiave} manca`);
  }
  assert.equal(TESTI.it.bottega, 'Bottega', 'il nome è quello del glossario');
});

test('ogni Potenziamento ha la sua icona disegnata, nella misura che la Bottega si aspetta', () => {
  for (const id of Object.keys(POTENZIAMENTI)) {
    const icona = DISEGNI[`icona-${id}`];
    assert.ok(icona, `manca icona-${id}`);
    assert.deepEqual([icona.w, icona.h], [120, 120]);
    assert.equal(typeof icona.draw, 'function');
  }
});

// --- Cambiare la Serata ---

test('senza Potenziamenti la Serata è quella di sempre: 3 Posti e Pazienza normale', () => {
  assert.deepEqual(opzioniSerata(conYen(0)), { posti: POSTI.quanti, cuori: PAZIENZA.hearts, pazienzaMoltiplicatore: 1, cotturaMoltiplicatori: {} });
});

test('il Posto in più dà il quarto Posto e il sesto cuoricino', () => {
  const s = conYen(5000);
  compra(s, 'postoInPiu');
  const opzioni = opzioniSerata(s);
  assert.equal(opzioni.posti, 4);
  assert.equal(opzioni.cuori, 6);
  const stato = new Serata({ seed: 'a', ...opzioni }).stato();
  assert.equal(stato.posti.length, 4);
  assert.equal(stato.cuoriMax, 6);
});

// --- Il sesto cuoricino ---

const SEC = 1000;
const CUORICINO_CALMA_MS = (PAZIENZA.durationSec * SEC) / PAZIENZA.hearts;
const CUORICINO_ONDATA_MS = (ONDATE.pazienzaSec * SEC) / PAZIENZA.hearts;

// Il primo Cliente che si siede in calma (o in ondata) in una Serata con `opzioni`, appena seduto: uno già seduto
// da prima non conta, ha la Pazienza di quando è arrivato.
function primoCliente(opzioni, ondata) {
  const serata = new Serata({ seed: 'a', ...opzioni });
  for (let t = 0; t < 120 * SEC; t += 10) {
    serata.update(10);
    const { andamento, posti } = serata.stato();
    const cliente = posti.find((p) => p.cliente)?.cliente;
    if (cliente && andamento.inOndata === ondata && cliente.pazienzaMs > cliente.pazienzaTotaleMs - 100) return cliente;
  }
  return null;
}

// Aspetta, senza servire nessuno, che il primo Cliente perda la Pazienza: quando si è spento ogni cuoricino e che
// Lamento è partito.
function pazienzaDelPrimo(opzioni) {
  const serata = new Serata({ seed: 'a', ...opzioni });
  let id = null;
  let posto = null;
  const spenti = [];
  const lamenti = [];
  for (let t = 10; t < 120 * SEC; t += 10) {
    for (const e of serata.update(10)) {
      if (e.tipo === 'clienteArrivato' && id === null) ({ id } = e.cliente), (posto = e.posto);
      if (e.tipo === 'cuoreSpento' && e.posto === posto && id !== null) spenti.push({ cuori: e.cuori, t });
      if (e.tipo === 'lamento' && e.clienteId === id) lamenti.push({ cuori: e.cuori, espressione: e.espressione, segno: e.segno });
    }
    if (spenti.at(-1)?.cuori === 0) break;
  }
  return { spenti, lamenti };
}

test('con 6 cuoricini ogni cuoricino dura come prima: il sesto si aggiunge in coda', () => {
  const totale = PAZIENZA.durationSec * 1.2 * SEC;
  assert.equal(cuoriDa(totale, totale, 6), 6);
  assert.equal(cuoriDa(5 * CUORICINO_CALMA_MS + 1, totale, 6), 6);
  assert.equal(cuoriDa(5 * CUORICINO_CALMA_MS, totale, 6), 5);
  assert.equal(cuoriDa(CUORICINO_CALMA_MS + 1, totale, 6), 2);
  assert.equal(cuoriDa(1, totale, 6), 1);
  assert.equal(cuoriDa(0, totale, 6), 0);
  // Senza il quarto argomento i cuoricini sono 5, come prima.
  assert.equal(cuoriDa(PAZIENZA.durationSec * SEC), 5);
});

test('il Cliente del Posto in più arriva con 6 cuoricini e 30 s di Pazienza in calma, 18 in ondata', () => {
  const sei = { posti: 4, cuori: 6 };
  const calma = primoCliente(sei, false);
  const ondata = primoCliente(sei, true);
  assert.deepEqual([calma.cuori, calma.pazienzaTotaleMs], [6, 30 * SEC]);
  assert.deepEqual([ondata.cuori, ondata.pazienzaTotaleMs], [6, 18 * SEC]);
  // Senza il Potenziamento restano 5 cuoricini, 25 s e 15 s.
  assert.deepEqual([primoCliente({}, false).cuori, primoCliente({}, false).pazienzaTotaleMs], [5, 25 * SEC]);
  assert.deepEqual([primoCliente({}, true).cuori, primoCliente({}, true).pazienzaTotaleMs], [5, ONDATE.pazienzaSec * SEC]);
});

test('i cuoricini del Posto in più si spengono uno ogni 5 s, e il sesto si spegne per primo', () => {
  const { spenti } = pazienzaDelPrimo({ posti: 4, cuori: 6 });
  assert.deepEqual(spenti.map((s) => s.cuori), [5, 4, 3, 2, 1, 0]);
  // Dal primo cuoricino spento all'ultimo passano 5 cuoricini di tempo.
  assert.equal(spenti[5].t - spenti[0].t, 5 * CUORICINO_CALMA_MS);
  assert.equal(spenti[1].t - spenti[0].t, CUORICINO_CALMA_MS);
});

test('il Lamento resta a 2 e a 1 cuoricino rimasti anche con 6 cuoricini', () => {
  for (const opzioni of [{}, { posti: 4, cuori: 6 }]) {
    const { lamenti } = pazienzaDelPrimo(opzioni);
    assert.deepEqual(lamenti.map((l) => [l.cuori, l.espressione, l.segno]), [
      [LAMENTO.perplessaA, 'perplessa', 'goccia'],
      [LAMENTO.imbronciataA, 'imbronciata', 'sbuffo'],
    ]);
  }
});

test('la Mancia piena è la stessa con 6 cuoricini: ognuno ne vale un sesto', () => {
  assert.equal(calcolaMancia(500, 6, 1, 6), calcolaMancia(500, 5));
  assert.equal(calcolaMancia(500, 3, 1, 6), calcolaMancia(500, 2.5));
  assert.equal(calcolaMancia(500, 0, 1, 6), 0);
});

test('comprati e ricaricati, i Potenziamenti cambiano la Serata che parte dopo: 4 Posti, 6 cuoricini e Pazienza ×1,4', () => {
  const storage = storageFinto();
  const prima = conYen(100000, storage);
  compra(prima, 'postoInPiu');
  for (let i = 0; i < 3; i++) compra(prima, 'ventaglio');
  // Un'altra sessione dello stesso dispositivo: legge dal salvataggio.
  const opzioni = opzioniSerata(new Salvataggio(storage));
  assert.deepEqual(opzioni, { posti: 4, cuori: 6, pazienzaMoltiplicatore: 1.4, cotturaMoltiplicatori: {} });
  const stato = new Serata({ seed: 'a', ...opzioni }).stato();
  assert.deepEqual([stato.posti.length, stato.cuoriMax, stato.pazienzaMoltiplicatore], [4, 6, 1.4]);
  // 25 s in calma × 6/5 × 1,4 = 42 s; 15 s in ondata × 6/5 × 1,4 = 25,2 s.
  assert.equal(primoCliente(opzioni, false).pazienzaTotaleMs, 42 * SEC);
  assert.equal(primoCliente(opzioni, true).pazienzaTotaleMs, 25200);
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
// Il Posto in più com'è nella Serata: il quarto Posto e il sesto cuoricino.
const postoInPiu = { posti: 4, cuori: 6 };

test('con ogni Potenziamento (e con tutti insieme) il lento prende ★ e il rapido ★★★', () => {
  const casi = {
    'Posto in più': postoInPiu,
    'ventaglio 1': ventaglio(1),
    'ventaglio 2': ventaglio(2),
    'ventaglio 3': ventaglio(3),
    'Posto in più e ventaglio 1': { ...postoInPiu, ...ventaglio(1) },
    'Posto in più e ventaglio 3': { ...postoInPiu, ...ventaglio(3) },
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

test('il Posto in più non toglie ★ al lento né ★★ all’attento, e da solo non regala ★★ al lento', () => {
  const lento3 = media('incasso', BRAVURA.lento);
  const lento4 = media('incasso', BRAVURA.lento, postoInPiu);
  const attento4 = media('incasso', BRAVURA.attento, postoInPiu);
  assert.ok(lento4 >= STELLA_1, `il lento con il Posto in più fa ${lento4}, sotto ★`);
  assert.ok(lento4 > lento3 * 0.9, `il lento con il Posto in più fa ${lento4}, senza ${lento3}: perde più del 10%`);
  assert.ok(attento4 >= STELLA_2, `l'attento con il Posto in più fa ${attento4}, sotto ★★`);
  assert.ok(lento4 < STELLA_2, `il lento con il Posto in più fa ${lento4}: non deve prendere ★★ da solo`);
});

test('con tutti i Potenziamenti la Mancia della Serie non decide da sola le stelle: al più il 16% dell’Incasso del rapido', () => {
  // Misurato: 15,2% con i Vizi del cast (Nella e Carlotta alzano Mancia e prezzo); era sotto il 15% prima. Il 16% è la soglia del caso
  // peggiore (rapido con tutto al massimo); senza Potenziamenti vale ancora il 15% di serata.test.js. La ricalibrazione è del ticket 29.
  const tutto = { ...postoInPiu, ...ventaglio(3) };
  const extra = media('manciaDaSerie', BRAVURA.rapido, tutto);
  const incasso = media('incasso', BRAVURA.rapido, tutto);
  assert.ok(extra <= incasso * 0.16, `Mancia della Serie ${extra} su ${incasso}: ${((100 * extra) / incasso).toFixed(1)}%`);
});

test('il sesto cuoricino aiuta chi è lento a non perdere Clienti', () => {
  const senzaCuore = media('persi', BRAVURA.lento, { posti: 4 });
  const conCuore = media('persi', BRAVURA.lento, postoInPiu);
  assert.ok(conCuore < senzaCuore, `il lento perde ${conCuore} Clienti con il sesto cuoricino, ${senzaCuore} senza`);
});
