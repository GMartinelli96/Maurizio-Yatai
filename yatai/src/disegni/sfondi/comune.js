// Gli attrezzi che i cinque sfondi hanno in comune: fasce a pastello, colline, nuvole, puntini,
// stelle. Come il resto del kit non usano mai Math.random e non conoscono Phaser: disegnano su un
// CanvasRenderingContext2D qualunque e prendono i numeri dal generatore `rng`.
//
// Niente gradienti del canvas: i cieli sono fasce a pastello sovrapposte, ognuna col bordo che
// ondeggia come tracciato a mano, e sopra il tratteggio di tutto il pastello.

import { PALETTE as C, STILE } from '../../config.js';
import { ellipse, hatch, pastelFill, pencilLine, roundedRect, smoothCurve } from '../../kit/matita.js';

// ---------------------------------------------------------------------------------------------
// Colori

const channels = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = (rgb) => `#${rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`;

// Un colore tra a e b (t = 0 è a, t = 1 è b).
export function mixHex(a, b, t) {
  const A = channels(a);
  const B = channels(b);
  return toHex(A.map((v, i) => v + (B[i] - v) * t));
}

// Un campione {colore, ombra, luce} ricavato da un solo colore, per i particolari che non hanno
// un ruolo nel tema (un tetto, una foglia): l'ombra scurisce verso l'inchiostro, la luce schiarisce.
export function tinta(colore, scurisci = 0.22) {
  return { colore, ombra: mixHex(colore, C.inchiostro, scurisci), luce: mixHex(colore, '#ffffff', 0.45) };
}

// Un colore dentro un campione, da 0 (la luce) a 1 (l'ombra): il cielo, dall'orizzonte allo zenit.
export function sfumatura(sw, t) {
  const u = Math.max(0, Math.min(1, t));
  return u < 0.5 ? mixHex(sw.luce, sw.colore, u * 2) : mixHex(sw.colore, sw.ombra, (u - 0.5) * 2);
}

const piatto = (hex) => ({ colore: hex, ombra: hex, luce: hex });

// ---------------------------------------------------------------------------------------------
// Fasce e colline

// Fasce orizzontali sovrapposte da y0 (in alto) a y1. Ognuna parte dal suo bordo ondeggiante e
// arriva in fondo, quindi la successiva copre la precedente. `colore(y)` dà il colore della fascia
// che ha il centro a quella quota. La prima fascia copre tutto da `daY`.
export function fasce(ctx, rng, { w, daY = 0, y0, y1, n, colore, ampiezza = 6, sotto = 40 }) {
  const passo = (y1 - y0) / n;
  const x0 = -24;
  const x1 = w + 24;
  ctx.save();
  ctx.fillStyle = colore(y0);
  ctx.fillRect(0, daY, w, y0 - daY + 2);
  ctx.restore();
  for (let i = 0; i < n; i++) {
    const top = y0 + i * passo;
    const onda = smoothCurve(
      Array.from({ length: 7 }, (_, k) => ({ x: x0 + (k * (x1 - x0)) / 6, y: top + rng.jitter(ampiezza) })),
      { closed: false },
    );
    const forma = [...onda, { x: x1, y: y1 + sotto }, { x: x0, y: y1 + sotto }];
    pastelFill(ctx, forma, rng, piatto(colore(top + passo / 2)), { volume: false, hatching: 0 });
  }
}

// Il tratteggio del pastello su un rettangolo intero: lo stesso di pastelFill, ma una volta sola
// per tutto lo sfondo, invece che per ogni fascia: costa un sesto dei tratti. `forza` lo rende più o
// meno forte, `densita` più o meno rado (1 = come pastelFill).
export function pastello(ctx, rng, box, sw, forza = 1, densita = 1.3) {
  const P = STILE.pastello;
  hatch(ctx, box, rng, sw.ombra, P.alphaOmbra * forza, P.angolo, P.passo * densita);
  hatch(ctx, box, rng, sw.luce, P.alphaLuce * forza, P.angolo + 14, P.passo * 2.2 * densita);
}

// Una collina: un bordo morbido in alto (`y`, con onde di `ampiezza`) e piena fino a `fondo`.
export function collina(ctx, rng, { w, y, fondo, ampiezza = 10, sw, punti = 6, linea = 0.4, volume = false, colorePieno = null }) {
  const x0 = -24;
  const x1 = w + 24;
  const alto = smoothCurve(
    Array.from({ length: punti + 1 }, (_, k) => ({ x: x0 + (k * (x1 - x0)) / punti, y: y + rng.jitter(ampiezza) })),
    { closed: false },
  );
  const forma = [...alto, { x: x1, y: fondo }, { x: x0, y: fondo }];
  pastelFill(ctx, forma, rng, colorePieno ? piatto(colorePieno) : sw, { volume, hatching: colorePieno ? 0 : 0.5 });
  if (linea > 0) pencilLine(ctx, alto, rng, { closed: false, width: 2.2, alpha: linea, amount: 1 });
  return alto;
}

