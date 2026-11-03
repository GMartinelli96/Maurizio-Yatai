// Tutti i numeri del gioco stanno qui. Sono i valori di partenza di GAME_SPEC.md:
// si regolano in questo file e in nessun altro.

// I colori del kit a matita, per ruolo. Ricavati guardando FarmPlush, Nella Bug Saga e il
// Picchiaduro: contorno marrone quasi nero, pastelli caldi, carta color crema.
// Ogni colore di riempimento ha la sua ombra (il tratteggio scuro) e la sua luce (quello chiaro).
export const PALETTE = {
  inchiostro: '#3a2f2b',
  carta: '#fff8ec',
  cartaGrana: '#d8cbb8',
  ombraPosata: '#3a2f2b',
  bianco: '#fffdf8',
  pelo: { colore: '#dba46a', ombra: '#a8743f', luce: '#f4d3a1' },
  muso: { colore: '#f4ddb4', ombra: '#d4b384', luce: '#fff3dc' },
  orecchioDentro: { colore: '#f0c49c', ombra: '#cf9a6c', luce: '#fbe2c7' },
  salopette: { colore: '#6aa3e0', ombra: '#3d73b5', luce: '#acd0f4' },
  bordino: { colore: '#8fdde6', ombra: '#56b3c0', luce: '#d2f5f8' },
  guance: '#f39a9a',
  arcobaleno: ['#f28b8b', '#f6b36b', '#f5dc72', '#93d69a', '#7fb7ee'],
  riso: { colore: '#fffdf7', ombra: '#cfcac0', luce: '#ffffff' },
  nori: { colore: '#33463c', ombra: '#1d2a23', luce: '#5b7a68' },
  // Gli accenti per pulsanti e pannelli, come i pulsanti di FarmPlush. Nuvola: i pannelli bianchi.
  nuvola: { colore: '#fffdf8', ombra: '#cdbfa9', luce: '#ffffff' },
  rosa: { colore: '#f7a8c4', ombra: '#d9708f', luce: '#fde0ea' },
  menta: { colore: '#b5e6d3', ombra: '#76bba0', luce: '#e3f7ef' },
  giallo: { colore: '#f7d26a', ombra: '#d1a33a', luce: '#fdedb8' },
  // Lo Yatai: legno chiaro per il pavimento e il piano del Bancone, legno scuro per il tagliere.
  legno: { colore: '#ecc99a', ombra: '#c99a64', luce: '#f9e3c2' },
  legnoChiaro: { colore: '#f2d5aa', ombra: '#cfa670', luce: '#fbead0' },
  legnoScuro: { colore: '#d29a62', ombra: '#a56f3a', luce: '#ecc08f' },
  // Le Postazioni: ferro delle piastre, ghiaccio, brodo.
  ferro: { colore: '#7d7a86', ombra: '#524f5c', luce: '#aeabb8' },
  ghiaccio: { colore: '#e4f4fb', ombra: '#a9d3e6', luce: '#ffffff' },
  celeste: { colore: '#a9d6f0', ombra: '#6fa9cc', luce: '#d8eefa' },
  brodo: { colore: '#f3cf86', ombra: '#d6a64c', luce: '#fbe6b4' },
};

export const VIEW = {
  // Formato verticale 9:16. Su computer Phaser lo adatta in una colonna centrata.
  width: 720,
  height: 1280,
  background: PALETTE.carta,
};

// Come lo schermo diventa un'immagine di gioco (src/layout/schermo.js). La larghezza è sempre
// quella di VIEW; l'altezza segue le proporzioni dello schermo, ma resta tra questi due limiti:
// 1280 è il 9:16 (e la colonna centrata dei computer), 1560 è un telefono lungo come un 9:19,5.
// Oltre i limiti Phaser lascia delle bande ai lati o sopra e sotto.
export const SCHERMO = {
  minHeight: 1280,
  maxHeight: 1560,
};

