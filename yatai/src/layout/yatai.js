// L'impaginazione dello Yatai in verticale, dall'alto in basso: i Posti, il Bancone con i Piatti
// pronti, Maurizio al centro e le Postazioni vicino al pollice (GAME_SPEC.md, "La Serata").
//
// Funzioni pure: niente Phaser, niente DOM. Ogni elemento è un rettangolo { x, y, w, h } in pixel
// di gioco, con (x, y) in alto a sinistra. Nessuna posizione è scritta a mano: tutto discende
// dall'immagine di gioco (frame), dall'area sicura (safe) e dai numeri di YATAI in config.js.
//
//   frame ─ area sicura ─ margine ─ pila di fasce ─ fila di elementi
//
// I tre mattoni sono stack (fasce una sopra l'altra), row (una fila centrata) e fitIn (un
// disegno dentro un rettangolo).

import { PAZIENZA, YATAI } from '../config.js';

export const center = (r) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
export const bottomCenter = (r) => ({ x: r.x + r.w / 2, y: r.y + r.h });

// Mette delle fasce una sopra l'altra dentro `rect`. Ogni fascia ha un'altezza minima e un `flex`
// che dice quanto cresce se avanza spazio. Se lo spazio non basta nemmeno per i minimi, le fasce
// si restringono tutte in proporzione: mai sovrapposte, mai fuori dal rettangolo.
export function stack(rect, items) {
  const minTotal = items.reduce((sum, item) => sum + item.min, 0);
  const flexTotal = items.reduce((sum, item) => sum + item.flex, 0);
  const extra = Math.max(0, rect.h - minTotal);
  const shrink = minTotal > rect.h ? rect.h / minTotal : 1;
  let y = rect.y;
  return items.map((item) => {
    const h = item.min * shrink + (flexTotal > 0 ? (extra * item.flex) / flexTotal : 0);
    const out = { x: rect.x, y, w: rect.w, h };
    y += h;
    return out;
  });
}

// `count` rettangoli uguali in fila, centrati in `rect`, alti quanto il rettangolo. La larghezza si
// calcola come se la fila avesse `capacity` elementi (di norma quanti ne può avere al massimo):
// così un elemento non cambia misura quando ne arrivano altri. Mai più largo di maxSlot.
export function row(rect, count, { maxSlot = Infinity, gap = 0, capacity = count } = {}) {
  const slot = Math.min(maxSlot, (rect.w - gap * (capacity - 1)) / capacity);
  const total = slot * count + gap * (count - 1);
  const x0 = rect.x + (rect.w - total) / 2;
  return Array.from({ length: count }, (_, i) => ({ x: x0 + i * (slot + gap), y: rect.y, w: slot, h: rect.h }));
}

// Un disegno largo w e alto h che deve stare in `rect`: la scala che lo fa stare (mai più di
// maxScale) e il punto in cui metterlo. Con `anchor: 'bottom'` poggia sul fondo del rettangolo,
// altrimenti è al centro. Il punto (x, y) è quello dell'origine che si usa: centro in basso.
export function fitIn(rect, w, h, { maxScale = 1, anchor = 'bottom' } = {}) {
  const scale = Math.min(maxScale, rect.w / w, rect.h / h);
  const x = rect.x + rect.w / 2;
  const y = anchor === 'bottom' ? rect.y + rect.h : rect.y + rect.h / 2 + (h * scale) / 2;
  return { scale, x, y };
}

// Dove mettere Maurizio (un disegno largo w e alto h) nella fascia della cucina: al centro, in
// orizzontale e in verticale, senza ingrandirsi oltre YATAI.maurizio.scalaMax e senza riempire
// tutta la fascia (YATAI.maurizio.riempimento): resta un po' d'aria sopra e sotto.
// Il punto (x, y) è il centro in basso del disegno.
export function placeMaurizio(zone, w, h) {
  const { scalaMax, riempimento } = YATAI.maurizio;
  const fit = fitIn({ ...zone, h: zone.h * riempimento }, w, h, { maxScale: scalaMax, anchor: 'center' });
  return { ...fit, y: fit.y + (zone.h * (1 - riempimento)) / 2 };
}

