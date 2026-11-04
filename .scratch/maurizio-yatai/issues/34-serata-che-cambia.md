# 34: Una Serata che cambia: ondate e Serie

**What to build:** Dalla prima prova (ticket 05): "lento e prevedibile". I Clienti arrivano a intervalli casuali ma tutti uguali, quindi la Serata è piatta dall'inizio alla fine e non c'è un momento in cui il cuore batte più forte. Qui la Serata prende un andamento, con la skill `game-feel` per i riscontri e `level-design` per il ritmo (tensione e riposo):

- **Ondate**: l'arrivo dei Clienti segue una curva descritta nei dati (per esempio calma, ondata, respiro, ondata finale) invece di un solo intervallo fisso. Nell'ondata i Posti si riempiono e la Pazienza conta davvero. Il ritmo da cui partono è quello della cucina a tocchi (ticket 33): un onigiri sono 3 tocchi, un takoyaki 4 più la cottura, quindi un Cliente costa più tocchi di prima.
- **Serie**: servire più Clienti di fila senza farne scuotere la testa e senza perderne nessuno fa salire una Serie; la Serie dà Mancia in più e un riscontro che cresce (monete, Maurizio, un tintinnio). Se un Cliente se ne va o si serve a vuoto, la Serie si spezza, senza punizioni.

Giuseppe ha scelto (2026-11-03, vedi `## Comments`): entrano ondate e Serie, il Cliente che chiede in fretta no (è in `BACKLOG.md`). Le regole sono in GAME_SPEC.md ("La Serata", voci Ondate e Serie) e i termini **Ondata** e **Serie** in GLOSSARY.md.

**Blocked by:** 05 ([con te] La prima prova: è divertente?)

**Status:** ready-for-agent

