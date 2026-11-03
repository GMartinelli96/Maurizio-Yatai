# 02: Cucina a tocchi: riso e alga per l'onigiri?

**Type:** prototype
**Blocked by:** None
**Status:** resolved

## Question

Una recensione chiede di rendere la preparazione più interattiva: per esempio toccare il riso e poi l'alga per fare l'onigiri, invece di toccare una Postazione e lasciar cuocere il Piatto da solo. Il `BACKLOG.md` ha solo i "Gesti per Piatto" (scorrere per girare, tenere premuto per versare), rimandati.

La domanda è "come dovrebbe comportarsi": quanto interattiva deve essere la cucina senza rovinare la rapidità sul telefono (tocchi istantanei, 120 secondi, 3 Posti)?

Prototipo usa-e-getta (con la skill `prototype`, sul gioco o su una pagina a parte) di almeno due varianti dell'onigiri e di un Piatto con cottura (takoyaki), da provare sul telefono:

- A) com'è oggi: un tocco, cuoce da solo;
- B) a tocchi in sequenza (riso, poi alga, poi prendi), con la sequenza che diventa la "ricetta";
- eventuale C) a scelta di Giuseppe dopo aver visto A e B.

Da decidere con Giuseppe dopo averle provate: quale versione, per quali Piatti, quanti tocchi al massimo, e cosa succede se si sbaglia l'ordine. Il prototipo si collega al ticket come asset; il codice non entra nel gioco.

Il ticket 05 ("è divertente?") può usare lo stesso prototipo per il verdetto.

## Answer

Deciso con Giuseppe il 2026-11-03, in due round, dopo aver visto il prototipo. Giuseppe ha scelto B e ha confermato le raccomandazioni sul resto; non è registrata una prova sul telefono vero (resta un controllo nel ticket 33).

**Il prototipo** è [`assets/prototipo-cucina.html`](../assets/prototipo-cucina.html): un solo file usa-e-getta, fuori dal codice del gioco, con tre varianti sugli stessi Clienti e i numeri veri della Serata (3 Posti, Pazienza 25 s, arrivi ogni 2,5–4,5 s). Si apre con doppio clic; sul telefono va servito da una cartella (`python -m http.server`). Non entra nel gioco.

