# Font per Maurizio Yatai: giapponese e latino

Ricerca del 2026-11-03, per il passo 12 di [PIANO.md](../../PIANO.md) ("font giapponese ridotto ai soli caratteri usati").

Le fonti sono primarie: il repository [`google/fonts`][gf] (file dei font, `METADATA.pb`, `OFL.txt`, descrizioni ufficiali), i sorgenti di Phaser al tag `v4.2.1`, la documentazione di Vite, le specifiche W3C/CSSWG e i README dei pacchetti npm. Le misure (copertura dei glifi, peso woff2, subset, render su canvas, prova completa con Vite + Phaser) le ho fatte sui file originali di `google/fonts`. Il metodo è in fondo, nella sezione 8. I giudizi su stile e leggibilità sono **osservazioni mie** sui render, non vengono da una fonte.

Unità: 1 KB = 1024 byte, 1 MB = 1024 KB.

## In breve

- **Font consigliato: Klee One SemiBold**, un'unica famiglia per italiano, inglese e giapponese. Licenza **SIL OFL 1.1** ([OFL.txt][klee-ofl]).
- Tra i font scritti a mano che ho verificato è l'unico che ha **tutti** i caratteri richiesti: kana, kanji JIS di 1° e 2° livello, à è é ì ò ù (anche le maiuscole), ō ū, ¥, ★ e ☆. Il suo latino è proporzionale e ha lo stesso tratto a matita.
- Ridotto ai caratteri del gioco pesa **circa 60–80 KB** in woff2: 63,2 KB nella prova con 133 kanji, contro 2,95 MB del file intero.
- Riduzione con **[`subset-font`][subset-font]** (npm, HarfBuzz compilato in WebAssembly, funziona con il solo Node), lanciato da `predev` e `prebuild`. Python non serve.
- Caricamento con **`this.load.font()`** di Phaser 4.2.1 in una scena di Boot, più un controllo esplicito dello stato del `FontFace`. L'ho provato sotto la CSP della suite e funziona.

---

## 1. Vincoli verificati

- **CSP.** L'header servito oggi da [`/farmplush/`][suite-farm] (letto con `curl -I`) è:
  `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; media-src 'self' data: blob:; connect-src 'self'; font-src 'self'; worker-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'`.
  È lo stesso del brief, con in più `media-src`, `worker-src` e `manifest-src`.
- **Il font dei giochi della suite.** I giochi non includono nessun file di font. Sia il CSS sia il codice Phaser usano lo stack di sistema `"Comic Sans MS", "Chalkboard SE", "Comic Neue", sans-serif`: si vede nel [CSS][suite-farm-css] e nel [bundle JS][suite-farm-js] di FarmPlush, e lo stesso stack c'è nel [CSS di Balosso][suite-balosso-css]. L'aspetto reale dipende quindi dai font installati sul dispositivo. Comic Neue, che è OFL, compare già nello stack.
- **Il sito.** Baloo 2 è self-hosted solo per il latino (`fonts/baloo2-latin.woff2`, con `unicode-range` latino). Il testo di [`jp.html`][suite-jp] usa i font di sistema: `--font-body: system-ui, … "Hiragino Sans", "Yu Gothic UI", "Meiryo", sans-serif` ([style.css][suite-css]). Nella suite non c'è quindi ancora nessun webfont giapponese da cui partire.

## 2. Candidati giapponesi

Kana: hiragana U+3041–3096 (86) e katakana U+30A1–30FA (90). "84/86" vuol dire che mancano solo ゕ ゖ (ka e ke piccole), che il gioco non usa.
Kanji: JIS X 0208, 1° livello = 2965 caratteri e 2° livello = 3390.
**Subset di prova**: 453 caratteri (tutti i kana, 133 kanji, ASCII, accenti, macron, simboli, punteggiatura giapponese), con le sole feature di layout di base (vedi §5.2).

