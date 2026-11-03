// Il font scritto a mano. Si carica con l'API FontFace e non con un <style>: la CSP del sito
// permette solo fogli di stile e font serviti dal sito stesso. Gli url sono relativi alla
// pagina, quindi funzionano sia in sviluppo sia da /yatai/.

import { PALETTE, STILE } from '../config.js';

let faces = [];

export async function loadFonts() {
  faces = STILE.font.file.map(({ peso, url }) => new FontFace(STILE.font.nome, `url(${url})`, { weight: peso }));
  for (const face of faces) document.fonts.add(face);
  try {
    await Promise.all(faces.map((face) => face.load()));
  } catch (err) {
    // Il gioco resta giocabile con il font di ripiego, ma i test devono accorgersene.
    console.error(`Font scritto a mano non caricato: ${err}`);
  }
}

// Si guarda lo stato dei FontFace: document.fonts.check() dice sì anche quando il font non
// c'è affatto (docs/ricerca/font-giapponese.md, 6.2).
export const fontsReady = () => faces.length > 0 && faces.every((face) => face.status === 'loaded');

// Lo stile di un testo di Phaser. outline: il bordo chiaro attorno alle lettere, come nei
// titoli e nelle etichette della suite.
export function textStyle(size, { bold = false, color = PALETTE.inchiostro, outline = 0, outlineColor = PALETTE.bianco } = {}) {
  return {
    fontFamily: STILE.font.famiglia,
    fontSize: `${size}px`,
    fontStyle: bold ? 'bold' : 'normal',
    color,
    stroke: outlineColor,
    strokeThickness: outline,
    padding: { x: 2, y: 2 },
  };
}
