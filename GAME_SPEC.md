# Maurizio Yatai – La bancarella del Matsuri

マウリツィオの屋台 (con la lettura やたい) · un gioco della serie "I giochi di Maurizio" · un regalo di Giuseppe

Maurizio gestisce uno **Yatai** nei cinque **Matsuri** dell'anno. I peluche del cast arrivano ai **Posti** e fanno un **Ordine**. Il giocatore cucina e serve toccando **Scorte**, **Postazioni**, **Bancone** e **Clienti** prima che finisca la loro **Pazienza**.

I termini in grassetto sono definiti in [GLOSSARY.md](./GLOSSARY.md). Le idee rimandate sono in [BACKLOG.md](./BACKLOG.md). I fatti culturali e i testi del Ricettario, con le fonti, sono in [docs/ricerca/piatti-e-matsuri.md](./docs/ricerca/piatti-e-matsuri.md). Tutti i numeri qui sotto sono **valori di partenza** e si regolano in un unico file di configurazione.

## Piattaforma e stile
- **Browser, verticale e mobile-first.** Su computer è una colonna centrata (come FarmPlush) e si gioca con il mouse.
- **Phaser 4.2 + Vite** ([ADR-0002](./docs/adr/0002-phaser-4-invece-di-phaser-3.md)). Si installa come app ed è giocabile offline. Deve funzionare con le regole di sicurezza (CSP) del sito: niente script o stili inline, niente risorse da altri siti.
- **Grafica e audio generati dal codice** ([ADR-0001](./docs/adr/0001-gioco-autonomo-senza-file-di-grafica-e-audio.md)):
  - grafica: tratto a matita tremolante, carta ruvida, colori pastello kawaii;
  - audio: musica sulla scala pentatonica giapponese, con una variante per Matsuri, più gli effetti (sfrigolio, campanella, monete).
- **Lingue**: italiano, inglese e giapponese, scelte in base alla lingua del dispositivo, con un selettore. I testi giapponesi vanno fatti rileggere a un madrelingua.
- **Font**: Klee One SemiBold per tutte e tre le lingue (licenza SIL OFL 1.1: `OFL.txt` va consegnato insieme al font). Il file contiene solo i caratteri usati nei testi, circa 60–80 KB. Come ridurlo e caricarlo è spiegato nella [ricerca sui font](./docs/ricerca/font-giapponese.md); se alla revisione di stile il latino sembra troppo lontano dalla suite, si usa Comic Neue per italiano e inglese.
- Progressi salvati sul dispositivo. Niente login, pubblicità o tracciamenti. Pensato per tutte le età.

## La Serata
- Dura **120 secondi** e non c'è game over a metà.
- L'**Incasso** è il netto: le **Vendite** (prezzo dei Piatti serviti più Mancia) meno la **Spesa** in **Ingredienti**. È l'unico numero in alto durante la Serata: scende un po' (un "−30" piccolo) quando si usa un Ingrediente e sale quando si serve.
- A fine tempo, se l'Incasso raggiunge l'obiettivo si prende ★. Con obiettivo ×1,3 si prende ★★, con obiettivo ×1,6 si prende ★★★.
- **Lo schermo, dall'alto in basso**: i Posti (3, che diventano 4 con un Potenziamento), il Bancone con i Piatti pronti, le Postazioni vicino al pollice. Maurizio sta al centro e si anima a ogni azione, ma le azioni sono istantanee.
- **Come si gioca**:
  1. Si toccano gli Ingredienti dalle **Scorte**, uno dopo l'altro nell'ordine della **Ricetta** del Piatto (onigiri: riso, alga). Ognuno si paga quando lo si tocca.
  2. Se il Piatto ha una cottura (takoyaki, kakigōri, taiyaki, ramen), parte da sola quando ci sono gli Ingredienti di prima; a cottura finita si aggiungono quelli di dopo (la salsa del takoyaki). L'onigiri non ha cottura.
  3. Quando è pronto lo si tocca e passa sul Bancone.
  4. Si tocca il Cliente: è servito se sul Bancone c'è tutto il suo Ordine.
  5. Trascinare al posto di toccare fa la stessa cosa per il Bancone e i Clienti.
  - **La cucina a tocchi** (decisione della mappa `yatai-economia-e-cucina`, ticket 02; prototipo in `.scratch/yatai-economia-e-cucina/assets/`): una regola sola per tutti i Piatti, perché sia facile per un bambino.
    - **Tetto: 4 tocchi per Piatto**, un tocco per Ingrediente più uno per prenderlo (onigiri 3, kakigōri 3, taiyaki 3, takoyaki 4, ramen 4). Un Piatto che richiedesse di più va rivisto prima di entrare.
    - **Ordine sbagliato**: non succede niente. La Scorta trema, non si paga, non c'è Spreco né game over.
    - **Aiuti**: la Ricetta (le icone degli Ingredienti in ordine) sotto la Postazione e il prossimo Ingrediente evidenziato sono sempre visibili, in ogni Serata. Le Ricette non si imparano a memoria né si scoprono: la sequenza mostrata basta.
    - **Varianti** (decisione del 2026-11-03): la variante è l'Ingrediente che distingue il Piatto, e ha una Scorta per ciascuna (sciroppo di fragola, melone, matcha; ripieno di fagioli rossi, crema; uovo, naruto). Si tocca direttamente, senza menu, quindi scegliere la variante non costa tocchi in più. La Ricetta sotto la Postazione mostra l'Ingrediente della variante scelta.
    - **Dove cade la cottura** (stessa decisione), con i tocchi: onigiri riso, alga, prendi (3, senza cottura); kakigōri ghiaccio, [2 s], sciroppo, prendi (3); taiyaki pastella, ripieno, [8 s], prendi (3); takoyaki pastella, polpo, [5 s], salsa, prendi (4); ramen noodles, brodo, [6 s], uovo o naruto, prendi (4).
    - **Costo in tocchi**: con più tocchi per Cliente i Piatti con cottura pesano di più sul giocatore lento; gli arrivi, la Pazienza e gli obiettivi si ricalibrano nel ticket 29.
