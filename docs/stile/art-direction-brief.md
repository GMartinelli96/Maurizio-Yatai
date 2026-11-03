# Brief di art direction: il kit a matita (passo 1)

Compilato dal modello della skill `create-game-assets`. Parametri numerici: `STILE` e `PALETTE` in `yatai/src/config.js`.

## Game frame
- Motore: Phaser 4.2.1, WebGL con ripiego Canvas. Tutta la grafica è disegnata dal codice all'avvio (ADR-0001), nessun PNG.
- Vista: frontale, verticale. Larghezza fissa 720; altezza 1280 (9:16) fino a 1560 per i telefoni lunghi, adattata con `Scale.FIT` (vedi "Lo Yatai"). Su telefono 390×844 il fattore è ~0,54, su computer 1280×720 la colonna 9:16 è ~0,56.
- Misure sullo schermo: Maurizio 320×450, onigiri sul Bancone ~150 px, icona dell'Ordine ~64 px.

## Sistema visivo (ricavato da FarmPlush, Nella Bug Saga, Picchiaduro)
- Forme: tonde e morbide, nessun angolo vivo; i peluche hanno il bordo di pelo.
- Linea: matita marrone quasi nera (#3a2f2b), ~3,4 px, con un secondo passaggio sottile e chiaro; tremolio morbido (1,3 px) e ripetibile (seme fisso).
- Colore: pastello a campione {colore, ombra, luce}: colore pieno, ombra morbida sul bordo in basso a destra (luce in alto a sinistra), tratteggio diagonale scuro e chiaro.
- Superficie: grana a puntini tolti su tutto il disegno; carta color crema ruvida con fibre e graffi, che si ripete senza giunture.
- Font: Comic Neue (latino), richiamo del Comic Sans della suite; giapponese di ripiego di sistema.
- Esclusioni: bacchette, bandiera del Sol Levante, font "finto orientale", occhi o denti caricaturali (GAME_SPEC, "Cose da evitare").

## Contratto tecnico
- Texture canvas generate in `generateTextures` (BootScene), chiave = nome in `src/disegni/catalogo.js`.
- Alpha reale intorno ai disegni; filtro lineare (non è pixel art).
- Il seme di ogni disegno è `STILE.seme` + chiave: stesso disegno a ogni avvio, in qualunque ordine. Test in `test/kit.test.js`; impronte dei pixel in `render_game_to_text()`.

## Bersaglio visivo
- Seme approvato da giudicare: `yatai/src/scenes/TavolaScene.js` (scena `tavola`, aperta con `npm run dev` → `/?sviluppo`).
- Cattura a dimensione reale: `confronto/`. Approvazione: **approvata da Giuseppe, nessuna correzione** (ticket 02).

## Lo Yatai (passo 2)
Disegni nuovi, tutti col kit e senza PNG: `pavimento`, `bancone`, `posto`, le cinque `postazione-*` e le pose `maurizio-lavora` e `maurizio-evviva` (`maurizio` è la posa a riposo, invariata pixel per pixel). Provenienza in `asset-manifest.json`.
- Vista "dall'alto in basso = dal lontano al vicino": Posti, Bancone, Maurizio, Postazioni. Il pavimento è di legno a lunghe assi con giunture sottili e chiare (con contorni scuri come quelli degli oggetti sembrava un muro di mattoni).
- Il davanti del Bancone è una tendina a strisce verticali rosa e panna con il bordo a onde, come i negozi del Picchiaduro e le tendine di FarmPlush. Niente raggi, niente bandiera del Sol Levante.
- Le Postazioni sono ferme e vuote; sul tagliere c'è la paletta del riso e basta (niente bacchette). Cottura, Fumo e Piatto sopra arrivano coi passi 3-5.
- Impaginazione: `yatai/src/layout/` (funzioni pure con test); numeri in `config.js` (`SCHERMO`, `YATAI`, `MAURIZIO`). Cattura: `confronto/yatai-scena-*.png`.
- La fascia in alto (Posti e Clienti) è volutamente quasi vuota: è lo spazio dei Clienti con la loro nuvoletta (passo 3). Gli sfondi dei Matsuri (ticket 13) la coloreranno come i cieli e i prati della suite.
