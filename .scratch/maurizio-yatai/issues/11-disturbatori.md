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
