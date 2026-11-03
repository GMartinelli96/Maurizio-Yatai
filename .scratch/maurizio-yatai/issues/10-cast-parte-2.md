# 10: Il cast, parte 2: i Vizi legati alla cucina

**What to build:** Gli altri quattro Vizi, che dipendono dai Piatti. Marcella chiede sempre il Bis (un secondo Ordine senza lasciare il Posto) e dall'Hanabi preferisce i dolci (kakigōri, taiyaki). Filippo ordina solo onigiri e kakigōri, e nello Yuki Matsuri la sua Pazienza dura di più. Finché Pasquale è a un Posto, le Postazioni nel Fumo si riparano subito. Se un Piatto si brucia, Ebi Furai si spaventa e la sua Pazienza scende il doppio più in fretta. Le regole che dipendono dal Matsuri sono pronte e testate qui; nel gioco si vedono dal ticket 12, quando arrivano i Matsuri. È la seconda metà del passo 6 di PIANO.md.

**Blocked by:** 08 (Ramen e taiyaki), 09 (Il cast, parte 1)

**Status:** ready-for-agent

- [ ] Marcella fa il Bis restando al Posto, e il Bis si serve come un Ordine nuovo.
- [ ] I Vizi di Marcella, Filippo, Pasquale ed Ebi Furai hanno ciascuno il suo test.
- [ ] Le regole legate al Matsuri ricevono il Matsuri come dato e sono testate sia per il Matsuri in cui valgono sia per gli altri.
- [ ] Ogni Vizio si capisce guardando (per esempio Ebi Furai che si spaventa).
- [ ] I numeri nuovi sono nel file di configurazione e i testi nuovi sono in tutte e tre le lingue.
- [ ] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero, lo stato nuovo compare in `window.render_game_to_text()` e la console non ha errori.
