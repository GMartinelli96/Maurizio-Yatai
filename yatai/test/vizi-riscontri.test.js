import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RISCONTRI, YATAI } from '../src/config.js';
import { DISEGNI } from '../src/disegni/catalogo.js';
import { CAST, CAST_PUNTI } from '../src/disegni/cast.js';
import { CLIENTE_FEET, CLIENTE_SIZE } from '../src/disegni/clienti.js';
import { CALMA_SIZE, DISEGNI_VIZI, MONETA_ORO_SIZE } from '../src/disegni/vizi.js';
import { NO_INSETS, frameFor, safeInFrame } from '../src/layout/schermo.js';
import { layoutYatai, placeCliente } from '../src/layout/yatai.js';
import { percorsoMonetaOro, puntoSulCliente, rettangoloCalma, sorgenteMonete } from '../src/serata/riscontriVizi.js';
import { record } from './registratore.js';

// I riscontri dei Vizi del cast (ticket 09, passo 4): i due disegni nuovi e dove cadono lo Yen d'oro, la borsetta di
// Carlotta e l'ovale di calma di Balosso. Come si muovono si guarda negli screenshot (scenari/serata-cast.json).

const SCHERMI = [
  { nome: '360×640', w: 360, h: 640, insets: NO_INSETS },
  { nome: '390×844 con notch', w: 390, h: 844, insets: { top: 47, right: 0, bottom: 34, left: 0 } },
  { nome: '360×800', w: 360, h: 800, insets: { top: 28, right: 0, bottom: 20, left: 0 } },
  { nome: '375×667', w: 375, h: 667, insets: { top: 20, right: 0, bottom: 0, left: 0 } },
  { nome: 'tablet 768×1024', w: 768, h: 1024, insets: NO_INSETS },
  { nome: 'computer 1280×720', w: 1280, h: 720, insets: NO_INSETS },
];

// I Posti di uno schermo, con 3 o 4 Posti, e la geometria del Cliente in ognuno.
function posti({ w, h, insets }, seats) {
  const frame = frameFor(w, h);
  const safe = safeInFrame({ w, h }, frame, insets);
  const layout = layoutYatai({ frame, safe, seats, stations: 3 });
  return layout.posti.map((rect) => ({ rect, geom: placeCliente(rect, CLIENTE_SIZE, CLIENTE_FEET) }));
}

const dentro = (p, r, margine = 0) => p.x >= r.x - margine && p.x <= r.x + r.w + margine && p.y >= r.y - margine && p.y <= r.y + r.h + margine;

test('i disegni dei Vizi sono nel catalogo, nella misura giusta, e escono uguali a ogni avvio', () => {
  assert.deepEqual(Object.keys(DISEGNI_VIZI).sort(), ['calma', 'moneta-oro']);
  assert.deepEqual([DISEGNI['moneta-oro'].w, DISEGNI['moneta-oro'].h], [MONETA_ORO_SIZE.w, MONETA_ORO_SIZE.h]);
  assert.deepEqual([DISEGNI.calma.w, DISEGNI.calma.h], [CALMA_SIZE.w, CALMA_SIZE.h]);
  for (const key of Object.keys(DISEGNI_VIZI)) {
    const primo = record(key, DISEGNI[key]);
    assert.ok(primo.calls > 50, `${key} non disegna quasi niente`);
    const secondo = record(key, DISEGNI[key]);
    assert.equal(`${secondo.calls}:${secondo.digest}`, `${primo.calls}:${primo.digest}`, `${key} cambia da un avvio all'altro`);
  }
  assert.notEqual(record('moneta-oro', DISEGNI['moneta-oro']).digest, record('moneta', DISEGNI.moneta).digest, 'lo Yen d’oro è uguale allo Yen');
});

test('i disegni dei Vizi non usano Math.random', (t) => {
  t.mock.method(Math, 'random', () => {
    throw new Error('Math.random in un disegno dei Vizi');
  });
  for (const key of Object.keys(DISEGNI_VIZI)) record(key, DISEGNI[key]);
});

test('i numeri dei riscontri dei Vizi: lo Yen d’oro cade, sosta e vola; la calma respira tra due trasparenze', () => {
  const { yenDOro, calma } = RISCONTRI.vizi;
  for (const campo of ['entra', 'cade', 'sosta', 'vola', 'scintilla']) assert.ok(yenDOro[campo] > 0, `yenDOro.${campo}`);
  assert.ok(yenDOro.cade > yenDOro.entra, 'cade mentre entra');
  assert.ok(Number.isInteger(yenDOro.giri), 'un giro intero, così la moneta atterra dritta');
  assert.ok(yenDOro.scintille >= 3);
  assert.ok(yenDOro.sopra > 0 && yenDOro.sotto >= 0, 'parte sopra i cuoricini e cade sul cuscino');
  assert.ok(yenDOro.raggio.x > 0 && yenDOro.raggio.y > 0 && yenDOro.scintillaScala.a > yenDOro.scintillaScala.da, 'le stelline si aprono');
  assert.ok(yenDOro.entraScala > 0 && yenDOro.entraScala < 1 && yenDOro.volaScala > 0 && yenDOro.volaScala < 1, 'entra e vola più piccola');
  assert.ok(calma.alpha.da > 0 && calma.alpha.da < calma.alpha.a && calma.alpha.a <= 1, 'la calma respira tra due trasparenze');
  assert.ok(calma.respiro >= 1000, 'un respiro piano');
});

