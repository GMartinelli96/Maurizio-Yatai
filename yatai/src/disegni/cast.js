// Il cast: sette peluche amici di Maurizio che arrivano allo Yatai con un Vizio (GLOSSARY.md). Stesso
// riquadro (CLIENTE_SIZE), stessi piedi (CLIENTE_FEET) e stesse quattro espressioni dei Clienti di
// passaggio, così la scena li mette ai Posti allo stesso modo e usa lo stesso Lamento: nessun cast ha una
// faccia o un segno suo (ticket 09). Le facce sono quelle di `faccia()` in clienti.js, con il seme del corpo
// uguale in tutte e quattro: cambia solo la faccia.
//
// Come si riconoscono a colpo d'occhio, anche piccoli (a 360×640 un Posto è largo meno di 120 px): ognuno ha
// una sagoma e un colore suoi, e un oggetto grande che lo racconta.
//   Marcella   coniglia rosa, orecchie lunghe e papillon giallo (golosa: chiede il Bis)
//   Carlotta   barboncina lilla con il ciuffo a pompon, la collana di perle e la borsetta d'oro (paga il doppio)
//   Balosso    ippopotamo grigio-azzurro, il più largo, con la cuffia da notte a righe (la calma di tutti)
//   Nella      ape gialla e marrone con le ali e le antenne a pallina (lascia lo Yen d'oro)
//   Filippo    orso bianco con la sciarpa azzurra e un gambo di sedano, dal gioco "Filippo mangia il sedano"
//   Pasquale   castoro con l'elmetto giallo e la chiave inglese (ripara le Postazioni nel Fumo)
//   Ebi Furai  gambero fritto impanato, con le antenne e la coda rossa a ventaglio (si spaventa col Fumo)
// Il look è una proposta approvata per partire: si ritocca qui, nei colori `K` e nei disegni.
//
// La goccia e lo sbuffo del Lamento non stanno nella texture: li mette ClienteView in CAST_SEGNI_POS.

import { PALETTE as C, STILE } from '../config.js';
import {
  FUR_LINE, ellipse, fur, grain, pastelFill, pencilLine, roundedPolygon, smoothCurve,
} from '../kit/matita.js';
import { createRng } from '../kit/rng.js';
import {
  CLIENTE_SIZE, ESPRESSIONI, clienteKey, dark, faccia, patch, plush, venetta, white,
} from './clienti.js';

export const CAST = ['marcella', 'carlotta', 'balosso', 'nella', 'filippo', 'pasquale', 'ebi-furai'];

const sw = (colore, ombra, luce) => ({ colore, ombra, luce });

// Colori del solo cast, nello stesso formato dei campioni di PALETTE.
const K = {
  coniglia: sw('#f6b3c4', '#dc7f98', '#fde0e8'),
  coniglia2: sw('#fbd4de', '#e7a1b4', '#fff0f4'),
  giallo: sw('#f5c84a', '#cf9e22', '#fde9a4'),
  lilla: sw('#b79ae0', '#8b6cc0', '#dccbf5'),
  lilla2: sw('#cdb8ee', '#a58ad2', '#ebe0fa'),
  perla: sw('#fffdf8', '#d8d2c8', '#ffffff'),
  oro: sw('#f7d26a', '#cf9e30', '#fdedb8'),
  ippo: sw('#8fb4cf', '#5f87a8', '#c4dcec'),
  ippoMuso: sw('#d9cfd8', '#b3a6b4', '#f0eaf0'),
  cuffia: sw('#7fa6e6', '#5278c4', '#bcd2f6'),
  ape: sw('#f7d26a', '#d9a62e', '#fdedb8'),
  strisce: sw('#6b4a2f', '#46301e', '#8a6644'),
  ala: sw('#d7ecf8', '#a8cde6', '#f2faff'),
  sciarpa: sw('#6aa3e0', '#3d73b5', '#acd0f4'),
  sedano: sw('#9fd68a', '#6ba85a', '#d3efc4'),
  castoro: sw('#a06a46', '#6f4529', '#c99472'),
  castoro2: sw('#6f4a32', '#46301e', '#946a4f'),
  elmetto: sw('#f5c542', '#cf9a1c', '#fde7a0'),
  ferro: sw('#b5bec6', '#7f8a94', '#e1e6ea'),
  gambero: sw('#f4977a', '#cc684a', '#fbcdbb'),
  gambero2: sw('#f9b79d', '#d98a6e', '#fde0d3'),
  coda: sw('#e25a45', '#b0362a', '#f2998a'),
  briciola: '#f2cf72',
};

