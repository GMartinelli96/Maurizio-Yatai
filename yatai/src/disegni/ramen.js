// Il ramen, il Piatto dello Yuki Matsuri (ticket 08): una ciotola bianca con la fascia rosa, il brodo dorato, i noodles
// e sopra l'uovo marinato o il naruto. Niente bacchette, mai (GAME_SPEC.md, "Cose da evitare"): nemmeno appoggiate.
//
// Le due varianti si riconoscono anche in bianco e nero (GAME_SPEC.md, "con icona, non solo colore"), soprattutto per la
// forma: l'uovo è mezzo ovale con il tuorlo tondo e scuro in mezzo; il naruto sono due dischi dal bordo ondulato con la
// spirale rosa. Lo stesso uovo e lo stesso naruto stanno sulla Scorta e sul Piatto, così chi vede la Scorta riconosce il Piatto.
//
// I Piatti hanno la misura dell'onigiri (onigiriSize): Bancone, icone dell'Ordine e volo dei Piatti scalano uguale. La
// versione bruciata (solo icona sulla Postazione) ha il brodo ridotto a una crosta nera e crepata, senza guarnizioni. Le
// Scorte stanno nel riquadro delle Postazioni (POSTAZIONE_SIZE: 132×152, poggiano sul fondo).

import { PALETTE as C, PIATTI, STILE } from '../config.js';
import { ellipse, pastelFill, pencilLine, restingShadow, roundedPolygon, roundedRect, smoothCurve } from '../kit/matita.js';
import { onigiriSize } from './onigiri.js';

const MARGIN = 9;
const FLAT = { volume: false };
// Le due misure del Piatto, come l'onigiri: sul Bancone e come icona dell'Ordine (catalogo.js).
const BANCONE = 150;
const ICONA = 64;

// Le due guarnizioni, per variante (le uniche cose che le distinguono sul Piatto).
export const GUARNIZIONI = ['uovo', 'naruto'];

function part(ctx, rng, shape, swatch, { fill = {}, line = {} } = {}) {
  pastelFill(ctx, shape, rng, swatch, fill);
  pencilLine(ctx, shape, rng, line);
}

// ---------------------------------------------------------------------------------------------
// L'uovo e il naruto, usati sul Piatto e sulle Scorte. (cx, cy) è il centro, r il raggio (metà della larghezza).

// Mezzo uovo marinato visto dall'alto: un ovale dall'albume ambrato e il tuorlo arancio in mezzo. `angolo` lo inclina.
function mezzoUovo(ctx, rng, cx, cy, r, angolo, linea) {
  part(ctx, rng, ellipse(cx, cy, r, r * 1.22, angolo), C.albume, { line: linea ? { width: linea } : {} });
  part(ctx, rng, ellipse(cx, cy + r * 0.04, r * 0.52, r * 0.56, angolo), C.tuorlo, { fill: FLAT, line: { width: linea ? linea * 0.6 : 1.6 } });
  pencilLine(ctx, [{ x: cx - r * 0.3, y: cy - r * 0.18 }, { x: cx - r * 0.08, y: cy - r * 0.32 }], rng, { closed: false, width: 1.8, color: C.tuorlo.luce, alpha: 0.95, amount: 0.15 });
}

// Una fetta di naruto: un disco dal bordo ondulato (12 onde), bianco, con la spirale rosa dal centro al bordo.
function fettaNaruto(ctx, rng, cx, cy, r, linea) {
  const onde = 12;
  const bordo = Array.from({ length: onde * 2 }, (_, i) => {
    const a = (i / (onde * 2)) * Math.PI * 2;
    const k = i % 2 ? 0.9 : 1.04;
    return { x: cx + Math.cos(a) * r * k, y: cy + Math.sin(a) * r * k };
  });
  part(ctx, rng, smoothCurve(bordo), C.nuvola, { line: linea ? { width: linea } : {} });
  // La spirale rosa: due giri e un po' sul disco grande, uno e mezzo su quello piccolo (sull'icona), così si legge.
  const punti = r >= 14 ? 22 : 15;
  const spirale = Array.from({ length: punti }, (_, i) => {
    const a = i * 0.62;
    const raggio = r * (0.1 + (i / (punti - 1)) * 0.64);
    return { x: cx + Math.cos(a) * raggio, y: cy + Math.sin(a) * raggio };
  });
  pencilLine(ctx, smoothCurve(spirale, { closed: false }), rng, { closed: false, width: Math.max(1.6, r * 0.17), color: C.rosa.ombra, amount: 0.12 });
}

