# 01: Il kit di disegno a matita

**What to build:** Tutta la grafica del gioco nasce da un kit di disegno, senza file di immagine (ADR-0001): linee a matita tremolanti, riempimenti a pastello, carta ruvida e un font scritto a mano. Le immagini si generano all'avvio e restano nitide su ogni schermo. Il kit si prova su una tavola di prova con Maurizio e un Piatto (l'onigiri), da mettere accanto agli screenshot dei giochi di Maurizio già pubblicati (https://maurizioinfluencerofficial.mirkoforesti.it/). È il passo 1 di PIANO.md, con la skill `create-game-assets`.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Il kit disegna linee tremolanti, riempimenti a pastello e la carta ruvida, e la grafica del gioco non carica immagini da file.
- [x] Il tremolio è ripetibile: lo stesso disegno esce uguale a ogni avvio, così gli screenshot dei test si possono confrontare.
- [x] I testi usano un font scritto a mano per l'alfabeto latino; il giapponese ha un ripiego leggibile (il font giapponese definitivo arriva con il ticket 24).
- [x] Una scena di prova mostra la tavola con Maurizio e l'onigiri su carta ruvida.
- [x] Gli screenshot della tavola sono salvati accanto a quelli di almeno due giochi della suite, pronti per il ticket 02.
- [x] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero e la console non ha errori.

## Answer

Fatto nel commit 63927ea ("Maurizio Yatai: passo 1, il kit di disegno a matita"). Stile approvato da Giuseppe nel ticket 02. Chiuso a posteriori: lo stato non era stato aggiornato.
