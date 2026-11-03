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

## Gli sfondi a tema (ticket 32)
Ogni Matsuri ha il suo **tema** (`TEMI` in `config.js`): i colori per ruolo, ognuno con la sua ombra e la sua luce come in `PALETTE`. Cambiano lo sfondo, il pavimento, la tendina del Bancone e i cuscini dei Posti. **Le Postazioni, i Piatti e Maurizio non cambiano mai colore**: sono l'identità del gioco e devono staccarsi da ogni sfondo (un test controlla che non ci siano texture a tema nel catalogo fisso e che le loro registrazioni di disegno siano quelle del passo 1).

| Matsuri | cielo (colore ombra luce) | lontananza | terra | pavimento | tendina | cuscino | accento | carta |
|---|---|---|---|---|---|---|---|---|
| hanami | `#b9e1f4` `#8cc6ea` `#e9f6fb` | `#d9e2ec` `#b3c3d6` `#f1f5f9` | `#bfe6a4` `#93c97b` `#e2f6cb` | `#f0d2b0` `#cfa57d` `#fbe9d6` | `#f7a8c4` + `#fffdf8` | `#f7a8c4` | `#f9c4d6` | `#ffffff` |
| tanabata | `#4b4fa0` `#2c2f72` `#a99ad8` | `#4a4a96` `#383a80` `#6e6bb4` | `#3d4a8f` `#2c386f` `#5a6aae` | `#dfc3ae` `#bc9a83` `#f1e1d3` | `#7fa6ee` + `#fbefc0` | `#b3a2ea` | `#fbe28a` | `#b8bde8` |
| hanabi | `#2c2a6e` `#1a1c4b` `#5a3f91` | `#3b2f78` `#2a2260` `#5a4a9a` | `#2e3f86` `#1f2c68` `#4d63b0` | `#dcb396` `#c39c84` `#f0d6c2` | `#a897e8` + `#f7b9d8` | `#8fb6f0` | `#f7d26a` | `#9aa0d8` |
| aki | `#f5b27b` `#e2825a` `#fce1a8` | `#9fb08a` `#7f9770` `#c4d1ac` | `#b9c07c` `#98a25c` `#d9deac` | `#e8c08a` `#c99a5f` `#f6dcb4` | `#e4875e` + `#f5dcae` | `#e4875e` | `#d9593f` | `#fff0d8` |
| yuki | `#5b7cc0` `#33498f` `#b8d4f2` | `#d6e4f5` `#aac2e2` `#f2f8ff` | `#cfe0f3` `#a2bde0` `#f4f9ff` | `#e6cfb4` `#bda486` `#f5e8d6` | `#5e8fd6` + `#fffdf8` | `#8fb8ea` | `#f9c66a` | `#dfe9fb` |

- **Come si compone** (`src/disegni/sfondi/`, uno per Matsuri, più `comune.js` e `index.js`): quattro pezzi più il pavimento, la tendina e il cuscino, ognuno una texture con la chiave del Matsuri (`sfondo-hanabi-cielo`, `pavimento-aki`...). Si genera **solo il tema in uso**, all'avvio della scena (`generateTheme` in `kit/texture.js`), non tutti e 5.
  - `cielo` 720×560: poggia sull'orizzonte; la parte alta esce dallo schermo e si vede di più sui telefoni lunghi.
  - `terra` 720×480: parte dall'orizzonte e arriva dietro il pavimento.
  - `alto` 720×260: appeso al bordo in alto (rami, lanterne, festoni), anche sotto il notch.
  - `latoSx` e `latoDx` 190×920: due colonne ai bordi, poggiate dietro il Bancone (alberi, bambù, pali con le lanterne, tamburo, statue).
