# 01: La forma delle Ondate

**Type:** grilling
**Blocked by:** None
**Status:** resolved

## Question

Oggi i Clienti arrivano ogni 2,5-4,5 s a caso, tutti uguali (`CLIENTI.arrivoSec`). Il ticket 34 di `maurizio-yatai` propone una curva: calma, ondata, respiro, ondata finale. Decidere con Giuseppe che cos'è un'**Ondata** nello Yatai, in modo che si possa descrivere nei dati:

- **Che cosa cambia in un'Ondata.** Non solo gli arrivi più fitti: con 3 Posti e 25 s di Pazienza, tre onigiri in una volta costano al lento circa 13 s e nessuno se ne va (vedi Notes della mappa). Che cosa si stringe, perché la Pazienza conti davvero? Gli arrivi più fitti, il Posto che si riempie appena si libera, la Pazienza più corta durante l'Ondata, altro? E il respiro è un vero riposo (meno arrivi) o solo "niente di nuovo"?
- **Quante e quanto lunghe.** Quante Ondate in 120 s, quanto dura ciascuna, quanto il respiro tra una e l'altra, e se l'ultima è la più forte.
- **Fissa o con una parte casuale.** Il ticket 34 chiede che due semi diversi abbiano Ondate in punti diversi, ma una curva che il giocatore può imparare a memoria è di nuovo "prevedibile". Scheletro fisso nei dati con un po' di casualità sul quando e sulla forza? Quanta?
- **Si vede arrivare?** Un segnale prima dell'Ondata (un campanello, le lanterne, Maurizio che alza le orecchie) la rende un'emozione invece di un'ingiustizia, e per i bambini aiuta. Quale segnale, quanti secondi prima, e come cambia con "riduci movimento"? Niente testi nelle tre lingue se si può evitare.
- **Reggono con 4 Posti e con il ventaglio?** Il quarto Posto e il ventaglio di Maurizio (+Pazienza, ticket 35) non devono rendere l'Ondata banale né impossibile.
- **Basta per l'Hanami?** Con solo l'onigiri e un Piatto per Ordine, l'Ondata è l'unica varietà (decisione della destinazione): la Serata sembra davvero meno prevedibile, o serve già qualcos'altro per l'Hanami (e allora lo diciamo qui, senza spostare la tabella dei Matsuri)?
- **Quali 2-3 forme provare nel prototipo** ("Provare le Ondate"): descrivile in poche righe, con gli intervalli in secondi, così il prototipo non deve inventarle.

Vincoli: nessun game over, nessuna punizione per il lento (prende ★ comunque), tutte le età, 360×640.

Skill utili per ragionare: `level-design` (tensione e riposo) e `game-feel`. Non scrivere codice.

## Answer

Deciso con Giuseppe il 2026-11-03 nella sessione di domande sul ticket 34 di `maurizio-yatai` (tre round), svolta in parallelo a questa mappa. Le regole sono già in `GAME_SPEC.md` ("La Serata", voce **Ondate**) e in `GLOSSARY.md` (**Ondata**), commit `1bedaa2`.

- **Forma:** quattro fasi nei dati: calma 0-30 s (arrivi ogni 3,5-5 s), ondata 30-55 s (1,2-2,2 s), respiro 55-80 s (4-6 s), ondata finale 80-120 s (1,0-2,0 s). Una curva sola, comune; le curve per Serata e Matsuri sono del ticket 12 e del 29.
- **Parte casuale:** il seme sposta i confini delle fasi di circa ±5 s; con lo stesso seme la Serata è sempre la stessa.
- **Segnale:** solo visivo e senza testo, circa 2 s prima di ogni ondata, finale compresa (Maurizio alza la testa, la campanella oscilla). Il suono è del ticket 23.
- **Cosa cambia in un'ondata:** per ora **solo la frequenza degli arrivi**; la Pazienza resta di 25 s. È una scelta di partenza, **da verificare con il bot nel ticket 02**: la stima di questa mappa (con 3 Posti e 25 s l'ondata di sole frequenze non fa perdere nessuno) la mette in dubbio. Se si conferma, si ritocca la regola (Pazienza più corta nell'ondata, Posto che si riempie appena si libera).
- **Non coperto dalla sessione, resta al ticket 02:** se le ondate reggono con 4 Posti e col ventaglio (ticket 35), e se per l'Hanami (solo onigiri, un Piatto per Ordine) la varietà basta.
