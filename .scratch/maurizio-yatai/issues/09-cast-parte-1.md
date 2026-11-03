# 09: Il cast, parte 1: l'arrivo dei Clienti e i primi Vizi

**What to build:** I sette Clienti del cast (Marcella, Carlotta, Balosso, Nella, Filippo, Pasquale, Ebi Furai) disegnati con il kit, e la regola che decide chi arriva ai Posti durante la Serata, mescolando cast e Clienti di passaggio (skill `game-ai`, solo per l'arrivo). Qui prendono vita i Vizi che non dipendono dalla cucina: Carlotta paga il doppio ma è impaziente; finché Balosso è a un Posto la Pazienza di tutti scende più piano; Nella a volte lascia lo Yen d'oro, che triplica la sua Mancia. Gli altri quattro arrivano senza Vizio finché non c'è il ticket 10. È la prima metà del passo 6 di PIANO.md.

**Blocked by:** 05 ([con te] La prima prova: è divertente?), 33 (La cucina a tocchi), 34 (Una Serata che cambia), 35 (Un assaggio di Potenziamenti), 36 (I Clienti si lamentano)

**Status:** ready-for-agent

- [ ] I 7 peluche del cast sono disegnati e si distinguono a colpo d'occhio anche a 360×640, anche con la faccia `perplessa`.
- [ ] Ogni peluche del cast ha anche la `perplessa` (le quattro espressioni dello schema del ticket 36, con lo stesso seme del corpo), e usa lo stesso Lamento dei Clienti di passaggio: nessun Lamento proprio.
- [ ] L'arrivo dei Clienti è descritto nei dati (quanti del cast, quanto spesso) e ha un test ripetibile.
- [ ] I Vizi di Carlotta, Balosso e Nella hanno ciascuno il suo test.
- [ ] Ogni Vizio si capisce guardando: per esempio lo Yen d'oro di Nella si vede cadere.
- [ ] I numeri nuovi sono nel file di configurazione e i testi nuovi sono in tutte e tre le lingue.
- [ ] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero, lo stato nuovo compare in `window.render_game_to_text()` e la console non ha errori.

## Comments

### Dalla mappa yatai-economia-e-cucina (2026-11-03)

Ricaduta del ticket 03 della mappa (Lamento). Cambiato: il bloccante 36, il criterio sul riconoscerli a colpo d'occhio (vale anche con la `perplessa`) e il criterio nuovo sulle quattro espressioni. Le espressioni legate a un Vizio (per esempio Ebi Furai spaventato) restano nei loro ticket (10). L'espressione segue i cuoricini, quindi Carlotta, Balosso ed Ebi Furai, che cambiano la velocità della Pazienza, la seguono da soli.
