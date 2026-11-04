import { CLIENTI } from '../config.js';

// Chi arriva ai Posti: la regola che mescola il cast (CLIENTI.cast) con i Clienti di passaggio. Niente Phaser e
// niente tempo: Serata.faiArrivare la chiama a ogni arrivo e usa un generatore a parte (`${seed}/cast`), come
// fasiDellaSerata con `${seed}/ondate`. Così il cast non consuma i numeri del generatore degli arrivi: con lo
// stesso seme i tempi di arrivo, i Posti e gli Ordini sono quelli di prima e cambia solo chi si siede.

// Il tipo di un Cliente è del cast?
export const eDelCast = (tipo) => CLIENTI.cast.membri.includes(tipo);

// Il prossimo Cliente è del cast? Torna l'id del peluche, o null se arriva uno di passaggio.
//   rng      il generatore del cast (una funzione senza argomenti che dà un numero da 0 a 1)
//   alPosto  i tipi dei Clienti seduti adesso
//   ultimo   il peluche del cast arrivato per ultimo (o null): non torna di seguito
// Se i Posti del cast sono già al massimo, o il sorteggio dice "di passaggio", torna null. Altrimenti sceglie a caso
// tra i peluche che non sono ai Posti e non sono l'ultimo arrivato.
export function scegliDelCast(rng, { alPosto = [], ultimo = null } = {}) {
  const { membri, quota, maxAiPosti } = CLIENTI.cast;
  if (alPosto.filter(eDelCast).length >= maxAiPosti) return null;
  if (rng() >= quota) return null;
  const candidati = membri.filter((id) => id !== ultimo && !alPosto.includes(id));
  if (!candidati.length) return null;
  return candidati[Math.floor(rng() * candidati.length)];
}
