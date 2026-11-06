# 08: Scrivere le regole e i 4 passi

**Type:** task
**Blocked by:** 01, 02, 03, 04, 05, 06, 07
**Status:** open

## Question

Riportare le decisioni dei ticket 01-07 di questa mappa dove le leggerà chi costruisce, e riscrivere il ticket 12 di `maurizio-yatai` in 4 passi. Non toccare il codice del gioco. Rileggere ogni file prima di scriverci: un'altra sessione può averlo toccato.

- **`GAME_SPEC.md`**: una sezione nuova (per esempio "La mappa e le 30 Serate") con il percorso delle schermate, gli sblocchi, la salita di difficoltà, il cast e i Disturbatori a scaglioni, il titolo e i crediti, il finale; e la tabella delle 30 Serate (o il rimando al file con i numeri). Una nota nella voce "Clienti e Disturbatori" e nella riga "Dove e quando" (ticket 11) che ora i Disturbatori arrivano per Matsuri.
- **`GLOSSARY.md`**, con la skill `domain-modeling`: i termini nuovi decisi (per esempio la mappa e la strada delle Serate) con _Avoid_, e se **Matsuri**, **Serata** e **Gran Serata** cambiano.
- **Il ticket 12**: "What to build" e criteri riscritti per 4 passi, uno alla volta con la sua verifica (per esempio: 1 i dati delle 30 Serate e il progresso in memoria, con i test; 2 il percorso delle schermate con una mappa semplice; 3 il look e il titolo e i crediti; 4 il cast e i Disturbatori per Matsuri in gioco, il rigioco dei 42 scenari e il playtest di almeno una Serata per Matsuri). I 4 passi qui sono un'ipotesi: si dimostra con i ticket 01-07. Decidere anche come si prova in browser tutte e 30 le Serate (il bot senza browser le gioca tutte; Playwright una per Matsuri) e segnare i criteri che si possono verificare senza browser. Rimettere "ticket 10 in main" come bloccante, con il commento in `## Comments`, sezione "Dalla mappa yatai-matsuri-e-mappa". Non cambiare lo `Status` né spuntare criteri.
- **Una nota ciascuno** (sezione "Dalla mappa yatai-matsuri-e-mappa") nei ticket: 13 (sfondi e mappa: la spartizione decisa nel ticket sul look), 14 e 15 (il campo `evento` della Gran Serata e dove si attacca), 16 (versione 3 del formato: stelle e sblocchi con l'interfaccia del progresso), 20 (il tutorial sulla Serata 1 di ogni Matsuri e come lo dice il progresso), 23 (la musica e gli stinger di mappa, titolo, Gran Serata e sblocco), 24 (le lingue dei testi nuovi e il selettore), 26 (la mappa con tastiera e "riduci movimento"), 29 (la tabella dei numeri di partenza delle 30 Serate).
- **`map.md`**: Decisions so far e Not yet specified aggiornati; mappa segnata chiusa.

Lasciare non committati `.scratch/`, `docs/agents/`, `docs/design/` e le modifiche a `CLAUDE.md`, `GAME_SPEC.md`, `GLOSSARY.md`, salvo diverso ordine di Giuseppe.
