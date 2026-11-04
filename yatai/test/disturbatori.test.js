import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DISTURBATORI, PIATTI, SERATA_MOTORE, SERATA_PROVA_DISTURBATORI } from '../src/config.js';
import { EVENTI } from '../src/serata/disturbatori.js';
import { Serata, costoPiatto } from '../src/serata/Serata.js';

// I Disturbatori (ticket 11): Croccola, le formiche e i corvi. La logica è tutta in src/serata/disturbatori.js e si prova
// senza browser: il tempo avanza a passi di SERATA_MOTORE.passoMs e i numeri vengono da DISTURBATORI (config.js).

const PASSO = SERATA_MOTORE.passoMs;
const SEC = 1000;
const ms = (chi, voce) => DISTURBATORI[chi][`${voce}Sec`] * SEC;
const nuova = (chi, seed = 'dist', altro = {}) => new Serata({ seed, ...SERATA_PROVA_DISTURBATORI, disturbatori: [].concat(chi), ...altro });

// Avanza di `durataMs` e aggiunge a `log` gli eventi, ognuno con il tempo a cui è successo.
function corri(serata, durataMs, log = []) {
  for (let t = 0; t < durataMs && !serata.finita; t += PASSO) {
    for (const evento of serata.update(PASSO)) log.push({ tempoMs: serata.tempoMs, ...evento });
  }
  return log;
}

// Avanza fino al primo evento di quel tipo (per quel Disturbatore) e lo torna, con il log di tutto quello che è successo.
function finoA(serata, tipo, chi, log = []) {
  while (!serata.finita) {
    const prima = log.length;
    corri(serata, PASSO, log);
    const trovato = log.slice(prima).find((evento) => evento.tipo === tipo && (!chi || evento.chi === chi));
    if (trovato) return trovato;
  }
  return null;
}

const eventi = (log, tipo) => log.filter((evento) => evento.tipo === tipo);

// Un Piatto vero, fatto con i tocchi (così la Spesa è vera): una stringa è un tocco su una Scorta o una Postazione, un
// numero è un'attesa in ms (la cottura). Torna gli eventi dell'ultimo tocco.
function cucina(serata, passi) {
  let ultimo = [];
  for (const passo of passi) {
    if (typeof passo === 'number') corri(serata, passo);
    else ultimo = serata.tocca(passo);
  }
  return ultimo;
}

const takoyakiSulBancone = (serata) => {
  cucina(serata, ['pastella', 'polpo', PIATTI.takoyaki.ricetta.find((p) => p.cotturaSec).cotturaSec * SEC, 'salsa', 'piastra']);
  assert.deepEqual(serata.bancone, ['takoyaki']);
};

// --- Gli eventi ---

test('EVENTI è l’elenco di tutti gli eventi dei Disturbatori: quelli che escono sono tutti lì, e ognuno esce in qualche Serata', () => {
  const visti = new Set();
  for (const seme of ['e1', 'e2', 'e3', 'e4']) {
    const serata = nuova(['croccola', 'formiche', 'corvi'], seme);
    serata.bancone.push('takoyaki', 'kakigori-fragola', 'taiyaki-crema');
    cucina(serata, ['riso', 'alga']);
    const log = [];
    for (let t = 0; t < 125 * SEC && !serata.finita; t += PASSO) {
      for (const evento of serata.update(PASSO)) {
        log.push(evento);
        visti.add(evento.tipo);
        // Il primo che arriva, di ogni tipo, lo si manda via; gli altri li lascia colpire.
        if (evento.tipo === 'disturbatoreArrivato' && log.filter((e) => e.tipo === 'disturbatoreArrivato' && e.chi === evento.chi).length % 2 === 1) for (const e of serata.scaccia(evento.chi)) visti.add(e.tipo);
      }
    }
  }
  const disturbatori = [...visti].filter((tipo) => /^(disturbatore|piatto(Rubato|Rovinato))/.test(tipo));
  assert.deepEqual([...disturbatori].sort(), [...EVENTI].sort());
});

// --- I dati ---