| Font (pesi) | Licenza | Stile (descrizione ufficiale) | Kana | Kanji JIS 1° · 2° | à è é ì ò ù | ō ū | ¥ | ★ ☆ | woff2 intero | Subset di prova | Corpo piccolo su telefono (render mio) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Klee One** (400, 600) | [OFL 1.1][klee-ofl] | "a script font handwritten by pencil or pen", "Ideal for body text" ([descr.][klee-desc]) | 86 · 90 | 2965 · 3390 | ✓ | ✓ | ✓ | ✓ | 2,73 MB (400) · 2,95 MB (600) | 72,3 KB · 74,3 KB | **Buona**: il SemiBold è il più leggibile dei font a mano a 13 px; latino proporzionale |
| **Yomogi** (400) | [OFL 1.1][yomogi-ofl] | "extra thin hand writing font", "cuteness and readability", monospaziato ([descr.][yomogi-desc]) | 84 · 90 | 2965 · 3390 | ✓ | ✓ | ✓ | ✓ | 1,66 MB | 62,8 KB | Discreta: tratto sottile e chiaro, un solo peso; latino monospaziato, quindi le righe in italiano vengono molto larghe |
| Zen Kurenaido (400) | [OFL 1.1][kurenaido-ofl] | "an impression of ballpoint handwriting" ([descr.][kurenaido-desc]) | 84 · 90 | 2965 · 3390 | ✓ | **✗** | ✓ | ✓ | 1,39 MB | 49,1 KB | Buona per il giapponese; latino piccolo |
| Kiwi Maru (300–500) | [OFL 1.1][kiwi-ofl] | categoria SERIF, per "everyday and slang expressions" ([descr.][kiwi-desc]) | 86 · 90 | 2965 · 3390 | ✓ | **✗** | ✓ | ✓ | 1,64 MB | 57,5 KB | Buona; non sembra scritto a mano |
| Hachi Maru Pop (400) | [OFL 1.1][hachi-ofl] | "a cute font that was popular among young Japanese girls in the 1970s and 1980s… works well at larger sizes" ([descr.][hachi-desc]) | 84 · 90 | 2965 · 3390 | ✓ | **✗** | ✓ | ✓ (stella stilizzata) | 2,01 MB | 64,8 KB | Scarsa a 13 px; latino molto decorativo. È il più kawaii |
| Mochiy Pop One (400) | [OFL 1.1][mochiy-ofl] | "casual Gothic… display font", kanji derivati da Noto Sans JP ([descr.][mochiy-desc]) | 86 · 90 | 2965 · 3390 | ✓ | **✗** | ✓ | **✗** | 2,14 MB | 44,5 KB | Ottima (molto nero), ma pop e non a matita |
| Zen Maru Gothic (300–900) | [OFL 1.1][zenmaru-ofl] | "a rounded san serif family" ([descr.][zenmaru-desc]) | 84 · 90 | 2965 · 3390 | ✓ | **✗** | ✓ | ✓ | 1,49 MB | 49,9 KB | Ottima; non a mano |
| M PLUS Rounded 1c (100–900) | OFL ([METADATA.pb][mplus-meta]; [OFL.txt upstream][mplus-ofl]) | gothic arrotondato | 86 · 90 | 2965 · **1943** | ✓ | ✓ | ✓ | ✓ | 0,97 MB | 49,2 KB | Ottima; non a mano |
| Kosugi Maru (400) | **Apache 2.0** ([LICENSE.txt][kosugi-lic]) | "Gothic Rounded… monospaced metrics" ([descr.][kosugi-desc]) | 83 · 86 | 2965 · 3390 | **✗** | **✗** | **✗** | ✓ | 1,47 MB | 52,0 KB | **Scartato**: mancano gli accenti italiani e ¥ |
| *Yusei Magic (400)*, in più | [OFL 1.1][yusei-ofl] | "handwritten letters written with permanent marker" ([descr.][yusei-desc]) | 84 · 86 | 2965 · 3390 | ✓ | **✗** | ✓ | ✓ | 0,92 MB | 37,7 KB | Buona; pennarello, non matita |
| *Darumadrop One*, in più | [OFL 1.1][daruma-ofl] | font a mano ispirato al Daruma Otoshi ([descr.][daruma-desc]) | 84 · 90 | **0 · 0** | ✓ | ✗ | ✓ | ✗ | 0,15 MB | – | **Scartato**: non ha kanji |

Pesi disponibili, licenza e designer vengono dai `METADATA.pb` di ogni cartella in [`google/fonts`][gf] (per esempio [Klee One][klee-meta]). Nessuno dei font giapponesi dichiara un *Reserved Font Name* nella riga di copyright del proprio `OFL.txt`; tra tutti i candidati lo fa solo Short Stack.

**Risultato chiave:** ō e ū (necessari per "kakigōri", "fūrin", "chōchin") ci sono solo in **Klee One, Yomogi e M PLUS Rounded 1c**. Di questi tre, M PLUS Rounded 1c non è scritto a mano. La scelta di un font unico è quindi tra Klee One e Yomogi.

## 3. Latino: basta il font giapponese?

