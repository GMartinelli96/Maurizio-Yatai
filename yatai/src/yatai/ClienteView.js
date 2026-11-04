import { PAZIENZA, RISCONTRI } from '../config.js';
import { ONIGIRI_ICONA } from '../disegni/catalogo.js';
import { CAST_SEGNI_POS } from '../disegni/cast.js';
import { CLIENTE_FEET, CLIENTE_SIZE, SEGNI_POS, clienteKey } from '../disegni/clienti.js';
import { onigiriSize } from '../disegni/onigiri.js';
import { CUORE_SIZE, NUVOLETTA } from '../disegni/serata.js';
import { placeCliente } from '../layout/yatai.js';
import { espressioneDa, segnoDa } from '../serata/Serata.js';

// Lo spazio per le icone di un Ordine: da uno a tre Piatti.
const ICONE_MASSIME = 3;
const ICONA = onigiriSize(ONIGIRI_ICONA);

const round = (n) => Math.round(n * 10) / 10;

// Un Cliente al suo Posto sulla scena: il peluche (con le sue quattro espressioni), la sua ombra, la
// nuvoletta con l'Ordine fatto di icone e i cuoricini della Pazienza. È solo la vista: la logica
// (chi è arrivato, quanti cuoricini restano, se è servito) è in src/serata/Serata.js e la scena
// glielo dice con arriva(), impostaCuori(), scuoti(), servito() e vaVia().
//
// Il Lamento: la faccia segue i cuoricini rimasti (espressioneDa) e a 2 e a 1 cuoricini compare un segno
// senza parole, la goccia o lo sbuffo (segnoDa). Il segno è un'immagine a parte che segue il peluche a
// ogni frame (segui()), così sta fermo sul Cliente anche quando questo scuote la testa o salta. Le sue
// animazioni partono tutte da animaSegno(): è l'unico punto da spegnere con "riduci movimento".
//
// Stati: vuoto → attesa → (servito | imbronciato) → vuoto. L'uscita dura meno di POSTI.ricambioSec
// (un test lo controlla): il Posto è libero per tutto il tempo in cui si vede il Cliente che parte.
export default class ClienteView {
  // `cuoriN`: quanti cuoricini ha la Pazienza dei Clienti di questa Serata (5, 6 con il Posto in più).
  constructor(scene, indice, cuoriN = PAZIENZA.hearts) {
    this.scene = scene;
    this.indice = indice;
    this.cuoriN = cuoriN;
    this.stato = 'vuoto';
    this.cliente = null;
    this.espressione = null;
    this.nCuori = 0;
    this.geom = null;
    this.tweens = [];

    this.ombra = scene.add.image(0, 0, 'ombra').setVisible(false);
    this.sprite = scene.add.image(0, 0, clienteKey('tanuki', 'neutra')).setOrigin(0.5, 1).setVisible(false);
    this.nuvoletta = scene.add.image(0, 0, 'nuvoletta').setOrigin(0.5, 1).setVisible(false);
    this.icone = Array.from({ length: ICONE_MASSIME }, () => scene.add.image(0, 0, 'onigiri-icona').setVisible(false));
    this.cuoriViste = Array.from({ length: cuoriN }, () => scene.add.image(0, 0, 'cuore').setVisible(false));
    // Il segno del Lamento, sopra tutto il resto del Posto. `segnoMoto` è il suo movimento a parte
    // (entrata, discesa, sbuffo), in pixel del disegno del Cliente: segui() lo somma alla posizione.
    this.segnoImg = scene.add.image(0, 0, 'segno-goccia').setVisible(false);
    this.segno = null;
    this.segnoMoto = { pop: 1, dx: 0, dy: 0, sc: 1 };
    this.tweensSegno = [];
    this.evidenziato = false;
  }

  // --- Posizione ---

  // Mette ogni pezzo dove dice il layout del Posto. Si richiama a ogni cambio di misura dello schermo.
  place(rect) {
    this.rect = rect;
    this.geom = placeCliente(rect, CLIENTE_SIZE, CLIENTE_FEET, this.cuoriN);
    this.applicaBase();
  }

