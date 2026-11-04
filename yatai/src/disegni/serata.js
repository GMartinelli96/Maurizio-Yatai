// I disegni della Serata che non sono personaggi né Piatti: la nuvoletta dell'Ordine, i cuoricini
// della Pazienza, la monetina da 5 yen con il buco (lo Yen, GLOSSARY.md) e le stelle del voto.
// Sono piccoli e servono a colpo d'occhio: contorno a matita come tutto il resto, niente testo
// (il font non ha il ★, e le icone si leggono anche senza sapere la lingua).

import { PALETTE as C } from '../config.js';
import {
  ellipse, pastelFill, pencilLine, roundedPolygon, smoothCurve,
} from '../kit/matita.js';

const MARGINE = 6;

// ---------------------------------------------------------------------------------------------
// La nuvoletta: un riquadro bianco con la punta in basso, verso la testa del Cliente.
// `corpo` è il rettangolo dove stanno le icone dell'Ordine; la punta tocca il fondo, al centro.

export const NUVOLETTA = {
  w: 190,
  h: 120,
  corpo: { x: MARGINE, y: MARGINE, w: 178, h: 92 },
};

export function drawNuvoletta(ctx, rng) {
  const { corpo } = NUVOLETTA;
  const sinistra = corpo.x;
  const destra = corpo.x + corpo.w;
  const alto = corpo.y;
  const basso = corpo.y + corpo.h;
  const mezzo = NUVOLETTA.w / 2;
  const shape = roundedPolygon([
    { x: sinistra, y: alto }, { x: destra, y: alto }, { x: destra, y: basso },
    { x: mezzo + 15, y: basso }, { x: mezzo, y: NUVOLETTA.h - MARGINE }, { x: mezzo - 15, y: basso },
    { x: sinistra, y: basso },
  ], 22);
  // L'ombra appena sotto, come nei pannelli.
  ctx.save();
  ctx.translate(0, 4);
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = C.ombraPosata;
  ctx.beginPath();
  shape.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  pastelFill(ctx, shape, rng, C.nuvola, { volume: false, hatching: 0.7 });
  pencilLine(ctx, shape, rng);
}

// ---------------------------------------------------------------------------------------------
// I cuoricini della Pazienza: pieno (rosso) e vuoto (solo il contorno, appena visibile).

export const CUORE_SIZE = { w: 56, h: 52 };

const CUORE = { colore: '#ef6f80', ombra: '#c4465c', luce: '#f9aab5' };
const CUORE_VUOTO = { colore: '#efe6d8', ombra: '#cdbfa9', luce: '#fffdf8' };

// La curva classica del cuore, centrata e scalata a stare nel riquadro.
function cuore() {
  const punti = [];
  const n = 28;
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    punti.push({
      x: 16 * Math.sin(t) ** 3,
      y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)),
    });
  }
  const k = (CUORE_SIZE.w - MARGINE * 2) / 32;
  return smoothCurve(punti.map((p) => ({
    x: CUORE_SIZE.w / 2 + p.x * k,
    y: CUORE_SIZE.h / 2 + 1 + p.y * k + 1.6,
  })), { perSegment: 4 });
}

export function drawCuore(ctx, rng) {
  const shape = cuore();
  pastelFill(ctx, shape, rng, CUORE);
  // Un riflesso in alto a sinistra.
  pastelFill(ctx, ellipse(19, 17, 5.5, 3.6, -0.7), rng, { colore: '#ffffff', ombra: '#ffffff', luce: '#ffffff' }, { volume: false, alpha: 0.7, hatching: 0 });
  pencilLine(ctx, shape, rng);
}

export function drawCuoreVuoto(ctx, rng) {
  const shape = cuore();
  pastelFill(ctx, shape, rng, CUORE_VUOTO, { volume: false, hatching: 0.4 });
  pencilLine(ctx, shape, rng, { alpha: 0.45, width: 2.6 });
}

// ---------------------------------------------------------------------------------------------
// I segni del Lamento (GAME_SPEC.md, "Clienti"): la goccia di sudore (2 cuoricini) e lo sbuffo
// d'aria (1 cuoricino). Senza parole: si leggono accanto alla faccia, scocciati ma buffi.

