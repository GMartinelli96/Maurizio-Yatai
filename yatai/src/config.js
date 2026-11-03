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
export const PIATTI = {
  onigiri: { cookSec: 1, burnAfterSec: null, price: 100, varianti: [] },
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
  // Le Postazioni: una per Piatto, in fila vicino al pollice. `altezzaEtichetta` è lo spazio per il nome.
  postazioni: { massimo: 5, larghezzaMax: 140, spazio: 6, altezzaEtichetta: 40 },
  // Quanti Piatti pronti stanno in fila sul Bancone (GAME_SPEC.md non lo dice: valore di partenza).
  // `superficie` è la parte alta del Bancone, il piano su cui si appoggiano i Piatti: 0,66 di 200 px
  // è l'altezza del piano nel disegno (BANCONE_PIANO), per questo la fascia del Bancone non cresce.
  bancone: { capacita: 5, larghezzaMax: 150, superficie: 0.66 },
  // Maurizio sta al centro della fascia `cucina`, senza ingrandirsi oltre il disegno.
  maurizio: { scalaMax: 0.85, riempimento: 0.95 },
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

// Quanto vale la prima Serata (onigiri). L'obiettivo di Incasso è in Yen; con le soglie di SERATA
// diventa 1200 per ★, 1560 per ★★, 1920 per ★★★. Dal passo 8 ogni Serata avrà il suo obiettivo.
export const SERATA_PRIMA = {
  obiettivo: 1200,
  piatti: ['onigiri'],
  // Quanti Piatti ha un Ordine (da uno a tre; nell'Hanami è sempre uno).
  piattiPerOrdine: { min: 1, max: 1 },
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
  primoArrivoSec: 1.5,
  arrivoSec: { min: 5, max: 9 },
  // I Clienti di passaggio: nessun Vizio.
  passaggio: ['tanuki', 'kitsune', 'manekineko'],
};

export const BANCONE = {
  // Quanti Piatti pronti stanno sul Bancone. Se è pieno, il Piatto resta sulla Postazione.
  capienza: 6,
};

// Le Postazioni: l'id è quello che si tocca; piatto è il Piatto che preparano.
export const POSTAZIONI = {
  tagliere: { piatto: 'onigiri' },
};