| Font | Licenza | à è é ì ò ù | ō ū | ¥ | ★ | woff2 intero | Subset latino (122 car.) | Giudizio (render mio) |
|---|---|---|---|---|---|---|---|---|
| Patrick Hand | [OFL 1.1][patrick-ofl] | ✓ | ✓ | ✓ | ✗ | 61,3 KB | 21,9 KB | A mano, tipo fumetto, stretto. Accanto a Klee e Yomogi sembra più scuro: la coppia appare "scollata" |
| Gaegu | [OFL 1.1][gaegu-ofl] | **✗** | ✗ | ✗ | ✗ | 283,7 KB | – | **Scartato**: mancano gli accenti italiani |
| Itim | [OFL 1.1][itim-ofl] | ✓ | ✓ | ✓ | ✗ | 102,6 KB | 35,9 KB | Arrotondato e pulito, poco "a mano" |
| Comic Neue (300/400/700) | [OFL 1.1][comic-ofl] | ✓ | **✗** | ✓ | ✗ | 23,6 KB | 12,9 KB | È già nello stack della suite, quindi è il più coerente con gli altri giochi, ma **mancano ō ū** |
| Short Stack | [OFL 1.1 con Reserved Font Name "Short Stack"][shortstack-ofl] | ✓ | ✗ | ✓ | ✗ | 28,2 KB | 15,6 KB | Il subset è una modifica ([OFL-FAQ 2.6][ofl-faq]) e quindi non potrebbe più chiamarsi "Short Stack" |
| Baloo 2 (variabile) | [OFL 1.1][baloo-ofl] | ✓ | ✓ | ✓ | ✗ | 175,9 KB | 13,7 KB (wght 500) | È il font del sito: tondo, non scritto a mano |

Conclusioni:

- **Nessun font latino ha ★.** In una coppia la stella arriverebbe comunque dal font giapponese, tramite lo stack. Il canvas usa la stessa sintassi del `font` CSS ([MDN][mdn-canvas-font]), quindi la ricerca di un glifo mancante segue la lista di famiglie.
- **Il latino di Klee One basta.** È proporzionale, ha lo stesso tratto a matita del giapponese e copre tutto. Una coppia aggiunge un secondo file da caricare e, nei miei render, una differenza di peso evidente (Patrick Hand + Klee One, Patrick Hand + Yomogi).
- **Il latino di Yomogi è monospaziato** ([descrizione][yomogi-desc]). A 18 px "È la Serata! Kakigōri al matcha · 250 ¥" esce da una colonna di 360 px. Per l'italiano e l'inglese è uno svantaggio concreto.
- **Piano B**, se al passo 14 il revisore trova il latino troppo "ordinato" rispetto al Comic Sans della suite: Comic Neue per it/en, con Klee One SemiBold dietro nello stack per ō ū ★. Nel mio render la ō di Klee dentro una parola in Comic Neue quasi non si nota. Resta però un rattoppo su singoli glifi e richiede un secondo file (circa 13 KB).

## 4. Scelta

**Klee One SemiBold, da solo, per le tre lingue.**

1. Copre tutti i caratteri richiesti, senza fallback.
2. È dichiaratamente un font "handwritten by pencil or pen" ([descrizione][klee-desc]): è il più vicino al kit "a matita" del passo 1.
3. Il peso 600 regge i 13 px su telefono meglio di Yomogi, che esiste in un solo peso sottile. Anche questa è un'osservazione dai render.
4. Un file solo, da circa 60–80 KB.

Il punto debole è che è "quiet" ed "elegant" più che kawaii ([descrizione][klee-desc]). L'aria kawaii la danno già disegni e palette. Se si vuole un giapponese più tenero, l'alternativa è Yomogi per il solo giapponese, con il latino in Klee One.

## 5. Ridurre il font in fase di build

### 5.1 Strumenti

| Strumento | Cosa richiede | Note | Esito |
|---|---|---|---|
| [`subset-font`][subset-font] 2.9.0 (BSD-3-Clause) | Node. Usa [`harfbuzzjs`][harfbuzzjs] (HarfBuzz in WASM) e [`fontverter`][fontverter]/[`wawoff2`][wawoff2] per WOFF/WOFF2 | Input SFNT, WOFF o WOFF2; output `woff2`; opzione `keepFeatures` ([README][subset-font]) | **Scelto.** Provato su Windows 11 con Node 24.13 |
| [`glyphhanger`][glyphhanger] 6.0.0 (MIT) | `pyftsubset` di fonttools (Python), più `brotli` per il woff2 ([README][glyphhanger]) | Pensato per analizzare pagine web | Scartato: serve Python |
| [`pyftsubset`][fonttools] (fonttools) | Python, più `brotli` per il woff2 ([README glyphhanger][glyphhanger]) | Lo standard di fatto | Scartato: serve Python |
| [`vite-plugin-font`][vpf] 5.1.2 (Apache-2.0) | [`cn-font-split`][cnfs] 7.4.3, il cui `postinstall` esegue `node ./dist/cli.js i default`, cioè scarica un binario nativo | Produce CSS con più blocchi `unicode-range` | Scartato: troppo per un solo file, e passa dal CSS |
| [`unplugin-fonts`][unplugin-fonts] 2.1.0 | – | Fa da loader; l'opzione `subset` sceglie sottoinsiemi predefiniti (es. `'latin-ext'`) | Scartato: non riduce ai caratteri usati |
| [`@fontsource/klee-one`][fontsource-klee] 5.3.1 | – | Sottoinsiemi predefiniti per script (`japanese`, `latin`, …) | Scartato: idem |

Phaser disegna il testo su canvas, e il canvas usa solo i font già caricati ([MDN][mdn-canvas-font]). Un unico file, caricato all'avvio, è più semplice di tanti pezzi `unicode-range` da caricare uno per uno.

