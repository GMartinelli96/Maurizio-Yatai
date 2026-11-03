import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DISEGNI, drawEntry, panelDrawing } from '../src/disegni/catalogo.js';
import { ellipse, wobble } from '../src/kit/matita.js';
import { createRng } from '../src/kit/rng.js';

// Un finto canvas che registra ogni chiamata e ogni proprietà impostata: due disegni sono uguali
// se le registrazioni sono uguali. I pixel della carta (ImageData) si registrano come impronta.
function recordingContext() {
  const log = [];
  const fingerprint = (bytes) => {
    let h = 0x811c9dc5;
    for (const b of bytes) h = Math.imul(h ^ b, 0x01000193);
    return `bytes:${h >>> 0}`;
  };
  const serialize = (v) => (v?.data instanceof Uint8ClampedArray ? fingerprint(v.data) : v);
  const ctx = new Proxy({}, {
    get(target, prop) {
      if (prop in target) return target[prop];
      return (...args) => {
        log.push([prop, ...args.map(serialize)]);
        if (prop === 'createImageData') {
          return { width: args[0], height: args[1], data: new Uint8ClampedArray(args[0] * args[1] * 4) };
        }
        return undefined;
      };
    },
    set(target, prop, value) {
      target[prop] = value;
      log.push(['=', prop, value]);
      return true;
    },
  });
  return { ctx, log };
}

// La registrazione intera è enorme: si confronta la sua impronta, così un errore resta leggibile.
function record(key, entry) {
  const { ctx, log } = recordingContext();
  drawEntry(ctx, key, entry);
  const text = JSON.stringify(log);
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 0x01000193);
  return { calls: log.length, digest: (h >>> 0).toString(16) };
}

test('lo stesso seme dà gli stessi numeri, un seme diverso numeri diversi', () => {
  const a = createRng('maurizio');
  const b = createRng('maurizio');
  const c = createRng('onigiri');
  const seqA = Array.from({ length: 5 }, a);
  assert.deepEqual(Array.from({ length: 5 }, b), seqA);
  assert.notDeepEqual(Array.from({ length: 5 }, c), seqA);
  for (const x of seqA) assert.ok(x >= 0 && x < 1);
});

test('ogni disegno del catalogo esce identico a ogni avvio', () => {
  for (const [key, entry] of Object.entries(DISEGNI)) {
    const first = record(key, entry);
    assert.ok(first.calls > 50, `${key} non disegna quasi niente`);
    assert.deepEqual(record(key, entry), first, `${key} cambia da un avvio all'altro`);
  }
  const button = panelDrawing(320, 100, 'rosa');
  assert.deepEqual(record('pannello', button), record('pannello', button));
});

test('il seme dipende dal nome della texture: due nomi, due tremolii', () => {
  assert.notDeepEqual(record('maurizio', DISEGNI.maurizio), record('maurizio-bis', DISEGNI.maurizio));
});

test('il kit non usa mai Math.random', (t) => {
  t.mock.method(Math, 'random', () => {
    throw new Error('Math.random nel kit a matita');
  });
  for (const [key, entry] of Object.entries(DISEGNI)) record(key, entry);
});

test('il tremolio resta vicino al contorno', () => {
  const circle = ellipse(100, 100, 50, 50);
  const shaky = wobble(circle, true, createRng('cerchio'), 1.3, 26);
  const distances = shaky.map((p) => Math.hypot(p.x - 100, p.y - 100));
  assert.ok(Math.min(...distances) > 50 - 1.5 && Math.max(...distances) < 50 + 1.5);
  // ...ma si muove davvero.
  assert.ok(Math.max(...distances) - Math.min(...distances) > 0.5);
});
