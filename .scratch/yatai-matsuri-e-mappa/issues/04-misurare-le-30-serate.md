# 04: Misurare le 30 Serate

**Type:** task
**Blocked by:** 01, 02, 03 (e il ticket 10 di `maurizio-yatai` in main con `Status: resolved`: non è un ticket di questa mappa; il Bis di Marcella e lo spavento di Ebi Furai cambiano i numeri)
**Status:** open

## Question

Riempire la tabella delle 30 Serate con numeri **misurati col bot**, seguendo il formato dei dati (ticket "Il formato dei dati delle 30 Serate"), la forma della curva e gli scaglioni di cast e Disturbatori già decisi. Lavoro AFK, con uno script usa-e-getta (non nel gioco), come per le misure del ticket 34 e della mappa `yatai-serata-che-cambia`:

- Per ogni Serata: un obiettivo e i valori del ritmo (fasi, Pazienza in ondata, quota degli Ordini da 2 e 3 Piatti) scelti perché **rapido, attento e lento** (0,6 s, 1,0 s, 1,4 s per tocco, `test/bot.js`) cadano sui bersagli della forma della curva, con il margine deciso. Media su almeno 6 semi, 24 per i Matsuri con i Disturbatori e i Vizi che dipendono dal caso (cast, Nella).
- Per ogni Serata, nella tabella: obiettivo, menù, Ordini, ritmo, cast, Disturbatori, e per i tre bot Incasso medio, stelle, serviti, persi, bruciati, Spreco.
- Una nota per ogni Serata che esce dalla forma (Serate in rosso per il "medio", il lento che perde ★) e che cosa è stato fatto.
- Un controllo sulla Mancia totale (Serie × Che stile! × Yen d'oro × desideri): nessuna Serata più generosa del tetto del 15% di `serata.test.js`/`bottega.test.js` (il 16% con i Potenziamenti).

Risultato: la tabella in `.scratch/yatai-matsuri-e-mappa/assets/curva-30-serate.md`, con lo script di misura accanto (non in `yatai/`). Non modificare `config.js` né i test: i numeri entrano nel gioco con il ticket 12 (passo 1).

Avvertenza: gli obiettivi misurati qui sono provvisori fino al ticket 29, che li rifinisce. Rispetta le regole del repo per il lavoro lungo: una prova alla volta, mai cinque browser insieme, non rilanciare in background un lavoro fermato dal sistema per memoria.
