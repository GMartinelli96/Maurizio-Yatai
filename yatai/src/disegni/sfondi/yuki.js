// Yuki Matsuri (さっぽろ雪まつり), inverno, sera: azzurro ghiaccio, bianco e blu profondo, con i
// lampioni caldi; statue di neve e di ghiaccio illuminate, fiocchi, uno scivolo di neve e il vapore
// (ricerca, 4.5). Le statue sono tonde e amichevoli: un orso di neve, un cumulo di ghiaccio.
// Nessuna persona caricaturale.

import { SFONDO } from '../../config.js';
import { ellipse, pastelFill, pencilLine, roundedPolygon, roundedRect } from '../../kit/matita.js';
import { LONTANO, alone, collina, corda, fasce, fiocco, lucePerSotto, mixHex, nuvola, pastello, puntini, ramo, sfumatura, specchia, stella, tinta } from './comune.js';

const W = 720;
const H = SFONDO.cielo.h - SFONDO.cielo.sotto;
const NEVE = { colore: '#f4f9ff', ombra: '#b7cde8', luce: '#ffffff' };
const GHIACCIO = { colore: '#cdeaf7', ombra: '#8fc3e0', luce: '#f2fbff' };
const CALDO = '#ffcf7a';
const PINO = tinta('#4f7f8a', 0.25);

// Un lampione: un palo scuro e una lampada calda con il suo alone. Sta con i piedi in (x, base).
function lampione(ctx, rng, x, base, altezza) {
  ramo(ctx, rng, [{ x, y: base }, { x, y: base - altezza }], 7, 6, tinta('#4a4366', 0.2), { contorno: 2.2 });
  alone(ctx, x, base - altezza - 6, altezza * 0.55, CALDO, 0.38);
  const lampada = roundedRect(x - 9, base - altezza - 24, 18, 24, 7);
  pastelFill(ctx, lampada, rng, tinta('#ffe3a0', 0.1), { volume: false, hatching: 0.2 });
  pencilLine(ctx, lampada, rng, { width: 2.2 });
}

// Un pino con la neve: tre strati di verde, sopra ognuno una calotta bianca. Piccolo e lontano.
function pino(ctx, rng, x, base, s) {
  ctx.save();
  ctx.translate(x, base);
  ctx.scale(s, s);
  for (let i = 0; i < 3; i++) {
    const y = -14 - i * 22;
    const w = 30 - i * 7;
    const strato = roundedPolygon([{ x: -w, y }, { x: w, y }, { x: 0, y: y - 30 }], 3);
    pastelFill(ctx, strato, rng, PINO, { volume: false, hatching: 0.2 });
    pencilLine(ctx, strato, rng, { ...LONTANO, width: 1.8 });
    pastelFill(ctx, roundedPolygon([{ x: -w * 0.62, y: y - 10 }, { x: w * 0.62, y: y - 10 }, { x: 0, y: y - 30 }], 3), rng, NEVE, { volume: false, hatching: 0 });
  }
  ctx.restore();
}

// La kamakura: la capanna di neve tonda di Hokkaido, con la porta illuminata da dentro.
function kamakura(ctx, rng, cx, base, s) {
  ctx.save();
  ctx.translate(cx, base);
  ctx.scale(s, s);
  const cupola = roundedPolygon([{ x: -70, y: 0 }, { x: -62, y: -40 }, { x: -34, y: -68 }, { x: 0, y: -76 }, { x: 34, y: -68 }, { x: 62, y: -40 }, { x: 70, y: 0 }], 14);
  pastelFill(ctx, cupola, rng, NEVE, { volume: true, hatching: 0.5 });
  pencilLine(ctx, cupola, rng, { width: 2.6, alpha: 0.7, amount: 1 });
  const porta = roundedPolygon([{ x: -17, y: 0 }, { x: -17, y: -26 }, { x: -9, y: -36 }, { x: 9, y: -36 }, { x: 17, y: -26 }, { x: 17, y: 0 }], 8);
  pastelFill(ctx, porta, rng, tinta('#ffd98a', 0.1), { volume: false, hatching: 0.2 });
  pencilLine(ctx, porta, rng, { width: 2, alpha: 0.6 });
  alone(ctx, 0, -14, 34, CALDO, 0.3);
  ctx.restore();
}