**Cosa ha mostrato** (un bot semplice, a 0,5 e 0,9 s per tocco: non è una persona, ma dà l'ordine di grandezza):

- Nell'Hanami (solo onigiri) a tocchi non cambia l'Incasso: costa circa un tocco in più per Cliente (4 invece di 3) e il limite restano gli arrivi.
- Nel Tanabata, col takoyaki a tocchi, i tocchi per Cliente passano da 4,2 a 6,2 e un giocatore lento incassa circa il 38% in meno (4420 invece di 7190 Yen), con più Clienti persi. Non è un motivo per cambiare regola: va ricalibrato nel ticket 29 (arrivi, Pazienza, obiettivi sul netto).

**Le decisioni:**

1. **Variante B: a tocchi in sequenza, per tutti i Piatti.** Gli Ingredienti si toccano uno dopo l'altro nell'ordine della **Ricetta**, ognuno si paga quando lo si tocca (il "−20" piccolo). La sequenza è la Ricetta. Scartate A (un tocco, cuoce da solo) e C (ordine libero). Una regola sola per tutti i Piatti, perché è più facile da capire per un bambino.
2. **Piatti con cottura** (takoyaki, taiyaki, ramen): gli Ingredienti di prima, poi la cottura da sola (con l'avviso di cottura e la bruciatura di oggi), poi gli eventuali Ingredienti di dopo (la salsa del takoyaki), poi si prende. L'onigiri non ha cottura: il lavoro sono i tocchi. Nel prototipo il takoyaki è pastella, polpo, cottura, salsa, prendi.
3. **Tetto: 4 tocchi per Piatto** (un tocco per Ingrediente, più uno per prenderlo). Gli Ingredienti della bozza ci stanno già: onigiri 3, kakigōri 3, taiyaki 3, takoyaki 4, ramen 4. Un Piatto che servisse di più va rivisto prima di entrare.
4. **Ordine sbagliato: non succede niente.** La Scorta trema, non si paga, non c'è Spreco né game over. La Spesa si paga solo sul tocco giusto.
5. **Aiuti sempre visibili:** la Ricetta (le icone degli Ingredienti in ordine) sotto la Postazione e il prossimo Ingrediente evidenziato, in ogni Serata e non solo nel tutorial. Il Ricettario (ticket 21) mostra la stessa sequenza.
6. **"Le ricette" della recensione:** la sequenza sempre mostrata basta. Niente ricette da scoprire o da imparare a memoria (rallenterebbero chi gioca col pollice). Questo chiude la voce "Ricette come meccanica di gioco" della mappa.
7. **Gesti per Piatto** (scorrere, tenere premuto) restano nel `BACKLOG.md`.
8. **Glossario:** nuovi termini **Scorta** (dove si toccano gli Ingredienti; il codice del ticket 33 la usa già) e **Ricetta**; **Postazione** non dice più che il Piatto cuoce sempre da solo.

Scritto in `GAME_SPEC.md` (Come si gioca, Ingredienti e Spreco, tabella dei Piatti) e in `GLOSSARY.md`.

**Riconciliazione con il ticket 33 di `maurizio-yatai`.** Il 33 diceva di eseguire questo prototipo sul gioco vero e di chiudere il 02. È stato fatto al contrario: il prototipo è a parte e il 02 si chiude qui. Il 33 non ha più il "Primo passo" né la scelta delle varianti: è solo l'implementazione di B per l'onigiri, con la Spesa. Il suo testo e i suoi primi criteri sono stati corretti, e ora rimandano a questa risposta. Nota: al momento della chiusura l'albero di lavoro contiene già modifiche non committate al gioco (`Serata.js`, `config.js`, scena, test) che implementano B con le Scorte e la Spesa, fatte da un'altra sessione; non le ho toccate.

Ricadute sui ticket di implementazione (da applicare alla chiusura della mappa, insieme a quelle dei ticket 01, 03 e 04 della mappa):

- **33:** già corretto (vedi sopra), con l'avvertenza che i Piatti con cottura seguono la regola 2.
- **06 (takoyaki):** Ingredienti pastella, polpo, [cottura], salsa, prendi: 4 tocchi; la bruciatura parte a cottura finita, anche se manca la salsa. Aggiungere i criteri sul tetto e sull'ordine sbagliato.
- **07, 08 (kakigōri e varianti, ramen e taiyaki):** ogni Piatto ha la sua Ricetta entro i 4 tocchi; la variante è un Ingrediente diverso (sciroppo, ripieno, uovo o naruto).
- **21 (Ricettario):** la ricetta di ogni Piatto è la sequenza di Ingredienti a icone, la stessa che si vede sotto la Postazione.
- **20 (tutorial):** la zampina indica la prima Scorta da toccare; la Ricetta è già sempre visibile.
- **26 (accessibilità):** i tasti 1–5 coprono le Postazioni, ma le Scorte hanno bisogno dei loro (da decidere nel ticket); l'Ingrediente giusto non si distingue solo dal colore.
- **29 (bilanciamento):** ricalibrare gli arrivi, la Pazienza e gli obiettivi sul netto con la cucina a tocchi, con il Tanabata come caso critico (il giocatore lento).
- **34 (Serata che cambia) e 35 (Potenziamenti):** i tocchi in più per Cliente cambiano il ritmo da cui partono le ondate e i prezzi; il Potenziamento "tagliere più veloce" va riletto (con l'onigiri senza cottura non ha più effetto: o diventa "meno tocchi" o si applica solo ai Piatti con cottura).
