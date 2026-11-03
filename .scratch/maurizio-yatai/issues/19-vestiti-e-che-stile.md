# 19: I Vestiti e Che stile!

**What to build:** Ogni Matsuri ha due Vestiti per Maurizio (tabella "I Matsuri" di GAME_SPEC.md), sbloccati con le stelle del Matsuri (non si comprano con gli Yen: "gli Yen comprano lo Yatai, le stelle vestono Maurizio"). Si scelgono nella **Bottega**, come terza sezione accanto a Potenziamenti e Arredo. Maurizio ne indossa uno; se è un Vestito del Matsuri in corso scatta Che stile!, cioè la Mancia ×1,2 (non "+20% del prezzo"). Il ventaglio dell'Hanami è un accessorio da indossare, diverso dal ventaglio Potenziamento del ticket 17, come deciso con Giuseppe.

**Blocked by:** 16 (Il salvataggio), 17 (I Potenziamenti: serve la Bottega)

**Status:** ready-for-agent

- [ ] I 10 Vestiti sono disegnati su Maurizio e restano a posto mentre si anima.
- [ ] Le stelle che servono per ogni Vestito sono nel file di configurazione (4★ il primo, 10★ il secondo, su un massimo di 18★ per Matsuri, uguale per tutti: valori di partenza); si contano le migliori di ognuna delle 6 Serate del Matsuri e non si spendono. Vestiti sbloccati e Vestito indossato si salvano.
- [ ] La Bottega ha la sezione Vestiti: i Vestiti bloccati si vedono con "★ n/18" come vetrina, e i due del Matsuri in corso hanno il segno Che stile!.
- [ ] Quando una Serata sblocca un Vestito, il recap di fine Serata chiede "Nuovo Vestito! Lo indossi?" con il bottone "Indossalo". Il Vestito non cambia mai da solo.
- [ ] Nessuna Serata richiede un Vestito: le stelle non bloccano l'avanzamento.
- [ ] Che stile! è Mancia ×1,2, ha il suo test e in Serata si vede quando è attivo.
- [ ] GAME_SPEC.md dice chiaramente che i due ventagli sono oggetti diversi.
- [ ] I testi nuovi sono in tutte e tre le lingue.
- [ ] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero, lo stato nuovo compare in `window.render_game_to_text()` e la console non ha errori.

## Comments

### Dalla mappa yatai-economia-e-cucina (2026-11-03)

Ricaduta del ticket 04 della mappa. Cambiato: il bloccante (16 e 17, perché serve la Bottega), la frase sui Vestiti in "What to build", il criterio sulle stelle (4★ e 10★ su 18) e quattro criteri nuovi (sezione Vestiti con vetrina "★ n/18" e segno Che stile!, "Indossalo" nel recap, avanzamento mai bloccato, Che stile! ×1,2). Il 29 regola 4★/10★ e controlla che Che stile! pesi al più circa +9%.
