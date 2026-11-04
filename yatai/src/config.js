// Tutti i numeri del gioco stanno qui. Sono i valori di partenza di GAME_SPEC.md:
// si regolano in questo file e in nessun altro.

// I colori del kit a matita, per ruolo. Ricavati guardando FarmPlush, Nella Bug Saga e il
// Picchiaduro: contorno marrone quasi nero, pastelli caldi, carta color crema.
// Ogni colore di riempimento ha la sua ombra (il tratteggio scuro) e la sua luce (quello chiaro).
export const PALETTE = {
  inchiostro: '#3a2f2b',
  carta: '#fff8ec',
  cartaGrana: '#d8cbb8',
  ombraPosata: '#3a2f2b',
  bianco: '#fffdf8',
  pelo: { colore: '#dba46a', ombra: '#a8743f', luce: '#f4d3a1' },
  muso: { colore: '#f4ddb4', ombra: '#d4b384', luce: '#fff3dc' },
  orecchioDentro: { colore: '#f0c49c', ombra: '#cf9a6c', luce: '#fbe2c7' },
  salopette: { colore: '#6aa3e0', ombra: '#3d73b5', luce: '#acd0f4' },
  bordino: { colore: '#8fdde6', ombra: '#56b3c0', luce: '#d2f5f8' },
  guance: '#f39a9a',
  arcobaleno: ['#f28b8b', '#f6b36b', '#f5dc72', '#93d69a', '#7fb7ee'],
  riso: { colore: '#fffdf7', ombra: '#cfcac0', luce: '#ffffff' },
  nori: { colore: '#33463c', ombra: '#1d2a23', luce: '#5b7a68' },
  // Il takoyaki: le palline dorate, la salsa scura, l'alga aonori e la maionese; la versione bruciata è quasi nera.
  // Il fumo (dei Piatti bruciati e delle Postazioni nel Fumo) è un grigio caldo, mai nero.
  takoyaki: { colore: '#e0a95f', ombra: '#b0702f', luce: '#f6d9a0' },
  salsa: { colore: '#7a4a2e', ombra: '#4f2f1d', luce: '#a2704f' },
  aonori: '#6fae6a',
  maionese: '#fff3d6',
  // Gli Ingredienti del takoyaki che si toccano dalle Scorte: la pastella chiara, il polpo bollito (rosa
  // scuro con le ventose bianche).
  pastella: { colore: '#f7e6ae', ombra: '#dcc279', luce: '#fff6d8' },
  polpo: { colore: '#e3858a', ombra: '#b4565f', luce: '#f6b9b9' },
  bruciato: { colore: '#4d3d37', ombra: '#2b211d', luce: '#76645c' },
  fumo: { colore: '#d9d4d8', ombra: '#a9a3aa', luce: '#f3f0f2' },
  // Gli accenti per pulsanti e pannelli, come i pulsanti di FarmPlush. Nuvola: i pannelli bianchi.
  nuvola: { colore: '#fffdf8', ombra: '#cdbfa9', luce: '#ffffff' },
  rosa: { colore: '#f7a8c4', ombra: '#d9708f', luce: '#fde0ea' },
  menta: { colore: '#b5e6d3', ombra: '#76bba0', luce: '#e3f7ef' },
  giallo: { colore: '#f7d26a', ombra: '#d1a33a', luce: '#fdedb8' },
  // Lo Yatai: legno chiaro per il pavimento e il piano del Bancone, legno scuro per il tagliere.
  legno: { colore: '#ecc99a', ombra: '#c99a64', luce: '#f9e3c2' },
  legnoChiaro: { colore: '#f2d5aa', ombra: '#cfa670', luce: '#fbead0' },
  legnoScuro: { colore: '#d29a62', ombra: '#a56f3a', luce: '#ecc08f' },
  // Le Postazioni: ferro delle piastre, ghiaccio, brodo.
  ferro: { colore: '#7d7a86', ombra: '#524f5c', luce: '#aeabb8' },
  ghiaccio: { colore: '#e4f4fb', ombra: '#a9d3e6', luce: '#ffffff' },
  celeste: { colore: '#a9d6f0', ombra: '#6fa9cc', luce: '#d8eefa' },
  brodo: { colore: '#f3cf86', ombra: '#d6a64c', luce: '#fbe6b4' },
  // Gli sciroppi del kakigōri (ticket 07). In bianco e nero devono restare diversi: la fragola è media (luminosità
  // ~150), il melone molto chiaro (~215), il matcha scuro (~100). La foglia verde è la buccia del melone e il ciuffo.
  fragola: { colore: '#ef6f86', ombra: '#c24560', luce: '#f9a9b6' },
  melone: { colore: '#cfeda0', ombra: '#9cc468', luce: '#ecf8cf' },
  matcha: { colore: '#55793a', ombra: '#3a5628', luce: '#86a867' },
  foglia: { colore: '#7bbf72', ombra: '#4f8f4c', luce: '#a9dda0' },
  // Il taiyaki e i suoi ripieni (ticket 08). In bianco e nero i fagioli rossi (luminosità ~70, quasi scuri come l'inchiostro)
  // e la crema (~225, chiara) restano lontani, e il taiyaki dorato (~175) sta in mezzo.
  taiyaki: { colore: '#e2a65e', ombra: '#b2742f', luce: '#f6d6a0' },
  fagioli: { colore: '#7b3040', ombra: '#521c2a', luce: '#b0626f' },
  crema: { colore: '#fbe48a', ombra: '#dcbc50', luce: '#fff4c4' },
  // Il ramen: i noodles gialli, l'uovo marinato (l'albume è un po' ambrato, il tuorlo arancio) e il naruto (bianco con
  // la spirale rosa, che è C.rosa). L'uovo e il naruto si distinguono anche per la forma (ovale con il tuorlo, disco
  // dal bordo ondulato con la spirale).
  noodles: { colore: '#f4d98a', ombra: '#d4b04e', luce: '#fbeab8' },
  albume: { colore: '#f6e6cc', ombra: '#d2b48c', luce: '#fffaf0' },
  tuorlo: { colore: '#f09a2e', ombra: '#c6701a', luce: '#f8c36a' },
};

export const VIEW = {
  // Formato verticale 9:16. Su computer Phaser lo adatta in una colonna centrata.
  width: 720,
  height: 1280,
  background: PALETTE.carta,
};

// Come lo schermo diventa un'immagine di gioco (src/layout/schermo.js). La larghezza è sempre
// quella di VIEW; l'altezza segue le proporzioni dello schermo, ma resta tra questi due limiti:
// 1280 è il 9:16 (e la colonna centrata dei computer), 1560 è un telefono lungo come un 9:19,5.
// Oltre i limiti Phaser lascia delle bande ai lati o sopra e sotto.
export const SCHERMO = {
  minHeight: 1280,
  maxHeight: 1560,
};

