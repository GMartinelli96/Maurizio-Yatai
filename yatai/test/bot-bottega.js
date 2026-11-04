// Il giocatore automatico dei test di bilanciamento: una copia di `giocaServata` di test/serata.test.js (ticket 34), per
// poterla usare da test/bottega.test.js. È provvisorio: il ticket 07 ha un test/bot.js più completo (varianti, piatti bruciati);
// quando arriva in main, bottega.test.js passa a quello e questo file sparisce.
import { Serata } from '../src/serata/Serata.js';

// La bravura è quanto tempo passa tra un tocco e l'altro.
export const BRAVURA = { rapido: 600, attento: 1000, lento: 1400 };
export const SEMI = ['a', 'b', 'c', 'd', 'e', 'f'];

// Un giocatore che fa una mossa ogni `reazioneMs`, senza mai sbagliare (quindi non spezza mai la Serie). `opzioni` sono
// quelle di Serata (posti, pazienzaMoltiplicatore...). Restituisce lo stato finale con in più quanti Clienti sono arrivati.
export function giocaServata(reazioneMs, seed, opzioni = {}) {
  const serata = new Serata({ seed, ...opzioni });
  let arrivati = 0;
  for (let t = 10; !serata.finita; t += 10) {
    arrivati += serata.update(10).filter((e) => e.tipo === 'clienteArrivato').length;
    if (t % reazioneMs !== 0) continue;
    const stato = serata.stato();
    const servibili = stato.posti
      .filter(({ cliente }) => cliente && cliente.ordine.every((piatto) => stato.bancone.includes(piatto)))
      .sort((a, b) => a.cliente.cuori - b.cliente.cuori);
    const pronta = stato.postazioni.find((p) => p.stato === 'pronto');
    const cominciata = stato.postazioni.find((p) => p.stato === 'inPreparazione');
    const libera = stato.postazioni.find((p) => p.stato === 'libera');
    const inCorso = stato.postazioni.filter((p) => p.stato !== 'libera').length;
    const bisogni = stato.posti.filter(({ cliente }) => cliente).length;
    if (servibili.length) serata.servi(servibili[0].posto);
    else if (pronta) serata.tocca(pronta.id);
    else if (cominciata) serata.tocca(cominciata.prossimo);
    else if (libera && bisogni > stato.bancone.length + inCorso) serata.tocca(libera.prossimo);
  }
  return { ...serata.stato(), arrivati };
}

// La media su 6 semi (a-f) di un dato dello stato finale.
export const media = (campo, reazioneMs, opzioni) => SEMI.reduce((somma, seme) => somma + giocaServata(reazioneMs, seme, opzioni)[campo], 0) / SEMI.length;
