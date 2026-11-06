# 02: La forma della curva

**Type:** grilling
**Blocked by:** 01
**Status:** open

## Question

Con il formato dei dati deciso, decidere con Giuseppe **come sale la difficoltà** nelle 30 Serate. Non i trenta numeri (li trova il ticket "Misurare le 30 Serate"), ma la forma e le regole, in modo che chi misura non debba inventarle:

- **Che cosa sale** dentro un Matsuri, dalla Serata 1 alla 5 e poi alla Gran Serata: l'obiettivo, la frequenza degli arrivi, la Pazienza in ondata, la quota degli Ordini da 2 e 3 Piatti, i Disturbatori, il cast. Quali di queste leve si usano e quali no, e quante per volta (una leva nuova per Serata, o più insieme).
- **La ripartenza al Matsuri dopo.** La decisione di partenza (fissata il 2026-11-05) è che la difficoltà ricomincia più morbida perché c'è un Piatto nuovo. Di quanto, e se vale lo stesso per tutti i Matsuri (il ramen dello Yuki Matsuri ha 4 tocchi e una cottura, il più duro).
- **Le prime Serate.** L'Hanami e la sua Serata 1 sono morbide (Pazienza in ondata più lunga, per esempio 20 s: con 18 s il lento perde ★ senza Serie). Quanto morbide, e dove la curva "normale" (15 s) comincia.
- **Gli Ordini da più Piatti.** Il Tanabata ha gli Ordini da 2 Piatti e lo Yuki Matsuri quelli da 3 (quota 15% oggi). Entrano di colpo alla Serata 1 o a poco a poco? Nell'Hanami restano solo da 1.
- **Le stelle.** Le soglie sono ×1, ×1,3, ×1,6 dell'obiettivo (`SERATA.starThresholds`). Valgono per tutte le 30 o la Gran Serata ne ha di sue? Il bersaglio per ognuna: il lento prende ★, l'attento ★★, il rapido ★★★ (il bot "attento" prende ★★★ nell'Hanami: vedi il ticket 34).
- **La Gran Serata.** Quanto è più alta della Serata 5 (obiettivo e ritmo), tenendo conto che gli Eventi dei ticket 14 e 15 la renderanno più difficile o più facile a modo loro.
- **I Potenziamenti.** Il quarto Posto, il ventaglio e la Postazione più veloce (ticket 35 e 06) cambiano le misure: la curva è pensata per chi non li ha, per chi li ha al massimo, o regge tutti e due (l'attento senza Potenziamenti prende ★★)?
- **Il bersaglio di "bravura"** (rapido, attento, lento) che il ticket di misura deve rispettare in ogni Serata, e quanto margine (per esempio ★ del lento con almeno il 7% sopra la soglia, come nelle Serate di oggi).

Fatti da guardare: GAME_SPEC.md ("La Serata", Ondate, e le misure del bot lì dentro), i commenti sopra `SERATA_TANABATA`, `SERATA_HANABI`, `SERATA_AKI`, `SERATA_YUKI` in `config.js` (obiettivi misurati oggi: 1920, 2400, 2900, 3000, 3000), `docs/design/audio.md` (la Gran Serata ha il suo stinger). Skill: `level-design` (curva di tensione e riposo, pacing), `grilling`, `domain-modeling`.
