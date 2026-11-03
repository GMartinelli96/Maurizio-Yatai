import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CLIENTI, FRAME_MS, PALETTE, PIATTI, POSTAZIONI, SERATA_PRIMA, SERATA_TANABATA } from '../src/config.js';
import { DISEGNI, drawEntry } from '../src/disegni/catalogo.js';
import { SCIROPPO, drawKakigori } from '../src/disegni/kakigori.js';
import { POSTAZIONE_SIZE, scortaKey } from '../src/disegni/postazioni.js';
import { TESTI } from '../src/i18n.js';
import { Serata, costoPiatto, idPiatto, ingredientiDi, piattoBase, scorteDi, tocchiPerPiatto, varianteDi } from '../src/serata/Serata.js';

// Il kakigōri e le sue varianti (ticket 07): ghiaccio, [2 s], uno dei tre sciroppi, prendi. Tutto senza browser.

const SEC = 1000;
const MACCHINA = 2 * SEC;
const MENU = ['onigiri', 'takoyaki', 'kakigori'];
const VARIANTI = PIATTI.kakigori.varianti;

// Avanza il tempo come fa la scena, a passi da un sessantesimo di secondo. Restituisce gli eventi.
function avanza(serata, ms) {
  const eventi = [];
  for (let t = 0; t < ms - 1e-6; t += FRAME_MS) eventi.push(...serata.update(Math.min(FRAME_MS, ms - t)));
  return eventi;
}

const tipi = (eventi) => eventi.map((e) => e.tipo);
const postazione = (serata, id) => serata.stato().postazioni.find((p) => p.id === id);

// Una Serata con tutto il menu e il primo Cliente già al suo Posto, che chiede quello che vogliamo noi.
function conCliente(ordine) {
  const serata = new Serata({ seed: 'prova', piatti: MENU });
  avanza(serata, CLIENTI.primoArrivoSec * SEC + 50);
  serata.posti[0].cliente.ordine = ordine;
  return serata;
}

// Un kakigōri fino a "pronto": ghiaccio, la macinatura, lo sciroppo.
function finoAPronto(serata, sciroppo) {
  serata.tocca('ghiaccio');
  avanza(serata, MACCHINA + 50);
  serata.tocca(sciroppo);
}

test('la Ricetta del kakigōri è ghiaccio 20, [2 s], sciroppo 60: 3 tocchi, entro il tetto di 4', () => {
  const { ricetta } = PIATTI.kakigori;
  assert.equal(ricetta[0].ingrediente, 'ghiaccio');
  assert.equal(ricetta[0].costo, 20);
  assert.deepEqual(ricetta[1], { cotturaSec: 2 }, 'la macinatura è un passo della Ricetta nei dati');
  assert.equal(ricetta[2].unoDi.length, 3, 'lo sciroppo è una scelta tra tre');
  assert.equal(tocchiPerPiatto('kakigori'), 3, 'ghiaccio, sciroppo, prendi: la scelta è un tocco solo');
  for (const variante of VARIANTI) {
    assert.equal(tocchiPerPiatto(idPiatto('kakigori', variante)), 3);
    assert.ok(tocchiPerPiatto(idPiatto('kakigori', variante)) <= 4, 'il tetto è 4');
  }
});

test('ogni variante costa 80 Yen, circa un terzo del prezzo, e le tre voci dello sciroppo costano uguale', () => {
  for (const variante of VARIANTI) {
    const id = idPiatto('kakigori', variante);
    assert.equal(costoPiatto(id), 80, `${id}: ghiaccio 20 e sciroppo 60`);
    assert.ok(costoPiatto(id) <= PIATTI.kakigori.price / 3 + 1e-9, `${id}: circa un terzo di ${PIATTI.kakigori.price}`);
    assert.deepEqual(ingredientiDi(id).map((i) => i.ingrediente), ['ghiaccio', variante], `${id}: lo sciroppo è quello della variante`);
  }
  assert.equal(new Set(PIATTI.kakigori.ricetta[2].unoDi.map((v) => v.costo)).size, 1);
});

test('le varianti nei dati sono quelle dello sciroppo, nello stesso ordine', () => {
  assert.deepEqual(VARIANTI, PIATTI.kakigori.ricetta[2].unoDi.map((v) => v.variante));
  assert.deepEqual(VARIANTI, PIATTI.kakigori.ricetta[2].unoDi.map((v) => v.ingrediente));
  assert.deepEqual(VARIANTI, ['fragola', 'melone', 'matcha']);
});