- **Clienti**: l'Ordine compare nella nuvoletta, fatto di icone. La Pazienza è di 5 cuoricini, circa 25 secondi.
  - La Mancia arriva fino a +50% del prezzo se la Pazienza è piena.
  - Se la Pazienza finisce, il Cliente se ne va imbronciato e non paga.
  - **Lamento** (decisione della mappa `yatai-economia-e-cucina`, ticket 03): mentre la Pazienza scende, la faccia del Cliente cambia con i cuoricini rimasti. Con 5, 4 e 3 è neutra; con 2 è perplessa e compare una goccia di sudore; con 1 è imbronciata e compare uno sbuffo d'aria; da servito è contenta. A ogni scalino c'è un "mmh" breve e morbido, una volta per Cliente. Niente fumetti con parole, quindi niente testi da tradurre.
  - Il Lamento è scocciato ma buffo: guance un po' gonfie, sopracciglia inclinate, bocca a onda, mai occhi rabbiosi, denti o venuzze; l'unica eccezione è il piccolo segno rosso già approvato sull'imbronciata, che resta com'è (decisione del 2026-11-03). Il suono è un borbottio, mai un grido. Lo hanno tutti i Clienti con lo stesso schema, cast compreso; le soglie sono un valore di partenza. Con "riduci movimento" la faccia cambia comunque, mentre goccia e sbuffo restano fermi.
  - Un Piatto sbagliato non si può servire: il Cliente scuote la testa.
- **Piatto bruciato**: toccandolo va nel cestino, e la Postazione resta nel **Fumo** per 3 secondi.
- **Ingredienti e Spreco** (decisione della mappa `yatai-economia-e-cucina`, ticket 01):
  - Ogni Piatto è fatto di **Ingredienti** e ognuno costa Yen; il costo del Piatto è la somma, circa un terzo del suo prezzo. Gli Ingredienti sono gli stessi per le varianti, tranne quello che le distingue (sciroppo, ripieno, uovo o naruto).
  - Il costo si paga quando l'Ingrediente è usato, cioè a ogni tocco giusto sulla Scorta, ingrediente per ingrediente. Un tocco fuori ordine non si paga.
  - Ogni Ingrediente che non finisce in un Piatto servito è **Spreco** e non si rimborsa, nemmeno se un Disturbatore ruba o rovina il Piatto.
  - Una Serata può chiudere in rosso: non dà ★ né Yen, ma non toglie mai gli Yen già in tasca, non c'è game over e si rigioca subito. Il recap è gentile ("Stasera abbiamo sprecato troppo, riproviamo!").
  - Il recap di fine Serata mostra Vendite, Spesa, Spreco e Incasso, con una tabella per Piatto (fatti, serviti, sprecati, costo, vendite).
  - Gli Ingredienti sono una **bozza** da regolare nei ticket 07, 08 e 29:

| Piatto | Ingredienti (costo in ¥) | Costo |
|---|---|---|
| Onigiri | riso 20, alga 10 | 30 |
| Takoyaki | pastella 30, polpo 50, salsa 20 | 100 |
| Kakigōri | ghiaccio 20, sciroppo 60 | 80 |
| Taiyaki | pastella 30, ripieno 40 | 70 |
| Ramen | noodles 70, brodo 80, uovo o naruto 50 | 200 |