// Il kit di disegno "a matita" (src/kit/). Le misure sono in pixel di gioco (VIEW).
export const STILE = {
  // Ogni disegno ha il suo seme, ricavato da questo e dal nome della texture: lo stesso
  // disegno esce identico a ogni avvio, anche se cambia l'ordine in cui si generano.
  seme: 'maurizio-yatai-1',
  linea: {
    spessore: 3.4,
    // Il tremolio: di quanto la linea si sposta dal contorno e ogni quanti pixel cambia idea.
    tremolio: 1.3,
    onda: 26,
    // Il secondo passaggio di matita, più sottile e chiaro, appena sfasato rispetto al primo.
    ripasso: { spessore: 0.5, alpha: 0.45, scarto: 1.1 },
  },
  pastello: {
    // Il tratteggio a pastello: tratti diagonali corti sopra il colore pieno.
    angolo: -58,
    passo: 6.5,
    spessore: 2.2,
    alphaOmbra: 0.3,
    alphaLuce: 0.35,
    // Il colore pieno esce un poco dal contorno, come quando si colora a mano.
    sbavatura: 1.2,
    // L'ombra morbida lungo il bordo interno, che dà volume ai peluche.
    bordoOmbra: { spessore: 14, alpha: 0.2 },
  },
  pelo: { lunghezza: 4.4, passo: 4.8, deviazione: 0.4, alpha: 0.7 },
  // La grana della matita: puntini tolti a caso da tutto il disegno.
  grana: { densita: 0.06, alpha: 0.22 },
  // La carta è un quadrato che si ripete. Le macchie sono due griglie di misure diverse (5 e 11
  // celle per lato), così la ripetizione non si nota.
  carta: { lato: 512, grana: 7, macchie: 3, celle: [5, 11], fibre: 260, graffi: 120 },
  ombraPosata: { alpha: 0.16 },
  pannello: { raggio: 22, ombraY: 7, alphaOmbra: 0.2 },
  font: {
    // Comic Neue (OFL, in public/fonts/) è la versione libera del Comic Sans che usa la suite.
    // Il giapponese per ora usa i font rotondi del sistema; quello definitivo arriva dal passo 12.
    nome: 'Comic Neue',
    famiglia: '"Comic Neue", "Hiragino Maru Gothic ProN", "Yu Gothic UI", "Meiryo", "Noto Sans JP", sans-serif',
    file: [
      { peso: '400', url: 'fonts/comic-neue-latin-400-normal.woff2' },
      { peso: '700', url: 'fonts/comic-neue-latin-700-normal.woff2' },
    ],
  },
};

// I test avanzano il tempo a passi fissi di un sessantesimo di secondo.
export const FRAME_MS = 1000 / 60;

export const SERATA = {
  durationSec: 120,
  // Incasso rispetto all'obiettivo per avere ★, ★★, ★★★.
  starThresholds: [1, 1.3, 1.6],
};

export const PAZIENZA = {
  hearts: 5,
  durationSec: 25,
  // Mancia massima, a Pazienza piena, come frazione del prezzo.
  maxManciaRatio: 0.5,
};

export const FUMO_SEC = 3;
export const CHE_STILE_BONUS = 0.2;

// I Piatti stanno nell'ordine in cui si sbloccano (GAME_SPEC.md): le Postazioni sullo schermo li seguono.
// cookSec: tempo di cottura. burnAfterSec: secondi in più prima che si bruci (null = mai).
// ricetta: la cucina a tocchi (ticket 33). Al posto della cottura, gli Ingredienti si toccano nell'ordine
// della ricetta e ognuno si paga quando lo si usa (GAME_SPEC.md, "Ingredienti e Spreco"): la sequenza
// di questa lista è la ricetta del Ricettario. Il costo del Piatto è la somma, circa un terzo del prezzo.
export const PIATTI = {
  onigiri: {
    ricetta: [{ ingrediente: 'riso', costo: 20 }, { ingrediente: 'alga', costo: 10 }],
    price: 100,
    varianti: [],
  },
  takoyaki: { cookSec: 5, burnAfterSec: 4, price: 300, varianti: [] },
  kakigori: { cookSec: 2, burnAfterSec: null, price: 250, varianti: ['fragola', 'melone', 'matcha'] },
  taiyaki: { cookSec: 8, burnAfterSec: 4, price: 200, varianti: ['fagioli', 'crema'] },
  ramen: { cookSec: 6, burnAfterSec: 5, price: 600, varianti: ['uovo', 'naruto'] },
};