test('l’id di un Piatto con variante si scompone: piatto e variante', () => {
  assert.equal(idPiatto('kakigori', 'melone'), 'kakigori-melone');
  assert.equal(idPiatto('onigiri'), 'onigiri');
  assert.equal(piattoBase('kakigori-melone'), 'kakigori');
  assert.equal(varianteDi('kakigori-melone'), 'melone');
  assert.equal(piattoBase('onigiri'), 'onigiri');
  assert.equal(varianteDi('onigiri'), null);
  assert.deepEqual(scorteDi('kakigori').map((s) => s.ingrediente), ['ghiaccio', 'fragola', 'melone', 'matcha']);
});

test('una Scorta per variante, niente menu: la fila ha ghiaccio, i tre sciroppi e poi la macchina', () => {
  const fila = new Serata({ seed: 'a', piatti: MENU }).stato().fila.map((f) => `${f.voce}:${f.id}`);
  assert.deepEqual(fila, [
    'scorta:riso', 'scorta:alga', 'scorta:pastella', 'scorta:polpo', 'scorta:salsa',
    'scorta:ghiaccio', 'scorta:fragola', 'scorta:melone', 'scorta:matcha',
    'postazione:tagliere', 'postazione:piastra', 'postazione:macchina',
  ]);
  assert.equal(POSTAZIONI.macchina.piatto, 'kakigori');
});

test('senza kakigōri in menù la fila non cambia: niente macchina, niente sciroppi', () => {
  for (const serata of [SERATA_PRIMA, SERATA_TANABATA]) {
    const ids = new Serata({ seed: 'a', ...serata }).stato().fila.map((f) => f.id);
    for (const id of ['ghiaccio', 'fragola', 'melone', 'matcha', 'macchina']) assert.ok(!ids.includes(id), `${id} non c'è`);
  }
});

test('il kakigōri si fa a tocchi: ghiaccio, la macinatura parte da sola, poi lo sciroppo scelto, poi si prende', () => {
  const serata = new Serata({ seed: 'prova', piatti: MENU });
  assert.deepEqual(postazione(serata, 'macchina').prossimi, ['ghiaccio']);
  assert.equal(postazione(serata, 'macchina').prossimo, 'ghiaccio');

  const ghiaccio = serata.tocca('ghiaccio');
  assert.deepEqual(tipi(ghiaccio), ['ingrediente', 'cotturaIniziata']);
  assert.equal(ghiaccio[1].durataMs, MACCHINA);
  assert.equal(serata.stato().spesa, 20);
  assert.equal(postazione(serata, 'macchina').stato, 'cuoce');
  // Durante la macinatura la scelta c'è già, evidenziata per tutte e tre.
  assert.deepEqual(postazione(serata, 'macchina').prossimi, ['fragola', 'melone', 'matcha']);
  assert.equal(postazione(serata, 'macchina').prossimo, null, 'più di una: nessuna sola da indicare');

  const fine = avanza(serata, MACCHINA + 50);
  assert.deepEqual(tipi(fine).filter((t) => t.startsWith('cottura') || t === 'piattoPronto'), ['cotturaFinita']);
  assert.equal(postazione(serata, 'macchina').stato, 'inPreparazione');

  const sciroppo = serata.tocca('melone');
  assert.deepEqual(tipi(sciroppo), ['ingrediente', 'piattoPronto']);
  assert.equal(sciroppo[0].costo, 60);
  assert.equal(sciroppo[0].variante, 'melone');
  assert.equal(sciroppo[1].piatto, 'kakigori-melone');
  assert.equal(serata.stato().spesa, 80);
  assert.equal(postazione(serata, 'macchina').variante, 'melone');
  assert.deepEqual(postazione(serata, 'macchina').prossimi, []);

  const prendi = serata.tocca('macchina');
  assert.deepEqual(tipi(prendi), ['sulBancone']);
  assert.equal(prendi[0].piatto, 'kakigori-melone');
  assert.deepEqual(serata.stato().bancone, ['kakigori-melone']);
  assert.equal(postazione(serata, 'macchina').stato, 'libera');
  assert.equal(postazione(serata, 'macchina').variante, null, 'la Postazione riparte da capo');
});

