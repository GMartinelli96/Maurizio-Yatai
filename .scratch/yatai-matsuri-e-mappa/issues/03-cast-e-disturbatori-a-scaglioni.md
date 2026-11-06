# 03: Il cast e i Disturbatori a scaglioni

**Type:** grilling
**Blocked by:** 02
**Status:** open

## Question

Decidere con Giuseppe **chi arriva e da quale Serata**, nei dati di ogni Serata. Fissato il 2026-11-05: i peluche del cast entrano a scaglioni (la Serata 1 dell'Hanami solo Clienti di passaggio); i Disturbatori arrivano per Matsuri (Croccola dal Tanabata, formiche dall'Hanabi, corvi dall'Aki Matsuri), non dalla Serata 1 del loro Matsuri ma da una successiva (la 2 o la 3), poi restano. Da decidere:

- **Il cast, Serata per Serata.** Per ognuno dei sette (Marcella, Carlotta, Balosso, Nella, Filippo, Pasquale, Ebi Furai) da quale Serata e Matsuri arriva, e in che ordine: i Vizi più semplici da capire per primi? Quanti peluche del cast possono stare ai Posti insieme in una Serata morbida (`maxAiPosti` è 2) e la quota di Clienti del cast (0,25 oggi) cambia lungo la salita?
- **I Vizi che dipendono dal Matsuri** (ticket 10): Marcella dai dolci dall'Hanabi, Filippo che nello Yuki Matsuri ha più Pazienza. Servono ai Matsuri e ai Piatti che non esistono ancora: Filippo ordina solo onigiri e kakigōri, quindi prima dell'Hanabi può ordinare solo onigiri. Quando entra, tenendo conto di questo? Marcella chiede il Bis: il Bis conta due nella Serie.
- **I Disturbatori, Serata per Serata.** La prima Serata di ognuno (2 o 3 del suo Matsuri), se in una Serata ne arriva uno o più di uno, e se nei Matsuri successivi i vecchi restano (Croccola nell'Aki Matsuri e nello Yuki Matsuri insieme ai corvi). I corvi e Croccola sono i "bersagli" di Piatti che non ci sono sempre: il kakigōri e il taiyaki per le formiche, takoyaki e taiyaki per Croccola (`DISTURBATORI.*.bersagli`).
- **La Gran Serata e i Disturbatori.** L'Evento del mikoshi fa scappare i corvi (ticket 15): ci sono i corvi nella Gran Serata dell'Aki Matsuri, o il ticket 15 li aggiunge?
- **Che cosa si vede in gioco** (criterio del ticket 12: "le regole dei Vizi legate al Matsuri e l'arrivo dei Disturbatori per Matsuri si vedono in gioco"): come un giocatore capisce che c'è un peluche nuovo (la prima volta che arriva), senza testi e senza tutorial lungo. Se serve un riscontro (per esempio una piccola scheda nel recap) o basta il Vizio che si nota guardando.

Fatti: `CLIENTI.cast` e `VIZI` e `DISTURBATORI` in `config.js`; `yatai/src/serata/cast.js`; GAME_SPEC.md ("Clienti e Disturbatori"); il ticket 10 (la sua parte di Vizi legati al Matsuri; ramo `ticket-10` in `../maurizio-t10`, ancora non in main) e il ticket 09 e il 11 già in main (note "Dove e quando" e "regole per Matsuri"). Skill: `level-design` (introdurre un elemento alla volta), `grilling`, `domain-modeling`.
