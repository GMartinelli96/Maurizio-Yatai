// Numeri casuali ripetibili: il kit non usa mai Math.random, così ogni disegno esce
// identico a ogni avvio e gli screenshot dei test si possono confrontare.

// Da una stringa a un intero a 32 bit (FNV-1a).
export function hashString(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Mulberry32: piccolo, veloce e abbastanza vario per dei tratti di matita.
export function createRng(seed) {
  let s = (typeof seed === 'string' ? hashString(seed) : seed) >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  next.range = (min, max) => min + (max - min) * next();
  // Un numero intorno a zero, tra -amount e +amount.
  next.jitter = (amount) => (next() * 2 - 1) * amount;
  return next;
}