// Il kit di disegno "a matita" (src/kit/). Le misure sono in pixel di gioco (VIEW).
export const STILE = {
  // Ogni disegno ha il suo seme, ricavato da questo e dal nome della texture: lo stesso
  // disegno esce identico a ogni avvio, anche se cambia l'ordine in cui si generano.
  seme: 'maurizio-yatai-1',
  linea: {
    spessore: 3.4,
    // Il tremolio: di quanto la linea si sposta dal contorno e ogni quanti pixel cambia idea.
    tremolio: 1.3,
    onda: 26,
    // Il secondo passaggio di matita, più sottile e chiaro, appena sfasato rispetto al primo.
    ripasso: { spessore: 0.5, alpha: 0.45, scarto: 1.1 },
  },
  pastello: {
    // Il tratteggio a pastello: tratti diagonali corti sopra il colore pieno.
    angolo: -58,
    passo: 6.5,
    spessore: 2.2,
    alphaOmbra: 0.3,
    alphaLuce: 0.35,
    // Il colore pieno esce un poco dal contorno, come quando si colora a mano.
    sbavatura: 1.2,
    // L'ombra morbida lungo il bordo interno, che dà volume ai peluche.
    bordoOmbra: { spessore: 14, alpha: 0.2 },
  },
  pelo: { lunghezza: 4.4, passo: 4.8, deviazione: 0.4, alpha: 0.7 },
  // La grana della matita: puntini tolti a caso da tutto il disegno.
  grana: { densita: 0.06, alpha: 0.22 },
  // La carta è un quadrato che si ripete. Le macchie sono due griglie di misure diverse (5 e 11
  // celle per lato), così la ripetizione non si nota.
  carta: { lato: 512, grana: 7, macchie: 3, celle: [5, 11], fibre: 260, graffi: 120 },
  ombraPosata: { alpha: 0.16 },
  pannello: { raggio: 22, ombraY: 7, alphaOmbra: 0.2 },
  font: {
    // Comic Neue (OFL, in public/fonts/) è la versione libera del Comic Sans che usa la suite.
    // Il giapponese per ora usa i font rotondi del sistema; quello definitivo arriva dal passo 12.
    nome: 'Comic Neue',
    famiglia: '"Comic Neue", "Hiragino Maru Gothic ProN", "Yu Gothic UI", "Meiryo", "Noto Sans JP", sans-serif',
    file: [
      { peso: '400', url: 'fonts/comic-neue-latin-400-normal.woff2' },
      { peso: '700', url: 'fonts/comic-neue-latin-700-normal.woff2' },
    ],
  },
};

// I test avanzano il tempo a passi fissi di un sessantesimo di secondo.
export const FRAME_MS = 1000 / 60;

export const SERATA = {
  durationSec: 120,
  // Incasso rispetto all'obiettivo per avere ★, ★★, ★★★.
  starThresholds: [1, 1.3, 1.6],
};

export const PAZIENZA = {
  hearts: 5,
  // La Pazienza di un Cliente che arriva fuori da un'ondata. In ondata è ONDATE.pazienzaSec. I cuoricini sono
  // sempre `hearts` e ognuno dura un quinto della Pazienza di quel Cliente.
  durationSec: 25,
  // Mancia massima, a Pazienza piena, come frazione del prezzo.
  maxManciaRatio: 0.5,
};

// La Serie (GAME_SPEC.md, "Serie"; ticket 34): quanti Ordini di fila Maurizio ha servito senza perdere un Cliente e
// senza servire a vuoto. Dà Mancia in più, mai sul prezzo né sulla Spesa: +`manciaPerCliente` (10%) di Mancia per ogni
// Cliente di fila oltre il primo, fino a `moltiplicatoreMax` (×1,5, che si raggiunge a 6 di fila). Si moltiplica con gli
// altri moltiplicatori della Mancia (Che stile!, Yen d'oro, desideri) senza un tetto unico in più. Valori di partenza.
export const SERIE = {
  manciaPerCliente: 0.1,
  moltiplicatoreMax: 1.5,
};

// Il Lamento (GAME_SPEC.md, "Clienti"): la faccia del Cliente segue i cuoricini rimasti, non il tempo.
// Da `perplessaA` cuoricini in giù è perplesso (con la goccia), da `imbronciataA` in giù imbronciato
// (con lo sbuffo); sopra, neutro. Sono valori di partenza.
export const LAMENTO = { perplessaA: 2, imbronciataA: 1 };

export const FUMO_SEC = 3;
export const CHE_STILE_BONUS = 0.2;

// La bruciatura (passo 4). Un Piatto con burnAfterSec, una volta pronto, si brucia se resta sulla
// Postazione più di così (PIATTI). Negli ultimi avvisoSec secondi la Serata dà l'allarme (l'evento
// staPerBruciarsi) e la scena lo fa vedere: il giocatore ha ancora il tempo di arrivare.
export const BRUCIATURA = { avvisoSec: 1.5 };

