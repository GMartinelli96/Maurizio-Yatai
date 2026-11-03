import { test } from 'node:test';
import assert from 'node:assert/strict';
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

test('ci sono i tre Clienti di passaggio, ognuno con tre espressioni, tutti della stessa misura', () => {
  assert.deepEqual(CLIENTI, ['tanuki', 'kitsune', 'maneki-neko']);
  assert.deepEqual(ESPRESSIONI, ['neutra', 'imbronciata', 'contenta']);
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

test('i Clienti non usano Math.random', (t) => {
  t.mock.method(Math, 'random', () => {
    throw new Error('Math.random nel disegno di un Cliente');
  });
  for (const [key, entry] of Object.entries(DISEGNI_CLIENTI)) record(key, entry);
});
