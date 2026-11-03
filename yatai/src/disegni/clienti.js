// I Clienti di passaggio: tanuki, kitsune e maneki-neko, a tema giapponese e senza Vizio
// (GLOSSARY.md). Peluche visti di fronte, seduti, con la testa grande come Maurizio.
// Regole di disegno da docs/ricerca/piatti-e-matsuri.md, sezione 7:
//   - tanuki: cane procione, non procione. Niente coda ad anelli, niente mascherina, niente sakè.
//     Ha il pancione, le orecchie scure e la foglia in testa con cui si trasforma nelle fiabe;
//   - kitsune: la volpe messaggera di Inari, gentile. Ha il bavaglino rosso come le statue
//     dei santuari e non sta dentro un santuario;
//   - maneki-neko: gatto bianco e macchiato con la zampa alzata, il collare con il campanello
//     e il koban d'oro in grembo. Le storie sull'origine non c'entrano: qui è solo disegnato.
//
// Tutti e tre stanno nello stesso riquadro (CLIENTE_SIZE) e appoggiano i piedi nello stesso
// punto (CLIENTE_FEET): la scena li mette ai Posti tutti allo stesso modo, con la stessa ombra.
// Ognuno ha quattro espressioni, una texture per espressione (il Lamento, GAME_SPEC.md: la faccia
// segue i cuoricini di Pazienza rimasti):
//   neutra       in attesa, con 5, 4 o 3 cuoricini;
//   perplessa    2 cuoricini: occhi tondi, sopracciglia storte, guance gonfie, bocca a onda;
//   imbronciata  1 cuoricino, e resta tale quando la Pazienza è finita e se ne va senza pagare;
//   contenta     servito.
// Il corpo ha il tremolio dello stesso seme in tutte e quattro: cambia solo la faccia, così
// scambiando l'espressione il peluche non "salta".
// Il Lamento è scocciato ma buffo, mai arrabbiato: niente occhi rabbiosi, denti o venuzze. L'unica
// eccezione è la venetta rossa dell'imbronciata approvata (ticket 04), che non si tocca; la perplessa
// non ce l'ha. La goccia e lo sbuffo che accompagnano le facce non sono qui: li disegna la vista.

import { PALETTE as C, STILE } from '../config.js';
import {
  FUR_LINE, clipTo, ellipse, fur, grain, pastelFill, pencilLine, roundedPolygon, smoothCurve,
} from '../kit/matita.js';
import { createRng } from '../kit/rng.js';

export const CLIENTE_SIZE = { w: 260, h: 320 };

// Il punto d'appoggio dei piedi, per metterci sotto l'ombra.
export const CLIENTE_FEET = { x: 130, y: 304 };

export const CLIENTI = ['tanuki', 'kitsune', 'maneki-neko'];
export const ESPRESSIONI = ['neutra', 'perplessa', 'imbronciata', 'contenta'];

export const clienteKey = (cliente, espressione) => `cliente-${cliente}-${espressione}`;

// Colori dei soli Clienti di passaggio, nello stesso formato dei campioni di PALETTE.
const K = {
  tanuki: { colore: '#a4896f', ombra: '#76594a', luce: '#d0b9a2' },
  scuro: { colore: '#5f4639', ombra: '#3e2c24', luce: '#876a5a' },
  volpe: { colore: '#f2a257', ombra: '#c97430', luce: '#fbd3a0' },
  gatto: { colore: '#f5b469', ombra: '#cf8a3c', luce: '#fcd9a6' },
  macchia: { colore: '#5a4a46', ombra: '#3a2f2b', luce: '#82716a' },
  foglia: { colore: '#8fcf86', ombra: '#5ea35a', luce: '#c7ebbf' },
  rosso: { colore: '#e8706a', ombra: '#b9453f', luce: '#f7aca6' },
  oro: { colore: '#f7d26a', ombra: '#cf9e30', luce: '#fdedb8' },
  rosa: { colore: '#f6b3bf', ombra: '#dc7f93', luce: '#fde0e6' },
};

const dark = { colore: C.inchiostro, ombra: C.inchiostro, luce: '#6b5a52' };
const white = { colore: C.bianco, ombra: C.bianco, luce: C.bianco };

// ---------------------------------------------------------------------------------------------
// Pezzi comuni

function plush(ctx, shape, rng, swatch, keep) {
  pastelFill(ctx, shape, rng, swatch);
  fur(ctx, shape, rng, swatch, { keep });
  pencilLine(ctx, shape, rng, FUR_LINE);
}