### 5.2 La trappola delle feature OpenType (`aalt`)

Per default `subset-font` conserva **tutte** le feature di layout ([README][subset-font]). Klee One ha anche `aalt` ("Access All Alternates"), una feature *discrezionale* pensata per far scegliere all'utente un glifo alternativo da una tavolozza ([registro OpenType][ot-aalt]). Tenerla trascina nel subset centinaia di glifi alternativi.

| Subset di prova (453 car.) | Tutte le feature | Solo le feature di base | Base + `aalt` |
|---|---|---|---|
| Klee One SemiBold | 312,4 KB | **73,5 KB** | 263,8 KB |
| Klee One Regular | 305,7 KB | 72,3 KB | – |
| Yomogi | 88,1 KB | 62,8 KB | 87,0 KB |

Le feature di base sono quelle che i browser applicano sempre al testo orizzontale: `rlig liga clig calt locl ccmp mark mkmk` ([CSS Fonts 4 §7.1][css-default-features]), più `kern` per prudenza. `vert` serve solo per il testo verticale ([stessa sezione][css-default-features]).

### 5.3 Script (provato)

Funziona in dev e in build e non dipende da plugin di Vite. Le chiavi sono `predev` e `prebuild`, perché npm esegue `preX` prima di `X` ([npm scripts][npm-prepost]). I percorsi `src/i18n/{it,en,ja}.js` sono quelli della mia prova: vanno adattati ai file di testo reali del passo 0.

```js
// scripts/subset-font.mjs: riduce il font ai soli caratteri usati dai testi del gioco.
// Uso: node scripts/subset-font.mjs   (lanciato da "predev" e "prebuild")
import fs from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import subsetFont from 'subset-font';
import * as fontkit from 'fontkit';

const root = fileURLToPath(new URL('..', import.meta.url));
const SOURCE = `${root}fonts/KleeOne-SemiBold.ttf`;          // font completo, con OFL.txt accanto
const OUTPUT = `${root}src/assets/fonts/yatai.woff2`;        // generato, da non mettere sotto git
const LOCALES = ['it', 'en', 'ja'].map(l => `${root}src/i18n/${l}.js`);

// Caratteri sempre inclusi: ASCII stampabile, accenti, macron, simboli e punteggiatura giapponese.
const FIXED = String.fromCharCode(...Array.from({ length: 95 }, (_, i) => 32 + i))
  + 'àèéìòùÀÈÉÌÒÙōūŌŪ¥★☆×’‘“”…–·'
  + '、。「」『』！？ー・〜々（）：　％＋';

// Solo le feature che il browser applica da sé al testo orizzontale:
// tenere 'aalt' & co. fa entrare centinaia di glifi alternativi inutili.
const KEEP_FEATURES = ['ccmp', 'locl', 'liga', 'clig', 'calt', 'kern', 'mark', 'mkmk', 'rlig'];

function collect(value, out) {
  if (typeof value === 'string') out.push(value);
  else if (value && typeof value === 'object') for (const v of Object.values(value)) collect(v, out);
}

const strings = [];
for (const file of LOCALES) collect((await import(pathToFileURL(file).href)).default, strings);
const chars = [...new Set([...FIXED, ...strings.join('')])].filter(c => c !== '\n').join('');

const source = await fs.readFile(SOURCE);
const font = fontkit.create(source);
const missing = [...chars].filter(c => !font.hasGlyphForCodePoint(c.codePointAt(0)));
if (missing.length) {
  console.error(`Il font non ha questi caratteri: ${missing.join(' ')}`);
  process.exit(1);
}

const woff2 = await subsetFont(source, chars, { targetFormat: 'woff2', keepFeatures: KEEP_FEATURES });
await fs.mkdir(new URL('../src/assets/fonts/', import.meta.url), { recursive: true });
await fs.writeFile(OUTPUT, woff2);
console.log(`yatai.woff2: ${[...chars].length} caratteri, ${(woff2.length / 1024).toFixed(1)} KB`);
```

```json
"scripts": {
  "fonts": "node scripts/subset-font.mjs",
  "predev": "npm run fonts",
  "dev": "vite",
  "prebuild": "npm run fonts",
  "build": "vite build"
}
```

Dipendenze di sviluppo: `subset-font` e [`fontkit`][fontkit] (MIT, usato solo per bloccare la build se manca un carattere). Nella mia prova Vite 8.3.5 ha emesso il file come asset con hash (`dist/assets/yatai-rG8kP3a0.woff2`), come da [documentazione degli asset][vite-assets].

Accorgimenti:

- **Numeri a runtime.** Le cifre e i separatori di `toLocaleString` (`.` e `,`) sono già nell'ASCII della lista fissa. Ogni altro testo costruito dal codice e non presente nei file di testo va aggiunto a `FIXED`.
- **Sorgente in WOFF2.** `subset-font` accetta anche WOFF2 come sorgente, e il risultato è identico: 85,7 KB in entrambi i casi in una mia prova. Si può quindi tenere nel repo il woff2 intero (3,0 MB) al posto del TTF (8,7 MB). `google/fonts` però pubblica solo il TTF, e la conversione richiede `wawoff2`. Il TTF originale è la scelta più semplice.

### 5.4 Peso stimato dopo la riduzione

| Prova con Klee One SemiBold | Peso woff2 |
|---|---|
| Testi finti ricavati da GAME_SPEC: 373 caratteri (133 kanji, solo i kana usati, ASCII, simboli) | **63,2 KB**, in circa 8,5 s su questo PC Windows |
| Tutti i kana + latino + simboli, zero kanji | 36,3 KB |
| … + 100 kanji | 72,3 KB |
| … + 300 kanji | 135,4 KB |
| Costo marginale | circa 0,31 KB per kanji |
| File intero, per confronto | 2,95 MB (−97% circa) |

**Stima per il gioco: 60–80 KB** con 100–150 kanji. Si arriva a circa 100 KB solo se i kanji salgono verso 250.

## 6. Caricamento in Phaser 4.2.1

### 6.1 Cosa fa `this.load.font()` (sorgente al tag v4.2.1)

Da [`FontFile.js`][phaser-fontfile]:

- Il metodo esiste in Phaser 4.2.1 ed è disponibile dalla 3.87.0. La firma è `this.load.font(key, url, format = 'truetype', descriptors)`, oppure un oggetto `{ key, url, format, descriptors }`.
- Il file nasce già "popolato" (`FILE_POPULATED`), quindi il loader non fa un XHR: chiama subito `onProcess` ([`File.js`][phaser-file]).
- `onProcess` crea `new FontFace(key, 'url(' + src + ') format("' + format + '")')`, chiama `font.load()`, poi `document.fonts.add(font)`, aggiunge la classe `fonts-loaded` al `body` e solo allora completa il file.
- **Se il caricamento fallisce** scrive solo `console.warn('Font failed to load', …)` e completa lo stesso. Il loader arriva comunque a `complete` e la scena va avanti con il font di ripiego. Per questo serve un controllo esplicito.
- Il formato di default è `'truetype'`: per un woff2 va passato `format: 'woff2'`.
- La documentazione nel sorgente dice che in `create()` gli asset di `preload()` sono pronti. Per il font questo vale solo se il caricamento è riuscito, perché un errore non blocca il loader.

### 6.2 Come garantire il font prima di qualsiasi testo

```js
import fontUrl from '../assets/fonts/yatai.woff2?no-inline';

export class Boot extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload() {
    this.load.font({ key: 'Yatai', url: fontUrl, format: 'woff2' });
  }
  create() {
    const face = [...document.fonts].find(f => f.family === 'Yatai');
    if (face?.status !== 'loaded') console.error('Font Yatai non caricato: uso il font di sistema');
    this.scene.start('Title');
  }
}
// In config.js: export const FONT = 'Yatai, sans-serif'; e ogni Text usa { fontFamily: FONT }
```

- Nessun `Text` va creato con il font prima di `Boot.create()`.
- **Non usare `document.fonts.check()` come prova.** Restituisce `true` quando *nessun* font corrisponde ([CSS Font Loading §3.3][css-fl-check]); nella mia prova `document.fonts.check('16px NonEsiste')` ha dato `true`. Controllare invece `status` del `FontFace` ([§2.2][css-fl-load]).
- **Chiave senza spazi** (`'Yatai'`). In Chromium la `family` di un nome con spazi viene restituita tra virgolette (`"Klee One"`), il che complica il confronto. È un'osservazione dalla mia prova.
- **Alternativa equivalente senza Phaser.** Si crea il `FontFace`, si aspetta `load()` e lo si aggiunge a `document.fonts` in `main.js`, prima di `new Phaser.Game(...)`. È lo schema che MDN indica per il canvas ([MDN][mdn-canvas-font]). Consiglio la via di Phaser perché tiene tutto nel loader.

### 6.3 CSP