// Lo Yatai in verticale (src/layout/yatai.js). Le misure sono in pixel di gioco (VIEW): i valori
// di partenza si regolano qui e il resto si ricalcola.
export const YATAI = {
  // Il margine ai lati e in fondo, oltre all'area sicura del telefono.
  margine: 24,
  // Le fasce dall'alto in basso. `min` è l'altezza minima; se lo schermo è più alto, l'avanzo si
  // divide tra le fasce in proporzione a `flex` (0 = non cresce). La fascia `hud` per ora è vuota:
  // ci andranno l'Incasso, il tempo e le stelle (passo 3).
  fasce: [
    { nome: 'hud', min: 96, flex: 0 },
    { nome: 'clienti', min: 320, flex: 1.2 },
    { nome: 'bancone', min: 200, flex: 0 },
    { nome: 'cucina', min: 320, flex: 1 },
    { nome: 'postazioni', min: 200, flex: 0.5 },
  ],
  // I Posti: 3 all'inizio, 4 con il Potenziamento. Lo spazio c'è già per tutti e 4.
  posti: { iniziali: 3, massimo: 4, larghezzaMax: 190 },
  // Le Postazioni: una per Piatto, in fila vicino al pollice. `altezzaEtichetta` è lo spazio per il nome;
  // `barraDallaCima` e `piattoDallaCima` dicono a che altezza dalla cima del disegno stanno la barra della
  // cottura e il Piatto pronto (la base dell'icona), in pixel del disegno.
  postazioni: { massimo: 5, larghezzaMax: 140, spazio: 6, altezzaEtichetta: 40, barraDallaCima: 50, piattoDallaCima: 80 },
  // Quanti Piatti pronti stanno in fila sul Bancone (GAME_SPEC.md non lo dice: valore di partenza).
  // `superficie` è la parte alta del Bancone, il piano su cui si appoggiano i Piatti: 0,66 di 200 px
  // è l'altezza del piano nel disegno (BANCONE_PIANO), per questo la fascia del Bancone non cresce.
  bancone: { capacita: 5, larghezzaMax: 150, superficie: 0.66 },
  // Maurizio sta al centro della fascia `cucina`, senza ingrandirsi oltre il disegno.
  maurizio: { scalaMax: 0.85, riempimento: 0.95 },
  // Il Cliente al suo Posto (placeCliente in src/layout/yatai.js). Dall'alto in basso dentro la fascia
  // del Posto: la nuvoletta con l'Ordine, i cuoricini della Pazienza, il Cliente seduto sullo sgabello.
  //   sedutoDalFondo: quanto sta in alto il punto dove poggiano i piedi, dal fondo della fascia (lo
  //                   sgabello è alto 100 px e il cuscino è a 35 px dal suo bordo alto)
  //   nuvoletta: altezza come frazione della fascia, mai sotto `min`, larghezza al massimo `larghezzaMax`
  //   cuori: misura di ogni cuoricino; `spazio` tra uno e l'altro
  //   vuoto: aria tra un pezzo e l'altro
  cliente: {
    sedutoDalFondo: 68,
    nuvoletta: { altezza: 0.24, min: 64, larghezzaMax: 176 },
    cuori: { lato: 30, spazio: 2 },
    vuoto: 6,
  },
  // La fascia in alto durante la Serata: l'Incasso e il tempo sopra, la barra delle stelle sotto.
  hud: { rigaAlta: 52, barra: 20, stella: 34, moneta: 40 },
};

// Maurizio si anima a ogni azione (le azioni sono istantanee, questa è solo scena): un saltino
// con schiacciamento e una posa che poi torna a riposo. I tempi sono in millisecondi.
export const MAURIZIO = {
  // Il respiro quando non fa niente.
  respiro: { ampiezza: 0.014, durata: 2400 },
  // posa: quale disegno di Maurizio durante l'azione; salto: di quanti pixel sale; schiaccia: di
  // quanto si allunga e si schiaccia; durata: l'andata (il ritorno dura uguale); tienePosa: quanto
  // resta nella posa prima di tornare a riposo.
  azioni: {
    cuoci: { posa: 'lavora', salto: 12, schiaccia: 0.05, durata: 120, tienePosa: 320 },
    raccogli: { posa: 'lavora', salto: 16, schiaccia: 0.06, durata: 130, tienePosa: 360 },
    servi: { posa: 'evviva', salto: 30, schiaccia: 0.09, durata: 170, tienePosa: 560 },
  },
};

// --- La logica della Serata (src/serata/Serata.js) ---

// Il motore avanza a passi fissi: lo stesso seme e le stesse azioni danno sempre la stessa Serata,
// qualunque sia la durata dei singoli update().
export const SERATA_MOTORE = {
  passoMs: 10,
};

