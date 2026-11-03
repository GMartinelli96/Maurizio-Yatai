# 08: Ramen e taiyaki

**What to build:** Gli ultimi due Piatti, entrambi con varianti e bruciatura: il ramen alla pentola del brodo (con uovo o con naruto) e il taiyaki allo stampo a pesce (fagioli rossi o crema). Usano le Scorte per variante del ticket 07 (senza menu) e il Fumo del ticket 06; tempi e prezzi sono nella tabella dei Piatti di GAME_SPEC.md. Entrambi seguono la cucina a tocchi (ticket 33) con la loro **Ricetta** entro i 4 tocchi: taiyaki pastella, ripieno, [cottura], prendi (3); ramen noodles, brodo, [cottura], uovo o naruto, prendi (4; uovo e naruto sono due Scorte, come la salsa del takoyaki dopo la cottura). La variante è un Ingrediente diverso (ripieno, uovo o naruto). Alla fine si giocano tutti e 5 i Piatti, in una Serata di prova con tutte e 5 le Postazioni (passo 5 di PIANO.md).

**Blocked by:** 07 (Il kakigōri e le varianti)

**Status:** ready-for-agent

- [ ] Una Serata di prova ha tutte e 5 le Postazioni ed è leggibile a 360×640, con tutte le Scorte (circa 15, varianti comprese) toccabili col pollice. Come si dispongono (più file, solo le Scorte dei Piatti sbloccati, ecc.) si decide qui e si scrive in GAME_SPEC.md.
- [ ] Gli Ingredienti con lo stesso nome in due Piatti (la pastella di takoyaki e taiyaki) sono una Scorta condivisa o due Scorte con nomi diversi: oggi l'id di una Scorta è il nome dell'Ingrediente, quindi due Scorte uguali si confonderebbero (con test).
- [ ] Ramen e taiyaki cuociono, si bruciano e lasciano il Fumo come il takoyaki.
- [ ] Gli Ordini possono mescolare Piatti e varianti, e si servono solo se il Bancone ha tutto (con test).
- [ ] Le icone delle 4 varianti nuove si distinguono anche in bianco e nero.
- [ ] Taiyaki e ramen hanno ciascuno la sua Ricetta entro i 4 tocchi, la scelta della variante compresa nel conto, con un test sul conteggio; ordine sbagliato: non succede niente.
- [ ] Gli Ingredienti e i costi di taiyaki (pastella 30, ripieno 40) e ramen (noodles 70, brodo 80, uovo o naruto 50) sono in `config.js` e la variante cambia l'Ingrediente. Un Piatto bruciato è Spreco e le righe del recap per Piatto (ticket 06) comprendono tutti e 5 i Piatti.
- [ ] I numeri nuovi sono nel file di configurazione e i testi nuovi sono in tutte e tre le lingue.
- [ ] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero, lo stato nuovo compare in `window.render_game_to_text()` e la console non ha errori.

## Comments

### Dalla mappa yatai-economia-e-cucina (2026-11-03)

Ricadute dei ticket 01 e 02 della mappa. Cambiato: la frase sulle Ricette in "What to build" e i criteri nuovi su Ricetta, tetto, Ingredienti e Spreco.

**Deciso con Giuseppe il 2026-11-03:** nel ramen l'uovo o il naruto si aggiungono dopo la cottura di 6 s, come la salsa del takoyaki. Niente menu delle varianti: una Scorta per variante (vedi il ticket 07). La sequenza è in GAME_SPEC.md ("Come si gioca"). Restano da fare qui lo spazio per le Scorte e il nome della pastella (due criteri sopra).