// Una macchia di colore che resta dentro `host`, senza contorno: pastello e basta.
function patch(ctx, host, shape, rng, swatch) {
  ctx.save();
  clipTo(ctx, host);
  pastelFill(ctx, shape, rng, swatch, { volume: false, hatching: 0.7 });
  ctx.restore();
}

function mirror(points, axis = CLIENTE_SIZE.w / 2) {
  return points.map((p) => ({ x: 2 * axis - p.x, y: p.y }));
}

function rotate(points, cx, cy, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return points.map((p) => ({
    x: cx + (p.x - cx) * cos - (p.y - cy) * sin,
    y: cy + (p.x - cx) * sin + (p.y - cy) * cos,
  }));
}

// Gli occhi, le guance e la bocca. `muso` dice dove stanno: x del centro, y degli occhi, mezza
// distanza tra gli occhi, y della bocca sotto il naso. Il naso lo disegna ogni animale.
function faccia(ctx, rng, espressione, { x = 130, occhiY, occhiDx, boccaY, tilt = 0, guanceY = occhiY + 28, guanceDx = occhiDx + 24 }) {
  const ink = { color: C.inchiostro };
  const perplessa = espressione === 'perplessa';
  for (const side of [-1, 1]) {
    const ex = x + side * occhiDx;
    if (espressione === 'contenta') {
      // Occhi chiusi, due archetti: ^ ^
      const arc = smoothCurve([{ x: ex - 10, y: occhiY + 4 }, { x: ex, y: occhiY - 7 }, { x: ex + 10, y: occhiY + 4 }], { closed: false });
      pencilLine(ctx, arc, rng, { closed: false, width: 3.6, amount: 0.5, ...ink });
    } else if (perplessa) {
      // Occhi tondi e un po' in su, come chi si chiede "boh?"; le sopracciglia storte: la destra più alta,
      // con l'estremo vicino al naso in su (un dubbio, non un'arrabbiatura).
      const eye = ellipse(ex, occhiY, 8.5, 10.5, side * tilt);
      pastelFill(ctx, eye, rng, dark, { volume: false, hatching: 0.5 });
      pencilLine(ctx, eye, rng, { width: 2 });
      pastelFill(ctx, ellipse(ex + 3.5, occhiY - 4, 3, 3), rng, white, { volume: false, hatching: 0 });
      const su = side > 0 ? 5 : 0;
      pencilLine(ctx, smoothCurve([
        { x: ex + side * 13, y: occhiY - 15 - su }, { x: ex, y: occhiY - 22 - su }, { x: ex - side * 9, y: occhiY - 23 - su },
      ], { closed: false }), rng, { closed: false, width: 3.6, amount: 0.5, ...ink });
    } else {
      const imbronciata = espressione === 'imbronciata';
      const eye = ellipse(ex, occhiY + (imbronciata ? 2 : 0), imbronciata ? 8 : 9, imbronciata ? 8.5 : 11.5, side * tilt);
      pastelFill(ctx, eye, rng, dark, { volume: false, hatching: 0.5 });
      pencilLine(ctx, eye, rng, { width: 2 });
      pastelFill(ctx, ellipse(ex + 3, occhiY - (imbronciata ? 1.5 : 4.5), 3, 3), rng, white, { volume: false, hatching: 0 });
      if (imbronciata) {
        // Le sopracciglia basse verso il centro: un muso, non un cattivo.
        pencilLine(ctx, [
          { x: ex + side * 13, y: occhiY - 21 }, { x: ex - side * 9, y: occhiY - 10 },
        ], rng, { closed: false, width: 4, amount: 0.5, ...ink });
      }
    }
  }
  // Le guance: più accese quando è contento.
  const blush = { colore: C.guance, ombra: C.guance, luce: C.bianco };
  for (const side of [-1, 1]) {
    // Nella perplessa le guance sono un po' più gonfie.
    pastelFill(ctx, ellipse(x + side * guanceDx, guanceY, perplessa ? 22 : 19, perplessa ? 13.5 : 11.5), rng, blush, {
      volume: false, alpha: espressione === 'contenta' ? 0.75 : espressione === 'imbronciata' ? 0.6 : perplessa ? 0.55 : 0.45,
    });
  }
  // La bocca: due archetti sotto il naso, un arco all'ingiù, un sorriso aperto.
  const mouth = { closed: false, width: 2.8 };
  if (espressione === 'contenta') {
    const open = smoothCurve([
      { x: x - 13, y: boccaY - 2 }, { x: x, y: boccaY + 1 }, { x: x + 13, y: boccaY - 2 },
      { x: x + 8, y: boccaY + 12 }, { x, y: boccaY + 15 }, { x: x - 8, y: boccaY + 12 },
    ]);
    pastelFill(ctx, open, rng, { colore: '#7a3b3b', ombra: '#5a2a2a', luce: '#9a4f4f' }, { volume: false, hatching: 0 });
    pastelFill(ctx, ellipse(x, boccaY + 11, 5.5, 3.2), rng, { colore: '#f08a98', ombra: '#f08a98', luce: '#f08a98' }, { volume: false, hatching: 0 });
    pencilLine(ctx, open, rng, { width: 2.4 });
  } else if (espressione === 'imbronciata') {
    pencilLine(ctx, smoothCurve([{ x: x - 11, y: boccaY + 6 }, { x, y: boccaY - 3 }, { x: x + 11, y: boccaY + 6 }], { closed: false }), rng, mouth);
  } else if (perplessa) {
    // Una bocca a onda: ~
    pencilLine(ctx, smoothCurve([
      { x: x - 14, y: boccaY + 3 }, { x: x - 7, y: boccaY - 2 }, { x, y: boccaY + 3 }, { x: x + 7, y: boccaY + 8 }, { x: x + 14, y: boccaY + 3 },
    ], { closed: false }), rng, mouth);
  } else {
    pencilLine(ctx, smoothCurve([
      { x: x - 9, y: boccaY - 2 }, { x: x - 4.5, y: boccaY + 4 }, { x, y: boccaY - 1 }, { x: x + 4.5, y: boccaY + 4 }, { x: x + 9, y: boccaY - 2 },
    ], { closed: false }), rng, mouth);
  }
}