// Quanto vale la prima Serata (onigiri). L'obiettivo è l'Incasso netto (Vendite meno Spesa) in Yen; con
// le soglie di SERATA diventa 1920 per ★, 2496 per ★★, 3072 per ★★★. Dal passo 8 ogni Serata avrà il suo.
// Ogni onigiri sono 3 tocchi e 30 Yen di Spesa. Con l'arrivo dei Clienti ogni 2,5-4,5 s, un tocco ogni
// 1,4 s (lento) fa circa 1965 Yen netti, ogni 1,0 s (attento) circa 3020, ogni 0,6 s (rapido) circa 4050
// (media di 12 Serate, ticket 33): provvisorio fino al ticket 29.
export const SERATA_PRIMA = {
  obiettivo: 1920,
  piatti: ['onigiri'],
  // Quanti Piatti ha un Ordine (da uno a tre; nell'Hanami è sempre uno).
  piattiPerOrdine: { min: 1, max: 1 },
};

// --- La scena della Serata (src/scenes/SerataScene.js): comandi e riscontri ---
// I tempi sono in millisecondi, le distanze in pixel di gioco.

export const COMANDI = {
  // I tasti rapidi (GAME_SPEC.md, "Comandi e accessibilità"): 1–5 per le Postazioni, Q/W/E/R per i
  // Posti. Sono codici fisici (KeyboardEvent.code): restano nello stesso punto su ogni tastiera.
  postazioni: ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'],
  posti: ['KeyQ', 'KeyW', 'KeyE', 'KeyR'],
  // Anche il tastierino numerico fa le Postazioni.
  postazioniTastierino: ['Numpad1', 'Numpad2', 'Numpad3', 'Numpad4', 'Numpad5'],
  rigioca: ['Enter', 'Space'],
  // Un tocco sulla Postazione un attimo prima che il Piatto sia pronto non va perso: se manca
  // meno di così, il tocco si ricorda e scatta appena il Piatto è pronto.
  anticipoMs: 250,
};

export const RISCONTRI = {
  // Un frame lungo (scheda in secondo piano, telefono lento) non fa saltare mezza Serata: la
  // scena non fa avanzare la logica di più di così per frame.
  dtMaxMs: 250,
  // Il Cliente arriva con un saltino, e se ne va in meno di POSTI.ricambioSec: il Posto resta
  // libero abbastanza a lungo da vedere l'uscita (un test lo controlla).
  arrivo: { durata: 340 },
  uscita: { servito: 620, imbronciato: 760, spostamento: 90 },
  // La testa che scuote: `volte` andata e ritorno di `angolo` gradi, ognuno di `durata`.
  scuoteTesta: { angolo: 9, durata: 70, volte: 3 },
  // Il Piatto che vola dal Bancone al Cliente e dalla Postazione al Bancone.
  piatto: { vola: 230 },
  // Le monete volano dal Cliente all'Incasso: una ogni `scaglione` Yen, da 1 a `max`.
  monete: { durata: 560, scaglione: 50, max: 6, ritardo: 70 },
  // I cuoricini della Mancia: tanti quanti i cuoricini di Pazienza rimasti.
  mancia: { durata: 900, salita: 90 },
  // La scritta "+150" che sale dal Cliente.
  somma: { durata: 950, salita: 80 },
  // Il Piatto pronto sulla Postazione, che ondeggia perché lo si tocchi.
  pronto: { durata: 420, ampiezza: 8 },
  // L'ultimo cuoricino lampeggia: manca poco.
  ultimoCuore: { durata: 260 },
  // Il "−20" piccolo che scende sotto l'Incasso a ogni Ingrediente (la Spesa).
  spesa: { durata: 750, discesa: 34 },
  // La ricetta sul tagliere: un'icona per Ingrediente, piccola (frazione del disegno della Postazione),
  // `spazio` pixel dell'una dall'altra e `altezza` pixel dalla cima del disegno alla base dell'icona
  // (misure del disegno, non dello schermo). Spenta (`passoSpento`) finché l'Ingrediente non è nel Piatto.
  passo: { scala: 0.42, spazio: 62, altezza: 66 },
  passoSpento: 0.28,
  // L'alone giallo dietro la Scorta che aspetta il Piatto (il prossimo Ingrediente): `durata` del
  // respiro, misure come frazione della larghezza della Scorta, `dallaCima` in pixel del disegno.
  evidenzia: { durata: 520, larghezza: 1.05, altezza: 0.85, dallaCima: 100 },
  // L'Ingrediente che vola dalla Scorta al tagliere.
  ingrediente: { vola: 200 },
  // I secondi finali, in cui il tempo diventa rosso.
  tempoRosso: 10,
  // La schermata di fine Serata arriva dopo che le monete sono arrivate; poi le stelle una a una.
  fine: { ritardo: 1200, stella: 420, conta: 900 },
};

