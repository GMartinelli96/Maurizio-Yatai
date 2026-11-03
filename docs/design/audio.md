# Audio di Maurizio Yatai

Disegno dell'audio per il ticket 23. Tutto è generato dal codice, senza file audio ([ADR-0001](../adr/0001-gioco-autonomo-senza-file-di-grafica-e-audio.md)). I termini in maiuscola sono in [GLOSSARY.md](../../GLOSSARY.md). Tutti i numeri sono valori di partenza e vanno nel file di configurazione.

## Scelte

- **Timbri sintetici "giocattolo"**, semplici e puliti, adatti al tratto a matita. Niente tentativi di imitare strumenti veri.
- **Una sola scala per tutti i Matsuri: la *yo*** (re mi sol la si), allegra e adatta a tutte le età. Cambiano tonica, tempo e timbri, non il carattere.

## Bus e mix

```
Master (limitatore) ← Music, SFX, UI
```

- Ogni suono passa da un bus; il volume si regola sui bus, mai sui singoli suoni. I volumi si ragionano in decibel.
- Livelli di partenza: Music −14 dB, SFX −6 dB, UI −8 dB. Gli effetti devono sentirsi sopra la musica senza coprirla.
- Margine sul master con un compressore/limitatore di sicurezza. Bersaglio per il telefono: circa −18 LUFS.
- **M** abbassa solo il bus Music, con una rampa breve; lo stato si salva con il resto.
- Sblocco al primo tocco (`AudioContext.resume()`); prima, nessun errore in console. Se la scheda va in secondo piano l'audio si sospende, e riparte al ritorno.
- Il ducking è solo un piccolo abbassamento della Music sugli stinger (inizio Serata, fine Serata, Evento), con rilascio lento perché non "pompi".

## Musica

Un giro di 8 battute per Matsuri, in tre strati che si accendono con il volume:

1. **base**: basso e pad;
2. **melodia**;
3. **percussione**: entra negli ultimi 30 secondi della Serata e durante l'Evento della Gran Serata, sempre all'inizio di una battuta.

| Matsuri | Carattere | Tempo | Tonica |
|---|---|---|---|
| Hanami | pizzicati morbidi | circa 92 | re |
| Tanabata | carillon e arpeggi "di stelle" | circa 100 | mi |
| Hanabi | flauto e tamburi da festa | circa 116 | sol |
| Aki Matsuri | taiko pieni, ritmo da corteo | circa 120 | la |
| Yuki Matsuri | rado, con campanelli | circa 84 | re |

Stinger: inizio Serata, fine Serata, ★ ottenuta, Gran Serata. Mappa e Bottega usano un giro breve e quieto, sempre sulla yo.

## Effetti

Ogni effetto ha piccole variazioni casuali di altezza e volume. Campanelle e monete scelgono sempre note della scala del Matsuri in corso, così non stonano con la musica. Si limita il numero di suoni che suonano insieme.

| Momento | Suono |
|---|---|
| Tocco su una Postazione | tocco morbido |
| Piatto che cuoce (takoyaki, taiyaki, ramen) | sfrigolio che sale poco prima che si bruci: è anche un avviso |
| Piatto pronto | campanella, una nota diversa per ogni Piatto |
| Piatto sul Bancone | tocchetto |
| Cliente servito | monete |
| Mancia | tintinnio in più sopra le monete |
| Yen d'oro | glissando brillante |
| Piatto bruciato | botto sordo e sbuffo (Fumo) |
| Piatto sbagliato | due note discendenti |
| Lamento (Cliente a 2 e a 1 cuoricino) | "mmh" breve e morbido, una volta per scalino e per Cliente, mai una voce né un grido; più piano della musica |
| Pazienza finita | boing piccolo e buffo |
| Croccola coccolata | fusa |
| Corvo | "kaa kaa" |
| Hanafubuki | fruscio di petali |
| Fuochi (Hanabi) | boom e scoppiettio |
| Desideri (Tanabata) | brillio di stelle |
| Corteo del mikoshi | colpi di taiko a tempo del corteo |

Il "wasshoi" dei portatori è solo un ritmo di taiko, senza voce sintetizzata.

## Accessibilità

Nessuna informazione passa solo dal suono: ogni avviso (Piatto che sta per bruciarsi, Pazienza, Evento) ha anche un segnale visivo.

## Come si verifica

Playwright non sente l'audio e `window.advanceTime` non fa avanzare l'orologio di `AudioContext`. Perciò:

- il giro musicale è una **funzione pura**: dati Matsuri, battuta e strati accesi, restituisce le note. Si prova con test normali;
- `window.render_game_to_text()` mostra lo stato dell'audio: sbloccato o no, musica accesa o no, brano e strati attivi;
- l'ascolto vero, con cuffie e altoparlante del telefono, lo fa Giuseppe.
