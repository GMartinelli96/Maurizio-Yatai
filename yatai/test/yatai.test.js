import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAURIZIO, PIATTI } from '../src/config.js';
import { DISEGNI } from '../src/disegni/catalogo.js';
import { MAURIZIO_SIZE, POSE, maurizioKey } from '../src/disegni/maurizio.js';
import { POSTAZIONE_SIZE, POSTAZIONI, postazioneKey } from '../src/disegni/postazioni.js';
import { TESTI } from '../src/i18n.js';

test('i Piatti sono nell’ordine in cui si sbloccano (GAME_SPEC.md)', () => {
  assert.deepEqual(Object.keys(PIATTI), ['onigiri', 'takoyaki', 'kakigori', 'taiyaki', 'ramen']);
});

test('ogni Piatto ha la sua Postazione disegnata, nella stessa misura, nel catalogo', () => {
  assert.deepEqual(Object.keys(POSTAZIONI), Object.keys(PIATTI));
  for (const piatto of Object.keys(PIATTI)) {
    const entry = DISEGNI[postazioneKey(piatto)];
    assert.ok(entry, `manca la Postazione ${piatto}`);
    assert.deepEqual([entry.w, entry.h], [POSTAZIONE_SIZE.w, POSTAZIONE_SIZE.h]);
  }
});

test('ogni Piatto ha il nome in italiano, inglese e giapponese', () => {
  for (const piatto of Object.keys(PIATTI)) {
    for (const [lingua, testi] of Object.entries(TESTI)) {
      assert.ok(testi[`piatto_${piatto}`]?.trim(), `${lingua}: manca il nome di ${piatto}`);
    }
  }
});

test('Maurizio ha almeno due pose, tutte nel catalogo e nella stessa misura', () => {
  assert.ok(Object.keys(POSE).length >= 2);
  assert.equal(maurizioKey('riposo'), 'maurizio', 'la posa a riposo resta la texture approvata al passo 1');
  for (const posa of Object.keys(POSE)) {
    const entry = DISEGNI[maurizioKey(posa)];
    assert.ok(entry, `manca la posa ${posa}`);
    assert.deepEqual([entry.w, entry.h], [MAURIZIO_SIZE.w, MAURIZIO_SIZE.h]);
  }
});

test('ogni azione di Maurizio usa una posa che esiste e finisce prima di tornare a riposo', () => {
  assert.ok(Object.keys(MAURIZIO.azioni).length >= 1);
  for (const [nome, azione] of Object.entries(MAURIZIO.azioni)) {
    assert.ok(azione.posa in POSE, `${nome}: posa ${azione.posa} sconosciuta`);
    assert.notEqual(azione.posa, 'riposo', `${nome}: la posa dell’azione deve vedersi`);
    assert.ok(azione.salto > 0 && azione.schiaccia > 0 && azione.durata > 0);
    assert.ok(azione.tienePosa >= azione.durata * 2, `${nome}: torna a riposo prima di aver finito il salto`);
    assert.ok(azione.tienePosa < 1000, `${nome}: la posa dura troppo, Maurizio sembra bloccato`);
  }
});

test('le azioni che la scena dello Yatai richiama esistono tutte', async () => {
  const sorgente = await import('node:fs').then((fs) => fs.readFileSync(new URL('../src/scenes/YataiScene.js', import.meta.url), 'utf8'));
  const mappa = sorgente.match(/AZIONE_DEL_TOCCO = \{([^}]*)\}/)[1];
  for (const [, azione] of mappa.matchAll(/:\s*'(\w+)'/g)) assert.ok(azione in MAURIZIO.azioni, `azione ${azione} non definita in config.js`);
});
