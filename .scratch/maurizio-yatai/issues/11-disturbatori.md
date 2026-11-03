# 11: I Disturbatori: Croccola e gli scarafaggi

**What to build:** I due Disturbatori (GAME_SPEC.md, "Clienti e Disturbatori"). Croccola punta i takoyaki e i taiyaki sul Bancone, perché crede che il taiyaki sia un pesce vero: se la si tocca la si coccola, fa le fusa e se ne va; se la si lascia fare ruba il Piatto. Gli scarafaggi salgono su una Postazione e si scacciano con un tocco; se restano rovinano il Piatto che sta cuocendo. Qui compaiono in una Serata di prova; dal ticket 12 sono i Matsuri a decidere quando arrivano (Croccola dal Tanabata, scarafaggi dall'Hanabi). È il passo 7 di PIANO.md, con la skill `game-feel`.

**Blocked by:** 08 (Ramen e taiyaki)

**Status:** ready-for-agent

- [ ] Coccolare Croccola la fa andare via con le fusa; lasciarla fare le fa rubare un takoyaki o un taiyaki dal Bancone (con test).
- [ ] Un tocco scaccia uno scarafaggio; se resta, il Piatto che cuoce è rovinato e non si serve (con test).
- [ ] Coccole, furto, fuga e Piatto rovinato si capiscono guardando.
- [ ] Quanto spesso arrivano i Disturbatori è nei dati.
- [ ] I numeri nuovi sono nel file di configurazione e i testi nuovi sono in tutte e tre le lingue.
- [ ] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero, lo stato nuovo compare in `window.render_game_to_text()` e la console non ha errori.
