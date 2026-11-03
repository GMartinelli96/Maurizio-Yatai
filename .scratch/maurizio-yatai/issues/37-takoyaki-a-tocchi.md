# 37: Il takoyaki a tocchi, con la Ricetta

**What to build:** Il takoyaki del ticket 06 brucia, fa Fumo e finisce nel cestino, ma si prepara ancora con un solo tocco sulla piastra e cuoce da solo: la cucina a tocchi del ticket 33 (onigiri) non c'è. Qui il takoyaki segue la Ricetta di GAME_SPEC.md ("Come si gioca", cucina a tocchi): **pastella, polpo, [5 s di cottura], salsa, prendi**, cioè 4 tocchi, con Ingredienti da 100 Yen (pastella 30, polpo 50, salsa 20). È il primo Piatto con la **cottura a metà della Ricetta**: dopo il polpo la piastra cuoce da sola, durante la cottura le Scorte non fanno niente, a cottura finita si tocca la salsa e poi si prende. Il kakigōri del ticket 07 (ghiaccio, [2 s], sciroppo, prendi) deve riusare la stessa logica senza cambiarla: per questo la cottura è un **passo della Ricetta** (`{ cotturaSec: 5 }` tra gli Ingredienti in `PIATTI.takoyaki.ricetta`), non un campo a parte.

Fa da ponte tra il 06 (bruciatura, Fumo, cestino, già in main) e il 07. È il passo 4-bis di PIANO.md, con le skill `input-systems` e `game-feel`.

**Blocked by:** 06 (Il takoyaki: cottura, bruciatura e Fumo), 33 (La cucina a tocchi)

**Status:** ready-for-human

- [x] Il takoyaki si prepara a tocchi nell'ordine della Ricetta: pastella, polpo, (cottura di 5 s che parte da sola), salsa, prendi. Sono 4 tocchi, il tetto (con test sul conteggio).
- [x] La cottura è un passo della Ricetta nei dati (`config.js`), non una regola scritta nel codice del takoyaki: un test dimostra che una Ricetta inventata con la cottura dopo il primo Ingrediente (come il kakigōri) funziona senza toccare la logica.
- [x] Un tocco fuori ordine non fa niente: la Scorta trema, non si paga, nessuno Spreco. Durante la cottura le Scorte non fanno niente, e nemmeno la piastra (con test).
- [x] La bruciatura, l'allarme, il Fumo e il cestino si comportano come nel ticket 06: la bruciatura parte da quando il Piatto è pronto, cioè dopo la salsa, quando "prendi" è possibile.
- [x] Un takoyaki bruciato è Spreco: i suoi 100 Yen di Ingredienti, già pagati, non si rimborsano (con test su Spesa, Spreco e Incasso). Il recap di fine Serata mostra Spesa e Spreco giusti.
- [x] Tre Scorte nuove (pastella, polpo, salsa) con i loro disegni a matita, riconoscibili anche piccole; la fila vicino al pollice con 7 voci (riso, alga, pastella, polpo, salsa, tagliere, piastra) sta a 360×640 e ogni voce è grande abbastanza per un dito (44 px).
- [x] La Ricetta in icone sopra la piastra e il prossimo Ingrediente evidenziato sono visibili anche durante la cottura e dopo, quando manca la salsa.
- [x] L'obiettivo del Tanabata è ricalibrato sul nuovo flusso: un giocatore lento prende ★, uno attento ★★, ★★★ resta una sfida; i numeri misurati sono scritti nel commento di `config.js`.
- [x] Il bot di `scripts/playtest.mjs` (`gioca`) e quello dei test fanno la sequenza nuova leggendo solo `render_game_to_text()`.
- [x] Gli Ingredienti e i costi del takoyaki sono in `config.js`, i testi nuovi sono in italiano, inglese e giapponese.
- [x] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero (360×640, 390×844, 1280×720), lo stato nuovo compare in `window.render_game_to_text()` e la console non ha errori.

## Comments

### Scritto prima di implementare (2026-11-03)

Il ticket 06 dice, nei criteri, "il takoyaki si prepara a tocchi" e "la bruciatura parte a cottura finita, anche se manca la salsa", ma il commit f812cd0 ha lasciato il takoyaki a cottura automatica con un tocco solo. Qui si recupera. Una differenza dal testo del 06, su indicazione di Giuseppe: la bruciatura parte da quando il Piatto è **pronto** (dopo la salsa), come oggi nel codice, non da fine cottura. Così un takoyaki cotto senza salsa aspetta senza bruciarsi, e l'allarme, il Fumo e il cestino restano com'erano.

Per il ticket 07: il kakigōri scrive `ricetta: [{ ingrediente: 'ghiaccio', costo: 20 }, { cotturaSec: 2 }, { ingrediente: 'sciroppo…', costo: 60 }]` e non deve toccare la logica. Per il ticket 08: la pastella è un Ingrediente anche del taiyaki; oggi le Scorte sono una per Piatto, quindi con tutti e due in menù la Scorta della pastella comparirebbe due volte. Va unita lì, insieme al problema di spazio sulla fila.

### Fatto (ramo `ticket-37`, worktree `../maurizio-t37`, non ancora in `main`)

Il takoyaki è a tocchi: **pastella, polpo, [5 s], salsa, prendi** (4 tocchi, 100 Yen). Resta da fare la prova di Giuseppe sul telefono vero (`npm run telefono`) e il merge in `main`.

**Come è fatto:**

