# 16: Il salvataggio

**What to build:** I progressi restano sul dispositivo, senza login (GAME_SPEC.md, "Piattaforma e stile"): le stelle migliori di ogni Serata, gli Yen accumulati con gli Incassi, le Serate e i Matsuri sbloccati. È la base del passo 9 di PIANO.md, con la skill `save-systems`; i ticket 17–21 ci salvano sopra le loro scelte.

**Blocked by:** 12 (I Matsuri e la mappa delle Serate)

**Status:** ready-for-agent

- [ ] Dopo una Serata, ricaricando la pagina, la mappa e gli Yen sono come prima (playtest con ricaricamento).
- [ ] Il salvataggio ha un numero di versione, così un aggiornamento del gioco non rompe i salvataggi vecchi (con test della migrazione).
- [ ] Se lo storage del browser è bloccato il gioco funziona lo stesso, senza salvare.
- [ ] Il salvataggio ha test automatici che girano senza browser.
- [ ] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero, lo stato nuovo compare in `window.render_game_to_text()` e la console non ha errori.

## Comments

### Stato del codice (2026-11-04, dopo il ticket 35)

Il ticket 35 ha già fatto la base di questo ticket in `src/salvataggio.js` (formato con `versione`, oggi 2; migrazione 1→2; Yen e livelli dei Potenziamenti; storage bloccato, assente o pieno). Coperti dai criteri sopra, senza lavoro nuovo: il numero di versione con la migrazione (test in `test/salvataggio.test.js` e `test/bottega.test.js`), lo storage bloccato (scenari `bottega-bloccata.json` e `serata-yen-bloccato.json`), i test senza browser e gli Yen che tornano dopo il ricaricamento (`serata-yen.json`). **Non c'è ancora**: le stelle migliori di ogni Serata e le Serate e i Matsuri sbloccati, che dipendono dalla mappa del ticket 12 (il bloccante resta giusto per questa parte). Passo che resta: versione 3 con stelle e sblocchi, la sua migrazione da 2, i test, e il ricaricamento della mappa nello scenario di playtest. Il criterio "la mappa e gli Yen come prima" si chiude solo allora.
