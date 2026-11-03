# 23: L'audio

**What to build:** Tutto l'audio è generato dal codice (ADR-0001): la musica sulla scala pentatonica giapponese, con una variante per ogni Matsuri, e gli effetti (sfrigolio, campanella, monete). L'audio si sblocca al primo tocco, come chiedono i browser; il tasto M accende e spegne la musica. È il passo 11 di PIANO.md, con la skill `audio-design`.

Il disegno (bus, livelli, brani per Matsuri, elenco degli effetti) è in [docs/design/audio.md](../../../docs/design/audio.md).

**Blocked by:** 12 (I Matsuri e la mappa delle Serate)

**Status:** ready-for-agent

- [ ] Il gioco non carica nessun file audio.
- [ ] Ogni Matsuri ha la sua variante della musica.
- [ ] Gli effetti accompagnano le azioni (cottura, servizio, Incasso) senza coprire la musica.
- [ ] Il "mmh" del Lamento (morbido, breve, mai una voce) suona una volta per scalino e per Cliente (2 e 1 cuoricino), sotto la musica, con piccole variazioni di altezza; con più Clienti che si lamentano insieme non si sommano oltre il limite di suoni contemporanei. L'evento viene dal ticket 36.
- [ ] Prima del primo tocco non ci sono errori audio in console; dopo, l'audio parte.
- [ ] Il tasto M accende e spegne la musica.
- [ ] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, lo stato dell'audio compare in `window.render_game_to_text()` e la console non ha errori.

## Comments

### Dalla mappa yatai-economia-e-cucina (2026-11-03)

Ricaduta del ticket 03 della mappa (Lamento). Cambiato: un criterio nuovo sul "mmh" e la riga corrispondente in [docs/design/audio.md](../../../docs/design/audio.md), tabella degli effetti. Lacuna notata, non nelle ricadute: con la cucina a tocchi servono anche i suoni del tocco su una Scorta (Ingrediente pagato) e della Scorta che trema (ordine sbagliato); l'elenco di `audio.md` ha solo "Tocco su una Postazione". Da aggiungere quando si inizia il ticket.

Dal ticket 34 (2026-11-03): servono il tintinnio della Serie che sale di tono a ogni scalino (sulla scala del Matsuri), il "pof" morbido quando si spezza e il suono dell'ondata (il segnale 2 s prima è visivo; qui si aggiunge il suono). Nessuna informazione solo dal suono.
