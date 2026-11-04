// Playtest automatico con Playwright: avvia il gioco, esegue uno scenario, salva screenshot e stato.
//
//   npm run playtest                         scenario di base, in italiano, su un telefono 390×844
//   npm run playtest -- scenari/x.json --locale ja-JP --size 1280x720 --out playtest-output/ja
//   npm run playtest:offline                 costruisce dist/, lo carica, stacca la rete e ricarica
//   npm run playtest -- x.json --senza-storage   localStorage lancia un errore, come in una finestra privata bloccata
//
// Lo scenario è un elenco JSON di passi, eseguiti in ordine:
//   { "tap": [x, y] }      tocco in coordinate di gioco (la larghezza è VIEW.width, in src/config.js)
//   { "tapPath": "postazioni.2" }  tocco al centro (x, y) dell'elemento che lo stato di
//                          render_game_to_text indica con questo percorso: lo scenario non scrive coordinate
//   { "dragPath": "bancone.piatti.0", "to": "posti.1" }  trascina dal centro di un elemento al centro di un altro
//   { "gioca": { "finoA": 30000, "servi": "tocco" } }  gioca la Serata (vedi gioca() più sotto): sceglie le
//                          mosse leggendo solo lo stato di render_game_to_text. finoA: fino a questo
//                          tempo della Serata in ms (di norma fino alla fine). servi: come si serve,
//                          "tocco", "trascinamento" o "tasti". sbadato: true non fa niente. scaccia: true
//                          manda via i Disturbatori appena li vede (tocca la loro zona, da `disturbatori`), prima di ogni altra mossa.
//   { "key": "Digit1" }    un tasto (nomi di Playwright: Digit1, KeyQ, KeyM...)
//   { "advance": 500 }     window.advanceTime(500): il gioco avanza di 500 ms, a passi da 1/60 s
//   { "shot": "nome" }     salva nome.png e nome.json (lo stato di window.render_game_to_text)
//   { "goto": "?sviluppo" } carica di nuovo la pagina, con questo indirizzo relativo
//   { "resize": "1280x720" } cambia la misura della finestra e lascia a Phaser un passo per accorgersene
//   { "expect": "ultimoTocco.tipo", "equals": "posto" }  errore se quel valore dello stato (adesso) è diverso
//                          (anche "atLeast": 3 per un minimo, "notEquals": "x" per un valore diverso)
//   { "same": ["a", "b"], "field": "textures" }  errore se il campo è diverso nei due shot
// Gli input vengono letti al passo "advance" successivo, quindi lo schema tipico è
// tap → advance → shot.
//
// Esce con errore se la console del browser riporta errori, se gli hook non rispondono o se
// la pagina chiede un'immagine: la grafica la disegna il codice (ADR-0001).

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { createServer, preview } from 'vite';
import { VIEW } from '../src/config.js';

const { values: opt, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    locale: { type: 'string', default: 'it-IT' },
    size: { type: 'string', default: '390x844' },
    out: { type: 'string', default: 'playtest-output' },
    offline: { type: 'boolean', default: false },
    'senza-storage': { type: 'boolean', default: false },
  },
});

const DEFAULT_SCENARIO = [{ shot: 'avvio' }, { advance: 1000 }, { shot: 'dopo-1s' }];
const steps = positionals[0] ? JSON.parse(readFileSync(positionals[0], 'utf8')) : DEFAULT_SCENARIO;
const [width, height] = opt.size.split('x').map(Number);
mkdirSync(opt.out, { recursive: true });

// Il server dura una sola prova: niente rilevamento dei file né ricarica automatica, che a metà
// partita (o con un altro che modifica i sorgenti) ricaricherebbe la pagina.
const server = opt.offline
  ? await preview({ logLevel: 'warn' })
  : await (await createServer({ logLevel: 'warn', server: { watch: null, hmr: false } })).listen();
const url = server.resolvedUrls.local[0];

// Chrome installato se c'è, altrimenti il Chromium di Playwright (npx playwright install chromium).
const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
const context = await browser.newContext({ locale: opt.locale, viewport: { width, height } });
const page = await context.newPage();
if (opt['senza-storage']) {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('storage bloccato', 'SecurityError'); } });
  });
}

const errors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`${msg.text()} ${msg.location().url ?? ''}`.trim());
});
page.on('pageerror', (err) => errors.push(String(err)));

// Solo l'icona dell'app è un file: la usa il browser, non il gioco.
page.on('request', (request) => {
  const file = new URL(request.url()).pathname;
  if (request.resourceType() === 'image' && !file.endsWith('/icon.svg')) errors.push(`immagine caricata da file: ${file}`);
});

