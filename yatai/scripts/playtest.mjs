// Playtest automatico con Playwright: avvia il gioco, esegue uno scenario, salva screenshot e stato.
//
//   npm run playtest                         scenario di base, in italiano, su un telefono 390×844
//   npm run playtest -- scenari/x.json --locale ja-JP --size 1280x720 --out playtest-output/ja
//   npm run playtest:offline                 costruisce dist/, lo carica, stacca la rete e ricarica
//
// Lo scenario è un elenco JSON di passi, eseguiti in ordine:
//   { "tap": [x, y] }      tocco in coordinate di gioco (VIEW in src/config.js)
//   { "key": "Digit1" }    un tasto (nomi di Playwright: Digit1, KeyQ, KeyM...)
//   { "advance": 500 }     window.advanceTime(500): il gioco avanza di 500 ms, a passi da 1/60 s
//   { "shot": "nome" }     salva nome.png e nome.json (lo stato di window.render_game_to_text)
// Gli input vengono letti al passo "advance" successivo, quindi lo schema tipico è
// tap → advance → shot.
//
// Esce con errore se la console del browser riporta errori o se gli hook non rispondono.

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

const fail = (message) => { errors.push(message); };
const readState = () => page.evaluate(() => JSON.parse(window.render_game_to_text()));

try {
  await page.goto(url);
  if (opt.offline) {
    await page.waitForFunction(() => navigator.serviceWorker?.controller, null, { timeout: 15000 });
    await context.setOffline(true);
    await page.reload();
  }

  await page.waitForFunction(
    () => typeof window.advanceTime === 'function'
      && typeof window.render_game_to_text === 'function'
      && JSON.parse(window.render_game_to_text()).scene,
    null,
    { timeout: 15000 },
  );

  for (const step of steps) {
    if ('advance' in step) {
      const before = await readState();
      await page.evaluate((ms) => window.advanceTime(ms), step.advance);
      const after = await readState();
      if (!(after.timeMs > before.timeMs)) fail(`advanceTime(${step.advance}) non ha fatto avanzare il tempo`);
      console.log(`advance ${step.advance} ms: ${before.timeMs} → ${after.timeMs}`);
    } else if ('tap' in step) {
      const box = await page.locator('#game canvas').boundingBox();
      const scale = box.width / VIEW.width;
      await page.mouse.click(box.x + step.tap[0] * scale, box.y + step.tap[1] * scale);
      console.log(`tap ${step.tap}`);
    } else if ('key' in step) {
      await page.keyboard.press(step.key);
      console.log(`key ${step.key}`);
    } else if ('shot' in step) {
      const state = await readState();
      await page.screenshot({ path: join(opt.out, `${step.shot}.png`) });
      writeFileSync(join(opt.out, `${step.shot}.json`), JSON.stringify(state, null, 2));
      console.log(`shot ${step.shot}: ${JSON.stringify(state)}`);
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
