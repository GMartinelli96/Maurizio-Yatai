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

import { YATAI } from '../config.js';

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

// L'impaginazione completa. seats: i Posti (da 1 a YATAI.posti.massimo); stations: le Postazioni
// (da 1 a YATAI.postazioni.massimo). Quando i Posti passano da 3 a 4 cambiano solo i Posti.
export function layoutYatai({ frame, safe, seats = YATAI.posti.iniziali, stations = YATAI.postazioni.massimo }) {
  if (!Number.isInteger(seats) || seats < 1 || seats > YATAI.posti.massimo) throw new RangeError(`Posti: ${seats}`);
  if (!Number.isInteger(stations) || stations < 1 || stations > YATAI.postazioni.massimo) throw new RangeError(`Postazioni: ${stations}`);

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

  // Le Postazioni: la fila con sotto lo spazio per il nome.
  const postazioni = row(zone.postazioni, stations, {
    maxSlot: YATAI.postazioni.larghezzaMax,
    gap: YATAI.postazioni.spazio,
    capacity: YATAI.postazioni.massimo,
  });

  return { frame, safe, area, zone, posti, bancone: { rect: zone.bancone, superficie, piatti }, postazioni, maurizio: zone.cucina };
}
