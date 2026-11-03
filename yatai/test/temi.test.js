import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ETICHETTA, MATSURI, MATSURI_PREDEFINITO, PALETTE, RUOLI_TEMA, TEMI } from '../src/config.js';
import { DISEGNI } from '../src/disegni/catalogo.js';
import { chiaviTema, disegniTema } from '../src/disegni/sfondi/index.js';
import { FUOCO, fuoco } from '../src/disegni/sfondi/hanabi.js';
import { createRng } from '../src/kit/rng.js';
import { TANZAKU_LIBERI } from '../src/disegni/sfondi/tanabata.js';
import { record, recordingContext } from './registratore.js';

const HEX = /^#[0-9a-f]{6}$/i;
const luminanza = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
// Il rapporto di contrasto WCAG tra due colori: da 1 (uguali) a 21 (nero su bianco).
const contrasto = (a, b) => {
  const [alto, basso] = [luminanza(a), luminanza(b)].sort((x, y) => y - x);
  return (alto + 0.05) / (basso + 0.05);
};
const toni = (campione) => [campione.colore, campione.ombra, campione.luce];

// ---------------------------------------------------------------------------------------------
// I temi sono completi

test('ci sono i 5 Matsuri, nell’ordine dell’anno, e il predefinito è l’Hanami', () => {
  assert.deepEqual(MATSURI, ['hanami', 'tanabata', 'hanabi', 'aki', 'yuki']);
  assert.equal(MATSURI_PREDEFINITO, 'hanami');
});

test('ogni tema ha tutti i ruoli, e ogni colore la sua ombra e la sua luce', () => {
  for (const matsuri of MATSURI) {
    const tema = TEMI[matsuri];
    assert.deepEqual(Object.keys(tema).sort(), [...RUOLI_TEMA].sort(), `${matsuri}: ruoli diversi da RUOLI_TEMA`);
    for (const ruolo of RUOLI_TEMA) {
      if (ruolo === 'carta') {
        assert.match(tema.carta, HEX, `${matsuri}.carta`);
      } else if (ruolo === 'tendina') {
        assert.equal(tema.tendina.length, 2, `${matsuri}: la tendina ha due strisce`);
        for (const striscia of tema.tendina) for (const t of toni(striscia)) assert.match(t, HEX, `${matsuri}.tendina`);
      } else {
        assert.deepEqual(Object.keys(tema[ruolo]).sort(), ['colore', 'luce', 'ombra'], `${matsuri}.${ruolo}`);
        for (const t of toni(tema[ruolo])) assert.match(t, HEX, `${matsuri}.${ruolo}`);
      }
    }
  }
});

test('le due strisce della tendina si distinguono, in ogni tema', () => {
  for (const matsuri of MATSURI) {
    const [a, b] = TEMI[matsuri].tendina;
    assert.notEqual(a.colore, b.colore, `${matsuri}: strisce uguali`);
    assert.ok(contrasto(a.colore, b.colore) > 1.15 || a.colore.toLowerCase() !== b.colore.toLowerCase(), `${matsuri}: strisce troppo simili`);
  }
});

test('ogni Matsuri ha i suoi colori: nessun tema ripete il pavimento, il cielo o il cuscino di un altro', () => {
  for (const ruolo of ['cielo', 'pavimento', 'cuscino']) {
    const colori = MATSURI.map((m) => TEMI[m][ruolo].colore);
    assert.equal(new Set(colori).size, MATSURI.length, `${ruolo}: due Matsuri hanno lo stesso colore`);
  }
});

test('il giorno è chiaro e la sera è scura: il cielo di Tanabata e Hanabi è molto più scuro di quello di Hanami e Aki', () => {
  const chiarezza = (m) => luminanza(TEMI[m].cielo.colore);
  for (const giorno of ['hanami', 'aki']) {
    for (const sera of ['tanabata', 'hanabi']) assert.ok(chiarezza(giorno) > chiarezza(sera) * 3, `${giorno} contro ${sera}`);
  }
});

// ---------------------------------------------------------------------------------------------
// Leggibilità (GAME_SPEC.md; il criterio vero del ticket 32)