// ---------------------------------------------------------------------------------------------
// Marcella

function drawMarcella(ctx, body, face, espressione) {
  // Il ciuffetto di coda, dietro.
  plush(ctx, ellipse(204, 282, 19, 19), body, K.coniglia2);
  // Le orecchie lunghe, dietro la testa, con il dentro più chiaro.
  for (const side of [-1, 1]) {
    const ear = ellipse(130 + side * 46, 52, 21, 50, side * 0.13);
    plush(ctx, ear, body, K.coniglia);
    const inner = ellipse(130 + side * 46, 56, 11, 36, side * 0.13);
    pastelFill(ctx, inner, body, K.coniglia2, { volume: false });
    pencilLine(ctx, inner, body, { width: 2, amount: 0.4 });
  }
  // Il corpo e la pancia chiara.
  const trunk = ellipse(130, 238, 62, 66);
  plush(ctx, trunk, body, K.coniglia, (p) => p.y < 272);
  const belly = ellipse(130, 246, 38, 48);
  pastelFill(ctx, belly, body, K.coniglia2);
  pencilLine(ctx, belly, body, { width: 2.6 });
  for (const side of [-1, 1]) {
    plush(ctx, ellipse(130 + side * 64, 240, 15, 32, side * 0.15), body, K.coniglia);
    plush(ctx, ellipse(130 + side * 37, 298, 29, 16), body, K.coniglia, (p) => p.y > 296);
  }
  // La testa tonda, il muso chiaro e il nasino.
  const head = ellipse(130, 108, 78, 64);
  plush(ctx, head, body, K.coniglia);
  const muzzle = ellipse(130, 130, 36, 26);
  pastelFill(ctx, muzzle, body, K.coniglia2);
  pencilLine(ctx, muzzle, body, { width: 2.4 });
  const nose = roundedPolygon([{ x: 122, y: 113 }, { x: 138, y: 113 }, { x: 130, y: 123 }], 4);
  pastelFill(ctx, nose, face, { colore: '#e0708e', ombra: '#b94a69', luce: '#f2a3b8' }, { volume: false });
  pencilLine(ctx, nose, face, { width: 2 });
  pencilLine(ctx, [{ x: 130, y: 122 }, { x: 130, y: 129 }], face, { closed: false, width: 2.4 });
  faccia(ctx, face, espressione, { occhiY: 98, occhiDx: 40, boccaY: 132, guanceY: 122, guanceDx: 60 });
  // Il papillon giallo sotto il mento.
  for (const side of [-1, 1]) {
    const wing = roundedPolygon([{ x: 130, y: 182 }, { x: 130 + side * 34, y: 166 }, { x: 130 + side * 34, y: 198 }], 6);
    pastelFill(ctx, wing, body, K.giallo, { volume: false });
    pencilLine(ctx, wing, body, { width: 2.6 });
  }
  const knot = ellipse(130, 182, 9, 9);
  pastelFill(ctx, knot, body, K.giallo, { volume: false });
  pencilLine(ctx, knot, body, { width: 2.4 });
}

// ---------------------------------------------------------------------------------------------
// Carlotta