test('i dati dei Disturbatori: chi punta cosa, e cosa ne è del Piatto (GAME_SPEC.md)', () => {
  assert.deepEqual(Object.keys(DISTURBATORI), ['croccola', 'formiche', 'corvi']);
  const { croccola, formiche, corvi } = DISTURBATORI;
  // Croccola punta takoyaki e taiyaki sul Bancone e ruba.
  assert.deepEqual([croccola.dove, croccola.bersagli, croccola.esito, croccola.gesto], ['bancone', ['takoyaki', 'taiyaki'], 'ruba', 'coccola']);
  // Le formiche puntano i Piatti dolci sul Bancone e li rovinano.
  assert.deepEqual([formiche.dove, formiche.bersagli, formiche.esito, formiche.gesto], ['bancone', ['kakigori', 'taiyaki'], 'rovina', 'tocco']);
  // I corvi rubano un Piatto pronto su una Postazione, qualunque sia.
  assert.deepEqual([corvi.dove, corvi.bersagli, corvi.esito, corvi.gesto], ['postazione', null, 'ruba', 'tocco']);
  for (const [chi, cfg] of Object.entries(DISTURBATORI)) {
    for (const piatto of cfg.bersagli ?? []) assert.ok(PIATTI[piatto], `${chi}: "${piatto}" non è un Piatto`);
    for (const voce of ['arriva', 'punta', 'colpo', 'rinuncia', 'vaVia']) assert.ok(cfg[`${voce}Sec`] > 0, `${chi}: ${voce}Sec deve essere positivo`);
    for (const voce of ['primoSec', 'intervalloSec']) assert.ok(cfg[voce].min > 0 && cfg[voce].min <= cfg[voce].max, `${chi}: ${voce}`);
    // Si ha il tempo di fermarli: dal primo istante al colpo passa più di un secondo e mezzo.
    assert.ok(cfg.arrivaSec + cfg.puntaSec + cfg.colpoSec >= 2.5, `${chi}: troppo veloce per un bambino`);
  }
});

test('senza l’opzione nessun Disturbatore: lo stato è vuoto e il tocco non fa niente', () => {
  const serata = new Serata({ seed: 'dist', ...SERATA_PROVA_DISTURBATORI, disturbatori: [] });
  serata.bancone.push('takoyaki', 'kakigori-fragola');
  const log = corri(serata, 125 * SEC);
  assert.equal(log.filter(({ tipo }) => /disturbatore|piatto(Rubato|Rovinato)/.test(tipo)).length, 0);
  assert.deepEqual(serata.stato().disturbatori, []);
  assert.deepEqual(new Serata({ seed: 'dist' }).scaccia('croccola'), []);
  assert.throws(() => nuova('scarafaggi'), /sconosciuto/);
});

// --- Croccola ---

test('Croccola: coccolata, fa le fusa e se ne va, e il Piatto resta sul Bancone', () => {
  const serata = nuova('croccola');
  serata.bancone.push('takoyaki');
  const log = [];
  const arrivo = finoA(serata, 'disturbatoreArrivato', 'croccola', log);
  assert.deepEqual(arrivo.bersaglio, { dove: 'bancone', piatto: 'takoyaki', indice: 0 });
  corri(serata, 1000, log);
  const tocco = serata.scaccia('croccola');
  assert.deepEqual(tocco, [
    { tipo: 'disturbatoreScacciato', chi: 'croccola', gesto: 'coccola' },
    { tipo: 'disturbatoreVaVia', chi: 'croccola', motivo: 'coccolata' },
  ]);
  assert.equal(serata.stato().disturbatori[0].fase, 'vaVia');
  corri(serata, 15 * SEC, log);
  assert.equal(eventi(log, 'piattoRubato').length, 0, 'coccolata, non ruba');
  assert.deepEqual(serata.bancone, ['takoyaki']);
  assert.deepEqual(serata.stato().disturbatori, [], 'dopo la fuga non c’è più');
  // Un secondo tocco mentre se ne va, o quando non c'è, non fa niente.
  assert.deepEqual(serata.scaccia('croccola'), []);
});

