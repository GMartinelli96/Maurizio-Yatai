# 06: Il takoyaki: cottura, bruciatura e Fumo

**What to build:** Il secondo Piatto, alla piastra a 6 buchi, ed è il primo che si brucia: se resta sulla Postazione troppo a lungo dopo la cottura diventa un Piatto bruciato. Toccandolo va nel cestino, e la Postazione resta nel Fumo e non si può usare per qualche secondo. Arrivano gli Ordini da 2 Piatti. I tempi e il prezzo sono nella tabella dei Piatti di GAME_SPEC.md (e già nel file di configurazione). Il takoyaki segue la cucina a tocchi del ticket 33: è il primo Piatto con cottura, quindi aggiunge la cottura e gli Ingredienti "di dopo" alla logica scritta dal 33. La **Ricetta** è pastella, polpo, [cottura], salsa, prendi: 4 tocchi. La bruciatura parte a cottura finita, anche se manca la salsa. È il passo 4 di PIANO.md, con la skill `game-feel`.

**Blocked by:** nessuno (05, 33, 34 e 35 sono resolved: bloccanti tolti con Giuseppe il 2026-11-04)

**Status:** resolved

- [x] Un takoyaki dimenticato si brucia, e si vede che sta per bruciarsi.
- [x] Toccato, il Piatto bruciato va nel cestino; la Postazione resta nel Fumo e non si può usare finché il Fumo non passa.
- [x] Un Ordine da 2 Piatti si serve solo se sul Bancone ci sono entrambi.
- [x] Cottura, bruciatura e Fumo hanno test automatici che girano senza browser.
- [x] Il takoyaki si prepara a tocchi nell'ordine della Ricetta (pastella 30, polpo 50, salsa 20): la cottura parte da sola dopo il polpo, la salsa si tocca a cottura finita, poi si prende. Sono 4 tocchi, il tetto (con test sul conteggio).
- [x] Un tocco fuori ordine non fa niente: la Scorta trema, non si paga, nessuno Spreco (con test).
- [x] La Ricetta in icone sopra la piastra e il prossimo Ingrediente evidenziato sono visibili anche durante la cottura e dopo, quando manca la salsa.
- [x] Un takoyaki bruciato o dimenticato è Spreco: i suoi Ingredienti, già pagati, non si rimborsano (con test su Spesa e Spreco). Il recap di fine Serata mostra Spesa e Spreco giusti.
- [x] Il recap di fine Serata ha la tabella per Piatto (fatti, serviti, sprecati, costo, vendite) con una riga per ognuno dei 5 Piatti del menù (criterio passato dal ticket 08: onigiri, takoyaki, kakigōri, taiyaki, ramen).
- [x] Gli Ingredienti e i loro costi stanno in `config.js` (bozza in GAME_SPEC.md: costo del Piatto circa un terzo del prezzo).
- [x] La Bottega del ticket 35 ha il Potenziamento "Postazione più veloce" per la piastra (3 livelli, accorcia la cottura), con prezzi in `config.js` e test senza browser. Le altre Postazioni con cottura lo ricevono con i loro Piatti e il ticket 17.
- [x] I numeri nuovi sono nel file di configurazione e i testi nuovi sono in tutte e tre le lingue.
- [x] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero, lo stato nuovo compare in `window.render_game_to_text()` e la console non ha errori.

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

### Chiuso (2026-11-04)

Su `main`, passi 1–5: `42c76e5` (conti per Piatto nella logica), `742d6f1` (tabella nel recap), `1e4eefd` (Potenziamento nella logica), `95128be` (carta nella Bottega) e il commit di chiusura. `npm test` 368 verdi.

**Tabella per Piatto.** `Serata.perPiatto()` (in `stato().perPiatto` e nell'evento `serataFinita`) ha una riga per Piatto del menù: `fatti` (Piatti arrivati pronti), `serviti`, `costo` (Spesa), `sprecati` (Yen degli Ingredienti non finiti in un Piatto servito, quindi anche i Piatti cominciati e mai finiti) e `vendite` (prezzo, doppio per Carlotta, più la sua parte di Mancia: la Mancia di un Ordine da 2 o 3 Piatti si divide in proporzione al prezzo e il resto dell'arrotondamento va all'ultimo, così le somme tornano esatte). Costo, sprecati e vendite sommano a Spesa, Spreco e Vendite (test su 3 bravure × 6 semi con tutti e 5 i Piatti). Il recap ha il pannello alto 1180 invece di 980 (`RECAP` in `config.js`) e mantiene le sei righe dei totali. Per il ticket 22: la tabella c'è già, resta da completare con i Titoli e Condividi; le intestazioni sono `endTabella*` nelle tre lingue (in giapponese abbreviate: つくった, だした, むだ, げんか, うりあげ).

**Piastra più veloce.** `POTENZIAMENTI.piastraPiuVeloce` (`postazione: 'piastra'`): 1200 / 2500 / 4000 Yen, cottura ×0,8 / ×0,65 / ×0,5 (5 s → 4 / 3,25 / 2,5). La Serata prende `cotturaMoltiplicatori` (un moltiplicatore per id di Postazione, `opzioniSerata` lo ricava da ogni Potenziamento con `postazione`), quindi **il ticket 17 aggiunge macchina, stampo e pentola con una voce uguale in `POTENZIAMENTI` e in `ORDINE_POTENZIAMENTI`, più testi e icona, senza toccare la logica**. La bruciatura non cambia. Misurato col bot nel Tanabata (rapido / attento / lento): 6143 / 3979 / 2802 senza, 8090 / 4436 / 3102 al massimo; con tutti i Potenziamenti la Mancia della Serie è l'8,6% dell'Incasso del rapido. Valori di partenza, il ticket 29 li ricalibra. La Bottega ha tre carte alte 215 px; `icona-piastraPiuVeloce` è anche in `docs/stile/asset-manifest.json`.

**Verifica.** Router → Phaser 4.2.1 (`phaser-core`, `game-ui-ux`); Playwright a 360×640 e 390×844 in italiano, inglese e giapponese; scenari `serata-recap-piatti`, `bottega-piastra`, `bottega`, `bottega-bloccata`, `serata-takoyaki`, `serata-fine-bottega`, `serata-posto-in-piu`, con screenshot guardati, `perPiatto` e `cotturaMoltiplicatori` in `render_game_to_text()` e console senza errori.

**Da sapere.** (1) `scenari/serata-tutti.json` falliva 5 aspettative su `postazioni.N.h ≥ 88` perché partiva dalla finestra di default (390×844), dove le Scorte dell'Yuki sono alte 84,4 px di gioco = 45,7 px CSS, quindi sopra i 44 voluti; i 91,1 px (45,5 CSS) valgono a 360×640. Il layout è giusto: lo scenario aveva solo dimenticato un `resize` iniziale a 360×640 (aggiunto, ora verde). (2) Lo stesso scenario dà 11124 o 11167 Yen di Incasso a seconda della corsa: il Playtest non è del tutto deterministico (a parità di codice). (3) I worktree `ticket-10` e `ticket-11` toccano `config.js` e `Serata.js`: al merge i conflitti sono possibili, in punti diversi dai miei.
