// Lo Yatai: il pavimento della bancarella, il Bancone e il Posto. Tutto visto da davanti e un po'
// dall'alto (come negli altri giochi di Maurizio): più in alto sullo schermo è più lontano.
//
// Niente torii, bandiere o bacchette (GAME_SPEC.md, "Cose da evitare"). Il davanti del Bancone è
// una tendina a strisce verticali con il bordo a onde, come le tendine di FarmPlush.
//
// Il pavimento, la tendina e il cuscino prendono i colori del tema del Matsuri (TEMI in config.js):
// ogni disegno riceve il suo tema, e il catalogo (sfondi/index.js) ne fa una texture per Matsuri.
// Il legno del piano del Bancone, le gambe dello sgabello e il bottone non cambiano mai.

import { MATSURI_PREDEFINITO, PALETTE as C, TEMI } from '../config.js';
import { mixHex, pastello } from './sfondi/comune.js';
import { pastelFill, pencilLine, restingShadow, roundedRect, ellipse, smoothCurve } from '../kit/matita.js';

const TEMA_PREDEFINITO = TEMI[MATSURI_PREDEFINITO];

// ---------------------------------------------------------------------------------------------
// Il pavimento: assi di legno chiaro in file sfalsate. È alto abbastanza da coprire il gioco fino
// in fondo anche sul telefono più lungo (SCHERMO.maxHeight).

export const PAVIMENTO_SIZE = { w: 720, h: 1000 };

const ASSE = 62;