test('Croccola: lasciata fare ruba il Piatto che punta, al momento giusto', () => {
  const serata = nuova('croccola');
  serata.bancone.push('onigiri', 'taiyaki-crema', 'takoyaki');
  const log = [];
  const arrivo = finoA(serata, 'disturbatoreArrivato', 'croccola', log);
  // Punta il primo che va bene lungo il Bancone: l'onigiri non le interessa.
  assert.deepEqual(arrivo.bersaglio, { dove: 'bancone', piatto: 'taiyaki-crema', indice: 1 });
  const furto = finoA(serata, 'piattoRubato', 'croccola', log);
  assert.deepEqual({ ...furto, tempoMs: undefined }, { tempoMs: undefined, tipo: 'piattoRubato', chi: 'croccola', piatto: 'taiyaki-crema', dove: 'bancone', indice: 1 });
  const durata = ms('croccola', 'arriva') + ms('croccola', 'punta') + ms('croccola', 'colpo');
  assert.ok(Math.abs(furto.tempoMs - (arrivo.tempoMs + durata)) <= PASSO, `ruba ${furto.tempoMs - arrivo.tempoMs} ms dopo l’arrivo, non ${durata}`);
  assert.deepEqual(serata.bancone, ['onigiri', 'takoyaki'], 'sparisce solo il Piatto puntato');
  assert.deepEqual(eventi(log, 'disturbatoreVaVia').map((e) => e.motivo), ['rubato']);
  assert.deepEqual(serata.scaccia('croccola'), [], 'dopo il furto non si coccola più');
});

test('Croccola si può fermare in ogni momento prima del colpo, ma non dopo', () => {
  for (const fase of ['arriva', 'punta', 'colpo']) {
    const serata = nuova('croccola');
    serata.bancone.push('takoyaki');
    const log = [];
    finoA(serata, 'disturbatoreArrivato', 'croccola', log);
    if (fase === 'punta') finoA(serata, 'disturbatorePunta', 'croccola', log);
    if (fase === 'colpo') finoA(serata, 'disturbatoreAttacca', 'croccola', log);
    assert.equal(serata.stato().disturbatori[0].fase, fase);
    assert.equal(serata.scaccia('croccola')[0].tipo, 'disturbatoreScacciato', `in fase ${fase}`);
    corri(serata, 10 * SEC, log);
    assert.deepEqual(serata.bancone, ['takoyaki'], `in fase ${fase}`);
  }
});

test('Croccola non arriva se sul Bancone non c’è niente che le piaccia', () => {
  const serata = nuova('croccola');
  serata.bancone.push('onigiri', 'kakigori-melone', 'ramen-uovo');
  const log = corri(serata, 125 * SEC);
  assert.equal(eventi(log, 'disturbatoreArrivato').length, 0);
});

test('Croccola segue il suo Piatto lungo il Bancone e, se lo servono, ne cerca un altro; se non c’è, se ne va senza rubare', () => {
  const serata = nuova('croccola');
  serata.bancone.push('takoyaki');
  const log = [];
  finoA(serata, 'disturbatoreArrivato', 'croccola', log);
  serata.bancone.unshift('onigiri');
  corri(serata, PASSO, log);
  assert.equal(serata.stato().disturbatori[0].bersaglio.indice, 1, 'il Piatto si è spostato di un posto e lei con lui');
  // Servono il takoyaki, ma sul Bancone c'è un taiyaki: punta quello.
  serata.bancone.splice(1, 1, 'taiyaki-fagioli');
  corri(serata, PASSO, log);
  assert.deepEqual(serata.stato().disturbatori[0].bersaglio, { dove: 'bancone', piatto: 'taiyaki-fagioli', indice: 1 });
  assert.equal(finoA(serata, 'piattoRubato', 'croccola', log).piatto, 'taiyaki-fagioli');

  // Senza niente da puntare, finito di puntare aspetta rinunciaSec e se ne va delusa.
  const delusa = nuova('croccola');
  delusa.bancone.push('takoyaki');
  const giro = [];
  const arrivo = finoA(delusa, 'disturbatoreArrivato', 'croccola', giro);
  delusa.bancone.length = 0;
  const via = finoA(delusa, 'disturbatoreVaVia', 'croccola', giro);
  assert.equal(via.motivo, 'delusa');
  assert.ok(Math.abs(via.tempoMs - (arrivo.tempoMs + ms('croccola', 'arriva') + ms('croccola', 'punta') + ms('croccola', 'rinuncia'))) <= 2 * PASSO);
  assert.equal(eventi(giro, 'piattoRubato').length, 0);
  const aspetta = nuova('croccola');
  aspetta.bancone.push('takoyaki');
  finoA(aspetta, 'disturbatorePunta', 'croccola');
  aspetta.bancone.length = 0;
  corri(aspetta, ms('croccola', 'punta') + PASSO);
  assert.equal(aspetta.stato().disturbatori[0].aspetta, true, 'ha finito di puntare e non ha niente da colpire');
});

// --- Le formiche ---

