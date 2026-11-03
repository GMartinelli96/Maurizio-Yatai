# Maurizio Yatai: piano di implementazione

Cosa costruire: [GAME_SPEC.md](./GAME_SPEC.md). Vocabolario da usare nel codice: [GLOSSARY.md](./GLOSSARY.md).

## Regole per ogni passo
- Prima di scrivere codice si parte dalla skill `router`, che sceglie le skill in `.claude/skills/`. Le skill sono già scritte per Phaser 4.2, quindi valgono così come sono.
- Si costruisce **un sistema alla volta**. Dopo ognuno si verifica con Playwright:
  1. si mandano gli input;
  2. si fa avanzare il tempo con `window.advanceTime(ms)`;
  3. si raccolgono uno screenshot, lo stato da `window.render_game_to_text()` e gli errori della console.

  Si corregge il primo errore nuovo prima di andare avanti, e gli screenshot si guardano davvero.
- Ogni sistema nuovo che contiene logica (code, timer, economia) ha un piccolo test automatico.
- Tutti i numeri di bilanciamento stanno in `src/config.js`.

## Passi

| # | Sistema | Skill principali | Fatto quando |
|---|---|---|---|
| 0 | Struttura del progetto in `yatai/`: Vite + `phaser@4.2.1`, installazione come app con funzionamento offline, `config.js`, testi nelle tre lingue, gli hook di test e lo script di playtest Playwright | `router`, `phaser-core` | parte una scena vuota, gli hook rispondono e lo script di playtest gira |
| 1 | **Kit di disegno "a matita"**: linee tremolanti, riempimenti a pastello, carta ruvida, font scritto a mano. Le immagini vengono generate all'avvio | `create-game-assets` | una tavola di prova con Maurizio e un Piatto, messa a confronto con gli screenshot della suite |
| 2 | Lo Yatai in verticale: Posti, Bancone, Postazioni, Maurizio che si anima; adattamento a schermi diversi e colonna centrata su computer | `game-ui-ux` | è leggibile a 360×640 e a 1280×720 |
| 3 | **Serata con l'onigiri**: Clienti di passaggio, Ordini, Pazienza, Mancia, Incasso, timer, stelle, schermata di fine Serata | `input-systems`, `game-feel` | **prima versione giocabile: si fa provare all'utente ("è divertente?")** |
| 4 | Cottura e bruciatura con i takoyaki: Fumo, cestino, Ordini da più Piatti | `game-feel` | si brucia, c'è il Fumo e un Ordine da 2 Piatti si serve |
| 5 | Kakigōri, ramen e taiyaki con le varianti e le loro icone | – | tutti e 5 i Piatti si giocano |
| 6 | Il cast e i Vizi, compreso il Bis | `game-ai` (solo per l'arrivo dei Clienti) | ogni Vizio ha il suo test |
| 7 | Disturbatori: Croccola, formiche e corvi | `game-feel` | coccolare e scacciare funzionano, e anche il furto e il Piatto rovinato |
| 8 | I 5 Matsuri: sfondi, mappa delle Serate, Gran Serate ed Eventi, curva di difficoltà descritta nei dati | `level-design` | si giocano tutte e 30 le Serate |
| 9 | Progressione: Yen, Potenziamenti, Arredo, Vestiti, Che stile!, salvataggio | `save-systems` | i progressi sopravvivono al ricaricamento della pagina |
| 10 | Tutorial, Ricettario, Titoli, Condividi | `game-ui-ux` | un nuovo giocatore capisce senza leggere istruzioni |
| 11 | Audio: musica pentatonica per ogni Matsuri ed effetti; si sblocca al primo tocco, M per la musica | `audio-design` | nessun file audio, e il tasto M funziona |
| 12 | Tre lingue complete, con il font giapponese ridotto ai soli caratteri usati | – | tutti i testi sono nelle tre lingue e il gioco resta leggero |
| 13 | Accessibilità (tasti rapidi, riduci movimento), funzionamento offline, prestazioni su un telefono medio | `performance-optimization` | 60 fps su un telefono di fascia media, e il gioco si installa |
| 14 | **Revisione di stile**: un agente separato confronta gli screenshot con quelli dei giochi di Maurizio ("sembra della stessa serie?"), poi si bilancia | – | il revisore dice di sì |
| 15 | Pacchetto regalo: versione pronta, LEGGIMI con le differenze tra Phaser 3 e 4, testo della scheda per la homepage nelle tre lingue più i dati JSON-LD, archivio zip | – | il pacchetto completo è pronto |

## Momenti in cui serve l'utente
- Dopo il **passo 1**: lo stile a matita va bene?
- Dopo il **passo 3**: la prima versione giocabile è divertente?
- Dopo il **passo 14**: si fa l'ultimo giro prima del regalo.