// Il segno di rabbia dei fumetti: quattro angolini rossi intorno a un centro. Solo imbronciata.
function venetta(ctx, rng, x, y) {
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      const corner = smoothCurve([
        { x: x + sx * 4, y: y + sy * 14 }, { x: x + sx * 5, y: y + sy * 6 }, { x: x + sx * 14, y: y + sy * 4 },
      ], { closed: false });
      pencilLine(ctx, corner, rng, { closed: false, width: 3.4, amount: 0.4, color: '#d9534f' });
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Tanuki

function drawTanuki(ctx, body, face, espressione) {
  // La coda folta e senza anelli, con la punta scura, dietro.
  const tail = ellipse(212, 256, 30, 50, 0.5);
  pastelFill(ctx, tail, body, K.tanuki);
  patch(ctx, tail, ellipse(232, 220, 24, 20), body, K.scuro);
  fur(ctx, tail, body, K.tanuki);
  pencilLine(ctx, tail, body, FUR_LINE);
  // Le orecchie piccole e scure, basse sui lati della testa.
  for (const side of [-1, 1]) {
    plush(ctx, ellipse(130 + side * 70, 52, 20, 19), body, K.scuro);
  }
  // Il pancione.
  const trunk = ellipse(130, 232, 76, 74);
  plush(ctx, trunk, body, K.tanuki, (p) => p.y < 270);
  const belly = ellipse(130, 246, 52, 50);
  pastelFill(ctx, belly, body, C.muso);
  pencilLine(ctx, belly, body, { width: 2.8 });
  // Le braccia e i piedi scuri.
  for (const side of [-1, 1]) {
    plush(ctx, ellipse(130 + side * 76, 232, 17, 34, side * 0.3), body, K.scuro);
    plush(ctx, ellipse(130 + side * 40, 298, 31, 17), body, K.scuro, (p) => p.y > 296);
  }
  // La testa larga, con i ciuffi sulle guance, il muso chiaro e il naso.
  const right = [
    { x: 130, y: 36 }, { x: 184, y: 42 }, { x: 218, y: 74 }, { x: 228, y: 104 },
    { x: 246, y: 124 }, { x: 218, y: 134 }, { x: 196, y: 156 }, { x: 130, y: 168 },
  ];
  plush(ctx, smoothCurve([...right, ...mirror(right).reverse().slice(1, -1)], { perSegment: 8 }), body, K.tanuki);
  const muzzle = ellipse(130, 130, 44, 30);
  pastelFill(ctx, muzzle, body, C.muso);
  pencilLine(ctx, muzzle, body, { width: 2.6 });
  const nose = roundedPolygon([{ x: 115, y: 107 }, { x: 145, y: 107 }, { x: 130, y: 125 }], 8);
  pastelFill(ctx, nose, face, dark, { volume: false });
  pencilLine(ctx, nose, face, { width: 2.2 });
  pencilLine(ctx, [{ x: 130, y: 124 }, { x: 130, y: 133 }], face, { closed: false, width: 2.6 });
  faccia(ctx, face, espressione, { occhiY: 94, occhiDx: 48, boccaY: 135, guanceY: 126, guanceDx: 72 });
  // La foglia in testa, con cui il tanuki si trasforma nelle fiabe.
  const leafPoints = rotate(roundedPolygon([{ x: 130, y: 6 }, { x: 150, y: 32 }, { x: 130, y: 56 }, { x: 110, y: 32 }], 11), 130, 56, 0.28);
  pastelFill(ctx, leafPoints, body, K.foglia);
  pencilLine(ctx, leafPoints, body, { width: 2.8 });
  pencilLine(ctx, rotate([{ x: 130, y: 54 }, { x: 130, y: 16 }], 130, 56, 0.28), body, { closed: false, width: 2, amount: 0.4 });
}

// ---------------------------------------------------------------------------------------------
// Kitsune

function drawKitsune(ctx, body, face, espressione) {
  // La coda grande con la punta bianca, dietro.
  const tail = smoothCurve([
    { x: 176, y: 288 }, { x: 222, y: 262 }, { x: 246, y: 206 }, { x: 240, y: 150 },
    { x: 218, y: 172 }, { x: 208, y: 224 }, { x: 170, y: 262 },
  ]);
  pastelFill(ctx, tail, body, K.volpe);
  patch(ctx, tail, ellipse(236, 150, 34, 32), body, C.riso);
  fur(ctx, tail, body, K.volpe);
  pencilLine(ctx, tail, body, FUR_LINE);

  // Le orecchie a punta, con il dentro scuro.
  for (const side of [-1, 1]) {
    const f = (pts) => (side < 0 ? pts : mirror(pts));
    const ear = roundedPolygon(f([{ x: 52, y: 80 }, { x: 62, y: 4 }, { x: 114, y: 44 }]), 9);
    plush(ctx, ear, body, K.volpe);
    const inner = roundedPolygon(f([{ x: 66, y: 66 }, { x: 70, y: 28 }, { x: 98, y: 48 }]), 5);
    pastelFill(ctx, inner, body, K.scuro, { volume: false });
    pencilLine(ctx, inner, body, { width: 2.2 });
  }

  // Il corpo snello, con il petto bianco.
  const trunk = ellipse(130, 240, 62, 66);
  plush(ctx, trunk, body, K.volpe, (p) => p.y < 270);
  const chest = ellipse(130, 246, 34, 52);
  pastelFill(ctx, chest, body, C.riso);
  pencilLine(ctx, chest, body, { width: 2.6 });
  // Le zampe scure, come calzini.
  for (const side of [-1, 1]) {
    plush(ctx, ellipse(130 + side * 62, 240, 15, 31, side * 0.12), body, K.scuro);
    plush(ctx, ellipse(130 + side * 36, 298, 27, 16), body, K.scuro, (p) => p.y > 296);
  }

  // La testa, con i ciuffi sulle guance.
  const right = [
    { x: 130, y: 30 }, { x: 178, y: 38 }, { x: 212, y: 72 }, { x: 222, y: 108 },
    { x: 240, y: 132 }, { x: 212, y: 138 }, { x: 188, y: 162 }, { x: 130, y: 176 },
  ];
  const head = smoothCurve([...right, ...mirror(right).reverse().slice(1, -1)], { perSegment: 8 });
  pastelFill(ctx, head, body, K.volpe);
  patch(ctx, head, ellipse(130, 140, 50, 36), body, C.riso);
  for (const side of [-1, 1]) patch(ctx, head, ellipse(130 + side * 78, 142, 46, 24, side * 0.3), body, C.riso);
  fur(ctx, head, body, K.volpe);
  pencilLine(ctx, head, body, FUR_LINE);
  const nose = roundedPolygon([{ x: 121, y: 112 }, { x: 139, y: 112 }, { x: 130, y: 123 }], 5);
  pastelFill(ctx, nose, face, dark, { volume: false });
  pencilLine(ctx, nose, face, { width: 2.2 });
  pencilLine(ctx, [{ x: 130, y: 122 }, { x: 130, y: 131 }], face, { closed: false, width: 2.6 });
  faccia(ctx, face, espressione, { occhiY: 98, occhiDx: 42, boccaY: 133, tilt: 0.18, guanceY: 124, guanceDx: 62 });

  // Il bavaglino rosso delle volpi di Inari, con un bottoncino d'oro.
  const bib = roundedPolygon([{ x: 92, y: 164 }, { x: 168, y: 164 }, { x: 130, y: 214 }], 9);
  pastelFill(ctx, bib, body, K.rosso, { volume: false });
  pencilLine(ctx, bib, body, { width: 2.8 });
  const bell = ellipse(130, 188, 8, 8);
  pastelFill(ctx, bell, body, K.oro, { volume: false });
  pencilLine(ctx, bell, body, { width: 2 });
}

// ---------------------------------------------------------------------------------------------
// Maneki-neko

function drawManeki(ctx, body, face, espressione) {
  // La coda arricciata, dietro.
  plush(ctx, ellipse(214, 276, 16, 32, 0.6), body, C.riso);

  // Le orecchie a punta: una arancione e una nera.
  for (const side of [-1, 1]) {
    const f = (pts) => (side < 0 ? pts : mirror(pts));
    const ear = roundedPolygon(f([{ x: 54, y: 82 }, { x: 62, y: 14 }, { x: 108, y: 46 }]), 9);
    plush(ctx, ear, body, side < 0 ? K.gatto : K.macchia);
    const inner = roundedPolygon(f([{ x: 66, y: 68 }, { x: 70, y: 36 }, { x: 94, y: 52 }]), 5);
    pastelFill(ctx, inner, body, K.rosa, { volume: false });
    pencilLine(ctx, inner, body, { width: 2.2 });
  }

  // Il corpo bianco, con una macchia nera sul fianco.
  const trunk = ellipse(130, 240, 68, 66);
  pastelFill(ctx, trunk, body, C.riso);
  patch(ctx, trunk, ellipse(198, 270, 30, 40, 0.3), body, K.macchia);
  fur(ctx, trunk, body, C.riso, { keep: (p) => p.y < 272 });
  pencilLine(ctx, trunk, body, FUR_LINE);

  // Il koban d'oro in grembo.
  const koban = ellipse(130, 252, 27, 35);
  pastelFill(ctx, koban, body, K.oro, { volume: false });
  pencilLine(ctx, koban, body, { width: 2.8 });
  for (const dy of [-12, 0, 12]) {
    pencilLine(ctx, [{ x: 117, y: 252 + dy }, { x: 143, y: 252 + dy }], body, { closed: false, width: 2, amount: 0.4, color: K.oro.ombra });
  }
  plush(ctx, ellipse(172, 262, 16, 24, 0.25), body, C.riso, (p) => p.x > 175);
  plush(ctx, ellipse(88, 262, 16, 24, -0.25), body, C.riso, (p) => p.x < 85);
  for (const side of [-1, 1]) plush(ctx, ellipse(130 + side * 38, 298, 28, 16), body, C.riso, (p) => p.y > 296);

  // La testa, con le macchie arancione e nera.
  const head = ellipse(130, 108, 80, 66);
  pastelFill(ctx, head, body, C.riso);
  patch(ctx, head, ellipse(78, 66, 44, 34, -0.3), body, K.gatto);
  patch(ctx, head, ellipse(190, 58, 36, 28, 0.4), body, K.macchia);
  fur(ctx, head, body, C.riso);
  pencilLine(ctx, head, body, FUR_LINE);

  // Il collare rosso con il campanello.
  const collar = smoothCurve([
    { x: 82, y: 172 }, { x: 130, y: 182 }, { x: 178, y: 172 }, { x: 176, y: 186 }, { x: 130, y: 196 }, { x: 84, y: 186 },
  ]);
  pastelFill(ctx, collar, body, K.rosso, { volume: false });
  pencilLine(ctx, collar, body, { width: 2.8 });
  const bell = ellipse(130, 202, 12, 12);
  pastelFill(ctx, bell, body, K.oro, { volume: false });
  pencilLine(ctx, bell, body, { width: 2.6 });
  pencilLine(ctx, [{ x: 119, y: 203 }, { x: 141, y: 203 }], body, { closed: false, width: 2, amount: 0.3 });
  pastelFill(ctx, ellipse(130, 208, 2.6, 2.6), body, dark, { volume: false, hatching: 0 });

  // Il naso rosa, i baffi e la faccia.
  const nose = roundedPolygon([{ x: 122, y: 111 }, { x: 138, y: 111 }, { x: 130, y: 120 }], 4);
  pastelFill(ctx, nose, face, { colore: '#e98aa0', ombra: '#d1627f', luce: '#f6bccb' }, { volume: false });
  pencilLine(ctx, nose, face, { width: 2 });
  pencilLine(ctx, [{ x: 130, y: 119 }, { x: 130, y: 128 }], face, { closed: false, width: 2.4 });
  for (const side of [-1, 1]) {
    for (const [dy, dx] of [[-5, 36], [3, 38], [11, 34]]) {
      pencilLine(ctx, [{ x: 130 + side * 50, y: 120 + dy * 0.8 }, { x: 130 + side * (50 + dx), y: 120 + dy * 1.6 }], face, {
        closed: false, width: 1.8, amount: 0.5, alpha: 0.8,
      });
    }
  }
  faccia(ctx, face, espressione, { occhiY: 98, occhiDx: 36, boccaY: 130, guanceY: 120, guanceDx: 52 });

  // La zampa alzata a chiamare i clienti, con il cuscinetto rosa.
  const arm = ellipse(30, 130, 21, 44, -0.18);
  plush(ctx, arm, body, C.riso);
  const pad = ellipse(30, 142, 11, 9);
  pastelFill(ctx, pad, body, K.rosa, { volume: false });
  pencilLine(ctx, pad, body, { width: 1.8, amount: 0.4 });
  for (const dx of [-9, 0, 9]) {
    const toe = ellipse(30 + dx * 1.05, 122 - Math.abs(dx) * 0.25, 4, 5);
    pastelFill(ctx, toe, body, K.rosa, { volume: false, hatching: 0 });
    pencilLine(ctx, toe, body, { width: 1.6, amount: 0.3 });
  }
}

// ---------------------------------------------------------------------------------------------
// Il catalogo

const DISEGNATORI = { tanuki: drawTanuki, kitsune: drawKitsune, 'maneki-neko': drawManeki };

// L'imbronciata ha il segno di rabbia sopra la testa, a destra.
const VENA = { tanuki: { x: 238, y: 36 }, kitsune: { x: 236, y: 40 }, 'maneki-neko': { x: 236, y: 52 } };

// Dove stanno la goccia e lo sbuffo del Lamento rispetto al disegno del Cliente (centro del segno, in
// pixel del riquadro CLIENTE_SIZE). Non fanno parte della texture: li mette ClienteView, così seguono il
// peluche quando si muove. La goccia sta sul lato della venetta (che la perplessa non ha), lo sbuffo sul
// lato opposto, fuori dal muso e dalla zampa del maneki-neko.
export const SEGNI_POS = {
  tanuki: { goccia: { x: 238, y: 82 }, sbuffo: { x: 22, y: 92 } },
  kitsune: { goccia: { x: 236, y: 84 }, sbuffo: { x: 22, y: 94 } },
  'maneki-neko': { goccia: { x: 232, y: 84 }, sbuffo: { x: 22, y: 76 } },
};

function drawCliente(ctx, rng, cliente, espressione) {
  // Corpo e grana hanno il seme del Cliente, la faccia quello della texture: in tutte e tre le
  // espressioni il peluche è lo stesso, tranne la faccia.
  const body = createRng(`${STILE.seme}:cliente-${cliente}`);
  DISEGNATORI[cliente](ctx, body, rng, espressione);
  if (espressione === 'imbronciata') venetta(ctx, rng, VENA[cliente].x, VENA[cliente].y);
  grain(ctx, CLIENTE_SIZE.w, CLIENTE_SIZE.h, createRng(`${STILE.seme}:cliente-${cliente}:grana`));
}

// Le voci da aggiungere a DISEGNI di catalogo.js: la chiave è clienteKey(cliente, espressione).
export const DISEGNI_CLIENTI = Object.fromEntries(
  CLIENTI.flatMap((cliente) => ESPRESSIONI.map((espressione) => [
    clienteKey(cliente, espressione),
    { ...CLIENTE_SIZE, grain: false, draw: (ctx, rng) => drawCliente(ctx, rng, cliente, espressione) },
  ])),
);
