# 04: La prima Serata: l'onigiri

**What to build:** La prima versione giocabile (passo 3 di PIANO.md). Una Serata di 120 secondi con il solo onigiri. I Clienti di passaggio (tanuki, kitsune, maneki-neko, disegnati con il kit) arrivano ai Posti con l'Ordine nella nuvoletta. Si tocca il tagliere del riso, l'onigiri cuoce da solo, lo si tocca e passa sul Bancone, poi si tocca il Cliente per servirlo; trascinare fa la stessa cosa. La Pazienza decide la Mancia, e a fine tempo la schermata di fine Serata mostra Incasso e stelle. Le regole sono in GAME_SPEC.md, sezione "La Serata". Skill `input-systems` e `game-feel`.

**Blocked by:** 03 (Lo Yatai in verticale)

**Status:** resolved

- [x] Si serve sia toccando sia trascinando.
- [x] Se sul Bancone manca qualcosa dell'Ordine, il Cliente non è servito e scuote la testa.
- [x] La Pazienza ha 5 cuoricini: a Pazienza piena la Mancia è la più alta; quando finisce il Cliente se ne va imbronciato e non paga.
- [x] La Serata finisce dopo 120 secondi, senza game over a metà, e assegna ★, ★★ o ★★★ secondo le soglie della spec.
- [x] La schermata di fine Serata mostra Incasso e stelle e permette di rigiocare.
- [x] Servire, la Mancia e l'Incasso hanno un riscontro chiaro (monete, cuoricini, Maurizio che si anima).
- [x] La logica della Serata (Ordini, Pazienza, Mancia, Incasso, stelle) ha test automatici che girano senza browser.
- [x] Un playtest Playwright gioca una Serata intera usando solo lo stato di `window.render_game_to_text()`.
- [ ] Il gioco si può aprire su un telefono per il ticket 05.
- [x] I numeri nuovi sono nel file di configurazione e i testi nuovi sono in tutte e tre le lingue.
- [x] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero e la console non ha errori.

## Comments

Già fatto e unito a main (commit 20ef6cb, b244e62): la logica pura della Serata in `yatai/src/serata/Serata.js` con 25 test (criterio "La logica della Serata ha test automatici") e i tre Clienti di passaggio in `yatai/src/disegni/clienti.js`, registrati nel catalogo. Resta da fare il collegamento alla scena: Clienti ai Posti con nuvoletta e cuoricini, tocco e trascinamento, riscontri, schermata di fine Serata, `render_game_to_text()`, playtest Playwright, verifica da PIANO.md. Gli obiettivi di Yen e i numeri scelti dalla logica (obiettivo 1200 Yen, capienza Bancone 6, Mancia) sono provvisori, da bilanciare dopo il ticket 05.

Chiuso (commit fc760fc, oltre a 20ef6cb e b244e62). La prima Serata è giocabile: `SerataScene` (`yatai/src/scenes/SerataScene.js`) estende lo Yatai e ci mette dentro la `Serata`; i Clienti sono in `yatai/src/yatai/ClienteView.js`; tasti in `yatai/src/serata/comandi.js`. Si arriva alla Serata dal pulsante Gioca del titolo, oppure in sviluppo da `?sviluppo=serata` (con `&seme=prova` si ripete la stessa partita).

Verificato: `npm test` (122 verdi, di cui i nuovi su layout del Cliente, tasti, collegamento scena↔eventi e testi), e 12 scenari Playwright senza errori in console a 360×640, 390×844 e 1280×720, anche con `--locale ja-JP` (`yatai/scenari/serata-*.json`). Il bot `gioca` dello script di playtest sceglie le mosse leggendo solo `render_game_to_text()`: gioca una Serata intera toccando, trascinando o coi tasti. Screenshot in `docs/stile/serata/`. Impronte dei disegni approvati invariate (`a43b5bed`, `459d9564`, `44f495c1`, `e5d7a664`).

NON verificato, quindi non spuntato: l'apertura su un telefono vero. Ho provato solo dal PC: `npm run telefono` (dev, con `--host`) risponde sull'indirizzo di rete (Network: http://172.20.10.2:5173/ con la rete "iPhone di Giuseppe") e il firewall ha già regole di consentito per node.exe sul profilo Public; `npm run anteprima` fa la build e la serve in rete. La build di produzione gira anche offline. Resta da vedere dal telefono, all'inizio del ticket 05.

Da bilanciare nel ticket 05 (provvisori): l'obiettivo di 1200 Yen è troppo basso per un giocatore attento. Il bot perfetto fa 2700 Yen (18 serviti, 0 persi), cioè ★★★ con ampio margine. Capienza del Bancone portata a 5 (era 6 nella logica ma lo schermo ne disegnava 5): un numero solo, `YATAI.bancone.capacita`.

### Dalla mappa yatai-economia-e-cucina (2026-11-03)

Ricadute del ticket 01 della mappa (costi e sprechi), da leggere con il ticket resolved senza riaprirlo: Status e criteri non cambiano, il codice di questo ticket è stato superato in parte da decisioni successive. Non più valido: l'**Incasso** come numero lordo (ora è il netto, Vendite meno Spesa, e una Serata in rosso non dà ★ né Yen), "l'onigiri cuoce da solo" (ora si compone a tocchi: ticket 33) e la schermata di fine Serata con il solo Incasso (ora Vendite, Spesa, Spreco e Incasso, poi la tabella per Piatto: ticket 33, 06 e 22). Il lavoro è nel ticket 33, che porta la Spesa nella logica; le regole sono in GAME_SPEC.md ("La Serata", "Ingredienti e Spreco").
