# 03: Clienti che si lamentano sotto i 3 cuori

**Type:** grilling
**Blocked by:** None
**Status:** resolved

## Question

Una recensione chiede che, quando i cuori della Pazienza scendono sotto il terzo, i Clienti si lamentino e abbiano espressioni sempre più scocciate. Oggi la Pazienza ha 5 cuoricini e il Cliente cambia faccia solo alla fine, quando se ne va imbronciato (ticket 04, `GAME_SPEC.md`).

Decidere, con Giuseppe:

- Quante espressioni (per esempio 3: contento, perplesso, scocciato) e a quali soglie di cuori; cosa succede ai cuoricini stessi.
- Il lamento: solo faccia, oppure anche un fumetto/versetto (che deve esistere nelle tre lingue) e/o un suono? Un lamento per Cliente o uno per tutti?
- Va bene per i bambini e per il tono del gioco (nessuna cattiveria, "scocciato" ma buffo)?
- I Clienti del cast (ticket 09 e 10) hanno espressioni proprie o usano lo stesso schema? E i Clienti di passaggio già disegnati (tanuki, kitsune, maneki-neko) vanno ridisegnati con le nuove espressioni?
- Il "riduci movimento" (ticket 26) come cambia questa animazione?
- Dove si registra: nuovo ticket di implementazione, o criterio da aggiungere al 04?

## Answer

Deciso con Giuseppe il 2026-11-03, in due round.

1. **Quattro espressioni, con soglie sui cuoricini.** Con 5, 4 e 3 cuoricini il Cliente è `neutra` (come oggi). Con 2 cuoricini (gli ultimi 10 secondi circa) diventa `perplessa`, una faccia nuova. Con 1 cuoricino è `imbronciata`, la faccia che c'è già, e resta tale quando se ne va. Servito è `contenta`. L'espressione dipende dai cuoricini rimasti, non dal tempo, quindi segue da sola i Vizi che cambiano la velocità della Pazienza (Carlotta, Balosso, Ebi Furai).
2. **I cuoricini non cambiano.** Si spengono come oggi e l'ultimo lampeggia già. Il lavoro in più lo fa la faccia, così il giocatore guarda un segnale solo e la Mancia (che dipende dai cuoricini) resta leggibile.
3. **Il Lamento è senza parole.** Faccia più un segno: una goccia di sudore a 2 cuoricini, uno sbuffo d'aria a 1 cuoricino. Più un "mmh" breve e morbido generato dal codice, una volta per scalino e per Cliente, mai una voce. Nessun fumetto con parole, così non servono testi nelle tre lingue né la rilettura del madrelingua. Ogni Cliente si lamenta per conto suo.
4. **Tono per tutte le età.** Scocciato ma buffo: guance un po' gonfie, sopracciglia inclinate, bocca a onda. Niente occhi rabbiosi, denti o venuzze di rabbia; il suono è un borbottio, mai un grido.
5. **Cast e Clienti di passaggio.** Tutti i Clienti usano lo stesso schema a quattro espressioni; i sette del cast non hanno un Lamento proprio. Le espressioni legate a un Vizio (per esempio Ebi Furai spaventato) restano nei loro ticket. Tanuki, kitsune e maneki-neko non si ridisegnano: si aggiunge solo la `perplessa` con il kit e lo stesso seme del tremolio, così il corpo non "salta"; le tre espressioni approvate e le loro impronte restano invariate.
6. **"Riduci movimento".** La faccia cambia comunque (è informazione, non movimento). Goccia e sbuffo diventano fissi: compaiono e restano senza muoversi. Il suono resta uguale.
7. **Glossario.** Nuovo termine **Lamento**; la definizione di **Pazienza** dice che, mentre si svuota, cambia la faccia del Cliente.

Scritto in `GAME_SPEC.md` (Clienti) e in `GLOSSARY.md`.

Ricadute sui ticket di implementazione (da applicare alla chiusura della mappa, come per il ticket 01):

- **Nuovo ticket 33 in `maurizio-yatai`, "I Clienti si lamentano".** La `perplessa` dei tre Clienti di passaggio, le soglie sui cuoricini nella logica della Serata (con test), la vista del Cliente (cambio di faccia, goccia, sbuffo) e il riscontro nello stato di `render_game_to_text()`. Chiede di disegnare solo `perplessa` e di riusare `imbronciata`; non dipende dal ticket 02.
- **09 (cast parte 1):** ogni peluche del cast ha anche la `perplessa`; il criterio sul riconoscerli a colpo d'occhio vale anche con quella faccia.
- **23 (audio) e `docs/design/audio.md`:** l'effetto "mmh" del Lamento, morbido e sotto la musica.
- **26 (accessibilità):** aggiungere all'elenco degli effetti di "riduci movimento" goccia e sbuffo fissi (l'elenco "in fondo a questo file" oggi non c'è e va scritto).
- **29 (bilanciamento):** le soglie (2 e 1 cuoricino) sono un valore di partenza; se una Serata risulta troppo ansiosa si ritoccano lì.
