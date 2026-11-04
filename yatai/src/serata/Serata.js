import {
  BANCONE,
  BRUCIATURA,
  CLIENTI,
  FUMO_SEC,
  LAMENTO,
  ONDATE,
  PAZIENZA,
  PIATTI,
  POSTAZIONI,
  POSTI,
  SERATA,
  SERATA_MOTORE,
  SERATA_PRIMA,
  SERIE,
  VIZI,
} from '../config.js';
import { createRng } from '../kit/rng.js';
import { scegliDelCast } from './cast.js';

// La logica di una Serata: Posti, Clienti, Ordini, Pazienza, Bancone, Scorte, Postazioni, Mancia,
// Spesa, Incasso e stelle. Niente Phaser e niente tempo reale: la scena chiama update(dtMs) a ogni
// frame e le azioni del giocatore (tocca, servi), e legge gli eventi che tornano indietro per
// i riscontri (monete, cuoricini, Maurizio che si anima). Con lo stesso seme e le stesse azioni
// la Serata è sempre la stessa, quindi si prova senza browser.
//
// Ogni Piatto ha una `ricetta` (config.js, PIATTI): una lista di passi. Un passo è un Ingrediente, che si
// tocca dalla sua Scorta e si paga subito, oppure una cottura, che parte da sola quando il passo prima è
// fatto e dura i suoi secondi (intanto le Scorte non fanno niente). Finiti tutti i passi il Piatto è pronto e
// si prende. La logica non sa cosa sia un takoyaki: la cottura può stare dove la ricetta la mette (dopo il
// polpo, dopo il ghiaccio). L'Incasso è il netto: Vendite meno Spesa (GAME_SPEC.md, "Ingredienti e Spreco").
//
// Gli eventi sono oggetti semplici con un campo `tipo`:
//   clienteArrivato   { posto, cliente: { id, tipo, ordine, vizio } }   `tipo` è di passaggio o del cast (CLIENTI.cast); `vizio` il suo Vizio, o null
//   ingrediente       { postazione, scorta, costo, fatti, di, variante? }   un Ingrediente è finito nel Piatto (e si è
//                                              pagato); `variante` c'è se era la scelta tra le varianti (lo sciroppo)
//   cotturaIniziata   { postazione, piatto, durataMs }   finito un Ingrediente, il passo dopo è una cottura
//   cotturaFinita     { postazione, piatto }   la cottura è finita ma il Piatto non è pronto: manca ancora un Ingrediente
//   ingredienteRifiutato { scorta, motivo }   fuori ordine ('ordine'), con la Postazione che cuoce ('cuoce') o con tutte
//                                              le Postazioni piene ('occupato'): non costa niente
//   piattoPronto      { postazione, piatto }   `piatto` porta la variante se c'è (kakigori-melone), come sulBancone
//   staPerBruciarsi   { postazione, piatto, traMs }   il Piatto pronto è negli ultimi secondi, una volta sola
//   piattoBruciato    { postazione, piatto }   dimenticato troppo: resta sulla Postazione finché non si tocca
//   nelCestino        { postazione, piatto }   toccato il Piatto bruciato: da qui la Postazione è nel Fumo
//   postazioneNelFumo { postazione, restaMs }  si è toccata una Postazione che non si può usare
//   fumoPassato       { postazione }           il Fumo è finito, la Postazione è di nuovo libera
//   sulBancone        { postazione, piatto }
//   nienteDaPrendere  { postazione }       il Piatto non è ancora finito (mancano Ingredienti o sta cuocendo)
//   postazioneSconosciuta { postazione }
//   banconePieno      { postazione }       il Piatto pronto resta sulla Postazione
//   scuoteTesta       { posto, mancano }   sul Bancone manca qualcosa dell'Ordine (un servizio a vuoto: spezza la Serie)
//   postoVuoto        { posto }
//   servito           { posto, clienteId, tipoCliente, piatti, prezzo, cuori, mancia, totale, serie, moltiplicatoreSerie, yenDOro }
//                     `serie` è la Serie con questo Ordine dentro; `moltiplicatoreSerie` quanto ha moltiplicato la Mancia;
//                     `prezzo` è quello pagato (il doppio per Carlotta); `yenDOro` dice se Nella ha lasciato lo Yen d'oro
//   yenDOro           { posto, clienteId, yen }   con 'servito', solo se Nella lascia lo Yen d'oro: `yen` è la sua Mancia, già triplicata
//   serieSpezzata     { serie, motivo: 'clientePerso' | 'servizioAVuoto', posto }   `serie` è quanto valeva: il "pof" morbido.
//                                              Solo se valeva qualcosa (a zero non c'è niente da spezzare)
//   mancia            { posto, yen, cuori }   solo se la Mancia non è zero
//   moneta            { posto, yen }          il totale pagato, da far volare nell'Incasso
//   cuoreSpento       { posto, cuori }
//   lamento           { posto, clienteId, cuori, espressione, segno }   il Cliente scende di scalino (a 2 e a 1 cuoricini), una volta per scalino e per Cliente: l'audio ci aggancia il "mmh"
//   clienteVaVia      { posto, clienteId, motivo: 'pazienza' }   imbronciato, senza pagare
//   ondataInArrivo    { fase, traMs }         ONDATE.avvisoSec prima di ogni ondata (anche la finale), una volta per ondata: da qui
//                                              parte il segnale visivo (Maurizio alza la testa, la campanella oscilla); il suono è del ticket 23
//   serataFinita      { incasso, vendite, spesa, spreco, obiettivo, stelle, serviti, persi, serieMax, manciaDaSerie, perPiatto }
//                     `perPiatto` è la tabella del recap (vedi perPiatto())