test('la borsetta di Carlotta è nel suo disegno, ai piedi del Posto, e le sue monete escono da lì', () => {
  assert.deepEqual(Object.keys(CAST_PUNTI), ['carlotta']);
  assert.ok(CAST.includes('carlotta'));
  const borsa = CAST_PUNTI.carlotta.borsa;
  assert.ok(borsa.x > 0 && borsa.x < CLIENTE_SIZE.w && borsa.y > CLIENTE_SIZE.h / 2 && borsa.y < CLIENTE_SIZE.h, 'la borsetta sta nella metà bassa del disegno');
  // I piedi del peluche stanno in CLIENTE_FEET: la base del riquadro cade sullo sprite.
  const sprite = { x: 400, y: 500, scale: 0.8 };
  assert.deepEqual(puntoSulCliente(sprite, { x: CLIENTE_SIZE.w / 2, y: CLIENTE_SIZE.h }), { x: 400, y: 500 });
  const punto = puntoSulCliente(sprite, borsa);
  assert.ok(punto.x > 400 && punto.y < 500, 'la borsetta è a destra e sopra i piedi');
  const centro = { x: 1, y: 2 };
  assert.deepEqual(sorgenteMonete({ tipo: 'carlotta', sprite, centro }), punto);
  for (const tipo of ['tanuki', 'kitsune', 'maneki-neko', ...CAST.filter((id) => id !== 'carlotta')]) {
    assert.deepEqual(sorgenteMonete({ tipo, sprite, centro }), centro, `${tipo} paga dal centro`);
  }
});

test('su ogni schermo, con 3 e 4 Posti, la borsetta e lo Yen d’oro restano dentro il Posto e sopra il Bancone', () => {
  for (const schermo of SCHERMI) {
    for (const seats of [3, 4]) {
      for (const { rect, geom } of posti(schermo, seats)) {
        const nome = `${schermo.nome}, ${seats} Posti`;
        const sprite = { x: geom.cliente.x, y: geom.cliente.y, scale: geom.cliente.scale };
        const borsa = puntoSulCliente(sprite, CAST_PUNTI.carlotta.borsa);
        assert.ok(dentro(borsa, rect), `${nome}: la borsetta (${borsa.x.toFixed(0)}, ${borsa.y.toFixed(0)}) è fuori dal Posto`);
        const { da, a } = percorsoMonetaOro(geom);
        assert.ok(dentro(da, rect, 24), `${nome}: lo Yen d'oro parte fuori dal Posto`);
        assert.ok(dentro(a, rect), `${nome}: lo Yen d'oro cade fuori dal Posto`);
        assert.ok(a.y > da.y, `${nome}: lo Yen d'oro non cade`);
        assert.ok(a.y <= rect.y + rect.h, `${nome}: lo Yen d'oro cade sotto il Posto`);
      }
    }
  }
});

test('l’ovale di calma copre la fila dei cuoricini senza uscire dal Posto, con 5 e con 6 cuoricini', () => {
  const { margine } = RISCONTRI.vizi.calma;
  for (const schermo of SCHERMI) {
    for (const seats of [3, 4]) {
      for (const { rect, geom } of posti(schermo, seats)) {
        const nome = `${schermo.nome}, ${seats} Posti`;
        for (const larghezza of [geom.cuori.rect.w, geom.cuori.rect.w * 1.2]) {
          // Con 6 cuoricini la fila è più larga (ma non esce mai dal Posto: lo garantisce il layout dei cuoricini).
          const fila = { ...geom.cuori.rect, w: Math.min(larghezza, rect.w) };
          fila.x = rect.x + rect.w / 2 - fila.w / 2;
          const c = rettangoloCalma(fila, rect, margine);
          const meta = (244 * c.scalaX) / 2;
          assert.ok(c.x - meta >= rect.x - 1e-6 && c.x + meta <= rect.x + rect.w + 1e-6, `${nome}: l'ovale esce dal Posto`);
          assert.ok(244 * c.scalaX >= fila.w - 1e-6, `${nome}: l'ovale non copre la fila`);
          assert.ok(44 * c.scalaY >= fila.h, `${nome}: l'ovale è più bassa dei cuoricini`);
          assert.ok(c.origineY > 0 && c.origineY < 1);
        }
      }
    }
  }
  assert.ok(YATAI.posti.massimo >= 4);
});
