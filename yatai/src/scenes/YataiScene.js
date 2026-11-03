import Phaser from 'phaser';
import { ETICHETTA, MATSURI_PREDEFINITO, PIATTI, TEMI, YATAI } from '../config.js';
import { DISEGNI } from '../disegni/catalogo.js';
import { MAURIZIO_SIZE } from '../disegni/maurizio.js';
import { POSTAZIONE_SIZE, postazioneKey } from '../disegni/postazioni.js';
import { chiaviTema } from '../disegni/sfondi/index.js';
import { POSTO_SIZE } from '../disegni/yatai.js';
import { t } from '../i18n.js';
import { textStyle } from '../kit/font.js';
import { generateTheme, textureFingerprint } from '../kit/texture.js';
import { addPaper } from '../kit/ui.js';
import { layoutSfondo } from '../layout/sfondo.js';
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
// Dati di avvio, tutti facoltativi: matsuri (hanami, tanabata, hanabi, aki o yuki: il tema dello
// sfondo, del pavimento, della tendina e dei cuscini), posti (3 o 4), postazioni (da 1 a 5), demo
// (se mettere due Piatti di prova sul Bancone).
export default class YataiScene extends Phaser.Scene {
  // `key` serve a SerataScene, che è lo stesso Yatai con la Serata dentro.
  constructor(key = 'yatai') {
    super(key);
  }

  init(data) {
    this.matsuri = data?.matsuri in TEMI ? data.matsuri : MATSURI_PREDEFINITO;
    this.seats = data?.posti ?? YATAI.posti.iniziali;
    this.stations = data?.postazioni ?? YATAI.postazioni.massimo;
    this.demo = data?.demo ?? true;
    this.lastTouch = null;
    this.impronte = null;
    this.layout = null;
  }

  // Gli oggetti si disegnano nell'ordine in cui nascono: lo sfondo del Matsuri (cielo, terra, lati,
  // alto), il pavimento, i Posti, il Bancone, i Piatti, Maurizio, le Postazioni.
  create() {
    const tema = TEMI[this.matsuri];
    // Si genera solo il tema in uso: i tempi finiscono in render_game_to_text().
    this.generation = generateTheme(this, this.matsuri);
    const chiavi = this.generation.chiavi;
    addPaper(this, tema.carta);
    this.sky = this.add.image(0, 0, chiavi.cielo).setOrigin(0);
    this.ground = this.add.image(0, 0, chiavi.terra).setOrigin(0);
    this.sides = [this.add.image(0, 0, chiavi.latoSx).setOrigin(0), this.add.image(0, 0, chiavi.latoDx).setOrigin(0)];
    this.top = this.add.image(0, 0, chiavi.alto).setOrigin(0);
    this.floor = this.add.image(0, 0, chiavi.pavimento).setOrigin(0.5, 0);

    this.seatViews = Array.from({ length: this.seats }, (_, i) => this.touchable('posto', i, chiavi.posto));
    this.counter = this.add.image(0, 0, chiavi.bancone).setOrigin(0.5, 0);
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

    // Una Postazione per Piatto. Nella Serata la fila ha anche le Scorte e può avere più voci dei Piatti: le
    // voci in più partono come il primo Piatto e SerataScene dà a ognuna il suo disegno e il suo nome.
    const dishes = Object.keys(PIATTI);
    this.stationViews = Array.from({ length: this.stations }, (_, i) => {
      const piatto = dishes[i] ?? dishes[0];
      const view = this.touchable('postazione', i, postazioneKey(piatto));
      view.piatto = piatto;
      view.label = this.add.text(0, 0, t(`piatto_${piatto}`), textStyle(26, { bold: true, outline: 5, color: ETICHETTA.testo, outlineColor: ETICHETTA.contorno })).setOrigin(0.5, 1);
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

    // Lo sfondo del Matsuri si àncora al layout (src/layout/sfondo.js): il cielo sopra l'orizzonte, la
    // terra sotto, i rami appesi al bordo in alto, i lati poggiati dietro il Bancone.
    const sfondo = layoutSfondo(layout);
    this.backdrop = sfondo;
    this.sky.setPosition(sfondo.cielo.x, sfondo.cielo.y);
    this.ground.setPosition(sfondo.terra.x, sfondo.terra.y);
    this.top.setPosition(sfondo.alto.x, sfondo.alto.y);
    this.sides[0].setPosition(sfondo.latoSx.x, sfondo.latoSx.y);
    this.sides[1].setPosition(sfondo.latoDx.x, sfondo.latoDx.y);

    // Il pavimento comincia dietro la tendina del Bancone e arriva in fondo.
    this.floor.setPosition(cx, sfondo.pavimentoY);

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
    const chiavi = chiaviTema(this.matsuri);
    const textureKeys = [...Object.values(chiavi), 'maurizio', 'maurizio-lavora', 'maurizio-evviva', ...Object.keys(PIATTI).map(postazioneKey)];
    const { orizzonte, pavimentoY, ...pezzi } = this.backdrop;
    return {
      schermo: {
        finestra: { w: view.w, h: view.h },
        gioco: { w: frame.width, h: frame.height },
        colonna: { x: round(canvas.x), y: round(canvas.y), w: round(canvas.w), h: round(canvas.h), scala: Math.round(canvas.scale * 1000) / 1000 },
        areaSicura: Object.fromEntries(Object.entries(safe).map(([k, v]) => [k, round(v)])),
      },
      // Dove toccare, in coordinate di gioco: x e y sono il centro del rettangolo.
      matsuri: this.matsuri,
      // Lo sfondo: dove cadono l'orizzonte e il pavimento e i rettangoli dei pezzi, in coordinate di gioco.
      sfondo: { orizzonte: round(orizzonte), pavimento: round(pavimentoY), ...Object.fromEntries(Object.entries(pezzi).map(([k, r]) => [k, { x: round(r.x), y: round(r.y), w: round(r.w), h: round(r.h) }])) },
      // Quanto è costato generare le texture del Matsuri (cambia da un computer all'altro).
      generazione: { ms: this.generation.ms, nuove: this.generation.nuove, dettaglio: this.generation.dettaglio },
      posti: layout.posti.map((r, i) => ({ i, ...rectState(r) })),
      bancone: {
        ...rectState(layout.bancone.rect),
        piatti: layout.bancone.piatti.map((r, i) => ({ i, pronto: this.dishViews[i].image.visible, ...rectState(r) })),
      },
      postazioni: layout.postazioni.map((r, i) => ({ i, piatto: this.stationViews[i].piatto, ...rectState(r) })),
      maurizio: { ...this.maurizio.getTextState(), fascia: rectState(layout.maurizio) },
      hud: rectState(layout.zone.hud),
      ultimoTocco: this.lastTouch,
      // Le impronte si calcolano una volta per scena: leggere i pixel di sfondi da 720×1000 a ogni
      // chiamata renderebbe lenti i test che chiedono lo stato a ogni mossa. Le texture non cambiano.
      textures: (this.impronte ??= Object.fromEntries(textureKeys.map((key) => [key, textureFingerprint(this, key)]))),
    };
  }
}
