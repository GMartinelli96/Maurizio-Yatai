// Aki Matsuri (秋祭り), autunno, tramonto: ocra, arancio, rosso mattone e verde bosco; foglie
// d'acero, lanterne, un tamburo e covoni di riso. In lontananza, piccolo, un santuario con il suo
// torii (ricerca, 4.4): è lo sfondo di uno Yatai davanti al santuario.
//
// Il torii sta in disparte, a destra, e non incornicia lo Yatai né il centro dello schermo. Non c'è
// niente sopra o dentro: nessun personaggio, nessun Disturbatore. Il mikoshi non si disegna qui:
// è l'Evento del passo 8 (ticket 15).

import { SFONDO } from '../../config.js';
import { ellipse, pastelFill, pencilLine, roundedPolygon, roundedRect } from '../../kit/matita.js';
import { LONTANO, acero, collina, fasce, lanterna, mixHex, nuvola, pastello, petalo, puntini, ramo, sfumatura, specchia, tinta } from './comune.js';

const W = 720;
const H = SFONDO.cielo.h - SFONDO.cielo.sotto;
const ROSSO = tinta('#d9593f', 0.25);
const ARANCIO = tinta('#f09a4a', 0.25);
const GIALLO = tinta('#f5c85a', 0.25);
const FOGLIE = [ROSSO, ARANCIO, GIALLO, tinta('#c9742f', 0.25)];
const TRONCO = tinta('#8b6350', 0.25);

// Il santuario in lontananza: una scala di pietra, un tempietto con il tetto a due spioventi e, ai
// piedi della scala, il torii. Sta con i piedi in (0, 0). Tutto piccolo e con poco contrasto.
function santuario(ctx, rng, cx, base, s) {
  const pietra = tinta('#cfc6b8', 0.2);
  const legno = tinta('#9a7a64', 0.25);
  const torii = tinta('#e0654a', 0.22);
  ctx.save();
  ctx.translate(cx, base);
  ctx.scale(s, s);
  const pezzo = (forma, sw, hatching = 0.3) => {
    pastelFill(ctx, forma, rng, sw, { volume: false, hatching });
    pencilLine(ctx, forma, rng, { ...LONTANO, width: 2.2 });
  };
  // Il rialzo su cui sta il tempietto e la scala che scende.
  pezzo(roundedPolygon([{ x: -60, y: -58 }, { x: 60, y: -58 }, { x: 74, y: -30 }, { x: -74, y: -30 }], 6), tinta('#9bb08a', 0.2));
  for (let i = 0; i < 4; i++) pezzo(roundedRect(-26 - i * 4, -30 + i * 8, 52 + i * 8, 8, 2), pietra, 0.2);
  // Il tempietto: muro di legno, tetto a due spioventi con le punte in su.
  pezzo(roundedRect(-34, -88, 68, 30, 3), tinta('#f0e0c8', 0.15));
  pezzo(roundedPolygon([{ x: -48, y: -84 }, { x: 48, y: -84 }, { x: 28, y: -112 }, { x: -28, y: -112 }], 4), legno);
  pezzo(roundedRect(-8, -78, 16, 20, 2), tinta('#6b4a3a', 0.2), 0.1);
  // Due lanterne di pietra ai lati della scala.
  for (const x of [-52, 52]) {
    pezzo(roundedRect(x - 5, -50, 10, 20, 2), pietra, 0.1);
    pezzo(roundedPolygon([{ x: x - 9, y: -50 }, { x: x + 9, y: -50 }, { x: x + 5, y: -60 }, { x: x - 5, y: -60 }], 2), pietra, 0.1);
  }
  // Il torii in primo piano rispetto alla scala, alto 60 e largo 64: due colonne, la trave in
  // cima (kasagi) e la traversa sotto (nuki). Niente dentro, niente sopra.
  const ty = 6;
  pezzo(roundedRect(-26, ty - 56, 9, 56, 2), torii);
  pezzo(roundedRect(17, ty - 56, 9, 56, 2), torii);
  pezzo(roundedRect(-34, ty - 52, 68, 8, 3), tinta('#3f3a40', 0.2), 0.1);
  pezzo(roundedRect(-30, ty - 40, 60, 6, 2), torii);
  ctx.restore();
}