// `decoro(ctx, rng, tema, w, h)` è facoltativo: i petali sparsi dell'Hanami, le foglie dell'Aki.
export function drawPavimento(ctx, rng, tema = TEMA_PREDEFINITO, decoro = null) {
  const { w, h } = PAVIMENTO_SIZE;
  const legno = tema.pavimento;
  // Due toni di legno, a file alterne.
  const ASSI = [legno, { colore: mixHex(legno.colore, legno.luce, 0.55), ombra: legno.ombra, luce: legno.luce }];
  // Le linee tra un'asse e l'altra sono sottili e un po' chiare: se fossero scure come i contorni
  // delle cose, il pavimento sembrerebbe un muro di mattoni.
  const GIUNTURA = { closed: false, width: 2.1, alpha: 0.6, color: legno.ombra, amount: 1 };
  // Ogni fila è un'unica lunga asse colorata a pastello. Il tratteggio si dà una volta sola su tutto
  // il pavimento, dopo le assi (è lo stesso tratteggio, ma con un sesto dei tratti da disegnare).
  const file = [];
  for (let y = -rng() * 20, row = 0; y < h; y += ASSE, row++) {
    pastelFill(ctx, roundedRect(-8, y, w + 16, ASSE, 2), rng, ASSI[row % 2], { volume: false, hatching: 0 });
    file.push(y);
  }
  pastello(ctx, rng, { x: 0, y: 0, w, h }, legno, 0.8, 1.1);
  for (const y of file) {
    // Le giunture, una in fondo a ogni asse e una o due a metà.
    pencilLine(ctx, [{ x: -8, y: y + ASSE }, { x: w + 8, y: y + ASSE }], rng, GIUNTURA);
    for (let x = rng.range(80, 300); x < w - 60; x += rng.range(330, 520)) {
      pencilLine(ctx, [{ x, y }, { x, y: y + ASSE }], rng, GIUNTURA);
    }
    // Le venature: righette lunghe e sottili lungo l'asse.
    for (let k = 0; k < 3; k++) {
      const gx = rng.range(10, w - 200);
      const gy = y + rng.range(12, ASSE - 12);
      pencilLine(ctx, [{ x: gx, y: gy }, { x: gx + rng.range(90, 190), y: gy + rng.jitter(3) }], rng, {
        closed: false, width: 1.3, alpha: 0.3, color: legno.ombra, amount: 0.8,
      });
    }
  }
  decoro?.(ctx, rng, tema, w, h);
  // L'ombra del Bancone sul pavimento: strisce sempre più chiare.
  ctx.save();
  ctx.fillStyle = C.inchiostro;
  for (let k = 0; k < 10; k++) {
    ctx.globalAlpha = 0.03;
    ctx.fillRect(0, 0, w, 70 - k * 6);
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------------------------
// Il Bancone: il piano in legno (dove stanno i Piatti pronti), il bordo e la tendina davanti.

export const BANCONE_SIZE = { w: 720, h: 200 };
// Quanto è alto il piano, in pixel del disegno: serve a posare i Piatti sul piano giusto.
export const BANCONE_PIANO = 132;

const BORDO = { colore: C.legnoScuro.ombra, ombra: '#8a5a2c', luce: C.legnoScuro.colore };

export function drawBancone(ctx, rng, tema = TEMA_PREDEFINITO) {
  const { w } = BANCONE_SIZE;
  const TENDINA = tema.tendina;

  // La tendina, una striscia alla volta; la parte alta la copre il bordo.
  const stripe = 60;
  for (let i = 0, x = 0; x < w; i++, x += stripe) {
    const shape = roundedRect(x + 1, 120, stripe - 2, 74, 28);
    pastelFill(ctx, shape, rng, TENDINA[i % 2], { volume: false, hatching: 0.8 });
    pencilLine(ctx, shape, rng, { width: 2.6, amount: 1.1 });
  }

  // Il piano: due assi lunghe.
  for (const [y, hh] of [[6, 62], [66, 62]]) {
    const board = roundedRect(-8, y, w + 16, hh, 12);
    pastelFill(ctx, board, rng, C.legnoScuro, { volume: false, hatching: 0.9 });
    pencilLine(ctx, board, rng, { width: 3 });
    for (let k = 0; k < 4; k++) {
      const gx = rng.range(20, w - 160);
      const gy = y + rng.range(14, hh - 14);
      pencilLine(ctx, [{ x: gx, y: gy }, { x: gx + rng.range(60, 140), y: gy + rng.jitter(3) }], rng, {
        closed: false, width: 1.4, alpha: 0.3, color: C.legnoScuro.ombra, amount: 0.8,
      });
    }
  }

  // Il bordo davanti al piano, più scuro.
  const lip = roundedRect(-8, BANCONE_PIANO - 12, w + 16, 22, 10);
  pastelFill(ctx, lip, rng, BORDO, { volume: false, hatching: 0.8 });
  pencilLine(ctx, lip, rng, { width: 3 });
}

// ---------------------------------------------------------------------------------------------
// Il Posto: uno sgabello con il cuscino del colore del tema, dove si siede (o si ferma) un Cliente.

export const POSTO_SIZE = { w: 150, h: 100 };

export function drawPosto(ctx, rng, tema = TEMA_PREDEFINITO) {
  const cuscino = tema.cuscino;
  restingShadow(ctx, 75, 88, 62, 9);

  // Le gambe dello sgabello.
  for (const x of [34, 100]) {
    const leg = roundedRect(x, 50, 16, 40, 6);
    pastelFill(ctx, leg, rng, C.legnoScuro, { volume: false, hatching: 0.7 });
    pencilLine(ctx, leg, rng, { width: 2.6 });
  }
  const leg = roundedRect(67, 54, 16, 34, 6);
  pastelFill(ctx, leg, rng, C.legnoScuro, { volume: false, hatching: 0.7 });
  pencilLine(ctx, leg, rng, { width: 2.6 });

  // Il fianco in legno e sopra il cuscino rosa con il bottoncino al centro.
  const side = roundedRect(14, 38, 122, 22, 10);
  pastelFill(ctx, side, rng, C.legnoScuro, { volume: false, hatching: 0.8 });
  pencilLine(ctx, side, rng, { width: 3 });

  const cushion = smoothCurve([
    { x: 75, y: 12 }, { x: 118, y: 17 }, { x: 138, y: 34 }, { x: 118, y: 52 },
    { x: 75, y: 57 }, { x: 32, y: 52 }, { x: 12, y: 34 }, { x: 32, y: 17 },
  ]);
  pastelFill(ctx, cushion, rng, cuscino);
  pencilLine(ctx, cushion, rng);
  const button = ellipse(75, 35, 7, 4.5);
  pastelFill(ctx, button, rng, C.giallo, { volume: false, hatching: 0 });
  pencilLine(ctx, button, rng, { width: 2 });
  for (const [dx, dy] of [[-26, -3], [26, -3], [0, -12], [0, 11]]) {
    pencilLine(ctx, [{ x: 75, y: 35 }, { x: 75 + dx, y: 35 + dy }], rng, {
      closed: false, width: 1.6, alpha: 0.45, color: cuscino.ombra, amount: 0.5,
    });
  }
}