// Il Cliente al suo Posto, dall'alto in basso dentro la fascia `rect` del Posto: la nuvoletta con
// l'Ordine, la fila dei cuoricini di Pazienza, il Cliente seduto sullo sgabello. Il Cliente è un
// disegno largo size.w e alto size.h, con i piedi in `feet` ({ x, y } dentro il disegno).
//
// Si parte dal basso: i piedi poggiano sul cuscino (YATAI.cliente.sedutoDalFondo dal fondo) e il
// Cliente si ingrandisce fin dove lo lasciano la larghezza del Posto e lo spazio che resta sotto
// nuvoletta e cuoricini. Così i tre pezzi non si sovrappongono a nessuna altezza di schermo.
// Il punto del Cliente è il centro in basso del disegno (origine 0.5, 1).
export function placeCliente(rect, size, feet) {
  const C = YATAI.cliente;
  const cx = rect.x + rect.w / 2;
  const piediY = rect.y + rect.h - C.sedutoDalFondo;

  const nuvolettaH = Math.max(C.nuvoletta.min, rect.h * C.nuvoletta.altezza);
  const nuvolettaW = Math.min(rect.w, C.nuvoletta.larghezzaMax);
  const nuvoletta = { x: cx - nuvolettaW / 2, y: rect.y, w: nuvolettaW, h: nuvolettaH };

  const lato = Math.min(C.cuori.lato, (rect.w - 4 * C.cuori.spazio) / PAZIENZA.hearts);
  const budget = piediY - (nuvoletta.y + nuvolettaH + lato + 2 * C.vuoto);
  const scale = Math.max(0.1, Math.min(rect.w / size.w, budget / feet.y));
  const testa = piediY - feet.y * scale;

  const cuoriW = PAZIENZA.hearts * lato + (PAZIENZA.hearts - 1) * C.cuori.spazio;
  const cuoriY = testa - C.vuoto - lato;
  const cuori = {
    rect: { x: cx - cuoriW / 2, y: cuoriY, w: cuoriW, h: lato },
    lato,
    centri: Array.from({ length: PAZIENZA.hearts }, (_, i) => ({ x: cx - cuoriW / 2 + lato / 2 + i * (lato + C.cuori.spazio), y: cuoriY + lato / 2 })),
  };

  return {
    cliente: { x: cx, y: piediY + (size.h - feet.y) * scale, scale },
    piedi: { x: cx, y: piediY },
    nuvoletta,
    cuori,
  };
}

// La fascia in alto durante la Serata: sopra la moneta con l'Incasso a sinistra e il tempo a
// destra, sotto la barra con le stelle. `frazioni` dice dove cade ogni stella sulla barra (da 0 a
// 1, per esempio le soglie diviso la più alta). Il testo dell'Incasso parte da `incasso.x` (a
// sinistra) e quello del tempo finisce a `tempo.x` (a destra), entrambi centrati su y.
export function layoutHud(rect, frazioni) {
  const H = YATAI.hud;
  const riga = { ...rect, h: H.rigaAlta };
  const barraY = rect.y + H.rigaAlta + (rect.h - H.rigaAlta) / 2;
  const barra = { x: rect.x + H.stella / 2, y: barraY - H.barra / 2, w: rect.w - H.stella, h: H.barra };
  return {
    moneta: { x: rect.x + H.moneta / 2, y: riga.y + riga.h / 2, lato: H.moneta },
    incasso: { x: rect.x + H.moneta + 10, y: riga.y + riga.h / 2 },
    tempo: { x: rect.x + rect.w, y: riga.y + riga.h / 2 },
    barra,
    stelle: frazioni.map((f) => ({ x: barra.x + barra.w * f, y: barraY, lato: H.stella })),
  };
}

// L'area in cui sta il contenuto: l'immagine di gioco meno l'area sicura e i margini (in alto
// il margine non serve, c'è la fascia hud).
export function contentArea(frame, safe) {
  const m = YATAI.margine;
  return {
    x: safe.left + m,
    y: safe.top,
    w: frame.width - safe.left - safe.right - 2 * m,
    h: frame.height - safe.top - safe.bottom - m,
  };
}

// Quante voci della fila (Scorte e Postazioni insieme) non stanno in una fila sola: allora le Scorte escono.
export const scorteFuoriFila = (stations, scorte) => (scorte > 0 && stations > YATAI.postazioni.massimo ? scorte : 0);

