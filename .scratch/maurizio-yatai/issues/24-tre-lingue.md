# 24: Le tre lingue complete

**What to build:** Il passo 12 di PIANO.md. Il selettore della lingua (la lingua del dispositivo resta la scelta iniziale), il controllo che ogni testo del gioco esista in italiano, inglese e giapponese e stia nel suo spazio, e il font giapponese ridotto ai soli caratteri usati, così il gioco resta leggero.

**Blocked by:** 14, 15 (gli Eventi), 18 (L'Arredo), 19 (I Vestiti e Che stile!), 20 (Il tutorial), 21 (Il Ricettario), 22 (Titoli e Condividi)

**Status:** ready-for-agent

- [ ] Il selettore cambia la lingua senza ricaricare e la scelta si salva.
- [ ] Il font giapponese ridotto si rigenera dai testi a ogni build, così una correzione del ticket 25 non lo rompe.
- [ ] Il peso del font giapponese, prima e dopo, è scritto in fondo a questo file.
- [ ] Gli screenshot di ogni schermata nelle tre lingue sono guardati: nessun testo esce dal suo spazio.
- [ ] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero e la console non ha errori.
