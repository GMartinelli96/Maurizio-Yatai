import Phaser from 'phaser';
import { POTENZIAMENTI, VIEW } from '../config.js';
import { PANEL_MARGIN } from '../disegni/catalogo.js';
import { compra, vociDellaBottega } from '../bottega.js';
import { t } from '../i18n.js';
import { textStyle } from '../kit/font.js';
import { panelTexture } from '../kit/texture.js';
import { addButton, addPaper, centerDesign } from '../kit/ui.js';
import { salvataggio } from '../salvataggio.js';

// La Bottega (GLOSSARY.md; ticket 35): gli Yen in tasca e i Potenziamenti che si comprano con quelli, un pannello per
// ciascuno con il livello (tondi pieni e vuoti, senza testo) e il prezzo del prossimo. Qui c'è solo la sezione dei
// Potenziamenti: l'Arredo e i Vestiti arrivano con i ticket 18 e 19. Il conto sta in src/bottega.js.
//
// Disegnata a posizioni fisse su 720×1280 e tenuta al centro dello schermo (centerDesign), come il titolo. Ogni
// bersaglio da toccare è alto almeno 110 px di gioco, cioè 55 px su un telefono da 360 di larghezza.
const CARTA = { w: 640, h: 300, primoY: 470, passo: 325 };
const BOTTONE = { w: 230, h: 110 };

export default class BottegaScene extends Phaser.Scene {
  constructor() {
    super('bottega');
  }

  create() {
    addPaper(this);
    centerDesign(this);
    this.input.keyboard.on('keydown', (event) => {
      if (!event.repeat && event.code === 'Escape') this.indietro();
    });
    this.uscendo = false;
    this.costruisci();
  }

  indietro() {
    if (this.uscendo) return;
    this.uscendo = true;
    this.scene.start('title');
  }

  // Disegna tutto da capo: dopo un acquisto cambiano gli Yen, il livello, il prezzo e quali pulsanti sono accesi.
  costruisci() {
    this.contenitore?.destroy();
    const cx = VIEW.width / 2;
    const salvato = salvataggio();
    const c = this.add.container(0, 0);
    this.contenitore = c;
    this.bersagli = { compra: [], indietro: null };

    c.add(this.add.text(cx, 95, t('bottega'), textStyle(72, { bold: true, outline: 10 })).setOrigin(0.5));

    // Gli Yen in tasca: la moneta e il numero, centrati insieme.
    const yen = this.add.text(0, 0, String(salvato.yen), textStyle(64, { bold: true, outline: 8 })).setOrigin(0, 0.5);
    const moneta = this.add.image(0, 0, 'moneta').setScale(1.3);
    const larghezza = 78 + 22 + yen.width;
    moneta.setPosition(cx - larghezza / 2 + 39, 200);
    yen.setPosition(cx - larghezza / 2 + 100, 200);
    c.add([moneta, yen]);
    this.testoYen = yen;

    c.add(this.add.text(cx, 272, t('bottegaPotenziamenti'), textStyle(38, { bold: true })).setOrigin(0.5));

    vociDellaBottega(salvato).forEach((voce, i) => this.carta(c, voce, CARTA.primoY + i * CARTA.passo));

    const y = 1130;
    const indietro = addButton(this, cx, y, 380, 110, t('bottegaIndietro'), 'nuvola', () => this.indietro());
    c.add([indietro.image, indietro.text]);
    this.bersagli.indietro = indietro;

    if (!salvato.salvato) {
      c.add(this.add.text(cx, 1010, t('bottegaNonSalvato'), { ...textStyle(26), align: 'center', wordWrap: { width: 600 } }).setOrigin(0.5));
    }
  }

