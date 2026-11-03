# 33: La cucina a tocchi: l'onigiri non cuoce più da solo

**What to build:** Dalla prima prova (ticket 05): "senza particolare interazione". Oggi un onigiri è un tocco sul tagliere, un secondo di attesa e un tocco per prenderlo: la parte di cucina non ha niente da fare. Qui l'onigiri si prepara a tocchi in sequenza: riso, poi alga, poi si prende. La scelta è già fatta: è la variante B del ticket 02 della mappa `yatai-economia-e-cucina` (`resolved`, 2026-11-03). Il prototipo A/B/C, usa-e-getta, è `.scratch/yatai-economia-e-cucina/assets/prototipo-cucina.html`: si guarda, non si riesegue. Skill `input-systems` e `game-feel`.

Le regole decise, da seguire (sono in GAME_SPEC.md, "Come si gioca", e in GLOSSARY.md: **Scorta**, **Ricetta**):

- Gli Ingredienti si toccano nell'ordine della **Ricetta** (onigiri: riso, alga), dalle **Scorte**; ognuno si paga quando lo si tocca. L'onigiri non ha cottura: dopo l'alga è pronto, e si prende.
- Tetto: 4 tocchi per Piatto, presa compresa (l'onigiri ne ha 3).
- Ordine sbagliato: non succede niente. La Scorta trema, non si paga, nessuno Spreco, nessun game over.
- La Ricetta (icone in ordine, sotto la Postazione) e il prossimo Ingrediente evidenziato sono sempre visibili, in ogni Serata.
- La logica va scritta in modo che gli altri Piatti (takoyaki per primo, ticket 06) aggiungano cottura e Ingredienti "di dopo" senza riscrivere: la regola è nel ticket 02, risposta 2.
- Avvertenza per il ticket 29: la cucina a tocchi costa tocchi per Cliente; con il takoyaki il giocatore lento incassa molto meno. Per l'onigiri l'Incasso quasi non cambia.

Porta con sé la **Spesa** (decisione del ticket 01 della stessa mappa, già scritta in GAME_SPEC.md e GLOSSARY.md ma non ancora nel codice): con la cucina a tocchi si paga Ingrediente per Ingrediente (onigiri: riso 20, alga 10), l'Incasso diventa Vendite meno Spesa e scende di un "−20" piccolo a ogni tocco. Gli obiettivi si ricalibrano sul netto (il bot senza browser è `scripts/` e il test `giocaServata` in `test/serata.test.js`).

**Blocked by:** 05 ([con te] La prima prova: è divertente?)

**Status:** resolved

- [x] La scelta è fatta (variante B) ed è nel ticket 02 della mappa `yatai-economia-e-cucina`, `resolved`.
- [ ] Un onigiri richiede tre tocchi in sequenza (riso, alga, prendi), ogni tocco ha il suo riscontro (suono visivo, Maurizio che si anima) e restano rapidi con il pollice a 360×640. Giuseppe lo prova sul telefono vero e il suo parere è scritto in fondo a questo file (il prototipo non è stato provato sul telefono).
- [x] Sbagliare l'ordine dei tocchi non è mai un game over e non costa niente: la Scorta trema (regola in GAME_SPEC.md, "Come si gioca"). I termini Scorta e Ricetta sono in GLOSSARY.md.
- [x] La Spesa e lo Spreco ci sono nella logica con l'onigiri, l'Incasso è il netto, e la fine Serata mostra Vendite, Spesa e Incasso (il recap per Piatto può aspettare i Piatti nuovi).
- [x] Gli obiettivi di Yen sono ricalibrati sul netto: un giocatore lento prende ★, uno attento ★★, ★★★ resta una sfida (valori in `config.js`).
- [x] La logica nuova ha test automatici senza browser; i numeri nuovi sono in `config.js` e i testi nuovi sono in italiano, inglese e giapponese.
- [x] Il bot di playtest (`gioca`) sa fare la sequenza nuova leggendo solo `render_game_to_text()`, che ne mostra lo stato.
- [x] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero e la console non ha errori. Le impronte `a43b5bed`, `459d9564`, `44f495c1`, `e5d7a664` restano invariate.

## Comments

### Fatto (commit 4839909, su `main`)

La cucina a tocchi è nel gioco: variante B del ticket 02 della mappa, onigiri in **3 tocchi** (riso, alga, prendi). Resta **non spuntato** il secondo criterio, perché contiene la prova di Giuseppe sul telefono vero: il riscontro di ogni tocco c'è (la Scorta salta, l'Ingrediente vola sul tagliere, Maurizio lavora, il "−20" scende sotto l'Incasso, l'icona della Ricetta si accende) ed è stato guardato a 360×640, ma il parere di Giuseppe va scritto qui sotto quando l'avrà provato (`npm run telefono`).

**Dove sta:**

