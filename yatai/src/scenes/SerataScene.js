import { BRUCIATURA, FUMO_SEC, MATSURI_PREDEFINITO, PALETTE, PIATTI, RECAP, RISCONTRI, SERATE, SERATA_PRIMA, TEMI, YATAI } from '../config.js';
import { DISEGNI, PANEL_MARGIN } from '../disegni/catalogo.js';
import { PASSO_SCELTA, POSTAZIONE_SIZE, postazioneKey, scortaKey } from '../disegni/postazioni.js';
import { CESTINO_SIZE } from '../disegni/takoyaki.js';
import { t } from '../i18n.js';
import { textStyle } from '../kit/font.js';
import { generateCast, panelTexture } from '../kit/texture.js';
import { addButton } from '../kit/ui.js';
import { center, fitIn, layoutHud } from '../layout/yatai.js';
import { opzioniSerata } from '../bottega.js';
import { salvataggio } from '../salvataggio.js';
import { azioneDaTasto } from '../serata/comandi.js';
import { corpoSerie, moneteDelPagamento, scalaSomma, serieAlTetto, serieVisibile, testoSerie } from '../serata/riscontriSerie.js';
import { percorsoMonetaOro } from '../serata/riscontriVizi.js';
import { Serata, idPiatto, passiDi } from '../serata/Serata.js';
import ClienteView from '../yatai/ClienteView.js';
import FumoView from '../yatai/FumoView.js';
import YataiScene from './YataiScene.js';

const round = (n) => Math.round(n * 10) / 10;
const rectState = (r) => ({ x: round(center(r).x), y: round(center(r).y), w: round(r.w), h: round(r.h) });

// Il seme dei Clienti è diverso a ogni partita (con ?seme=… in sviluppo si ripete la stessa).
const nuovoSeme = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// A che profondità stanno le cose che vanno sopra al resto: l'HUD, quello che vola, il Piatto trascinato e
// la schermata di fine Serata.
const PROFONDITA = { hud: 10, volo: 120, trascinato: 150, fine: 200 };

// Un colore a metà strada tra a e b (t da 0 a 1), come numeri 0xRRGGBB.
const mescola = (a, b, t) => {
  const canale = (x, y, passo) => Math.round(((x >> passo) & 255) * (1 - t) + ((y >> passo) & 255) * t);
  return (canale(a, b, 16) << 16) | (canale(a, b, 8) << 8) | canale(a, b, 0);
};

// La prima Serata giocabile (passo 3 di PIANO.md): lo Yatai di YataiScene con la logica di
// src/serata/Serata.js dentro. La scena non decide niente: passa i tocchi alla Serata, fa
// avanzare il suo tempo e trasforma gli eventi che tornano indietro in disegni e movimenti.
//
//   fila       in basso, da sinistra a destra: le Scorte (nel Tanabata riso, alga, pastella, polpo, salsa) e le
//              Postazioni (tagliere e piastra). I Piatti si fanno a tocchi nell'ordine della Ricetta: l'onigiri
//              riso, alga, prendi (ticket 33); il takoyaki pastella, polpo, [cottura], salsa, prendi (ticket 37)
//   input      tocco e tasti → tocca(Scorta o Postazione) e servi(Posto); trascinare un Piatto dal
//              Bancone su un Cliente fa la stessa cosa di toccare il Cliente
//   riscontri  Maurizio, monete, cuoricini, Cliente che scuote la testa o se ne va
//   cottura    il Piatto pronto che scurisce e trema prima di bruciarsi, il Piatto bruciato che va nel
//              cestino, il Fumo che copre la Postazione (passo 4)
//   fine       a 120 secondi compare la schermata con Incasso e stelle
//
// Dati di avvio, tutti facoltativi: matsuri (il tema, come YataiScene, e la Serata da giocare: per i
// takoyaki è il Tanabata, vedi SERATE in config.js), seme (solo per ripetere una partita: di norma ogni
// partita ha il suo).
export default class SerataScene extends YataiScene {
  constructor() {
    super('serata');
  }

  init(data) {
    this.seme = data?.seme ?? nuovoSeme();
    const matsuri = data?.matsuri in TEMI ? data.matsuri : MATSURI_PREDEFINITO;
    // I Potenziamenti comprati nella Bottega (il Posto in più, il ventaglio) cambiano la Serata (ticket 35).
    this.serata = new Serata({ seed: this.seme, ...(SERATE[matsuri] ?? SERATA_PRIMA), ...opzioniSerata(salvataggio()) });
    // Il cestino serve solo se in menù c'è un Piatto che si brucia.
    this.haCestino = this.serata.postazioni.some(({ piatto }) => (PIATTI[piatto].burnAfterSec ?? null) !== null);
    super.init({
      matsuri: data?.matsuri,
      posti: this.serata.posti.length,
      postazioni: this.serata.fila().length,
      scorte: this.serata.scorte.length,
      demo: false,
    });
    this.pronta = false;
    this.incassoMostrato = 0;
    this.inVolo = 0;
    this.oroInVolo = 0;
    this.visibili = 0;
    this.trascina = null;
    this.origineVolo = null;
    this.tempoMostrato = null;
    this.stelleHud = 0;
    this.fineUI = null;
    this.risultato = null;
    this.registro = [];
    this.contatori = {};
    // La Serie com'è mostrata (si azzera a ogni Serata, non si salva) e l'ultimo pagamento: quante monete sono volate.
    this.serieMostrata = 0;
    this.serieColoreTetto = false;
    this.ultimoPagamento = null;
  }

