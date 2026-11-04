# 08: Ramen e taiyaki

**What to build:** Gli ultimi due Piatti, entrambi con varianti e bruciatura: il ramen alla pentola del brodo (con uovo o con naruto) e il taiyaki allo stampo a pesce (fagioli rossi o crema). Usano le Scorte per variante del ticket 07 (senza menu) e il Fumo del ticket 06; tempi e prezzi sono nella tabella dei Piatti di GAME_SPEC.md. Entrambi seguono la cucina a tocchi (ticket 33) con la loro **Ricetta** entro i 4 tocchi: taiyaki pastella, ripieno, [cottura], prendi (3); ramen noodles, brodo, [cottura], uovo o naruto, prendi (4; uovo e naruto sono due Scorte, come la salsa del takoyaki dopo la cottura). La variante è un Ingrediente diverso (ripieno, uovo o naruto). Alla fine si giocano tutti e 5 i Piatti, in una Serata di prova con tutte e 5 le Postazioni (passo 5 di PIANO.md).

**Blocked by:** 07 (Il kakigōri e le varianti)

**Status:** resolved

- [x] Una Serata di prova ha tutte e 5 le Postazioni ed è leggibile a 360×640, con tutte le Scorte (circa 15, varianti comprese) toccabili col pollice. Come si dispongono (più file, solo le Scorte dei Piatti sbloccati, ecc.) si decide qui e si scrive in GAME_SPEC.md.
- [x] Gli Ingredienti con lo stesso nome in due Piatti (la pastella di takoyaki e taiyaki) sono una Scorta condivisa o due Scorte con nomi diversi: oggi l'id di una Scorta è il nome dell'Ingrediente, quindi due Scorte uguali si confonderebbero (con test).
- [x] Ramen e taiyaki cuociono, si bruciano e lasciano il Fumo come il takoyaki.
- [x] Gli Ordini possono mescolare Piatti e varianti, e si servono solo se il Bancone ha tutto (con test).
- [x] Le icone delle 4 varianti nuove si distinguono anche in bianco e nero.
- [x] Taiyaki e ramen hanno ciascuno la sua Ricetta entro i 4 tocchi, la scelta della variante compresa nel conto, con un test sul conteggio; ordine sbagliato: non succede niente.
- [x] Gli Ingredienti e i costi di taiyaki (pastella 30, ripieno 40) e ramen (noodles 70, brodo 80, uovo o naruto 50) sono in `config.js` e la variante cambia l'Ingrediente. Un Piatto bruciato è Spreco.
- [ ] Le righe del recap per Piatto (ticket 06) comprendono tutti e 5 i Piatti: **passa al ticket 06**, che ha la tabella per Piatto ("i ticket 07 e 08 aggiungono le righe"); qui il recap mostra ancora i totali.
- [x] I numeri nuovi sono nel file di configurazione e i testi nuovi sono in tutte e tre le lingue.
- [x] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero, lo stato nuovo compare in `window.render_game_to_text()` e la console non ha errori.

## Comments

### Dalla mappa yatai-economia-e-cucina (2026-11-03)

Ricadute dei ticket 01 e 02 della mappa. Cambiato: la frase sulle Ricette in "What to build" e i criteri nuovi su Ricetta, tetto, Ingredienti e Spreco.

**Deciso con Giuseppe il 2026-11-03:** nel ramen l'uovo o il naruto si aggiungono dopo la cottura di 6 s, come la salsa del takoyaki. Niente menu delle varianti: una Scorta per variante (vedi il ticket 07). La sequenza è in GAME_SPEC.md ("Come si gioca"). Restano da fare qui lo spazio per le Scorte e il nome della pastella (due criteri sopra).

### Chiuso (2026-11-04)

Unito in `main` con `99130de` (fast-forward di `ticket-08`, dopo `git merge main` con i ticket 34 e 10; un solo conflitto, gli import di `SerataScene.js`; worktree `../maurizio-t08`). La prova di Giuseppe sul telefono vero è andata bene. Commit del ticket: `76515ed`, `c1db6c8`, `bcdb6e0`, `4c75a9c`. Verificato dopo il merge: `npm test` verde e i 25 scenari senza errori in console (nuovi: `serata-taiyaki.json`, `serata-ramen.json`, `serata-tutti.json`, a 360×640, 390×844, 1280×720 e in giapponese).

**Le decisioni**
- **Pastella: due Scorte.** Con una Scorta condivisa il primo tocco non saprebbe quale Postazione servire (piastra e stampo la aspettano entrambe). La pastella del takoyaki resta `pastella`, quella del taiyaki è `impasto` ("Impasto dolce", "Sweet batter", あまい生地). Un test controlla che gli id delle Scorte siano unici (16) e che ognuna serva solo la sua Postazione.
- **Spazio per 16 Scorte** (riso, alga, pastella, polpo, salsa, ghiaccio, tre sciroppi, impasto, due ripieni, noodles, brodo, uovo, naruto): da 13 Scorte in su a sinistra c'è una terza colonna (celle da 44 px CSS), a destra due, e a Maurizio restano 232 px invece di 280 (un po' spostato a destra). Su telefoni più alti basta una colonna in meno. Decisione e misure in GAME_SPEC.md ("Dove stanno le Scorte"); provato a 360×640, 375×667, 390×844 e 1280×720 in italiano e giapponese.
- **Ricette**: taiyaki impasto 30, ripieno 40 (fagioli o crema), [8 s], prendi: 3 tocchi, 70 ¥ su 200, si brucia dopo 4 s. Ramen noodles 70, brodo 80, [6 s], uovo o naruto 50, prendi: 4 tocchi, 200 ¥ su 600, si brucia dopo 5 s. Disegni in `taiyaki.js` e `ramen.js`; le quattro varianti si distinguono anche in bianco e nero (fagioli quasi neri, crema chiarissima, uovo ovale con il tuorlo, naruto a disco ondulato con la spirale).
- **Serate**: `SERATA_AKI` (taiyaki) e `SERATA_YUKI` (tutti e 5 i Piatti), obiettivo provvisorio 3000 per tutte e due, misurato col bot su 24 semi (Aki: lento 3235, attento 4525, rapido 6958; Yuki: lento 3244, attento 4342, rapido 7527), da rivedere nel ticket 29.
- **Ordini da 3 Piatti nello Yuki**: con uno su tre la Serata non regge (rapido 4617, attento 2675, lento 2617, fino a −365, 5 Piatti bruciati a Serata); una Pazienza più lunga per ogni Piatto in più non aiuta. Con il **15%** di Ordini da 3 (`piattiPerOrdine.tre`) regge ed è più dura. Numeri in `config.js` sopra `SERATA_YUKI`.

**Non fatto, da sapere**: la tabella per Piatto nel recap (criterio sopra, spostato) è del ticket 06. I tasti per le 16 Scorte sono del ticket 26: oggi i tasti 1–7 coprono le prime sette voci della fila, che con le Scorte sugli scaffali sono Scorte.
