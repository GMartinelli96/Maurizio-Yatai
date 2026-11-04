import Phaser from 'phaser';
import { VIEW } from '../config.js';
import { CAST, CAST_SEGNI_POS, DISEGNI_CAST } from '../disegni/cast.js';
import { CLIENTE_FEET, CLIENTE_SIZE, ESPRESSIONI, clienteKey } from '../disegni/clienti.js';
import { POSTO_SIZE } from '../disegni/yatai.js';
import { textStyle } from '../kit/font.js';
import { ensureTexture, generateTheme, textureFingerprint } from '../kit/texture.js';
import { addPaper, centerDesign } from '../kit/ui.js';
import { fitIn, layoutYatai } from '../layout/yatai.js';
import { screenOf } from '../schermo.js';
import ClienteView from '../yatai/ClienteView.js';

// La tavola di prova del cast (ticket 09): si apre solo con `npm run dev`, da
//   ?sviluppo=cast                                       la tavola: i sette peluche nelle quattro espressioni
//   ?sviluppo=cast&vista=posti&persone=marcella,carlotta,balosso&cuori=5,2,1
//                                                        tre Posti a misura reale, con i cuoricini dati: si vede
//                                                        la faccia del Lamento con la goccia e lo sbuffo
// I testi non si traducono: non li vede nessun giocatore.

const SCALA = 0.4;
const RIGA = 158;
const TOP = 138;
const COLONNA_NOMI = 140;

const ESPRESSIONE_TESTO = { neutra: 'attesa', perplessa: 'perplessa', imbronciata: 'imbronciata', contenta: 'servito' };

export default class CastScene extends Phaser.Scene {
  constructor() {
    super('cast');
  }

  init() {
    const query = new URLSearchParams(window.location.search);
    this.vista = query.get('vista') === 'posti' ? 'posti' : 'tavola';
    const persone = (query.get('persone') ?? CAST.slice(0, 3).join(',')).split(',').filter((id) => CAST.includes(id));
    this.persone = persone.slice(0, 3);
    this.cuori = (query.get('cuori') ?? '5,2,1').split(',').map(Number);
    this.viste = [];
  }

  create() {
    const inizio = performance.now();
    for (const [key, entry] of Object.entries(DISEGNI_CAST)) ensureTexture(this, key, entry);
    // Quanto costa generare i 28 disegni del cast (cambia da un computer all'altro): serve a decidere se farlo all'avvio.
    this.generazione = { ms: Math.round(performance.now() - inizio), texture: Object.keys(DISEGNI_CAST).length };
    if (this.vista === 'posti') this.creaPosti();
    else this.creaTavola();
  }

  // --- La tavola ---

  creaTavola() {
    const W = VIEW.width;
    addPaper(this);
    centerDesign(this);
    const back = this.add.text(26, 24, '‹ sviluppo', textStyle(26, { bold: true }));
    back.setInteractive({ useHandCursor: true }).on('pointerup', () => this.scene.start('sviluppo'));
    this.add.text(W / 2, 70, 'Il cast', textStyle(46, { bold: true, outline: 8 })).setOrigin(0.5);

    const colonna = (W - COLONNA_NOMI) / ESPRESSIONI.length;
    ESPRESSIONI.forEach((espressione, col) => {
      this.add.text(COLONNA_NOMI + colonna * (col + 0.5), 112, ESPRESSIONE_TESTO[espressione], textStyle(22, { bold: true, outline: 5 })).setOrigin(0.5);
    });
    CAST.forEach((id, row) => {
      const top = TOP + row * RIGA;
      this.add.text(14, top + (CLIENTE_SIZE.h * SCALA) / 2, id, textStyle(24, { bold: true, outline: 5 })).setOrigin(0, 0.5);
      ESPRESSIONI.forEach((espressione, col) => {
        const x = COLONNA_NOMI + colonna * (col + 0.5);
        const piediY = top + CLIENTE_FEET.y * SCALA;
        this.add.image(x, piediY, 'ombra').setScale(0.4);
        this.add.image(x - CLIENTE_FEET.x * SCALA, top, clienteKey(id, espressione)).setOrigin(0).setScale(SCALA);
      });
    });
  }

  // --- I Posti a misura reale ---

  creaPosti() {
    this.generation = generateTheme(this, 'hanami');
    addPaper(this);
    this.posti = Array.from({ length: 3 }, () => this.add.image(0, 0, this.generation.chiavi.posto).setOrigin(0.5, 1));
    this.viste = this.persone.map((_, i) => new ClienteView(this, i));
    this.scale.on('resize', this.relayout, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.relayout, this);
      for (const vista of this.viste) vista.destroy();
    });
    this.relayout();
    this.viste.forEach((vista, i) => {
      vista.arriva({ id: i + 1, tipo: this.persone[i], ordine: ['onigiri'] });
      vista.impostaCuori(this.cuori[i] ?? 5, false);
    });
  }

  relayout() {
    const { frame, safe } = screenOf(this);
    const layout = layoutYatai({ frame, safe, seats: 3, stations: 3 });
    this.layout = layout;
    layout.posti.forEach((rect, i) => {
      const fit = fitIn({ ...rect, h: rect.h - 6 }, POSTO_SIZE.w, POSTO_SIZE.h);
      this.posti[i].setPosition(fit.x, fit.y).setScale(fit.scale);
      this.viste[i]?.place(rect);
    });
  }

  update() {
    for (const vista of this.viste) vista.segui();
  }

  getTextState() {
    return {
      vista: this.vista,
      persone: this.persone,
      cast: CAST,
      generazione: this.generazione,
      segni: CAST_SEGNI_POS,
      clienti: this.viste.map((vista) => vista.getTextState()),
      textures: Object.fromEntries(Object.keys(DISEGNI_CAST).map((key) => [key, textureFingerprint(this, key)])),
    };
  }
}
