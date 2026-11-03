# Skill e prompt per rifare i giochi di Maurizio

Ricerca del 2026-11-02. Il documento va letto insieme all'analisi di stile che sta facendo l'altra sessione: i segnaposto `{{STILE}}` qui sotto vanno riempiti con quella.

> **Aggiornamento del 2026-11-03:** per **Maurizio Yatai** si è deciso di usare **Phaser 4.2**, la versione delle skill (vedi `docs/adr/0002-phaser-4-invece-di-phaser-3.md`). Le indicazioni su "Phaser 3.90 per tutto" più sotto valgono solo per eventuali rifacimenti dei giochi già esistenti.

## 0. Stack attuale dei giochi (verificato sui bundle online)

| Gioco | Tecnologia | Note |
|---|---|---|
| FarmPlush | **Phaser 3.90.0** + Vite | touch + pointer, WebAudio, localStorage |
| Nella Bug Saga | Phaser 3.90 + Vite | idem |
| Maurizio Picchia Duro | Phaser 3.90 + Vite | idem |
| Balosso Tank Battalion | Phaser 3.90 + Vite | idem |
| Super Maurizio | Phaser 3.90 + Vite | idem |
| Filippo mangia il sedano | **Construct 3** (export HTML5, service worker) | non c'è sorgente JS leggibile, solo il runtime |
| Maurizio Battaglia Stellare | Construct 3 | idem |
| Maurizio Pizza Run (mini) | Canvas vanilla | `js/orso-pizza.js` + `js/minigame.js` condiviso |
| Coccinella Apple Worm (mini) | Canvas vanilla | `js/coccinella-mele.js` + `js/minigame.js` |

**Conseguenza:** conviene uno stack unico **Phaser 3.90 + Vite** per tutto (anche per rifare i due giochi Construct), e il canvas vanilla solo per i mini-giochi. Le skill scritte per Phaser 4 vanno usate solo come riferimento, perché le API sono diverse.

---

## 1. Skill consigliate (in ordine di utilità)

### A. Base: `gamedev-skills/awesome-gamedev-agent-skills`
- 77 skill in formato SKILL.md, con un **router** che carica solo quelle adatte al motore e al compito. Circa 6,6k stelle, licenza Apache-2.0.
- Le più utili qui: `phaser-core`, `phaser-arcade-physics`, `game-feel`, `audio-design`, `game-ui-ux`, `input-systems`, `camera-systems`, `level-design`, generi `platformer`, `puzzle`, `tower-defense`, workflow `prototype-fast`.
- ⚠️ Le skill Phaser puntano a **Phaser 4.2**. Nel CLAUDE.md del progetto va scritto "usa le API di Phaser 3.90".
- Installazione (Claude Code):
  ```
  /plugin marketplace add gamedev-skills/awesome-gamedev-agent-skills
  /plugin install router@awesome-gamedev-agent-skills
  /plugin install web-engines@awesome-gamedev-agent-skills
  ```
  In alternativa: `npx skills add gamedev-skills/awesome-gamedev-agent-skills --list` (serve Node ≥ 22.20).

### B. Ciclo di test automatico: `develop-web-game` (nata nelle skill Codex di OpenAI, copiata in Claude Code)
- È il pezzo più utile per "far giocare" Claude ai giochi che costruisce. Il gioco deve esporre:
  - `window.render_game_to_text()`, che restituisce un JSON dello stato (abbastanza da giocare senza guardare lo schermo);
  - `window.advanceTime(ms)`, che fa avanzare il tempo in modo deterministico.
- Poi uno script Playwright manda raffiche di input, cattura screenshot ed errori di console, e ripete. Regola: si corregge il primo errore nuovo prima di andare avanti, e gli screenshot vanno guardati davvero.
- Funziona bene con il plugin Playwright MCP che hai già installato.
- Installazione: `npx skills add https://github.com/firecrawl/openai-skills --skill develop-web-game`. ⚠️ Gli script fanno riferimento a `$CODEX_HOME`: i percorsi vanno sistemati a mano. Il repo originale `openai/skills` è deprecato.
- Complemento ufficiale Anthropic: `anthropics/skills` → `webapp-testing` (Playwright in Python, Apache-2.0): `npx skills add https://github.com/anthropics/skills --skill webapp-testing`.

### C. Feeling di gioco: `m4bwav/game-juice`
- 3 skill: `juice-scan` (analizza e scrive `juice-report.md`), `juice-apply` (applica le modifiche dietro un toggle `JuiceSettings`, con riduzione del movimento) e `juice-principles`.
- Contenuti: screen shake, hit-stop, particelle, squash & stretch, coyote time, buffer degli input, suoni con pitch variato.
- ✅ Gli esempi web usano le **API di Phaser 3**, quindi è in linea con lo stack. ⚠️ Repo nuovissimo (0 stelle): leggi gli SKILL.md prima di usarlo.
- `/plugin marketplace add m4bwav/game-juice` → `/plugin install game-juice@game-juice`

