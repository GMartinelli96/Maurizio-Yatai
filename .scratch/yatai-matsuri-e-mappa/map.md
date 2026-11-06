# Mappa: i Matsuri e la mappa delle Serate

Label: `wayfinder:map`
**Stato: aperta (tracciata il 2026-11-05).** Nasce dal ticket 12 di `maurizio-yatai` ("I Matsuri e la mappa delle Serate", passo 8 di `PIANO.md`), troppo grosso e nebbioso per una sessione sola. Qui si decide; il codice lo costruisce il ticket 12, riscritto dall'ultimo ticket di questa mappa.

## Destination

Il ticket 12 di `maurizio-yatai` si può costruire **in 4 passi senza più domande**. Perché sia vero:

- le regole del percorso (schermata iniziale → mappa → Serata → fine Serata → mappa), degli sblocchi, dei crediti e del cast e dei Disturbatori per Matsuri sono scritte in `GAME_SPEC.md` e `GLOSSARY.md`;
- la curva delle 30 Serate è una tabella di numeri misurati col bot (rapido, attento, lento), non solo una forma;
- il look della mappa è approvato da Giuseppe su un abbozzo usa-e-getta, prima di qualunque disegno;
- il ticket 12 è riscritto con i suoi 4 passi e i criteri verificabili, e i ticket fratelli (13, 14, 15, 16, 20, 23, 24, 26, 29) hanno la loro nota su cosa passa a loro.

