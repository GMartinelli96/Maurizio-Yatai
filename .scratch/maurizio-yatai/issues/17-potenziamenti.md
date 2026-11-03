# 17: I Potenziamenti

**What to build:** Una schermata, raggiungibile dalla mappa, dove si spendono gli Yen nei Potenziamenti: Postazione più veloce (3 livelli per ognuna delle 4 Postazioni con cottura: il tagliere dell'onigiri non cuoce e non ne ha), Posto in più (il quarto Posto) e ventaglio di Maurizio (+Pazienza, 3 livelli). Il ventaglio Potenziamento è un oggetto diverso dal ventaglio del Vestito dell'Hanami (ticket 19), come deciso con Giuseppe. La schermata è la **Bottega** (GLOSSARY.md) e nasce già pensata a tre sezioni: Potenziamenti (questo ticket), Arredo (18) e Vestiti (19). Il ticket 35 ne fa una prima versione con i soli Potenziamenti dell'Hanami: qui si estende.

**Blocked by:** 16 (Il salvataggio)

**Status:** ready-for-agent

- [ ] Comprare un Potenziamento costa Yen e l'acquisto si salva.
- [ ] Ogni Potenziamento cambia la Serata come dice la spec e ha il suo test.
- [ ] Con il quarto Posto lo Yatai resta leggibile a 360×640.
- [ ] La schermata è la Bottega del glossario e ha lo spazio per le tre sezioni (Potenziamenti, Arredo, Vestiti), anche se qui si riempie solo la prima.
- [ ] I numeri nuovi (prezzi, effetti) sono nel file di configurazione e i testi nuovi sono in tutte e tre le lingue.
- [ ] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero, lo stato nuovo compare in `window.render_game_to_text()` e la console non ha errori.

## Comments

### Dalla mappa yatai-economia-e-cucina (2026-11-03)

Ricaduta del ticket 04 della mappa (Vestiti nella Bottega): tolta la frase "il glossario non ha ancora un nome" (il nome c'è: **Bottega**) e riscritto il criterio sul nome. Gli Yen comprano lo Yatai (Potenziamenti e Arredo), le stelle vestono Maurizio: i Vestiti non hanno prezzo in Yen e non entrano in questo ticket.

Deciso con Giuseppe il 2026-11-03 (segue dal ticket 35): "Postazione più veloce" non ha effetto sul tagliere del riso, perché l'onigiri non ha cottura, quindi vale per le 4 Postazioni con cottura invece di "ognuna delle 5". Il livello della piastra arriva già con il ticket 06; qui si estende alle altre tre.