- [x] Giuseppe ha scelto quali meccaniche entrano, e le regole sono in GAME_SPEC.md e GLOSSARY.md prima del codice.
- [x] La curva di arrivo è descritta nei dati (quattro fasi: calma 0–30 s, ondata 30–55 s, respiro 55–80 s, ondata finale 80–120 s, con gli intervalli della spec) e, con lo stesso seme, la Serata è sempre la stessa (test ripetibile). Una sola curva per tutti: ogni Serata futura potrà avere la sua (ticket 12). In un'ondata cambiano la frequenza degli arrivi **e la Pazienza** dei Clienti che arrivano durante l'ondata: 15 s invece di 25, sempre 5 cuoricini che durano un quinto ciascuno (mappa `yatai-serata-che-cambia`, ticket 02); un Cliente arrivato in ondata tiene i suoi 15 s anche se l'ondata finisce. Pazienza, intervalli e fasi sono in `config.js`.
- [x] Un segnale visivo, senza testo, avvisa circa 2 secondi prima di ogni ondata (anche la finale); il suono è del ticket 23.
- [ ] La Serie ha il suo conto nella logica, nei riscontri e in `render_game_to_text()`. Sale di 1 a ogni Ordine servito (il Bis conta due) e si spezza solo con un Cliente perso o un Ordine servito a vuoto: un tocco fuori ordine su una Scorta e un Piatto bruciato non la spezzano (con test).
- [x] La Serie dà +10% di Mancia per Cliente di fila oltre il primo, tetto ×1,5 a 6, e si moltiplica con Che stile!, Yen d'oro e desideri senza altro tetto (con test). Non tocca prezzo né Spesa.
- [ ] La Serie si vede con un numero vicino a Maurizio, monete più generose e un tintinnio che sale; quando si spezza, un "pof" morbido, senza punizioni. Si azzera a ogni Serata e non si salva. Il recap ha la "Serie più lunga" (ticket 22).
- [x] La Serata non è più prevedibile: due semi diversi hanno ondate in punti diversi (confini mossi di ±5 s) ma sempre giocabili, e nessuno è impossibile per un giocatore lento; con lo stesso seme la Serata è identica (test).
- [x] Il bot senza browser (`giocaServata` in `test/serata.test.js`, esteso con la curva e la Serie) mostra che la bravura conta. Bersagli sulla **media di 6 semi** (`a`-`f`), con Hanami, 3 Posti, obiettivo 1920 (misure della mappa `yatai-serata-che-cambia`, tra parentesi):
  - il rapido (0,6 s) prende ★★★ (≥ 3072) e serve almeno 15 Clienti più del lento (misura: 40,0 contro 21,0; incasso 5053);
  - il lento (1,4 s) prende ★ (≥ 1920) ma non ★★ (< 2496) (misura: 2146); può perdere qualche Cliente in ondata (misura: 3,5), e nessun test lo vieta né lo richiede;
  - l'attento (1,0 s) incassa almeno il 40% più del lento e meno del rapido (misura: 3323, +55% e −34%); il bot non spezza mai la Serie, quindi prende ★★★: non è un criterio che prenda ★★;
  - il rapido non serve tutti i Clienti: serviti < arrivati (misura: circa 40 su 42);
  - la Mancia extra della Serie non supera il 15% dell'Incasso del rapido (misura: 13,9%);
  - lo stesso vale con 4 Posti e col ventaglio (+Pazienza): il lento prende ★, il rapido ★★★ (misura con 4 Posti: 5035 / 3201 / 2056; il ventaglio a +20% è un'ipotesi, i numeri veri sono del ticket 35).
  - I numeri sono provvisori fino al ticket 29; se si toccano la Pazienza in ondata o la Serie vanno rimisurati (il lento a 18 s in ondata, senza Serie, scendeva a 1909, sotto ★).
- [x] Le ondate sono calibrate sul ritmo a tocchi (tocchi per Cliente della cucina del ticket 33, non sul vecchio "un tocco, cuoce da solo") e l'Incasso è il netto (Vendite meno Spesa): la Mancia della Serie conta nelle Vendite.
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

### Passo 1: le ondate nella logica (2026-11-03)

Fatto: `ONDATE` in `config.js` (quattro fasi, intervalli, scarto del seme, Pazienza in ondata, anticipo del segnale), `fasiDellaSerata(seed)` e `Serata.andamento()` in `Serata.js`, `cuoriDa(rimastaMs, totaleMs)` con la durata per Cliente, `pazienzaTotaleMs` e `andamento` nello stato (quindi in `render_game_to_text()`). `CLIENTI.arrivoSec` non esiste più. Il bot senza Serie dà rapido 4302 / attento 2937 / lento 2035 (serviti 39,5 / 28,8 / 21,0, persi dal lento 3,5): coincide con le misure della mappa (4348 / 2935 / 2017). Mancano il segnale (passo 2), la Serie (passi 3 e 4) e i bersagli del bot (passo 5).

Effetti fuori dal ticket: la curva è una sola per tutti i Matsuri, quindi il Tanabata cambia (media di 6 semi: lento 2702, attento 3805, rapido 5578; il lento sul solo seme `prova` fa 2370, sotto ★ 2400). Giuseppe ha scelto di togliere quel controllo sul seme da `bruciatura.test.js` e di lasciare il ribilanciamento del Tanabata al ticket 29. Nello scenario `serata-lamento.json` (ticket 36) l'ultimo `finoA` è passato da 28000 a 30000, perché in calma il quinto Cliente arriva tra 27,8 e 29,3 s.

### Passo 2: il segnale prima dell'ondata (2026-11-03)

Fatto: l'evento `ondataInArrivo { fase, traMs }` (una volta per ondata, `ONDATE.avvisoSec` = 2 s prima, anche la finale) e `andamento.inAvviso` nello stato. Nella scena Maurizio alza la testa (posa nuova `guarda`: testa su, occhi in su, bocca a "o") per il tempo che manca più 0,6 s, e la campanella dello Yatai (disegno nuovo, ottone con fiocco rosa, appesa sotto la tendina a sinistra) oscilla per 1,9 s smorzandosi. Un'azione di Maurizio durante l'allerta ha la precedenza e poi torna la testa alzata. `render_game_to_text()` ha `campanella { x, y, angolo, oscilla }` e `maurizio.allerta`. Numeri in `RISCONTRI.segnaleOndata`; scenario `scenari/serata-segnale.json`.

"Riduci movimento" (ticket 26), come deciso: l'unico punto da spegnere è `SerataScene.oscillaCampanella()`; senza oscillazione il segnale resta la posa di Maurizio. Il suono si aggancia a `ondataInArrivo` (ticket 23).

### Passo 3: la Serie nella logica e nella Mancia, e i bersagli del bot (2026-11-03)

Fatto: `SERIE` in `config.js` (+10% per Cliente oltre il primo, tetto ×1,5), `moltiplicatoreSerie(serie)`, `calcolaMancia(prezzo, cuori, moltiplicatore)`. `Serata` conta `serie`, `serieMax` e `manciaDaSerie`: +1 a ogni Ordine servito (un Ordine da più Piatti conta uno; il Bis di Marcella, che conterà due, arriva con il cast, ticket 9 e 10), si spezza solo con un Cliente perso (`serieSpezzata`, motivo `clientePerso`) o un servizio a vuoto (`servizioAVuoto`); un tocco fuori ordine su una Scorta e un Piatto bruciato no. Il `servito` porta `serie` e `moltiplicatoreSerie`; lo stato e `serataFinita` portano la Serie e la più lunga (per il recap, ticket 22). Opzioni nuove di `Serata`: `moltiplicatoriMancia` (Che stile!, Yen d'oro, desideri: si moltiplicano con la Serie senza altro tetto), `posti` e `pazienzaMoltiplicatore` (4 Posti e ventaglio, per i bersagli e per i ticket 17 e 35).

Misure del bot con Serie e ondate, media di 6 semi (mappa tra parentesi): rapido 5005 (5053), attento 3325 (3323), lento 2171 (2146); serviti 39,5 / 28,8 / 21,0 su 42,3 / 31,8 / 27,2 arrivati; persi dal lento 3,5; Mancia della Serie 14,1% / 11,7% / 6,3% dell'Incasso (13,9 / 11,7 / 6,0). 4 Posti: 5012 / 3205 / 2086; ventaglio ×1,2: 5160 / 3410 / 2178; entrambi: 5112 / 3170 / 2100: il lento ha sempre ★ e il rapido ★★★. Il rapido è al 14,1% contro il tetto del 15%: poco margine, da riguardare se si tocca la Serie o l'Incasso.

Tanabata (stessa curva e stessa Serie, obiettivo 2400 invariato): lento 2746, attento 3910, rapido 5861. L'attento supera ★★★ (3840), come nell'Hanami; il test `bruciatura.test.js` chiede ora "almeno ★★ e meno del rapido". Da ribilanciare nel ticket 29.

Resta il passo 4: i riscontri della Serie (numero vicino a Maurizio, monete più generose, "pof"). In `SerataScene` c'è già il `case 'serieSpezzata'` come punto d'aggancio.

### Passo 4: i riscontri della Serie (2026-11-04)

Scelte di Giuseppe per il numero (2026-11-04): **a destra di Maurizio, a mezza altezza** (il lato libero, speculare alla campanella) e **giallo moneta, arcobaleno al tetto**.

Fatto: `RISCONTRI.serie` in `config.js` (posizione, corpo, colori, pop, "pof", monete extra) e il modulo senza Phaser `src/serata/riscontriSerie.js` (`serieVisibile`, `testoSerie`, `progressoSerie`, `corpoSerie`, `moneteDelPagamento`, `scalaSomma`), provato da `test/riscontri-serie.test.js`.
- **Il numero** "×N" (nessun testo da tradurre) compare dalla Serie 2, perché il primo Ordine di fila non ha bonus. Il corpo cresce da 46 a 78 px in proporzione a quanto la Mancia della Serie è vicina al tetto (×1,5, a 6 di fila), a ogni Ordine fa un pop, e al tetto le lettere prendono le cinque bande dell'arcobaleno della palette (con un pop più grande la prima volta). Oltre il tetto il numero continua a contare ma non cresce più.
- **Monete più generose**: fino a 3 monete in più per pagamento (3 a Serie 1, 4 a 2, 5 a 4, 7 a 6) e la scritta "+150" fino a 1,3 volte più grande, con il corpo (non la scala) così resta nitida. Senza Serie niente cambia.
- **Il "pof"**: quando la Serie si spezza (`serieSpezzata`, per Cliente perso o servizio a vuoto) il numero si gonfia e svanisce in 0,2 s e una nuvoletta rosa pallido, nuova texture `pof` (catalogo e `docs/stile/asset-manifest.json`), si apre e svanisce in 0,5 s. Rosa e rotonda apposta: non è il grigio del Fumo né l'azzurro del Lamento. Nessuna scossa, nessun rosso. Se il numero non si vedeva (Serie 1) non succede niente. A fine Serata il numero se ne va senza "pof"; la Serie più lunga la mostra il recap (ticket 22).
- `render_game_to_text()` ha `serie { valore, visibile, testo, x, y, scala, alpha, corpo, colore: 'oro' | 'arcobaleno', pof, ultimoPagamento { yen, monete, serie } }`; la Serie della logica resta in `serata.serie`. Scenario `scenari/serata-serie-riscontri.json`; visto a 360×640, 390×844 e 1280×720 (e 720×1280 per i dettagli).

Punti d'aggancio per gli altri ticket: il **tintinnio che sale** (ticket 23) si aggancia a `SerataScene.perSerieSale()`, dove `evento.serie` è lo scalino della scala; il suono del **"pof"** a `perSerieSpezzata()`. "Riduci movimento" (ticket 26): tutti i movimenti della Serie (entrata, pop, numero che svanisce, nuvoletta) passano da `SerataScene.animaSerie()`, l'unico punto da spegnere, come per la campanella; un test controlla che nessun tween tocchi il numero o il "pof" da un'altra parte.

Resta il passo 5, la chiusura: rileggere i criteri aperti (la Serie "nei riscontri", "Nessun game over... testi", "Verificato come dice PIANO.md") e spuntare solo quelli veri.