const fail = (message) => { errors.push(message); };
const readState = () => page.evaluate(() => JSON.parse(window.render_game_to_text()));
const shots = {};

// Un tocco in coordinate di gioco. Il canvas è largo sempre VIEW.width pixel di gioco, qualunque
// sia la misura della finestra, e il gioco non viene mai deformato: la scala è la stessa sui due assi.
async function tapGame(x, y) {
  const box = await page.locator('#game canvas').boundingBox();
  const scale = box.width / VIEW.width;
  await page.mouse.click(box.x + x * scale, box.y + y * scale);
}

// Il valore di un percorso come "postazioni.2.x" dentro un oggetto.
const valueAt = (object, path) => path.split('.').reduce((value, key) => value?.[key], object);

const advance = (ms) => page.evaluate((n) => window.advanceTime(n), ms);

// Un trascinamento in coordinate di gioco. Tra una fase e l'altra il gioco avanza di un passo: gli
// eventi del mouse si leggono al passo successivo, e cosi arrivano nell'ordine giusto.
async function dragGame(from, to) {
  const box = await page.locator('#game canvas').boundingBox();
  const scale = box.width / VIEW.width;
  const at = (p) => [box.x + p.x * scale, box.y + p.y * scale];
  await page.mouse.move(...at(from));
  await page.mouse.down();
  await advance(20);
  await page.mouse.move(...at({ x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }), { steps: 4 });
  await advance(20);
  await page.mouse.move(...at(to), { steps: 4 });
  await advance(20);
  await page.mouse.up();
  await advance(20);
}

// Gioca la Serata come farebbe una persona attenta, guardando solo lo stato di render_game_to_text
// (mai lo schermo): serve chi ha l'Ordine intero sul Bancone, prima chi ha meno cuoricini, e
// cucina solo i Piatti che servono davvero. Ogni mossa è un vero input del browser (tocco, tasto o
// trascinamento) e il gioco avanza di `passoMs` tra una mossa e l'altra.
async function gioca({ finoA = Infinity, servi = 'tocco', passoMs = 120, sbadato = false, scaccia = false } = {}) {
  let mosse = 0;
  let state;
  for (let giri = 0; giri < 5000; giri++) {
    state = await readState();
    const { serata } = state;
    if (serata.fase === 'finita' || serata.tempoMs >= finoA) break;
    if (!sbadato && scaccia && state.disturbatori?.length) {
      // Un Disturbatore in scena: un tocco sulla sua zona, che lo stato dà in coordinate di gioco.
      mosse++;
      await tapGame(state.disturbatori[0].x, state.disturbatori[0].y);
    } else if (!sbadato) {
      const mossa = scegliMossa(state);
      if (mossa) {
        mosse++;
        if (mossa.tipo === 'servi') {
          const posto = state.posti[mossa.posto];
          if (servi === 'tasti') await page.keyboard.press(['KeyQ', 'KeyW', 'KeyE', 'KeyR'][mossa.posto]);
          else if (servi === 'trascinamento') await dragGame(state.bancone.piatti[0], posto);
          else await tapGame(posto.x, posto.y);
        } else {
          // Un elemento della fila vicino al pollice (una Scorta o una Postazione): lo stato dice dove sta.
          const indice = state.postazioni.findIndex((p) => p.id === mossa.id);
          if (indice === -1) throw new Error(`gioca: nella fila non c'è "${mossa.id}"`);
          if (servi === 'tasti') await page.keyboard.press(`Digit${indice + 1}`);
          else await tapGame(state.postazioni[indice].x, state.postazioni[indice].y);
        }
      }
    }
    await advance(passoMs);
  }
  state = await readState();
  console.log(`gioca: ${mosse} mosse, tempo ${state.serata.tempoMs} ms, Incasso ${state.serata.incasso} (Vendite ${state.serata.vendite}, Spesa ${state.serata.spesa}, Spreco ${state.serata.spreco}), serviti ${state.serata.serviti}, persi ${state.serata.persi}, stelle ${state.serata.stelle}`);
}

