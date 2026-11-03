# 36: I Clienti si lamentano: la faccia, la goccia, lo sbuffo

**What to build:** Dalla recensione della demo del ticket 04: "quando i cuori scendono sotto il terzo i Clienti si lamentano, con espressioni sempre più scocciate". La regola è decisa nel ticket 03 della mappa `yatai-economia-e-cucina` (`resolved`, 2026-11-03), scritta in GAME_SPEC.md ("Clienti", voce **Lamento**) e in GLOSSARY.md (**Lamento**, **Pazienza**). Skill `game-feel`. Non dipende dalla cucina a tocchi (ticket 33).

Cosa c'è da costruire:

- **Quattro espressioni, soglie sui cuoricini rimasti.** Con 5, 4 e 3 cuoricini il Cliente è `neutra` (come oggi). Con 2 è `perplessa` (faccia nuova). Con 1 è `imbronciata` (la faccia che c'è già) e resta tale quando se ne va. Servito è `contenta`. L'espressione dipende dai cuoricini, non dal tempo, quindi segue da sola i Vizi che cambiano la velocità della Pazienza.
- **I cuoricini non cambiano**: si spengono come oggi e l'ultimo lampeggia già. Il lavoro in più lo fa la faccia.
- **Il Lamento è senza parole**: la faccia più un segno, una goccia di sudore a 2 cuoricini e uno sbuffo d'aria a 1 cuoricino. Nessun fumetto con parole, quindi nessun testo da tradurre.
- **Tono per tutte le età**: scocciato ma buffo, con guance un po' gonfie, sopracciglia inclinate e bocca a onda. Niente occhi rabbiosi, denti o venuzze di rabbia; l'unica eccezione è il piccolo segno rosso già presente sull'`imbronciata` approvata, che resta com'è.
- **Tutti i Clienti usano lo stesso schema**, i sette del cast compresi (la `perplessa` del cast arriva con il ticket 09). Qui si disegna solo la `perplessa` dei tre Clienti di passaggio, col kit e con lo stesso seme del tremolio del corpo, così il peluche non "salta" quando cambia faccia. Tanuki, kitsune e maneki-neko non si ridisegnano.
- **Il "mmh"** (suono morbido, una volta per scalino e per Cliente) non si fa qui: è del ticket 23. Qui la logica o la vista emette un evento di Lamento, una volta per scalino e per Cliente, che l'audio userà.
- **"Riduci movimento"** (ticket 26): la faccia cambia comunque; goccia e sbuffo restano fissi. Il modo fisso arriva con il 26, ma qui goccia e sbuffo vanno animati da un punto solo che il 26 possa spegnere.

**Blocked by:** 05 ([con te] La prima prova: è divertente?)

**Status:** ready-for-agent

- [x] Giuseppe ha deciso che fare della "venetta" (2026-11-03, vedi `## Comments`): l'`imbronciata` approvata non si tocca.
- [ ] La `perplessa` di tanuki, kitsune e maneki-neko è disegnata col kit, con lo stesso seme del corpo, senza venetta; le impronte delle tre espressioni approvate dei tre Clienti restano invariate, con test.
- [ ] La logica della Serata sceglie l'espressione dai cuoricini rimasti (5-3 `neutra`, 2 `perplessa`, 1 `imbronciata`, servito `contenta`); le soglie (2 e 1) sono in `config.js`; test senza browser, anche con una Pazienza che scende a velocità diversa (l'espressione segue i cuoricini, non il tempo).
- [ ] Un evento di Lamento parte una volta per scalino e per Cliente (con test), pronto per il "mmh" del ticket 23.
- [ ] La vista del Cliente cambia faccia a ogni scalino e mostra la goccia (2 cuoricini) e lo sbuffo (1 cuoricino); i cuoricini restano come oggi e la Mancia resta leggibile.
- [ ] A 360×640, con tre Posti pieni a scalini diversi, faccia e segni si leggono e non coprono la nuvoletta dell'Ordine né i cuoricini (screenshot guardati).
- [ ] `render_game_to_text()` mostra per ogni Cliente l'espressione e il segno attivo (goccia, sbuffo, nessuno).
- [ ] Nessun testo nuovo (niente fumetti con parole); i numeri nuovi sono in `config.js`.
- [ ] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero, lo stato nuovo compare in `window.render_game_to_text()` e la console non ha errori.

## Comments

### Dalla mappa yatai-economia-e-cucina, ticket 03 (2026-11-03)

Ticket creato applicando le ricadute della mappa ([ticket 03](../../yatai-economia-e-cucina/issues/03-clienti-che-si-lamentano.md), `## Answer`). La mappa lo chiamava "33": quel numero era già preso, e questo è il primo libero (la mappa dice di guardare la cartella al momento di crearlo). Blocca il 06 e il 09, come ogni correzione nata dalla prima prova (ticket 05).

**Punto aperto, trovato leggendo `yatai/src/disegni/clienti.js` (non è nella mappa).** L'`imbronciata` approvata ha già la "venetta" (`venetta()`, righe 132-142 e 347): quattro angolini rossi sopra la testa, il segno di rabbia dei fumetti. Ma la decisione 4 del ticket 03 dice "niente venuzze di rabbia" e la decisione 5 dice di riusare l'`imbronciata` con le impronte invariate. Le due cose non stanno insieme: con 1 cuoricino la faccia avrebbe proprio la venetta.

**Deciso con Giuseppe (2026-11-03): si resta così.** L'`imbronciata` approvata non si tocca, venetta compresa, e GAME_SPEC.md (Clienti, Lamento) ammette quel piccolo segno rosso come unica eccezione. La `perplessa` nuova non ha la venetta. Scartate: una `imbronciata` senza venetta a 1 cuoricino (cambiavano le impronte o nasceva una quinta espressione) e togliere la venetta (cambiavano le impronte approvate).

Da fare in questo ticket: aggiornare il commento in cima a `clienti.js` (da tre a quattro espressioni).

Il ticket 33 sta modificando `Serata.js`, `config.js`, `SerataScene.js` e i test: questo ticket tocca gli stessi file, meglio iniziarlo quando il 33 è unito.
