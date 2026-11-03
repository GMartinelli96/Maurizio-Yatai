import Phaser from 'phaser';
import { VIEW } from '../config.js';
import { t } from '../i18n.js';
import { textStyle } from '../kit/font.js';
import { addButton, addPaper, centerDesign } from '../kit/ui.js';
import { azioneDaTasto } from '../serata/comandi.js';

// La schermata iniziale: il titolo, il credito e il pulsante per cominciare la Serata, nella
// lingua scelta, sulla carta del kit a matita. La mappa dei Matsuri arriva con il passo 8.
export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  init() {
    this.starting = false;
  }

  create() {
    const cx = VIEW.width / 2;
    addPaper(this);
    centerDesign(this);
    this.add.text(cx, 520, 'Maurizio Yatai', textStyle(72, { bold: true, outline: 10 })).setOrigin(0.5);
    this.add.text(cx, 610, t('subtitle'), textStyle(36, { bold: true })).setOrigin(0.5);
    this.add.text(cx, VIEW.height - 80, t('developedBy'), textStyle(24)).setOrigin(0.5);
    this.play = addButton(this, cx, 780, 420, 120, t('play'), 'menta', () => this.gioca());

    // Invio e Spazio fanno lo stesso del pulsante (stesse azioni della Serata, src/serata/comandi.js).
    this.input.keyboard.on('keydown', (event) => {
      if (!event.repeat && azioneDaTasto(event.code)?.tipo === 'rigioca') this.gioca();
    });
  }

  gioca() {
    if (this.starting) return;
    this.starting = true;
    this.scene.start('serata');
  }

  getTextState() {
    const { x, y, width, height } = this.play;
    // In coordinate di gioco: la scena è centrata in verticale, quindi y tiene conto della camera.
    return { subtitle: t('subtitle'), play: { x, y: y - this.cameras.main.scrollY, w: width, h: height } };
  }
}
