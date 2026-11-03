import {
  BANCONE,
  CLIENTI,
  PAZIENZA,
  PIATTI,
  POSTAZIONI,
  POSTI,
  SERATA,
  SERATA_MOTORE,
  SERATA_PRIMA,
} from '../config.js';
import { createRng } from '../kit/rng.js';

// La logica di una Serata: Posti, Clienti, Ordini, Pazienza, Bancone, Postazioni, Mancia,
// Incasso e stelle. Niente Phaser e niente tempo reale: la scena chiama update(dtMs) a ogni
// frame e le azioni del giocatore (tocca, servi), e legge gli eventi che tornano indietro per
// i riscontri (monete, cuoricini, Maurizio che si anima). Con lo stesso seme e le stesse azioni
// la Serata è sempre la stessa, quindi si prova senza browser.
//
// Gli eventi sono oggetti semplici con un campo `tipo`:
//   clienteArrivato   { posto, cliente: { id, tipo, ordine } }
//   cotturaIniziata   { postazione, piatto }
//   piattoPronto      { postazione, piatto }
//   sulBancone        { postazione, piatto }
//   postazioneOccupata { postazione }      il Piatto sta ancora cuocendo
//   postazioneSconosciuta { postazione }
//   banconePieno      { postazione }       il Piatto pronto resta sulla Postazione
//   scuoteTesta       { posto, mancano }   sul Bancone manca qualcosa dell'Ordine
//   postoVuoto        { posto }
//   servito           { posto, clienteId, tipoCliente, piatti, prezzo, cuori, mancia, totale }
//   mancia            { posto, yen, cuori }   solo se la Mancia non è zero
//   moneta            { posto, yen }          il totale pagato, da far volare nell'Incasso
//   cuoreSpento       { posto, cuori }
//   clienteVaVia      { posto, clienteId, motivo: 'pazienza' }   imbronciato, senza pagare
//   serataFinita      { incasso, obiettivo, stelle, serviti, persi }

const SEC = 1000;

// I cuoricini accesi per una Pazienza che ne ha ancora rimastaMs: cinque finché non è passato
// il primo quinto del tempo, zero solo a Pazienza finita.
export function cuoriDa(rimastaMs) {
  const quintoMs = (PAZIENZA.durationSec * SEC) / PAZIENZA.hearts;
  return Math.max(0, Math.min(PAZIENZA.hearts, Math.ceil(rimastaMs / quintoMs)));
}

// La Mancia va da zero (Pazienza finita) fino a maxManciaRatio del prezzo (cuoricini pieni).
// Gli Yen sono interi.
export function calcolaMancia(prezzo, cuori) {
  return Math.round((prezzo * PAZIENZA.maxManciaRatio * cuori) / PAZIENZA.hearts);
}

// Gli Yen che servono per ★, ★★, ★★★.
export function sogliePerStelle(obiettivo) {
  // Il -1e-9 evita che 1200 × 1,3 = 1560.0000000000002 tolga una stella a chi ha 1560.
  return SERATA.starThresholds.map((moltiplicatore) => Math.ceil(obiettivo * moltiplicatore - 1e-9));
}

export function calcolaStelle(incasso, obiettivo) {
  return sogliePerStelle(obiettivo).filter((soglia) => incasso >= soglia).length;
}

export class Serata {
  // opzioni (tutte facoltative, i valori di partenza sono in config.js):
  //   seed              il seme dell'arrivo dei Clienti
  //   obiettivo         Incasso per ★
  //   piatti            i Piatti disponibili (le Postazioni si ricavano da qui)
  //   piattiPerOrdine   { min, max }
  //   banconeCapienza   quanti Piatti stanno sul Bancone
  constructor({
    seed = 'serata',
    obiettivo = SERATA_PRIMA.obiettivo,
    piatti = SERATA_PRIMA.piatti,
    piattiPerOrdine = SERATA_PRIMA.piattiPerOrdine,
    banconeCapienza = BANCONE.capienza,
  } = {}) {
    this.rng = createRng(seed);
    this.obiettivo = obiettivo;
    this.piatti = piatti;
    this.piattiPerOrdine = piattiPerOrdine;
    this.banconeCapienza = banconeCapienza;

    this.durataMs = SERATA.durationSec * SEC;
    this.tempoMs = 0;
    // Il tempo che update() ha ricevuto e il motore non ha ancora consumato a passi fissi.
    this.resto = 0;
    this.finita = false;

    this.incasso = 0;
    this.serviti = 0;
    this.persi = 0;
    this.prossimoId = 1;

    this.posti = Array.from({ length: POSTI.quanti }, () => ({ cliente: null, liberoDaMs: 0 }));
    this.bancone = [];
    this.postazioni = Object.entries(POSTAZIONI)
      .filter(([, { piatto }]) => piatti.includes(piatto))
      .map(([id, { piatto }]) => ({ id, piatto, stato: 'libera', cottoMs: 0 }));
    this.prossimoArrivoMs = Math.round(CLIENTI.primoArrivoSec * SEC);
  }

