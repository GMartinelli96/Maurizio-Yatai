import { Serata, piattoBase } from '../src/serata/Serata.js';

// Un giocatore senza browser per le prove (non è un test: node --test prende solo i file *.test.js). Fa una mossa ogni
// `reazioneMs`, leggendo solo lo stato (mai la logica): serve chi ha l'Ordine intero sul Bancone, prima chi ha meno
// cuoricini; poi prende prima il Piatto che sta per bruciarsi, butta quello bruciato, porta avanti un Piatto già
// cominciato e comincia solo ciò che serve. Con `distratto` non prende mai niente da una Postazione che brucia
// (prepara e dimentica). Con `scacciaDisturbatori` manda via Croccola, le formiche e i corvi appena li vede (prima di ogni
// altra cosa: sono una minaccia per un Piatto). La bravura è il tempo tra un tocco e l'altro: BRAVURA.
//
// Conosce le varianti (kakigori-melone): un Piatto in preparazione di cui non si sa ancora la variante copre "un
// kakigori qualunque", e arrivato allo sciroppo il bot sceglie quello che manca agli Ordini.
export const BRAVURA = { rapido: 600, attento: 1000, lento: 1400 };
export const SEMI = ['a', 'b', 'c', 'd', 'e', 'f'];

const idDelPiatto = (p) => (p.variante ? `${p.piatto}-${p.variante}` : p.piatto);

// I Piatti che gli Ordini chiedono e che non sono né sul Bancone né in lavorazione (tranne `escludi`).
export function mancanti(stato, escludi = null) {
  const lista = stato.posti.flatMap(({ cliente }) => cliente?.ordine ?? []);
  const togli = (piatto) => {
    let i = lista.indexOf(piatto);
    // Un Piatto con variante ancora da scegliere copre il primo Ordine della sua famiglia.
    if (i === -1 && !piatto.includes('-')) i = lista.findIndex((chiesto) => piattoBase(chiesto) === piatto);
    if (i !== -1) lista.splice(i, 1);
  };
  stato.bancone.forEach(togli);
  for (const p of stato.postazioni) {
    if (p !== escludi && !['libera', 'bruciato', 'fumo'].includes(p.stato)) togli(idDelPiatto(p));
  }
  return lista;
}

// Quale Scorta toccare per un Piatto che aspetta un Ingrediente: l'unica, o tra le varianti quella che manca agli Ordini.
export function scortaDaToccare(stato, postazione) {
  if (postazione.prossimi.length <= 1) return postazione.prossimo;
  const chiesti = mancanti(stato, postazione);
  return postazione.prossimi.find((scorta) => chiesti.includes(`${postazione.piatto}-${scorta}`)) ?? postazione.prossimi[0];
}

// Con `registro` (un array) il bot ci mette tutti gli eventi della Serata, per chi vuole contare cosa è successo.
export function giocaServata(opzioniSerata, reazioneMs, seed, { distratto = false, registro = null, scacciaDisturbatori = false } = {}) {
  const grezza = new Serata({ seed, ...opzioniSerata });
  const raccogli = (azione) => (...argomenti) => {
    const eventi = azione(...argomenti);
    registro?.push(...eventi);
    return eventi;
  };
  const serata = {
    get finita() { return grezza.finita; },
    get banconeCapienza() { return grezza.banconeCapienza; },
    stato: () => grezza.stato(),
    update: raccogli((ms) => grezza.update(ms)),
    tocca: raccogli((id) => grezza.tocca(id)),
    servi: raccogli((posto) => grezza.servi(posto)),
    scaccia: raccogli((chi) => grezza.scaccia(chi)),
  };
  for (let t = 10; !serata.finita; t += 10) {
    serata.update(10);
    if (t % reazioneMs !== 0) continue;
    const stato = serata.stato();
    const minaccia = scacciaDisturbatori && stato.disturbatori.find(({ fase }) => fase !== 'vaVia');
    if (minaccia) {
      serata.scaccia(minaccia.chi);
      continue;
    }
    const resto = [...stato.bancone];
    const servibili = stato.posti
      .filter(({ cliente }) => cliente && cliente.ordine.every((piatto) => {
        const i = resto.indexOf(piatto);
        if (i === -1) return false;
        resto.splice(i, 1);
        return true;
      }))
      .sort((a, b) => a.cliente.cuori - b.cliente.cuori);
    if (servibili.length) {
      serata.servi(servibili[0].posto);
      continue;
    }
    if (distratto) {
      const daFare = stato.postazioni.find((p) => ['libera', 'inPreparazione'].includes(p.stato) && p.piatto === 'takoyaki');
      if (daFare) serata.tocca(daFare.prossimo);
      continue;
    }
    const pronta = stato.postazioni
      .filter((p) => p.stato === 'pronto')
      .sort((a, b) => (a.bruciaTraMs ?? Infinity) - (b.bruciaTraMs ?? Infinity))[0];
    if (pronta && stato.bancone.length < serata.banconeCapienza) {
      serata.tocca(pronta.id);
      continue;
    }
    const bruciata = stato.postazioni.find((p) => p.stato === 'bruciato');
    if (bruciata) {
      serata.tocca(bruciata.id);
      continue;
    }
    const cominciata = stato.postazioni.find((p) => p.stato === 'inPreparazione');
    if (cominciata) {
      serata.tocca(scortaDaToccare(stato, cominciata));
      continue;
    }
    const chiesti = mancanti(stato);
    const libera = stato.postazioni.find((p) => p.stato === 'libera' && chiesti.some((chiesto) => piattoBase(chiesto) === p.piatto));
    if (libera) serata.tocca(libera.prossimo ?? libera.id);
  }
  return serata.stato();
}

export const mediaSemi = (opzioniSerata, campo, reazioneMs, opzioni) =>
  SEMI.reduce((somma, seme) => somma + giocaServata(opzioniSerata, reazioneMs, seme, opzioni)[campo], 0) / SEMI.length;
