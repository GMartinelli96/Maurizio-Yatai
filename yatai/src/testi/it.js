// Lingua di riferimento: ogni testo nasce qui, poi si traduce in en.js e ja.js.
export default {
  subtitle: 'La bancarella del Matsuri',
  developedBy: 'sviluppato da Maurizio Influencer Official',
  play: 'Gioca',
  // La Bottega (src/scenes/BottegaScene.js): i Potenziamenti si comprano con gli Yen. I testi dei Potenziamenti hanno per
  // chiave potenziamento_ e potenziamentoDesc_ più l'id in config.js (POTENZIAMENTI).
  bottega: 'Bottega',
  bottegaPotenziamenti: 'Potenziamenti',
  bottegaIndietro: 'Indietro',
  bottegaAlMassimo: 'Al massimo',
  bottegaNonSalvato: 'Su questo dispositivo gli Yen non si possono salvare: restano finché non chiudi il gioco.',
  potenziamento_postoInPiu: 'Posto in più',
  potenziamentoDesc_postoInPiu: 'Un quarto Posto per i Clienti.',
  potenziamento_ventaglio: 'Ventaglio di Maurizio',
  potenziamentoDesc_ventaglio: 'I Clienti aspettano di più:',
  // I nomi dei Piatti: la chiave è piatto_ più quella di PIATTI in config.js.
  piatto_onigiri: 'Onigiri',
  piatto_takoyaki: 'Takoyaki',
  piatto_kakigori: 'Kakigōri',
  piatto_taiyaki: 'Taiyaki',
  piatto_ramen: 'Ramen',
  // Le Scorte: la chiave è ingrediente_ più l'id dell'Ingrediente in config.js (PIATTI, ricetta).
  ingrediente_riso: 'Riso',
  ingrediente_alga: 'Alga',
  ingrediente_pastella: 'Pastella',
  ingrediente_polpo: 'Polpo',
  ingrediente_salsa: 'Salsa',


  // Fine Serata
  endTitle: 'Serata finita!',
  endIncasso: 'Incasso',
  endVendite: 'Vendite',
  endSpesa: 'Spesa',
  endSpreco: 'Spreco',
  endObiettivo: 'Obiettivo',
  endRigioca: 'Rigioca',
  endServiti: 'Clienti serviti',
  endPersi: 'Andati via',
  // Il commento di Maurizio, secondo le stelle (da 0 a 3).
  endVoto0: 'Domani andrà meglio!',
  endVoto1: 'Bella serata!',
  endVoto2: 'Che serata!',
  endVoto3: 'Una serata da leggenda!',
  // Se l'Incasso è in rosso al posto del commento: gentile, senza colpe.
  endRosso: 'Stasera abbiamo sprecato troppo, riproviamo!',
};
