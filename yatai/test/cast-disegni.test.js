import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CAST, CAST_SEGNI_POS, DISEGNI_CAST } from '../src/disegni/cast.js';
import {
  CLIENTE_SIZE, CLIENTI, DISEGNI_CLIENTI, ESPRESSIONI, clienteKey,
} from '../src/disegni/clienti.js';
import { espressioneDa, segnoDa } from '../src/serata/Serata.js';
import { record } from './registratore.js';

// I sette peluche del cast (ticket 09): stesse misure, stesse quattro espressioni, stesso Lamento dei Clienti di
// passaggio. Qui si controlla che i disegni siano giusti e stabili; come stanno ai Posti si guarda negli screenshot
// (scenari/cast.json).

test('ci sono i sette del cast, ognuno con quattro espressioni, tutti della misura dei Clienti di passaggio', () => {
  assert.deepEqual(CAST, ['marcella', 'carlotta', 'balosso', 'nella', 'filippo', 'pasquale', 'ebi-furai']);
  assert.equal(Object.keys(DISEGNI_CAST).length, CAST.length * ESPRESSIONI.length);
  for (const id of CAST) {
    for (const espressione of ESPRESSIONI) {
      const entry = DISEGNI_CAST[clienteKey(id, espressione)];
      assert.ok(entry, `manca ${id} ${espressione}`);
      assert.equal(entry.w, CLIENTE_SIZE.w);
      assert.equal(entry.h, CLIENTE_SIZE.h);
    }
  }
});

test('nessun nome del cast è anche di un Cliente di passaggio, e nessuna chiave di texture si ripete', () => {
  for (const id of CAST) assert.ok(!CLIENTI.includes(id), `${id} è anche un Cliente di passaggio`);
  const chiavi = [...Object.keys(DISEGNI_CAST), ...Object.keys(DISEGNI_CLIENTI)];
  assert.equal(new Set(chiavi).size, chiavi.length);
});

test('ogni peluche esce identico a ogni avvio, le quattro espressioni sono diverse e il corpo è lo stesso', () => {
  for (const id of CAST) {
    const registri = ESPRESSIONI.map((espressione) => {
      const key = clienteKey(id, espressione);
      const primo = record(key, DISEGNI_CAST[key], { tieni: true });
      assert.ok(primo.calls > 5000, `${key} non disegna quasi niente`);
      const secondo = record(key, DISEGNI_CAST[key]);
      assert.equal(`${secondo.calls}:${secondo.digest}`, `${primo.calls}:${primo.digest}`, `${key} cambia da un avvio all'altro`);
      return primo;
    });
    assert.equal(new Set(registri.map((r) => r.digest)).size, ESPRESSIONI.length, `${id}: due espressioni uguali`);
    // Il corpo ha il seme del personaggio in tutte e quattro: fino alla faccia le chiamate di disegno sono le
    // stesse, quindi scambiando l'espressione il peluche non "salta".
    const [neutra, perplessa] = registri;
    let uguali = 0;
    while (uguali < neutra.log.length && JSON.stringify(neutra.log[uguali]) === JSON.stringify(perplessa.log[uguali])) uguali += 1;
    assert.ok(uguali > 2000, `${id}: il corpo cambia con l'espressione (${uguali} chiamate uguali)`);
  }
});

