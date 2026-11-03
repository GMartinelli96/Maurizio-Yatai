// Hanabi (花火大会), piena estate, notte: blu e viola, un fiume con i riflessi, fuochi d'artificio a
// sfera sopra il fiume e, in lontananza, le file di bancarelle con le lanterne (ricerca, 4.3).
//
// ATTENZIONE: nessun fuoco deve somigliare alla bandiera del Sol Levante (GAME_SPEC.md, "Cose da
// evitare"). Qui i fuochi sono sfere morbide di scintille a goccia in pastelli vari, con il centro
// vuoto: niente dischi, niente raggi, niente rosso e bianco a spicchi.

import { SFONDO } from '../../config.js';
import { pastelFill, pencilLine, roundedPolygon, roundedRect } from '../../kit/matita.js';
import { LONTANO, alone, collina, corda, fasce, lanterna, mixHex, pastello, puntini, ramo, sfumatura, specchia, tinta } from './comune.js';

const W = 720;
const H = SFONDO.cielo.h - SFONDO.cielo.sotto;

// I pastelli dei fuochi (nessun rosso): rosa, giallo, azzurro, verde.
export const FUOCO = { rosa: '#f7a8c4', giallo: '#f7d26a', azzurro: '#8fd3f0', verde: '#a8e6a1' };
// Dove e di che colore sono i fuochi sopra il fiume: servono anche ai riflessi nell'acqua.
const SFERE = [
  { x: 150, y: 330, r: 92, a: FUOCO.rosa, b: FUOCO.giallo },
  { x: 540, y: 272, r: 110, a: FUOCO.azzurro, b: '#d6f1fb' },
  { x: 372, y: 410, r: 60, a: FUOCO.giallo, b: FUOCO.verde },
  { x: 662, y: 408, r: 66, a: FUOCO.verde, b: FUOCO.rosa },
  { x: 300, y: 160, r: 82, a: FUOCO.giallo, b: FUOCO.azzurro },
];