// I Piatti stanno nell'ordine in cui si sbloccano (GAME_SPEC.md): le Postazioni sullo schermo li seguono.
// burnAfterSec: secondi in più, da quando il Piatto è pronto (finito e da prendere), prima che si bruci
// (null o assente = mai).
// ricetta: la cucina a tocchi (ticket 33 e 37). Una lista di passi, nell'ordine in cui accadono. Un passo è
//   { ingrediente, costo }   un tocco sulla Scorta di quell'Ingrediente, che si paga subito
//   { cotturaSec }           la Postazione cuoce da sola per tanti secondi; intanto le Scorte non fanno niente
//   { unoDi: [ ... ] }       un tocco su una di più Scorte (ticket 07): ogni voce è { ingrediente, costo, variante }
//                            e la variante scelta resta nel Piatto, che sul Bancone e negli Ordini si chiama
//                            `piatto-variante` (kakigori-fragola). Le voci di uno stesso passo costano uguale.
// Dopo l'ultimo passo il Piatto è pronto e si prende (un tocco in più, mai nella lista). La cottura sta dove serve
// alla Ricetta: nel takoyaki dopo il polpo, nel kakigōri dopo il ghiaccio, e la logica è la stessa.
// varianti: gli id delle varianti, nell'ordine in cui compaiono; uguali a quelli del passo unoDi (lo controlla un test).
// Il costo del Piatto è la somma dei costi, circa un terzo del prezzo (GAME_SPEC.md, "Ingredienti e Spreco").
// La sequenza è anche la Ricetta mostrata in icone e quella del Ricettario.
// L'id di una Scorta è il nome dell'Ingrediente e deve essere unico in tutte le ricette (un test lo controlla): la
// pastella del takoyaki e l'impasto dolce del taiyaki sono due Ingredienti, e due Scorte, con nomi diversi.
export const PIATTI = {
  onigiri: {
    ricetta: [{ ingrediente: 'riso', costo: 20 }, { ingrediente: 'alga', costo: 10 }],
    price: 100,
    varianti: [],
  },
  // 4 tocchi: pastella, polpo, [5 s], salsa, prendi. 100 Yen di Ingredienti su 300.
  takoyaki: {
    ricetta: [
      { ingrediente: 'pastella', costo: 30 },
      { ingrediente: 'polpo', costo: 50 },
      { cotturaSec: 5 },
      { ingrediente: 'salsa', costo: 20 },
    ],
    burnAfterSec: 4,
    price: 300,
    varianti: [],
  },
  // 3 tocchi: ghiaccio, sciroppo (uno dei tre), prendi. I 2 s sono la macinatura. Non si brucia mai.
  // 80 Yen di Ingredienti su 250 (circa un terzo, GAME_SPEC.md).
  kakigori: {
    ricetta: [
      { ingrediente: 'ghiaccio', costo: 20 },
      { cotturaSec: 2 },
      {
        unoDi: [
          { ingrediente: 'fragola', costo: 60, variante: 'fragola' },
          { ingrediente: 'melone', costo: 60, variante: 'melone' },
          { ingrediente: 'matcha', costo: 60, variante: 'matcha' },
        ],
      },
    ],
    price: 250,
    varianti: ['fragola', 'melone', 'matcha'],
  },
  // 3 tocchi: impasto, ripieno (uno dei due), [8 s], prendi. 70 Yen di Ingredienti su 200. Si brucia 4 s dopo essere pronto.
  taiyaki: {
    ricetta: [
      { ingrediente: 'impasto', costo: 30 },
      {
        unoDi: [
          { ingrediente: 'fagioli', costo: 40, variante: 'fagioli' },
          { ingrediente: 'crema', costo: 40, variante: 'crema' },
        ],
      },
      { cotturaSec: 8 },
    ],
    burnAfterSec: 4,
    price: 200,
    varianti: ['fagioli', 'crema'],
  },
  // 4 tocchi: noodles, brodo, [6 s], uovo o naruto (dopo la cottura, come la salsa del takoyaki), prendi. 200 Yen di
  // Ingredienti su 600. Si brucia 5 s dopo essere pronto.
  ramen: {
    ricetta: [
      { ingrediente: 'noodles', costo: 70 },
      { ingrediente: 'brodo', costo: 80 },
      { cotturaSec: 6 },
      {
        unoDi: [
          { ingrediente: 'uovo', costo: 50, variante: 'uovo' },
          { ingrediente: 'naruto', costo: 50, variante: 'naruto' },
        ],
      },
    ],
    burnAfterSec: 5,
    price: 600,
    varianti: ['uovo', 'naruto'],
  },
};

// Lo Yatai in verticale (src/layout/yatai.js). Le misure sono in pixel di gioco (VIEW): i valori
// di partenza si regolano qui e il resto si ricalcola.
export const YATAI = {
  // Il margine ai lati e in fondo, oltre all'area sicura del telefono.
  margine: 24,
  // Le fasce dall'alto in basso. `min` è l'altezza minima; se lo schermo è più alto, l'avanzo si
  // divide tra le fasce in proporzione a `flex` (0 = non cresce). La fascia `hud` per ora è vuota:
  // ci andranno l'Incasso, il tempo e le stelle (passo 3).
  fasce: [
    { nome: 'hud', min: 96, flex: 0 },
    { nome: 'clienti', min: 320, flex: 1.2 },
    { nome: 'bancone', min: 200, flex: 0 },
    { nome: 'cucina', min: 320, flex: 1 },
    { nome: 'postazioni', min: 200, flex: 0.5 },
  ],
  // I Posti: 3 all'inizio, 4 con il Potenziamento. Lo spazio c'è già per tutti e 4.
  posti: { iniziali: 3, massimo: 4, larghezzaMax: 190 },
  // Le Scorte quando la fila (Scorte e Postazioni insieme) ha più di `postazioni.massimo` voci, cioè dall'Hanabi
  // (9 Scorte e 3 Postazioni): in una fila sola ogni voce sarebbe larga 25 px a 360×640, e le dita ne vogliono 44.
  // Allora le Scorte escono dalla fila e stanno sugli scaffali ai lati di Maurizio, nello spazio vuoto della fascia
  // della cucina, mentre le Postazioni restano da sole vicino al pollice. (Provato anche in file sopra le
  // Postazioni, ticket 07 passo 3: toglieva altezza ai Clienti e a Maurizio e accalcava le icone della Ricetta.)
  // Su ogni lato ci sono `colonne` colonne e tante righe quante servono, dall'alto; `centro` è la larghezza lasciata
  // a Maurizio; la cella è alta quanto larga per `proporzione` ma non più di `cellaMax` di larghezza; il lato destro
  // lascia `riservaCestino` in basso al cestino, quindi lì stanno meno righe. `rigaMin` è l'altezza sotto cui una
  // riga non scende quando si contano quante ne entrano (44 px CSS da 375 px di larghezza in su, 42 a 360: a 360×640 le
  // righe sono comunque da 91), `cellaMin` è la larghezza di una cella quando le colonne sono 3 (44 px CSS a 360). Con 2 colonne e il cestino stanno 12 Scorte a 360×640 (8 a sinistra e 4 a
  // destra; con 9, come nell'Hanabi, 5 e 4). Con 13 Scorte o più (ticket 08: con il taiyaki sono 12 + il ramen che ne
  // aggiunge 4 = 16) a sinistra si aggiunge una terza colonna, le celle larghe `cellaMin` e Maurizio ha il resto: a 360×640
  // 3 colonne a sinistra (4 righe) e 2 a destra (2 righe) fanno 16 Scorte, e a Maurizio restano 232 px invece di 280.
  scorte: {
    colonne: 2,
    centro: 280,
    proporzione: 1.1,
    cellaMax: 120,
    riservaCestino: 130,
    rigaMin: 84,
    cellaMin: 88,
  },
  // Le Postazioni: una per Piatto, in fila vicino al pollice. `altezzaEtichetta` è lo spazio per il nome;
  // `barraDallaCima` e `piattoDallaCima` dicono a che altezza dalla cima del disegno stanno la barra della
  // cottura e il Piatto pronto (la base dell'icona), in pixel del disegno. La barra della cottura sta sopra le
  // icone della Ricetta (che occupano da 2 a 66 px dalla cima, RISCONTRI.passo): quindi è negativa. Anche
  // `barraBruciaDallaCima`, la barra che scende prima che il Piatto si bruci, è negativa, perché sta sopra il
  // Piatto pronto. `puntoDalCentro` è dove sta il "!" dell'allarme rispetto al Piatto, a destra e in alto.
  //
  // `massimo` è quante voci può avere la fila (Scorte e Postazioni insieme: nel Tanabata riso, alga, pastella,
  // polpo, salsa, tagliere e piastra sono 7). `capacitaBase` è la larghezza di partenza: finché le voci sono
  // meno, ognuna resta larga come se fossero 5 (così l'Hanami non cambia); oltre, si stringono per starci tutte.
  postazioni: {
    massimo: 7,
    capacitaBase: 5,
    larghezzaMax: 140,
    spazio: 6,
    altezzaEtichetta: 40,
    barraDallaCima: -14,
    barraBruciaDallaCima: -26,
    piattoDallaCima: 80,
    puntoDalCentro: { x: 58, y: -44 },
  },
  // Quanti Piatti pronti stanno in fila sul Bancone (GAME_SPEC.md non lo dice: valore di partenza).
  // `superficie` è la parte alta del Bancone, il piano su cui si appoggiano i Piatti: 0,66 di 200 px
  // è l'altezza del piano nel disegno (BANCONE_PIANO), per questo la fascia del Bancone non cresce.
  bancone: { capacita: 5, larghezzaMax: 150, superficie: 0.66 },
  // Maurizio sta al centro della fascia `cucina`, senza ingrandirsi oltre il disegno.
  maurizio: { scalaMax: 0.85, riempimento: 0.95 },
  // Il Cliente al suo Posto (placeCliente in src/layout/yatai.js). Dall'alto in basso dentro la fascia
  // del Posto: la nuvoletta con l'Ordine, i cuoricini della Pazienza, il Cliente seduto sullo sgabello.
  //   sedutoDalFondo: quanto sta in alto il punto dove poggiano i piedi, dal fondo della fascia (lo
  //                   sgabello è alto 100 px e il cuscino è a 35 px dal suo bordo alto)
  //   nuvoletta: altezza come frazione della fascia, mai sotto `min`, larghezza al massimo `larghezzaMax`
  //   cuori: misura di ogni cuoricino; `spazio` tra uno e l'altro
  //   vuoto: aria tra un pezzo e l'altro
  cliente: {
    sedutoDalFondo: 68,
    nuvoletta: { altezza: 0.24, min: 64, larghezzaMax: 176 },
    cuori: { lato: 30, spazio: 2 },
    vuoto: 6,
  },
  // La fascia in alto durante la Serata: l'Incasso e il tempo sopra, la barra delle stelle sotto.
  hud: { rigaAlta: 52, barra: 20, stella: 34, moneta: 40 },
  // Il cestino per i Piatti bruciati: nella fascia della cucina, a destra di Maurizio, appoggiato in basso.
  // `dalBordo` è la distanza del suo centro dal margine destro, `dalFondo` quanto sta sopra il fondo della
  // fascia, `larghezza` quanto è largo sullo schermo (il disegno si adatta).
  cestino: { dalBordo: 62, dalFondo: 18, larghezza: 84 },
};

