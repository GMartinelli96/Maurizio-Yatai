# 29: Il bilanciamento

**What to build:** La seconda metà del passo 14 di PIANO.md: si regolano i numeri del file di configurazione e la curva delle 30 Serate, così ogni Serata si può vincere con ★ e ★★★ resta una sfida. Per misurarlo, un giocatore automatico gioca ogni Serata con la logica del gioco, senza browser, a più gradi di bravura.

**Blocked by:** 27 (Prestazioni, offline e installazione)

**Status:** ready-for-agent

- [ ] Il giocatore automatico "medio" prende almeno ★ in ogni Serata; quello "bravo" arriva a ★★★. Gli obiettivi sono sul **netto** (Incasso = Vendite meno Spesa), con la cucina a tocchi: i giocatori automatici fanno i tocchi della Ricetta, con un tempo per tocco.
- [ ] Il giocatore "lento" prende ★ anche nel Tanabata (il caso critico: col takoyaki a tocchi incassa circa il 38% in meno che con la cottura da sola, secondo il prototipo del ticket 02 della mappa). Se serve si ritoccano gli arrivi, la Pazienza e gli obiettivi, non la regola dei tocchi.
- [ ] Gli Ingredienti hanno costi regolati per Piatto (bozza in GAME_SPEC.md: costo circa un terzo del prezzo) e nessuna Serata della curva chiude in rosso per il giocatore "medio" (la Serata in rosso resta possibile, non è un game over).
- [ ] Le soglie del Lamento (2 e 1 cuoricino) sono controllate: se una Serata risulta troppo ansiosa si ritoccano qui (valori in `config.js`).
- [ ] Le stelle dei Vestiti (4★ e 10★ su 18 per Matsuri) sono regolate, e Che stile! (Mancia ×1,2) pesa al più circa +9% sull'Incasso, a Pazienza sempre piena.
- [ ] Le modifiche stanno solo nel file di configurazione e nei dati delle Serate.
- [ ] La tabella con le stelle di ogni Serata, prima e dopo, è scritta in fondo a questo file.
- [ ] Dopo le modifiche i test e i playtest passano ancora e la console non ha errori.

## Comments

### Dalla mappa yatai-economia-e-cucina (2026-11-03)

Ricadute dei ticket 01, 02, 03 e 04 della mappa. Cambiato: cinque criteri nuovi (obiettivi sul netto con la cucina a tocchi, il giocatore lento del Tanabata come caso critico, costi degli Ingredienti e Serate mai in rosso per il "medio", soglie del Lamento, stelle dei Vestiti e peso di Che stile!). I numeri di partenza sono in GAME_SPEC.md ("Ingredienti e Spreco", "Progressione") e nelle risposte dei quattro ticket.
