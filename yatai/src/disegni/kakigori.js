// Il kakigōri, il Piatto dell'Hanabi (ticket 07): un monte di ghiaccio tritato in una ciotola celeste, con lo
// sciroppo versato sopra e la frutta (o le foglie) in cima. Tre varianti: fragola, melone, matcha.
//
// Le varianti si riconoscono anche in bianco e nero (GAME_SPEC.md, "con icona, non solo colore"), in tre modi:
//  - la forma della cosa in cima: la fragola a cuore con il ciuffo, la fetta di melone a mezzaluna, due foglie di tè;
//  - la luminosità dello sciroppo: la fragola media, il melone molto chiaro, il matcha scuro (PALETTE);
//  - il contenitore delle Scorte: una bottiglia alta con il collo, un barattolo largo e basso, una latta con il coperchio.
// La stessa frutta sta sulla Scorta e sul Piatto, così chi vede la Scorta riconosce il Piatto.
//
// I Piatti hanno la misura dell'onigiri (onigiriSize): Bancone, icone dell'Ordine e volo dei Piatti scalano uguale.
// Le Scorte stanno nel riquadro delle Postazioni (POSTAZIONE_SIZE: 132×152, poggiano sul fondo).

import { PALETTE as C, PIATTI, STILE } from '../config.js';
import { clipTo, ellipse, pastelFill, pencilLine, restingShadow, roundedPolygon, roundedRect, smoothCurve } from '../kit/matita.js';
import { onigiriSize } from './onigiri.js';

const MARGIN = 9;
const FLAT = { volume: false };
// Le due misure del Piatto, come l'onigiri: sul Bancone e come icona dell'Ordine (catalogo.js, ONIGIRI_BANCONE e _ICONA).
const BANCONE = 150;
const ICONA = 64;

// Il colore di ogni sciroppo, per variante.
export const SCIROPPO = { fragola: C.fragola, melone: C.melone, matcha: C.matcha };

function part(ctx, rng, shape, swatch, { fill = {}, line = {} } = {}) {
  pastelFill(ctx, shape, rng, swatch, fill);
  pencilLine(ctx, shape, rng, line);
}

const spessore = (linea) => (linea ? { width: linea } : {});

// ---------------------------------------------------------------------------------------------
// La frutta e le foglie. (cx, cy) è il centro, r il raggio; `linea` è lo spessore del contorno (di solito quello
// standard).

// La fragola: un cuore con la punta in basso, i semi gialli e il ciuffo verde.
function fragola(ctx, rng, cx, cy, r, linea) {
  const corpo = smoothCurve([
    { x: cx - r, y: cy - r * 0.5 }, { x: cx - r * 0.55, y: cy - r * 0.8 }, { x: cx, y: cy - r * 0.62 },
    { x: cx + r * 0.55, y: cy - r * 0.8 }, { x: cx + r, y: cy - r * 0.5 }, { x: cx + r * 0.72, y: cy + r * 0.32 },
    { x: cx, y: cy + r }, { x: cx - r * 0.72, y: cy + r * 0.32 },
  ]);
  part(ctx, rng, corpo, C.fragola, { line: spessore(linea) });
  for (const [dx, dy] of [[-0.45, -0.2], [0.1, -0.3], [0.5, -0.15], [-0.25, 0.22], [0.28, 0.25], [0, 0.6]]) {
    pencilLine(ctx, ellipse(cx + dx * r, cy + dy * r, r * 0.06 + 0.8, r * 0.09 + 1), rng, { width: 1.6, color: C.giallo.colore, amount: 0.15 });
  }
  const ciuffo = roundedPolygon([
    { x: cx - r * 0.62, y: cy - r * 0.62 }, { x: cx - r * 0.22, y: cy - r * 1.02 }, { x: cx, y: cy - r * 0.7 },
    { x: cx + r * 0.22, y: cy - r * 1.02 }, { x: cx + r * 0.62, y: cy - r * 0.62 }, { x: cx, y: cy - r * 0.4 },
  ], 2);
  part(ctx, rng, ciuffo, C.foglia, { fill: FLAT, line: spessore(linea ? linea * 0.8 : 0) });
}

