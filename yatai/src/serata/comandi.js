import { COMANDI } from '../config.js';

// Dai tasti alle azioni (skill input-systems): il gioco non guarda mai "il tasto Q", guarda
// l'azione "servi il Posto 0". I tasti sono in COMANDI (config.js) e sono codici fisici
// (KeyboardEvent.code), quindi Q/W/E/R e 1–5 restano nello stesso punto su ogni tastiera.
//
// Il tocco e il mouse portano alle stesse azioni: { tipo: 'posto' | 'postazione', indice } oppure
// { tipo: 'rigioca' }. Niente Phaser qui: si prova senza browser.
export function azioneDaTasto(code) {
  const postazione = COMANDI.postazioni.indexOf(code);
  if (postazione !== -1) return { tipo: 'postazione', indice: postazione };
  const tastierino = COMANDI.postazioniTastierino.indexOf(code);
  if (tastierino !== -1) return { tipo: 'postazione', indice: tastierino };
  const posto = COMANDI.posti.indexOf(code);
  if (posto !== -1) return { tipo: 'posto', indice: posto };
  if (COMANDI.rigioca.includes(code)) return { tipo: 'rigioca' };
  return null;
}

// I tasti che comandano il Posto o la Postazione numero `indice`, per mostrarli (o per i test).
export const tastoDelPosto = (indice) => COMANDI.posti[indice] ?? null;
export const tastoDellaPostazione = (indice) => COMANDI.postazioni[indice] ?? null;
