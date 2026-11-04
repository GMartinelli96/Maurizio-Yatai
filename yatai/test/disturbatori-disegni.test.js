import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DISTURBATORI } from '../src/config.js';
import {
  DISEGNI_DISTURBATORI, TEXTURE_COMUNI, TEXTURE_DI, ZAMPE, texturePer,
} from '../src/disegni/disturbatori.js';
import { generateDisturbatori } from '../src/kit/texture.js';
import { record, recordingContext } from './registratore.js';

// I disegni dei Disturbatori (ticket 11, passo 2): ci sono tutti, escono uguali a ogni avvio, sono diversi tra loro e
// la Serata genera solo quelli che servono. Come stanno sullo Yatai si guarda negli screenshot (?sviluppo=disturbatori).

test('ogni Disturbatore della logica ha i suoi disegni, e ogni disegno è di qualcuno', () => {
  assert.deepEqual(Object.keys(TEXTURE_DI), Object.keys(DISTURBATORI));
  const dichiarate = [...Object.values(TEXTURE_DI).flat(), ...TEXTURE_COMUNI];
  assert.deepEqual([...dichiarate].sort(), Object.keys(DISEGNI_DISTURBATORI).sort());
  assert.equal(new Set(dichiarate).size, dichiarate.length, 'una texture è di due Disturbatori');
  for (const [key, entry] of Object.entries(DISEGNI_DISTURBATORI)) {
    assert.ok(entry.w > 0 && entry.h > 0, `${key}: misura`);
    assert.equal(typeof entry.draw, 'function');
  }
  // Le pose di Croccola e del corvo hanno la stessa misura (la scena le scambia sullo stesso punto d'appoggio).
  for (const pose of ['croccola-balzo', 'croccola-fusa', 'croccola-fuga']) {
    assert.deepEqual([DISEGNI_DISTURBATORI[pose].w, DISEGNI_DISTURBATORI[pose].h], [DISEGNI_DISTURBATORI.croccola.w, DISEGNI_DISTURBATORI.croccola.h]);
  }
  assert.deepEqual([DISEGNI_DISTURBATORI['corvo-gracchia'].w, DISEGNI_DISTURBATORI['corvo-gracchia'].h], [DISEGNI_DISTURBATORI.corvo.w, DISEGNI_DISTURBATORI.corvo.h]);
  assert.deepEqual([DISEGNI_DISTURBATORI['corvo-ali-giu'].w, DISEGNI_DISTURBATORI['corvo-ali-giu'].h], [DISEGNI_DISTURBATORI['corvo-ali-su'].w, DISEGNI_DISTURBATORI['corvo-ali-su'].h]);
});

test('il corvo ha due zampe (quello a tre è lo Yatagarasu, il corvo sacro di Kumano)', () => {
  assert.equal(ZAMPE, 2);
  // I disegni del corvo posato e in volo girano senza il controllo interno sul numero di zampe che scatterebbe con tre.
  for (const key of ['corvo', 'corvo-gracchia', 'corvo-ali-su', 'corvo-ali-giu']) assert.doesNotThrow(() => record(key, DISEGNI_DISTURBATORI[key]));
  const sorgente = readFileSync(new URL('../src/disegni/disturbatori.js', import.meta.url), 'utf8');
  assert.match(sorgente, /const xs = \[\d+, \d+\];/, 'le zampe del corvo posato sono due x');
});

test('nessun disegno usa Math.random: escono uguali a ogni avvio', () => {
  const sorgente = readFileSync(new URL('../src/disegni/disturbatori.js', import.meta.url), 'utf8');
  assert.ok(!sorgente.includes('Math.random'));
});

// Le impronte della registrazione di disegno (chiamate:impronta), prese quando Giuseppe ha visto i disegni nel passo 2 del
// ticket 11. Se una cambia, qualcuno ha toccato un disegno: si aggiornano solo se si approva un nuovo disegno.
const IMPRONTE = {
  croccola: '23273:f5d1a823',
  'croccola-balzo': '25063:39664da0',
  'croccola-fusa': '22720:370e5d49',
  'croccola-fuga': '20820:82354456',
  'formica-a': '2289:6be07d83',
  'formica-b': '2291:25c049d5',
  'piatto-rovinato': '9084:549a652b',
  corvo: '14071:5775add',
  'corvo-gracchia': '14412:ebe05ab7',
  'corvo-ali-su': '34049:a38be74',
  'corvo-ali-giu': '34049:646ead9c',
  'segno-suono': '1085:5b52dae3',
  'segno-bersaglio': '4324:fe20c6b4',
  piuma: '1412:141b3f0d',
};

test('ogni disegno esce identico a ogni avvio, disegna davvero qualcosa ed è diverso dagli altri', () => {
  const visti = new Set();
  for (const [key, entry] of Object.entries(DISEGNI_DISTURBATORI)) {
    const primo = record(key, entry);
    const secondo = record(key, entry);
    assert.ok(primo.calls > 500, `${key} non disegna quasi niente`);
    assert.equal(`${secondo.calls}:${secondo.digest}`, `${primo.calls}:${primo.digest}`, `${key} cambia da un avvio all'altro`);
    assert.equal(`${primo.calls}:${primo.digest}`, IMPRONTE[key], `${key}: il disegno è cambiato (se è voluto, aggiorna IMPRONTE)`);
    visti.add(primo.digest);
  }
  assert.equal(visti.size, Object.keys(DISEGNI_DISTURBATORI).length, 'due disegni sono uguali');
});

test('la Serata genera solo i disegni dei Disturbatori che ha, una volta sola', () => {
  const create = [];
  const scene = {
    textures: {
      exists: (key) => create.includes(key),
      createCanvas: (key) => {
        create.push(key);
        return { getContext: () => recordingContext().ctx, refresh() {} };
      },
    },
  };
  assert.deepEqual(texturePer([]), []);
  assert.deepEqual(generateDisturbatori(scene, []).nuove, 0);
  assert.equal(create.length, 0, 'senza Disturbatori non nasce niente');
  assert.equal(generateDisturbatori(scene, ['croccola']).nuove, TEXTURE_DI.croccola.length + TEXTURE_COMUNI.length);
  assert.ok(!create.includes('corvo'));
  generateDisturbatori(scene, ['croccola', 'formiche', 'corvi']);
  assert.equal(create.length, Object.keys(DISEGNI_DISTURBATORI).length);
  assert.equal(generateDisturbatori(scene, ['croccola', 'formiche', 'corvi']).nuove, 0);
});
