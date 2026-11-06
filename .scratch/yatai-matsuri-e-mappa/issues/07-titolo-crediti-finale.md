# 07: Titolo, crediti e finale

**Type:** grilling
**Blocked by:** None
**Status:** open

## Question

Decidere con Giuseppe **che cosa dicono la schermata iniziale e i crediti**, e **che cosa succede quando si vince la Gran Serata dello Yuki Matsuri**, l'ultima:

- **Il titolo.** `TitleScene` oggi ha "Maurizio Yatai", il sottotitolo, "sviluppato da Maurizio Influencer Official" (`developedBy`), Gioca e Bottega. Il criterio del ticket 12 vuole "sviluppato da Maurizio Influencer Official" sulla schermata iniziale: già c'è, resta com'è? Il titolo cambia con il tema di un Matsuri (e quale)?
- **I crediti.** Dove si aprono (un pulsante piccolo sul titolo, la fine del gioco, tutti e due) e che cosa dicono: "un regalo di Giuseppe" (criterio del ticket 12), il nome del gioco in giapponese (マウリツィオの屋台, やたい), la licenza dei font (Comic Neue con OFL; Klee One quando arriva dal passo 12 di `PIANO.md`, con `OFL.txt` consegnato), Maurizio Influencer Official come autore del gioco. Quali testi sono nelle tre lingue. Come si esce.
- **Il finale.** Vinta la Gran Serata dello Yuki Matsuri non c'è un altro Matsuri da aprire. Cosa si vede (una festa, i crediti, un ringraziamento, un nuovo Vestito di fine gioco, una semplice mappa con tutto aperto) e se si ripresenta ogni volta o solo la prima. Senza introdurre contenuto nuovo che non sia nel `BACKLOG.md`.
- **Il selettore della lingua.** Esiste già un selettore (ticket 24)? Dove sta (sul titolo, nei crediti) e se qui si lascia il segnaposto.
- **Lo spazio.** Tutto deve stare a 360×640 e a 390×844 in italiano, inglese e giapponese.

Fatti: `yatai/src/scenes/TitleScene.js`, `yatai/src/testi/*.js` (`developedBy`, `subtitle`), GAME_SPEC.md ("Contorno", "Il regalo"), `docs/ricerca/font-giapponese.md`. Skill: `game-ui-ux`, `grilling`.