function drawCarlotta(ctx, body, face, espressione) {
  // La coda a pompon.
  plush(ctx, ellipse(208, 284, 20, 20), body, K.lilla2);
  // Le orecchie a ciuffo, lunghe e morbide, ai lati della testa.
  for (const side of [-1, 1]) {
    plush(ctx, ellipse(130 + side * 76, 124, 27, 48, side * 0.12), body, K.lilla2);
    plush(ctx, ellipse(130 + side * 78, 150, 20, 22), body, K.lilla2);
  }
  // Il corpo.
  const trunk = ellipse(130, 240, 56, 64);
  plush(ctx, trunk, body, K.lilla, (p) => p.y < 272);
  for (const side of [-1, 1]) {
    plush(ctx, ellipse(130 + side * 60, 238, 14, 30, side * 0.12), body, K.lilla);
    // I piedi con la polsiera a pompon, come i barboncini tosati.
    plush(ctx, ellipse(130 + side * 34, 298, 26, 15), body, K.lilla, (p) => p.y > 296);
    plush(ctx, ellipse(130 + side * 34, 282, 17, 15), body, K.lilla2);
  }
  // La testa tonda, il muso chiaro e il nasino.
  const head = ellipse(130, 108, 64, 62);
  plush(ctx, head, body, K.lilla);
  const muzzle = ellipse(130, 132, 32, 24);
  pastelFill(ctx, muzzle, body, K.lilla2);
  pencilLine(ctx, muzzle, body, { width: 2.4 });
  const nose = ellipse(130, 118, 12, 8.5);
  pastelFill(ctx, nose, face, dark, { volume: false });
  pencilLine(ctx, nose, face, { width: 2 });
  pencilLine(ctx, [{ x: 130, y: 126 }, { x: 130, y: 133 }], face, { closed: false, width: 2.4 });
  faccia(ctx, face, espressione, { occhiY: 98, occhiDx: 38, boccaY: 135, guanceY: 124, guanceDx: 58 });
  // Il ciuffo a pompon in cima, con un fiocco rosa.
  plush(ctx, ellipse(130, 38, 31, 27), body, K.lilla2);
  plush(ctx, ellipse(112, 52, 16, 14), body, K.lilla2);
  plush(ctx, ellipse(148, 52, 16, 14), body, K.lilla2);
  const fiocco = roundedPolygon([{ x: 130, y: 62 }, { x: 108, y: 52 }, { x: 108, y: 72 }], 5);
  const fiocco2 = roundedPolygon([{ x: 130, y: 62 }, { x: 152, y: 52 }, { x: 152, y: 72 }], 5);
  for (const shape of [fiocco, fiocco2]) {
    pastelFill(ctx, shape, body, { colore: '#f27a9b', ombra: '#c9496f', luce: '#f9b3c6' }, { volume: false });
    pencilLine(ctx, shape, body, { width: 2.4 });
  }
  // La collana di perle sotto il mento.
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const x = 130 + (t - 0.5) * 104;
    const y = 180 + Math.sin(t * Math.PI) * 14;
    const perla = ellipse(x, y, 7.5, 7.5);
    pastelFill(ctx, perla, body, K.perla, { volume: false, hatching: 0.3 });
    pencilLine(ctx, perla, body, { width: 2, amount: 0.3 });
  }
  // La borsetta d'oro appesa al braccio, con la chiusura.
  const manico = smoothCurve([{ x: 184, y: 244 }, { x: 196, y: 226 }, { x: 214, y: 244 }], { closed: false });
  pencilLine(ctx, manico, body, { closed: false, width: 3, amount: 0.4 });
  const borsa = roundedPolygon([{ x: 178, y: 246 }, { x: 222, y: 246 }, { x: 228, y: 286 }, { x: 172, y: 286 }], 8);
  pastelFill(ctx, borsa, body, K.oro);
  pencilLine(ctx, borsa, body, { width: 2.8 });
  const chiusura = ellipse(200, 250, 7, 7);
  pastelFill(ctx, chiusura, body, K.perla, { volume: false, hatching: 0 });
  pencilLine(ctx, chiusura, body, { width: 2, amount: 0.3 });
}

// ---------------------------------------------------------------------------------------------
// Balosso

