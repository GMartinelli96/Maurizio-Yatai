import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CLIENTI, FRAME_MS, PIATTI, RECAP, SERATA_YUKI, VIZI } from '../src/config.js';
import { Serata, costoPiatto } from '../src/serata/Serata.js';
import { BRAVURA, SEMI, giocaServata } from './bot.js';

// La tabella per Piatto del recap (ticket 06): fatti, serviti, costo, sprecati e vendite di ogni Piatto del menù.
// Tutto senza browser. Le somme per Piatto devono dare i totali della Serata.

const SEC = 1000;
const MENU = SERATA_YUKI.piatti;

function avanza(serata, ms) {
  const eventi = [];
  for (let t = 0; t < ms - 1e-6; t += FRAME_MS) eventi.push(...serata.update(Math.min(FRAME_MS, ms - t)));
  return eventi;
}

const riga = (serata, piatto) => serata.stato().perPiatto.find((r) => r.piatto === piatto);
const somma = (righe, campo) => righe.reduce((totale, r) => totale + r[campo], 0);

// Una Serata con tutto il menù e il primo Cliente al suo Posto, con l'Ordine che vogliamo noi e Pazienza lunga.
function conCliente(ordine, vizio = null) {
  const serata = new Serata({ seed: 'prova', ...SERATA_YUKI });
  avanza(serata, CLIENTI.primoArrivoSec * SEC + 50);
  const cliente = serata.posti[0].cliente;
  cliente.ordine = ordine;
  cliente.vizio = vizio;
  cliente.pazienzaMs = cliente.pazienzaTotaleMs = 100 * SEC;
  return serata;
}

const onigiri = (serata) => {
  serata.tocca('riso');
  serata.tocca('alga');
  serata.tocca('tagliere');
};

const takoyaki = (serata, prendi = true) => {
  serata.tocca('pastella');
  serata.tocca('polpo');
  avanza(serata, 5 * SEC + 50);
  serata.tocca('salsa');
  if (prendi) serata.tocca('piastra');
};

test('una riga per ogni Piatto del menù, nell\'ordine del menù, tutte a zero all\'inizio', () => {
  const serata = new Serata({ seed: 'prova', ...SERATA_YUKI });
  const { perPiatto } = serata.stato();
  assert.deepEqual(perPiatto.map((r) => r.piatto), MENU);
  assert.equal(MENU.length, 5);
  for (const r of perPiatto) assert.deepEqual(r, { piatto: r.piatto, fatti: 0, serviti: 0, costo: 0, sprecati: 0, vendite: 0 });
});

test('un Piatto servito: fatto, servito, costo e vendite (prezzo più Mancia), niente Spreco', () => {
  const serata = conCliente(['onigiri']);
  onigiri(serata);
  const [servito] = serata.servi(0);
  assert.equal(servito.tipo, 'servito');
  assert.deepEqual(riga(serata, 'onigiri'), { piatto: 'onigiri', fatti: 1, serviti: 1, costo: costoPiatto('onigiri'), sprecati: 0, vendite: servito.totale });
  assert.equal(riga(serata, 'takoyaki').fatti, 0);
});

test('un Piatto bruciato è fatto ma non servito: tutto il suo costo è sprecato e non vende', () => {
  const serata = conCliente(['takoyaki']);
  takoyaki(serata, false);
  avanza(serata, (PIATTI.takoyaki.burnAfterSec + 1) * SEC);
  assert.equal(serata.stato().postazioni.find((p) => p.id === 'piastra').stato, 'bruciato');
  assert.deepEqual(riga(serata, 'takoyaki'), { piatto: 'takoyaki', fatti: 1, serviti: 0, costo: 100, sprecati: 100, vendite: 0 });
});

test('un Piatto cominciato e mai finito: gli Ingredienti pagati sono sprecati, ma non è "fatto"', () => {
  const serata = conCliente(['takoyaki']);
  serata.tocca('pastella');
  assert.deepEqual(riga(serata, 'takoyaki'), { piatto: 'takoyaki', fatti: 0, serviti: 0, costo: 30, sprecati: 30, vendite: 0 });
});

test('un Piatto rimasto sul Bancone a fine Serata è fatto e sprecato', () => {
  const serata = conCliente(['kakigori-melone']);
  onigiri(serata);
  assert.deepEqual(riga(serata, 'onigiri'), { piatto: 'onigiri', fatti: 1, serviti: 0, costo: 30, sprecati: 30, vendite: 0 });
});

