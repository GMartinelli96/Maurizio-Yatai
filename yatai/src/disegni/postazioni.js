// Le cinque Postazioni, una per Piatto, nell'ordine in cui si sbloccano (config.js, PIATTI):
// il tagliere del riso, la piastra a 6 buchi, la macchina del ghiaccio, lo stampo a pesce e la
// pentola del brodo. Qui sono ferme e vuote: la cottura, il Fumo e il Piatto sopra arrivano coi
// passi 3, 4 e 5.
//
// Ogni disegno sta in un riquadro POSTAZIONE_SIZE e poggia sul fondo (la sua ombra a terra incluso).
// Niente bacchette, nemmeno qui: sul tagliere c'è solo la paletta del riso (shamoji).

import { PALETTE as C } from '../config.js';
import { clipTo, ellipse, pastelFill, pencilLine, restingShadow, roundedPolygon, roundedRect, smoothCurve } from '../kit/matita.js';

export const POSTAZIONE_SIZE = { w: 132, h: 152 };

const FLAT = { volume: false };
const INK = { colore: C.inchiostro, ombra: C.inchiostro, luce: '#6b5a52' };

function part(ctx, rng, shape, swatch, { fill = {}, line = {} } = {}) {
  pastelFill(ctx, shape, rng, swatch, fill);
  pencilLine(ctx, shape, rng, line);
}

// Una riga di legno a matita, per le venature.
function grainLine(ctx, rng, x, y, length, color = C.legnoScuro.ombra) {
  pencilLine(ctx, [{ x, y }, { x: x + length, y: y + rng.jitter(2) }], rng, { closed: false, width: 1.3, alpha: 0.35, color, amount: 0.6 });
}

// Il tagliere del riso (onigiri): un asse di legno con il riso fumante e la paletta.
function drawTagliere(ctx, rng) {
  restingShadow(ctx, 66, 138, 60, 11);
  part(ctx, rng, roundedRect(8, 100, 116, 34, 14), { colore: C.legnoScuro.ombra, ombra: '#8a5a2c', luce: C.legnoScuro.colore }, { fill: FLAT });
  part(ctx, rng, roundedRect(8, 84, 116, 42, 16), C.legnoScuro, { fill: { volume: true } });
  part(ctx, rng, ellipse(108, 104, 6, 4), INK, { fill: FLAT, line: { width: 2 } });
  grainLine(ctx, rng, 22, 118, 50);
  grainLine(ctx, rng, 60, 94, 36);

  const mound = smoothCurve([
    { x: 24, y: 112 }, { x: 30, y: 92 }, { x: 46, y: 76 }, { x: 66, y: 70 }, { x: 86, y: 76 },
    { x: 100, y: 92 }, { x: 106, y: 112 }, { x: 66, y: 120 },
  ]);
  part(ctx, rng, mound, C.riso);
  for (const [x, y, a] of [[50, 92, 0.4], [68, 84, -0.5], [82, 98, 0.9], [60, 106, -0.2], [92, 108, 0.3], [40, 108, 1.1]]) {
    pencilLine(ctx, ellipse(x, y, 3.4, 1.7, a), rng, { width: 1.1, color: C.riso.ombra, amount: 0.3 });
  }
  // La paletta (shamoji): la pala in avanti e il manico che sale a sinistra.
  const handle = roundedPolygon([{ x: 14, y: 76 }, { x: 22, y: 72 }, { x: 52, y: 122 }, { x: 42, y: 128 }], 4);
  part(ctx, rng, handle, C.legno, { fill: FLAT, line: { width: 2.4 } });
  part(ctx, rng, ellipse(78, 126, 24, 9, -0.2), C.legno, { fill: FLAT, line: { width: 2.6 } });
}

// La piastra dei takoyaki: ferro con 6 buchi in due file da tre e il manico di legno.
function drawPiastra(ctx, rng) {
  restingShadow(ctx, 66, 138, 60, 11);
  part(ctx, rng, roundedRect(6, 100, 116, 36, 14), C.ferro, { fill: { hatching: 0.6 } });
  part(ctx, rng, roundedRect(10, 80, 108, 48, 16), C.ferro);
  for (const y of [94, 114]) {
    for (let i = 0; i < 3; i++) {
      const hole = ellipse(32 + i * 32, y, 13, 8.5);
      part(ctx, rng, hole, { colore: C.ferro.ombra, ombra: '#34313b', luce: C.ferro.colore }, { fill: FLAT, line: { width: 2.2 } });
      pencilLine(ctx, [{ x: 24 + i * 32, y: y - 2 }, { x: 30 + i * 32, y: y - 5 }], rng, { closed: false, width: 1.6, color: C.ferro.luce, alpha: 0.8, amount: 0.3 });
    }
  }
  part(ctx, rng, roundedRect(112, 104, 18, 12, 5), C.legnoScuro, { fill: FLAT, line: { width: 2.4 } });
}

