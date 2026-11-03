# 18: L'Arredo

**What to build:** Nella stessa schermata del ticket 17 si compra con gli Yen l'Arredo, solo estetico: tenda noren, lanterne chōchin, lanterne bonbori, campanella fūrin e statuetta del maneki-neko. Una volta comprato si vede sullo Yatai in ogni Serata e non cambia come si gioca.

**Blocked by:** 17 (I Potenziamenti)

**Status:** ready-for-agent

- [ ] I 5 oggetti sono disegnati con il kit e si vedono sullo Yatai senza coprire Posti, Bancone o Postazioni.
- [ ] L'Arredo comprato si salva e resta dopo il ricaricamento.
- [ ] Un test controlla che l'Arredo non cambi nessun numero della Serata.
- [ ] I numeri nuovi (prezzi) sono nel file di configurazione e i testi nuovi sono in tutte e tre le lingue.
- [ ] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero, lo stato nuovo compare in `window.render_game_to_text()` e la console non ha errori.

## Comments

### Dalla mappa yatai-economia-e-cucina (2026-11-03)

Ricaduta del ticket 04 della mappa: nell'elenco dei 5 oggetti le lanterne bonbori prendono il posto del ramo di ciliegio (la spec era già corretta con la ricerca, voce 14). L'Arredo si compra nella sezione Arredo della Bottega, la stessa schermata del ticket 17; non si pagano Vestiti con gli Yen.