// ---------------------------------------------------------------------------------------------
// Piccole cose

// Una nuvola: cinque gonfiori sovrapposti dello stesso colore, senza contorno (come nei giochi
// della suite). `s` è più o meno la larghezza divisa per 2,4.
export function nuvola(ctx, rng, cx, cy, s, sw, alpha = 0.95) {
  const parti = [[-1, 0.18, 0.55], [-0.5, -0.22, 0.78], [0.18, -0.34, 0.9], [0.8, -0.04, 0.68], [1.25, 0.2, 0.45]];
  for (const [dx, dy, r] of parti) {
    pastelFill(ctx, ellipse(cx + dx * s, cy + dy * s, r * s, r * s * 0.86), rng, sw, { volume: true, alpha, hatching: 0.4 });
  }
  pastelFill(ctx, roundedRect(cx - 1.35 * s, cy + 0.05 * s, 2.9 * s, 0.38 * s, 0.19 * s), rng, sw, { volume: false, alpha, hatching: 0.3 });
}

// Puntini sparsi in un rettangolo: stelle lontane, luccichii, polline.
export function puntini(ctx, rng, quanti, box, color, { alpha = [0.4, 1], raggio = [0.8, 2] } = {}) {
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < quanti; i++) {
    ctx.globalAlpha = rng.range(alpha[0], alpha[1]);
    ctx.beginPath();
    ctx.arc(box.x + rng() * box.w, box.y + rng() * box.h, rng.range(raggio[0], raggio[1]), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Una stella a quattro punte, morbida (le punte sono curve verso il centro).
export function stella(ctx, x, y, r, color, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
  ctx.restore();
}

// Un petalo (o una foglia tonda): una goccia che gira di `rot`, con la punta intaccata.
export function petalo(ctx, x, y, s, rot, sw, alpha = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(-s, 0);
  ctx.quadraticCurveTo(-s * 0.3, -s * 0.95, s * 0.9, -s * 0.3);
  ctx.lineTo(s * 0.62, 0);
  ctx.lineTo(s * 0.9, s * 0.3);
  ctx.quadraticCurveTo(-s * 0.3, s * 0.95, -s, 0);
  ctx.closePath();
  ctx.fillStyle = sw.colore;
  ctx.fill();
  ctx.globalAlpha = alpha * 0.55;
  ctx.strokeStyle = sw.ombra;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();
}

// Un tronco o un ramo: una striscia che ondeggia lungo i punti dati, larga `w0` all'inizio e `w1`
// alla fine, riempita a pastello e con il contorno a matita.
export function ramo(ctx, rng, punti, w0, w1, sw, { contorno = 3 } = {}) {
  const curva = smoothCurve(punti, { closed: false, perSegment: 8 });
  const n = curva.length;
  const sx = [];
  const dx = [];
  for (let i = 0; i < n; i++) {
    const a = curva[Math.max(0, i - 1)];
    const b = curva[Math.min(n - 1, i + 1)];
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nx = -(b.y - a.y) / len;
    const ny = (b.x - a.x) / len;
    const half = (w0 + (w1 - w0) * (i / (n - 1))) / 2;
    sx.push({ x: curva[i].x + nx * half, y: curva[i].y + ny * half });
    dx.push({ x: curva[i].x - nx * half, y: curva[i].y - ny * half });
  }
  const forma = [...sx, ...dx.reverse()];
  pastelFill(ctx, forma, rng, sw, { volume: true, hatching: 0.8 });
  pencilLine(ctx, forma, rng, { width: contorno, amount: 0.9 });
}

// Lo sfondo di un disegno speculare: per i lati destri si disegna il sinistro riflesso.
export function specchia(ctx, w) {
  ctx.translate(w, 0);
  ctx.scale(-1, 1);
}

// Una linea di contorno soltanto accennata, per le cose lontane (poco contrasto).
export const LONTANO = { width: 2, alpha: 0.35, amount: 0.9 };

// ---------------------------------------------------------------------------------------------
// Luci, lanterne, foglie, fiocchi

// Un alone di luce morbido: dischi sempre più piccoli e leggeri, uno dentro l'altro.
export function alone(ctx, x, y, r, color, alpha = 0.3) {
  ctx.save();
  ctx.fillStyle = color;
  for (let k = 0; k < 4; k++) {
    ctx.globalAlpha = (alpha / 4) * (1 + k * 0.5);
    ctx.beginPath();
    ctx.arc(x, y, r * (1 - k * 0.22), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Una lanterna di carta (chōchin) senza scritte: un ovale con le nervature, il tappo sopra e sotto.
// (x, y) è il centro del corpo; rx e ry i semiassi. `luce` è il colore dell'alone (null = nessuno).
export function lanterna(ctx, rng, x, y, rx, ry, sw, { luce = null, cordino = 0 } = {}) {
  if (luce) alone(ctx, x, y, Math.max(rx, ry) * 1.9, luce, 0.34);
  const tappo = tinta('#6b4a3a', 0.2);
  if (cordino) pencilLine(ctx, [{ x, y: y - ry - cordino }, { x, y: y - ry }], rng, { closed: false, width: 1.8, alpha: 0.7, amount: 0.5 });
  const corpo = ellipse(x, y, rx, ry);
  pastelFill(ctx, corpo, rng, sw, { volume: true, hatching: 0.6 });
  for (const k of [-0.5, 0, 0.5]) {
    const yy = y + ry * k;
    const dx = rx * Math.sqrt(Math.max(0, 1 - k * k));
    pencilLine(ctx, [{ x: x - dx, y: yy }, { x, y: yy + ry * 0.12 }, { x: x + dx, y: yy }], rng, { closed: false, width: 1.5, alpha: 0.4, amount: 0.5, color: sw.ombra });
  }
  pencilLine(ctx, corpo, rng, { width: 2.6 });
  for (const yy of [y - ry - 3, y + ry - 2]) {
    const t = roundedRect(x - rx * 0.46, yy, rx * 0.92, 6, 3);
    pastelFill(ctx, t, rng, tappo, { volume: false, hatching: 0 });
    pencilLine(ctx, t, rng, { width: 2 });
  }
}

// Una foglia d'acero: cinque lobi, il gambo corto. Gira di `rot`.
export function acero(ctx, x, y, s, rot, sw, alpha = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  const lobi = [0, 72, 144, 216, 288].map((g) => (g * Math.PI) / 180 - Math.PI / 2);
  lobi.forEach((a, i) => {
    const lungo = i === 0 ? 1 : i % 2 ? 0.86 : 0.76;
    const tx = Math.cos(a) * s * lungo;
    const ty = Math.sin(a) * s * lungo;
    const a0 = a - 0.62;
    const a1 = a + 0.62;
    const vx0 = Math.cos(a0) * s * 0.42;
    const vy0 = Math.sin(a0) * s * 0.42;
    if (i === 0) ctx.moveTo(vx0, vy0);
    else ctx.lineTo(vx0, vy0);
    ctx.lineTo(tx, ty);
    ctx.lineTo(Math.cos(a1) * s * 0.42, Math.sin(a1) * s * 0.42);
  });
  ctx.closePath();
  ctx.fillStyle = sw.colore;
  ctx.fill();
  ctx.lineJoin = 'round';
  ctx.globalAlpha = alpha * 0.6;
  ctx.strokeStyle = sw.ombra;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.globalAlpha = alpha * 0.7;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.1);
  ctx.lineTo(0, s * 0.55);
  ctx.stroke();
  ctx.restore();
}

// Un fiocco di neve: sei raggi con due rametti ciascuno. Piccolo e bianco, mai grande: non è un sole.
export function fiocco(ctx, x, y, r, color = '#ffffff', alpha = 0.9) {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(1.2, r * 0.16);
  for (let k = 0; k < 6; k++) {
    ctx.save();
    ctx.rotate((k * Math.PI) / 3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -r);
    ctx.moveTo(0, -r * 0.55);
    ctx.lineTo(r * 0.28, -r * 0.8);
    ctx.moveTo(0, -r * 0.55);
    ctx.lineTo(-r * 0.28, -r * 0.8);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// I punti di una corda appesa tra due estremi, con la pancia di `fiocco` pixel in mezzo.
export function corda(a, b, pancia, n = 24) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t + pancia * 4 * t * (1 - t) };
  });
}

// Il disegno è nei bordi: una forma chiusa con il riflesso di luce calda sul fondo, ritagliata
// sulla forma stessa (per le statue di neve illuminate da sotto).
export function lucePerSotto(ctx, forma, box, color, alpha = 0.3) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(forma[0].x, forma[0].y);
  for (const p of forma.slice(1)) ctx.lineTo(p.x, p.y);
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = color;
  for (let k = 0; k < 4; k++) {
    ctx.globalAlpha = alpha / 2;
    ctx.beginPath();
    ctx.ellipse(box.x + box.w / 2, box.y + box.h, box.w * (0.8 - k * 0.14), box.h * (0.7 - k * 0.14), 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