// Maurizio si anima a ogni azione (le azioni sono istantanee, questa è solo scena): un saltino
// con schiacciamento e una posa che poi torna a riposo. I tempi sono in millisecondi.
export const MAURIZIO = {
  // Il respiro quando non fa niente.
  respiro: { ampiezza: 0.014, durata: 2400 },
  // posa: quale disegno di Maurizio durante l'azione; salto: di quanti pixel sale; schiaccia: di
  // quanto si allunga e si schiaccia; durata: l'andata (il ritorno dura uguale); tienePosa: quanto
  // resta nella posa prima di tornare a riposo.
  azioni: {
    cuoci: { posa: 'lavora', salto: 12, schiaccia: 0.05, durata: 120, tienePosa: 320 },
    raccogli: { posa: 'lavora', salto: 16, schiaccia: 0.06, durata: 130, tienePosa: 360 },
    servi: { posa: 'evviva', salto: 30, schiaccia: 0.09, durata: 170, tienePosa: 560 },
  },
};

// --- La logica della Serata (src/serata/Serata.js) ---

// Il motore avanza a passi fissi: lo stesso seme e le stesse azioni danno sempre la stessa Serata,
// qualunque sia la durata dei singoli update().
export const SERATA_MOTORE = {
  passoMs: 10,
};

// Quanto vale la prima Serata (onigiri). L'obiettivo è l'Incasso netto (Vendite meno Spesa) in Yen; con
// le soglie di SERATA diventa 1920 per ★, 2496 per ★★, 3072 per ★★★. Dal passo 8 ogni Serata avrà il suo.
// Ogni onigiri sono 3 tocchi e 30 Yen di Spesa. Con le Ondate (ONDATE) e prima della Serie, un tocco ogni
// 1,4 s (lento) fa circa 2035 Yen netti, ogni 1,0 s (attento) circa 2937, ogni 0,6 s (rapido) circa 4302
// (media di 6 semi, ticket 34): provvisorio fino al ticket 29.
export const SERATA_PRIMA = {
  obiettivo: 1920,
  piatti: ['onigiri'],
  // Quanti Piatti ha un Ordine (da uno a tre; nell'Hanami è sempre uno).
  piattiPerOrdine: { min: 1, max: 1 },
};

// La Serata del Tanabata (passi 4 e 4-bis): arriva il takoyaki, il primo Piatto che si brucia e il primo con la
// cottura a metà della Ricetta, e con lui gli Ordini da 2 Piatti (GAME_SPEC.md, tabella dei Matsuri). Il menù
// è quello dell'Hanami più il Piatto nuovo.
//
// Obiettivo provvisorio fino al ticket 29, sul netto (Vendite meno Spesa). Il bot senza browser
// (test/bruciatura.test.js) non sbaglia mai una mossa; la bravura è il tempo tra un tocco e l'altro (come
// BRAVURA in test/serata.test.js). Media di 6 semi, Incasso netto, dopo il ticket 37 (takoyaki a tocchi,
// 100 Yen di Ingredienti):
//   un tocco ogni 1,4 s (lento)    2565 Yen (da 2130 a 2870)    ★
//   un tocco ogni 1,0 s (attento)  3652 Yen (da 3350 a 4010)    ★★
//   un tocco ogni 0,6 s (rapido)   5927 Yen (da 5560 a 6300)    ★★★
//   un tocco ogni 0,3 s            circa 7900 Yen
// Con obiettivo 2400 le soglie sono ★ 2400, ★★ 3120, ★★★ 3840: il lento ha ★ con il 7% di margine, l'attento ★★
// con il 5% di margine verso ★★★. Chi dimentica un takoyaki lo brucia e perde 100 Yen di Spesa più la vendita.
// Prima del 37 (takoyaki con un solo tocco, senza Spesa) l'obiettivo era 3200 sulle Vendite: il bot attento
// faceva 6450–7530 e arrivava a ★★★ senza sforzo, perché cucinare il takoyaki costava un tocco.
export const SERATA_TANABATA = {
  obiettivo: 2400,
  piatti: ['onigiri', 'takoyaki'],
  piattiPerOrdine: { min: 1, max: 2 },
};

