# 05: Il percorso delle schermate e il progresso in memoria

**Type:** grilling
**Blocked by:** 01
**Status:** open

## Question

Decidere con Giuseppe **come si passa da una schermata all'altra** e **dove vive il progresso** (stelle e sblocchi) finché il ticket 16 non lo salva. Già fissato il 2026-11-05: "Gioca" apre la mappa sul Matsuri in cui sei arrivato; "indietro" dalla mappa torna al titolo; il recap ha Rigioca e Mappa; la Bottega si raggiunge dalla mappa e dal titolo; due livelli di mappa (i 5 Matsuri, poi le 6 Serate). Da decidere:

- **Le scene.** Quali scene Phaser nascono (la mappa dei Matsuri e la strada delle Serate sono due scene o una?), come si chiamano (`mappa`, ...), che cosa si passa loro (Matsuri e numero della Serata, o l'id della Serata) e come `SerataScene.init` sceglie la Serata dai dati (oggi `SERATE[matsuri]` e `data.matsuri`). Come cambiano `BootScene` (`?sviluppo=...`, `?seme=...`) e la scena di sviluppo; nuovi parametri di sviluppo (`?sblocca=tutto` già deciso; `?sviluppo=mappa`, aprire una Serata precisa).
- **Il progresso in memoria.** Un modulo con la sua logica pura e i suoi test (senza browser, come `salvataggio.js`): le stelle migliori per Serata (da 0 a 3), quali Serate e Matsuri sono aperti, le regole (★ apre la Serata dopo, ★ sulla Gran Serata apre il Matsuri dopo, le stelle non bloccano mai altro, una Serata già aperta non si richiude). Quale interfaccia (a grandi linee: registra una Serata finita, dimmi cosa è aperto, dimmi le stelle di un Matsuri), perché il ticket 16 lo salvi nella versione 3 del formato (con migrazione dalla 2) senza riscriverlo. Dove vive oggi (un'istanza accanto a `salvataggio()`?).
- **Il recap.** Rigioca e Mappa al posto di Rigioca e Bottega: layout dei due pulsanti nel pannello (650 × 1180) e dove va la riga "In tasca"; "Avanti" alla Serata dopo o basta la mappa; il commento quando la Serata successiva si è aperta ("Nuova Serata!") e dove compare il "Nuovo Vestito!" del ticket 19.
- **Uscire a metà Serata.** Oggi non si può. Serve un modo (un pulsante piccolo, Esc) per tornare alla mappa, e che cosa succede alla Serata (si butta senza stelle né Yen; niente game over, nessuna punizione)?
- **La Bottega.** Da dove si apre e dove torna (oggi dal recap torna a giocare lo stesso Matsuri: `dopoSerata`), con la mappa in mezzo.
- **`render_game_to_text`.** Che cosa dice la mappa (i Matsuri, le Serate, aperte o chiuse, le stelle, le zone da toccare con `x`, `y`, `w`, `h`), perché i playtest giochino senza guardare lo schermo.
- **Chi non ha progresso.** Il primo avvio: la mappa con un solo nodo aperto, e gli Yen già salvati (versione 2) che restano.

Fatti: `yatai/src/scenes/TitleScene.js`, `BootScene.js`, `SerataScene.js` (`init`, `perFine`, `costruisciFine`, `rigioca`, `vaiAllaBottega`), `BottegaScene.js`, `yatai/src/salvataggio.js`, `yatai/src/bottega.js`, `yatai/src/test-hooks.js`, `docs/stile/confronto/suite-nella-mappa-1280x720.png`. Skill: `game-ui-ux` (pila delle schermate, navigazione), `save-systems`, `grilling`, `domain-modeling`.
