// Le cinque Postazioni, una per Piatto, nell'ordine in cui si sbloccano (config.js, PIATTI):
// il tagliere del riso, la piastra a 6 buchi, la macchina del ghiaccio, lo stampo a pesce e la
// pentola del brodo. Qui sono ferme e vuote: la cottura, il Fumo e il Piatto sopra arrivano coi
// passi 3, 4 e 5.
//
// Ogni disegno sta in un riquadro POSTAZIONE_SIZE e poggia sul fondo (la sua ombra a terra incluso).
// Niente bacchette, nemmeno qui: sul tagliere c'è solo la paletta del riso (shamoji).

import { PALETTE as C } from '../config.js';
import { clipTo, ellipse, pastelFill, pencilLine, restingShadow, roundedPolygon, roundedRect, smoothCurve } from '../kit/matita.js';
import { SCORTE_KAKIGORI } from './kakigori.js';
import { SCORTE_RAMEN } from './ramen.js';
import { SCORTE_TAIYAKI } from './taiyaki.js';

export const POSTAZIONE_SIZE = { w: 132, h: 152 };

const FLAT = { volume: false };
const INK = { colore: C.inchiostro, ombra: C.inchiostro, luce: '#6b5a52' };

function part(ctx, rng, shape, swatch, { fill = {}, line = {} } = {}) {
  pastelFill(ctx, shape, rng, swatch, fill);
  pencilLine(ctx, shape, rng, line);
}

// Una riga di legno a matita, per le venature.
function grainLine(ctx, rng, x, y, length, color = C.legnoScuro.ombra) {
  pencilLine(ctx, [{ x, y }, { x: x + length, y: y + rng.jitter(2) }], rng, { closed: false, width: 1.3, alpha: 0.35, color, amount: 0.6 });
}

// Il tagliere del riso (onigiri): un asse di legno con il riso fumante e la paletta.
function drawTagliere(ctx, rng) {
  restingShadow(ctx, 66, 138, 60, 11);
  part(ctx, rng, roundedRect(8, 100, 116, 34, 14), { colore: C.legnoScuro.ombra, ombra: '#8a5a2c', luce: C.legnoScuro.colore }, { fill: FLAT });
  part(ctx, rng, roundedRect(8, 84, 116, 42, 16), C.legnoScuro, { fill: { volume: true } });
  part(ctx, rng, ellipse(108, 104, 6, 4), INK, { fill: FLAT, line: { width: 2 } });
  grainLine(ctx, rng, 22, 118, 50);
  grainLine(ctx, rng, 60, 94, 36);

  const mound = smoothCurve([
    { x: 24, y: 112 }, { x: 30, y: 92 }, { x: 46, y: 76 }, { x: 66, y: 70 }, { x: 86, y: 76 },
    { x: 100, y: 92 }, { x: 106, y: 112 }, { x: 66, y: 120 },
  ]);
  part(ctx, rng, mound, C.riso);
  for (const [x, y, a] of [[50, 92, 0.4], [68, 84, -0.5], [82, 98, 0.9], [60, 106, -0.2], [92, 108, 0.3], [40, 108, 1.1]]) {
    pencilLine(ctx, ellipse(x, y, 3.4, 1.7, a), rng, { width: 1.1, color: C.riso.ombra, amount: 0.3 });
  }
  // La paletta (shamoji): la pala in avanti e il manico che sale a sinistra.
  const handle = roundedPolygon([{ x: 14, y: 76 }, { x: 22, y: 72 }, { x: 52, y: 122 }, { x: 42, y: 128 }], 4);
  part(ctx, rng, handle, C.legno, { fill: FLAT, line: { width: 2.4 } });
  part(ctx, rng, ellipse(78, 126, 24, 9, -0.2), C.legno, { fill: FLAT, line: { width: 2.6 } });
}

