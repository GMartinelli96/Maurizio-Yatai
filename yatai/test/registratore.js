// Un finto canvas che registra ogni chiamata e ogni proprietà impostata: due disegni sono uguali
// se le registrazioni sono uguali. I pixel di ImageData si registrano come impronta. Non c'è
// nessuna dipendenza dal browser, quindi i test dei disegni girano con `npm test`.
//
// (test/kit.test.js ha la sua copia, scritta al passo 1: qui serve a chi disegna senza toccarla.)
// L'impronta si calcola mano a mano, senza tenere in memoria la registrazione intera: i disegni
// grandi fanno centinaia di migliaia di chiamate. Con `tieni: true` la registrazione si conserva.

import { drawEntry } from '../src/disegni/catalogo.js';

const FNV = 0x01000193;

function fingerprint(bytes) {
  let h = 0x811c9dc5;
  for (const b of bytes) h = Math.imul(h ^ b, FNV);
  return `bytes:${h >>> 0}`;
}

export function recordingContext({ tieni = false } = {}) {
  const log = [];
  const metodi = new Set();
  let calls = 0;
  let hash = 0x811c9dc5;
  const mescola = (voce) => {
    calls += 1;
    if (tieni) log.push(voce);
    // Ogni valore diventa testo e il testo entra nell'impronta (FNV-1a), senza costruire la registrazione.
    let text = '';
    for (let i = 0; i < voce.length; i++) text += `${voce[i]}|`;
    for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), FNV);
  };
  const serialize = (v) => (v?.data instanceof Uint8ClampedArray ? fingerprint(v.data) : v);
  const metodoDi = new Map();
  const creaMetodo = (prop) => (...args) => {
    metodi.add(prop);
    const voce = [prop];
    for (const a of args) voce.push(serialize(a));
    mescola(voce);
    if (prop === 'createImageData') {
      return { width: args[0], height: args[1], data: new Uint8ClampedArray(args[0] * args[1] * 4) };
    }
    return undefined;
  };
  const ctx = new Proxy({}, {
    get(target, prop) {
      if (prop in target) return target[prop];
      let metodo = metodoDi.get(prop);
      if (!metodo) metodoDi.set(prop, (metodo = creaMetodo(prop)));
      return metodo;
    },
    set(target, prop, value) {
      target[prop] = value;
      mescola(['=', prop, value]);
      return true;
    },
  });
  return { ctx, log, metodi, get calls() { return calls; }, digest: () => (hash >>> 0).toString(16) };
}

// Quante chiamate fa un disegno, l'impronta dell'intera registrazione e i metodi usati.
export function record(key, entry, options) {
  const registro = recordingContext(options);
  drawEntry(registro.ctx, key, entry);
  return { calls: registro.calls, digest: registro.digest(), metodi: registro.metodi, log: registro.log };
}
