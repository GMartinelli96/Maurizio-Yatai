import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BRUCIATURA, CLIENTI, FRAME_MS, FUMO_SEC, PIATTI, POSTAZIONI, SERATA_AKI, SERATA_HANABI, SERATA_YUKI, SERATE } from '../src/config.js';
import { BRAVURA, giocaServata } from './bot.js';
import { Serata, costoPiatto, idPiatto, ingredientiDi, scorteDi, tocchiPerPiatto } from '../src/serata/Serata.js';

// Taiyaki e ramen (ticket 08): gli ultimi due Piatti, con varianti e bruciatura. Tutto senza browser.
//   taiyaki  impasto, ripieno (fagioli o crema), [8 s], prendi: 3 tocchi
//   ramen    noodles, brodo, [6 s], uovo o naruto, prendi: 4 tocchi

const SEC = 1000;
const MENU = SERATA_YUKI.piatti;
const TAIYAKI = 8 * SEC;
const RAMEN = 6 * SEC;

function avanza(serata, ms) {
  const eventi = [];
  for (let t = 0; t < ms - 1e-6; t += FRAME_MS) eventi.push(...serata.update(Math.min(FRAME_MS, ms - t)));
  return eventi;
}

const tipi = (eventi) => eventi.map((e) => e.tipo);
const postazione = (serata, id) => serata.stato().postazioni.find((p) => p.id === id);
const nuova = () => new Serata({ seed: 'prova', ...SERATA_YUKI });

// Una Serata con tutto il menu e il primo Cliente già al suo Posto, che chiede quello che vogliamo noi. Ha una Pazienza
// lunga: questi test cucinano più Piatti uno dopo l'altro e non provano la Pazienza.
function conCliente(ordine) {
  const serata = nuova();
  avanza(serata, CLIENTI.primoArrivoSec * SEC + 50);
  const cliente = serata.posti[0].cliente;
  cliente.ordine = ordine;
  cliente.pazienzaMs = cliente.pazienzaTotaleMs = 100 * SEC;
  return serata;
}

// Un taiyaki fino a "pronto": impasto, ripieno, la cottura.
function taiyakiPronto(serata, ripieno) {
  serata.tocca('impasto');
  serata.tocca(ripieno);
  avanza(serata, TAIYAKI + 50);
}

// Un ramen fino a "pronto": noodles, brodo, la cottura, uovo o naruto.
function ramenPronto(serata, guarnizione) {
  serata.tocca('noodles');
  serata.tocca('brodo');
  avanza(serata, RAMEN + 50);
  serata.tocca(guarnizione);
}

test('la Ricetta del taiyaki è impasto 30, ripieno 40, [8 s]: 3 tocchi, 70 Yen su 200', () => {
  const { ricetta } = PIATTI.taiyaki;
  assert.equal(ricetta[0].ingrediente, 'impasto');
  assert.equal(ricetta[0].costo, 30);
  assert.deepEqual(ricetta[1].unoDi.map((v) => [v.ingrediente, v.costo, v.variante]), [['fagioli', 40, 'fagioli'], ['crema', 40, 'crema']]);
  assert.deepEqual(ricetta[2], { cotturaSec: 8 }, 'la cottura è un passo della Ricetta nei dati');
  assert.equal(PIATTI.taiyaki.burnAfterSec, 4);
  assert.equal(tocchiPerPiatto('taiyaki'), 3, 'impasto, ripieno, prendi: scegliere il ripieno è un tocco solo');
  for (const variante of PIATTI.taiyaki.varianti) {
    const id = idPiatto('taiyaki', variante);
    assert.equal(tocchiPerPiatto(id), 3);
    assert.equal(costoPiatto(id), 70, `${id}: impasto 30 e ripieno 40`);
    assert.deepEqual(ingredientiDi(id).map((i) => i.ingrediente), ['impasto', variante], `${id}: il ripieno è quello della variante`);
  }
});

