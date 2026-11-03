import it from './testi/it.js';
import en from './testi/en.js';
import ja from './testi/ja.js';

export const TESTI = { it, en, ja };
const STORAGE_KEY = 'yatai.lingua';
// Per un dispositivo in una lingua che non abbiamo, l'inglese è la scelta più comprensibile.
const FALLBACK = 'en';

let current = FALLBACK;

// languages: l'elenco di navigator.languages, per esempio ['fr-FR', 'it'].
export function detectLanguage(languages = []) {
  for (const tag of languages) {
    const code = String(tag).toLowerCase().split('-')[0];
    if (code in TESTI) return code;
  }
  return FALLBACK;
}

// La scelta del selettore, se c'è, vince sulla lingua del dispositivo.
export function initLanguage() {
  let saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch { /* storage bloccato */ }
  current = saved in TESTI ? saved : detectLanguage(navigator.languages ?? [navigator.language]);
  document.documentElement.lang = current;
  return current;
}

export function setLanguage(code, { save = true } = {}) {
  if (!(code in TESTI)) throw new Error(`Lingua sconosciuta: ${code}`);
  current = code;
  if (save) {
    try { localStorage.setItem(STORAGE_KEY, code); } catch { /* storage bloccato */ }
  }
}

export const getLanguage = () => current;

// Un testo mancante in una traduzione ripiega sull'italiano, poi sulla chiave stessa.
export const t = (key) => TESTI[current][key] ?? TESTI.it[key] ?? key;
