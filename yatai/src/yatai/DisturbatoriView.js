import { DISTURBATORI, RISCONTRI, VIEW } from '../config.js';

// I Disturbatori sulla scena (ticket 11, passo 3): Croccola, le formiche e il corvo. La logica (chi arriva, chi punta cosa, chi
// colpisce) è in src/serata/disturbatori.js; qui c'è solo la vista, che la scena guida in due modi:
//   segui(stato)       a ogni frame, con `serata.stato().disturbatori`: dove sono e in che momento (arriva, punta, colpo)
//   perEvento(evento)  quando succede qualcosa: coccola, furto, Piatto rovinato, fuga
// Niente testo: si capisce guardando. Ogni momento si legge dal disegno e dal movimento:
//   arriva   Croccola corre lungo il Bancone, la fila di formiche entra camminando, il corvo vola a posarsi
//   punta    Croccola si acquatta con gli occhi sul Piatto, le formiche si avvicinano, il corvo gracchia ("kaa kaa": becco aperto e
//            chiuso, i tre archi del suono). Intorno al Piatto puntato c'è un anello che respira, e più in fretta quando manca poco
//   colpo    il balzo, la salita delle formiche sul Piatto (che si sporca), la picchiata del corvo: l'ultima possibilità
//   fuga     coccolata (cuoricini e fusa), con il Piatto in bocca, con le formiche che girano al largo, con la piuma che cade
// Le zone da toccare sono sempre da almeno RISCONTRI.disturbatori.zonaMin pixel di gioco. Tutti i movimenti passano da muovi() e dai
// cicli di segui(): sono i punti da spegnere con "riduci movimento" (ticket 26).

