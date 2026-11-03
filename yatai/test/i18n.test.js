import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TESTI, detectLanguage, setLanguage, t } from '../src/i18n.js';

test('sceglie la prima lingua del dispositivo che il gioco conosce', () => {
  assert.equal(detectLanguage(['ja-JP', 'en-US']), 'ja');
  assert.equal(detectLanguage(['fr-FR', 'it-IT']), 'it');
  assert.equal(detectLanguage(['EN-gb']), 'en');
});

test("se non conosce nessuna lingua del dispositivo usa l'inglese", () => {
  assert.equal(detectLanguage(['fr-FR', 'de']), 'en');
  assert.equal(detectLanguage([]), 'en');
});

test('ogni testo esiste, non vuoto, in tutte e tre le lingue', () => {
  const keys = Object.keys(TESTI.it).sort();
  for (const [code, testi] of Object.entries(TESTI)) {
    assert.deepEqual(Object.keys(testi).sort(), keys, `chiavi diverse in ${code}`);
    for (const key of keys) assert.ok(testi[key].trim(), `${code}.${key} è vuoto`);
  }
});

test('t() restituisce il testo nella lingua scelta', () => {
  setLanguage('ja', { save: false });
  assert.equal(t('subtitle'), TESTI.ja.subtitle);
  setLanguage('it', { save: false });
  assert.equal(t('subtitle'), TESTI.it.subtitle);
  assert.equal(t('chiave-che-non-esiste'), 'chiave-che-non-esiste');
});