// ---------------------------------------------------------------------------------------------
// Il Piatto. size è la larghezza, come per l'onigiri.

export function drawRamen(ctx, rng, size, guarnizione, bruciato = false) {
  const m = MARGIN;
  const linea = STILE.linea.spessore * Math.min(1, Math.max(0.8, size / 150));
  const at = (fx, fy) => ({ x: m + size * fx, y: m + size * fy });
  if (!bruciato && !GUARNIZIONI.includes(guarnizione)) throw new RangeError(`variante sconosciuta: ${guarnizione}`);

  // La ciotola: il corpo bianco che si stringe verso il piede, con la fascia rosa, e il bordo ovale in alto.
  const corpo = roundedPolygon([at(0.06, 0.46), at(0.94, 0.46), at(0.78, 0.86), at(0.22, 0.86)], 12);
  part(ctx, rng, corpo, bruciato ? { colore: C.nuvola.ombra, ombra: '#a8987f', luce: C.nuvola.colore } : C.nuvola, { line: { width: linea } });
  const fascia = roundedPolygon([at(0.11, 0.58), at(0.89, 0.58), at(0.85, 0.68), at(0.15, 0.68)], 4);
  part(ctx, rng, fascia, C.rosa, { fill: FLAT, line: { width: linea * 0.6 } });
  const bordo = ellipse(at(0.5, 0.46).x, at(0.5, 0.46).y, size * 0.44, size * 0.13);
  part(ctx, rng, bordo, C.nuvola, { fill: FLAT, line: { width: linea } });

  // Dentro: il brodo, o la crosta nera se è bruciato.
  const centro = at(0.5, 0.46);
  const dentro = ellipse(centro.x, centro.y + size * 0.006, size * 0.375, size * 0.1);
  if (bruciato) {
    part(ctx, rng, dentro, C.bruciato, { fill: FLAT, line: { width: linea * 0.7 } });
    pencilLine(ctx, [at(0.3, 0.44), at(0.4, 0.47), at(0.36, 0.5)], rng, { closed: false, width: 1.8, color: C.bruciato.luce, alpha: 0.9, amount: 0.4 });
    pencilLine(ctx, [at(0.58, 0.43), at(0.66, 0.47), at(0.72, 0.45)], rng, { closed: false, width: 1.8, color: C.bruciato.luce, alpha: 0.9, amount: 0.4 });
    return;
  }
  part(ctx, rng, dentro, C.brodo, { fill: FLAT, line: { width: linea * 0.7 } });

  // I noodles: onde gialle che attraversano il brodo.
  const onde = size >= 100 ? 3 : 2;
  for (let i = 0; i < onde; i += 1) {
    const y = 0.43 + i * 0.035;
    const onda = smoothCurve([at(0.2, y), at(0.3, y - 0.025), at(0.4, y + 0.02), at(0.5, y - 0.02), at(0.6, y + 0.02), at(0.7, y - 0.02), at(0.8, y)], { closed: false });
    pencilLine(ctx, onda, rng, { closed: false, width: Math.max(2.6, size * 0.04), color: C.noodles.colore, amount: 0.2 });
    pencilLine(ctx, onda, rng, { closed: false, width: 1.1, color: C.noodles.ombra, alpha: 0.6, amount: 0.2 });
  }

  // Il foglio di alga, dritto dietro la guarnizione, e un po' di cipollotto sul brodo.
  const alga = roundedPolygon([at(0.66, 0.2), at(0.82, 0.24), at(0.78, 0.46), at(0.62, 0.42)], 3);
  part(ctx, rng, alga, C.nori, { fill: FLAT, line: { width: linea * 0.7 } });
  for (const [fx, fy] of [[0.28, 0.5], [0.6, 0.5], [0.42, 0.52]]) {
    pencilLine(ctx, ellipse(at(fx, fy).x, at(fx, fy).y, size * 0.014 + 1, size * 0.01 + 0.8), rng, { width: 1.6, color: C.aonori, amount: 0.15 });
  }

  // La guarnizione che distingue il Piatto: davanti all'alga, sopra il brodo.
  if (guarnizione === 'uovo') {
    const p = at(0.4, 0.36);
    mezzoUovo(ctx, rng, p.x, p.y, size * 0.12, 0.5, linea * 0.8);
  } else {
    const dietro = at(0.34, 0.36);
    fettaNaruto(ctx, rng, dietro.x, dietro.y, size * 0.125, linea * 0.8);
    const davanti = at(0.48, 0.4);
    fettaNaruto(ctx, rng, davanti.x, davanti.y, size * 0.125, linea * 0.8);
  }
}

