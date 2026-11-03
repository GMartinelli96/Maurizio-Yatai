# 22: Titoli e Condividi

**What to build:** La schermata di fine Serata mostra Vendite, Spesa, Spreco e Incasso con la tabella per Piatto (fatti, serviti, sprecati, costo, vendite), assegna 1 o 2 Titoli buffi per come si è giocato (per esempio "Amico dei gatti") e ha il pulsante Condividi, con la frase "Ho incassato 12.500 yen allo Yatai di Maurizio! Mi batti?" e il link al gioco. Usa la condivisione del telefono; dove non c'è, copia il link.

**Blocked by:** 10 (Il cast, parte 2), 11 (I Disturbatori)

**Status:** ready-for-agent

- [ ] Il recap ha Vendite, Spesa, Spreco e Incasso e la tabella per Piatto con tutti e 5 i Piatti (la tabella nasce nel ticket 06), e sta a 360×640 nelle tre lingue; lo Spreco di un Piatto viene dagli Ingredienti usati e non serviti.
- [ ] Una Serata chiusa in rosso ha il recap gentile della spec ("Stasera abbiamo sprecato troppo, riproviamo!"), senza ★ né Yen, e si rigioca subito.
- [ ] I Titoli e le loro condizioni sono nei dati e possono leggere anche Spesa e Spreco; un test controlla che una Serata giocata in un certo modo dia il Titolo giusto.
- [ ] Condividi usa la condivisione del telefono quando c'è; altrimenti copia il link e lo dice a schermo.
- [ ] In una Serata chiusa in rosso il pulsante Condividi non c'è (con test): la frase "Ho incassato N yen" non ha senso con un numero negativo.
- [ ] La frase usa l'Incasso vero (il netto, Vendite meno Spesa), scritto con i separatori della lingua, in tutte e tre le lingue.
- [ ] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero, lo stato nuovo compare in `window.render_game_to_text()` e la console non ha errori.

## Comments

### Dalla mappa yatai-economia-e-cucina (2026-11-03)

Ricaduta del ticket 01 della mappa (costi e sprechi). Cambiato: "What to build" e tre criteri (recap con Vendite, Spesa, Spreco, Incasso e tabella per Piatto; Serata in rosso; Titoli che leggono Spesa e Spreco) più l'Incasso netto nella frase di Condividi. La tabella per Piatto la costruisce il ticket 06; qui si completa e si controlla con tutti e 5 i Piatti.

**Deciso con Giuseppe il 2026-11-03:** in una Serata in rosso Condividi non c'è (il recap gentile basta). Scritto in GAME_SPEC.md ("Fine Serata") e nel criterio sopra.

Dal ticket 34 (2026-11-03): il recap mostra anche la "Serie più lunga" (GLOSSARY.md, **Serie**) e i Titoli possono leggerla (per esempio una Serie da 8). La Serie non si salva.
