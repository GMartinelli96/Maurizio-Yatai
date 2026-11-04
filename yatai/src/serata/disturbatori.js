import { DISTURBATORI, SERATA_MOTORE } from '../config.js';
import { createRng } from '../kit/rng.js';
import { idPiatto, piattoBase } from './Serata.js';

// I Disturbatori (GLOSSARY.md; GAME_SPEC.md, "Clienti e Disturbatori"; ticket 11): Croccola, le formiche e i corvi.
// Niente Phaser e niente tempo reale: Serata.passo li fa avanzare a passi fissi e Serata.scaccia raccoglie il tocco.
// Ogni tipo ha il suo generatore (`${seed}/disturbatori/${tipo}`), come il cast: né gli arrivi dei Clienti né gli Ordini né
// gli altri Disturbatori cambiano se se ne aggiunge o se ne toglie uno. I numeri sono in config.js (DISTURBATORI).
//
// Un Disturbatore (uno per tipo alla volta) passa per queste fasi:
//   arriva   entra in scena; si può già mandare via
//   punta    guarda il suo bersaglio: Croccola si acquatta, la fila di formiche si avvicina, il corvo gracchia
//   colpo    balza, sale sul Piatto o picchia; è l'ultima possibilità di fermarlo, e se intanto il Piatto non c'è più
//            (servito, preso dalla Postazione) se ne va deluso
//   vaVia    se ne va (con il Piatto o senza) e poi, passato l'intervallo, può tornare
// Il bersaglio si ricalcola a ogni passo: Croccola e le formiche seguono il loro Piatto lungo il Bancone (se lo si serve
// ne cercano un altro dello stesso tipo), il corvo scende sul Piatto pronto da più tempo. Il Piatto rubato o rovinato non
// entra mai in un Ordine servito, quindi i suoi Ingredienti sono Spreco senza altro codice (GAME_SPEC.md, "Ingredienti e
// Spreco"); la Serie non si spezza, come per un Piatto bruciato.
//
// Gli eventi (oggetti con `tipo`, e `chi`: croccola | formiche | corvi):
//   disturbatoreArrivato { chi, bersaglio, arrivaMs, puntaMs, colpoMs }   `bersaglio` è null per un corvo senza Piatti pronti
//   disturbatorePunta    { chi, bersaglio }   comincia a puntare (il corvo gracchia: da qui il suono, ticket 23)
//   disturbatoreAttacca  { chi, bersaglio }   balzo, picchiata, salita sul Piatto
//   disturbatoreScacciato { chi, gesto }      un tocco: 'coccola' (Croccola fa le fusa) o 'tocco' (formiche e corvi)
//   piattoRubato         { chi, piatto, dove: 'bancone', indice } | { chi, piatto, dove: 'postazione', postazione }
//   piattoRovinato       { chi, piatto, dove: 'bancone', indice }   va nel cestino
//   disturbatoreVaVia    { chi, motivo: 'coccolata' | 'scacciato' | 'rubato' | 'rovinato' | 'delusa' }
// Un bersaglio è { dove: 'bancone', piatto, indice } o { dove: 'postazione', postazione, piatto }.

const SEC = 1000;
const ms = (cfg, voce) => cfg[`${voce}Sec`] * SEC;

export class Disturbatori {
  // tipi: quali Disturbatori ci sono in questa Serata (chiavi di DISTURBATORI); seed: il seme della Serata.
  constructor(tipi, seed) {
    for (const tipo of tipi) {
      if (!Object.hasOwn(DISTURBATORI, tipo)) throw new Error(`Disturbatore sconosciuto: "${tipo}"`);
    }
    this.tipi = [...tipi];
    this.rng = Object.fromEntries(this.tipi.map((tipo) => [tipo, createRng(`${seed}/disturbatori/${tipo}`)]));
    // Chi è in scena adesso, per tipo, e quando (in ms dall'inizio della Serata) può arrivare chi non c'è.
    this.attivi = new Map();
    this.prossimoMs = new Map(this.tipi.map((tipo) => [tipo, this.attesaMs(tipo, 'primoSec')]));
  }

  // Un'attesa scelta dal seme tra min e max secondi, su un multiplo del passo del motore.
  attesaMs(tipo, voce) {
    const { min, max } = DISTURBATORI[tipo][voce];
    const passo = SERATA_MOTORE.passoMs;
    return Math.round((this.rng[tipo].range(min, max) * SEC) / passo) * passo;
  }

  passo(serata, passoMs, eventi) {
    for (const chi of this.tipi) {
      const d = this.attivi.get(chi);
      if (d) this.avanza(serata, chi, d, passoMs, eventi);
      else if (serata.tempoMs >= this.prossimoMs.get(chi)) this.arriva(serata, chi, eventi);
    }
  }

  arriva(serata, chi, eventi) {
    const cfg = DISTURBATORI[chi];
    const bersaglio = this.cerca(serata, cfg, null);
    // Croccola e le formiche arrivano solo se c'è un Piatto da puntare: se non c'è riprovano al passo dopo.
    if (cfg.serveBersaglio && !bersaglio) return;
    this.attivi.set(chi, { fase: 'arriva', faseMs: 0, senzaMs: 0, bersaglio, motivo: null });
    eventi.push({ tipo: 'disturbatoreArrivato', chi, bersaglio, arrivaMs: ms(cfg, 'arriva'), puntaMs: ms(cfg, 'punta'), colpoMs: ms(cfg, 'colpo') });
  }