const R = RISCONTRI.disturbatori;
const CHI = ['croccola', 'formiche', 'corvi'];
const sfumato = (a) => 1 - (1 - a) ** 2;
const limita = (x) => Math.max(0, Math.min(1, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ms = (chi, voce) => DISTURBATORI[chi][`${voce}Sec`] * 1000;
const round = (n) => Math.round(n * 10) / 10;

// Colore di un Piatto che si sporca: da bianco (com'è) a un grigio verdastro.
const SPORCO = 0xaeb792;
const mescola = (a, b, t) => {
  const canale = (x, y, passo) => Math.round(((x >> passo) & 255) * (1 - t) + ((y >> passo) & 255) * t);
  return (canale(a, b, 16) << 16) | (canale(a, b, 8) << 8) | canale(a, b, 0);
};

export default class DisturbatoriView {
  // `tipi`: i Disturbatori di questa Serata (chiavi di DISTURBATORI): le immagini nascono solo per quelli.
  constructor(scene, tipi) {
    this.scene = scene;
    this.tipi = CHI.filter((chi) => tipi.includes(chi));
    // Per ogni tipo: lo stato della vista (null se non c'è in scena), i tween in corso e la zona da toccare.
    this.v = Object.fromEntries(this.tipi.map((chi) => [chi, null]));
    this.tweens = Object.fromEntries(this.tipi.map((chi) => [chi, []]));
    this.zone = Object.fromEntries(this.tipi.map((chi) => {
      const zona = scene.add.zone(0, 0, 1, 1).setOrigin(0.5).setDepth(8).setInteractive({ useHandCursor: true });
      zona.input.enabled = false;
      zona.on('pointerdown', () => scene.scaccia(chi));
      return [chi, zona];
    }));
    this.anelli = Object.fromEntries(this.tipi.map((chi) => [chi, scene.add.image(0, 0, 'segno-bersaglio').setDepth(3).setVisible(false)]));
    this.portato = null;
    const piccolo = (texture, profondita = 12) => scene.add.image(0, 0, texture).setDepth(profondita).setVisible(false);
    if (this.tipi.includes('croccola')) {
      // Croccola sta sotto i Piatti del Bancone (dietro di loro) e sopra il piano: i Piatti hanno profondità 0,5 (SerataScene).
      this.gatta = piccolo('croccola', 0.45).setOrigin(0.5, 1);
      this.cuori = Array.from({ length: R.croccola.fusa.cuori }, () => piccolo('cuore'));
      this.archi = [piccolo('segno-suono'), piccolo('segno-suono')];
    }
    if (this.tipi.includes('formiche')) {
      this.formiche = Array.from({ length: R.formiche.quante }, () => piccolo('formica-a', 3).setOrigin(0.5, 1));
      this.macchia = piccolo('piatto-rovinato', 3.5).setOrigin(0.5, 1);
    }
    if (this.tipi.includes('corvi')) {
      this.corvo = piccolo('corvo', 5);
      this.suono = piccolo('segno-suono');
    }
  }

  // Finita la Serata chi è in scena sparisce (e nessuno si può più toccare): sotto la schermata di fine Serata non resta niente.
  chiudi() {
    for (const chi of this.tipi) this.ripulisci(chi);
  }

  // --- Cose comuni ---

  riduci() {
    return this.scene.riduciMovimento === true;
  }

  // L'unico punto da cui partono i movimenti (insieme ai cicli di segui()): con "riduci movimento" (ticket 26) l'oggetto
  // salta subito alla fine e `fine` parte lo stesso.
  muovi(chi, bersaglio, props, { durata, ease = 'Quad.easeOut', ritardo = 0, yoyo = false, ripeti = 0, fine } = {}) {
    if (this.riduci()) {
      if (!yoyo) Object.assign(bersaglio, Object.fromEntries(Object.entries(props).map(([k, v]) => [k, typeof v === 'object' ? v.to : v])));
      fine?.();
      return null;
    }
    const tween = this.scene.tweens.add({ targets: bersaglio, ...props, duration: durata, ease, delay: ritardo, yoyo, repeat: ripeti, onComplete: () => fine?.() });
    this.tweens[chi].push(tween);
    return tween;
  }

  ferma(chi) {
    for (const tween of this.tweens[chi]) tween.remove();
    this.tweens[chi] = [];
  }

  // La scala di un Piatto sul Bancone e la sua posizione (la base): da qui si prende la misura di tutto.
  piatto(indice) {
    const { image } = this.scene.dishViews[Math.max(0, Math.min(indice, this.scene.dishViews.length - 1))];
    return { x: image.x, y: image.y, scala: image.scaleX, alto: image.displayHeight };
  }

  // La zona da toccare di `chi`, centrata in (x, y), mai più piccola di zonaMin.
  zona(chi, x, y, w, h) {
    const zona = this.zone[chi];
    zona.setPosition(x, y).setSize(Math.max(R.zonaMin, w), Math.max(R.zonaMin, h));
    zona.input.enabled = true;
  }

  spegniZona(chi) {
    this.zone[chi].input.enabled = false;
  }

  // L'anello intorno al bersaglio, che respira: più in fretta quando manca poco al colpo.
  anello(chi, x, y, scala, colpoTraMs) {
    const anello = this.anelli[chi];
    const periodo = colpoTraMs !== null && colpoTraMs < R.anello.urgenzaMs ? R.anello.periodoVeloce : R.anello.periodo;
    const respiro = this.riduci() ? 0 : Math.sin((this.scene.time.now / periodo) * Math.PI * 2);
    anello.setVisible(true).setPosition(x, y).setScale(scala * R.anello.scala * (1 + 0.07 * respiro)).setAlpha(R.anello.alpha);
  }

  nascondiAnello(chi) {
    this.anelli[chi].setVisible(false);
  }

  // Un Piatto che cambia mano: un'immagine temporanea con la stessa texture, che la scena può far volare o portare via.
  piattoTemporaneo(texture, x, y, scala, origineY = 1) {
    return this.scene.add.image(x, y, texture).setOrigin(0.5, origineY).setScale(scala).setDepth(6);
  }

  // --- Dal frame ---

  segui(stato) {
    for (const chi of this.tipi) {
      const d = stato.find((e) => e.chi === chi);
      // Fuori scena, o se ne sta già andando: la vista è guidata dai suoi tween, non dallo stato.
      if (!d || d.fase === 'vaVia') continue;
      // Se la vista non l'ha vista arrivare (ad esempio dopo un cambio di misura) la crea dallo stato.
      if (!this.v[chi]) this.comincia(chi, { bersaglio: d.bersaglio });
      const vista = this.v[chi];
      if (vista.fase === 'vaVia') continue;
      vista.fase = d.fase;
      if (chi === 'croccola') this.seguiCroccola(d, vista);
      else if (chi === 'formiche') this.seguiFormiche(d, vista);
      else this.seguiCorvi(d, vista);
    }
  }

  // --- Croccola ---

  seguiCroccola(d, v) {
    const c = R.croccola;
    const indice = d.bersaglio?.indice ?? v.indice;
    v.indice = indice;
    const slot = this.piatto(indice);
    const k = slot.scala * c.scala;
    // Sta di lato al suo Piatto, sul Bancone libero (i Piatti si riempiono da sinistra), con la faccia fuori dal Piatto.
    v.affianco = indice < 3 ? 1 : -1;
    const bx = slot.x + v.affianco * c.affianco * 150 * slot.scala;
    const by = slot.y + c.sotto * k;
    v.x = v.x === undefined ? bx : lerp(v.x, bx, 0.25);
    const gatta = this.gatta.setVisible(true).setScale(k, k);
    const ora = this.scene.time.now;
    if (d.fase === 'arriva') {
      // Corre lungo il Bancone dal lato più vicino fino al suo Piatto, con i saltelli della corsa.
      const a = this.riduci() ? 1 : limita(d.faseMs / ms('croccola', 'arriva'));
      const da = v.lato < 0 ? -c.fuori * k : VIEW.width + c.fuori * k;
      gatta.setTexture('croccola-fuga').setFlipX(v.lato > 0);
      gatta.setPosition(lerp(da, v.x, sfumato(a)), by - Math.abs(Math.sin(a * Math.PI * 3)) * c.hop * k * (1 - a));
      gatta.setAngle(0);
    } else if (d.fase === 'punta') {
      gatta.setTexture('croccola').setFlipX(false);
      const dondolio = this.riduci() ? 0 : Math.sin((ora / c.dondolio.durata) * Math.PI * 2) * c.dondolio.angolo;
      gatta.setPosition(v.x, by).setAngle(dondolio - v.affianco * c.inclina).setScale(k * v.pop, k * v.pop);
    } else {
      // Il balzo: si alza e si allunga verso il Piatto.
      const b = limita(d.faseMs / ms('croccola', 'colpo'));
      gatta.setTexture('croccola-balzo').setFlipX(false);
      const arco = this.riduci() ? 0 : Math.sin(b * Math.PI);
      gatta.setPosition(v.x - v.affianco * b * 36 * k, by - arco * c.balzo.salto * k).setAngle(-v.affianco * c.inclina * (1 - b)).setScale(k * (1 + 0.04 * b), k * (1 + c.balzo.allunga * arco));
    }
    gatta.setScale(gatta.scaleX * (d.fase === 'punta' ? 1 : v.pop), gatta.scaleY * (d.fase === 'punta' ? 1 : v.pop));
    if (d.fase === 'arriva' || !d.bersaglio) this.nascondiAnello('croccola');
    else this.anello('croccola', slot.x, slot.y - slot.alto * 0.5, slot.scala, d.colpoTraMs);
    // La zona copre lei e non il Piatto accanto: sposta il centro verso l'esterno, così il Piatto si trascina ancora.
    this.zona('croccola', gatta.x + v.affianco * 28 * k, gatta.y - 100 * k, 140 * k, 200 * k);
    v.pos = { x: gatta.x, y: gatta.y, k };
  }

  // --- Le formiche ---

  seguiFormiche(d, v) {
    const f = R.formiche;
    const indice = d.bersaglio?.indice ?? v.indice;
    v.indice = indice;
    const slot = this.piatto(indice);
    const k = slot.scala * f.scala;
    const passo = f.passo * (slot.scala / 0.9);
    // Arrivano dal lato libero del Bancone (i Piatti si riempiono da sinistra): da destra per i primi posti, da sinistra per gli ultimi.
    const da = indice < 3 ? 1 : -1;
    v.da = da;
    const { rect } = this.scene.layout.bancone;
    const cfg = DISTURBATORI.formiche;
    const arriva = cfg.arrivaSec * 1000;
    const punta = cfg.puntaSec * 1000;
    const colpo = cfg.colpoSec * 1000;
    const trascorso = d.fase === 'arriva' ? d.faseMs : d.fase === 'punta' ? arriva + Math.min(d.faseMs, punta) : arriva + punta + d.faseMs;
    // La testa della fila va dal bordo del Bancone al Piatto; le altre la seguono in fila.
    const avanza = this.riduci() ? 1 : sfumato(limita(trascorso / (arriva + punta)));
    const via = da > 0 ? rect.x + rect.w + 20 : rect.x - 20;
    const meta = slot.x + da * slot.scala * 55;
    v.testa = v.testa === undefined ? meta : lerp(v.testa, meta, 0.2);
    const xTesta = lerp(via, v.testa, avanza);
    const sale = d.fase === 'colpo' ? limita(d.faseMs / colpo) : 0;
    const ora = this.scene.time.now;
    const fase = this.riduci() ? 0 : Math.floor(ora / f.zampeMs) % 2;
    let sinistra = Infinity;
    let destra = -Infinity;
    this.formiche.forEach((formica, i) => {
      const inFila = xTesta + da * i * passo;
      // Nel colpo salgono sul Piatto: si raccolgono sopra di lui, a mucchietto.
      const sulPiatto = slot.x + (i - (this.formiche.length - 1) / 2) * passo * 0.45;
      const x = lerp(inFila, sulPiatto, sale);
      const y = slot.y - 4 * slot.scala + (i % 2) * 4 - sale * slot.alto * f.salita * (0.55 + 0.45 * ((i * 7) % 5) / 4);
      formica.setVisible(true).setTexture((i + fase) % 2 ? 'formica-b' : 'formica-a').setFlipX(da > 0).setScale(k).setPosition(x, y);
      sinistra = Math.min(sinistra, x);
      destra = Math.max(destra, x);
    });
    // Il Piatto si sporca mentre salgono: la macchia compare e lui ingrigisce.
    const dish = this.scene.dishViews[Math.max(0, Math.min(indice, this.scene.dishViews.length - 1))];
    this.macchia.setVisible(sale > 0).setPosition(slot.x, slot.y).setScale(slot.scala).setAlpha(sale);
    dish.image.setTint(mescola(0xffffff, SPORCO, sale));
    v.sporco = dish;
    if (d.fase === 'arriva' || !d.bersaglio) this.nascondiAnello('formiche');
    else this.anello('formiche', slot.x, slot.y - slot.alto * 0.5, slot.scala, d.colpoTraMs);
    // La zona copre la fila e non il Piatto, che si trascina ancora (finché non salgono sopra).
    this.zona('formiche', (sinistra + destra) / 2, slot.y - 40 * slot.scala, destra - sinistra + 50 * slot.scala, 110 * slot.scala);
    v.pos = { x: xTesta, y: slot.y, k };
  }

  // --- Il corvo ---

  posatoio() {
    const { piatti } = this.scene.layout.bancone;
    const ultimo = piatti.at(-1);
    const slot = this.piatto(this.scene.dishViews.length - 1);
    const k = slot.scala * R.corvi.scala;
    return { x: ultimo.x + ultimo.w / 2 + R.corvi.posatoio.dx * (slot.scala / 0.9), y: ultimo.y + ultimo.h + R.corvi.posatoio.dy * (slot.scala / 0.9), k };
  }

  // Dove sta il Piatto pronto di una Postazione: il corvo scende lì.
  postazione(id) {
    const view = this.scene.vistaDellaPostazione(id);
    return view ? { x: view.cima.x, y: view.iconaY, scala: view.scala, vista: view } : null;
  }

  seguiCorvi(d, v) {
    const c = R.corvi;
    const p = this.posatoio();
    const corvo = this.corvo.setVisible(true).setScale(p.k, p.k);
    const ora = this.scene.time.now;
    const ali = this.riduci() ? false : Math.floor(ora / c.batteAli) % 2 === 0;
    if (d.fase === 'arriva') {
      // Vola dall'alto a destra e si posa.
      const a = this.riduci() ? 1 : limita(d.faseMs / ms('corvi', 'arriva'));
      const da = { x: p.x + c.ingresso.dx * p.k, y: p.y + c.ingresso.dy * p.k };
      const t = sfumato(a);
      corvo.setTexture(a < 1 ? (ali ? 'corvo-ali-su' : 'corvo-ali-giu') : 'corvo').setFlipX(false);
      this.ancora(corvo, a < 1);
      corvo.setPosition(lerp(da.x, p.x, t), lerp(da.y, p.y, t)).setAngle(0);
      v.gracchia = 0;
    } else if (d.fase === 'punta') {
      // Gracchia: becco aperto e chiuso, con un saltello a ogni "kaa". Il suono (ticket 23) si aggancia a 'disturbatorePunta'.
      const ciclo = c.gracchia.aperto + c.gracchia.chiuso;
      const dentro = this.riduci() ? 0 : (ora - v.inizioPunta) % ciclo;
      const aperto = this.riduci() ? true : dentro < c.gracchia.aperto;
      corvo.setTexture(aperto ? 'corvo-gracchia' : 'corvo').setFlipX(false).setAngle(0);
      this.ancora(corvo, false);
      corvo.setPosition(p.x, p.y - (aperto && !this.riduci() ? Math.sin((dentro / c.gracchia.aperto) * Math.PI) * c.gracchia.salto * p.k * 2 : 0));
      this.suono.setVisible(aperto).setTexture('segno-suono').setFlipX(true).setOrigin(1, 0.5).setScale(p.k * 1.1)
        .setPosition(corvo.x - 62 * p.k * 2, corvo.y - 140 * p.k * 1.1);
      if (!d.bersaglio) this.nascondiAnello('corvi');
    } else {
      // La picchiata: dal posatoio al Piatto, sempre più grande e più in fretta, con le ali indietro.
      const bersaglio = d.bersaglio ? this.postazione(d.bersaglio.postazione) : null;
      const b = limita(d.faseMs / ms('corvi', 'colpo'));
      this.suono.setVisible(false);
      if (bersaglio) {
        const verso = { x: bersaglio.x, y: bersaglio.y - 8 };
        const t = b * b;
        corvo.setTexture('corvo-ali-giu').setFlipX(verso.x > p.x);
        this.ancora(corvo, true);
        corvo.setPosition(lerp(p.x, verso.x, t), lerp(p.y, verso.y, t));
        const angolo = Math.atan2(verso.y - p.y, Math.abs(verso.x - p.x));
        corvo.setRotation(verso.x > p.x ? angolo : -angolo).setScale(p.k * (1 + c.picchiata.ingrandisce * t));
        v.ultimo = { x: corvo.x, y: corvo.y };
      }
    }
    if (d.fase !== 'arriva' && d.bersaglio) {
      const bersaglio = this.postazione(d.bersaglio.postazione);
      if (bersaglio) this.anello('corvi', bersaglio.x, bersaglio.y - 38, 0.62, d.colpoTraMs);
    } else if (d.fase === 'arriva') this.nascondiAnello('corvi');
    this.zona('corvi', corvo.x, corvo.y - 70 * p.k * 2, 180 * p.k * 2, 190 * p.k * 2);
    v.pos = { x: corvo.x, y: corvo.y, k: p.k };
  }

  // I disegni del corvo in volo sono più larghi e il punto d'appoggio non è al centro in basso: si sposta l'origine così che il
  // posatoio resti sotto le zampe (le zampe stanno a 0,73 dell'altezza, e a 0,44 della larghezza).
  ancora(corvo, volo) {
    if (volo) corvo.setOrigin(0.44, 0.73);
    else corvo.setOrigin(0.52, 0.98);
  }

  // --- Gli eventi, uno per uno ---

  perEvento(evento) {
    const { chi } = evento;
    if (!this.tipi.includes(chi)) return;
    switch (evento.tipo) {
      case 'disturbatoreArrivato':
        this.comincia(chi, evento);
        break;
      case 'disturbatorePunta':
        this.punta(chi);
        break;
      case 'disturbatoreAttacca':
        this.attacca(chi);
        break;
      case 'disturbatoreScacciato':
        this.scacciato(chi);
        break;
      case 'piattoRubato':
        this.rubato(chi, evento);
        break;
      case 'piattoRovinato':
        this.rovinato(chi, evento);
        break;
      case 'disturbatoreVaVia':
        this.vaVia(chi, evento.motivo);
        break;
      default:
        break;
    }
  }

  // Arriva in scena: la vista riparte da capo (se c'era una fuga a metà, la cancella).
  comincia(chi, evento) {
    this.ferma(chi);
    this.ripulisci(chi);
    const indice = evento.bersaglio?.indice ?? 0;
    this.v[chi] = { fase: 'arriva', indice, pop: 1, lato: this.piatto(indice).x < VIEW.width / 2 ? -1 : 1, inizioPunta: 0 };
    // Maurizio alza la testa: c'è qualcuno.
    this.scene.maurizio.allerta(ms(chi, 'arriva') + 900);
  }

  punta(chi) {
    const v = this.v[chi];
    if (!v) return;
    v.inizioPunta = this.scene.time.now;
    // Croccola si acquatta: un "pop" quando cambia posa. (Il "kaa kaa" del corvo, ticket 23: suono qui.)
    if (chi === 'croccola') this.pop(v);
  }

  attacca(chi) {
    const v = this.v[chi];
    if (!v) return;
    if (chi === 'croccola') this.pop(v);
  }

  // Il "pop" di chi cambia posa: si schiaccia un poco e torna (v.pop moltiplica la scala).
  pop(v) {
    v.pop = R.croccola.pop.scala;
    this.muovi('croccola', v, { pop: 1 }, { durata: R.croccola.pop.durata, ease: 'Back.easeOut' });
  }

  scacciato(chi) {
    const v = this.v[chi];
    if (!v) return;
    this.scene.maurizio.azione('raccogli');
    this.spegniZona(chi);
    this.nascondiAnello(chi);
    this.ferma(chi);
    v.fase = 'vaVia';
    this.scene.dishViews.forEach((view) => view.image.clearTint());
  }

  // Tutto quello che è nato per un Disturbatore va via con lui.
  ripulisci(chi) {
    this.ferma(chi);
    this.spegniZona(chi);
    this.nascondiAnello(chi);
    if (chi === 'croccola') {
      this.gatta.setVisible(false).setAngle(0);
      for (const cuore of this.cuori) cuore.setVisible(false);
      for (const arco of this.archi) arco.setVisible(false);
    } else if (chi === 'formiche') {
      for (const formica of this.formiche) formica.setVisible(false);
      this.macchia.setVisible(false);
      this.scene.dishViews.forEach((view) => view.image.clearTint());
    } else {
      this.corvo.setVisible(false).setAngle(0).setFlipX(false);
      this.suono.setVisible(false);
    }
    if (this.portato?.chi === chi) {
      this.portato.immagine.destroy();
      this.portato = null;
    }
    this.v[chi] = null;
  }

  // Il Piatto rubato: sparisce dal suo posto e va con chi l'ha preso (vedi vaVia).
  rubato(chi, evento) {
    const v = this.v[chi];
    if (!v) return;
    this.ferma(chi);
    this.spegniZona(chi);
    this.nascondiAnello(chi);
    if (chi === 'corvi') {
      const bersaglio = this.postazione(evento.postazione);
      const p = bersaglio ?? { x: this.corvo.x, y: this.corvo.y, scala: 1 };
      this.portato = { chi, immagine: this.piattoTemporaneo(`${evento.piatto}-icona`, p.x, p.y, 1) };
    } else {
      const slot = this.piatto(evento.indice);
      this.portato = { chi, immagine: this.piattoTemporaneo(evento.piatto, slot.x, slot.y, slot.scala) };
    }
    v.fase = 'vaVia';
    const { immagine } = this.portato;
    this.pof(immagine.x, immagine.y - 30, R.pof);
  }

  // Le formiche hanno rovinato il Piatto: va nel cestino da solo (la macchia sopra, grigio-verde), e il cestino sobbalza.
  rovinato(chi, evento) {
    const v = this.v[chi];
    if (!v) return;
    this.ferma(chi);
    this.spegniZona(chi);
    this.nascondiAnello(chi);
    const slot = this.piatto(evento.indice);
    const piatto = this.piattoTemporaneo(evento.piatto, 0, 0, 1).setTint(SPORCO);
    const macchia = this.scene.add.image(0, 0, 'piatto-rovinato').setOrigin(0.5, 1).setDepth(6.5);
    const insieme = { x: slot.x, y: slot.y, scala: slot.scala, alpha: 1, angle: 0 };
    const metti = () => {
      piatto.setPosition(insieme.x, insieme.y).setScale(insieme.scala).setAlpha(insieme.alpha).setAngle(insieme.angle);
      macchia.setPosition(insieme.x, insieme.y).setScale(insieme.scala).setAlpha(insieme.alpha).setAngle(insieme.angle);
    };
    metti();
    this.macchia.setVisible(false);
    this.scene.dishViews.forEach((view) => view.image.clearTint());
    const { cestino } = this.scene;
    const { volo, giro, sobbalzo } = RISCONTRI.cestino;
    const arrivo = { x: cestino.x, y: cestino.y - cestino.displayHeight * 0.72 };
    const fine = () => {
      piatto.destroy();
      macchia.destroy();
      const { scaleX, scaleY } = cestino;
      cestino.setScale(scaleX * 1.12, scaleY * 0.88);
      this.muovi(chi, cestino, { scaleX, scaleY }, { durata: sobbalzo, ease: 'Back.easeOut' });
    };
    if (this.riduci()) {
      fine();
    } else {
      const tween = this.scene.tweens.add({
        targets: insieme,
        x: arrivo.x,
        y: arrivo.y,
        scala: slot.scala * 0.45,
        alpha: 0.9,
        angle: giro,
        duration: volo,
        ease: 'Back.easeIn',
        onUpdate: metti,
        onComplete: fine,
      });
      this.tweens[chi].push(tween);
    }
    this.scene.maurizio.azione('raccogli');
    v.fase = 'vaVia';
  }

  // Se ne va. `motivo` dice come: coccolata (fusa e poi via), scacciato, rubato (con il Piatto), rovinato, delusa (a mani vuote).
  vaVia(chi, motivo) {
    const v = this.v[chi];
    if (!v) return;
    v.fase = 'vaVia';
    this.spegniZona(chi);
    this.nascondiAnello(chi);
    const durata = ms(chi, 'vaVia');
    const chiudi = () => {
      this.ripulisci(chi);
    };
    if (chi === 'croccola') this.vaViaCroccola(v, motivo, durata, chiudi);
    else if (chi === 'formiche') this.vaViaFormiche(v, motivo, chiudi);
    else this.vaViaCorvi(v, motivo, durata, chiudi);
  }

  vaViaCroccola(v, motivo, durata, chiudi) {
    const c = R.croccola;
    const gatta = this.gatta.setVisible(true);
    const { k } = v.pos ?? { k: 0.7 };
    // Se ne va dal lato opposto a quello da cui è arrivata, a meno che non sia già in fondo: sempre verso il bordo più lontano.
    const verso = gatta.x < VIEW.width / 2 ? -1 : 1;
    const fuori = verso < 0 ? -c.fuori * k : VIEW.width + c.fuori * k;
    const corri = (inizio, quanto) => {
      gatta.setTexture('croccola-fuga').setFlipX(verso < 0).setAngle(0).setScale(k);
      const base = gatta.y;
      this.muovi('croccola', gatta, { x: fuori }, { durata: quanto, ease: 'Quad.easeIn', ritardo: inizio, fine: chiudi });
      this.muovi('croccola', gatta, { y: base - c.fuga.altezza * k }, { durata: quanto / (c.fuga.saltelli * 2), ease: 'Sine.easeOut', ritardo: inizio, yoyo: true, ripeti: c.fuga.saltelli * 2 - 1 });
      if (this.portato?.chi === 'croccola') {
        const piatto = this.portato.immagine;
        piatto.setScale(k * c.bocca.scalaPiatto).setOrigin(0.5, 0.7).setDepth(6);
        const lato = verso;
        const aggancia = () => piatto.setPosition(gatta.x + lato * c.bocca.dx * k, gatta.y + c.bocca.dy * k);
        aggancia();
        this.scene.events.on('update', aggancia);
        this.scene.events.once('shutdown', () => this.scene.events.off('update', aggancia));
        this.tweens.croccola.push({ remove: () => this.scene.events.off('update', aggancia) });
      }
    };
    if (motivo === 'coccolata') {
      // Le fusa: la gatta si siede, vibra, escono tre cuoricini e due archi di suono; poi se ne va.
      const fusa = durata * c.fusa.quota;
      gatta.setTexture('croccola-fusa').setFlipX(false).setScale(k, k);
      const base = { x: gatta.x, y: gatta.y };
      this.muovi('croccola', gatta, { angle: { from: -c.fusa.vibra.angolo, to: c.fusa.vibra.angolo } }, { durata: c.fusa.vibra.durata, yoyo: true, ripeti: Math.floor(fusa / c.fusa.vibra.durata / 2), ease: 'Sine.easeInOut' });
      this.cuori.forEach((cuore, i) => {
        const x = base.x + (i - 1) * 50 * k;
        const y = base.y - 225 * k;
        cuore.setVisible(true).setPosition(x, y).setAlpha(0).setScale(0.9);
        this.muovi('croccola', cuore, { y: y - c.fusa.cuoreSalita, alpha: { from: 1, to: 0 }, scale: 1.5 }, { durata: c.fusa.cuoreDurata, ritardo: i * 160, ease: 'Sine.easeOut' });
        this.scene.tweens.add({ targets: cuore, alpha: 1, duration: 120, delay: i * 160 });
      });
      this.archi.forEach((arco, i) => {
        const lato = i === 0 ? -1 : 1;
        arco.setVisible(true).setOrigin(0, 0.5).setFlipX(lato < 0).setScale(c.fusa.suono.scala * k * 1.6)
          .setPosition(base.x + lato * c.fusa.suono.dx * k, base.y - c.fusa.suono.dy * k).setAlpha(1);
        this.muovi('croccola', arco, { alpha: { from: 1, to: 0.25 } }, { durata: 260, yoyo: true, ripeti: Math.floor(fusa / 520), ease: 'Sine.easeInOut' });
      });
      this.scene.time.delayedCall(this.riduci() ? 0 : fusa, () => {
        if (this.v.croccola !== v) return;
        for (const cuore of this.cuori) cuore.setVisible(false);
        for (const arco of this.archi) arco.setVisible(false);
        gatta.setAngle(0);
        corri(0, durata - fusa);
      });
    } else {
      // Rubato (con il Piatto in bocca), delusa (a testa bassa) o scacciata: corre via.
      corri(0, motivo === 'rubato' ? durata * 0.85 : durata);
      if (motivo === 'rubato') this.pop(v);
    }
  }

  vaViaFormiche(v, motivo, chiudi) {
    const f = R.formiche;
    const verso = motivo === 'rovinato' ? 0.55 : 1;
    const durataFuga = this.riduci() ? 0 : f.dietrofront.durata * verso;
    // Girano al largo: dietrofront e via a sinistra, tutte insieme, con il "pof" dove c'erano.
    const testa = this.formiche.find((formica) => formica.visible);
    if (testa && motivo !== 'rovinato') this.pof(testa.x, testa.y - 10, f.pof * v.pos.k * 2);
    this.formiche.forEach((formica, i) => {
      formica.setFlipX(v.da < 0);
      this.muovi('formiche', formica, { x: formica.x + v.da * f.dietrofront.distanza }, { durata: durataFuga, ease: 'Quad.easeIn', ritardo: i * 20, fine: i === this.formiche.length - 1 ? chiudi : undefined });
    });
    this.zampe = this.scene.time.addEvent({
      delay: f.zampeMs / 2,
      loop: true,
      callback: () => this.formiche.forEach((formica, i) => formica.setTexture((i + Math.floor(this.scene.time.now / (f.zampeMs / 2))) % 2 ? 'formica-b' : 'formica-a')),
    });
    this.tweens.formiche.push({ remove: () => this.zampe?.remove() });
  }

  // Una nuvoletta morbida, che si apre e svanisce.
  pof(x, y, scala) {
    const pof = this.scene.add.image(x, y, 'pof').setDepth(12).setScale(scala * 0.4).setAlpha(0.9);
    this.scene.tweens.add({ targets: pof, scale: scala, alpha: 0, duration: 380, ease: 'Quad.easeOut', onComplete: () => pof.destroy() });
  }

  vaViaCorvi(v, motivo, durata, chiudi) {
    const c = R.corvi;
    const corvo = this.corvo.setVisible(true);
    const k = v.pos?.k ?? 0.5;
    this.suono.setVisible(false);
    corvo.setTexture('corvo-ali-su').setFlipX(false).setRotation(0);
    this.ancora(corvo, true);
    // Sale in alto a destra, battendo le ali. Spaventato, scatta prima e lascia cadere qualche piuma.
    const spaventato = motivo === 'scacciato';
    const batti = this.scene.time.addEvent({
      delay: c.batteAli,
      loop: true,
      callback: () => corvo.setTexture(Math.floor(this.scene.time.now / c.batteAli) % 2 ? 'corvo-ali-giu' : 'corvo-ali-su'),
    });
    this.tweens.corvi.push({ remove: () => batti.remove() });
    const sopra = { x: corvo.x + c.fuga.dx * k, y: corvo.y + c.fuga.dy * k };
    const fine = () => {
      batti.remove();
      chiudi();
    };
    this.muovi('corvi', corvo, { x: sopra.x, y: sopra.y, scale: k * 0.8 }, { durata: spaventato ? durata * 0.8 : durata, ease: 'Quad.easeIn', fine });
    if (spaventato) this.piume(corvo.x, corvo.y - 70 * k, k);
    // Il Piatto rubato sale con lui, tenuto tra le zampe.
    if (this.portato?.chi === 'corvi') {
      const piatto = this.portato.immagine;
      piatto.setOrigin(0.5, 0.2).setScale(k * 0.95);
      const aggancia = () => piatto.setPosition(corvo.x - 6 * k, corvo.y + 4 * k);
      aggancia();
      this.scene.events.on('update', aggancia);
      this.tweens.corvi.push({ remove: () => this.scene.events.off('update', aggancia) });
      this.scene.events.once('shutdown', () => this.scene.events.off('update', aggancia));
    }
  }

  // Qualche piuma che cade e svanisce, dove il corvo si è spaventato.
  piume(x, y, k) {
    for (let i = 0; i < R.corvi.piume; i++) {
      const piuma = this.scene.add.image(x + (i - 1) * 26, y, 'piuma').setDepth(11).setScale(k * 1.5).setAngle(-30 + i * 30);
      this.muovi('corvi', piuma, { y: y + 150 * k + i * 12, x: x + (i - 1) * 60, angle: piuma.angle + 90, alpha: 0 }, { durata: 1100, ease: 'Sine.easeIn', ritardo: i * 90, fine: () => piuma.destroy() });
    }
  }

  // Lo stato dei Disturbatori in dati semplici, per window.render_game_to_text(): dove sono le zone da toccare (x, y, w, h al
  // centro, in coordinate di gioco) e in che momento sono. Una zona spenta non compare.
  getTextState() {
    return this.tipi.filter((chi) => this.zone[chi].input.enabled).map((chi) => {
      const zona = this.zone[chi];
      const v = this.v[chi];
      return { chi, fase: v?.fase ?? null, x: round(zona.x), y: round(zona.y), w: round(zona.width), h: round(zona.height), anello: this.anelli[chi].visible };
    });
  }
}