test('la Ricetta del ramen è noodles 70, brodo 80, [6 s], uovo o naruto 50: 4 tocchi, 200 Yen su 600', () => {
  const { ricetta } = PIATTI.ramen;
  assert.deepEqual(ricetta.slice(0, 3).map((p) => p.ingrediente ?? p.cotturaSec), ['noodles', 'brodo', 6]);
  assert.deepEqual([ricetta[0].costo, ricetta[1].costo], [70, 80]);
  assert.deepEqual(ricetta[2], { cotturaSec: 6 });
  assert.deepEqual(ricetta[3].unoDi.map((v) => [v.ingrediente, v.costo, v.variante]), [['uovo', 50, 'uovo'], ['naruto', 50, 'naruto']],
    'uovo e naruto vengono dopo la cottura, come la salsa del takoyaki');
  assert.equal(PIATTI.ramen.burnAfterSec, 5);
  assert.equal(tocchiPerPiatto('ramen'), 4, 'noodles, brodo, uovo o naruto, prendi: al tetto');
  for (const variante of PIATTI.ramen.varianti) {
    const id = idPiatto('ramen', variante);
    assert.equal(tocchiPerPiatto(id), 4);
    assert.equal(costoPiatto(id), 200, `${id}: noodles 70, brodo 80, ${variante} 50`);
    assert.deepEqual(ingredientiDi(id).map((i) => i.ingrediente), ['noodles', 'brodo', variante]);
  }
});

test('il tetto è 4 tocchi per ogni Piatto e ogni variante, e il costo è circa un terzo del prezzo', () => {
  for (const [piatto, { price, varianti }] of Object.entries(PIATTI)) {
    for (const id of varianti.length ? varianti.map((v) => idPiatto(piatto, v)) : [piatto]) {
      assert.ok(tocchiPerPiatto(id) <= 4, `${id}: ${tocchiPerPiatto(id)} tocchi`);
      const quota = costoPiatto(id) / price;
      assert.ok(quota >= 0.3 && quota <= 0.36, `${id}: costa ${Math.round(quota * 100)}% del prezzo`);
    }
  }
});

test('i Piatti con varianti hanno una voce per variante, uguali nel costo e con l’Ingrediente che si chiama come la variante', () => {
  for (const piatto of ['taiyaki', 'ramen']) {
    const scelta = PIATTI[piatto].ricetta.find((passo) => passo.unoDi).unoDi;
    assert.deepEqual(scelta.map((v) => v.variante), PIATTI[piatto].varianti);
    assert.deepEqual(scelta.map((v) => v.ingrediente), PIATTI[piatto].varianti);
    assert.equal(new Set(scelta.map((v) => v.costo)).size, 1, `${piatto}: le voci di una scelta costano uguale`);
  }
});

test('ogni Scorta ha un id solo in tutte le ricette: la pastella del takoyaki e l’impasto del taiyaki sono due Scorte', () => {
  const ids = Object.keys(PIATTI).flatMap((piatto) => scorteDi(piatto).map((s) => s.ingrediente));
  assert.equal(ids.length, new Set(ids).size, `id doppi: ${ids.filter((id, i) => ids.indexOf(id) !== i)}`);
  assert.equal(ids.length, 16);
  assert.ok(ids.includes('pastella') && ids.includes('impasto'));
  const stato = nuova().stato();
  assert.equal(stato.scorte.length, 16);
  assert.equal(new Set(stato.scorte.map((s) => s.id)).size, 16, 'nessuna Scorta si confonde con un’altra');
  assert.equal(stato.scorte.find((s) => s.id === 'pastella').piatto, 'takoyaki');
  assert.equal(stato.scorte.find((s) => s.id === 'impasto').piatto, 'taiyaki');
});

