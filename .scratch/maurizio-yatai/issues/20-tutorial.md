# 20: Il tutorial di Maurizio

**What to build:** Nella prima Serata di ogni Matsuri, quando arriva il Piatto nuovo, Maurizio spiega con i fumetti e una zampina indica cosa toccare: la prima **Scorta** (poi le altre, nell'ordine della **Ricetta**, che è già sempre visibile sotto la Postazione), la Postazione, il Bancone e il Cliente. Nell'Hanami spiega anche le basi: Postazione, Bancone, Cliente. Il criterio è quello di PIANO.md: un nuovo giocatore capisce senza leggere istruzioni. Skill `game-ui-ux`.

**Blocked by:** 12 (I Matsuri e la mappa delle Serate), 16 (Il salvataggio)

**Status:** ready-for-agent

- [ ] La prima Serata di ogni Matsuri ha il suo tutorial, che non torna se la Serata si rigioca (anche dopo il ricaricamento).
- [ ] Un playtest che tocca solo dove indica la zampina completa la prima Serata dell'Hanami, Scorte comprese: la zampina passa da riso ad alga a ogni tocco giusto.
- [ ] Nei tutorial dei Piatti con cottura la zampina indica anche gli Ingredienti "di dopo" (la salsa del takoyaki) a cottura finita.
- [ ] I fumetti sono brevi e stanno nel loro spazio in tutte e tre le lingue.
- [ ] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero, lo stato nuovo compare in `window.render_game_to_text()` e la console non ha errori.

## Comments

### Dalla mappa yatai-economia-e-cucina (2026-11-03)

Ricaduta del ticket 02 della mappa (cucina a tocchi). Cambiato: la zampina indica anche la prima Scorta e poi le altre nell'ordine della Ricetta; due criteri sul playtest con le Scorte e sugli Ingredienti "di dopo". La Ricetta non va spiegata a parole: è già sempre visibile.