// ---------------------------------------------------------------------------------------------
// Le Scorte: i noodles, il brodo, l'uovo e il naruto. Chiave: l'id dell'Ingrediente (config.js, PIATTI.ramen.ricetta).

// I noodles: un nido giallo di onde sovrapposte, tenuto da una fascetta rosa, su un vassoio di legno.
function drawScortaNoodles(ctx, rng) {
  restingShadow(ctx, 66, 138, 58, 10);
  part(ctx, rng, roundedRect(10, 116, 112, 20, 9), C.legnoChiaro);
  part(ctx, rng, ellipse(66, 96, 46, 24), C.noodles);
  for (const [dy, fase] of [[-12, 0], [-4, 1], [4, 0], [12, 1]]) {
    const y = 96 + dy;
    const s = fase ? 1 : -1;
    pencilLine(ctx, smoothCurve([{ x: 26, y }, { x: 40, y: y - 6 * s }, { x: 54, y: y + 6 * s }, { x: 68, y: y - 6 * s }, { x: 82, y: y + 6 * s }, { x: 96, y: y - 5 * s }, { x: 106, y }], { closed: false }), rng, {
      closed: false, width: 3.2, color: C.noodles.ombra, alpha: 0.85, amount: 0.25,
    });
  }
  pencilLine(ctx, smoothCurve([{ x: 30, y: 84 }, { x: 46, y: 72 }, { x: 70, y: 70 }, { x: 94, y: 80 }, { x: 102, y: 92 }], { closed: false }), rng, { closed: false, width: 3.4, color: C.noodles.luce, amount: 0.3 });
  // La fascetta di carta.
  part(ctx, rng, roundedPolygon([{ x: 54, y: 72 }, { x: 80, y: 72 }, { x: 82, y: 118 }, { x: 52, y: 118 }], 4), C.rosa, { fill: FLAT, line: { width: 2.2 } });
}

// Il brodo: una zuppiera blu con due manici, il coperchio un po' sollevato e il brodo dorato che si vede, con il vapore.
function drawScortaBrodo(ctx, rng) {
  restingShadow(ctx, 66, 138, 54, 10);
  for (const x of [14, 118]) part(ctx, rng, ellipse(x, 104, 10, 8), C.salopette, { fill: FLAT, line: { width: 2.4 } });
  part(ctx, rng, ellipse(66, 108, 50, 30), C.salopette);
  part(ctx, rng, ellipse(66, 84, 40, 9), C.brodo, { fill: FLAT, line: { width: 2.2 } });
  // Il coperchio, sollevato e spostato a destra: la cupola e il pomello.
  const cupola = smoothCurve([{ x: 40, y: 78 }, { x: 52, y: 56 }, { x: 80, y: 50 }, { x: 108, y: 60 }, { x: 118, y: 76 }, { x: 80, y: 80 }]);
  part(ctx, rng, cupola, C.salopette);
  part(ctx, rng, ellipse(82, 48, 8, 6), C.giallo, { fill: FLAT, line: { width: 2.2 } });
  pencilLine(ctx, [{ x: 28, y: 100 }, { x: 32, y: 118 }], rng, { closed: false, width: 3.2, color: C.salopette.luce, amount: 0.3, alpha: 0.9 });
  for (const [x, top] of [[38, 22], [54, 12]]) {
    pencilLine(ctx, smoothCurve([{ x, y: 70 }, { x: x - 6, y: 54 }, { x: x + 5, y: 40 }, { x: x - 2, y: top }], { closed: false }), rng, { closed: false, width: 3, color: '#b9aea4', alpha: 0.75, amount: 0.8 });
  }
}

