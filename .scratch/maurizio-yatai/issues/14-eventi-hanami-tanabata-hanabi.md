# 14: Gli Eventi di Hanami, Tanabata e Hanabi

**What to build:** Le prime tre Gran Serate hanno il loro Evento (tabella "I Matsuri" di GAME_SPEC.md). Hanami: un vento di petali copre il Bancone e un tocco li soffia via. Tanabata: i desideri; gli Ordini con la striscia di carta tanzaku, se serviti in fretta, fanno cadere una pioggia di stelle e raddoppiano la Mancia. Hanabi: i fuochi; a metà Serata tutti i Posti si riempiono, ma la Pazienza scende più piano.

**Blocked by:** 12 (I Matsuri e la mappa delle Serate)

**Status:** ready-for-agent

- [ ] Ogni Evento ha il suo test e si vede in un playtest della sua Gran Serata.
- [ ] La spec non dice cosa impediscono i petali finché restano sul Bancone: la scelta è fatta, scritta in GAME_SPEC.md e testata.
- [ ] Ogni Evento si capisce guardando (petali, pioggia di stelle, fuochi).
- [ ] I numeri nuovi sono nel file di configurazione e i testi nuovi sono in tutte e tre le lingue.
- [ ] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero, lo stato nuovo compare in `window.render_game_to_text()` e la console non ha errori.
