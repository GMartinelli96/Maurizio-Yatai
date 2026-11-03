# 34: Una Serata che cambia: ondate e Serie

**What to build:** Dalla prima prova (ticket 05): "lento e prevedibile". I Clienti arrivano a intervalli casuali ma tutti uguali, quindi la Serata è piatta dall'inizio alla fine e non c'è un momento in cui il cuore batte più forte. Qui la Serata prende un andamento, con la skill `game-feel` per i riscontri e `level-design` per il ritmo (tensione e riposo):

- **Ondate**: l'arrivo dei Clienti segue una curva descritta nei dati (per esempio calma, ondata, respiro, ondata finale) invece di un solo intervallo fisso. Nell'ondata i Posti si riempiono e la Pazienza conta davvero. Il ritmo da cui partono è quello della cucina a tocchi (ticket 33): un onigiri sono 3 tocchi, un takoyaki 4 più la cottura, quindi un Cliente costa più tocchi di prima.
- **Serie**: servire più Clienti di fila senza farne scuotere la testa e senza perderne nessuno fa salire una Serie; la Serie dà Mancia in più e un riscontro che cresce (monete, Maurizio, un tintinnio). Se un Cliente se ne va o si serve a vuoto, la Serie si spezza, senza punizioni.

Giuseppe ha scelto (2026-11-03, vedi `## Comments`): entrano ondate e Serie, il Cliente che chiede in fretta no (è in `BACKLOG.md`). Le regole sono in GAME_SPEC.md ("La Serata", voci Ondate e Serie) e i termini **Ondata** e **Serie** in GLOSSARY.md.

**Blocked by:** 05 ([con te] La prima prova: è divertente?)

**Status:** ready-for-agent