  create() {
    super.create();
    // I disegni del cast si generano qui, entrando in Serata, e non all'avvio (generateCast).
    this.generazioneCast = generateCast(this);
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
      // La Ricetta sopra la Postazione: un'icona per passo, spenta finché non è nel Piatto. Un passo a scelta (lo
      // sciroppo) mostra le tre gocce finché non si sceglie, poi la Scorta scelta (vedi aggiornaPassi).
      view.passi = passiDi(piatto).map((passo) => {
        const scelta = passo.unoDi !== undefined;
        const icona = this.add.image(0, 0, scelta ? PASSO_SCELTA[piatto] : scortaKey(passo.ingrediente)).setOrigin(0.5, 1).setAlpha(RISCONTRI.passoSpento).setDepth(PROFONDITA.hud);
        icona.acceso = false;
        icona.scelta = scelta;
        return icona;
      });
      view.fumo = new FumoView(this, PROFONDITA.hud + 3);
      // Il "!" rosso dell'allarme: non è una parola, quindi non si traduce.
      view.punto = this.add.text(0, 0, '!', textStyle(52, { bold: true, color: '#d9534f', outline: 9 })).setOrigin(0.5).setDepth(PROFONDITA.hud + 4).setVisible(false);
      view.pulsa = null;
    });
    this.cestino = this.add.image(0, 0, 'cestino').setOrigin(0.5, 1).setDepth(PROFONDITA.hud - 5).setVisible(this.haCestino);
    this.dishViews.forEach((view, i) => view.zone.on('pointerdown', (pointer) => this.iniziaTrascinamento(i, pointer)));

    this.clienti = this.serata.posti.map((_, i) => new ClienteView(this, i, this.serata.cuoriMax));
    // La campanella dello Yatai, appesa sotto la tendina del Bancone: oscilla prima di un'ondata (ticket 34). Il perno
    // è il cordino, in cima al disegno.
    this.campanella = this.add.image(0, 0, 'campanella').setOrigin(0.5, 0).setDepth(1);
    this.oscillazione = null;
    this.creaSerie();
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
    this.disponiCampanella();
    this.disponiSerie();
    if (this.fineUI) this.costruisciFine(true);
  }

  // La campanella pende dal bordo della tendina, a sinistra: libera il pavimento accanto a Maurizio.
  disponiCampanella() {
    const { larghezza, dalBordo, sottoTendina } = RISCONTRI.segnaleOndata.campanella;
    const { rect } = this.layout.bancone;
    this.campanella.setPosition(rect.x + dalBordo, rect.y + sottoTendina).setScale(larghezza / DISEGNI.campanella.w);
  }

  // Il segnale di un'ondata (senza testo): Maurizio alza la testa per il tempo che manca più la coda, e la
  // campanella oscilla. Il suono è del ticket 23: qui 'ondataInArrivo' è il punto a cui agganciarlo.
  segnalaOndata(evento) {
    this.maurizio.allerta(evento.traMs + RISCONTRI.segnaleOndata.codaMs);
    this.oscillaCampanella();
  }

  // La campanella dondola e si ferma: `oscillazioni` andate e ritorno che si smorzano. È l'unico punto da spegnere
  // con "riduci movimento" (ticket 26): senza questo resta ferma e il segnale è la posa di Maurizio.
  oscillaCampanella() {
    const { oscillazioni, ampiezza, durata } = RISCONTRI.segnaleOndata.campanella;
    this.oscillazione?.remove();
    this.oscillazione = this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: durata,
      onUpdate: (tween) => {
        const v = tween.getValue();
        this.campanella.setAngle(Math.sin(v * oscillazioni * Math.PI * 2) * ampiezza * (1 - v));
      },
      onComplete: () => {
        this.campanella.setAngle(0);
        this.oscillazione = null;
      },
    });
  }

  // --- I riscontri della Serie (ticket 34, passo 4): il numero "×N" vicino a Maurizio e il "pof" ---

  creaSerie() {
    const { colore, contorno, corpo } = RISCONTRI.serie;
    // Il numero resta nascosto finché la Serie è sotto `daSerie`. Giallo come la scritta "+150", col contorno d'inchiostro.
    this.serieNumero = this.add.text(0, 0, '', textStyle(corpo.base, { bold: true, color: colore, outline: contorno, outlineColor: PALETTE.inchiostro })).setOrigin(0.5).setDepth(PROFONDITA.hud).setVisible(false);
    // Il "pof": una nuvoletta morbida che si apre dove c'era il numero.
    this.pof = this.add.image(0, 0, 'pof').setDepth(PROFONDITA.volo).setVisible(false);
  }

  // Il numero sta a destra di Maurizio, a mezza altezza della fascia della cucina: il lato libero, speculare alla campanella.
  disponiSerie() {
    const { x, y } = RISCONTRI.serie.posizione;
    const { cucina } = this.layout.zone;
    this.serieNumero.setPosition(cucina.x + cucina.w * x, cucina.y + cucina.h * y);
  }

  // Tutti i movimenti della Serie (entrata, pop, "pof") passano di qui: è l'unico punto da spegnere con "riduci movimento"
  // (ticket 26): basterà far saltare qui l'oggetto subito a `a` e chiamare `fine`, così il numero compare e sparisce senza
  // pop né nuvoletta. `da` e `a` sono proprietà dell'oggetto (scale, alpha); `fine` parte alla fine.
  animaSerie(oggetto, { da = {}, a, durata, ease = 'Quad.easeOut', fine }) {
    this.tweens.killTweensOf(oggetto);
    Object.assign(oggetto, da);
    this.tweens.add({ targets: oggetto, ...a, duration: durata, ease, onComplete: () => fine?.() });
  }

  // La Serie sale: il numero compare (dalla Serie `daSerie`), cresce e a ogni Ordine fa un pop. Al tetto della Mancia
  // diventa arcobaleno, con un pop più grande la prima volta. Il tintinnio che sale di un gradino a ogni Serie è del ticket
  // 23: si aggancia qui, `evento.serie` è il gradino.
  perSerieSale(evento) {
    this.serieMostrata = evento.serie;
    if (!serieVisibile(evento.serie)) return;
    const { entra, pop } = RISCONTRI.serie;
    const numero = this.serieNumero;
    const nuovo = !numero.visible;
    const alTetto = serieAlTetto(evento.serie);
    const appenaAlTetto = alTetto && !this.serieColoreTetto;
    numero.setText(testoSerie(evento.serie)).setFontSize(corpoSerie(evento.serie)).setVisible(true);
    this.coloraSerie(alTetto);
    if (nuovo) {
      this.animaSerie(numero, { da: { scale: entra.da, alpha: 0 }, a: { scale: 1, alpha: 1 }, durata: entra.durata, ease: 'Back.easeOut' });
    } else {
      this.animaSerie(numero, { da: { scale: appenaAlTetto ? pop.scalaTetto : pop.scala, alpha: 1 }, a: { scale: 1, alpha: 1 }, durata: pop.durata, ease: 'Back.easeOut' });
    }
  }

  // Giallo moneta, o l'arcobaleno della palette quando la Mancia della Serie è al massimo: cinque bande dall'alto in basso
  // dentro le lettere (stop doppi, niente sfumatura: è il disegno a bande della salopette). Va chiamata dopo aver messo il
  // testo e il corpo, perché le bande si misurano sull'altezza del testo; il contorno d'inchiostro non cambia.
  coloraSerie(alTetto) {
    if (alTetto === this.serieColoreTetto) return;
    this.serieColoreTetto = alTetto;
    const numero = this.serieNumero;
    if (!alTetto) {
      numero.setColor(RISCONTRI.serie.colore);
      return;
    }
    const { da, a } = RISCONTRI.serie.arcobaleno;
    const bande = PALETTE.arcobaleno;
    const gradiente = numero.context.createLinearGradient(0, numero.height * da, 0, numero.height * a);
    bande.forEach((banda, i) => {
      gradiente.addColorStop(i / bande.length, banda);
      gradiente.addColorStop((i + 1) / bande.length, banda);
    });
    numero.setColor(gradiente);
  }

  // La Serie si spezza: il numero si gonfia e svanisce, e una nuvoletta morbida (il "pof") si apre al suo posto. Nessuna
  // punizione: niente rosso e niente scossa. Se il numero non si vedeva (Serie sotto `daSerie`) non c'è niente da togliere.
  perSerieSpezzata() {
    this.serieMostrata = 0;
    const numero = this.serieNumero;
    if (!numero.visible) return;
    const { pof } = RISCONTRI.serie;
    const base = pof.dimensione / DISEGNI.pof.w;
    this.animaSerie(numero, { a: { scale: pof.numero.scala, alpha: 0 }, durata: pof.numero.durata, fine: () => numero.setVisible(false) });
    this.pof.setPosition(numero.x, numero.y).setVisible(true);
    this.animaSerie(this.pof, { da: { scale: base * pof.scalaDa, alpha: 1 }, a: { scale: base * pof.scalaA, alpha: 0 }, durata: pof.durata, fine: () => this.pof.setVisible(false) });
  }

  // La cima di ogni Postazione: sopra ci stanno la barra della cottura e il Piatto pronto.
  disponiPostazioni() {
    this.layout.postazioni.forEach((rect, i) => {
      const view = this.stationViews[i];
      // Una Scorta fuori fila (sugli scaffali) non ha il nome: il disegno riempie la cella.
      const etichetta = rect.scaffale ? 0 : YATAI.postazioni.altezzaEtichetta;
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
      view.barraBruciaY = view.cima.y + YATAI.postazioni.barraBruciaDallaCima * disegno.scale;
      view.punto.setPosition(view.cima.x + YATAI.postazioni.puntoDalCentro.x * disegno.scale, view.iconaY + YATAI.postazioni.puntoDalCentro.y * disegno.scale);
      view.ondeggia?.remove();
      view.ondeggia = null;
      view.pulsa?.remove();
      view.pulsa = null;
      view.statoVisto = 'libera';
      // Le icone della Ricetta stanno in fila sopra la Postazione, dove poi compare il Piatto pronto. Se sono
      // tante e non stanno nella larghezza della Postazione (il takoyaki ne ha 3 in una fila da 7 voci) si
      // avvicinano, e restano sempre dentro il loro posto.
      const { scala, spazio, altezza, larghezzaFila } = RISCONTRI.passo;
      const larghezzaIcona = POSTAZIONE_SIZE.w * scala * disegno.scale;
      const passoX = view.passi.length > 1
        ? Math.min(spazio * disegno.scale, (view.larghezza * larghezzaFila - larghezzaIcona) / (view.passi.length - 1))
        : 0;
      view.passi.forEach((icona, k) => {
        icona.setPosition(view.cima.x + (k - (view.passi.length - 1) / 2) * passoX, view.cima.y + altezza * disegno.scale);
        icona.setScale(scala * disegno.scale);
      });
      // Il Fumo copre il disegno della Postazione; i fili salgono dal Piatto che brucia.
      view.fumo.place(view.cima, view.larghezza, POSTAZIONE_SIZE.h * disegno.scale, { x: view.cima.x, y: view.iconaY - 56 });
    });
    // Il cestino sta a destra di Maurizio, appoggiato in fondo alla fascia della cucina.
    const { cucina } = this.layout.zone;
    const { dalBordo, dalFondo, larghezza } = YATAI.cestino;
    this.cestino.setPosition(cucina.x + cucina.w - dalBordo, cucina.y + cucina.h - dalFondo).setScale(larghezza / CESTINO_SIZE.w);
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
    // La calma di Balosso: finché è a un Posto, i cuoricini di tutti hanno l'ovale azzurra.
    const calma = this.serata.ritmoPazienza() < 1;
    for (const cliente of this.clienti) {
      cliente.calma(calma);
      cliente.segui();
    }
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
      // Sul Bancone ogni posto mostra il Piatto che c'è: onigiri o takoyaki.
      const piatto = stato.bancone[i];
      if (visibile && piatto && view.piattoVisto !== piatto) {
        view.piattoVisto = piatto;
        view.image.setTexture(piatto);
      }
    });
    // Le Scorte che qualche Postazione aspetta (il prossimo Ingrediente, o tutte le varianti se è una scelta) hanno l'alone.
    const attese = new Set(stato.postazioni.flatMap((p) => p.prossimi));
    this.stationViews.forEach((view) => {
      if (view.voce === 'postazione') this.aggiornaPostazione(view, stato.postazioni.find((p) => p.id === view.id));
      else view.glow.setVisible(attese.has(view.id));
    });
    this.aggiornaTempo();
  }

  // Le icone della Ricetta: si accendono (con un saltino) una a una, restano mentre il Piatto cuoce e mentre
  // manca un Ingrediente, e spariscono quando il Piatto è pronto o bruciato (al loro posto c'è lui).
  aggiornaPassi(view, postazione) {
    const conPiatto = postazione.stato === 'pronto' || postazione.stato === 'bruciato';
    view.passi.forEach((icona, k) => {
      icona.setVisible(!conPiatto);
      // Il passo a scelta mostra lo sciroppo scelto (e le tre gocce finché non c'è).
      if (icona.scelta) {
        const chiave = postazione.variante ? scortaKey(postazione.variante) : PASSO_SCELTA[postazione.piatto];
        if (icona.texture.key !== chiave) icona.setTexture(chiave);
      }
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

  // Una Postazione si vede in sei modi: libera, cuoce, pronto, allarme (pronto e negli ultimi secondi prima
  // di bruciarsi), bruciato e fumo. Il cambio di modo viene dallo stato della logica; quello che cambia
  // frame per frame (la barra, la tinta, il Fumo che svanisce) si aggiorna qui sotto.
  aggiornaPostazione(view, postazione) {
    this.aggiornaPassi(view, postazione);
    const modo = this.modoDellaPostazione(postazione);
    if (modo !== view.statoVisto) {
      const prima = view.statoVisto;
      view.statoVisto = modo;
      this.entraNelModo(view, modo, prima, postazione);
    }
    this.disegnaBarraPostazione(view, postazione, modo);
    if (modo === 'pronto' || modo === 'allarme') this.scurisci(view, postazione);
    if (modo === 'fumo') view.fumo.aggiorna(postazione.fumoRestaMs / (FUMO_SEC * 1000));
  }

  modoDellaPostazione(postazione) {
    const inAllarme = postazione.stato === 'pronto' && postazione.bruciaTraMs !== null && postazione.bruciaTraMs <= BRUCIATURA.avvisoSec * 1000;
    return inAllarme ? 'allarme' : postazione.stato;
  }

  // Quello che cambia una volta sola quando la Postazione passa a un altro modo.
  entraNelModo(view, modo, prima, postazione) {
    const { pronto } = view;
    view.ondeggia?.remove();
    view.ondeggia = null;
    pronto.setAngle(0).clearTint();
    view.pulsa?.remove();
    view.pulsa = null;
    view.punto.setVisible(modo === 'allarme').setScale(1);
    if (modo !== 'fumo') view.fumo.chiudi();
    if (modo !== 'allarme' && modo !== 'bruciato') view.fumo.spegniFili();
    const conPiatto = modo === 'pronto' || modo === 'allarme' || modo === 'bruciato';
    pronto.setVisible(conPiatto).setPosition(view.cima.x, view.iconaY);
    // Il Piatto pronto ha la sua variante (kakigori-melone-icona); il bruciato non ne ha (non si brucia il kakigōri).
    pronto.setTexture(modo === 'bruciato' ? `${view.piatto}-bruciato-icona` : `${idPiatto(view.piatto, postazione.variante)}-icona`);

    if (modo === 'pronto') {
      // Il Piatto pronto salta fuori e poi ondeggia, perché lo si tocchi.
      const { durata, ampiezza } = RISCONTRI.pronto;
      pronto.setScale(0.2);
      this.tweens.add({ targets: pronto, scale: 1, duration: durata * 0.6, ease: 'Back.easeOut' });
      view.ondeggia = this.tweens.add({ targets: pronto, y: view.iconaY - ampiezza, duration: durata, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: durata * 0.6 });
    } else if (modo === 'allarme') {
      // Sta per bruciarsi: trema forte, e sale un filo di fumo.
      const { tremaMs, angolo } = RISCONTRI.brucia;
      pronto.setScale(1);
      view.ondeggia = this.tweens.add({ targets: pronto, angle: { from: -angolo, to: angolo }, duration: tremaMs, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      view.fumo.accendiFili();
      // Il "!" salta fuori e poi pulsa.
      view.punto.setScale(0.3);
      this.tweens.add({ targets: view.punto, scale: 1, duration: 200, ease: 'Back.easeOut' });
      view.pulsa = this.tweens.add({ targets: view.punto, scale: 1.2, duration: RISCONTRI.brucia.lampeggioMs, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 200 });
    } else if (modo === 'bruciato') {
      // Si è bruciato: compare scuro e schiacciato, e poi trema piano finché non lo si tocca.
      const { appare, tremolio } = RISCONTRI.bruciato;
      pronto.setScale(1.5, 0.65);
      this.tweens.add({ targets: pronto, scaleX: 1, scaleY: 1, duration: appare, ease: 'Back.easeOut' });
      view.ondeggia = this.tweens.add({ targets: pronto, angle: { from: -tremolio.angolo, to: tremolio.angolo }, duration: tremolio.durata, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: appare });
      view.fumo.accendiFili();
    } else if (modo === 'fumo') {
      view.fumo.mostra(true);
    }
  }

  // La barra sopra la Postazione: la cottura che sale (verde) e, per un Piatto che si brucia, il tempo che
  // resta prima che si bruci (scende, da verde a giallo a rosso, e lampeggia negli ultimi secondi).
  disegnaBarraPostazione(view, postazione, modo) {
    const { barra } = view;
    if (postazione.stato === 'cuoce') {
      const frazione = 1 - postazione.restaMs / postazione.cotturaMs;
      this.riempiBarra(view, frazione, RISCONTRI.brucia.colori.pieno, view.barraY, view.larghezza * 0.62);
      barra.setAlpha(1);
    } else if (postazione.stato === 'pronto' && postazione.bruciaTraMs !== null) {
      const resta = postazione.bruciaTraMs / (PIATTI[postazione.piatto].burnAfterSec * 1000);
      const { colori, lampeggioMs } = RISCONTRI.brucia;
      const consumato = 1 - resta;
      const colore = consumato < 0.5 ? mescola(colori.pieno, colori.meta, consumato * 2) : mescola(colori.meta, colori.poco, (consumato - 0.5) * 2);
      this.riempiBarra(view, resta, colore, view.barraBruciaY, view.larghezza * 0.8);
      barra.setAlpha(modo === 'allarme' ? 0.55 + 0.45 * Math.abs(Math.sin((this.time.now / lampeggioMs) * Math.PI)) : 1);
    } else {
      barra.clear().setVisible(false);
    }
  }

  riempiBarra(view, frazione, colore, y, w) {
    const { barra } = view;
    barra.clear().setVisible(true);
    barra.fillStyle(0xfff8ec, 1).fillRoundedRect(view.cima.x - w / 2, y, w, 16, 8);
    barra.fillStyle(colore, 1).fillRoundedRect(view.cima.x - w / 2 + 3, y + 3, Math.max(6, (w - 6) * frazione), 10, 5);
    barra.lineStyle(3, 0x3a2f2b, 1).strokeRoundedRect(view.cima.x - w / 2, y, w, 16, 8);
  }

  // Il Piatto pronto scurisce man mano che si avvicina a bruciarsi.
  scurisci(view, postazione) {
    if (postazione.bruciaTraMs === null) return;
    const consumato = 1 - postazione.bruciaTraMs / (PIATTI[postazione.piatto].burnAfterSec * 1000);
    view.pronto.setTint(mescola(0xffffff, RISCONTRI.brucia.tinta, consumato));
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
    const copia = this.add.image(pointer.x, pointer.y, this.serata.bancone[indice]).setOrigin(0.5, 0.8).setScale(view.image.scaleX * 1.12).setDepth(PROFONDITA.trascinato);
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
      case 'lamento':
        // Il Cliente scende di scalino. La faccia e il segno li decide impostaCuori() (così restano giusti
        // anche dopo un cambio di misura); qui l'evento è solo il punto a cui il ticket 23 aggancia il "mmh".
        break;
      case 'clienteVaVia':
        this.clienti[evento.posto].vaVia();
        break;
      case 'ondataInArrivo':
        this.segnalaOndata(evento);
        break;
      case 'serieSpezzata':
        // Il "pof" morbido e il numero che sparisce; il suono (un "pof" senza punizione) si aggancia qui (ticket 23).
        this.perSerieSpezzata();
        break;
      case 'scuoteTesta':
        this.clienti[evento.posto].scuoti();
        break;
      case 'cotturaIniziata': {
        // Il tocco sull'Ingrediente prima ha già fatto lavorare Maurizio: qui la Postazione prende il via.
        const { image } = this.vistaDellaPostazione(evento.postazione);
        const { scaleX, scaleY } = image;
        this.tweens.add({ targets: image, scaleX: scaleX * 1.08, scaleY: scaleY * 0.93, duration: 90, yoyo: true, onComplete: () => image.setScale(scaleX, scaleY) });
        break;
      }
      case 'cotturaFinita':
        // La cottura è finita: la Postazione fa un saltino per dire "ora tocca all'Ingrediente dopo".
        this.saltino(evento.postazione);
        break;
      case 'ingrediente':
        this.perIngrediente(evento);
        break;
      case 'ingredienteRifiutato':
        this.scuotiPostazione(evento.scorta);
        break;
      case 'nienteDaPrendere':
        this.scuotiPostazione(evento.postazione);
        break;
      case 'piattoPronto':
        // Il Piatto pronto lo mostra aggiornaPostazione (modo 'pronto'): non c'è altro da fare qui.
        break;
      case 'staPerBruciarsi':
        this.perAllarme(evento);
        break;
      case 'piattoBruciato':
        this.perBruciato(evento);
        break;
      case 'nelCestino':
        this.perCestino(evento);
        break;
      case 'postazioneNelFumo':
        this.vistaDellaPostazione(evento.postazione).fumo.sbuffa();
        break;
      case 'fumoPassato':
        this.perFumoPassato(evento);
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
      case 'yenDOro':
        // Lo Yen d'oro di Nella cade dal suo Posto. Il suono si aggancia qui (ticket 23).
        this.perYenDOro(evento);
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
  vola(texture, da, a, { durata, scalaDa, scalaA, alphaA = 1, ritardo = 0, origineY = 1, easeY = 'Quad.easeInOut', giro = 0, fine }) {
    const oggetto = this.add.image(da.x, da.y, texture).setOrigin(0.5, origineY).setScale(scalaDa).setDepth(PROFONDITA.volo);
    this.tweens.add({ targets: oggetto, x: a.x, duration: durata, delay: ritardo, ease: 'Sine.easeInOut' });
    this.tweens.add({
      targets: oggetto,
      y: a.y,
      scale: scalaA,
      alpha: alphaA,
      angle: giro,
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

  // Un tocco che non serve a niente (Ingrediente fuori ordine o durante la cottura, Piatto non ancora
  // finito): la Postazione o la Scorta scuote la testa, senza costo.
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

  // Il Piatto pronto è negli ultimi secondi: un colpetto che attira l'occhio (poi trema, vedi entraNelModo).
  perAllarme(evento) {
    const { pronto } = this.vistaDellaPostazione(evento.postazione);
    this.tweens.add({ targets: pronto, scale: 1.3, duration: 110, yoyo: true, ease: 'Quad.easeOut' });
  }

  // Si è bruciato: uno scoppio di nuvolette che salgono e la Postazione che sussulta.
  perBruciato(evento) {
    const vista = this.vistaDellaPostazione(evento.postazione);
    const { nuvolette, salita, durata } = RISCONTRI.bruciato;
    for (let i = 0; i < nuvolette; i++) {
      const dx = (i - (nuvolette - 1) / 2) * 26;
      const da = { x: vista.cima.x + dx, y: vista.iconaY - 30 };
      this.vola('fumo', da, { x: da.x + dx * 0.8, y: da.y - salita - (i % 2) * 24 }, {
        durata,
        ritardo: i * 45,
        scalaDa: 0.12,
        scalaA: 0.42,
        alphaA: 0,
        origineY: 0.5,
        easeY: 'Quad.easeOut',
      });
    }
    const { image } = vista;
    const { scaleX, scaleY } = image;
    this.tweens.add({ targets: image, scaleX: scaleX * 1.1, scaleY: scaleY * 0.9, duration: 100, yoyo: true, onComplete: () => image.setScale(scaleX, scaleY) });
  }

  // Il Piatto bruciato vola nel cestino, che sobbalza quando lo prende. Il Fumo sulla Postazione c'è già.
  perCestino(evento) {
    this.maurizio.azione('raccogli');
    const vista = this.vistaDellaPostazione(evento.postazione);
    const { cestino } = this;
    const { volo, giro, sobbalzo } = RISCONTRI.cestino;
    this.vola(`${evento.piatto}-bruciato-icona`, { x: vista.cima.x, y: vista.iconaY }, { x: cestino.x, y: cestino.y - cestino.displayHeight * 0.72 }, {
      durata: volo,
      scalaDa: 1,
      scalaA: 0.45,
      alphaA: 0.9,
      giro,
      easeY: 'Back.easeIn',
      fine: () => {
        const { scaleX, scaleY } = cestino;
        cestino.setScale(scaleX * 1.12, scaleY * 0.88);
        this.tweens.add({ targets: cestino, scaleX, scaleY, duration: sobbalzo, ease: 'Back.easeOut' });
      },
    });
  }

  // Il Fumo è passato: la Postazione è di nuovo libera e fa un saltino.
  perFumoPassato(evento) {
    this.saltino(evento.postazione);
  }

  // La Postazione si schiaccia un attimo e torna su: ha finito di cuocere, o è di nuovo libera.
  saltino(id) {
    const { image } = this.vistaDellaPostazione(id);
    const { scaleX, scaleY } = image;
    image.setScale(scaleX * 1.1, scaleY * 0.9);
    this.tweens.add({ targets: image, scaleX, scaleY, duration: 200, ease: 'Back.easeOut' });
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
    // La Serie viene prima del pagamento: le monete che seguono (perMoneta) la usano.
    this.perSerieSale(evento);
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

  // Lo Yen d'oro di Nella: una moneta d'oro grande compare sopra il suo Posto e cade sul cuscino. È solo un riscontro: gli Yen
  // li accreditano le monete di perMoneta (la Mancia tripla è già nel pagamento).
  perYenDOro(evento) {
    const { da, a } = percorsoMonetaOro(this.clienti[evento.posto].geom);
    this.animaYenDOro(da, a);
  }

  // L'unico punto da cui si muove lo Yen d'oro (ticket 26: con "riduci movimento" compare già a terra, luccica e basta): entra,
  // cade con i rimbalzi di una moneta vera girando su sé stessa, luccica all'impatto, sosta e vola all'Incasso.
  animaYenDOro(da, a) {
    const K = RISCONTRI.vizi.yenDOro;
    const oro = this.add.image(da.x, da.y, 'moneta-oro').setScale(K.scala * K.entraScala).setAlpha(0).setDepth(PROFONDITA.volo + 1);
    this.oroInVolo += 1;
    this.tweens.add({ targets: oro, alpha: 1, scale: K.scala, duration: K.entra, ease: 'Back.easeOut' });
    this.tweens.add({ targets: oro, y: a.y, duration: K.cade, ease: 'Bounce.easeOut' });
    this.tweens.add({ targets: oro, angle: 360 * K.giri, duration: K.cade, ease: 'Cubic.easeOut' });
    // Il primo impatto di Bounce.easeOut cade a 1/2,75 del tempo: lì le stelline si aprono a raggiera.
    this.time.delayedCall(K.cade / 2.75, () => {
      for (let i = 0; i < K.scintille; i++) {
        const angolo = (i / K.scintille) * Math.PI * 2 - Math.PI / 2;
        const stella = this.add.image(a.x, a.y, 'stella').setScale(K.scintillaScala.da).setDepth(PROFONDITA.volo + 2);
        this.tweens.add({ targets: stella, x: a.x + Math.cos(angolo) * K.raggio.x, y: a.y + Math.sin(angolo) * K.raggio.y, scale: K.scintillaScala.a, duration: K.scintilla * 0.5, ease: 'Quad.easeOut' });
        this.tweens.add({ targets: stella, alpha: 0, duration: K.scintilla * 0.5, delay: K.scintilla * 0.5, ease: 'Quad.easeIn', onComplete: () => stella.destroy() });
      }
    });
    const { moneta } = this.hudLayout;
    this.time.delayedCall(K.cade + K.sosta, () => {
      this.tweens.add({
        targets: oro,
        x: moneta.x,
        y: moneta.y,
        scale: K.scala * K.volaScala,
        duration: K.vola,
        ease: 'Quad.easeIn',
        onComplete: () => {
          oro.destroy();
          this.oroInVolo -= 1;
        },
      });
    });
  }

  // Il pagamento: la scritta "+150" sul Cliente e le monete che volano verso l'Incasso.
  perMoneta(evento) {
    const { x, y } = this.clienti[evento.posto].centro();
    // Le monete escono dal centro del Cliente, ma da quella di Carlotta escono dalla borsetta.
    const sorgente = this.clienti[evento.posto].sorgenteMonete();
    // La scritta sta dove c'era la nuvoletta (a questo punto è sparita), non sulla faccia.
    const { nuvoletta } = this.clienti[evento.posto].geom;
    const sommaY = nuvoletta.y + nuvoletta.h * 0.45;
    // Con la Serie alta la scritta è più grande (il corpo, non la scala, così resta nitida).
    const somma = this.add.text(x, sommaY, `+${evento.yen}`, textStyle(Math.round(54 * scalaSomma(this.serieMostrata)), { bold: true, color: '#f7d26a', outline: 10, outlineColor: PALETTE.inchiostro })).setOrigin(0.5).setDepth(PROFONDITA.volo).setScale(0.4);
    const { durata, salita } = RISCONTRI.somma;
    this.tweens.add({ targets: somma, scale: 1, duration: durata * 0.25, ease: 'Back.easeOut' });
    this.tweens.add({ targets: somma, y: sommaY - salita, alpha: 0, duration: durata * 0.55, delay: durata * 0.45, ease: 'Quad.easeIn', onComplete: () => somma.destroy() });

    const { durata: volo, ritardo } = RISCONTRI.monete;
    // Monete più generose quando la Serie è alta: qualcuna in più per ogni pagamento (riscontriSerie.js).
    const quante = moneteDelPagamento(evento.yen, this.serieMostrata);
    this.ultimoPagamento = { yen: evento.yen, monete: quante, serie: this.serieMostrata };
    const quota = Math.floor(evento.yen / quante);
    const { moneta } = this.hudLayout;
    for (let i = 0; i < quante; i++) {
      const valore = i === quante - 1 ? evento.yen - quota * (quante - 1) : quota;
      // Le monete partono sparpagliate attorno al Cliente, a ventaglio.
      const partenza = { x: sorgente.x + (i - (quante - 1) / 2) * 30, y: sorgente.y + 10 - (i % 2) * 22 };
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
    // La Serie finisce con la Serata (la più lunga la mostra il recap, ticket 22): il numero se ne va senza "pof".
    this.tweens.killTweensOf([this.serieNumero, this.pof]);
    this.serieNumero.setVisible(false);
    this.pof.setVisible(false);
    // L'Incasso diventa Yen in tasca (una Serata in rosso non ne dà e non ne toglie).
    salvataggio().accreditaIncasso(evento.incasso);
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
    const cima = Math.max(30, (H - RECAP.pannello.h) / 2);
    const contenitore = this.add.container(0, 0).setDepth(PROFONDITA.fine);
    const oggetti = [];

    const velo = this.add.rectangle(0, 0, W, H, 0x3a2f2b, 0.5).setOrigin(0).setInteractive();
    oggetti.push(velo);
    oggetti.push(this.pannello(cx, cima + RECAP.pannello.h / 2, RECAP.pannello.w, RECAP.pannello.h, 'nuvola'));
    oggetti.push(this.add.text(cx, cima + 70, t('endTitle'), textStyle(58, { bold: true, outline: 10 })).setOrigin(0.5));

    const stelle = [0, 1, 2].map((i) => this.add.image(cx + (i - 1) * 170, cima + 200, 'stella-vuota').setScale(2.1));
    oggetti.push(...stelle);
    // Con l'Incasso in rosso il commento è gentile e spiega cosa è successo (GAME_SPEC.md, "Ingredienti e Spreco").
    const commento = r.incasso < 0 ? t('endRosso') : t(`endVoto${r.stelle}`);
    oggetti.push(this.add.text(cx, cima + 316, commento, { ...textStyle(34, { bold: true, outline: 6 }), align: 'center', wordWrap: { width: 540 } }).setOrigin(0.5));

    oggetti.push(this.add.text(cx, cima + 392, t('endIncasso'), textStyle(36, { bold: true, outline: 6 })).setOrigin(0.5));
    const moneta = this.add.image(cx - 100, cima + 458, 'moneta').setScale(1.3);
    const incasso = this.add.text(cx - 50, cima + 458, String(r.incasso), textStyle(88, { bold: true, outline: 12 })).setOrigin(0, 0.5);
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
      oggetti.push(this.add.text(cx, cima + 528 + i * 36, `${t(chiave)}: ${valore}`, textStyle(30, { outline: 5 })).setOrigin(0.5));
    });

    oggetti.push(...this.tabellaPerPiatto(cx, cima, r.perPiatto));

    // Gli Yen in tasca (l'Incasso di questa Serata è già dentro, vedi perFine): servono alla Bottega, qui accanto.
    const yenInTasca = salvataggio().yen;
    const tasca = this.add.text(0, cima + 1032, `${t('endInTasca')}: ${yenInTasca}`, textStyle(34, { bold: true, outline: 6 })).setOrigin(0, 0.5);
    const monetaTasca = this.add.image(0, cima + 1032, 'moneta').setScale(0.62);
    const larghezzaTasca = 40 + 12 + tasca.width;
    monetaTasca.setX(cx - larghezzaTasca / 2 + 20);
    tasca.setX(cx - larghezzaTasca / 2 + 52);
    oggetti.push(monetaTasca, tasca);

    // Due pulsanti affiancati: rigiocare (il primo, quello di sempre) e la Bottega.
    const BW = 270;
    const BH = 100;
    const by = cima + 1116;
    const dx = BW / 2 + 8;
    const pulsante = addButton(this, cx - dx, by, BW, BH, t('endRigioca'), 'menta', () => this.rigioca());
    const pulsanteBottega = addButton(this, cx + dx, by, BW, BH, t('bottega'), 'giallo', () => this.vaiAllaBottega());
    oggetti.push(pulsante.image, pulsante.text, pulsanteBottega.image, pulsanteBottega.text);
    contenitore.add(oggetti);

    this.fineUI = {
      container: contenitore,
      stelle,
      pulsante,
      rigioca: { x: cx - dx, y: by, w: BW, h: BH },
      bottega: { x: cx + dx, y: by, w: BW, h: BH },
      yenInTasca,
      stelleAccese: 0,
    };
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

  // La tabella per Piatto del recap (RECAP.tabella): un'intestazione e una riga per ogni Piatto del menù, con i Piatti
  // fatti e serviti e gli Yen di costo, sprecati e vendite. Restituisce gli oggetti da mettere nel pannello.
  tabellaPerPiatto(cx, cima, righe) {
    const { cima: dall, passo, margine, nomeLarghezza, colonne, corpo, corpoIntestazione, colorePerdita } = RECAP.tabella;
    const sinistra = cx - RECAP.pannello.w / 2 + margine;
    const oggetti = [];
    // Una cella di numeri centrata sulla colonna, rimpicciolita se è più larga del posto che ha.
    const cella = (colonna, y, testo, stile) => {
      const cellaTesto = this.add.text(cx + colonne[colonna], y, testo, stile).setOrigin(0.5);
      const posto = colonne[1] - colonne[0] - 4;
      if (cellaTesto.width > posto) cellaTesto.setScale(posto / cellaTesto.width);
      oggetti.push(cellaTesto);
    };
    const intestazioni = ['endTabellaFatti', 'endTabellaServiti', 'endTabellaSprecati', 'endTabellaCosto', 'endTabellaVendite'];
    intestazioni.forEach((chiave, i) => cella(i, cima + dall, t(chiave), textStyle(corpoIntestazione, { bold: true, outline: 4 })));
    oggetti.push(this.add.rectangle(cx, cima + dall + passo / 2, RECAP.pannello.w - 2 * margine, 3, 0xcdbfa9).setOrigin(0.5));
    righe.forEach((riga, n) => {
      const y = cima + dall + passo * (n + 1) + passo / 4;
      const nome = this.add.text(sinistra, y, t(`piatto_${riga.piatto}`), textStyle(corpo, { bold: true, outline: 4 })).setOrigin(0, 0.5);
      if (nome.width > nomeLarghezza) nome.setScale(nomeLarghezza / nome.width);
      oggetti.push(nome);
      const stile = textStyle(corpo, { outline: 4 });
      cella(0, y, String(riga.fatti), stile);
      cella(1, y, String(riga.serviti), stile);
      cella(2, y, String(riga.sprecati), riga.sprecati > 0 ? textStyle(corpo, { color: colorePerdita, outline: 4 }) : stile);
      cella(3, y, String(riga.costo), stile);
      cella(4, y, String(riga.vendite), stile);
    });
    return oggetti;
  }

  rigioca() {
    this.scene.restart({ matsuri: this.matsuri });
  }

  // Dalla fine Serata alla Bottega a spendere gli Yen: da lì si torna a giocare lo stesso Matsuri (BottegaScene).
  vaiAllaBottega() {
    this.scene.start('bottega', { dopoSerata: true, matsuri: this.matsuri });
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
          // Tutte le Scorte che aspetta (più di una se il passo è una scelta) e la variante scelta, se c'è.
          prossimi: logica?.prossimi ?? null,
          variante: logica?.variante ?? null,
          // Mentre cuoce: quanto manca alla fine di questa cottura e quanto dura (zero altrimenti).
          restaMs: logica?.restaMs ?? null,
          cotturaMs: logica?.cotturaMs ?? null,
          // Come si vede adesso (libera, cuoce, pronto, allarme, bruciato, fumo) e quanto manca a bruciarsi o a
          // finire il Fumo; il Fumo dice se le nuvole e i fili si vedono.
          modo: view.statoVisto ?? null,
          bruciaTraMs: logica?.bruciaTraMs ?? null,
          fumoRestaMs: logica?.fumoRestaMs ?? null,
          fumo: view.fumo ? view.fumo.getTextState() : null,
          // Per una Scorta: ha l'alone, cioè è il prossimo Ingrediente che un Piatto aspetta.
          evidenziata: view.glow ? view.glow.visible : null,
          pronto: view.pronto ? { visibile: view.pronto.visible, scala: Math.round(view.pronto.scaleX * 1000) / 1000 } : null,
          passi: view.passi ? view.passi.map((icona) => ({ visibile: icona.visible, acceso: icona.acceso, texture: icona.texture.key })) : null,
        };
      }),
      bancone: {
        ...base.bancone,
        piatti: base.bancone.piatti.map((p, i) => ({ ...p, piatto: stato.bancone[i] ?? null })),
      },
      // Come i Clienti si vedono: dove sono, che faccia hanno, quali icone ha la nuvoletta.
      clienti: this.clienti.map((cliente) => cliente.getTextState()),
      // Quanto è costato generare i disegni del cast entrando in Serata (cambia da un computer all'altro).
      generazioneCast: this.generazioneCast,
      // I riscontri dei Vizi: quanti Yen d'oro sono in volo adesso e a quanti Clienti è accesa la calma di Balosso.
      vizi: { yenDOro: { inVolo: this.oroInVolo, lasciati: this.contatori.yenDOro ?? 0 }, calma: this.clienti.filter((cliente) => cliente.calmaVista).length },
      // Il segnale prima di un'ondata: la campanella (dov'è e di quanti gradi è inclinata adesso, se sta oscillando).
      // Maurizio con la testa alzata è in `maurizio` (posa 'guarda', allerta true).
      campanella: { x: round(this.campanella.x), y: round(this.campanella.y), angolo: round(this.campanella.angle), oscilla: this.oscillazione !== null },
      // La Serie com'è mostrata (ticket 34, passo 4): il numero "×N" vicino a Maurizio (dov'è, che scala e che corpo ha,
      // se è giallo o arcobaleno), il "pof" mentre si apre, e l'ultimo pagamento (quante monete sono volate).
      // La Serie nella logica è in `serata.serie`.
      serie: {
        valore: this.serieMostrata,
        visibile: this.serieNumero.visible,
        testo: this.serieNumero.visible ? this.serieNumero.text : null,
        x: round(this.serieNumero.x),
        y: round(this.serieNumero.y),
        scala: Math.round(this.serieNumero.scale * 1000) / 1000,
        alpha: Math.round(this.serieNumero.alpha * 1000) / 1000,
        corpo: Math.round(Number.parseFloat(this.serieNumero.style.fontSize)),
        colore: this.serieColoreTetto ? 'arcobaleno' : 'oro',
        pof: this.pof.visible ? { x: round(this.pof.x), y: round(this.pof.y), scala: Math.round(this.pof.scale * 1000) / 1000, alpha: Math.round(this.pof.alpha * 1000) / 1000 } : null,
        ultimoPagamento: this.ultimoPagamento,
      },
      cestino: this.cestino.visible ? rectState({ x: this.cestino.x - this.cestino.displayWidth / 2, y: this.cestino.y - this.cestino.displayHeight, w: this.cestino.displayWidth, h: this.cestino.displayHeight }) : null,
      hud: {
        ...base.hud,
        incasso: this.incassoMostrato,
        tempo: this.hud.tempo.text,
        stelleAccese: this.hud.stelle.filter((s) => s.texture.key === 'stella').length,
      },
      eventi: { contati: this.contatori, ultimi: this.registro },
      trascinamento: this.trascina ? { dalloSlot: this.trascina.indice, sopraAlPosto: this.trascina.sopra } : null,
      // `x`, `y`, `w`, `h` sono il pulsante per rigiocare; `bottega` è quello della Bottega; `yenInTasca` gli Yen che si vedono.
      fine: this.fineUI ? { ...this.fineUI.rigioca, bottega: this.fineUI.bottega, yenInTasca: this.fineUI.yenInTasca, stelleAccese: this.fineUI.stelleAccese, incasso: this.risultato.incasso, stelle: this.risultato.stelle, perPiatto: this.risultato.perPiatto } : null,
    };
  }
}