export const GOCCIA_SIZE = { w: 36, h: 48 };
export const SBUFFO_SIZE = { w: 54, h: 40 };

const SUDORE = { colore: '#a9d6f0', ombra: '#6fa9cc', luce: '#e3f3fb' };
const ARIA = { colore: '#d9e8f3', ombra: '#97b3c7', luce: '#f4f9fd' };

export function drawGoccia(ctx, rng) {
  const goccia = smoothCurve([
    { x: 18, y: 3 }, { x: 23, y: 14 }, { x: 30, y: 27 }, { x: 30, y: 36 },
    { x: 24, y: 44 }, { x: 18, y: 46 }, { x: 12, y: 44 }, { x: 6, y: 36 }, { x: 6, y: 27 }, { x: 13, y: 14 },
  ], { perSegment: 8 });
  pastelFill(ctx, goccia, rng, SUDORE, { volume: false, hatching: 0.6 });
  pastelFill(ctx, ellipse(13, 33, 2.8, 5.5, 0.25), rng, { colore: '#ffffff', ombra: '#ffffff', luce: '#ffffff' }, { volume: false, alpha: 0.85, hatching: 0 });
  pencilLine(ctx, goccia, rng, { width: 2.8 });
}

// Uno sbuffo: una nuvoletta di tre tondi vicino alla faccia e due piccoli tondi che se ne vanno.
// Soffia verso sinistra (il lato opposto alla venetta dell'imbronciata).
export function drawSbuffo(ctx, rng) {
  const tondi = [
    ellipse(37, 21, 10.5, 9.5), ellipse(27, 14, 8.5, 8), ellipse(27, 28, 8.5, 8),
    ellipse(13, 14, 4.8, 4.4), ellipse(6, 26, 3.4, 3.2),
  ];
  for (const tondo of tondi) pastelFill(ctx, tondo, rng, ARIA, { volume: false, hatching: 0.4 });
  for (const tondo of tondi) pencilLine(ctx, tondo, rng, { width: 2.4, amount: 0.5 });
}

// ---------------------------------------------------------------------------------------------
// Lo Yen: la monetina da 5 yen, d'ottone, con il buco al centro e un anello in rilievo.

export const MONETA_SIZE = { w: 60, h: 60 };

export function drawMoneta(ctx, rng) {
  const cx = MONETA_SIZE.w / 2;
  const cy = MONETA_SIZE.h / 2;
  const fuori = ellipse(cx, cy, 24, 24);
  pastelFill(ctx, fuori, rng, C.giallo);
  pencilLine(ctx, ellipse(cx, cy, 17.5, 17.5), rng, { width: 1.6, alpha: 0.55, color: C.giallo.ombra, amount: 0.6 });
  pencilLine(ctx, fuori, rng);
  // Il buco: si toglie il colore e si ripassa il bordo.
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(cx, cy, 6.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  pencilLine(ctx, ellipse(cx, cy, 6.4, 6.4), rng, { width: 2.4, amount: 0.4 });
}

// ---------------------------------------------------------------------------------------------
// Le stelle del voto: ★ piena d'oro, ★ vuota.

export const STELLA_SIZE = { w: 68, h: 66 };

const STELLA = { colore: '#f7d26a', ombra: '#d1a33a', luce: '#fdedb8' };
const STELLA_VUOTA = { colore: '#e9dfce', ombra: '#cdbfa9', luce: '#fffdf8' };

function stella() {
  const cx = STELLA_SIZE.w / 2;
  const cy = STELLA_SIZE.h / 2 + 2;
  const R = 29;
  const r = 14;
  const punte = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const raggio = i % 2 === 0 ? R : r;
    punte.push({ x: cx + Math.cos(a) * raggio, y: cy + Math.sin(a) * raggio });
  }
  return roundedPolygon(punte, 6);
}

export function drawStella(ctx, rng) {
  const shape = stella();
  pastelFill(ctx, shape, rng, STELLA);
  pencilLine(ctx, shape, rng);
}

export function drawStellaVuota(ctx, rng) {
  const shape = stella();
  pastelFill(ctx, shape, rng, STELLA_VUOTA, { volume: false, hatching: 0.4 });
  pencilLine(ctx, shape, rng, { alpha: 0.5, width: 2.6 });
}