test('una Serata con tutti e 5 i Piatti ha 5 Postazioni e 16 Scorte, nell’ordine in cui si sbloccano i Piatti', () => {
  assert.deepEqual(MENU, Object.keys(PIATTI));
  assert.equal(POSTAZIONI.stampo.piatto, 'taiyaki');
  assert.equal(POSTAZIONI.pentola.piatto, 'ramen');
  assert.deepEqual(nuova().stato().fila.map((f) => `${f.voce}:${f.id}`), [
    'scorta:riso', 'scorta:alga',
    'scorta:pastella', 'scorta:polpo', 'scorta:salsa',
    'scorta:ghiaccio', 'scorta:fragola', 'scorta:melone', 'scorta:matcha',
    'scorta:impasto', 'scorta:fagioli', 'scorta:crema',
    'scorta:noodles', 'scorta:brodo', 'scorta:uovo', 'scorta:naruto',
    'postazione:tagliere', 'postazione:piastra', 'postazione:macchina', 'postazione:stampo', 'postazione:pentola',
  ]);
});

test('senza taiyaki e ramen in menù la fila non cambia: niente stampo, pentola, impasto, noodles', () => {
  const ids = new Serata({ seed: 'a', ...SERATA_HANABI }).stato().fila.map((f) => f.id);
  for (const id of ['impasto', 'fagioli', 'crema', 'noodles', 'brodo', 'uovo', 'naruto', 'stampo', 'pentola']) assert.ok(!ids.includes(id), `${id} non c'è`);
  assert.equal(ids.length, 12);
  assert.equal(new Serata({ seed: 'a', ...SERATA_AKI }).stato().fila.length, 12 + 3 + 1, 'l’Aki ha il taiyaki: tre Scorte e lo stampo');
});

test('il taiyaki si fa a tocchi: impasto, il ripieno scelto, la cottura parte da sola, poi si prende', () => {
  const serata = nuova();
  assert.deepEqual(postazione(serata, 'stampo').prossimi, ['impasto']);

  assert.deepEqual(tipi(serata.tocca('impasto')), ['ingrediente']);
  assert.equal(postazione(serata, 'stampo').stato, 'inPreparazione');
  assert.deepEqual(postazione(serata, 'stampo').prossimi, ['fagioli', 'crema'], 'dopo l’impasto la scelta c’è, per tutte e due');
  assert.equal(postazione(serata, 'stampo').prossimo, null);

  const ripieno = serata.tocca('crema');
  assert.deepEqual(tipi(ripieno), ['ingrediente', 'cotturaIniziata']);
  assert.equal(ripieno[0].variante, 'crema');
  assert.equal(ripieno[0].costo, 40);
  assert.equal(ripieno[1].durataMs, TAIYAKI);
  assert.equal(postazione(serata, 'stampo').stato, 'cuoce');
  assert.equal(postazione(serata, 'stampo').variante, 'crema');
  assert.deepEqual(postazione(serata, 'stampo').prossimi, [], 'finita la cottura il Piatto è pronto: niente altro da aggiungere');

  const prima = avanza(serata, TAIYAKI - 500);
  assert.ok(!tipi(prima).includes('piattoPronto'), 'dopo 7,5 s cuoce ancora');
  const fine = avanza(serata, 600);
  assert.deepEqual(tipi(fine).filter((t) => t === 'cotturaFinita' || t === 'piattoPronto'), ['cotturaFinita', 'piattoPronto']);
  assert.equal(fine.find((e) => e.tipo === 'piattoPronto').piatto, 'taiyaki-crema');
  assert.equal(serata.stato().spesa, 70);

  const prendi = serata.tocca('stampo');
  assert.deepEqual(prendi.map((e) => [e.tipo, e.piatto]), [['sulBancone', 'taiyaki-crema']]);
  assert.deepEqual(serata.stato().bancone, ['taiyaki-crema']);
  assert.equal(postazione(serata, 'stampo').stato, 'libera');
  assert.equal(postazione(serata, 'stampo').variante, null);
});

