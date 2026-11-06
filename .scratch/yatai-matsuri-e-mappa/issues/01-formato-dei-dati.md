# 01: Il formato dei dati delle 30 Serate

**Type:** grilling
**Blocked by:** None
**Status:** open

## Question

Oggi `config.js` ha cinque oggetti `SERATA_*` (una Serata per Matsuri, ognuna `{ obiettivo, piatti, piattiPerOrdine }`) e `SERATE = { hanami, tanabata, hanabi, aki, yuki }`. Le Ondate (`ONDATE`) e il cast (`CLIENTI.cast`) sono comuni, i Disturbatori si passano a parte. Decidere con Giuseppe come si scrivono **le 30 Serate**, in modo che "cambiare una Serata non richieda di toccare il codice" (criterio del ticket 12) e che tutto quello che le mappe e i ticket fratelli useranno sia al suo posto:

- **La forma.** Cinque Matsuri con sei Serate ciascuno (una lista? un oggetto per Matsuri con i campi comuni e sei voci?). Quali campi stanno nel Matsuri (il menù di Piatti, il tema) e quali nella Serata (obiettivo, Ordini, ritmo, Disturbatori, cast, evento). Che cosa eredita da cosa, così una Serata è poche righe e non trenta copie.
- **Come si riconosce una Serata.** Un id (per esempio `hanami-1`, o Matsuri + numero da 1 a 6), l'ordine, e come si sa che è la Gran Serata (il sesto, o un campo).
- **La curva per Serata.** Le Ondate oggi sono una sola. Ogni Serata può avere la sua (ticket 34 e note del ticket 12): le fasi e gli intervalli, la Pazienza in ondata (15 s oggi), la quota degli Ordini da 2 e 3 Piatti. Profili con nome condivisi (per esempio "morbida", "piena") più qualche numero per Serata, o numeri liberi in ogni Serata? Il seme che sposta i confini delle fasi resta.
- **L'obiettivo della Gran Serata.** Un numero scritto, o un moltiplicatore sull'obiettivo delle altre.
- **Che cosa riceve la Serata del suo Matsuri.** Le regole dei Vizi legate al Matsuri (ticket 10: Marcella dolci dall'Hanabi, Filippo nello Yuki Matsuri) vogliono il Matsuri come dato. Si passa un'opzione `matsuri` (e il numero della Serata) al costruttore di `Serata`? Con quali nomi.
- **Il campo `evento`** vuoto per la Gran Serata (ticket 14 e 15) e il suo punto di attacco.
- **Compatibilità.** Molti test e scenari importano `SERATA_PRIMA`, `SERATA_TANABATA`, ... e `SERATA_PROVA_DISTURBATORI`; 42 scenari in `yatai/scenari/`. Restano come nomi che puntano alla Serata giusta (la Serata 1 del Matsuri? la Gran Serata?) o si riscrivono i test? Che cosa non deve cambiare: i semi e gli arrivi delle Serate di prima.
- **I test dei dati.** Che cosa controlla un test sulle 30 Serate (ogni Piatto del menù esiste, gli Ordini da `max` Piatti hanno abbastanza Piatti, i Disturbatori esistono in `DISTURBATORI`, le 30 hanno un obiettivo crescente dentro il Matsuri, ...) e come si prova che una Serata si cambia solo nei dati.

Da qui nascono i campi che i ticket "La forma della curva" e "Cast e Disturbatori a scaglioni" riempiono: lasciali nominati e vuoti, non decidere i valori.

Stato del codice da guardare: `yatai/src/config.js` (da `SERATA_PRIMA` a `SERATE`, `ONDATE`, `CLIENTI.cast`, `VIZI`, `DISTURBATORI`), `yatai/src/serata/Serata.js` (costruttore e opzioni, `fasiDellaSerata`), `yatai/src/serata/cast.js`, `yatai/src/scenes/SerataScene.js` (`init`), `yatai/src/bottega.js` (`opzioniSerata`). Non scrivere codice. Skill: `grilling`, `domain-modeling`, `codebase-design`.