  // Fa avanzare la Serata di dtMs e restituisce gli eventi, nell'ordine in cui sono successi.
  update(dtMs) {
    const eventi = [];
    if (this.finita) return eventi;
    this.resto += dtMs;
    const passo = SERATA_MOTORE.passoMs;
    // La tolleranza assorbe l'errore dei frame da 1/60 s, che non sono multipli esatti di 10 ms.
    while (!this.finita && this.resto >= passo - 1e-6) {
      this.resto = Math.max(0, this.resto - passo);
      this.passo(passo, eventi);
    }
    if (this.finita) this.resto = 0;
    return eventi;
  }

  passo(passoMs, eventi) {
    this.tempoMs += passoMs;
    for (const postazione of this.postazioni) this.cuoci(postazione, passoMs, eventi);
    this.posti.forEach((posto, indice) => this.aspetta(posto, indice, passoMs, eventi));
    this.faiArrivare(eventi);
    if (this.tempoMs >= this.durataMs) {
      this.tempoMs = this.durataMs;
      this.finita = true;
      eventi.push({
        tipo: 'serataFinita',
        incasso: this.incasso,
        obiettivo: this.obiettivo,
        stelle: calcolaStelle(this.incasso, this.obiettivo),
        serviti: this.serviti,
        persi: this.persi,
      });
    }
  }

  // --- Postazioni ---

  cuoci(postazione, passoMs, eventi) {
    if (postazione.stato !== 'cuoce') return;
    postazione.cottoMs += passoMs;
    if (postazione.cottoMs >= PIATTI[postazione.piatto].cookSec * SEC) {
      // Per ora si brucia solo ciò che ha burnAfterSec; l'onigiri no (passo 4: Fumo e cestino).
      postazione.stato = 'pronto';
      eventi.push({ tipo: 'piattoPronto', postazione: postazione.id, piatto: postazione.piatto });
    }
  }

  // Il tocco su una Postazione: se è libera il Piatto comincia a cuocere, se è pronto passa
  // sul Bancone, se sta cuocendo non succede niente.
  tocca(id) {
    if (this.finita) return [];
    const postazione = this.postazioni.find((p) => p.id === id);
    if (!postazione) return [{ tipo: 'postazioneSconosciuta', postazione: id }];
    const { piatto } = postazione;
    if (postazione.stato === 'cuoce') return [{ tipo: 'postazioneOccupata', postazione: id }];
    if (postazione.stato === 'libera') {
      postazione.stato = 'cuoce';
      postazione.cottoMs = 0;
      return [{ tipo: 'cotturaIniziata', postazione: id, piatto }];
    }
    if (this.bancone.length >= this.banconeCapienza) return [{ tipo: 'banconePieno', postazione: id }];
    this.bancone.push(piatto);
    postazione.stato = 'libera';
    postazione.cottoMs = 0;
    return [{ tipo: 'sulBancone', postazione: id, piatto }];
  }

  // --- Clienti ---

  aspetta(posto, indice, passoMs, eventi) {
    const cliente = posto.cliente;
    if (!cliente) return;
    cliente.pazienzaMs = Math.max(0, cliente.pazienzaMs - passoMs);
    const cuori = cuoriDa(cliente.pazienzaMs);
    if (cuori !== cliente.cuori) {
      cliente.cuori = cuori;
      eventi.push({ tipo: 'cuoreSpento', posto: indice, cuori });
    }
    if (cliente.pazienzaMs === 0) {
      this.persi++;
      eventi.push({ tipo: 'clienteVaVia', posto: indice, clienteId: cliente.id, motivo: 'pazienza' });
      this.liberaPosto(posto);
    }
  }

  liberaPosto(posto) {
    posto.cliente = null;
    posto.liberoDaMs = this.tempoMs + POSTI.ricambioSec * SEC;
  }