// La macchina del ghiaccio (kakigōri): un blocco di ghiaccio sopra, la manovella di lato.
function drawMacchinaGhiaccio(ctx, rng) {
  restingShadow(ctx, 66, 138, 52, 10);
  part(ctx, rng, roundedRect(22, 104, 86, 32, 12), C.celeste);
  part(ctx, rng, roundedRect(44, 64, 42, 50, 10), C.celeste, { fill: { hatching: 0.8 } });
  // La manovella: il braccio e la manopola gialla.
  pencilLine(ctx, [{ x: 86, y: 86 }, { x: 118, y: 70 }], rng, { closed: false, width: 5.5 });
  pencilLine(ctx, [{ x: 86, y: 86 }, { x: 118, y: 70 }], rng, { closed: false, width: 2.4, color: C.celeste.luce });
  part(ctx, rng, ellipse(120, 66, 8, 8), C.giallo, { fill: FLAT, line: { width: 2.2 } });
  // Il blocco di ghiaccio, con i riflessi.
  part(ctx, rng, roundedRect(34, 22, 62, 48, 14), C.ghiaccio);
  pencilLine(ctx, [{ x: 44, y: 34 }, { x: 56, y: 32 }], rng, { closed: false, width: 3.2, color: C.bianco, amount: 0.3 });
  pencilLine(ctx, [{ x: 44, y: 44 }, { x: 48, y: 43 }], rng, { closed: false, width: 3.2, color: C.bianco, amount: 0.3 });
  // La ciotolina davanti, dove cade il ghiaccio.
  const bowl = roundedPolygon([{ x: 46, y: 116 }, { x: 84, y: 116 }, { x: 78, y: 134 }, { x: 52, y: 134 }], 6);
  part(ctx, rng, bowl, C.nuvola, { fill: FLAT, line: { width: 2.4 } });
}

// Lo stampo a pesce (taiyaki): una piastra di ferro con l'impronta del pesce.
function drawStampo(ctx, rng) {
  restingShadow(ctx, 66, 138, 60, 11);
  part(ctx, rng, roundedRect(8, 100, 112, 36, 14), C.ferro, { fill: { hatching: 0.6 } });
  part(ctx, rng, roundedRect(10, 78, 108, 52, 16), C.ferro);

  // L'impronta: corpo e coda in un solo contorno, scura come il fondo dello stampo.
  const fish = smoothCurve([
    { x: 24, y: 104 }, { x: 36, y: 92 }, { x: 58, y: 89 }, { x: 78, y: 96 }, { x: 90, y: 104 },
    { x: 108, y: 90 }, { x: 108, y: 120 }, { x: 90, y: 106 }, { x: 78, y: 114 }, { x: 58, y: 119 }, { x: 36, y: 116 },
  ]);
  part(ctx, rng, fish, { colore: C.ferro.ombra, ombra: '#34313b', luce: C.ferro.colore }, { fill: FLAT, line: { width: 2.4 } });
  part(ctx, rng, ellipse(38, 101, 3.2, 3.2), C.bianco, { fill: FLAT, line: { width: 1.2 } });
  for (const x of [56, 64, 72]) {
    pencilLine(ctx, smoothCurve([{ x, y: 96 }, { x: x - 3, y: 104 }, { x, y: 112 }], { closed: false }), rng, {
      closed: false, width: 1.4, color: C.ferro.luce, alpha: 0.7, amount: 0.3,
    });
  }
  part(ctx, rng, roundedRect(112, 108, 18, 12, 5), C.legnoScuro, { fill: FLAT, line: { width: 2.4 } });
}

// La pentola del brodo (ramen): verde menta con il brodo dorato e due fili di vapore.
function drawPentola(ctx, rng) {
  restingShadow(ctx, 66, 138, 54, 10);
  // I manici ai lati.
  for (const x of [16, 116]) part(ctx, rng, ellipse(x, 104, 9, 7), C.menta, { fill: FLAT, line: { width: 2.4 } });
  part(ctx, rng, roundedRect(22, 84, 88, 52, 20), C.menta);
  // Il bordo e il brodo dentro. Il corpo della pentola sta sotto il bordo.
  part(ctx, rng, ellipse(66, 84, 44, 13), C.menta, { fill: FLAT });
  ctx.save();
  const inside = ellipse(66, 85, 36, 8.5);
  clipTo(ctx, inside);
  pastelFill(ctx, inside, rng, C.brodo, FLAT);
  ctx.restore();
  pencilLine(ctx, inside, rng, { width: 2.2 });
  // Il vapore.
  for (const [x, top] of [[48, 40], [66, 28], [84, 42]]) {
    pencilLine(ctx, smoothCurve([{ x, y: 70 }, { x: x - 7, y: 58 }, { x: x + 6, y: 48 }, { x: x - 2, y: top }], { closed: false }), rng, {
      closed: false, width: 3.2, color: '#b9aea4', alpha: 0.75, amount: 0.8,
    });
  }
}

// In ordine di sblocco, con la chiave del Piatto di config.js (PIATTI).
export const POSTAZIONI = {
  onigiri: drawTagliere,
  takoyaki: drawPiastra,
  kakigori: drawMacchinaGhiaccio,
  taiyaki: drawStampo,
  ramen: drawPentola,
};

export const postazioneKey = (piatto) => `postazione-${piatto}`;
