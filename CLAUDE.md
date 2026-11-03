# I giochi di Maurizio

Giochi per browser di "Maurizio Influencer Official", l'orsetto di peluche influencer. I giochi già pubblicati sono qui: https://maurizioinfluencerofficial.mirkoforesti.it/

## Stack

- Maurizio Yatai: **Phaser 4.2 + Vite** (ES modules), la versione per cui sono scritte le skill in `.claude/skills/` (ADR-0002). Installa `phaser@4.2.1` con la versione esatta.
- I giochi già online usano Phaser 3.90. Quando prendi spunto dal loro codice, riscrivi ogni chiamata con le API di Phaser 4.
- Mini-giochi: canvas vanilla, come Pizza Run e Coccinella.
- Per implementare un gioco parti dalla skill `router`: sceglie le skill di game dev in `.claude/skills/` adatte al compito.

## Riferimenti

- `docs/adr/`: le decisioni di progetto. Leggile prima di cambiare lo stack o la struttura del gioco.
- `GLOSSARY.md`: il vocabolario del gioco in sviluppo (Maurizio Yatai). Usa questi termini nel codice, nei testi e nei commenti.
- `GAME_SPEC.md` e `PIANO.md`: cosa costruire per Maurizio Yatai e in che ordine. `BACKLOG.md`: le idee rimandate, da non implementare adesso.
- `RICERCA-skills-prompt-giochi.md`: skill e prompt raccolti, la mappa gioco → genere e un prompt base. Leggilo quando inizi un gioco nuovo.