// La Serata dell'Hanabi (ticket 07): arriva il kakigōri, il Piatto con le varianti (fragola, melone, matcha) che non
// si brucia mai. Il menù è quello del Tanabata più il Piatto nuovo; con le formiche e il resto dell'Hanabi
// (ticket 11 e 14) arriveranno dopo.
//
// Obiettivo provvisorio fino al ticket 29, sul netto (Vendite meno Spesa), misurato col bot senza browser
// (test/bot.js: non sbaglia una mossa, la bravura è il tempo tra un tocco e l'altro). Media di 6 semi, con le ondate:
//   un tocco ogni 1,4 s (lento)    3111 Yen (da 2720 a 3695)   serviti 12,8
//   un tocco ogni 1,0 s (attento)  4888 Yen (da 3840 a 5825)   serviti 17,7
//   un tocco ogni 0,6 s (rapido)   7004 Yen (da 6235 a 8690)   serviti 22,7
// Nessun Piatto bruciato (il bot li prende in tempo). Con obiettivo 2900 le soglie sono ★ 2900, ★★ 3770, ★★★ 4640:
// il lento ha ★ con il 7% di margine e il rapido ★★★. L'attento, che non sbaglia mai, prende ★★★ (come nell'Hanami,
// ticket 34): un attento umano che sbaglia qualche mossa sta più in basso.
export const SERATA_HANABI = {
  obiettivo: 2900,
  piatti: ['onigiri', 'takoyaki', 'kakigori'],
  piattiPerOrdine: { min: 1, max: 2 },
};

// La Serata dell'Aki Matsuri (ticket 08): arriva il taiyaki, con i due ripieni (fagioli rossi, crema), che si brucia.
// Il menù è quello dell'Hanabi più il Piatto nuovo; i corvi e il corteo del mikoshi arriveranno dopo (ticket 11 e 15).
// Obiettivo provvisorio fino al ticket 29, sul netto, misurato col bot senza browser (test/bot.js, media di 24 semi, con le
// ondate; il bot non sbaglia mai una mossa, la bravura è il tempo tra un tocco e l'altro):
//   un tocco ogni 1,4 s (lento)    3235 Yen (da 2510 a 3800)   serviti 12,8
//   un tocco ogni 1,0 s (attento)  4525 Yen (da 2375 a 5535)   serviti 16,3
//   un tocco ogni 0,6 s (rapido)   6958 Yen (da 4685 a 8140)   serviti 23,0
// Con obiettivo 3000 le soglie sono ★ 3000, ★★ 3900, ★★★ 4800: il lento ha ★ con l'8% di margine, l'attento ★★ (la
// media sta sotto ★★★) e il rapido ★★★. Il taiyaki cuoce 8 s, il più lungo: chi lo dimentica lo brucia (70 Yen di Spreco).
export const SERATA_AKI = {
  obiettivo: 3000,
  piatti: ['onigiri', 'takoyaki', 'kakigori', 'taiyaki'],
  piattiPerOrdine: { min: 1, max: 2 },
};

// La Serata dello Yuki Matsuri (ticket 08): arriva il ramen, il Piatto da 4 tocchi, e con lui gli Ordini da 3 Piatti
// (GAME_SPEC.md, tabella dei Matsuri). Ha tutti e 5 i Piatti, quindi tutte le Postazioni e tutte le Scorte (16).
//
// Gli Ordini sono da 1 o 2 Piatti, e il 15% (`tre`) da 3: è la modalità difficile dello Yuki. Con 3 Piatti per Ordine in un
// Ordine su tre la Serata non regge (il ramen da 4 tocchi e 6 s di cottura, con la Pazienza di 15 s nelle ondate, non si fa
// in tempo per un Ordine da 12 tocchi: il bot rapido incassa meno che nell'Aki, 5 Piatti bruciati a Serata e 1250 Yen di
// Spreco, fino a −365), e una Pazienza più lunga per ogni Piatto in più non aiuta (i Posti restano pieni). Con il 15%
// (a 25% iniziano le Serate in rosso) la Serata regge ed è più dura.
// Misurato col bot (media di 24 semi, con le ondate), obiettivo provvisorio fino al ticket 29:
//   un tocco ogni 1,4 s (lento)    3244 Yen (da 1583 a 5177)   serviti 10,3 (da 3 Piatti 0,4), 1,0 bruciati
//   un tocco ogni 1,0 s (attento)  4342 Yen (da 1334 a 6947)   serviti 12,8 (da 3 Piatti 0,9), 2,3 bruciati
//   un tocco ogni 0,6 s (rapido)   7527 Yen (da 2166 a 11074)  serviti 18,0 (da 3 Piatti 1,7), 2,1 bruciati
// Senza Ordini da 3 (tre: 0) erano 3297, 5701 e 9072, e l'attento prendeva ★★★ senza sforzo. Con obiettivo 3000 le soglie sono
// ★ 3000, ★★ 3900, ★★★ 4800: il lento ha ★ con l'8% di margine (con un'oscillazione grande: il ramen costa 200 Yen e lo Spreco
// pesa), l'attento ★★ e il rapido ★★★.
export const SERATA_YUKI = {
  obiettivo: 3000,
  piatti: ['onigiri', 'takoyaki', 'kakigori', 'taiyaki', 'ramen'],
  piattiPerOrdine: { min: 1, max: 2, tre: 0.15 },
};

// Come è fatta la Serata di ogni Matsuri. Dal passo 8 ogni Serata avrà la sua; per ora ne ha una il
// Matsuri, e chi manca gioca quella dell'Hanami.
export const SERATE = {
  hanami: SERATA_PRIMA,
  tanabata: SERATA_TANABATA,
  hanabi: SERATA_HANABI,
  aki: SERATA_AKI,
  yuki: SERATA_YUKI,
};

// --- La scena della Serata (src/scenes/SerataScene.js): comandi e riscontri ---
// I tempi sono in millisecondi, le distanze in pixel di gioco.

