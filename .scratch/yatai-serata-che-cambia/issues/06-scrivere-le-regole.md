# 06: Scrivere le regole

**Type:** task
**Blocked by:** 02, 05 (03 e 04 sono risolti)
**Status:** resolved

## Question

Riportare le decisioni dei ticket 01-05 di questa mappa dove le leggerà chi costruisce:

- `GAME_SPEC.md`, sezione "La Serata": le regole delle Ondate (forma, parte casuale, segnale prima dell'Ondata, cosa cambia per i Posti e la Pazienza) e della Serie (cosa la fa salire e spezzare, Mancia, riscontro), con i numeri di partenza che stanno in `config.js`. Rileggi il file prima di scriverci: un'altra sessione può averlo toccato.
- `GLOSSARY.md`, con la skill `domain-modeling`: i termini **Serie** e **Ondata** (e l'eventuale segno di Serie rotta), con _Avoid_ e nel posto giusto (probabilmente in "Partita"). Se il ticket "Il Cliente con fretta e Carlotta" cambia **Cliente di passaggio** o **Vizio**, cambiano anche quelli.
- Il ticket 34 di `maurizio-yatai` ("Una Serata che cambia: ondate e Serie"): "What to build" e criteri riscritti perché si possa costruire senza dubbi, con i bersagli del ticket "Quanto deve contare la bravura" come criteri verificabili senza browser. Il titolo del ticket 34 può restare. Nota in `## Comments`, "Dalla mappa yatai-serata-che-cambia", come nelle mappe precedenti.
- I ticket che la risposta tocca, con una nota ciascuno: 09 (se cambia Carlotta), 12 (la curva è nei dati di ogni Serata), 29 (i numeri di partenza), 26 (segni fissi con "riduci movimento"), 23 (i suoni), 35 (le Ondate con 3 e 4 Posti e il ventaglio). Non cambiare gli `Status` né spuntare criteri.
- Aggiornare `map.md` (Decisions so far, Not yet specified) e segnare la mappa come chiusa.

Non toccare il codice del gioco. Lasciare non committati `.scratch/`, `docs/agents/`, `docs/design/` e le modifiche a `CLAUDE.md`, `GAME_SPEC.md`, `GLOSSARY.md`, salvo diverso ordine di Giuseppe.

## Answer

**Fatto in anticipo (2026-11-03, commit `1bedaa2`)**, dalla sessione di domande sul ticket 34 di `maurizio-yatai`: `GAME_SPEC.md` ("La Serata", voci Ondate e Serie), `GLOSSARY.md` (**Ondata**, **Serie**), `BACKLOG.md` (Cliente che chiede in fretta), il ticket 34 riscritto e le note ai ticket 12, 22, 23 e 29. Nessun codice toccato.

**Fatto dopo i ticket 02 e 05 (2026-11-03):**
- `GAME_SPEC.md`, "La Serata": la voce Ondate dice ora che in un'ondata cambiano due cose, arrivi più fitti e Pazienza di 15 s per chi arriva in ondata (5 cuoricini che durano un quinto ciascuno); perché la sola frequenza non bastava; i numeri misurati con il bot (rapido 5053 ★★★, attento 3323 ★★★, lento 2146 ★, obiettivo 1920 invariato, peso della Serie). La riga sui Clienti dice "15 per chi arriva durante un'ondata".
- `GLOSSARY.md`: **Ondata** ora dice "più in fretta e con meno Pazienza". **Serie**, **Cliente di passaggio** e **Vizio** non cambiano.
- Ticket 34 di `maurizio-yatai`: criterio della curva riscritto (Pazienza in ondata), criterio del bot sostituito dai bersagli sulla media di 6 semi, nota "Dalla mappa yatai-serata-che-cambia" in `## Comments` (tra l'altro: serve una durata della Pazienza per Cliente).
- Note ai ticket: 12 (la Pazienza in ondata è nei dati di ogni Serata), 26 (Serie con "riduci movimento"; segnale dell'ondata con "riduci movimento": **ancora aperto**, con una proposta), 29 (punto di partenza misurato), 35 (ondate con 4 Posti e col ventaglio). 22 e 23 avevano già la loro nota; il 09 non cambia (Carlotta e il Cliente in fretta: nessun cambiamento). Nessuno `Status` cambiato, nessun criterio spuntato.
- Nessun codice del gioco toccato. Niente committato: `.scratch/`, `docs/agents/`, `CLAUDE.md`, `GAME_SPEC.md`, `GLOSSARY.md` e `BACKLOG.md` restano modifiche locali.