test('il ramen si fa a tocchi: noodles, brodo, la cottura parte da sola, poi uovo o naruto, poi si prende', () => {
  const serata = nuova();
  assert.deepEqual(postazione(serata, 'pentola').prossimi, ['noodles']);
  assert.deepEqual(tipi(serata.tocca('noodles')), ['ingrediente']);
  assert.deepEqual(postazione(serata, 'pentola').prossimi, ['brodo']);

  const brodo = serata.tocca('brodo');
  assert.deepEqual(tipi(brodo), ['ingrediente', 'cotturaIniziata']);
  assert.equal(brodo[1].durataMs, RAMEN);
  assert.equal(postazione(serata, 'pentola').stato, 'cuoce');
  // Durante la cottura la scelta c'è già, evidenziata per tutte e due, ma non si può ancora toccare.
  assert.deepEqual(postazione(serata, 'pentola').prossimi, ['uovo', 'naruto']);
  assert.deepEqual(serata.tocca('uovo').map((e) => [e.tipo, e.motivo]), [['ingredienteRifiutato', 'cuoce']]);
  assert.equal(serata.stato().spesa, 150, 'il tocco rifiutato non costa');

  avanza(serata, RAMEN + 50);
  assert.equal(postazione(serata, 'pentola').stato, 'inPreparazione');
  const naruto = serata.tocca('naruto');
  assert.deepEqual(tipi(naruto), ['ingrediente', 'piattoPronto']);
  assert.equal(naruto[0].variante, 'naruto');
  assert.equal(naruto[1].piatto, 'ramen-naruto');
  assert.equal(serata.stato().spesa, 200);
  assert.deepEqual(serata.tocca('pentola').map((e) => [e.tipo, e.piatto]), [['sulBancone', 'ramen-naruto']]);
});

test('contando i tocchi: dall’impasto al Bancone sono 3 e dai noodles al Bancone sono 4, qualunque sia la variante', () => {
  for (const ripieno of PIATTI.taiyaki.varianti) {
    const serata = nuova();
    let tocchi = 0;
    const tocca = (id) => { tocchi++; return serata.tocca(id); };
    tocca('impasto');
    tocca(ripieno);
    avanza(serata, TAIYAKI + 50);
    tocca('stampo');
    assert.equal(tocchi, 3, `taiyaki-${ripieno}`);
    assert.deepEqual(serata.stato().bancone, [`taiyaki-${ripieno}`]);
  }
  for (const guarnizione of PIATTI.ramen.varianti) {
    const serata = nuova();
    let tocchi = 0;
    const tocca = (id) => { tocchi++; return serata.tocca(id); };
    tocca('noodles');
    tocca('brodo');
    avanza(serata, RAMEN + 50);
    tocca(guarnizione);
    tocca('pentola');
    assert.equal(tocchi, 4, `ramen-${guarnizione}`);
    assert.deepEqual(serata.stato().bancone, [`ramen-${guarnizione}`]);
  }
});

test('ordine sbagliato: non succede niente, non si paga e non c’è Spreco', () => {
  const serata = nuova();
  for (const id of ['fagioli', 'crema', 'brodo', 'uovo', 'naruto']) {
    assert.deepEqual(tipi(serata.tocca(id)), ['ingredienteRifiutato'], `${id} per primo`);
  }
  assert.equal(serata.stato().spesa, 0);
  assert.equal(serata.stato().spreco, 0);
  for (const id of ['stampo', 'pentola']) assert.deepEqual(tipi(serata.tocca(id)), ['nienteDaPrendere']);
  serata.tocca('noodles');
  assert.deepEqual(tipi(serata.tocca('noodles')), ['ingredienteRifiutato'], 'i noodles due volte: la seconda non fa niente');
  assert.deepEqual(tipi(serata.tocca('uovo')), ['ingredienteRifiutato'], 'l’uovo prima del brodo');
  assert.equal(serata.stato().spesa, 70);
});

