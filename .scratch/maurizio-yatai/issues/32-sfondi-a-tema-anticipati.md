# 32: Sfondi e colori a tema dei 5 Matsuri, dietro lo Yatai (anticipo di 13)

**What to build:** La parte grafica del ticket 13, anticipata prima della prima Serata (04): ogni Matsuri ha il suo tema di colori e il suo sfondo dietro lo Yatai, disegnati con il kit di `yatai/src/kit/` e senza PNG. Il pavimento, la tendina del Bancone e i cuscini dei Posti prendono i colori del tema; le Postazioni, i Piatti e Maurizio non cambiano mai. Niente logica di gioco: la mappa delle Serate, le Gran Serate e gli Eventi restano ai ticket 12-15. Il ticket 04 nasce così già con uno sfondo (Hanami, il Matsuri della prima Serata).

**Blocked by:** 03 (Lo Yatai in verticale)

**Status:** resolved

- [x] `TEMI` in `config.js` (hanami, tanabata, hanabi, aki, yuki) con i colori per ruolo: cielo, lontananza, terra, pavimento, tendina (due strisce), cuscino, accento, carta. Ogni colore ha la sua ombra e la sua luce.
- [x] Uno sfondo per ciascun Matsuri, dalla cima dello schermo (area sicura compresa) fino al Bancone, ancorato al layout (`src/layout/`) e non a pixel assoluti, che copre anche il telefono più lungo (altezza di gioco fino a `SCHERMO.maxHeight`). Fasce a pastello sovrapposte, niente gradienti del canvas.
- [x] Si genera solo il tema in uso, non tutti e 5 all'avvio. I tempi di generazione sono in `render_game_to_text()`.
- [x] Pavimento, tendina e cuscini parametrizzati dal tema, con una chiave di texture per tema. Le texture approvate (`carta`, `ombra`, `maurizio`, `onigiri`, `onigiri-icona`) restano identiche pixel per pixel: impronte a43b5bed, 459d9564, 44f495c1, e5d7a664, 3d19ca5a.
- [x] `YataiScene` accetta `matsuri` nei dati di avvio (default hanami); nella scena di sviluppo cinque voci, e in sviluppo `?sviluppo=yatai&matsuri=tanabata`.
- [x] Riconoscibili le stagioni: Hanami (ciliegi, petali, teli da picnic, bonbori, castello lontano), Tanabata (Via Lattea, bambù con i tanzaku nei cinque colori e posto libero per quelli dell'Evento, gru di carta, fukinagashi), Hanabi (fiume con i riflessi, fuochi a sfera pastello senza raggi, bancarelle e lanterne lontane), Aki Matsuri (acero, lanterne, tamburi, covoni di riso, santuario con torii lontano e piccolo), Yuki Matsuri (statue di neve e ghiaccio illuminate, fiocchi, scivolo di neve, lampioni caldi, vapore).
- [x] Cose da evitare (GAME_SPEC.md e ricerca, sezione 8): niente bacchette, bandiera del Sol Levante (nessun fuoco con raggi rossi e bianchi), torii come insegna dello Yatai o con qualcosa sopra, mikoshi, testo o kanji, occhi o denti caricaturali, elementi cinesi, numeri 4 e 9.
- [x] Leggibilità a 360×640: lo Yatai, i Piatti, i nomi delle Postazioni e la fascia delle nuvolette dei Clienti restano in primo piano su ogni sfondo (meno contrasto e meno dettaglio dietro i Posti, i particolari ai bordi e in alto).
- [x] Test puri: ancoraggio degli sfondi al layout a tutte le altezze 1280-1560, copertura dell'area sicura, temi completi, contrasto di testo e contorno dei nomi delle Postazioni almeno 4,5:1 e di Bancone, Postazioni e Piatti contro il pavimento almeno 3:1, per ogni Matsuri; determinismo dei nuovi disegni.
- [x] Verificato come dice PIANO.md: si parte dalla skill `router`, `scenari/matsuri.json` mostra i 5 Matsuri a 360×640 e 1280×720 (anche in giapponese) e a 390×844 con area sicura, gli screenshot dei 5 sfondi sono guardati uno per uno e accanto a `docs/stile/confronto/suite-*`, la console non ha errori.
- [x] `docs/stile/art-direction-brief.md` e `asset-manifest.json` aggiornati con le nuove immagini e i colori di ogni tema.

Resta al ticket 13: lo sfondo della mappa delle Serate e il suo stile per Matsuri.

## Answer

Fatto (anticipo della parte grafica del ticket 13). Dove sta tutto: `TEMI`, `SFONDO` ed `ETICHETTA` in `config.js`; i disegni in `src/disegni/sfondi/` (uno per Matsuri, più `comune.js` e `index.js`); l'ancoraggio in `src/layout/sfondo.js`; `generateTheme` in `kit/texture.js`. Test in `test/temi.test.js` e `test/sfondo.test.js`, scenario `scenari/matsuri.json`, catture in `docs/stile/confronto/matsuri-*.png`, note in `art-direction-brief.md` e `asset-manifest.json`.

Decisioni:
- **Quattro pezzi più pavimento, tendina e cuscino.** Cielo (poggia sull'orizzonte), terra (scende dall'orizzonte), alto (appeso al bordo in alto, sotto il notch compreso), due lati (poggiati dietro il Bancone). L'orizzonte cade a metà della fascia dei Clienti. Tutto si ricalcola dal layout; a ogni altezza 1280-1560 e con ogni area sicura non resta nessun buco.
- **Ruolo in più**: `terra` (il suolo dietro i Posti) oltre a quelli chiesti. `carta` è una tinta che si moltiplica sulla carta di sfondo.
- **`YataiScene` è la base di `SerataScene`**, quindi la Serata prende il tema da sola: basta passare `matsuri` nei dati di avvio (oggi non lo passa nessuno, e vale hanami).
- **Le texture `pavimento`, `bancone` e `posto` non esistono più** in `DISEGNI`: ce n'è una per Matsuri (`pavimento-aki`...), generata solo per il tema in uso. Le cinque approvate al passo 1 hanno le stesse impronte (carta 44f495c1, ombra e5d7a664, maurizio a43b5bed, onigiri 459d9564, onigiri-icona 3d19ca5a: stesse cinque dell'elenco del passo, in altro ordine) e il test le tiene ferme.
- **Costo**: il tema in uso costa circa 300-1000 ms in Chromium senza GPU (con altro in esecuzione), a fronte dei ~160 ms che pavimento, Bancone e Posto già costavano all'avvio. Per contenerlo il tratteggio del pavimento si dà una volta sola e la grana degli sfondi grandi è dimezzata. Da rimisurare su un telefono medio (ticket 27); se pesa, si può generare mentre si vede il titolo.
- Il bambù di Tanabata ha 5 tanzaku e 4 cordicelle libere (`TANZAKU_LIBERI`) per l'Evento del ticket 14. Il torii di Aki sta piccolo e a destra, mai al centro e mai con qualcosa sopra; il mikoshi non c'è.
