import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CLIENTI, MAURIZIO, PIATTI, YATAI } from '../src/config.js';
import { DISEGNI } from '../src/disegni/catalogo.js';
import { POSTAZIONE_SIZE, SCORTE, scortaKey } from '../src/disegni/postazioni.js';
import { CLIENTI as TIPI_DISEGNATI, ESPRESSIONI, clienteKey } from '../src/disegni/clienti.js';
import { TESTI } from '../src/i18n.js';
import { BANCONE } from '../src/config.js';

const leggi = (file) => readFileSync(new URL(file, import.meta.url), 'utf8');

test('ogni evento della Serata ha un riscontro nella scena, o è ignorato di proposito', () => {
  const logica = leggi('../src/serata/Serata.js');
  const scena = leggi('../src/scenes/SerataScene.js');
  const emessi = new Set([...logica.matchAll(/tipo: '(\w+)'/g)].map((m) => m[1]));
  const gestiti = new Set([...scena.matchAll(/case '(\w+)':/g)].map((m) => m[1]));
  // Questi non servono a un riscontro: il tocco su una Postazione che non c'è o su un Posto vuoto
  // non deve far succedere niente, e la scena non può nemmeno generarli dai suoi tocchi.
  const ignorati = new Set(['postazioneSconosciuta', 'postoVuoto']);
  assert.ok(emessi.size >= 12, `ho trovato solo ${emessi.size} eventi nella logica`);
  for (const tipo of emessi) {
    assert.ok(gestiti.has(tipo) || ignorati.has(tipo), `l'evento "${tipo}" non ha nessun riscontro in SerataScene`);
  }
  for (const tipo of gestiti) assert.ok(emessi.has(tipo), `SerataScene gestisce "${tipo}" che la logica non emette più`);
});

test('i Clienti della logica hanno tutti i disegni, nelle quattro espressioni', () => {
  assert.deepEqual([...CLIENTI.passaggio].sort(), [...TIPI_DISEGNATI].sort(), 'i tipi della logica e quelli disegnati discordano');
  for (const tipo of CLIENTI.passaggio) {
    for (const espressione of ESPRESSIONI) assert.ok(DISEGNI[clienteKey(tipo, espressione)], `manca ${clienteKey(tipo, espressione)}`);
  }
});

test('i disegni della Serata sono nel catalogo: nuvoletta, cuoricini, Yen, stelle e le icone dei Piatti in gioco', () => {
  for (const key of ['nuvoletta', 'cuore', 'cuore-vuoto', 'moneta', 'stella', 'stella-vuota', 'onigiri', 'onigiri-icona', 'ombra']) {
    assert.ok(DISEGNI[key], `manca la texture ${key}`);
  }
});

test('ogni Ingrediente di una ricetta ha la sua Scorta disegnata, nella misura delle Postazioni, e il suo nome nelle tre lingue', () => {
  // I passi di cottura non hanno una Scorta: contano gli Ingredienti, e tutte le varianti di un passo `unoDi`.
  const ingredienti = Object.values(PIATTI).flatMap((piatto) => (piatto.ricetta ?? []).flatMap((passo) => passo.unoDi ?? [passo]).map((voce) => voce.ingrediente).filter(Boolean));
  assert.equal(ingredienti.length, 16, 'riso, alga, pastella, polpo, salsa, ghiaccio, tre sciroppi, impasto, due ripieni, noodles, brodo, uovo, naruto');
  assert.deepEqual(Object.keys(SCORTE).sort(), [...new Set(ingredienti)].sort(), 'le Scorte disegnate e gli Ingredienti delle ricette discordano');
  for (const ingrediente of ingredienti) {
    const entry = DISEGNI[scortaKey(ingrediente)];
    assert.ok(entry, `manca la Scorta ${ingrediente}`);
    assert.deepEqual([entry.w, entry.h], [POSTAZIONE_SIZE.w, POSTAZIONE_SIZE.h]);
    for (const lingua of Object.keys(TESTI)) assert.ok(TESTI[lingua][`ingrediente_${ingrediente}`]?.trim(), `${lingua}: manca il nome di ${ingrediente}`);
  }
});

test('il Bancone ha un numero solo di posti: quello della logica è quello che si disegna', () => {
  assert.equal(BANCONE.capienza, YATAI.bancone.capacita);
});

test('le azioni di Maurizio che la scena della Serata richiama esistono tutte', () => {
  const scena = leggi('../src/scenes/SerataScene.js');
  const usate = [...scena.matchAll(/maurizio\.azione\('(\w+)'\)/g)].map((m) => m[1]);
  assert.ok(usate.length >= 3, 'la scena dovrebbe animare Maurizio almeno per cuocere, raccogliere e servire');
  for (const azione of usate) assert.ok(azione in MAURIZIO.azioni, `azione ${azione} non definita in config.js`);
});

test('i testi della Serata esistono in italiano, inglese e giapponese, e nessuna lingua ha chiavi in più o in meno', () => {
  const chiavi = ['play', 'endTitle', 'endIncasso', 'endObiettivo', 'endRigioca', 'endServiti', 'endPersi', 'endVoto0', 'endVoto1', 'endVoto2', 'endVoto3'];
  for (const lingua of Object.keys(TESTI)) {
    for (const chiave of chiavi) assert.ok(TESTI[lingua][chiave]?.trim(), `${lingua}.${chiave} manca`);
  }
  const it = Object.keys(TESTI.it).sort();
  for (const lingua of ['en', 'ja']) assert.deepEqual(Object.keys(TESTI[lingua]).sort(), it, `${lingua} ha chiavi diverse dall'italiano`);
});

test('ogni testo che la scena e il titolo chiedono con t() esiste in italiano', () => {
  const sorgenti = ['../src/scenes/SerataScene.js', '../src/scenes/TitleScene.js'].map(leggi).join('\n');
  const semplici = [...sorgenti.matchAll(/\bt\('(\w+)'\)/g)].map((m) => m[1]);
  assert.ok(semplici.length >= 8);
  for (const chiave of semplici) assert.ok(TESTI.it[chiave], `t('${chiave}') non ha il testo`);
});

test('la scena non scrive numeri di bilanciamento a mano: durate, soglie e prezzi vengono da config.js', () => {
  const scena = leggi('../src/scenes/SerataScene.js');
  // Niente 120 secondi, niente 1200 Yen né 25 secondi di Pazienza scritti nel codice della scena.
  for (const numero of ['120000', '1200', '25000', '1560', '1920']) assert.ok(!new RegExp(`\\b${numero}\\b`).test(scena), `${numero} nella scena`);
});
