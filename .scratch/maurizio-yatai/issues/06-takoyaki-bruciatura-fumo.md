# 06: Il takoyaki: cottura, bruciatura e Fumo

**What to build:** Il secondo Piatto, alla piastra a 6 buchi, ed è il primo che si brucia: se resta sulla Postazione troppo a lungo dopo la cottura diventa un Piatto bruciato. Toccandolo va nel cestino, e la Postazione resta nel Fumo e non si può usare per qualche secondo. Arrivano gli Ordini da 2 Piatti. I tempi e il prezzo sono nella tabella dei Piatti di GAME_SPEC.md (e già nel file di configurazione). Il takoyaki segue la cucina a tocchi del ticket 33: è il primo Piatto con cottura, quindi aggiunge la cottura e gli Ingredienti "di dopo" alla logica scritta dal 33. La **Ricetta** è pastella, polpo, [cottura], salsa, prendi: 4 tocchi. La bruciatura parte a cottura finita, anche se manca la salsa. È il passo 4 di PIANO.md, con la skill `game-feel`.

**Blocked by:** 05 ([con te] La prima prova: è divertente?), 33 (La cucina a tocchi), 34 (Una Serata che cambia), 35 (Un assaggio di Potenziamenti)

**Status:** ready-for-agent

- [x] Un takoyaki dimenticato si brucia, e si vede che sta per bruciarsi.
- [x] Toccato, il Piatto bruciato va nel cestino; la Postazione resta nel Fumo e non si può usare finché il Fumo non passa.
- [x] Un Ordine da 2 Piatti si serve solo se sul Bancone ci sono entrambi.
- [x] Cottura, bruciatura e Fumo hanno test automatici che girano senza browser.
- [x] Il takoyaki si prepara a tocchi nell'ordine della Ricetta (pastella 30, polpo 50, salsa 20): la cottura parte da sola dopo il polpo, la salsa si tocca a cottura finita, poi si prende. Sono 4 tocchi, il tetto (con test sul conteggio).
- [x] Un tocco fuori ordine non fa niente: la Scorta trema, non si paga, nessuno Spreco (con test).
- [x] La Ricetta in icone sopra la piastra e il prossimo Ingrediente evidenziato sono visibili anche durante la cottura e dopo, quando manca la salsa.
- [x] Un takoyaki bruciato o dimenticato è Spreco: i suoi Ingredienti, già pagati, non si rimborsano (con test su Spesa e Spreco). Il recap di fine Serata mostra Spesa e Spreco giusti.
- [ ] Il recap di fine Serata ha la tabella per Piatto (fatti, serviti, sprecati, costo, vendite), ora che i Piatti sono due; i ticket 07 e 08 aggiungono le righe.
- [x] Gli Ingredienti e i loro costi stanno in `config.js` (bozza in GAME_SPEC.md: costo del Piatto circa un terzo del prezzo).
- [ ] La Bottega del ticket 35 ha il Potenziamento "Postazione più veloce" per la piastra (3 livelli, accorcia la cottura), con prezzi in `config.js` e test senza browser. Le altre Postazioni con cottura lo ricevono con i loro Piatti e il ticket 17.
- [ ] I numeri nuovi sono nel file di configurazione e i testi nuovi sono in tutte e tre le lingue.
- [ ] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero, lo stato nuovo compare in `window.render_game_to_text()` e la console non ha errori.

## Comments

### Dalla mappa yatai-economia-e-cucina (2026-11-03)

Ricadute dei ticket 01 (costi e sprechi), 02 (cucina a tocchi) e 03 (Lamento) della mappa. Cambiato: la frase sulla Ricetta in "What to build", il bloccante 36, i criteri nuovi su Ricetta, tetto, ordine sbagliato, Spreco, tabella per Piatto e Ingredienti in `config.js`. Il 36 è bloccante perché ogni correzione nata dalla prima prova blocca il 06 e il 09 (ticket 05); il Lamento non cambia però il takoyaki. Decisione di assegnazione mia: la tabella per Piatto del recap arriva qui, con il secondo Piatto, perché con un Piatto solo non dice niente.

Deciso con Giuseppe il 2026-11-03 (ticket 35): il Potenziamento "Postazione più veloce" non vale per il tagliere dell'onigiri, quindi la piastra, prima Postazione con cottura, lo riceve qui (criterio sulla Bottega).

### Stato del codice (2026-11-03, dopo il merge del ticket 37)

Il commit `f812cd0` aveva messo in `main` cottura, bruciatura, Fumo e cestino, con il takoyaki a "un tocco, cuoce da solo". Il ticket 37 (`resolved`, `35f62e7`) lo ha portato a tocchi: Ricetta pastella, polpo, [5 s], salsa, prendi, tre Scorte nuove, ordine sbagliato, Spesa e Spreco (un Piatto bruciato è Spreco, con test), calibrazione del Tanabata. Riverificato alla ripresa della mappa: `npm test` 183 verdi e lo scenario `serata-takoyaki.json` a 360×640, senza errori in console, con allarme, Fumo, cestino e recap in rosso guardati. Per questo i criteri coperti sono spuntati qui sopra.

Resta da fare:
- la tabella per Piatto nel recap di fine Serata (oggi mostra solo Vendite, Spesa, Spreco e Incasso totali: confermato nello screenshot);
- il Potenziamento "Postazione più veloce" per la piastra, che ha bisogno della Bottega del ticket 35 (salvataggio degli Yen compreso);
- i testi nuovi nelle tre lingue e il giro di verifica finale di PIANO.md, che si spuntano quando le due voci sopra sono fatte.

Bloccanti: 36 tolto (`resolved`). Restano 34, perché ha fatto solo il passo 1 (le ondate nella logica; mancano segnale, Serie e bot), e 35, che qui serve davvero per il Potenziamento. Toglierli è una scelta di Giuseppe.
