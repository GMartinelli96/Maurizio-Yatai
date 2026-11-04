// I disegni dei Disturbatori (GLOSSARY.md; GAME_SPEC.md, "Clienti e Disturbatori"; ticket 11, passo 2): Croccola, le
// formiche e i corvi, a matita come il resto e senza una parola. Li mette in scena SerataScene (passo 3); qui ci sono solo
// i disegni. Come il cast, non stanno nel catalogo che si genera all'avvio: li genera la Serata che li ha
// (generateDisturbatori in kit/texture.js).
//
// Cosa li fa riconoscere, anche piccoli (a 360×640 Croccola è larga circa 70 px, una formica 25):
//   Croccola   gatta randagia grigia, a strisce, con il muso crema: non è il maneki-neko (bianco e arancione) né la
//              kitsune (arancione). Quattro pose: `croccola` (acquattata, occhi tondi fissi sul Piatto, la goccina di
//              bava), `croccola-balzo` (zampe in avanti, bocca aperta), `croccola-fusa` (coccolata, occhi a archetto) e
//              `croccola-fuga` (di fianco, di corsa: il Piatto lo mette la scena). Guarda a destra solo nella fuga; la scena
//              rovescia la texture se serve.
//   formiche   la fila la fa la scena con tante `formica-a` e `formica-b` (le zampe in due fasi: alternate fanno camminare).
//              Guardano a destra. `piatto-rovinato` si mette sopra il Piatto (che la scena ingrigisce): macchia verdastra,
//              formiche e due fili d'odore storto.
//   corvi      corvo indaco, tondo, becco arancione e occhio con il bianco. DUE zampe (GAME_SPEC.md, "Cose da evitare": il corvo
//              a tre zampe è lo Yatagarasu, il corvo sacro di Kumano), una `ZAMPE` che un test controlla. Guarda a sinistra, verso
//              lo Yatai; la scena rovescia la texture se serve. `corvo` (posato), `corvo-gracchia` (testa in su, becco aperto), e
//              `corvo-ali-su`, `corvo-ali-giu` (in volo, per la picchiata e la fuga).
//   segni      `segno-suono` (tre archi: il "kaa kaa" e le fusa), `segno-bersaglio` (anello tratteggiato morbido da
//              mettere intorno al Piatto puntato) e `piuma` (cade quando il corvo scappa).
//
// Niente denti, niente occhi cattivi: sono scocciatori buffi, per tutte le età.

import { PALETTE as C, STILE } from '../config.js';
import {
  FUR_LINE, clipTo, ellipse, fur, grain, pastelFill, pencilLine, roundedPolygon, smoothCurve,
} from '../kit/matita.js';
import { createRng } from '../kit/rng.js';
import {
  dark, faccia, mirror, plush, white,
} from './clienti.js';

const sw = (colore, ombra, luce) => ({ colore, ombra, luce });

// Colori dei soli Disturbatori, nello stesso formato dei campioni di PALETTE.
export const K = {
  gatta: sw('#b3b9c4', '#858c99', '#dfe3ea'),
  striscia: '#6b7280',
  crema: sw('#f8f0e2', '#d9ccb4', '#ffffff'),
  naso: sw('#e98aa0', '#d1627f', '#f6bccb'),
  cuscinetto: sw('#f4a6b8', '#d8758f', '#fcd5de'),
  bava: sw('#bfe3f7', '#82bde0', '#eaf7fd'),
  formica: sw('#7a4a36', '#4d2c1f', '#a56f55'),
  macchia: sw('#a9b08a', '#7c8460', '#cfd4b8'),
  odore: '#8a9468',
  corvo: sw('#55537a', '#34324f', '#8481a8'),
  corvoPancia: sw('#7a77a0', '#55537a', '#a9a6c9'),
  becco: sw('#f6b44c', '#d98a1e', '#fcdc9c'),
  zampa: '#e58a2c',
  bocca: sw('#c8505c', '#8f2f3a', '#e68a92'),
  anello: '#e8706a',
};

// Quante zampe ha un corvo: due. Un test lo controlla, perché quello a tre è lo Yatagarasu (GAME_SPEC.md).
export const ZAMPE = 2;

export const CROCCOLA_SIZE = { w: 240, h: 220 };
export const FORMICA_SIZE = { w: 100, h: 64 };
export const ROVINATO_SIZE = { w: 150, h: 150 };
export const CORVO_SIZE = { w: 200, h: 200 };
export const CORVO_VOLO_SIZE = { w: 330, h: 300 };
export const SUONO_SIZE = { w: 96, h: 80 };
export const BERSAGLIO_SIZE = { w: 180, h: 180 };
export const PIUMA_SIZE = { w: 44, h: 84 };