test('formiche: un tocco le fa girare al largo; lasciate fare rovinano il Piatto dolce, che sparisce dal Bancone', () => {
  const scacciate = nuova('formiche');
  scacciate.bancone.push('kakigori-fragola');
  const log = [];
  finoA(scacciate, 'disturbatorePunta', 'formiche', log);
  assert.deepEqual(scacciate.scaccia('formiche'), [
    { tipo: 'disturbatoreScacciato', chi: 'formiche', gesto: 'tocco' },
    { tipo: 'disturbatoreVaVia', chi: 'formiche', motivo: 'scacciato' },
  ]);
  corri(scacciate, 10 * SEC, log);
  assert.deepEqual(scacciate.bancone, ['kakigori-fragola']);
  assert.equal(eventi(log, 'piattoRovinato').length, 0);

  const lasciate = nuova('formiche');
  lasciate.bancone.push('takoyaki', 'kakigori-matcha', 'taiyaki-crema');
  const giro = [];
  const arrivo = finoA(lasciate, 'disturbatoreArrivato', 'formiche', giro);
  assert.equal(arrivo.bersaglio.piatto, 'kakigori-matcha', 'il takoyaki non è dolce');
  const rovina = finoA(lasciate, 'piattoRovinato', 'formiche', giro);
  assert.deepEqual({ ...rovina, tempoMs: undefined }, { tempoMs: undefined, tipo: 'piattoRovinato', chi: 'formiche', piatto: 'kakigori-matcha', dove: 'bancone', indice: 1 });
  assert.deepEqual(lasciate.bancone, ['takoyaki', 'taiyaki-crema'], 'va nel cestino da solo: non resta sul Bancone');
  assert.equal(eventi(giro, 'piattoRubato').length, 0, 'rovinare non è rubare');
  assert.deepEqual(eventi(giro, 'disturbatoreVaVia').map((e) => e.motivo), ['rovinato']);
});

test('le formiche non arrivano se sul Bancone non c’è niente di dolce', () => {
  const serata = nuova('formiche');
  serata.bancone.push('onigiri', 'takoyaki', 'ramen-naruto');
  assert.equal(eventi(corri(serata, 125 * SEC), 'disturbatoreArrivato').length, 0);
});

// --- I corvi ---

test('corvi: si posano sul tetto anche senza Piatti, gracchiano e, a vuoto, se ne vanno delusi', () => {
  const serata = nuova('corvi');
  const log = [];
  const arrivo = finoA(serata, 'disturbatoreArrivato', 'corvi', log);
  assert.equal(arrivo.bersaglio, null);
  const gracchia = finoA(serata, 'disturbatorePunta', 'corvi', log);
  assert.ok(Math.abs(gracchia.tempoMs - (arrivo.tempoMs + ms('corvi', 'arriva'))) <= PASSO, 'il "kaa kaa" comincia appena si è posato');
  const via = finoA(serata, 'disturbatoreVaVia', 'corvi', log);
  assert.equal(via.motivo, 'delusa');
  assert.ok(Math.abs(via.tempoMs - (arrivo.tempoMs + ms('corvi', 'arriva') + ms('corvi', 'punta') + ms('corvi', 'rinuncia'))) <= 2 * PASSO);
  assert.equal(eventi(log, 'piattoRubato').length, 0);
});

test('corvi: scendono a rubare un Piatto pronto lasciato su una Postazione, che torna libera', () => {
  const serata = nuova('corvi');
  cucina(serata, ['riso', 'alga']);
  assert.equal(serata.stato().postazioni.find((p) => p.id === 'tagliere').stato, 'pronto');
  const log = [];
  const arrivo = finoA(serata, 'disturbatoreArrivato', 'corvi', log);
  assert.deepEqual(arrivo.bersaglio, { dove: 'postazione', postazione: 'tagliere', piatto: 'onigiri' });
  const furto = finoA(serata, 'piattoRubato', 'corvi', log);
  assert.deepEqual({ ...furto, tempoMs: undefined }, { tempoMs: undefined, tipo: 'piattoRubato', chi: 'corvi', piatto: 'onigiri', dove: 'postazione', postazione: 'tagliere' });
  const durata = ms('corvi', 'arriva') + ms('corvi', 'punta') + ms('corvi', 'colpo');
  assert.ok(Math.abs(furto.tempoMs - (arrivo.tempoMs + durata)) <= PASSO);
  const tagliere = serata.stato().postazioni.find((p) => p.id === 'tagliere');
  assert.equal(tagliere.stato, 'libera');
  assert.equal(tagliere.fatti, 0, 'la ricetta ricomincia da capo');
  assert.deepEqual(serata.bancone, []);
  // E si può rifare un Piatto lì, subito.
  assert.equal(cucina(serata, ['riso', 'alga']).at(-1).tipo, 'piattoPronto');
  assert.equal(serata.stato().postazioni.find((p) => p.id === 'tagliere').stato, 'pronto');
});

