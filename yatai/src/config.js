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
};

export const VIEW = {
  // Formato verticale 9:16. Su computer Phaser lo adatta in una colonna centrata.
  width: 720,
  height: 1280,
  background: PALETTE.carta,
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

// cookSec: tempo di cottura. burnAfterSec: secondi in più prima che si bruci (null = mai).
export const PIATTI = {
  onigiri: { cookSec: 1, burnAfterSec: null, price: 100, varianti: [] },
  takoyaki: { cookSec: 5, burnAfterSec: 4, price: 300, varianti: [] },
  kakigori: { cookSec: 2, burnAfterSec: null, price: 250, varianti: ['fragola', 'melone', 'matcha'] },
  ramen: { cookSec: 6, burnAfterSec: 5, price: 600, varianti: ['uovo', 'naruto'] },
  taiyaki: { cookSec: 8, burnAfterSec: 4, price: 200, varianti: ['fagioli', 'crema'] },
};
