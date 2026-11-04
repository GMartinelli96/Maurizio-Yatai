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
  potenziamento_piastraPiuVeloce: 'Piastra più veloce',
  potenziamentoDesc_piastraPiuVeloce: 'Il takoyaki cuoce prima:',
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
  // Il kakigōri (ticket 07): il ghiaccio e una Scorta per variante, con i nomi corti (stanno sotto una Scorta piccola).
  // Le varianti hanno anche il nome del Piatto: piatto_ più l'id con la variante (kakigori-fragola).
  ingrediente_ghiaccio: 'Ghiaccio',
  ingrediente_fragola: 'Fragola',
  ingrediente_melone: 'Melone',
  ingrediente_matcha: 'Matcha',
  'piatto_kakigori-fragola': 'Kakigōri alla fragola',
  'piatto_kakigori-melone': 'Kakigōri al melone',
  'piatto_kakigori-matcha': 'Kakigōri al matcha',
  // Taiyaki e ramen (ticket 08): l'impasto dolce del taiyaki non è la pastella del takoyaki, sono due Scorte.
  ingrediente_impasto: 'Impasto dolce',
  ingrediente_fagioli: 'Fagioli rossi',
  ingrediente_crema: 'Crema',
  ingrediente_noodles: 'Noodles',
  ingrediente_brodo: 'Brodo',
  ingrediente_uovo: 'Uovo',
  ingrediente_naruto: 'Naruto',
  'piatto_taiyaki-fagioli': 'Taiyaki ai fagioli rossi',
  'piatto_taiyaki-crema': 'Taiyaki alla crema',
  'piatto_ramen-uovo': 'Ramen con uovo',
  'piatto_ramen-naruto': 'Ramen con naruto',


  // Fine Serata
  endTitle: 'Serata finita!',
  endIncasso: 'Incasso',
  endVendite: 'Vendite',
  endSpesa: 'Spesa',
  endSpreco: 'Spreco',
  endObiettivo: 'Obiettivo',
  endRigioca: 'Rigioca',
  endInTasca: 'In tasca',
  endServiti: 'Clienti serviti',
  endPersi: 'Andati via',
  // La tabella per Piatto del recap: sprecati, costo e vendite sono in Yen, fatti e serviti sono Piatti.
  endTabellaFatti: 'Fatti',
  endTabellaServiti: 'Serviti',
  endTabellaSprecati: 'Sprecati',
  endTabellaCosto: 'Costo',
  endTabellaVendite: 'Vendite',
  // Il commento di Maurizio, secondo le stelle (da 0 a 3).
  endVoto0: 'Domani andrà meglio!',
  endVoto1: 'Bella serata!',
  endVoto2: 'Che serata!',
  endVoto3: 'Una serata da leggenda!',
  // Se l'Incasso è in rosso al posto del commento: gentile, senza colpe.
  endRosso: 'Stasera abbiamo sprecato troppo, riproviamo!',
};