test('la pastella è del takoyaki e l’impasto del taiyaki: ognuna serve solo la sua Postazione, anche con tutte e due libere', () => {
  const serata = nuova();
  const eventi = serata.tocca('pastella');
  assert.equal(eventi[0].postazione, 'piastra');
  assert.equal(postazione(serata, 'piastra').stato, 'inPreparazione');
  assert.equal(postazione(serata, 'stampo').stato, 'libera', 'la pastella non comincia nessun taiyaki');
  assert.equal(serata.tocca('impasto')[0].postazione, 'stampo');
  assert.equal(postazione(serata, 'piastra').fatti, 1, 'l’impasto non è finito nella piastra');
  assert.equal(postazione(serata, 'stampo').fatti, 1);
  assert.deepEqual(postazione(serata, 'piastra').prossimi, ['polpo']);
  assert.deepEqual(postazione(serata, 'stampo').prossimi, ['fagioli', 'crema']);
});

test('scelto il ripieno o la guarnizione, le altre Scorte non fanno niente: la scelta è già fatta', () => {
  const serata = nuova();
  serata.tocca('impasto');
  serata.tocca('fagioli');
  for (const id of ['crema', 'fagioli', 'impasto']) assert.deepEqual(tipi(serata.tocca(id)), ['ingredienteRifiutato'], id);
  assert.equal(postazione(serata, 'stampo').variante, 'fagioli');
  assert.equal(serata.stato().spesa, 70);

  const ramen = nuova();
  ramen.tocca('noodles');
  ramen.tocca('brodo');
  avanza(ramen, RAMEN + 50);
  ramen.tocca('uovo');
  for (const id of ['naruto', 'uovo', 'brodo']) assert.deepEqual(tipi(ramen.tocca(id)), ['ingredienteRifiutato'], id);
  assert.equal(postazione(ramen, 'pentola').variante, 'uovo');
  assert.equal(ramen.stato().spesa, 200);
});

test('il taiyaki pronto si brucia dopo 4 s, con l’allarme prima, e lascia il Fumo; i suoi 70 Yen sono Spreco', () => {
  const serata = nuova();
  taiyakiPronto(serata, 'fagioli');
  const pronto = postazione(serata, 'stampo');
  assert.equal(pronto.stato, 'pronto');
  assert.ok(pronto.bruciaTraMs <= 4 * SEC && pronto.bruciaTraMs > 3.8 * SEC, 'pronto da poco: mancano circa 4 s');

  const eventi = avanza(serata, (4 - BRUCIATURA.avvisoSec) * SEC);
  assert.ok(tipi(eventi).includes('staPerBruciarsi'), 'l’allarme negli ultimi secondi');
  assert.equal(postazione(serata, 'stampo').stato, 'pronto', 'ancora non è bruciato');
  const dopo = avanza(serata, BRUCIATURA.avvisoSec * SEC + 100);
  assert.ok(tipi(dopo).includes('piattoBruciato'));
  assert.equal(postazione(serata, 'stampo').stato, 'bruciato');
  assert.equal(serata.stato().bruciati, 1);

  assert.deepEqual(tipi(serata.tocca('stampo')), ['nelCestino']);
  assert.equal(postazione(serata, 'stampo').stato, 'fumo');
  assert.deepEqual(tipi(serata.tocca('stampo')), ['postazioneNelFumo'], 'nel Fumo la Postazione non si usa');
  assert.deepEqual(tipi(serata.tocca('impasto')), ['ingredienteRifiutato'], 'e non si comincia un altro taiyaki');
  const passato = avanza(serata, FUMO_SEC * SEC + 100);
  assert.ok(tipi(passato).includes('fumoPassato'));
  assert.equal(postazione(serata, 'stampo').stato, 'libera');

  const stato = serata.stato();
  assert.equal(stato.spesa, 70);
  assert.equal(stato.spreco, 70, 'impasto 30 e ripieno 40, mai finiti in un Piatto servito');
  assert.equal(stato.vendite, 0);
  assert.equal(stato.incasso, -70);
});