const SEC = 1000;

// I cuoricini accesi per una Pazienza che ne ha ancora rimastaMs su totaleMs: tutti finché non è passato il primo
// cuoricino di tempo, zero solo a Pazienza finita. Ogni Cliente ha il suo totale (25 s, 15 s se è arrivato in un'ondata)
// e di solito 5 cuoricini, ognuno un quinto di quella Pazienza. Con il Posto in più i cuoricini sono `cuoriMax` (6): il
// totale cresce di 6/5, quindi ogni cuoricino dura lo stesso (5 s in calma, 3 s in ondata) e il sesto si aggiunge in coda.
export function cuoriDa(rimastaMs, totaleMs = PAZIENZA.durationSec * SEC, cuoriMax = PAZIENZA.hearts) {
  const cuoricinoMs = totaleMs / cuoriMax;
  return Math.max(0, Math.min(cuoriMax, Math.ceil(rimastaMs / cuoricinoMs)));
}

// Le fasi di una Serata (ONDATE.fasi) con gli inizi in ms. Il seme sposta l'inizio di ogni fase tranne la
// prima di al più ONDATE.scostoSec, sempre su un multiplo del passo del motore. Ha il suo generatore, così non
// cambia gli arrivi né gli Ordini: stesso seme, stesse fasi. Le fasi restano nell'ordine e distanti (lo controlla
// un test), quindi nessuna Serata è impossibile per chi è lento.
export function fasiDellaSerata(seed) {
  const rng = createRng(`${seed}/ondate`);
  const passo = SERATA_MOTORE.passoMs;
  return ONDATE.fasi.map(({ nome, daSec, arrivoSec, ondata }, i) => {
    const scartoMs = i === 0 ? 0 : rng.jitter(ONDATE.scostoSec * SEC);
    const inizioMs = Math.round((daSec * SEC + scartoMs) / passo) * passo;
    return { nome, inizioMs, arrivoSec, ondata };
  });
}

// L'espressione di un Cliente in attesa con `cuori` cuoricini accesi. Dipende dai cuoricini e non dal
// tempo, quindi segue da sola i Vizi che cambiano la velocità della Pazienza. (Da servito è `contenta`,
// ma lo decide la vista.)
export function espressioneDa(cuori) {
  if (cuori <= LAMENTO.imbronciataA) return 'imbronciata';
  if (cuori <= LAMENTO.perplessaA) return 'perplessa';
  return 'neutra';
}

// Il segno senza parole che accompagna la faccia: goccia di sudore, sbuffo d'aria, o niente.
export function segnoDa(cuori) {
  if (cuori <= LAMENTO.imbronciataA) return 'sbuffo';
  if (cuori <= LAMENTO.perplessaA) return 'goccia';
  return null;
}

// Gli scalini del Lamento (in cuoricini) che si superano passando da `prima` a `dopo` cuoricini, dal
// primo all'ultimo. Di solito è uno solo; se un passo ne salta due, li dà tutti e due, così nessuno si perde.
function scaliniSuperati(prima, dopo) {
  return [LAMENTO.perplessaA, LAMENTO.imbronciataA].filter((scalino) => prima > scalino && dopo <= scalino);
}

// La Mancia va da zero (Pazienza finita) fino a maxManciaRatio del prezzo (cuoricini pieni), per il moltiplicatore
// (la Serie, Che stile!, Yen d'oro, desideri: tutti insieme, senza un tetto in più). Gli Yen sono interi. Con 6 cuoricini
// la Mancia piena è la stessa: ogni cuoricino ne vale un sesto, non di più.
export function calcolaMancia(prezzo, cuori, moltiplicatore = 1, cuoriMax = PAZIENZA.hearts) {
  return Math.round((prezzo * PAZIENZA.maxManciaRatio * cuori * moltiplicatore) / cuoriMax);
}

// Di quanto la Serie moltiplica la Mancia: niente per il primo Cliente, +10% per ognuno di fila oltre il primo, fino
// al tetto (×1,5, a 6 di fila). Con Serie zero (nessun Ordine servito) è ×1.
export function moltiplicatoreSerie(serie) {
  return Math.min(SERIE.moltiplicatoreMax, 1 + SERIE.manciaPerCliente * Math.max(0, serie - 1));
}

// Gli Yen che servono per ★, ★★, ★★★.
export function sogliePerStelle(obiettivo) {
  // Il -1e-9 evita che 1200 × 1,3 = 1560.0000000000002 tolga una stella a chi ha 1560.
  return SERATA.starThresholds.map((moltiplicatore) => Math.ceil(obiettivo * moltiplicatore - 1e-9));
}

export function calcolaStelle(incasso, obiettivo) {
  return sogliePerStelle(obiettivo).filter((soglia) => incasso >= soglia).length;
}

// Un Piatto con una variante (il kakigōri alla fragola) si chiama `piatto-variante` negli Ordini e sul Bancone,
// così "la variante sbagliata" è solo un Piatto diverso. Gli id dei Piatti e delle varianti non hanno trattini.
export const idPiatto = (piatto, variante) => (variante ? `${piatto}-${variante}` : piatto);
export const piattoBase = (id) => id.split('-')[0];
export const varianteDi = (id) => id.split('-')[1] ?? null;

// Le voci che un passo accetta: un Ingrediente solo, oppure una di più Scorte (`unoDi`, le varianti).
const vociDi = (passo) => passo.unoDi ?? [passo];

// I passi della ricetta che sono tocchi su una Scorta (le cotture no): quelli che hanno un'icona nella Ricetta
// mostrata sulla Postazione, e che contano come tocchi. Un Piatto senza ricetta non ne ha. Accetta anche l'id
// di una variante (kakigori-fragola).
export function passiDi(piatto) {
  return (PIATTI[piattoBase(piatto)].ricetta ?? []).filter((passo) => passo.cotturaSec === undefined);
}