export const COMANDI = {
  // I tasti rapidi (GAME_SPEC.md, "Comandi e accessibilità"): i numeri per la fila vicino al pollice (da sinistra,
  // Scorte e Postazioni insieme: sono 7 nel Tanabata, quindi 1–7), Q/W/E/R per i Posti. Sono codici fisici
  // (KeyboardEvent.code): restano nello stesso punto su ogni tastiera. I tasti definitivi per le Scorte li decide
  // il ticket 26.
  postazioni: ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7'],
  posti: ['KeyQ', 'KeyW', 'KeyE', 'KeyR'],
  // Anche il tastierino numerico fa la fila.
  postazioniTastierino: ['Numpad1', 'Numpad2', 'Numpad3', 'Numpad4', 'Numpad5', 'Numpad6', 'Numpad7'],
  rigioca: ['Enter', 'Space'],
};

export const RISCONTRI = {
  // Un frame lungo (scheda in secondo piano, telefono lento) non fa saltare mezza Serata: la
  // scena non fa avanzare la logica di più di così per frame.
  dtMaxMs: 250,
  // Il Cliente arriva con un saltino, e se ne va in meno di POSTI.ricambioSec: il Posto resta
  // libero abbastanza a lungo da vedere l'uscita (un test lo controlla).
  arrivo: { durata: 340 },
  uscita: { servito: 620, imbronciato: 760, spostamento: 90 },
  // La testa che scuote: `volte` andata e ritorno di `angolo` gradi, ognuno di `durata`.
  scuoteTesta: { angolo: 9, durata: 70, volte: 3 },
  // Il Piatto che vola dal Bancone al Cliente e dalla Postazione al Bancone.
  piatto: { vola: 230 },
  // Le monete volano dal Cliente all'Incasso: una ogni `scaglione` Yen, da 1 a `max`.
  monete: { durata: 560, scaglione: 50, max: 6, ritardo: 70 },
  // I cuoricini della Mancia: tanti quanti i cuoricini di Pazienza rimasti.
  mancia: { durata: 900, salita: 90 },
  // La scritta "+150" che sale dal Cliente.
  somma: { durata: 950, salita: 80 },
  // Il Piatto pronto sulla Postazione, che ondeggia perché lo si tocchi.
  pronto: { durata: 420, ampiezza: 8 },
  // L'ultimo cuoricino lampeggia: manca poco.
  ultimoCuore: { durata: 260 },
  // Il Lamento (GAME_SPEC.md, "Clienti"). Quando la faccia cambia il peluche fa un "pop" (si schiaccia
  // e torna a riposo, `schiaccia` è la frazione di scala, `durata` in ms). Il segno entra con un rimbalzo
  // (`entra`) e poi si muove piano e in loop: la goccia scende un po' (`discesa`, in pixel del disegno
  // del Cliente) e lo sbuffo si gonfia e si sposta (`spinta` in pixel, `gonfia` come scala). Il loop dura
  // `durata` ms per andata. Tutto parte da ClienteView.animaSegno(): con "riduci movimento" (ticket 26)
  // si spegne quello e il segno resta fermo.
  lamento: {
    // Quanto è grande il segno rispetto al suo disegno: a 360 px di larghezza deve leggersi.
    segnoScala: 1.6,
    pop: { schiaccia: 0.09, durata: 220 },
    entra: 260,
    goccia: { discesa: 7, durata: 780 },
    sbuffo: { spinta: 5, gonfia: 0.14, durata: 560 },
  },
  // Il segnale prima di un'ondata (ticket 34), che parte da 'ondataInArrivo' (ONDATE.avvisoSec prima). Senza testo.
  // Maurizio alza la testa (posa `guarda`) finché manca all'ondata, più `codaMs` perché non scatti via appena
  // arrivano i primi Clienti; se intanto lavora o serve la posa dell'azione ha la precedenza e poi torna `guarda`.
  // La campanella dello Yatai pende dalla tendina del Bancone, a `dalBordo` pixel dal bordo sinistro del Bancone, larga
  // `larghezza` pixel di gioco, e oscilla: `oscillazioni` andate e ritorno che si smorzano da `ampiezza` gradi a zero
  // in `durata` ms. Con "riduci movimento" (ticket 26) l'oscillazione si spegne (SerataScene.oscillaCampanella è l'unico
  // punto) e il segnale resta la posa di Maurizio.
  segnaleOndata: {
    codaMs: 600,
    campanella: { larghezza: 56, dalBordo: 64, sottoTendina: 192, oscillazioni: 6, ampiezza: 24, durata: 1900 },
  },
  // I riscontri della Serie (ticket 34, passo 4), senza testo. Il numero "×N" sta a destra di Maurizio, a mezza altezza
  // (scelta di Giuseppe): `posizione` sono frazioni della fascia della cucina, da sinistra e dall'alto. Compare dalla Serie
  // `daSerie` (il primo Ordine di fila non ha bonus) e a ogni Ordine servito fa un pop (`pop.scala` volte la sua misura,
  // che torna in `pop.durata` ms; `pop.scalaTetto` la prima volta che la Mancia della Serie arriva al massimo). Il corpo del
  // testo (pixel di gioco) cresce da `corpo.base` a `corpo.alTetto` in proporzione a quanto la Mancia della Serie è vicina
  // al suo tetto (SERIE.moltiplicatoreMax). È giallo come la scritta "+150" (`colore`); al tetto le lettere prendono le cinque
  // bande dell'arcobaleno della palette (come sulla salopette di Maurizio), dall'alto in basso, tra `arcobaleno.da` e
  // `arcobaleno.a` (frazioni dell'altezza del testo, per far cadere le bande sulle cifre e non sull'aria sopra e sotto).
  // Quando la Serie si spezza il numero si gonfia e svanisce in `pof.numero.durata` ms e una nuvoletta morbida (il "pof",
  // larga `pof.dimensione` pixel) si apre e svanisce in `pof.durata`: niente rosso, niente scossa.
  // Le monete sono più generose: fino a `moneteExtra` monete in più in ogni pagamento (in proporzione alla Serie) e la
  // scritta "+150" fino a `sommaAlTetto` volte più grande. Tutti i movimenti della Serie si spengono con "riduci movimento"
  // (ticket 26) in un punto solo, SerataScene.animaSerie(); il tintinnio che sale è del ticket 23.
  serie: {
    daSerie: 2,
    posizione: { x: 0.82, y: 0.5 },
    corpo: { base: 46, alTetto: 78 },
    contorno: 9,
    colore: '#f7d26a',
    arcobaleno: { da: 0.2, a: 0.85 },
    entra: { da: 0.3, durata: 260 },
    pop: { scala: 1.35, scalaTetto: 1.7, durata: 240 },
    pof: { dimensione: 150, scalaDa: 0.4, scalaA: 1.1, durata: 480, numero: { scala: 1.45, durata: 200 } },
    moneteExtra: 3,
    sommaAlTetto: 1.3,
  },
  // Il "−20" piccolo che scende sotto l'Incasso a ogni Ingrediente (la Spesa).
  spesa: { durata: 750, discesa: 34 },
  // La ricetta sulla Postazione: un'icona per Ingrediente (la cottura non ha icona: ha la sua barra), piccola
  // (frazione del disegno della Postazione), `spazio` pixel dell'una dall'altra e `altezza` pixel dalla cima del
  // disegno alla base dell'icona (misure del disegno, non dello schermo). Se le icone sono tante e non ci stanno,
  // si avvicinano: la fila non occupa mai più di `larghezzaFila` volte la larghezza della Postazione, così non
  // finisce sopra la voce accanto. Spenta (`passoSpento`) finché l'Ingrediente non è nel Piatto.
  passo: { scala: 0.42, spazio: 62, altezza: 66, larghezzaFila: 0.96 },
  passoSpento: 0.28,
  // L'alone giallo dietro la Scorta che aspetta il Piatto (il prossimo Ingrediente): `durata` del
  // respiro, misure come frazione della larghezza della Scorta, `dallaCima` in pixel del disegno.
  evidenzia: { durata: 520, larghezza: 1.05, altezza: 0.85, dallaCima: 100 },
  // L'Ingrediente che vola dalla Scorta al tagliere.
  ingrediente: { vola: 200 },
  // Il Piatto pronto che si brucia (takoyaki): scurisce piano piano fino alla `tinta` e, negli ultimi
  // BRUCIATURA.avvisoSec secondi, trema forte (`angolo` gradi ogni `tremaMs`) mentre la barra lampeggia
  // (un lampeggio ogni `lampeggioMs`).
  brucia: { tinta: 0xa86f48, tremaMs: 65, angolo: 9, lampeggioMs: 170, colori: { pieno: 0x93d69a, meta: 0xf5dc72, poco: 0xe8706a } },
  // Il Piatto bruciato sulla Postazione: lo scoppio di nuvolette quando si brucia (`nuvolette`, `salita` in
  // pixel), l'icona che appare schiacciata e il tremolio mentre aspetta il tocco.
  bruciato: { durata: 640, nuvolette: 4, salita: 120, appare: 260, tremolio: { angolo: 3, durata: 150 } },
  // Il Piatto bruciato che vola nel cestino, e il cestino che sobbalza quando lo prende.
  cestino: { volo: 440, giro: 300, sobbalzo: 220 },
  // Il Fumo sulla Postazione: le nuvole entrano, ondeggiano e nell'ultimo quarto di FUMO_SEC svaniscono
  // (`svanisce`, frazione del Fumo). `sbuffo` è lo scuotimento se si tocca la Postazione nel Fumo.
  fumo: { entra: 380, ondeggia: 900, svanisce: 0.25, sbuffo: 240 },
  // I fili di fumo che salgono da un Piatto che brucia: durata di un giro e quanto salgono.
  fili: { durata: 1100, salita: 78 },
  // I secondi finali, in cui il tempo diventa rosso.
  tempoRosso: 10,
  // La schermata di fine Serata arriva dopo che le monete sono arrivate; poi le stelle una a una.
  fine: { ritardo: 1200, stella: 420, conta: 900 },
};