// Un covone di riso legato: un fascio di steli dorati stretto da una fascetta.
function covone(ctx, rng, x, y, s) {
  const paglia = tinta('#e8c86a', 0.25);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const fascio = roundedPolygon([{ x: -22, y: 0 }, { x: 22, y: 0 }, { x: 14, y: -44 }, { x: 4, y: -62 }, { x: -4, y: -62 }, { x: -14, y: -44 }], 6);
  pastelFill(ctx, fascio, rng, paglia, { volume: true, hatching: 0.8 });
  pencilLine(ctx, fascio, rng, { width: 2.6 });
  for (const dx of [-10, -3, 4, 11]) pencilLine(ctx, [{ x: dx, y: -4 }, { x: dx * 0.5, y: -58 }], rng, { closed: false, width: 1.3, alpha: 0.4, amount: 0.6, color: paglia.ombra });
  const legaccio = roundedRect(-16, -28, 32, 7, 3);
  pastelFill(ctx, legaccio, rng, tinta('#b5654a', 0.2), { volume: false, hatching: 0 });
  pencilLine(ctx, legaccio, rng, { width: 2 });
  ctx.restore();
}

// Una chioma d'acero: un cuscino di colori caldi con sopra tante foglie.
function chioma(ctx, rng, cx, cy, r) {
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + rng.jitter(0.4);
    const d = i === 0 ? 0 : r * rng.range(0.35, 0.65);
    pastelFill(ctx, ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.8, r * rng.range(0.5, 0.7), r * rng.range(0.42, 0.6)), rng, FOGLIE[i % 3], { volume: true, hatching: 0.6 });
  }
  for (let k = 0; k < Math.round(r / 4); k++) {
    const a = rng() * Math.PI * 2;
    const d = r * Math.sqrt(rng()) * 0.95;
    acero(ctx, cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.85, rng.range(7, 11), rng.range(0, 6.28), FOGLIE[Math.floor(rng() * 4)], 0.95);
  }
}

export function cielo(ctx, rng, T) {
  fasce(ctx, rng, { w: W, y0: 60, y1: H, n: 10, ampiezza: 5, sotto: 50, colore: (y) => sfumatura(T.cielo, (H - y) / 330) });
  pastello(ctx, rng, { x: 0, y: 0, w: W, h: SFONDO.cielo.h }, T.cielo, 0.55);
  // Lunghe nuvole di sera, rosa e dorate.
  for (const [x, y, s, c] of [[160, 400, 44, '#fbd6a0'], [560, 330, 56, '#f6a98a'], [330, 240, 40, '#fbc0a0'], [100, 200, 34, '#f6a98a']]) {
    nuvola(ctx, rng, x, y, s, tinta(c, 0.12), 0.8);
  }
  // Colline di bosco, due file, con gli alberi lontani.
  collina(ctx, rng, { w: W, y: 450, fondo: SFONDO.cielo.h, ampiezza: 12, sw: T.lontananza, colorePieno: mixHex(T.lontananza.colore, T.cielo.luce, 0.5), linea: 0.18 });
  collina(ctx, rng, { w: W, y: 478, fondo: SFONDO.cielo.h, ampiezza: 6, sw: T.lontananza, colorePieno: mixHex(T.lontananza.colore, '#6f8f66', 0.35), linea: 0.22 });
  santuario(ctx, rng, 618, 508, 0.62);
  for (let x = 14; x < W; x += rng.range(24, 42)) {
    if (x > 560 && x < 680) continue;
    const alto = rng.range(26, 40);
    const y = 490 + rng.jitter(5);
    const abete = roundedPolygon([{ x, y: y - alto }, { x: x + 10, y }, { x: x - 10, y }], 2);
    pastelFill(ctx, abete, rng, tinta(rng() < 0.6 ? '#6f9a6a' : '#c97a4a', 0.2), { volume: false, alpha: 0.85, hatching: 0.2 });
  }
}

export function terra(ctx, rng, T) {
  const colore = (y) => sfumatura(T.terra, 0.3 + (y / 480) * 0.45);
  collina(ctx, rng, { w: W, y: 18, fondo: SFONDO.terra.h, ampiezza: 8, sw: T.terra, colorePieno: colore(20), linea: 0.3 });
  fasce(ctx, rng, { w: W, daY: 90, y0: 90, y1: 360, n: 5, ampiezza: 6, sotto: 130, colore });
  pastello(ctx, rng, { x: 0, y: 6, w: W, h: SFONDO.terra.h - 6 }, T.terra, 0.7);
  // Foglie cadute, più fitte ai bordi.
  for (let i = 0; i < 64; i++) {
    const x = rng.range(0, W);
    if (Math.abs(x - 360) < 190 && rng() < 0.65) continue;
    acero(ctx, x, rng.range(24, 330), rng.range(6, 9), rng.range(0, 6.28), FOGLIE[Math.floor(rng() * 4)], 0.85);
  }
  // I covoni di riso ai bordi.
  covone(ctx, rng, 70, 126, 0.8);
  covone(ctx, rng, 112, 140, 0.7);
  covone(ctx, rng, 654, 118, 0.75);
  puntini(ctx, rng, 40, { x: 0, y: 30, w: W, h: 300 }, T.terra.luce, { alpha: [0.3, 0.6], raggio: [1, 2] });
}

