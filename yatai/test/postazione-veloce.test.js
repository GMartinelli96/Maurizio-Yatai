import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compra, cotturaMoltiplicatori, livelloDi, opzioniSerata, voceDi } from '../src/bottega.js';
import { FRAME_MS, PIATTI, POSTAZIONI, POTENZIAMENTI, SERATA_TANABATA, SERATA_YUKI } from '../src/config.js';
import { DISEGNI } from '../src/disegni/catalogo.js';
import { TESTI } from '../src/i18n.js';
import { Salvataggio } from '../src/salvataggio.js';
import { Serata } from '../src/serata/Serata.js';
import { BRAVURA, SEMI, giocaServata } from './bot.js';

// "Postazione più veloce" per la piastra del takoyaki (ticket 06): 3 livelli che accorciano la cottura. Tutto senza browser.

const SEC = 1000;
const ID = 'piastraPiuVeloce';
const { livelli } = POTENZIAMENTI[ID];
const COTTURA_SEC = PIATTI.takoyaki.ricetta.find((passo) => passo.cotturaSec !== undefined).cotturaSec;

function storageFinto() {
  const dati = new Map();
  return { getItem: (k) => (dati.has(k) ? dati.get(k) : null), setItem: (k, v) => dati.set(k, String(v)) };
}

function conYen(yen, storage = storageFinto()) {
  const s = new Salvataggio(storage);
  s.accreditaIncasso(yen);
  return s;
}

function avanza(serata, ms) {
  const eventi = [];
  for (let t = 0; t < ms - 1e-6; t += FRAME_MS) eventi.push(...serata.update(Math.min(FRAME_MS, ms - t)));
  return eventi;
}

const piastra = (serata) => serata.stato().postazioni.find((p) => p.id === 'piastra');

// Una Serata del Tanabata con il primo Cliente al suo Posto e una Pazienza lunga: non si prova la Pazienza.
function tanabata(cotturaMoltiplicatori = {}) {
  const serata = new Serata({ seed: 'prova', ...SERATA_TANABATA, cotturaMoltiplicatori });
  avanza(serata, 1600);
  const cliente = serata.posti[0].cliente;
  cliente.pazienzaMs = cliente.pazienzaTotaleMs = 100 * SEC;
  return serata;
}

// --- Il Potenziamento ---

test('ha 3 livelli: costano di più a ogni livello e la cottura si accorcia a ogni livello, senza arrivare a zero', () => {
  assert.equal(livelli.length, 3);
  for (let i = 0; i < livelli.length; i++) {
    assert.ok(livelli[i].cottura > 0 && livelli[i].cottura < 1, `il livello ${i + 1} deve accorciare la cottura`);
    if (i === 0) continue;
    assert.ok(livelli[i].prezzo > livelli[i - 1].prezzo, `il livello ${i + 1} costa meno del ${i}`);
    assert.ok(livelli[i].cottura < livelli[i - 1].cottura, `il livello ${i + 1} non accorcia più del ${i}`);
  }
});

test('è della piastra: una Postazione che esiste e che ha una cottura nella Ricetta', () => {
  const { postazione } = POTENZIAMENTI[ID];
  assert.equal(postazione, 'piastra');
  assert.ok(POSTAZIONI[postazione], 'la Postazione non esiste');
  const { ricetta } = PIATTI[POSTAZIONI[postazione].piatto];
  assert.ok(ricetta.some((passo) => passo.cotturaSec !== undefined), 'questa Postazione non cuoce: non ha niente da accorciare');
});

test('il tagliere, che non cuoce, non ha un Potenziamento "più veloce"', () => {
  const postazioni = Object.values(POTENZIAMENTI).map((p) => p.postazione).filter(Boolean);
  assert.ok(!postazioni.includes('tagliere'));
});

