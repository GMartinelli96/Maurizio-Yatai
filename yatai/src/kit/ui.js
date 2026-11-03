// Pezzi di interfaccia fatti con il kit: il pulsante a matita e la carta di sfondo.

import { VIEW } from '../config.js';
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

// La carta ruvida su tutto lo schermo di gioco, anche quando l'altezza cambia (telefoni lunghi,
// finestre ridimensionate). Sta ferma rispetto alla camera e sotto ogni altra cosa.
export function addPaper(scene) {
  const paper = scene.add.tileSprite(0, 0, scene.scale.width, scene.scale.height, 'carta')
    .setOrigin(0).setScrollFactor(0).setDepth(-1000);
  const fit = () => paper.setSize(scene.scale.width, scene.scale.height);
  scene.scale.on('resize', fit);
  scene.events.once('shutdown', () => scene.scale.off('resize', fit));
  return paper;
}

// Per le scene disegnate a posizioni fisse su 720×1280 (le tavole di prova, il titolo):
// quando lo schermo è più alto le tiene al centro, con la carta che avanza sopra e sotto.
export function centerDesign(scene) {
  const place = () => scene.cameras.main.setScroll(0, -(scene.scale.height - VIEW.height) / 2);
  place();
  scene.scale.on('resize', place);
  scene.events.once('shutdown', () => scene.scale.off('resize', place));
}
