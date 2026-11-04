// Il taiyaki, il Piatto dell'Aki Matsuri (ticket 08): un dolce a forma di pesce, dorato e a quadretti, riempito di fagioli
// rossi (anko) o di crema. Il ripieno è la variante e si vede: spunta in un mucchietto sul dorso del pesce, come quando
// la pasta si è aperta in cottura.
//
// Le due varianti si riconoscono anche in bianco e nero (GAME_SPEC.md, "con icona, non solo colore"), in tre modi:
//  - la luminosità del ripieno: i fagioli rossi quasi neri (~70), la crema chiarissima (~225), il pesce in mezzo (PALETTE);
//  - la grana: il mucchietto di fagioli è fatto di chicchi lucidi, quello di crema è liscio con un ricciolo in cima;
//  - le Scorte: un vassoio di legno con il mucchio di fagioli, un sac à poche con la crema.
// Lo stesso ripieno sta sulla Scorta e sul Piatto, così chi vede la Scorta riconosce il Piatto.
//
// I Piatti hanno la misura dell'onigiri (onigiriSize): Bancone, icone dell'Ordine e volo dei Piatti scalano uguale. La
// versione bruciata (solo icona sulla Postazione) è scura e crepata, senza ripieno. Le Scorte stanno nel riquadro delle
// Postazioni (POSTAZIONE_SIZE: 132×152, poggiano sul fondo).

import { PALETTE as C, PIATTI, STILE } from '../config.js';
import { ellipse, pastelFill, pencilLine, restingShadow, roundedPolygon, roundedRect, smoothCurve } from '../kit/matita.js';
import { onigiriSize } from './onigiri.js';

const MARGIN = 9;
const FLAT = { volume: false };
// Le due misure del Piatto, come l'onigiri: sul Bancone e come icona dell'Ordine (catalogo.js).
const BANCONE = 150;
const ICONA = 64;

// Il ripieno di ogni variante.
export const RIPIENO = { fagioli: C.fagioli, crema: C.crema };

function part(ctx, rng, shape, swatch, { fill = {}, line = {} } = {}) {
  pastelFill(ctx, shape, rng, swatch, fill);
  pencilLine(ctx, shape, rng, line);
}

// Un chicco di fagiolo: un ovale scuro con il riflesso.
function chicco(ctx, rng, x, y, r, angolo) {
  part(ctx, rng, ellipse(x, y, r, r * 0.72, angolo), C.fagioli, { fill: FLAT, line: { width: 1.5 } });
  pencilLine(ctx, [{ x: x - r * 0.45, y: y - r * 0.1 }, { x: x - r * 0.05, y: y - r * 0.32 }], rng, { closed: false, width: 1.5, color: C.fagioli.luce, alpha: 0.95, amount: 0.15 });
}

// ---------------------------------------------------------------------------------------------
// Il Piatto. size è la larghezza, come per l'onigiri.

// Il mucchietto di ripieno sul dorso: (cx, cy) è il centro del lato sotto, r la mezza larghezza.
const MUCCHIO = {
  fagioli: (ctx, rng, cx, cy, r, linea) => {
    const mucchio = smoothCurve([{ x: cx - r, y: cy + r * 0.1 }, { x: cx - r * 0.7, y: cy - r * 0.55 }, { x: cx - r * 0.2, y: cy - r * 0.95 }, { x: cx + r * 0.35, y: cy - r * 0.9 }, { x: cx + r * 0.8, y: cy - r * 0.45 }, { x: cx + r, y: cy + r * 0.1 }, { x: cx, y: cy + r * 0.25 }]);
    part(ctx, rng, mucchio, C.fagioli, { line: { width: linea } });
    for (const [dx, dy, a] of [[-0.45, -0.1, 0.4], [0.05, -0.5, -0.3], [0.5, -0.15, 0.8], [-0.1, 0.02, 0.1]]) {
      chicco(ctx, rng, cx + dx * r, cy + dy * r, r * 0.3, a);
    }
  },
  crema: (ctx, rng, cx, cy, r, linea) => {
    const mucchio = smoothCurve([{ x: cx - r, y: cy + r * 0.1 }, { x: cx - r * 0.75, y: cy - r * 0.5 }, { x: cx - r * 0.25, y: cy - r * 0.8 }, { x: cx + r * 0.3, y: cy - r * 0.78 }, { x: cx + r * 0.8, y: cy - r * 0.4 }, { x: cx + r, y: cy + r * 0.1 }, { x: cx, y: cy + r * 0.25 }]);
    part(ctx, rng, mucchio, C.crema, { line: { width: linea } });
    // Il ricciolo in cima, come una fiocca di crema.
    pencilLine(ctx, smoothCurve([{ x: cx - r * 0.5, y: cy - r * 0.2 }, { x: cx - r * 0.1, y: cy - r * 0.55 }, { x: cx + r * 0.3, y: cy - r * 0.35 }, { x: cx + r * 0.05, y: cy - r * 0.1 }], { closed: false }), rng, {
      closed: false, width: Math.max(2, linea * 0.7), color: C.crema.ombra, amount: 0.2,
    });
  },
};