// La piastra dei takoyaki: ferro con 6 buchi in due file da tre e il manico di legno.
function drawPiastra(ctx, rng) {
  restingShadow(ctx, 66, 138, 60, 11);
  part(ctx, rng, roundedRect(6, 100, 116, 36, 14), C.ferro, { fill: { hatching: 0.6 } });
  part(ctx, rng, roundedRect(10, 80, 108, 48, 16), C.ferro);
  for (const y of [94, 114]) {
    for (let i = 0; i < 3; i++) {
      const hole = ellipse(32 + i * 32, y, 13, 8.5);
      part(ctx, rng, hole, { colore: C.ferro.ombra, ombra: '#34313b', luce: C.ferro.colore }, { fill: FLAT, line: { width: 2.2 } });
      pencilLine(ctx, [{ x: 24 + i * 32, y: y - 2 }, { x: 30 + i * 32, y: y - 5 }], rng, { closed: false, width: 1.6, color: C.ferro.luce, alpha: 0.8, amount: 0.3 });
    }
  }
  part(ctx, rng, roundedRect(112, 104, 18, 12, 5), C.legnoScuro, { fill: FLAT, line: { width: 2.4 } });
}

// La macchina del ghiaccio (kakigōri): un blocco di ghiaccio sopra, la manovella di lato.
function drawMacchinaGhiaccio(ctx, rng) {
  restingShadow(ctx, 66, 138, 52, 10);
  part(ctx, rng, roundedRect(22, 104, 86, 32, 12), C.celeste);
  part(ctx, rng, roundedRect(44, 64, 42, 50, 10), C.celeste, { fill: { hatching: 0.8 } });
  // La manovella: il braccio e la manopola gialla.
  pencilLine(ctx, [{ x: 86, y: 86 }, { x: 118, y: 70 }], rng, { closed: false, width: 5.5 });
  pencilLine(ctx, [{ x: 86, y: 86 }, { x: 118, y: 70 }], rng, { closed: false, width: 2.4, color: C.celeste.luce });
  part(ctx, rng, ellipse(120, 66, 8, 8), C.giallo, { fill: FLAT, line: { width: 2.2 } });
  // Il blocco di ghiaccio, con i riflessi.
  part(ctx, rng, roundedRect(34, 22, 62, 48, 14), C.ghiaccio);
  pencilLine(ctx, [{ x: 44, y: 34 }, { x: 56, y: 32 }], rng, { closed: false, width: 3.2, color: C.bianco, amount: 0.3 });
  pencilLine(ctx, [{ x: 44, y: 44 }, { x: 48, y: 43 }], rng, { closed: false, width: 3.2, color: C.bianco, amount: 0.3 });
  // La ciotolina davanti, dove cade il ghiaccio.
  const bowl = roundedPolygon([{ x: 46, y: 116 }, { x: 84, y: 116 }, { x: 78, y: 134 }, { x: 52, y: 134 }], 6);
  part(ctx, rng, bowl, C.nuvola, { fill: FLAT, line: { width: 2.4 } });
}

// Lo stampo a pesce (taiyaki): una piastra di ferro con l'impronta del pesce.
function drawStampo(ctx, rng) {
  restingShadow(ctx, 66, 138, 60, 11);
  part(ctx, rng, roundedRect(8, 100, 112, 36, 14), C.ferro, { fill: { hatching: 0.6 } });
  part(ctx, rng, roundedRect(10, 78, 108, 52, 16), C.ferro);

  // L'impronta: corpo e coda in un solo contorno, scura come il fondo dello stampo.
  const fish = smoothCurve([
    { x: 24, y: 104 }, { x: 36, y: 92 }, { x: 58, y: 89 }, { x: 78, y: 96 }, { x: 90, y: 104 },
    { x: 108, y: 90 }, { x: 108, y: 120 }, { x: 90, y: 106 }, { x: 78, y: 114 }, { x: 58, y: 119 }, { x: 36, y: 116 },
  ]);
  part(ctx, rng, fish, { colore: C.ferro.ombra, ombra: '#34313b', luce: C.ferro.colore }, { fill: FLAT, line: { width: 2.4 } });
  part(ctx, rng, ellipse(38, 101, 3.2, 3.2), C.bianco, { fill: FLAT, line: { width: 1.2 } });
  for (const x of [56, 64, 72]) {
    pencilLine(ctx, smoothCurve([{ x, y: 96 }, { x: x - 3, y: 104 }, { x, y: 112 }], { closed: false }), rng, {
      closed: false, width: 1.4, color: C.ferro.luce, alpha: 0.7, amount: 0.3,
    });
  }
  part(ctx, rng, roundedRect(112, 108, 18, 12, 5), C.legnoScuro, { fill: FLAT, line: { width: 2.4 } });
}

