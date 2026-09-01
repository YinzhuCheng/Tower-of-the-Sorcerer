import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('the dialogue modal renders authored exchanges one turn at a time', async () => {
  const source = await readFile(join(root, 'src/main.js'), 'utf8');
  assert.match(source, /Array\.isArray\(dialogue\.turns\) && dialogue\.turns\.length > 0/);
  assert.match(source, /下一句/);
  assert.match(source, /上一句/);
  assert.match(source, /turn\.portrait/);
  assert.match(source, /after\?\.\(\)/);
});

test('story presentation owns an isolated Gal layer instead of the scrollable tactical modal', async () => {
  const [html, source, css] = await Promise.all([
    readFile(join(root, 'index.html'), 'utf8'),
    readFile(join(root, 'src/main.js'), 'utf8'),
    readFile(join(root, 'ui-v10-cinematics.css'), 'utf8')
  ]);

  assert.match(html, /id="gal-root" class="gal-root hidden"/);
  assert.match(source, /elements\.galRoot\.innerHTML/);
  assert.match(source, /<div class="gal-shell">/);
  assert.match(source, /elements\.galRoot\.querySelectorAll\('\[data-gal-control\]'/);
  assert.match(source, /elements\.galRoot\.classList\.contains\('hidden'\)/);
  assert.match(css, /\.gal-root\{[\s\S]*?overflow:hidden/);
  assert.match(css, /\.gal-root \.gal-shell\{[\s\S]*?aspect-ratio:16 \/ 9/);
  assert.match(css, /\.gal-root \.gal-standing\{[\s\S]*?object-position:center bottom/);
});
