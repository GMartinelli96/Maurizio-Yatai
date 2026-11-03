# Mappa: come cambia una Serata nel tempo

**Stato: chiusa il 2026-11-03.** I sei ticket sono risolti e le regole sono scritte; il codice lo costruisce il ticket 34 di `maurizio-yatai`.

## Destination

Le regole di come cambia una Serata mentre si gioca (Ondate, Serie e quel che ne segue) sono decise e scritte in `GAME_SPEC.md` ("La Serata") e in `GLOSSARY.md`, abbastanza chiare da far costruire il ticket "Una Serata che cambia: ondate e Serie" (34 di `maurizio-yatai`) **senza dubbi**. La mappa si chiude quando non resta nulla da decidere: il codice lo scrive il ticket normale.

Prova che la destinazione è raggiunta: con le regole scritte, il giocatore automatico "rapido" non serve più tutti i Clienti (oggi 33-34 su circa 34), il "lento" prende comunque ★. L'"attento" doveva prendere ★★: con la Serie come scritta prende ★★★ (decisione di Giuseppe nel ticket 05). I numeri esatti sono nel ticket "Quanto deve contare la bravura".

## Notes

- Dominio: Maurizio Yatai. Usa i termini di `GLOSSARY.md` (Serata, Cliente, Cliente di passaggio, Vizio, Posto, Pazienza, Mancia, Incasso, Vendite, Spesa). **Serie** e **Ondata** sono termini nuovi: si aggiungono a `GLOSSARY.md` con `domain-modeling` nell'ultimo ticket, quando le definizioni sono decise.
- Nasce dalla prima prova (ticket 05 di `maurizio-yatai`): "lento e prevedibile, senza particolare interazione, mi annoia". L'interazione l'ha risolta la cucina a tocchi (ticket 33, fatto). Qui si risolve il "prevedibile".
- Vincoli che ogni decisione deve rispettare (da `GAME_SPEC.md`): nessun game over a metà Serata, gioco per tutte le età (bambini compresi), 360×640 in verticale con il pollice, tutto generato dal codice (ADR-0001), tre lingue, niente punizioni per chi sbaglia (un tocco fuori ordine non fa niente).
- **Come arrivano oggi i Clienti** (`yatai/src/config.js`, `yatai/src/serata/Serata.js`): il primo dopo 1,5 s, poi uno ogni 2,5-4,5 s a caso (`CLIENTI.arrivoSec`), tutti uguali, un Ordine da un solo onigiri (nell'Hanami). I Posti sono 3 e un Posto resta libero 1 s dopo che il Cliente è partito (`POSTI.ricambioSec`). Se i Posti sono pieni il Cliente che sta per arrivare aspetta senza essere visto. La Pazienza è 25 s (5 cuoricini). La Mancia arriva fino a +50% del prezzo a Pazienza piena.
- **Cosa misura il bot** (`giocaServata` in `test/serata.test.js`): la bravura è il tempo tra un tocco e l'altro. Con l'onigiri a 3 tocchi: rapido 0,6 s (circa 4050 netti, ★★★), attento 1,0 s (circa 3020, ★★), lento 1,4 s (circa 1965, ★). Obiettivo 1920 (★ 1920, ★★ 2496, ★★★ 3072), provvisorio.
- **Un fatto da tenere d'occhio** (stima mia, non misurata): tre onigiri in una volta costano circa 5-6 s al rapido e circa 13 s al lento, con una Pazienza di 25 s. Quindi con 3 Posti un'ondata di soli arrivi più fitti non fa perdere nessuno a nessuno: perché la Serata cambi davvero serve che l'Ondata cambi anche qualcos'altro (la Pazienza, il tempo tra un arrivo e l'altro dentro il Posto, la Mancia che dipende dai cuoricini rimasti). È il primo nodo del ticket "La forma delle Ondate".
- Dopo la scrittura di questa mappa è arrivato su `main` il commit `f812cd0` (ticket 06, il takoyaki): ci sono `SERATE` in `config.js`, la Serata del Tanabata (onigiri e takoyaki, Ordini da 1 o 2 Piatti, obiettivo provvisorio 3200) e il Fumo. Le decisioni di questa mappa riguardano la forma della curva e valgono per ogni Serata; i numeri però si ritrovano a partire dall'Hanami (solo onigiri, 1 Piatto per Ordine).
- Un'altra sessione lavora sullo stesso albero e può toccare `GAME_SPEC.md`, `GLOSSARY.md` e `.scratch/`: rileggi i file prima di scriverci e fai commit solo dei tuoi percorsi. Un'eccezione a "pianifica, non fare" vale come nella mappa `yatai-economia-e-cucina`: alla chiusura di un ticket la decisione si riporta nei file, ma qui si fa tutto nell'ultimo ticket, "Scrivere le regole".
- Il codice del gioco non si tocca. Unica eccezione: il prototipo usa-e-getta del ticket "Provare le Ondate", su un ramo fuori da `main`, con la skill `prototype`.

## Decisions so far

<!-- una riga per ticket chiuso: [titolo](link): gist della risposta -->

**Destinazione fissata con Giuseppe (grilling del 2026-11-03), non è un ticket:**

- **Cosa vuol dire "prevedibile"**: il **ritmo** (i Clienti arrivano sempre allo stesso modo, nessuna tensione e nessun respiro), la **bravura** (se giochi bene non succede mai niente di inatteso) e gli **Ordini** (sempre un solo onigiri, ogni Cliente identico). Non il "tra una Serata e l'altra".
- **Perimetro**: solo dentro una Serata da 120 s. Niente regole su come le 30 Serate cambiano tra loro (ticket 12 e 29 di `maurizio-yatai`) né sugli Eventi delle Gran Serate (14 e 15).
- **Meccaniche candidate**: Ondate, Serie e il Cliente con fretta (quest'ultimo solo come domanda: è diverso da Carlotta?). Fuori: l'Ordine più grosso e il momento speciale a metà Serata.
- **Varietà degli Ordini**: nell'Hanami viene **solo dal ritmo** (Ondate e Serie). Gli Ordini da 2 e 3 Piatti restano dove li mette la tabella "I Matsuri" (Tanabata, Yuki Matsuri); un ticket verifica se per l'Hanami basta. Non si sposta la tabella dei Matsuri senza un ordine esplicito di Giuseppe.
- **Obiettivo misurabile sul bot**: il rapido non serve tutti i Clienti, il lento prende ★, l'attento ★★.
- **Potenziamenti** (ticket 35 di `maurizio-yatai`): restano fuori. Le Ondate devono reggere con 3 e con 4 Posti e con il ventaglio (+Pazienza); se esce una domanda vera sui Potenziamenti diventa un ticket.
- **Un prototipo solo, per le Ondate**: la Serie si decide a parole.

**Ticket chiusi** (2026-11-03, da una sessione di domande sul ticket 34 di `maurizio-yatai` svolta in parallelo a questa mappa; Giuseppe ha accettato di riconciliarle; regole in `GAME_SPEC.md` e `GLOSSARY.md`, commit `1bedaa2`):

- [La forma delle Ondate](issues/01-forma-delle-ondate.md): quattro fasi (calma, ondata, respiro, ondata finale), una curva comune, confini mossi dal seme di circa ±5 s, segnale visivo 2 s prima, per ora cambia solo la frequenza degli arrivi. Quest'ultimo punto, i 4 Posti e il ventaglio e se l'Hanami basta restano al ticket 02.
- [La Serie](issues/03-la-serie.md): +1 per Ordine servito, si spezza con un Cliente perso o un servizio a vuoto, +10% di Mancia per Cliente oltre il primo con tetto ×1,5, numero vicino a Maurizio, "Serie più lunga" nel recap.
- [Il Cliente con fretta e Carlotta](issues/04-cliente-con-fretta-e-carlotta.md): non entra, è in `BACKLOG.md`.

- [Provare le Ondate](issues/02-provare-le-ondate.md) (2026-11-03, misura con il bot, senza prototipo giocabile): **la sola frequenza non basta** (0 Clienti persi, il lento serve 21 Clienti con qualunque curva). Cambia la regola: durante un'ondata i Clienti hanno la **Pazienza più corta, 15 s di partenza** (rapido ★★★, attento ★★, lento ★ con 40 semi su 40; a 18 s il lento perde ★). Ricambio del Posto più corto e ondata più fitta o lunga scartati. Regge con 4 Posti. La spec va riscritta nel ticket 06.

- [Quanto deve contare la bravura](issues/05-quanto-deve-contare-la-bravura.md) (2026-11-03): **Serie come scritta, obiettivo dell'Hanami resta 1920**, bersagli controllati sulla media di 6 semi. Il bot (6 semi, Pazienza 15 s in ondata): rapido 40,0 serviti e 5053 (★★★), attento 28,8 e 3323 (★★★, perché il bot non spezza mai la Serie: l'attento ★★ cade), lento 21,0 e 2146 (★, 3,5 persi). Serie 13,9% dell'Incasso del rapido (tetto del test 15%). Rapido − lento ≥ 15 Clienti serviti.

- [Scrivere le regole](issues/06-scrivere-le-regole.md) (2026-11-03): `GAME_SPEC.md` (Ondate con la Pazienza di 15 s, numeri del bot), `GLOSSARY.md` (Ondata), ticket 34 (criterio della curva e bersagli del bot sulla media di 6 semi) e note ai ticket 12, 26, 29 e 35. Il segnale dell'ondata con "riduci movimento" resta una decisione aperta del ticket 26.

## Frontier

Nessuno: la mappa è chiusa. Il prossimo passo è costruire il ticket 34 di `maurizio-yatai` (bloccato dal 05 di `maurizio-yatai`, la prima prova).

## Not yet specified

- Il segnale dell'ondata con "riduci movimento" (la campanella oscilla): ticket 26 di `maurizio-yatai`, con una proposta di partenza.
- Se il ventaglio (ticket 35) allunga anche la Pazienza in ondata, e i numeri dei suoi livelli: ticket 35. Il +20% usato nelle misure è un'ipotesi.
- Le curve per Serata e Matsuri, comprese quelle morbide delle prime Serate (ticket 12) e i numeri di tutte le Serate (ticket 29), che riprende i valori di partenza di questa mappa.
- "L'ondata si sente come un picco o come una confusione?": non provato a mano (nessun prototipo giocabile, scelta di Giuseppe); si vede quando il ticket 34 è costruito e provato sul telefono.

## Out of scope

- Implementare qualsiasi cosa nel gioco.
- Come cambiano le Serate tra loro (curva delle 30 Serate, ticket 12 e 29) e gli Eventi delle Gran Serate (14 e 15).
- Nuovi Piatti, Ordini più grossi nell'Hanami, la modalità Notte infinita e gli Aiutanti (già in `BACKLOG.md`).
- Un assaggio di Potenziamenti e Bottega (ticket 35 di `maurizio-yatai`).