  // Le posizioni e le scale a riposo di ogni pezzo, secondo lo stato.
  applicaBase() {
    this.fermaTutto();
    const g = this.geom;
    if (!g) return;
    this.base = {
      sprite: { x: g.cliente.x, y: g.cliente.y, scale: g.cliente.scale },
      ombra: { x: g.piedi.x, y: g.piedi.y + 4, sx: g.cliente.scale * 0.8, sy: g.cliente.scale * 0.85 },
    };
    const { nuvoletta } = g;
    this.scalaNuvoletta = Math.min(nuvoletta.w / NUVOLETTA.w, nuvoletta.h / NUVOLETTA.h);
    this.nuvoletta.setPosition(nuvoletta.x + nuvoletta.w / 2, nuvoletta.y + nuvoletta.h).setScale(this.scalaNuvoletta);
    this.scalaCuore = g.cuori.lato / (CUORE_SIZE.w - 12);
    this.cuoriViste.forEach((cuore, i) => cuore.setPosition(g.cuori.centri[i].x, g.cuori.centri[i].y).setScale(this.scalaCuore));
    this.evidenziato = false;
    this.sprite.setPosition(this.base.sprite.x, this.base.sprite.y).setScale(this.base.sprite.scale).setAngle(0).setAlpha(1);
    this.ombra.setPosition(this.base.ombra.x, this.base.ombra.y).setScale(this.base.ombra.sx, this.base.ombra.sy).setAlpha(1);
    this.disponiIcone();
    this.mostra(this.stato === 'attesa');
    if (this.stato !== 'attesa' && this.stato !== 'vuoto') this.nascondi();
    if (this.stato === 'attesa') this.impostaCuori(this.nCuori, false);
  }

  // Le icone dell'Ordine una accanto all'altra dentro il corpo della nuvoletta.
  disponiIcone() {
    const g = this.geom;
    const s = this.scalaNuvoletta;
    const sinistra = g.nuvoletta.x + g.nuvoletta.w / 2 - (NUVOLETTA.w * s) / 2;
    const alto = g.nuvoletta.y + g.nuvoletta.h - NUVOLETTA.h * s;
    const corpo = { x: sinistra + NUVOLETTA.corpo.x * s, y: alto + NUVOLETTA.corpo.y * s, w: NUVOLETTA.corpo.w * s, h: NUVOLETTA.corpo.h * s };
    const n = Math.max(1, this.cliente?.ordine.length ?? 1);
    const cella = corpo.w / n;
    this.scalaIcona = Math.min((cella * 0.9) / ICONA.w, (corpo.h * 0.86) / ICONA.h);
    this.icone.forEach((icona, i) => {
      icona.setPosition(corpo.x + cella * (i + 0.5), corpo.y + corpo.h / 2).setScale(this.scalaIcona).clearTint();
    });
  }

  // Mostra o nasconde la nuvoletta, le icone e i cuoricini (il Cliente si gestisce a parte).
  mostra(si) {
    const n = this.cliente?.ordine.length ?? 0;
    this.nuvoletta.setVisible(si);
    this.icone.forEach((icona, i) => icona.setVisible(si && i < n));
    this.cuoriViste.forEach((cuore) => cuore.setVisible(si));
  }

  nascondi() {
    this.sprite.setVisible(false);
    this.ombra.setVisible(false);
    this.mostra(false);
    this.stato = 'vuoto';
    this.cliente = null;
    this.segno = null;
    this.mostraSegno();
  }

  // --- Animazioni (tutte dentro `this.tweens`, così si fermano insieme) ---

  tween(config) {
    const tween = this.scene.tweens.add(config);
    this.tweens.push(tween);
    return tween;
  }

  fermaTutto() {
    for (const tween of this.tweens) tween.remove();
    this.tweens = [];
    this.tweensSegno = [];
  }

  // Ferma solo i movimenti del segno (stanno anche in `this.tweens`, da cui si tolgono).
  fermaSegno() {
    for (const tween of this.tweensSegno) tween.remove();
    this.tweens = this.tweens.filter((tween) => !this.tweensSegno.includes(tween));
    this.tweensSegno = [];
  }

  // --- Cosa succede al Cliente ---

  imposta(espressione) {
    this.espressione = espressione;
    this.sprite.setTexture(clienteKey(this.cliente.tipo, espressione));
  }

