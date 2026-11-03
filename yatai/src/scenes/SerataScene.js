import { COMANDI, PALETTE, PIATTI, RISCONTRI, YATAI } from '../config.js';
import { PANEL_MARGIN } from '../disegni/catalogo.js';
import { POSTAZIONE_SIZE, postazioneKey, scortaKey } from '../disegni/postazioni.js';
import { t } from '../i18n.js';
import { textStyle } from '../kit/font.js';
import { panelTexture } from '../kit/texture.js';
import { addButton } from '../kit/ui.js';
import { center, fitIn, layoutHud } from '../layout/yatai.js';
import { azioneDaTasto } from '../serata/comandi.js';
import { Serata } from '../serata/Serata.js';
import ClienteView from '../yatai/ClienteView.js';
import YataiScene from './YataiScene.js';

const round = (n) => Math.round(n * 10) / 10;
const rectState = (r) => ({ x: round(center(r).x), y: round(center(r).y), w: round(r.w), h: round(r.h) });

// Il seme dei Clienti è diverso a ogni partita (con ?seme=… in sviluppo si ripete la stessa).
const nuovoSeme = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// A che profondità stanno le cose che vanno sopra al resto: l'HUD, quello che vola, il Piatto trascinato e
// la schermata di fine Serata.
const PROFONDITA = { hud: 10, volo: 120, trascinato: 150, fine: 200 };

// La prima Serata giocabile (passo 3 di PIANO.md): lo Yatai di YataiScene con la logica di
// src/serata/Serata.js dentro. La scena non decide niente: passa i tocchi alla Serata, fa
// avanzare il suo tempo e trasforma gli eventi che tornano indietro in disegni e movimenti.
//
//   fila       in basso, da sinistra a destra: le Scorte (riso, alga) e la Postazione (il tagliere).
//              L'onigiri si fa a tocchi: riso, alga, poi si prende (ticket 33)
//   input      tocco e tasti → tocca(Scorta o Postazione) e servi(Posto); trascinare un Piatto dal
//              Bancone su un Cliente fa la stessa cosa di toccare il Cliente
//   riscontri  Maurizio, monete, cuoricini, Cliente che scuote la testa o se ne va
//   fine       a 120 secondi compare la schermata con Incasso e stelle
//
// Dati di avvio, tutti facoltativi: matsuri (il tema, come YataiScene), seme (solo per ripetere
// una partita: di norma ogni partita ha il suo).
export default class SerataScene extends YataiScene {
  constructor() {
    super('serata');
  }

  init(data) {
    this.seme = data?.seme ?? nuovoSeme();
    this.serata = new Serata({ seed: this.seme });
    super.init({
      matsuri: data?.matsuri,
      posti: this.serata.posti.length,
      postazioni: this.serata.fila().length,
      demo: false,
    });
    this.pronta = false;
    this.incassoMostrato = 0;
    this.inVolo = 0;
    this.visibili = 0;
    this.anticipati = new Set();
    this.trascina = null;
    this.origineVolo = null;
    this.tempoMostrato = null;
    this.stelleHud = 0;
    this.fineUI = null;
    this.risultato = null;
    this.registro = [];
    this.contatori = {};
  }