// La prossima mossa, o null. Si guarda solo lo stato.
function scegliMossa({ serata, bancone: piano }) {
  const bancone = [...serata.bancone];
  const clienti = serata.posti.filter((p) => p.cliente).sort((a, b) => a.cliente.pazienzaMs - b.cliente.pazienzaMs);
  for (const { posto, cliente } of clienti) {
    const resto = [...bancone];
    if (cliente.ordine.every((piatto) => { const i = resto.indexOf(piatto); if (i === -1) return false; resto.splice(i, 1); return true; })) {
      return { tipo: 'servi', posto };
    }
  }
  // Un Piatto pronto passa sul Bancone (se c'è posto), prima quello che sta per bruciarsi.
  const pronte = serata.postazioni
    .filter((p) => p.stato === 'pronto')
    .sort((a, b) => (a.bruciaTraMs ?? Infinity) - (b.bruciaTraMs ?? Infinity));
  if (pronte.length && bancone.length < piano.piatti.length) return { tipo: 'tocca', id: pronte[0].id };
  // Un Piatto bruciato va nel cestino: poi la Postazione resta nel Fumo e non si tocca.
  const bruciata = serata.postazioni.find((p) => p.stato === 'bruciato');
  if (bruciata) return { tipo: 'tocca', id: bruciata.id };
  // Un Piatto già cominciato che aspetta un Ingrediente lo riceve: la sequenza della Ricetta (riso, alga;
  // pastella, polpo, salsa) si legge in `prossimo`, che è l'id della Scorta da toccare. Mentre un Piatto
  // cuoce ('cuoce') le Scorte non fanno niente, quindi il bot lo lascia stare e passa oltre: la cottura a metà
  // della Ricetta (il takoyaki dopo il polpo) non ha bisogno di una mossa a parte. Finita la cottura la
  // Postazione torna 'inPreparazione' e aspetta la salsa.
  // Se il passo è una scelta (lo sciroppo del kakigōri: `prossimi` ne ha più d'una) il bot sceglie la variante che
  // manca agli Ordini, dato che `prossimo` è null.
  const cominciata = serata.postazioni.find((p) => p.stato === 'inPreparazione');
  if (cominciata) return { tipo: 'tocca', id: scortaDaToccare(serata, cominciata) };
  // Si comincia solo quel che manca (vedi mancantiDi).
  const libera = serata.postazioni.find((p) => p.stato === 'libera' && mancantiDi(serata).some((chiesto) => baseDi(chiesto) === p.piatto));
  // Ogni Piatto comincia dalla sua prima Scorta (`prossimo` di una Postazione libera).
  return libera ? { tipo: 'tocca', id: libera.prossimo } : null;
}

// Un Piatto con variante si chiama `piatto-variante` (kakigori-melone): gli id non hanno altri trattini.
const baseDi = (id) => id.split('-')[0];

// I Piatti ordinati meno quelli sul Bancone e quelli già in preparazione, in cottura o pronti (un Piatto bruciato o
// nel Fumo non arriverà mai). Un Piatto di cui non si è ancora scelta la variante copre il primo Ordine della sua
// famiglia. `escludi` è una Postazione da non contare (quella di cui si sceglie la variante).
function mancantiDi(serata, escludi = null) {
  const mancanti = serata.posti.filter((p) => p.cliente).flatMap(({ cliente }) => cliente.ordine);
  const togli = (piatto) => {
    let i = mancanti.indexOf(piatto);
    if (i === -1 && !piatto.includes('-')) i = mancanti.findIndex((chiesto) => baseDi(chiesto) === piatto);
    if (i !== -1) mancanti.splice(i, 1);
  };
  serata.bancone.forEach(togli);
  for (const p of serata.postazioni) {
    if (p !== escludi && !['libera', 'bruciato', 'fumo'].includes(p.stato)) togli(p.variante ? `${p.piatto}-${p.variante}` : p.piatto);
  }
  return mancanti;
}

// La Scorta da toccare per un Piatto che aspetta un Ingrediente: l'unica, o la variante che manca agli Ordini.
function scortaDaToccare(serata, postazione) {
  if (postazione.prossimi.length <= 1) return postazione.prossimo;
  const chiesti = mancantiDi(serata, postazione);
  return postazione.prossimi.find((scorta) => chiesti.includes(`${postazione.piatto}-${scorta}`)) ?? postazione.prossimi[0];
}

// Aspetta che gli hook rispondano e che l'avvio (texture e font) sia finito.
const waitForGame = () => page.waitForFunction(
  () => typeof window.advanceTime === 'function'
    && typeof window.render_game_to_text === 'function'
    && !['avvio', null].includes(JSON.parse(window.render_game_to_text()).scene),
  null,
  { timeout: 15000 },
);