export function drawTaiyaki(ctx, rng, size, variante, bruciato = false) {
  const m = MARGIN;
  const linea = STILE.linea.spessore * Math.min(1, Math.max(0.8, size / 150));
  const at = (fx, fy) => ({ x: m + size * fx, y: m + size * fy });
  const pasta = bruciato ? C.bruciato : C.taiyaki;
  if (!bruciato && !RIPIENO[variante]) throw new RangeError(`variante sconosciuta: ${variante}`);

  // La coda a forcella, dietro il corpo.
  const coda = roundedPolygon([at(0.66, 0.46), at(0.93, 0.2), at(0.88, 0.5), at(0.93, 0.8), at(0.66, 0.54)], 5);
  part(ctx, rng, coda, pasta, { line: { width: linea } });
  for (const dy of [-0.12, 0.12]) {
    pencilLine(ctx, [at(0.78, 0.5 + dy * 0.5), at(0.88, 0.5 + dy * 1.4)], rng, { closed: false, width: 1.4, color: pasta.ombra, alpha: 0.7, amount: 0.3 });
  }

  // Il corpo del pesce: la testa tonda a sinistra, il dorso e il ventre che si stringono verso la coda.
  const corpo = smoothCurve([at(0.04, 0.52), at(0.12, 0.36), at(0.3, 0.25), at(0.5, 0.21), at(0.68, 0.3), at(0.76, 0.5), at(0.68, 0.7), at(0.5, 0.79), at(0.3, 0.75), at(0.12, 0.64)]);
  part(ctx, rng, corpo, pasta, { line: { width: linea } });

  // Le squame a quadretti: file di archi sul corpo (meno, nell'icona piccola).
  const file = size >= 100 ? [[0.38, 0.38], [0.5, 0.36], [0.62, 0.42], [0.34, 0.5], [0.46, 0.5], [0.58, 0.52], [0.38, 0.62], [0.5, 0.64]] : [[0.4, 0.4], [0.54, 0.4], [0.46, 0.58]];
  for (const [fx, fy] of file) {
    const p = at(fx, fy);
    pencilLine(ctx, smoothCurve([{ x: p.x - size * 0.035, y: p.y - size * 0.045 }, { x: p.x + size * 0.01, y: p.y }, { x: p.x - size * 0.035, y: p.y + size * 0.045 }], { closed: false }), rng, {
      closed: false, width: 1.5, color: pasta.ombra, alpha: bruciato ? 0.9 : 0.8, amount: 0.25,
    });
  }

  if (bruciato) {
    // Le crepe della crosta bruciata, come sul takoyaki.
    pencilLine(ctx, [at(0.3, 0.32), at(0.36, 0.44), at(0.3, 0.56)], rng, { closed: false, width: 1.8, color: C.bruciato.luce, alpha: 0.9, amount: 0.4 });
    pencilLine(ctx, [at(0.55, 0.26), at(0.6, 0.4), at(0.7, 0.46)], rng, { closed: false, width: 1.8, color: C.bruciato.luce, alpha: 0.9, amount: 0.4 });
  } else {
    // Il ripieno che spunta dal dorso.
    const sul = at(0.46, 0.27);
    MUCCHIO[variante](ctx, rng, sul.x, sul.y, size * 0.17, linea);
  }

  // L'occhio e la bocca.
  const occhio = at(0.2, 0.46);
  part(ctx, rng, ellipse(occhio.x, occhio.y, size * 0.04, size * 0.04), bruciato ? C.bruciato : C.nuvola, { fill: FLAT, line: { width: linea * 0.55 } });
  pencilLine(ctx, ellipse(occhio.x + size * 0.006, occhio.y + size * 0.004, size * 0.016, size * 0.018), rng, { width: Math.max(2, linea * 0.8), color: C.inchiostro, amount: 0.1 });
  pencilLine(ctx, smoothCurve([at(0.07, 0.57), at(0.11, 0.6), at(0.15, 0.58)], { closed: false }), rng, { closed: false, width: 1.8, color: pasta.ombra, amount: 0.15 });
}