I Piatti sono elencati nell'ordine in cui si sbloccano. Le varianti in giapponese usano i nomi veri dei menù.

| Piatto | Postazione | Cottura | Si brucia dopo | Varianti | Prezzo |
|---|---|---|---|---|---|
| Onigiri おにぎり | tagliere del riso | nessuna: si compone a tocchi | mai | – | 100 ¥ |
| Takoyaki たこ焼き | piastra a 6 buchi | 5 s | +4 s | – | 300 ¥ |
| Kakigōri かき氷 | macchina del ghiaccio | 2 s | mai | fragola いちご · melone メロン · matcha 抹茶 (con icona, non solo colore) | 250 ¥ |
| Taiyaki たい焼き | stampo a pesce | 8 s | +4 s | fagioli rossi あんこ · crema カスタード | 200 ¥ |
| Ramen ラーメン | pentola del brodo | 6 s | +5 s | con uovo 味玉 · con naruto ナルト | 600 ¥ |

## I Matsuri
Sono 5 Matsuri da 6 Serate ciascuno, disposti su una mappa. La sesta Serata è la **Gran Serata**: ha un obiettivo più alto e un **Evento**. In giapponese i Matsuri si chiamano 花見 · 七夕 · 花火大会 · 秋祭り · 雪まつり.

| Matsuri | Stagione | Piatto nuovo | Novità | Evento della Gran Serata | Vestiti |
|---|---|---|---|---|---|
| Hanami | primavera | onigiri: è il cibo del picnic sotto i ciliegi, e Maurizio lo prepara per chi l'ha dimenticato a casa | tutorial, Ordini da 1 Piatto | **Hanafubuki** (花吹雪): ogni tanto i petali coprono il Bancone e un tocco li soffia via | haori con i fiori di ciliegio, ventaglio pieghevole sensu |
| Tanabata | inizio estate | takoyaki | Croccola, Ordini da 2 Piatti | **i desideri**: il Cliente servito in fretta appende il suo tanzaku al bambù accanto allo Yatai, cade una pioggia di stelle e la Mancia raddoppia | yukata con le stelle, fascia hachimaki |
| Hanabi | piena estate | kakigōri | formiche | **i fuochi**: a metà Serata tutti i Posti si riempiono, ma la Pazienza scende più piano | giacca happi, maschera da volpe |
| Aki Matsuri | autunno | taiyaki | corvi | **il corteo del mikoshi**: il tempietto portatile passa a spalla, con i portatori in happi che gridano "wasshoi"; per 15 secondi l'Incasso vale doppio, e i corvi scappano spaventati | haori con le foglie rosse, cappello intrecciato amigasa |
| Yuki Matsuri | inverno | ramen | Ordini da 3 Piatti | **il freddo**: i Piatti caldi sul Bancone vanno serviti entro pochi secondi | sciarpa e berretto, giacca imbottita hanten |

## Clienti e Disturbatori
| Cliente | Vizio |
|---|---|
| Marcella | chiede sempre il **Bis**; dall'Hanabi preferisce i dolci (kakigōri, taiyaki) |
| Carlotta | paga il doppio ma è impaziente |
| Balosso | finché è a un Posto, la Pazienza di tutti scende più piano |
| Nella | a volte lascia lo **Yen d'oro**, che triplica la sua Mancia |
| Filippo | ordina solo onigiri e kakigōri; nello Yuki Matsuri la sua Pazienza dura di più |
| Pasquale | finché è a un Posto, le Postazioni nel Fumo si riparano subito |
| Ebi Furai | se un Piatto si brucia si spaventa: la sua Pazienza scende il doppio più in fretta |
| Clienti di passaggio | tanuki, volpe kitsune, gatto maneki-neko: nessun Vizio (per disegnarli vedi "Cose da evitare") |

