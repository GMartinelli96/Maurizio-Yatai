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
// bersaglio da toccare è alto almeno 110 px di gioco, cioè 55 px su un telefono da 360 di larghezza. Le carte sono tre
// (ticket 06) e stanno tra il titolo e il pulsante in fondo: `primoY` è il centro della prima, `passo` la distanza.
const CARTA = { w: 640, h: 215, primoY: 425, passo: 230 };
const BOTTONE = { w: 230, h: 110 };

export default class BottegaScene extends Phaser.Scene {
  constructor() {
    super('bottega');
  }

  // `dopoSerata`: si arriva dalla fine di una Serata del Matsuri `matsuri`, e il pulsante in fondo riporta a giocarlo.
  init(data) {
    this.dopoSerata = data?.dopoSerata === true;
    this.matsuri = data?.matsuri;
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
    if (this.dopoSerata) this.scene.start('serata', { matsuri: this.matsuri });
    else this.scene.start('title');
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
    const indietro = addButton(this, cx, y, 380, 110, t(this.dopoSerata ? 'endRigioca' : 'bottegaIndietro'), this.dopoSerata ? 'menta' : 'nuvola', () => this.indietro());
    c.add([indietro.image, indietro.text]);
    this.bersagli.indietro = indietro;

    if (!salvato.salvato) {
      c.add(this.add.text(cx, 1032, t('bottegaNonSalvato'), { ...textStyle(26), align: 'center', wordWrap: { width: 600 } }).setOrigin(0.5));
    }
  }

  // Un Potenziamento: l'icona e il nome in alto, sotto cosa fa e i tondi del livello e, a destra, il pulsante col prezzo
  // del prossimo livello. Le misure verticali sono dal centro della carta.
  carta(c, voce, y) {
    const cx = VIEW.width / 2;
    const sinistra = cx - CARTA.w / 2;
    const pannello = this.add.image(cx, y, panelTexture(this, CARTA.w, CARTA.h, 'nuvola'));
    pannello.setOrigin(0.5, (PANEL_MARGIN + CARTA.h / 2) / pannello.height);
    c.add(pannello);

    c.add(this.add.image(sinistra + 34 + 44, y - 50, `icona-${voce.id}`).setScale(0.74));
    c.add(this.add.text(sinistra + 150, y - 50, t(`potenziamento_${voce.id}`), { ...textStyle(38, { bold: true }), wordWrap: { width: CARTA.w - 150 - 34 } }).setOrigin(0, 0.5));
    c.add(this.add.text(sinistra + 34, y + 30, `${t(`potenziamentoDesc_${voce.id}`)}${this.effetto(voce)}`, { ...textStyle(30), wordWrap: { width: 340 } }).setOrigin(0, 0.5));

    // I livelli: un tondo ciascuno, pieno se comprato.
    for (let n = 0; n < voce.livelloMax; n++) {
      const comprato = n < voce.livello;
      const tondo = this.add.circle(sinistra + 52 + n * 50, y + 84, 17, comprato ? 0xf7d26a : 0xfffdf8);
      tondo.setStrokeStyle(5, comprato ? 0xd1a33a : 0xcdbfa9);
      c.add(tondo);
    }

    const bx = cx + CARTA.w / 2 - 34 - BOTTONE.w / 2;
    const by = y + 38;
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
  // di quanto allunga la Pazienza, la piastra di quanto accorcia la cottura.
  effetto(voce) {
    const livello = Math.max(1, Math.min(voce.livello + 1, voce.livelloMax));
    const { pazienza, cottura } = POTENZIAMENTI[voce.id].livelli[livello - 1];
    if (pazienza !== undefined) return ` +${Math.round((pazienza - 1) * 100)}%`;
    if (cottura !== undefined) return ` -${Math.round((1 - cottura) * 100)}%`;
    return '';
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
      dopoSerata: this.dopoSerata,
      // Un Potenziamento per riga: livello, prezzo del prossimo (null se al massimo), se gli Yen bastano e dov'è il
      // pulsante per comprarlo (null se non c'è: al massimo).
      voci: vociDellaBottega(salvato).map((voce, i) => ({ ...voce, compra: posto(this.bersagli.compra[i]) })),
      indietro: { x: indietro.x, y: indietro.y - scrollY, w: indietro.width, h: indietro.height },
    };
  }
}
