import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { CLIENTI, POSTI, VIZI } from '../src/config.js';
import { CAST } from '../src/disegni/cast.js';
import { eDelCast, scegliDelCast } from '../src/serata/cast.js';
import { Serata } from '../src/serata/Serata.js';

// L'arrivo del cast (ticket 09): chi si siede ai Posti tra i sette peluche e i Clienti di passaggio. La regola è
// descritta nei dati (CLIENTI.cast) e qui si controlla che sia ripetibile, che rispetti i suoi limiti e che non sposti
// gli arrivi né gli Ordini di prima.

// Una Serata intera in cui nessuno cucina né serve: i Clienti arrivano, aspettano e se ne vanno a Pazienza finita.
// Per ogni arrivo torna cosa è successo, e quanti del cast stavano ai Posti subito dopo.
function arrivi(seed, opzioni = {}) {
  const serata = new Serata({ seed, ...opzioni });
  const lista = [];
  while (!serata.finita) {
    for (const evento of serata.update(10)) {
      if (evento.tipo !== 'clienteArrivato') continue;
      const seduti = serata.stato().posti.map(({ cliente }) => cliente?.tipo).filter(Boolean);
      lista.push({ tempoMs: serata.tempoMs, posto: evento.posto, cliente: evento.cliente, seduti });
    }
  }
  return lista;
}

const SEMI = Array.from({ length: 40 }, (_, i) => `cast-${i}`);

test('i dati del cast: sette peluche, tutti disegnati, nessuno anche di passaggio, quota e limite sensati', () => {
  const { membri, quota, maxAiPosti } = CLIENTI.cast;
  assert.deepEqual([...membri].sort(), [...CAST].sort(), 'il cast dei dati e quello disegnato discordano');
  assert.equal(membri.length, 7);
  for (const id of membri) assert.ok(!CLIENTI.passaggio.includes(id), `${id} è anche di passaggio`);
  assert.ok(quota > 0 && quota < 1);
  assert.ok(Number.isInteger(maxAiPosti) && maxAiPosti >= 1 && maxAiPosti < POSTI.quanti, 'almeno un Posto resta ai Clienti di passaggio');
  assert.ok(eDelCast('nella') && !eDelCast('tanuki'));
});

test('la regola: con i Posti del cast al massimo, o col sorteggio "di passaggio", arriva uno di passaggio', () => {
  const sempre = () => 0;
  const mai = () => 0.99;
  assert.ok(CAST.includes(scegliDelCast(sempre)), 'con il sorteggio a favore sceglie un peluche del cast');
  assert.equal(scegliDelCast(mai), null);
  const pieno = CLIENTI.cast.membri.slice(0, CLIENTI.cast.maxAiPosti);
  assert.equal(scegliDelCast(sempre, { alPosto: pieno }), null, 'i Posti del cast sono al massimo');
  assert.equal(scegliDelCast(sempre, { alPosto: ['tanuki', 'kitsune', 'maneki-neko'] }) === null, false, 'chi è di passaggio non conta come cast');
});

test('la regola non sceglie chi è già ai Posti né l’ultimo arrivato', () => {
  const { membri } = CLIENTI.cast;
  // Con il sorteggio sempre a zero sceglie il primo candidato: tolto lui, scatta il secondo, e così via.
  const sempre = () => 0;
  assert.equal(scegliDelCast(sempre), membri[0]);
  assert.equal(scegliDelCast(sempre, { ultimo: membri[0] }), membri[1]);
  assert.equal(scegliDelCast(sempre, { alPosto: [membri[0]] }), membri[1]);
  assert.equal(scegliDelCast(sempre, { alPosto: ['tanuki', membri[1]], ultimo: membri[0] }), membri[2]);
});

test('con lo stesso seme arrivano gli stessi Clienti nello stesso ordine; con semi diversi no', () => {
  const sequenza = (seed) => arrivi(seed).map(({ cliente }) => cliente.tipo).join(',');
  assert.equal(sequenza('cast-0'), sequenza('cast-0'));
  assert.equal(sequenza('prova'), sequenza('prova'));
  const diverse = new Set(SEMI.map(sequenza));
  assert.ok(diverse.size > SEMI.length * 0.9, `${SEMI.length} semi hanno dato solo ${diverse.size} sequenze diverse`);
});

test('mai due uguali ai Posti insieme, mai più del massimo, mai lo stesso di seguito', () => {
  let delCast = 0;
  for (const seed of SEMI) {
    let ultimo = null;
    for (const { seduti, cliente } of arrivi(seed)) {
      const delCastSeduti = seduti.filter(eDelCast);
      assert.ok(delCastSeduti.length <= CLIENTI.cast.maxAiPosti, `${seed}: ${delCastSeduti.length} del cast ai Posti`);
      assert.equal(new Set(delCastSeduti).size, delCastSeduti.length, `${seed}: due uguali ai Posti (${delCastSeduti})`);
      if (eDelCast(cliente.tipo)) {
        delCast += 1;
        assert.notEqual(cliente.tipo, ultimo, `${seed}: ${cliente.tipo} due volte di seguito`);
        ultimo = cliente.tipo;
      }
    }
  }
  assert.ok(delCast > 100, 'il cast non è mai arrivato');
});