// Gli Ingredienti di un Piatto, uno per passo. Per un Piatto con varianti dipende dall'id: kakigori-fragola ha lo
// sciroppo di fragola. Con l'id senza variante vale la prima (le voci di un passo costano uguale, lo controlla
// un test).
export function ingredientiDi(piatto) {
  const variante = varianteDi(piatto);
  return passiDi(piatto).map((passo) => {
    const voci = vociDi(passo);
    return (variante && voci.find((voce) => voce.variante === variante)) || voci[0];
  });
}

// Tutte le Scorte che servono a un Piatto, nell'ordine della ricetta: per un passo `unoDi` sono tutte le varianti.
export function scorteDi(piatto) {
  return passiDi(piatto).flatMap(vociDi);
}

// Gli Yen di Ingredienti di un Piatto: la somma della sua ricetta (zero se non ne ha una).
export function costoPiatto(piatto) {
  return ingredientiDi(piatto).reduce((somma, { costo }) => somma + costo, 0);
}

// Quanti tocchi servono per fare un Piatto: uno per passo con una Scorta più uno per prenderlo. La cottura non
// è un tocco, e scegliere tra le varianti è lo stesso tocco. Il tetto è 4 (GAME_SPEC.md, "La cucina a tocchi").
export function tocchiPerPiatto(piatto) {
  return passiDi(piatto).length + 1;
}

export class Serata {
  // opzioni (tutte facoltative, i valori di partenza sono in config.js):
  //   seed              il seme dell'arrivo dei Clienti
  //   obiettivo         Incasso per ★
  //   piatti            i Piatti disponibili (le Postazioni si ricavano da qui)
  //   piattiPerOrdine   { min, max, tre? }   `tre` (da 0 a 1) è la quota degli Ordini da 3 Piatti, sopra min e max: se manca
  //                     non si pesa niente (e non si estrae un numero in più, quindi le Serate di prima restano identiche)
  //   banconeCapienza   quanti Piatti stanno sul Bancone
  //   moltiplicatoriMancia  i moltiplicatori della Mancia che non sono la Serie (Che stile!, Yen d'oro, desideri),
  //                     per ora nessuno: si moltiplicano tra loro e con la Serie, senza un tetto unico
  //   posti             quanti Posti (3, 4 con il Potenziamento)
  //   pazienzaMoltiplicatore  quanto allunga la Pazienza di chi arriva, in calma e in ondata (il ventaglio, ticket 35)
  //   cotturaMoltiplicatori  { piastra: 0.8 }: per ogni Postazione (id in POSTAZIONI) il moltiplicatore dei secondi della sua
  //                     cottura (Postazione più veloce, ticket 06); chi manca cuoce in tempo pieno
  //   cuori             quanti cuoricini ha la Pazienza di ogni Cliente (5, 6 con il Posto in più): ognuno dura sempre un
  //                     quinto della Pazienza di base, quindi con 6 la Pazienza totale è 6/5 (ticket 35)
  constructor({
    seed = 'serata',
    obiettivo = SERATA_PRIMA.obiettivo,
    piatti = SERATA_PRIMA.piatti,
    piattiPerOrdine = SERATA_PRIMA.piattiPerOrdine,
    banconeCapienza = BANCONE.capienza,
    moltiplicatoriMancia = [],
    posti = POSTI.quanti,
    pazienzaMoltiplicatore = 1,
    cuori = PAZIENZA.hearts,
    cotturaMoltiplicatori = {},
  } = {}) {
    this.rng = createRng(seed);
    this.fasi = fasiDellaSerata(seed);
    // Le ondate che hanno già dato il segnale (una volta ciascuna).
    this.avvisate = new Set();
    this.obiettivo = obiettivo;
    this.piatti = piatti;
    this.piattiPerOrdine = piattiPerOrdine;
    this.banconeCapienza = banconeCapienza;
    this.moltiplicatoreAltri = moltiplicatoriMancia.reduce((prodotto, m) => prodotto * m, 1);
    this.pazienzaMoltiplicatore = pazienzaMoltiplicatore;
    this.cuoriMax = cuori;
    this.cotturaMoltiplicatori = cotturaMoltiplicatori;

    this.durataMs = SERATA.durationSec * SEC;
    this.tempoMs = 0;
    // Il tempo che update() ha ricevuto e il motore non ha ancora consumato a passi fissi.
    this.resto = 0;
    this.finita = false;

    // L'Incasso è il netto: Vendite meno Spesa. `spesaServita` è la parte della Spesa finita in un
    // Piatto servito: il resto è Spreco (non si rimborsa mai).
    this.incasso = 0;
    this.vendite = 0;
    this.spesa = 0;
    this.spesaServita = 0;
    this.serviti = 0;
    this.persi = 0;
    // I Piatti bruciati in questa Serata (per i Titoli e per i test). I loro Ingredienti sono già Spesa e non
    // finiscono mai in un Piatto servito, quindi sono Spreco senza bisogno di altro (vedi spreco()).
    this.bruciati = 0;
    // I conti per Piatto (la tabella del recap), una voce per Piatto del menù: la variante conta nel suo Piatto.
    // `spesa` e `spesaServita` sono come quelle della Serata, `vendite` il prezzo pagato più la sua parte di Mancia.
    this.conti = Object.fromEntries(piatti.map((piatto) => [piatto, { fatti: 0, serviti: 0, spesa: 0, spesaServita: 0, vendite: 0 }]));
    // La Serie: Ordini serviti di fila adesso, la più lunga di questa Serata e quanti Yen di Mancia in più ha dato
    // (rispetto a una Mancia senza Serie). Si azzera a ogni Serata e non si salva.
    this.serie = 0;
    this.serieMax = 0;
    this.manciaDaSerie = 0;
    this.prossimoId = 1;
    // Il cast ha il suo generatore (src/serata/cast.js): non sposta gli arrivi né gli Ordini. `ultimoCast` è l'ultimo
    // peluche del cast arrivato, che non torna di seguito.
    this.rngCast = createRng(`${seed}/cast`);
    this.ultimoCast = null;
    // I Vizi (VIZI) hanno il loro generatore, per le scelte a caso (lo Yen d'oro di Nella): non toccano né gli arrivi
    // né il cast. `ritmo` è la velocità con cui scende la Pazienza di tutti in questo istante (1, o meno se c'è Balosso).
    this.rngVizi = createRng(`${seed}/vizi`);
    this.ritmo = 1;

    this.posti = Array.from({ length: posti }, () => ({ cliente: null, liberoDaMs: 0 }));
    this.bancone = [];
    // `passo`: l'indice del passo della ricetta che viene; `fatti`: quanti Ingredienti ha già il Piatto. Stati:
    // libera | inPreparazione (aspetta un Ingrediente) | cuoce (è a un passo di cottura) | pronto | bruciato | fumo.
    this.postazioni = Object.entries(POSTAZIONI)
      .filter(([, { piatto }]) => piatti.includes(piatto))
      .map(([id, { piatto }]) => ({ id, piatto, stato: 'libera', passo: 0, fatti: 0, variante: null, cottoMs: 0, prontoMs: 0, avvisato: false, fumoMs: 0 }));
    // Una Scorta per Ingrediente di ogni ricetta, nell'ordine della ricetta; una per variante dove il passo ne ha.
    this.scorte = piatti.flatMap((piatto) =>
      scorteDi(piatto).map(({ ingrediente, costo, variante }) => ({ id: ingrediente, piatto, costo, variante: variante ?? null })));
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
    this.avvisaOndate(eventi);
    for (const postazione of this.postazioni) this.cuoci(postazione, passoMs, eventi);
    this.ritmo = this.ritmoPazienza();
    this.posti.forEach((posto, indice) => this.aspetta(posto, indice, passoMs, eventi));
    this.faiArrivare(eventi);
    if (this.tempoMs >= this.durataMs) {
      this.tempoMs = this.durataMs;
      this.finita = true;
      eventi.push({
        tipo: 'serataFinita',
        incasso: this.incasso,
        vendite: this.vendite,
        spesa: this.spesa,
        spreco: this.spreco(),
        obiettivo: this.obiettivo,
        stelle: calcolaStelle(this.incasso, this.obiettivo),
        serviti: this.serviti,
        persi: this.persi,
        serieMax: this.serieMax,
        manciaDaSerie: this.manciaDaSerie,
        perPiatto: this.perPiatto(),
      });
    }
  }