test('il ramen pronto si brucia dopo 5 s, non prima, e lascia il Fumo; i suoi 200 Yen sono Spreco', () => {
  const serata = nuova();
  ramenPronto(serata, 'uovo');
  const quattro = avanza(serata, 4.7 * SEC);
  assert.equal(postazione(serata, 'pentola').stato, 'pronto', 'dopo circa 4,7 s non è ancora bruciato');
  assert.ok(!tipi(quattro).includes('piattoBruciato'));
  const dopo = avanza(serata, 0.6 * SEC);
  assert.ok(tipi(dopo).includes('piattoBruciato'));
  assert.deepEqual(tipi(serata.tocca('pentola')), ['nelCestino']);
  assert.equal(postazione(serata, 'pentola').stato, 'fumo');
  avanza(serata, FUMO_SEC * SEC + 100);
  assert.equal(postazione(serata, 'pentola').stato, 'libera');
  assert.equal(serata.stato().spreco, 200);
  assert.equal(serata.stato().incasso, -200);
});

test('preso in tempo il taiyaki non si brucia, e se resta sul Bancone non brucia mai (si brucia solo sulla Postazione)', () => {
  const serata = nuova();
  taiyakiPronto(serata, 'crema');
  avanza(serata, 3 * SEC);
  serata.tocca('stampo');
  avanza(serata, 30 * SEC);
  assert.equal(serata.stato().bruciati, 0);
  assert.deepEqual(serata.stato().bancone, ['taiyaki-crema']);
});

test('variante sbagliata: chi chiede il ramen con l’uovo e ha il ramen con il naruto sul Bancone scuote la testa', () => {
  const serata = conCliente(['ramen-uovo']);
  ramenPronto(serata, 'naruto');
  serata.tocca('pentola');
  const eventi = serata.servi(0);
  assert.deepEqual(tipi(eventi), ['scuoteTesta']);
  assert.deepEqual(eventi[0].mancano, ['ramen-uovo']);
  assert.equal(serata.stato().serviti, 0);
  assert.deepEqual(serata.stato().bancone, ['ramen-naruto'], 'il Piatto resta sul Bancone');
});

test('un Ordine misto da tre Piatti si serve solo con tutto sul Bancone, e vale la somma dei prezzi', () => {
  const ordine = ['ramen-uovo', 'taiyaki-crema', 'kakigori-melone'];
  const serata = conCliente(ordine);

  ramenPronto(serata, 'uovo');
  serata.tocca('pentola');
  assert.deepEqual(tipi(serata.servi(0)), ['scuoteTesta'], 'manca il taiyaki e il kakigōri');
  taiyakiPronto(serata, 'crema');
  serata.tocca('stampo');
  const manca = serata.servi(0);
  assert.deepEqual(manca[0].mancano, ['kakigori-melone'], 'ora manca solo il kakigōri');
  serata.tocca('ghiaccio');
  avanza(serata, 2 * SEC + 50);
  serata.tocca('melone');
  serata.tocca('macchina');
  assert.equal(serata.stato().bancone.length, 3);

  const eventi = serata.servi(0);
  assert.deepEqual(tipi(eventi).slice(0, 1), ['servito']);
  assert.equal(eventi[0].prezzo, 600 + 200 + 250);
  assert.deepEqual(serata.stato().bancone, []);
  const stato = serata.stato();
  assert.equal(stato.serviti, 1);
  assert.equal(stato.spreco, 0, 'tutto è finito in un Piatto servito');
  assert.equal(stato.spesa, 200 + 70 + 80);
});

test('un Ordine con due Piatti uguali ma di variante diversa chiede tutte e due le varianti', () => {
  const serata = conCliente(['taiyaki-fagioli', 'taiyaki-crema']);
  taiyakiPronto(serata, 'fagioli');
  serata.tocca('stampo');
  taiyakiPronto(serata, 'fagioli');
  serata.tocca('stampo');
  assert.deepEqual(serata.servi(0)[0].mancano, ['taiyaki-crema'], 'due taiyaki ai fagioli non fanno uno alla crema');
  taiyakiPronto(serata, 'crema');
  serata.tocca('stampo');
  assert.equal(serata.servi(0)[0].tipo, 'servito');
  assert.deepEqual(serata.stato().bancone, ['taiyaki-fagioli'], 'il taiyaki in più resta sul Bancone');
});