// ---------------------------------------------------------------------------------------------
// Le Scorte: l'impasto e i due ripieni. Chiave: l'id dell'Ingrediente (config.js, PIATTI.taiyaki.ricetta).

// L'impasto dolce: una ciotola rosa con la pastella chiara e una frusta che spunta, con le anse di ferro (non è un
// bastone dritto). La frusta alta la distingue dalla ciotola del riso e dalla brocca della pastella
// salata anche in bianco e nero.
function drawScortaImpasto(ctx, rng) {
  restingShadow(ctx, 66, 138, 56, 10);
  part(ctx, rng, roundedPolygon([{ x: 14, y: 90 }, { x: 118, y: 90 }, { x: 104, y: 136 }, { x: 28, y: 136 }], 16), C.rosa);
  part(ctx, rng, ellipse(66, 90, 52, 12), C.rosa, { fill: FLAT });
  part(ctx, rng, ellipse(66, 91, 44, 8), C.pastella, { fill: FLAT, line: { width: 2 } });
  pencilLine(ctx, smoothCurve([{ x: 42, y: 92 }, { x: 56, y: 88 }, { x: 72, y: 94 }, { x: 90, y: 90 }], { closed: false }), rng, { closed: false, width: 2, color: C.pastella.ombra, amount: 0.3 });
  pencilLine(ctx, [{ x: 28, y: 110 }, { x: 34, y: 124 }], rng, { closed: false, width: 3, color: C.rosa.luce, amount: 0.3, alpha: 0.9 });
  // La frusta: il manico di legno sopra e tre anse di ferro dentro la pastella.
  for (const rx of [18, 9]) {
    pencilLine(ctx, ellipse(66, 66, rx, 26), rng, { width: 2.6, color: C.ferro.ombra, amount: 0.25 });
  }
  pencilLine(ctx, [{ x: 66, y: 40 }, { x: 66, y: 92 }], rng, { closed: false, width: 2.4, color: C.ferro.ombra, amount: 0.2 });
  part(ctx, rng, roundedRect(58, 12, 16, 32, 7), C.legno, { fill: FLAT, line: { width: 2.4 } });
}

// I fagioli rossi: un vassoio di legno con un mucchio di chicchi scuri e lucidi, e qualche chicco sul bordo.
function drawScortaFagioli(ctx, rng) {
  restingShadow(ctx, 66, 138, 58, 10);
  part(ctx, rng, ellipse(66, 122, 58, 15), C.legnoChiaro);
  part(ctx, rng, ellipse(66, 119, 46, 9), { colore: C.legnoChiaro.ombra, ombra: C.legnoChiaro.ombra, luce: C.legnoChiaro.colore }, { fill: FLAT, line: { width: 1.6 } });
  const mucchio = smoothCurve([{ x: 22, y: 118 }, { x: 26, y: 96 }, { x: 42, y: 74 }, { x: 66, y: 64 }, { x: 90, y: 74 }, { x: 106, y: 96 }, { x: 110, y: 118 }, { x: 66, y: 126 }]);
  part(ctx, rng, mucchio, C.fagioli);
  for (const [x, y, a] of [[46, 98, 0.5], [66, 80, -0.3], [84, 94, 0.9], [60, 106, 0.1], [40, 112, -0.7], [92, 112, 0.4], [74, 114, 0.2], [58, 92, -0.5]]) chicco(ctx, rng, x, y, 6.5, a);
  for (const [x, y, a] of [[18, 126, 0.3], [114, 128, -0.5], [100, 134, 0.8]]) chicco(ctx, rng, x, y, 5.5, a);
}

