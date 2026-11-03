# 05: [con te] La prima prova: è divertente?

**What to build:** Il secondo dei momenti in cui serve l'utente (PIANO.md). Giuseppe gioca la prima Serata del ticket 04, meglio se sul telefono, e risponde a "è divertente?". Se no, si decide insieme cosa cambiare prima di aggiungere altri Piatti e il cast. Un agente può preparare la build e scrivere le decisioni, ma il verdetto è di Giuseppe: questo ticket non si chiude da soli.

**Blocked by:** 04 (La prima Serata: l'onigiri)

**Status:** resolved

- [x] Giuseppe ha giocato qualche Serata.
- [x] Il verdetto è scritto in fondo a questo file, sotto `## Comments`.
- [x] Ogni correzione è un ticket nuovo che blocca il 06 e il 09.
- [x] Se cambia una regola del gioco, è aggiornata anche in GAME_SPEC.md.

## Comments

### Verdetto di Giuseppe (2026-11-03)

> Sembra acerbo e sinceramente come ora non ci giocherei molto perché mi annoia. Con vari upgrade potrebbe essere più divertente. Ora mi sembra lento e prevedibile e senza particolare interazione.
> Per quanto riguarda quanto fatto fino ad ora va bene ma deve essere MOLTO migliorato. Ho già dato feedback anche ad un'altra sessione.

In breve: "mi annoia", ma quello fatto finora va bene come base e deve essere molto migliorato.

### Cosa è stato fatto

Il verdetto è "lento, prevedibile, poca interazione, più divertente con gli upgrade". Si è diviso così.

**Piccola regolazione, fatta subito** (solo numeri in `config.js`, nessuna regola cambiata):

- Il bot senza browser, con quattro livelli di bravura (un tocco ogni 0,3 / 0,8 / 1,4 / 2,2 secondi), faceva circa lo stesso Incasso a tutti: 2528, 2528, 2528 e 2310 Yen. Cioè l'Incasso dipendeva da quanti Clienti arrivavano (uno ogni 5-9 secondi) e non da come giocavi: è il "lento" che hai sentito. Nessuno ha mai perso un Cliente.
- `CLIENTI.arrivoSec` passa da 5-9 a 2,5-4,5 secondi. Adesso chi gioca meglio incassa molto di più: circa 5050 / 4900 / 3750 / 2200 Yen per i quattro livelli.
- L'obiettivo della prima Serata passa da 1200 a 3100 Yen (★ 3100, ★★ 4030, ★★★ 4960), così il giocatore lento prende ★, quello attento ★★ e ★★★ è una sfida.
- La Pazienza resta di 25 secondi come in GAME_SPEC.md: accorciarla fa perdere Clienti solo ai giocatori molto lenti, non rende più bello il gioco.
- Due test nuovi (`test/serata.test.js`): chi è più rapido incassa di più, e un giocatore lento prende ★ e uno attento ★★. Il test delle soglie ora dice 3100 / 4030 / 4960.
- Questi numeri sono ancora provvisori: li bilancia il ticket 29. Il commit con i due numeri di `config.js` è `cc7ec3b` (l'ha fatto l'altra sessione insieme al suo lavoro sui temi).

**Correzioni più grandi, ognuna un ticket nuovo che blocca il 06 e il 09:**

- 33: La cucina a tocchi, l'onigiri non cuoce più da solo ("senza particolare interazione"). Riprende e chiude il ticket 02 della mappa `yatai-economia-e-cucina`, con la Spesa.
- 34: Una Serata che cambia: ondate e Serie ("prevedibile").
- 35: Un assaggio di Potenziamenti sulla prima Serata, subito invece che dopo il cast ("con vari upgrade potrebbe essere più divertente"). È la prima fetta dei ticket 16 e 17.

Non cambia nessuna regola oggi, quindi GAME_SPEC.md non è toccato da questo ticket: le regole nuove arrivano con i ticket 33, 34 e 35, prima del loro codice.

Il feedback dato all'altra sessione non è in questo albero: se contiene cose diverse da queste, vanno aggiunte come ticket e mettendo il loro numero tra i bloccanti del 06 e del 09.

Resta da verificare, ticket 04: l'apertura su un telefono vero.
