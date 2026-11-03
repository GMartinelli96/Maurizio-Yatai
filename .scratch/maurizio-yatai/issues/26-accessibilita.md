# 26: L'accessibilità

**What to build:** I tasti rapidi di GAME_SPEC.md ("Comandi e accessibilità"): 1–5 per le Postazioni e Q/W/E/R per i Posti (M è già nel ticket 23); le varianti non hanno un menu (ogni variante è una Scorta), quindi non servono tasti per un menu. Le **Scorte** (cucina a tocchi, ticket 33), varianti comprese (circa 15 a fine gioco), hanno bisogno dei loro tasti: quali, da decidere in questo ticket e da scrivere in GAME_SPEC.md ("Comandi e accessibilità"). Poi l'opzione "riduci movimento", che attenua scuotimenti, rimbalzi e animazioni forti in tutto il gioco. Infine un controllo su tutto il gioco che le varianti e gli stati si riconoscano anche senza colore. È metà del passo 13 di PIANO.md.

**Blocked by:** 13 (Gli sfondi), 14, 15 (gli Eventi), 18 (L'Arredo), 19 (I Vestiti e Che stile!), 20 (Il tutorial), 21 (Il Ricettario), 22 (Titoli e Condividi), 23 (L'audio)

**Status:** ready-for-agent

- [ ] Un playtest gioca una Serata intera solo con la tastiera, Scorte e varianti comprese.
- [ ] "Riduci movimento" parte già attiva se il dispositivo chiede meno movimento, si salva e vale per ogni effetto; l'elenco degli effetti controllati è in fondo a questo file (sezione `## Effetti di "riduci movimento"`, da scrivere qui: non c'è ancora), e comprende la goccia e lo sbuffo del Lamento, fissi (la faccia cambia comunque).
- [ ] Gli screenshot in bianco e nero di una Serata per Matsuri sono guardati: si capisce tutto, compreso l'Ingrediente giusto da toccare sulle Scorte (non si distingue solo dal colore) e la Ricetta.
- [ ] La Bottega, con le sue tre sezioni (Potenziamenti, Arredo, Vestiti), è tra le schermate controllate con tastiera, bianco e nero e "riduci movimento".
- [ ] I testi nuovi sono in tutte e tre le lingue.
- [ ] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero, lo stato nuovo compare in `window.render_game_to_text()` e la console non ha errori.

## Comments

### Dalla mappa yatai-economia-e-cucina (2026-11-03)

Ricadute dei ticket 02, 03 e 04 della mappa. Cambiato: i tasti delle Scorte (da decidere qui), l'Ingrediente giusto non solo dal colore, goccia e sbuffo del Lamento fissi con "riduci movimento", la Bottega a tre sezioni tra le schermate controllate. L'elenco degli effetti di "riduci movimento", che il criterio dava "in fondo a questo file" ma non esisteva, parte qui sotto e si completa durante il ticket.

Decisione del 2026-11-03 (ticket 07): le varianti non hanno un menu, ogni variante è una Scorta. Tolto dal "What to build" il riferimento ai tasti per il menu delle varianti; i tasti delle Scorte restano da decidere qui.

## Effetti di "riduci movimento"

Elenco degli effetti controllati (da completare durante il ticket; ogni riga dice cosa fa l'effetto con l'opzione accesa):

- Lamento del Cliente (ticket 36): la faccia cambia comunque (è informazione, non movimento); la goccia (2 cuoricini) e lo sbuffo (1 cuoricino) compaiono e restano fermi, senza muoversi. Il "mmh" non cambia.