test('si compra a livelli, in ordine, con gli Yen: mai sotto zero, e al massimo non si compra più', () => {
  const s = conYen(livelli[0].prezzo - 1);
  assert.equal(voceDi(s, ID).comprabile, false);
  assert.equal(compra(s, ID), false);
  assert.equal(s.yen, livelli[0].prezzo - 1);

  const ricco = conYen(100000);
  livelli.forEach(({ prezzo }, i) => {
    const prima = ricco.yen;
    assert.equal(voceDi(ricco, ID).prezzo, prezzo);
    assert.equal(compra(ricco, ID), true);
    assert.equal(ricco.yen, prima - prezzo);
    assert.equal(livelloDi(ricco, ID), i + 1);
  });
  assert.equal(voceDi(ricco, ID).prezzo, null);
  assert.equal(compra(ricco, ID), false);
  assert.equal(ricco.yen, 100000 - livelli.reduce((somma, { prezzo }) => somma + prezzo, 0));
});

test('il livello comprato resta sul dispositivo e cambia la Serata che parte dopo', () => {
  const storage = storageFinto();
  assert.deepEqual(opzioniSerata(conYen(0, storage)).cotturaMoltiplicatori, {});
  const prima = conYen(100000, storage);
  compra(prima, ID);
  compra(prima, ID);
  const opzioni = opzioniSerata(new Salvataggio(storage));
  assert.deepEqual(opzioni.cotturaMoltiplicatori, { piastra: livelli[1].cottura });
  assert.deepEqual(new Serata({ seed: 'a', ...opzioni }).stato().cotturaMoltiplicatori, { piastra: livelli[1].cottura });
  assert.deepEqual(cotturaMoltiplicatori(new Salvataggio(storage)), { piastra: livelli[1].cottura });
});

test('ha il nome, la descrizione e l’icona, in tutte e tre le lingue', () => {
  for (const lingua of ['it', 'en', 'ja']) {
    assert.ok(TESTI[lingua][`potenziamento_${ID}`]?.trim(), `${lingua}: manca il nome`);
    assert.ok(TESTI[lingua][`potenziamentoDesc_${ID}`]?.trim(), `${lingua}: manca la descrizione`);
  }
  const icona = DISEGNI[`icona-${ID}`];
  assert.deepEqual([icona.w, icona.h], [120, 120]);
});

// --- La Serata ---

test('senza il Potenziamento la piastra cuoce tutti i suoi secondi', () => {
  const serata = tanabata();
  serata.tocca('pastella');
  const eventi = serata.tocca('polpo');
  assert.equal(eventi.find((e) => e.tipo === 'cotturaIniziata').durataMs, COTTURA_SEC * SEC);
  assert.equal(piastra(serata).cotturaMs, COTTURA_SEC * SEC);
});

test('a ogni livello la cottura dura i secondi della Ricetta per il suo moltiplicatore: l’evento, lo stato e la fine', () => {
  for (const [i, { cottura }] of livelli.entries()) {
    const attesa = Math.round(COTTURA_SEC * SEC * cottura);
    const serata = tanabata({ piastra: cottura });
    serata.tocca('pastella');
    const eventi = serata.tocca('polpo');
    assert.equal(eventi.find((e) => e.tipo === 'cotturaIniziata').durataMs, attesa, `livello ${i + 1}: evento`);
    assert.equal(piastra(serata).cotturaMs, attesa, `livello ${i + 1}: stato`);
    // Un attimo prima della fine cuoce ancora, appena dopo la cottura è finita (e il Piatto aspetta la salsa).
    avanza(serata, attesa - 30);
    assert.equal(piastra(serata).stato, 'cuoce', `livello ${i + 1}: prima della fine`);
    const dopo = avanza(serata, 60);
    assert.ok(dopo.some((e) => e.tipo === 'cotturaFinita'), `livello ${i + 1}: la cottura non è finita in ${attesa} ms`);
    assert.equal(piastra(serata).stato, 'inPreparazione');
    // E il takoyaki si finisce con la salsa e si prende, come sempre: 4 tocchi.
    serata.tocca('salsa');
    assert.equal(piastra(serata).stato, 'pronto');
    assert.equal(serata.tocca('piastra')[0].tipo, 'sulBancone');
  }
});

