// Maurizio, l'orsetto di peluche: pelo color nocciola, muso chiaro, salopette azzurra con
// l'arcobaleno sulla pettorina (com'è il peluche vero e com'è nel Picchiaduro).
// Visto di fronte, in piedi. Le misure sono in pixel di gioco, dentro un riquadro 320×450.

import { PALETTE as C } from '../config.js';
import {
  FUR_LINE, clipTo, ellipse, fur, pastelFill, pencilLine, roundedPolygon, roundedRect, smoothCurve,
} from '../kit/matita.js';

export const MAURIZIO_SIZE = { w: 320, h: 450 };

// Le pose di Maurizio. Cambiano solo le braccia, gli occhi e la bocca: il resto è lo stesso
// disegno, così le pose si alternano senza che Maurizio sembri un altro.
//   riposo: in piedi, braccia lungo i fianchi;
//   lavora: le zampine alzate davanti al petto, mentre cucina;
//   evviva: braccia in alto, occhi felici e bocca aperta, quando serve un Cliente.
// Per ogni braccio: dx = distanza dal centro, y = altezza, rx/ry = misure, giro = inclinazione
// (positiva: la zampina va verso l'esterno).
export const POSE = {
  riposo: { braccio: { dx: 100, y: 298, rx: 25, ry: 45, giro: -0.6 }, occhi: 'aperti', bocca: 'sorriso' },
  lavora: { braccio: { dx: 92, y: 276, rx: 24, ry: 43, giro: -0.3 }, occhi: 'aperti', bocca: 'piccola' },
  evviva: { braccio: { dx: 104, y: 208, rx: 24, ry: 47, giro: 0.42 }, occhi: 'felici', bocca: 'aperta' },
};

// La chiave della texture di una posa: `maurizio` è quella a riposo.
export const maurizioKey = (posa) => (posa === 'riposo' ? 'maurizio' : `maurizio-${posa}`);

// Il punto d'appoggio dei piedi, per metterci sotto l'ombra.
export const MAURIZIO_FEET = { x: 160, y: 432 };

const WAIST = 304;

function plushPart(ctx, shape, rng, swatch, keep) {
  pastelFill(ctx, shape, rng, swatch);
  fur(ctx, shape, rng, swatch, { keep });
  pencilLine(ctx, shape, rng, FUR_LINE);
}