function drawBalosso(ctx, body, face, espressione) {
  // Il corpo largo e il pancione chiaro, le braccia tonde e i piedoni.
  const trunk = ellipse(130, 238, 86, 66);
  plush(ctx, trunk, body, K.ippo, (p) => p.y < 272);
  const belly = ellipse(130, 250, 54, 44);
  pastelFill(ctx, belly, body, K.ippoMuso);
  pencilLine(ctx, belly, body, { width: 2.6 });
  for (const side of [-1, 1]) {
    plush(ctx, ellipse(130 + side * 86, 242, 17, 34, side * 0.25), body, K.ippo);
    plush(ctx, ellipse(130 + side * 52, 298, 34, 17), body, K.ippo, (p) => p.y > 296);
  }
  // Le orecchie piccole e tonde, ai lati della cuffia.
  for (const side of [-1, 1]) {
    plush(ctx, ellipse(130 + side * 66, 58, 15, 14), body, K.ippo);
    pastelFill(ctx, ellipse(130 + side * 66, 60, 8, 7), body, { colore: '#f0b8c4', ombra: '#d98b9d', luce: '#fbd8df' }, { volume: false, hatching: 0 });
  }
  // La testa larga, con il muso enorme e le narici.
  const head = ellipse(130, 112, 90, 62);
  plush(ctx, head, body, K.ippo);
  const muzzle = ellipse(130, 142, 62, 34);
  pastelFill(ctx, muzzle, body, K.ippoMuso);
  pencilLine(ctx, muzzle, body, { width: 2.6 });
  for (const side of [-1, 1]) {
    const narice = ellipse(130 + side * 20, 130, 7, 5.5);
    pastelFill(ctx, narice, face, dark, { volume: false, hatching: 0 });
    pencilLine(ctx, narice, face, { width: 1.6, amount: 0.3 });
  }
  faccia(ctx, face, espressione, { occhiY: 98, occhiDx: 46, boccaY: 148, guanceY: 126, guanceDx: 72 });
  // La cuffia da notte a righe, che ricade a destra con il pompon: dorme in piedi, ma è sveglio.
  const cuffia = smoothCurve([
    { x: 78, y: 70 }, { x: 96, y: 34 }, { x: 134, y: 14 }, { x: 178, y: 20 }, { x: 214, y: 38 },
    { x: 222, y: 58 }, { x: 196, y: 48 }, { x: 170, y: 62 }, { x: 130, y: 72 },
  ]);
  pastelFill(ctx, cuffia, body, K.cuffia);
  for (const x of [104, 134, 164]) {
    patch(ctx, cuffia, ellipse(x, 40, 9, 44, -0.35), body, white);
  }
  fur(ctx, cuffia, body, K.cuffia, { keep: (p) => p.y > 64 });
  pencilLine(ctx, cuffia, body, { width: 2.8 });
  const pompon = ellipse(224, 62, 15, 15);
  plush(ctx, pompon, body, white);
}

// ---------------------------------------------------------------------------------------------
// Nella

function drawNella(ctx, body, face, espressione) {
  // Le ali leggere, dietro, di un azzurro quasi trasparente.
  for (const side of [-1, 1]) {
    const ala = ellipse(130 + side * 78, 190, 26, 52, side * 0.5);
    pastelFill(ctx, ala, body, K.ala, { volume: false, alpha: 0.85, hatching: 0.5 });
    pencilLine(ctx, ala, body, { width: 2.4 });
  }
  // Le antenne con la pallina in punta, dietro la testa.
  for (const side of [-1, 1]) {
    const antenna = smoothCurve([{ x: 130 + side * 22, y: 52 }, { x: 130 + side * 34, y: 26 }, { x: 130 + side * 56, y: 12 }], { closed: false });
    pencilLine(ctx, antenna, body, { closed: false, width: 3.4, amount: 0.4 });
    plush(ctx, ellipse(130 + side * 60, 12, 9, 9), body, K.strisce);
  }
  // Il corpo giallo a righe marroni.
  const trunk = ellipse(130, 238, 60, 66);
  plush(ctx, trunk, body, K.ape, (p) => p.y < 272);
  for (const y of [226, 256, 284]) patch(ctx, trunk, ellipse(130, y, 80, 8), body, K.strisce);
  for (const side of [-1, 1]) {
    plush(ctx, ellipse(130 + side * 58, 236, 13, 30, side * 0.2), body, K.ape);
    plush(ctx, ellipse(130 + side * 33, 298, 24, 14), body, K.strisce, (p) => p.y > 296);
  }
  // La testa gialla, con una frangetta marrone.
  const head = ellipse(130, 106, 74, 62);
  plush(ctx, head, body, K.ape);
  patch(ctx, head, ellipse(130, 54, 40, 14), body, K.strisce);
  const nose = ellipse(130, 118, 8, 6);
  pastelFill(ctx, nose, face, dark, { volume: false, hatching: 0 });
  pencilLine(ctx, nose, face, { width: 1.8 });
  faccia(ctx, face, espressione, { occhiY: 98, occhiDx: 38, boccaY: 130, guanceY: 122, guanceDx: 58 });
}

