// Le icone dei Potenziamenti della Bottega (ticket 35), disegnate come il resto: contorno a matita e pastello, niente
// testo (si leggono anche senza sapere la lingua). La chiave della texture è `icona-` più l'id in POTENZIAMENTI.
//   icona-postoInPiu  lo sgabello dei Posti con il segno "+": un Posto in più
//   icona-ventaglio   l'uchiwa, il ventaglio rotondo di carta rosa con un fiore di ciliegio (docs/ricerca/piatti-e-matsuri.md)
//   icona-piastraPiuVeloce  la piastra del takoyaki con un lampo giallo: cuoce più in fretta (ticket 06)

import { PALETTE as C } from '../config.js';
import { ellipse, pastelFill, pencilLine, roundedPolygon, roundedRect } from '../kit/matita.js';
import { POSTAZIONI } from './postazioni.js';
import { drawPosto } from './yatai.js';

export const ICONA_SIZE = { w: 120, h: 120 };

const BIANCO = { colore: '#ffffff', ombra: '#ffffff', luce: '#ffffff' };

export function drawIconaPosto(ctx, rng) {
  // Lo sgabello vero dei Posti (150×100), più piccolo e un po' in basso, per lasciare posto al segno.
  ctx.save();
  ctx.translate(4, 30);
  ctx.scale(0.78, 0.78);
  drawPosto(ctx, rng);
  ctx.restore();

  // Il "+": un disco di menta in alto a destra con la croce.
  const cx = 94;
  const cy = 28;
  const disco = ellipse(cx, cy, 21, 21);
  pastelFill(ctx, disco, rng, C.menta, { hatching: 0.7 });
  pencilLine(ctx, disco, rng, { width: 3 });
  pencilLine(ctx, [{ x: cx - 10, y: cy }, { x: cx + 10, y: cy }], rng, { closed: false, width: 5, amount: 0.3 });
  pencilLine(ctx, [{ x: cx, y: cy - 10 }, { x: cx, y: cy + 10 }], rng, { closed: false, width: 5, amount: 0.3 });
}

export function drawIconaVentaglio(ctx, rng) {
  const cx = 60;
  const cy = 48;
  const R = 39;

  // Il manico di bambù, dietro la carta.
  const manico = roundedRect(52, 78, 16, 38, 7);
  pastelFill(ctx, manico, rng, C.legnoChiaro, { volume: false, hatching: 0.7 });
  pencilLine(ctx, manico, rng, { width: 3 });
  pencilLine(ctx, [{ x: 52, y: 100 }, { x: 68, y: 100 }], rng, { closed: false, width: 2, alpha: 0.5, color: C.legnoChiaro.ombra, amount: 0.4 });

  // La carta rotonda e le stecche che partono dal manico.
  const faccia = ellipse(cx, cy, R, R);
  pastelFill(ctx, faccia, rng, C.rosa, { hatching: 0.8 });
  for (const gradi of [-52, -26, 0, 26, 52]) {
    const a = (gradi * Math.PI) / 180;
    pencilLine(ctx, [{ x: cx, y: cy + R - 3 }, { x: cx + Math.sin(a) * (R - 5), y: cy - Math.cos(a) * (R - 5) }], rng, {
      closed: false, width: 1.8, alpha: 0.4, color: C.rosa.ombra, amount: 0.5,
    });
  }
  pencilLine(ctx, ellipse(cx, cy, R - 6, R - 6), rng, { width: 1.6, alpha: 0.5, color: C.rosa.ombra, amount: 0.6 });
  pencilLine(ctx, faccia, rng, { width: 3.2 });

  // Il fiore di ciliegio al centro: cinque petali bianchi e il cuore giallo.
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
    const petalo = ellipse(cx + Math.cos(a) * 9, cy - 4 + Math.sin(a) * 9, 7.5, 5.6, a);
    pastelFill(ctx, petalo, rng, BIANCO, { volume: false, hatching: 0 });
    pencilLine(ctx, petalo, rng, { width: 2, amount: 0.4 });
  }
  const cuore = ellipse(cx, cy - 4, 3.6, 3.6);
  pastelFill(ctx, cuore, rng, C.giallo, { volume: false, hatching: 0 });
  pencilLine(ctx, cuore, rng, { width: 1.6, amount: 0.3 });
}

// La piastra vera della Postazione (132×152), più piccola e in basso a sinistra, e in alto a destra un disco giallo con un
// lampo: lo stesso posto del "+" dello sgabello, così le icone della Bottega si leggono allo stesso modo.
export function drawIconaPiastra(ctx, rng) {
  ctx.save();
  ctx.translate(2, 16);
  ctx.scale(0.78, 0.78);
  POSTAZIONI.takoyaki(ctx, rng);
  ctx.restore();

  const cx = 94;
  const cy = 28;
  const disco = ellipse(cx, cy, 21, 21);
  pastelFill(ctx, disco, rng, C.giallo, { hatching: 0.7 });
  pencilLine(ctx, disco, rng, { width: 3 });
  // Il lampo: una zeta stretta con la punta in basso.
  const lampo = roundedPolygon([
    { x: cx + 3, y: cy - 14 }, { x: cx - 9, y: cy + 3 }, { x: cx - 1, y: cy + 3 },
    { x: cx - 4, y: cy + 14 }, { x: cx + 9, y: cy - 3 }, { x: cx + 1, y: cy - 3 },
  ], 1.5);
  pastelFill(ctx, lampo, rng, C.rosa, { volume: false, hatching: 0.3 });
  pencilLine(ctx, lampo, rng, { width: 2.4, amount: 0.3 });
}