test('contando i tocchi: dal ghiaccio al Bancone sono 3, qualunque sia la variante', () => {
  for (const variante of VARIANTI) {
    const serata = new Serata({ seed: 'prova', piatti: MENU });
    let tocchi = 0;
    const tocca = (id) => { tocchi += 1; return serata.tocca(id); };
    tocca('ghiaccio');
    avanza(serata, MACCHINA + 50);
    tocca(variante);
    tocca('macchina');
    assert.equal(tocchi, 3);
    assert.deepEqual(serata.stato().bancone, [idPiatto('kakigori', variante)]);
  }
});

test('ordine sbagliato: lo sciroppo prima del ghiaccio non fa niente, non si paga e non c’è Spreco', () => {
  const serata = new Serata({ seed: 'prova', piatti: MENU });
  const eventi = serata.tocca('fragola');
  assert.deepEqual(tipi(eventi), ['ingredienteRifiutato']);
  assert.equal(eventi[0].motivo, 'ordine');
  const stato = serata.stato();
  assert.equal(stato.spesa, 0);
  assert.equal(stato.spreco, 0);
  assert.equal(postazione(serata, 'macchina').stato, 'libera');
  assert.equal(postazione(serata, 'macchina').variante, null);
});

test('durante la macinatura nessuna Scorta fa niente, nemmeno lo sciroppo, e il ghiaccio di nuovo non si paga', () => {
  const serata = new Serata({ seed: 'prova', piatti: MENU });
  serata.tocca('ghiaccio');
  for (const id of [...VARIANTI, 'ghiaccio']) {
    const eventi = serata.tocca(id);
    assert.deepEqual(tipi(eventi), ['ingredienteRifiutato'], id);
    assert.equal(eventi[0].motivo, 'cuoce', id);
  }
  assert.deepEqual(tipi(serata.tocca('macchina')), ['nienteDaPrendere']);
  assert.equal(serata.stato().spesa, 20);
});

test('scelto lo sciroppo, le altre due Scorte e la prima non fanno niente: la scelta è già fatta', () => {
  const serata = new Serata({ seed: 'prova', piatti: MENU });
  finoAPronto(serata, 'matcha');
  const spesa = serata.stato().spesa;
  for (const id of ['fragola', 'melone', 'matcha', 'ghiaccio']) {
    const eventi = serata.tocca(id);
    assert.deepEqual(tipi(eventi), ['ingredienteRifiutato'], id);
    assert.equal(eventi[0].motivo, 'occupato', id);
  }
  assert.equal(serata.stato().spesa, spesa);
  assert.equal(postazione(serata, 'macchina').variante, 'matcha', 'la scelta non cambia');
  assert.deepEqual(tipi(serata.tocca('macchina')), ['sulBancone']);
  assert.deepEqual(serata.stato().bancone, ['kakigori-matcha']);
});

test('il kakigōri non si brucia mai: pronto sulla macchina resta lì, dopo qualunque attesa', () => {
  const serata = new Serata({ seed: 'prova', piatti: MENU });
  finoAPronto(serata, 'fragola');
  const eventi = avanza(serata, 60 * SEC);
  assert.ok(!tipi(eventi).includes('piattoBruciato'));
  assert.ok(!tipi(eventi).includes('staPerBruciarsi'));
  assert.equal(postazione(serata, 'macchina').stato, 'pronto');
  assert.equal(postazione(serata, 'macchina').bruciaTraMs, null);
});

test('variante sbagliata: il Cliente che chiede la fragola e ha il melone sul Bancone scuote la testa', () => {
  const serata = conCliente(['kakigori-fragola']);
  finoAPronto(serata, 'melone');
  serata.tocca('macchina');
  assert.deepEqual(serata.stato().bancone, ['kakigori-melone']);

  const eventi = serata.servi(0);
  assert.deepEqual(tipi(eventi), ['scuoteTesta']);
  assert.deepEqual(eventi[0].mancano, ['kakigori-fragola']);
  const stato = serata.stato();
  assert.equal(stato.serviti, 0);
  assert.equal(stato.vendite, 0);
  assert.deepEqual(stato.bancone, ['kakigori-melone'], 'il Piatto sbagliato resta sul Bancone');
  assert.ok(stato.posti[0].cliente, 'il Cliente aspetta ancora');
});

