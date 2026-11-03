# 04: I Vestiti: si comprano nella Bottega o si sbloccano con le stelle?

**Type:** grilling
**Blocked by:** None
**Status:** resolved

## Question

Una recensione chiede "lo shop con vestiti ed upgrade". Nella spec la Bottega (ticket 17 e 18) ha Potenziamenti e Arredo comprati con gli Yen, mentre i Vestiti (ticket 19) si sbloccano con le stelle e non stanno nella Bottega.

Decidere, con Giuseppe:

- I Vestiti restano un premio delle stelle, si comprano con gli Yen, o entrambe (stelle per sbloccare, Yen per comprare)?
- Dove si scelgono e si indossano: nella Bottega, in una schermata a parte, o in entrambe? Il nome nel glossario resta "Bottega"?
- Se i Vestiti costano Yen, "Che stile!" (+20% di Mancia) cambia peso nell'economia? E ha senso con i costi e gli sprechi del ticket 01?
- Cambia la regola "le stelle non bloccano mai l'avanzamento"? (Dovrebbe restare vera.)
- Quali ticket cambiano (17, 18, 19)? Si riordinano le dipendenze?

La risposta alla seconda domanda può dipendere dal ticket 01 se i costi cambiano il valore degli Yen: se è così, scrivi la dipendenza.

## Answer

Deciso con Giuseppe il 2026-11-03, in due round. Dipendenza dal ticket 01: con la Spesa gli Yen sono più scarsi (l'Incasso è un netto, in rosso non dà Yen) e hanno già 19 Potenziamenti e 5 pezzi di Arredo da pagare, quindi non si aggiunge un terzo uso.

1. **I Vestiti restano un premio delle stelle, senza prezzo in Yen.** La regola è una sola: gli Yen comprano lo Yatai, le stelle vestono Maurizio. Niente doppia porta (stelle e Yen), così un bambino con le stelle non resta fermo davanti a un Vestito per mancanza di Yen, e Che stile! non diventa un Potenziamento a pagamento.
2. **Si scelgono e si indossano nella Bottega**, come terza sezione accanto a Potenziamenti e Arredo; nessuna schermata a parte. I Vestiti bloccati si vedono, con "★ 4/18", come vetrina. Il nome **Bottega** resta; nel glossario la definizione dice che ha tre sezioni.
3. **Che stile! non cambia peso.** È Mancia ×1,2, non "+20% del prezzo". Con la Mancia fino a +50% del prezzo e l'Incasso netto (circa due terzi del prezzo più la Mancia) vale al più circa +9% sull'Incasso, a Pazienza sempre piena. Resta un premio piccolo.
4. **Le stelle non bloccano mai l'avanzamento**: la regola resta vera senza modifiche, nessuna Serata richiede un Vestito.
5. **Stelle per sbloccare**: si contano per Matsuri (le migliori di ognuna delle 6 Serate, al massimo 18★, non si spendono). Primo Vestito a 4★, secondo a 10★, uguale per tutti i Matsuri. Valori di partenza, nel file di configurazione, li regola il ticket 29.
6. **Come si indossa**: si sceglie nella Bottega. Quando se ne sblocca uno, il recap di fine Serata chiede "Nuovo Vestito! Lo indossi?". Nella Bottega i due Vestiti del Matsuri in corso hanno il segno Che stile!. Niente cambi automatici.

Scritto in `GAME_SPEC.md` (Progressione) e in `GLOSSARY.md` (Bottega, Vestito, Che stile!).

Ricadute sui ticket di implementazione (da applicare alla chiusura della mappa, come per i ticket 01 e 03):

- **19 (Vestiti e Che stile!):** `Blocked by` diventa 16 e 17 (serve la Bottega). I Vestiti si scelgono in una sezione della Bottega, con le stelle del Matsuri (4★ e 10★) nel file di configurazione, i bloccati visibili con "★ n/18", il bottone "Indossalo" nel recap, il segno Che stile! sui Vestiti del Matsuri in corso. Che stile! è Mancia ×1,2, con il suo test.
- **17 (Potenziamenti):** togliere la frase "il glossario non ha ancora un nome per questa schermata" (c'è: Bottega). La schermata nasce già pensata a tre sezioni.
- **18 (Arredo):** correggere l'elenco: lanterne bonbori al posto del ramo di ciliegio (la spec era già stata corretta con la ricerca, voce 14).
- **26 (accessibilità):** la Bottega con le sue tre sezioni è tra le schermate da controllare.
- **28 (revisione di stile):** lo screenshot "Potenziamenti, Vestiti" diventa "la Bottega, con le tre sezioni".
- **29 (bilanciamento):** regola le soglie 4★ e 10★ e controlla che Che stile! pesi circa +9% al massimo.
- **24 (tre lingue):** nessun cambio.
