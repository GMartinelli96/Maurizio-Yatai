import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SCHERMO, SFONDO, YATAI } from '../src/config.js';
import { DISEGNI } from '../src/disegni/catalogo.js';
import { PAVIMENTO_SIZE } from '../src/disegni/yatai.js';
import { PEZZI } from '../src/disegni/sfondi/index.js';
import { buchi, layoutSfondo } from '../src/layout/sfondo.js';
import { NO_INSETS, canvasRect, frameFor, safeInFrame } from '../src/layout/schermo.js';
import { layoutYatai } from '../src/layout/yatai.js';
import { record } from './registratore.js';

const near = (a, b, msg, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${msg ?? ''} ${a} ≠ ${b}`);

// Gli schermi su cui lo sfondo deve reggere, con i margini sicuri (notch, barra in basso).
const SCHERMI = [
  { nome: 'telefono piccolo 360×640', w: 360, h: 640, insets: NO_INSETS },
  { nome: 'telefono 390×844 con notch', w: 390, h: 844, insets: { top: 47, right: 0, bottom: 34, left: 0 } },
  { nome: 'telefono lungo 360×800', w: 360, h: 800, insets: { top: 28, right: 0, bottom: 20, left: 0 } },
  { nome: 'telefono lungo con notch grande 360×800', w: 360, h: 800, insets: { top: 60, right: 0, bottom: 34, left: 0 } },
  { nome: 'telefono corto 375×667', w: 375, h: 667, insets: { top: 20, right: 0, bottom: 0, left: 0 } },
  { nome: 'tablet 768×1024', w: 768, h: 1024, insets: NO_INSETS },
  { nome: 'computer 1280×720', w: 1280, h: 720, insets: NO_INSETS },
];

const impagina = ({ w, h, insets }, options = {}) => {
  const view = { w, h };
  const frame = frameFor(w, h);
  const safe = safeInFrame(view, frame, insets);
  const layout = layoutYatai({ frame, safe, ...options });
  return { frame, safe, layout, sfondo: layoutSfondo(layout) };
};

// Tutte le altezze di gioco da 1280 a 1560 (a passi di 20, più i due estremi), ognuna senza e con
// un notch grande: la larghezza è sempre 720 (src/layout/schermo.js).
const ALTEZZE = Array.from({ length: 15 }, (_, i) => 1280 + i * 20);
const conAltezza = (altezza, safe = { top: 0, right: 0, bottom: 0, left: 0 }) => {
  const frame = { width: 720, height: altezza };
  const layout = layoutYatai({ frame, safe });
  return { frame, safe, layout, sfondo: layoutSfondo(layout) };
};
const SICURE = [
  { top: 0, right: 0, bottom: 0, left: 0 },
  { top: 87, right: 0, bottom: 63, left: 0 },
  { top: 120, right: 0, bottom: 80, left: 0 },
];

// ---------------------------------------------------------------------------------------------
// Ancoraggio al layout

test('l’orizzonte cade a metà della fascia dei Clienti, a ogni altezza e con ogni area sicura', () => {
  for (const safe of SICURE) {
    for (const altezza of ALTEZZE) {
      const { layout, sfondo } = conAltezza(altezza, safe);
      const { clienti, hud, bancone } = layout.zone;
      near(sfondo.orizzonte, clienti.y + clienti.h * SFONDO.orizzonte, `${altezza}`);
      assert.ok(sfondo.orizzonte > hud.y + hud.h, `${altezza}: l'orizzonte è dentro la fascia hud`);
      assert.ok(sfondo.orizzonte < bancone.y, `${altezza}: l'orizzonte è sotto la cima del Bancone`);
    }
  }
});

