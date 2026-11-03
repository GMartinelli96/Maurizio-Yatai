// Pezzi di interfaccia fatti con il kit: per ora il pulsante a matita.

import { PANEL_MARGIN } from '../disegni/catalogo.js';
import { textStyle } from './font.js';
import { panelTexture } from './texture.js';

// Un pulsante centrato in (x, y). onTap è facoltativo: senza, il pulsante è solo un disegno.
export function addButton(scene, x, y, width, height, label, swatchName, onTap) {
  const image = scene.add.image(x, y, panelTexture(scene, width, height, swatchName));
  // Sotto il pulsante la texture ha l'ombra: l'origine va al centro del pulsante, non dell'immagine.
  image.setOrigin(0.5, (PANEL_MARGIN + height / 2) / image.height);
  const text = scene.add.text(x, y, label, textStyle(Math.round(height * 0.42), { bold: true })).setOrigin(0.5);
  if (onTap) {
    image.setInteractive({ useHandCursor: true });
    image.on('pointerup', onTap);
  }
  return { image, text, x, y, width, height, label };
}
