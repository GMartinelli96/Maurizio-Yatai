# 07: Il kakigōri e le varianti

**What to build:** Il terzo Piatto, alla macchina del ghiaccio: non si brucia mai, ma ha tre varianti (fragola, melone, matcha). Con questo ticket arriva il modo di scegliere la variante. Con la cucina a tocchi (ticket 33) la variante è l'Ingrediente che distingue il Piatto (qui lo sciroppo: fragola, melone, matcha) e ha una **Scorta** per ciascuna: si tocca direttamente, senza menu (decisione del 2026-11-03, che sostituisce il menu "apri, poi scegli" deciso prima). La **Ricetta** è ghiaccio, [2 s], sciroppo, prendi: 3 tocchi, entro il tetto di 4. Nella nuvoletta dell'Ordine e sul Bancone la variante si riconosce dall'icona, non solo dal colore. Un Piatto della variante sbagliata non si serve. La regola delle Scorte per variante vale per tutti i Piatti con varianti, quindi anche per il ticket 08.

**Blocked by:** 06 (Il takoyaki: cottura, bruciatura e Fumo)

**Status:** ready-for-agent

- [ ] Le tre Scorte dello sciroppo (fragola, melone, matcha) si toccano direttamente, senza menu: dopo il ghiaccio e la macinatura (2 s), il tocco su una delle tre mette quello sciroppo nel Piatto; le altre due, a Piatto finito o scelta già fatta, non fanno niente (con test).
- [ ] Le tre Scorte e le tre icone si distinguono anche in uno screenshot in bianco e nero, guardato.
- [ ] Servire la variante sbagliata non funziona: il Cliente scuote la testa (con test).
- [ ] La regola delle Scorte per variante è in GAME_SPEC.md (Come si gioca, scritta il 2026-11-03) e il codice la rispetta.
- [ ] I tasti per le Scorte delle varianti arrivano con il ticket 26; qui basta tocco e mouse.
- [ ] Il kakigōri ha la sua Ricetta (ghiaccio 20, [2 s], sciroppo 60, prendi: 3 tocchi), la cottura di 2 s tra ghiaccio e sciroppo, e il tetto di 4 tocchi vale con un test sul conteggio. Ordine sbagliato: non succede niente (come in GAME_SPEC.md).
- [ ] La Ricetta in icone sotto la macchina del ghiaccio mostra lo sciroppo della variante scelta; il prossimo Ingrediente è evidenziato.
- [ ] Gli Ingredienti e i costi del kakigōri sono in `config.js` (bozza in GAME_SPEC.md, da regolare qui e nel 29); la variante è un Ingrediente diverso e il costo del Piatto resta circa un terzo del prezzo.
- [ ] I numeri nuovi sono nel file di configurazione e i testi nuovi sono in tutte e tre le lingue.
- [ ] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero, lo stato nuovo compare in `window.render_game_to_text()` e la console non ha errori.

## Comments

### Dalla mappa yatai-economia-e-cucina (2026-11-03)

Ricadute dei ticket 01 e 02 della mappa. Cambiato: la frase sulla variante in "What to build" e i criteri nuovi su Ricetta, tetto e Ingredienti.

Due punti che la mappa non chiudeva, **decisi con Giuseppe il 2026-11-03** e scritti in GAME_SPEC.md ("Come si gioca", cucina a tocchi):

- **Niente menu delle varianti: una Scorta per variante.** Il menu "apri, poi scegli" costava un tocco in più e portava il ramen a 5 tocchi, oltre il tetto. Con una Scorta per variante (uovo e naruto direttamente toccabili) il tetto regge. Il menu deciso in precedenza con Giuseppe è sostituito.
- **Cottura del kakigōri: resta.** I 2 s della tabella sono la macinatura, tra il ghiaccio e lo sciroppo. La regola 2 della spec ora elenca anche il kakigōri tra i Piatti con cottura.

**Rischio di spazio, da risolvere nel ticket 08** (che ha tutte le Scorte): con una Scorta per variante, a fine gioco ce ne sono circa 15 (riso, alga, pastella, polpo, salsa, ghiaccio, tre sciroppi, ripieni, noodles, brodo, uovo, naruto) accanto a 5 Postazioni. Qui, con tre sciroppi, vanno già verificate a 360×640.
