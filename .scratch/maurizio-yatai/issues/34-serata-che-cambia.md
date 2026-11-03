# 34: Una Serata che cambia: ondate e Serie

**What to build:** Dalla prima prova (ticket 05): "lento e prevedibile". I Clienti arrivano a intervalli casuali ma tutti uguali, quindi la Serata è piatta dall'inizio alla fine e non c'è un momento in cui il cuore batte più forte. Qui la Serata prende un andamento, con la skill `game-feel` per i riscontri e `level-design` per il ritmo (tensione e riposo):

- **Ondate**: l'arrivo dei Clienti segue una curva descritta nei dati (per esempio calma, ondata, respiro, ondata finale) invece di un solo intervallo fisso. Nell'ondata i Posti si riempiono e la Pazienza conta davvero. Il ritmo da cui partono è quello della cucina a tocchi (ticket 33): un onigiri sono 3 tocchi, un takoyaki 4 più la cottura, quindi un Cliente costa più tocchi di prima.
- **Serie**: servire più Clienti di fila senza farne scuotere la testa e senza perderne nessuno fa salire una Serie; la Serie dà Mancia in più e un riscontro che cresce (monete, Maurizio, un tintinnio). Se un Cliente se ne va o si serve a vuoto, la Serie si spezza, senza punizioni.

Prima di scrivere codice Giuseppe sceglie quali delle due (o altre, per esempio un Cliente che chiede in fretta) vuole davvero: le regole nuove vanno in GAME_SPEC.md ("La Serata") e i termini nuovi in GLOSSARY.md con `/domain-modeling`; "Serie" non c'è ancora.

**Blocked by:** 05 ([con te] La prima prova: è divertente?)

**Status:** ready-for-agent

- [ ] Giuseppe ha scelto quali meccaniche entrano, e le regole sono in GAME_SPEC.md e GLOSSARY.md prima del codice.
- [ ] La curva di arrivo è descritta nei dati e, con lo stesso seme, la Serata è sempre la stessa (test ripetibile). Ogni Serata futura potrà avere la sua curva (ticket 12).
- [ ] La Serie ha il suo conto nella logica, nei riscontri e in `render_game_to_text()`, e si spezza come dice la regola.
- [ ] La Serata non è più prevedibile: due semi diversi hanno ondate in punti diversi (o la curva ha una parte casuale) ma sempre giocabili, e nessuno è impossibile per un giocatore lento.
- [ ] Il bot senza browser (`giocaServata` in `test/serata.test.js`) mostra che la bravura conta: chi è rapido incassa più di chi è lento, anche con la Serie.
- [ ] Le ondate sono calibrate sul ritmo a tocchi (tocchi per Cliente della cucina del ticket 33, non sul vecchio "un tocco, cuoce da solo") e l'Incasso è il netto (Vendite meno Spesa): la Mancia della Serie conta nelle Vendite.
- [ ] Nessun game over a metà Serata e le stelle restano su Incasso e obiettivo. I numeri nuovi sono in `config.js` e i testi nuovi sono in italiano, inglese e giapponese.
- [ ] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero e la console non ha errori.

## Comments

### Dalla mappa yatai-economia-e-cucina (2026-11-03)

Ricaduta del ticket 02 della mappa (cucina a tocchi). Cambiato: la frase sulle ondate in "What to build" e un criterio nuovo sul calibrare la curva sul ritmo a tocchi e sull'Incasso netto.

Per coerenza, non nelle ricadute: un tocco fuori ordine su una Scorta "non fa niente" (regola del ticket 02), quindi non conta come "servire a vuoto" e non spezza la Serie; costa solo il tempo perso. Da confermare quando Giuseppe sceglie le regole della Serie.