export const POSTI = {
  quanti: 3,
  // Dopo che un Cliente se n'è andato il Posto resta libero per un attimo, così la scena ha il tempo
  // di mostrare la partenza prima che ne arrivi un altro.
  ricambioSec: 1,
};

export const CLIENTI = {
  // Il primo Cliente arriva presto, i successivi ogni tanto. Se i Posti sono pieni il prossimo
  // aspetta che se ne liberi uno.
  // Ogni 2,5-4,5 s (era 5-9 s dopo la prima prova, ticket 05): con i Clienti più lenti di chi
  // cucina, l'Incasso non dipendeva dalla bravura del giocatore ma solo da quanti ne arrivavano.
  primoArrivoSec: 1.5,
  arrivoSec: { min: 2.5, max: 4.5 },
  // I Clienti di passaggio: nessun Vizio.
  passaggio: ['tanuki', 'kitsune', 'maneki-neko'],
};

export const BANCONE = {
  // Quanti Piatti pronti stanno sul Bancone. Se è pieno, il Piatto resta sulla Postazione. Sono
  // quanti ne mostra lo schermo (YATAI.bancone.capacita): un numero solo, così la logica e il
  // disegno non possono più discordare.
  capienza: YATAI.bancone.capacita,
};

// Le Postazioni: l'id è quello che si tocca; piatto è il Piatto che preparano.
export const POSTAZIONI = {
  tagliere: { piatto: 'onigiri' },
};

// Le Scorte (GLOSSARY.md) non hanno numeri propri: sono una per Ingrediente di ogni ricetta (PIATTI),
// nell'ordine della ricetta, a sinistra delle Postazioni, così riso, alga, tagliere si leggono come la
// sequenza. L'id di una Scorta è il nome dell'Ingrediente.

// --- I temi dei Matsuri (src/disegni/sfondi/, src/layout/sfondo.js) ---

// I colori di ogni Matsuri, per ruolo. Ogni colore ha la sua ombra e la sua luce, come in PALETTE.
// Cambiano solo lo sfondo, il pavimento, la tendina del Bancone e i cuscini dei Posti: le
// Postazioni, i Piatti e Maurizio hanno sempre i loro colori, e devono staccarsi da ogni tema.
//   cielo        dal basso (luce, vicino all'orizzonte) all'alto (ombra)
//   lontananza   le sagome lontane sull'orizzonte: colline, castello, bancarelle, santuario
//   terra        il suolo dietro i Posti (prato, riva del fiume, neve): poco contrasto
//   pavimento    il legno dello Yatai
//   tendina      le due strisce davanti al Bancone
//   cuscino      il cuscino dei Posti
//   accento      il colore dei particolari (petali, lanterne, foglie...)
//   carta        il tono con cui si colora la carta sotto a tutto (bianco = carta com'è)
const colore = (c, o, l) => ({ colore: c, ombra: o, luce: l });