  create() {
    super.create();
    // Nella Serata non c'è il ritorno al menu di sviluppo.
    this.back?.destroy();
    this.back = null;

    this.serata.fila().forEach(({ id, voce, piatto }, i) => {
      const view = this.stationViews[i];
      view.id = id;
      view.voce = voce;
      view.piatto = piatto;
      if (voce === 'scorta') {
        // Una Scorta è solo da toccare: il disegno dell'Ingrediente e il suo nome.
        view.image.setTexture(scortaKey(id)).setDepth(1);
        view.label.setText(t(`ingrediente_${id}`));
        // L'alone dietro la Scorta che aspetta il Piatto, sempre visibile in ogni Serata: respira piano.
        view.glow = this.add.graphics().setDepth(0.5).setVisible(false);
        this.tweens.add({ targets: view.glow, alpha: { from: 0.4, to: 1 }, duration: RISCONTRI.evidenzia.durata, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        return;
      }
      view.image.setTexture(postazioneKey(piatto));
      view.label.setText(t(`piatto_${piatto}`));
      view.barra = this.add.graphics().setDepth(PROFONDITA.hud);
      view.pronto = this.add.image(0, 0, `${piatto}-icona`).setOrigin(0.5, 1).setVisible(false).setDepth(PROFONDITA.hud);
      view.statoVisto = 'libera';
      view.ondeggia = null;
      // La ricetta sul tagliere: un'icona per Ingrediente, spenta finché non è nel Piatto.
      view.passi = (PIATTI[piatto].ricetta ?? []).map(({ ingrediente }) => {
        const icona = this.add.image(0, 0, scortaKey(ingrediente)).setOrigin(0.5, 1).setAlpha(RISCONTRI.passoSpento).setDepth(PROFONDITA.hud);
        icona.acceso = false;
        return icona;
      });
    });
    this.dishViews.forEach((view, i) => view.zone.on('pointerdown', (pointer) => this.iniziaTrascinamento(i, pointer)));

    this.clienti = this.serata.posti.map((_, i) => new ClienteView(this, i));
    this.creaHud();

    this.input.keyboard.on('keydown', this.suTasto, this);
    this.input.on('pointermove', this.suMovimento, this);
    this.input.on('pointerup', this.suRilascio, this);
    this.input.on('gameout', this.suUscita, this);
    this.events.once('shutdown', () => {
      this.input.keyboard?.off('keydown', this.suTasto, this);
      this.input.off('pointermove', this.suMovimento, this);
      this.input.off('pointerup', this.suRilascio, this);
      this.input.off('gameout', this.suUscita, this);
    });

    this.pronta = true;
    this.relayout();
  }

  // --- Layout ---

  relayout() {
    super.relayout();
    if (!this.pronta) return;
    this.layout.posti.forEach((rect, i) => this.clienti[i].place(rect));
    this.disponiPostazioni();
    this.disponiHud();
    if (this.fineUI) this.costruisciFine(true);
  }

  // La cima di ogni Postazione: sopra ci stanno la barra della cottura e il Piatto pronto.
  disponiPostazioni() {
    const etichetta = YATAI.postazioni.altezzaEtichetta;
    this.layout.postazioni.forEach((rect, i) => {
      const view = this.stationViews[i];
      const disegno = fitIn({ ...rect, h: rect.h - etichetta }, POSTAZIONE_SIZE.w, POSTAZIONE_SIZE.h);
      view.cima = { x: disegno.x, y: disegno.y - POSTAZIONE_SIZE.h * disegno.scale };
      view.larghezza = POSTAZIONE_SIZE.w * disegno.scale;
      view.scala = disegno.scale;
      // Dove poggiano la barra della cottura e il Piatto pronto: appena sopra il piano del tagliere.
      view.barraY = view.cima.y + YATAI.postazioni.barraDallaCima * disegno.scale;
      view.iconaY = view.cima.y + YATAI.postazioni.piattoDallaCima * disegno.scale;
      if (view.voce === 'scorta') {
        const { larghezza, altezza, dallaCima } = RISCONTRI.evidenzia;
        const giallo = (colore) => Number.parseInt(colore.slice(1), 16);
        view.glow.setPosition(view.cima.x, view.cima.y + dallaCima * disegno.scale).clear();
        view.glow.fillStyle(giallo(PALETTE.giallo.luce), 1).fillEllipse(0, 0, view.larghezza * larghezza, view.larghezza * altezza);
        view.glow.lineStyle(4, giallo(PALETTE.giallo.colore), 1).strokeEllipse(0, 0, view.larghezza * larghezza, view.larghezza * altezza);
        return;
      }
      view.pronto.setPosition(view.cima.x, view.iconaY);
      view.ondeggia?.remove();
      view.ondeggia = null;
      view.statoVisto = 'libera';
      // Le icone della ricetta stanno in fila sopra il tagliere, dove poi compare il Piatto pronto.
      const { scala, spazio, altezza } = RISCONTRI.passo;
      view.passi.forEach((icona, k) => {
        icona.setPosition(view.cima.x + (k - (view.passi.length - 1) / 2) * spazio * disegno.scale, view.cima.y + altezza * disegno.scale);
        icona.setScale(scala * disegno.scale);
      });
    });
  }

  // --- HUD: l'Incasso, il tempo e la barra con le stelle ---

  creaHud() {
    const soglie = this.serata.stato().sogliaStelle;
    this.soglie = soglie;
    this.frazioni = soglie.map((soglia) => soglia / soglie.at(-1));
    this.hud = {
      pista: null,
      riempimento: this.add.graphics().setDepth(PROFONDITA.hud + 1),
      moneta: this.add.image(0, 0, 'moneta').setDepth(PROFONDITA.hud + 2),
      incasso: this.add.text(0, 0, '0', textStyle(46, { bold: true, outline: 7 })).setOrigin(0, 0.5).setDepth(PROFONDITA.hud + 2),
      tempo: this.add.text(0, 0, '', textStyle(46, { bold: true, outline: 7 })).setOrigin(1, 0.5).setDepth(PROFONDITA.hud + 2),
      stelle: soglie.map(() => this.add.image(0, 0, 'stella-vuota').setDepth(PROFONDITA.hud + 2)),
    };
  }

  // Un pannello centrato in (cx, cy): l'origine tiene conto del margine e dell'ombra della texture.
  pannello(cx, cy, w, h, swatch) {
    const [pw, ph] = [Math.round(w), Math.round(h)];
    const image = this.add.image(cx, cy, panelTexture(this, pw, ph, swatch));
    return image.setOrigin(0.5, (PANEL_MARGIN + ph / 2) / image.height);
  }

  disponiHud() {
    const hud = layoutHud(this.layout.zone.hud, this.frazioni);
    this.hudLayout = hud;
    const { moneta, incasso, tempo, barra, stelle } = hud;
    this.hud.moneta.setPosition(moneta.x, moneta.y).setScale(moneta.lato / 60);
    this.hud.incasso.setPosition(incasso.x, incasso.y);
    this.hud.tempo.setPosition(tempo.x, tempo.y);
    this.hud.pista?.destroy();
    this.hud.pista = this.pannello(barra.x + barra.w / 2, barra.y + barra.h / 2, barra.w, barra.h, 'nuvola').setDepth(PROFONDITA.hud);
    stelle.forEach((s, i) => this.hud.stelle[i].setPosition(s.x, s.y).setScale(s.lato / 66));
    this.disegnaBarra();
    this.aggiornaTempo(true);
  }

  disegnaBarra() {
    const { barra } = this.hudLayout;
    const frazione = Math.min(1, this.incassoMostrato / this.soglie.at(-1));
    const g = this.hud.riempimento;
    g.clear();
    if (frazione > 0) {
      g.fillStyle(0xf7a8c4, 1);
      g.fillRoundedRect(barra.x + 4, barra.y + 4, Math.max(8, (barra.w - 8) * frazione), barra.h - 8, 7);
    }
  }

  // Il tempo che resta, come m:ss. Cambia una volta al secondo: negli ultimi secondi diventa rosso.
  aggiornaTempo(forza = false) {
    const secondi = Math.ceil(this.serata.stato().restaMs / 1000);
    if (secondi === this.tempoMostrato && !forza) return;
    const primo = this.tempoMostrato === null;
    this.tempoMostrato = secondi;
    const testo = `${Math.floor(secondi / 60)}:${String(secondi % 60).padStart(2, '0')}`;
    const rosso = secondi <= RISCONTRI.tempoRosso;
    this.hud.tempo.setText(testo).setColor(rosso ? '#d9534f' : PALETTE.inchiostro);
    if (rosso && !primo && secondi > 0) {
      this.hud.tempo.setScale(1.18);
      this.tweens.add({ targets: this.hud.tempo, scale: 1, duration: 320, ease: 'Back.easeOut' });
    }
  }

  // Gli Yen che arrivano nell'Incasso, una moneta alla volta.
  accredita(yen) {
    this.incassoMostrato += yen;
    this.hud.incasso.setText(String(this.incassoMostrato));
    this.disegnaBarra();
    // La moneta fa un saltino solo quando entrano Yen: la Spesa scende senza festa.
    if (yen > 0) {
      this.hud.moneta.setScale((this.hudLayout.moneta.lato / 60) * 1.35);
      this.tweens.add({ targets: this.hud.moneta, scale: this.hudLayout.moneta.lato / 60, duration: 200, ease: 'Back.easeOut' });
    }
    // L'Incasso è il netto e può anche scendere: una stella si accende arrivando alla soglia e si
    // spegne se la Spesa riporta sotto.
    this.soglie.forEach((soglia, i) => {
      const stella = this.hud.stelle[i];
      const accesa = stella.texture.key === 'stella';
      if (this.incassoMostrato < soglia) {
        if (accesa) stella.setTexture('stella-vuota');
        return;
      }
      if (accesa) return;
      stella.setTexture('stella').setScale((this.hudLayout.stelle[i].lato / 66) * 1.6);
      this.tweens.add({ targets: stella, scale: this.hudLayout.stelle[i].lato / 66, duration: 380, ease: 'Back.easeOut' });
    });
  }

  // La Spesa: un "−20" piccolo che scende sotto l'Incasso, e l'Incasso scende subito.
  spendi(yen) {
    const { incasso } = this.hudLayout;
    const { durata, discesa } = RISCONTRI.spesa;
    const testo = this.add.text(incasso.x + 8, incasso.y + 30, `−${yen}`, textStyle(28, { bold: true, color: '#d9534f', outline: 6 })).setOrigin(0, 0.5).setDepth(PROFONDITA.volo);
    this.tweens.add({ targets: testo, y: testo.y + discesa, alpha: 0, duration: durata, ease: 'Quad.easeIn', onComplete: () => testo.destroy() });
    this.accredita(-yen);
  }

  // --- Il ciclo ---

  update(time, delta) {
    if (!this.pronta) return;
    this.esegui(this.serata.update(Math.min(delta, RISCONTRI.dtMaxMs)));
    this.aggiornaVista();
  }

  // Quello che si legge dallo stato a ogni frame: il Bancone, le Postazioni e il tempo. Tutto il
  // resto (Clienti, cuoricini, Incasso) cambia solo quando arriva un evento.
  aggiornaVista() {
    const stato = this.serata.stato();
    this.visibili = Math.max(0, Math.min(stato.bancone.length - this.inVolo, this.dishViews.length));
    this.dishViews.forEach((view, i) => {
      const visibile = i < this.visibili;
      view.image.setVisible(visibile);
      view.shadow.setVisible(visibile);
    });
    // Le Scorte che qualche Postazione aspetta (il prossimo Ingrediente) hanno l'alone.
    const attese = new Set(stato.postazioni.map((p) => p.prossimo).filter(Boolean));
    this.stationViews.forEach((view) => {
      if (view.voce === 'postazione') this.aggiornaPostazione(view, stato.postazioni.find((p) => p.id === view.id));
      else view.glow.setVisible(attese.has(view.id));
    });
    this.aggiornaTempo();
  }

  // Le icone della ricetta: si accendono (con un saltino) una a una e spariscono quando l'onigiri è finito.
  aggiornaPassi(view, postazione) {
    view.passi.forEach((icona, k) => {
      icona.setVisible(postazione.stato !== 'pronto');
      const acceso = k < postazione.fatti;
      if (acceso === icona.acceso) return;
      icona.acceso = acceso;
      icona.setAlpha(acceso ? 1 : RISCONTRI.passoSpento);
      if (!acceso) return;
      const scala = RISCONTRI.passo.scala * view.scala;
      icona.setScale(scala * 1.7);
      this.tweens.add({ targets: icona, scale: scala, duration: 220, ease: 'Back.easeOut' });
    });
  }

  aggiornaPostazione(view, postazione) {
    const { barra, pronto } = view;
    this.aggiornaPassi(view, postazione);
    if (postazione.stato === 'cuoce') {
      const frazione = 1 - postazione.restaMs / (PIATTI[postazione.piatto].cookSec * 1000);
      const w = view.larghezza * 0.62;
      barra.clear().setVisible(true);
      barra.fillStyle(0xfff8ec, 1).fillRoundedRect(view.cima.x - w / 2, view.barraY, w, 16, 8);
      barra.fillStyle(0x93d69a, 1).fillRoundedRect(view.cima.x - w / 2 + 3, view.barraY + 3, Math.max(6, (w - 6) * frazione), 10, 5);
      barra.lineStyle(3, 0x3a2f2b, 1).strokeRoundedRect(view.cima.x - w / 2, view.barraY, w, 16, 8);
    } else {
      barra.clear().setVisible(false);
    }
    if (postazione.stato === view.statoVisto) return;
    view.statoVisto = postazione.stato;
    view.ondeggia?.remove();
    view.ondeggia = null;
    pronto.setVisible(postazione.stato === 'pronto').setPosition(view.cima.x, view.iconaY);
    if (postazione.stato === 'pronto') {
      // Il Piatto pronto salta fuori e poi ondeggia, perché lo si tocchi.
      const { durata, ampiezza } = RISCONTRI.pronto;
      pronto.setScale(0.2);
      this.tweens.add({ targets: pronto, scale: 1, duration: durata * 0.6, ease: 'Back.easeOut' });
      view.ondeggia = this.tweens.add({ targets: pronto, y: view.iconaY - ampiezza, duration: durata, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: durata * 0.6 });
    }
  }

  // --- Input: tocco, tasti, trascinamento ---

  // L'unico punto da cui passano tocco e tasti. Il Piatto trascinato arriva a serviPosto() per un'altra strada.
  touch(tipo, indice) {
    this.lastTouch = { tipo, indice, timeMs: Math.round(this.time.now) };
    this.events.emit('tocco', { tipo, indice });
    if (!this.pronta || this.serata.finita) return;
    if (tipo === 'postazione') this.esegui(this.serata.tocca(this.stationViews[indice].id));
    else if (tipo === 'posto') this.serviPosto(indice);
  }

  serviPosto(indice) {
    const eventi = this.serata.servi(indice);
    this.esegui(eventi);
    return eventi;
  }

  // Un tasto: la scena chiede a comandi.js che azione è e poi fa come per un tocco. Un tasto per un
  // Posto o una Postazione che non c'è (la quarta, la quinta) non fa niente.
  suTasto(event) {
    if (event.repeat) return;
    const azione = azioneDaTasto(event.code);
    if (!azione) return;
    if (azione.tipo === 'rigioca') {
      if (this.fineUI) this.rigioca();
      return;
    }
    const esistono = azione.tipo === 'posto' ? this.seatViews : this.stationViews;
    if (azione.indice < esistono.length) this.touch(azione.tipo, azione.indice);
  }

  // Si prende un Piatto dal Bancone: una copia segue il dito e il Piatto resta lì, più sbiadito, finché
  // non lo si lascia.
  iniziaTrascinamento(indice, pointer) {
    if (!this.pronta || this.serata.finita || this.trascina || indice >= this.visibili) return;
    const view = this.dishViews[indice];
    const copia = this.add.image(pointer.x, pointer.y, 'onigiri').setOrigin(0.5, 0.8).setScale(view.image.scaleX * 1.12).setDepth(PROFONDITA.trascinato);
    this.trascina = { indice, copia, sopra: -1 };
    view.image.setAlpha(0.35);
  }

  suMovimento(pointer) {
    const d = this.trascina;
    if (!d) return;
    d.copia.setPosition(pointer.x, pointer.y);
    const sopra = this.postoSotto(pointer.x, pointer.y);
    if (sopra !== d.sopra) {
      this.clienti.forEach((cliente, i) => cliente.evidenzia(i === sopra));
      d.sopra = sopra;
    }
  }

  suRilascio(pointer) {
    this.fineTrascinamento(pointer, false);
  }

  suUscita() {
    this.fineTrascinamento(null, true);
  }

  // Il Posto più vicino al punto (x, y), se il punto è nella fascia dei Clienti (o appena sotto, sullo
  // sgabello); altrimenti -1. Un dito che sfiora lo spazio tra due Clienti sceglie il più vicino.
  postoSotto(x, y) {
    const { clienti } = this.layout.zone;
    if (y < clienti.y || y > clienti.y + clienti.h + 40) return -1;
    let migliore = -1;
    let distanza = Infinity;
    this.layout.posti.forEach((rect, i) => {
      const d = Math.abs(center(rect).x - x);
      if (d < distanza) [migliore, distanza] = [i, d];
    });
    return migliore;
  }

  fineTrascinamento(pointer, annulla) {
    const d = this.trascina;
    if (!d) return;
    this.trascina = null;
    this.clienti.forEach((cliente) => cliente.evidenzia(false));
    const view = this.dishViews[d.indice];
    const posto = annulla || this.serata.finita ? -1 : this.postoSotto(pointer.x, pointer.y);
    let servito = false;
    if (posto >= 0) {
      this.lastTouch = { tipo: 'posto', indice: posto, via: 'trascinamento', timeMs: Math.round(this.time.now) };
      this.events.emit('tocco', { tipo: 'posto', indice: posto });
      this.origineVolo = { x: d.copia.x, y: d.copia.y };
      servito = this.serviPosto(posto).some((e) => e.tipo === 'servito');
      this.origineVolo = null;
    }
    if (servito) {
      this.contatori.trascinamentiRiusciti = (this.contatori.trascinamentiRiusciti ?? 0) + 1;
      d.copia.destroy();
      view.image.setAlpha(1);
      return;
    }
    // Non è stato servito nessuno: il Piatto torna al suo posto.
    this.tweens.add({
      targets: d.copia,
      x: view.image.x,
      y: view.image.y - 10,
      scale: view.image.scaleX,
      duration: RISCONTRI.piatto.vola * 0.8,
      ease: 'Quad.easeOut',
      onComplete: () => {
        d.copia.destroy();
        view.image.setAlpha(1);
      },
    });
  }

  // --- Gli eventi della Serata, uno per uno ---

  esegui(eventi) {
    for (const evento of eventi) {
      this.registra(evento);
      this.perEvento(evento);
    }
  }

  registra(evento) {
    this.contatori[evento.tipo] = (this.contatori[evento.tipo] ?? 0) + 1;
    this.registro.push({ tempoMs: this.serata.tempoMs, tipo: evento.tipo, posto: evento.posto ?? null, postazione: evento.postazione ?? null });
    if (this.registro.length > 16) this.registro.shift();
  }

  vistaDellaPostazione(id) {
    return this.stationViews.find((view) => view.id === id);
  }

  perEvento(evento) {
    switch (evento.tipo) {
      case 'clienteArrivato':
        this.clienti[evento.posto].arriva(evento.cliente);
        break;
      case 'cuoreSpento':
        this.clienti[evento.posto].impostaCuori(evento.cuori, true);
        break;
      case 'clienteVaVia':
        this.clienti[evento.posto].vaVia();
        break;
      case 'scuoteTesta':
        this.clienti[evento.posto].scuoti();
        break;
      case 'cotturaIniziata': {
        this.maurizio.azione('cuoci');
        const { image } = this.vistaDellaPostazione(evento.postazione);
        const { scaleX, scaleY } = image;
        this.tweens.add({ targets: image, scaleX: scaleX * 1.08, scaleY: scaleY * 0.93, duration: 90, yoyo: true, onComplete: () => image.setScale(scaleX, scaleY) });
        break;
      }
      case 'ingrediente':
        this.perIngrediente(evento);
        break;
      case 'ingredienteRifiutato':
        this.scuotiPostazione(evento.scorta);
        break;
      case 'nienteDaPrendere':
        this.scuotiPostazione(evento.postazione);
        break;
      case 'postazioneOccupata': {
        // Un tocco un attimo prima che il Piatto sia pronto non va perso (input buffering).
        const postazione = this.serata.stato().postazioni.find((p) => p.id === evento.postazione);
        if (postazione && postazione.restaMs <= COMANDI.anticipoMs) this.anticipati.add(evento.postazione);
        break;
      }
      case 'piattoPronto':
        if (this.anticipati.delete(evento.postazione)) this.esegui(this.serata.tocca(evento.postazione));
        break;
      case 'sulBancone':
        this.perSulBancone(evento);
        break;
      case 'banconePieno':
        this.scuotiPiattoPronto(evento.postazione);
        break;
      case 'servito':
        this.perServito(evento);
        break;
      case 'mancia':
        this.perMancia(evento);
        break;
      case 'moneta':
        this.perMoneta(evento);
        break;
      case 'serataFinita':
        this.perFine(evento);
        break;
      default:
        break;
    }
  }

  // Un tween di un oggetto che vola da (da.x, da.y) a (a.x, a.y) e poi sparisce. x e y hanno ease diversi
  // (curva a parabola); alla fine `fine` fa quello che serve.
  vola(texture, da, a, { durata, scalaDa, scalaA, alphaA = 1, ritardo = 0, origineY = 1, easeY = 'Quad.easeInOut', fine }) {
    const oggetto = this.add.image(da.x, da.y, texture).setOrigin(0.5, origineY).setScale(scalaDa).setDepth(PROFONDITA.volo);
    this.tweens.add({ targets: oggetto, x: a.x, duration: durata, delay: ritardo, ease: 'Sine.easeInOut' });
    this.tweens.add({
      targets: oggetto,
      y: a.y,
      scale: scalaA,
      alpha: alphaA,
      duration: durata,
      delay: ritardo,
      ease: easeY,
      onComplete: () => {
        oggetto.destroy();
        fine?.();
      },
    });
  }

  // Un Ingrediente nel Piatto: la Scorta salta, l'Ingrediente vola sul tagliere, Maurizio lavora e
  // la Spesa scende sotto l'Incasso.
  perIngrediente(evento) {
    this.maurizio.azione('cuoci');
    const scorta = this.vistaDellaPostazione(evento.scorta);
    const tagliere = this.vistaDellaPostazione(evento.postazione);
    const { scaleX, scaleY } = scorta.image;
    this.tweens.add({ targets: scorta.image, scaleX: scaleX * 1.08, scaleY: scaleY * 0.93, duration: 90, yoyo: true, onComplete: () => scorta.image.setScale(scaleX, scaleY) });
    const icona = tagliere.passi[evento.fatti - 1];
    this.vola(scortaKey(evento.scorta), { x: scorta.cima.x, y: scorta.cima.y + POSTAZIONE_SIZE.h * scorta.scala * 0.7 }, { x: icona.x, y: icona.y }, {
      durata: RISCONTRI.ingrediente.vola,
      scalaDa: scorta.scala * 0.5,
      scalaA: RISCONTRI.passo.scala * tagliere.scala,
      alphaA: 0.4,
    });
    this.spendi(evento.costo);
  }

  // Un tocco che non serve a niente (Ingrediente fuori ordine, onigiri non ancora finito): la
  // Postazione o la Scorta scuote la testa, senza costo.
  scuotiPostazione(id) {
    const { image } = this.vistaDellaPostazione(id);
    image.setAngle(0);
    this.tweens.add({ targets: image, angle: { from: -8, to: 8 }, duration: 70, yoyo: true, repeat: 2, ease: 'Sine.easeInOut', onComplete: () => image.setAngle(0) });
  }

  // Il Bancone è pieno: il Piatto pronto ondeggia di lato, come a dire "non so dove metterlo".
  scuotiPiattoPronto(id) {
    const { pronto } = this.vistaDellaPostazione(id);
    pronto.setAngle(0);
    this.tweens.add({ targets: pronto, angle: { from: -14, to: 14 }, duration: 70, yoyo: true, repeat: 2, ease: 'Sine.easeInOut', onComplete: () => pronto.setAngle(0) });
  }

  // Il Piatto pronto passa dalla Postazione al primo posto libero del Bancone.
  perSulBancone(evento) {
    this.maurizio.azione('raccogli');
    const postazione = this.vistaDellaPostazione(evento.postazione);
    const slot = this.dishViews[Math.min(this.serata.bancone.length - 1, this.dishViews.length - 1)];
    this.inVolo += 1;
    this.vola(evento.piatto, { x: postazione.cima.x, y: postazione.iconaY }, { x: slot.image.x, y: slot.image.y }, {
      durata: RISCONTRI.piatto.vola,
      scalaDa: slot.image.scaleX * 0.5,
      scalaA: slot.image.scaleX,
      fine: () => {
        this.inVolo -= 1;
        // Atterra con uno schiacciamento.
        const scala = slot.image.scaleX;
        slot.image.setScale(scala * 1.12, scala * 0.88);
        this.tweens.add({ targets: slot.image, scaleX: scala, scaleY: scala, duration: 160, ease: 'Back.easeOut' });
      },
    });
  }

  // Il Cliente è servito: i Piatti volano da lui, lui si rallegra e Maurizio fa festa.
  perServito(evento) {
    this.maurizio.azione('servi');
    const cliente = this.clienti[evento.posto];
    cliente.servito();
    const arrivo = cliente.centro();
    evento.piatti.forEach((piatto, i) => {
      const slot = this.dishViews[Math.max(0, this.visibili - 1 - i)];
      const partenza = this.origineVolo ?? { x: slot.image.x, y: slot.image.y };
      this.vola(piatto, partenza, { x: arrivo.x, y: arrivo.y + 40 }, {
        durata: RISCONTRI.piatto.vola,
        ritardo: i * 70,
        scalaDa: slot.image.scaleX,
        scalaA: slot.image.scaleX * 0.35,
        alphaA: 0.2,
      });
    });
  }

  // La Mancia: tanti cuoricini quanti ne restavano di Pazienza, che salgono a ventaglio.
  perMancia(evento) {
    const { x, y } = this.clienti[evento.posto].centro();
    const { durata, salita } = RISCONTRI.mancia;
    for (let i = 0; i < evento.cuori; i++) {
      const cuore = this.add.image(x, y - 40, 'cuore').setScale(0.2).setDepth(PROFONDITA.volo);
      const dx = (i - (evento.cuori - 1) / 2) * 38;
      this.tweens.add({ targets: cuore, x: x + dx, y: y - 40 - salita - (i % 2) * 24, scale: 0.62, duration: durata * 0.35, delay: i * 40, ease: 'Back.easeOut' });
      this.tweens.add({ targets: cuore, alpha: 0, y: `-=${salita * 0.6}`, duration: durata * 0.5, delay: i * 40 + durata * 0.5, ease: 'Quad.easeIn', onComplete: () => cuore.destroy() });
    }
  }

  // Il pagamento: la scritta "+150" sul Cliente e le monete che volano verso l'Incasso.
  perMoneta(evento) {
    const { x, y } = this.clienti[evento.posto].centro();
    // La scritta sta dove c'era la nuvoletta (a questo punto è sparita), non sulla faccia.
    const { nuvoletta } = this.clienti[evento.posto].geom;
    const sommaY = nuvoletta.y + nuvoletta.h * 0.45;
    const somma = this.add.text(x, sommaY, `+${evento.yen}`, textStyle(54, { bold: true, color: '#f7d26a', outline: 10, outlineColor: PALETTE.inchiostro })).setOrigin(0.5).setDepth(PROFONDITA.volo).setScale(0.4);
    const { durata, salita } = RISCONTRI.somma;
    this.tweens.add({ targets: somma, scale: 1, duration: durata * 0.25, ease: 'Back.easeOut' });
    this.tweens.add({ targets: somma, y: sommaY - salita, alpha: 0, duration: durata * 0.55, delay: durata * 0.45, ease: 'Quad.easeIn', onComplete: () => somma.destroy() });

    const { scaglione, max, durata: volo, ritardo } = RISCONTRI.monete;
    const quante = Math.max(1, Math.min(max, Math.round(evento.yen / scaglione)));
    const quota = Math.floor(evento.yen / quante);
    const { moneta } = this.hudLayout;
    for (let i = 0; i < quante; i++) {
      const valore = i === quante - 1 ? evento.yen - quota * (quante - 1) : quota;
      // Le monete partono sparpagliate attorno al Cliente, a ventaglio.
      const partenza = { x: x + (i - (quante - 1) / 2) * 30, y: y + 10 - (i % 2) * 22 };
      this.vola('moneta', partenza, { x: moneta.x, y: moneta.y }, {
        durata: volo,
        ritardo: i * ritardo,
        scalaDa: 0.5,
        scalaA: 0.7,
        origineY: 0.5,
        easeY: 'Quad.easeIn',
        fine: () => this.accredita(valore),
      });
    }
  }

  // --- La fine della Serata ---

  perFine(evento) {
    this.risultato = evento;
    this.fineTrascinamento(null, true);
    this.time.delayedCall(RISCONTRI.fine.ritardo, () => this.costruisciFine(false));
  }

  // La schermata di fine Serata: titolo, stelle che si accendono una a una, Incasso che sale,
  // il numero dei Clienti e il pulsante per rigiocare. `subito` la mostra già finita (dopo un
  // ridimensionamento).
  costruisciFine(subito) {
    this.fineUI?.container.destroy();
    const r = this.risultato;
    const { width: W, height: H } = this.scale;
    const cx = W / 2;
    const cima = Math.max(40, (H - 980) / 2);
    const contenitore = this.add.container(0, 0).setDepth(PROFONDITA.fine);
    const oggetti = [];

    const velo = this.add.rectangle(0, 0, W, H, 0x3a2f2b, 0.5).setOrigin(0).setInteractive();
    oggetti.push(velo);
    oggetti.push(this.pannello(cx, cima + 490, 600, 980, 'nuvola'));
    oggetti.push(this.add.text(cx, cima + 84, t('endTitle'), textStyle(58, { bold: true, outline: 10 })).setOrigin(0.5));

    const stelle = [0, 1, 2].map((i) => this.add.image(cx + (i - 1) * 170, cima + 245, 'stella-vuota').setScale(2.1));
    oggetti.push(...stelle);
    // Con l'Incasso in rosso il commento è gentile e spiega cosa è successo (GAME_SPEC.md, "Ingredienti e Spreco").
    const commento = r.incasso < 0 ? t('endRosso') : t(`endVoto${r.stelle}`);
    oggetti.push(this.add.text(cx, cima + 372, commento, { ...textStyle(34, { bold: true, outline: 6 }), align: 'center', wordWrap: { width: 540 } }).setOrigin(0.5));

    oggetti.push(this.add.text(cx, cima + 445, t('endIncasso'), textStyle(36, { bold: true, outline: 6 })).setOrigin(0.5));
    const moneta = this.add.image(cx - 100, cima + 520, 'moneta').setScale(1.3);
    const incasso = this.add.text(cx - 50, cima + 520, String(r.incasso), textStyle(88, { bold: true, outline: 12 })).setOrigin(0, 0.5);
    // La moneta e il numero stanno centrati insieme, misurati sul numero finale: mentre sale resta fermo.
    const larghezza = 78 + 22 + incasso.width;
    if (!subito) incasso.setText('0');
    moneta.setX(cx - larghezza / 2 + 39);
    incasso.setX(cx - larghezza / 2 + 100);
    oggetti.push(moneta, incasso);

    // Il netto in grande, poi da dove viene: Vendite, Spesa (gli Ingredienti pagati) e quanta di questa è Spreco.
    [
      ['endVendite', r.vendite],
      ['endSpesa', r.spesa],
      ['endSpreco', r.spreco],
      ['endObiettivo', r.obiettivo],
      ['endServiti', r.serviti],
      ['endPersi', r.persi],
    ].forEach(([chiave, valore], i) => {
      oggetti.push(this.add.text(cx, cima + 590 + i * 40,`${t(chiave)}: ${valore}`, textStyle(30, { outline: 5 })).setOrigin(0.5));
    });

    const pulsante = addButton(this, cx, cima + 890, 420, 110, t('endRigioca'), 'menta', () => this.rigioca());
    oggetti.push(pulsante.image, pulsante.text);
    contenitore.add(oggetti);

    this.fineUI = { container: contenitore, stelle, pulsante, rigioca: { x: cx, y: cima + 890, w: 420, h: 110 }, stelleAccese: 0 };
    const accendi = (i) => {
      stelle[i].setTexture('stella').setScale(2.9);
      this.tweens.add({ targets: stelle[i], scale: 2.1, duration: RISCONTRI.fine.stella, ease: 'Back.easeOut' });
      this.fineUI.stelleAccese = i + 1;
    };
    if (subito) {
      for (let i = 0; i < r.stelle; i++) stelle[i].setTexture('stella').setScale(2.1);
      this.fineUI.stelleAccese = r.stelle;
      return;
    }
    // L'Incasso sale da zero e le stelle si accendono una dopo l'altra.
    const conta = { valore: 0 };
    this.tweens.add({
      targets: conta,
      valore: r.incasso,
      duration: RISCONTRI.fine.conta,
      ease: 'Quad.easeOut',
      onUpdate: () => incasso.setText(String(Math.round(conta.valore))),
      onComplete: () => incasso.setText(String(r.incasso)),
    });
    for (let i = 0; i < r.stelle; i++) this.time.delayedCall(RISCONTRI.fine.conta * 0.4 + i * RISCONTRI.fine.stella, () => this.fineUI && accendi(i));
  }

  rigioca() {
    this.scene.restart({ matsuri: this.matsuri });
  }

  // --- Lo stato, per i test e per giocare senza guardare lo schermo ---

  getTextState() {
    const base = super.getTextState();
    const stato = this.serata.stato();
    return {
      ...base,
      seme: this.seme,
      // La partita com'è nella logica: Clienti, Ordini, cuoricini, Bancone, Postazioni, Incasso, tempo.
      serata: stato,
      // La fila vicino al pollice, da sinistra a destra: `tipo` dice se è una Scorta o una Postazione.
      // Una Postazione dice anche in che stato è e quale Scorta aspetta (`prossimo`).
      postazioni: base.postazioni.map((p, i) => {
        const view = this.stationViews[i];
        const logica = view.voce === 'postazione' ? stato.postazioni.find((q) => q.id === view.id) : null;
        return {
          ...p,
          id: view.id,
          tipo: view.voce,
          stato: logica?.stato ?? null,
          fatti: logica?.fatti ?? null,
          prossimo: logica?.prossimo ?? null,
          // Per una Scorta: ha l'alone, cioè è il prossimo Ingrediente che un Piatto aspetta.
          evidenziata: view.glow ? view.glow.visible : null,
          pronto: view.pronto ? { visibile: view.pronto.visible, scala: Math.round(view.pronto.scaleX * 1000) / 1000 } : null,
          passi: view.passi ? view.passi.map((icona) => ({ visibile: icona.visible, acceso: icona.acceso })) : null,
        };
      }),
      bancone: {
        ...base.bancone,
        piatti: base.bancone.piatti.map((p, i) => ({ ...p, piatto: stato.bancone[i] ?? null })),
      },
      // Come i Clienti si vedono: dove sono, che faccia hanno, quali icone ha la nuvoletta.
      clienti: this.clienti.map((cliente) => cliente.getTextState()),
      hud: {
        ...base.hud,
        incasso: this.incassoMostrato,
        tempo: this.hud.tempo.text,
        stelleAccese: this.hud.stelle.filter((s) => s.texture.key === 'stella').length,
      },
      eventi: { contati: this.contatori, ultimi: this.registro },
      trascinamento: this.trascina ? { dalloSlot: this.trascina.indice, sopraAlPosto: this.trascina.sopra } : null,
      fine: this.fineUI ? { ...this.fineUI.rigioca, stelleAccese: this.fineUI.stelleAccese, incasso: this.risultato.incasso, stelle: this.risultato.stelle } : null,
    };
  }
}