// Una fetta di melone vista di lato: una mezzaluna con la buccia verde sotto, la polpa chiara e tre semi.
// (cx, cy) è il centro del lato piatto, in alto; la fetta è larga 2r e alta circa r.
function fettaMelone(ctx, rng, cx, cy, r, linea) {
  const arco = (rx, ry, passi = 14) =>
    Array.from({ length: passi + 1 }, (_, i) => ({ x: cx + Math.cos((i / passi) * Math.PI) * rx, y: cy + Math.sin((i / passi) * Math.PI) * ry }));
  part(ctx, rng, roundedPolygon(arco(r, r * 0.95), 3), C.foglia, { line: spessore(linea) });
  // La polpa tocca la buccia agli estremi e la lascia più spessa al centro.
  part(ctx, rng, roundedPolygon(arco(r * 0.97, r * 0.72), 3), C.melone, { fill: FLAT, line: spessore(linea ? linea * 0.7 : 0) });
  for (const dx of [-0.38, 0, 0.38]) {
    pencilLine(ctx, ellipse(cx + dx * r, cy + r * 0.3, r * 0.06 + 0.8, r * 0.1 + 1, 0.4), rng, { width: 2.2, color: C.inchiostro, amount: 0.15 });
  }
}

// Una foglia di tè che parte da (cx, cy) e punta verso `angolo` (in radianti), lunga `lunga`, con la nervatura.
function fogliaDiTe(ctx, rng, cx, cy, lunga, angolo, linea) {
  const cos = Math.cos(angolo);
  const sin = Math.sin(angolo);
  const punto = (u, v) => ({ x: cx + (u * cos - v * sin) * lunga, y: cy + (u * sin + v * cos) * lunga });
  const foglia = roundedPolygon([punto(0, 0), punto(0.22, -0.2), punto(0.62, -0.17), punto(1, 0), punto(0.62, 0.17), punto(0.22, 0.2)], 2);
  part(ctx, rng, foglia, C.foglia, { line: spessore(linea) });
  pencilLine(ctx, [punto(0.04, 0), punto(0.9, 0)], rng, { closed: false, width: 1.6, color: C.matcha.ombra, amount: 0.2 });
}

// ---------------------------------------------------------------------------------------------
// Il Piatto. size è la larghezza, come per l'onigiri.

// La cosa in cima al monte, dove si vede: (fx, fy) in frazioni di size.
const CIMA = {
  fragola: (ctx, rng, at, size, linea) => {
    const { x, y } = at(0.5, 0.19);
    fragola(ctx, rng, x, y, size * 0.18, linea);
  },
  melone: (ctx, rng, at, size, linea) => {
    const { x, y } = at(0.5, 0.1);
    fettaMelone(ctx, rng, x, y, size * 0.26, linea);
  },
  matcha: (ctx, rng, at, size, linea) => {
    const base = at(0.5, 0.27);
    fogliaDiTe(ctx, rng, base.x, base.y, size * 0.34, -2.25, linea);
    fogliaDiTe(ctx, rng, base.x, base.y, size * 0.34, -0.9, linea);
  },
};

export function drawKakigori(ctx, rng, size, variante) {
  const m = MARGIN;
  const linea = STILE.linea.spessore * Math.min(1, Math.max(0.8, size / 150));
  const at = (fx, fy) => ({ x: m + size * fx, y: m + size * fy });
  const sciroppo = SCIROPPO[variante];
  if (!sciroppo) throw new RangeError(`variante sconosciuta: ${variante}`);

  // Il monte di ghiaccio tritato, con lo sciroppo versato sopra: il bordo del sciroppo è a onde, come quando cola.
  const monte = smoothCurve([at(0.1, 0.66), at(0.1, 0.5), at(0.2, 0.33), at(0.36, 0.22), at(0.5, 0.19), at(0.64, 0.22), at(0.8, 0.33), at(0.9, 0.5), at(0.9, 0.66), at(0.5, 0.72)]);
  pastelFill(ctx, monte, rng, C.ghiaccio);
  ctx.save();
  clipTo(ctx, monte);
  const cappa = smoothCurve([
    at(-0.05, -0.05), at(1.05, -0.05), at(1.05, 0.4), at(0.88, 0.46), at(0.78, 0.38), at(0.66, 0.5), at(0.54, 0.4),
    at(0.42, 0.52), at(0.3, 0.4), at(0.18, 0.49), at(0.08, 0.4), at(-0.05, 0.4),
  ]);
  pastelFill(ctx, cappa, rng, sciroppo);
  pencilLine(ctx, cappa, rng, { width: linea * 0.8 });
  ctx.restore();
  // Il ghiaccio sotto lo sciroppo, con qualche scaglia.
  for (const [fx, fy] of size >= 100 ? [[0.3, 0.6], [0.52, 0.64], [0.72, 0.59], [0.18, 0.56]] : [[0.38, 0.6], [0.66, 0.6]]) {
    const p = at(fx, fy);
    pencilLine(ctx, ellipse(p.x, p.y, 4, 1.8, rng.jitter(0.6)), rng, { width: 1.2, color: C.ghiaccio.ombra, amount: 0.25 });
  }
  pencilLine(ctx, monte, rng, { width: linea });

  // La ciotola celeste, che copre il piede del monte.
  const ciotola = roundedPolygon([at(0.12, 0.64), at(0.88, 0.64), at(0.76, 0.9), at(0.24, 0.9)], 8);
  pastelFill(ctx, ciotola, rng, C.celeste);
  pencilLine(ctx, ciotola, rng, { width: linea });
  pencilLine(ctx, [at(0.22, 0.7), at(0.78, 0.7)], rng, { closed: false, width: 1.5, alpha: 0.55, color: C.celeste.luce, amount: 0.4 });

  CIMA[variante](ctx, rng, at, size, linea);
}

