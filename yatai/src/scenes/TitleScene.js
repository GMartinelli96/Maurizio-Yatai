import Phaser from 'phaser';
import { VIEW } from '../config.js';
import { t } from '../i18n.js';

// La schermata iniziale. Per ora è vuota: solo il titolo e il credito, nella lingua scelta.
export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  create() {
    const cx = VIEW.width / 2;
    const ink = '#4a3b33';
    const font = 'system-ui, sans-serif';

    this.add.text(cx, 520, 'Maurizio Yatai', { fontFamily: font, fontSize: '72px', color: ink })
      .setOrigin(0.5);
    this.add.text(cx, 610, t('subtitle'), { fontFamily: font, fontSize: '36px', color: ink })
      .setOrigin(0.5);
    this.add.text(cx, VIEW.height - 80, t('developedBy'), { fontFamily: font, fontSize: '24px', color: ink })
      .setOrigin(0.5);
  }

  getTextState() {
    return { subtitle: t('subtitle') };
  }
}