test('variante giusta: si serve, paga il prezzo più la Mancia, e lo Spreco è zero', () => {
  const serata = conCliente(['kakigori-fragola']);
  finoAPronto(serata, 'fragola');
  serata.tocca('macchina');
  const eventi = serata.servi(0);
  assert.deepEqual(tipi(eventi).slice(0, 1), ['servito']);
  assert.deepEqual(eventi[0].piatti, ['kakigori-fragola']);
  assert.equal(eventi[0].prezzo, PIATTI.kakigori.price);
  const stato = serata.stato();
  assert.equal(stato.vendite, PIATTI.kakigori.price + eventi[0].mancia);
  assert.equal(stato.spesa, 80);
  assert.equal(stato.spreco, 0);
  assert.deepEqual(stato.bancone, []);
});

test('un kakigōri fatto e non servito è Spreco: i suoi 80 Yen non si rimborsano', () => {
  const serata = new Serata({ seed: 'prova', piatti: MENU });
  finoAPronto(serata, 'melone');
  serata.tocca('macchina');
  const stato = serata.stato();
  assert.equal(stato.spesa, 80);
  assert.equal(stato.spreco, 80);
  assert.equal(stato.incasso, -80);
});

test('un Ordine misto serve solo con tutte le varianti giuste sul Bancone', () => {
  const serata = conCliente(['kakigori-fragola', 'kakigori-fragola']);
  const fai = (sciroppo) => { finoAPronto(serata, sciroppo); serata.tocca('macchina'); };
  fai('fragola');
  fai('melone');
  assert.deepEqual(tipi(serata.servi(0)), ['scuoteTesta']);
  fai('fragola');
  const eventi = serata.servi(0);
  assert.equal(eventi[0].tipo, 'servito');
  assert.deepEqual(serata.stato().bancone, ['kakigori-melone'], 'il melone resta, le due fragole sono andate');
});

test('i Clienti chiedono ogni variante: negli Ordini c’è il Piatto con la sua variante, mai kakigori senza', () => {
  const visti = new Set();
  for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
    const serata = new Serata({ seed, piatti: MENU, piattiPerOrdine: { min: 1, max: 3 } });
    for (let i = 0; i < 120; i += 1) {
      avanza(serata, 1000);
      for (const posto of serata.stato().posti) for (const piatto of posto.cliente?.ordine ?? []) visti.add(piatto);
    }
  }
  for (const variante of VARIANTI) assert.ok(visti.has(idPiatto('kakigori', variante)), `nessuno ha chiesto ${variante}`);
  assert.ok(!visti.has('kakigori'), 'un Ordine senza variante non si potrebbe servire');
  assert.ok(visti.has('onigiri') && visti.has('takoyaki'));
});

test('le Serate senza varianti hanno solo Piatti semplici e sono ripetibili', () => {
  // Il generatore si usa per la variante solo se il Piatto ne ha. Che l'Hanami e il Tanabata siano identici a prima
  // dell'arrivo del kakigōri è stato confrontato a mano (stesso seme, Ordini, arrivi e risultato): qui resta la
  // ripetibilità e l'assenza di varianti.
  const ordini = (opzioni) => {
    const serata = new Serata({ seed: 'g', ...opzioni });
    const visti = [];
    for (let i = 0; i < 60; i += 1) {
      avanza(serata, 1000);
      for (const posto of serata.stato().posti) if (posto.cliente && !visti.some((v) => v.id === posto.cliente.id)) visti.push({ id: posto.cliente.id, ordine: posto.cliente.ordine });
    }
    return visti;
  };
  const tanabata = ordini(SERATA_TANABATA);
  assert.ok(tanabata.length > 5);
  for (const { ordine } of tanabata) for (const piatto of ordine) assert.ok(['onigiri', 'takoyaki'].includes(piatto), piatto);
  assert.deepEqual(ordini(SERATA_TANABATA), tanabata, 'ripetibile');
});

// --- I disegni (passo 2) ---

