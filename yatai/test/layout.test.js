import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SCHERMO, VIEW, YATAI } from '../src/config.js';
import { BANCONE_PIANO, BANCONE_SIZE, PAVIMENTO_SIZE } from '../src/disegni/yatai.js';
import { NO_INSETS, canvasRect, frameFor, safeInFrame } from '../src/layout/schermo.js';
import { bottomCenter, center, contentArea, fitIn, layoutYatai, placeMaurizio, row, stack } from '../src/layout/yatai.js';

const near = (a, b, msg, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${msg ?? ''} ${a} ≠ ${b}`);
const inside = (inner, outer, msg, eps = 1e-6) => {
  assert.ok(inner.x >= outer.x - eps && inner.y >= outer.y - eps, `${msg}: esce a sinistra o in alto`);
  assert.ok(inner.x + inner.w <= outer.x + outer.w + eps && inner.y + inner.h <= outer.y + outer.h + eps, `${msg}: esce a destra o in basso`);
};
const overlap = (a, b) => a.x < b.x + b.w - 1e-6 && b.x < a.x + a.w - 1e-6 && a.y < b.y + b.h - 1e-6 && b.y < a.y + a.h - 1e-6;

// Gli schermi su cui lo Yatai deve reggere: (larghezza, altezza) in pixel CSS e i margini sicuri.
const SCHERMI = [
  { nome: 'telefono piccolo 360×640', w: 360, h: 640, insets: NO_INSETS },
  { nome: 'telefono 390×844 con notch', w: 390, h: 844, insets: { top: 47, right: 0, bottom: 34, left: 0 } },
  { nome: 'telefono lungo 360×800', w: 360, h: 800, insets: { top: 28, right: 0, bottom: 20, left: 0 } },
  { nome: 'telefono corto 375×667', w: 375, h: 667, insets: { top: 20, right: 0, bottom: 0, left: 0 } },
  { nome: 'tablet 768×1024', w: 768, h: 1024, insets: NO_INSETS },
  { nome: 'computer 1280×720', w: 1280, h: 720, insets: NO_INSETS },
  { nome: 'computer largo 1920×1080', w: 1920, h: 1080, insets: NO_INSETS },
  // Di traverso la colonna 9:16 è larga 219 px: nulla esce, ma nessuna zona arriva a 44 px (dito: false).
  { nome: 'telefono di traverso 844×390 (notch)', w: 844, h: 390, insets: { top: 0, right: 47, bottom: 21, left: 47 }, dito: false },
];

const layoutFor = (schermo, options = {}) => {
  const view = { w: schermo.w, h: schermo.h };
  const frame = frameFor(view.w, view.h);
  const safe = safeInFrame(view, frame, schermo.insets);
  return { view, frame, safe, canvas: canvasRect(view, frame), layout: layoutYatai({ frame, safe, ...options }) };
};

// ---------------------------------------------------------------------------------------------
// Dallo schermo all'immagine di gioco

test("l'immagine di gioco è larga sempre 720 e alta quanto servono le proporzioni dello schermo", () => {
  assert.deepEqual(frameFor(360, 640), { width: 720, height: 1280 });
  assert.deepEqual(frameFor(390, 844), { width: 720, height: 1558 });
  assert.deepEqual(frameFor(375, 667), { width: 720, height: 1281 });
  assert.equal(frameFor(1280, 720).height, SCHERMO.minHeight);
  assert.equal(frameFor(1000, 1000).height, SCHERMO.minHeight);
});

test("l'altezza non supera mai il limite dei telefoni lunghi", () => {
  assert.equal(frameFor(360, 800).height, SCHERMO.maxHeight);
  assert.equal(frameFor(300, 1000).height, SCHERMO.maxHeight);
});

test("uno schermo senza misure dà l'immagine di partenza", () => {
  assert.deepEqual(frameFor(0, 0), { width: VIEW.width, height: VIEW.height });
  assert.deepEqual(frameFor(NaN, 600), { width: VIEW.width, height: VIEW.height });
});

test('su computer il gioco è una colonna 9:16 centrata', () => {
  const canvas = canvasRect({ w: 1280, h: 720 }, frameFor(1280, 720));
  near(canvas.h, 720, 'la colonna riempie l’altezza');
  near(canvas.w, 405, 'larghezza 9:16');
  near(canvas.x, (1280 - 405) / 2, 'centrata');
  near(canvas.y, 0);
  near(canvas.scale, 720 / 1280);
});

test('su un telefono 9:16 o più lungo il gioco riempie la larghezza', () => {
  for (const [w, h] of [[360, 640], [390, 844], [412, 880]]) {
    const canvas = canvasRect({ w, h }, frameFor(w, h));
    near(canvas.w, w, `${w}×${h}`, 0.5);
    near(canvas.h, h, `${w}×${h}`, 3);
  }
});

test("su un telefono ancora più lungo del limite restano le bande sopra e sotto, uguali", () => {
  const canvas = canvasRect({ w: 360, h: 900 }, frameFor(360, 900));
  assert.ok(canvas.y > 0);
  near(canvas.y * 2 + canvas.h, 900);
});

test("l'area sicura entra nel gioco solo dove il gioco tocca i bordi dello schermo", () => {
  const view = { w: 390, h: 844 };
  const frame = frameFor(view.w, view.h);
  const safe = safeInFrame(view, frame, { top: 47, right: 0, bottom: 34, left: 0 });
  const scale = canvasRect(view, frame).scale;
  near(safe.top, 47 / scale, 'notch in alto', 0.5);
  near(safe.bottom, 34 / scale, 'barra in basso', 0.5);
  assert.equal(safe.left, 0);
  assert.equal(safe.right, 0);
});

test('su computer i margini sicuri del dispositivo non toccano la colonna', () => {
  const view = { w: 1280, h: 720 };
  const safe = safeInFrame(view, frameFor(view.w, view.h), { top: 0, right: 40, bottom: 0, left: 40 });
  assert.deepEqual(safe, NO_INSETS);
});

test("i margini sicuri negativi o mancanti non rendono mai l'area sicura negativa", () => {
  const view = { w: 360, h: 640 };
  const safe = safeInFrame(view, frameFor(view.w, view.h), { top: -5, right: -1, bottom: 0, left: 0 });
  for (const value of Object.values(safe)) assert.ok(value >= 0);
});

// ---------------------------------------------------------------------------------------------
// I mattoni: pila, fila, adattamento

test('stack: le fasce si toccano, riempiono il rettangolo e dividono l’avanzo per flex', () => {
  const rect = { x: 10, y: 20, w: 300, h: 1000 };
  const [a, b, c] = stack(rect, [{ min: 100, flex: 0 }, { min: 200, flex: 1 }, { min: 300, flex: 3 }]);
  near(a.y, 20);
  near(a.h, 100, 'senza flex non cresce');
  near(b.y, a.y + a.h);
  near(c.y, b.y + b.h);
  near(c.y + c.h, rect.y + rect.h, 'arriva in fondo');
  // Avanzo: 1000 - 600 = 400, diviso 1 : 3.
  near(b.h, 300);
  near(c.h, 600);
  for (const f of [a, b, c]) assert.deepEqual([f.x, f.w], [rect.x, rect.w]);
});

test('stack: se lo spazio non basta le fasce si restringono in proporzione, senza sovrapporsi', () => {
  const rect = { x: 0, y: 0, w: 100, h: 300 };
  const fasce = stack(rect, [{ min: 200, flex: 1 }, { min: 400, flex: 0 }]);
  near(fasce[0].h, 100);
  near(fasce[1].h, 200);
  near(fasce[1].y + fasce[1].h, 300);
});

test('row: elementi uguali, centrati, mai più larghi di maxSlot', () => {
  const rect = { x: 24, y: 100, w: 672, h: 200 };
  const three = row(rect, 3, { maxSlot: 190 });
  assert.equal(three.length, 3);
  for (const slot of three) {
    near(slot.w, 190);
    near(slot.h, 200);
    near(slot.y, 100);
  }
  near(center(three[1]).x, rect.x + rect.w / 2, 'quello di mezzo sta al centro');
  near(three[0].x - rect.x, rect.x + rect.w - (three[2].x + three[2].w), 'margini uguali');
  const single = row(rect, 1, { maxSlot: 190 });
  near(center(single[0]).x, rect.x + rect.w / 2);
});

test('row: senza maxSlot riempie la larghezza, con gap lascia lo spazio tra gli elementi', () => {
  const rect = { x: 0, y: 0, w: 700, h: 50 };
  const slots = row(rect, 5, { gap: 10 });
  near(slots[0].x, 0);
  near(slots[4].x + slots[4].w, 700);
  near(slots[1].x - (slots[0].x + slots[0].w), 10);
});

test('fitIn: scala che fa stare il disegno, mai oltre maxScale, poggiato sul fondo', () => {
  const rect = { x: 100, y: 200, w: 300, h: 400 };
  assert.deepEqual(fitIn(rect, 150, 200), { scale: 1, x: 250, y: 600 });
  near(fitIn(rect, 600, 200).scale, 0.5, 'più largo del rettangolo');
  near(fitIn(rect, 150, 800).scale, 0.5, 'più alto del rettangolo');
  near(fitIn(rect, 150, 200, { maxScale: 1.5 }).scale, 1.5);
  near(fitIn(rect, 100, 100, { maxScale: 1 }).scale, 1);
  const centered = fitIn(rect, 100, 100, { anchor: 'center' });
  near(centered.y, 400 + 50, 'il fondo del disegno è mezzo disegno sotto il centro del rettangolo');
  assert.deepEqual(bottomCenter(rect), { x: 250, y: 600 });
});

test("contentArea: toglie l'area sicura e i margini ai lati e in fondo, non in alto", () => {
  const area = contentArea({ width: 720, height: 1280 }, { top: 40, right: 10, bottom: 30, left: 20 });
  assert.deepEqual(area, {
    x: 20 + YATAI.margine,
    y: 40,
    w: 720 - 30 - 2 * YATAI.margine,
    h: 1280 - 70 - YATAI.margine,
  });
});

// ---------------------------------------------------------------------------------------------
// Lo Yatai su tutti gli schermi

test('le fasce dello Yatai vanno dall’alto in basso nell’ordine giusto, senza buchi né sovrapposizioni', () => {
  for (const schermo of SCHERMI) {
    const { layout } = layoutFor(schermo);
    const nomi = YATAI.fasce.map((f) => f.nome);
    nomi.forEach((nome, i) => {
      inside(layout.zone[nome], layout.area, `${schermo.nome}: ${nome}`);
      if (i > 0) near(layout.zone[nome].y, layout.zone[nomi[i - 1]].y + layout.zone[nomi[i - 1]].h, `${schermo.nome}: ${nome} dopo ${nomi[i - 1]}`);
    });
    near(layout.zone[nomi.at(-1)].y + layout.zone[nomi.at(-1)].h, layout.area.y + layout.area.h, `${schermo.nome}: arriva in fondo`);
  }
});

test('i Posti stanno in alto, dentro la loro fascia, uno accanto all’altro', () => {
  for (const schermo of SCHERMI) {
    for (const seats of [3, 4]) {
      const { layout } = layoutFor(schermo, { seats });
      assert.equal(layout.posti.length, seats);
      layout.posti.forEach((posto, i) => {
        inside(posto, layout.zone.clienti, `${schermo.nome}, ${seats} Posti, Posto ${i}`);
        if (i > 0) assert.ok(!overlap(posto, layout.posti[i - 1]), `${schermo.nome}: Posto ${i} tocca il precedente`);
      });
      assert.ok(layout.posti[0].y + layout.posti[0].h <= layout.bancone.rect.y + 1e-6, 'i Posti stanno sopra il Bancone');
    }
  }
});

test('c’è già spazio per il quarto Posto: aggiungerlo cambia solo la fila dei Posti', () => {
  for (const schermo of SCHERMI) {
    const tre = layoutFor(schermo, { seats: 3 }).layout;
    const quattro = layoutFor(schermo, { seats: 4 }).layout;
    assert.deepEqual(quattro.zone, tre.zone, `${schermo.nome}: le fasce restano`);
    assert.deepEqual(quattro.postazioni, tre.postazioni);
    assert.deepEqual(quattro.bancone, tre.bancone);
    assert.deepEqual(quattro.maurizio, tre.maurizio);
    const widths = quattro.posti.map((p) => p.w);
    assert.ok(Math.min(...widths) >= 120, `${schermo.nome}: i 4 Posti sono troppo stretti (${Math.min(...widths)})`);
  }
});

test('con 3 Posti la fila è centrata e i Posti hanno già la misura che avranno con 4; con 4 occupano tutta la larghezza utile', () => {
  const { layout: tre } = layoutFor(SCHERMI[0], { seats: 3 });
  const { layout: quattro } = layoutFor(SCHERMI[0], { seats: 4 });
  near(center(tre.posti[1]).x, tre.area.x + tre.area.w / 2);
  near(tre.posti[0].w, quattro.posti[0].w, 'stessa misura');
  near(quattro.posti[0].x, quattro.area.x, 'primo Posto a filo del margine', 1);
  near(quattro.posti[3].x + quattro.posti[3].w, quattro.area.x + quattro.area.w, 'ultimo a filo', 1);
});

test('le 5 Postazioni stanno vicino al pollice, in una fila senza sovrapposizioni', () => {
  for (const schermo of SCHERMI) {
    const { layout } = layoutFor(schermo);
    assert.equal(layout.postazioni.length, YATAI.postazioni.massimo);
    layout.postazioni.forEach((slot, i) => {
      inside(slot, layout.zone.postazioni, `${schermo.nome}: Postazione ${i}`);
      if (i > 0) assert.ok(!overlap(slot, layout.postazioni[i - 1]), `${schermo.nome}: Postazione ${i} tocca la precedente`);
    });
    // Sono l'ultima cosa in basso: sotto c'è solo il margine.
    near(layout.postazioni[0].y + layout.postazioni[0].h, layout.area.y + layout.area.h);
    assert.ok(layout.postazioni[0].y > layout.maurizio.y, 'sotto Maurizio');
  }
});

test('meno Postazioni (le prime Serate) restano centrate e della stessa misura', () => {
  const { layout: cinque } = layoutFor(SCHERMI[0], { stations: 5 });
  const { layout: una } = layoutFor(SCHERMI[0], { stations: 1 });
  near(una.postazioni[0].w, cinque.postazioni[0].w);
  near(center(una.postazioni[0]).x, una.area.x + una.area.w / 2);
});

test('ogni zona da toccare è grande abbastanza per un dito (44 px CSS) a ogni schermo', () => {
  for (const schermo of SCHERMI.filter((s) => s.dito !== false)) {
    const { layout, canvas } = layoutFor(schermo, { seats: 4 });
    const targets = [
      ...layout.posti.map((r, i) => [`Posto ${i}`, r]),
      ...layout.postazioni.map((r, i) => [`Postazione ${i}`, r]),
      ...layout.bancone.piatti.map((r, i) => [`Piatto ${i}`, r]),
    ];
    for (const [nome, rect] of targets) {
      assert.ok(rect.w * canvas.scale >= 44, `${schermo.nome}: ${nome} largo ${(rect.w * canvas.scale).toFixed(1)} px`);
      assert.ok(rect.h * canvas.scale >= 44, `${schermo.nome}: ${nome} alto ${(rect.h * canvas.scale).toFixed(1)} px`);
    }
  }
});

test('il Bancone sta tra i Posti e Maurizio, con i Piatti in fila sul piano', () => {
  for (const schermo of SCHERMI) {
    const { layout } = layoutFor(schermo);
    const { rect, superficie, piatti } = layout.bancone;
    assert.equal(piatti.length, YATAI.bancone.capacita);
    inside(superficie, rect, `${schermo.nome}: piano`);
    piatti.forEach((slot, i) => {
      inside(slot, superficie, `${schermo.nome}: Piatto ${i}`);
      if (i > 0) assert.ok(!overlap(slot, piatti[i - 1]));
    });
    near(rect.y, layout.zone.clienti.y + layout.zone.clienti.h);
    near(rect.y + rect.h, layout.maurizio.y);
  }
});

test('Maurizio sta al centro della fascia della cucina, in orizzontale e in verticale, senza ingrandirsi oltre il disegno', () => {
  for (const schermo of SCHERMI) {
    const { layout } = layoutFor(schermo);
    const { scale, x, y } = placeMaurizio(layout.maurizio, 320, 450);
    assert.ok(scale <= YATAI.maurizio.scalaMax + 1e-9 && scale > 0.5, `${schermo.nome}: scala ${scale}`);
    near(x, layout.area.x + layout.area.w / 2, `${schermo.nome}: al centro in orizzontale`);
    const top = y - 450 * scale;
    assert.ok(top >= layout.maurizio.y - 1e-6 && y <= layout.maurizio.y + layout.maurizio.h + 1e-6, `${schermo.nome}: esce dalla fascia`);
    near(top - layout.maurizio.y, layout.maurizio.y + layout.maurizio.h - y, `${schermo.nome}: aria uguale sopra e sotto`);
  }
});

test('Maurizio non cambia posizione se cambiano i Posti', () => {
  const a = placeMaurizio(layoutFor(SCHERMI[1], { seats: 3 }).layout.maurizio, 320, 450);
  const b = placeMaurizio(layoutFor(SCHERMI[1], { seats: 4 }).layout.maurizio, 320, 450);
  assert.deepEqual(a, b);
});

test('anche con un margine sicuro enorme nulla esce o si sovrappone', () => {
  const pesante = { nome: 'estremo', w: 390, h: 844, insets: { top: 200, right: 60, bottom: 120, left: 60 } };
  const { layout } = layoutFor(pesante, { seats: 4 });
  for (const rect of [...layout.posti, ...layout.postazioni, ...layout.bancone.piatti, layout.maurizio]) inside(rect, layout.area, 'estremo');
  const nomi = YATAI.fasce.map((f) => f.nome);
  for (let i = 1; i < nomi.length; i++) assert.ok(!overlap(layout.zone[nomi[i]], layout.zone[nomi[i - 1]]));
});

test('un numero di Posti o Postazioni impossibile è un errore', () => {
  const frame = { width: 720, height: 1280 };
  assert.throws(() => layoutYatai({ frame, safe: NO_INSETS, seats: 0 }), RangeError);
  assert.throws(() => layoutYatai({ frame, safe: NO_INSETS, seats: YATAI.posti.massimo + 1 }), RangeError);
  assert.throws(() => layoutYatai({ frame, safe: NO_INSETS, stations: 6 }), RangeError);
  assert.throws(() => layoutYatai({ frame, safe: NO_INSETS, seats: 2.5 }), RangeError);
});

// ---------------------------------------------------------------------------------------------
// Il layout e i disegni devono andare d'accordo

test('il pavimento arriva sempre in fondo, anche sul telefono più lungo e con il notch', () => {
  const lunghi = [...SCHERMI, { nome: 'estremo', w: 300, h: 1000, insets: { top: 120, right: 0, bottom: 60, left: 0 } }];
  for (const schermo of lunghi) {
    const { layout, frame } = layoutFor(schermo);
    const fondo = layout.bancone.rect.y + 120 + PAVIMENTO_SIZE.h;
    assert.ok(fondo >= frame.height, `${schermo.nome}: il pavimento finisce a ${fondo}, il gioco a ${frame.height}`);
  }
});

test('il piano del Bancone nel layout è alto quanto il piano del disegno', () => {
  for (const schermo of SCHERMI.slice(0, 7)) {
    const { layout } = layoutFor(schermo);
    near(layout.bancone.rect.h, BANCONE_SIZE.h, `${schermo.nome}: altezza del Bancone`);
    near(layout.bancone.superficie.h, BANCONE_PIANO, `${schermo.nome}: altezza del piano`, 0.5);
  }
});

test('la larghezza di un Piatto sul Bancone basta a farlo vedere bene', () => {
  const { layout } = layoutFor(SCHERMI[0]);
  assert.ok(layout.bancone.piatti[0].w >= 120, `Piatto largo ${layout.bancone.piatti[0].w}`);
});
