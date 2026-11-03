import { RISCONTRI } from '../config.js';
import { FUMO_SIZE } from '../disegni/takoyaki.js';

// Il Fumo di una Postazione, solo la vista (la logica è in src/serata/Serata.js: stato 'fumo').
// Due cose:
//   nuvole  tre nuvole che coprono la Postazione mentre è nel Fumo e non si può usare; entrano con un
//           rimbalzo, ondeggiano e nell'ultimo quarto del Fumo svaniscono (la Postazione sta per tornare);
//   fili    due nuvolette piccole che salgono in continuazione da un Piatto che sta per bruciarsi o è bruciato.
export default class FumoView {
  constructor(scene, profondita) {
    this.scene = scene;
    this.nuvole = Array.from({ length: 3 }, () => scene.add.image(0, 0, 'fumo').setDepth(profondita).setVisible(false));
    this.fili = Array.from({ length: 2 }, () => scene.add.image(0, 0, 'fumo').setDepth(profondita).setVisible(false));
    this.tweenNuvole = [];
    this.tweenFili = [];
    this.attivo = false;
    this.filiAcceso = false;
    this.zona = null;
  }

  // La Postazione: `cima` è il centro in alto del suo disegno, larghezza e altezza sono sullo schermo;
  // `piatto` è il punto da cui salgono i fili (dove sta il Piatto sulla Postazione).
  place(cima, larghezza, altezza, piatto) {
    this.zona = { cima, larghezza, altezza, piatto };
    const scala = (larghezza * 0.78) / FUMO_SIZE.w;
    this.layout = [
      { x: cima.x - larghezza * 0.2, y: cima.y + altezza * 0.62, scala },
      { x: cima.x + larghezza * 0.22, y: cima.y + altezza * 0.55, scala: scala * 0.92 },
      { x: cima.x, y: cima.y + altezza * 0.3, scala: scala * 1.05 },
    ];
    this.scalaFilo = scala * 0.4;
    if (this.attivo) this.mostra(false);
    if (this.filiAcceso) this.accendiFili();
  }

  fermaNuvole() {
    for (const tween of this.tweenNuvole) tween.remove();
    this.tweenNuvole = [];
  }

  fermaFili() {
    for (const tween of this.tweenFili) tween.remove();
    this.tweenFili = [];
  }

  // Le nuvole compaiono. `entrata` le fa rimbalzare da piccole.
  mostra(entrata = true) {
    this.fermaNuvole();
    this.attivo = true;
    const { entra, ondeggia } = RISCONTRI.fumo;
    this.nuvole.forEach((nuvola, i) => {
      const { x, y, scala } = this.layout[i];
      nuvola.setVisible(true).setAlpha(1).setPosition(x, y).setScale(entrata ? 0.15 : scala);
      if (entrata) this.tweenNuvole.push(this.scene.tweens.add({ targets: nuvola, scale: scala, duration: entra, delay: i * 70, ease: 'Back.easeOut' }));
      this.tweenNuvole.push(this.scene.tweens.add({
        targets: nuvola,
        y: y - 7 - i * 2,
        duration: ondeggia + i * 140,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: entrata ? entra : 0,
      }));
    });
  }

  // Quanto Fumo resta, da 1 (appena comincia) a 0 (passato): nell'ultimo quarto le nuvole svaniscono.
  aggiorna(resta) {
    if (!this.attivo) return;
    const alpha = Math.min(1, resta / RISCONTRI.fumo.svanisce);
    for (const nuvola of this.nuvole) nuvola.setAlpha(Math.max(0, alpha));
  }

  // Si è toccata la Postazione nel Fumo: le nuvole si gonfiano e tremano, "ancora no".
  sbuffa() {
    if (!this.attivo) return;
    const { sbuffo } = RISCONTRI.fumo;
    this.nuvole.forEach((nuvola, i) => {
      const { scala } = this.layout[i];
      this.scene.tweens.add({ targets: nuvola, scaleX: scala * 1.14, scaleY: scala * 1.1, duration: sbuffo / 2, yoyo: true, ease: 'Sine.easeOut' });
      this.scene.tweens.add({ targets: nuvola, x: nuvola.x + (i % 2 ? 9 : -9), duration: sbuffo / 4, yoyo: true, repeat: 1, ease: 'Sine.easeInOut', onComplete: () => nuvola.setX(this.layout[i].x) });
    });
  }

  chiudi() {
    this.fermaNuvole();
    this.attivo = false;
    this.nuvole.forEach((nuvola) => nuvola.setVisible(false));
  }

  // I fili di fumo salgono uno dopo l'altro dal Piatto, ripetendosi.
  accendiFili() {
    this.fermaFili();
    this.filiAcceso = true;
    const { durata, salita } = RISCONTRI.fili;
    const { piatto } = this.zona;
    this.fili.forEach((filo, i) => {
      const x = piatto.x + (i ? 14 : -14);
      filo.setVisible(true).setPosition(x, piatto.y - 20).setScale(this.scalaFilo * 0.5).setAlpha(0);
      this.tweenFili.push(this.scene.tweens.add({
        targets: filo,
        y: piatto.y - 20 - salita,
        x: x + (i ? 10 : -10),
        scale: this.scalaFilo * 1.1,
        alpha: { from: 0.9, to: 0 },
        duration: durata,
        delay: (durata / this.fili.length) * i,
        repeat: -1,
        ease: 'Sine.easeOut',
      }));
    });
  }

  spegniFili() {
    this.fermaFili();
    this.filiAcceso = false;
    this.fili.forEach((filo) => filo.setVisible(false));
  }

  getTextState() {
    return {
      visibile: this.attivo,
      alpha: this.attivo ? Math.round(this.nuvole[0].alpha * 100) / 100 : 0,
      fili: this.filiAcceso,
    };
  }
}
