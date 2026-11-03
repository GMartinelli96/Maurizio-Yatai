// Il lato "browser" dell'adattamento allo schermo. Tutti i calcoli stanno in src/layout/schermo.js
// (funzioni pure, con i loro test): qui si legge solo la finestra e si dice a Phaser quanto è alto
// il gioco.

import Phaser from 'phaser';
import { VIEW } from './config.js';
import { NO_INSETS, canvasRect, frameFor, safeInFrame } from './layout/schermo.js';

// I margini sicuri del dispositivo in pixel CSS (notch, angoli tondi, barra di navigazione).
// Si leggono da un elemento nascosto che li usa come padding (vedi style.css): niente stili in
// linea, che la CSP del sito blocca. In sviluppo, ?area=alto,destra,basso,sinistra li simula.
export function readInsets() {
  if (import.meta.env.DEV) {
    const forced = new URLSearchParams(window.location.search).get('area');
    if (forced) {
      const [top = 0, right = 0, bottom = 0, left = 0] = forced.split(',').map(Number);
      return { top, right, bottom, left };
    }
  }
  const probe = document.getElementById('area-sicura');
  if (!probe) return NO_INSETS;
  const style = getComputedStyle(probe);
  const px = (value) => Number.parseFloat(value) || 0;
  return { top: px(style.paddingTop), right: px(style.paddingRight), bottom: px(style.paddingBottom), left: px(style.paddingLeft) };
}

// La misura iniziale del gioco, per la configurazione di Phaser.
export function initialFrame() {
  return frameFor(window.innerWidth, window.innerHeight);
}

// Tiene l'altezza del gioco in linea con lo schermo: a ogni cambio di finestra (o rotazione)
// Phaser dice la nuova misura del contenitore e noi ricalcoliamo l'altezza. Le scene si
// riadattano ascoltando l'evento `resize` di this.scale.
export function installScreen(game) {
  const { scale } = game;
  const adapt = () => {
    const frame = frameFor(scale.parentSize.width, scale.parentSize.height);
    if (frame.height !== scale.gameSize.height || frame.width !== scale.gameSize.width) {
      scale.setGameSize(frame.width, frame.height);
    }
  };
  scale.on(Phaser.Scale.Events.RESIZE, adapt);
  adapt();
}

// Tutto quello che serve a una scena per impaginarsi, in pixel di gioco:
//   frame: la misura del gioco, view: la finestra (pixel CSS), canvas: dove cade il gioco sulla
//   finestra, safe: quanto del gioco è coperto da notch e barre.
export function screenOf(scene) {
  const frame = { width: scene.scale.width, height: scene.scale.height };
  const parent = scene.scale.parentSize;
  const view = { w: parent.width || VIEW.width, h: parent.height || VIEW.height };
  return { frame, view, canvas: canvasRect(view, frame), safe: safeInFrame(view, frame, readInsets()) };
}