// ---------------------------------------------------------------------------------------------
// Le Scorte: il ghiaccio e i tre sciroppi. Chiave: l'id dell'Ingrediente (config.js, PIATTI.kakigori.ricetta).

// Un cubo di ghiaccio visto un po' dall'alto: il davanti, il piano sopra e il fianco destro. (x, y) è l'angolo in
// alto a sinistra del davanti meno la profondità.
function cubo(ctx, rng, x, y, s) {
  const d = s * 0.22;
  const lato = roundedPolygon([{ x: x + s, y: y + d }, { x: x + s + d, y }, { x: x + s + d, y: y + s }, { x: x + s, y: y + s + d }], 3);
  const sopra = roundedPolygon([{ x, y: y + d }, { x: x + d, y }, { x: x + s + d, y }, { x: x + s, y: y + d }], 3);
  const fronte = roundedPolygon([{ x, y: y + d }, { x: x + s, y: y + d }, { x: x + s, y: y + d + s }, { x, y: y + d + s }], 4);
  part(ctx, rng, lato, { colore: C.celeste.luce, ombra: C.celeste.ombra, luce: C.ghiaccio.colore }, { fill: FLAT });
  part(ctx, rng, fronte, C.ghiaccio, { fill: { hatching: 0.8 } });
  part(ctx, rng, sopra, { colore: C.bianco, ombra: C.ghiaccio.ombra, luce: C.bianco }, { fill: FLAT });
  // I riflessi sul davanti.
  pencilLine(ctx, [{ x: x + s * 0.16, y: y + d + s * 0.2 }, { x: x + s * 0.4, y: y + d + s * 0.16 }], rng, { closed: false, width: 3.2, color: C.bianco, amount: 0.3 });
  pencilLine(ctx, [{ x: x + s * 0.16, y: y + d + s * 0.36 }, { x: x + s * 0.26, y: y + d + s * 0.35 }], rng, { closed: false, width: 3.2, color: C.bianco, amount: 0.3 });
}

// Una scintilla a quattro punte.
function scintilla(ctx, rng, cx, cy, r) {
  pencilLine(ctx, [{ x: cx, y: cy - r }, { x: cx, y: cy + r }], rng, { closed: false, width: 2.4, color: C.celeste.ombra, amount: 0.2 });
  pencilLine(ctx, [{ x: cx - r, y: cy }, { x: cx + r, y: cy }], rng, { closed: false, width: 2.4, color: C.celeste.ombra, amount: 0.2 });
}

// Il ghiaccio: due cubi su un vassoio di legno, con le scintille. Spigoloso e freddo, per distinguersi dagli sciroppi.
function drawScortaGhiaccio(ctx, rng) {
  restingShadow(ctx, 66, 138, 56, 10);
  part(ctx, rng, roundedRect(10, 120, 112, 18, 8), C.legnoChiaro);
  cubo(ctx, rng, 18, 70, 56);
  cubo(ctx, rng, 84, 94, 32);
  scintilla(ctx, rng, 28, 48, 8);
  scintilla(ctx, rng, 100, 64, 6);
  scintilla(ctx, rng, 62, 34, 5);
}

// La fragola: una bottiglia alta dal collo stretto, il tappo chiaro, e la fragola davanti.
function drawScortaFragola(ctx, rng) {
  restingShadow(ctx, 66, 138, 54, 10);
  part(ctx, rng, roundedRect(38, 48, 20, 40, 6), C.fragola);
  part(ctx, rng, ellipse(48, 108, 30, 28), C.fragola);
  part(ctx, rng, roundedRect(34, 34, 28, 18, 6), C.nuvola, { fill: FLAT });
  pencilLine(ctx, smoothCurve([{ x: 29, y: 104 }, { x: 31, y: 94 }, { x: 38, y: 88 }], { closed: false }), rng, {
    closed: false, width: 3.4, color: C.fragola.luce, amount: 0.3, alpha: 0.9,
  });
  fragola(ctx, rng, 95, 108, 26);
}