  // --- Postazioni ---

  // Una Postazione avanza da sola: cuoce (un passo di cottura della ricetta), poi (se il suo Piatto si
  // brucia) aspetta di bruciarsi, poi il Fumo passa. Libera, inPreparazione e bruciato non cambiano senza
  // un tocco.
  cuoci(postazione, passoMs, eventi) {
    if (postazione.stato === 'cuoce') {
      postazione.cottoMs += passoMs;
      if (postazione.cottoMs >= this.cotturaMs(postazione)) {
        eventi.push({ tipo: 'cotturaFinita', postazione: postazione.id, piatto: postazione.piatto });
        this.passoFatto(postazione, eventi);
      }
    } else if (postazione.stato === 'pronto') {
      this.bruciaSeDimenticato(postazione, passoMs, eventi);
    } else if (postazione.stato === 'fumo') {
      postazione.fumoMs += passoMs;
      if (postazione.fumoMs >= FUMO_SEC * SEC) {
        postazione.stato = 'libera';
        postazione.fumoMs = 0;
        eventi.push({ tipo: 'fumoPassato', postazione: postazione.id });
      }
    }
  }

  // Gli Yen di Ingredienti usati che non sono finiti in un Piatto servito (GLOSSARY.md, Spreco).
  spreco() {
    return this.spesa - this.spesaServita;
  }

  // La tabella del recap: una riga per Piatto del menù, nell'ordine del menù.
  //   fatti    Piatti arrivati pronti (anche quelli poi bruciati o rimasti sul Bancone)
  //   serviti  Piatti finiti in un Ordine pagato
  //   costo    la Spesa degli Ingredienti usati per quel Piatto
  //   sprecati gli Yen di quegli Ingredienti che non sono finiti in un Piatto servito (anche i Piatti non finiti)
  //   vendite  quanto è entrato per quel Piatto: il suo prezzo (doppio per Carlotta) più la sua parte di Mancia
  // Le somme di costo, sprecati e vendite sono la Spesa, lo Spreco e le Vendite della Serata.
  perPiatto() {
    return this.piatti.map((piatto) => {
      const { fatti, serviti, spesa, spesaServita, vendite } = this.conti[piatto];
      return { piatto, fatti, serviti, costo: spesa, sprecati: spesa - spesaServita, vendite };
    });
  }

  // Quanto dura il passo di cottura a cui è la Postazione (zero se il passo non è una cottura).
  // Con "Postazione più veloce" i secondi della ricetta si moltiplicano per quelli della Postazione (arrotondati al ms).
  cotturaMs(postazione) {
    const secondi = PIATTI[postazione.piatto].ricetta[postazione.passo]?.cotturaSec ?? 0;
    return Math.round(secondi * SEC * (this.cotturaMoltiplicatori[postazione.id] ?? 1));
  }