export function drawMaurizio(ctx, rng, posa = 'riposo') {
  const pose = POSE[posa];
  // I piedi: le gambe le copre la salopette.
  for (const x of [114, 206]) {
    plushPart(ctx, ellipse(x, 406, 40, 30), rng, C.pelo, (p) => p.y > 400);
  }

  const body = smoothCurve([
    { x: 160, y: 212 }, { x: 222, y: 230 }, { x: 246, y: 300 }, { x: 240, y: 368 },
    { x: 200, y: 402 }, { x: 160, y: 396 }, { x: 120, y: 402 }, { x: 80, y: 368 },
    { x: 74, y: 300 }, { x: 98, y: 230 },
  ]);
  pastelFill(ctx, body, rng, C.pelo);

  // La salopette: pettorina e pantaloni, ritagliati dentro il corpo.
  ctx.save();
  clipTo(ctx, body);
  const overalls = roundedPolygon([
    { x: 118, y: 254 }, { x: 202, y: 254 }, { x: 202, y: WAIST }, { x: 280, y: WAIST },
    { x: 280, y: 470 }, { x: 40, y: 470 }, { x: 40, y: WAIST }, { x: 118, y: WAIST },
  ], 12);
  pastelFill(ctx, overalls, rng, C.salopette);
  const trims = [roundedRect(118, 254, 84, 13, 6), roundedRect(40, 370, 240, 13, 4)];
  for (const trim of trims) {
    pastelFill(ctx, trim, rng, C.bordino, { volume: false });
    pencilLine(ctx, trim, rng, { width: 2.2 });
  }
  pencilLine(ctx, overalls, rng);
  ctx.restore();
  fur(ctx, body, rng, C.pelo, { keep: (p) => p.y < WAIST - 6 });
  pencilLine(ctx, body, rng, FUR_LINE);

  // L'arcobaleno sulla pettorina.
  const patch = roundedRect(140, 274, 40, 26, 8);
  pastelFill(ctx, patch, rng, { colore: C.bianco, ombra: C.riso.ombra, luce: C.bianco }, { volume: false, hatching: 0.5 });
  C.arcobaleno.forEach((colore, i) => {
    const r = 15 - i * 2.6;
    const arc = [];
    for (let k = 0; k <= 12; k++) {
      const a = Math.PI + (k / 12) * Math.PI;
      arc.push({ x: 160 + Math.cos(a) * r, y: 296 + Math.sin(a) * r * 0.95 });
    }
    pencilLine(ctx, arc, rng, { closed: false, color: colore, width: 2.6, amount: 0.4 });
  });
  pencilLine(ctx, patch, rng, { width: 2.2 });

  // Le bretelle, con i bottoni.
  for (const side of [-1, 1]) {
    const strap = roundedPolygon([
      { x: 160 + side * 30, y: 262 }, { x: 160 + side * 42, y: 262 },
      { x: 160 + side * 66, y: 222 }, { x: 160 + side * 50, y: 216 },
    ], 4);
    pastelFill(ctx, strap, rng, C.salopette, { volume: false });
    pencilLine(ctx, strap, rng, { width: 2.6 });
    const button = ellipse(160 + side * 36, 266, 6, 6);
    pastelFill(ctx, button, rng, C.giallo, { volume: false });
    pencilLine(ctx, button, rng, { width: 2 });
  }

  // Le braccia, corte e un po' aperte: partono dalle spalle e le zampine escono dal corpo.
  const arm = pose.braccio;
  for (const side of [-1, 1]) {
    plushPart(ctx, ellipse(160 + side * arm.dx, arm.y, arm.rx, arm.ry, side * arm.giro), rng, C.pelo);
  }

  // Le orecchie, poi la testa che le copre a metà.
  for (const side of [-1, 1]) {
    plushPart(ctx, ellipse(160 + side * 86, 72, 42, 40), rng, C.pelo);
    const inner = ellipse(160 + side * 80, 78, 24, 22);
    pastelFill(ctx, inner, rng, C.orecchioDentro);
    pencilLine(ctx, inner, rng, { width: 2.4 });
  }
  plushPart(ctx, ellipse(160, 146, 114, 98), rng, C.pelo);

  // Il muso, il naso e la bocca.
  const muzzle = ellipse(160, 186, 52, 40);
  pastelFill(ctx, muzzle, rng, C.muso);
  pencilLine(ctx, muzzle, rng);
  const nose = roundedPolygon([{ x: 141, y: 162 }, { x: 179, y: 162 }, { x: 160, y: 183 }], 9);
  pastelFill(ctx, nose, rng, { colore: C.inchiostro, ombra: C.inchiostro, luce: '#6b5a52' }, { volume: false });
  pencilLine(ctx, nose, rng, { width: 2.4 });
  pastelFill(ctx, ellipse(152, 167, 5.5, 3.2, -0.3), rng, { colore: C.bianco, ombra: C.bianco, luce: C.bianco }, { volume: false, alpha: 0.85, hatching: 0 });
  if (pose.bocca === 'sorriso') {
    pencilLine(ctx, smoothCurve([
      { x: 145, y: 197 }, { x: 152, y: 203 }, { x: 160, y: 196 }, { x: 168, y: 203 }, { x: 175, y: 197 },
    ], { closed: false }), rng, { closed: false, width: 2.8 });
    pencilLine(ctx, [{ x: 160, y: 183 }, { x: 160, y: 196 }], rng, { closed: false, width: 2.8 });
  } else {
    // Bocca aperta: un ovale scuro con la lingua rosa. Più grande quando Maurizio esulta.
    const big = pose.bocca === 'aperta';
    const mouth = ellipse(160, big ? 208 : 204, big ? 15 : 8, big ? 11 : 6.5);
    pastelFill(ctx, mouth, rng, { colore: C.inchiostro, ombra: C.inchiostro, luce: '#6b5a52' }, { volume: false, hatching: 0.4 });
    if (big) pastelFill(ctx, ellipse(160, 213, 8.5, 5), rng, { colore: C.rosa.colore, ombra: C.rosa.ombra, luce: C.rosa.luce }, { volume: false, hatching: 0 });
    pencilLine(ctx, mouth, rng, { width: 2.4 });
    pencilLine(ctx, [{ x: 160, y: 183 }, { x: 160, y: big ? 193 : 197 }], rng, { closed: false, width: 2.8 });
  }

  // Gli occhi, con il riflesso. Da felice sono due archetti all'insù, come quando si sorride a occhi chiusi.
  for (const side of [-1, 1]) {
    if (pose.occhi === 'felici') {
      const cx = 160 + side * 47;
      pencilLine(ctx, smoothCurve([{ x: cx - 11, y: 138 }, { x: cx, y: 124 }, { x: cx + 11, y: 138 }], { closed: false }), rng, { closed: false, width: 4 });
      continue;
    }
    const eye = ellipse(160 + side * 47, 134, 9, 11.5);
    pastelFill(ctx, eye, rng, { colore: C.inchiostro, ombra: C.inchiostro, luce: '#6b5a52' }, { volume: false, hatching: 0.5 });
    pencilLine(ctx, eye, rng, { width: 2 });
    pastelFill(ctx, ellipse(160 + side * 47 + 3, 129.5, 3.2, 3.2), rng, { colore: C.bianco, ombra: C.bianco, luce: C.bianco }, { volume: false, hatching: 0 });
  }

  // Le guance rosa, a pastello leggero e senza contorno.
  for (const side of [-1, 1]) {
    pastelFill(ctx, ellipse(160 + side * 70, 180, 20, 12), rng, { colore: C.guance, ombra: C.guance, luce: C.bianco }, { volume: false, alpha: 0.5 });
  }
}
