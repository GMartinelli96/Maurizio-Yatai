import Phaser from 'phaser';
import { VIEW } from './config.js';
import { initLanguage } from './i18n.js';
import { installTestHooks } from './test-hooks.js';
import BootScene from './scenes/BootScene.js';
import TitleScene from './scenes/TitleScene.js';
import SviluppoScene from './scenes/SviluppoScene.js';
import TavolaScene from './scenes/TavolaScene.js';

initLanguage();

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: VIEW.width,
  height: VIEW.height,
  backgroundColor: VIEW.background,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  // Le scene di sviluppo non entrano nella versione pubblicata.
  scene: [BootScene, TitleScene, ...(import.meta.env.DEV ? [SviluppoScene, TavolaScene] : [])],
});

installTestHooks(game);

// Il service worker esiste solo nella versione pubblicata (dist/): in sviluppo darebbe file vecchi.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}
