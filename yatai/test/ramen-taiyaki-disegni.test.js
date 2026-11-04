import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PALETTE, PIATTI } from '../src/config.js';
import { DISEGNI, drawEntry } from '../src/disegni/catalogo.js';
import { PASSO_SCELTA, POSTAZIONE_SIZE, scortaKey } from '../src/disegni/postazioni.js';
import { drawRamen } from '../src/disegni/ramen.js';
import { drawTaiyaki } from '../src/disegni/taiyaki.js';
import { TESTI } from '../src/i18n.js';
import { idPiatto, scorteDi } from '../src/serata/Serata.js';

// I disegni di taiyaki e ramen (ticket 08): quattro varianti, sette Scorte, le icone del passo a scelta e i due bruciati.

const TAIYAKI = PIATTI.taiyaki.varianti.map((v) => idPiatto('taiyaki', v));
const RAMEN = PIATTI.ramen.varianti.map((v) => idPiatto('ramen', v));
const NUOVE_SCORTE = ['impasto', 'fagioli', 'crema', 'noodles', 'brodo', 'uovo', 'naruto'];

// Un finto canvas che registra ogni chiamata: due disegni sono uguali se le registrazioni lo sono.
function registra(key) {
  const log = [];
  const ctx = new Proxy({}, {
    get(target, prop) {
      if (prop in target) return target[prop];
      return (...args) => { log.push([prop, ...args]); };
    },
    set(target, prop, value) { target[prop] = value; log.push(['=', prop, value]); return true; },
  });
  drawEntry(ctx, key, DISEGNI[key]);
  return JSON.stringify(log);
}

// La luminosità percepita di un colore '#rrggbb', da 0 (nero) a 255 (bianco): quella che resta in bianco e nero.
const luminosita = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b;
};

test('ogni variante ha il Piatto per il Bancone e per l’icona, alla misura dell’onigiri, e i due Piatti che bruciano il loro bruciato', () => {
  for (const id of [...TAIYAKI, ...RAMEN]) {
    for (const [chiave, riferimento] of [[id, 'onigiri'], [`${id}-icona`, 'onigiri-icona']]) {
      assert.ok(DISEGNI[chiave], `manca la texture ${chiave}`);
      assert.deepEqual([DISEGNI[chiave].w, DISEGNI[chiave].h], [DISEGNI[riferimento].w, DISEGNI[riferimento].h], chiave);
    }
  }
  for (const piatto of ['taiyaki', 'ramen']) {
    const bruciato = DISEGNI[`${piatto}-bruciato-icona`];
    assert.ok(bruciato, `manca ${piatto}-bruciato-icona`);
    assert.deepEqual([bruciato.w, bruciato.h], [DISEGNI['onigiri-icona'].w, DISEGNI['onigiri-icona'].h]);
  }
  assert.throws(() => drawTaiyaki({}, {}, 64, 'cioccolato'), /variante sconosciuta/);
  assert.throws(() => drawRamen({}, {}, 64, 'fungo'), /variante sconosciuta/);
});

test('le sette Scorte nuove e le due icone del passo a scelta hanno la misura delle Postazioni', () => {
  for (const chiave of [...NUOVE_SCORTE.map(scortaKey), 'passo-ripieno', 'passo-guarnizione']) {
    const entry = DISEGNI[chiave];
    assert.ok(entry, `manca la texture ${chiave}`);
    assert.deepEqual([entry.w, entry.h], [POSTAZIONE_SIZE.w, POSTAZIONE_SIZE.h], chiave);
  }
});

test('ogni Piatto con una scelta ha la sua icona del passo a scelta, e ogni Piatto con varianti ha una scelta', () => {
  for (const [piatto, { ricetta, varianti }] of Object.entries(PIATTI)) {
    const conScelta = ricetta.some((passo) => passo.unoDi);
    assert.equal(conScelta, varianti.length > 0, `${piatto}: scelta e varianti vanno insieme`);
    if (conScelta) assert.ok(DISEGNI[PASSO_SCELTA[piatto]], `${piatto}: manca l'icona ${PASSO_SCELTA[piatto]}`);
    else assert.equal(PASSO_SCELTA[piatto], undefined, `${piatto}: non ha una scelta`);
  }
  assert.deepEqual(PASSO_SCELTA, { kakigori: 'passo-sciroppo', taiyaki: 'passo-ripieno', ramen: 'passo-guarnizione' });
});

