import Phaser from 'phaser';
import { loadFonts } from '../kit/font.js';
import { generateTextures } from '../kit/texture.js';
import { salvataggio } from '../salvataggio.js';

// L'avvio: disegna tutte le immagini del gioco con il kit a matita, aspetta il font scritto a
// mano e passa alla prima schermata.
//
// Solo in sviluppo (npm run dev), dall'indirizzo:
//   ?sviluppo           apre la scena di sviluppo (le tavole di prova)
//   ?sviluppo=yatai     apre direttamente una scena, per nome
//   &posti=4            la apre con 4 Posti (lo Yatai)
//   &matsuri=tanabata   la apre con il tema di un Matsuri (lo Yatai): hanami, tanabata, hanabi, aki, yuki
//   &seme=prova         fissa il seme dei Clienti della Serata (?sviluppo=serata&seme=prova), per ripetere una partita
//   &disturbatori=croccola,formiche,corvi   la Serata di prova con quei Disturbatori (?sviluppo=serata), vedi SERATA_PROVA_DISTURBATORI
//   &yen=5000           mette 5000 Yen in tasca (nel salvataggio del browser), per provare la Bottega
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
      if (query.has('matsuri')) data = { ...data, matsuri: query.get('matsuri') };
      if (query.has('seme')) data = { ...data, seme: query.get('seme') };
      if (query.has('disturbatori')) data = { ...data, disturbatori: query.get('disturbatori').split(',').filter(Boolean) };
      if (query.has('yen')) salvataggio().accreditaIncasso(Number(query.get('yen')));
    }
    loadFonts().then(() => this.scene.start(next, data));
  }
}
