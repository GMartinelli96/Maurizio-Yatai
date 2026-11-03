# Maurizio Yatai – La bancarella del Matsuri

マウリツィオの屋台 (con la lettura やたい) · un gioco della serie "I giochi di Maurizio" · un regalo di Giuseppe

Maurizio gestisce uno **Yatai** nei cinque **Matsuri** dell'anno. I peluche del cast arrivano ai **Posti** e fanno un **Ordine**. Il giocatore cucina e serve toccando **Postazioni**, **Bancone** e **Clienti** prima che finisca la loro **Pazienza**.

I termini in grassetto sono definiti in [GLOSSARY.md](./GLOSSARY.md). Le idee rimandate sono in [BACKLOG.md](./BACKLOG.md). I fatti culturali e i testi del Ricettario, con le fonti, sono in [docs/ricerca/piatti-e-matsuri.md](./docs/ricerca/piatti-e-matsuri.md). Tutti i numeri qui sotto sono **valori di partenza** e si regolano in un unico file di configurazione.

## Piattaforma e stile
- **Browser, verticale e mobile-first.** Su computer è una colonna centrata (come FarmPlush) e si gioca con il mouse.
- **Phaser 4.2 + Vite** ([ADR-0002](./docs/adr/0002-phaser-4-invece-di-phaser-3.md)). Si installa come app ed è giocabile offline. Deve funzionare con le regole di sicurezza (CSP) del sito: niente script o stili inline, niente risorse da altri siti.
- **Grafica e audio generati dal codice** ([ADR-0001](./docs/adr/0001-gioco-autonomo-senza-file-di-grafica-e-audio.md)):
  - grafica: tratto a matita tremolante, carta ruvida, colori pastello kawaii;
  - audio: musica sulla scala pentatonica giapponese, con una variante per Matsuri, più gli effetti (sfrigolio, campanella, monete).
- **Lingue**: italiano, inglese e giapponese, scelte in base alla lingua del dispositivo, con un selettore. I testi giapponesi vanno fatti rileggere a un madrelingua.
- Progressi salvati sul dispositivo. Niente login, pubblicità o tracciamenti. Pensato per tutte le età.

## La Serata
- Dura **120 secondi** e non c'è game over a metà.
- A fine tempo, se l'Incasso raggiunge l'obiettivo si prende ★. Con obiettivo ×1,3 si prende ★★, con obiettivo ×1,6 si prende ★★★.
- **Lo schermo, dall'alto in basso**: i Posti (3, che diventano 4 con un Potenziamento), il Bancone con i Piatti pronti, le Postazioni vicino al pollice. Maurizio sta al centro e si anima a ogni azione, ma le azioni sono istantanee.
- **Come si gioca**:
  1. Si tocca una Postazione: il Piatto cuoce da solo.
  2. Quando è pronto lo si tocca e passa sul Bancone.
  3. Si tocca il Cliente: è servito se sul Bancone c'è tutto il suo Ordine.
  4. Trascinare al posto di toccare fa la stessa cosa.
- **Clienti**: l'Ordine compare nella nuvoletta, fatto di icone. La Pazienza è di 5 cuoricini, circa 25 secondi.
  - La Mancia arriva fino a +50% del prezzo se la Pazienza è piena.
  - Se la Pazienza finisce, il Cliente se ne va imbronciato e non paga.
  - Un Piatto sbagliato non si può servire: il Cliente scuote la testa.
- **Piatto bruciato**: toccandolo va nel cestino, e la Postazione resta nel **Fumo** per 3 secondi.

I Piatti sono elencati nell'ordine in cui si sbloccano. Le varianti in giapponese usano i nomi veri dei menù.

| Piatto | Postazione | Cottura | Si brucia dopo | Varianti | Prezzo |
|---|---|---|---|---|---|
| Onigiri おにぎり | tagliere del riso | 1 s | mai | – | 100 ¥ |
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
- **Le stelle** sbloccano i **Vestiti**. Se Maurizio indossa un Vestito del Matsuri in corso scatta **Che stile!**: +20% di Mancia.
- **Gli Yen** servono per:
  - i **Potenziamenti**: Postazione più veloce (3 livelli per Postazione), Posto in più, ventaglio di Maurizio (+Pazienza, 3 livelli);
  - l'**Arredo**, solo estetico: tenda noren, lanterne chōchin, lanterne bonbori, campanella fūrin, statuetta del maneki-neko.

## Contorno
- **Tutorial**: è Maurizio a spiegare con i fumetti, con una zampina che indica cosa toccare. Succede nella prima Serata di ogni Matsuri, quando arriva il Piatto nuovo.
- **Ricettario**: una scheda per ogni Piatto con una curiosità vera e come si prepara nello Yatai. Onigiri e kakigōri hanno anche una ricetta da fare a casa "con un grande". I testi pronti, con le note di sicurezza, sono nella sezione 3 della [ricerca](./docs/ricerca/piatti-e-matsuri.md).
- **Fine Serata**: Incasso, stelle, 1 o 2 **Titoli** buffi e il pulsante **Condividi**, con la frase "Ho incassato 12.500 yen allo Yatai di Maurizio! Mi batti?". Usa la condivisione del telefono, oppure copia il link.
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
