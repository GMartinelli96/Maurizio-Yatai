// Playtest automatico con Playwright: avvia il gioco, esegue uno scenario, salva screenshot e stato.
//
//   npm run playtest                         scenario di base, in italiano, su un telefono 390×844
//   npm run playtest -- scenari/x.json --locale ja-JP --size 1280x720 --out playtest-output/ja
//   npm run playtest:offline                 costruisce dist/, lo carica, stacca la rete e ricarica
//
// Lo scenario è un elenco JSON di passi, eseguiti in ordine:
//   { "tap": [x, y] }      tocco in coordinate di gioco (la larghezza è VIEW.width, in src/config.js)
//   { "tapPath": "postazioni.2" }  tocco al centro (x, y) dell'elemento che lo stato di
//                          render_game_to_text indica con questo percorso: lo scenario non scrive coordinate
//   { "key": "Digit1" }    un tasto (nomi di Playwright: Digit1, KeyQ, KeyM...)
//   { "advance": 500 }     window.advanceTime(500): il gioco avanza di 500 ms, a passi da 1/60 s
//   { "shot": "nome" }     salva nome.png e nome.json (lo stato di window.render_game_to_text)
//   { "goto": "?sviluppo" } carica di nuovo la pagina, con questo indirizzo relativo
//   { "resize": "1280x720" } cambia la misura della finestra e lascia a Phaser un passo per accorgersene
//   { "expect": "ultimoTocco.tipo", "equals": "posto" }  errore se quel valore dello stato (adesso) è diverso
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
  },
});

const DEFAULT_SCENARIO = [{ shot: 'avvio' }, { advance: 1000 }, { shot: 'dopo-1s' }];
const steps = positionals[0] ? JSON.parse(readFileSync(positionals[0], 'utf8')) : DEFAULT_SCENARIO;
const [width, height] = opt.size.split('x').map(Number);
mkdirSync(opt.out, { recursive: true });

const server = opt.offline
  ? await preview({ logLevel: 'warn' })
  : await (await createServer({ logLevel: 'warn' })).listen();
const url = server.resolvedUrls.local[0];

// Chrome installato se c'è, altrimenti il Chromium di Playwright (npx playwright install chromium).
const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
const context = await browser.newContext({ locale: opt.locale, viewport: { width, height } });
const page = await context.newPage();

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
    } else if ('resize' in step) {
      const [w, h] = step.resize.split('x').map(Number);
      await page.setViewportSize({ width: w, height: h });
      // Phaser se ne accorge al passo di gioco successivo (e l'evento della finestra arriva con un poco di ritardo).
      await page.waitForTimeout(100);
      await page.evaluate(() => window.advanceTime(100));
      console.log(`resize ${step.resize}: gioco ${JSON.stringify((await readState()).gioco)}`);
    } else if ('expect' in step) {
      const actual = valueAt(await readState(), step.expect);
      if (JSON.stringify(actual) !== JSON.stringify(step.equals)) fail(`expect ${step.expect}: ${JSON.stringify(actual)} invece di ${JSON.stringify(step.equals)}`);
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
