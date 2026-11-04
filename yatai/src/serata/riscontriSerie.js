// I numeri dei riscontri della Serie (ticket 34, passo 4), senza Phaser: la scena li legge e i test li provano.
// Tutto parte dalla Serie che la logica ha già contato (`servito.serie`); qui si decide solo quanto si vede.

import { RISCONTRI, SERIE } from '../config.js';
import { moltiplicatoreSerie } from './Serata.js';

// Il numero vicino a Maurizio compare dalla Serie `daSerie`: il primo Ordine di fila non ha bonus da festeggiare.
export const serieVisibile = (serie) => serie >= RISCONTRI.serie.daSerie;

// Il numero, senza parole: "×2", "×3"...
export const testoSerie = (serie) => `×${serie}`;

// Quanto la Mancia della Serie è vicina al suo massimo, da 0 (nessun bonus) a 1 (il tetto: ×1,5 a 6 di fila). Oltre il tetto
// resta 1: il numero continua a contare ma non cresce più.
export function progressoSerie(serie) {
  const bonusMax = SERIE.moltiplicatoreMax - 1;
  return Math.min(1, Math.max(0, (moltiplicatoreSerie(serie) - 1) / bonusMax));
}

export const serieAlTetto = (serie) => progressoSerie(serie) >= 1 - 1e-9;

// Il corpo del testo del numero, in pixel di gioco: cresce con la Serie fino al tetto.
export function corpoSerie(serie) {
  const { base, alTetto } = RISCONTRI.serie.corpo;
  return Math.round(base + (alTetto - base) * progressoSerie(serie));
}

// Quante monete volano dal Cliente all'Incasso: una ogni `scaglione` Yen (da 1 a `max`) e, con la Serie alta, fino a
// `moneteExtra` in più. Mai più monete degli Yen che portano.
export function moneteDelPagamento(yen, serie) {
  const { scaglione, max } = RISCONTRI.monete;
  const base = Math.max(1, Math.min(max, Math.round(yen / scaglione)));
  const extra = Math.round(progressoSerie(serie) * RISCONTRI.serie.moneteExtra);
  return Math.max(1, Math.min(yen, base + extra));
}

// Di quanto si ingrandisce la scritta "+150" con la Serie (1 senza Serie, `sommaAlTetto` al tetto).
export function scalaSomma(serie) {
  return 1 + (RISCONTRI.serie.sommaAlTetto - 1) * progressoSerie(serie);
}
