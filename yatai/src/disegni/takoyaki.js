// Il takoyaki, il Piatto del Tanabata: tre palline dorate in una barchetta di legno, con la salsa
// scura, un zigzag di maionese e l'aonori (docs/ricerca/piatti-e-matsuri.md). Niente bacchette né
// stuzzicadenti piantati dentro (sezione 8 della ricerca). La versione bruciata ha le palline quasi
// nere e crepate, senza condimenti.
//
// Stessa misura dell'onigiri (onigiriSize): così il Bancone, le icone dell'Ordine e il volo dei
// Piatti scalano allo stesso modo. Poi il Fumo (la nuvola che esce dalla Postazione bruciata) e il
// cestino dove va il Piatto bruciato.

import { PALETTE as C, STILE } from '../config.js';
import { ellipse, pastelFill, pencilLine, restingShadow, roundedPolygon, roundedRect, smoothCurve } from '../kit/matita.js';
import { onigiriSize } from './onigiri.js';

const MARGIN = 9;

export const takoyakiSize = onigiriSize;

// Una pallina: il corpo, e (se non è bruciata) la salsa con il zigzag di maionese e l'aonori.
function pallina(ctx, rng, cx, cy, r, bruciato, linea) {
  const corpo = ellipse(cx, cy, r, r * 0.97);
  pastelFill(ctx, corpo, rng, bruciato ? C.bruciato : C.takoyaki);
  if (bruciato) {
    // Le crepe della crosta bruciata.
    pencilLine(ctx, [{ x: cx - r * 0.5, y: cy - r * 0.25 }, { x: cx - r * 0.1, y: cy - r * 0.05 }, { x: cx - r * 0.25, y: cy + r * 0.3 }], rng, {
      closed: false, width: 1.6, color: C.bruciato.luce, alpha: 0.9, amount: 0.4,
    });
    pencilLine(ctx, [{ x: cx + r * 0.2, y: cy - r * 0.5 }, { x: cx + r * 0.45, y: cy - r * 0.1 }], rng, {
      closed: false, width: 1.6, color: C.bruciato.luce, alpha: 0.9, amount: 0.4,
    });
  } else {
    const salsa = ellipse(cx, cy - r * 0.14, r * 0.7, r * 0.5);
    pastelFill(ctx, salsa, rng, C.salsa, { volume: false, hatching: 0.5 });
    const x0 = cx - r * 0.55;
    const zigzag = Array.from({ length: 6 }, (_, i) => ({ x: x0 + (i * r * 1.1) / 5, y: cy - r * 0.16 + (i % 2 ? r * 0.12 : -r * 0.12) }));
    pencilLine(ctx, zigzag, rng, { closed: false, width: Math.max(2.4, linea * 0.9), color: C.maionese, amount: 0.3, alpha: 0.95 });
    for (let i = 0; i < 3; i++) {
      pencilLine(ctx, ellipse(cx + (rng() - 0.5) * r * 1.0, cy - r * 0.3 + (rng() - 0.5) * r * 0.5, 2.2, 1.5), rng, {
        width: 1.6, color: C.aonori, amount: 0.2,
      });
    }
  }
  pencilLine(ctx, corpo, rng, { width: linea });
}

