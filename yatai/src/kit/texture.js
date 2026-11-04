// Dal kit a matita alle texture di Phaser. Le texture restano nella cache del gioco, quindi
// ogni scena le usa per nome con this.add.image(x, y, 'maurizio').

import { MATSURI } from '../config.js';
import { DISEGNI, drawEntry, panelDrawing, panelKey } from '../disegni/catalogo.js';
import { DISEGNI_CAST } from '../disegni/cast.js';
import { chiaviTema, disegniTema } from '../disegni/sfondi/index.js';
import { hashString } from './rng.js';

// Crea la texture `key` dal disegno `entry` ({ w, h, draw }), se non c'è già.
export function ensureTexture(scene, key, entry) {
  if (scene.textures.exists(key)) return key;
  const texture = scene.textures.createCanvas(key, Math.ceil(entry.w), Math.ceil(entry.h));
  drawEntry(texture.getContext(), key, entry);
  texture.refresh();
  return key;
}

// Genera tutte le texture del catalogo: si chiama una volta, all'avvio.
export function generateTextures(scene) {
  for (const [key, entry] of Object.entries(DISEGNI)) ensureTexture(scene, key, entry);
}

// Genera le texture del cast (7 peluche per 4 espressioni), se non ci sono già. Non stanno nel catalogo che si genera
// all'avvio: costano circa un secondo e mezzo e servono solo alla Serata, che le genera entrando (una volta sola, poi
// restano nella cache). Ritorna i millisecondi spesi e quante sono nate (zero se c'erano già).
export function generateCast(scene) {
  const inizio = performance.now();
  let nuove = 0;
  for (const [key, entry] of Object.entries(DISEGNI_CAST)) {
    if (scene.textures.exists(key)) continue;
    ensureTexture(scene, key, entry);
    nuove += 1;
  }
  return { ms: Math.round(performance.now() - inizio), nuove };
}

// Genera le texture del Matsuri in uso (sfondo, pavimento, tendina, cuscino) e butta via quelle degli
// altri Matsuri: ne serve uno solo alla volta, e gli altri costerebbero memoria e tempo di avvio.
// Ritorna le chiavi, i millisecondi spesi in tutto e per ogni texture, e quante sono nate (zero se
// c'erano già). Il tempo di ogni texture comprende il passaggio al canvas di Phaser (refresh).
export function generateTheme(scene, matsuri) {
  const chiavi = chiaviTema(matsuri);
  for (const altro of MATSURI) {
    if (altro === matsuri) continue;
    for (const key of Object.values(chiaviTema(altro))) if (scene.textures.exists(key)) scene.textures.remove(key);
  }
  const inizio = performance.now();
  const dettaglio = {};
  let nuove = 0;
  for (const [key, entry] of Object.entries(disegniTema(matsuri))) {
    if (scene.textures.exists(key)) continue;
    const da = performance.now();
    ensureTexture(scene, key, entry);
    dettaglio[key.replace(`-${matsuri}`, '').replace('sfondo-', '')] = Math.round(performance.now() - da);
    nuove += 1;
  }
  return { matsuri, chiavi, ms: Math.round(performance.now() - inizio), dettaglio, nuove };
}

// Un pannello o pulsante w×h nel colore `swatchName` di PALETTE (rosa, menta, giallo...).
export function panelTexture(scene, width, height, swatchName) {
  return ensureTexture(scene, panelKey(width, height, swatchName), panelDrawing(width, height, swatchName));
}

// Un'impronta dei pixel della texture, per controllare nei test che esca sempre uguale.
export function textureFingerprint(scene, key) {
  const canvas = scene.textures.get(key).getSourceImage();
  const { data } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
  let text = '';
  for (let i = 0; i < data.length; i += 4096) text += String.fromCharCode(...data.subarray(i, i + 4096));
  return hashString(text).toString(16);
}
