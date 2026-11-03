// Il kit di disegno "a matita": ogni immagine del gioco nasce da qui (ADR-0001).
//
// Le funzioni disegnano su un CanvasRenderingContext2D qualunque e non sanno niente di Phaser:
// src/kit/texture.js le trasforma in texture. Tutta la casualità arriva dal generatore `rng`
// (src/kit/rng.js), quindi lo stesso disegno esce sempre uguale.
//
// Una forma è un contorno chiuso, cioè un elenco di punti { x, y } in pixel di gioco.
// Un campione è un colore con la sua ombra e la sua luce: { colore, ombra, luce } (PALETTE).

import { PALETTE, STILE } from '../config.js';

// ---------------------------------------------------------------------------------------------
// Forme

export function ellipse(cx, cy, rx, ry, rotation = 0) {
  const n = Math.max(24, Math.round((rx + ry) * 0.7));
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const points = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x = Math.cos(a) * rx;
    const y = Math.sin(a) * ry;
    points.push({ x: cx + x * cos - y * sin, y: cy + x * sin + y * cos });
  }
  return points;
}

// Un poligono con gli angoli arrotondati (vanno bene anche gli angoli rientranti).
export function roundedPolygon(corners, radius) {
  const points = [];
  const n = corners.length;
  for (let i = 0; i < n; i++) {
    const prev = corners[(i - 1 + n) % n];
    const c = corners[i];
    const next = corners[(i + 1) % n];
    const r = Math.min(radius, dist(prev, c) / 2, dist(c, next) / 2);
    const a = towards(c, prev, r);
    const b = towards(c, next, r);
    for (let k = 0; k <= 6; k++) {
      const t = k / 6;
      const u = 1 - t;
      points.push({
        x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
        y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
      });
    }
  }
  return points;
}

export function roundedRect(x, y, w, h, r) {
  return roundedPolygon([{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }], r);
}