- **Croccola** (dal Tanabata) punta takoyaki e taiyaki sul Bancone: crede che il taiyaki sia un pesce vero. Se la tocchi, la coccoli: fa le fusa e se ne va. Se la lasci fare, ruba il Piatto.
- **Formiche** (dall'Hanabi) arrivano in fila sul Bancone e puntano i Piatti dolci (kakigōri, taiyaki). Un tocco sulla fila le fa girare al largo. Se arrivano, il Piatto è rovinato e va nel cestino.
- **Corvi** (dall'Aki Matsuri) si posano sul tetto dello Yatai e gracchiano "kaa kaa" per avvisare, poi scendono a rubare un Piatto pronto lasciato su una Postazione. Un tocco li fa volare via.

## Progressione
- La Serata successiva si apre con ★. Il Matsuri successivo si apre vincendo la Gran Serata. Le stelle non bloccano mai l'avanzamento.
- **Le stelle** sbloccano i **Vestiti** (decisione della mappa `yatai-economia-e-cucina`, ticket 04). Gli Yen non li comprano: gli Yen comprano lo Yatai, le stelle vestono Maurizio.
  - Ogni Matsuri ha 2 Vestiti (tabella "I Matsuri"). Si sbloccano con le stelle di quel Matsuri, cioè le migliori di ognuna delle sue 6 Serate (al massimo 18★), che non si spendono: il primo con 4★, il secondo con 10★ (valori di partenza, li regola il ticket 29).
  - Il Vestito si sceglie nella **Bottega**, nella sezione Vestiti. Quelli ancora bloccati si vedono, con "★ 4/18"; quelli del Matsuri in corso hanno il segno **Che stile!**. Quando se ne sblocca uno, il recap di fine Serata chiede "Nuovo Vestito! Lo indossi?". Il Vestito non cambia mai da solo.
  - Se Maurizio indossa un Vestito del Matsuri in corso scatta **Che stile!**: la Mancia vale ×1,2 (non "+20% del prezzo"). Con la Pazienza sempre piena vale al più circa +9% sull'Incasso, quindi resta un premio piccolo anche con la Spesa. In Serata si vede quando è attivo.
  - Le stelle non bloccano mai l'avanzamento, nemmeno per i Vestiti: nessuna Serata ne richiede uno.
- **Gli Yen** servono per (nella **Bottega**, insieme alla sezione Vestiti):
  - i **Potenziamenti**: Postazione più veloce (3 livelli per ognuna delle 4 Postazioni con cottura: il tagliere dell'onigiri non cuoce, quindi non ne ha), Posto in più, ventaglio di Maurizio (+Pazienza, 3 livelli);
  - l'**Arredo**, solo estetico: tenda noren, lanterne chōchin, lanterne bonbori, campanella fūrin, statuetta del maneki-neko.

## Contorno
- **Tutorial**: è Maurizio a spiegare con i fumetti, con una zampina che indica cosa toccare. Succede nella prima Serata di ogni Matsuri, quando arriva il Piatto nuovo.
- **Ricettario**: una scheda per ogni Piatto con una curiosità vera e come si prepara nello Yatai. Onigiri e kakigōri hanno anche una ricetta da fare a casa "con un grande". I testi pronti, con le note di sicurezza, sono nella sezione 3 della [ricerca](./docs/ricerca/piatti-e-matsuri.md).
- **Fine Serata**: Incasso, stelle, 1 o 2 **Titoli** buffi e il pulsante **Condividi**, con la frase "Ho incassato 12.500 yen allo Yatai di Maurizio! Mi batti?". Usa la condivisione del telefono, oppure copia il link. In una Serata chiusa in rosso Condividi non c'è: il recap gentile basta.
- **Comandi e accessibilità**: tocco e mouse; tasti 1–5 per le Postazioni, Q/W/E/R per i Posti, M per la musica. Le varianti sono riconoscibili dall'icona, non solo dal colore. C'è l'opzione "riduci movimento".
- **Titolo e crediti**: "sviluppato da Maurizio Influencer Official" nella schermata iniziale, "un regalo di Giuseppe" nei crediti.

## Cose da evitare
Le regole complete, con le fonti, sono nella sezione 8 della [ricerca](./docs/ricerca/piatti-e-matsuri.md). Queste valgono per tutta la grafica e tutti i testi:
- **Bacchette**: mai piantate dritte nel riso o nel ramen, mai cibo passato da bacchetta a bacchetta, mai appoggiate di traverso sulla ciotola. Vale anche per le icone.
- **Niente bandiera del Sol Levante**, in nessuna decorazione.
- **Mikoshi e torii**: nessuno sale sul mikoshi, nessun Disturbatore lo tocca o si posa sui torii, e il torii non fa da insegna dello Yatai. Una bancarella davanti a un santuario invece va bene.
- **Clienti di passaggio**: il tanuki va disegnato adatto ai bambini, senza la bottiglia di sakè e senza lo scroto delle statue di Shigaraki, ed è un cane procione, non un procione. La kitsune è la messaggera di Inari, non il dio. Il maneki-neko segue la leggenda del tempio Gōtokuji.
- **Il corvo ha due zampe**: quello a tre zampe è lo Yatagarasu, il corvo sacro dei santuari di Kumano.
- **Niente font "finto orientale" né kanji inventati**, niente occhi o denti caricaturali.

## Il regalo
Il pacchetto contiene:
- il gioco già pronto da caricare in `/yatai/`;
- il codice sorgente;
- un LEGGIMI in italiano, con l'elenco delle differenze tra Phaser 3 e 4;
- il testo della scheda per la homepage in italiano, inglese e giapponese, compresa la voce per i dati strutturati della pagina (JSON-LD).