- **Ancoraggio** (`src/layout/sfondo.js`, funzioni pure con test): l'orizzonte cade a 50% della fascia dei Clienti, il pavimento 120 px sotto la cima del Bancone, i lati 44 px sotto. Niente pixel assoluti: a ogni altezza 1280-1560 e con ogni area sicura dal bordo in alto a quello in basso non resta nessun buco.
- **Niente gradienti del canvas**: i cieli sono fasce a pastello sovrapposte (bordo ondeggiante, tratteggio dato una volta sola su tutto il cielo). Il tratteggio del pavimento è dato una volta sola dopo le assi; la grana degli sfondi grandi è dimezzata: costa un'operazione per puntino.
- **Leggibilità** (il criterio vero): dietro i Posti lo sfondo ha poco contrasto e pochi dettagli (colline, prato, fiume); i particolari e i colori forti stanno ai bordi e in alto. A 360×640 i Clienti, le nuvolette e i cuoricini restano in primo piano su ogni tema. `test/temi.test.js`, per ogni Matsuri: testo e contorno dei nomi delle Postazioni almeno 4,5:1 (anche il testo sul pavimento); il contorno a matita di Bancone, Postazioni e Piatti contro il pavimento almeno 3:1 (è il contorno che li stacca, non il riempimento); il suolo dietro i Posti stacca almeno 3:1 o l'inchiostro o il bianco della nuvoletta.
- **La carta del tema** (`carta`) è una tinta che si moltiplica sulla carta sotto a tutto (`addPaper`): nei temi di sera la grana della matita non lascia puntini crema.

### Cosa c'è in ogni Matsuri (simboli dalla ricerca, sezione 4)
- **Hanami**, primavera, giorno: ciliegi in fiore ai bordi e rami in alto, petali che cadono (e sparsi sul pavimento), teli da picnic, bonbori su un palo, un castello piccolo in lontananza con ciliegi lontani.
- **Tanabata**, crepuscolo: Via Lattea fatta di puntini con le due stelle innamorate ai lati, paese lontano con le finestre accese, lucciole; bambù con i 5 tanzaku (blu, rosso, giallo, bianco, viola) e **4 cordicelle libere** per i tanzaku dell'Evento (`TANZAKU_LIBERI` in `sfondi/tanabata.js`); gru di carta e festoni a nastri (fukinagashi). Nessuna scritta sui tanzaku.
- **Hanabi**, notte: fiume con i riflessi dei fuochi, fuochi a sfera in rosa, giallo, azzurro e verde, bancarelle e lanterne sulla riva lontana, pali con le lanterne e una fila di lanterne in alto. **Niente bandiera del Sol Levante**: i fuochi sono anelli di scintille a goccia con il centro vuoto, nessun disco, nessun raggio, nessun rosso (un test lo controlla sui colori e sulla forma).
- **Aki Matsuri**, tramonto: colline di bosco, foglie d'acero ovunque, un acero con le lanterne appese, covoni di riso, un tamburo (senza bacchette), e in lontananza **piccolo, a destra e fuori dal centro** il santuario con il suo torii: è lo sfondo di uno Yatai davanti al santuario. Niente sopra o dentro il torii, niente mikoshi (è l'Evento del passo 8).
- **Yuki Matsuri**, sera: colline di neve con i pini, una kamakura con la porta illuminata e il vapore, lampioni caldi, uno scivolo di neve, un orso di neve tondo e cristalli di ghiaccio illuminati da sotto, lucine in alto, fiocchi.

### Tempi di generazione
Misurati in Chromium senza scheda grafica (renderizzazione software), mentre il computer faceva altro: sono un'indicazione grossolana, da rimisurare su un telefono medio al passo 13. Il tema in uso costa in media circa 300-1000 ms (8 texture: pavimento ~200, cielo ~120, terra ~90, Bancone ~90, lati e alto ~50-100 l'uno); all'avvio restano le texture fisse (carta, Maurizio, Piatti, Postazioni, Clienti, nuvoletta...), senza più pavimento, Bancone e Posto. I tempi di ogni texture sono in `render_game_to_text().generazione`.

### Catture
`confronto/matsuri-*.png`: i cinque Matsuri a 360×640 e a 1280×720, e a 390×844 con l'area sicura (`&area=47,0,34,0`); `matsuri-affiancati.png` li mette uno accanto all'altro, con la suite per confronto. Si rifanno con `npm run playtest -- scenari/matsuri.json`.