// size è la larghezza del disegno, come per l'onigiri.
export function drawTakoyaki(ctx, rng, size, bruciato = false) {
  const m = MARGIN;
  const linea = STILE.linea.spessore * Math.min(1, Math.max(0.8, size / 150));
  const at = (fx, fy) => ({ x: m + size * fx, y: m + size * fy });
  const r = size * 0.205;

  // Prima la pallina in alto, poi le due davanti: si coprono dal fondo come in un mucchietto vero.
  const alto = at(0.5, 0.27);
  pallina(ctx, rng, alto.x, alto.y, r * 0.93, bruciato, linea);
  const sinistra = at(0.27, 0.47);
  pallina(ctx, rng, sinistra.x, sinistra.y, r, bruciato, linea);
  const destra = at(0.73, 0.47);
  pallina(ctx, rng, destra.x, destra.y, r, bruciato, linea);

  // La barchetta di legno copre il fondo delle palline.
  const barca = roundedPolygon([at(0.0, 0.6), at(1.0, 0.6), at(0.88, 0.88), at(0.12, 0.88)], 7);
  pastelFill(ctx, barca, rng, bruciato ? C.legnoScuro : C.legnoChiaro);
  pencilLine(ctx, barca, rng, { width: linea });
  // Un bordo e una venatura.
  const bordo = at(0.04, 0.655);
  pencilLine(ctx, [bordo, at(0.96, 0.655)], rng, { closed: false, width: 1.5, alpha: 0.5, color: C.legnoScuro.ombra, amount: 0.5 });
  pencilLine(ctx, [at(0.2, 0.77), at(0.46, 0.775)], rng, { closed: false, width: 1.3, alpha: 0.4, color: C.legnoScuro.ombra, amount: 0.5 });
}

// ---------------------------------------------------------------------------------------------
// Il Fumo: una nuvola morbida e bitorzoluta, grigio caldo. La scena la ripete, la ingrandisce e la
// fa svanire; qui è una sola nuvola.

export const FUMO_SIZE = { w: 124, h: 104 };

export function drawFumo(ctx, rng) {
  const cx = FUMO_SIZE.w / 2;
  const cy = FUMO_SIZE.h / 2 + 2;
  const n = 14;
  const punti = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    // Tre bernoccoli grandi e qualche irregolarità, così sembra una nuvola e non un cerchio.
    const k = 1 + 0.16 * Math.sin(a * 3 + 0.6) + (rng() - 0.5) * 0.1;
    return { x: cx + Math.cos(a) * 52 * k, y: cy + Math.sin(a) * 40 * k };
  });
  const nuvola = smoothCurve(punti);
  pastelFill(ctx, nuvola, rng, C.fumo);
  pencilLine(ctx, nuvola, rng, { width: 2.6, color: '#8a8088' });
  // Due ricciolini di luce dentro.
  pencilLine(ctx, smoothCurve([{ x: cx - 26, y: cy - 6 }, { x: cx - 14, y: cy - 16 }, { x: cx + 2, y: cy - 12 }], { closed: false }), rng, {
    closed: false, width: 2, color: C.fumo.luce, amount: 0.4,
  });
}

// ---------------------------------------------------------------------------------------------
// Il cestino: un secchiello di ferro con il coperchio. Il Piatto bruciato ci vola dentro.

export const CESTINO_SIZE = { w: 96, h: 116 };

export function drawCestino(ctx, rng) {
  restingShadow(ctx, 48, 108, 38, 7);
  const corpo = roundedPolygon([{ x: 16, y: 40 }, { x: 80, y: 40 }, { x: 72, y: 104 }, { x: 24, y: 104 }], 8);
  pastelFill(ctx, corpo, rng, C.ferro);
  pencilLine(ctx, corpo, rng);
  // Le scanalature.
  for (const x of [36, 48, 60]) {
    pencilLine(ctx, [{ x: x - (48 - x) * 0.08, y: 52 }, { x: x - (48 - x) * 0.18, y: 94 }], rng, {
      closed: false, width: 1.8, color: C.ferro.ombra, alpha: 0.55, amount: 0.4,
    });
  }
  // Il coperchio, appoggiato un po' storto, e la maniglia.
  const coperchio = roundedRect(8, 26, 80, 18, 8);
  pastelFill(ctx, coperchio, rng, C.ferro);
  pencilLine(ctx, coperchio, rng);
  const maniglia = roundedRect(36, 14, 24, 13, 5);
  pastelFill(ctx, maniglia, rng, C.ferro, { volume: false });
  pencilLine(ctx, maniglia, rng, { width: 2.6 });
}
