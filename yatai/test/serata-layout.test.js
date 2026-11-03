import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PAZIENZA, YATAI } from '../src/config.js';
import { CLIENTE_FEET, CLIENTE_SIZE } from '../src/disegni/clienti.js';
import { NUVOLETTA } from '../src/disegni/serata.js';
import { NO_INSETS, frameFor, safeInFrame } from '../src/layout/schermo.js';
import { layoutHud, layoutYatai, placeCliente } from '../src/layout/yatai.js';

const SCHERMI = [
  { nome: '360×640', w: 360, h: 640, insets: NO_INSETS },
  { nome: '390×844 con notch', w: 390, h: 844, insets: { top: 47, right: 0, bottom: 34, left: 0 } },
  { nome: '360×800', w: 360, h: 800, insets: { top: 28, right: 0, bottom: 20, left: 0 } },
  { nome: '375×667', w: 375, h: 667, insets: { top: 20, right: 0, bottom: 0, left: 0 } },
  { nome: 'computer 1280×720', w: 1280, h: 720, insets: NO_INSETS },
  { nome: 'estremo', w: 390, h: 844, insets: { top: 120, right: 30, bottom: 80, left: 30 } },
];

const layoutFor = (schermo, options = {}) => {
  const view = { w: schermo.w, h: schermo.h };
  const frame = frameFor(view.w, view.h);
  const safe = safeInFrame(view, frame, schermo.insets);
  return layoutYatai({ frame, safe, ...options });
};

const dentro = (a, b, msg) => {
  const eps = 1e-6;
  assert.ok(a.x >= b.x - eps && a.y >= b.y - eps && a.x + a.w <= b.x + b.w + eps && a.y + a.h <= b.y + b.h + eps, `${msg}: esce dalla fascia (${JSON.stringify(a)} fuori da ${JSON.stringify(b)})`);
};

test('il Cliente al Posto: nuvoletta, cuoricini e Cliente stanno nella fascia, uno sopra l’altro senza toccarsi', () => {
  for (const schermo of SCHERMI) {
    for (const rect of layoutFor(schermo, { seats: 4 }).posti) {
      const p = placeCliente(rect, CLIENTE_SIZE, CLIENTE_FEET);
      dentro(p.nuvoletta, rect, `${schermo.nome}: nuvoletta`);
      dentro(p.cuori.rect, rect, `${schermo.nome}: cuoricini`);
      assert.ok(p.nuvoletta.y + p.nuvoletta.h <= p.cuori.rect.y + 1e-6, `${schermo.nome}: i cuoricini toccano la nuvoletta`);
      const testa = p.piedi.y - CLIENTE_FEET.y * p.cliente.scale;
      assert.ok(p.cuori.rect.y + p.cuori.rect.h <= testa + 1e-6, `${schermo.nome}: i cuoricini toccano il Cliente`);
      assert.ok(testa >= rect.y, `${schermo.nome}: il Cliente esce in alto`);
      assert.ok(p.cliente.scale > 0.4 && p.cliente.scale <= 1, `${schermo.nome}: scala ${p.cliente.scale}`);
      const larghezza = CLIENTE_SIZE.w * p.cliente.scale;
      assert.ok(larghezza <= rect.w + 1e-6, `${schermo.nome}: il Cliente è più largo del Posto`);
    }
  }
});

test('il Cliente siede sullo sgabello: i piedi sono a una distanza fissa dal fondo del Posto', () => {
  const [rect] = layoutFor(SCHERMI[0]).posti;
  const p = placeCliente(rect, CLIENTE_SIZE, CLIENTE_FEET);
  assert.equal(p.piedi.y, rect.y + rect.h - YATAI.cliente.sedutoDalFondo);
  assert.equal(p.cliente.x, rect.x + rect.w / 2);
  // L'origine è in basso: il fondo del disegno sta sotto i piedi di quanto il disegno ha sotto i piedi.
  assert.ok(Math.abs(p.cliente.y - (p.piedi.y + (CLIENTE_SIZE.h - CLIENTE_FEET.y) * p.cliente.scale)) < 1e-9);
});

test('ci sono cinque cuoricini, in fila, centrati sul Posto e mai più larghi del Posto', () => {
  for (const schermo of SCHERMI) {
    const [rect] = layoutFor(schermo, { seats: 4 }).posti;
    const { cuori } = placeCliente(rect, CLIENTE_SIZE, CLIENTE_FEET);
    assert.equal(cuori.centri.length, PAZIENZA.hearts);
    for (let i = 1; i < cuori.centri.length; i++) assert.ok(cuori.centri[i].x > cuori.centri[i - 1].x);
    assert.ok(cuori.rect.w <= rect.w, `${schermo.nome}: cuoricini larghi ${cuori.rect.w}`);
    const media = cuori.centri.reduce((s, c) => s + c.x, 0) / cuori.centri.length;
    assert.ok(Math.abs(media - (rect.x + rect.w / 2)) < 1e-6);
  }
});

test('la nuvoletta ha la forma del disegno e l’icona di un Ordine da tre ci sta', () => {
  const [rect] = layoutFor(SCHERMI[0], { seats: 4 }).posti;
  const { nuvoletta } = placeCliente(rect, CLIENTE_SIZE, CLIENTE_FEET);
  const scala = Math.min(nuvoletta.w / NUVOLETTA.w, nuvoletta.h / NUVOLETTA.h);
  const corpo = { w: NUVOLETTA.corpo.w * scala, h: NUVOLETTA.corpo.h * scala };
  // Tre icone una accanto all'altra: ognuna di almeno 40 px di gioco (20 px CSS sul telefono più piccolo).
  assert.ok(corpo.w / 3 >= 40, `icona larga ${corpo.w / 3}`);
  assert.ok(corpo.h >= 40, `corpo alto ${corpo.h}`);
});

test('la fascia in alto: Incasso a sinistra, tempo a destra, barra con tre stelle sotto, tutto dentro', () => {
  for (const schermo of SCHERMI) {
    const layout = layoutFor(schermo);
    const hud = layout.zone.hud;
    const h = layoutHud(hud, [0.625, 0.8125, 1]);
    assert.equal(h.stelle.length, 3);
    dentro({ x: h.moneta.x - h.moneta.lato / 2, y: h.moneta.y - h.moneta.lato / 2, w: h.moneta.lato, h: h.moneta.lato }, hud, `${schermo.nome}: moneta`);
    dentro(h.barra, hud, `${schermo.nome}: barra`);
    for (const s of h.stelle) dentro({ x: s.x - s.lato / 2, y: s.y - s.lato / 2, w: s.lato, h: s.lato }, hud, `${schermo.nome}: stella`);
    assert.ok(h.incasso.x > h.moneta.x && h.tempo.x > h.incasso.x);
    // La riga alta non tocca la riga delle stelle.
    assert.ok(h.stelle[0].y - h.stelle[0].lato / 2 >= hud.y + YATAI.hud.rigaAlta - 1e-6);
    // Le stelle seguono le frazioni e l'ultima chiude la barra.
    assert.ok(h.stelle[0].x < h.stelle[1].x && h.stelle[1].x < h.stelle[2].x);
    assert.ok(Math.abs(h.stelle[2].x - (h.barra.x + h.barra.w)) < 1e-6);
  }
});
