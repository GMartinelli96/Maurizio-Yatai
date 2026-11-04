import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PALETTE, RISCONTRI, SERIE } from '../src/config.js';
import { DISEGNI } from '../src/disegni/catalogo.js';
import { corpoSerie, moneteDelPagamento, progressoSerie, scalaSomma, serieAlTetto, serieVisibile, testoSerie } from '../src/serata/riscontriSerie.js';
import { moltiplicatoreSerie } from '../src/serata/Serata.js';

const leggi = (file) => readFileSync(new URL(file, import.meta.url), 'utf8');

// La Serie in cui la Mancia arriva al suo tetto (×1,5 con +10% per Cliente oltre il primo: 6 di fila).
const SERIE_AL_TETTO = Math.round((SERIE.moltiplicatoreMax - 1) / SERIE.manciaPerCliente) + 1;

test('il numero compare dalla Serie 2: il primo Ordine di fila non ha bonus da festeggiare', () => {
  assert.equal(RISCONTRI.serie.daSerie, 2);
  assert.equal(serieVisibile(0), false);
  assert.equal(serieVisibile(1), false);
  assert.equal(serieVisibile(2), true);
  assert.equal(serieVisibile(9), true);
  assert.equal(testoSerie(2), '×2');
  assert.equal(testoSerie(12), '×12');
});

test('il progresso della Serie va da 0 al tetto della Mancia e lì si ferma', () => {
  assert.equal(progressoSerie(0), 0);
  assert.equal(progressoSerie(1), 0);
  let prima = 0;
  for (let serie = 2; serie < SERIE_AL_TETTO; serie++) {
    const adesso = progressoSerie(serie);
    assert.ok(adesso > prima && adesso < 1, `Serie ${serie}: ${adesso} dopo ${prima}`);
    prima = adesso;
  }
  assert.equal(moltiplicatoreSerie(SERIE_AL_TETTO), SERIE.moltiplicatoreMax, 'SERIE_AL_TETTO non è il tetto vero');
  for (const serie of [SERIE_AL_TETTO, SERIE_AL_TETTO + 1, 30]) assert.equal(progressoSerie(serie), 1);
  assert.equal(serieAlTetto(SERIE_AL_TETTO - 1), false);
  assert.equal(serieAlTetto(SERIE_AL_TETTO), true);
  assert.equal(serieAlTetto(30), true);
});

test('il numero cresce con la Serie fino al tetto, poi non cresce più', () => {
  const { base, alTetto } = RISCONTRI.serie.corpo;
  assert.ok(alTetto > base);
  let prima = 0;
  for (let serie = 2; serie <= SERIE_AL_TETTO; serie++) {
    const corpo = corpoSerie(serie);
    assert.ok(corpo > prima, `Serie ${serie}: ${corpo} non è più grande di ${prima}`);
    assert.ok(corpo >= base && corpo <= alTetto);
    prima = corpo;
  }
  assert.equal(corpoSerie(SERIE_AL_TETTO), alTetto);
  assert.equal(corpoSerie(40), alTetto);
});

test('le monete sono più generose con la Serie alta, e senza Serie volano come prima', () => {
  const { scaglione, max } = RISCONTRI.monete;
  for (const yen of [30, 75, 150, 210, 340, 900]) {
    const comePrima = Math.max(1, Math.min(max, Math.round(yen / scaglione)));
    assert.equal(moneteDelPagamento(yen, 0), comePrima, `${yen} Yen senza Serie`);
    assert.equal(moneteDelPagamento(yen, 1), comePrima, `${yen} Yen, primo di fila`);
    assert.ok(moneteDelPagamento(yen, SERIE_AL_TETTO) > moneteDelPagamento(yen, 0) || yen < scaglione, `${yen} Yen al tetto`);
    assert.equal(moneteDelPagamento(yen, SERIE_AL_TETTO), Math.min(yen, comePrima + RISCONTRI.serie.moneteExtra));
    let prima = 0;
    for (let serie = 0; serie <= SERIE_AL_TETTO + 2; serie++) {
      const monete = moneteDelPagamento(yen, serie);
      assert.ok(monete >= prima, `${yen} Yen: la Serie ${serie} non deve dare meno monete della precedente`);
      prima = monete;
    }
  }
  // Mai più monete degli Yen che portano.
  assert.equal(moneteDelPagamento(2, SERIE_AL_TETTO), 2);
  assert.equal(moneteDelPagamento(1, SERIE_AL_TETTO), 1);
});

