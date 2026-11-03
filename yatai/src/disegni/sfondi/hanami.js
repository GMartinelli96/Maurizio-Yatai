// Hanami (花見), primavera, giorno: cielo azzurro pallido, ciliegi in fiore, petali che cadono,
// teli da picnic, bonbori, e in lontananza un castello piccolo (ricerca, 4.1).
//
// I disegni hanno le stesse misure delle texture di SFONDO (config.js). L'orizzonte del cielo cade
// a `H` pixel dall'alto della texture; il resto sta sopra (si vede di più sui telefoni lunghi).

import { SFONDO } from '../../config.js';
import { ellipse, pastelFill, pencilLine, roundedPolygon, roundedRect } from '../../kit/matita.js';
import { LONTANO, collina, fasce, mixHex, nuvola, pastello, petalo, puntini, ramo, sfumatura, specchia, tinta } from './comune.js';

const W = 720;
const H = SFONDO.cielo.h - SFONDO.cielo.sotto;
const TRONCO = tinta('#9a6f58');

// Un gruppo di fiori di ciliegio: gonfiori rosa sovrapposti, con qualche fiore a cinque petali.
function fiori(ctx, rng, T, cx, cy, r) {
  const n = 7;
  const cerchi = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + rng.jitter(0.4);
    const d = i === 0 ? 0 : r * rng.range(0.38, 0.72);
    return { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * 0.8, r: r * rng.range(0.5, 0.72) };
  });
  for (const c of cerchi) pastelFill(ctx, ellipse(c.x, c.y, c.r, c.r * 0.9), rng, T.accento, { volume: true, hatching: 0.6 });
  for (let k = 0; k < Math.max(3, Math.round(r / 7)); k++) {
    const c = cerchi[Math.floor(rng() * n)];
    const x = c.x + rng.jitter(c.r * 0.6);
    const y = c.y + rng.jitter(c.r * 0.5);
    ctx.save();
    ctx.fillStyle = T.accento.luce;
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * 3.6, y + Math.sin(a) * 3.6, 3.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#f3c75a';
    ctx.beginPath();
    ctx.arc(x, y, 1.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Il castello in lontananza: tre piani bianchi con i tetti grigio-azzurri, appoggiato su una base di pietra.
// Sta con i piedi in (0, 0) e guarda in alto; chi lo chiama lo sposta e lo rimpicciolisce.
function castello(ctx, rng, cx, base, s) {
  const muro = { colore: '#f6f2ee', ombra: '#d6cfd2', luce: '#ffffff' };
  const tetto = tinta('#a3b0cb', 0.28);
  const pietra = tinta('#c4c9d6', 0.2);
  ctx.save();
  ctx.translate(cx, base);
  ctx.scale(s, s);
  const pezzo = (forma, sw, volume = true) => {
    pastelFill(ctx, forma, rng, sw, { volume, hatching: 0.5 });
    pencilLine(ctx, forma, rng, { ...LONTANO, width: 2.4 });
  };
  pezzo(roundedPolygon([{ x: -64, y: 0 }, { x: 64, y: 0 }, { x: 50, y: -26 }, { x: -50, y: -26 }], 5), pietra);
  pezzo(roundedRect(-40, -56, 80, 30, 3), muro);
  pezzo(roundedPolygon([{ x: -66, y: -52 }, { x: 66, y: -52 }, { x: 46, y: -76 }, { x: -46, y: -76 }], 4), tetto);
  pezzo(roundedRect(-28, -102, 56, 26, 3), muro);
  pezzo(roundedPolygon([{ x: -48, y: -98 }, { x: 48, y: -98 }, { x: 33, y: -120 }, { x: -33, y: -120 }], 4), tetto);
  pezzo(roundedRect(-17, -142, 34, 22, 3), muro);
  pezzo(roundedPolygon([{ x: -34, y: -138 }, { x: 34, y: -138 }, { x: 21, y: -160 }, { x: -21, y: -160 }], 4), tetto);
  // Due ornamenti dorati sul tetto più alto e qualche finestrella.
  ctx.fillStyle = '#f3d27a';
  for (const x of [-21, 21]) {
    ctx.beginPath();
    ctx.arc(x, -158, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#9aa3bd';
  for (const [x, y, w] of [[-20, -46, 10], [10, -46, 10], [-9, -92, 9], [-5, -133, 8]]) ctx.fillRect(x, y, w, 9);
  ctx.restore();
}

export function cielo(ctx, rng, T) {
  fasce(ctx, rng, { w: W, y0: 60, y1: H, n: 10, ampiezza: 5, sotto: 50, colore: (y) => sfumatura(T.cielo, (H - y) / 330) });
  pastello(ctx, rng, { x: 0, y: 0, w: W, h: SFONDO.cielo.h }, T.cielo, 0.6);

  const bianco = { colore: '#fffdf8', ombra: mixHex('#ffffff', T.cielo.ombra, 0.3), luce: '#ffffff' };
  nuvola(ctx, rng, 120, 392, 42, bianco);
  nuvola(ctx, rng, 600, 340, 56, bianco);
  nuvola(ctx, rng, 330, 232, 40, bianco);
  nuvola(ctx, rng, 90, 190, 34, bianco, 0.85);

  // Le colline lontane, due file, e il castello piccolo che le guarda dall'alto.
  collina(ctx, rng, { w: W, y: 452, fondo: SFONDO.cielo.h, ampiezza: 12, sw: T.lontananza, colorePieno: mixHex('#cfe3dc', T.cielo.luce, 0.35), linea: 0.2 });
  castello(ctx, rng, 470, H + 2, 0.68);
  collina(ctx, rng, { w: W, y: 480, fondo: SFONDO.cielo.h, ampiezza: 10, sw: T.lontananza, colorePieno: '#c3e1b6', linea: 0.25 });
  // Ciliegi lontani: un tondino rosa su un tronco corto, sulla collina davanti.
  for (const x of [34, 84, 150, 238, 296, 368, 560, 618, 668]) {
    const y = 492 + rng.jitter(4);
    const alto = rng.range(10, 16);
    pastelFill(ctx, roundedRect(x - 2.5, y - alto, 5, alto + 6, 2), rng, TRONCO, { volume: false, hatching: 0 });
    pastelFill(ctx, ellipse(x, y - alto - 8, rng.range(14, 21), rng.range(11, 15)), rng, T.accento, { volume: true, alpha: 0.9, hatching: 0.4 });
  }
}

// Un telo da picnic visto di sbieco: un parallelogramma a quadretti.
function telo(ctx, rng, x, y, w, h, colori) {
  const sbieco = 14;
  const forma = [{ x: x + sbieco, y }, { x: x + w - sbieco, y }, { x: x + w + sbieco, y: y + h }, { x: x - sbieco, y: y + h }];
  pastelFill(ctx, forma, rng, colori[1], { volume: false, hatching: 0.5 });
  const colonne = 6;
  const righe = 2;
  ctx.save();
  ctx.fillStyle = colori[0].colore;
  ctx.globalAlpha = 0.9;
  for (let r = 0; r < righe; r++) {
    for (let c = 0; c < colonne; c++) {
      if ((r + c) % 2) continue;
      const t0 = r / righe;
      const t1 = (r + 1) / righe;
      // Il bordo sinistro e destro del telo alla quota t (0 in alto, 1 in basso), e il punto a u di mezzo.
      const px = (t, u) => {
        const sinistra = x + sbieco - 2 * sbieco * t;
        const destra = x + w - sbieco + 2 * sbieco * t;
        return sinistra + u * (destra - sinistra);
      };
      ctx.beginPath();
      ctx.moveTo(px(t0, c / colonne), y + t0 * h);
      ctx.lineTo(px(t0, (c + 1) / colonne), y + t0 * h);
      ctx.lineTo(px(t1, (c + 1) / colonne), y + t1 * h);
      ctx.lineTo(px(t1, c / colonne), y + t1 * h);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();
  pencilLine(ctx, forma, rng, { ...LONTANO, width: 2.2 });
}

export function terra(ctx, rng, T) {
  const colore = (y) => sfumatura(T.terra, 0.3 + (y / 480) * 0.45);
  collina(ctx, rng, { w: W, y: 18, fondo: SFONDO.terra.h, ampiezza: 9, sw: T.terra, colorePieno: colore(20), linea: 0.35 });
  fasce(ctx, rng, { w: W, daY: 90, y0: 90, y1: 360, n: 5, ampiezza: 6, sotto: 130, colore });
  pastello(ctx, rng, { x: 0, y: 6, w: W, h: SFONDO.terra.h - 6 }, T.terra, 0.7);

  telo(ctx, rng, 40, 74, 118, 38, [tinta('#f6a8c2', 0.15), { colore: '#fffaf4', ombra: '#e6dcd0', luce: '#ffffff' }]);
  telo(ctx, rng, 560, 62, 126, 40, [tinta('#9fcdf0', 0.15), { colore: '#fffaf4', ombra: '#e6dcd0', luce: '#ffffff' }]);

  // Petali sull'erba, più fitti ai bordi che al centro.
  for (let i = 0; i < 70; i++) {
    const x = rng.range(0, W);
    if (Math.abs(x - 360) < 190 && rng() < 0.6) continue;
    petalo(ctx, x, rng.range(24, 330), rng.range(4, 6.5), rng.range(0, Math.PI * 2), T.accento, 0.8);
  }
  puntini(ctx, rng, 60, { x: 0, y: 30, w: W, h: 300 }, T.terra.luce, { alpha: [0.3, 0.7], raggio: [1, 2.4] });
}

export function alto(ctx, rng, T) {
  // Un ramo di ciliegio che entra dall'angolo in alto a sinistra, uno più corto da quello a destra.
  ramo(ctx, rng, [{ x: -14, y: 12 }, { x: 70, y: 38 }, { x: 150, y: 44 }, { x: 236, y: 74 }, { x: 306, y: 70 }], 26, 8, TRONCO);
  ramo(ctx, rng, [{ x: 734, y: 20 }, { x: 664, y: 46 }, { x: 604, y: 56 }, { x: 548, y: 90 }], 22, 7, TRONCO);
  for (const [x, y, r] of [[60, 36, 40], [138, 52, 44], [214, 84, 40], [292, 86, 33], [186, 22, 30]]) fiori(ctx, rng, T, x, y, r);
  for (const [x, y, r] of [[700, 40, 38], [640, 66, 40], [576, 86, 32], [686, 8, 26]]) fiori(ctx, rng, T, x, y, r);
  // Rametti che pendono, con un grappolo di fiori in fondo.
  for (const [x, y0, y1] of [[170, 70, 118], [262, 92, 134], [620, 80, 122]]) {
    ramo(ctx, rng, [{ x, y: y0 }, { x: x + rng.jitter(6), y: (y0 + y1) / 2 }, { x: x + rng.jitter(8), y: y1 }], 5, 3, TRONCO, { contorno: 2 });
    fiori(ctx, rng, T, x, y1 + 6, 16);
  }
  // I petali che cadono.
  for (let i = 0; i < 46; i++) {
    const x = rng.range(0, W);
    if (x > 300 && x < 520 && rng() < 0.7) continue;
    petalo(ctx, x, rng.range(30, 250), rng.range(4.5, 8), rng.range(0, Math.PI * 2), T.accento, 0.9);
  }
}

// Il lato sinistro: un tronco di ciliegio che esce dal bordo in alto, con i suoi fiori, e un bonbori
// (la lanterna di carta su un palo) ai suoi piedi. Il destro è lo stesso riflesso.
export function lato(ctx, rng, T, destro = false) {
  const h = SFONDO.lato.h;
  if (destro) specchia(ctx, SFONDO.lato.w);
  const base = h - SFONDO.lato.sotto;
  ramo(ctx, rng, [{ x: 34, y: h + 10 }, { x: 28, y: 760 }, { x: 38, y: 560 }, { x: 26, y: 340 }, { x: 32, y: 120 }, { x: 28, y: -10 }], 32, 18, TRONCO);
  ramo(ctx, rng, [{ x: 34, y: 700 }, { x: 80, y: 664 }, { x: 130, y: 648 }], 14, 6, TRONCO, { contorno: 2.4 });
  ramo(ctx, rng, [{ x: 30, y: 420 }, { x: 78, y: 394 }, { x: 120, y: 346 }], 12, 5, TRONCO, { contorno: 2.4 });
  for (const [x, y, r] of [[40, 90, 54], [124, 120, 36], [60, 250, 36], [132, 346, 44], [96, 396, 28], [64, 520, 30], [140, 640, 46], [92, 668, 30], [30, 790, 28]]) fiori(ctx, rng, T, x, y, r);

  // Il bonbori: un palo di legno e una lanterna di carta esagonale, accesa.
  const palo = tinta('#b88a5c');
  ramo(ctx, rng, [{ x: 104, y: base + 4 }, { x: 104, y: 760 }], 9, 9, palo, { contorno: 2.4 });
  const carta = { colore: '#fff0dc', ombra: '#f1c8a0', luce: '#fffaf0' };
  const corpo = roundedRect(83, 676, 42, 92, 14);
  pastelFill(ctx, corpo, rng, carta, { volume: true, hatching: 0.5 });
  pencilLine(ctx, corpo, rng, { width: 2.6 });
  for (const x of [97, 111]) pencilLine(ctx, [{ x, y: 684 }, { x, y: 760 }], rng, { closed: false, width: 1.4, alpha: 0.4, amount: 0.6 });
  for (const y of [670, 764]) {
    const tappo = roundedRect(78, y, 52, 12, 5);
    pastelFill(ctx, tappo, rng, palo, { volume: false, hatching: 0.5 });
    pencilLine(ctx, tappo, rng, { width: 2.4 });
  }
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#ffd98a';
  ctx.beginPath();
  ctx.ellipse(104, 722, 30, 44, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Sul pavimento qualche petalo caduto dal tetto, più fitto in alto, dove il vento li porta.
export function decoroPavimento(ctx, rng, T, w, h) {
  for (let i = 0; i < 34; i++) {
    const y = h * rng() ** 2.2 * 0.5;
    petalo(ctx, rng.range(10, w - 10), y, rng.range(5, 8), rng.range(0, Math.PI * 2), T.accento, 0.75);
  }
}