- `FontFace.load()` carica il font "as if it was the value of a @font-face rule's src descriptor" ([CSS Font Loading §2.2][css-fl-load]). Le richieste di font hanno destinazione `font`, che è governata da `font-src` ([CSP3 §6.8.1][csp-effective]). Un file dello stesso sito in `/assets/` quindi passa con `font-src 'self'`.
- **Mai un `data:` URL.** Per gli schemi non HTTP la CSP richiede che siano elencati in modo esplicito ([CSP3 §6.7.2.8][csp-match]), e la CSP della suite non elenca `data:` in `font-src`. Vite trasforma in base64 gli asset sotto `build.assetsInlineLimit`, che di default vale 4096 byte ([build options][vite-inline]). Il subset è molto più grande, ma il suffisso `?no-inline` ([asset di Vite][vite-assets]) lo rende esplicito. Ho provato che con `?no-inline` il bundle punta a `/assets/yatai-….woff2` e non contiene `data:font`.
- **Niente CSS per il font.** Con `this.load.font` non serve nessun `@font-face`, quindi `style-src 'self'` non entra in gioco. Un `<style>` inline con `@font-face` verrebbe bloccato: nella mia prova la CSP della suite ha bloccato perfino un attributo `style` inline nell'`index.html` di test.
- **Prova completa.** Vite 8.3.5 + `phaser@4.2.1`, build servita con l'header CSP della suite. Risultato: il `FontFace` `Yatai` è `loaded`, il `body` ha la classe `fonts-loaded` e il `Text` è disegnato in Klee One con È, ō, ¥, ★ e i kanji corretti, senza accenti tagliati. Non ci sono errori CSP legati al font (gli unici errori in console erano l'attributo `style` del mio `index.html` e una favicon assente).

## 7. Altre cose da sapere per il passo 12

