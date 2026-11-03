# 02: Provare le Ondate

**Type:** prototype
**Blocked by:** None (il ticket 01 è risolto: la forma di partenza è quella di `GAME_SPEC.md`, voce Ondate)
**Status:** resolved

## Question

"L'Ondata è emozionante o ingiusta?" si capisce solo giocandola. Costruire, con la skill `prototype`, un prototipo **usa-e-getta** delle 2-3 forme scelte nel ticket "La forma delle Ondate", sul gioco vero ma su un ramo fuori da `main` (per esempio `prototipo/ondate`, come `prototipo/cucina-a-tocchi` per la cucina), con le varianti scelte da un parametro d'indirizzo (per esempio `?sviluppo=serata&ondate=a|b|c`).

Il prototipo risponde a:

- Con il bot (rapido 0,6 s, attento 1,0 s, lento 1,4 s per tocco, vedi Notes della mappa): quanti Clienti serve e quanto incassa ciascuno per ogni forma, quanti ne perde, con più semi.
- Giocata a mano (Giuseppe, meglio sul telefono, `npm run telefono`): l'Ondata si sente come un picco o come una confusione? Il respiro respira? Il segnale prima dell'Ondata serve?
- Quale forma tenere (o quale mescolare) e quali numeri le stanno meglio.
- **Nota del 2026-11-03 (sessione sul ticket 34):** la forma di partenza è già decisa (quattro fasi: calma, ondata, respiro, ondata finale, con gli intervalli di `GAME_SPEC.md`) e vale come prima variante; ne servono altre solo per confrontarla. Il punto da misurare è se **la sola frequenza degli arrivi** basta: con 3 Posti e 25 s di Pazienza potrebbe non far perdere nessuno, nemmeno al lento. Se non basta, il prototipo prova le alternative (Pazienza più corta nell'ondata, Posto che si riempie appena si libera). Misurare anche con 4 Posti e col ventaglio (ticket 35) e se per l'Hanami (solo onigiri) la varietà basta.

Il risultato è la scelta della forma più i numeri di partenza misurati. Non si porta nulla di questo ramo in `main`: si scrive nel `## Answer` cosa si è visto, con una tabella dei numeri del bot, e si lascia il ramo fuori da `main` (nome e commit nel `## Answer`).

## Answer

Risolto il 2026-11-03 con Giuseppe **senza prototipo giocabile**: bastano le misure del bot (tabelle in `## Comments`, script usa-e-getta fuori dal repo, nessun ramo, nessun codice nel gioco). Il "si sente come un picco o una confusione?" resta da vedere quando il ticket 34 sarà costruito e provato sul telefono.

- **La sola frequenza degli arrivi non basta.** Con 3 Posti e 25 s di Pazienza nessuno perde un Cliente, e il lento serve 21 Clienti qualunque sia la curva: per lui non ci sono né ondata né respiro. Cambia la Serata solo del rapido (da 33,5 a 39,4 serviti).
- **Ricambio del Posto più corto e ondata più fitta o più lunga non servono**: non spostano né i Clienti persi né il Lamento per attento e lento. Scartati.
- **Cosa cambia in un'ondata (decisione):** oltre alla frequenza degli arrivi, **la Pazienza dei Clienti che arrivano durante un'ondata è più corta**. Valore di partenza **15 s** (invece di 25), sempre con 5 cuoricini che durano un quinto ciascuno. Con 15 s il bot dà: rapido ★★★ (incasso 4295, serviti 39,4), attento ★★ (2909, Lamento visto 12 volte), lento ★ (2015, 3 Clienti persi), 40 semi su 40 con le stelle giuste. Quanto è fragile: a 18 s il lento scende a 1909, sotto ★ in 25 semi su 40; la soglia ★ a 1920 è troppo vicina al lento e la ricalibra il ticket 05. Il valore esatto (15 s o un po' più) si fissa lì, con la Mancia della Serie.
- **4 Posti e ventaglio:** con 15 s e 4 Posti le stelle restano giuste (persi: attento 2,7, lento 6,0). Con il ventaglio a +20% (ipotesi della misura) il lento non perde nessuno. Il ticket 35 deve scegliere i numeri del ventaglio tenendo conto che il quarto Posto da solo toglie ★ al lento (37 semi su 40) con le regole scritte.
- **L'Hanami basta?** Solo con la Pazienza corta in ondata: così la Serata cambia anche per chi non è rapido (Lamento e Clienti persi nell'ondata). Con la sola frequenza no.
- **Da riportare nelle regole (ticket 06):** in `GAME_SPEC.md` la frase "Cambia solo la frequenza degli arrivi: la Pazienza resta di 25 secondi" va riscritta; il criterio del ticket 34 "Cambia solo la frequenza degli arrivi, non la Pazienza" pure. Criterio sul bot scelto: serviti contro arrivati (il rapido ne serve 39,4 su 42,1; il resto sono quelli ancora ai Posti allo scadere).
- Ramo del prototipo: nessuno.

## Comments

### Prima misura con il bot, senza prototipo (2026-11-03)

Script usa-e-getta fuori dal repo (`ondate.mjs` nello scratchpad della sessione): sottoclasse di `Serata` che cambia solo `attesaArrivoMs` secondo le quattro fasi di `GAME_SPEC.md` (confini mossi di ±5 s dal seme), stesso bot di `giocaServata`, 40 semi, onigiri, 3 Posti, Pazienza 25 s. La riga "oggi" riproduce i numeri noti (4001 / 3040 / 1967), quindi la misura è affidabile. Nessun file del gioco toccato.

| Caso | Bot | Arrivati | Serviti | Persi | Incasso medio | ★ (0/1/2/3 su 40) | Posti pieni (calma/ondata/respiro/finale) | Serviti con ≤2 cuori |
|---|---|---|---|---|---|---|---|---|
| Oggi (arrivi 2,5-4,5 s) | rapido | 34,3 | 33,5 | 0 | 4001 | 0/0/0/40 | 0,6 in media | 0 |
| | attento | 32,0 | 29,0 | 0 | 3040 | 0/0/28/12 | 2,2 | 0 |
| | lento | 24,0 | 21,0 | 0 | 1967 | 0/40/0/0 | 2,6 | 16 |
| **Regole scritte** (solo frequenza) | rapido | 42,1 | 39,4 | 0 | 4490 | 0/0/0/40 | 0,5 / 2,0 / 1,0 / 2,3 | 0 |
| | attento | 31,6 | 28,6 | 0 | 3070 | 0/0/18/22 | 0,8 / 2,4 / 2,2 / 2,6 | 0 |
| | lento | 24,0 | 21,0 | 0 | 2002 | 0/40/0/0 | 1,7 / 2,8 / 2,8 / 2,8 | 14 |
| 4 Posti | rapido | 44,1 | 40,3 | 0 | 4535 | 0/0/0/40 | 0,5 / 2,4 / 1,5 / 3,0 | 0 |
| | attento | 32,6 | 28,6 | 0 | 2921 | 0/0/40/0 | 0,8 / 3,0 / 3,2 / 3,6 | 10 |
| | lento | 25,1 | 21,0 | 0,1 | 1885 | **37**/3/0/0 | 1,7 / 3,6 / 3,8 / 3,8 | 14 |
| Ventaglio +20% (Pazienza 30 s) | rapido | 42,1 | 39,4 | 0 | 4504 | 0/0/0/40 | = regole scritte | 0 |
| | attento | 31,6 | 28,6 | 0 | 3153 | 0/0/7/33 | | 0 |
| | lento | 24,0 | 21,0 | 0 | 2163 | 0/40/0/0 | | 0 |
| 4 Posti + ventaglio +20% | rapido | 44,1 | 40,3 | 0 | 4575 | 0/0/0/40 | | 0 |
| | attento | 32,6 | 28,6 | 0 | 3042 | 0/0/20/20 | | 0 |
| | lento | 25,0 | 21,0 | 0 | 2037 | 0/40/0/0 | | 13 |

Cosa dicono (il ventaglio a +20% è un'ipotesi della misura: il ticket 35 non ha ancora il numero):

- **Il sospetto si conferma: nessun Cliente si perde.** Con la sola frequenza, 0 Clienti persi per tutti e tre i livelli, a 3 Posti. Il Cliente che arriva con i Posti pieni aspetta senza essere visto, quindi una Pazienza di 25 s non è mai in gioco.
- **L'ondata si sente solo se si è rapidi.** Il lento serve 21 Clienti qualunque sia la curva (21 prima, 21 dopo): è già saturo dalla calma in poi (Posti pieni 2,8 su 3 dall'ondata), quindi per lui non c'è né ondata né respiro. L'attento è quasi uguale (29,0 → 28,6). Il rapido passa da 33,5 a 39,4 Clienti, +490 Yen, e per lui l'ondata respira davvero (Posti pieni 2,0 in ondata, 1,0 nel respiro).
- **Il Lamento non scatta mai per rapido e attento** (0 serviti con ≤2 cuori); solo il lento li vede (14), come oggi.
- **L'attento sale a ★★★ in 22 semi su 40** (3070 contro la soglia 3072): le cifre di ★★★ vanno rimesse nel ticket 05.
- **Il quarto Posto danneggia il lento** (37 semi su 40 senza ★: i Clienti aspettano di più, la Mancia scende). Non è un bug della curva: è il sintomo che i Potenziamenti vanno calibrati insieme (ticket 35 e 29). Con il ventaglio il lento torna a ★ e il Lamento sparisce per l'attento.

### Seconda misura: le varianti scelte da Giuseppe (2026-11-03)

Giuseppe ha chiesto di misurare tre varianti con il bot prima di decidere se costruire un prototipo: Pazienza più corta nell'ondata, Posto che si riempie appena si libera, ondata più fitta e più lunga. Criterio scelto per "il rapido non serve tutti": **serviti contro arrivati** (la differenza di oggi, circa 2-3 Clienti a Serata, basta). Stesso script, 40 semi, 3 Posti, onigiri. Nella variante A i cuoricini restano sempre 5 e ognuno dura un quinto della Pazienza di quel Cliente (ipotesi della misura: in gioco la Pazienza corta potrebbe invece mostrare meno cuoricini).

| Variante | Bot | Serviti | Persi | Incasso medio | ★ (0/1/2/3 su 40) | Serviti con ≤2 cuori |
|---|---|---|---|---|---|---|
| Regole scritte (riferimento) | rapido / attento / lento | 39,4 / 28,6 / 21,0 | 0 / 0 / 0 | 4490 / 3070 / 2002 | ★★★ 40 · ★★ 18, ★★★ 22 · ★ 40 | 0 / 0 / 14 |
| **Pazienza 15 s in ondata** | rapido | 39,4 | 0 | 4295 | ★★★ 40 | 0 |
| | attento | 28,6 | 0 | 2909 | ★★ 40 | 12 |
| | lento | 21,0 | 3,1 | 2015 | ★ 40 | 11 |
| Pazienza 20 s in ondata | rapido / attento / lento | 39,4 / 28,6 / 21,0 | 0 / 0 / 0 | 4469 / 3058 / 1996 | quasi come il riferimento | 0 / 0 / 14 |
| Pazienza 18 s in ondata | rapido / attento / lento | 39,4 / 28,6 / 21,0 | 0 / 0 / 0 | 4395 / 2941 / 1909 | lento **senza ★ in 25 semi su 40** | 0 / 10 / 14 |
| Pazienza 12 s in ondata | rapido / attento / lento | 39,4 / 28,6 / 21,0 | 0 / 0 / 3,5 | 4262 / 2774 / 1940 | lento senza ★ in 6 semi | 0 / 13 / 11 |
| Ricambio del Posto 0,2 s | rapido / attento / lento | 39,7 / 28,6 / 21,0 | 0 / 0 / 0 | 4519 / 3057 / 2001 | come il riferimento | 0 / 0 / 14 |
| Ondata più fitta (0,8-1,4 e 0,7-1,3 s) | rapido / attento / lento | 39,4 / 28,6 / 21,0 | 0 / 0 / 0 | 4467 / 3064 / 2002 | come il riferimento | 0 / 0 / 14 |
| Ondata più lunga (25-60 s, respiro 60-75 s) | rapido / attento / lento | 42,3 / 28,7 / 21,0 | 0 / 0 / 0 | 4776 / 3037 / 1996 | attento ★★★ in 12 semi | 0 / 0 / 14 |
| Pazienza 15 s in ondata con 4 Posti | rapido / attento / lento | 40,3 / 28,6 / 21,0 | 0 / 2,7 / 6,0 | 4336 / 2878 / 1988 | ★★★ · ★★ · ★ in tutti | 4 / 12 / 11 |

Cosa dicono:

- **Solo la Pazienza più corta nell'ondata cambia qualcosa per chi non è rapido.** Ricambio del Posto e ondata più fitta o più lunga non spostano né i Clienti persi né il Lamento: il lento e l'attento sono già saturi, e l'ondata più lunga fa solo incassare di più al rapido.
- **15 s in ondata dà quasi tutti i bersagli della mappa**: rapido ★★★ (4295), attento ★★ (2909, sempre sotto ★★★ 3072), lento ★ (2015), con il Lamento che si vede (12 Clienti serviti con ≤2 cuori per l'attento) e 3 Clienti persi dal lento. Il rapido però non ne perde nessuno.
- **Il ★ del lento è fragile**: vale 2002 con le regole scritte, 1909 con 18 s (25 semi su 40 senza ★) e di nuovo 2015 con 15 s. Il non-monotono è un effetto del bot (perdere Clienti libera tempo per servire gli altri a Mancia migliore), ma dice che la soglia ★ a 1920 è troppo vicina al lento: la ricalibra il ticket 05.
- Con 4 Posti i Clienti persi salgono (attento 2,7, lento 6,0) ma le stelle restano giuste: la Pazienza 15 s regge il quarto Posto. Il ventaglio (+20%, 30 s fuori ondata, 18 s in ondata) fa tornare 0 persi al lento e tiene ★/★★/★★★.