  avanza(serata, chi, d, passoMs, eventi) {
    const cfg = DISTURBATORI[chi];
    d.faseMs += passoMs;
    if (d.fase === 'vaVia') {
      if (d.faseMs >= ms(cfg, 'vaVia')) {
        this.attivi.delete(chi);
        this.prossimoMs.set(chi, serata.tempoMs + this.attesaMs(chi, 'intervalloSec'));
      }
      return;
    }
    d.bersaglio = this.cerca(serata, cfg, d.bersaglio);
    if (d.fase === 'arriva') {
      if (d.faseMs >= ms(cfg, 'arriva')) this.entra(chi, d, 'punta', eventi);
    } else if (d.fase === 'punta') {
      if (d.faseMs < ms(cfg, 'punta')) return;
      // Ha finito di puntare ma non c'è niente da colpire: aspetta un po' che arrivi un Piatto, poi se ne va deluso.
      if (!d.bersaglio) {
        d.senzaMs += passoMs;
        if (d.senzaMs >= ms(cfg, 'rinuncia')) this.vaVia(chi, d, 'delusa', eventi);
        return;
      }
      this.entra(chi, d, 'colpo', eventi);
    } else if (!d.bersaglio) {
      this.vaVia(chi, d, 'delusa', eventi);
    } else if (d.faseMs >= ms(cfg, 'colpo')) {
      this.colpisci(serata, chi, d, eventi);
    }
  }

  entra(chi, d, fase, eventi) {
    d.fase = fase;
    d.faseMs = 0;
    eventi.push({ tipo: fase === 'punta' ? 'disturbatorePunta' : 'disturbatoreAttacca', chi, bersaglio: d.bersaglio });
  }

  // Il bersaglio adesso: dove era (se c'è ancora), altrimenti il primo che va bene, altrimenti null.
  //   bancone     il Piatto di un tipo che punta, seguito lungo il Bancone (se lo si serve passa a un altro dello stesso tipo)
  //   postazione  un Piatto pronto (non bruciato, non in cottura): quello lasciato lì da più tempo
  cerca(serata, cfg, attuale) {
    if (cfg.dove === 'bancone') {
      const piatto = attuale && serata.bancone.includes(attuale.piatto)
        ? attuale.piatto
        : serata.bancone.find((id) => cfg.bersagli.includes(piattoBase(id)));
      return piatto === undefined ? null : { dove: 'bancone', piatto, indice: serata.bancone.indexOf(piatto) };
    }
    const pronte = serata.postazioni
      .filter((p) => p.stato === 'pronto' && (!cfg.bersagli || cfg.bersagli.includes(p.piatto)))
      .sort((a, b) => b.prontoMs - a.prontoMs);
    const scelta = pronte.find((p) => p.id === attuale?.postazione) ?? pronte[0];
    return scelta ? { dove: 'postazione', postazione: scelta.id, piatto: idPiatto(scelta.piatto, scelta.variante) } : null;
  }

  // Il colpo va a segno: il Piatto sparisce dal Bancone o dalla Postazione.
  colpisci(serata, chi, d, eventi) {
    const cfg = DISTURBATORI[chi];
    const { bersaglio } = d;
    const dove = bersaglio.dove === 'bancone' ? { indice: bersaglio.indice } : { postazione: bersaglio.postazione };
    if (bersaglio.dove === 'bancone') {
      serata.bancone.splice(bersaglio.indice, 1);
    } else {
      const postazione = serata.postazioni.find((p) => p.id === bersaglio.postazione);
      postazione.stato = 'libera';
      serata.azzera(postazione);
    }
    const ruba = cfg.esito === 'ruba';
    eventi.push({ tipo: ruba ? 'piattoRubato' : 'piattoRovinato', chi, piatto: bersaglio.piatto, dove: bersaglio.dove, ...dove });
    this.vaVia(chi, d, ruba ? 'rubato' : 'rovinato', eventi);
  }

  vaVia(chi, d, motivo, eventi) {
    d.fase = 'vaVia';
    d.faseMs = 0;
    d.motivo = motivo;
    eventi.push({ tipo: 'disturbatoreVaVia', chi, motivo });
  }

  // Il tocco su un Disturbatore: lo manda via finché non ha già colpito. Su uno che se ne sta già andando, o che non c'è,
  // non succede niente.
  scaccia(chi) {
    const d = this.attivi.get(chi);
    if (!d || d.fase === 'vaVia') return [];
    const { gesto } = DISTURBATORI[chi];
    const eventi = [{ tipo: 'disturbatoreScacciato', chi, gesto }];
    this.vaVia(chi, d, gesto === 'coccola' ? 'coccolata' : 'scacciato', eventi);
    return eventi;
  }

  // Chi è in scena, in dati semplici (per window.render_game_to_text() e per i test). `colpoTraMs` è quanto manca al colpo
  // (null mentre se ne va); `aspetta` dice che ha finito di puntare ma non ha niente da colpire.
  stato() {
    return this.tipi.filter((chi) => this.attivi.has(chi)).map((chi) => {
      const cfg = DISTURBATORI[chi];
      const { fase, faseMs, bersaglio, senzaMs, motivo } = this.attivi.get(chi);
      const arriva = ms(cfg, 'arriva');
      const punta = ms(cfg, 'punta');
      const colpo = ms(cfg, 'colpo');
      const traMs = { arriva: arriva - faseMs + punta + colpo, punta: Math.max(0, punta - faseMs) + colpo, colpo: Math.max(0, colpo - faseMs), vaVia: null };
      return {
        chi,
        fase,
        faseMs,
        bersaglio: bersaglio && { ...bersaglio },
        colpoTraMs: traMs[fase],
        aspetta: fase === 'punta' && faseMs >= punta && !bersaglio,
        rinunciaTraMs: fase === 'punta' && faseMs >= punta && !bersaglio ? ms(cfg, 'rinuncia') - senzaMs : null,
        motivo,
      };
    });
  }
}