  // Un passo della ricetta è fatto (un Ingrediente o una cottura): la Postazione passa al successivo. Se non
  // ce ne sono il Piatto è pronto e da lì parte la bruciatura; se è una cottura comincia da sola, senza un
  // altro tocco; se è un Ingrediente la Postazione lo aspetta.
  passoFatto(postazione, eventi) {
    const { ricetta } = PIATTI[postazione.piatto];
    postazione.passo += 1;
    postazione.cottoMs = 0;
    const prossimo = ricetta[postazione.passo];
    if (!prossimo) {
      this.conti[postazione.piatto].fatti += 1;
      postazione.stato = 'pronto';
      postazione.prontoMs = 0;
      postazione.avvisato = false;
      eventi.push({ tipo: 'piattoPronto', postazione: postazione.id, piatto: idPiatto(postazione.piatto, postazione.variante) });
    } else if (prossimo.cotturaSec !== undefined) {
      postazione.stato = 'cuoce';
      eventi.push({ tipo: 'cotturaIniziata', postazione: postazione.id, piatto: postazione.piatto, durataMs: this.cotturaMs(postazione) });
    } else {
      postazione.stato = 'inPreparazione';
    }
  }

  // Il Piatto torna a zero: Postazione libera, ricetta da capo (dopo averlo preso, o dopo il cestino).
  azzera(postazione) {
    postazione.passo = 0;
    postazione.fatti = 0;
    postazione.variante = null;
    postazione.cottoMs = 0;
    postazione.prontoMs = 0;
    postazione.avvisato = false;
  }

  // Le Scorte che la Postazione aspetta (o aspetterà, finita la cottura): una, o tutte le varianti se il prossimo
  // passo è una scelta. Vuota se non ne mancano. Solo mentre il Piatto si sta facendo.
  prossimiIngredienti(postazione) {
    if (!['libera', 'inPreparazione', 'cuoce'].includes(postazione.stato)) return [];
    const passo = PIATTI[postazione.piatto].ricetta.slice(postazione.passo).find((p) => p.cotturaSec === undefined);
    return passo ? vociDi(passo).map(({ ingrediente }) => ingrediente) : [];
  }

  // Quanto manca prima che il Piatto pronto si bruci, o null se non si brucia mai (l'onigiri).
  bruciaTraMs(postazione) {
    // Un Piatto a tocchi (l'onigiri) non ha burnAfterSec: come null, non si brucia mai.
    const dopoSec = PIATTI[postazione.piatto].burnAfterSec ?? null;
    return dopoSec === null ? null : Math.max(0, dopoSec * SEC - postazione.prontoMs);
  }

  bruciaSeDimenticato(postazione, passoMs, eventi) {
    if (this.bruciaTraMs(postazione) === null) return;
    postazione.prontoMs += passoMs;
    const manca = this.bruciaTraMs(postazione);
    if (manca === 0) {
      postazione.stato = 'bruciato';
      this.bruciati++;
      eventi.push({ tipo: 'piattoBruciato', postazione: postazione.id, piatto: postazione.piatto });
    } else if (!postazione.avvisato && manca <= BRUCIATURA.avvisoSec * SEC) {
      postazione.avvisato = true;
      eventi.push({ tipo: 'staPerBruciarsi', postazione: postazione.id, piatto: postazione.piatto, traMs: manca });
    }
  }

  // Il tocco su una Scorta o su una Postazione (`id` è quello dell'una o dell'altra).
  //   Scorta                  l'Ingrediente va nel Piatto che lo aspetta (e si paga), o viene rifiutato
  //   Postazione pronta       il Piatto passa sul Bancone
  //   Postazione bruciata     il Piatto va nel cestino e la Postazione resta nel Fumo
  //   Postazione nel Fumo     non succede niente: non si può usare finché il Fumo non passa
  //   Postazione altrimenti   non c'è niente da prendere (il Piatto non è finito, o sta cuocendo)
  tocca(id) {
    if (this.finita) return [];
    const scorta = this.scorte.find((s) => s.id === id);
    if (scorta) return this.usaScorta(scorta);
    const postazione = this.postazioni.find((p) => p.id === id);
    if (!postazione) return [{ tipo: 'postazioneSconosciuta', postazione: id }];
    if (postazione.stato === 'pronto') return this.alBancone(postazione);
    if (postazione.stato === 'fumo') {
      return [{ tipo: 'postazioneNelFumo', postazione: id, restaMs: FUMO_SEC * SEC - postazione.fumoMs }];
    }
    if (postazione.stato === 'bruciato') {
      // Gli Ingredienti già pagati restano Spesa e non diventano mai Vendite: sono Spreco.
      postazione.stato = 'fumo';
      postazione.fumoMs = 0;
      this.azzera(postazione);
      return [{ tipo: 'nelCestino', postazione: id, piatto: postazione.piatto }];
    }
    return [{ tipo: 'nienteDaPrendere', postazione: id }];
  }

  alBancone(postazione) {
    if (this.bancone.length >= this.banconeCapienza) return [{ tipo: 'banconePieno', postazione: postazione.id }];
    const piatto = idPiatto(postazione.piatto, postazione.variante);
    this.bancone.push(piatto);
    postazione.stato = 'libera';
    this.azzera(postazione);
    return [{ tipo: 'sulBancone', postazione: postazione.id, piatto }];
  }