// Un finto canvas che registra ogni chiamata (come in clienti.test.js): due disegni sono uguali se le registrazioni lo sono.
function registra(key) {
  const log = [];
  const ctx = new Proxy({}, {
    get(target, prop) {
      if (prop in target) return target[prop];
      return (...args) => { log.push([prop, ...args]); };
    },
    set(target, prop, value) { target[prop] = value; log.push(['=', prop, value]); return true; },
  });
  drawEntry(ctx, key, DISEGNI[key]);
  return JSON.stringify(log);
}

// La luminosità percepita di un colore '#rrggbb', da 0 (nero) a 255 (bianco): quella che resta in bianco e nero.
const luminosita = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b;
};

test('ogni variante ha il Piatto per il Bancone e per l’icona, alla misura dell’onigiri', () => {
  for (const variante of VARIANTI) {
    for (const chiave of [`kakigori-${variante}`, `kakigori-${variante}-icona`]) {
      assert.ok(DISEGNI[chiave], `manca la texture ${chiave}`);
    }
    assert.deepEqual([DISEGNI[`kakigori-${variante}`].w, DISEGNI[`kakigori-${variante}`].h], [DISEGNI.onigiri.w, DISEGNI.onigiri.h]);
    assert.deepEqual([DISEGNI[`kakigori-${variante}-icona`].w, DISEGNI[`kakigori-${variante}-icona`].h], [DISEGNI['onigiri-icona'].w, DISEGNI['onigiri-icona'].h]);
  }
  assert.throws(() => drawKakigori({}, {}, 64, 'cioccolato'), /variante sconosciuta/);
});

test('il ghiaccio e i tre sciroppi hanno la loro Scorta disegnata, nella misura delle Postazioni', () => {
  for (const ingrediente of ['ghiaccio', ...VARIANTI]) {
    const entry = DISEGNI[scortaKey(ingrediente)];
    assert.ok(entry, `manca la Scorta ${ingrediente}`);
    assert.deepEqual([entry.w, entry.h], [POSTAZIONE_SIZE.w, POSTAZIONE_SIZE.h]);
  }
});

test('i tre Piatti e le tre Scorte sono disegni diversi tra loro', () => {
  const piatti = VARIANTI.map((v) => registra(`kakigori-${v}-icona`));
  assert.equal(new Set(piatti).size, 3, 'due icone uguali');
  const scorte = ['ghiaccio', ...VARIANTI].map((i) => registra(scortaKey(i)));
  assert.equal(new Set(scorte).size, 4, 'due Scorte uguali');
});

test('in bianco e nero gli sciroppi restano diversi: almeno 40 punti di luminosità l’uno dall’altro', () => {
  const luci = VARIANTI.map((v) => ({ v, l: luminosita(SCIROPPO[v].colore) }));
  for (let i = 0; i < luci.length; i += 1) {
    for (let j = i + 1; j < luci.length; j += 1) {
      assert.ok(Math.abs(luci[i].l - luci[j].l) >= 40, `${luci[i].v} (${luci[i].l.toFixed(0)}) e ${luci[j].v} (${luci[j].l.toFixed(0)}) si somigliano in bianco e nero`);
    }
  }
  assert.equal(SCIROPPO.fragola, PALETTE.fragola);
});

test('il ghiaccio, gli sciroppi e le tre varianti hanno il nome in italiano, inglese e giapponese', () => {
  const chiavi = [
    ...['ghiaccio', ...VARIANTI].map((i) => `ingrediente_${i}`),
    ...VARIANTI.map((v) => `piatto_${idPiatto('kakigori', v)}`),
  ];
  for (const lingua of Object.keys(TESTI)) {
    for (const chiave of chiavi) assert.ok(TESTI[lingua][chiave]?.trim(), `${lingua}: manca ${chiave}`);
  }
  assert.equal(new Set(VARIANTI.map((v) => TESTI.it[`ingrediente_${v}`])).size, 3);
});

test('l’icona del passo a scelta (le tre gocce) ha la misura delle Scorte e un disegno suo', () => {
  const entry = DISEGNI['passo-sciroppo'];
  assert.ok(entry, 'manca la texture passo-sciroppo');
  assert.deepEqual([entry.w, entry.h], [POSTAZIONE_SIZE.w, POSTAZIONE_SIZE.h]);
  const altri = ['ghiaccio', ...VARIANTI].map((i) => registra(scortaKey(i)));
  assert.ok(!altri.includes(registra('passo-sciroppo')), 'uguale a una Scorta');
});