// Una striscia di vapore che sale: una curva morbida e chiara.
function vapore(ctx, x, y, altezza, ampiezza, alpha = 0.45) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#ffffff';
  for (const [spessore, a] of [[11, alpha * 0.35], [6, alpha * 0.55], [3, alpha]]) {
    ctx.globalAlpha = a;
    ctx.lineWidth = spessore;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + ampiezza, y - altezza * 0.3, x - ampiezza, y - altezza * 0.65, x + ampiezza * 0.4, y - altezza);
    ctx.stroke();
  }
  ctx.restore();
}

export function cielo(ctx, rng, T) {
  fasce(ctx, rng, { w: W, y0: 60, y1: H, n: 11, ampiezza: 5, sotto: 50, colore: (y) => sfumatura(T.cielo, (H - y) / 330) });
  pastello(ctx, rng, { x: 0, y: 0, w: W, h: SFONDO.cielo.h }, T.cielo, 0.5);
  nuvola(ctx, rng, 150, 360, 40, tinta('#a9c0ea', 0.1), 0.75);
  nuvola(ctx, rng, 570, 300, 52, tinta('#a9c0ea', 0.1), 0.75);
  puntini(ctx, rng, 24, { x: 0, y: 40, w: W, h: 240 }, '#fffdf2', { alpha: [0.3, 0.8], raggio: [0.7, 1.5] });
  for (let i = 0; i < 4; i++) stella(ctx, rng.range(40, 680), rng.range(80, 260), rng.range(4, 6), '#fff3c4', 0.7);

  // Colline di neve, due file, con i pini e la kamakura illuminata.
  collina(ctx, rng, { w: W, y: 446, fondo: SFONDO.cielo.h, ampiezza: 14, sw: T.lontananza, colorePieno: mixHex(T.lontananza.colore, T.cielo.luce, 0.5), linea: 0.2 });
  for (const [x, s] of [[60, 0.9], [102, 0.6], [330, 0.7], [380, 0.95], [650, 0.8]]) pino(ctx, rng, x, 466, s);
  collina(ctx, rng, { w: W, y: 480, fondo: SFONDO.cielo.h, ampiezza: 10, sw: T.lontananza, colorePieno: mixHex(T.lontananza.colore, '#ffffff', 0.35), linea: 0.25 });
  kamakura(ctx, rng, 452, H - 6, 0.95);
  vapore(ctx, 468, 420, 74, 12);
  vapore(ctx, 480, 424, 60, -10, 0.35);
  // I lampioni lontani sull'orizzonte.
  for (const x of [112, 430, 604]) lampione(ctx, rng, x, H + 6, 54);
  // La foschia al livello dell'orizzonte: fasce chiare e leggere.
  ctx.save();
  ctx.fillStyle = '#ffffff';
  for (let k = 0; k < 5; k++) {
    ctx.globalAlpha = 0.08;
    ctx.fillRect(0, H - 6 - k * 9, W, 12);
  }
  ctx.restore();
}

