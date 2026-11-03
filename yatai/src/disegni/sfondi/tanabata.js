// Tanabata (七夕), inizio estate, crepuscolo: indaco e blu notte morbido, la Via Lattea fatta di
// puntini, le due stelle innamorate, un bambù con i tanzaku nei cinque colori, gru di carta e i
// festoni di carta a nastri (fukinagashi). Ricerca, 4.2. Nessuna scritta sui tanzaku.

import { SFONDO } from '../../config.js';
import { ellipse, pastelFill, pencilLine, roundedPolygon, roundedRect } from '../../kit/matita.js';
import { LONTANO, alone, collina, fasce, mixHex, pastello, petalo, puntini, ramo, sfumatura, specchia, stella, tinta } from './comune.js';

const W = 720;
const H = SFONDO.cielo.h - SFONDO.cielo.sotto;

// I cinque colori dei tanzaku: blu (o verde), rosso, giallo, bianco, viola (o nero).
const TANZAKU = ['#7fb4ee', '#ee8f8f', '#fbe28a', '#fffdf8', '#b79be0'].map((c) => tinta(c, 0.18));
const PASTELLI = ['#7fa6ee', '#f7a8c4', '#fbe28a', '#fffdf8', '#a8e6a1', '#b3a2ea'].map((c) => tinta(c, 0.18));
const BAMBU = tinta('#7cbf84', 0.25);
const FOGLIA = tinta('#9bd8a2', 0.25);

// I punti del bambù dove i tanzaku dell'Evento (ticket 14) si appenderanno: cordicelle già attaccate
// ai rami, senza niente appeso. Coordinate nella texture del lato destro (sfondo-tanabata-latoDx).
export const TANZAKU_LIBERI = [{ x: 52, y: 640 }, { x: 52, y: 700 }, { x: 52, y: 760 }, { x: 52, y: 820 }];

