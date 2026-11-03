import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BRUCIATURA, FRAME_MS, FUMO_SEC, PIATTI, POSTAZIONI, SERATA_PRIMA, SERATA_TANABATA, SERATE } from '../src/config.js';
import { DISEGNI } from '../src/disegni/catalogo.js';
import { TESTI } from '../src/i18n.js';
import { Serata } from '../src/serata/Serata.js';

// Cottura, bruciatura, Fumo e Ordini da 2 Piatti (passo 4 di PIANO.md, ticket 06). Tutto senza browser.

const SEC = 1000;
const COTTURA = PIATTI.takoyaki.cookSec * SEC;
const BRUCIA = PIATTI.takoyaki.burnAfterSec * SEC;

// Avanza il tempo come fa la scena, a passi da un sessantesimo di secondo. Restituisce gli eventi.
function avanza(serata, ms) {
  const eventi = [];
  for (let t = 0; t < ms - 1e-6; t += FRAME_MS) eventi.push(...serata.update(Math.min(FRAME_MS, ms - t)));
  return eventi;
}

const tipi = (eventi) => eventi.map((e) => e.tipo);
const postazione = (serata, id) => serata.stato().postazioni.find((p) => p.id === id);

// L'onigiri si fa a tocchi (ticket 33): un tocco per Ingrediente, nell'ordine della ricetta. Poi è pronto.
function fattiGliIngredienti(serata) {
  for (const { ingrediente } of PIATTI.onigiri.ricetta) serata.tocca(ingrediente);
}

// Un onigiri sul Bancone, passando dal tagliere.
function preparaOnigiri(serata) {
  fattiGliIngredienti(serata);
  serata.tocca('tagliere');
}

// La Serata del Tanabata con il primo Cliente già al suo Posto.
function tanabata(opzioni = {}) {
  const serata = new Serata({ seed: 'prova', ...SERATA_TANABATA, ...opzioni });
  avanza(serata, 1600);
  return serata;
}

// Un takoyaki cotto, pronto sulla piastra da pochissimo.
function conTakoyakiPronto() {
  const serata = tanabata();
  serata.tocca('piastra');
  avanza(serata, COTTURA + 20);
  assert.equal(postazione(serata, 'piastra').stato, 'pronto');
  return serata;
}

// Un takoyaki dimenticato, bruciato da poco.
function conTakoyakiBruciato() {
  const serata = conTakoyakiPronto();
  avanza(serata, BRUCIA + 20);
  assert.equal(postazione(serata, 'piastra').stato, 'bruciato');
  return serata;
}

test('il Tanabata ha la sua Serata: onigiri e takoyaki, Ordini da 1 o 2 Piatti; l’Hanami resta com’era', () => {
  assert.equal(SERATE.tanabata, SERATA_TANABATA);
  assert.deepEqual(SERATA_TANABATA.piatti, ['onigiri', 'takoyaki']);
  assert.deepEqual(SERATA_TANABATA.piattiPerOrdine, { min: 1, max: 2 });
  assert.equal(SERATE.hanami, SERATA_PRIMA);
  assert.deepEqual(SERATA_PRIMA.piatti, ['onigiri']);
  const stato = new Serata(SERATA_TANABATA).stato();
  assert.deepEqual(stato.postazioni.map((p) => p.id), ['tagliere', 'piastra']);
  assert.deepEqual(stato.postazioni.map((p) => p.piatto), ['onigiri', 'takoyaki']);
  assert.equal(POSTAZIONI.piastra.piatto, 'takoyaki');
});

test('il takoyaki cuoce 5 secondi: prima non è pronto, poi sì', () => {
  const serata = tanabata();
  assert.deepEqual(tipi(serata.tocca('piastra')), ['cotturaIniziata']);
  avanza(serata, COTTURA - 100);
  assert.equal(postazione(serata, 'piastra').stato, 'cuoce');
  assert.ok(postazione(serata, 'piastra').restaMs > 0);
  assert.deepEqual(tipi(serata.tocca('piastra')), ['postazioneOccupata']);
  const eventi = avanza(serata, 150);
  assert.ok(tipi(eventi).includes('piattoPronto'));
  assert.equal(postazione(serata, 'piastra').stato, 'pronto');
});

