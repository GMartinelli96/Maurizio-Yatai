# 35: Un assaggio di Potenziamenti sulla prima Serata

**What to build:** Dalla prima prova (ticket 05): "con vari upgrade potrebbe essere più divertente". Nel piano i Potenziamenti arrivano dopo il cast e la mappa (ticket 16 e 17, che dipendono dal 12), cioè molto dopo: oggi non c'è niente per cui giocare una Serata in più. Qui si fa una versione minima, subito, per provare se danno quel gusto in più: gli Yen guadagnati restano sul dispositivo e una **Bottega** (già nel glossario) a cui si arriva dal titolo e dalla fine Serata permette di comprare i due Potenziamenti della spec che hanno senso con la sola Serata dell'Hanami: Posto in più (il quarto) e ventaglio di Maurizio (+Pazienza, 3 livelli). Niente mappa, niente Arredo, niente Vestiti (la Bottega avrà tre sezioni, vedi ticket 17, 18 e 19: qui c'è solo quella dei Potenziamenti). **"Postazione più veloce" non c'è qui**: con la cucina a tocchi l'onigiri non ha cottura, quindi il tagliere non ne ha il Potenziamento. Vale solo per le Postazioni con cottura e arriva con il ticket 06 (decisione del 2026-11-03, vedi `## Comments`). Skill `save-systems` per il minimo di salvataggio e `game-ui-ux` per la Bottega.

I ticket 16 e 17 non si buttano: questo ne è la prima fetta. Quando arrivano, estendono il salvataggio alla mappa e ai Matsuri e i Potenziamenti alle 4 Postazioni con cottura.

**Blocked by:** 05 ([con te] La prima prova: è divertente?). Meglio dopo il 33 e il 34, perché cambiano la Serata su cui si calibrano i prezzi, ma non lo richiede.

**Status:** ready-for-agent

- [x] Dopo una Serata gli Yen guadagnati restano sul dispositivo, anche ricaricando la pagina (playtest con ricaricamento). Se lo storage è bloccato il gioco funziona lo stesso, senza salvare. Il salvataggio ha un numero di versione.
- [x] La Bottega mostra gli Yen, i due Potenziamenti (Posto in più, ventaglio) con livello e prezzo, e si usa col pollice a 360×640; comprare costa Yen e non si scende mai sotto zero.
- [x] Il Potenziamento "tagliere più veloce" è escluso da questo ticket (deciso con Giuseppe il 2026-11-03) e la scelta è scritta in GAME_SPEC.md (Progressione): "Postazione più veloce" vale per le 4 Postazioni con cottura.
- [ ] Ogni Potenziamento cambia la Serata come dice GAME_SPEC.md e ha il suo test senza browser; con il quarto Posto lo Yatai resta leggibile.
- [x] Gli Yen guadagnati in una Serata sono l'Incasso; una Serata in rosso non dà Yen e non toglie quelli in tasca (regola del ticket 01 della mappa `yatai-economia-e-cucina`).
- [x] Prezzi ed effetti sono in `config.js` (provvisori fino al ticket 29), i testi sono in italiano, inglese e giapponese, e la schermata ha il nome del glossario.
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

### Passo 2: i Potenziamenti nei dati e nella logica (2026-11-04)

Sul ramo `ticket-35`, dopo aver unito `main` (Serie del 34, passo 3). Fatto: `POTENZIAMENTI` in `config.js` (Posto in più 3000 Yen; ventaglio ×1,2 / ×1,3 / ×1,4 a 1000 / 2000 / 3500 Yen), `src/bottega.js` (voci, livelli, `compra`, `opzioniSerata`), salvataggio alla versione 2 con la migrazione 1→2 (i livelli comprati) e `acquista` (una scrittura, mai sotto zero, mai un livello che non sia il successivo). `test/bottega.test.js` (15 test, senza browser) e `test/bot-bottega.js` (copia provvisoria del bot del 34: quando il `test/bot.js` del ticket 07 è in main si passa a quello). Manca ancora la schermata (passo 3) e il quarto Posto sullo schermo (passo 4): finora la Serata usa ancora 3 Posti.

Misure con il bot (media di 6 semi, Hanami, Serie compresa; rapido / attento / lento): senza Potenziamenti 5005 / 3325 / 2171, il lento perde 3,5 Clienti; con il Posto in più 5012 / 3205 / 2086, il lento ne perde 5,5; ventaglio ×1,2 5160 / 3410 / 2178 (il lento non ne perde più); ×1,3 5270 / 3573 / 2204; ×1,4 5283 / 3598 / 2330; 4 Posti e ×1,4 5187 / 3363 / 2232. Con ogni caso il lento resta a ★ e il rapido a ★★★.

**Da guardare, scelta di Giuseppe:** il Posto in più non fa guadagnare Yen. La cucina è il collo di bottiglia, non i Posti: con un Posto in più arrivano più Clienti, il lento ne perde di più e l'attento incassa meno (−4%). Rende la Serata più piena, non più ricca. Il ventaglio dà più Pazienza ma da ×1,3 in su la Mancia della Serie del rapido arriva al 15% dell'Incasso (il tetto del test del 34 è misurato senza ventaglio).

### Passo 3: la schermata Bottega (2026-11-04)

Fatto: `src/scenes/BottegaScene.js` (Yen con la moneta, un pannello per Potenziamento con nome, effetto, tondi del livello e pulsante col prezzo; al massimo c'è "Al massimo"; un pulsante spento se gli Yen non bastano), il pulsante "Bottega" sul titolo, testi in italiano, inglese e giapponese (nel giapponese le righe vanno a capo a mano, perché Phaser va a capo solo sugli spazi), la nota "gli Yen non si possono salvare su questo dispositivo" quando lo storage è bloccato. Solo in sviluppo, `?sviluppo=bottega&yen=4500` mette degli Yen in tasca. Scenari a 360×640: `bottega.json` (comprare, restare senza Yen, ricaricare, tornare al titolo; provato in it, en, ja), `bottega-bloccata.json` (con `--senza-storage`). Senza errori in console, screenshot guardati.

Manca: il pulsante Bottega nella schermata di fine Serata e il quarto Posto sullo schermo (passo 4). Giuseppe ha provato il passo 1 e il passo 3 sul telefono: ok.

### Le icone e il Posto in più con più Pazienza (2026-11-04)

Icone disegnate con il kit a matita in `src/disegni/bottega.js` (chiavi `icona-postoInPiu` e `icona-ventaglio`, 120×120, nel catalogo e in `docs/stile/asset-manifest.json`): lo sgabello dei Posti con un disco di menta e il "+", e un uchiwa rosa con un fiore di ciliegio. La Bottega ha ora l'icona accanto al nome; i pannelli sono più alti (300 invece di 270).

**Deciso con Giuseppe: il Posto in più dà un po' di Pazienza.** Il quarto Posto porta **un cuoricino in più** (il sesto): 5 cuori di partenza, 6 con il Posto in più. Scartata l'altra strada ("4 cuori di base, 5 con 4 Posti"): peggiora la Serata di chi non ha comprato niente (misura con il bot, media di 6 semi, rapido / attento / lento: 4955 / 3103 / 2005, il lento sfiora il limite di ★ a 1920 e perde 4,3 Clienti). Con il sesto cuore: 5112 / 3170 / 2100, il lento perde 2,5 Clienti invece di 5,5 (senza il cuore: 5012 / 3205 / 2086). In secondi vale ×1,2 (30 s in calma, 18 s in ondata), cioè ogni cuoricino dura sempre un quinto della Pazienza di base (5 s in calma, 3 s in ondata) e il sesto si aggiunge in coda. Si moltiplica con il ventaglio. **Da fare nel passo 4**, insieme al quarto Posto sullo schermo: `Serata.js` (numero di cuoricini per Cliente), la fila di cuoricini della nuvoletta in `ClienteView.js` (sei in 168 px) e il Lamento (resta a 2 e a 1 cuoricino rimasto). Il test del bot `il quarto Posto non toglie ★…` va riletto con il sesto cuore.