// La pentola del brodo (ramen): verde menta con il brodo dorato e due fili di vapore.
function drawPentola(ctx, rng) {
  restingShadow(ctx, 66, 138, 54, 10);
  // I manici ai lati.
  for (const x of [16, 116]) part(ctx, rng, ellipse(x, 104, 9, 7), C.menta, { fill: FLAT, line: { width: 2.4 } });
  part(ctx, rng, roundedRect(22, 84, 88, 52, 20), C.menta);
  // Il bordo e il brodo dentro. Il corpo della pentola sta sotto il bordo.
  part(ctx, rng, ellipse(66, 84, 44, 13), C.menta, { fill: FLAT });
  ctx.save();
  const inside = ellipse(66, 85, 36, 8.5);
  clipTo(ctx, inside);
  pastelFill(ctx, inside, rng, C.brodo, FLAT);
  ctx.restore();
  pencilLine(ctx, inside, rng, { width: 2.2 });
  // Il vapore.
  for (const [x, top] of [[48, 40], [66, 28], [84, 42]]) {
    pencilLine(ctx, smoothCurve([{ x, y: 70 }, { x: x - 7, y: 58 }, { x: x + 6, y: 48 }, { x: x - 2, y: top }], { closed: false }), rng, {
      closed: false, width: 3.2, color: '#b9aea4', alpha: 0.75, amount: 0.8,
    });
  }
}

// --- Le Scorte (GLOSSARY.md): da dove si prende un Ingrediente con un tocco ---
// Stanno nello stesso riquadro delle Postazioni. Chiave: l'id dell'Ingrediente (config.js, PIATTI.ricetta).

// La ciotola del riso: celeste, con il riso a monticello che sporge dal bordo.
function drawScortaRiso(ctx, rng) {
  restingShadow(ctx, 66, 138, 54, 10);
  part(ctx, rng, roundedRect(14, 92, 104, 44, 22), C.celeste);
  const mound = smoothCurve([
    { x: 24, y: 100 }, { x: 28, y: 82 }, { x: 44, y: 64 }, { x: 66, y: 58 }, { x: 88, y: 64 },
    { x: 104, y: 82 }, { x: 108, y: 100 }, { x: 66, y: 108 },
  ]);
  part(ctx, rng, mound, C.riso);
  for (const [x, y, a] of [[50, 84, 0.4], [70, 76, -0.5], [86, 92, 0.9], [60, 98, -0.2], [42, 96, 1.1], [78, 62, 0.2]]) {
    pencilLine(ctx, ellipse(x, y, 3.4, 1.7, a), rng, { width: 1.1, color: C.riso.ombra, amount: 0.3 });
  }
  // Il bordo davanti, che copre il piede del monticello.
  part(ctx, rng, roundedRect(12, 98, 108, 20, 10), C.celeste, { fill: FLAT });
  grainLine(ctx, rng, 30, 126, 40, C.celeste.ombra);
}

