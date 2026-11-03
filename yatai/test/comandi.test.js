import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COMANDI, POSTI, RISCONTRI, YATAI } from '../src/config.js';
import { azioneDaTasto, tastoDelPosto, tastoDellaPostazione } from '../src/serata/comandi.js';

test('i tasti 1–5 sono le Postazioni e Q/W/E/R i Posti (GAME_SPEC.md)', () => {
  assert.deepEqual(azioneDaTasto('Digit1'), { tipo: 'postazione', indice: 0 });
  assert.deepEqual(azioneDaTasto('Digit5'), { tipo: 'postazione', indice: 4 });
  assert.deepEqual(azioneDaTasto('KeyQ'), { tipo: 'posto', indice: 0 });
  assert.deepEqual(azioneDaTasto('KeyW'), { tipo: 'posto', indice: 1 });
  assert.deepEqual(azioneDaTasto('KeyE'), { tipo: 'posto', indice: 2 });
  assert.deepEqual(azioneDaTasto('KeyR'), { tipo: 'posto', indice: 3 });
});

test('il tastierino numerico fa le stesse Postazioni, Invio e Spazio rigiocano', () => {
  assert.deepEqual(azioneDaTasto('Numpad2'), { tipo: 'postazione', indice: 1 });
  assert.deepEqual(azioneDaTasto('Enter'), { tipo: 'rigioca' });
  assert.deepEqual(azioneDaTasto('Space'), { tipo: 'rigioca' });
});

test('un tasto qualunque non fa niente', () => {
  for (const code of ['KeyA', 'KeyM', 'Digit0', 'Escape', '', undefined]) assert.equal(azioneDaTasto(code), null, String(code));
});

test('nessun tasto comanda due azioni diverse', () => {
  const tutti = [...COMANDI.postazioni, ...COMANDI.postazioniTastierino, ...COMANDI.posti, ...COMANDI.rigioca];
  assert.equal(new Set(tutti).size, tutti.length);
});

test('ci sono tasti per tutti i Posti e per tutte le Postazioni che lo Yatai può avere', () => {
  assert.ok(COMANDI.posti.length >= YATAI.posti.massimo);
  assert.ok(COMANDI.postazioni.length >= YATAI.postazioni.massimo);
  assert.equal(tastoDelPosto(0), 'KeyQ');
  assert.equal(tastoDellaPostazione(0), 'Digit1');
  assert.equal(tastoDelPosto(9), null);
});

test("l'uscita di un Cliente finisce prima che il Posto torni libero, così si vede e non si sovrappone al prossimo", () => {
  const ricambioMs = POSTI.ricambioSec * 1000;
  for (const [nome, durata] of Object.entries(RISCONTRI.uscita)) {
    if (nome === 'spostamento') continue;
    assert.ok(durata < ricambioMs, `l'uscita "${nome}" dura ${durata} ms, il Posto si libera dopo ${ricambioMs}`);
  }
});

test('le monete arrivano all’Incasso prima che compaia la schermata di fine Serata', () => {
  const { monete, fine } = RISCONTRI;
  const ultima = monete.durata + (monete.max - 1) * monete.ritardo;
  assert.ok(ultima < fine.ritardo, `l'ultima moneta arriva a ${ultima} ms, la fine Serata compare a ${fine.ritardo}`);
});