  // Un Ingrediente va nella Postazione che lo aspetta: prima in quella già cominciata, poi in una
  // libera (se è il primo della ricetta). Se nessuna lo aspetta (fuori ordine, con il Piatto che sta
  // cuocendo o già pronto da prendere) il tocco non fa niente e non costa: sbagliare l'ordine non è mai
  // un danno, al massimo si perde un tocco.
  usaScorta(scorta) {
    const { ricetta } = PIATTI[scorta.piatto];
    const delPiatto = this.postazioni.filter((p) => p.piatto === scorta.piatto);
    const puoRicevere = (p) => p.stato === 'libera' || p.stato === 'inPreparazione';
    // La voce del passo a cui è la Postazione che corrisponde a questa Scorta (se il passo è una scelta, una delle tre).
    const voce = (p) => vociDi(ricetta[p.passo]).find(({ ingrediente }) => ingrediente === scorta.id);
    const aspetta = (p) => puoRicevere(p) && voce(p) !== undefined;
    const scelta = delPiatto.filter(aspetta).sort((a, b) => b.fatti - a.fatti)[0];
    if (!scelta) {
      let motivo = 'occupato';
      if (delPiatto.some(puoRicevere)) motivo = 'ordine';
      else if (delPiatto.some((p) => p.stato === 'cuoce')) motivo = 'cuoce';
      return [{ tipo: 'ingredienteRifiutato', scorta: scorta.id, motivo }];
    }
    const { costo, variante } = voce(scelta);
    this.spesa += costo;
    this.conti[scelta.piatto].spesa += costo;
    this.incasso -= costo;
    scelta.fatti += 1;
    // La variante scelta resta nel Piatto: serve a dargli il nome giusto quando è pronto.
    if (variante) scelta.variante = variante;
    const eventi = [{ tipo: 'ingrediente', postazione: scelta.id, scorta: scorta.id, costo, fatti: scelta.fatti, di: passiDi(scelta.piatto).length, ...(variante ? { variante } : {}) }];
    this.passoFatto(scelta, eventi);
    return eventi;
  }

  // --- Clienti ---

  // Quanto scende in fretta la Pazienza di tutti adesso: 1, o meno se ai Posti c'è chi la rallenta (Balosso). I cuoricini e
  // il Lamento seguono la Pazienza rimasta, quindi scendono più piano da soli.
  ritmoPazienza() {
    return this.posti.reduce((ritmo, { cliente }) => ritmo * (VIZI[cliente?.vizio]?.ritmoPazienza ?? 1), 1);
  }

  aspetta(posto, indice, passoMs, eventi) {
    const cliente = posto.cliente;
    if (!cliente) return;
    cliente.pazienzaMs = Math.max(0, cliente.pazienzaMs - passoMs * this.ritmo);
    const cuori = cuoriDa(cliente.pazienzaMs, cliente.pazienzaTotaleMs, this.cuoriMax);
    if (cuori !== cliente.cuori) {
      const prima = cliente.cuori;
      cliente.cuori = cuori;
      eventi.push({ tipo: 'cuoreSpento', posto: indice, cuori });
      for (const scalino of scaliniSuperati(prima, cuori)) {
        eventi.push({
          tipo: 'lamento',
          posto: indice,
          clienteId: cliente.id,
          cuori: scalino,
          espressione: espressioneDa(scalino),
          segno: segnoDa(scalino),
        });
      }
    }
    if (cliente.pazienzaMs === 0) {
      this.persi++;
      eventi.push({ tipo: 'clienteVaVia', posto: indice, clienteId: cliente.id, motivo: 'pazienza' });
      this.spezzaSerie('clientePerso', indice, eventi);
      this.liberaPosto(posto);
    }
  }

  // La Serie si spezza (torna a zero) solo con un Cliente perso o un servizio a vuoto. Un tocco fuori ordine su una
  // Scorta e un Piatto bruciato non la toccano: li "punisce" già il tempo perso o lo Spreco. Senza Serie non succede niente.
  spezzaSerie(motivo, posto, eventi) {
    if (this.serie === 0) return;
    eventi.push({ tipo: 'serieSpezzata', serie: this.serie, motivo, posto });
    this.serie = 0;
  }

  liberaPosto(posto) {
    posto.cliente = null;
    posto.liberoDaMs = this.tempoMs + POSTI.ricambioSec * SEC;
  }

  // La fase in cui è la Serata a tempoMs: l'ultima che è già cominciata.
  faseA(tempoMs) {
    return this.fasi.findLast(({ inizioMs }) => inizioMs <= tempoMs);
  }

  // Il segnale di un'ondata: quando manca ONDATE.avvisoSec al suo inizio, una volta sola, la Serata lo dice.
  avvisaOndate(eventi) {
    for (const { nome, inizioMs, ondata } of this.fasi) {
      if (!ondata || this.avvisate.has(nome) || inizioMs - this.tempoMs > ONDATE.avvisoSec * SEC) continue;
      this.avvisate.add(nome);
      eventi.push({ tipo: 'ondataInArrivo', fase: nome, traMs: inizioMs - this.tempoMs });
    }
  }