// Le impronte della registrazione di disegno (chiamate:impronta) dei 28 disegni, prese quando Giuseppe ha visto il
// cast nel passo 1 del ticket 09. Se una cambia, qualcuno ha toccato un disegno del cast: si aggiornano solo se si
// approva un nuovo disegno.
const IMPRONTE = {
  'cliente-marcella-neutra': '31774:f63ee8c0',
  'cliente-marcella-perplessa': '31924:f5e4e3c9',
  'cliente-marcella-imbronciata': '31894:69ed4253',
  'cliente-marcella-contenta': '31414:a829aad5',
  'cliente-carlotta-neutra': '35665:48478993',
  'cliente-carlotta-perplessa': '35821:70b35d4c',
  'cliente-carlotta-imbronciata': '35767:beaca747',
  'cliente-carlotta-contenta': '35299:cb2357cb',
  'cliente-balosso-neutra': '35086:639a3a41',
  'cliente-balosso-perplessa': '35230:61e7db86',
  'cliente-balosso-imbronciata': '35188:cc26c35b',
  'cliente-balosso-contenta': '34774:37ce812f',
  'cliente-nella-neutra': '32028:66f281af',
  'cliente-nella-perplessa': '32178:187c364a',
  'cliente-nella-imbronciata': '32070:b882cdbe',
  'cliente-nella-contenta': '31710:4c3761a2',
  'cliente-filippo-neutra': '32938:e75ab20',
  'cliente-filippo-perplessa': '33184:8f1f93b6',
  'cliente-filippo-imbronciata': '33118:201ca5a0',
  'cliente-filippo-contenta': '32584:5a276006',
  'cliente-pasquale-neutra': '36415:5bf5acb7',
  'cliente-pasquale-perplessa': '36589:e1f2d447',
  'cliente-pasquale-imbronciata': '36421:f196312',
  'cliente-pasquale-contenta': '35959:cb7c6107',
  'cliente-ebi-furai-neutra': '37680:ff718204',
  'cliente-ebi-furai-perplessa': '37740:e30cc010',
  'cliente-ebi-furai-imbronciata': '37680:c716f745',
  'cliente-ebi-furai-contenta': '37248:ef1460fe',
};

test('i 28 disegni del cast non sono cambiati rispetto a quelli visti nel passo 1', () => {
  assert.equal(Object.keys(IMPRONTE).length, CAST.length * ESPRESSIONI.length);
  for (const [key, atteso] of Object.entries(IMPRONTE)) {
    const r = record(key, DISEGNI_CAST[key]);
    assert.equal(`${r.calls}:${r.digest}`, atteso, `${key} è cambiato`);
  }
});

test('il cast non usa Math.random', (t) => {
  t.mock.method(Math, 'random', () => {
    throw new Error('Math.random nel disegno del cast');
  });
  for (const [key, entry] of Object.entries(DISEGNI_CAST)) record(key, entry);
});

test('il cast ha lo stesso Lamento dei Clienti di passaggio: la faccia e il segno dipendono solo dai cuoricini', () => {
  // Nessuna delle due funzioni sa chi è il Cliente: stessa faccia e stesso segno per tutti, cast compreso.
  assert.equal(espressioneDa.length, 1);
  assert.equal(segnoDa.length, 1);
  // Le espressioni del cast sono quelle dello schema, né una di più né una di meno.
  for (const id of CAST) {
    const fatte = Object.keys(DISEGNI_CAST).filter((key) => key.startsWith(`cliente-${id}-`)).map((key) => key.slice(`cliente-${id}-`.length));
    assert.deepEqual(fatte, ESPRESSIONI, `${id}: espressioni diverse dallo schema`);
  }
  for (const cuori of [5, 4, 3, 2, 1]) {
    assert.ok(ESPRESSIONI.includes(espressioneDa(cuori)));
    const segno = segnoDa(cuori);
    assert.ok(segno === null || ['goccia', 'sbuffo'].includes(segno));
  }
});

test('ogni peluche del cast ha il posto della goccia e dello sbuffo, dentro il suo riquadro', () => {
  assert.deepEqual(Object.keys(CAST_SEGNI_POS).sort(), [...CAST].sort());
  for (const id of CAST) {
    for (const segno of ['goccia', 'sbuffo']) {
      const { x, y } = CAST_SEGNI_POS[id][segno];
      assert.ok(x >= 0 && x <= CLIENTE_SIZE.w && y >= 0 && y <= CLIENTE_SIZE.h, `${id} ${segno} fuori dal riquadro: ${x},${y}`);
    }
  }
});
