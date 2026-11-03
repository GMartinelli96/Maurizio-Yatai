import Phaser from 'phaser';
import { PIATTI, YATAI } from '../config.js';
import { DISEGNI } from '../disegni/catalogo.js';
import { MAURIZIO_SIZE } from '../disegni/maurizio.js';
import { POSTAZIONE_SIZE, postazioneKey } from '../disegni/postazioni.js';
import { POSTO_SIZE } from '../disegni/yatai.js';
import { t } from '../i18n.js';
import { textStyle } from '../kit/font.js';
import { textureFingerprint } from '../kit/texture.js';
import { addPaper } from '../kit/ui.js';
import { center, fitIn, layoutYatai, placeMaurizio } from '../layout/yatai.js';
import { screenOf } from '../schermo.js';
import MaurizioActor from '../yatai/MaurizioActor.js';

// Che azione di Maurizio accompagna ogni tocco. Il gioco (passo 3) deciderà da solo quale
// richiamare: per ora la scena si limita a far reagire Maurizio a quello che si tocca.
const AZIONE_DEL_TOCCO = { posto: 'servi', postazione: 'cuoci', bancone: 'raccogli' };

// Quanto sta in basso un Piatto sul Bancone: la sua base cade a questa distanza dal fondo del piano.
const PIATTO_SUL_PIANO = 24;

const round = (n) => Math.round(n * 10) / 10;
const rectState = (r) => ({ x: round(center(r).x), y: round(center(r).y), w: round(r.w), h: round(r.h) });

// Lo Yatai in verticale (passo 2 di PIANO.md). Dall'alto in basso: i Posti, il Bancone con i
// Piatti pronti, Maurizio al centro e le Postazioni vicino al pollice.
//
// Qui non c'è logica di gioco (Clienti, Ordini e cottura sono dei passi 3 e 4): la scena si
// impagina da sola a ogni schermo e dice cosa è stato toccato con l'evento `tocco`
// ({ tipo: 'posto' | 'postazione' | 'bancone', indice }), che il gioco ascolterà.
//
// Dati di avvio, tutti facoltativi: posti (3 o 4), postazioni (da 1 a 5), demo (se mettere due
// Piatti di prova sul Bancone).
export default class YataiScene extends Phaser.Scene {
  constructor() {
    super('yatai');
  }

  init(data) {
    this.seats = data?.posti ?? YATAI.posti.iniziali;
    this.stations = data?.postazioni ?? YATAI.postazioni.massimo;
    this.demo = data?.demo ?? true;
    this.lastTouch = null;
    this.layout = null;
  }