test('il nome di una Postazione si legge: testo e contorno almeno 4,5:1, e il testo anche sul pavimento, su ogni tema', () => {
  for (const matsuri of MATSURI) {
    assert.ok(contrasto(ETICHETTA.testo, ETICHETTA.contorno) >= 4.5, `${matsuri}: testo contro contorno`);
    // Il nome sta sul pavimento: il testo scuro deve leggersi anche senza il bordo chiaro.
    for (const tono of toni(TEMI[matsuri].pavimento)) {
      const c = contrasto(ETICHETTA.testo, tono);
      assert.ok(c >= 4.5, `${matsuri}: il testo sul pavimento ${tono} fa solo ${c.toFixed(2)}:1`);
    }
  }
});

test('il Bancone, le Postazioni e i Piatti si staccano dal pavimento: il loro contorno a matita almeno 3:1, su ogni tema', () => {
  // Gli oggetti hanno tutti il contorno color inchiostro (PALETTE.inchiostro): è quello che li stacca
  // dal pavimento, anche quando il loro colore è chiaro come il legno.
  for (const matsuri of MATSURI) {
    for (const tono of toni(TEMI[matsuri].pavimento)) {
      const c = contrasto(PALETTE.inchiostro, tono);
      assert.ok(c >= 3, `${matsuri}: il contorno contro il pavimento ${tono} fa solo ${c.toFixed(2)}:1`);
    }
  }
});

test('la tendina del Bancone non si confonde con il pavimento', () => {
  for (const matsuri of MATSURI) {
    for (const striscia of TEMI[matsuri].tendina) {
      const c = contrasto(striscia.colore, TEMI[matsuri].pavimento.colore);
      assert.ok(c >= 1.05, `${matsuri}: la striscia ${striscia.colore} è uguale al pavimento (${c.toFixed(2)}:1)`);
    }
  }
});

test('dietro i Posti lo sfondo non sta a metà strada: stacca il contorno scuro o la nuvoletta bianca, almeno 3:1', () => {
  // I Clienti e le nuvolette (che sono bianche, con il contorno a matita) hanno da stare in primo
  // piano: un fondo di mezzo tono non farebbe staccare né l'uno né l'altro.
  for (const matsuri of MATSURI) {
    const { terra, cielo } = TEMI[matsuri];
    const sfondi = [['terra', terra.colore], ['terra (ombra)', terra.ombra], ['terra (luce)', terra.luce], ['cielo', cielo.colore]];
    for (const [nome, tono] of sfondi) {
      const sceglie = Math.max(contrasto(tono, PALETTE.inchiostro), contrasto(tono, PALETTE.bianco));
      assert.ok(sceglie >= 3, `${matsuri}: ${nome} ${tono} non stacca né l'inchiostro né il bianco (${sceglie.toFixed(2)}:1)`);
    }
  }
});

test('le Postazioni, i Piatti e Maurizio non cambiano con il tema: il catalogo fisso non ha chiavi a tema', () => {
  for (const matsuri of MATSURI) {
    for (const key of Object.values(chiaviTema(matsuri))) assert.ok(!(key in DISEGNI), `${key} è nel catalogo fisso`);
  }
  for (const key of ['carta', 'ombra', 'maurizio', 'onigiri', 'onigiri-icona']) assert.ok(key in DISEGNI, key);
});

// ---------------------------------------------------------------------------------------------
// Disegni a tema

test('ogni Matsuri ha le sue otto texture, con una chiave per tema', () => {
  const tutte = new Set();
  for (const matsuri of MATSURI) {
    const disegni = disegniTema(matsuri);
    const chiavi = chiaviTema(matsuri);
    assert.deepEqual(Object.keys(disegni).sort(), Object.values(chiavi).sort());
    assert.equal(Object.keys(disegni).length, 8);
    for (const key of Object.keys(disegni)) {
      assert.ok(key.endsWith(`-${matsuri}`) || key.includes(`-${matsuri}-`), `${key} non porta il nome del Matsuri`);
      assert.ok(!tutte.has(key), `${key} compare due volte`);
      tutte.add(key);
    }
  }
  assert.throws(() => disegniTema('natale'), RangeError);
});