test('un takoyaki preso in tempo passa sul Bancone e sul Bancone non si brucia', () => {
  const serata = conTakoyakiPronto();
  avanza(serata, BRUCIA - 600);
  assert.deepEqual(tipi(serata.tocca('piastra')), ['sulBancone']);
  assert.deepEqual(serata.stato().bancone, ['takoyaki']);
  assert.equal(postazione(serata, 'piastra').stato, 'libera');
  // Il Bancone non è una Postazione: lasciato lì non si brucia.
  const eventi = avanza(serata, 20 * SEC);
  assert.ok(!tipi(eventi).includes('piattoBruciato'));
  assert.deepEqual(serata.stato().bancone, ['takoyaki']);
  assert.equal(serata.stato().bruciati, 0);
});

test('un takoyaki dimenticato si brucia 4 secondi dopo essere pronto, né prima né dopo', () => {
  const serata = conTakoyakiPronto();
  // Pronto da 20 ms: fino a poco prima di BRUCIA non succede niente.
  let eventi = avanza(serata, BRUCIA - 100);
  assert.ok(!tipi(eventi).includes('piattoBruciato'));
  assert.equal(postazione(serata, 'piastra').stato, 'pronto');
  eventi = avanza(serata, 200);
  const bruciato = eventi.filter((e) => e.tipo === 'piattoBruciato');
  assert.equal(bruciato.length, 1);
  assert.deepEqual({ ...bruciato[0] }, { tipo: 'piattoBruciato', postazione: 'piastra', piatto: 'takoyaki' });
  assert.equal(postazione(serata, 'piastra').stato, 'bruciato');
  assert.equal(serata.stato().bruciati, 1);
  assert.deepEqual(serata.stato().bancone, [], 'un Piatto bruciato non finisce sul Bancone');
});

test('il Piatto bruciato aspetta il tocco: la Postazione non si libera da sola', () => {
  const serata = conTakoyakiBruciato();
  const eventi = avanza(serata, 30 * SEC);
  assert.ok(!tipi(eventi).includes('fumoPassato'));
  assert.equal(postazione(serata, 'piastra').stato, 'bruciato');
  assert.equal(serata.stato().bruciati, 1, 'bruciato una volta sola');
});

test('l’onigiri non si brucia mai: pronto resta pronto', () => {
  const serata = tanabata();
  fattiGliIngredienti(serata);
  assert.equal(postazione(serata, 'tagliere').stato, 'pronto');
  const eventi = avanza(serata, 60 * SEC);
  assert.ok(!tipi(eventi).includes('piattoBruciato'));
  assert.ok(!tipi(eventi).includes('staPerBruciarsi'));
  assert.equal(postazione(serata, 'tagliere').stato, 'pronto');
  assert.equal(postazione(serata, 'tagliere').bruciaTraMs, null);
});

test('si vede che sta per bruciarsi: l’allarme parte una volta sola, negli ultimi secondi', () => {
  const serata = conTakoyakiPronto();
  const tempoAvviso = BRUCIATURA.avvisoSec * SEC;
  // Quanto manca a bruciarsi si legge dallo stato.
  const prima = postazione(serata, 'piastra').bruciaTraMs;
  assert.ok(prima > BRUCIA - 100 && prima <= BRUCIA);

  let eventi = avanza(serata, BRUCIA - tempoAvviso - 200);
  assert.ok(!tipi(eventi).includes('staPerBruciarsi'), 'allarme troppo presto');
  assert.ok(postazione(serata, 'piastra').bruciaTraMs < prima);
  eventi = avanza(serata, 400);
  const avvisi = eventi.filter((e) => e.tipo === 'staPerBruciarsi');
  assert.equal(avvisi.length, 1);
  assert.equal(avvisi[0].postazione, 'piastra');
  assert.ok(avvisi[0].traMs <= tempoAvviso && avvisi[0].traMs > 0);
  // Poi non si ripete: né mentre scende né quando si brucia.
  eventi = avanza(serata, 2 * SEC);
  assert.ok(!tipi(eventi).includes('staPerBruciarsi'));
  assert.ok(tipi(eventi).includes('piattoBruciato'));
});

test('toccato, il Piatto bruciato va nel cestino e la Postazione resta nel Fumo', () => {
  const serata = conTakoyakiBruciato();
  const eventi = serata.tocca('piastra');
  assert.deepEqual(tipi(eventi), ['nelCestino']);
  assert.equal(eventi[0].piatto, 'takoyaki');
  const p = postazione(serata, 'piastra');
  assert.equal(p.stato, 'fumo');
  assert.equal(p.fumoRestaMs, FUMO_SEC * SEC);
  assert.deepEqual(serata.stato().bancone, [], 'il Piatto bruciato non è finito sul Bancone');
  assert.equal(serata.stato().bruciati, 1);
});