  // Intero tra min e max secondi, in ms e multiplo del passo, così gli arrivi cadono su un passo.
  attesaArrivoMs() {
    const { min, max } = CLIENTI.arrivoSec;
    return Math.round(this.rng.range(min, max) * (SEC / SERATA_MOTORE.passoMs)) * SERATA_MOTORE.passoMs;
  }

  faiArrivare(eventi) {
    if (this.tempoMs < this.prossimoArrivoMs) return;
    const liberi = this.posti
      .map((posto, indice) => ({ posto, indice }))
      .filter(({ posto }) => !posto.cliente && posto.liberoDaMs <= this.tempoMs);
    // Posti pieni: il Cliente aspetta che se ne liberi uno, e arriva appena succede.
    if (!liberi.length) return;

    const { posto, indice } = liberi[Math.floor(this.rng() * liberi.length)];
    const tipo = CLIENTI.passaggio[Math.floor(this.rng() * CLIENTI.passaggio.length)];
    const ordine = this.creaOrdine();
    posto.cliente = {
      id: this.prossimoId++,
      tipo,
      ordine,
      pazienzaMs: PAZIENZA.durationSec * SEC,
      cuori: PAZIENZA.hearts,
    };
    this.prossimoArrivoMs = this.tempoMs + this.attesaArrivoMs();
    eventi.push({ tipo: 'clienteArrivato', posto: indice, cliente: { id: posto.cliente.id, tipo, ordine: [...ordine] } });
  }

  // Un Ordine è una lista di Piatti, da uno a tre.
  creaOrdine() {
    const { min, max } = this.piattiPerOrdine;
    const quanti = min + Math.floor(this.rng() * (max - min + 1));
    return Array.from({ length: quanti }, () => this.piatti[Math.floor(this.rng() * this.piatti.length)]);
  }

  // Il tocco (o il trascinamento) su un Cliente: è servito se sul Bancone c'è tutto il suo Ordine.
  servi(indicePosto) {
    if (this.finita) return [];
    const posto = this.posti[indicePosto];
    const cliente = posto?.cliente;
    if (!cliente) return [{ tipo: 'postoVuoto', posto: indicePosto }];

    const rimasti = [...this.bancone];
    const mancano = [];
    for (const piatto of cliente.ordine) {
      const trovato = rimasti.indexOf(piatto);
      if (trovato === -1) mancano.push(piatto);
      else rimasti.splice(trovato, 1);
    }
    if (mancano.length) return [{ tipo: 'scuoteTesta', posto: indicePosto, mancano }];

    this.bancone = rimasti;
    const prezzo = cliente.ordine.reduce((somma, piatto) => somma + PIATTI[piatto].price, 0);
    const cuori = cliente.cuori;
    const mancia = calcolaMancia(prezzo, cuori);
    const totale = prezzo + mancia;
    this.incasso += totale;
    this.serviti++;
    this.liberaPosto(posto);

    const eventi = [
      {
        tipo: 'servito',
        posto: indicePosto,
        clienteId: cliente.id,
        tipoCliente: cliente.tipo,
        piatti: [...cliente.ordine],
        prezzo,
        cuori,
        mancia,
        totale,
      },
    ];
    if (mancia > 0) eventi.push({ tipo: 'mancia', posto: indicePosto, yen: mancia, cuori });
    eventi.push({ tipo: 'moneta', posto: indicePosto, yen: totale });
    return eventi;
  }

  // Lo stato in forma di dati semplici (solo numeri, stringhe, liste): basta per
  // window.render_game_to_text() e per i test. Per giocare senza guardare lo schermo.
  stato() {
    return {
      fase: this.finita ? 'finita' : 'in corso',
      tempoMs: this.tempoMs,
      restaMs: this.durataMs - this.tempoMs,
      incasso: this.incasso,
      obiettivo: this.obiettivo,
      sogliaStelle: sogliePerStelle(this.obiettivo),
      stelle: calcolaStelle(this.incasso, this.obiettivo),
      serviti: this.serviti,
      persi: this.persi,
      posti: this.posti.map(({ cliente }, posto) => ({
        posto,
        cliente: cliente && {
          id: cliente.id,
          tipo: cliente.tipo,
          ordine: [...cliente.ordine],
          cuori: cliente.cuori,
          pazienzaMs: cliente.pazienzaMs,
        },
      })),
      bancone: [...this.bancone],
      postazioni: this.postazioni.map(({ id, piatto, stato, cottoMs }) => ({
        id,
        piatto,
        stato,
        restaMs: stato === 'cuoce' ? PIATTI[piatto].cookSec * SEC - cottoMs : 0,
      })),
    };
  }
}
