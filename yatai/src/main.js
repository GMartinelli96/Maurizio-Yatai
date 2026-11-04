import Phaser from 'phaser';
import { VIEW } from './config.js';
import { initLanguage } from './i18n.js';
import { initialFrame, installScreen } from './schermo.js';
import { installTestHooks } from './test-hooks.js';
import BootScene from './scenes/BootScene.js';
import TitleScene from './scenes/TitleScene.js';
import BottegaScene from './scenes/BottegaScene.js';
import SviluppoScene from './scenes/SviluppoScene.js';
import YataiScene from './scenes/YataiScene.js';
import SerataScene from './scenes/SerataScene.js';
import TavolaScene from './scenes/TavolaScene.js';
import ClientiScene from './scenes/ClientiScene.js';

initLanguage();

// La larghezza è sempre quella di VIEW; l'altezza segue lo schermo (src/layout/schermo.js) e
// installScreen la tiene aggiornata a ogni ridimensionamento.
const frame = initialFrame();

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: frame.width,
  height: frame.height,
  backgroundColor: VIEW.background,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  // Le scene di sviluppo non entrano nella versione pubblicata.
  scene: [BootScene, TitleScene, BottegaScene, SerataScene, ...(import.meta.env.DEV ? [YataiScene, SviluppoScene, TavolaScene, ClientiScene] : [])],
});

installScreen(game);
installTestHooks(game);

// Il service worker esiste solo nella versione pubblicata (dist/): in sviluppo darebbe file vecchi.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}