test('un Cliente ogni quattro è del cast, e tutti e sette si vedono, senza che nessuno domini', () => {
  const conteggio = Object.fromEntries(CAST.map((id) => [id, 0]));
  let totale = 0;
  let delCast = 0;
  for (const seed of SEMI) {
    for (const { cliente } of arrivi(seed)) {
      totale += 1;
      if (eDelCast(cliente.tipo)) {
        delCast += 1;
        conteggio[cliente.tipo] += 1;
      } else {
        assert.ok(CLIENTI.passaggio.includes(cliente.tipo), `${cliente.tipo} non è di passaggio né del cast`);
      }
    }
  }
  const quota = delCast / totale;
  // La quota dei dati è 0,25; il limite ai Posti e il non-di-seguito la abbassano un poco (misurata 0,24).
  assert.ok(quota > 0.2 && quota < 0.28, `quota del cast ${quota.toFixed(3)} su ${totale} arrivi`);
  const media = delCast / CAST.length;
  for (const [id, n] of Object.entries(conteggio)) {
    assert.ok(n > media * 0.6 && n < media * 1.4, `${id} è arrivato ${n} volte, la media è ${media.toFixed(1)}`);
  }
});

// Gli arrivi (quando, a che Posto, con che Ordine) di alcuni semi come erano prima del cast, registrati sul codice senza
// di lui (impronte SHA-1, 10 caratteri). Il cast ha il suo generatore e cambia solo chi si siede, quindi devono restare
// questi. Sono solo semi in cui non arrivano né Carlotta né Balosso: i loro Vizi cambiano la Pazienza, e un Cliente che
// se ne va prima libera il Posto prima e sposta gli arrivi successivi (è voluto). Nella e gli altri quattro non toccano
// niente, e il test lo prova; per gli altri semi vale il test dei Vizi (test/vizi.test.js).
const ARRIVI_DI_PRIMA = {
  a: [17, 'a62a27b439a7'],
  'cast-2': [16, '7577aed82a'],
  'cast-3': [15, 'ec0f3aa294'],
  'cast-6': [17, 'bbc4f97ac6'],
  'cast-9': [18, '108318059a'],
  'cast-12': [18, 'b9145636dc'],
  'cast-14': [18, 'd4e332c03a'],
  'cast-17': [17, '0543f98ee0'],
  'cast-18': [18, 'bca5e94da1'],
  'cast-27': [17, 'a874cd7794'],
  'cast-28': [17, '0da3fdab60'],
};

test('il cast senza Carlotta e Balosso non sposta gli arrivi né gli Ordini dei semi di prima', () => {
  for (const [seed, [quanti, impronta]] of Object.entries(ARRIVI_DI_PRIMA)) {
    const trovati = arrivi(seed);
    assert.ok(!trovati.some(({ cliente }) => ['carlotta', 'balosso'].includes(cliente.tipo)), `${seed}: ora c'è Carlotta o Balosso, scegliere un altro seme`);
    const lista = trovati.map(({ tempoMs, posto, cliente }) => [tempoMs, posto, cliente.ordine.join('+')]);
    assert.equal(lista.length, quanti, `${seed}: cambia il numero di arrivi`);
    assert.equal(createHash('sha1').update(JSON.stringify(lista)).digest('hex').slice(0, impronta.length), impronta, `${seed}: cambiano i tempi, i Posti o gli Ordini`);
  }
});

test('Carlotta, Balosso e Nella arrivano con il loro Vizio; gli altri quattro del cast e i Clienti di passaggio senza', () => {
  const conVizio = new Set(Object.keys(VIZI));
  assert.deepEqual([...conVizio].sort(), ['balosso', 'carlotta', 'nella']);
  const visti = new Set();
  for (const seed of SEMI) {
    for (const { cliente, seduti } of arrivi(seed)) {
      assert.equal(cliente.vizio, conVizio.has(cliente.tipo) ? cliente.tipo : null, `${cliente.tipo}: Vizio sbagliato`);
      visti.add(cliente.tipo);
      assert.ok(seduti.includes(cliente.tipo));
    }
  }
  for (const id of ['marcella', 'filippo', 'pasquale', 'ebi-furai']) assert.ok(visti.has(id), `${id} non è mai arrivato`);
  // Anche nello stato che legge la scena (e il bot dei test): il campo c'è, per tutti.
  const serata = new Serata({ seed: 'cast-1' });
  while (!serata.stato().posti.some(({ cliente }) => cliente)) serata.update(100);
  for (const { cliente } of serata.stato().posti) if (cliente) assert.equal(cliente.vizio, conVizio.has(cliente.tipo) ? cliente.tipo : null);
});
