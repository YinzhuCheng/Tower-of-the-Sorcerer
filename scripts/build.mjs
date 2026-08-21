import { cp, mkdir, rm } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const dist = new URL('../dist/', import.meta.url);

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await Promise.all([
  cp(new URL('../index.html', import.meta.url), new URL('../dist/index.html', import.meta.url)),
  cp(new URL('../styles.css', import.meta.url), new URL('../dist/styles.css', import.meta.url)),
  cp(new URL('../anime.css', import.meta.url), new URL('../dist/anime.css', import.meta.url)),
  cp(new URL('../src', import.meta.url), new URL('../dist/src', import.meta.url), { recursive: true }),
  cp(new URL('../public', import.meta.url), dist, { recursive: true })
]);
console.log('Static build written to dist/.');
