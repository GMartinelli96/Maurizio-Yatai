import { MAURIZIO } from '../config.js';
import { MAURIZIO_FEET, MAURIZIO_SIZE, maurizioKey } from '../disegni/maurizio.js';

// Maurizio sulla scena: il disegno, la sua ombra, il respiro e le animazioni delle azioni.
//
// Ogni azione del gioco richiama `azione('cuoci' | 'raccogli' | 'servi')`: Maurizio fa un saltino
// con schiacciamento, cambia posa per un attimo e torna a riposo. L'azione in sé è istantanea (la
// logica non aspetta questa animazione): è solo contorno. Le azioni sono in config.js, MAURIZIO.
export default class MaurizioActor {
  constructor(scene) {
    this.scene = scene;
    // Il disegno poggia sul fondo del riquadro: l'origine è il centro in basso.
    this.shadow = scene.add.image(0, 0, 'ombra');
    this.sprite = scene.add.image(0, 0, maurizioKey('riposo')).setOrigin(0.5, 1);
    this.posa = 'riposo';
    this.azioneInCorso = null;
    this.base = { x: 0, y: 0, scale: 1 };
    this.tween = null;
    this.timer = null;
    this.contaAzioni = 0;
  }

  // Mette Maurizio con il fondo del riquadro in (x, y), alla scala data.
  place(x, y, scale) {
    this.base = { x, y, scale };
    // L'ombra sta sotto i piedi, che nel disegno sono un poco sopra il fondo del riquadro.
    const feet = y - (MAURIZIO_SIZE.h - MAURIZIO_FEET.y) * scale;
    this.shadow.setPosition(x, feet + 2).setScale(scale * 0.95, scale);
    this.restart();
  }

  setPosa(posa) {
    this.posa = posa;
    this.sprite.setTexture(maurizioKey(posa));
  }

  // Ferma ogni movimento e rimette Maurizio fermo a riposo.
  rest() {
    this.tween?.remove();
    this.tween = null;
    this.timer?.remove();
    this.timer = null;
    this.azioneInCorso = null;
    const { x, y, scale } = this.base;
    this.sprite.setPosition(x, y).setScale(scale);
    this.setPosa('riposo');
  }

  // Dopo ogni spostamento o azione: fermo e poi il respiro.
  restart() {
    this.rest();
    this.breathe();
  }

  // Il respiro: si allunga e si stringe appena, piano.
  breathe() {
    const { scale } = this.base;
    const { ampiezza, durata } = MAURIZIO.respiro;
    this.tween = this.scene.tweens.add({
      targets: this.sprite,
      scaleX: scale * (1 - ampiezza / 2),
      scaleY: scale * (1 + ampiezza),
      duration: durata / 2,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  // Un'azione: salta, si schiaccia e si allunga, cambia posa e poi torna a riposo.
  azione(nome) {
    const cfg = MAURIZIO.azioni[nome];
    if (!cfg) throw new Error(`Azione di Maurizio sconosciuta: ${nome}`);
    this.rest();
    this.contaAzioni++;
    this.azioneInCorso = nome;
    this.setPosa(cfg.posa);
    const { x, y, scale } = this.base;
    this.tween = this.scene.tweens.add({
      targets: this.sprite,
      y: y - cfg.salto,
      scaleX: scale * (1 - cfg.schiaccia * 0.6),
      scaleY: scale * (1 + cfg.schiaccia),
      duration: cfg.durata,
      ease: 'Quad.easeOut',
      yoyo: true,
      onComplete: () => {
        this.tween = null;
        this.sprite.setPosition(x, y).setScale(scale);
        this.breathe();
      },
    });
    this.timer = this.scene.time.delayedCall(cfg.tienePosa, () => {
      this.timer = null;
      this.azioneInCorso = null;
      this.setPosa('riposo');
    });
  }

  destroy() {
    this.tween?.remove();
    this.timer?.remove();
    this.shadow.destroy();
    this.sprite.destroy();
  }

  getTextState() {
    const { x, y, scale } = this.base;
    return { x: Math.round(x), y: Math.round(y), scala: Number(scale.toFixed(3)), posa: this.posa, azione: this.azioneInCorso, azioni: this.contaAzioni };
  }
}