- Logica pura, `src/serata/Serata.js`: ogni Postazione ha un `passo` (a che punto della ricetta è) e un contatore `fatti` (gli Ingredienti). `passoFatto()` è l'unico punto che decide cosa viene dopo un passo: pronto, una cottura che parte da sola, oppure un Ingrediente da aspettare. Il kakigōri (ticket 07) non cambia niente: un test (`la cottura è un passo della Ricetta nei dati`) lo prova con un Piatto inventato ghiaccio, [2 s], sciroppo. Il vecchio percorso "il Piatto cuoce da solo con un tocco sulla Postazione" è tolto: non lo usa più nessuno.
- Eventi: `cotturaIniziata` ora porta `durataMs` e parte dopo l'ultimo Ingrediente prima della cottura; nuovo `cotturaFinita`; tolto `postazioneOccupata`. `ingredienteRifiutato` ha un motivo in più, `cuoce`. Lo stato di una Postazione dice `prossimo` (la Scorta da toccare, anche durante la cottura: la salsa è già evidenziata), `cotturaMs` e `restaMs`.
- Dati, `config.js`: `PIATTI.takoyaki.ricetta` con il passo `{ cotturaSec: 5 }`, `cookSec` tolto dal takoyaki (restano su kakigōri, taiyaki e ramen, che non hanno ancora Postazione). Colori `pastella` e `polpo` nella palette.
- Tre Scorte nuove con disegni a matita (`scorta-pastella`: brocca verde menta; `scorta-polpo`: piattino di bocconi rosa con le ventose, senza faccia; `scorta-salsa`: flacone a spruzzo scuro con beccuccio giallo), nomi nelle tre lingue (il giapponese è da far rileggere: 生地, たこ, ソース).

**Dove mi discosto da quello che c'era:**

- **La fila è di 7 voci** (riso, alga, pastella, polpo, salsa, tagliere, piastra): `YATAI.postazioni.massimo` va da 5 a 7 e c'è `capacitaBase: 5`, così con 3 o 5 voci (Hanami) niente cambia di misura. A 360×640 ogni voce è larga 45,4 px CSS (il test dei 44 px regge) e i nomi si leggono; la Ricetta in icone sta ancora sopra la Postazione (non sotto, come già deciso nel 33), con le icone che si avvicinano se non ci stanno. La barra della cottura sale sopra le icone (`barraDallaCima` da 50 a -14), altrimenti le copriva.
- **Tasti**: la fila ora ha 7 voci, quindi i tasti 1–7 (e il tastierino) la coprono tutta; il ticket 26 deciderà quelli definitivi per le Scorte.
- **Tolto il "tocco un attimo prima che finisca la cottura non si perde"** (`COMANDI.anticipoMs`): serviva a prendere il Piatto appena pronto, e non c'è più niente da prendere durante la cottura. Una salsa toccata un attimo prima della fine non si ricorda: si ritocca.
- **La bruciatura parte da "pronto", non da fine cottura** (come chiesto, vedi sopra): un takoyaki cotto a cui manca la salsa non si brucia mai, quindi può occupare la piastra a lungo. Un test lo documenta. Se non piace, è una riga in `passoFatto()`.

**Spesa e Spreco:** non serviva codice nuovo: lo Spreco è `Spesa − costo dei Piatti serviti`, quindi un takoyaki bruciato (100 Yen già pagati) lo è appena brucia, e uno rimasto a metà o sul Bancone alla fine pure. Test: bruciato → Spesa 100, Spreco 100, Vendite 0, Incasso −100; poi servito un secondo takoyaki → Spesa 200, Spreco 100; recap di fine Serata con 180 di Spreco. Il recap è guardato anche in rosso (Spesa 200, Spreco 200, Incasso −200, commento gentile).

**Calibrazione del Tanabata** (provvisoria, la rivede il ticket 29): obiettivo da **3200 a 2400** (★ 2400, ★★ 3120, ★★★ 3840). Il bot senza browser, media di 6 semi, Incasso netto: tocco ogni 1,4 s (lento) **2565**, ogni 1,0 s (attento) **3652**, ogni 0,6 s (rapido) **5927**, ogni 0,3 s circa 7900. Il lento ha ★ (margine 7%), l'attento ★★ (5% di margine verso ★★★), ★★★ è per i rapidi. I numeri sono nel commento di `config.js`. Il bot di `playtest.mjs` (che gioca a passi di 120 ms) fa 8610 e ★★★: è molto più rapido di un umano.

**Verifica:** `npm test` 167 verdi (nuovi: Ricetta e tetto di 4 tocchi, la sequenza, le Scorte ferme durante la cottura, ordine sbagliato, bruciatura da pronto, Spreco, recap, Ricetta con la cottura in un'altra posizione, la fila da 7 voci nel layout). `npm run build` ok. Scenario `serata-takoyaki.json` riscritto (18 immagini) a 360×640, 390×844, 1280×720 e in giapponese, senza errori in console; tutti gli altri scenari a 360×640 senza errori; Hanami invariato (3 voci, stessa misura). Impronte `a43b5bed`, `459d9564`, `44f495c1`, `e5d7a664` invariate.

**Non fatto, da sapere:** il criterio del ticket 06 sul recap con la tabella per Piatto (fatti, serviti, sprecati, costo, vendite) non è nel codice (il recap mostra Vendite, Spesa, Spreco e Incasso totali): resta al 07 o a un ticket a parte. PIANO.md non ha una riga "4-bis": la sigla c'è solo nel testo di questo ticket.
