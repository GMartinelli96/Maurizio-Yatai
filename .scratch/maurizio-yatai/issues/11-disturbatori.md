# 11: I Disturbatori: Croccola, formiche e corvi

**What to build:** I tre Disturbatori (GAME_SPEC.md, "Clienti e Disturbatori"). Croccola punta i takoyaki e i taiyaki sul Bancone, perché crede che il taiyaki sia un pesce vero: se la si tocca la si coccola, fa le fusa e se ne va; se la si lascia fare ruba il Piatto. Le formiche arrivano in fila sul Bancone e puntano i Piatti dolci (kakigōri, taiyaki): un tocco sulla fila le fa girare al largo, altrimenti il Piatto è rovinato e va nel cestino. I corvi si posano sul tetto dello Yatai e gracchiano "kaa kaa", poi scendono a rubare un Piatto pronto lasciato su una Postazione: un tocco li fa volare via (il corvo ha due zampe). Qui compaiono in una Serata di prova; dal ticket 12 sono i Matsuri a decidere quando arrivano (Croccola dal Tanabata, formiche dall'Hanabi, corvi dall'Aki Matsuri). È il passo 7 di PIANO.md, con la skill `game-feel`.

**Blocked by:** 08 (Ramen e taiyaki)

**Status:** ready-for-agent

- [ ] Coccolare Croccola la fa andare via con le fusa; lasciarla fare le fa rubare un takoyaki o un taiyaki dal Bancone (con test).
- [ ] Un tocco sulla fila di formiche le fa girare al largo; se arrivano, il Piatto dolce è rovinato, va nel cestino e non si serve (con test).
- [ ] Un tocco manda via un corvo; se scende, ruba un Piatto pronto lasciato su una Postazione (con test).
- [ ] Un Piatto rubato o rovinato è Spreco e non entra nelle Vendite (con test).
- [ ] Coccole, furto, fuga e Piatto rovinato si capiscono guardando.
- [ ] Quanto spesso arrivano i Disturbatori è nei dati.
- [ ] I numeri nuovi sono nel file di configurazione e i testi nuovi sono in tutte e tre le lingue.
- [ ] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero, lo stato nuovo compare in `window.render_game_to_text()` e la console non ha errori.

## Comments

### Quali Disturbatori (2026-11-04)

Il titolo e il testo dicevano "Croccola e gli scarafaggi" (scarafaggi sulla Postazione che rovinano il Piatto che cuoce), ma GAME_SPEC.md ha Croccola, formiche e corvi, e la ricerca (`docs/ricerca/piatti-e-matsuri.md`, "Opinione mia: gli scarafaggi") sconsiglia gli scarafaggi in una bancarella di cibo. **Giuseppe ha scelto GAME_SPEC**: Croccola, formiche e corvi. Titolo, testo e criteri riscritti di conseguenza.

### Passo 1: la logica (2026-11-04)

`src/serata/disturbatori.js` (la logica, con un generatore a parte per tipo), `DISTURBATORI` e `SERATA_PROVA_DISTURBATORI` in `config.js`, `Serata` con l'opzione `disturbatori`, `scaccia(chi)` e `stato().disturbatori`. Le decisioni sono in GAME_SPEC.md ("Come funzionano"). `test/disturbatori.test.js` (18 test) e il bot condiviso con `scacciaDisturbatori`. Cose da ricordare per i passi dopo:
- Gli eventi nuovi (`disturbatoreArrivato`, `disturbatorePunta`, `disturbatoreAttacca`, `disturbatoreScacciato`, `piattoRubato`, `piattoRovinato`, `disturbatoreVaVia`) sono in `disturbatori.js`, non in `Serata.js`: il test `serata-scena.test.js` legge solo `Serata.js`. **Al passo 3**, insieme ai `case` della scena, va fatto leggere anche `disturbatori.js`.
- Uno per tipo alla volta: l'id di un Disturbatore è il suo tipo (`croccola`, `formiche`, `corvi`).

### Passo 2: i disegni (2026-11-04)

`src/disegni/disturbatori.js` (14 texture, in `docs/stile/asset-manifest.json`), generate da `generateDisturbatori(scene, tipi)` (`kit/texture.js`) solo se la Serata ha i Disturbatori, non all'avvio, come il cast. Tavola `?sviluppo=disturbatori` (anche `&bn=1` in bianco e nero, `&solo=<texture>` ingrandita, `&vista=yatai` sul vero Yatai). Look scelto da me (non c'era nei documenti, da far approvare): **Croccola** gatta randagia grigia a strisce con il muso crema, quattro pose (punta, balzo, fusa, fuga); **formiche** di fianco in due fasi di zampe, e la macchia verdastra `piatto-rovinato` da mettere sul Piatto; **corvo** indaco, tondo, becco arancione, **due zampe** (un test controlla), posato, che gracchia, e in volo con le ali su e giù; segni senza testo (`segno-suono`, `segno-bersaglio`, `piuma`). Il corvo si posa sul bordo della tendina, a destra, sopra l'ultimo posto del Bancone (che si riempie per ultimo): lì non copre i Piatti. Croccola sta dietro al suo Piatto, con le orecchie e gli occhi sopra: è dalla parte dei Clienti, da dove sale sul Bancone. `test/disturbatori-disegni.test.js` (impronte fissate, due zampe, nessun `Math.random`).
