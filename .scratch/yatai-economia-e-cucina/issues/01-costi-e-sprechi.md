# 01: Gli ingredienti costano? Cosa succede se preparo un Piatto che non serve

**Type:** grilling
**Blocked by:** None
**Status:** resolved

## Question

Due recensioni chiedono che "se preparo qualcosa che non serve, perdo soldi" e un recap "con i costi dei vari prodotti". Oggi nel gioco non esistono costi: un Piatto bruciato o inutile va nel cestino senza penale, e l'Incasso è solo ciò che entra.

Decidere, con Giuseppe:

- Esistono costi di preparazione (per Piatto o per ingrediente)? E la perdita per un Piatto sprecato (bruciato, mai servito, sbagliato)?
- Se sì: quanto pesa rispetto all'Incasso, e come si concilia con "nessun game over a metà Serata", con il gioco per tutte le età e con le stelle (che oggi si basano sull'Incasso lordo)? L'obiettivo e le soglie diventano sul netto?
- Se no: c'è un modo più leggero per dare lo stesso senso di conseguenza (per esempio perdere Mancia o tempo, senza togliere Yen)?
- Una Serata può chiudere in perdita? Cosa vede il giocatore in quel caso?
- Che nome hanno nel glossario i costi e lo spreco?

Il risultato deve essere abbastanza chiaro da poter scrivere la regola in `GAME_SPEC.md` ("La Serata") e da far capire quali ticket cambiano (04, 06, 22, 29). Il recap con i costi (nella sezione "Not yet specified" della mappa) si specifica dopo questa risposta.

Skill da usare: `grilling` e `domain-modeling`.

## Answer

Deciso con Giuseppe il 2026-11-03 (spunto: un gioco di pizze in cui ogni ingrediente ha un costo).

1. **I Piatti costano, per Ingrediente.** Ogni Piatto è fatto di Ingredienti che costano Yen; il costo del Piatto è la somma, circa un terzo del prezzo. Vale sia con la cucina a tocchi sia con quella automatica (ticket 02): a tocchi si paga ingrediente per ingrediente, in automatico tutto all'avvio della cottura.
2. **Spreco senza rimborso.** Ogni Ingrediente che non finisce in un Piatto servito (bruciato, avanzato, rubato, rovinato) è perso, anche se è un Disturbatore a rubarlo.
3. **Un solo numero netto.** L'Incasso diventa Vendite meno Spesa. Scende un po' (un "−30" piccolo) quando si usa un Ingrediente, sale quando si serve. Stelle e Yen guadagnati si contano su questo netto.
4. **Si può chiudere in rosso**, ma senza ★ né Yen guadagnati: gli Yen già in tasca non scendono mai, non c'è game over, si rigioca subito, il recap è gentile.
5. **Stelle**: soglie invariate (×1,3 e ×1,6), obiettivi sul netto, da ricalibrare nel ticket 29.
6. **Recap di fine Serata**: Vendite, Spesa, Spreco e Incasso, più una tabella per Piatto (fatti, serviti, sprecati, costo, vendite).
7. **Glossario**: Ingrediente, Spesa, Spreco, Vendite; Incasso ridefinito come netto. Evitare "costo", "perdita" e "guadagno" nei testi.

Scritto in `GAME_SPEC.md` (La Serata, con la bozza degli Ingredienti per Piatto) e in `GLOSSARY.md`.

Ricadute sui ticket di implementazione (da applicare alla chiusura della mappa, perché dipendono dal ticket 02): 04 (la logica della Serata e il recap), 06, 07, 08 (gli Ingredienti dei Piatti), 21 (la ricetta è la lista degli Ingredienti), 22 (il recap e i Titoli), 29 (obiettivi sul netto, costi da regolare).