// Ogni disegno si fa una volta con Math.random che lancia un errore e senza gradienti. Una seconda
// volta, per vedere che esca uguale, si rifanno solo quelli dell'Hanami: ogni disegno è centinaia di
// migliaia di chiamate al finto canvas, e il seme (STILE.seme + chiave) è lo stesso codice per tutti.
test('i disegni a tema escono identici a ogni avvio, senza Math.random né gradienti, e diversi da un tema all’altro', (t) => {
  t.mock.method(Math, 'random', () => {
    throw new Error('Math.random negli sfondi');
  });
  const impronte = new Map();
  for (const matsuri of MATSURI) {
    for (const [key, entry] of Object.entries(disegniTema(matsuri))) {
      const prima = record(key, entry);
      assert.ok(prima.calls > 40, `${key} non disegna quasi niente`);
      for (const vietato of ['createLinearGradient', 'createRadialGradient', 'createConicGradient']) {
        assert.ok(!prima.metodi.has(vietato), `${key} usa ${vietato}: il finto canvas dei test non lo supporta`);
      }
      if (matsuri === 'hanami') {
        assert.equal(record(key, entry).digest, prima.digest, `${key} cambia da un avvio all'altro`);
      }
      const tipo = key.replace(`-${matsuri}`, '');
      if (!impronte.has(tipo)) impronte.set(tipo, new Set());
      impronte.get(tipo).add(prima.digest);
    }
  }
  for (const [tipo, digest] of impronte) assert.equal(digest.size, MATSURI.length, `${tipo}: due Matsuri disegnano lo stesso`);
});

test('le texture a tema hanno le misure di SFONDO', () => {
  const d = disegniTema('hanami');
  const k = chiaviTema('hanami');
  assert.deepEqual([d[k.cielo].w, d[k.cielo].h], [720, 560]);
  assert.deepEqual([d[k.terra].w, d[k.terra].h], [720, 480]);
  assert.deepEqual([d[k.alto].w, d[k.alto].h], [720, 260]);
  assert.deepEqual([d[k.latoSx].w, d[k.latoSx].h], [190, 920]);
  assert.deepEqual([d[k.latoDx].w, d[k.latoDx].h], [190, 920]);
});

// ---------------------------------------------------------------------------------------------
// Le cose da evitare (GAME_SPEC.md; ricerca, sezione 8)

const tonalita = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d) h = max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { hue: h * 60, sat: max ? d / max : 0 };
};

test('nessun fuoco d’artificio è rosso (la bandiera del Sol Levante): solo pastelli rosa, giallo, azzurro e verde', () => {
  assert.ok(Object.keys(FUOCO).length >= 4);
  for (const [nome, colore] of Object.entries(FUOCO)) {
    const { hue, sat } = tonalita(colore);
    const rosso = (hue >= 350 || hue <= 12) && sat > 0.45;
    assert.ok(!rosso, `il fuoco ${nome} (${colore}) è un rosso saturo`);
  }
});

test('un fuoco è fatto di gocce corte e di un centro vuoto: nessuna linea lunga come un raggio, niente disco', () => {
  const R = 100;
  const { ctx, log } = recordingContext({ tieni: true });
  fuoco(ctx, createRng('prova'), { x: 300, y: 300, r: R, a: FUOCO.rosa, b: FUOCO.giallo });
  // Ogni scintilla è un tratto (moveTo + curva) che va dalla testa verso il centro, ma resta corto:
  // un raggio vero andrebbe dal bordo al centro della sfera.
  let partenza = null;
  let tratti = 0;
  for (const [metodo, ...args] of log) {
    if (metodo === 'moveTo') partenza = { x: args[0], y: args[1] };
    if (metodo === 'quadraticCurveTo' && partenza) {
      tratti += 1;
      assert.ok(Math.hypot(args[2] - partenza.x, args[3] - partenza.y) < R * 0.4, 'una scintilla è lunga come un raggio');
    }
    assert.notEqual(metodo, 'lineTo', 'un fuoco non ha linee rette');
  }
  assert.ok(tratti >= 30, 'le scintille sono tante');
  // Il centro è vuoto: nessuna testa di scintilla (un arco pieno) cade entro il 25% del raggio dal centro.
  for (const [metodo, x, y, raggio] of log) {
    if (metodo === 'arc' && raggio < 6) assert.ok(Math.hypot(x - 300, y - 300) > R * 0.25, 'qualcosa nel centro del fuoco');
  }
});

test('il bambù lascia quattro cordicelle libere per i tanzaku dell’Evento, nella parte che si vede su ogni schermo', () => {
  assert.equal(TANZAKU_LIBERI.length, 4);
  // La texture del lato è alta 920 e poggia sul Bancone: sui 1280 se ne vede dal punto 407 in giù.
  for (const p of TANZAKU_LIBERI) assert.ok(p.y > 450 && p.y < 880 && p.x > 0 && p.x < 190, JSON.stringify(p));
});
