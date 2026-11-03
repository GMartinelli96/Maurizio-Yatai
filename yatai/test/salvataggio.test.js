import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHIAVE_SALVATAGGIO, Salvataggio, VERSIONE_SALVATAGGIO } from '../src/salvataggio.js';

// Uno storage finto, come localStorage ma in memoria.
function storageFinto(iniziale = {}) {
  const dati = new Map(Object.entries(iniziale));
  return {
    dati,
    getItem: (k) => (dati.has(k) ? dati.get(k) : null),
    setItem: (k, v) => dati.set(k, String(v)),
  };
}

const bloccato = () => ({
  getItem() { throw new Error('SecurityError'); },
  setItem() { throw new Error('SecurityError'); },
});

test('senza niente di salvato si parte da zero Yen', () => {
  const s = new Salvataggio(storageFinto());
  assert.equal(s.yen, 0);
});

test('gli Yen della Serata restano: un salvataggio nuovo sullo stesso storage li ritrova', () => {
  const storage = storageFinto();
  const prima = new Salvataggio(storage);
  assert.equal(prima.accreditaIncasso(2100), 2100);
  assert.equal(prima.accreditaIncasso(900), 900);
  assert.equal(prima.yen, 3000);
  assert.equal(prima.salvato, true);

  // Come ricaricare la pagina: un oggetto nuovo, lo stesso storage.
  assert.equal(new Salvataggio(storage).yen, 3000);
});

test('il salvataggio ha un numero di versione', () => {
  const storage = storageFinto();
  new Salvataggio(storage).accreditaIncasso(100);
  const scritto = JSON.parse(storage.getItem(CHIAVE_SALVATAGGIO));
  assert.equal(scritto.versione, VERSIONE_SALVATAGGIO);
  assert.equal(scritto.yen, 100);
});

test('una Serata in rosso non dà Yen e non toglie quelli in tasca', () => {
  const storage = storageFinto();
  const s = new Salvataggio(storage);
  s.accreditaIncasso(500);
  assert.equal(s.accreditaIncasso(-340), 0);
  assert.equal(s.accreditaIncasso(0), 0);
  assert.equal(s.yen, 500);
  assert.equal(new Salvataggio(storage).yen, 500);
});

test('se lo storage è bloccato il gioco funziona lo stesso, senza salvare', () => {
  const s = new Salvataggio(bloccato());
  assert.equal(s.yen, 0);
  assert.equal(s.accreditaIncasso(700), 700);
  assert.equal(s.yen, 700, 'gli Yen vivono in memoria per la sessione');
  assert.equal(s.salvato, false);
});

test('senza nessuno storage (nessun browser) funziona lo stesso', () => {
  const s = new Salvataggio(null);
  s.accreditaIncasso(50);
  assert.equal(s.yen, 50);
  assert.equal(s.salvato, false);
});

test('uno storage pieno che rifiuta la scrittura non rompe la Serata', () => {
  const storage = storageFinto();
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  const s = new Salvataggio(storage);
  assert.equal(s.accreditaIncasso(300), 300);
  assert.equal(s.yen, 300);
  assert.equal(s.salvato, false);
});

test('un salvataggio illeggibile o senza senso riparte da zero', () => {
  for (const grezzo of ['{non json', 'null', '"ciao"', '[]', '{"yen": 50}', '{"versione": 0, "yen": 50}', '{"versione": "1", "yen": 50}']) {
    const s = new Salvataggio(storageFinto({ [CHIAVE_SALVATAGGIO]: grezzo }));
    assert.equal(s.yen, 0, `salvataggio ${grezzo}`);
  }
});

test('gli Yen salvati che non sono un numero intero sensato valgono zero', () => {
  for (const yen of ['"molti"', '-40', '12.5', 'null', '1e400']) {
    const s = new Salvataggio(storageFinto({ [CHIAVE_SALVATAGGIO]: `{"versione": 1, "yen": ${yen}}` }));
    assert.equal(s.yen, 0, `yen ${yen}`);
  }
});

test('un salvataggio di una versione più nuova non si legge e non si sovrascrive', () => {
  const futuro = JSON.stringify({ versione: VERSIONE_SALVATAGGIO + 1, yen: 9000, mappa: ['hanami'] });
  const storage = storageFinto({ [CHIAVE_SALVATAGGIO]: futuro });
  const s = new Salvataggio(storage);
  assert.equal(s.yen, 0);
  s.accreditaIncasso(400);
  assert.equal(s.yen, 400, 'la sessione gioca lo stesso');
  assert.equal(s.salvato, false);
  assert.equal(storage.getItem(CHIAVE_SALVATAGGIO), futuro, 'il file del gioco più nuovo è intatto');
});
