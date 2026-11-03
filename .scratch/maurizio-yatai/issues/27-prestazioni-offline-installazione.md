# 27: Prestazioni, offline e installazione

**What to build:** L'altra metà del passo 13 di PIANO.md: il gioco gira a 60 fps su un telefono di fascia media, si installa come app e funziona tutto offline (skill `performance-optimization`). Senza un telefono vero, la prova è Playwright con la CPU rallentata di 4 volte; la prova sul telefono, se Giuseppe ne ha uno, si fa nel ticket 30.

**Blocked by:** 24 (Le tre lingue complete), 26 (L'accessibilità)

**Status:** ready-for-agent

- [ ] Si misura prima di correggere: fps nella Serata più carica (la Gran Serata dello Yuki Matsuri), tempo di avvio e peso del gioco sono scritti in fondo a questo file, prima e dopo.
- [ ] Con la CPU rallentata di 4 volte la Serata più carica resta a 60 fps.
- [ ] Il playtest offline del passo 0 passa sul gioco completo, con i font e tutti i Matsuri.
- [ ] Chrome considera il gioco installabile.
- [ ] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero e la console non ha errori.