  // Un Cliente nuovo si siede: salta fuori con un rimbalzo, poi arrivano la nuvoletta e i cuoricini.
  arriva(cliente) {
    this.fermaTutto();
    this.cliente = cliente;
    this.stato = 'attesa';
    this.nCuori = this.cuoriN;
    this.segno = null;
    this.imposta('neutra');
    this.icone.forEach((icona, i) => icona.setTexture(`${cliente.ordine[i] ?? cliente.ordine[0]}-icona`));
    this.applicaBase();
    this.sprite.setVisible(true);
    this.ombra.setVisible(true);
    this.impostaCuori(this.nCuori, false);

    const { durata } = RISCONTRI.arrivo;
    const { scale } = this.base.sprite;
    this.sprite.setScale(scale * 0.3).setAlpha(0);
    this.ombra.setAlpha(0);
    this.tween({ targets: this.sprite, scaleX: scale, scaleY: scale, alpha: 1, duration: durata, ease: 'Back.easeOut' });
    this.tween({ targets: this.ombra, alpha: 1, duration: durata });
    // La nuvoletta e i cuoricini compaiono uno dopo l'altro, appena dopo.
    const pezzi = [[this.nuvoletta, this.scalaNuvoletta], ...this.icone.slice(0, cliente.ordine.length).map((i) => [i, this.scalaIcona]), ...this.cuoriViste.map((c) => [c, this.scalaCuore])];
    pezzi.forEach(([pezzo, fine], i) => {
      pezzo.setScale(0);
      this.tween({ targets: pezzo, scale: fine, duration: durata * 0.8, delay: durata * 0.5 + i * 28, ease: 'Back.easeOut' });
    });
  }