export const POSTI = {
  quanti: 3,
  // Dopo che un Cliente se n'è andato il Posto resta libero per un attimo, così la scena ha il tempo
  // di mostrare la partenza prima che ne arrivi un altro.
  ricambioSec: 1,
};

export const CLIENTI = {
  // Il primo Cliente arriva presto, i successivi secondo la fase della Serata (ONDATE). Se i Posti sono
  // pieni il prossimo aspetta che se ne liberi uno.
  primoArrivoSec: 1.5,
  // I Clienti di passaggio: nessun Vizio.
  passaggio: ['tanuki', 'kitsune', 'maneki-neko'],
};

// Le Ondate (GAME_SPEC.md, "La Serata"; ticket 34): la Serata ha un andamento invece di un solo intervallo di
// arrivo. Una curva comune a tutti i Matsuri, in quattro fasi nell'ordine in cui accadono; le curve per Serata
// sono del ticket 12 e del 29. Valori di partenza.
//   daSec        quando comincia la fase (la prima a 0). Il seme sposta gli inizi delle altre di al più `scostoSec`
//   arrivoSec    l'intervallo tra un arrivo e il successivo, scelto quando arriva un Cliente (la fase di quel momento)
//   ondata       la fase è un'ondata: i Clienti che arrivano hanno `pazienzaSec` invece di PAZIENZA.durationSec e la
//                tengono anche se l'ondata finisce mentre aspettano
//   avvisoSec    quanto prima di un'ondata (anche la finale) un segnale visivo la annuncia
// Ritmo a tocchi (ticket 33): un onigiri sono 3 tocchi più quello per servire, e un Cliente costa più di prima.
export const ONDATE = {
  scostoSec: 5,
  avvisoSec: 2,
  pazienzaSec: 15,
  fasi: [
    { nome: 'calma', daSec: 0, arrivoSec: { min: 3.5, max: 5 }, ondata: false },
    { nome: 'ondata', daSec: 30, arrivoSec: { min: 1.2, max: 2.2 }, ondata: true },
    { nome: 'respiro', daSec: 55, arrivoSec: { min: 4, max: 6 }, ondata: false },
    { nome: 'finale', daSec: 80, arrivoSec: { min: 1.0, max: 2.0 }, ondata: true },
  ],
};

export const BANCONE = {
  // Quanti Piatti pronti stanno sul Bancone. Se è pieno, il Piatto resta sulla Postazione. Sono
  // quanti ne mostra lo schermo (YATAI.bancone.capacita): un numero solo, così la logica e il
  // disegno non possono più discordare.
  capienza: YATAI.bancone.capacita,
};

// Le Postazioni: l'id è quello che si tocca; piatto è il Piatto che preparano.
// Nell'ordine in cui si sbloccano i Piatti (PIATTI): le Postazioni della Serata seguono questo ordine.
export const POSTAZIONI = {
  tagliere: { piatto: 'onigiri' },
  piastra: { piatto: 'takoyaki' },
  macchina: { piatto: 'kakigori' },
  stampo: { piatto: 'taiyaki' },
  pentola: { piatto: 'ramen' },
};

// Le Scorte (GLOSSARY.md) non hanno numeri propri: sono una per Ingrediente di ogni ricetta (PIATTI),
// nell'ordine della ricetta, a sinistra delle Postazioni, così riso, alga, tagliere si leggono come la
// sequenza. L'id di una Scorta è il nome dell'Ingrediente.

// --- I temi dei Matsuri (src/disegni/sfondi/, src/layout/sfondo.js) ---