export function terra(ctx, rng, T) {
  const colore = (y) => sfumatura(T.terra, 0.28 + (y / 480) * 0.35);
  collina(ctx, rng, { w: W, y: 18, fondo: SFONDO.terra.h, ampiezza: 8, sw: T.terra, colorePieno: colore(20), linea: 0.3 });
  fasce(ctx, rng, { w: W, daY: 90, y0: 90, y1: 360, n: 5, ampiezza: 6, sotto: 130, colore });
  pastello(ctx, rng, { x: 0, y: 6, w: W, h: SFONDO.terra.h - 6 }, T.terra, 0.6);

  // Lo scivolo di neve: una rampa con la faccia in alto più chiara, il fianco in ombra e tre corsie.
  const alto = [{ x: 300, y: 36 }, { x: 560, y: 126 }, { x: 560, y: 156 }, { x: 300, y: 70 }];
  const fianco = [{ x: 300, y: 70 }, { x: 560, y: 156 }, { x: 560, y: 190 }, { x: 300, y: 104 }];
  pastelFill(ctx, roundedPolygon(fianco, 5), rng, { colore: '#9fbbe0', ombra: '#7396c8', luce: '#c4d6ee' }, { volume: false, hatching: 0.4 });
  pastelFill(ctx, roundedPolygon(alto, 5), rng, { colore: '#e3effb', ombra: '#b7cde8', luce: '#ffffff' }, { volume: false, hatching: 0.3 });
  for (let k = 1; k <= 3; k++) {
    const t = k / 4;
    pencilLine(ctx, [{ x: 300, y: 36 + 34 * t }, { x: 560, y: 126 + 30 * t }], rng, { closed: false, width: 2.2, alpha: 0.55, amount: 0.7, color: '#7396c8' });
  }
  pencilLine(ctx, roundedPolygon([...alto], 5), rng, { width: 2.4, alpha: 0.6, amount: 1 });
  pencilLine(ctx, roundedPolygon([...fianco], 5), rng, { width: 2.4, alpha: 0.6, amount: 1 });
  // Mucchi di neve in ombra e luccichii.
  for (const [x, y, rx, ry] of [[90, 210, 90, 18], [610, 230, 100, 20], [380, 270, 120, 16]]) {
    pastelFill(ctx, ellipse(x, y, rx, ry), rng, { colore: mixHex(T.terra.colore, T.terra.ombra, 0.4), ombra: T.terra.ombra, luce: T.terra.luce }, { volume: false, alpha: 0.5, hatching: 0.2 });
  }
  puntini(ctx, rng, 50, { x: 0, y: 30, w: W, h: 300 }, '#ffffff', { alpha: [0.4, 0.95], raggio: [1, 2.2] });
}

export function alto(ctx, rng, T) {
  // Una corda di lucine calde che attraversa il cielo in alto.
  const filo = corda({ x: -10, y: 16 }, { x: W + 10, y: 18 }, 26, 36);
  pencilLine(ctx, filo, rng, { closed: false, width: 2, alpha: 0.7, amount: 0.7 });
  for (let k = 1; k < 16; k++) {
    const p = filo[Math.round((k / 16) * (filo.length - 1))];
    alone(ctx, p.x, p.y + 6, 12, CALDO, 0.5);
    puntini(ctx, rng, 1, { x: p.x - 3, y: p.y + 3, w: 6, h: 6 }, '#fff3c4', { alpha: [0.95, 1], raggio: [3.4, 4.2] });
  }
  // Rami di pino carichi di neve dagli angoli in alto.
  const corteccia = tinta('#6b5848', 0.22);
  ramo(ctx, rng, [{ x: -14, y: 54 }, { x: 60, y: 70 }, { x: 140, y: 74 }, { x: 214, y: 100 }], 20, 6, corteccia);
  ramo(ctx, rng, [{ x: 734, y: 60 }, { x: 664, y: 76 }, { x: 596, y: 80 }, { x: 540, y: 108 }], 18, 6, corteccia);
  for (const [x, y, r] of [[36, 78, 32], [104, 92, 32], [176, 116, 28], [690, 82, 32], [626, 98, 32], [566, 122, 26]]) {
    pastelFill(ctx, ellipse(x, y, r, r * 0.62), rng, PINO, { volume: true, hatching: 0.5 });
    pastelFill(ctx, ellipse(x, y - r * 0.28, r * 0.9, r * 0.4), rng, NEVE, { volume: true, hatching: 0.3 });
  }
  // Fiocchi che cadono, di due grandezze.
  for (let i = 0; i < 40; i++) puntini(ctx, rng, 1, { x: rng.range(0, W), y: rng.range(30, 250), w: 1, h: 1 }, '#ffffff', { alpha: [0.6, 1], raggio: [1.5, 3.6] });
  for (let i = 0; i < 9; i++) fiocco(ctx, rng.range(20, W - 20), rng.range(40, 240), rng.range(6, 10), '#ffffff', 0.9);
}

