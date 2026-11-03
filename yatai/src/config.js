// Tutti i numeri del gioco stanno qui. Sono i valori di partenza di GAME_SPEC.md:
// si regolano in questo file e in nessun altro.

export const VIEW = {
  // Formato verticale 9:16. Su computer Phaser lo adatta in una colonna centrata.
  width: 720,
  height: 1280,
  background: '#fff8ec',
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
