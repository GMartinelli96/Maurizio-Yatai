# 21: Il Ricettario

**What to build:** Il Ricettario, raggiungibile dalla mappa: una scheda per ogni Piatto sbloccato, con una curiosità vera e come si prepara nello Yatai: la **Ricetta** del Piatto, cioè la sequenza degli Ingredienti a icone, la stessa che si vede sotto la Postazione. Onigiri e kakigōri hanno anche una ricetta da fare a casa "con un grande". Il gioco è pensato per tutte le età.

**Blocked by:** 16 (Il salvataggio)

**Status:** ready-for-agent

- [ ] Ci sono solo le schede dei Piatti già sbloccati.
- [ ] La scheda mostra la Ricetta a icone leggendo gli stessi dati di `config.js` che usa la Serata (non una copia), con la variante scelta se il Piatto ne ha; un test controlla che le due sequenze coincidano.
- [ ] Le curiosità sono vere: le fonti sono annotate in fondo a questo file, sotto `## Comments`.
- [ ] Le due ricette sono adatte a un bambino con un adulto e dicono quando serve il grande.
- [ ] I testi sono in tutte e tre le lingue e stanno nelle schede a 360×640.
- [ ] Verificato come dice PIANO.md: si parte dalla skill `router`, Playwright manda gli input e avanza il tempo con `window.advanceTime`, gli screenshot sono guardati davvero, lo stato nuovo compare in `window.render_game_to_text()` e la console non ha errori.

## Comments

### Dalla mappa yatai-economia-e-cucina (2026-11-03)

Ricaduta dei ticket 01 e 02 della mappa. Cambiato: "come si prepara nello Yatai" è la **Ricetta** (la lista degli Ingredienti a icone, la stessa della Postazione) e un criterio nuovo la tiene su una sola fonte di dati. Attenzione ai nomi: la "ricetta da fare a casa" di onigiri e kakigōri non è la Ricetta del glossario; nei testi del gioco chiamala "da fare a casa" per non confonderle.
