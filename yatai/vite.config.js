import { defineConfig } from 'vite';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

// La stessa Content-Security-Policy con cui il sito serve i giochi di Maurizio (letta dagli header
// di /farmplush/). La usiamo anche in sviluppo, così uno script o uno stile inline si scopre subito.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data: blob:",
  "media-src 'self' data: blob:",
  "connect-src 'self'",
  "font-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ');

const headers = { 'Content-Security-Policy': CSP };

// A fine build scrive dist/sw.js con l'elenco dei file da salvare per l'uso offline.
// La versione è l'hash dei file: cambia a ogni pubblicazione e fa ricaricare la cache.
function serviceWorker() {
  let root;
  let outDir;
  return {
    name: 'yatai-service-worker',
    apply: 'build',
    configResolved(config) {
      root = config.root;
      outDir = resolve(root, config.build.outDir);
    },
    closeBundle() {
      const files = readdirSync(outDir, { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => relative(outDir, join(entry.parentPath, entry.name)).replaceAll('\\', '/'))
        .filter((file) => file !== 'sw.js')
        .sort();
      const hash = createHash('sha256');
      for (const file of files) hash.update(file).update(readFileSync(join(outDir, file)));
      const source = readFileSync(resolve(root, 'src/sw.js'), 'utf8')
        .replace('__VERSION__', JSON.stringify(hash.digest('hex').slice(0, 12)))
        .replace('__FILES__', JSON.stringify(['./', ...files.map((file) => `./${file}`)]));
      writeFileSync(join(outDir, 'sw.js'), source);
    },
  };
}

export default defineConfig({
  // Percorsi relativi: il gioco funziona da /yatai/ sul sito e da qualunque altra cartella.
  base: './',
  server: { headers },
  preview: { headers },
  // Phaser da solo pesa più di un megabyte: l'avviso standard di Vite (500 kB) qui non serve.
  build: { chunkSizeWarningLimit: 2000 },
  plugins: [serviceWorker()],
});
