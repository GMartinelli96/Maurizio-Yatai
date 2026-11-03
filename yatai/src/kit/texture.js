// Dal kit a matita alle texture di Phaser. Le texture restano nella cache del gioco, quindi
// ogni scena le usa per nome con this.add.image(x, y, 'maurizio').

import { DISEGNI, drawEntry, panelDrawing, panelKey } from '../disegni/catalogo.js';
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