// Una macchia di linee scure (le strisce del pelo) dentro `host`: `linee` sono curve aperte.
function strisce(ctx, host, rng, linee, { width = 5, alpha = 0.5 } = {}) {
  ctx.save();
  clipTo(ctx, host);
  for (const linea of linee) pencilLine(ctx, smoothCurve(linea, { closed: false }), rng, { closed: false, width, alpha, amount: 0.5, color: K.striscia });
  ctx.restore();
}

// ---------------------------------------------------------------------------------------------
// Croccola

// Le orecchie a punta: `y` è la base, `alte` quanto salgono. Dentro rosa.
function orecchie(ctx, body, { x = 120, y = 62, dx = 62, alte = 52 } = {}) {
  for (const side of [-1, 1]) {
    const f = (pts) => (side < 0 ? pts : mirror(pts, x));
    const orecchio = roundedPolygon(f([{ x: x - dx, y: y + 6 }, { x: x - dx + 4, y: y - alte }, { x: x - 18, y: y - 14 }]), 9);
    plush(ctx, orecchio, body, K.gatta);
    const dentro = roundedPolygon(f([{ x: x - dx + 14, y: y - 2 }, { x: x - dx + 16, y: y - alte + 22 }, { x: x - 32, y: y - 14 }]), 5);
    pastelFill(ctx, dentro, body, K.cuscinetto, { volume: false });
    pencilLine(ctx, dentro, body, { width: 2.2 });
  }
}

// Il naso rosa, il filtro e i baffi (a sinistra e a destra del muso).
function musoGatta(ctx, face, { x = 120, y = 128 } = {}) {
  const muso = ellipse(x, y, 32, 21);
  pastelFill(ctx, muso, face, K.crema);
  pencilLine(ctx, muso, face, { width: 2.4 });
  const naso = roundedPolygon([{ x: x - 8, y: y - 12 }, { x: x + 8, y: y - 12 }, { x, y: y - 3 }], 4);
  pastelFill(ctx, naso, face, K.naso, { volume: false });
  pencilLine(ctx, naso, face, { width: 2 });
  pencilLine(ctx, [{ x, y: y - 3 }, { x, y: y + 4 }], face, { closed: false, width: 2.4 });
  for (const side of [-1, 1]) {
    for (const [dy, dx] of [[-6, 34], [2, 38], [10, 32]]) {
      pencilLine(ctx, [{ x: x + side * 30, y: y + dy * 0.7 }, { x: x + side * (30 + dx), y: y + dy * 1.7 }], face, {
        closed: false, width: 1.8, amount: 0.5, alpha: 0.8,
      });
    }
  }
}

// Le zampe davanti, con le dita: due ovali.
function zampa(ctx, body, x, y, rx, ry, rot = 0) {
  plush(ctx, ellipse(x, y, rx, ry, rot), body, K.gatta);
  for (const dx of [-0.45, 0, 0.45]) {
    pencilLine(ctx, [{ x: x + dx * rx, y: y + ry * 0.2 }, { x: x + dx * rx * 1.05, y: y + ry * 0.85 }], body, { closed: false, width: 1.8, amount: 0.3, alpha: 0.7 });
  }
}

// Gli occhi di Croccola che punta: bianchi con la pupilla in basso, fissi sul Piatto. `su` sposta lo sguardo (nel balzo,
// con gli occhi spalancati, la pupilla è al centro).
function occhiFissi(ctx, face, { x = 120, y = 100, dx = 34, su = 0 } = {}) {
  for (const side of [-1, 1]) {
    const ex = x + side * dx;
    const bianco = ellipse(ex, y, 14, 16.5);
    pastelFill(ctx, bianco, face, white, { volume: false, hatching: 0 });
    pencilLine(ctx, bianco, face, { width: 2.4 });
    const pupilla = ellipse(ex - side * 1.5, y + 6 - su, 8.4, 10.4);
    pastelFill(ctx, pupilla, face, dark, { volume: false, hatching: 0.5 });
    pastelFill(ctx, ellipse(ex - side * 1.5 + 3, y + 3 - su, 2.8, 2.8), face, white, { volume: false, hatching: 0 });
  }
}

