import Phaser from 'phaser';
import { VIEW } from '../config.js';
import { textStyle } from '../kit/font.js';
import { addButton, addPaper, centerDesign } from '../kit/ui.js';

// La scena di sviluppo: esiste solo con `npm run dev` e si apre con ?sviluppo nell'indirizzo.
// Raccoglie le tavole di prova dei vari passi di PIANO.md. I testi non si traducono: non li
// vede nessun giocatore.
const VOCI = [
  { label: 'Tavola di prova', scene: 'tavola', swatch: 'rosa' },
  { label: 'Lo Yatai', scene: 'yatai', swatch: 'giallo' },
  { label: 'Lo Yatai, 4 Posti', scene: 'yatai', data: { posti: 4 }, swatch: 'giallo' },
  { label: 'Clienti di passaggio', scene: 'clienti', swatch: 'giallo' },
  { label: 'Il gioco', scene: 'title', swatch: 'menta' },
];

export default class SviluppoScene extends Phaser.Scene {
  constructor() {
    super('sviluppo');
  }

  create() {
    const cx = VIEW.width / 2;
    addPaper(this);
    centerDesign(this);
    this.add.text(cx, 160, 'Sviluppo', textStyle(64, { bold: true, outline: 8 })).setOrigin(0.5);
    this.add.text(cx, 232, 'le tavole di prova del kit', textStyle(30)).setOrigin(0.5);

    this.buttons = VOCI.map((voce, i) => addButton(
      this, cx, 380 + i * 130, 420, 100, voce.label, voce.swatch, () => this.scene.start(voce.scene, voce.data),
    ));
  }

  getTextState() {
    return {
      // In coordinate di gioco: la scena è centrata in verticale, quindi y tiene conto della camera.
      buttons: this.buttons.map(({ label, x, y }) => ({ label, x, y: y - this.cameras.main.scrollY })),
    };
  }
}