  // Quanti cuoricini sono accesi; `anima` fa pulsare quello che si è appena spento. L'ultimo, se
  // resta solo lui, lampeggia: manca poco.
  impostaCuori(n, anima) {
    const prima = this.nCuori;
    this.nCuori = n;
    this.cuoriViste.forEach((cuore, i) => cuore.setTexture(i < n ? 'cuore' : 'cuore-vuoto'));
    if (anima && n < prima) {
      const spento = this.cuoriViste[n];
      spento.setScale(this.scalaCuore * 1.5);
      this.tween({ targets: spento, scale: this.scalaCuore, duration: 260, ease: 'Back.easeOut' });
    }
    this.cuoriViste[0].setScale(this.scalaCuore);
    if (n === 1 && this.stato === 'attesa') {
      this.tween({ targets: this.cuoriViste[0], scale: this.scalaCuore * 1.3, duration: RISCONTRI.ultimoCuore.durata, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    if (this.stato === 'attesa') this.lamenta(n, anima);
  }

  // Il Lamento: la faccia e il segno che vanno con `n` cuoricini. `anima` è falso quando si rimette tutto
  // dopo un cambio di misura dello schermo (niente "pop" né entrata del segno, solo il loop).
  lamenta(n, anima) {
    const espressione = espressioneDa(n);
    const segno = segnoDa(n);
    const cambiaSegno = segno !== this.segno;
    if (espressione !== this.espressione) {
      this.imposta(espressione);
      if (anima) this.popFaccia();
    }
    this.segno = segno;
    this.mostraSegno();
    if (segno && (cambiaSegno || !anima)) this.animaSegno(anima);
  }

  // Il cambio di faccia: il peluche si schiaccia un poco e torna a riposo con un rimbalzo (squash & stretch).
  popFaccia() {
    const { schiaccia, durata } = RISCONTRI.lamento.pop;
    const k = { v: schiaccia };
    const applica = () => {
      const s = this.scalaRiposo();
      this.sprite.setScale(s * (1 + k.v), s * (1 - k.v));
    };
    applica();
    this.tween({ targets: k, v: 0, duration: durata, ease: 'Back.easeOut', onUpdate: applica, onComplete: () => this.sprite.setScale(this.scalaRiposo()) });
  }

  // La scala del peluche a riposo: quella del Posto, un po' più grande se gli si sta portando un Piatto.
  scalaRiposo() {
    return this.base.sprite.scale * (this.evidenziato ? 1.06 : 1);
  }

  // Mostra la goccia o lo sbuffo, o niente. Lo sbuffo resta anche quando il Cliente se ne va imbronciato.
  mostraSegno() {
    const visibile = this.segno !== null && (this.stato === 'attesa' || this.stato === 'imbronciato');
    if (this.segno) this.segnoImg.setTexture(`segno-${this.segno}`);
    this.segnoImg.setVisible(visibile);
    if (!visibile) this.fermaSegno();
  }

  // L'unico punto da cui si muove il segno: l'entrata (un rimbalzo) e poi un loop piano, la goccia che
  // scende un poco e lo sbuffo che si gonfia. Con "riduci movimento" (ticket 26) basta non chiamarlo:
  // il segno compare fermo, dove lo mette segui().
  animaSegno(conEntrata) {
    this.fermaSegno();
    const L = RISCONTRI.lamento;
    Object.assign(this.segnoMoto, { pop: conEntrata ? 0 : 1, dx: 0, dy: 0, sc: 1 });
    const muovi = (config) => this.tweensSegno.push(this.tween(config));
    if (conEntrata) muovi({ targets: this.segnoMoto, pop: 1, duration: L.entra, ease: 'Back.easeOut' });
    if (this.segno === 'goccia') {
      muovi({ targets: this.segnoMoto, dy: L.goccia.discesa, duration: L.goccia.durata, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    } else {
      muovi({ targets: this.segnoMoto, dx: -L.sbuffo.spinta, sc: 1 + L.sbuffo.gonfia, duration: L.sbuffo.durata, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    this.segui();
  }

  // A ogni frame: il segno va dove sta il peluche. Il punto del segno è fissato nel disegno del Cliente
  // (SEGNI_POS), quindi si seguono la posizione, la scala, l'angolo e la trasparenza dello sprite (che
  // pivota sui piedi) senza che il segno conosca i suoi tween.
  segui() {
    if (!this.segno || !this.segnoImg.visible || !this.cliente) return;
    const { sprite: s, segnoMoto: m } = this;
    const punto = (SEGNI_POS[this.cliente.tipo] ?? CAST_SEGNI_POS[this.cliente.tipo])[this.segno];
    const dx = (punto.x + m.dx - CLIENTE_SIZE.w / 2) * s.scaleX;
    const dy = (punto.y + m.dy - CLIENTE_SIZE.h) * s.scaleY;
    const cos = Math.cos(s.rotation);
    const sin = Math.sin(s.rotation);
    this.segnoImg
      .setPosition(s.x + dx * cos - dy * sin, s.y + dx * sin + dy * cos)
      .setScale(s.scaleX * RISCONTRI.lamento.segnoScala * m.pop * m.sc, s.scaleY * RISCONTRI.lamento.segnoScala * m.pop * m.sc)
      .setRotation(s.rotation)
      .setAlpha(s.alpha);
  }

  // Sul Bancone manca qualcosa: scuote la testa (cioè tutto il peluche, che pivota sui piedi) e le
  // icone dell'Ordine diventano rosse per un attimo.
  scuoti() {
    if (this.stato !== 'attesa') return;
    const { angolo, durata, volte } = RISCONTRI.scuoteTesta;
    this.sprite.setAngle(0);
    this.tween({
      targets: this.sprite,
      angle: { from: -angolo, to: angolo },
      duration: durata,
      yoyo: true,
      repeat: volte - 1,
      ease: 'Sine.easeInOut',
      onComplete: () => this.sprite.setAngle(0),
    });
    this.icone.forEach((icona) => icona.setTint(0xe8706a));
    this.tween({ targets: this.nuvoletta, scale: this.scalaNuvoletta * 1.1, duration: durata * 1.5, yoyo: true, ease: 'Quad.easeOut' });
    this.scene.time.delayedCall(durata * 2 * volte, () => this.icone.forEach((icona) => icona.clearTint()));
  }

  // Servito: contento, salta due volte, e se ne va svanendo. La nuvoletta e i cuoricini spariscono subito.
  servito() {
    this.fermaTutto();
    this.stato = 'servito';
    this.imposta('contenta');
    this.segno = null;
    this.mostraSegno();
    this.mostra(false);
    this.sprite.setAngle(0);
    const { x, y, scale } = this.base.sprite;
    const durata = RISCONTRI.uscita.servito;
    this.sprite.setPosition(x, y).setScale(scale);
    this.tween({ targets: this.sprite, y: y - 26, scaleX: scale * 0.94, scaleY: scale * 1.06, duration: durata * 0.16, yoyo: true, repeat: 1, ease: 'Quad.easeOut' });
    this.tween({
      targets: this.sprite,
      alpha: 0,
      y: y - 14,
      scaleX: scale * 0.9,
      scaleY: scale * 0.9,
      delay: durata * 0.55,
      duration: durata * 0.45,
      ease: 'Sine.easeIn',
      onComplete: () => this.finisce(),
    });
    this.tween({ targets: this.ombra, alpha: 0, delay: durata * 0.55, duration: durata * 0.45 });
  }

  // La Pazienza è finita: imbronciato, si scuote e se ne va di lato, senza pagare.
  vaVia() {
    this.fermaTutto();
    this.stato = 'imbronciato';
    this.imposta('imbronciata');
    this.mostra(false);
    // Lo sbuffo se ne va con lui, senza rifare l'entrata.
    this.segno = 'sbuffo';
    this.mostraSegno();
    this.animaSegno(false);
    const { x, y, scale } = this.base.sprite;
    const durata = RISCONTRI.uscita.imbronciato;
    const verso = this.indice === 0 ? -1 : 1;
    this.sprite.setPosition(x, y).setScale(scale).setAngle(0);
    this.tween({ targets: this.sprite, angle: { from: -6, to: 6 }, duration: 60, yoyo: true, repeat: 3, ease: 'Sine.easeInOut', onComplete: () => this.sprite.setAngle(0) });
    this.tween({
      targets: this.sprite,
      x: x + verso * RISCONTRI.uscita.spostamento,
      alpha: 0,
      delay: durata * 0.4,
      duration: durata * 0.6,
      ease: 'Sine.easeIn',
      onComplete: () => this.finisce(),
    });
    this.tween({ targets: this.ombra, alpha: 0, delay: durata * 0.4, duration: durata * 0.6 });
  }

  finisce() {
    this.fermaTutto();
    this.sprite.setPosition(this.base.sprite.x, this.base.sprite.y).setScale(this.base.sprite.scale).setAlpha(1).setAngle(0);
    this.nascondi();
  }

  // Il Cliente che sta per essere servito (un Piatto trascinato gli è sopra) si fa un po' più grande.
  evidenzia(si) {
    if (this.stato !== 'attesa' || !this.base) return;
    this.evidenziato = si;
    this.sprite.setScale(this.scalaRiposo());
  }

  // Il centro del Cliente, per far partire monete e cuoricini da lì.
  centro() {
    const g = this.geom;
    return { x: g.piedi.x, y: g.piedi.y - (CLIENTE_FEET.y * g.cliente.scale) / 2 };
  }

  destroy() {
    this.fermaTutto();
    for (const oggetto of [this.ombra, this.sprite, this.nuvoletta, ...this.icone, ...this.cuoriViste, this.segnoImg]) oggetto.destroy();
  }

  getTextState() {
    const g = this.geom;
    const centro = this.centro();
    return {
      posto: this.indice,
      stato: this.stato,
      tipo: this.cliente?.tipo ?? null,
      espressione: this.stato === 'vuoto' ? null : this.espressione,
      // Il segno del Lamento che si vede adesso: 'goccia' (2 cuoricini), 'sbuffo' (1, e quando se ne va) o null.
      segno: this.segnoImg.visible ? this.segno : null,
      cuori: this.stato === 'attesa' ? this.nCuori : 0,
      ordine: this.cliente ? [...this.cliente.ordine] : [],
      x: round(centro.x),
      y: round(centro.y),
      // Come lo si vede adesso: trasparenza e scala del peluche, scala della nuvoletta.
      vista: { alpha: round(this.sprite.alpha * 100) / 100, scala: Math.round(this.sprite.scaleX * 1000) / 1000, nuvoletta: Math.round(this.nuvoletta.scaleX * 1000) / 1000 },
      nuvoletta: { x: round(g.nuvoletta.x + g.nuvoletta.w / 2), y: round(g.nuvoletta.y + g.nuvoletta.h / 2), w: round(g.nuvoletta.w), h: round(g.nuvoletta.h) },
    };
  }
}
