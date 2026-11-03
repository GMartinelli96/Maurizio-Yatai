# 15: Gli Eventi di Aki Matsuri e Yuki Matsuri

**What to build:** Le ultime due Gran Serate hanno il loro Evento (tabella "I Matsuri" di GAME_SPEC.md). Aki Matsuri: il corteo del tempietto mikoshi; per 15 secondi l'Incasso vale doppio. Yuki Matsuri: il freddo; i Piatti caldi sul Bancone vanno serviti entro pochi secondi.

**Blocked by:** 12 (I Matsuri e la mappa delle Serate)

**Status:** ready-for-agent

- [ ] Ogni Evento ha il suo test e si vede in un playtest della sua Gran Serata.
- [ ] La spec non dice quali Piatti sono caldi né cosa succede a un Piatto che si raffredda: la scelta è fatta, scritta in GAME_SPEC.md e testata.
- [ ] Il corteo e il freddo si capiscono guardando, compreso quanto tempo resta.
- [ ] I numeri nuovi sono nel file di configurazione e i testi nuovi sono in tutte e tre le lingue.
- [ ] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero, lo stato nuovo compare in `window.render_game_to_text()` e la console non ha errori.
