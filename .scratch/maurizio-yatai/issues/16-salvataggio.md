# 16: Il salvataggio

**What to build:** I progressi restano sul dispositivo, senza login (GAME_SPEC.md, "Piattaforma e stile"): le stelle migliori di ogni Serata, gli Yen accumulati con gli Incassi, le Serate e i Matsuri sbloccati. È la base del passo 9 di PIANO.md, con la skill `save-systems`; i ticket 17–21 ci salvano sopra le loro scelte.

**Blocked by:** 12 (I Matsuri e la mappa delle Serate)

**Status:** ready-for-agent

- [ ] Dopo una Serata, ricaricando la pagina, la mappa e gli Yen sono come prima (playtest con ricaricamento).
- [ ] Il salvataggio ha un numero di versione, così un aggiornamento del gioco non rompe i salvataggi vecchi (con test della migrazione).
- [ ] Se lo storage del browser è bloccato il gioco funziona lo stesso, senza salvare.
- [ ] Il salvataggio ha test automatici che girano senza browser.
- [ ] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero, lo stato nuovo compare in `window.render_game_to_text()` e la console non ha errori.