test('la scritta "+150" cresce con la Serie fino a sommaAlTetto', () => {
  assert.equal(scalaSomma(0), 1);
  assert.equal(scalaSomma(1), 1);
  assert.ok(scalaSomma(3) > 1 && scalaSomma(3) < RISCONTRI.serie.sommaAlTetto);
  assert.equal(scalaSomma(SERIE_AL_TETTO), RISCONTRI.serie.sommaAlTetto);
  assert.equal(scalaSomma(40), RISCONTRI.serie.sommaAlTetto);
});

test('i numeri della Serie in config.js sono coerenti: colori, pop, "pof"', () => {
  const s = RISCONTRI.serie;
  assert.match(s.colore, /^#[0-9a-f]{6}$/i);
  assert.equal(PALETTE.arcobaleno.length, 5, 'le bande dell\'arcobaleno sono cinque');
  assert.ok(s.arcobaleno.da >= 0 && s.arcobaleno.a <= 1 && s.arcobaleno.da < s.arcobaleno.a, 'le bande stanno dentro il testo');
  assert.ok(s.pop.scala > 1 && s.pop.scalaTetto > s.pop.scala, 'il pop del tetto è il più grande');
  assert.ok(s.entra.da > 0 && s.entra.da < 1);
  assert.ok(s.pof.scalaA > s.pof.scalaDa && s.pof.dimensione > 0);
  assert.ok(s.posizione.x > 0.5 && s.posizione.x < 1, 'il numero sta a destra di Maurizio');
  assert.ok(s.posizione.y > 0 && s.posizione.y < 1);
  assert.ok(s.moneteExtra >= 1 && s.sommaAlTetto > 1);
});

test('il "pof" è nel catalogo e nel manifesto dei disegni', () => {
  assert.ok(DISEGNI.pof, 'manca la texture pof');
  const manifesto = JSON.parse(leggi('../../docs/stile/asset-manifest.json'));
  const voce = manifesto.assets.find((a) => a.id === 'pof');
  assert.ok(voce, 'pof non è in docs/stile/asset-manifest.json');
  assert.equal(voce.technical.dimensions, `${DISEGNI.pof.w}x${DISEGNI.pof.h}`);
});

test('la scena aggancia i riscontri della Serie: sale su servito, si spezza su serieSpezzata, un solo punto per i movimenti', () => {
  const scena = leggi('../src/scenes/SerataScene.js');
  assert.match(scena, /case 'serieSpezzata':\s*\/\/[^\n]*\n(\s*\/\/[^\n]*\n)*\s*this\.perSerieSpezzata\(\)/, 'serieSpezzata deve chiamare perSerieSpezzata()');
  assert.match(scena, /this\.perSerieSale\(evento\)/);
  // Il numero e il "pof" si muovono solo con animaSerie(): è l'unico punto da spegnere con "riduci movimento" (ticket 26).
  assert.ok(!/targets:\s*this\.(serieNumero|pof)\b/.test(scena), 'un tween del numero o del pof non passa da animaSerie()');
  assert.equal([...scena.matchAll(/this\.animaSerie\(/g)].length, 4, 'entrata, pop, numero che svanisce e nuvoletta');
});

test('i riscontri della Serie non hanno testi da tradurre: il numero è "×N"', () => {
  const scena = leggi('../src/scenes/SerataScene.js');
  const blocco = scena.slice(scena.indexOf('// --- I riscontri della Serie'), scena.indexOf('// La cima di ogni Postazione'));
  assert.ok(blocco.length > 500, 'non trovo il blocco dei riscontri della Serie');
  assert.ok(!/\bt\('/.test(blocco), 'i riscontri della Serie non usano testi');
});
