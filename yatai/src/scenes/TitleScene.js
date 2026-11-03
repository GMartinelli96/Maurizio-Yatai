import Phaser from 'phaser';
import { VIEW } from '../config.js';
import { t } from '../i18n.js';
import { textStyle } from '../kit/font.js';

// La schermata iniziale. Per ora è vuota: solo il titolo e il credito, nella lingua scelta,
// sulla carta del kit a matita.
export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  create() {
    const cx = VIEW.width / 2;
    this.add.tileSprite(0, 0, VIEW.width, VIEW.height, 'carta').setOrigin(0);
    this.add.text(cx, 520, 'Maurizio Yatai', textStyle(72, { bold: true, outline: 10 })).setOrigin(0.5);
    this.add.text(cx, 610, t('subtitle'), textStyle(36, { bold: true })).setOrigin(0.5);
    this.add.text(cx, VIEW.height - 80, t('developedBy'), textStyle(24)).setOrigin(0.5);
  }

  getTextState() {
    return { subtitle: t('subtitle') };
  }
}