// L'uovo marinato: due metà su un piattino, il tuorlo arancio in mezzo a ognuna.
function drawScortaUovo(ctx, rng) {
  restingShadow(ctx, 66, 138, 56, 10);
  part(ctx, rng, ellipse(66, 124, 58, 15), C.nuvola);
  part(ctx, rng, ellipse(66, 121, 46, 9), { colore: C.nuvola.ombra, ombra: C.nuvola.ombra, luce: C.nuvola.colore }, { fill: FLAT, line: { width: 1.6 } });
  mezzoUovo(ctx, rng, 84, 80, 24, 0.35, 2.8);
  mezzoUovo(ctx, rng, 48, 96, 26, -0.3, 2.8);
}

// Il naruto: tre fette dal bordo ondulato e la spirale rosa, appoggiate una dietro l'altra su un tagliere.
function drawScortaNaruto(ctx, rng) {
  restingShadow(ctx, 66, 138, 58, 10);
  part(ctx, rng, roundedRect(8, 118, 116, 18, 8), C.legnoChiaro);
  fettaNaruto(ctx, rng, 90, 76, 24, 2.8);
  fettaNaruto(ctx, rng, 66, 90, 27, 2.8);
  fettaNaruto(ctx, rng, 42, 104, 26, 2.8);
}

// L'icona del passo a scelta nella Ricetta, finché non si è scelta la guarnizione: mezzo uovo e una fetta di naruto, uno
// accanto all'altro. Nel riquadro delle Scorte, per scalare come le altre icone.
function drawPassoGuarnizione(ctx, rng) {
  restingShadow(ctx, 66, 138, 54, 9);
  mezzoUovo(ctx, rng, 38, 104, 22, 0.3, 2.6);
  fettaNaruto(ctx, rng, 92, 98, 28, 2.6);
}

export const PASSO_GUARNIZIONE = { w: 132, h: 152, draw: drawPassoGuarnizione };

export const SCORTE_RAMEN = {
  noodles: drawScortaNoodles,
  brodo: drawScortaBrodo,
  uovo: drawScortaUovo,
  naruto: drawScortaNaruto,
};

// I disegni del catalogo (catalogo.js): i due Piatti (`ramen-uovo` per il Bancone, `ramen-uovo-icona` per l'Ordine), il ramen
// bruciato che sta sulla Postazione, e l'icona del passo a scelta nella Ricetta (`passo-guarnizione`).
export const DISEGNI_RAMEN = {
  ...Object.fromEntries(
    PIATTI.ramen.varianti.flatMap((variante) => [
      [`ramen-${variante}`, { ...onigiriSize(BANCONE), draw: (ctx, rng) => drawRamen(ctx, rng, BANCONE, variante) }],
      [`ramen-${variante}-icona`, { ...onigiriSize(ICONA), draw: (ctx, rng) => drawRamen(ctx, rng, ICONA, variante) }],
    ]),
  ),
  'ramen-bruciato-icona': { ...onigiriSize(ICONA), draw: (ctx, rng) => drawRamen(ctx, rng, ICONA, null, true) },
  'passo-guarnizione': PASSO_GUARNIZIONE,
};
