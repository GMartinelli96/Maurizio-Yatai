# Brief di art direction: il kit a matita (passo 1)

Compilato dal modello della skill `create-game-assets`. Parametri numerici: `STILE` e `PALETTE` in `yatai/src/config.js`.

## Game frame
- Motore: Phaser 4.2.1, WebGL con ripiego Canvas. Tutta la grafica è disegnata dal codice all'avvio (ADR-0001), nessun PNG.
- Vista: frontale, verticale 720×1280 (9:16), adattata con `Scale.FIT`. Su telefono 390×844 il fattore è ~0,54, su computer 1280×720 la colonna è ~0,56.
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
- Cattura a dimensione reale: `confronto/`. Approvazione: in attesa di Giuseppe (ticket 02).