// L'alga nori: una pila di tre fogli scuri, un po' sfalsati.
function drawScortaAlga(ctx, rng) {
  restingShadow(ctx, 66, 138, 52, 10);
  [[22, 104, 0], [16, 88, 1], [26, 72, 2]].forEach(([x, y, i]) => {
    part(ctx, rng, roundedRect(x, y, 92, 30, 6), C.nori, { fill: { volume: true } });
    // Le righe chiare della carta di alga.
    pencilLine(ctx, [{ x: x + 10, y: y + 9 + i }, { x: x + 54, y: y + 8 + i }], rng, { closed: false, width: 1.4, color: C.nori.luce, alpha: 0.6, amount: 0.5 });
    pencilLine(ctx, [{ x: x + 24, y: y + 20 }, { x: x + 78, y: y + 21 }], rng, { closed: false, width: 1.2, color: C.nori.luce, alpha: 0.45, amount: 0.5 });
  });
}

// La pastella del takoyaki: una brocca verde menta alta e stretta, colma di pastella chiara che cola dal
// beccuccio. La forma alta la distingue dalle ciotole (riso) e dai fogli (alga) anche in bianco e nero.
function drawScortaPastella(ctx, rng) {
  restingShadow(ctx, 66, 138, 46, 9);
  // Il manico a destra, dietro il corpo: due passate di matita, una scura larga e una chiara sopra.
  const manico = smoothCurve([{ x: 92, y: 80 }, { x: 116, y: 84 }, { x: 118, y: 108 }, { x: 94, y: 114 }], { closed: false });
  pencilLine(ctx, manico, rng, { closed: false, width: 8, color: C.menta.ombra, amount: 0.5 });
  pencilLine(ctx, manico, rng, { closed: false, width: 3.6, color: C.menta.colore, amount: 0.4 });
  // Il corpo, con il beccuccio a sinistra.
  part(ctx, rng, roundedPolygon([{ x: 30, y: 62 }, { x: 24, y: 54 }, { x: 40, y: 54 }, { x: 94, y: 54 }, { x: 98, y: 122 }, { x: 90, y: 138 }, { x: 40, y: 138 }, { x: 32, y: 122 }], 12), C.menta);
  // La pastella: il bordo pieno in cima e un colata lungo il corpo.
  part(ctx, rng, ellipse(62, 54, 34, 11), C.pastella, { fill: FLAT });
  part(ctx, rng, roundedPolygon([{ x: 40, y: 56 }, { x: 56, y: 56 }, { x: 54, y: 92 }, { x: 47, y: 100 }, { x: 40, y: 92 }], 6), C.pastella, { fill: FLAT, line: { width: 2.2 } });
  for (const [x, y, r] of [[70, 52, 3.4], [82, 56, 2.6], [58, 50, 2.4]]) {
    pencilLine(ctx, ellipse(x, y, r, r * 0.8), rng, { width: 1.2, color: C.pastella.ombra, amount: 0.3 });
  }
  // La fascia a righe del corpo.
  grainLine(ctx, rng, 38, 112, 52, C.menta.ombra);
  grainLine(ctx, rng, 40, 122, 46, C.menta.ombra);
}

// Il polpo bollito, tagliato a pezzi (tako): tre bocconi rosa scuro con la parte tagliata chiara e le ventose
// bianche, su un piattino. Niente occhi né faccia: sono pezzi, non un animale.
function drawScortaPolpo(ctx, rng) {
  restingShadow(ctx, 66, 138, 56, 10);
  // Il piattino: una ciotola bassa e larga.
  part(ctx, rng, ellipse(66, 124, 58, 15), C.nuvola);
  part(ctx, rng, ellipse(66, 120, 44, 9), { colore: C.nuvola.ombra, ombra: C.nuvola.ombra, luce: C.nuvola.colore }, { fill: FLAT, line: { width: 1.6 } });
  // Un boccone: il corpo, la parte tagliata a un'estremità e tre ventose sul fianco.
  const boccone = (x, y, angolo) => {
    part(ctx, rng, ellipse(x, y, 26, 14, angolo), C.polpo);
    const cos = Math.cos(angolo);
    const sin = Math.sin(angolo);
    part(ctx, rng, ellipse(x + cos * 22, y + sin * 22, 6, 11, angolo), { colore: '#fbe3dc', ombra: '#e6b5ad', luce: '#ffffff' }, { fill: FLAT, line: { width: 1.8 } });
    for (const k of [-14, -3, 8]) {
      pencilLine(ctx, ellipse(x + cos * k, y + sin * k + 2, 3.2, 2.4, angolo), rng, { width: 1.5, color: C.bianco, amount: 0.2 });
    }
  };
  boccone(44, 112, -0.35);
  boccone(88, 112, 0.35);
  boccone(66, 90, 0.08);
}