test('nel Fumo la Postazione non si può usare: i tocchi non fanno niente finché il Fumo non passa', () => {
  const serata = conTakoyakiBruciato();
  serata.tocca('piastra');
  avanza(serata, 1000);
  const eventi = serata.tocca('piastra');
  assert.deepEqual(tipi(eventi), ['postazioneNelFumo']);
  assert.ok(eventi[0].restaMs > 0 && eventi[0].restaMs < FUMO_SEC * SEC);
  assert.equal(postazione(serata, 'piastra').stato, 'fumo', 'il tocco non cuoce e non libera');
  // Anche a un attimo dalla fine.
  avanza(serata, FUMO_SEC * SEC - 1000 - 100);
  assert.deepEqual(tipi(serata.tocca('piastra')), ['postazioneNelFumo']);
  assert.equal(postazione(serata, 'piastra').stato, 'fumo');
});

test('il Fumo dura FUMO_SEC secondi, poi la Postazione è libera e si può cuocere di nuovo', () => {
  const serata = conTakoyakiBruciato();
  serata.tocca('piastra');
  let eventi = avanza(serata, FUMO_SEC * SEC - 100);
  assert.ok(!tipi(eventi).includes('fumoPassato'));
  assert.ok(postazione(serata, 'piastra').fumoRestaMs > 0);
  eventi = avanza(serata, 200);
  assert.equal(tipi(eventi).filter((t) => t === 'fumoPassato').length, 1);
  assert.equal(postazione(serata, 'piastra').stato, 'libera');
  assert.equal(postazione(serata, 'piastra').fumoRestaMs, 0);
  assert.deepEqual(tipi(serata.tocca('piastra')), ['cotturaIniziata']);
  // Il Piatto nuovo riparte da zero: l'allarme e la bruciatura contano da quando è pronto.
  avanza(serata, COTTURA + 20);
  assert.equal(postazione(serata, 'piastra').stato, 'pronto');
  assert.ok(postazione(serata, 'piastra').bruciaTraMs > BRUCIA - 100);
  const dopo = avanza(serata, BRUCIA);
  assert.equal(tipi(dopo).filter((t) => t === 'staPerBruciarsi').length, 1, 'l’allarme si riarma');
  assert.equal(serata.stato().bruciati, 2);
});

test('il Fumo di una Postazione non ferma le altre: l’onigiri si fa e si prende', () => {
  const serata = conTakoyakiBruciato();
  serata.tocca('piastra');
  assert.equal(tipi(serata.tocca('riso')).includes('ingrediente'), true, 'il riso va nel Piatto');
  serata.tocca('alga');
  assert.deepEqual(tipi(serata.tocca('tagliere')), ['sulBancone']);
  assert.equal(postazione(serata, 'piastra').stato, 'fumo');
});

test('un Ordine da 2 Piatti si serve solo se sul Bancone ci sono entrambi', () => {
  const serata = tanabata();
  const posto = serata.stato().posti.findIndex((p) => p.cliente);
  serata.posti[posto].cliente.ordine = ['takoyaki', 'onigiri'];

  // Solo il takoyaki: il Cliente scuote la testa e dice cosa manca; il Bancone resta com'è.
  serata.tocca('piastra');
  avanza(serata, COTTURA + 20);
  serata.tocca('piastra');
  assert.deepEqual(serata.stato().bancone, ['takoyaki']);
  let eventi = serata.servi(posto);
  assert.deepEqual(tipi(eventi), ['scuoteTesta']);
  assert.deepEqual(eventi[0].mancano, ['onigiri']);
  assert.deepEqual(serata.stato().bancone, ['takoyaki']);
  assert.equal(serata.stato().serviti, 0);

  // Con anche l'onigiri è servito e paga tutti e due i Piatti.
  preparaOnigiri(serata);
  assert.deepEqual([...serata.stato().bancone].sort(), ['onigiri', 'takoyaki']);
  eventi = serata.servi(posto);
  assert.equal(eventi[0].tipo, 'servito');
  assert.deepEqual(eventi[0].piatti, ['takoyaki', 'onigiri']);
  assert.equal(eventi[0].prezzo, PIATTI.takoyaki.price + PIATTI.onigiri.price);
  assert.deepEqual(serata.stato().bancone, []);
});

