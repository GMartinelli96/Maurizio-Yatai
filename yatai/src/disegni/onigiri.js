// L'onigiri, il Piatto dell'Hanami: un triangolo di riso bianco dagli angoli morbidi, con una
// striscia di alga nori che lo avvolge dal basso (docs/ricerca/piatti-e-matsuri.md, 2.1).
// Mai con le bacchette piantate dentro (sezione 8 della ricerca).
//
// size è la larghezza del triangolo. Lo stesso disegno serve sul Bancone e, più piccolo, come
// icona dell'Ordine: lo spessore della linea resta quasi lo stesso, come nelle icone della suite.

import { PALETTE as C, STILE } from '../config.js';
import { clipTo, contains, ellipse, pastelFill, pencilLine, roundedRect, smoothCurve } from '../kit/matita.js';

const MARGIN = 9;

export const onigiriSize = (size) => ({ w: Math.ceil(size + MARGIN * 2), h: Math.ceil(size * 0.9 + MARGIN * 2) });

export function drawOnigiri(ctx, rng, size) {
  const m = MARGIN;
  const corners = [
    { x: m + size * 0.5, y: m + size * 0.02 },
    { x: m + size * 0.98, y: m + size * 0.88 },
    { x: m + size * 0.02, y: m + size * 0.88 },
  ];
  // Un triangolo gonfio: vicino a ogni angolo due punti per arrotondarlo, a metà lato una pancia.
  const points = [];
  corners.forEach((c, i) => {
    const prev = corners[(i + 2) % 3];
    const next = corners[(i + 1) % 3];
    const near = (to, t) => ({ x: c.x + (to.x - c.x) * t, y: c.y + (to.y - c.y) * t });
    points.push(near(prev, 0.2), near(c, 0), near(next, 0.2));
    const mid = { x: (c.x + next.x) / 2, y: (c.y + next.y) / 2 };
    const cx = m + size * 0.5;
    const cy = m + size * 0.6;
    points.push({ x: mid.x + (mid.x - cx) * 0.06, y: mid.y + (mid.y - cy) * 0.06 });
  });
  // Il punto sull'angolo si tira verso il centro, così l'angolo resta morbido.
  for (let i = 1; i < points.length; i += 4) {
    points[i] = { x: points[i].x * 0.87 + (m + size * 0.5) * 0.13, y: points[i].y * 0.87 + (m + size * 0.6) * 0.13 };
  }
  const rice = smoothCurve(points);
  const line = { width: STILE.linea.spessore * Math.min(1, Math.max(0.8, size / 150)) };

  pastelFill(ctx, rice, rng, C.riso);

  const nori = roundedRect(m + size * 0.33, m + size * 0.5, size * 0.34, size * 0.6, 5);
  ctx.save();
  clipTo(ctx, rice);
  pastelFill(ctx, nori, rng, C.nori, { volume: false });
  pencilLine(ctx, nori, rng, line);
  ctx.restore();

  // I chicchi di riso, solo dove non c'è l'alga.
  const grains = size >= 100 ? 16 : 4;
  for (let placed = 0, tries = 0; placed < grains && tries < 400; tries++) {
    const x = m + rng() * size;
    const y = m + rng() * size * 0.88;
    const onNori = x > m + size * 0.3 && x < m + size * 0.7 && y > m + size * 0.46;
    if (!contains(rice, x, y) || onNori || !contains(rice, x + 8, y) || !contains(rice, x - 8, y + 6)) continue;
    pencilLine(ctx, ellipse(x, y, 3.4, 1.7, rng() * Math.PI), rng, { width: 1.1, color: C.riso.ombra, amount: 0.3 });
    placed++;
  }

  pencilLine(ctx, rice, rng, line);
}