test('la cottura più corta non cambia la bruciatura: parte a Piatto pronto e dura quanto prima', () => {
  const BRUCIA = PIATTI.takoyaki.burnAfterSec * SEC;
  const serata = tanabata({ piastra: livelli.at(-1).cottura });
  serata.tocca('pastella');
  serata.tocca('polpo');
  avanza(serata, Math.round(COTTURA_SEC * SEC * livelli.at(-1).cottura) + 30);
  serata.tocca('salsa');
  assert.equal(piastra(serata).stato, 'pronto');
  assert.equal(piastra(serata).bruciaTraMs, BRUCIA);
  avanza(serata, BRUCIA - 100);
  assert.equal(piastra(serata).stato, 'pronto');
  avanza(serata, 200);
  assert.equal(piastra(serata).stato, 'bruciato');
});

test('le altre Postazioni non sono toccate: la piastra più veloce lascia la cottura del kakigōri e del ramen com’è', () => {
  const serata = new Serata({ seed: 'prova', ...SERATA_YUKI, cotturaMoltiplicatori: { piastra: 0.5 } });
  avanza(serata, 1600);
  serata.tocca('ghiaccio');
  assert.equal(serata.stato().postazioni.find((p) => p.id === 'macchina').cotturaMs, PIATTI.kakigori.ricetta.find((p) => p.cotturaSec).cotturaSec * SEC);
  serata.tocca('noodles');
  const eventi = serata.tocca('brodo');
  assert.equal(eventi.find((e) => e.tipo === 'cotturaIniziata').durataMs, PIATTI.ramen.ricetta.find((p) => p.cotturaSec).cotturaSec * SEC);
});

// --- Misurato con il bot (media di 6 semi, Tanabata: onigiri e takoyaki) ---

const media = (campo, reazioneMs, cotturaMoltiplicatori) =>
  SEMI.reduce((somma, seme) => somma + giocaServata({ ...SERATA_TANABATA, cotturaMoltiplicatori }, reazioneMs, seme)[campo], 0) / SEMI.length;

test('con il livello massimo ognuno incassa almeno quanto senza, e chi è veloce incassa molto di più', () => {
  const massimo = { piastra: livelli.at(-1).cottura };
  for (const [nome, reazioneMs] of Object.entries(BRAVURA)) {
    const senza = media('incasso', reazioneMs, {});
    const con = media('incasso', reazioneMs, massimo);
    assert.ok(con >= senza, `${nome}: con la piastra al massimo ${con}, senza ${senza}`);
  }
  assert.ok(media('incasso', BRAVURA.rapido, massimo) > media('incasso', BRAVURA.rapido, {}) * 1.2, 'il rapido deve sentirlo (+20% e oltre)');
});

test('ogni livello aiuta il rapido almeno quanto il precedente', () => {
  let precedente = media('incasso', BRAVURA.rapido, {});
  for (const [i, { cottura }] of livelli.entries()) {
    const incasso = media('incasso', BRAVURA.rapido, { piastra: cottura });
    assert.ok(incasso >= precedente, `livello ${i + 1}: ${incasso}, il precedente ${precedente}`);
    precedente = incasso;
  }
});

test('con tutti i Potenziamenti la Mancia della Serie resta sotto il 16% dell’Incasso del rapido, anche nel Tanabata', () => {
  const tutto = { posti: 4, cuori: 6, pazienzaMoltiplicatore: 1.4, cotturaMoltiplicatori: { piastra: livelli.at(-1).cottura } };
  const extra = SEMI.reduce((somma, seme) => somma + giocaServata({ ...SERATA_TANABATA, ...tutto }, BRAVURA.rapido, seme).manciaDaSerie, 0) / SEMI.length;
  const incasso = SEMI.reduce((somma, seme) => somma + giocaServata({ ...SERATA_TANABATA, ...tutto }, BRAVURA.rapido, seme).incasso, 0) / SEMI.length;
  assert.ok(extra <= incasso * 0.16, `Mancia della Serie ${extra} su ${incasso}: ${((100 * extra) / incasso).toFixed(1)}%`);
});