// Una sfera di scintille: un alone leggero, poi tre anelli di gocce (la testa e una coda corta che
// cade un poco verso il basso). Il centro resta vuoto.
export function fuoco(ctx, rng, { x, y, r, a, b }) {
  alone(ctx, x, y, r * 1.1, a, 0.14);
  const anelli = [[18, 1, a, 3.6, 0.24], [18, 0.62, b, 2.8, 0.2], [10, 0.32, '#fffdf2', 2.2, 0.14]];
  ctx.save();
  ctx.lineCap = 'round';
  for (const [n, f, colore, testa, coda] of anelli) {
    const sfasa = rng() * Math.PI;
    for (let i = 0; i < n; i++) {
      const ang = sfasa + (i / n) * Math.PI * 2 + rng.jitter(0.05);
      const d = r * f * rng.range(0.94, 1.04);
      const hx = x + Math.cos(ang) * d;
      const hy = y + Math.sin(ang) * d + r * 0.05 * f;
      // La coda torna verso il centro e si piega verso il basso, come una goccia che cade.
      const tx = hx - Math.cos(ang) * r * coda;
      const ty = hy - Math.sin(ang) * r * coda + r * coda * 0.45;
      ctx.strokeStyle = colore;
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = testa * 0.8;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.quadraticCurveTo((hx + tx) / 2, (hy + ty) / 2 + r * 0.04, tx, ty);
      ctx.stroke();
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = colore;
      ctx.beginPath();
      ctx.arc(hx, hy, testa, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// Una bancarella lontana: un banco scuro con il tendone a strisce verticali e una lanterna accesa.
function bancarella(ctx, rng, x, base, w, sw) {
  const h = rng.range(24, 32);
  const corpo = roundedRect(x - w / 2, base - h, w, h, 3);
  pastelFill(ctx, corpo, rng, tinta('#4a3d86', 0.3), { volume: false, hatching: 0.2 });
  const tenda = roundedPolygon([{ x: x - w / 2 - 4, y: base - h }, { x: x + w / 2 + 4, y: base - h }, { x: x + w / 2 - 1, y: base - h - 13 }, { x: x - w / 2 + 1, y: base - h - 13 }], 2);
  pastelFill(ctx, tenda, rng, sw, { volume: false, hatching: 0.2 });
  ctx.save();
  ctx.fillStyle = mixHex(sw.colore, '#ffffff', 0.5);
  ctx.globalAlpha = 0.55;
  for (let sx = x - w / 2; sx < x + w / 2 - 3; sx += 8) ctx.fillRect(sx + 1, base - h - 12, 4, 12);
  ctx.restore();
  pencilLine(ctx, tenda, rng, { ...LONTANO, alpha: 0.25, width: 1.8 });
  alone(ctx, x, base - h + 9, 12, '#ffcf7a', 0.4);
  puntini(ctx, rng, 1, { x: x - 1.5, y: base - h + 7.5, w: 3, h: 3 }, '#ffe9b0', { alpha: [0.9, 1], raggio: [2, 2.6] });
}

export function cielo(ctx, rng, T) {
  fasce(ctx, rng, { w: W, y0: 60, y1: H, n: 11, ampiezza: 5, sotto: 50, colore: (y) => sfumatura(T.cielo, (H - y) / 330) });
  pastello(ctx, rng, { x: 0, y: 0, w: W, h: SFONDO.cielo.h }, T.cielo, 0.5);
  puntini(ctx, rng, 70, { x: 0, y: 40, w: W, h: 330 }, '#fffdf2', { alpha: [0.25, 0.8], raggio: [0.7, 1.6] });
  for (const sfera of SFERE) fuoco(ctx, rng, sfera);

  // La riva lontana con le bancarelle, scura e a poco contrasto, e le lanterne appese a un filo.
  collina(ctx, rng, { w: W, y: 486, fondo: SFONDO.cielo.h, ampiezza: 4, sw: T.lontananza, colorePieno: mixHex(T.lontananza.colore, T.cielo.luce, 0.2), linea: 0.18 });
  const tende = [tinta('#9a8bd6'), tinta('#d8a2c4')];
  let i = 0;
  for (let x = 24; x < W - 10; x += rng.range(52, 74)) bancarella(ctx, rng, x, H + 6, rng.range(34, 46), tende[i++ % 2]);
  const filo = corda({ x: -10, y: H - 58 }, { x: W + 10, y: H - 52 }, 20);
  pencilLine(ctx, filo, rng, { closed: false, width: 1.6, alpha: 0.35, amount: 0.8 });
  for (let k = 1; k < 20; k++) {
    const p = filo[Math.round((k / 20) * (filo.length - 1))];
    alone(ctx, p.x, p.y + 6, 9, '#ffcf7a', 0.35);
    puntini(ctx, rng, 1, { x: p.x - 2, y: p.y + 4, w: 4, h: 4 }, '#ffe3a0', { alpha: [0.85, 1], raggio: [1.8, 2.6] });
  }
}

export function terra(ctx, rng, T) {
  // Il fiume: dall'orizzonte in giù, più chiaro vicino alla riva, poi la passeggiata scura.
  const fiume = (y) => mixHex(T.terra.luce, T.terra.colore, Math.min(1, (y - 20) / 130));
  collina(ctx, rng, { w: W, y: 14, fondo: SFONDO.terra.h, ampiezza: 3, sw: T.terra, colorePieno: fiume(20), linea: 0.2 });
  fasce(ctx, rng, { w: W, daY: 30, y0: 30, y1: 170, n: 7, ampiezza: 3, sotto: 20, colore: fiume });
  collina(ctx, rng, { w: W, y: 176, fondo: SFONDO.terra.h, ampiezza: 5, sw: T.terra, colorePieno: mixHex(T.terra.ombra, T.terra.colore, 0.35), linea: 0.3 });
  fasce(ctx, rng, { w: W, daY: 230, y0: 230, y1: 360, n: 3, ampiezza: 6, sotto: 130, colore: () => mixHex(T.terra.ombra, T.terra.colore, 0.5) });
  pastello(ctx, rng, { x: 0, y: 6, w: W, h: SFONDO.terra.h - 6 }, T.terra, 0.5);

  // I riflessi dei fuochi nell'acqua: trattini orizzontali, sotto ogni sfera, del suo colore.
  ctx.save();
  ctx.lineCap = 'round';
  for (const { x, r, a, b } of SFERE) {
    for (let k = 0; k < 11; k++) {
      ctx.strokeStyle = k % 3 ? a : b;
      ctx.globalAlpha = rng.range(0.25, 0.5);
      ctx.lineWidth = rng.range(2.5, 4.5);
      const y = 40 + k * 11.5;
      const largo = (r * 0.55 + rng.range(0, 16)) * (1 - k * 0.04);
      const cx = x + rng.jitter(10);
      ctx.beginPath();
      ctx.moveTo(cx - largo / 2, y);
      ctx.lineTo(cx + largo / 2, y + rng.jitter(1));
      ctx.stroke();
    }
  }
  // Le onde: archi sottili e chiari.
  ctx.strokeStyle = T.terra.luce;
  ctx.lineWidth = 1.8;
  for (let k = 0; k < 26; k++) {
    const x = rng.range(0, W);
    const y = rng.range(36, 160);
    ctx.globalAlpha = rng.range(0.15, 0.35);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 14, y - 3, x + 28, y);
    ctx.stroke();
  }
  ctx.restore();
  // Le luci delle bancarelle sull'acqua e sulla strada.
  for (let k = 0; k < 14; k++) alone(ctx, rng.range(10, W - 10), rng.range(34, 60), rng.range(6, 10), '#ffcf7a', 0.2);
  for (let k = 0; k < 6; k++) alone(ctx, rng.range(40, W - 40), rng.range(200, 300), rng.range(26, 44), '#ffcf7a', 0.1);
}

export function alto(ctx, rng, T) {
  // Le lanterne in fila appese a una corda che attraversa il cielo, tre colori pastello.
  const filo = corda({ x: -10, y: 14 }, { x: W + 10, y: 20 }, 34, 36);
  pencilLine(ctx, filo, rng, { closed: false, width: 2.2, alpha: 0.75, amount: 0.8 });
  const colori = [tinta('#ffd9a8', 0.15), tinta('#f7b9d8', 0.15), tinta('#fbe28a', 0.15)];
  for (let k = 0; k < 10; k++) {
    const p = filo[Math.round(((k + 0.5) / 10) * (filo.length - 1))];
    lanterna(ctx, rng, p.x, p.y + 38, 16, 21, colori[k % 3], { luce: '#ffcf7a', cordino: 14 });
  }
  // Due fuochi grandi, tagliati dall'angolo dello schermo.
  fuoco(ctx, rng, { x: 70, y: 120, r: 76, a: FUOCO.azzurro, b: FUOCO.rosa });
  fuoco(ctx, rng, { x: 664, y: 138, r: 70, a: FUOCO.rosa, b: FUOCO.verde });
}

// I pali con le lanterne: un palo di legno con un'asta in cima e tre lanterne di carta appese, in
// pastelli caldi (mai rosso con una scritta: niente lanterne cinesi). Sinistra e destra sono lo stesso
// disegno riflesso.
export function lato(ctx, rng, T, destro = false) {
  const w = SFONDO.lato.w;
  const h = SFONDO.lato.h;
  if (!destro) specchia(ctx, w);
  const legno = tinta('#7a5a4a', 0.2);
  ramo(ctx, rng, [{ x: 150, y: h + 10 }, { x: 152, y: 640 }, { x: 150, y: 340 }], 14, 10, legno, { contorno: 2.8 });
  ramo(ctx, rng, [{ x: 150, y: 346 }, { x: 110, y: 346 }, { x: 40, y: 350 }], 9, 7, legno, { contorno: 2.4 });
  const colori = [tinta('#ffd9a8', 0.15), tinta('#f7b9d8', 0.15), tinta('#fbe28a', 0.15)];
  [[132, 392], [86, 396], [40, 400]].forEach(([x, y], i) => lanterna(ctx, rng, x, y + 4, 17, 23, colori[i], { luce: '#ffcf7a', cordino: 18 }));
  // Una seconda fila più in basso, vicino ai Posti, più piccola.
  ramo(ctx, rng, [{ x: 150, y: 640 }, { x: 118, y: 640 }, { x: 80, y: 644 }], 8, 6, legno, { contorno: 2.2 });
  [[126, 676], [90, 680]].forEach(([x, y], i) => lanterna(ctx, rng, x, y + 4, 14, 19, colori[(i + 1) % 3], { luce: '#ffcf7a', cordino: 16 }));
}

export const decoroPavimento = null;
