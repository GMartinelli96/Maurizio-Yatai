import Phaser from 'phaser';
import { PALETTE, STILE, VIEW } from '../config.js';
import { MAURIZIO_FEET, MAURIZIO_SIZE } from '../disegni/maurizio.js';
import { fontsReady, textStyle } from '../kit/font.js';
import { ellipse, pastelFill, pencilLine } from '../kit/matita.js';
import { ensureTexture, panelTexture, textureFingerprint } from '../kit/texture.js';
import { addButton } from '../kit/ui.js';

// La tavola di prova del kit a matita (passo 1 di PIANO.md): il bersaglio visivo da approvare
// prima di disegnare il resto della famiglia. Mette insieme un personaggio (Maurizio), un Piatto
// alle due misure del gioco (sul Bancone e come icona dell'Ordine), la tavolozza con i ruoli,
// i pulsanti e il font, tutto sulla carta ruvida e alla dimensione reale del gioco.
// Si apre dalla scena di sviluppo; i testi non si traducono.

const SWATCHES = ['pelo', 'muso', 'salopette', 'bordino', 'orecchioDentro', 'riso', 'nori', 'rosa', 'menta', 'giallo'];
const SWATCH_LABELS = { orecchioDentro: 'orecchio' };

// Le lettere da controllare nel font scritto a mano: quelle che mancano ripiegano su un altro font.
const GLYPHS = ['à', 'è', 'ù', '¥', 'ō', '★', 'お'];

export default class TavolaScene extends Phaser.Scene {
  constructor() {
    super('tavola');
  }

  create() {
    const W = VIEW.width;
    this.add.tileSprite(0, 0, W, VIEW.height, 'carta').setOrigin(0);

    const back = this.add.text(26, 24, '‹ sviluppo', textStyle(26, { bold: true }));
    back.setInteractive({ useHandCursor: true }).on('pointerup', () => this.scene.start('sviluppo'));

    this.add.text(W / 2, 86, 'Tavola di prova', textStyle(54, { bold: true, outline: 8 })).setOrigin(0.5);
    this.add.text(W / 2, 142, 'il kit di disegno a matita', textStyle(28)).setOrigin(0.5);

    // Maurizio in piedi sulla sua ombra.
    const left = 220 - MAURIZIO_SIZE.w / 2;
    const top = 176;
    this.add.image(left + MAURIZIO_FEET.x, top + MAURIZIO_FEET.y, 'ombra').setScale(0.95, 1);
    this.add.image(left, top, 'maurizio').setOrigin(0);
    this.label(220, top + MAURIZIO_SIZE.h + 20, 'Maurizio');

    // L'onigiri: come icona dentro un pannello bianco, e alla misura del Bancone.
    this.add.image(560, 268, panelTexture(this, 150, 124, 'nuvola'));
    this.add.image(560, 262, 'onigiri-icona');
    this.label(560, 356, "icona dell'Ordine", 22);
    this.add.image(560, 556, 'ombra').setScale(0.72, 0.9);
    this.add.image(560, 486, 'onigiri');
    this.label(560, 604, 'onigiri · おにぎり');

    // La tavolozza, con il nome del ruolo di ogni colore.
    SWATCHES.forEach((name, i) => {
      const x = 88 + (i % 5) * 136;
      const y = 724 + Math.floor(i / 5) * 118;
      this.add.image(x, y, this.swatchTexture(name));
      this.label(x, y + 50, SWATCH_LABELS[name] ?? name, 20);
    });

    // I pulsanti, come quelli di FarmPlush e di Nella.
    addButton(this, W / 2, 978, 320, 100, 'Gioca!', 'rosa');
    addButton(this, 196, 1094, 272, 76, 'Ricettario', 'menta');
    addButton(this, 524, 1094, 272, 76, 'Condividi', 'giallo');

    // Il font: alfabeto latino con gli accenti, i simboli del gioco e il giapponese di ripiego.
    this.add.text(W / 2, 1170, 'Maurizio Yatai · La bancarella del Matsuri', textStyle(29, { bold: true })).setOrigin(0.5);
    this.add.text(W / 2, 1212, 'Kakigōri · 12.500 ¥ · àèéìòù · ★★★', textStyle(26)).setOrigin(0.5);
    this.add.text(W / 2, 1250, 'マウリツィオの屋台 · おにぎり · かき氷', textStyle(26)).setOrigin(0.5);
  }

  label(x, y, text, size = 26) {
    return this.add.text(x, y, text, textStyle(size, { bold: true, outline: 6 })).setOrigin(0.5);
  }

  swatchTexture(name) {
    return ensureTexture(this, `campione-${name}`, {
      w: 76,
      h: 76,
      draw: (ctx, rng) => {
        const disc = ellipse(38, 38, 29, 29);
        pastelFill(ctx, disc, rng, PALETTE[name]);
        pencilLine(ctx, disc, rng);
      },
    });
  }

  getTextState() {
    const keys = ['carta', 'ombra', 'maurizio', 'onigiri', 'onigiri-icona'];
    return {
      textures: Object.fromEntries(keys.map((key) => [key, textureFingerprint(this, key)])),
      font: { ready: fontsReady(), covers: coverage(GLYPHS) },
    };
  }
}

// Quali lettere disegna davvero il font scritto a mano: se una manca, il browser la prende da
// un font di sistema e la larghezza è la stessa che senza il font scritto a mano.
// (ō c'è: Chrome lo compone da o e dal macron, che il font ha.)
function coverage(glyphs) {
  const ctx = document.createElement('canvas').getContext('2d');
  const width = (glyph, font) => {
    ctx.font = `40px ${font}`;
    return ctx.measureText(glyph).width;
  };
  return Object.fromEntries(glyphs.map((g) => [g, width(g, `"${STILE.font.nome}", sans-serif`) !== width(g, 'sans-serif')]));
}
