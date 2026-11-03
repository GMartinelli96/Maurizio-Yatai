# 03: Lo Yatai in verticale

**What to build:** La scena della Serata con lo Yatai disegnato dal kit. Dall'alto in basso: i Posti (3), il Bancone con i Piatti pronti e le Postazioni vicino al pollice, con Maurizio al centro che si anima a ogni azione (le azioni sono istantanee, l'animazione è solo contorno). Lo Yatai si adatta a schermi diversi; su computer è una colonna centrata, come FarmPlush. Ancora niente Clienti né regole. È il passo 2 di PIANO.md, con la skill `game-ui-ux`.

**Blocked by:** 02 ([con te] Lo stile a matita va bene?)

**Status:** resolved

- [x] Lo Yatai è leggibile a 360×640 e a 1280×720, con gli screenshot guardati in entrambi i formati.
- [x] L'impaginazione ha già spazio per un quarto Posto (il Potenziamento del ticket 17) e per 5 Postazioni, senza doverla rifare.
- [x] Maurizio ha un'animazione che ogni azione può richiamare.
- [x] Le posizioni di Posti, Bancone e Postazioni compaiono in `window.render_game_to_text()`, così i test sanno dove toccare.
- [x] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero e la console non ha errori.

## Comments

Fatto (passo 2 di PIANO.md). Decisioni prese:

- **Adattamento**: larghezza di gioco fissa a 720, altezza che segue lo schermo tra 1280 (9:16) e 1560 (telefoni lunghi), con `Scale.FIT`. Su computer resta una colonna 9:16 centrata, con fondo più scuro e un'ombra ai lati. I calcoli sono funzioni pure in `src/layout/` (con test); i numeri in `config.js` (`SCHERMO`, `YATAI`, `MAURIZIO`).
- **Area sicura** letta da `env(safe-area-inset-*)` con un elemento nascosto (niente stili in linea, per la CSP). In sviluppo `&area=47,0,34,0` la simula.
- **Quarto Posto e 5 Postazioni**: i Posti hanno già la larghezza che avranno con 4 e le Postazioni quella che avranno con 5, quindi aggiungerli non sposta né rimpicciolisce niente.
- **Capienza del Bancone: 5 Piatti** in fila (`YATAI.bancone.capacita`). GAME_SPEC.md non la dice: è un valore di partenza da decidere al passo 3.
- **Ordine dei Piatti** in `PIATTI` corretto: taiyaki prima di ramen, come in GAME_SPEC.md (le Postazioni sullo schermo lo seguono).
- **Maurizio**: 3 pose (`riposo` identica a quella approvata, `lavora`, `evviva`) e 3 azioni richiamabili con `azione('cuoci' | 'raccogli' | 'servi')`. La scena emette l'evento `tocco` `{ tipo, indice }` per il gioco.
- Le 5 Postazioni sono disegnate tutte (ferme e vuote) per provare il layout; cottura, Fumo e Piatti sopra restano ai passi 3-5.
- Il telefono girato di traverso (844×390) non è gestito: la colonna 9:16 diventa larga 219 px e nessuna zona raggiunge i 44 px. Si decide al passo 13 (accessibilità/installazione).
- La generazione di tutte le texture richiede ~330 ms su un computer; da rimisurare su un telefono medio al passo 13.