// La salsa del takoyaki: un flacone a spruzzo scuro con l'etichetta chiara e il beccuccio giallo, e una goccia.
function drawScortaSalsa(ctx, rng) {
  restingShadow(ctx, 66, 138, 40, 9);
  // Il flacone: largo in basso, stretto verso il collo.
  part(ctx, rng, roundedPolygon([{ x: 38, y: 138 }, { x: 94, y: 138 }, { x: 100, y: 96 }, { x: 86, y: 70 }, { x: 46, y: 70 }, { x: 32, y: 96 }], 12), C.salsa);
  // L'etichetta, con un'onda di maionese.
  part(ctx, rng, roundedRect(42, 96, 48, 30, 10), C.nuvola, { fill: FLAT, line: { width: 2.2 } });
  pencilLine(ctx, smoothCurve([{ x: 48, y: 112 }, { x: 56, y: 104 }, { x: 64, y: 118 }, { x: 72, y: 106 }, { x: 82, y: 114 }], { closed: false }), rng, {
    closed: false, width: 3, color: C.salsa.colore, amount: 0.4,
  });
  // Il collo e il beccuccio.
  part(ctx, rng, roundedRect(56, 52, 20, 22, 5), C.giallo, { fill: FLAT });
  part(ctx, rng, roundedPolygon([{ x: 58, y: 54 }, { x: 74, y: 54 }, { x: 69, y: 30 }, { x: 63, y: 30 }], 3), C.giallo, { fill: FLAT, line: { width: 2.2 } });
  // La goccia che sta per cadere.
  part(ctx, rng, roundedPolygon([{ x: 66, y: 6 }, { x: 72, y: 17 }, { x: 66, y: 24 }, { x: 60, y: 17 }], 5), C.salsa, { fill: FLAT, line: { width: 2 } });
}

export const SCORTE = {
  riso: drawScortaRiso,
  alga: drawScortaAlga,
  pastella: drawScortaPastella,
  polpo: drawScortaPolpo,
  salsa: drawScortaSalsa,
  // Il ghiaccio e i tre sciroppi del kakigōri (ticket 07), disegnati in kakigori.js insieme ai Piatti.
  ...SCORTE_KAKIGORI,
  // L'impasto e i due ripieni del taiyaki (ticket 08), disegnati in taiyaki.js; i noodles, il brodo, l'uovo e il naruto
  // del ramen, in ramen.js.
  ...SCORTE_TAIYAKI,
  ...SCORTE_RAMEN,
};
export const scortaKey = (ingrediente) => `scorta-${ingrediente}`;

// L'icona del passo a scelta nella Ricetta in icone (lo sciroppo, il ripieno, la guarnizione), finché non si è scelto: una per
// Piatto con varianti. Poi al suo posto c'è la Scorta della variante scelta.
export const PASSO_SCELTA = { kakigori: 'passo-sciroppo', taiyaki: 'passo-ripieno', ramen: 'passo-guarnizione' };

// In ordine di sblocco, con la chiave del Piatto di config.js (PIATTI).
export const POSTAZIONI = {
  onigiri: drawTagliere,
  takoyaki: drawPiastra,
  kakigori: drawMacchinaGhiaccio,
  taiyaki: drawStampo,
  ramen: drawPentola,
};

export const postazioneKey = (piatto) => `postazione-${piatto}`;