- Logica pura, `src/serata/Serata.js`: le Scorte (una per Ingrediente di ogni `ricetta`), `tocca(id)` che accetta una Scorta o una Postazione, la Spesa, le Vendite, lo Spreco e l'Incasso netto. Eventi nuovi: `ingrediente`, `ingredienteRifiutato`, `nienteDaPrendere`. Un Piatto senza `ricetta` cuoce ancora da solo, così il takoyaki (ticket 06) aggiunge cottura e Ingredienti di dopo senza riscrivere.
- Numeri in `src/config.js`: la ricetta in `PIATTI.onigiri.ricetta` (la sequenza è la Ricetta), `SERATA_PRIMA.obiettivo`, `RISCONTRI` (spesa, passo, evidenzia, ingrediente).
- Scena, `src/scenes/SerataScene.js`: fila riso, alga, tagliere (i tasti 1–3 funzionano già), alone sul prossimo Ingrediente, Ricetta a icone, recap con Vendite, Spesa, Spreco e Incasso, commento gentile se in rosso. Disegni a matita di ciotola e alga in `src/disegni/postazioni.js` (texture `scorta-riso`, `scorta-alga`). Testi in italiano, inglese e giapponese (il giapponese è da far rileggere, come tutto il resto).
- Bot: `gioca` di `scripts/playtest.mjs` sceglie tra Scorta e Postazione leggendo `postazioni.N.{id, tipo, stato, prossimo}` e `serata.postazioni`. Scenari aggiornati (`serata-azioni`, `serata-bancone`) e uno nuovo (`serata-rosso`).

**Regole come implementate:** un tocco fuori ordine (alga prima del riso, un Ingrediente con il tagliere già pieno) non fa niente: la Scorta trema, non si paga, nessuno Spreco. Toccare il tagliere prima che l'onigiri sia finito non fa niente. Lo Spreco è la Spesa meno il costo degli onigiri serviti, quindi comprende anche quelli rimasti sul Bancone alla fine. In rosso: nessuna stella, il commento diventa "Stasera abbiamo sprecato troppo, riproviamo!", la Serata arriva comunque in fondo.

**Calibrazione sul netto** (provvisoria, la rivede il ticket 29). La bravura è il tempo tra un tocco e l'altro; con 3 tocchi per onigiri i livelli di prima (0,3 / 0,8 / 1,4 s) non vanno più bene per "attento", quindi ora sono **rapido 0,6 s, attento 1,0 s, lento 1,4 s** (`BRAVURA` in `test/serata.test.js`). Obiettivo 1920 (★ 1920, ★★ 2496, ★★★ 3072):

| tocco ogni | Incasso netto | stelle |
|---|---|---|
| 1,4 s (lento) | circa 1965 | ★ |
| 1,0 s (attento) | circa 3020 | ★★ |
| 0,6 s (rapido) | circa 4050 | ★★★ |

Gli stessi numeri escono dal bot nel browser (seme `a`: 1980, 3060, 3940) e dai test su 6 semi. Il margine tra "attento" e ★★★ è piccolo (3060 contro 3072): se serve più respiro si alza l'obiettivo di poco. Con la cucina a tocchi lo Spreco di un giocatore attento è di circa un onigiri (30 Yen).

**Dove mi discosto dal testo del ticket 02 / GLOSSARY.md:** la Ricetta a icone sta **sopra** il tagliere, non sotto. Sotto c'è solo il nome, alto 40 px: ci stanno icone di 20 px a 360×640, troppo piccole per leggerle; sopra sono 32 px e si leggono. Se si vuole sotto a tutti i costi, va tolto il nome della Postazione o allargata la fascia.

**Prototipo come fonte primaria.** Il prototipo sul gioco vero (tre varianti `?sviluppo=serata&cucina=a|b|c`, con `&errore=` e `&presa=`) è sul ramo usa-e-getta `prototipo/cucina-a-tocchi` (commit 30fd555), fuori da `main`. Cosa ha mostrato, misurato con un bot: tre posti sul tagliere non servono a niente da soli (stessi numeri di un posto solo, con una mossa alla volta); un riso che cuoce da solo 1,5 s con tre posti dà parallelismo ma costa a chi è lento (a 1,4 s 1835 netti contro 1967); `presa=auto` (2 tocchi) alza il lento da 1967 a 2907. Questa C non è quella scartata dal ticket 02 (ordine libero): è un'idea da tenere per i Potenziamenti (ticket 35), per esempio un secondo tagliere.

**Da sapere per gli altri ticket:** con l'onigiri senza cottura il Potenziamento "Postazione più veloce" non ha effetto sull'onigiri (già segnalato nel ticket 02, ricadute 34 e 35). I tasti 1–3 coprono Scorte e tagliere: il ticket 26 deciderà se le Scorte hanno tasti propri. Per la zampina del tutorial (ticket 20) lo stato già dice quale Scorta è evidenziata (`postazioni.N.evidenziata`).

**Verifica:** `npm test` (135 verdi, 11 in più di prima: ricetta, ordine sbagliato, Spesa, Spreco, rosso, stelle sul netto, Scorte disegnate), scenari Playwright senza errori in console a 360×640, 390×844 e 1280×720, anche in giapponese, schermate guardate (inizio, riso, alga che vola, pronto, bancone pieno, fine, fine in rosso). Impronte `a43b5bed`, `459d9564`, `44f495c1`, `e5d7a664` invariate.

**Non committati, di proposito:** `.scratch/`, `docs/agents/`, `docs/design/` e le modifiche a `CLAUDE.md`, `GAME_SPEC.md`, `GLOSSARY.md` (la regola e i termini Scorta e Ricetta sono già lì).