try {
  await page.goto(url);
  if (opt.offline) {
    await page.waitForFunction(() => navigator.serviceWorker?.controller, null, { timeout: 15000 });
    await context.setOffline(true);
    await page.reload();
  }

  await waitForGame();

  for (const step of steps) {
    if ('advance' in step) {
      const before = await readState();
      await page.evaluate((ms) => window.advanceTime(ms), step.advance);
      const after = await readState();
      if (!(after.timeMs > before.timeMs)) fail(`advanceTime(${step.advance}) non ha fatto avanzare il tempo`);
      console.log(`advance ${step.advance} ms: ${before.timeMs} → ${after.timeMs}`);
    } else if ('tap' in step) {
      await tapGame(step.tap[0], step.tap[1]);
      console.log(`tap ${step.tap}`);
    } else if ('tapPath' in step) {
      const target = valueAt(await readState(), step.tapPath);
      if (typeof target?.x !== 'number' || typeof target?.y !== 'number') throw new Error(`tapPath ${step.tapPath}: non è un elemento con x e y (${JSON.stringify(target)})`);
      await tapGame(target.x, target.y);
      console.log(`tapPath ${step.tapPath} → ${target.x},${target.y}`);
    } else if ('dragPath' in step) {
      const state = await readState();
      const from = valueAt(state, step.dragPath);
      const to = valueAt(state, step.to);
      for (const [nome, punto] of [[step.dragPath, from], [step.to, to]]) {
        if (typeof punto?.x !== 'number' || typeof punto?.y !== 'number') throw new Error(`dragPath ${nome}: non è un elemento con x e y (${JSON.stringify(punto)})`);
      }
      await dragGame(from, to);
      console.log(`dragPath ${step.dragPath} → ${step.to}`);
    } else if ('gioca' in step) {
      await gioca(step.gioca);
    } else if ('resize' in step) {
      const [w, h] = step.resize.split('x').map(Number);
      await page.setViewportSize({ width: w, height: h });
      // Phaser se ne accorge al passo di gioco successivo (e l'evento della finestra arriva con un poco di ritardo).
      await page.waitForTimeout(100);
      await page.evaluate(() => window.advanceTime(100));
      console.log(`resize ${step.resize}: gioco ${JSON.stringify((await readState()).gioco)}`);
    } else if ('expect' in step) {
      const actual = valueAt(await readState(), step.expect);
      if ('atLeast' in step) {
        if (!(actual >= step.atLeast)) fail(`expect ${step.expect}: ${JSON.stringify(actual)} invece di almeno ${step.atLeast}`);
        else console.log(`expect ${step.expect} = ${JSON.stringify(actual)} (almeno ${step.atLeast})`);
      } else if ('notEquals' in step) {
        if (JSON.stringify(actual) === JSON.stringify(step.notEquals)) fail(`expect ${step.expect}: è ancora ${JSON.stringify(actual)}`);
        else console.log(`expect ${step.expect} = ${JSON.stringify(actual)} (non ${JSON.stringify(step.notEquals)})`);
      } else if (JSON.stringify(actual) !== JSON.stringify(step.equals)) fail(`expect ${step.expect}: ${JSON.stringify(actual)} invece di ${JSON.stringify(step.equals)}`);
      else console.log(`expect ${step.expect} = ${JSON.stringify(actual)}`);
    } else if ('key' in step) {
      await page.keyboard.press(step.key);
      console.log(`key ${step.key}`);
    } else if ('shot' in step) {
      const state = await readState();
      shots[step.shot] = state;
      await page.screenshot({ path: join(opt.out, `${step.shot}.png`) });
      writeFileSync(join(opt.out, `${step.shot}.json`), JSON.stringify(state, null, 2));
      console.log(`shot ${step.shot}: ${JSON.stringify(state)}`);
    } else if ('goto' in step) {
      await page.goto(new URL(step.goto, url).href);
      await waitForGame();
      console.log(`goto ${step.goto}`);
    } else if ('same' in step) {
      const [a, b] = step.same.map((name) => JSON.stringify(shots[name]?.[step.field]));
      if (a === undefined || a !== b) fail(`${step.field} diverso tra ${step.same.join(' e ')}: ${a} / ${b}`);
      else console.log(`same ${step.field}: ${step.same.join(' = ')}`);
    } else {
      throw new Error(`Passo sconosciuto: ${JSON.stringify(step)}`);
    }
  }
} catch (err) {
  fail(String(err));
} finally {
  writeFileSync(join(opt.out, 'errori.json'), JSON.stringify(errors, null, 2));
  await browser.close();
  await server.close();
}

if (errors.length) {
  console.error(`\n${errors.length} errori:\n${errors.map((e) => `- ${e}`).join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`\nNessun errore. Risultati in ${opt.out}/`);
}