// Le Scorte ai lati di Maurizio, dentro la fascia della cucina, a partire da in alto. A destra in basso resta lo spazio
// del cestino, quindi lì entrano meno righe: la metà (la prima, per arrotondamento) va a sinistra e il resto a destra, ma a
// destra non più di quante ne entrano con righe di almeno `rigaMin` di altezza (`colonne` colonne). A sinistra le
// colonne sono `colonne` finché le Scorte stanno in righe da `rigaMin`; oltre (con 13 Scorte e più, cioè il taiyaki e il
// ramen con tutte le varianti, ticket 08) se ne aggiunge una terza, e allora le celle sono larghe `cellaMin` e
// Maurizio ha lo spazio che resta in mezzo (con 16 Scorte a 360×640, 232 px invece di 280, spostato di 44 px verso
// destra). Le celle sono alte quanto larghe per `proporzione`, mai più grandi di `cellaMax` e mai così alte da non
// starci. Ritorna le celle nell'ordine della fila (prima quelle di sinistra, poi quelle di destra) e `centro`, il
// rettangolo che resta a Maurizio tra i due scaffali.
function scaffali(cucina, n) {
  const S = YATAI.scorte;
  const righeDestra = Math.max(0, Math.floor((cucina.h - S.riservaCestino) / S.rigaMin));
  const righeSinistra = Math.max(1, Math.floor(cucina.h / S.rigaMin));
  const entranoADestra = righeDestra * S.colonne;
  const sinistra = Math.max(Math.ceil(n / 2), n - entranoADestra);
  const destra = n - sinistra;
  const colonneSinistra = Math.max(S.colonne, Math.ceil(sinistra / righeSinistra));
  const w = colonneSinistra === S.colonne ? Math.min(S.cellaMax, (cucina.w - S.centro) / (2 * S.colonne)) : S.cellaMin;
  const h = Math.min(
    w * S.proporzione,
    cucina.h / Math.max(1, Math.ceil(sinistra / colonneSinistra)),
    destra ? (cucina.h - S.riservaCestino) / Math.ceil(destra / S.colonne) : Infinity,
  );
  const griglia = (voci, colonne, x0, versoDestra) => Array.from({ length: voci }, (_, i) => {
    const colonna = i % colonne;
    const x = versoDestra ? x0 - (colonne - colonna) * w : x0 + colonna * w;
    return { x, y: cucina.y + Math.floor(i / colonne) * h, w, h, scaffale: true };
  });
  const sinistraX = cucina.x + colonneSinistra * w;
  const destraX = cucina.x + cucina.w - S.colonne * w;
  return {
    celle: [...griglia(sinistra, colonneSinistra, cucina.x, false), ...griglia(destra, S.colonne, cucina.x + cucina.w, true)],
    centro: { x: sinistraX, y: cucina.y, w: destraX - sinistraX, h: cucina.h },
  };
}

// L'impaginazione completa. seats: i Posti (da 1 a YATAI.posti.massimo); stations: le voci della fila vicino al
// pollice (Postazioni, e nella Serata anche le Scorte: da 1 a YATAI.postazioni.massimo). `scorte` dice quante delle
// `stations` sono Scorte (le prime): se la fila è troppo lunga (scorteFuoriFila) le Scorte stanno fuori dalla fila,
// ai lati di Maurizio (YATAI.scorte) e in fila restano le Postazioni. `postazioni` è sempre nell'ordine
// della fila (prima le Scorte, poi le Postazioni), e un rettangolo fuori fila ha `scaffale: true`. Quando i Posti
// passano da 3 a 4 cambiano solo i Posti.
export function layoutYatai({ frame, safe, seats = YATAI.posti.iniziali, stations = YATAI.postazioni.massimo, scorte = 0 }) {
  if (!Number.isInteger(seats) || seats < 1 || seats > YATAI.posti.massimo) throw new RangeError(`Posti: ${seats}`);
  const fuori = scorteFuoriFila(stations, scorte);
  const inFila = stations - fuori;
  if (!Number.isInteger(stations) || stations < 1 || inFila < 1 || inFila > YATAI.postazioni.massimo) throw new RangeError(`Postazioni: ${stations} (Scorte ${scorte})`);

  const area = contentArea(frame, safe);
  const fasce = stack(area, YATAI.fasce);
  const zone = Object.fromEntries(YATAI.fasce.map((fascia, i) => [fascia.nome, fasce[i]]));

  // I Posti: larghi come se fossero già 4, così il quarto non fa rimpicciolire gli altri. Ogni
  // rettangolo è alto quanto la fascia, perché ci sta il Cliente intero con la sua nuvoletta, e si
  // tocca ovunque.
  const posti = row(zone.clienti, seats, { maxSlot: YATAI.posti.larghezzaMax, capacity: YATAI.posti.massimo });

  // Il Bancone: il piano in alto, su cui stanno i Piatti, e sotto il davanti.
  const superficie = { ...zone.bancone, h: zone.bancone.h * YATAI.bancone.superficie };
  const piatti = row(superficie, YATAI.bancone.capacita, { maxSlot: YATAI.bancone.larghezzaMax });

  // Le Postazioni: la fila con sotto lo spazio per il nome. Larghe come se fossero almeno `capacitaBase`,
  // così con poche voci non cambiano misura; con più voci si stringono per starci tutte.
  const fila = row(zone.postazioni, inFila, {
    maxSlot: YATAI.postazioni.larghezzaMax,
    gap: YATAI.postazioni.spazio,
    capacity: Math.max(YATAI.postazioni.capacitaBase, inFila),
  });
  // Con le Scorte sugli scaffali Maurizio sta nello spazio che resta in mezzo; senza, ha tutta la fascia della cucina.
  const { celle: sciolte, centro } = fuori === 0 ? { celle: [], centro: zone.cucina } : scaffali(zone.cucina, fuori);
  const postazioni = [...sciolte, ...fila];

  return { frame, safe, area, zone, posti, bancone: { rect: zone.bancone, superficie, piatti }, postazioni, maurizio: centro, scorteFuori: fuori };
}
