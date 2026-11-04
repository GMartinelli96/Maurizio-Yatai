// La Bottega, la parte che si calcola: quali Potenziamenti si possono comprare, a che prezzo, e come cambiano la Serata
// (ticket 35). La schermata che li mostra sta nella scena; qui non c'è niente di grafico, così i test girano senza browser.
//
// I Potenziamenti e i loro prezzi sono in POTENZIAMENTI (config.js); gli Yen e i livelli comprati stanno nel Salvataggio.

import { POSTI, POTENZIAMENTI } from './config.js';

// Nell'ordine in cui la Bottega li mostra.
export const ORDINE_POTENZIAMENTI = ['postoInPiu', 'ventaglio'];

// A che livello è un Potenziamento: da 0 (non comprato) fino all'ultimo. Un livello salvato più alto di quelli che
// esistono (un gioco più vecchio o un file modificato) vale l'ultimo.
export function livelloDi(salvataggio, id) {
  return Math.min(salvataggio.livello(id), POTENZIAMENTI[id].livelli.length);
}

// Com'è un Potenziamento adesso: `prezzo` è quello del livello successivo (null se è al massimo) e `comprabile` dice
// se gli Yen bastano.
export function voceDi(salvataggio, id) {
  const { livelli } = POTENZIAMENTI[id];
  const livello = livelloDi(salvataggio, id);
  const prossimo = livelli[livello] ?? null;
  return {
    id,
    livello,
    livelloMax: livelli.length,
    prezzo: prossimo?.prezzo ?? null,
    comprabile: prossimo !== null && salvataggio.yen >= prossimo.prezzo,
  };
}

export const vociDellaBottega = (salvataggio) => ORDINE_POTENZIAMENTI.map((id) => voceDi(salvataggio, id));

// Compra il livello successivo di un Potenziamento. Se è già al massimo o gli Yen non bastano non succede niente:
// non si scende mai sotto zero. Restituisce true se ha comprato.
export function compra(salvataggio, id) {
  const voce = voceDi(salvataggio, id);
  if (!voce.comprabile) return false;
  return salvataggio.acquista(id, voce.prezzo, voce.livello + 1);
}

// Come i Potenziamenti cambiano una Serata: sono le opzioni di Serata (src/serata/Serata.js).
export function opzioniSerata(salvataggio) {
  const posto = livelloDi(salvataggio, 'postoInPiu');
  const ventaglio = livelloDi(salvataggio, 'ventaglio');
  return {
    posti: posto > 0 ? POTENZIAMENTI.postoInPiu.livelli[posto - 1].posti : POSTI.quanti,
    pazienzaMoltiplicatore: ventaglio > 0 ? POTENZIAMENTI.ventaglio.livelli[ventaglio - 1].pazienza : 1,
  };
}