  // Gli oggetti si disegnano nell'ordine in cui nascono: pavimento, Posti, Bancone, Piatti,
  // Maurizio, Postazioni.
  create() {
    addPaper(this);
    this.floor = this.add.image(0, 0, 'pavimento').setOrigin(0.5, 0);

    this.seatViews = Array.from({ length: this.seats }, (_, i) => this.touchable('posto', i, 'posto'));
    this.counter = this.add.image(0, 0, 'bancone').setOrigin(0.5, 0);
    this.dishViews = Array.from({ length: YATAI.bancone.capacita }, (_, i) => {
      // L'ombra va creata prima del Piatto, per stargli sotto.
      const shadow = this.add.image(0, 0, 'ombra');
      const view = this.touchable('bancone', i, 'onigiri');
      view.shadow = shadow;
      shadow.setVisible(this.demo && i < 2);
      view.image.setVisible(this.demo && i < 2);
      return view;
    });

    this.maurizio = new MaurizioActor(this);

    const dishes = Object.keys(PIATTI);
    this.stationViews = Array.from({ length: this.stations }, (_, i) => {
      const view = this.touchable('postazione', i, postazioneKey(dishes[i]));
      view.piatto = dishes[i];
      view.label = this.add.text(0, 0, t(`piatto_${dishes[i]}`), textStyle(26, { bold: true, outline: 5 })).setOrigin(0.5, 1);
      return view;
    });

    if (import.meta.env.DEV) {
      this.back = this.add.text(0, 0, '‹ sviluppo', textStyle(26, { bold: true }));
      this.back.setInteractive({ useHandCursor: true }).on('pointerup', () => this.scene.start('sviluppo'));
    }

    this.scale.on('resize', this.relayout, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.relayout, this);
      this.maurizio.destroy();
    });
    this.relayout();
  }

  // Un disegno che si tocca. L'area sensibile è tutto il rettangolo del layout (non solo il
  // disegno) e si riposiziona a ogni relayout.
  touchable(tipo, indice, texture) {
    const image = this.add.image(0, 0, texture).setOrigin(0.5, 1);
    const zone = this.add.zone(0, 0, 1, 1).setOrigin(0).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', () => this.touch(tipo, indice));
    return { tipo, indice, image, zone };
  }

  touch(tipo, indice) {
    this.lastTouch = { tipo, indice, timeMs: Math.round(this.time.now) };
    this.maurizio.azione(AZIONE_DEL_TOCCO[tipo]);
    this.events.emit('tocco', { tipo, indice });
  }

  // Mette ogni cosa dove dice il layout. Si richiama a ogni cambio di misura dello schermo.
  relayout() {
    const { frame, safe } = screenOf(this);
    const layout = layoutYatai({ frame, safe, seats: this.seats, stations: this.stations });
    this.layout = layout;
    const cx = frame.width / 2;

    // Il pavimento comincia dietro la tendina del Bancone e arriva in fondo.
    this.floor.setPosition(cx, layout.bancone.rect.y + 120);

    layout.posti.forEach((rect, i) => {
      const view = this.seatViews[i];
      const fit = fitIn({ ...rect, h: rect.h - 6 }, POSTO_SIZE.w, POSTO_SIZE.h);
      view.image.setPosition(fit.x, fit.y).setScale(fit.scale);
      view.zone.setPosition(rect.x, rect.y).setSize(rect.w, rect.h);
    });

    this.counter.setPosition(cx, layout.bancone.rect.y);
    layout.bancone.piatti.forEach((rect, i) => {
      const view = this.dishViews[i];
      // Il Piatto sta in piedi sul piano: largo quanto il suo posto, e può sporgere sopra il bordo.
      const scale = Math.min(1, rect.w / DISEGNI.onigiri.w);
      view.image.setPosition(center(rect).x, rect.y + rect.h - PIATTO_SUL_PIANO).setScale(scale);
      view.shadow.setPosition(center(rect).x, rect.y + rect.h - PIATTO_SUL_PIANO - 8 * scale).setScale(scale * 0.7, scale * 0.8);
      view.zone.setPosition(rect.x, rect.y).setSize(rect.w, rect.h);
    });

    const fit = placeMaurizio(layout.maurizio, MAURIZIO_SIZE.w, MAURIZIO_SIZE.h);
    this.maurizio.place(fit.x, fit.y, fit.scale);

    const labelHeight = YATAI.postazioni.altezzaEtichetta;
    layout.postazioni.forEach((rect, i) => {
      const view = this.stationViews[i];
      const drawing = fitIn({ ...rect, h: rect.h - labelHeight }, POSTAZIONE_SIZE.w, POSTAZIONE_SIZE.h);
      view.image.setPosition(drawing.x, drawing.y).setScale(drawing.scale);
      // Il nome sotto la Postazione, ristretto se è più largo del suo posto.
      view.label.setScale(1).setPosition(center(rect).x, rect.y + rect.h);
      if (view.label.width > rect.w) view.label.setScale(rect.w / view.label.width);
      view.zone.setPosition(rect.x, rect.y).setSize(rect.w, rect.h);
    });

    this.back?.setPosition(safe.left + YATAI.margine, safe.top + 28);
  }

  getTextState() {
    const { layout } = this;
    const { frame, view, canvas, safe } = screenOf(this);
    const textureKeys = ['pavimento', 'bancone', 'posto', 'maurizio', 'maurizio-lavora', 'maurizio-evviva', ...Object.keys(PIATTI).map(postazioneKey)];
    return {
      schermo: {
        finestra: { w: view.w, h: view.h },
        gioco: { w: frame.width, h: frame.height },
        colonna: { x: round(canvas.x), y: round(canvas.y), w: round(canvas.w), h: round(canvas.h), scala: Math.round(canvas.scale * 1000) / 1000 },
        areaSicura: Object.fromEntries(Object.entries(safe).map(([k, v]) => [k, round(v)])),
      },
      // Dove toccare, in coordinate di gioco: x e y sono il centro del rettangolo.
      posti: layout.posti.map((r, i) => ({ i, ...rectState(r) })),
      bancone: {
        ...rectState(layout.bancone.rect),
        piatti: layout.bancone.piatti.map((r, i) => ({ i, pronto: this.dishViews[i].image.visible, ...rectState(r) })),
      },
      postazioni: layout.postazioni.map((r, i) => ({ i, piatto: this.stationViews[i].piatto, ...rectState(r) })),
      maurizio: { ...this.maurizio.getTextState(), fascia: rectState(layout.maurizio) },
      hud: rectState(layout.zone.hud),
      ultimoTocco: this.lastTouch,
      textures: Object.fromEntries(textureKeys.map((key) => [key, textureFingerprint(this, key)])),
    };
  }
}