// Il melone: un barattolo largo e basso con il coperchio verde, e la fetta di melone davanti.
function drawScortaMelone(ctx, rng) {
  restingShadow(ctx, 66, 138, 56, 10);
  part(ctx, rng, roundedRect(10, 84, 84, 54, 16), C.melone);
  part(ctx, rng, roundedRect(6, 66, 92, 24, 10), C.foglia);
  part(ctx, rng, ellipse(52, 63, 11, 5), C.foglia, { fill: FLAT, line: { width: 2.2 } });
  pencilLine(ctx, [{ x: 20, y: 100 }, { x: 22, y: 118 }], rng, { closed: false, width: 3.2, color: C.melone.luce, amount: 0.3 });
  fettaMelone(ctx, rng, 88, 106, 33);
}

// Il matcha: una latta di tè scura con il coperchio crema, e due foglie davanti.
function drawScortaMatcha(ctx, rng) {
  restingShadow(ctx, 66, 138, 54, 10);
  part(ctx, rng, roundedRect(12, 66, 70, 72, 10), C.matcha);
  part(ctx, rng, roundedRect(8, 52, 78, 20, 8), C.nuvola, { fill: FLAT });
  pencilLine(ctx, [{ x: 22, y: 82 }, { x: 22, y: 118 }], rng, { closed: false, width: 3.2, color: C.matcha.luce, amount: 0.3, alpha: 0.8 });
  fogliaDiTe(ctx, rng, 84, 124, 44, -1.0);
  fogliaDiTe(ctx, rng, 84, 124, 44, -2.1);
}

// Il passo "uno degli sciroppi" nella Ricetta in icone, finché non si è scelto: tre gocce, una per variante (la
// fragola media, il melone chiaro, il matcha scuro). Nel riquadro delle Scorte, per scalare come le altre icone.
function goccia(ctx, rng, cx, cy, r, swatch) {
  const forma = smoothCurve([
    { x: cx, y: cy - r * 1.3 }, { x: cx + r * 0.5, y: cy - r * 0.35 }, { x: cx + r * 0.85, y: cy + r * 0.3 },
    { x: cx, y: cy + r }, { x: cx - r * 0.85, y: cy + r * 0.3 }, { x: cx - r * 0.5, y: cy - r * 0.35 },
  ]);
  part(ctx, rng, forma, swatch);
  pencilLine(ctx, smoothCurve([{ x: cx - r * 0.45, y: cy + r * 0.15 }, { x: cx - r * 0.35, y: cy - r * 0.2 }], { closed: false }), rng, {
    closed: false, width: 3, color: swatch.luce, amount: 0.2, alpha: 0.9,
  });
}

function drawPassoSciroppo(ctx, rng) {
  restingShadow(ctx, 66, 138, 52, 9);
  goccia(ctx, rng, 38, 104, 25, C.fragola);
  goccia(ctx, rng, 94, 104, 25, C.matcha);
  goccia(ctx, rng, 66, 82, 28, C.melone);
}

export const PASSO_SCIROPPO = { w: 132, h: 152, draw: drawPassoSciroppo };

export const SCORTE_KAKIGORI = {
  ghiaccio: drawScortaGhiaccio,
  fragola: drawScortaFragola,
  melone: drawScortaMelone,
  matcha: drawScortaMatcha,
};

// I disegni del catalogo (catalogo.js): i sei Piatti, con la chiave delle texture `kakigori-fragola` (Bancone) e
// `kakigori-fragola-icona` (Ordine), e l'icona del passo a scelta nella Ricetta (`passo-sciroppo`).
export const DISEGNI_KAKIGORI = {
  ...Object.fromEntries(
    PIATTI.kakigori.varianti.flatMap((variante) => [
      [`kakigori-${variante}`, { ...onigiriSize(BANCONE), draw: (ctx, rng) => drawKakigori(ctx, rng, BANCONE, variante) }],
      [`kakigori-${variante}-icona`, { ...onigiriSize(ICONA), draw: (ctx, rng) => drawKakigori(ctx, rng, ICONA, variante) }],
    ]),
  ),
  'passo-sciroppo': PASSO_SCIROPPO,
};
