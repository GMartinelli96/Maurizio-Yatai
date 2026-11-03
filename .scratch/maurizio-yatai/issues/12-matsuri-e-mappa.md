# 12: I Matsuri e la mappa delle Serate

**What to build:** Il gioco diventa un percorso: schermata iniziale, mappa delle Serate, Serata, fine Serata e di nuovo mappa. La mappa mostra i 5 Matsuri da 6 Serate ciascuno; la sesta è la Gran Serata, con un obiettivo di Incasso più alto (gli Eventi arrivano con i ticket 14 e 15). Tutte e 30 le Serate sono descritte nei dati: Piatti disponibili, obiettivo, ritmo dei Clienti, numero di Piatti per Ordine e Disturbatori, cioè la curva di difficoltà. Ogni Matsuri porta il suo Piatto nuovo e le sue novità come nella tabella "I Matsuri" di GAME_SPEC.md (per esempio gli Ordini da 3 Piatti dall'Aki Matsuri). La Serata successiva si apre con ★, il Matsuri successivo vincendo la Gran Serata; per ora gli sblocchi restano in memoria, il salvataggio è il ticket 16. Ci sono anche i crediti. È il passo 8 di PIANO.md, con la skill `level-design`.

**Blocked by:** 10 (Il cast, parte 2), 11 (I Disturbatori)

**Status:** ready-for-agent

- [ ] Dalla mappa si aprono tutte e 30 le Serate; un playtest ne gioca almeno una per Matsuri.
- [ ] La curva di difficoltà sta solo nei dati: cambiare una Serata non richiede di toccare il codice.
- [ ] Gli sblocchi hanno test: ★ apre la Serata successiva, la Gran Serata vinta apre il Matsuri successivo, e le stelle non bloccano mai altro.
- [ ] Le regole dei Vizi legate al Matsuri (ticket 10) e l'arrivo dei Disturbatori per Matsuri si vedono in gioco.
- [ ] La schermata iniziale dice "sviluppato da Maurizio Influencer Official" e i crediti "un regalo di Giuseppe".
- [ ] I numeri nuovi sono nel file di configurazione e i testi nuovi sono in tutte e tre le lingue.
- [ ] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero, lo stato nuovo compare in `window.render_game_to_text()` e la console non ha errori.

## Comments

### Dal ticket 34 (2026-11-03)

La curva degli arrivi (quattro fasi: calma, ondata, respiro, ondata finale) è nei dati e per ora è una sola, comune. Qui ogni Serata e ogni Matsuri può avere la sua, comprese le curve più morbide delle prime Serate. Vedi GAME_SPEC.md ("La Serata", voce Ondate).

### Dalla mappa yatai-serata-che-cambia (2026-11-03)

La curva di ogni Serata comprende anche la **Pazienza dei Clienti in ondata** (oggi 15 s contro 25), non solo le fasi e gli intervalli. Le curve più morbide delle prime Serate possono quindi avere una Pazienza in ondata più lunga (per esempio 20 s: con la Serata dell'Hanami il lento prende ★ in ogni caso, a 18 s no senza Serie). Vedi GAME_SPEC.md ("La Serata", Ondate).