test('corvi: un tocco li manda via in ogni momento prima del colpo, e anche mentre scendono se il Piatto è già al sicuro', () => {
  for (const fase of ['arriva', 'punta', 'colpo']) {
    const serata = nuova('corvi');
    cucina(serata, ['riso', 'alga']);
    const log = [];
    finoA(serata, 'disturbatoreArrivato', 'corvi', log);
    if (fase === 'punta') finoA(serata, 'disturbatorePunta', 'corvi', log);
    if (fase === 'colpo') finoA(serata, 'disturbatoreAttacca', 'corvi', log);
    assert.deepEqual(serata.scaccia('corvi').map((e) => e.tipo), ['disturbatoreScacciato', 'disturbatoreVaVia'], `in fase ${fase}`);
    corri(serata, 10 * SEC, log);
    assert.equal(serata.stato().postazioni.find((p) => p.id === 'tagliere').stato, 'pronto', `in fase ${fase}`);
    assert.equal(eventi(log, 'piattoRubato').length, 0);
  }
  // Il Piatto preso mentre il corvo scende: la picchiata va a vuoto.
  const serata = nuova('corvi');
  cucina(serata, ['riso', 'alga']);
  const log = [];
  finoA(serata, 'disturbatoreAttacca', 'corvi', log);
  serata.tocca('tagliere');
  assert.deepEqual(serata.bancone, ['onigiri']);
  corri(serata, 5 * SEC, log);
  assert.equal(eventi(log, 'piattoRubato').length, 0);
  assert.deepEqual(eventi(log, 'disturbatoreVaVia').map((e) => e.motivo), ['delusa']);
  assert.deepEqual(serata.bancone, ['onigiri']);
});

test('i corvi non toccano un Piatto che cuoce né uno bruciato', () => {
  // Il taiyaki cuoce 8 s: si comincia appena il corvo si è posato, così sta ancora cuocendo quando scende.
  const cuoce = nuova('corvi');
  const log = [];
  const arrivo = finoA(cuoce, 'disturbatoreArrivato', 'corvi', log);
  cucina(cuoce, [500, 'impasto', 'fagioli']);
  const stampo = () => cuoce.stato().postazioni.find((p) => p.id === 'stampo').stato;
  assert.equal(stampo(), 'cuoce');
  corri(cuoce, ms('corvi', 'arriva') + ms('corvi', 'punta') + ms('corvi', 'colpo') - 500 + 1 * SEC, log);
  assert.ok(log.at(-1).tempoMs > arrivo.tempoMs + 4000);
  assert.equal(stampo(), 'cuoce', 'cuoce ancora, quindi non ha niente da rubare');
  assert.equal(eventi(log, 'piattoRubato').length, 0);

  const bruciato = nuova('corvi');
  cucina(bruciato, ['pastella', 'polpo', 5 * SEC, 'salsa']);
  const giro = [];
  finoA(bruciato, 'piattoBruciato', null, giro);
  assert.equal(bruciato.stato().postazioni.find((p) => p.id === 'piastra').stato, 'bruciato');
  finoA(bruciato, 'disturbatoreArrivato', 'corvi', giro);
  corri(bruciato, 15 * SEC, giro);
  assert.equal(eventi(giro, 'piattoRubato').length, 0, 'un Piatto bruciato non interessa a nessuno');
  assert.equal(bruciato.stato().postazioni.find((p) => p.id === 'piastra').stato, 'bruciato');
});

// --- Spreco, Serie, ripetibilità ---

