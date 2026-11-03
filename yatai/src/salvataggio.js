// Il salvataggio: gli Yen guadagnati restano sul dispositivo (ticket 35). Qui c'è solo ciò che serve a
// questo ticket, ma il formato ha già un numero di versione, perché i ticket 16 e 17 vi aggiungeranno
// la mappa e i Potenziamenti e un salvataggio vecchio deve restare leggibile.
//
// Lo storage si passa da fuori, così i test girano senza browser. Se lo storage è bloccato (finestra
// privata, cookie disattivati) o pieno, il gioco funziona lo stesso: gli Yen vivono in memoria per la
// sessione e `salvato` dice che non sono sul dispositivo.

export const CHIAVE_SALVATAGGIO = 'yatai.salvataggio';
export const VERSIONE_SALVATAGGIO = 1;

// Da quale versione si passa alla successiva: MIGRAZIONI[1] porta un salvataggio dalla 1 alla 2, e così via.
// Per ora c'è una versione sola.
const MIGRAZIONI = {};

const nuovo = () => ({ versione: VERSIONE_SALVATAGGIO, yen: 0 });

// Lo storage del browser, o null se non c'è o non si può nemmeno chiedere (accedervi può lanciare).
export function storageDelBrowser() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

// Legge i dati salvati. Qualunque cosa non torni (assente, illeggibile, di una versione che non
// conosciamo) dà un profilo vuoto: `daNonSovrascrivere` dice se il file presente non è nostro e quindi
// non va cancellato (è di un gioco più nuovo).
function leggi(storage) {
  let grezzo = null;
  try {
    grezzo = storage?.getItem(CHIAVE_SALVATAGGIO) ?? null;
  } catch {
    return { dati: nuovo(), daNonSovrascrivere: false };
  }
  if (grezzo === null) return { dati: nuovo(), daNonSovrascrivere: false };

  let dati;
  try {
    dati = JSON.parse(grezzo);
  } catch {
    return { dati: nuovo(), daNonSovrascrivere: false };
  }
  if (!dati || typeof dati !== 'object' || !Number.isInteger(dati.versione) || dati.versione < 1) {
    return { dati: nuovo(), daNonSovrascrivere: false };
  }
  // Scritto da una versione più nuova del gioco: non si legge e non si sovrascrive.
  if (dati.versione > VERSIONE_SALVATAGGIO) return { dati: nuovo(), daNonSovrascrivere: true };

  while (dati.versione < VERSIONE_SALVATAGGIO) {
    dati = MIGRAZIONI[dati.versione](dati);
    dati.versione += 1;
  }
  const yen = Number.isSafeInteger(dati.yen) && dati.yen > 0 ? dati.yen : 0;
  return { dati: { ...dati, yen }, daNonSovrascrivere: false };
}

export class Salvataggio {
  constructor(storage = storageDelBrowser()) {
    this.storage = storage;
    const { dati, daNonSovrascrivere } = leggi(storage);
    this.dati = dati;
    this.bloccato = daNonSovrascrivere;
    // Vero se l'ultima scrittura è riuscita (o se non c'è ancora niente da scrivere e lo storage risponde).
    this.salvato = storage !== null && !daNonSovrascrivere;
  }

  get yen() {
    return this.dati.yen;
  }

  // Una Serata finita: l'Incasso diventa Yen in tasca. Una Serata in rosso (Incasso zero o negativo) non
  // dà Yen e non toglie quelli che ci sono. Restituisce gli Yen aggiunti.
  accreditaIncasso(incasso) {
    const guadagno = Number.isSafeInteger(incasso) && incasso > 0 ? incasso : 0;
    if (guadagno === 0) return 0;
    this.dati.yen += guadagno;
    this.scrivi();
    return guadagno;
  }

  scrivi() {
    if (this.bloccato || !this.storage) {
      this.salvato = false;
      return;
    }
    try {
      this.storage.setItem(CHIAVE_SALVATAGGIO, JSON.stringify(this.dati));
      this.salvato = true;
    } catch {
      this.salvato = false;
    }
  }
}

// Un solo salvataggio per tutto il gioco, creato alla prima richiesta (non quando il file viene importato).
let corrente = null;
export const salvataggio = () => (corrente ??= new Salvataggio());