// ---------------------------------------------------------------------------------------------
// Filippo

function drawFilippo(ctx, body, face, espressione) {
  // Le orecchie tonde, con il dentro rosa.
  for (const side of [-1, 1]) {
    plush(ctx, ellipse(130 + side * 62, 46, 22, 21), body, white);
    pastelFill(ctx, ellipse(130 + side * 62, 49, 11, 10), body, { colore: '#f0b8c4', ombra: '#d98b9d', luce: '#fbd8df' }, { volume: false, hatching: 0 });
  }
  // Il corpo bianco.
  const trunk = ellipse(130, 238, 68, 68);
  plush(ctx, trunk, body, C.riso, (p) => p.y < 274);
  for (const side of [-1, 1]) {
    plush(ctx, ellipse(130 + side * 68, 240, 16, 34, side * 0.22), body, C.riso);
    plush(ctx, ellipse(130 + side * 38, 298, 28, 16), body, C.riso, (p) => p.y > 296);
  }
  // Il gambo di sedano stretto in una zampa, con le foglie in cima.
  const gambo = roundedPolygon([{ x: 196, y: 262 }, { x: 206, y: 262 }, { x: 214, y: 188 }, { x: 202, y: 188 }], 4);
  pastelFill(ctx, gambo, body, K.sedano, { volume: false });
  pencilLine(ctx, gambo, body, { width: 2.4 });
  for (const [dx, a] of [[-10, -0.5], [4, 0], [16, 0.5]]) {
    const foglia = ellipse(208 + dx, 176, 10, 17, a);
    pastelFill(ctx, foglia, body, K.sedano, { volume: false, hatching: 0.4 });
    pencilLine(ctx, foglia, body, { width: 2, amount: 0.4 });
  }
  plush(ctx, ellipse(200, 258, 13, 15), body, C.riso);
  // La testa tonda, il muso e il nasone nero.
  const head = ellipse(130, 108, 80, 64);
  plush(ctx, head, body, C.riso);
  const muzzle = ellipse(130, 130, 38, 27);
  pastelFill(ctx, muzzle, body, C.muso);
  pencilLine(ctx, muzzle, body, { width: 2.4 });
  const nose = ellipse(130, 116, 13, 9.5);
  pastelFill(ctx, nose, face, dark, { volume: false, hatching: 0 });
  pencilLine(ctx, nose, face, { width: 2 });
  pencilLine(ctx, [{ x: 130, y: 124 }, { x: 130, y: 132 }], face, { closed: false, width: 2.4 });
  faccia(ctx, face, espressione, { occhiY: 94, occhiDx: 42, boccaY: 134, guanceY: 122, guanceDx: 64 });
  // La sciarpa azzurra a righe, con la coda che penzola.
  const sciarpa = smoothCurve([{ x: 70, y: 172 }, { x: 130, y: 186 }, { x: 190, y: 172 }, { x: 188, y: 196 }, { x: 130, y: 210 }, { x: 72, y: 196 }]);
  pastelFill(ctx, sciarpa, body, K.sciarpa, { volume: false });
  for (const x of [92, 122, 152, 176]) patch(ctx, sciarpa, ellipse(x, 192, 5, 24, 0.2), body, white);
  pencilLine(ctx, sciarpa, body, { width: 2.8 });
  const coda = roundedPolygon([{ x: 150, y: 202 }, { x: 178, y: 200 }, { x: 186, y: 252 }, { x: 156, y: 254 }], 6);
  pastelFill(ctx, coda, body, K.sciarpa, { volume: false });
  patch(ctx, coda, ellipse(170, 230, 22, 5, 0.1), body, white);
  pencilLine(ctx, coda, body, { width: 2.8 });
}