  // L'attesa fino al prossimo arrivo, tra min e max secondi della fase di adesso, in ms e multiplo del passo,
  // così gli arrivi cadono su un passo.
  attesaArrivoMs() {
    const { min, max } = this.faseA(this.tempoMs).arrivoSec;
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
    // Si sorteggia sempre anche il Cliente di passaggio, come prima del cast: i numeri del generatore degli arrivi restano
    // quelli di prima, e se arriva uno del cast prende il suo posto.
    const passaggio = CLIENTI.passaggio[Math.floor(this.rng() * CLIENTI.passaggio.length)];
    const delCast = scegliDelCast(this.rngCast, { alPosto: this.posti.map((p) => p.cliente?.tipo).filter(Boolean), ultimo: this.ultimoCast });
    const tipo = delCast ?? passaggio;
    if (delCast) this.ultimoCast = delCast;
    const ordine = this.creaOrdine();
    // La Pazienza si decide all'arrivo e non cambia più: chi arriva in ondata tiene i suoi 15 s anche se
    // l'ondata finisce mentre aspetta.
    const pazienzaSec = this.faseA(this.tempoMs).ondata ? ONDATE.pazienzaSec : PAZIENZA.durationSec;
    // Il Vizio è il nome del peluche del cast, se in VIZI ha una voce; gli altri arrivano senza (null).
    const vizio = Object.hasOwn(VIZI, tipo) ? tipo : null;
    // Ogni cuoricino dura un quinto della Pazienza di base, comunque siano i cuoricini (this.cuoriMax / PAZIENZA.hearts).
    const pazienzaTotaleMs = Math.round(pazienzaSec * (this.cuoriMax / PAZIENZA.hearts) * this.pazienzaMoltiplicatore * (VIZI[vizio]?.pazienzaX ?? 1) * SEC);
    posto.cliente = {
      id: this.prossimoId++,
      tipo,
      vizio,
      ordine,
      pazienzaMs: pazienzaTotaleMs,
      pazienzaTotaleMs,
      cuori: this.cuoriMax,
    };
    this.prossimoArrivoMs = this.tempoMs + this.attesaArrivoMs();
    eventi.push({ tipo: 'clienteArrivato', posto: indice, cliente: { id: posto.cliente.id, tipo, ordine: [...ordine], vizio: posto.cliente.vizio } });
  }

