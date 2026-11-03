import Phaser from 'phaser';
import { VIEW } from '../config.js';
import {
  CLIENTE_FEET, CLIENTE_SIZE, CLIENTI, DISEGNI_CLIENTI, ESPRESSIONI, clienteKey,
} from '../disegni/clienti.js';
import { textStyle } from '../kit/font.js';
import { ensureTexture, textureFingerprint } from '../kit/texture.js';

// La tavola di prova dei Clienti di passaggio (ticket 04): i tre peluche nelle quattro espressioni,
// tutti alla stessa misura e con la stessa ombra, come li metterà la scena dello Yatai ai Posti.
// Si apre con ?sviluppo=clienti (solo con `npm run dev`). I testi non si traducono.

// Quanto si ingrandisce il riquadro di un Cliente su un Posto (720 di larghezza fanno tre Posti).
const SCALA = 0.62;
const RIGA = 250;
const TOP = 180;

const ESPRESSIONE_TESTO = { neutra: 'in attesa', perplessa: 'perplesso', imbronciata: 'imbronciato', contenta: 'servito' };

export default class ClientiScene extends Phaser.Scene {
  constructor() {
    super('clienti');
  }

  create() {
    const W = VIEW.width;
    this.add.tileSprite(0, 0, W, VIEW.height, 'carta').setOrigin(0);

    const back = this.add.text(26, 24, '‹ sviluppo', textStyle(26, { bold: true }));
    back.setInteractive({ useHandCursor: true }).on('pointerup', () => this.scene.start('sviluppo'));
    this.add.text(W / 2, 86, 'Clienti di passaggio', textStyle(50, { bold: true, outline: 8 })).setOrigin(0.5);
    this.add.text(W / 2, 140, 'tanuki · kitsune · maneki-neko', textStyle(28)).setOrigin(0.5);

    ESPRESSIONI.forEach((espressione, row) => {
      CLIENTI.forEach((cliente, col) => {
        const key = this.texture(cliente, espressione);
        const x = (W / CLIENTI.length) * (col + 0.5);
        const top = TOP + row * RIGA;
        // I piedi stanno sempre nello stesso punto del riquadro, quindi anche l'ombra.
        const feetY = top + CLIENTE_FEET.y * SCALA;
        this.add.image(x, feetY, 'ombra').setScale(0.9, 0.9);
        this.add.image(x - (CLIENTE_FEET.x * SCALA), top, key).setOrigin(0).setScale(SCALA);
        this.add.text(x, top + CLIENTE_SIZE.h * SCALA + 12, `${cliente} · ${ESPRESSIONE_TESTO[espressione]}`, textStyle(19, { bold: true, outline: 6 })).setOrigin(0.5);
      });
    });
  }

  texture(cliente, espressione) {
    const key = clienteKey(cliente, espressione);
    return ensureTexture(this, key, DISEGNI_CLIENTI[key]);
  }

  getTextState() {
    const keys = Object.keys(DISEGNI_CLIENTI);
    return {
      size: CLIENTE_SIZE,
      textures: Object.fromEntries(keys.map((key) => [key, textureFingerprint(this, key)])),
    };
  }
}
