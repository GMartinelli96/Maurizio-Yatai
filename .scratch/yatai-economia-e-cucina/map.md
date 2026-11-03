# Mappa: l'economia e la cucina dello Yatai

## Destination

Le decisioni di design uscite dalle recensioni della demo del ticket 04 (cucina più interattiva, costi e sprechi, recap, Clienti che si lamentano, Vestiti nella Bottega) sono prese e scritte in `GAME_SPEC.md`, `GLOSSARY.md` e nei ticket di `.scratch/maurizio-yatai/issues/`, **prima di iniziare il ticket 06** (il takoyaki). La mappa si chiude quando non resta nulla da decidere: l'implementazione è fatta dai ticket normali.

## Notes

- Dominio: Maurizio Yatai. Usa i termini di `GLOSSARY.md` (Piatto, Postazione, Bancone, Pazienza, Mancia, Incasso, Yen, Bottega, Vestito) e aggiungi quelli nuovi con `/domain-modeling`.
- Vincoli che ogni decisione deve rispettare (da `GAME_SPEC.md`): nessun game over a metà Serata, gioco per tutte le età (bambini compresi), 360×640 in verticale con il pollice, tutto generato dal codice (ADR-0001), tre lingue.
- Il ticket 05 ("è divertente?") è un verdetto di Giuseppe sulla demo: i ticket di questa mappa non lo sostituiscono, ma lo informano. Le decisioni di questa mappa non bloccano il 05; devono arrivare prima del 06.
- Eccezione a "pianifica, non fare": alla chiusura di un ticket la decisione si riporta subito in `GAME_SPEC.md`/`GLOSSARY.md` e nei ticket di implementazione toccati, così non restano due versioni della verità. Il codice del gioco invece non si tocca (salvo il prototipo del ticket 02, che è usa-e-getta).
- Fonte delle recensioni: un giocatore che ha provato la demo del ticket 04 (riportate da Giuseppe il 2026-11-03).
- Idee già rimandate in `BACKLOG.md` (Gesti per Piatto, Aiutanti, Notte infinita) restano rimandate, a meno che un ticket di questa mappa non le riprenda esplicitamente.

## Decisions so far

<!-- una riga per ticket chiuso: [titolo](link): gist della risposta -->

- [Gli ingredienti costano? Cosa succede se preparo un Piatto che non serve](issues/01-costi-e-sprechi.md): sì, costo per Ingrediente (circa un terzo del prezzo del Piatto), Spreco senza rimborso, Incasso netto in un solo numero, Serata in rosso possibile senza game over, recap con tabella per Piatto, stelle sul netto. Scritto in `GAME_SPEC.md` e `GLOSSARY.md`.

- [Clienti che si lamentano sotto i 3 cuori](issues/03-clienti-che-si-lamentano.md): il Lamento è la faccia (quattro espressioni: `perplessa` con 2 cuoricini, `imbronciata` con 1) più un segno senza parole (goccia, sbuffo) e un "mmh" morbido, per ogni Cliente. I cuoricini non cambiano; "riduci movimento" rende i segni fissi. Nuovo ticket di implementazione 33. Scritto in `GAME_SPEC.md` e `GLOSSARY.md`.

