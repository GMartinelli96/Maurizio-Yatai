# 35: Un assaggio di Potenziamenti sulla prima Serata

**What to build:** Dalla prima prova (ticket 05): "con vari upgrade potrebbe essere più divertente". Nel piano i Potenziamenti arrivano dopo il cast e la mappa (ticket 16 e 17, che dipendono dal 12), cioè molto dopo: oggi non c'è niente per cui giocare una Serata in più. Qui si fa una versione minima, subito, per provare se danno quel gusto in più: gli Yen guadagnati restano sul dispositivo e una **Bottega** (già nel glossario) a cui si arriva dal titolo e dalla fine Serata permette di comprare i due Potenziamenti della spec che hanno senso con la sola Serata dell'Hanami: Posto in più (il quarto) e ventaglio di Maurizio (+Pazienza, 3 livelli). Niente mappa, niente Arredo, niente Vestiti (la Bottega avrà tre sezioni, vedi ticket 17, 18 e 19: qui c'è solo quella dei Potenziamenti). **"Postazione più veloce" non c'è qui**: con la cucina a tocchi l'onigiri non ha cottura, quindi il tagliere non ne ha il Potenziamento. Vale solo per le Postazioni con cottura e arriva con il ticket 06 (decisione del 2026-11-03, vedi `## Comments`). Skill `save-systems` per il minimo di salvataggio e `game-ui-ux` per la Bottega.

I ticket 16 e 17 non si buttano: questo ne è la prima fetta. Quando arrivano, estendono il salvataggio alla mappa e ai Matsuri e i Potenziamenti alle 4 Postazioni con cottura.

**Blocked by:** 05 ([con te] La prima prova: è divertente?). Meglio dopo il 33 e il 34, perché cambiano la Serata su cui si calibrano i prezzi, ma non lo richiede.

**Status:** ready-for-agent

- [x] Dopo una Serata gli Yen guadagnati restano sul dispositivo, anche ricaricando la pagina (playtest con ricaricamento). Se lo storage è bloccato il gioco funziona lo stesso, senza salvare. Il salvataggio ha un numero di versione.
- [ ] La Bottega mostra gli Yen, i due Potenziamenti (Posto in più, ventaglio) con livello e prezzo, e si usa col pollice a 360×640; comprare costa Yen e non si scende mai sotto zero.
- [x] Il Potenziamento "tagliere più veloce" è escluso da questo ticket (deciso con Giuseppe il 2026-11-03) e la scelta è scritta in GAME_SPEC.md (Progressione): "Postazione più veloce" vale per le 4 Postazioni con cottura.
- [ ] Ogni Potenziamento cambia la Serata come dice GAME_SPEC.md e ha il suo test senza browser; con il quarto Posto lo Yatai resta leggibile.
- [ ] Gli Yen guadagnati in una Serata sono l'Incasso; una Serata in rosso non dà Yen e non toglie quelli in tasca (regola del ticket 01 della mappa `yatai-economia-e-cucina`).
- [ ] Prezzi ed effetti sono in `config.js` (provvisori fino al ticket 29), i testi sono in italiano, inglese e giapponese, e la schermata ha il nome del glossario.
- [ ] Giuseppe lo ha provato e il suo parere è scritto in fondo a questo file: i Potenziamenti danno più voglia di rigiocare?
- [ ] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero, lo stato nuovo compare in `window.render_game_to_text()` e la console non ha errori.

## Comments

### Dalla mappa yatai-economia-e-cucina (2026-11-03)

Ricadute dei ticket 02 e 04 della mappa. Cambiato: la frase sulla Bottega a tre sezioni e il Potenziamento del tagliere in "What to build".

**Deciso con Giuseppe (2026-11-03).** Il ticket 02 della mappa diceva che "tagliere più veloce" andava riletto: con l'onigiri senza cottura non ha effetto, e qui c'è solo l'onigiri. Scelta: "Postazione più veloce" si applica solo ai Piatti con cottura. Questo ticket vende quindi due Potenziamenti (Posto in più, ventaglio) e il terzo arriva con il ticket 06 (primo Piatto con cottura). Scartate: "meno tocchi" (contraddice la Ricetta fissa e il tetto, e non regge 3 livelli) e un effetto sull'onigiri (tocca la Spesa e il 29). Scritto in GAME_SPEC.md (Progressione) e nei ticket 06 e 17.

I tocchi in più per Cliente cambiano anche il ritmo su cui si calibrano i prezzi (come per il 34): i prezzi restano provvisori fino al 29.

### Dalla mappa yatai-serata-che-cambia (2026-11-03)

Le ondate devono reggere con 3 e con 4 Posti e col ventaglio (decisione della destinazione, misure del ticket 02 e 05). Misurato con il bot (Hanami, 15 s di Pazienza in ondata, Serie come scritta, media di 6 semi): con 4 Posti rapido 5035, attento 3201, lento 2056, quindi ★★★ / ★★★ / ★ e il lento perde in media 5,7 Clienti in ondata. Con il ventaglio a **+20%** (ipotesi della misura: 30 s fuori ondata, 18 s in ondata) 5215 / 3390 / 2165, e il lento non perde nessuno.

Da decidere qui: se il ventaglio allunga anche la Pazienza in ondata (e di quanto: i 15 s sono un valore di partenza) e i numeri dei 3 livelli. Attenzione: con le sole ondate di frequenza il quarto Posto da solo toglieva ★ al lento (la Mancia scende perché i Clienti aspettano di più); regge solo con la Pazienza corta in ondata e la Serie. Un test del bot per Posto in più e per ogni livello del ventaglio.

### Passo 1: il salvataggio degli Yen (2026-11-03)

Fatto in `src/salvataggio.js` (classe `Salvataggio`, storage iniettabile, `salvataggio()` per il gioco): un solo campo `yen` e il numero di versione 1. Alla fine di ogni Serata l'Incasso diventa Yen in tasca (`SerataScene.perFine`); una Serata in rosso non ne dà e non ne toglie. Storage bloccato, pieno, assente o con dati illeggibili: si gioca lo stesso, con gli Yen in memoria; un salvataggio di una versione più nuova non si sovrascrive. In `render_game_to_text()` c'è `salvataggio: { yen, salvato }`. Verificato con 10 test senza browser (`test/salvataggio.test.js`) e con due scenari a 360×640 (`serata-yen.json` con ricaricamento e Serata in rosso, `serata-yen-bloccato.json` con `--senza-storage`), senza errori in console. Non ancora provato sul telefono.

Deciso con Giuseppe (2026-11-03): il ventaglio parte da **+20%** di Pazienza, vale **anche in ondata**, e i numeri dei 3 livelli si decidono misurando con il bot a 3 e 4 Posti (un test per Posto in più e per livello).