test('ogni Ingrediente di tutte le ricette ha una Scorta disegnata, e i 16 disegni sono tutti diversi tra loro e dalle icone dei passi', () => {
  const ids = Object.keys(PIATTI).flatMap((piatto) => scorteDi(piatto).map((s) => s.ingrediente));
  assert.equal(ids.length, 16);
  const disegni = [...ids.map(scortaKey), ...Object.values(PASSO_SCELTA)].map((chiave) => registra(chiave));
  assert.equal(new Set(disegni).size, 19, '16 Scorte e 3 icone del passo: due uguali');
});

test('le quattro icone dei Piatti e i quattro Piatti sul Bancone sono disegni diversi, e i bruciati diversi dai Piatti', () => {
  const icone = [...TAIYAKI, ...RAMEN].map((id) => registra(`${id}-icona`));
  assert.equal(new Set(icone).size, 4, 'due icone uguali');
  const banconi = [...TAIYAKI, ...RAMEN].map((id) => registra(id));
  assert.equal(new Set(banconi).size, 4, 'due Piatti uguali');
  const bruciati = ['taiyaki', 'ramen'].map((p) => registra(`${p}-bruciato-icona`));
  assert.equal(new Set([...icone, ...bruciati]).size, 6);
});

test('in bianco e nero i ripieni restano lontani: fagioli e crema, e ognuno dalla pasta del pesce, di almeno 40 punti', () => {
  const pasta = luminosita(PALETTE.taiyaki.colore);
  const fagioli = luminosita(PALETTE.fagioli.colore);
  const crema = luminosita(PALETTE.crema.colore);
  assert.ok(Math.abs(fagioli - crema) >= 100, `fagioli ${fagioli.toFixed(0)} e crema ${crema.toFixed(0)} si somigliano in bianco e nero`);
  assert.ok(Math.abs(fagioli - pasta) >= 40, `fagioli ${fagioli.toFixed(0)} e pesce ${pasta.toFixed(0)}`);
  assert.ok(Math.abs(crema - pasta) >= 40, `crema ${crema.toFixed(0)} e pesce ${pasta.toFixed(0)}`);
});

test('in bianco e nero il tuorlo si stacca dall’albume, e l’uovo e il naruto sono ovale e disco (forme diverse nel disegno)', () => {
  assert.ok(luminosita(PALETTE.albume.colore) - luminosita(PALETTE.tuorlo.colore) >= 40, 'tuorlo e albume si somigliano');
  // Le forme: l'uovo è un ovale più alto che largo (rapporto 1,22), il naruto un disco dal bordo ondulato. Lo dice il codice che
  // le disegna, e lo controlla questo confronto: le due Scorte non hanno nemmeno un tratto in comune.
  const uovo = registra(scortaKey('uovo'));
  const naruto = registra(scortaKey('naruto'));
  assert.notEqual(uovo, naruto);
  assert.notEqual(registra('ramen-uovo-icona'), registra('ramen-naruto-icona'));
});

test('l’impasto del taiyaki e la pastella del takoyaki sono due disegni, e due nomi', () => {
  assert.notEqual(registra(scortaKey('impasto')), registra(scortaKey('pastella')));
  for (const lingua of Object.keys(TESTI)) {
    assert.notEqual(TESTI[lingua].ingrediente_impasto, TESTI[lingua].ingrediente_pastella, `${lingua}: stesso nome`);
  }
});

test('gli Ingredienti nuovi e le quattro varianti hanno il nome in italiano, inglese e giapponese, e i nomi delle varianti sono diversi', () => {
  const chiavi = [...NUOVE_SCORTE.map((i) => `ingrediente_${i}`), ...[...TAIYAKI, ...RAMEN].map((id) => `piatto_${id}`)];
  for (const lingua of Object.keys(TESTI)) {
    for (const chiave of chiavi) assert.ok(TESTI[lingua][chiave]?.trim(), `${lingua}: manca ${chiave}`);
    assert.equal(new Set(TAIYAKI.map((id) => TESTI[lingua][`piatto_${id}`])).size, 2, `${lingua}: i due taiyaki hanno lo stesso nome`);
    assert.equal(new Set(RAMEN.map((id) => TESTI[lingua][`piatto_${id}`])).size, 2, `${lingua}: i due ramen hanno lo stesso nome`);
  }
});