// La testa di Croccola (comune a `croccola`, `croccola-balzo` e `croccola-fusa`): orecchie, faccia tonda, strisce sulla fronte,
// muso crema. `y` è l'altezza del centro della testa.
function testaDiCroccola(ctx, body, face, espressione, y = 106) {
  orecchie(ctx, body, { y: y - 44 });
  const testa = ellipse(120, y, 72, 58);
  pastelFill(ctx, testa, body, K.gatta);
  strisce(ctx, testa, body, [
    [{ x: 120, y: y - 58 }, { x: 119, y: y - 44 }, { x: 120, y: y - 30 }],
    [{ x: 98, y: y - 56 }, { x: 102, y: y - 44 }, { x: 106, y: y - 34 }],
    [{ x: 142, y: y - 56 }, { x: 138, y: y - 44 }, { x: 134, y: y - 34 }],
    [{ x: 52, y: y + 6 }, { x: 66, y: y + 8 }], [{ x: 54, y: y + 20 }, { x: 68, y: y + 18 }],
    [{ x: 188, y: y + 6 }, { x: 174, y: y + 8 }], [{ x: 186, y: y + 20 }, { x: 172, y: y + 18 }],
  ]);
  fur(ctx, testa, body, K.gatta);
  pencilLine(ctx, testa, body, FUR_LINE);
  musoGatta(ctx, face, { y: y + 22 });
  if (espressione === 'fusa') {
    faccia(ctx, face, 'contenta', { occhiY: y - 8, occhiDx: 34, boccaY: y + 34, guanceY: y + 14, guanceDx: 56 });
  } else if (espressione === 'balzo') {
    occhiFissi(ctx, face, { y: y - 8, su: 5 });
    // Bocca aperta, senza denti: una "o" larga con la lingua.
    const bocca = ellipse(120, y + 38, 11, 10);
    pastelFill(ctx, bocca, face, K.bocca, { volume: false, hatching: 0 });
    pastelFill(ctx, ellipse(120, y + 43, 6, 3.6), face, K.cuscinetto, { volume: false, hatching: 0 });
    pencilLine(ctx, bocca, face, { width: 2.4 });
  } else {
    occhiFissi(ctx, face, { y: y - 8 });
    // La bocca socchiusa e la goccina di bava all'angolo: ha già visto il pesce.
    const bocca = ellipse(120, y + 37, 6, 6.4);
    pastelFill(ctx, bocca, face, K.bocca, { volume: false, hatching: 0 });
    pencilLine(ctx, bocca, face, { width: 2.2 });
    const goccia = smoothCurve([{ x: 142, y: y + 38 }, { x: 148, y: y + 50 }, { x: 144, y: y + 59 }, { x: 138, y: y + 52 }]);
    pastelFill(ctx, goccia, face, K.bava, { volume: false, hatching: 0 });
    pencilLine(ctx, goccia, face, { width: 2, amount: 0.3, color: '#5a9fd0' });
  }
}

// La coda alzata, dietro, con le strisce.
function coda(ctx, body, { x, y, rx = 15, ry = 58, rot = 0.3 }) {
  const forma = ellipse(x, y, rx, ry, rot);
  pastelFill(ctx, forma, body, K.gatta);
  strisce(ctx, forma, body, [-30, -8, 14, 36].map((dy) => [{ x: x - rx - 4, y: y + dy - 4 }, { x: x + rx + 4, y: y + dy + 4 }]), { width: 5, alpha: 0.45 });
  fur(ctx, forma, body, K.gatta);
  pencilLine(ctx, forma, body, FUR_LINE);
}

function drawCroccola(ctx, body, face, posa) {
  if (posa === 'fuga') {
    drawCroccolaFuga(ctx, body, face);
    return;
  }
  const fusa = posa === 'fusa';
  const balzo = posa === 'balzo';
  // La coda: dritta e un po' arricciata in cima quando fa le fusa, frustata dietro quando punta.
  coda(ctx, body, fusa ? { x: 206, y: 150, rx: 14, ry: 52, rot: 0.55 } : { x: 208, y: 128, rx: 14, ry: 56, rot: 0.35 });
  // Il corpo: accovacciato (basso e largo) o seduto (più alto).
  const tronco = fusa ? ellipse(120, 168, 64, 52) : ellipse(120, balzo ? 164 : 174, 78, balzo ? 52 : 44);
  pastelFill(ctx, tronco, body, K.gatta);
  strisce(ctx, tronco, body, [
    [{ x: 52, y: 150 }, { x: 70, y: 160 }], [{ x: 48, y: 170 }, { x: 68, y: 176 }],
    [{ x: 188, y: 150 }, { x: 170, y: 160 }], [{ x: 192, y: 170 }, { x: 172, y: 176 }],
  ], { width: 5, alpha: 0.45 });
  fur(ctx, tronco, body, K.gatta, { keep: (p) => p.y < 205 });
  pencilLine(ctx, tronco, body, FUR_LINE);
  const petto = ellipse(120, fusa ? 184 : 186, 30, 24);
  pastelFill(ctx, petto, body, K.crema);
  pencilLine(ctx, petto, body, { width: 2.2, alpha: 0.7 });
  testaDiCroccola(ctx, body, face, posa === 'punta' ? 'punta' : posa, balzo ? 98 : fusa ? 106 : 108);
  // Le zampe davanti: in avanti, ai lati del muso nel balzo, sotto il petto quando è coccolata.
  if (balzo) {
    zampa(ctx, body, 38, 126, 20, 36, -0.6);
    zampa(ctx, body, 202, 126, 20, 36, 0.6);
    for (const x of [38, 202]) {
      const cuscinetto = ellipse(x + (x < 120 ? 7 : -7), 134, 9, 8);
      pastelFill(ctx, cuscinetto, body, K.cuscinetto, { volume: false });
      pencilLine(ctx, cuscinetto, body, { width: 1.6, amount: 0.3 });
    }
  } else {
    zampa(ctx, body, fusa ? 94 : 84, 204, 26, 14);
    zampa(ctx, body, fusa ? 146 : 156, 204, 26, 14);
  }
}