### D. Riferimento per genere: `Yakoub-ai/phaser4-gamedev`
- 5 agenti, 26 skill, 10 comandi (`/phaser-gdd`, `/phaser-new`, `/phaser-playtest`…), MIT, 29 stelle.
- **9 archetipi** che coprono quasi tutta la suite: platformer, space shooter, match-3, tower defense, **fighting game**, endless runner, top-down, card, racing.
- ⚠️ È per Phaser 4: va usato come guida per la struttura dei generi, non per il codice da copiare.

### E. Alternative tutto-in-uno (scegline al massimo una)
- `Sudhanshu5669/Html5-Gamedev-Skill`: fa un'intervista → `GAME_SPEC.md` → `SYSTEMS.md` → costruisce un sistema alla volta, testato nel browser, con un commit per ognuno. Ha un "dev level" sandbox. Metodo solido, ma solo 13 stelle.
- `github/awesome-copilot` → skill `game-engine`: molto installata, generica (Canvas, Phaser, Three.js).
  `npx -y skills add github/awesome-copilot --skill game-engine --agent claude-code`

### F. Virale ma sconsigliato per questo progetto: `Donchitos/Claude-Code-Game-Studios`
- Circa 29k stelle: 49 agenti in una gerarchia da studio, 70+ skill. È pensato per Godot/Unity/Unreal ed è pesante. Il README stesso si chiede se produca "giochi o documenti". Al massimo si può prendere qualche idea di organizzazione.

---

## 2. I prompt virali e cosa se ne può riusare

### "Claude of Duty" (Matt Shumer, luglio 2026: oltre 1M di visualizzazioni)
- Schema: **un brief iniziale → sub-agenti, uno per funzionalità → un revisore visivo che confronta "alla cieca" con il riferimento → si ripete finché il revisore non è soddisfatto.** Repo MIT `mshumer/Claude-of-Duty` (`prompt.md`, `tools/capture.mjs`, `tools/playtest.mjs`).
- I numeri reali: i punteggi dei critici sono passati da 3,6 a 5,05 su 10, e "one-shot" voleva dire un solo brief, non una sola risposta. L'autore ha visto che **le passate sequenziali, con un solo responsabile per ogni area, funzionano meglio di quelle in parallelo.**
- **Adattamento per Maurizio:** il revisore non confronta con un gioco AAA ma con gli **screenshot dei giochi di Maurizio già online**, e la domanda diventa "sembra della stessa serie?".

### Lo schema "un solo file HTML" (Techpresso: 30 prompt, agentgames.dev)
Va bene per i **mini-giochi** (Pizza Run, Coccinella):
- un unico file HTML autonomo, JS vanilla, nessun asset esterno, suoni con WebAudio;
- `requestAnimationFrame` con delta time in secondi, limitato a 0.05;
- **tutti i numeri regolabili in un solo oggetto `CONFIG`** in cima allo script;
- si corregge **un difetto per messaggio**, e si salva una copia ogni volta che il gioco migliora.

### Le regole della Vibe Jam (levelsio, 2026: 945 giochi, 242k giocatori)
È una checklist utile per la parte "virale": **niente login, niente schermate di caricamento o download pesanti, si gioca subito, va bene dal browser del telefono.** Dato che il pubblico di Maurizio arriva da TikTok e Instagram, questo conta più della grafica.

---

## 3. Mappa gioco → genere → risorse

| Gioco | Genere | Skill e prompt di partenza |
|---|---|---|
| FarmPlush | gestionale / idle (fabbrica) | prompt Techpresso #26 "Idle/Clicker With Upgrades" come base, poi `game-ui-ux`; salvataggio in localStorage |
| Nella Bug Saga | **da confermare con l'analisi di stile** (salvataggio degli amici dagli insetti, c'è un pulsante "attacca") | `puzzle` o `tower-defense` a seconda del genere reale |
| Picchia Duro | picchiaduro 1v1 con selezione dei peluche | archetipo fighting di phaser4-gamedev; nel prompt servono: hurtbox e attack box separati, frame di startup/active/recovery, hitstun, combo con contatore, timer del round; hit-stop da `game-juice` |
| Balosso Tank Battalion | carri armati dall'alto + difesa della base (la pizza) | `phaser-arcade-physics` + `tower-defense`; mappe e nemici originali, è il genere che conta, non una copia del Tank Battalion Namco |
| Super Maurizio | platformer (salvare la gattina) | genere `platformer` + `camera-systems` + coyote time e buffer degli input |
| Filippo mangia il sedano | platformer / raccolta (oggi su Construct) | come sopra, rifatto in Phaser 3 |
| Battaglia Stellare | sparatutto spaziale (oggi su Construct) | archetipo space shooter + Techpresso #4 con boss a soglia di punteggio |
| Pizza Run (mini) | inseguimento in un labirinto | nessun prompt pronto: labirinto a griglia, nemici con pathfinding BFS e comportamenti diversi, power-up |
| Coccinella (mini) | snake | Techpresso #1 "Snake With Score and Speed Ramp" |

---

## 4. Prompt base "Maurizio" (sintesi di quanto sopra)

Da usare come brief iniziale per ogni gioco. Le parti `{{…}}` vanno riempite.

