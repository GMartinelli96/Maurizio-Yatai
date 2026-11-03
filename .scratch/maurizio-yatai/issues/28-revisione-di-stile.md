# 28: La revisione di stile

**What to build:** La prima metà del passo 14 di PIANO.md. Un agente separato, che non ha costruito il gioco, confronta gli screenshot di tutte le schermate con quelli dei giochi di Maurizio (https://maurizioinfluencerofficial.mirkoforesti.it/) e risponde alla domanda "sembra della stessa serie?". Ogni differenza che segnala si corregge, poi si ripete il confronto finché la risposta è sì.

**Blocked by:** 27 (Prestazioni, offline e installazione)

**Status:** ready-for-agent

- [ ] Ci sono gli screenshot di ogni schermata (una Serata per Matsuri, mappa, fine Serata, Ricettario, la Bottega con le tre sezioni) a 360×640 e a 1280×720.
- [ ] Il revisore è un agente nuovo, che riceve gli screenshot ma non il codice né le opinioni di chi ha costruito il gioco.
- [ ] Il verdetto finale del revisore è "sì", ed è scritto in fondo a questo file con l'elenco delle correzioni fatte.
- [ ] Dopo le correzioni i test e i playtest passano ancora e la console non ha errori.

## Comments

### Dalla mappa yatai-economia-e-cucina (2026-11-03)

Ricaduta del ticket 04 della mappa: nell'elenco degli screenshot "Potenziamenti, Vestiti" diventa "la Bottega, con le tre sezioni" (Potenziamenti, Arredo, Vestiti).
