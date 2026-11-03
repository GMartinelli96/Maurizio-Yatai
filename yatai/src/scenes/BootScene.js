import Phaser from 'phaser';
import { loadFonts } from '../kit/font.js';
import { generateTextures } from '../kit/texture.js';

// L'avvio: disegna tutte le immagini del gioco con il kit a matita, aspetta il font scritto a
// mano e passa alla prima schermata.
//
// Solo in sviluppo (npm run dev), dall'indirizzo:
//   ?sviluppo           apre la scena di sviluppo (le tavole di prova)
//   ?sviluppo=yatai     apre direttamente una scena, per nome
//   &posti=4            la apre con 4 Posti (lo Yatai)
//   &seme=prova         fissa il seme dei Clienti della Serata (?sviluppo=serata&seme=prova), per ripetere una partita
//   &area=47,0,34,0     simula i margini sicuri del telefono: alto, destra, basso, sinistra
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('avvio');
  }

  create() {
    generateTextures(this);
    let next = 'title';
    let data;
    if (import.meta.env.DEV) {
      const query = new URLSearchParams(window.location.search);
      if (query.has('sviluppo')) next = query.get('sviluppo') || 'sviluppo';
      if (query.has('posti')) data = { posti: Number(query.get('posti')) };
      if (query.has('seme')) data = { ...data, seme: query.get('seme') };
    }
    loadFonts().then(() => this.scene.start(next, data));
  }
}