- **A capo nel giapponese.** Phaser `Text` va a capo solo sugli spazi: sia `basicWordWrap` sia `advancedWordWrap` fanno `split(' ')` ([Text.js][phaser-text]). Con `wordWrap.useAdvancedWrap: true`, una "parola" troppo lunga viene tagliata un carattere alla volta. Una riga giapponese senza spazi va quindi a capo in un punto qualsiasi, anche prima di 。 o 、, perché non ci sono regole kinsoku. Conviene mettere `\n` a mano nelle stringhe giapponesi lunghe, oppure usare `wordWrap.callback` ([Text.js][phaser-text]).
- **Metriche.** `TextStyle` misura l'altezza del font con `testString`, che di default vale `'|MÉqgy'` ([TextStyle.js][phaser-textstyle]). Nella mia prova È e i kanji non erano tagliati. Se lo diventano, si possono regolare `testString` o `padding`.
- **Funzionamento offline.** Se l'app usa `vite-plugin-pwa`, i `globPatterns` di default sono `**/*.{js,css,html}` e quindi il woff2 resta fuori dalla cache. Va aggiunto, per esempio con `globPatterns: ['**/*.{js,css,html,woff2}']` ([vite-plugin-pwa][pwa-assets]). Con un service worker scritto a mano, il file con l'hash va messo nella lista di precache.
- **Licenza.** Per l'OFL il subset è una modifica, ed è ammesso ([OFL-FAQ 2.6][ofl-faq]). Klee One non ha Reserved Font Name (la riga di copyright del suo [OFL.txt][klee-ofl] non ne dichiara), quindi il nome può restare. Il font si può distribuire dentro un gioco ([FAQ 1.4][ofl-faq]), purché siano inclusi "the copyright statement, the license notice and the license text" ([FAQ 1.20][ofl-faq]). Va quindi messo `OFL.txt` accanto al font, sia nei sorgenti sia nella build, e citato nel LEGGIMI.

## 8. Come ho misurato

- **File.** TTF scaricati da `google/fonts` (`main`, cartelle `ofl/<nome>/` e `apache/kosugimaru/`); le dimensioni coincidono con quelle elencate dall'API di GitHub. Non ho eseguito niente di quello che ho scaricato: i font sono stati letti solo come dati.
- **Copertura.** Tabella `cmap` letta con [fontkit][fontkit] 2.0.4. I kanji JIS X 0208 sono generati con il decoder EUC-JP dello standard WHATWG ([indice JIS0208][whatwg-jis]): righe 16–47 per il 1° livello, 48–84 per il 2°.
- **Peso intero.** Woff2 prodotto da [wawoff2][wawoff2] 2.0.1, l'encoder woff2 di Google compilato in WASM.
- **Subset.** `subset-font` 2.9.0, sia con le feature di default sia con quelle di base (§5.2).
- **Leggibilità.** Chromium tramite Playwright. Testo disegnato con `fillText` su un canvas 2D, come fa Phaser `Text`, in una colonna larga 360 px CSS a DPR 2, con corpi da 12 a 18 px, in italiano, inglese e giapponese.
- **Prova completa.** Progetto usa e getta con Vite 8.3.5 e `phaser@4.2.1`, servito con l'header CSP della suite, controllato con Playwright. Script e progetto di prova sono fuori dal repo.

## Raccomandazione

Usare **Klee One SemiBold** (OFL 1.1) come unico font per le tre lingue. Va ridotto in build con `subset-font` (solo Node) a circa 60–80 KB e caricato con `this.load.font` di Phaser in una scena di Boot. Passi per il passo 12:

1. **Sorgente e licenza.** In `yatai/fonts/` mettere `KleeOne-SemiBold.ttf` e `OFL.txt` presi da [`google/fonts/ofl/kleeone`][klee-dir]. Questa cartella sta fuori da `public/`, così il file intero non finisce nella build. Copiare `OFL.txt` anche in `public/fonts/OFL-KleeOne.txt`, per averlo accanto al font nella versione caricata online, e citarlo nel LEGGIMI e nei crediti.
2. **Script di riduzione.** Eseguire `npm i -D subset-font fontkit` e aggiungere `scripts/subset-font.mjs` (§5.3), con `LOCALES` adattato ai file di testo veri del passo 0. Poi aggiungere gli script `fonts`, `predev` e `prebuild` e mettere `src/assets/fonts/yatai.woff2` nel `.gitignore`. La build si ferma se un testo usa un carattere che il font non ha.
3. **Caricamento.** Nella scena di Boot: `import fontUrl from '…/yatai.woff2?no-inline'`, poi `this.load.font({ key: 'Yatai', url: fontUrl, format: 'woff2' })`. In `create()` controllare `status === 'loaded'` del `FontFace` (non `document.fonts.check`). In `config.js` definire `FONT = 'Yatai, sans-serif'` e usarlo in ogni `Text`; nessun testo va creato prima di Boot.
4. **Giapponese e offline.** Nelle stringhe giapponesi lunghe mettere `\n` a mano, oppure usare un `wordWrap.callback`, perché Phaser va a capo solo sugli spazi. Aggiungere `woff2` alla precache del service worker.
5. **Verifica con Playwright** (regole del PIANO):
   - screenshot a 360×640 in italiano, inglese e giapponese, controllando che È, ō, ¥, ★ e i kanji non siano tagliati;
   - stato del font in `render_game_to_text()`;
   - in console non deve comparire `Font failed to load`;
   - `dist/assets/yatai-*.woff2` sotto i 100 KB.

---

## Fonti

[gf]: https://github.com/google/fonts
[klee-dir]: https://github.com/google/fonts/tree/main/ofl/kleeone
[klee-ofl]: https://github.com/google/fonts/blob/main/ofl/kleeone/OFL.txt
[klee-desc]: https://github.com/google/fonts/blob/main/ofl/kleeone/DESCRIPTION.en_us.html
[klee-meta]: https://github.com/google/fonts/blob/main/ofl/kleeone/METADATA.pb
[yomogi-ofl]: https://github.com/google/fonts/blob/main/ofl/yomogi/OFL.txt
[yomogi-desc]: https://github.com/google/fonts/blob/main/ofl/yomogi/DESCRIPTION.en_us.html
[kurenaido-ofl]: https://github.com/google/fonts/blob/main/ofl/zenkurenaido/OFL.txt
[kurenaido-desc]: https://github.com/google/fonts/blob/main/ofl/zenkurenaido/DESCRIPTION.en_us.html
[kiwi-ofl]: https://github.com/google/fonts/blob/main/ofl/kiwimaru/OFL.txt
[kiwi-desc]: https://github.com/google/fonts/blob/main/ofl/kiwimaru/DESCRIPTION.en_us.html
[hachi-ofl]: https://github.com/google/fonts/blob/main/ofl/hachimarupop/OFL.txt
[hachi-desc]: https://github.com/google/fonts/blob/main/ofl/hachimarupop/DESCRIPTION.en_us.html
[mochiy-ofl]: https://github.com/google/fonts/blob/main/ofl/mochiypopone/OFL.txt
[mochiy-desc]: https://github.com/google/fonts/blob/main/ofl/mochiypopone/DESCRIPTION.en_us.html
[zenmaru-ofl]: https://github.com/google/fonts/blob/main/ofl/zenmarugothic/OFL.txt
[zenmaru-desc]: https://github.com/google/fonts/blob/main/ofl/zenmarugothic/DESCRIPTION.en_us.html
[mplus-meta]: https://github.com/google/fonts/blob/main/ofl/mplusrounded1c/METADATA.pb
[mplus-ofl]: https://github.com/coz-m/MPLUS_FONTS/blob/master/OFL.txt
[kosugi-lic]: https://github.com/google/fonts/blob/main/apache/kosugimaru/LICENSE.txt
[kosugi-desc]: https://github.com/google/fonts/blob/main/apache/kosugimaru/DESCRIPTION.en_us.html
[yusei-ofl]: https://github.com/google/fonts/blob/main/ofl/yuseimagic/OFL.txt
[yusei-desc]: https://github.com/google/fonts/blob/main/ofl/yuseimagic/DESCRIPTION.en_us.html
[daruma-ofl]: https://github.com/google/fonts/blob/main/ofl/darumadropone/OFL.txt
[daruma-desc]: https://github.com/google/fonts/blob/main/ofl/darumadropone/DESCRIPTION.en_us.html
[patrick-ofl]: https://github.com/google/fonts/blob/main/ofl/patrickhand/OFL.txt
[gaegu-ofl]: https://github.com/google/fonts/blob/main/ofl/gaegu/OFL.txt
[itim-ofl]: https://github.com/google/fonts/blob/main/ofl/itim/OFL.txt
[comic-ofl]: https://github.com/google/fonts/blob/main/ofl/comicneue/OFL.txt
[shortstack-ofl]: https://github.com/google/fonts/blob/main/ofl/shortstack/OFL.txt
[baloo-ofl]: https://github.com/google/fonts/blob/main/ofl/baloo2/OFL.txt
[ofl-faq]: https://openfontlicense.org/ofl-faq/
[suite-farm]: https://maurizioinfluencerofficial.mirkoforesti.it/farmplush/
[suite-farm-css]: https://maurizioinfluencerofficial.mirkoforesti.it/farmplush/assets/index-m6svkIKb.css
[suite-farm-js]: https://maurizioinfluencerofficial.mirkoforesti.it/farmplush/assets/index-DlP5qRVa.js
[suite-balosso-css]: https://maurizioinfluencerofficial.mirkoforesti.it/balosso/assets/index-sytKYuVs.css
[suite-jp]: https://maurizioinfluencerofficial.mirkoforesti.it/jp.html
[suite-css]: https://maurizioinfluencerofficial.mirkoforesti.it/style.css
[phaser-fontfile]: https://github.com/phaserjs/phaser/blob/v4.2.1/src/loader/filetypes/FontFile.js
[phaser-file]: https://github.com/phaserjs/phaser/blob/v4.2.1/src/loader/File.js
[phaser-text]: https://github.com/phaserjs/phaser/blob/v4.2.1/src/gameobjects/text/Text.js
[phaser-textstyle]: https://github.com/phaserjs/phaser/blob/v4.2.1/src/gameobjects/text/TextStyle.js
[subset-font]: https://github.com/papandreou/subset-font
[harfbuzzjs]: https://github.com/harfbuzz/harfbuzzjs
[fontverter]: https://github.com/papandreou/fontverter
[wawoff2]: https://github.com/fontello/wawoff2
[fontkit]: https://github.com/foliojs/fontkit
[glyphhanger]: https://github.com/zachleat/glyphhanger
[fonttools]: https://github.com/fonttools/fonttools
[vpf]: https://github.com/KonghaYao/cn-font-split/blob/release/packages/vite/README.md
[cnfs]: https://www.npmjs.com/package/cn-font-split
[unplugin-fonts]: https://www.npmjs.com/package/unplugin-fonts
[fontsource-klee]: https://www.npmjs.com/package/@fontsource/klee-one
[ot-aalt]: https://learn.microsoft.com/en-us/typography/opentype/spec/features_ae#tag-aalt
[css-default-features]: https://drafts.csswg.org/css-fonts-4/#default-features
[css-fl-load]: https://drafts.csswg.org/css-font-loading/#font-face-load
[css-fl-check]: https://drafts.csswg.org/css-font-loading/#font-face-set-check
[csp-effective]: https://www.w3.org/TR/CSP3/#effective-directive-for-a-request
[csp-match]: https://www.w3.org/TR/CSP3/#match-url-to-source-expression
[mdn-canvas-font]: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font
[vite-assets]: https://vite.dev/guide/assets
[vite-inline]: https://vite.dev/config/build-options#build-assetsinlinelimit
[npm-prepost]: https://docs.npmjs.com/cli/v11/using-npm/scripts#pre--post-scripts
[pwa-assets]: https://vite-pwa-org.netlify.app/guide/static-assets.html
[whatwg-jis]: https://encoding.spec.whatwg.org/index-jis0208.txt

- Font e licenze: [google/fonts][gf], [OFL-FAQ][ofl-faq], [OpenType `aalt`][ot-aalt], [CSS Fonts 4 §7.1][css-default-features].
- Suite: [FarmPlush (header CSP)][suite-farm], [CSS FarmPlush][suite-farm-css], [JS FarmPlush][suite-farm-js], [CSS Balosso][suite-balosso-css], [jp.html][suite-jp], [style.css][suite-css].
- Phaser 4.2.1: [FontFile.js][phaser-fontfile], [File.js][phaser-file], [Text.js][phaser-text], [TextStyle.js][phaser-textstyle].
- Riduzione: [subset-font][subset-font], [harfbuzzjs][harfbuzzjs], [fontverter][fontverter], [wawoff2][wawoff2], [fontkit][fontkit], [glyphhanger][glyphhanger], [fonttools][fonttools], [vite-plugin-font][vpf], [cn-font-split][cnfs], [unplugin-fonts][unplugin-fonts], [@fontsource/klee-one][fontsource-klee].
- Browser e build: [CSS Font Loading][css-fl-load], [CSP3 §6.8.1][csp-effective], [CSP3 §6.7.2.8][csp-match], [MDN canvas font][mdn-canvas-font], [Vite asset][vite-assets], [Vite assetsInlineLimit][vite-inline], [npm pre/post script][npm-prepost], [vite-plugin-pwa][pwa-assets], [WHATWG JIS0208][whatwg-jis].
