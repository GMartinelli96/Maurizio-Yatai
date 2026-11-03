# 13: Gli sfondi dei 5 Matsuri

**What to build:** Ogni Matsuri ha il suo sfondo dietro lo Yatai, disegnato con il kit e con la sua stagione: Hanami (primavera), Tanabata (inizio estate), Hanabi (piena estate), Aki Matsuri (autunno), Yuki Matsuri (inverno). Anche la mappa delle Serate riprende i 5 Matsuri. È la parte grafica del passo 8 di PIANO.md.

**Blocked by:** 12 (I Matsuri e la mappa delle Serate)

**Status:** ready-for-agent

- [ ] I 5 sfondi ci sono e si riconosce la stagione di ognuno.
- [ ] A 360×640 lo Yatai, i Piatti e le nuvolette restano in primo piano e leggibili su ogni sfondo.
- [ ] La mappa delle Serate mostra i 5 Matsuri con il loro stile.
- [ ] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot dei 5 sfondi sono guardati uno per uno e la console non ha errori.

## Comments

Anticipata la parte grafica dietro lo Yatai (ticket 32, passo "sfondi a tema" tra il passo 2 e il passo 3): `TEMI` in `config.js`, gli sfondi dei 5 Matsuri, pavimento, tendina e cuscini a tema, i test sui contrasti. Con quello il primo criterio ("i 5 sfondi ci sono e si riconosce la stagione") e il secondo ("a 360×640 lo Yatai, i Piatti e le nuvolette restano in primo piano") sono già soddisfatti per la scena dello Yatai; restano da rivedere quando ci saranno i Clienti veri con le nuvolette (ticket 04).

Questo ticket resta aperto per quello che manca: **la mappa delle Serate con i 5 Matsuri nel loro stile** (riusando i `TEMI` e il kit), la schermata del titolo se si vorrà a tema, e la verifica di PIANO.md sulla mappa. Gli Eventi (mikoshi compreso, ticket 14-15) non fanno parte degli sfondi.