  // Un Potenziamento: l'icona e il nome in alto, sotto cosa fa e i tondi del livello e, a destra, il pulsante col prezzo
  // del prossimo livello.
  carta(c, voce, y) {
    const cx = VIEW.width / 2;
    const sinistra = cx - CARTA.w / 2;
    const pannello = this.add.image(cx, y, panelTexture(this, CARTA.w, CARTA.h, 'nuvola'));
    pannello.setOrigin(0.5, (PANEL_MARGIN + CARTA.h / 2) / pannello.height);
    c.add(pannello);

    c.add(this.add.image(sinistra + 34 + 54, y - 66, `icona-${voce.id}`).setScale(0.9));
    c.add(this.add.text(sinistra + 160, y - 66, t(`potenziamento_${voce.id}`), { ...textStyle(38, { bold: true }), wordWrap: { width: CARTA.w - 160 - 34 } }).setOrigin(0, 0.5));
    c.add(this.add.text(sinistra + 34, y + 22, `${t(`potenziamentoDesc_${voce.id}`)}${this.effetto(voce)}`, { ...textStyle(30), wordWrap: { width: 340 } }).setOrigin(0, 0.5));

    // I livelli: un tondo ciascuno, pieno se comprato.
    for (let n = 0; n < voce.livelloMax; n++) {
      const comprato = n < voce.livello;
      const tondo = this.add.circle(sinistra + 52 + n * 50, y + 116, 17, comprato ? 0xf7d26a : 0xfffdf8);
      tondo.setStrokeStyle(5, comprato ? 0xd1a33a : 0xcdbfa9);
      c.add(tondo);
    }

    const bx = cx + CARTA.w / 2 - 34 - BOTTONE.w / 2;
    const by = y + 55;
    if (voce.prezzo === null) {
      c.add(this.add.text(bx, by, t('bottegaAlMassimo'), textStyle(36, { bold: true })).setOrigin(0.5));
      this.bersagli.compra.push(null);
      return;
    }
    const acceso = voce.comprabile;
    const bottone = addButton(this, bx, by, BOTTONE.w, BOTTONE.h, '', acceso ? 'menta' : 'legnoChiaro', acceso ? () => this.acquista(voce.id) : null);
    const prezzo = this.add.text(bx + 22, by, String(voce.prezzo), textStyle(46, { bold: true })).setOrigin(0.5);
    const moneta = this.add.image(bx - 62, by, 'moneta').setScale(0.9);
    if (!acceso) [bottone.image, prezzo, moneta].forEach((o) => o.setAlpha(0.55));
    c.add([bottone.image, bottone.text, moneta, prezzo]);
    this.bersagli.compra.push({ x: bx, y: by, w: BOTTONE.w, h: BOTTONE.h });
  }

  // L'effetto del livello che si sta per comprare (o dell'ultimo, se è al massimo), come testo corto: il ventaglio dice
  // di quanto allunga la Pazienza.
  effetto(voce) {
    if (voce.id !== 'ventaglio') return '';
    const livello = Math.max(1, Math.min(voce.livello + 1, voce.livelloMax));
    return ` +${Math.round((POTENZIAMENTI.ventaglio.livelli[livello - 1].pazienza - 1) * 100)}%`;
  }

  acquista(id) {
    if (!compra(salvataggio(), id)) return;
    this.costruisci();
    // Un piccolo saltino del numero degli Yen: è cambiato.
    this.tweens.add({ targets: this.testoYen, scale: { from: 1.25, to: 1 }, duration: 260, ease: 'Back.easeOut' });
  }

  getTextState() {
    const salvato = salvataggio();
    const scrollY = this.cameras.main.scrollY;
    const posto = (r) => (r ? { ...r, y: r.y - scrollY } : null);
    const { indietro } = this.bersagli;
    return {
      yen: salvato.yen,
      salvato: salvato.salvato,
      // Un Potenziamento per riga: livello, prezzo del prossimo (null se al massimo), se gli Yen bastano e dov'è il
      // pulsante per comprarlo (null se non c'è: al massimo).
      voci: vociDellaBottega(salvato).map((voce, i) => ({ ...voce, compra: posto(this.bersagli.compra[i]) })),
      indietro: { x: indietro.x, y: indietro.y - scrollY, w: indietro.width, h: indietro.height },
    };
  }
}
