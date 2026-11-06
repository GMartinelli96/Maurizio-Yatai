# 06: Il look della mappa

**Type:** prototype
**Blocked by:** None
**Status:** open

## Question

Come **si vede** la mappa? Serve l'approvazione di Giuseppe prima di qualunque disegno vero. Fare con la skill `prototype` un abbozzo usa-e-getta (fuori da `yatai/src/`, su un ramo o in `.scratch/yatai-matsuri-e-mappa/assets/`) di **due o tre varianti** del look, da guardare a 360×640 e a 390×844, e da cui Giuseppe sceglie:

- **La mappa dei 5 Matsuri**: cinque stazioni grandi (un paesaggio per stagione, riusando i colori di `TEMI`), con il nome del Matsuri, il Piatto nuovo, le stelle ("★ 7/18") e lo stato (aperto, chiuso, bloccato). Come si dispongono su un 360×640 (un sentiero a curve come nella mappa di Nella Bug Saga, una colonna scorrevole, un anno a cerchio)? Dove stanno la Bottega e "indietro".
- **La strada delle 6 Serate** di un Matsuri: nodi tondi con numero e tre stelle sotto (come nella mappa di Nella), il sentiero, il cartello col nome, la Gran Serata in fondo (nodo più grande, decorazione), stati aperto, chiuso e finito. Nodi da 44 px o più.
- **La Serata attuale** e come si indica (la zampina, un nodo che respira) e **come si capisce che c'è un Matsuri nuovo da aprire**.
- **Il titolo** (la schermata iniziale) con i due pulsanti che ci sono già, nel look scelto.
- **Con la stessa regola di prima**: niente testi che non siano nei tre set di lingue, tutto disegnabile con il kit a matita, niente bacchette né bandiera del Sol Levante, `riduci movimento` rispettato.

Chiedere a Giuseppe, a risposta data: **quanto si disegna nel ticket 12** (segnaposto con i colori di `TEMI` e il kit già pronto, o disegni veri) **e quanto passa al ticket 13**, che ha tenuto per sé "la mappa con i 5 Matsuri nel loro stile". Il risultato è: la variante scelta, con i suoi screenshot, e quella regola di spartizione tra 12 e 13.

Riferimenti: `docs/stile/confronto/suite-nella-mappa-1280x720.png` e `matsuri-affiancati.png`, `docs/stile/art-direction-brief.md`, `TEMI` in `config.js`, `yatai/src/disegni/sfondi/`. Skill: `prototype`, `create-game-assets`, `game-ui-ux`.
