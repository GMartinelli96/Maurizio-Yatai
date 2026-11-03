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