test('due takoyaki per un Ordine: ne servono due sul Bancone, uno solo non basta', () => {
  const serata = tanabata();
  const posto = serata.stato().posti.findIndex((p) => p.cliente);
  serata.posti[posto].cliente.ordine = ['takoyaki', 'takoyaki'];
  serata.tocca('piastra');
  avanza(serata, COTTURA + 20);
  serata.tocca('piastra');
  assert.deepEqual(tipi(serata.servi(posto)), ['scuoteTesta']);
  serata.tocca('piastra');
  avanza(serata, COTTURA + 20);
  serata.tocca('piastra');
  const eventi = serata.servi(posto);
  assert.equal(eventi[0].tipo, 'servito');
  assert.equal(eventi[0].prezzo, 2 * PIATTI.takoyaki.price);
});

test('nel Tanabata gli Ordini hanno 1 o 2 Piatti, solo del menù, e a volte contengono takoyaki', () => {
  const serata = new Serata({ seed: 'ordini', ...SERATA_TANABATA });
  const lunghezze = new Set();
  const piatti = new Set();
  let conTakoyaki = 0;
  // Nessuno viene servito: i Clienti se ne vanno a Pazienza finita e ne arrivano altri.
  for (let i = 0; i < 12000; i++) {
    for (const e of serata.update(10)) {
      if (e.tipo !== 'clienteArrivato') continue;
      lunghezze.add(e.cliente.ordine.length);
      e.cliente.ordine.forEach((p) => piatti.add(p));
      if (e.cliente.ordine.includes('takoyaki')) conTakoyaki++;
    }
  }
  assert.deepEqual([...lunghezze].sort(), [1, 2]);
  assert.deepEqual([...piatti].sort(), ['onigiri', 'takoyaki']);
  assert.ok(conTakoyaki >= 5, `solo ${conTakoyaki} Ordini con il takoyaki`);
});

test('con lo stesso seme e le stesse mosse, anche con le bruciature, la Serata è sempre la stessa', () => {
  const gioca = () => {
    const serata = new Serata({ seed: 'fumo', ...SERATA_TANABATA });
    const eventi = [];
    // Un giocatore distratto: cuoce sulla piastra e poi dimentica.
    for (let i = 0; i < 12000; i++) {
      eventi.push(...serata.update(10));
      if (i % 700 === 0) eventi.push(...serata.tocca('piastra'));
    }
    return { eventi, stato: serata.stato() };
  };
  const a = gioca();
  const b = gioca();
  assert.ok(a.stato.bruciati >= 1, 'il giocatore distratto avrebbe dovuto bruciare qualcosa');
  assert.deepEqual(a, b);
});

test('l’Hanami non cambia: nessuna piastra, nessun Fumo', () => {
  const serata = new Serata({ seed: 'prova' });
  assert.deepEqual(serata.stato().postazioni.map((p) => p.id), ['tagliere']);
  assert.deepEqual(tipi(serata.tocca('piastra')), ['postazioneSconosciuta']);
  const eventi = avanza(serata, 40 * SEC);
  const nuovi = ['staPerBruciarsi', 'piattoBruciato', 'nelCestino', 'postazioneNelFumo', 'fumoPassato'];
  assert.ok(!tipi(eventi).some((t) => nuovi.includes(t)));
});

// Un giocatore che fa una mossa ogni `reazioneMs`. Serve chi può; poi prende prima il Piatto che sta
// per bruciarsi, butta quello bruciato, porta avanti l'onigiri a tocchi e comincia solo ciò che serve.
// Con `distratto` non prende mai niente dalla piastra (come chi guarda altrove): cuoce e dimentica.
function giocaTanabata(reazioneMs, seed, { distratto = false } = {}) {
  const serata = new Serata({ seed, ...SERATA_TANABATA });
  for (let t = 10; !serata.finita; t += 10) {
    serata.update(10);
    if (t % reazioneMs !== 0) continue;
    const stato = serata.stato();
    const resto = [...stato.bancone];
    const servibili = stato.posti
      .filter(({ cliente }) => cliente && cliente.ordine.every((piatto) => {
        const i = resto.indexOf(piatto);
        if (i === -1) return false;
        resto.splice(i, 1);
        return true;
      }))
      .sort((a, b) => a.cliente.cuori - b.cliente.cuori);
    if (servibili.length) {
      serata.servi(servibili[0].posto);
      continue;
    }
    if (distratto) {
      const libera = stato.postazioni.find((p) => p.stato === 'libera' && p.piatto === 'takoyaki');
      if (libera) serata.tocca(libera.id);
      continue;
    }
    const pronta = stato.postazioni
      .filter((p) => p.stato === 'pronto')
      .sort((a, b) => (a.bruciaTraMs ?? Infinity) - (b.bruciaTraMs ?? Infinity))[0];
    if (pronta && stato.bancone.length < serata.banconeCapienza) {
      serata.tocca(pronta.id);
      continue;
    }
    const bruciata = stato.postazioni.find((p) => p.stato === 'bruciato');
    if (bruciata) {
      serata.tocca(bruciata.id);
      continue;
    }
    const cominciata = stato.postazioni.find((p) => p.stato === 'inPreparazione');
    if (cominciata) {
      serata.tocca(cominciata.prossimo);
      continue;
    }
    const mancano = stato.posti.flatMap(({ cliente }) => cliente?.ordine ?? []);
    const togli = (piatto) => {
      const i = mancano.indexOf(piatto);
      if (i !== -1) mancano.splice(i, 1);
    };
    stato.bancone.forEach(togli);
    stato.postazioni.filter((p) => !['libera', 'bruciato', 'fumo'].includes(p.stato)).forEach((p) => togli(p.piatto));
    const libera = stato.postazioni.find((p) => p.stato === 'libera' && mancano.includes(p.piatto));
    if (libera) serata.tocca(libera.prossimo ?? libera.id);
  }
  return serata.stato();
}

