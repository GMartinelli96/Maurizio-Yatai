// I disegni dei riscontri dei Vizi del cast (ticket 09, passo 4): la moneta d'oro di Nella e l'ovale di calma di
// Balosso. Piccoli, a matita come il resto, e senza testo: un Vizio si capisce guardando. Li mette in scena
// SerataScene (lo Yen d'oro) e ClienteView (la calma).

import {
  ellipse, pastelFill, pencilLine, roundedPolygon, smoothCurve,
} from '../kit/matita.js';

// ---------------------------------------------------------------------------------------------
// Lo Yen d'oro (GLOSSARY.md): la moneta che a volte lascia Nella. È la monetina da 5 yen con il buco, ma d'oro vero
// (più scuro e acceso dello Yen giallo), con la luce sul bordo e una stellina che luccica.

export const MONETA_ORO_SIZE = { w: 84, h: 84 };

const ORO = { colore: '#f2b824', ombra: '#b8800c', luce: '#ffe58a' };
const LUCE = { colore: '#fffdf0', ombra: '#fffdf0', luce: '#ffffff' };

export function drawMonetaOro(ctx, rng) {
  const cx = 38;
  const cy = 46;
  const fuori = ellipse(cx, cy, 31, 31);
  pastelFill(ctx, fuori, rng, ORO);
  // L'anello in rilievo, più chiaro, e quello interno più scuro.
  pencilLine(ctx, ellipse(cx, cy, 24.5, 24.5), rng, { width: 2.4, alpha: 0.9, color: ORO.luce, amount: 0.5 });
  pencilLine(ctx, ellipse(cx, cy, 21, 21), rng, { width: 1.6, alpha: 0.6, color: ORO.ombra, amount: 0.5 });
  pencilLine(ctx, fuori, rng);
  // Il buco: si toglie il colore e si ripassa il bordo, come per lo Yen.
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(cx, cy, 8.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  pencilLine(ctx, ellipse(cx, cy, 8.4, 8.4), rng, { width: 2.6, amount: 0.4 });
  // La luce che scivola sul bordo in alto a sinistra.
  pencilLine(ctx, smoothCurve([{ x: cx - 22, y: cy - 9 }, { x: cx - 15, y: cy - 19 }, { x: cx - 5, y: cy - 24 }], { closed: false }), rng, {
    closed: false, width: 3.4, amount: 0.3, color: LUCE.colore,
  });
  // La stellina a quattro punte che luccica, in alto a destra, dietro la moneta e un poco fuori.
  const sx = 66;
  const sy = 17;
  const stella = roundedPolygon([
    { x: sx, y: sy - 15 }, { x: sx + 3.6, y: sy - 3.6 }, { x: sx + 15, y: sy }, { x: sx + 3.6, y: sy + 3.6 },
    { x: sx, y: sy + 15 }, { x: sx - 3.6, y: sy + 3.6 }, { x: sx - 15, y: sy }, { x: sx - 3.6, y: sy - 3.6 },
  ], 1.5);
  pastelFill(ctx, stella, rng, { colore: '#fff3b0', ombra: '#f2b824', luce: '#ffffff' }, { volume: false, hatching: 0.3 });
  pencilLine(ctx, stella, rng, { width: 2, amount: 0.3 });
}

// ---------------------------------------------------------------------------------------------
// La calma di Balosso: un'ovale azzurra morbida con tre bollicine in cima, che sta dietro ai cuoricini di tutti finché
// Balosso è a un Posto. Si ingrandisce alla fila di cuoricini (non sempre 5), quindi è un'ovale larga e bassa.

export const CALMA_SIZE = { w: 260, h: 64 };

// Più chiara del cielo dell'Hanami (azzurro pallido), con il contorno azzurro deciso: si legge su ogni sfondo.
const CELESTE = { colore: '#f0f8ff', ombra: '#a9d3ee', luce: '#ffffff' };
const CONTORNO = '#5a9fd0';

export function drawCalma(ctx, rng) {
  const ovale = ellipse(130, 38, 122, 22);
  pastelFill(ctx, ovale, rng, CELESTE, { alpha: 0.95 });
  pencilLine(ctx, ovale, rng, { width: 2.8, alpha: 0.9, color: CONTORNO, amount: 0.8 });
  // Le bollicine che salgono, di tre misure.
  for (const [x, y, r] of [[58, 12, 5], [128, 7, 4], [196, 12, 6]]) {
    const bolla = ellipse(x, y, r, r);
    pastelFill(ctx, bolla, rng, { colore: '#f0f8ff', ombra: '#a9d3ee', luce: '#ffffff' }, { volume: false, hatching: 0, alpha: 0.95 });
    pencilLine(ctx, bolla, rng, { width: 2, alpha: 0.85, color: CONTORNO, amount: 0.3 });
  }
}

// Le voci da aggiungere a DISEGNI di catalogo.js.
export const DISEGNI_VIZI = {
  'moneta-oro': { ...MONETA_ORO_SIZE, draw: drawMonetaOro },
  calma: { ...CALMA_SIZE, draw: drawCalma },
};
