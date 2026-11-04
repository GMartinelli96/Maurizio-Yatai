// Dove cadono i riscontri dei Vizi del cast (ticket 09, passo 4), senza Phaser: la scena li legge e i test li provano.
// Tutto parte da quello che la logica ha già deciso (il Vizio del Cliente, lo Yen d'oro); qui si decide solo dove si vede.

import { CAST_PUNTI } from '../disegni/cast.js';
import { CLIENTE_SIZE } from '../disegni/clienti.js';
import { CALMA_SIZE } from '../disegni/vizi.js';

// L'ovale azzurra della calma sta nel disegno CALMA_SIZE con il centro a (130, 38) e misura 244×44: il resto sono le
// bollicine sopra.
const OVALE = { centroY: 38, w: 244, h: 44 };

// Il punto del disegno di un Cliente (pixel del riquadro CLIENTE_SIZE) dove cade sullo schermo, dato lo sprite a riposo
// { x, y, scale }: x al centro e y ai piedi, perché il peluche ha origine (0.5, 1).
export function puntoSulCliente(sprite, punto) {
  return {
    x: sprite.x + (punto.x - CLIENTE_SIZE.w / 2) * sprite.scale,
    y: sprite.y + (punto.y - CLIENTE_SIZE.h) * sprite.scale,
  };
}

// Da dove escono le monete di un pagamento: dalla borsetta di Carlotta, dal centro del Cliente per tutti gli altri.
// `centro` è il centro del Cliente, `sprite` lo sprite a riposo, `tipo` chi è.
export function sorgenteMonete({ tipo, sprite, centro }) {
  const punto = CAST_PUNTI[tipo]?.borsa;
  return punto ? puntoSulCliente(sprite, punto) : centro;
}

// Dove cade lo Yen d'oro di Nella: compare sopra la testa, subito sopra i cuoricini, e cade sul cuscino del Posto. `geom` è
// la geometria del Cliente (placeCliente).
export function percorsoMonetaOro(geom) {
  return {
    da: { x: geom.piedi.x, y: geom.cuori.rect.y - 20 },
    a: { x: geom.piedi.x, y: geom.piedi.y - 8 },
  };
}

// L'ovale della calma dietro alla fila di cuoricini: dove mettere l'immagine (origine (0.5, y) con l'ovale al centro) e
// le due scale. È larga come la fila più `margine.x` per lato, ma senza uscire dal Posto (sennò si mescola con quella
// dell'accanto). `cuori` è il rettangolo della fila, `posto` quello del Posto.
export function rettangoloCalma(cuori, posto, margine) {
  const mx = Math.max(0, Math.min(margine.x, (posto.w - cuori.w) / 2));
  const cx = cuori.x + cuori.w / 2;
  const cy = cuori.y + cuori.h / 2;
  return {
    x: cx,
    y: cy,
    origineY: OVALE.centroY / CALMA_SIZE.h,
    scalaX: (cuori.w + 2 * mx) / OVALE.w,
    scalaY: (cuori.h + 2 * margine.y) / OVALE.h,
  };
}