  // Un Ordine è una lista di Piatti, da uno a tre. Un Piatto con varianti si ordina con la sua variante
  // (kakigori-melone). Il generatore si usa per la variante solo se il Piatto ne ha, così le Serate senza
  // varianti restano identiche a prima, a parità di seme.
  creaOrdine() {
    const { min, max, tre = 0 } = this.piattiPerOrdine;
    const quanti = tre > 0 && this.rng() < tre ? 3 : min + Math.floor(this.rng() * (max - min + 1));
    return Array.from({ length: quanti }, () => {
      const piatto = this.piatti[Math.floor(this.rng() * this.piatti.length)];
      const { varianti } = PIATTI[piatto];
      return varianti.length ? idPiatto(piatto, varianti[Math.floor(this.rng() * varianti.length)]) : piatto;
    });
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
    if (mancano.length) {
      // Un servizio a vuoto: il Cliente scuote la testa e la Serie si spezza.
      const eventi = [{ tipo: 'scuoteTesta', posto: indicePosto, mancano }];
      this.spezzaSerie('servizioAVuoto', indicePosto, eventi);
      return eventi;
    }

    this.bancone = rimasti;
    const vizio = VIZI[cliente.vizio];
    // Carlotta paga il doppio: il prezzo dell'Ordine (e la Mancia, che ne è una parte) ma non la Spesa.
    const prezzo = cliente.ordine.reduce((somma, piatto) => somma + PIATTI[piattoBase(piatto)].price, 0) * (vizio?.prezzoX ?? 1);
    const cuori = cliente.cuori;
    // La Serie conta questo Ordine prima di pagare la Mancia: il primo di fila vale ×1, il secondo ×1,1 e così via.
    this.serie += 1;
    this.serieMax = Math.max(this.serieMax, this.serie);
    const moltiplicatoreDellaSerie = moltiplicatoreSerie(this.serie);
    // Lo Yen d'oro di Nella, a volte, triplica la sua Mancia; vale come gli altri moltiplicatori e non conta come Serie.
    const yenDOro = vizio?.yenDOro !== undefined && this.rngVizi() < vizio.yenDOro;
    const altri = this.moltiplicatoreAltri * (yenDOro ? vizio.manciaX : 1);
    const mancia = calcolaMancia(prezzo, cuori, moltiplicatoreDellaSerie * altri, this.cuoriMax);
    this.manciaDaSerie += mancia - calcolaMancia(prezzo, cuori, altri, this.cuoriMax);
    const totale = prezzo + mancia;
    this.incasso += totale;
    this.vendite += totale;
    this.spesaServita += cliente.ordine.reduce((somma, piatto) => somma + costoPiatto(piatto), 0);
    this.contaOrdine(cliente.ordine, vizio?.prezzoX ?? 1, mancia);
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
        serie: this.serie,
        moltiplicatoreSerie: moltiplicatoreDellaSerie,
        yenDOro,
      },
    ];
    if (yenDOro) eventi.push({ tipo: 'yenDOro', posto: indicePosto, clienteId: cliente.id, yen: mancia });
    if (mancia > 0) eventi.push({ tipo: 'mancia', posto: indicePosto, yen: mancia, cuori });
    eventi.push({ tipo: 'moneta', posto: indicePosto, yen: totale });
    return eventi;
  }

  // Un Ordine pagato entra nei conti per Piatto. La Mancia è una sola per l'Ordine: la dividiamo tra i suoi Piatti in
  // proporzione al prezzo, e il resto dell'arrotondamento va all'ultimo, così le Vendite per Piatto sommano esatte.
  contaOrdine(ordine, prezzoX, mancia) {
    const prezzi = ordine.map((piatto) => PIATTI[piattoBase(piatto)].price * prezzoX);
    const totalePrezzi = prezzi.reduce((somma, prezzo) => somma + prezzo, 0);
    let datoDiMancia = 0;
    ordine.forEach((id, i) => {
      const conto = this.conti[piattoBase(id)];
      const parte = i === ordine.length - 1 ? mancia - datoDiMancia : Math.floor((mancia * prezzi[i]) / totalePrezzi);
      datoDiMancia += parte;
      conto.serviti += 1;
      conto.spesaServita += costoPiatto(id);
      conto.vendite += prezzi[i] + parte;
    });
  }

  // Lo stato in forma di dati semplici (solo numeri, stringhe, liste): basta per
  // window.render_game_to_text() e per i test. Per giocare senza guardare lo schermo.
  stato() {
    return {
      fase: this.finita ? 'finita' : 'in corso',
      tempoMs: this.tempoMs,
      restaMs: this.durataMs - this.tempoMs,
      incasso: this.incasso,
      vendite: this.vendite,
      spesa: this.spesa,
      spreco: this.spreco(),
      obiettivo: this.obiettivo,
      sogliaStelle: sogliePerStelle(this.obiettivo),
      stelle: calcolaStelle(this.incasso, this.obiettivo),
      serviti: this.serviti,
      persi: this.persi,
      bruciati: this.bruciati,
      // La tabella del recap, una riga per Piatto del menù (vedi perPiatto()).
      perPiatto: this.perPiatto(),
      // La Serie: Ordini di fila adesso, la più lunga di stasera, di quanto moltiplicherà la Mancia del prossimo
      // Ordine servito e quanti Yen di Mancia in più ha dato finora.
      // cuoriMax: quanti cuoricini ha la Pazienza di ogni Cliente in questa Serata (5, 6 con il Posto in più).
      cuoriMax: this.cuoriMax,
      // Di quanto "Postazione più veloce" accorcia la cottura di ogni Postazione che ce l'ha (vuoto senza Potenziamenti).
      cotturaMoltiplicatori: { ...this.cotturaMoltiplicatori },
      // Di quanto il ventaglio allunga la Pazienza di chi arriva (1 senza ventaglio).
      pazienzaMoltiplicatore: this.pazienzaMoltiplicatore,
      serie: this.serie,
      serieMax: this.serieMax,
      moltiplicatoreProssimo: moltiplicatoreSerie(this.serie + 1),
      manciaDaSerie: this.manciaDaSerie,
      // Quanto scende in fretta la Pazienza di tutti adesso: 1, o meno finché Balosso è a un Posto (VIZI).
      ritmoPazienza: this.ritmoPazienza(),
      posti: this.posti.map(({ cliente }, posto) => ({
        posto,
        cliente: cliente && {
          id: cliente.id,
          tipo: cliente.tipo,
          vizio: cliente.vizio,
          ordine: [...cliente.ordine],
          cuori: cliente.cuori,
          pazienzaMs: cliente.pazienzaMs,
          pazienzaTotaleMs: cliente.pazienzaTotaleMs,
        },
      })),
      andamento: this.andamento(),
      bancone: [...this.bancone],
      // fatti: gli Ingredienti già nel Piatto. variante: quella scelta (null finché non si è toccato lo sciroppo).
      // prossimi: gli id delle Scorte che il Piatto aspetta, anche mentre cuoce (sono quelle da toccare appena finisce
      // la cottura): una, o tutte le varianti se il passo è una scelta; vuota se non ne mancano. prossimo: quella sola,
      // oppure null se sono più di una o nessuna. Mentre cuoce ('cuoce') le
      // Scorte non fanno niente: restaMs dice quanto manca e cotturaMs quanto dura quella cottura.
      // bruciaTraMs: quanto manca a bruciarsi (solo un Piatto pronto che si brucia, altrimenti null).
      // fumoRestaMs: quanto manca alla fine del Fumo.
      postazioni: this.postazioni.map((postazione) => {
        const { id, piatto, stato, cottoMs, fatti, variante, prontoMs, fumoMs } = postazione;
        const prossimi = this.prossimiIngredienti(postazione);
        return {
          id,
          piatto,
          stato,
          fatti,
          variante,
          prossimo: prossimi.length === 1 ? prossimi[0] : null,
          prossimi,
          cotturaMs: stato === 'cuoce' ? this.cotturaMs(postazione) : 0,
          restaMs: stato === 'cuoce' ? this.cotturaMs(postazione) - cottoMs : 0,
          bruciaTraMs: stato === 'pronto' ? this.bruciaTraMs({ piatto, prontoMs }) : null,
          fumoRestaMs: stato === 'fumo' ? FUMO_SEC * SEC - fumoMs : 0,
        };
      }),
      scorte: this.scorte.map(({ id, piatto, costo, variante }) => ({ id, piatto, costo, variante })),
      // La fila vicino al pollice, da sinistra a destra: prima le Scorte, poi le Postazioni.
      fila: this.fila(),
    };
  }

  // Dove siamo nella curva: la fase di adesso, se è un'ondata, quanto manca alla prossima ondata (null se non
  // ce ne sono più) e se il segnale è acceso. `fasi` dà gli inizi mossi dal seme, per chi vuole vedere l'intera curva.
  andamento() {
    const fase = this.faseA(this.tempoMs);
    const prossima = this.fasi.find(({ inizioMs, ondata }) => ondata && inizioMs > this.tempoMs);
    return {
      fase: fase.nome,
      inOndata: fase.ondata,
      prossimaOndataTraMs: prossima ? prossima.inizioMs - this.tempoMs : null,
      // Il segnale è acceso: manca poco a un'ondata e il segnale è partito (vedi 'ondataInArrivo').
      inAvviso: prossima ? this.avvisate.has(prossima.nome) : false,
      fasi: this.fasi.map(({ nome, inizioMs, ondata }) => ({ nome, inizioMs, ondata })),
    };
  }

  fila() {
    return [
      ...this.scorte.map(({ id, piatto }) => ({ id, voce: 'scorta', piatto })),
      ...this.postazioni.map(({ id, piatto }) => ({ id, voce: 'postazione', piatto })),
    ];
  }
}