test('i pezzi dello sfondo poggiano sul layout: cielo sull’orizzonte, terra sotto, lati sul Bancone, pavimento dopo la tendina', () => {
  for (const safe of SICURE) {
    for (const altezza of ALTEZZE) {
      const { layout, sfondo, frame } = conAltezza(altezza, safe);
      const m = `${altezza} ${JSON.stringify(safe)}`;
      near(sfondo.cielo.y + sfondo.cielo.h, sfondo.orizzonte + SFONDO.cielo.sotto, `cielo ${m}`);
      near(sfondo.terra.y, sfondo.orizzonte, `terra ${m}`);
      near(sfondo.alto.y, 0, `alto ${m}`);
      near(sfondo.latoSx.y + sfondo.latoSx.h, layout.bancone.rect.y + SFONDO.lato.sotto, `lato sinistro ${m}`);
      near(sfondo.latoDx.y, sfondo.latoSx.y, `lati alla stessa quota ${m}`);
      near(sfondo.latoSx.x, 0, `lato sinistro al bordo ${m}`);
      near(sfondo.latoDx.x + sfondo.latoDx.w, frame.width, `lato destro al bordo ${m}`);
      near(sfondo.pavimentoY, layout.bancone.rect.y + SFONDO.attaccoPavimento, `pavimento ${m}`);
    }
  }
});

test('la parte che si vede dello sfondo segue lo schermo: più alto il gioco, più giù l’orizzonte e il pavimento', () => {
  let prima = null;
  for (const altezza of ALTEZZE) {
    const { sfondo } = conAltezza(altezza);
    if (prima) {
      assert.ok(sfondo.orizzonte > prima.orizzonte, `${altezza}: l'orizzonte non scende`);
      assert.ok(sfondo.pavimentoY > prima.pavimentoY, `${altezza}: il pavimento non scende`);
    }
    prima = sfondo;
  }
});

test('l’area sicura spinge l’orizzonte in giù di quanto spinge i Clienti: lo sfondo non resta indietro', () => {
  const senza = conAltezza(1400);
  const con = conAltezza(1400, { top: 80, right: 0, bottom: 0, left: 0 });
  assert.ok(con.sfondo.orizzonte > senza.sfondo.orizzonte);
  assert.ok(con.sfondo.pavimentoY > senza.sfondo.pavimentoY);
  // L'alto invece sta attaccato al bordo dello schermo, non all'area sicura.
  near(con.sfondo.alto.y, 0);
});

// ---------------------------------------------------------------------------------------------
// Copertura: dal bordo in alto a quello in basso non resta nessun buco

test('dal bordo in alto a quello in basso non resta nessun buco, a tutte le altezze 1280-1560 e con ogni area sicura', () => {
  for (const safe of SICURE) {
    for (const altezza of ALTEZZE) {
      const { sfondo, frame } = conAltezza(altezza, safe);
      assert.deepEqual(buchi(sfondo, frame, PAVIMENTO_SIZE.h), [], `buchi a ${altezza} con ${JSON.stringify(safe)}`);
    }
  }
});

test('lo sfondo copre anche sotto il notch: il cielo parte sopra il bordo in alto, a ogni altezza', () => {
  for (const safe of SICURE) {
    for (const altezza of ALTEZZE) {
      const { sfondo, layout } = conAltezza(altezza, safe);
      assert.ok(sfondo.cielo.y <= 0, `${altezza}: il cielo parte a ${sfondo.cielo.y}`);
      assert.ok(sfondo.orizzonte > safe.top, `${altezza}: l'orizzonte è dentro l'area sicura`);
      // La texture dell'alto arriva oltre la fascia hud, così i rami e le lanterne reggono dietro il tempo.
      assert.ok(sfondo.alto.y + sfondo.alto.h >= layout.zone.hud.y + layout.zone.hud.h, `${altezza}: l'alto finisce dentro l'hud`);
    }
  }
});

test('i lati salgono fino al bordo in alto e poggiano dietro il Bancone, a ogni altezza', () => {
  for (const safe of SICURE) {
    for (const altezza of ALTEZZE) {
      const { sfondo, layout } = conAltezza(altezza, safe);
      assert.ok(sfondo.latoSx.y <= 0, `${altezza}: il lato parte a ${sfondo.latoSx.y}`);
      assert.ok(sfondo.latoSx.y + sfondo.latoSx.h > layout.bancone.rect.y, `${altezza}: il lato non arriva al Bancone`);
    }
  }
});

