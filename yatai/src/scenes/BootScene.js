import Phaser from 'phaser';
import { loadFonts } from '../kit/font.js';
import { generateTextures } from '../kit/texture.js';

// L'avvio: disegna tutte le immagini del gioco con il kit a matita, aspetta il font scritto a
// mano e passa alla prima schermata. In sviluppo, con ?sviluppo nell'indirizzo, apre la scena
// di sviluppo (le tavole di prova).
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('avvio');
  }

  create() {
    generateTextures(this);
    const dev = import.meta.env.DEV && new URLSearchParams(window.location.search).has('sviluppo');
    loadFonts().then(() => this.scene.start(dev ? 'sviluppo' : 'title'));
  }
}