test('un Ordine da 2 Piatti: la Mancia si divide tra i Piatti e le Vendite per Piatto sommano esatte', () => {
  const serata = conCliente(['onigiri', 'takoyaki']);
  onigiri(serata);
  takoyaki(serata);
  const [servito] = serata.servi(0);
  assert.equal(servito.tipo, 'servito');
  const { perPiatto } = serata.stato();
  assert.equal(somma(perPiatto, 'vendite'), servito.totale);
  // Ognuno ha almeno il suo prezzo e non più di prezzo più tutta la Mancia.
  for (const piatto of ['onigiri', 'takoyaki']) {
    const r = riga(serata, piatto);
    assert.equal(r.serviti, 1);
    assert.ok(r.vendite >= PIATTI[piatto].price && r.vendite <= PIATTI[piatto].price + servito.mancia, `${piatto}: ${r.vendite}`);
  }
  // Il Piatto che costa di più prende la parte di Mancia più grande (o uguale).
  assert.ok(riga(serata, 'takoyaki').vendite - 300 >= riga(serata, 'onigiri').vendite - 100);
});

test('Carlotta paga il doppio: le Vendite del Piatto sono il suo prezzo doppio più la Mancia', () => {
  const serata = conCliente(['onigiri'], 'carlotta');
  onigiri(serata);
  const [servito] = serata.servi(0);
  assert.equal(servito.prezzo, PIATTI.onigiri.price * VIZI.carlotta.prezzoX);
  assert.equal(riga(serata, 'onigiri').vendite, servito.totale);
  assert.equal(riga(serata, 'onigiri').vendite, serata.stato().vendite);
});

test('una Serata intera con tutti e 5 i Piatti: costo, sprecati e vendite per Piatto sommano ai totali', () => {
  for (const [bravura, reazioneMs] of Object.entries(BRAVURA)) {
    for (const seme of SEMI) {
      const registro = [];
      const stato = giocaServata(SERATA_YUKI, reazioneMs, seme, { registro });
      const { perPiatto } = stato;
      const dove = `${bravura}/${seme}`;
      assert.deepEqual(perPiatto.map((r) => r.piatto), MENU, dove);
      assert.equal(somma(perPiatto, 'costo'), stato.spesa, `spesa ${dove}`);
      assert.equal(somma(perPiatto, 'sprecati'), stato.spreco, `spreco ${dove}`);
      assert.equal(somma(perPiatto, 'vendite'), stato.vendite, `vendite ${dove}`);
      // Quanti Piatti di ogni tipo sono stati serviti, contati dagli eventi.
      const serviti = Object.fromEntries(MENU.map((p) => [p, 0]));
      for (const e of registro.filter((e) => e.tipo === 'servito')) for (const id of e.piatti) serviti[id.split('-')[0]] += 1;
      for (const r of perPiatto) {
        assert.equal(r.serviti, serviti[r.piatto], `serviti ${r.piatto} ${dove}`);
        assert.ok(r.fatti >= r.serviti, `fatti ${r.piatto} ${dove}`);
        assert.ok(r.sprecati >= 0 && r.sprecati <= r.costo, `sprecati ${r.piatto} ${dove}`);
      }
      // Il recap riceve la stessa tabella con l'evento di fine Serata.
      assert.deepEqual(registro.find((e) => e.tipo === 'serataFinita').perPiatto, perPiatto, dove);
    }
  }
});

test('in una Serata intera tutti e 5 i Piatti compaiono con qualcosa di fatto (almeno col bot rapido)', () => {
  const sommaFatti = Object.fromEntries(MENU.map((p) => [p, 0]));
  for (const seme of SEMI) for (const r of giocaServata(SERATA_YUKI, BRAVURA.rapido, seme).perPiatto) sommaFatti[r.piatto] += r.fatti;
  for (const piatto of MENU) assert.ok(sommaFatti[piatto] > 0, `${piatto} mai fatto`);
});

test('le colonne del recap stanno dentro il pannello e non si toccano', () => {
  const { colonne, margine, nomeLarghezza } = RECAP.tabella;
  const passo = colonne[1] - colonne[0];
  colonne.forEach((x, i) => i && assert.equal(x - colonne[i - 1], passo));
  assert.ok(colonne.at(-1) + passo / 2 <= RECAP.pannello.w / 2 - margine + 4, 'l\'ultima colonna esce dal pannello');
  // Il nome del Piatto finisce prima della prima colonna.
  assert.ok(-RECAP.pannello.w / 2 + margine + nomeLarghezza <= colonne[0] - passo / 2 + 4, 'il nome tocca la prima colonna');
});