```text
Costruisci "{{NOME_GIOCO}}", un gioco browser della serie "I giochi di Maurizio"
(Maurizio è un orsetto di peluche influencer, salopette azzurra, stile morbido e tenero).

STACK (obbligatorio)
- Phaser 4.2 + Vite, ES modules, con le API di Phaser 4 (ADR-0002; per i rifacimenti dei giochi esistenti: Phaser 3.90).
- Scene: Boot → Menu → Game → GameOver. Nessuna schermata di caricamento > 1 s.
- Tutti i numeri regolabili in un unico CONFIG (src/config.js).

STILE
- {{STILE: palette, font, tono dei testi, look delle UI e dei personaggi, preso dall'analisi della suite}}
- Coerente con i giochi esistenti: {{URL/screenshot di riferimento}}

GAMEPLAY
- Genere: {{GENERE}}. Obiettivo: {{OBIETTIVO}}. Sconfitta: {{CONDIZIONE}}.
- Difficoltà crescente: {{CURVA}}. Una partita dura 1–3 minuti.

PIATTAFORME E INPUT
- Mobile-first (verticale se il genere lo permette) + tastiera su desktop.
- Comandi touch su schermo, aree grandi, nessun hover necessario.
- Audio sbloccato al primo tocco; pulsante mute; suoni sintetizzati (WebAudio/ZzFX), niente file audio.

FEELING DI GIOCO
- Screen shake leggero, particelle, squash & stretch, hit-stop sugli impatti,
  numeri che fluttuano, pitch variato. Tutto dentro JuiceSettings con "riduci movimento".

VIRALITÀ
- Si gioca subito, senza login. Record in localStorage.
- Schermata finale con punteggio + pulsante "Condividi" (Web Share API, con link come fallback)
  e frase da condividere stile "Ho fatto {{PUNTI}} a {{NOME_GIOCO}}! Mi batti?".
- Testi in IT/EN/JP (come il sito), selezionati da navigator.language.

TESTABILITÀ (obbligatoria)
- Esponi window.render_game_to_text() → JSON con lo stato essenziale.
- Esponi window.advanceTime(ms) → avanza la simulazione in modo deterministico a 60 fps.

PROCESSO
1. Prima scrivi GAME_SPEC.md (max 1 pagina) e aspetta l'ok.
2. Costruisci un sistema alla volta; dopo ognuno, verifica con Playwright:
   input → advanceTime → screenshot + render_game_to_text + errori di console.
   Correggi il primo errore nuovo prima di proseguire.
3. Alla fine un revisore separato confronta gli screenshot con quelli dei giochi
   di Maurizio esistenti: "sembra della stessa serie?". Se no, ripeti la rifinitura.
```

---

## 5. Cosa manca e conviene creare

Non esiste una skill pronta per lo "stile di casa Maurizio". La cosa più utile è creare **una skill di progetto** in `.claude/skills/maurizio-game/SKILL.md` che contenga:
1. l'analisi di stile dell'altra sessione (palette, tono, personaggi, UI);
2. il prompt base della sezione 4;
3. lo scaffold Phaser 3.90 + Vite con gli hook `render_game_to_text` e `advanceTime` già pronti;
4. lo script Playwright di playtest (adattato da `develop-web-game`).

Così ogni nuovo gioco parte con lo stesso stile e lo stesso ciclo di test.

### Avvertenze
- Le skill di terzi danno istruzioni e script a Claude: **leggi gli SKILL.md prima di installarle**, soprattutto quelle con poche stelle (game-juice, Html5-Gamedev-Skill, phaser4-gamedev).
- Le demo "one-shot" sono prototipi. Enterprise DNA consiglia di ridurre del 50% le aspettative che danno.

---

## Fonti
- gamedev-skills: https://github.com/gamedev-skills/awesome-gamedev-agent-skills
- phaser4-gamedev: https://github.com/Yakoub-ai/phaser4-gamedev
- game-juice: https://github.com/m4bwav/game-juice
- develop-web-game (mirror): https://smithery.ai/skills/davila7/develop-web-game · https://mcp.directory/skills/develop-web-game
- webapp-testing (Anthropic): https://github.com/anthropics/skills/tree/main/skills/webapp-testing
- Html5-Gamedev-Skill: https://github.com/Sudhanshu5669/Html5-Gamedev-Skill
- awesome-copilot game-engine: https://github.com/github/awesome-copilot/tree/main/skills/game-engine
- Claude-Code-Game-Studios: https://github.com/donchitos/claude-code-game-studios
- Claude of Duty: https://github.com/mshumer/Claude-of-Duty · analisi critica: https://enterprisedna.co/resources/ai-pulse/ai-pulse-2026-07-27-claude-of-duty-one-shot-fps-demo-gets-a-skeptical-reality-ch/
- 30 prompt Techpresso: https://academy.techpresso.co/prompts/claude-prompts-games
- Agent Games, guida e prompt: https://agentgames.dev/blog/how-to-make-a-game-with-claude
- Vibe Jam 2026: https://vibejam.com/
- ZzFX: https://github.com/KilledByAPixel/ZzFX
