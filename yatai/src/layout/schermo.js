// Dallo schermo del dispositivo all'immagine di gioco. Funzioni pure: niente Phaser, niente DOM,
// così ogni calcolo si prova con un test.
//
// Le misure dello schermo sono in pixel CSS ("view"); quelle del gioco in pixel di gioco ("frame").
// Il gioco è largo sempre VIEW.width (720). L'altezza segue lo schermo:
//   - telefono 9:16 → 1280;
//   - telefono più lungo (390×844) → più alta, fino a SCHERMO.maxHeight, e lo Yatai si allarga;
//   - computer → 1280, e Phaser la adatta in una colonna 9:16 centrata con Scale.FIT.

import { SCHERMO, VIEW } from '../config.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// La misura dell'immagine di gioco per uno schermo largo viewW e alto viewH.
export function frameFor(viewW, viewH) {
  if (!(viewW > 0) || !(viewH > 0)) return { width: VIEW.width, height: VIEW.height };
  const height = clamp(Math.round((VIEW.width * viewH) / viewW), SCHERMO.minHeight, SCHERMO.maxHeight);
  return { width: VIEW.width, height };
}

// Dove cade il gioco sullo schermo con Scale.FIT: un rettangolo centrato, in pixel CSS.
// scale = pixel CSS per ogni pixel di gioco.
export function canvasRect(view, frame) {
  const scale = Math.min(view.w / frame.width, view.h / frame.height);
  const w = frame.width * scale;
  const h = frame.height * scale;
  return { x: (view.w - w) / 2, y: (view.h - h) / 2, w, h, scale };
}

// Quanto dello schermo "non sicuro" (notch, angoli tondi, barra di navigazione) entra nel gioco.
// insets: i margini sicuri del dispositivo in pixel CSS ({ top, right, bottom, left }), come
// li dà env(safe-area-inset-*). Il risultato è in pixel di gioco. Su computer la colonna sta
// lontana dai bordi dello schermo, quindi quasi sempre il risultato è zero.
export function safeInFrame(view, frame, insets) {
  const canvas = canvasRect(view, frame);
  const toGame = (css) => Math.max(0, css) / canvas.scale;
  return {
    top: toGame(insets.top - canvas.y),
    left: toGame(insets.left - canvas.x),
    right: toGame(insets.right - (view.w - canvas.x - canvas.w)),
    bottom: toGame(insets.bottom - (view.h - canvas.y - canvas.h)),
  };
}

export const NO_INSETS = Object.freeze({ top: 0, right: 0, bottom: 0, left: 0 });