// ---------------------------------------------------------------------------------------------
// Pasquale

function drawPasquale(ctx, body, face, espressione) {
  // La coda piatta a pagaia, dietro, con le scaglie a righe.
  const coda = ellipse(216, 282, 36, 16, 0.55);
  plush(ctx, coda, body, K.castoro2);
  for (const d of [-14, 0, 14]) pencilLine(ctx, [{ x: 216 + d - 8, y: 268 + d * 0.6 }, { x: 216 + d + 12, y: 294 + d * 0.6 }], body, { closed: false, width: 1.8, amount: 0.4, alpha: 0.7 });
  // Il corpo e la pancia chiara.
  const trunk = ellipse(130, 238, 66, 68);
  plush(ctx, trunk, body, K.castoro, (p) => p.y < 274);
  const belly = ellipse(130, 250, 42, 46);
  pastelFill(ctx, belly, body, C.muso);
  pencilLine(ctx, belly, body, { width: 2.6 });
  for (const side of [-1, 1]) {
    plush(ctx, ellipse(130 + side * 68, 240, 16, 34, side * 0.2), body, K.castoro);
    plush(ctx, ellipse(130 + side * 38, 298, 30, 16), body, K.castoro2, (p) => p.y > 296);
  }
  // La chiave inglese in una zampa: il manico e la bocca aperta.
  const manico = roundedPolygon([{ x: 192, y: 292 }, { x: 204, y: 292 }, { x: 214, y: 214 }, { x: 202, y: 214 }], 4);
  pastelFill(ctx, manico, body, K.ferro, { volume: false });
  pencilLine(ctx, manico, body, { width: 2.4 });
  const testa = ellipse(208, 206, 16, 14);
  pastelFill(ctx, testa, body, K.ferro, { volume: false });
  pencilLine(ctx, testa, body, { width: 2.4 });
  pastelFill(ctx, ellipse(208, 196, 6, 7), body, { colore: C.carta, ombra: C.carta, luce: C.carta }, { volume: false, hatching: 0 });
  plush(ctx, ellipse(198, 262, 14, 15), body, K.castoro);
  // La testa, le orecchie basse, il muso chiaro e il nasone scuro.
  for (const side of [-1, 1]) plush(ctx, ellipse(130 + side * 76, 100, 14, 14), body, K.castoro2);
  const head = ellipse(130, 114, 80, 60);
  plush(ctx, head, body, K.castoro);
  const muzzle = ellipse(130, 136, 40, 26);
  pastelFill(ctx, muzzle, body, C.muso);
  pencilLine(ctx, muzzle, body, { width: 2.4 });
  const nose = ellipse(130, 122, 14, 9.5);
  pastelFill(ctx, nose, face, dark, { volume: false, hatching: 0 });
  pencilLine(ctx, nose, face, { width: 2 });
  pencilLine(ctx, [{ x: 130, y: 130 }, { x: 130, y: 138 }], face, { closed: false, width: 2.4 });
  faccia(ctx, face, espressione, { occhiY: 102, occhiDx: 42, boccaY: 140, guanceY: 128, guanceDx: 66 });
  // L'elmetto giallo da cantiere, con la fascia al centro e la visiera.
  const cupola = smoothCurve([
    { x: 58, y: 70 }, { x: 70, y: 36 }, { x: 100, y: 14 }, { x: 130, y: 8 }, { x: 160, y: 14 },
    { x: 190, y: 36 }, { x: 202, y: 70 },
  ]);
  pastelFill(ctx, cupola, body, K.elmetto);
  patch(ctx, cupola, ellipse(130, 40, 14, 36), body, K.giallo);
  pencilLine(ctx, cupola, body, { width: 2.8 });
  const visiera = ellipse(130, 72, 84, 11);
  plush(ctx, visiera, body, K.elmetto);
}