test('il cielo e la terra sono alti abbastanza per il telefono più lungo anche con un notch molto grande', () => {
  for (const safe of [...SICURE, { top: 160, right: 0, bottom: 100, left: 0 }]) {
    const { sfondo, layout } = conAltezza(SCHERMO.maxHeight, safe);
    assert.ok(sfondo.terra.y + sfondo.terra.h >= sfondo.pavimentoY, 'la terra non arriva sotto il pavimento');
    assert.ok(sfondo.orizzonte + SFONDO.cielo.sotto - SFONDO.cielo.h <= 0, 'il cielo non arriva in cima');
    assert.ok(layout.bancone.rect.y + SFONDO.lato.sotto < SFONDO.lato.h, 'i lati non salgono in cima');
  }
});

test('gli schermi veri: nessun buco e nessun pezzo oltre i bordi laterali', () => {
  for (const schermo of SCHERMI) {
    const { sfondo, frame } = impagina(schermo);
    assert.deepEqual(buchi(sfondo, frame, PAVIMENTO_SIZE.h), [], `buchi su ${schermo.nome}`);
    for (const [nome, r] of Object.entries(sfondo)) {
      if (typeof r !== 'object') continue;
      assert.ok(r.x >= -1e-6 && r.x + r.w <= frame.width + 1e-6, `${schermo.nome}: ${nome} esce dai lati`);
    }
  }
});

test('le misure dei pezzi in layout sono quelle delle texture, e il pavimento è alto abbastanza', () => {
  const { sfondo } = conAltezza(1400);
  for (const pezzo of Object.keys(PEZZI)) {
    near(sfondo[pezzo].w, PEZZI[pezzo].w, `${pezzo} larghezza`);
    near(sfondo[pezzo].h, PEZZI[pezzo].h, `${pezzo} altezza`);
  }
  // Dalla cima del pavimento al fondo dello schermo più lungo.
  const { sfondo: lungo, frame } = conAltezza(SCHERMO.maxHeight);
  assert.ok(lungo.pavimentoY + PAVIMENTO_SIZE.h >= frame.height, 'il pavimento non arriva in fondo');
});

test('con 4 Posti o con meno Postazioni lo sfondo resta dov’è', () => {
  const frame = { width: 720, height: 1400 };
  const safe = { top: 40, right: 0, bottom: 30, left: 0 };
  const base = layoutSfondo(layoutYatai({ frame, safe }));
  assert.deepEqual(layoutSfondo(layoutYatai({ frame, safe, seats: YATAI.posti.massimo })), base);
  assert.deepEqual(layoutSfondo(layoutYatai({ frame, safe, stations: 2 })), base);
});

test('buchi() vede un buco quando c’è', () => {
  const { sfondo, frame } = conAltezza(1400);
  const storto = { ...sfondo, terra: { ...sfondo.terra, h: 100 } };
  const trovati = buchi(storto, frame, PAVIMENTO_SIZE.h);
  assert.equal(trovati.length, 1);
  assert.ok(trovati[0].a - trovati[0].da > 100);
  // E vede lo schermo che il pavimento non arriva a coprire.
  assert.equal(buchi(sfondo, frame, 50).length, 1);
});

// ---------------------------------------------------------------------------------------------
// Le immagini approvate al passo 1 non cambiano: l'impronta della loro registrazione di disegno è
// quella che avevano al commit 7cac12c (le impronte dei pixel sono in render_game_to_text:
// maurizio a43b5bed, e le altre quattro nel catalogo della scena di sviluppo).

test('carta, ombra, Maurizio, onigiri e le Postazioni si disegnano come prima del tema (impronta della registrazione)', () => {
  const attese = {
    carta: '30786:2582ecc',
    ombra: '381:38af6fda',
    maurizio: '59425:e677a71c',
    'maurizio-lavora': '59876:1ce38695',
    'maurizio-evviva': '59732:65bc67f1',
    onigiri: '7388:88b0afd9',
    'onigiri-icona': '2101:f8b4485c',
    'postazione-onigiri': '8157:8bac2414',
    'postazione-takoyaki': '7477:abb7d6bc',
    'postazione-kakigori': '5845:646f8f11',
    'postazione-taiyaki': '7024:e51c00e2',
    'postazione-ramen': '5981:4c6207ab',
  };
  for (const [key, atteso] of Object.entries(attese)) {
    const r = record(key, DISEGNI[key]);
    assert.equal(`${r.calls}:${r.digest}`, atteso, `${key} è cambiato`);
  }
});
