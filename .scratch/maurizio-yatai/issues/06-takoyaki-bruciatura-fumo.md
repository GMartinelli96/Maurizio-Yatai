# 06: Il takoyaki: cottura, bruciatura e Fumo

**What to build:** Il secondo Piatto, alla piastra a 6 buchi, ed è il primo che si brucia: se resta sulla Postazione troppo a lungo dopo la cottura diventa un Piatto bruciato. Toccandolo va nel cestino, e la Postazione resta nel Fumo e non si può usare per qualche secondo. Arrivano gli Ordini da 2 Piatti. I tempi e il prezzo sono nella tabella dei Piatti di GAME_SPEC.md (e già nel file di configurazione). Il takoyaki segue la cucina a tocchi del ticket 33: è il primo Piatto con cottura, quindi aggiunge la cottura e gli Ingredienti "di dopo" alla logica scritta dal 33. La **Ricetta** è pastella, polpo, [cottura], salsa, prendi: 4 tocchi. La bruciatura parte a cottura finita, anche se manca la salsa. È il passo 4 di PIANO.md, con la skill `game-feel`.

**Blocked by:** 05 ([con te] La prima prova: è divertente?), 33 (La cucina a tocchi), 34 (Una Serata che cambia), 35 (Un assaggio di Potenziamenti), 36 (I Clienti si lamentano)

**Status:** ready-for-agent

- [ ] Un takoyaki dimenticato si brucia, e si vede che sta per bruciarsi.
- [ ] Toccato, il Piatto bruciato va nel cestino; la Postazione resta nel Fumo e non si può usare finché il Fumo non passa.
- [ ] Un Ordine da 2 Piatti si serve solo se sul Bancone ci sono entrambi.
- [ ] Cottura, bruciatura e Fumo hanno test automatici che girano senza browser.
- [ ] Il takoyaki si prepara a tocchi nell'ordine della Ricetta (pastella 30, polpo 50, salsa 20): la cottura parte da sola dopo il polpo, la salsa si tocca a cottura finita, poi si prende. Sono 4 tocchi, il tetto (con test sul conteggio).
- [ ] Un tocco fuori ordine non fa niente: la Scorta trema, non si paga, nessuno Spreco (con test).
- [ ] La Ricetta in icone sotto la piastra e il prossimo Ingrediente evidenziato sono visibili anche durante la cottura e dopo, quando manca la salsa.
- [ ] Un takoyaki bruciato o dimenticato è Spreco: i suoi Ingredienti, già pagati, non si rimborsano (con test su Spesa e Spreco). Il recap di fine Serata ha la tabella per Piatto (fatti, serviti, sprecati, costo, vendite), ora che i Piatti sono due; i ticket 07 e 08 aggiungono le righe.
- [ ] Gli Ingredienti e i loro costi stanno in `config.js` (bozza in GAME_SPEC.md: costo del Piatto circa un terzo del prezzo).
- [ ] La Bottega del ticket 35 ha il Potenziamento "Postazione più veloce" per la piastra (3 livelli, accorcia la cottura), con prezzi in `config.js` e test senza browser. Le altre Postazioni con cottura lo ricevono con i loro Piatti e il ticket 17.
- [ ] I numeri nuovi sono nel file di configurazione e i testi nuovi sono in tutte e tre le lingue.
- [ ] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero, lo stato nuovo compare in `window.render_game_to_text()` e la console non ha errori.

## Comments

### Dalla mappa yatai-economia-e-cucina (2026-11-03)

Ricadute dei ticket 01 (costi e sprechi), 02 (cucina a tocchi) e 03 (Lamento) della mappa. Cambiato: la frase sulla Ricetta in "What to build", il bloccante 36, i criteri nuovi su Ricetta, tetto, ordine sbagliato, Spreco, tabella per Piatto e Ingredienti in `config.js`. Il 36 è bloccante perché ogni correzione nata dalla prima prova blocca il 06 e il 09 (ticket 05); il Lamento non cambia però il takoyaki. Decisione di assegnazione mia: la tabella per Piatto del recap arriva qui, con il secondo Piatto, perché con un Piatto solo non dice niente.

Deciso con Giuseppe il 2026-11-03 (ticket 35): il Potenziamento "Postazione più veloce" non vale per il tagliere dell'onigiri, quindi la piastra, prima Postazione con cottura, lo riceve qui (criterio sulla Bottega).