// La crema pasticciera: un sac à poche bianco a cono, con la punta a stella che lascia cadere un ricciolo di crema in un
// piattino. Il cono sopra la crema chiara lo distingue da tutto il resto.
function drawScortaCrema(ctx, rng) {
  restingShadow(ctx, 66, 138, 56, 10);
  part(ctx, rng, ellipse(66, 126, 54, 13), C.nuvola);
  // Il ricciolo: tre fette che si stringono verso l'alto, con la punta curva.
  for (const [cy, rx, ry] of [[118, 32, 12], [104, 25, 10], [92, 17, 8]]) part(ctx, rng, ellipse(66, cy, rx, ry), C.crema, { fill: FLAT, line: { width: 2.2 } });
  part(ctx, rng, roundedPolygon([{ x: 62, y: 88 }, { x: 70, y: 88 }, { x: 69, y: 76 }, { x: 63, y: 76 }], 3), C.crema, { fill: FLAT, line: { width: 2 } });
  // Il sac à poche: un cono con la legatura gialla in cima e la punta di ferro in basso.
  part(ctx, rng, roundedPolygon([{ x: 36, y: 8 }, { x: 96, y: 8 }, { x: 70, y: 70 }, { x: 62, y: 70 }], 8), C.nuvola, { fill: FLAT });
  pencilLine(ctx, [{ x: 50, y: 20 }, { x: 62, y: 52 }], rng, { closed: false, width: 2, color: C.nuvola.ombra, alpha: 0.7, amount: 0.3 });
  part(ctx, rng, roundedRect(46, 2, 40, 12, 5), C.giallo, { fill: FLAT, line: { width: 2.2 } });
  part(ctx, rng, roundedPolygon([{ x: 61, y: 66 }, { x: 71, y: 66 }, { x: 73, y: 78 }, { x: 59, y: 78 }], 2), C.ferro, { fill: FLAT, line: { width: 2 } });
}

// L'icona del passo a scelta nella Ricetta, finché non si è scelto il ripieno: un mucchietto di fagioli e un ricciolo di
// crema, uno accanto all'altro. Nel riquadro delle Scorte, per scalare come le altre icone.
function drawPassoRipieno(ctx, rng) {
  restingShadow(ctx, 66, 138, 54, 9);
  const mucchio = smoothCurve([{ x: 12, y: 130 }, { x: 16, y: 108 }, { x: 30, y: 92 }, { x: 46, y: 90 }, { x: 58, y: 106 }, { x: 62, y: 130 }, { x: 36, y: 136 }]);
  part(ctx, rng, mucchio, C.fagioli);
  for (const [x, y, a] of [[28, 116, 0.5], [44, 110, -0.4], [38, 128, 0.2], [24, 128, -0.6]]) chicco(ctx, rng, x, y, 6.5, a);
  for (const [cy, rx, ry] of [[130, 28, 11], [116, 21, 9], [104, 14, 7]]) part(ctx, rng, ellipse(98, cy, rx, ry), C.crema, { fill: FLAT, line: { width: 2.2 } });
}

export const PASSO_RIPIENO = { w: 132, h: 152, draw: drawPassoRipieno };

export const SCORTE_TAIYAKI = {
  impasto: drawScortaImpasto,
  fagioli: drawScortaFagioli,
  crema: drawScortaCrema,
};

// I disegni del catalogo (catalogo.js): i due Piatti (`taiyaki-fagioli` per il Bancone, `taiyaki-fagioli-icona` per l'Ordine), il
// taiyaki bruciato che sta sulla Postazione, e l'icona del passo a scelta nella Ricetta (`passo-ripieno`).
export const DISEGNI_TAIYAKI = {
  ...Object.fromEntries(
    PIATTI.taiyaki.varianti.flatMap((variante) => [
      [`taiyaki-${variante}`, { ...onigiriSize(BANCONE), draw: (ctx, rng) => drawTaiyaki(ctx, rng, BANCONE, variante) }],
      [`taiyaki-${variante}-icona`, { ...onigiriSize(ICONA), draw: (ctx, rng) => drawTaiyaki(ctx, rng, ICONA, variante) }],
    ]),
  ),
  'taiyaki-bruciato-icona': { ...onigiriSize(ICONA), draw: (ctx, rng) => drawTaiyaki(ctx, rng, ICONA, null, true) },
  'passo-ripieno': PASSO_RIPIENO,
};