export function cielo(ctx, rng, T) {
  fasce(ctx, rng, { w: W, y0: 60, y1: H, n: 11, ampiezza: 5, sotto: 50, colore: (y) => sfumatura(T.cielo, (H - y) / 330) });
  pastello(ctx, rng, { x: 0, y: 0, w: W, h: SFONDO.cielo.h }, T.cielo, 0.5);

  // Le stelle lontane e qualche scintilla a quattro punte.
  puntini(ctx, rng, 90, { x: 0, y: 40, w: W, h: 420 }, '#fffdf2', { alpha: [0.35, 0.95], raggio: [0.8, 1.9] });
  for (let i = 0; i < 12; i++) stella(ctx, rng.range(20, W - 20), rng.range(70, 440), rng.range(4, 8), '#fff3c4', rng.range(0.6, 0.95));

  // La Via Lattea: una striscia diagonale di luce morbida e di tanti puntini, da sinistra in basso
  // verso destra in alto. I punti seguono una curva (Bézier quadratica) con una dispersione gentile.
  const P0 = { x: -30, y: 470 };
  const P1 = { x: 330, y: 380 };
  const P2 = { x: 760, y: 100 };
  const su = (t) => ({
    x: (1 - t) * (1 - t) * P0.x + 2 * (1 - t) * t * P1.x + t * t * P2.x,
    y: (1 - t) * (1 - t) * P0.y + 2 * (1 - t) * t * P1.y + t * t * P2.y,
  });
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#e4dcff';
  for (const [spessore, alpha] of [[96, 0.07], [64, 0.09], [34, 0.1]]) {
    ctx.globalAlpha = alpha;
    ctx.lineWidth = spessore;
    ctx.beginPath();
    for (let i = 0; i <= 30; i++) {
      const p = su(i / 30);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }
  ctx.fillStyle = '#f4eefc';
  for (let i = 0; i < 520; i++) {
    const p = su(rng());
    const d = (rng() + rng() + rng() - 1.5) * 52;
    ctx.globalAlpha = rng.range(0.2, 0.85);
    ctx.beginPath();
    ctx.arc(p.x + d * 0.5, p.y - d * 0.85, rng.range(0.6, 1.8), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  // Le due stelle innamorate, una per parte della Via Lattea.
  for (const [x, y] of [[132, 322], [528, 340]]) {
    alone(ctx, x, y, 22, '#fff6cf', 0.35);
    stella(ctx, x, y, 12, '#fffbe6', 1);
  }

  // Colline scure e un paese lontano con le finestre accese.
  collina(ctx, rng, { w: W, y: 468, fondo: SFONDO.cielo.h, ampiezza: 12, sw: T.lontananza, colorePieno: mixHex(T.lontananza.colore, T.cielo.luce, 0.35), linea: 0.18 });
  const tetto = { colore: mixHex(T.lontananza.ombra, T.cielo.colore, 0.2), ombra: T.lontananza.ombra, luce: T.lontananza.luce };
  for (let x = 20; x < W; x += rng.range(34, 60)) {
    const w = rng.range(20, 30);
    const h = rng.range(14, 22);
    const y = 486 + rng.jitter(4);
    const casa = roundedPolygon([{ x: x - w / 2, y }, { x: x + w / 2, y }, { x: x + w / 2, y: y - h }, { x, y: y - h - 10 }, { x: x - w / 2, y: y - h }], 2);
    pastelFill(ctx, casa, rng, tetto, { volume: false, hatching: 0.3 });
    pencilLine(ctx, casa, rng, { ...LONTANO, width: 1.8, alpha: 0.25 });
    if (rng() < 0.7) puntini(ctx, rng, 1, { x: x - 4, y: y - h + 2, w: 6, h: 6 }, '#ffd98a', { alpha: [0.8, 1], raggio: [1.6, 2.2] });
  }
  collina(ctx, rng, { w: W, y: 498, fondo: SFONDO.cielo.h, ampiezza: 8, sw: T.lontananza, colorePieno: mixHex(T.lontananza.ombra, T.terra.colore, 0.4), linea: 0.2 });
}

export function terra(ctx, rng, T) {
  const colore = (y) => sfumatura(T.terra, 0.3 + (y / 480) * 0.45);
  collina(ctx, rng, { w: W, y: 18, fondo: SFONDO.terra.h, ampiezza: 8, sw: T.terra, colorePieno: colore(20), linea: 0.3 });
  fasce(ctx, rng, { w: W, daY: 90, y0: 90, y1: 360, n: 5, ampiezza: 6, sotto: 130, colore });
  pastello(ctx, rng, { x: 0, y: 6, w: W, h: SFONDO.terra.h - 6 }, T.terra, 0.55);
  // Le lucciole.
  for (let i = 0; i < 38; i++) {
    const x = rng.range(10, W - 10);
    if (Math.abs(x - 360) < 160 && rng() < 0.6) continue;
    const y = rng.range(30, 330);
    alone(ctx, x, y, rng.range(5, 9), '#fbe28a', 0.35);
    puntini(ctx, rng, 1, { x: x - 1, y: y - 1, w: 2, h: 2 }, '#fff3b0', { alpha: [0.8, 1], raggio: [1.6, 2.4] });
  }
}

// Una gru di carta (orizuru), con il suo filo appeso in alto fino a (x, yFilo).
function gru(ctx, rng, x, y, s, sw, yFilo = null) {
  if (yFilo !== null) pencilLine(ctx, [{ x, y: yFilo }, { x, y: y - 8 * s }], rng, { closed: false, width: 1.6, alpha: 0.7, amount: 0.5 });
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const forme = [
    [{ x: -18, y: 2 }, { x: -1, y: -7 }, { x: 18, y: 2 }, { x: 0, y: 13 }],
    [{ x: -2, y: -5 }, { x: -31, y: -19 }, { x: -15, y: 4 }],
    [{ x: 2, y: -5 }, { x: 27, y: -21 }, { x: 14, y: 4 }],
    [{ x: 14, y: 2 }, { x: 24, y: -8 }, { x: 31, y: -5 }, { x: 19, y: 7 }],
    [{ x: -18, y: 2 }, { x: -32, y: 7 }, { x: -16, y: 8 }],
  ];
  forme.forEach((forma, i) => {
    const f = roundedPolygon(forma, 1.5);
    pastelFill(ctx, f, rng, i === 2 ? { ...sw, colore: sw.ombra } : sw, { volume: false, hatching: 0.3 });
    pencilLine(ctx, f, rng, { width: 2, amount: 0.7 });
  });
  ctx.restore();
}

// Un festone a nastri (fukinagashi): una sfera di carta in cima e tante strisce che pendono.
function fukinagashi(ctx, rng, x, strisce, lunghezza) {
  const sfera = ellipse(x, 26, 27, 25);
  pencilLine(ctx, [{ x, y: -10 }, { x, y: 4 }], rng, { closed: false, width: 2, alpha: 0.8, amount: 0.4 });
  pastelFill(ctx, sfera, rng, tinta('#f7b9d8', 0.18), { volume: true, hatching: 0.7 });
  pencilLine(ctx, sfera, rng, { width: 2.8 });
  for (const dy of [-8, 2, 12]) pencilLine(ctx, [{ x: x - 24, y: 26 + dy }, { x, y: 26 + dy + 6 }, { x: x + 24, y: 26 + dy }], rng, { closed: false, width: 1.3, alpha: 0.35, amount: 0.5 });
  for (let i = 0; i < strisce; i++) {
    const sx = x - ((strisce - 1) * 13) / 2 + i * 13;
    const lung = lunghezza * rng.range(0.78, 1);
    const dondolo = rng.jitter(8);
    ramo(ctx, rng, [{ x: sx, y: 46 }, { x: sx + dondolo * 0.6, y: 46 + lung * 0.5 }, { x: sx + dondolo, y: 46 + lung }], 11, 10, PASTELLI[i % PASTELLI.length], { contorno: 2.2 });
  }
}

export function alto(ctx, rng, T) {
  fukinagashi(ctx, rng, 78, 7, 190);
  fukinagashi(ctx, rng, 650, 5, 118);
  // Gru di carta appese a un filo.
  gru(ctx, rng, 214, 138, 0.9, tinta('#fbe28a', 0.18), 0);
  gru(ctx, rng, 504, 112, 0.8, tinta('#a8e6a1', 0.18), 0);
  gru(ctx, rng, 566, 170, 0.7, tinta('#f7a8c4', 0.18), 0);
  puntini(ctx, rng, 24, { x: 0, y: 8, w: W, h: 230 }, '#fffdf2', { alpha: [0.4, 0.9], raggio: [0.8, 1.6] });
  for (let i = 0; i < 6; i++) stella(ctx, rng.range(150, 590), rng.range(20, 220), rng.range(4, 7), '#fff3c4', 0.85);
}

// Il bambù (sasa): fusti verdi con i nodi, ciuffi di foglie lunghe che pendono.
function fusto(ctx, rng, x, w, h, inclina) {
  const punti = [{ x: x + inclina, y: h + 10 }, { x: x + inclina * 0.4, y: h * 0.6 }, { x: x - inclina * 0.3, y: h * 0.25 }, { x: x - inclina, y: -10 }];
  ramo(ctx, rng, punti, w, w * 0.8, BAMBU, { contorno: 2.8 });
  // I nodi: una fascetta più scura ogni tanto.
  for (let y = h - 70; y > 0; y -= rng.range(92, 124)) {
    const t = 1 - y / h;
    const cx = x + inclina * (1 - 2 * t);
    const nodo = roundedRect(cx - w / 2 - 2, y, w + 4, 8, 3);
    pastelFill(ctx, nodo, rng, tinta('#5ba06a', 0.3), { volume: false, hatching: 0 });
    pencilLine(ctx, nodo, rng, { width: 2, amount: 0.5 });
  }
}

// Un ciuffo di foglie lanceolate che partono da (x, y) e pendono verso il basso e fuori.
function foglie(ctx, rng, x, y, verso, quante = 5, lunghezza = 62) {
  for (let i = 0; i < quante; i++) {
    const a = Math.PI / 2 + verso * rng.range(0.15, 1.15) + rng.jitter(0.12);
    const l = lunghezza * rng.range(0.7, 1.15);
    const ex = x + Math.cos(a) * l;
    const ey = y + Math.sin(a) * l;
    const mx = (x + ex) / 2 + Math.sin(a) * 7 * verso;
    const my = (y + ey) / 2 - Math.cos(a) * 7 * verso;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(mx + 6, my, ex, ey);
    ctx.quadraticCurveTo(mx - 6, my, x, y);
    ctx.fillStyle = FOGLIA.colore;
    ctx.fill();
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = FOGLIA.ombra;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }
}

// Un tanzaku: una striscia di carta appesa a un filo, senza scritte.
function tanzaku(ctx, rng, x, y, sw, lungo = 60) {
  pencilLine(ctx, [{ x, y: y - 22 }, { x, y }], rng, { closed: false, width: 1.6, alpha: 0.7, amount: 0.4 });
  const striscia = roundedRect(x - 9, y, 18, lungo, 3);
  pastelFill(ctx, striscia, rng, sw, { volume: false, hatching: 0.6 });
  pencilLine(ctx, striscia, rng, { width: 2.2, amount: 0.7 });
}

// Il lato destro è il bambù dei desideri: cinque tanzaku e quattro cordicelle libere. Il sinistro è
// un secondo bambù, più sottile, con una fila di gru di carta (senbazuru) appesa a un filo.
export function lato(ctx, rng, T, destro = false) {
  const { w, h } = { w: SFONDO.lato.w, h: SFONDO.lato.h };
  if (!destro) specchia(ctx, w);
  const base = h - SFONDO.lato.sotto;
  void base;
  fusto(ctx, rng, 150, 18, h, 6);
  fusto(ctx, rng, 112, 13, h, -4);
  const rami = [{ y: 520, verso: -1 }, { y: 330, verso: -1 }, { y: 200, verso: -1 }, { y: 80, verso: -1 }];
  for (const r of rami) {
    ramo(ctx, rng, [{ x: 150, y: r.y }, { x: 124, y: r.y - 8 }, { x: 96, y: r.y - 4 }], 6, 3, BAMBU, { contorno: 1.8 });
    foglie(ctx, rng, 96, r.y - 4, -1, 5, 66);
    foglie(ctx, rng, 160, r.y + 4, 1, 3, 48);
  }
  if (destro) {
    // Cinque tanzaku, uno per colore, e le cordicelle libere con un anellino.
    // Ogni tanzaku pende da un ramoscello del fusto: cinque, uno per colore, alternati a destra e a sinistra.
    [[612, 0], [662, 1], [712, 2], [762, 3], [812, 4]].forEach(([y, i]) => {
      const x = 80 + (i % 2) * 28;
      ramo(ctx, rng, [{ x: 140, y: y - 34 }, { x: x + 24, y: y - 30 }, { x, y: y - 24 }], 5, 3, BAMBU, { contorno: 1.8 });
      foglie(ctx, rng, x, y - 24, -1, 2, 34);
      tanzaku(ctx, rng, x, y, TANZAKU[i], 52);
    });
    for (const p of TANZAKU_LIBERI) {
      pencilLine(ctx, [{ x: p.x, y: p.y - 28 }, { x: p.x, y: p.y }], rng, { closed: false, width: 1.6, alpha: 0.7, amount: 0.4 });
      pencilLine(ctx, ellipse(p.x, p.y + 4, 3.5, 4), rng, { width: 1.6, amount: 0.3 });
    }
  } else {
    // Una fila di gru lungo un filo, a destra del bambù (nel disegno riflesso: a sinistra).
    pencilLine(ctx, [{ x: 60, y: 120 }, { x: 60, y: 560 }], rng, { closed: false, width: 1.6, alpha: 0.7, amount: 0.8 });
    PASTELLI.slice(0, 5).forEach((sw, i) => gru(ctx, rng, 60, 200 + i * 78, 0.62, sw));
  }
  for (let i = 0; i < 8; i++) petalo(ctx, rng.range(10, 70), rng.range(60, 800), rng.range(3, 5), rng.range(0, 6), tinta('#fff3c4'), 0.6);
}

export const decoroPavimento = null;