export function alto(ctx, rng, T) {
  // Due rami d'acero dagli angoli in alto, con le foglie rosse, arancio e gialle.
  ramo(ctx, rng, [{ x: 734, y: 16 }, { x: 650, y: 40 }, { x: 570, y: 48 }, { x: 500, y: 82 }], 22, 7, TRONCO);
  ramo(ctx, rng, [{ x: -14, y: 22 }, { x: 60, y: 40 }, { x: 130, y: 44 }, { x: 196, y: 76 }], 24, 7, TRONCO);
  for (const [x, y, r] of [[40, 40, 40], [112, 54, 38], [180, 82, 32], [690, 40, 38], [620, 62, 38], [530, 90, 30]]) chioma(ctx, rng, x, y, r);
  for (let i = 0; i < 38; i++) {
    const x = rng.range(0, W);
    if (x > 280 && x < 440 && rng() < 0.7) continue;
    acero(ctx, x, rng.range(30, 250), rng.range(7, 11), rng.range(0, 6.28), FOGLIE[Math.floor(rng() * 4)], 0.92);
  }
}

// Il lato sinistro è un acero: tronco, rami e chiome rosse. Il destro, un grosso tamburo (taiko) su un
// supporto, una lanterna su un palo e un covone. Il tamburo sta lì da solo, senza bacchette né altro.
export function lato(ctx, rng, T, destro = false) {
  const w = SFONDO.lato.w;
  const h = SFONDO.lato.h;
  if (destro) specchia(ctx, w);
  const base = h - SFONDO.lato.sotto;
  if (!destro) {
    ramo(ctx, rng, [{ x: 34, y: h + 10 }, { x: 28, y: 760 }, { x: 40, y: 560 }, { x: 26, y: 340 }, { x: 34, y: 120 }, { x: 28, y: -10 }], 32, 18, TRONCO);
    ramo(ctx, rng, [{ x: 34, y: 690 }, { x: 80, y: 660 }, { x: 128, y: 640 }], 14, 6, TRONCO, { contorno: 2.4 });
    // Due lanterne appese al ramo basso.
    lanterna(ctx, rng, 112, 706, 15, 22, tinta('#f2a05a', 0.18), { luce: '#ffcf7a', cordino: 36 });
    lanterna(ctx, rng, 74, 718, 13, 19, tinta('#f5dcae', 0.18), { luce: '#ffcf7a', cordino: 40 });
    ramo(ctx, rng, [{ x: 30, y: 400 }, { x: 78, y: 376 }, { x: 122, y: 330 }], 12, 5, TRONCO, { contorno: 2.4 });
    for (const [x, y, r] of [[44, 100, 54], [124, 130, 34], [60, 250, 36], [128, 330, 42], [94, 380, 28], [66, 520, 30], [136, 640, 44], [90, 672, 28], [34, 784, 28]]) chioma(ctx, rng, x, y, r);
  } else {
    // Il tamburo: un barile con la pelle crema sul davanti, il bordo rosso mattone e le borchie.
    const legno = tinta('#b5654a', 0.22);
    const cx = 58;
    const cy = base - 62;
    const supporto = roundedPolygon([{ x: cx - 66, y: base + 6 }, { x: cx - 52, y: base + 6 }, { x: cx - 8, y: cy + 36 }, { x: cx - 24, y: cy + 36 }], 3);
    const supporto2 = roundedPolygon([{ x: cx + 66, y: base + 6 }, { x: cx + 52, y: base + 6 }, { x: cx + 8, y: cy + 36 }, { x: cx + 24, y: cy + 36 }], 3);
    for (const f of [supporto, supporto2]) {
      pastelFill(ctx, f, rng, tinta('#8b6350', 0.25), { volume: false, hatching: 0.5 });
      pencilLine(ctx, f, rng, { width: 2.6 });
    }
    const corpo = ellipse(cx, cy, 58, 44);
    pastelFill(ctx, corpo, rng, legno, { volume: true, hatching: 0.8 });
    pencilLine(ctx, corpo, rng, { width: 3 });
    const pelle = ellipse(cx + 8, cy, 34, 40);
    pastelFill(ctx, pelle, rng, tinta('#fff0d8', 0.15), { volume: true, hatching: 0.5 });
    pencilLine(ctx, pelle, rng, { width: 3 });
    ctx.save();
    ctx.fillStyle = '#f3d27a';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx + 8 + Math.cos(a) * 38, cy + Math.sin(a) * 44, 2.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

  }
}

export function decoroPavimento(ctx, rng, T, w, h) {
  for (let i = 0; i < 22; i++) {
    const y = h * rng() ** 2.2 * 0.5;
    acero(ctx, rng.range(10, w - 10), y, rng.range(7, 10), rng.range(0, 6.28), FOGLIE[Math.floor(rng() * 4)], 0.75);
  }
}