- [x] Giuseppe ha scelto quali meccaniche entrano, e le regole sono in GAME_SPEC.md e GLOSSARY.md prima del codice.
- [ ] La curva di arrivo è descritta nei dati (quattro fasi: calma 0–30 s, ondata 30–55 s, respiro 55–80 s, ondata finale 80–120 s, con gli intervalli della spec) e, con lo stesso seme, la Serata è sempre la stessa (test ripetibile). Una sola curva per tutti: ogni Serata futura potrà avere la sua (ticket 12). In un'ondata cambiano la frequenza degli arrivi **e la Pazienza** dei Clienti che arrivano durante l'ondata: 15 s invece di 25, sempre 5 cuoricini che durano un quinto ciascuno (mappa `yatai-serata-che-cambia`, ticket 02); un Cliente arrivato in ondata tiene i suoi 15 s anche se l'ondata finisce. Pazienza, intervalli e fasi sono in `config.js`.
- [ ] Un segnale visivo, senza testo, avvisa circa 2 secondi prima di ogni ondata (anche la finale); il suono è del ticket 23.
- [ ] La Serie ha il suo conto nella logica, nei riscontri e in `render_game_to_text()`. Sale di 1 a ogni Ordine servito (il Bis conta due) e si spezza solo con un Cliente perso o un Ordine servito a vuoto: un tocco fuori ordine su una Scorta e un Piatto bruciato non la spezzano (con test).
- [ ] La Serie dà +10% di Mancia per Cliente di fila oltre il primo, tetto ×1,5 a 6, e si moltiplica con Che stile!, Yen d'oro e desideri senza altro tetto (con test). Non tocca prezzo né Spesa.
- [ ] La Serie si vede con un numero vicino a Maurizio, monete più generose e un tintinnio che sale; quando si spezza, un "pof" morbido, senza punizioni. Si azzera a ogni Serata e non si salva. Il recap ha la "Serie più lunga" (ticket 22).
- [ ] La Serata non è più prevedibile: due semi diversi hanno ondate in punti diversi (confini mossi di ±5 s) ma sempre giocabili, e nessuno è impossibile per un giocatore lento; con lo stesso seme la Serata è identica (test).
- [ ] Il bot senza browser (`giocaServata` in `test/serata.test.js`, esteso con la curva e la Serie) mostra che la bravura conta. Bersagli sulla **media di 6 semi** (`a`-`f`), con Hanami, 3 Posti, obiettivo 1920 (misure della mappa `yatai-serata-che-cambia`, tra parentesi):
  - il rapido (0,6 s) prende ★★★ (≥ 3072) e serve almeno 15 Clienti più del lento (misura: 40,0 contro 21,0; incasso 5053);
  - il lento (1,4 s) prende ★ (≥ 1920) ma non ★★ (< 2496) (misura: 2146); può perdere qualche Cliente in ondata (misura: 3,5), e nessun test lo vieta né lo richiede;
  - l'attento (1,0 s) incassa almeno il 40% più del lento e meno del rapido (misura: 3323, +55% e −34%); il bot non spezza mai la Serie, quindi prende ★★★: non è un criterio che prenda ★★;
  - il rapido non serve tutti i Clienti: serviti < arrivati (misura: circa 40 su 42);
  - la Mancia extra della Serie non supera il 15% dell'Incasso del rapido (misura: 13,9%);
  - lo stesso vale con 4 Posti e col ventaglio (+Pazienza): il lento prende ★, il rapido ★★★ (misura con 4 Posti: 5035 / 3201 / 2056; il ventaglio a +20% è un'ipotesi, i numeri veri sono del ticket 35).
  - I numeri sono provvisori fino al ticket 29; se si toccano la Pazienza in ondata o la Serie vanno rimisurati (il lento a 18 s in ondata, senza Serie, scendeva a 1909, sotto ★).
- [ ] Le ondate sono calibrate sul ritmo a tocchi (tocchi per Cliente della cucina del ticket 33, non sul vecchio "un tocco, cuoce da solo") e l'Incasso è il netto (Vendite meno Spesa): la Mancia della Serie conta nelle Vendite.
- [ ] Nessun game over a metà Serata e le stelle restano su Incasso e obiettivo. I numeri nuovi sono in `config.js` e i testi nuovi sono in italiano, inglese e giapponese.
- [ ] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero e la console non ha errori.

## Comments

### Dalla mappa yatai-economia-e-cucina (2026-11-03)

Ricaduta del ticket 02 della mappa (cucina a tocchi). Cambiato: la frase sulle ondate in "What to build" e un criterio nuovo sul calibrare la curva sul ritmo a tocchi e sull'Incasso netto.

Per coerenza, non nelle ricadute: un tocco fuori ordine su una Scorta "non fa niente" (regola del ticket 02), quindi non conta come "servire a vuoto" e non spezza la Serie; costa solo il tempo perso. Confermato da Giuseppe qui sotto.

### Scelte di Giuseppe (2026-11-03, sessione di domande in tre round)

- Entrano **ondate** e **Serie**. Il Cliente che chiede in fretta no: ripete Carlotta e si sovrappone al Lamento (ticket 36); è in `BACKLOG.md`.
- Si decidono le regole subito, in `GAME_SPEC.md` e `GLOSSARY.md`; i numeri sono di partenza e si ritoccano **dopo che Giuseppe ha provato il 33 sul telefono**, poi nel ticket 29.
- Ondate: quattro fasi, una curva comune, confini spostati dal seme di circa ±5 s, cambia solo la frequenza degli arrivi, segnale visivo 2 s prima.
- Serie: +1 a ogni Ordine servito (il Bis di Marcella conta due), si spezza solo con un Cliente perso o un servizio a vuoto (non con tocchi fuori ordine né con Piatti bruciati); +10% di Mancia per Cliente di fila oltre il primo, tetto ×1,5 a 6; moltiplicatori cumulabili senza tetto unico; numero vicino a Maurizio, tintinnio crescente, "pof" quando si spezza; si azzera a ogni Serata; "Serie più lunga" nel recap.
- Fuori da questo ticket: le curve per Serata e Matsuri e quelle morbide delle prime Serate (ticket 12 e 29); i suoni (23); il recap e i Titoli (22); il controllo che la Mancia totale non diventi troppo generosa (29). Con Che stile! il "+9% al massimo" della spec non vale più se c'è anche la Serie: lo ricontrolla il 29.

### Dalla mappa yatai-serata-che-cambia (2026-11-03)

Cambiato: due criteri (la curva e il bot). Giuseppe ha chiuso la mappa `yatai-serata-che-cambia`; i ticket 01, 03 e 04 erano già nelle "Scelte di Giuseppe" qui sopra, il 02 e il 05 aggiungono:

- **La sola frequenza non bastava** (misura con il bot, ticket 02): con 3 Posti e 25 s nessun Cliente si perdeva e il lento serviva 21 Clienti qualunque fosse la curva. Per questo, in un'ondata, **la Pazienza dei Clienti che arrivano è di 15 s invece di 25**, e la riga "cambia solo la frequenza" qui sopra è superata. Scartati: ricambio del Posto più corto, ondata più fitta o più lunga.
- **Da costruire:** cinque cuoricini sempre, ma ognuno dura un quinto della Pazienza *di quel Cliente* (oggi `cuoriDa` in `Serata.js` usa la durata globale `PAZIENZA.durationSec`): serve una durata per Cliente. Il Lamento (ticket 36) lavora già sui cuoricini rimasti, quindi vale così com'è.
- **Serie e obiettivo non cambiano** (Serie come scritta, obiettivo dell'Hanami 1920). Il bot attento, che non sbaglia mai, prende ★★★ (3323): il traguardo "l'attento ★★" è caduto, e i bersagli sono ora i criteri qui sopra, sulla media di 6 semi.
- **Domanda ancora aperta (ticket 26):** come cambia il segnale dell'ondata (la campanella oscilla) con "riduci movimento".