// Di fianco, di corsa verso destra: il corpo teso, la testa avanti con le orecchie un po' indietro, le zampe tese davanti e dietro.
function drawCroccolaFuga(ctx, body, face) {
  ctx.save();
  ctx.translate(4, 16);
  ctx.scale(0.9, 0.9);
  // La coda alta e mossa, dietro.
  coda(ctx, body, { x: 30, y: 82, rx: 12, ry: 52, rot: -0.45 });
  // Le zampe di dietro, tese, e quelle davanti, tese in avanti.
  zampa(ctx, body, 38, 156, 30, 11, 0.3);
  zampa(ctx, body, 76, 164, 28, 11, 0.12);
  zampa(ctx, body, 206, 160, 28, 11, -0.18);
  zampa(ctx, body, 232, 144, 22, 10, -0.5);
  // Il corpo lungo.
  const tronco = ellipse(122, 122, 86, 40, -0.06);
  pastelFill(ctx, tronco, body, K.gatta);
  strisce(ctx, tronco, body, [
    [{ x: 70, y: 86 }, { x: 78, y: 108 }], [{ x: 96, y: 84 }, { x: 102, y: 108 }], [{ x: 124, y: 84 }, { x: 128, y: 108 }], [{ x: 150, y: 86 }, { x: 152, y: 108 }],
  ], { width: 5, alpha: 0.45 });
  pastelFill(ctx, ellipse(150, 142, 38, 14), body, K.crema, { volume: false });
  fur(ctx, tronco, body, K.gatta, { keep: (p) => p.y < 150 });
  pencilLine(ctx, tronco, body, FUR_LINE);
  // La testa, con due orecchie piegate indietro, il muso crema e un occhio solo (la bocca è un po' aperta: tiene il Piatto).
  for (const [dx, dy] of [[-12, 6], [10, -2]]) {
    const orecchio = roundedPolygon([{ x: 168 + dx, y: 76 + dy }, { x: 158 + dx, y: 38 + dy }, { x: 192 + dx, y: 62 + dy }], 7);
    plush(ctx, orecchio, body, K.gatta);
  }
  const testa = ellipse(190, 98, 40, 36);
  pastelFill(ctx, testa, body, K.gatta);
  fur(ctx, testa, body, K.gatta);
  pencilLine(ctx, testa, body, FUR_LINE);
  const muso = ellipse(222, 108, 16, 14);
  pastelFill(ctx, muso, face, K.crema);
  pencilLine(ctx, muso, face, { width: 2.2 });
  const naso = roundedPolygon([{ x: 226, y: 96 }, { x: 237, y: 98 }, { x: 234, y: 106 }], 3);
  pastelFill(ctx, naso, face, K.naso, { volume: false });
  pencilLine(ctx, naso, face, { width: 1.8 });
  const occhio = ellipse(204, 88, 7, 9.5);
  pastelFill(ctx, occhio, face, dark, { volume: false, hatching: 0.5 });
  pencilLine(ctx, occhio, face, { width: 2 });
  pastelFill(ctx, ellipse(206.5, 85, 2.4, 2.4), face, white, { volume: false, hatching: 0 });
  pastelFill(ctx, ellipse(196, 108, 9, 5.5), face, { colore: C.guance, ombra: C.guance, luce: C.bianco }, { volume: false, alpha: 0.6 });
  pencilLine(ctx, smoothCurve([{ x: 218, y: 118 }, { x: 226, y: 121 }, { x: 234, y: 117 }], { closed: false }), face, { closed: false, width: 2.2 });
  // Le righe della corsa, dietro.
  for (const [y, lunga] of [[100, 26], [118, 36], [136, 22]]) {
    pencilLine(ctx, [{ x: 6, y }, { x: 6 + lunga, y }], face, { closed: false, width: 3, amount: 0.4, alpha: 0.55 });
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------------------------
// Le formiche

// Una formica di fianco, che guarda a destra. `fase` 0 e 1: le zampe sono in due posizioni, e alternandole cammina.
function drawFormica(ctx, rng, fase) {
  const base = 46;
  // Le zampe: tre a coppia, in due fasi (una sale e una scende). Sotto il corpo, un po' storte.
  const attacchi = [58, 46, 36];
  attacchi.forEach((x, i) => {
    const su = (i + fase) % 2 === 0;
    for (const lontana of [true, false]) {
      const dx = (lontana ? -1 : 1) * (su ? 7 : -5);
      pencilLine(ctx, smoothCurve([
        { x, y: base - 6 }, { x: x + dx + (i - 1) * 6, y: base + (su ? 3 : 8) }, { x: x + dx * 2.2 + (i - 1) * 9, y: base + (su ? 11 : 15) },
      ], { closed: false }), rng, { closed: false, width: lontana ? 2.4 : 3.2, amount: 0.3, alpha: lontana ? 0.65 : 1, color: K.formica.ombra });
    }
  });
  // Le tre parti del corpo: addome, torace, testa.
  const addome = ellipse(26, 36, 21, 15, -0.12);
  pastelFill(ctx, addome, rng, K.formica);
  pencilLine(ctx, addome, rng, { width: 2.6 });
  const torace = ellipse(54, 36, 12, 10);
  pastelFill(ctx, torace, rng, K.formica);
  pencilLine(ctx, torace, rng, { width: 2.4 });
  const testa = ellipse(76, 34, 13, 12);
  pastelFill(ctx, testa, rng, K.formica);
  pencilLine(ctx, testa, rng, { width: 2.6 });
  // Le antenne con la punta a pallina.
  for (const [dx, dy, tx, ty] of [[4, -9, 14, -22], [8, -8, 24, -17]]) {
    pencilLine(ctx, smoothCurve([{ x: 78 + dx - 2, y: 28 + dy + 8 }, { x: 78 + dx + 4, y: 28 + dy - 4 }, { x: 78 + tx, y: 28 + ty }], { closed: false }), rng, { closed: false, width: 2, amount: 0.3 });
    pastelFill(ctx, ellipse(78 + tx, 28 + ty, 2.8, 2.8), rng, K.formica, { volume: false, hatching: 0 });
  }
  // L'occhio tondo con la lucina, e un sorrisino: sono scocciatrici, non cattive.
  pastelFill(ctx, ellipse(80, 31, 3.6, 4.2), rng, dark, { volume: false, hatching: 0 });
  pastelFill(ctx, ellipse(81, 29.6, 1.2, 1.2), rng, white, { volume: false, hatching: 0 });
  pencilLine(ctx, smoothCurve([{ x: 80, y: 40 }, { x: 84, y: 42 }, { x: 88, y: 39 }], { closed: false }), rng, { closed: false, width: 1.6, amount: 0.2 });
  // La luce sull'addome.
  pencilLine(ctx, smoothCurve([{ x: 14, y: 29 }, { x: 24, y: 24 }, { x: 34, y: 25 }], { closed: false }), rng, { closed: false, width: 2.4, amount: 0.3, alpha: 0.7, color: K.formica.luce });
}

// Da mettere sopra il Piatto che le formiche hanno rovinato (la scena lo ingrigisce): una macchia verdastra, tre formiche e due
// fili d'odore storto. Larga come il Piatto sul Bancone.
function drawRovinato(ctx, rng) {
  const macchia = smoothCurve([
    { x: 24, y: 96 }, { x: 34, y: 66 }, { x: 70, y: 52 }, { x: 112, y: 62 }, { x: 132, y: 92 }, { x: 118, y: 124 }, { x: 74, y: 134 }, { x: 40, y: 122 },
  ]);
  pastelFill(ctx, macchia, rng, K.macchia, { alpha: 0.78 });
  pencilLine(ctx, macchia, rng, { width: 2.6, alpha: 0.7, color: K.macchia.ombra, amount: 0.7 });
  // Tre formiche piccole, in giro per la macchia (la stessa del cammino, già a punto, ma più piccole e ferme).
  for (const [x, y, s, rot] of [[56, 84, 0.62, -0.3], [92, 72, 0.5, 0.5], [86, 112, 0.58, 0.2]]) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.translate(-FORMICA_SIZE.w / 2, -FORMICA_SIZE.h / 2);
    drawFormica(ctx, rng, 0);
    ctx.restore();
  }
  // L'odore storto: due fili ondulati che salgono.
  for (const x of [48, 110]) {
    const filo = smoothCurve([{ x, y: 56 }, { x: x - 8, y: 42 }, { x: x + 6, y: 28 }, { x: x - 6, y: 14 }, { x: x + 4, y: 4 }], { closed: false });
    pencilLine(ctx, filo, rng, { closed: false, width: 3, amount: 0.4, alpha: 0.85, color: K.odore });
  }
}

// ---------------------------------------------------------------------------------------------
// I corvi

// Le due zampe arancioni con tre dita avanti e una dietro, ferme sul posatoio (la base del disegno).
function zampeCorvo(ctx, rng, y = 196) {
  const xs = [90, 118];
  if (xs.length !== ZAMPE) throw new Error('un corvo ha due zampe');
  for (const x of xs) {
    pencilLine(ctx, [{ x, y: y - 22 }, { x, y: y - 2 }], rng, { closed: false, width: 5, amount: 0.3, color: K.zampa });
    for (const dx of [-10, -4, 8]) {
      pencilLine(ctx, [{ x, y: y - 2 }, { x: x + dx, y: y + (dx === 8 ? -1 : 0) }], rng, { closed: false, width: 3.6, amount: 0.3, color: K.zampa });
    }
  }
}

// La testa del corvo, che guarda a sinistra. `su`: quanto è alzata (nel "kaa" il collo si allunga e il becco si apre).
function testaCorvo(ctx, body, face, { gracchia = false } = {}) {
  const cx = 74;
  const cy = gracchia ? 62 : 74;
  const testa = ellipse(cx, cy, 41, 38);
  // Il becco, sotto la testa: due metà, aperte quando gracchia.
  if (gracchia) {
    const sotto = roundedPolygon([{ x: cx - 26, y: cy + 12 }, { x: 4, y: cy + 30 }, { x: cx - 26, y: cy + 26 }], 4);
    const dentro = roundedPolygon([{ x: cx - 28, y: cy + 8 }, { x: 10, y: cy + 4 }, { x: 8, y: cy + 26 }, { x: cx - 28, y: cy + 24 }], 5);
    pastelFill(ctx, dentro, face, K.bocca, { volume: false, hatching: 0 });
    pastelFill(ctx, ellipse(30, cy + 18, 11, 5), face, K.cuscinetto, { volume: false, hatching: 0 });
    pencilLine(ctx, dentro, face, { width: 2.2 });
    pastelFill(ctx, sotto, face, K.becco, { volume: false });
    pencilLine(ctx, sotto, face, { width: 2.4 });
  }
  pastelFill(ctx, testa, body, K.corvo);
  fur(ctx, testa, body, K.corvo);
  pencilLine(ctx, testa, body, FUR_LINE);
  const sopra = gracchia
    ? roundedPolygon([{ x: cx - 26, y: cy - 2 }, { x: 2, y: cy - 16 }, { x: 6, y: cy + 4 }, { x: cx - 26, y: cy + 14 }], 5)
    : roundedPolygon([{ x: cx - 28, y: cy - 8 }, { x: 4, y: cy + 8 }, { x: cx - 28, y: cy + 20 }], 5);
  pastelFill(ctx, sopra, face, K.becco, { volume: false });
  pencilLine(ctx, sopra, face, { width: 2.6 });
  if (!gracchia) pencilLine(ctx, [{ x: cx - 27, y: cy + 8 }, { x: 14, y: cy + 8 }], face, { closed: false, width: 2, amount: 0.3 });
  // L'occhio: bianco con la pupilla, per staccarlo dalle penne scure. Chiuso a archetto quando gracchia (il "kaa" è forte).
  const ex = cx - 12;
  const ey = cy - 8;
  if (gracchia) {
    pencilLine(ctx, smoothCurve([{ x: ex - 9, y: ey + 3 }, { x: ex, y: ey - 7 }, { x: ex + 9, y: ey + 3 }], { closed: false }), face, { closed: false, width: 3.6, amount: 0.5, color: '#fff7ec' });
  } else {
    const bianco = ellipse(ex, ey, 10, 11.5);
    pastelFill(ctx, bianco, face, white, { volume: false, hatching: 0 });
    pencilLine(ctx, bianco, face, { width: 2.2 });
    pastelFill(ctx, ellipse(ex - 2, ey + 1, 6, 7), face, dark, { volume: false, hatching: 0.5 });
    pastelFill(ctx, ellipse(ex - 0.5, ey - 2, 2.2, 2.2), face, white, { volume: false, hatching: 0 });
  }
  pastelFill(ctx, ellipse(cx + 8, cy + 14, 11, 6.5), face, { colore: C.guance, ombra: C.guance, luce: C.bianco }, { volume: false, alpha: 0.6 });
}

function drawCorvo(ctx, body, face, posa) {
  const gracchia = posa === 'gracchia';
  zampeCorvo(ctx, face);
  // La coda: penne lunghe che scendono a destra.
  const coda = roundedPolygon([{ x: 140, y: 148 }, { x: 192, y: 174 }, { x: 182, y: 192 }, { x: 128, y: 172 }], 8);
  pastelFill(ctx, coda, body, K.corvo);
  pencilLine(ctx, coda, body, FUR_LINE);
  pencilLine(ctx, [{ x: 150, y: 164 }, { x: 180, y: 180 }], body, { closed: false, width: 2, amount: 0.4, alpha: 0.55, color: K.corvo.ombra });
  // Il corpo tondo e la pancia più chiara.
  const tronco = ellipse(102, 128, 58, 54, 0.1);
  plush(ctx, tronco, body, K.corvo, (p) => p.y < 170);
  const pancia = ellipse(86, 142, 34, 34);
  pastelFill(ctx, pancia, body, K.corvoPancia);
  pencilLine(ctx, pancia, body, { width: 2.2, alpha: 0.6 });
  // L'ala piegata sul fianco, con tre penne.
  const ala = smoothCurve([{ x: 108, y: 100 }, { x: 150, y: 124 }, { x: 166, y: 160 }, { x: 138, y: 166 }, { x: 108, y: 148 }]);
  pastelFill(ctx, ala, body, K.corvo);
  fur(ctx, ala, body, K.corvo);
  pencilLine(ctx, ala, body, FUR_LINE);
  for (const [x1, y1, x2, y2] of [[128, 128, 150, 150], [118, 136, 138, 158]]) {
    pencilLine(ctx, [{ x: x1, y: y1 }, { x: x2, y: y2 }], body, { closed: false, width: 2, amount: 0.4, alpha: 0.55, color: K.corvo.luce });
  }
  testaCorvo(ctx, body, face, { gracchia });
}

// Un'ala aperta: larga alla base e con cinque penne lunghe a ventaglio, che parte dalla spalla (0, 0) e va verso destra.
function ala(ctx, body, lontana) {
  const colori = lontana ? { colore: K.corvo.ombra, ombra: K.corvo.ombra, luce: K.corvo.colore } : K.corvo;
  for (const angolo of [-0.42, -0.21, 0, 0.21, 0.42]) {
    const penna = ellipse(62 + Math.cos(angolo) * 50, Math.sin(angolo) * 50, 52, 11, angolo);
    pastelFill(ctx, penna, body, colori);
    pencilLine(ctx, penna, body, FUR_LINE);
  }
  const base = ellipse(34, 0, 44, 24);
  pastelFill(ctx, base, body, colori);
  fur(ctx, base, body, colori);
  pencilLine(ctx, base, body, FUR_LINE);
}

// In volo, che guarda a sinistra: le ali alzate (`su`) o abbassate, ruotando l'ala intorno alla spalla. Le zampe, due, stanno
// raccolte sotto la pancia.
function drawCorvoVolo(ctx, body, face, su) {
  ctx.save();
  ctx.translate(0, 42);
  const spalla = { x: 150, y: 112 };
  const mettiAla = (lontana) => {
    ctx.save();
    ctx.translate(spalla.x + (lontana ? 18 : 0), spalla.y + (lontana ? -4 : 0));
    ctx.rotate(su ? (lontana ? -0.95 : -0.8) : lontana ? 0.4 : 0.6);
    ala(ctx, body, lontana);
    ctx.restore();
  };
  mettiAla(true);
  const coda = roundedPolygon([{ x: 184, y: 122 }, { x: 240, y: 132 }, { x: 236, y: 154 }, { x: 178, y: 144 }], 8);
  pastelFill(ctx, coda, body, K.corvo);
  pencilLine(ctx, coda, body, FUR_LINE);
  const tronco = ellipse(146, 122, 50, 40, 0.15);
  plush(ctx, tronco, body, K.corvo);
  pastelFill(ctx, ellipse(132, 132, 28, 24), body, K.corvoPancia);
  for (const x of [124, 146]) {
    pencilLine(ctx, [{ x, y: 154 }, { x: x - 3, y: 170 }], body, { closed: false, width: 4.4, amount: 0.3, color: K.zampa });
    for (const dx of [-8, 0, 6]) pencilLine(ctx, [{ x: x - 3, y: 170 }, { x: x - 3 + dx, y: 177 }], body, { closed: false, width: 3.2, amount: 0.3, color: K.zampa });
  }
  mettiAla(false);
  // La testa, dalla parte del becco: è quella del corvo posato, spostata.
  ctx.save();
  ctx.translate(36, 24);
  testaCorvo(ctx, body, face, { gracchia: false });
  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------------------------------------
// I segni

// Tre archi, come ")))" a destra di chi parla o fa le fusa: del "kaa kaa" del corvo e delle fusa di Croccola.
function drawSuono(ctx, rng) {
  for (const [r, w] of [[14, 3.6], [28, 3.4], [42, 3.2]]) {
    const arco = [];
    for (let a = -0.9; a <= 0.9; a += 0.15) arco.push({ x: 12 + Math.cos(a) * r, y: 40 + Math.sin(a) * r * 1.15 });
    pencilLine(ctx, smoothCurve(arco, { closed: false }), rng, { closed: false, width: w, amount: 0.5, alpha: 0.9 });
  }
}

// Un anello tratteggiato, morbido, da mettere intorno al Piatto puntato: dice "attento a questo", senza parole.
function drawBersaglio(ctx, rng) {
  const c = BERSAGLIO_SIZE.w / 2;
  const trattini = 12;
  for (let i = 0; i < trattini; i++) {
    const a0 = (i / trattini) * Math.PI * 2;
    const a1 = a0 + (Math.PI * 2) / trattini * 0.55;
    const arco = [];
    for (let a = a0; a <= a1 + 1e-6; a += (a1 - a0) / 4) arco.push({ x: c + Math.cos(a) * 76, y: c + Math.sin(a) * 76 });
    pencilLine(ctx, smoothCurve(arco, { closed: false }), rng, { closed: false, width: 6, amount: 0.5, color: K.anello });
  }
}

// Una piuma di corvo, che cade quando scappa.
function drawPiuma(ctx, rng) {
  const forma = smoothCurve([
    { x: 22, y: 4 }, { x: 36, y: 26 }, { x: 38, y: 52 }, { x: 28, y: 74 }, { x: 22, y: 80 }, { x: 16, y: 74 }, { x: 6, y: 52 }, { x: 8, y: 26 },
  ]);
  pastelFill(ctx, forma, rng, K.corvo);
  pencilLine(ctx, forma, rng, { width: 2.4 });
  pencilLine(ctx, [{ x: 22, y: 8 }, { x: 22, y: 82 }], rng, { closed: false, width: 2.2, amount: 0.3, alpha: 0.7, color: K.corvo.luce });
}

// ---------------------------------------------------------------------------------------------
// Il catalogo

const seme = (nome) => `${STILE.seme}:disturbatore-${nome}`;

// Il corpo e la grana hanno il seme del personaggio, la faccia quello della texture: nelle pose Croccola è sempre lo stesso gatto.
function conCorpo(nome, size, disegna) {
  return {
    ...size,
    grain: false,
    draw: (ctx, rng) => {
      disegna(ctx, createRng(seme(nome)), rng);
      grain(ctx, size.w, size.h, createRng(`${seme(nome)}:grana`));
    },
  };
}

// Le voci da generare quando una Serata ha dei Disturbatori (kit/texture.js, generateDisturbatori).
export const DISEGNI_DISTURBATORI = {
  croccola: conCorpo('croccola', CROCCOLA_SIZE, (ctx, body, face) => drawCroccola(ctx, body, face, 'punta')),
  'croccola-balzo': conCorpo('croccola', CROCCOLA_SIZE, (ctx, body, face) => drawCroccola(ctx, body, face, 'balzo')),
  'croccola-fusa': conCorpo('croccola', CROCCOLA_SIZE, (ctx, body, face) => drawCroccola(ctx, body, face, 'fusa')),
  'croccola-fuga': conCorpo('croccola', CROCCOLA_SIZE, (ctx, body, face) => drawCroccola(ctx, body, face, 'fuga')),
  'formica-a': conCorpo('formica', FORMICA_SIZE, (ctx, body) => drawFormica(ctx, body, 0)),
  'formica-b': conCorpo('formica', FORMICA_SIZE, (ctx, body) => drawFormica(ctx, body, 1)),
  'piatto-rovinato': conCorpo('rovinato', ROVINATO_SIZE, (ctx, body) => drawRovinato(ctx, body)),
  corvo: conCorpo('corvo', CORVO_SIZE, (ctx, body, face) => drawCorvo(ctx, body, face, 'posato')),
  'corvo-gracchia': conCorpo('corvo', CORVO_SIZE, (ctx, body, face) => drawCorvo(ctx, body, face, 'gracchia')),
  'corvo-ali-su': conCorpo('corvo', CORVO_VOLO_SIZE, (ctx, body, face) => drawCorvoVolo(ctx, body, face, true)),
  'corvo-ali-giu': conCorpo('corvo', CORVO_VOLO_SIZE, (ctx, body, face) => drawCorvoVolo(ctx, body, face, false)),
  'segno-suono': conCorpo('suono', SUONO_SIZE, (ctx, body) => drawSuono(ctx, body)),
  'segno-bersaglio': conCorpo('bersaglio', BERSAGLIO_SIZE, (ctx, body) => drawBersaglio(ctx, body)),
  piuma: conCorpo('piuma', PIUMA_SIZE, (ctx, body) => drawPiuma(ctx, body)),
};

// Chi li usa: i tipi di Disturbatore della logica (DISTURBATORI in config.js) e quali texture sono sue. I segni (il suono, l'anello
// del bersaglio) servono a tutti.
export const TEXTURE_DI = {
  croccola: ['croccola', 'croccola-balzo', 'croccola-fusa', 'croccola-fuga'],
  formiche: ['formica-a', 'formica-b', 'piatto-rovinato'],
  corvi: ['corvo', 'corvo-gracchia', 'corvo-ali-su', 'corvo-ali-giu', 'piuma'],
};
export const TEXTURE_COMUNI = ['segno-suono', 'segno-bersaglio'];

// Le texture che servono a una Serata con questi Disturbatori (nessuna se non ne ha).
export const texturePer = (tipi) => (tipi.length ? [...tipi.flatMap((tipo) => TEXTURE_DI[tipo]), ...TEXTURE_COMUNI] : []);