// Il lato sinistro: un orso di neve, tondo e sorridente, illuminato da sotto, con un lampione. Il destro:
// un cumulo di cristalli di ghiaccio che brilla di rosa e di azzurro, e un secondo lampione.
export function lato(ctx, rng, T, destro = false) {
  const w = SFONDO.lato.w;
  const h = SFONDO.lato.h;
  if (destro) specchia(ctx, w);
  const base = h - SFONDO.lato.sotto;
  if (!destro) {
    // L'orso di neve: un corpo e una testa a palla, orecchie tonde, muso e naso. Una statua senza occhi cattivi.
    const cx = 86;
    const corpo = ellipse(cx, base - 60, 64, 56);
    const testa = ellipse(cx, base - 138, 46, 40);
    pastelFill(ctx, corpo, rng, NEVE, { volume: true, hatching: 0.5 });
    pencilLine(ctx, corpo, rng, { width: 3 });
    lucePerSotto(ctx, corpo, { x: cx - 64, y: base - 116, w: 128, h: 112 }, CALDO, 0.5);
    for (const dx of [-34, 34]) {
      const orecchio = ellipse(cx + dx, base - 170, 14, 14);
      pastelFill(ctx, orecchio, rng, NEVE, { volume: true, hatching: 0.3 });
      pencilLine(ctx, orecchio, rng, { width: 2.6 });
    }
    pastelFill(ctx, testa, rng, NEVE, { volume: true, hatching: 0.5 });
    pencilLine(ctx, testa, rng, { width: 3 });
    lucePerSotto(ctx, testa, { x: cx - 46, y: base - 178, w: 92, h: 80 }, CALDO, 0.35);
    const muso = ellipse(cx, base - 126, 20, 14);
    pastelFill(ctx, muso, rng, { colore: '#e8f1fb', ombra: '#b7cde8', luce: '#ffffff' }, { volume: false, hatching: 0.2 });
    pencilLine(ctx, muso, rng, { width: 2, alpha: 0.7 });
    ctx.save();
    ctx.fillStyle = '#3a2f2b';
    ctx.beginPath();
    ctx.ellipse(cx, base - 132, 5, 3.6, 0, 0, Math.PI * 2);
    ctx.fill();
    for (const dx of [-17, 17]) {
      ctx.beginPath();
      ctx.arc(cx + dx, base - 146, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    lampione(ctx, rng, 160, base + 6, 170);
  } else {
    // Cristalli di ghiaccio: prismi arrotondati di altezze diverse, con la luce che passa attraverso.
    const luci = ['#f7a8c4', '#8fd3f0', '#d3c9f6'];
    [[70, 150, 54, 90], [112, 118, 46, 70], [26, 100, 40, 54], [150, 82, 34, 40]].forEach(([x, hh, ww, _], i) => {
      void _;
      const cristallo = roundedPolygon([{ x: x - ww / 2, y: base }, { x: x - ww / 2 + 4, y: base - hh * 0.78 }, { x, y: base - hh }, { x: x + ww / 2 - 4, y: base - hh * 0.78 }, { x: x + ww / 2, y: base }], 8);
      pastelFill(ctx, cristallo, rng, GHIACCIO, { volume: true, hatching: 0.4 });
      lucePerSotto(ctx, cristallo, { x: x - ww / 2, y: base - hh, w: ww, h: hh }, luci[i % 3], 0.5);
      pencilLine(ctx, cristallo, rng, { width: 2.8 });
      pencilLine(ctx, [{ x: x - ww * 0.18, y: base - hh * 0.2 }, { x: x - ww * 0.18, y: base - hh * 0.7 }], rng, { closed: false, width: 3, alpha: 0.7, amount: 0.5, color: '#ffffff' });
    });
    alone(ctx, 90, base, 70, '#d3c9f6', 0.3);
    lampione(ctx, rng, 28, base + 6, 190);
  }
}

export function decoroPavimento(ctx, rng, T, w, h) {
  // Un po' di neve portata dentro dagli stivali, in alto vicino al Bancone.
  ctx.save();
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 26; i++) {
    ctx.globalAlpha = rng.range(0.4, 0.8);
    ctx.beginPath();
    ctx.ellipse(rng.range(10, w - 10), h * rng() ** 2.4 * 0.45, rng.range(4, 10), rng.range(2, 4.5), rng.range(-0.3, 0.3), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
