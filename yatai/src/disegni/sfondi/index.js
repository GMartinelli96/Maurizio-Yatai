// I disegni a tema di ogni Matsuri: lo sfondo (cielo, terra, alto, due lati) e il pavimento, la
// tendina del Bancone e il cuscino dei Posti con i colori del tema.
//
// Non stanno in DISEGNI (src/disegni/catalogo.js) perché non si generano tutti all'avvio: si
// genera solo il tema in uso (src/kit/texture.js, generateTheme). Ogni texture ha una chiave per
// Matsuri, per esempio `sfondo-hanabi-cielo` o `pavimento-aki`.

import { SFONDO, TEMI } from '../../config.js';
import { BANCONE_SIZE, PAVIMENTO_SIZE, POSTO_SIZE, drawBancone, drawPavimento, drawPosto } from '../yatai.js';
import * as aki from './aki.js';
import * as hanabi from './hanabi.js';
import * as hanami from './hanami.js';
import * as tanabata from './tanabata.js';
import * as yuki from './yuki.js';

const SFONDI = { hanami, tanabata, hanabi, aki, yuki };

// I pezzi di uno sfondo e le loro misure (le stesse di SFONDO in config.js).
export const PEZZI = {
  cielo: { w: 720, h: SFONDO.cielo.h },
  terra: { w: 720, h: SFONDO.terra.h },
  alto: { w: 720, h: SFONDO.alto.h },
  latoSx: { w: SFONDO.lato.w, h: SFONDO.lato.h },
  latoDx: { w: SFONDO.lato.w, h: SFONDO.lato.h },
};

// Gli sfondi grandi hanno metà dei puntini di grana: sono tanti pixel, e la grana costa un'operazione
// per puntino. Il tratteggio e la carta sotto bastano a farli sembrare a matita.
const GRANA_SFONDO = 0.03;

// Le chiavi di tutte le texture di un Matsuri, per nome.
export function chiaviTema(matsuri) {
  return {
    pavimento: `pavimento-${matsuri}`,
    bancone: `bancone-${matsuri}`,
    posto: `posto-${matsuri}`,
    ...Object.fromEntries(Object.keys(PEZZI).map((pezzo) => [pezzo, `sfondo-${matsuri}-${pezzo}`])),
  };
}

// Le voci { w, h, draw } di un Matsuri, nella stessa forma di DISEGNI.
export function disegniTema(matsuri) {
  const T = TEMI[matsuri];
  const S = SFONDI[matsuri];
  if (!T || !S) throw new RangeError(`Matsuri sconosciuto: ${matsuri}`);
  const chiavi = chiaviTema(matsuri);
  return {
    [chiavi.pavimento]: { ...PAVIMENTO_SIZE, grainDensity: GRANA_SFONDO, draw: (ctx, rng) => drawPavimento(ctx, rng, T, S.decoroPavimento) },
    [chiavi.bancone]: { ...BANCONE_SIZE, draw: (ctx, rng) => drawBancone(ctx, rng, T) },
    [chiavi.posto]: { ...POSTO_SIZE, draw: (ctx, rng) => drawPosto(ctx, rng, T) },
    [chiavi.cielo]: { ...PEZZI.cielo, grainDensity: GRANA_SFONDO, draw: (ctx, rng) => S.cielo(ctx, rng, T) },
    [chiavi.terra]: { ...PEZZI.terra, grainDensity: GRANA_SFONDO, draw: (ctx, rng) => S.terra(ctx, rng, T) },
    [chiavi.alto]: { ...PEZZI.alto, grainDensity: GRANA_SFONDO, draw: (ctx, rng) => S.alto(ctx, rng, T) },
    [chiavi.latoSx]: { ...PEZZI.latoSx, grainDensity: GRANA_SFONDO, draw: (ctx, rng) => S.lato(ctx, rng, T, false) },
    [chiavi.latoDx]: { ...PEZZI.latoDx, grainDensity: GRANA_SFONDO, draw: (ctx, rng) => S.lato(ctx, rng, T, true) },
  };
}