test('un Piatto rubato o rovinato è Spreco, non Vendita, e la Serie non si spezza', () => {
  const casi = [
    { chi: 'croccola', fai: takoyakiSulBancone, piatto: 'takoyaki', evento: 'piattoRubato' },
    { chi: 'formiche', fai: (s) => cucina(s, ['ghiaccio', 2 * SEC, 'fragola', 'macchina']), piatto: 'kakigori', evento: 'piattoRovinato' },
    { chi: 'corvi', fai: (s) => cucina(s, ['riso', 'alga']), piatto: 'onigiri', evento: 'piattoRubato' },
  ];
  for (const { chi, fai, piatto, evento } of casi) {
    const serata = nuova(chi);
    fai(serata);
    const costo = costoPiatto(piatto);
    assert.equal(serata.spesa, costo, `${chi}: la Spesa è quella degli Ingredienti`);
    assert.equal(serata.spreco(), costo, `${chi}: un Piatto non ancora servito pesa già come Spreco`);
    const log = [];
    // La Serie è a 3 un attimo prima del colpo (il seme è fisso: in quel secondo nessun Cliente se ne va).
    finoA(serata, 'disturbatoreAttacca', chi, log);
    serata.serie = 3;
    const colpo = finoA(serata, evento, chi, log);
    assert.equal(serata.vendite, 0);
    assert.equal(serata.spreco(), costo, `${chi}: il Piatto sparito non si rimborsa`);
    assert.equal(serata.incasso, -costo);
    assert.equal(serata.serie, 3, `${chi}: la Serie non si spezza`);
    assert.deepEqual(log.filter((e) => e.tempoMs === colpo.tempoMs && e.tipo === 'serieSpezzata'), []);
  }
});

test('stesso seme, stessi Disturbatori; semi diversi, no', () => {
  const giro = (seme) => {
    const serata = nuova(['croccola', 'formiche', 'corvi'], seme);
    serata.bancone.push('takoyaki', 'kakigori-fragola', 'taiyaki-crema');
    return corri(serata, 125 * SEC).filter(({ tipo }) => /^(disturbatore|piatto(Rubato|Rovinato))/.test(tipo));
  };
  const a = giro('uno');
  assert.ok(a.length > 6, 'in una Serata ne succede qualcosa');
  assert.deepEqual(giro('uno'), a);
  assert.notDeepEqual(giro('due'), a);
});

test('ogni tipo ha il suo generatore: togliere un Disturbatore non sposta gli altri', () => {
  const arrivi = (chi) => {
    const serata = nuova(chi, 'indipendenti');
    serata.bancone.push('takoyaki');
    return eventi(corri(serata, 125 * SEC), 'disturbatoreArrivato').filter((e) => e.chi === 'corvi').map((e) => e.tempoMs);
  };
  const soli = arrivi('corvi');
  assert.ok(soli.length >= 1);
  assert.deepEqual(arrivi(['croccola', 'corvi']), soli);
  assert.deepEqual(arrivi(['corvi', 'formiche', 'croccola']), soli);
});

test('i Disturbatori non spostano gli arrivi dei Clienti né gli Ordini', () => {
  const clienti = (disturbatori) => {
    const serata = new Serata({ seed: 'intatti', ...SERATA_PROVA_DISTURBATORI, disturbatori });
    serata.bancone.push('takoyaki', 'kakigori-fragola');
    cucina(serata, ['riso', 'alga']);
    return eventi(corri(serata, 125 * SEC), 'clienteArrivato').map(({ tempoMs, posto, cliente }) => ({ tempoMs, posto, cliente }));
  };
  const senza = clienti([]);
  assert.ok(senza.length > 15);
  assert.deepEqual(clienti(['croccola', 'formiche', 'corvi']), senza);
});

test('quanto spesso arrivano è nei dati: il primo nella finestra di primoSec, poi dopo la fuga e intervalloSec', () => {
  for (const chi of ['croccola', 'formiche']) {
    const { primoSec, intervalloSec } = DISTURBATORI[chi];
    const piatto = chi === 'croccola' ? 'takoyaki' : 'kakigori-fragola';
    for (const seme of ['p', 'q', 'r', 's', 't', 'u']) {
      const serata = nuova(chi, seme);
      serata.bancone.push(piatto);
      const log = [];
      const primo = finoA(serata, 'disturbatoreArrivato', chi, log);
      assert.ok(primo.tempoMs >= primoSec.min * SEC - PASSO && primo.tempoMs <= primoSec.max * SEC + PASSO, `${chi} ${seme}: primo arrivo a ${primo.tempoMs} ms`);
      const via = serata.scaccia(chi);
      assert.equal(via.length, 2);
      const secondo = finoA(serata, 'disturbatoreArrivato', chi, log);
      const attesa = secondo.tempoMs - primo.tempoMs - ms(chi, 'vaVia');
      assert.ok(attesa >= intervalloSec.min * SEC - 2 * PASSO && attesa <= intervalloSec.max * SEC + 2 * PASSO, `${chi} ${seme}: torna dopo ${attesa} ms`);
    }
  }
});