test('negli Ordini c’è ogni variante, il Piatto con variante è sempre con la sua variante e gli Ordini arrivano fino a tre Piatti', () => {
  const visti = new Set();
  let massimo = 0;
  for (const seme of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
    const serata = new Serata({ seed: seme, ...SERATA_YUKI });
    for (let t = 0; t < 120 * SEC; t += 100) {
      for (const evento of serata.update(100)) {
        if (evento.tipo !== 'clienteArrivato') continue;
        massimo = Math.max(massimo, evento.cliente.ordine.length);
        evento.cliente.ordine.forEach((piatto) => visti.add(piatto));
      }
      // Nessuno serve: i Posti si svuotano solo per la Pazienza.
    }
  }
  for (const piatto of ['taiyaki-fagioli', 'taiyaki-crema', 'ramen-uovo', 'ramen-naruto', 'kakigori-fragola', 'onigiri', 'takoyaki']) {
    assert.ok(visti.has(piatto), `nessun Ordine ha chiesto ${piatto}`);
  }
  for (const nudo of ['taiyaki', 'ramen', 'kakigori']) assert.ok(!visti.has(nudo), `${nudo} senza variante in un Ordine`);
  assert.equal(massimo, 3, 'nello Yuki Matsuri gli Ordini arrivano a 3 Piatti');
});

test('le Serate di prima non chiedono mai taiyaki o ramen, e restano uguali a parità di seme', () => {
  const ordini = (config) => {
    const serata = new Serata({ seed: 'x', ...config });
    const lista = [];
    for (let t = 0; t < 60 * SEC; t += 100) for (const e of serata.update(100)) if (e.tipo === 'clienteArrivato') lista.push(e.cliente.ordine.join('+'));
    return lista;
  };
  assert.ok(ordini(SERATA_HANABI).length > 5);
  assert.ok(ordini(SERATA_HANABI).every((o) => !/taiyaki|ramen/.test(o)), 'l’Hanabi non ha taiyaki né ramen');
  assert.ok(ordini(SERATA_AKI).every((o) => !/ramen/.test(o)), 'l’Aki ha il taiyaki ma non il ramen');
});

test('il bot gioca lo Yuki Matsuri con tutti e 5 i Piatti e li serve tutti, ogni variante come chiesta', () => {
  const registro = [];
  const stato = giocaServata(SERATA_YUKI, BRAVURA.rapido, 'a', { registro });
  const serviti = registro.filter((e) => e.tipo === 'servito').flatMap((e) => e.piatti);
  for (const piatto of ['onigiri', 'takoyaki', 'kakigori-fragola', 'taiyaki-fagioli', 'taiyaki-crema', 'ramen-uovo', 'ramen-naruto']) {
    assert.ok(serviti.includes(piatto), `il bot non ha servito ${piatto}`);
  }
  assert.ok(stato.serviti >= 10, `serviti: ${stato.serviti}`);
  assert.equal(stato.incasso, stato.vendite - stato.spesa);
  assert.ok(stato.spreco >= 0 && stato.spreco <= stato.spesa);
  assert.equal(stato.scorte.length, 16);
});

test('l’Aki Matsuri e lo Yuki Matsuri hanno la loro Serata, con il taiyaki e con tutti e 5 i Piatti', () => {
  assert.equal(SERATE.aki, SERATA_AKI);
  assert.equal(SERATE.yuki, SERATA_YUKI);
  assert.deepEqual(SERATA_AKI.piatti, ['onigiri', 'takoyaki', 'kakigori', 'taiyaki']);
  assert.deepEqual(SERATA_YUKI.piatti, Object.keys(PIATTI));
  assert.equal(SERATA_YUKI.piattiPerOrdine.max, 3, 'Ordini da 3 Piatti nello Yuki (GAME_SPEC.md, tabella dei Matsuri)');
});
