# 05: Quanto deve contare la bravura

**Type:** grilling
**Blocked by:** None (01, 02, 03 e 04 sono risolti)
**Status:** resolved

## Question

Con le Ondate e la Serie decise, mettere in cifre la destinazione: la Serata non è più "prevedibile" se la bravura si vede nei numeri. Oggi il bot rapido serve 33-34 Clienti su circa 34 e il limite sono gli arrivi (vedi Notes della mappa). Decidere con Giuseppe, usando le misure del prototipo "Provare le Ondate":

- **Bersagli per il bot** (rapido 0,6 s, attento 1,0 s, lento 1,4 s per tocco): quanti Clienti serve ciascuno su quanti ne arrivano (per esempio il rapido ne perde qualcuno, l'attento di più, il lento ancora di più ma nessuno si perde "per forza"), quanto incassa, quali stelle. Il lento prende ★ in ogni caso; l'attento ★★; ★★★ resta una sfida per il rapido.
- **Obiettivo di Incasso dell'Hanami**, ricalibrato sul netto: oggi 1920 (★ 1920, ★★ 2496, ★★★ 3072). Alzarlo, abbassarlo, o lasciarlo?
- **Quanto pesa la Serie** nell'Incasso del rapido (al più X% del totale), così non decide da sola le stelle.
- **Quanto margine** tra attento e ★★★ (oggi 3060 contro 3072, il margine è piccolo).
- **Come si misura che "non è più prevedibile"**: due semi diversi danno Serate con Ondate in punti diversi ma tutte giocabili; la spaccatura tra rapido e lento sul numero di Clienti serviti è almeno X; il test ripetibile con lo stesso seme resta uguale.
- **Quali di questi bersagli diventano test** del ticket 34 (criteri verificabili senza browser).

I numeri sono provvisori fino al ticket 29 (bilanciamento di tutte le Serate), che li riprende come punto di partenza. Non scrivere codice.

## Answer

Risolto il 2026-11-03 con Giuseppe, con misure del bot (script usa-e-getta fuori dal repo; sottoclasse di `Serata` con Serie, ondata con Pazienza 15 s, 6 semi `a`-`f` come i test e 40 semi per la dispersione; nessun codice nel gioco).

**Scelte di Giuseppe**
- **Serie come scritta** (+10% di Mancia per Cliente oltre il primo, tetto ×1,5 a 6 di fila): non si tocca. Conseguenza accettata: il bot attento, che non sbaglia mai, tiene la Serie al tetto per tutta la Serata e prende ★★★. Il traguardo della destinazione "l'attento ★★" cade; resta "il lento ★, il rapido molto più su". Un attento umano che spezza la Serie (stima: il bot con il 15-30% di errori per Cliente) sta tra 3060 e 3160, cioè sulla soglia ★★★ (3072).
- **Obiettivo dell'Hanami: resta 1920** (★ 1920, ★★ 2496, ★★★ 3072). Niente da cambiare in `config.js`.
- **I bersagli sono test del ticket 34 sulla media di 6 semi** (`a`-`f`, come `mediaIncasso` di `test/serata.test.js`), non su ogni seme.

**Numeri di partenza** (Hanami, onigiri, 3 Posti, Pazienza 25 s fuori ondata e 15 s in ondata, Serie come scritta, media di 6 semi; tra parentesi 40 semi):

| Bot | Arrivati | Serviti | Persi | Incasso | Serie (Mancia extra) | Stelle |
|---|---|---|---|---|---|---|
| rapido 0,6 s | circa 42 | 40,0 | 0 | 5053 (4998) | 704 = 13,9% | ★★★ |
| attento 1,0 s | circa 32 | 28,8 | 0 | 3323 (3298) | 388 = 11,7% | ★★★ |
| lento 1,4 s | circa 27 | 21,0 | 3,5 | 2146 (2149) | 129 = 6,0% | ★ |

Senza la Serie (stessi semi): rapido 4348, attento 2935, lento 2017. Con 4 Posti (Serie e 15 s): 5035 / 3201 / 2056, ancora ★★★ / ★★★ / ★. Con il ventaglio a +20% (30 s fuori ondata, 18 s in ondata): 5215 / 3390 / 2165, nessun Cliente perso dal lento.

**Bersagli come criteri del ticket 34** (sulla media dei 6 semi):
- il rapido prende ★★★ (≥ 3072) e serve almeno 15 Clienti più del lento (misura: 19);
- il lento prende ★ (≥ 1920) ma non ★★ (< 2496) e non perde nessun Cliente "per forza": al più qualcuno in ondata (misura: 3,5; è un comportamento da non proibire con un test);
- l'attento incassa più del lento di almeno il 40% e meno del rapido (misura: +55% sul lento, −34% dal rapido);
- la Mancia della Serie non supera il 15% dell'Incasso del rapido (misura: 13,9%; il 10% del primo giro non è compatibile con la Serie come scritta);
- due semi diversi hanno ondate in punti diversi (confini mossi di ±5 s) e lo stesso seme dà la stessa Serata;
- "il rapido non serve tutti i Clienti": serviti < arrivati (40 su 42), non Clienti persi.

**Margini da sapere**
- Il margine dell'attento verso ★★★ non c'è più (3323 contro 3072, già sopra): ★★★ non misura più la differenza tra rapido e attento perfetti; la misura è l'Incasso e i Clienti serviti.
- Il ★ del lento è sicuro (2146 contro 1920, min 2097 sui 6 semi, 2071 sui 40) con la Pazienza a 15 s. A 18 s in ondata, senza Serie, il lento scendeva a 1909 (sotto ★): se si tocca la Pazienza in ondata o la Serie, va rimisurato.
- I numeri sono provvisori fino al ticket 29, che li riprende come punto di partenza.