// ---------------------------------------------------------------------------------------------
// La campanella dello Yatai: appesa a un cordino sotto la tendina del Bancone, con un fiocco rosa. Oscilla due
// secondi prima di ogni ondata (ticket 34). Il perno è il centro in alto (il cordino), così pende da lì.

export const CAMPANELLA_SIZE = { w: 56, h: 88 };

export function drawCampanella(ctx, rng) {
  // Il cordino, e il fiocco dove si attacca alla campana.
  pencilLine(ctx, [{ x: 28, y: 1 }, { x: 28, y: 24 }], rng, { closed: false, width: 3, amount: 0.5 });
  const campana = smoothCurve([
    { x: 28, y: 27 }, { x: 40, y: 33 }, { x: 44, y: 50 }, { x: 47, y: 64 },
    { x: 52, y: 72 }, { x: 4, y: 72 }, { x: 9, y: 64 }, { x: 12, y: 50 }, { x: 16, y: 33 },
  ], { perSegment: 8 });
  pastelFill(ctx, campana, rng, C.giallo, { hatching: 0.8 });
  // Il riflesso sulla pancia e il bordo in basso.
  pastelFill(ctx, ellipse(21, 49, 3, 10, 0.18), rng, { colore: '#ffffff', ombra: '#ffffff', luce: '#ffffff' }, { volume: false, alpha: 0.7, hatching: 0 });
  pencilLine(ctx, campana, rng, { width: 2.8 });
  pencilLine(ctx, [{ x: 8, y: 66 }, { x: 48, y: 66 }], rng, { closed: false, width: 1.8, alpha: 0.5, color: C.giallo.ombra, amount: 0.5 });
  // Il battaglio che esce dal fondo.
  const battaglio = ellipse(28, 78, 6.5, 6);
  pastelFill(ctx, battaglio, rng, { colore: C.giallo.ombra, ombra: C.giallo.ombra, luce: C.giallo.colore }, { volume: false, hatching: 0.4 });
  pencilLine(ctx, battaglio, rng, { width: 2.4 });
  // Il fiocco rosa sopra, per ultimo.
  for (const lato of [-1, 1]) {
    const ala = ellipse(28 + lato * 7, 25, 7, 4.4, lato * 0.35);
    pastelFill(ctx, ala, rng, C.rosa, { volume: false, hatching: 0.5 });
    pencilLine(ctx, ala, rng, { width: 2.2, amount: 0.5 });
  }
  const nodo = ellipse(28, 25, 3.2, 3.2);
  pastelFill(ctx, nodo, rng, C.rosa, { volume: false, hatching: 0 });
  pencilLine(ctx, nodo, rng, { width: 2, amount: 0.4 });
}

// ---------------------------------------------------------------------------------------------
// Il "pof" della Serie che si spezza (ticket 34): una nuvoletta morbida di tondi rosa pallido, con qualche tondino che
// se ne va, come negli sbuffi dei fumetti. Rosa e rotondo apposta: niente grigio del Fumo (quello è del Piatto bruciato)
// né azzurro dello sbuffo e della goccia del Lamento, perché la Serie che finisce non è una punizione.

export const POF_SIZE = { w: 128, h: 104 };

const POF = { colore: '#ffe0e8', ombra: '#f4b3c5', luce: '#fff7fa' };

export function drawPof(ctx, rng) {
  // Prima i tondini lontani, poi la nuvola dal fondo al davanti: ogni tondo copre il contorno di quelli dietro.
  const lontani = [ellipse(14, 36, 6, 5.6), ellipse(114, 34, 6.5, 6), ellipse(104, 84, 5, 4.8), ellipse(22, 82, 4.6, 4.4), ellipse(64, 12, 5, 4.8)];
  const nuvola = [ellipse(52, 40, 15, 14), ellipse(77, 40, 15, 14), ellipse(42, 60, 16, 15), ellipse(86, 60, 16, 15), ellipse(64, 54, 22, 20)];
  for (const tondo of [...lontani, ...nuvola]) {
    pastelFill(ctx, tondo, rng, POF, { volume: false, hatching: 0.4 });
    pencilLine(ctx, tondo, rng, { width: 2.4, amount: 0.5 });
  }
}
