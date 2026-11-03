// Dove vanno i pezzi dello sfondo di un Matsuri. Funzioni pure: niente Phaser, niente DOM.
//
// Nessuna posizione è scritta a mano: tutto discende dall'impaginazione dello Yatai
// (src/layout/yatai.js) e dai numeri di SFONDO in config.js. Ogni pezzo è un rettangolo
// { x, y, w, h } con (x, y) in alto a sinistra, in pixel di gioco.
//
//   alto ─ appeso al bordo in alto dello schermo
//   cielo ─ sopra l'orizzonte, oltre il bordo in alto
//   orizzonte ─ a metà della fascia dei Clienti
//   terra ─ dall'orizzonte in giù, fino dietro il pavimento
//   lati ─ due colonne ai bordi, poggiate dietro il Bancone
//   pavimento ─ comincia sotto la cima del Bancone e arriva in fondo
//
// Il bordo in alto dello schermo è sempre coperto, anche sotto il notch (l'area sicura): il
// cielo parte dall'alto del gioco, non dall'alto dell'area sicura.

import { SFONDO } from '../config.js';

// `layout` è il risultato di layoutYatai(). `frame` è la misura dell'immagine di gioco.
export function layoutSfondo(layout) {
  const { frame, zone, bancone } = layout;
  const w = frame.width;
  const orizzonte = zone.clienti.y + zone.clienti.h * SFONDO.orizzonte;
  const pavimentoY = bancone.rect.y + SFONDO.attaccoPavimento;
  const latoBase = bancone.rect.y + SFONDO.lato.sotto;

  return {
    orizzonte,
    pavimentoY,
    // La parte alta del cielo resta fuori dallo schermo (y negativa): è voluto.
    cielo: { x: 0, y: orizzonte + SFONDO.cielo.sotto - SFONDO.cielo.h, w, h: SFONDO.cielo.h },
    terra: { x: 0, y: orizzonte, w, h: SFONDO.terra.h },
    alto: { x: 0, y: 0, w, h: SFONDO.alto.h },
    latoSx: { x: 0, y: latoBase - SFONDO.lato.h, w: SFONDO.lato.w, h: SFONDO.lato.h },
    latoDx: { x: w - SFONDO.lato.w, y: latoBase - SFONDO.lato.h, w: SFONDO.lato.w, h: SFONDO.lato.h },
  };
}

// I buchi che lo sfondo lascia scoperti, in pixel di gioco: un elenco vuoto vuol dire che dal bordo
// in alto fino in fondo allo schermo c'è sempre qualcosa. Il pavimento (alto `pavimentoAltezza`)
// copre da pavimentoY in giù.
export function buchi(sfondo, frame, pavimentoAltezza) {
  const pezzi = [
    { da: sfondo.cielo.y, a: sfondo.cielo.y + sfondo.cielo.h },
    { da: sfondo.terra.y, a: sfondo.terra.y + sfondo.terra.h },
    { da: sfondo.pavimentoY, a: sfondo.pavimentoY + pavimentoAltezza },
  ].sort((a, b) => a.da - b.da);
  const out = [];
  let coperto = 0;
  for (const p of pezzi) {
    if (p.da > coperto + 1e-6) out.push({ da: coperto, a: p.da });
    coperto = Math.max(coperto, p.a);
  }
  if (coperto < frame.height - 1e-6) out.push({ da: coperto, a: frame.height });
  return out;
}
