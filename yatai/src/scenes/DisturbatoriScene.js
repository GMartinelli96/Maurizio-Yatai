import { VIEW } from '../config.js';
import {
  BERSAGLIO_SIZE, CORVO_SIZE, CORVO_VOLO_SIZE, CROCCOLA_SIZE, DISEGNI_DISTURBATORI, FORMICA_SIZE, PIUMA_SIZE, ROVINATO_SIZE, SUONO_SIZE,
} from '../disegni/disturbatori.js';
import { textStyle } from '../kit/font.js';
import { ensureTexture, textureFingerprint } from '../kit/texture.js';
import { addPaper, centerDesign } from '../kit/ui.js';
import { center } from '../layout/yatai.js';
import YataiScene from './YataiScene.js';

// La tavola di prova dei Disturbatori (ticket 11, passo 2): si apre solo con `npm run dev`, da
//   ?sviluppo=disturbatori                  la tavola: tutti i disegni a colori
//   ?sviluppo=disturbatori&bn=1             la stessa tavola in bianco e nero (si riconoscono senza il colore?)
//   ?sviluppo=disturbatori&solo=croccola    un solo disegno, grande: per guardare i dettagli
//   ?sviluppo=disturbatori&vista=yatai&matsuri=aki
//                                           i disegni sul vero Yatai, a misura reale, dove li metterà la Serata
// I testi non si traducono: non li vede nessun giocatore.

const RIGHE = [
  { titolo: 'Croccola: punta, balzo, fusa, fuga', scala: 0.75, voci: ['croccola', 'croccola-balzo', 'croccola-fusa', 'croccola-fuga'], size: CROCCOLA_SIZE },
  { titolo: 'Corvo: posato, gracchia, ali su, ali giù', scala: 0.62, voci: ['corvo', 'corvo-gracchia', 'corvo-ali-su', 'corvo-ali-giu'], size: [CORVO_SIZE, CORVO_SIZE, CORVO_VOLO_SIZE, CORVO_VOLO_SIZE] },
  { titolo: 'Formiche, Piatto rovinato, suono, bersaglio, piuma', scala: 1, voci: ['formica-a', 'formica-b', 'piatto-rovinato', 'segno-suono', 'segno-bersaglio', 'piuma'], size: [FORMICA_SIZE, FORMICA_SIZE, ROVINATO_SIZE, SUONO_SIZE, BERSAGLIO_SIZE, PIUMA_SIZE] },
];

export default class DisturbatoriScene extends YataiScene {
  constructor() {
    super('disturbatori');
  }

  init() {
    const query = new URLSearchParams(window.location.search);
    this.vista = query.get('vista') === 'yatai' ? 'yatai' : 'tavola';
    this.bn = query.get('bn') === '1';
    this.solo = query.get('solo');
    super.init({ matsuri: query.get('matsuri') ?? 'aki', posti: 3, postazioni: 4, demo: true });
  }

  create() {
    for (const [key, entry] of Object.entries(DISEGNI_DISTURBATORI)) ensureTexture(this, key, entry);
    document.querySelector('canvas').style.filter = this.bn ? 'grayscale(1)' : '';
    this.events.once('shutdown', () => { document.querySelector('canvas').style.filter = ''; });
    if (this.vista === 'yatai') this.creaYatai();
    else this.creaTavola();
  }

  creaTavola() {
    const W = VIEW.width;
    addPaper(this);
    centerDesign(this);
    this.add.text(26, 24, '‹ sviluppo', textStyle(26, { bold: true })).setInteractive({ useHandCursor: true }).on('pointerup', () => this.scene.start('sviluppo'));
    this.add.text(W / 2, 70, 'I Disturbatori', textStyle(46, { bold: true, outline: 8 })).setOrigin(0.5);
    if (this.solo) {
      const entry = DISEGNI_DISTURBATORI[this.solo];
      const scala = Math.min(2.4, (W - 40) / entry.w, 1000 / entry.h);
      this.add.image(W / 2, 140, this.solo).setOrigin(0.5, 0).setScale(scala);
      return;
    }
    let y = 130;
    RIGHE.forEach((riga) => {
      this.add.text(20, y, riga.titolo, textStyle(22, { bold: true, outline: 5 }));
      y += 38;
      const sizes = Array.isArray(riga.size) ? riga.size : riga.voci.map(() => riga.size);
      const larghezze = sizes.map((s) => s.w * riga.scala);
      const spazio = (W - 40 - larghezze.reduce((a, b) => a + b, 0)) / (riga.voci.length - 1 || 1);
      const altezza = Math.max(...sizes.map((s) => s.h * riga.scala));
      let x = 20;
      riga.voci.forEach((key, i) => {
        // Sotto ogni disegno un'ombra, così si vede dove appoggia; i segni stanno su un fondo di carta e basta.
        this.add.image(x, y + altezza, key).setOrigin(0, 1).setScale(riga.scala);
        x += larghezze[i] + spazio;
      });
      y += altezza + 26;
    });
  }

  // I disegni sul vero Yatai, dove li metterà la Serata: Croccola davanti al suo Piatto, la fila di formiche sul
  // Bancone, il corvo sul bordo della tendina, a destra.
  creaYatai() {
    super.create();
    this.back?.destroy();
    const { layout } = this;
    const piatti = ['taiyaki-crema', 'kakigori-fragola', 'takoyaki'];
    piatti.forEach((piatto, i) => {
      const view = this.dishViews[i];
      view.image.setTexture(piatto).setVisible(true).setDepth(2);
      view.shadow.setVisible(true).setDepth(1);
    });
    const slot = (i) => layout.bancone.piatti[i];
    const base = (i) => slot(i).y + slot(i).h - 24;
    // Croccola: acquattata dietro al takoyaki, con le orecchie e gli occhi sopra il Piatto.
    this.add.image(center(slot(2)).x, base(2) + 2, 'croccola').setOrigin(0.5, 1).setScale(0.8).setDepth(1.5);
    // Il bersaglio: l'anello intorno al Piatto puntato.
    this.add.image(center(slot(2)).x, base(2) - 60, 'segno-bersaglio').setScale(0.82).setDepth(3).setAlpha(0.9);
    // Le formiche: una fila che arriva da sinistra verso il kakigōri.
    for (let k = 0; k < 6; k++) {
      this.add.image(center(slot(1)).x - 150 + k * 46, base(1) - 4 + (k % 2) * 4, k % 2 ? 'formica-b' : 'formica-a').setOrigin(0.5, 1).setScale(0.62).setDepth(3);
    }
    // Il corvo: posato sul bordo della tendina, a destra, con il segno del "kaa".
    const destra = slot(4);
    const x = center(destra).x + 14;
    const y = destra.y + destra.h + 8;
    this.add.image(x, y, 'corvo-gracchia').setOrigin(0.5, 1).setScale(0.5).setDepth(3);
    this.add.image(x - 62, y - 66, 'segno-suono').setOrigin(1, 0.5).setScale(0.55).setFlipX(true).setDepth(3);
  }

  getTextState() {
    const base = this.vista === 'yatai' ? super.getTextState() : {};
    return {
      ...base,
      vista: this.vista,
      bn: this.bn,
      textures: Object.fromEntries(Object.keys(DISEGNI_DISTURBATORI).map((key) => [key, textureFingerprint(this, key)])),
    };
  }
}