// Una curva morbida (Catmull-Rom) che passa per tutti i punti dati.
export function smoothCurve(points, { closed = true, perSegment = 10 } = {}) {
  const n = points.length;
  const at = (i) => (closed ? points[(i + n) % n] : points[Math.max(0, Math.min(n - 1, i))]);
  const out = [];
  const segments = closed ? n : n - 1;
  for (let i = 0; i < segments; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    for (let k = 0; k < perSegment; k++) {
      const t = k / perSegment;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push({
        x: 0.5 * (2 * p1.x + (p2.x - p0.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (3 * p1.x - p0.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * (2 * p1.y + (p2.y - p0.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (3 * p1.y - p0.y - 3 * p2.y + p3.y) * t3),
      });
    }
  }
  if (!closed) out.push(points[n - 1]);
  return out;
}

export function bounds(points) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

export function contains(points, x, y) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i];
    const b = points[j];
    if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

// ---------------------------------------------------------------------------------------------
// Il tremolio

// Ridistribuisce i punti a distanza costante lungo il contorno.
function resample(points, closed, step) {
  const path = closed ? [...points, points[0]] : points;
  const out = [{ ...path[0] }];
  let carry = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    const len = dist(a, b);
    let s = step - carry;
    while (s <= len) {
      const t = s / len;
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
      s += step;
    }
    carry = len - (s - step);
  }
  if (closed && out.length > 2 && dist(out[0], out.at(-1)) < step * 0.5) out.pop();
  if (!closed) out.push({ ...path.at(-1) });
  return out;
}

// Un rumore morbido lungo la linea, tra -1 e 1. Se la linea è chiusa, si richiude su se stesso.
function smoothNoise(rng, cells, periodic) {
  const values = Array.from({ length: cells + 1 }, () => rng() * 2 - 1);
  if (periodic) values[cells] = values[0];
  return (t) => {
    const x = Math.min(0.999999, Math.max(0, t)) * cells;
    const i = Math.floor(x);
    const f = x - i;
    const s = f * f * (3 - 2 * f);
    return values[i] + (values[i + 1] - values[i]) * s;
  };
}

// Le normali (perpendicolari) di ogni punto, verso l'esterno se la forma è chiusa.
function normals(points, closed) {
  const n = points.length;
  let sign = 1;
  if (closed) {
    let area = 0;
    for (let i = 0; i < n; i++) {
      const a = points[i];
      const b = points[(i + 1) % n];
      area += a.x * b.y - b.x * a.y;
    }
    sign = area >= 0 ? 1 : -1;
  }
  return points.map((p, i) => {
    const prev = closed ? points[(i - 1 + n) % n] : points[Math.max(0, i - 1)];
    const next = closed ? points[(i + 1) % n] : points[Math.min(n - 1, i + 1)];
    const tx = next.x - prev.x;
    const ty = next.y - prev.y;
    const len = Math.hypot(tx, ty) || 1;
    return { x: (sign * ty) / len, y: (-sign * tx) / len };
  });
}

// Sposta il contorno avanti e indietro come una mano che non sta mai ferma.
export function wobble(points, closed, rng, amount, wave) {
  const pts = resample(points, closed, 3);
  const length = pts.length * 3;
  const slow = smoothNoise(rng, Math.max(2, Math.round(length / wave)), closed);
  const fast = smoothNoise(rng, Math.max(3, Math.round((length / wave) * 3)), closed);
  const nor = normals(pts, closed);
  return pts.map((p, i) => {
    const t = i / (closed ? pts.length : pts.length - 1);
    const d = amount * (0.75 * slow(t) + 0.25 * fast(t));
    return { x: p.x + nor[i].x * d, y: p.y + nor[i].y * d };
  });
}

function tracePath(ctx, points, closed) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  if (closed) ctx.closePath();
}

export function clipTo(ctx, points) {
  tracePath(ctx, points, true);
  ctx.clip();
}

// ---------------------------------------------------------------------------------------------
// I tratti

// La linea a matita: un tratto pieno e un ripasso più sottile, appena sfasato.
// Le linee aperte nel ripasso escono un poco dalle estremità, come fa la mano.
export function pencilLine(ctx, points, rng, options = {}) {
  const L = STILE.linea;
  const {
    closed = true,
    width = L.spessore,
    color = PALETTE.inchiostro,
    amount = L.tremolio,
    wave = L.onda,
    alpha = 1,
  } = options;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;

  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  tracePath(ctx, wobble(points, closed, rng, amount, wave), closed);
  ctx.stroke();

  let second = points;
  if (!closed && points.length > 1) {
    const reach = width * 1.2;
    second = [towards(points[0], points[1], -reach), ...points, towards(points.at(-1), points.at(-2), -reach)];
  }
  ctx.globalAlpha = alpha * L.ripasso.alpha;
  ctx.lineWidth = width * L.ripasso.spessore;
  tracePath(ctx, wobble(second, closed, rng, amount + L.ripasso.scarto, wave * 0.8), closed);
  ctx.stroke();
  ctx.restore();
}

// Il contorno di un peluche: più frastagliato di quello degli oggetti.
export const FUR_LINE = { amount: STILE.linea.tremolio * 1.25, wave: 9 };

// Il riempimento a pastello: colore pieno, ombra morbida lungo il bordo e tratteggio.
// volume: false per gli oggetti piatti (pannelli, alga nori), che non hanno l'ombra sul bordo.
export function pastelFill(ctx, points, rng, swatch, { volume = true, alpha = 1, hatching = 1 } = {}) {
  const P = STILE.pastello;
  const outline = wobble(points, true, rng, P.sbavatura, STILE.linea.onda * 0.7);
  const box = bounds(points);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = swatch.colore;
  tracePath(ctx, outline, true);
  ctx.fill();
  ctx.clip();

  if (volume) {
    // La luce viene dall'alto a sinistra: l'ombra del bordo è più larga in basso a destra.
    ctx.save();
    ctx.translate(P.bordoOmbra.spessore * 0.22, P.bordoOmbra.spessore * 0.3);
    ctx.globalAlpha = alpha * P.bordoOmbra.alpha;
    ctx.strokeStyle = swatch.ombra;
    ctx.lineWidth = P.bordoOmbra.spessore;
    ctx.lineJoin = 'round';
    tracePath(ctx, outline, true);
    ctx.stroke();
    ctx.restore();
  }
  if (hatching > 0) {
    hatch(ctx, box, rng, swatch.ombra, alpha * P.alphaOmbra * hatching, P.angolo, P.passo);
    hatch(ctx, box, rng, swatch.luce, alpha * P.alphaLuce * hatching, P.angolo + 14, P.passo * 2.2);
  }
  ctx.restore();
}

// Tratti corti e paralleli, un po' storti, che coprono il rettangolo `box`.
export function hatch(ctx, box, rng, color, alpha, angleDeg, spacing, width = STILE.pastello.spessore) {
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const reach = Math.hypot(box.w, box.h) / 2 + 6;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  for (let o = -reach; o <= reach; o += spacing * rng.range(0.7, 1.3)) {
    let s = -reach - rng() * 24;
    while (s < reach) {
      const len = rng.range(9, 32);
      const x0 = cx - dy * o + dx * s;
      const y0 = cy + dx * o + dy * s;
      const bend = rng.jitter(1.8);
      ctx.globalAlpha = alpha * rng.range(0.55, 1);
      ctx.lineWidth = width * rng.range(0.7, 1.25);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(x0 + (dx * len) / 2 - dy * bend, y0 + (dy * len) / 2 + dx * bend, x0 + dx * len, y0 + dy * len);
      ctx.stroke();
      s += len + rng.range(2, 12);
    }
  }
  ctx.restore();
}

// Il pelo: ciuffetti del colore del peluche che sporgono dal bordo, poi peli a matita.
// keep(p) decide dove il pelo c'è (per esempio non dove c'è la salopette).
export function fur(ctx, points, rng, swatch, { keep = () => true } = {}) {
  const F = STILE.pelo;
  const pts = resample(points, true, F.passo);
  const nor = normals(pts, true);
  ctx.save();
  ctx.lineCap = 'round';
  for (const [layer, color, width] of [[0, swatch.colore, 3], [1, PALETTE.inchiostro, 1.6]]) {
    ctx.strokeStyle = color;
    pts.forEach((p, i) => {
      if (!keep(p)) return;
      const turn = rng.jitter(F.deviazione);
      const nx = nor[i].x * Math.cos(turn) - nor[i].y * Math.sin(turn);
      const ny = nor[i].x * Math.sin(turn) + nor[i].y * Math.cos(turn);
      const len = F.lunghezza * rng.range(0.55, 1.2) * (layer ? 1 : 0.8);
      const back = layer ? len * 0.35 : len * 0.6;
      ctx.globalAlpha = layer ? F.alpha * rng.range(0.6, 1.2) : 1;
      ctx.lineWidth = width * rng.range(0.75, 1.15);
      ctx.beginPath();
      ctx.moveTo(p.x - nx * back, p.y - ny * back);
      ctx.lineTo(p.x + nx * len, p.y + ny * len);
      ctx.stroke();
    });
  }
  ctx.restore();
}

// La grana della matita: toglie puntini a caso da tutto il disegno, linee e colori.
// `densita` è facoltativa: gli sfondi grandi ne hanno meno (costa un'operazione per puntino).
export function grain(ctx, width, height, rng, densita = STILE.grana.densita) {
  const G = STILE.grana;
  const count = Math.round(width * height * densita);
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = '#000';
  for (let i = 0; i < count; i++) {
    const size = rng() < 0.8 ? 1 : 2;
    ctx.globalAlpha = G.alpha * rng();
    ctx.fillRect(Math.floor(rng() * width), Math.floor(rng() * height), size, size);
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------------------------
// Pezzi pronti

// La carta ruvida: un quadrato che si ripete senza giunture (per una TileSprite).
// Grana fine, macchie larghe, fibre e qualche segno di matita grigia come nei pannelli di FarmPlush.
export function paper(ctx, size, rng) {
  const C = STILE.carta;
  const base = hexToRgb(PALETTE.carta);
  const blotches = C.celle.map((cells) => periodicNoise2d(rng, cells, size));
  const image = ctx.createImageData(size, size);
  const d = image.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const v = (blotches[0](x, y) + blotches[1](x, y) * 0.6) * C.macchie + rng.jitter(C.grana);
      const k = (y * size + x) * 4;
      d[k] = base.r + v;
      d[k + 1] = base.g + v;
      d[k + 2] = base.b + v * 1.2;
      d[k + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);

  // Ogni segno si disegna anche spostato di un lato, così attraversa i bordi senza giunture.
  const tiled = (draw) => {
    for (const ox of [-size, 0, size]) {
      for (const oy of [-size, 0, size]) {
        ctx.save();
        ctx.translate(ox, oy);
        draw();
        ctx.restore();
      }
    }
  };
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = PALETTE.cartaGrana;
  for (let i = 0; i < C.fibre; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const a = rng() * Math.PI * 2;
    const len = rng.range(4, 14);
    const bend = rng.jitter(3);
    const alpha = rng.range(0.25, 0.55);
    tiled(() => {
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + Math.cos(a) * len * 0.5 - Math.sin(a) * bend, y + Math.sin(a) * len * 0.5 + Math.cos(a) * bend, x + Math.cos(a) * len, y + Math.sin(a) * len);
      ctx.stroke();
    });
  }
  for (let i = 0; i < C.graffi; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const a = ((-28 + rng.jitter(12)) * Math.PI) / 180;
    const len = rng.range(8, 26);
    const alpha = rng.range(0.2, 0.4);
    const width = rng.range(0.9, 1.6);
    tiled(() => {
      ctx.globalAlpha = alpha;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
      ctx.stroke();
    });
  }
  ctx.restore();
}

// L'ombra morbida sotto un personaggio o un Piatto appoggiato.
export function restingShadow(ctx, cx, cy, rx, ry) {
  ctx.save();
  ctx.fillStyle = PALETTE.ombraPosata;
  for (let k = 0; k < 6; k++) {
    const f = 1 - k * 0.12;
    ctx.globalAlpha = STILE.ombraPosata.alpha / 3;
    tracePath(ctx, ellipse(cx, cy, rx * f, ry * f), true);
    ctx.fill();
  }
  ctx.restore();
}

// Un pannello o un pulsante: ombra spostata in basso, pastello, una striscia di luce in alto
// e il contorno a matita, come i pulsanti di FarmPlush. Il rettangolo parte da (margin, margin).
export function panel(ctx, width, height, rng, swatch, margin) {
  const S = STILE.pannello;
  const r = Math.min(S.raggio, height / 2);
  const shape = roundedRect(margin, margin, width, height, r);
  ctx.save();
  ctx.translate(0, S.ombraY);
  ctx.globalAlpha = S.alphaOmbra;
  ctx.fillStyle = PALETTE.ombraPosata;
  tracePath(ctx, wobble(shape, true, rng, 1, STILE.linea.onda), true);
  ctx.fill();
  ctx.restore();

  pastelFill(ctx, shape, rng, swatch, { volume: false, hatching: 0.8 });
  const shine = roundedRect(margin + r * 0.6, margin + 7, width - r * 1.2, Math.max(8, height * 0.26), Math.min(r, height * 0.13));
  pastelFill(ctx, shine, rng, { colore: swatch.luce, ombra: swatch.luce, luce: PALETTE.bianco }, { volume: false, alpha: 0.75, hatching: 0.5 });
  pencilLine(ctx, shape, rng);
}

// ---------------------------------------------------------------------------------------------

function dist(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

// Il punto a distanza d da `from` verso `to` (d negativo: dalla parte opposta).
function towards(from, to, d) {
  const len = dist(from, to) || 1;
  return { x: from.x + ((to.x - from.x) / len) * d, y: from.y + ((to.y - from.y) / len) * d };
}

// Un rumore morbido su un quadrato di lato `size`, che si richiude sui bordi.
function periodicNoise2d(rng, cells, size) {
  const values = Array.from({ length: cells * cells }, () => rng() * 2 - 1);
  const at = (i, j) => values[(j % cells) * cells + (i % cells)];
  return (x, y) => {
    const gx = (x / size) * cells;
    const gy = (y / size) * cells;
    const i = Math.floor(gx);
    const j = Math.floor(gy);
    const fx = smoothstep(gx - i);
    const fy = smoothstep(gy - j);
    const top = at(i, j) + (at(i + 1, j) - at(i, j)) * fx;
    const bottom = at(i, j + 1) + (at(i + 1, j + 1) - at(i, j + 1)) * fx;
    return top + (bottom - top) * fy;
  };
}

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
