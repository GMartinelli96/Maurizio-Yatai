// Tutte le immagini del gioco, disegnate dal codice all'avvio (ADR-0001). Ogni voce è una
// texture: la chiave è il nome che usano le scene, `draw` la disegna su un canvas w×h.
// L'elenco completo, con la provenienza, è in docs/stile/asset-manifest.json.

import { PALETTE, STILE } from '../config.js';
import { grain, panel, paper, restingShadow } from '../kit/matita.js';
import { createRng } from '../kit/rng.js';
import { MAURIZIO_SIZE, POSE, drawMaurizio, maurizioKey } from './maurizio.js';
import { DISEGNI_CLIENTI } from './clienti.js';
import { drawOnigiri, onigiriSize } from './onigiri.js';
import { POSTAZIONE_SIZE, POSTAZIONI, postazioneKey } from './postazioni.js';
import {
  CUORE_SIZE, MONETA_SIZE, NUVOLETTA, STELLA_SIZE, drawCuore, drawCuoreVuoto, drawMoneta, drawNuvoletta, drawStella, drawStellaVuota,
} from './serata.js';
import { BANCONE_SIZE, PAVIMENTO_SIZE, POSTO_SIZE, drawBancone, drawPavimento, drawPosto } from './yatai.js';

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
  // Lo Yatai: il pavimento, il Bancone, il Posto e una Postazione per Piatto.
  pavimento: { ...PAVIMENTO_SIZE, draw: drawPavimento },
  bancone: { ...BANCONE_SIZE, draw: drawBancone },
  posto: { ...POSTO_SIZE, draw: drawPosto },
  ...Object.fromEntries(Object.entries(POSTAZIONI).map(([piatto, draw]) => [postazioneKey(piatto), { ...POSTAZIONE_SIZE, draw }])),
  // I Clienti di passaggio: tre per tre espressioni.
  ...DISEGNI_CLIENTI,
  // La Serata: la nuvoletta dell'Ordine, i cuoricini della Pazienza, lo Yen e le stelle del voto.
  nuvoletta: { w: NUVOLETTA.w, h: NUVOLETTA.h, draw: drawNuvoletta },
  cuore: { ...CUORE_SIZE, draw: drawCuore },
  'cuore-vuoto': { ...CUORE_SIZE, draw: drawCuoreVuoto },
  moneta: { ...MONETA_SIZE, draw: drawMoneta },
  stella: { ...STELLA_SIZE, draw: drawStella },
  'stella-vuota': { ...STELLA_SIZE, draw: drawStellaVuota },
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
  if (entry.grain !== false) grain(ctx, entry.w, entry.h, rng);
}