export const TEMI = {
  // Primavera, giorno: azzurro pallido, rosa ciliegio, bianco e verde tenero.
  hanami: {
    cielo: colore('#b9e1f4', '#8cc6ea', '#e9f6fb'),
    lontananza: colore('#d9e2ec', '#b3c3d6', '#f1f5f9'),
    terra: colore('#bfe6a4', '#93c97b', '#e2f6cb'),
    pavimento: colore('#f0d2b0', '#cfa57d', '#fbe9d6'),
    tendina: [colore('#f7a8c4', '#d9708f', '#fde0ea'), colore('#fffdf8', '#cdbfa9', '#ffffff')],
    cuscino: colore('#f7a8c4', '#d9708f', '#fde0ea'),
    accento: colore('#f9c4d6', '#e58db1', '#fde9f0'),
    carta: '#ffffff',
  },
  // Inizio estate, crepuscolo: indaco e blu notte morbido, con le stelle gialle.
  tanabata: {
    cielo: colore('#4b4fa0', '#2c2f72', '#a99ad8'),
    lontananza: colore('#4a4a96', '#383a80', '#6e6bb4'),
    terra: colore('#3d4a8f', '#2c386f', '#5a6aae'),
    pavimento: colore('#dfc3ae', '#bc9a83', '#f1e1d3'),
    tendina: [colore('#7fa6ee', '#5278c8', '#bcd2f8'), colore('#fbefc0', '#d9c37c', '#fff9e0')],
    cuscino: colore('#b3a2ea', '#8a76cc', '#dcd2f7'),
    accento: colore('#fbe28a', '#e0b94e', '#fff3c4'),
    carta: '#b8bde8',
  },
  // Piena estate, notte: blu e viola, il fiume e i fuochi in pastelli vari.
  hanabi: {
    cielo: colore('#2c2a6e', '#1a1c4b', '#5a3f91'),
    lontananza: colore('#3b2f78', '#2a2260', '#5a4a9a'),
    terra: colore('#2e3f86', '#1f2c68', '#4d63b0'),
    pavimento: colore('#dcb396', '#c39c84', '#f0d6c2'),
    tendina: [colore('#a897e8', '#7f6dc8', '#d3c9f6'), colore('#f7b9d8', '#d980ab', '#fcdfee')],
    cuscino: colore('#8fb6f0', '#5f86c8', '#c6daf9'),
    accento: colore('#f7d26a', '#d1a33a', '#fdedb8'),
    carta: '#9aa0d8',
  },
  // Autunno, tramonto: ocra, arancio, rosso mattone e verde bosco.
  aki: {
    cielo: colore('#f5b27b', '#e2825a', '#fce1a8'),
    lontananza: colore('#9fb08a', '#7f9770', '#c4d1ac'),
    terra: colore('#b9c07c', '#98a25c', '#d9deac'),
    pavimento: colore('#e8c08a', '#c99a5f', '#f6dcb4'),
    tendina: [colore('#e4875e', '#c0603c', '#f2b496'), colore('#f5dcae', '#d1b27a', '#fdf0d4')],
    cuscino: colore('#e4875e', '#c0603c', '#f2b496'),
    accento: colore('#d9593f', '#a93a28', '#ee8f78'),
    carta: '#fff0d8',
  },
  // Inverno, sera: azzurro ghiaccio, bianco e blu profondo, con i lampioni caldi.
  yuki: {
    cielo: colore('#5b7cc0', '#33498f', '#b8d4f2'),
    lontananza: colore('#d6e4f5', '#aac2e2', '#f2f8ff'),
    terra: colore('#cfe0f3', '#a2bde0', '#f4f9ff'),
    pavimento: colore('#e6cfb4', '#bda486', '#f5e8d6'),
    tendina: [colore('#5e8fd6', '#3d68b0', '#a5c3ee'), colore('#fffdf8', '#cdbfa9', '#ffffff')],
    cuscino: colore('#8fb8ea', '#5f8ac4', '#c8dcf6'),
    accento: colore('#f9c66a', '#d99a3a', '#fde6a8'),
    carta: '#dfe9fb',
  },
};

// I ruoli che ogni tema deve avere (un test lo controlla). `tendina` ne ha due, `carta` è un solo colore.
export const RUOLI_TEMA = ['cielo', 'lontananza', 'terra', 'pavimento', 'tendina', 'cuscino', 'accento', 'carta'];
export const MATSURI = Object.keys(TEMI);
export const MATSURI_PREDEFINITO = 'hanami';

// Il nome di ogni Postazione sotto il Bancone: testo scuro con il bordo chiaro, su ogni tema.
export const ETICHETTA = { testo: PALETTE.inchiostro, contorno: PALETTE.bianco };

// Come lo sfondo si ancora al layout dello Yatai (src/layout/sfondo.js). Le misure sono in pixel di
// gioco. Lo sfondo ha quattro pezzi, tutti disegnati più grandi del necessario e ancorati così:
//   cielo   sta sopra l'orizzonte (l'estremità in alto sparisce fuori schermo);
//   terra   scende dall'orizzonte fino dietro il pavimento;
//   alto    appeso al bordo in alto dello schermo (rami, lanterne, festoni);
//   lati    due colonne ai bordi, poggiate dietro il Bancone (alberi, bambù, lampioni).
export const SFONDO = {
  // L'orizzonte cade a questa quota della fascia `clienti` (0 in cima, 1 in fondo).
  orizzonte: 0.5,
  // Il pavimento comincia questi pixel sotto la cima del Bancone (dove inizia la tendina).
  attaccoPavimento: 120,
  // Le texture: `sotto` è quanto scende oltre l'orizzonte, nascosto dalla terra.
  cielo: { h: 560, sotto: 48 },
  terra: { h: 480 },
  alto: { h: 260 },
  lato: { w: 190, h: 920, sotto: 44 },
};
