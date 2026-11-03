import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { drawEntry } from '../src/disegni/catalogo.js';
import {
  CLIENTE_SIZE, CLIENTI, DISEGNI_CLIENTI, ESPRESSIONI, clienteKey,
} from '../src/disegni/clienti.js';

// Un finto canvas che registra ogni chiamata e ogni proprietà impostata (come in kit.test.js):
// due disegni sono uguali se le registrazioni sono uguali.
function record(key, entry) {
  const log = [];
  const ctx = new Proxy({}, {
    get(target, prop) {
      if (prop in target) return target[prop];
      return (...args) => {
        log.push([prop, ...args]);
        return undefined;
      };
    },
    set(target, prop, value) {
      target[prop] = value;
      log.push(['=', prop, value]);
      return true;
    },
  });
  drawEntry(ctx, key, entry);
  return JSON.stringify(log);
}

test('ci sono i tre Clienti di passaggio, ognuno con quattro espressioni, tutti della stessa misura', () => {
  assert.deepEqual(CLIENTI, ['tanuki', 'kitsune', 'maneki-neko']);
  assert.deepEqual(ESPRESSIONI, ['neutra', 'perplessa', 'imbronciata', 'contenta']);
  assert.equal(Object.keys(DISEGNI_CLIENTI).length, CLIENTI.length * ESPRESSIONI.length);
  for (const cliente of CLIENTI) {
    for (const espressione of ESPRESSIONI) {
      const entry = DISEGNI_CLIENTI[clienteKey(cliente, espressione)];
      assert.ok(entry, `manca ${cliente} ${espressione}`);
      assert.equal(entry.w, CLIENTE_SIZE.w);
      assert.equal(entry.h, CLIENTE_SIZE.h);
    }
  }
});

test('ogni Cliente esce identico a ogni avvio e le espressioni sono diverse', () => {
  for (const cliente of CLIENTI) {
    const drawings = ESPRESSIONI.map((espressione) => {
      const key = clienteKey(cliente, espressione);
      const first = record(key, DISEGNI_CLIENTI[key]);
      assert.ok(first.length > 5000, `${key} non disegna quasi niente`);
      assert.equal(record(key, DISEGNI_CLIENTI[key]), first, `${key} cambia da un avvio all'altro`);
      return first;
    });
    assert.equal(new Set(drawings).size, ESPRESSIONI.length, `${cliente}: due espressioni uguali`);
  }
});

// Le impronte (SHA-1 di ciò che il disegno chiede al canvas) delle tre espressioni approvate nel
// ticket 04, calcolate prima del ticket 36. Se una cambia, un'espressione approvata è stata toccata:
// la venetta dell'imbronciata compresa. Si aggiornano solo se Giuseppe approva un nuovo disegno.
const IMPRONTE_APPROVATE = {
  'cliente-tanuki-neutra': 'b7a84d400a5d9ee48a46e20a5e93e960073295f5',
  'cliente-tanuki-imbronciata': '17ff55569f17326da113deff6af49c2f39671b51',
  'cliente-tanuki-contenta': 'e865218bbd71a2a76665aa04608523ae2a0185e2',
  'cliente-kitsune-neutra': '02400efdaf4d56b301f1dddec6d4b4abf6a9ca52',
  'cliente-kitsune-imbronciata': '971b9c4c17f167cf178d8024d1e2ab004c3a3e0e',
  'cliente-kitsune-contenta': '7f05e1cbd1bd51b9764b85cd45d60d1b685291fb',
  'cliente-maneki-neko-neutra': 'bf0c0c07331bef60eae560c56c3022eca8db990c',
  'cliente-maneki-neko-imbronciata': '8f14b996b8fa7ced9595074bf0e6a06f946ff234',
  'cliente-maneki-neko-contenta': '2ad84acb2c2e90eea5093431ded5311eed284006',
};

test('le tre espressioni approvate dei tre Clienti non sono cambiate (venetta compresa)', () => {
  assert.equal(Object.keys(IMPRONTE_APPROVATE).length, 9);
  for (const [key, attesa] of Object.entries(IMPRONTE_APPROVATE)) {
    const impronta = createHash('sha1').update(record(key, DISEGNI_CLIENTI[key])).digest('hex');
    assert.equal(impronta, attesa, `${key} è cambiato rispetto a quello approvato`);
  }
});

test('i Clienti non usano Math.random', (t) => {
  t.mock.method(Math, 'random', () => {
    throw new Error('Math.random nel disegno di un Cliente');
  });
  for (const [key, entry] of Object.entries(DISEGNI_CLIENTI)) record(key, entry);
});