// ---------------------------------------------------------------------------------------------
// Ebi Furai

function drawEbiFurai(ctx, body, face, espressione) {
  // Le antenne lunghe, che si arricciano in fuori.
  for (const side of [-1, 1]) {
    const antenna = smoothCurve([
      { x: 130 + side * 20, y: 56 }, { x: 130 + side * 40, y: 28 }, { x: 130 + side * 70, y: 12 }, { x: 130 + side * 96, y: 18 },
    ], { closed: false });
    pencilLine(ctx, antenna, body, { closed: false, width: 3.6, amount: 0.5 });
  }
  // La coda: si arriccia in su dietro il corpo, sul lato destro, e finisce in un ventaglio rosso. È il tratto che
  // fa riconoscere il gambero anche da lontano.
  const tubo = smoothCurve([
    { x: 168, y: 284 }, { x: 214, y: 286 }, { x: 240, y: 256 }, { x: 246, y: 214 }, { x: 238, y: 186 },
    { x: 218, y: 192 }, { x: 222, y: 222 }, { x: 208, y: 254 }, { x: 170, y: 262 },
  ]);
  plush(ctx, tubo, body, K.gambero);
  for (const [x, y, r] of [[234, 270, 0.9], [240, 244, 0.35], [240, 218, 0.05]]) {
    pencilLine(ctx, [{ x: x - 12, y }, { x: x + 10, y: y - 8 }].map((p) => ({ x: p.x, y: p.y + r * 4 })), body, { closed: false, width: 1.8, amount: 0.4, alpha: 0.8 });
  }
  for (const [dx, dy, a] of [[-12, 6, -0.55], [0, 0, 0], [12, 8, 0.55]]) {
    plush(ctx, ellipse(230 + dx, 166 + dy, 12, 25, a), body, K.coda);
  }
  // Il corpo è uno solo, tondo come il pancione degli altri, con le fasce curve del guscio.
  const trunk = ellipse(130, 238, 62, 66);
  plush(ctx, trunk, body, K.gambero, (p) => p.y < 272);
  for (const y of [202, 224, 246, 268]) patch(ctx, trunk, ellipse(130, y + 14, 82, 11), body, K.gambero2);
  for (const y of [202, 224, 246, 268]) {
    pencilLine(ctx, smoothCurve([{ x: 76, y: y - 4 }, { x: 130, y: y + 8 }, { x: 184, y: y - 4 }], { closed: false }), body, { closed: false, width: 2, amount: 0.4, alpha: 0.8 });
  }
  // Le zampette ai lati e i piedini: stesso posto degli altri peluche.
  for (const side of [-1, 1]) {
    plush(ctx, ellipse(130 + side * 64, 238, 12, 26, side * 0.25), body, K.gambero2);
    plush(ctx, ellipse(130 + side * 36, 298, 27, 15), body, K.gambero2, (p) => p.y > 296);
  }
  // La testa tonda con il becco in cima: l'elmo del gambero.
  const head = ellipse(130, 112, 74, 62);
  plush(ctx, head, body, K.gambero);
  patch(ctx, head, ellipse(130, 150, 52, 24), body, K.gambero2);
  const rostro = roundedPolygon([{ x: 116, y: 60 }, { x: 144, y: 60 }, { x: 130, y: 34 }], 5);
  pastelFill(ctx, rostro, body, K.gambero, { volume: false });
  pencilLine(ctx, rostro, body, { width: 2.4 });
  faccia(ctx, face, espressione, { occhiY: 100, occhiDx: 38, boccaY: 134, guanceY: 124, guanceDx: 58 });
  // L'impanatura: le briciole dorate sparse sul guscio, ma non sulla faccia.
  ctx.save();
  ctx.fillStyle = K.briciola;
  for (let i = 0; i < 70; i++) {
    const x = 130 + body.range(-72, 72);
    const y = body.range(60, 300);
    const sulCorpo = y > 180 && y < 290 && ((x - 130) / 58) ** 2 + ((y - 238) / 62) ** 2 < 1;
    const sullaTesta = y < 176 && ((x - 130) / 70) ** 2 + ((y - 112) / 58) ** 2 < 1 && (y < 78 || y > 148);
    if (!sulCorpo && !sullaTesta) continue;
    ctx.globalAlpha = body.range(0.6, 1);
    ctx.beginPath();
    ctx.arc(x, y, body.range(1.6, 3.2), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------------------------
// Il catalogo

const DISEGNATORI = {
  marcella: drawMarcella,
  carlotta: drawCarlotta,
  balosso: drawBalosso,
  nella: drawNella,
  filippo: drawFilippo,
  pasquale: drawPasquale,
  'ebi-furai': drawEbiFurai,
};

// Il segno di rabbia dei fumetti dell'imbronciata (la venetta approvata), sopra la testa a destra.
const VENA = {
  marcella: { x: 236, y: 44 }, carlotta: { x: 240, y: 60 }, balosso: { x: 240, y: 90 }, nella: { x: 238, y: 52 },
  filippo: { x: 238, y: 44 }, pasquale: { x: 238, y: 60 }, 'ebi-furai': { x: 238, y: 60 },
};

// Dove stanno la goccia e lo sbuffo del Lamento rispetto al disegno (centro del segno, in pixel del riquadro
// CLIENTE_SIZE), come SEGNI_POS dei Clienti di passaggio: la goccia dal lato della venetta, lo sbuffo dall'altro,
// fuori dal muso e dagli oggetti che il peluche tiene in mano.
export const CAST_SEGNI_POS = {
  marcella: { goccia: { x: 232, y: 90 }, sbuffo: { x: 26, y: 96 } },
  carlotta: { goccia: { x: 250, y: 72 }, sbuffo: { x: 18, y: 84 } },
  balosso: { goccia: { x: 246, y: 108 }, sbuffo: { x: 14, y: 100 } },
  nella: { goccia: { x: 232, y: 90 }, sbuffo: { x: 26, y: 96 } },
  filippo: { goccia: { x: 234, y: 86 }, sbuffo: { x: 26, y: 92 } },
  pasquale: { goccia: { x: 238, y: 104 }, sbuffo: { x: 22, y: 100 } },
  'ebi-furai': { goccia: { x: 232, y: 96 }, sbuffo: { x: 26, y: 100 } },
};

// Punti del disegno che servono ai riscontri dei Vizi (pixel del riquadro CLIENTE_SIZE, come CAST_SEGNI_POS): la borsetta
// d'oro di Carlotta, da cui escono le monete quando paga (ClienteView.puntoDelDisegno).
export const CAST_PUNTI = {
  carlotta: { borsa: { x: 200, y: 268 } },
};

function drawCast(ctx, rng, id, espressione) {
  // Come per i Clienti di passaggio: il corpo e la grana hanno il seme del personaggio, la faccia quello della
  // texture, così in tutte e quattro le espressioni il peluche è lo stesso tranne la faccia.
  const body = createRng(`${STILE.seme}:cliente-${id}`);
  DISEGNATORI[id](ctx, body, rng, espressione);
  if (espressione === 'imbronciata') venetta(ctx, rng, VENA[id].x, VENA[id].y);
  grain(ctx, CLIENTE_SIZE.w, CLIENTE_SIZE.h, createRng(`${STILE.seme}:cliente-${id}:grana`));
}

// Le voci da aggiungere a DISEGNI di catalogo.js: la chiave è clienteKey(id, espressione), come per i
// Clienti di passaggio.
export const DISEGNI_CAST = Object.fromEntries(
  CAST.flatMap((id) => ESPRESSIONI.map((espressione) => [
    clienteKey(id, espressione),
    { ...CLIENTE_SIZE, grain: false, draw: (ctx, rng) => drawCast(ctx, rng, id, espressione) },
  ])),
);