Il codice del gioco non si tocca (a parte l'abbozzo usa-e-getta del look). Il bilanciamento fine resta al ticket 29.

## Notes

- Dominio: Maurizio Yatai. Termini di `GLOSSARY.md` (Matsuri, Serata, Gran Serata, Evento, Piatto, Ordine, Cliente di passaggio, Vizio, Disturbatore, Ondata, Serie, Bottega, Vestito). Un termine nuovo (per esempio per la mappa) si aggiunge con `domain-modeling` nell'ultimo ticket, quando è deciso.
- Stato del codice al 2026-11-05 (main `d230dbf`):
  - `config.js` ha `SERATA_PRIMA`, `SERATA_TANABATA`, `SERATA_HANABI`, `SERATA_AKI`, `SERATA_YUKI` (ognuna `{ obiettivo, piatti, piattiPerOrdine }`) e `SERATE = { hanami, tanabata, hanabi, aki, yuki }`: una sola Serata per Matsuri. `SERATA_PROVA_DISTURBATORI` è la Serata di prova. Li importano molti test (bruciatura, kakigori, ramen-taiyaki, conti-per-piatto, postazione-veloce, disturbatori).
  - Le Ondate (`ONDATE`: quattro fasi, `pazienzaSec` 15, scostoSec 5) e il cast (`CLIENTI.cast`: sette peluche, quota 0,25) sono comuni a tutte le Serate. I Disturbatori arrivano solo se la Serata li chiede (`disturbatori`) o con `?disturbatori=`.
  - Scene: `BootScene` → `TitleScene` (Gioca, Bottega) → `SerataScene` → recap (Rigioca, Bottega) → `BottegaScene`. Non c'è né una mappa né un modo di uscire a metà Serata. `SerataScene.init` sceglie la Serata con `SERATE[matsuri]`.
  - `salvataggio.js` è alla versione 2 (Yen e Potenziamenti). Stelle e sblocchi sono del ticket 16 (versione 3); qui restano **in memoria**.
  - `TEMI` (ticket 32) ha già i colori, gli sfondi e i ruoli dei 5 Matsuri: la mappa li riusa.
- **Aggiornamento del 2026-11-05 (messaggio di yatai-fa):** il ticket 10 è chiuso nel suo ramo (`6fa04fd`, 424 test verdi), ma **non è in main**: yatai-fa aspetta il via di Giuseppe per il merge. Nel ramo `SerataScene` passa già `matsuri` a `Serata`, e `src/serata/disturbatori.js` importa `idPiatto` e `piattoBase` da `./ordini.js`: il ticket sul formato dei dati deve partire da lì, non da `d230dbf`. I Vizi della cucina (Marcella, Filippo, Pasquale, Ebi Furai) ci sono già.
- **Ticket 10 (il cast, parte 2) non è ancora in main** (ramo `ticket-10`, `../maurizio-t10`, sessione yatai-fa). Questa mappa si può tracciare e risolvere lo stesso, ma: (a) il ticket "Misurare le 30 Serate" parte solo a ticket 10 in main, perché il Bis di Marcella e lo spavento di Ebi Furai cambiano i numeri; (b) niente codice del ticket 12 finché il 10 non è in main.
- **Riferimento di stile per la mappa, già nel repo**: `docs/stile/confronto/suite-nella-mappa-1280x720.png` (Nella Bug Saga): sentiero a curve con nodi rotondi numerati, il cartello col nome della zona ("Il prato"), le tre stelle sotto il nodo, un pulsante indietro. È anche la mappa dei "Mondi" della suite. Gli altri screenshot della suite sono in `docs/stile/confronto/`.
- Vincoli che ogni decisione deve rispettare (da `GAME_SPEC.md`): nessun game over a metà Serata, tutte le età, 360×640 in verticale con il pollice (zone da toccare da 44 px), tutto generato dal codice (ADR-0001), tre lingue (italiano, inglese, giapponese), niente punizioni, "riduci movimento" (ticket 26), niente bacchette né bandiera del Sol Levante.
- Un'altra sessione (yatai-fa, ticket 10) lavora sullo stesso albero e può toccare `GAME_SPEC.md`, `GLOSSARY.md`, `.scratch/`: rileggi i file prima di scriverci, mai stash né reset, commit solo dei propri percorsi.
- Regole di sessione: un solo ticket risolto per sessione (tranne la ricerca). Un ticket `grilling` si risolve con Giuseppe (skill `grilling` e `domain-modeling`), mai da solo. `prototype` con la skill `prototype`. Il bot per misurare è `test/bot.js` (la bravura è il tempo tra un tocco e l'altro: rapido 0,6 s, attento 1,0 s, lento 1,4 s; media di 6 o 24 semi).

## Decisions so far

<!-- una riga per ticket chiuso: [titolo](link): gist della risposta -->

**Destinazione fissata con Giuseppe (grilling del 2026-11-05), non è un ticket:**

- **Destinazione**: come sopra (regole scritte, tabella delle 30 Serate misurata, look approvato su un abbozzo, ticket 12 riscritto in 4 passi).
- **Salita di difficoltà**: il Piatto nuovo di un Matsuri arriva alla sua Serata 1 (onigiri all'Hanami, takoyaki al Tanabata, kakigōri all'Hanabi, taiyaki all'Aki Matsuri, ramen allo Yuki Matsuri). Le Serate 2-5 salgono con lo stesso menù, la Gran Serata è la più alta. Al Matsuri dopo la difficoltà riparte più morbida, perché c'è un Piatto da imparare. Il tutorial (ticket 20) cade sulla Serata 1 di ogni Matsuri.
- **Sblocchi**: una Serata si apre con ★ sulla precedente; il Matsuri successivo con ★ sulla Gran Serata ("vinta" = almeno ★). Le Serate aperte si rigiocano per migliorare le stelle, che non bloccano mai altro. I Matsuri chiusi si vedono sulla mappa, bloccati. In sviluppo `?sblocca=tutto` apre tutto.
- **Forma della mappa**: due livelli. La **mappa dei 5 Matsuri** (cinque stazioni grandi, ognuna con il suo tema e le sue stelle, per esempio "★ 7/18") e la **strada delle 6 Serate** di un Matsuri, con la Gran Serata in fondo, sullo sfondo del suo `TEMI`. Trenta nodi su un solo schermo non stanno a 360×640 con zone da 44 px.
- **Schermate**: "Gioca" apre la mappa già sul Matsuri in cui sei arrivato; "indietro" dalla mappa torna al titolo. Nel recap restano **Rigioca** e **Mappa**; la **Bottega** si raggiunge dalla mappa e dal titolo (il glossario la vuole "raggiungibile dalla mappa"; con tre pulsanti il recap non starebbe, in giapponese).
- **Cast**: i peluche entrano a scaglioni lungo le Serate, uno nuovo ogni tanto; la Serata 1 dell'Hanami ha solo Clienti di passaggio. Chi arriva e quando lo decide un ticket.
- **Disturbatori**: Croccola dal Tanabata, formiche dall'Hanabi, corvi dall'Aki Matsuri, ma dentro il Matsuri non dalla Serata 1: il primo compare dalla Serata 2 o 3, poi restano in tutte le seguenti; i dati dicono per ogni Serata quali ha. La Serata di prova e `?disturbatori=` restano strumenti di sviluppo.
- **Gran Serata senza Evento**: finché i ticket 14 e 15 non ci sono, è una Serata con l'obiettivo più alto. Nei dati ha un campo `evento` vuoto, dove 14 e 15 si attaccheranno senza toccare la mappa. Si riconosce già sulla mappa (nodo più grande, con una decorazione).

## Frontier

Aperti e senza blocchi (in ordine):

1. [Il formato dei dati delle 30 Serate](issues/01-formato-dei-dati.md): `grilling`. **Prossimo consigliato**: sblocca 02 e 05.
2. [Il look della mappa](issues/06-look-della-mappa.md): `prototype`, indipendente (serve l'approvazione di Giuseppe prima di ogni disegno).
3. [Titolo, crediti e finale](issues/07-titolo-crediti-finale.md): `grilling`, piccolo e indipendente.

Bloccati: 02 La forma della curva (da 01), 03 Cast e Disturbatori a scaglioni (da 02), 04 Misurare le 30 Serate (da 01, 02, 03 e dal ticket 10 in main), 05 Il percorso delle schermate e il progresso in memoria (da 01), 08 Scrivere le regole e i 4 passi (da tutti).

## Not yet specified

- **Il tutorial nel percorso**: come la mappa e il progresso dicono "è la prima volta in questa Serata 1" (ticket 20, che dipende anche dal salvataggio del ticket 16). Si precisa dopo il ticket sul percorso delle schermate.
- **Il festeggiamento di un Matsuri che si apre** (animazione sulla mappa, stinger del ticket 23, il "Nuovo Vestito!" del ticket 19): dipende dal look approvato.
- **Mappa con tastiera e "riduci movimento"** (ticket 26): i tasti per muoversi sulla mappa e cosa si ferma. Dopo il percorso delle schermate.
- **Come si prova in browser tutte e 30 le Serate**: il bot senza browser le gioca tutte nei test; in browser uno scenario Playwright per Matsuri (gli scenari sono 42 e si rigiocano uno alla volta). Lo decide l'ultimo ticket, quando i dati e i passi sono noti.
- **Dove disegna 12 e dove 13**: il ticket 13 ha tenuto per sé "la mappa con i 5 Matsuri nel loro stile". Quanto è disegnato nel 12 (segnaposto con i colori di `TEMI` o disegni veri) si chiede nell'abbozzo del look.

## Out of scope

- Gli Eventi delle Gran Serate (Hanafubuki, desideri, fuochi, mikoshi, freddo): ticket 14 e 15 di `maurizio-yatai`. Qui solo il campo `evento` vuoto.
- Il salvataggio su disco di stelle e sblocchi: ticket 16 (versione 3 del formato). Qui restano in memoria.
- I disegni definitivi degli sfondi e della mappa, se la decisione dell'abbozzo li assegna al ticket 13.
- Il bilanciamento fine delle 30 Serate (ticket 29): qui una curva credibile, misurata col bot.
- Nuovi Piatti, Notte infinita, Aiutanti, sfide giornaliere (`BACKLOG.md`).