const SEMI = ['a', 'b', 'c', 'd', 'e', 'f'];
const media = (campo, reazioneMs, opzioni) => SEMI.reduce((somma, seme) => somma + giocaTanabata(reazioneMs, seme, opzioni)[campo], 0) / SEMI.length;

test('nel Tanabata chi è più rapido incassa di più, e chi dimentica i takoyaki ne brucia e incassa meno', () => {
  const rapido = media('incasso', 300);
  const attento = media('incasso', 800);
  const lento = media('incasso', 1400);
  assert.ok(rapido >= attento && attento > lento * 1.15, `rapido ${rapido}, attento ${attento}, lento ${lento}`);
  assert.ok(media('bruciati', 800, { distratto: true }) >= 1, 'il giocatore distratto dovrebbe bruciare');
  assert.equal(media('bruciati', 800), 0, 'chi prende i Piatti in tempo non brucia niente');
});

test('il Tanabata: un giocatore lento prende ★ e uno attento almeno ★★ (valori provvisori, ticket 29)', () => {
  const stelle = (reazioneMs) => giocaTanabata(reazioneMs, 'prova').stelle;
  assert.ok(stelle(1400) >= 1, 'un giocatore lento prende almeno ★');
  assert.ok(stelle(800) >= 2, 'un giocatore attento prende almeno ★★');
});

test('il takoyaki ha il nome nelle tre lingue', () => {
  for (const lingua of ['it', 'en', 'ja']) assert.ok(TESTI[lingua].piatto_takoyaki?.trim(), `${lingua}.piatto_takoyaki manca`);
});

test('ogni Piatto in menù ha i suoi disegni: sul Bancone, come icona e (se brucia) bruciato, nella stessa misura dell’onigiri', () => {
  for (const [matsuri, serata] of Object.entries(SERATE)) {
    for (const piatto of serata.piatti) {
      for (const chiave of [piatto, `${piatto}-icona`]) {
        assert.ok(DISEGNI[chiave], `${matsuri}: manca la texture ${chiave}`);
        assert.equal(DISEGNI[chiave].w, DISEGNI[chiave.replace(piatto, 'onigiri')].w, `${chiave} ha una larghezza diversa dall'onigiri`);
        assert.equal(DISEGNI[chiave].h, DISEGNI[chiave.replace(piatto, 'onigiri')].h, `${chiave} ha un'altezza diversa dall'onigiri`);
      }
      if ((PIATTI[piatto].burnAfterSec ?? null) !== null) assert.ok(DISEGNI[`${piatto}-bruciato-icona`], `${matsuri}: manca ${piatto}-bruciato-icona`);
    }
  }
  for (const chiave of ['fumo', 'cestino']) assert.ok(DISEGNI[chiave], `manca la texture ${chiave}`);
});

test('i numeri della bruciatura sono in config.js e la scena non li scrive a mano', () => {
  assert.ok(BRUCIATURA.avvisoSec > 0 && BRUCIATURA.avvisoSec < PIATTI.takoyaki.burnAfterSec, 'l’allarme deve stare dentro il tempo per bruciarsi');
  assert.ok(FUMO_SEC > 0);
  const scena = readFileSync(new URL('../src/scenes/SerataScene.js', import.meta.url), 'utf8');
  for (const numero of ['4000', '3000', '1500', '5000']) assert.ok(!new RegExp(`\b${numero}\b`).test(scena), `${numero} scritto nella scena`);
});