- [I Vestiti: si comprano nella Bottega o si sbloccano con le stelle?](issues/04-vestiti-nella-bottega.md): restano un premio delle stelle, senza prezzo in Yen ("gli Yen comprano lo Yatai, le stelle vestono Maurizio"). Si sbloccano con le stelle del Matsuri (4★ e 10★ su 18) e si scelgono nella Bottega, che ha tre sezioni; il recap offre "Indossalo". Che stile! è Mancia ×1,2 (al più circa +9% sull'Incasso). Ricadute su 17, 18, 19, 26, 28, 29. Scritto in `GAME_SPEC.md` e `GLOSSARY.md`.

- [Cucina a tocchi: riso e alga per l'onigiri?](issues/02-cucina-a-tocchi.md): variante B per tutti i Piatti, cioè gli Ingredienti toccati dalle Scorte nell'ordine della Ricetta, ognuno pagato al tocco; tetto 4 tocchi per Piatto; ordine sbagliato = non succede niente; Ricetta e prossimo Ingrediente sempre visibili; i Piatti con cottura hanno Ingredienti di prima, cottura, Ingredienti di dopo. Prototipo A/B/C: [`assets/prototipo-cucina.html`](assets/prototipo-cucina.html). Scritto in `GAME_SPEC.md` e `GLOSSARY.md` (nuovi: Scorta, Ricetta). Il 33 di `maurizio-yatai` ora è solo l'implementazione.

**Stato (2026-11-03): i quattro ticket sono `resolved` e le ricadute sono applicate** (vedi "Ricadute applicate" sotto). I ticket di `maurizio-yatai` sono allineati alle decisioni; restano alcuni punti emersi nell'applicarle, ciascuno assegnato al ticket in cui si decide. Il 06 (takoyaki) ora ha tra i bloccanti anche il 36.

## Ricadute applicate

Applicate il 2026-11-03, senza cambiare gli Status e senza spuntare criteri. Ogni ticket toccato ha una nota "Dalla mappa yatai-economia-e-cucina" in `## Comments`. Le cartelle sono quelle di `.scratch/maurizio-yatai/issues/`.

- **Nuovo 36** "I Clienti si lamentano" (la mappa lo chiamava 33, già preso; il 36 era il primo libero): ricadute del ticket 03. Blocca 06 e 09 (ogni correzione nata dalla prima prova li blocca, ticket 05).
- **Ticket 01 (costi e sprechi):** 04 (nota: Incasso lordo e onigiri automatico superati), 06 (Ingredienti, Spreco, tabella per Piatto), 07 e 08 (Ingredienti e costi dei Piatti nuovi), 21 (la Ricetta è la lista degli Ingredienti), 22 (recap, Serata in rosso, Titoli, Incasso netto in Condividi), 29 (obiettivi sul netto).
- **Ticket 02 (cucina a tocchi):** 06 (Ricetta di 4 tocchi, bruciatura a cottura finita), 07 e 08 (Ricetta entro i 4 tocchi, la variante è un Ingrediente), 20 (la zampina indica le Scorte), 21, 26 (tasti delle Scorte, Ingrediente non solo dal colore), 29 (Tanabata e giocatore lento), 34 (ritmo a tocchi), 35 (Potenziamento "tagliere più veloce"). Il 33 era già corretto: controllato, non toccato.
- **Ticket 03 (Lamento):** 36 (nuovo), 09 (`perplessa` del cast), 23 e `docs/design/audio.md` (il "mmh"), 26 (goccia e sbuffo fissi; scritta la sezione "Effetti di riduci movimento", che mancava), 29 (soglie 2 e 1).
- **Ticket 04 (Vestiti):** 17 (la Bottega ha un nome), 18 (lanterne bonbori), 19 (bloccato anche da 17, sezione Vestiti, 4★ e 10★, "Indossalo", ×1,2), 26 (la Bottega tra le schermate), 28 (screenshot "la Bottega, con le tre sezioni"), 29 (soglie dei Vestiti, +9%).
- **Bloccanti:** 06 e 09 hanno aggiunto il 36 (avevano già 05, 33, 34, 35). Il 19 ha aggiunto il 17.
- **Ticket toccati in tutto:** 04, 06, 07, 08, 09, 17, 18, 19, 20, 21, 22, 23, 26, 28, 29, 34, 35, nuovo 36, più `docs/design/audio.md`.

## Punti emersi applicando le ricadute

Non erano nei quattro ticket della mappa: sono incongruenze trovate leggendo i ticket e il codice. I primi quattro gruppi sono **decisi con Giuseppe il 2026-11-03** (ha accettato le raccomandazioni) e scritti in `GAME_SPEC.md`, `GLOSSARY.md` e nei ticket indicati.

- **La venetta dell'`imbronciata`** (ticket 36): l'espressione approvata resta com'è, con il suo piccolo segno rosso, unica eccezione al "niente venuzze". La `perplessa` non ha venetta.
- **"Tagliere più veloce" senza cottura** (ticket 35, 06, 17): "Postazione più veloce" vale solo per le 4 Postazioni con cottura. Il 35 vende due Potenziamenti; la piastra riceve il suo con il 06; il 17 estende alle altre.
- **Varianti e tetto di 4 tocchi** (ticket 07, 08, 26): niente menu, una Scorta per variante. La cottura del kakigōri resta (2 s tra ghiaccio e sciroppo) e quella del ramen cade prima di uovo o naruto. Il menu deciso in precedenza con Giuseppe è sostituito.
- **Condividi in una Serata in rosso** (ticket 22): non c'è.
- **Conseguenza da risolvere nel 08:** con una Scorta per variante, a fine gioco ci sono circa 15 Scorte accanto a 5 Postazioni a 360×640, e la pastella è un Ingrediente di due Piatti (takoyaki e taiyaki) mentre oggi l'id di una Scorta è il nome dell'Ingrediente. Sono due criteri nuovi del 08.
- **Ancora aperto, senza decisione:** i suoni del tocco su una Scorta e della Scorta che trema (ticket 23): `audio.md` non li ha.

## Not yet specified

- **Numeri degli Ingredienti e obiettivi sul netto**: il principio è deciso (ticket 01), i valori sono una bozza in `GAME_SPEC.md` e li regola il ticket 29 di `maurizio-yatai`.
- **Fatto il 2026-11-03 (vedi "Ricadute applicate"). Come i ticket esistenti cambiano** (04, 06, 07, 08, 17, 19, 21, 22, 29): la lista delle ricadute del ticket 01 è nel suo `## Answer`; si applica a mappa chiusa, e ora che il ticket 02 è deciso si può fare. Il ticket di implementazione per Ingredienti, Spesa e Spreco non serve più separato: la parte dell'onigiri è nel 33 di `maurizio-yatai`, il resto (recap per Piatto, Ingredienti dei Piatti nuovi) arriva con i ticket 06, 07, 08 e 22. Le ricadute del ticket 02 (06, 07, 08, 20, 21, 26, 29, 34, 35) sono nel suo `## Answer`. Le ricadute del ticket 03 (nuovo ticket 33 "I Clienti si lamentano", più 09, 23, 26 e 29) sono nel suo `## Answer` e si applicano insieme alle altre. Le ricadute del ticket 04 della mappa (17, 18, 19, 26, 28, 29) sono nel suo `## Answer`; non dipendono dal ticket 02, ma si applicano insieme alle altre.
- **Attenzione ai numeri dei ticket:** "ticket 04" è ambiguo, perché c'è il 04 di `maurizio-yatai` (la prima Serata) e il 04 di questa mappa (i Vestiti). Nelle ricadute, quando serve, scrivi "04 di `maurizio-yatai`".
- **Numeri già presi in `maurizio-yatai`:** il 33 ("La cucina a tocchi: l'onigiri non cuoce più da solo") e il 34 ("Una Serata che cambia") sono stati creati da un'altra sessione dopo il ticket 05. Anche il 35 ("Un assaggio di Potenziamenti") è ormai preso. Il ticket "I Clienti si lamentano" non poteva essere il 33 né il 35: ha preso il primo numero libero, il **36** (creato il 2026-11-03, cartella controllata prima). La riconciliazione del 33 con il ticket 02 è fatta: il prototipo è a parte, il 02 è chiuso e il 33 è solo l'implementazione.

## Out of scope

- Implementare qualsiasi cosa nel gioco (è lavoro dei ticket normali, dopo questa mappa).
- Nuovi Piatti, nuove modalità (Notte infinita) e gli Aiutanti del cast: sono già nel `BACKLOG.md`.