// I colori di ogni Matsuri, per ruolo. Ogni colore ha la sua ombra e la sua luce, come in PALETTE.
// Cambiano solo lo sfondo, il pavimento, la tendina del Bancone e i cuscini dei Posti: le
// Postazioni, i Piatti e Maurizio hanno sempre i loro colori, e devono staccarsi da ogni tema.
//   cielo        dal basso (luce, vicino all'orizzonte) all'alto (ombra)
//   lontananza   le sagome lontane sull'orizzonte: colline, castello, bancarelle, santuario
//   terra        il suolo dietro i Posti (prato, riva del fiume, neve): poco contrasto
//   pavimento    il legno dello Yatai
//   tendina      le due strisce davanti al Bancone
//   cuscino      il cuscino dei Posti
//   accento      il colore dei particolari (petali, lanterne, foglie...)
//   carta        il tono con cui si colora la carta sotto a tutto (bianco = carta com'è)
const colore = (c, o, l) => ({ colore: c, ombra: o, luce: l });

export const TEMI = {
  // Primavera, giorno: azzurro pallido, rosa ciliegio, bianco e verde tenero.
  hanami: {
    cielo: colore('#b9e1f4', '#8cc6ea', '#e9f6fb'),
    lontananza: colore('#d9e2ec', '#b3c3d6', '#f1f5f9'),
    terra: colore('#bfe6a4', '#93c97b', '#e2f6cb'),
    pavimento: colore('#f0d2b0', '#cfa57d', '#fbe9d6'),
    tendina: [colore('#f7a8c4', '#d9708f', '#fde0ea'), colore('#fffdf8', '#cdbfa9', '#ffffff')],
    cuscino: colore('#f7a8c4', '#d9708f', '#fde0ea'),
    accento: colore('#f9c4d6', '#e58db1', '#fde9f0'),
    carta: '#ffffff',
  },
  // Inizio estate, crepuscolo: indaco e blu notte morbido, con le stelle gialle.
  tanabata: {
    cielo: colore('#4b4fa0', '#2c2f72', '#a99ad8'),
    lontananza: colore('#4a4a96', '#383a80', '#6e6bb4'),
    terra: colore('#3d4a8f', '#2c386f', '#5a6aae'),
    pavimento: colore('#dfc3ae', '#bc9a83', '#f1e1d3'),
    tendina: [colore('#7fa6ee', '#5278c8', '#bcd2f8'), colore('#fbefc0', '#d9c37c', '#fff9e0')],
    cuscino: colore('#b3a2ea', '#8a76cc', '#dcd2f7'),
    accento: colore('#fbe28a', '#e0b94e', '#fff3c4'),
    carta: '#b8bde8',
  },
  // Piena estate, notte: blu e viola, il fiume e i fuochi in pastelli vari.
  hanabi: {
    cielo: colore('#2c2a6e', '#1a1c4b', '#5a3f91'),
    lontananza: colore('#3b2f78', '#2a2260', '#5a4a9a'),
    terra: colore('#2e3f86', '#1f2c68', '#4d63b0'),
    pavimento: colore('#dcb396', '#c39c84', '#f0d6c2'),
    tendina: [colore('#a897e8', '#7f6dc8', '#d3c9f6'), colore('#f7b9d8', '#d980ab', '#fcdfee')],
    cuscino: colore('#8fb6f0', '#5f86c8', '#c6daf9'),
    accento: colore('#f7d26a', '#d1a33a', '#fdedb8'),
    carta: '#9aa0d8',
  },
  // Autunno, tramonto: ocra, arancio, rosso mattone e verde bosco.
  aki: {
    cielo: colore('#f5b27b', '#e2825a', '#fce1a8'),
    lontananza: colore('#9fb08a', '#7f9770', '#c4d1ac'),
    terra: colore('#b9c07c', '#98a25c', '#d9deac'),
    pavimento: colore('#e8c08a', '#c99a5f', '#f6dcb4'),
    tendina: [colore('#e4875e', '#c0603c', '#f2b496'), colore('#f5dcae', '#d1b27a', '#fdf0d4')],
    cuscino: colore('#e4875e', '#c0603c', '#f2b496'),
    accento: colore('#d9593f', '#a93a28', '#ee8f78'),
    carta: '#fff0d8',
  },
  // Inverno, sera: azzurro ghiaccio, bianco e blu profondo, con i lampioni caldi.
  yuki: {
    cielo: colore('#5b7cc0', '#33498f', '#b8d4f2'),
    lontananza: colore('#d6e4f5', '#aac2e2', '#f2f8ff'),
    terra: colore('#cfe0f3', '#a2bde0', '#f4f9ff'),
    pavimento: colore('#e6cfb4', '#bda486', '#f5e8d6'),
    tendina: [colore('#5e8fd6', '#3d68b0', '#a5c3ee'), colore('#fffdf8', '#cdbfa9', '#ffffff')],
    cuscino: colore('#8fb8ea', '#5f8ac4', '#c8dcf6'),
    accento: colore('#f9c66a', '#d99a3a', '#fde6a8'),
    carta: '#dfe9fb',
  },
};

// I ruoli che ogni tema deve avere (un test lo controlla). `tendina` ne ha due, `carta` è un solo colore.
export const RUOLI_TEMA = ['cielo', 'lontananza', 'terra', 'pavimento', 'tendina', 'cuscino', 'accento', 'carta'];
export const MATSURI = Object.keys(TEMI);
export const MATSURI_PREDEFINITO = 'hanami';

// Il nome di ogni Postazione sotto il Bancone: testo scuro con il bordo chiaro, su ogni tema.
export const ETICHETTA = { testo: PALETTE.inchiostro, contorno: PALETTE.bianco };

// Come lo sfondo si ancora al layout dello Yatai (src/layout/sfondo.js). Le misure sono in pixel di
// gioco. Lo sfondo ha quattro pezzi, tutti disegnati più grandi del necessario e ancorati così:
//   cielo   sta sopra l'orizzonte (l'estremità in alto sparisce fuori schermo);
//   terra   scende dall'orizzonte fino dietro il pavimento;
//   alto    appeso al bordo in alto dello schermo (rami, lanterne, festoni);
//   lati    due colonne ai bordi, poggiate dietro il Bancone (alberi, bambù, lampioni).
export const SFONDO = {
  // L'orizzonte cade a questa quota della fascia `clienti` (0 in cima, 1 in fondo).
  orizzonte: 0.5,
  // Il pavimento comincia questi pixel sotto la cima del Bancone (dove inizia la tendina).
  attaccoPavimento: 120,
  // Le texture: `sotto` è quanto scende oltre l'orizzonte, nascosto dalla terra.
  cielo: { h: 560, sotto: 48 },
  terra: { h: 480 },
  alto: { h: 260 },
  lato: { w: 190, h: 920, sotto: 44 },
};
