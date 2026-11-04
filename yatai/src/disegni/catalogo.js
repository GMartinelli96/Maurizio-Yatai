// Tutte le immagini del gioco, disegnate dal codice all'avvio (ADR-0001). Ogni voce è una
// texture: la chiave è il nome che usano le scene, `draw` la disegna su un canvas w×h.
// L'elenco completo, con la provenienza, è in docs/stile/asset-manifest.json.

import { PALETTE, STILE } from '../config.js';
import { grain, panel, paper, restingShadow } from '../kit/matita.js';
import { createRng } from '../kit/rng.js';
import { MAURIZIO_SIZE, POSE, drawMaurizio, maurizioKey } from './maurizio.js';
import { DISEGNI_CLIENTI } from './clienti.js';
import { DISEGNI_KAKIGORI } from './kakigori.js';
import { DISEGNI_RAMEN } from './ramen.js';
import { DISEGNI_TAIYAKI } from './taiyaki.js';
import { drawOnigiri, onigiriSize } from './onigiri.js';
import { POSTAZIONE_SIZE, POSTAZIONI, SCORTE, postazioneKey, scortaKey } from './postazioni.js';
import { CESTINO_SIZE, FUMO_SIZE, drawCestino, drawFumo, drawTakoyaki, takoyakiSize } from './takoyaki.js';
import {
  CAMPANELLA_SIZE, CUORE_SIZE, GOCCIA_SIZE, MONETA_SIZE, NUVOLETTA, POF_SIZE, SBUFFO_SIZE, STELLA_SIZE, drawCampanella, drawCuore, drawCuoreVuoto, drawGoccia, drawMoneta, drawNuvoletta, drawPof, drawSbuffo, drawStella, drawStellaVuota,
} from './serata.js';

export const ONIGIRI_BANCONE = 150;
export const ONIGIRI_ICONA = 64;

export const DISEGNI = {
  // La carta non ha la grana della matita: ce l'ha già sua.
  carta: { w: STILE.carta.lato, h: STILE.carta.lato, grain: false, draw: (ctx, rng) => paper(ctx, STILE.carta.lato, rng) },
  ombra: { w: 200, h: 56, grain: false, draw: (ctx) => restingShadow(ctx, 100, 28, 96, 24) },
  // Le pose di Maurizio: `maurizio` è quella a riposo, le altre si chiamano maurizio-lavora, maurizio-evviva.
  ...Object.fromEntries(Object.keys(POSE).map((posa) => [maurizioKey(posa), { ...MAURIZIO_SIZE, draw: (ctx, rng) => drawMaurizio(ctx, rng, posa) }])),
  onigiri: { ...onigiriSize(ONIGIRI_BANCONE), draw: (ctx, rng) => drawOnigiri(ctx, rng, ONIGIRI_BANCONE) },
  'onigiri-icona': { ...onigiriSize(ONIGIRI_ICONA), draw: (ctx, rng) => drawOnigiri(ctx, rng, ONIGIRI_ICONA) },
  // Il takoyaki ha le stesse misure dell'onigiri (Bancone e icone scalano uguale), più la versione bruciata
  // che sta sulla Postazione, il Fumo e il cestino (passo 4).
  takoyaki: { ...takoyakiSize(ONIGIRI_BANCONE), draw: (ctx, rng) => drawTakoyaki(ctx, rng, ONIGIRI_BANCONE) },
  'takoyaki-icona': { ...takoyakiSize(ONIGIRI_ICONA), draw: (ctx, rng) => drawTakoyaki(ctx, rng, ONIGIRI_ICONA) },
  'takoyaki-bruciato-icona': { ...takoyakiSize(ONIGIRI_ICONA), draw: (ctx, rng) => drawTakoyaki(ctx, rng, ONIGIRI_ICONA, true) },
  // Il kakigōri in tre varianti (kakigori-fragola, -melone, -matcha), ognuna alla misura del Bancone e dell'icona.
  ...DISEGNI_KAKIGORI,
  // Il taiyaki (fagioli, crema) e il ramen (uovo, naruto), ognuno con Bancone, icona, bruciato e il passo a scelta (ticket 08).
  ...DISEGNI_TAIYAKI,
  ...DISEGNI_RAMEN,
  fumo: { ...FUMO_SIZE, draw: drawFumo },
  cestino: { ...CESTINO_SIZE, draw: drawCestino },
  // Lo Yatai: una Postazione per Piatto. Il pavimento, il Bancone, il Posto e lo sfondo cambiano con
  // il Matsuri e si generano solo per quello in uso: sono in sfondi/index.js (disegniTema).
  ...Object.fromEntries(Object.entries(POSTAZIONI).map(([piatto, draw]) => [postazioneKey(piatto), { ...POSTAZIONE_SIZE, draw }])),
  // Le Scorte degli Ingredienti (la ciotola del riso, i fogli di alga): stessa misura delle Postazioni.
  ...Object.fromEntries(Object.entries(SCORTE).map(([ingrediente, draw]) => [scortaKey(ingrediente), { ...POSTAZIONE_SIZE, draw }])),
  // I Clienti di passaggio: tre per quattro espressioni.
  ...DISEGNI_CLIENTI,
  // La Serata: la nuvoletta dell'Ordine, i cuoricini della Pazienza, lo Yen e le stelle del voto.
  nuvoletta: { w: NUVOLETTA.w, h: NUVOLETTA.h, draw: drawNuvoletta },
  cuore: { ...CUORE_SIZE, draw: drawCuore },
  'cuore-vuoto': { ...CUORE_SIZE, draw: drawCuoreVuoto },
  moneta: { ...MONETA_SIZE, draw: drawMoneta },
  stella: { ...STELLA_SIZE, draw: drawStella },
  'stella-vuota': { ...STELLA_SIZE, draw: drawStellaVuota },
  // I segni del Lamento: la goccia a 2 cuoricini, lo sbuffo a 1. Li mette accanto al Cliente ClienteView.
  'segno-goccia': { ...GOCCIA_SIZE, draw: drawGoccia },
  'segno-sbuffo': { ...SBUFFO_SIZE, draw: drawSbuffo },
  // La campanella dello Yatai, che oscilla prima di un'ondata (ticket 34): la appende SerataScene.
  campanella: { ...CAMPANELLA_SIZE, draw: drawCampanella },
  // Il "pof" della Serie che si spezza (ticket 34): una nuvoletta morbida, senza punizione.
  pof: { ...POF_SIZE, draw: drawPof },
};

// I pannelli e i pulsanti cambiano misura da una schermata all'altra: si disegnano su richiesta.
export const PANEL_MARGIN = 6;

export function panelDrawing(width, height, swatchName) {
  return {
    w: width + PANEL_MARGIN * 2,
    h: height + PANEL_MARGIN * 2 + STILE.pannello.ombraY,
    draw: (ctx, rng) => panel(ctx, width, height, rng, PALETTE[swatchName], PANEL_MARGIN),
  };
}

export const panelKey = (width, height, swatchName) => `pannello-${swatchName}-${width}x${height}`;

// Disegna la voce `key` su ctx. Il seme dipende solo da STILE.seme e dalla chiave, quindi
// ogni disegno esce identico a ogni avvio, in qualunque ordine si generino le texture.
export function drawEntry(ctx, key, entry) {
  const rng = createRng(`${STILE.seme}:${key}`);
  entry.draw(ctx, rng);
  if (entry.grain !== false) grain(ctx, entry.w, entry.h, rng, entry.grainDensity);
}
