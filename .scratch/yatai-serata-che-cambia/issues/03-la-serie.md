# 03: La Serie

**Type:** grilling
**Blocked by:** None
**Status:** resolved

## Question

Il ticket 34 di `maurizio-yatai` propone la **Serie**: servire più Clienti di fila, senza farne scuotere la testa e senza perderne nessuno, la fa salire; dà Mancia in più e un riscontro che cresce; se un Cliente se ne va o si serve a vuoto, si spezza, senza punizioni. "Serie" non è ancora in `GLOSSARY.md`. Decidere con Giuseppe:

- **Che cos'è, in una frase**, con il nome in tutte e tre le lingue (o un segno senza parole, come per il Lamento).
- **Che cosa la fa salire e cosa la spezza.** Salire: ogni Cliente servito. Spezzare: un Cliente che se ne va senza pagare; il Piatto sbagliato (il Cliente scuote la testa)? Un tocco fuori ordine su una Scorta **non** la spezza (non fa niente, regola della cucina a tocchi); un Piatto bruciato (dal ticket 06)? Si spezza del tutto o torna indietro di poco? Conta il tempo (una Serie "scade" se non si serve per X secondi)?
- **Che cosa dà.** Mancia in più: di quanto per gradino, con che tetto? Si somma alla Mancia della Pazienza (fino a +50% del prezzo) e a **Che stile!** (×1,2)? Pesa nell'Incasso netto quanto si vuole (la Mancia della Serie conta nelle Vendite)?
- **Il riscontro che cresce**: monete, Maurizio, un tintinnio. Quanti gradini, cosa si vede e si sente a ogni gradino, cosa succede con "riduci movimento", niente testi nelle tre lingue se si può evitare.
- **Tono per tutte le età.** La Serie rotta non deve far sentire in colpa un bambino: nessun suono negativo, nessuna faccia triste. Come si comunica che si è spezzata?
- **Come aiuta i giocatori lenti e punisce nessuno.** Il lento prende ★ anche senza Serie: la Serie è un premio per chi gioca bene, non una condizione. Va confermato.
- **Dove si vede nello stato** (`render_game_to_text()`) e nel recap di fine Serata (la Serie più lunga? Un Titolo?).

Vincoli: nessun game over a metà Serata, nessuna punizione. Non scrivere codice.

## Answer

Deciso con Giuseppe il 2026-11-03 nella sessione di domande sul ticket 34 di `maurizio-yatai`. Scritto in `GAME_SPEC.md` (voce **Serie**) e `GLOSSARY.md` (**Serie**), commit `1bedaa2`.

- **Sale** di 1 a ogni Ordine servito (il Bis di Marcella vale due). **Si spezza** (torna a 0) solo se un Cliente se ne va a Pazienza finita, anche a metà Bis, o se si tocca un Cliente con l'Ordine incompleto (scuote la testa). Un tocco fuori ordine su una Scorta e un Piatto bruciato **non** la spezzano. Niente scadenza a tempo.
- **Dà** Mancia: +10% per ogni Cliente di fila oltre il primo, tetto ×1,5 a 6 di fila. Vale per la Mancia, mai per il prezzo né per la Spesa. Si moltiplica con Che stile!, Yen d'oro e desideri senza altro tetto; il ticket 29 controlla che non ci siano Serate troppo generose (il "+9% al massimo" di Che stile! vale senza la Serie).
- **Riscontro:** numero piccolo vicino a Maurizio (×2, ×3, …), monete più generose, tintinnio che sale di tono a ogni scalino; quando si spezza un "pof" morbido, nessuna punizione. Segni senza parole, quindi niente testi da tradurre salvo "Serie più lunga" nel recap.
- **Recap e stato:** la "Serie più lunga" è nel recap (ticket 22) e i Titoli possono leggerla. La Serie si azzera a ogni Serata e non si salva.
- **Giocatori lenti:** la Serie è un premio, non una condizione: il lento prende ★ anche senza. Da confermare con il bot nel ticket 05.
