import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('V8 installs four UI themes and removes the old V7 sidecar entrypoint', async () => {
  const html = await readFile(join(root, 'index.html'), 'utf8');
  const css = await readFile(join(root, 'anime.css'), 'utf8');
  const main = await readFile(join(root, 'src/main.js'), 'utf8');

  assert.match(html, /id="btn-theme"/);
  assert.match(html, /data-theme="night"/);
  assert.doesNotMatch(html, /visual-cleanup-v7\.js/);
  assert.match(main, /installV8VisualLayer/);
  assert.match(main, /applySceneThemeV8/);

  for (const theme of ['night', 'sun', 'ocean', 'forest']) {
    assert.match(css, new RegExp(`body\\[data-theme="${theme}"\\]`));
  }

  assert.match(css, /\.stat-grid>div\{display:flex/);
  assert.match(css, /\.card-token\+\.card-token\{border-left/);
});

test('V8 scene layer uses gray walls, blue corridors and explicit card rendering', async () => {
  const source = await readFile(join(root, 'src/game/visual-theme-v8.js'), 'utf8');

  assert.match(source, /#242a31/);
  assert.match(source, /#173548/);
  assert.match(source, /wall-surface-v6/);
  assert.match(source, /wall-edge-horizontal-v6/);
  assert.match(source, /grayscale\(\.88\)/);
  assert.match(source, /programmatic-card-v8/);
  assert.match(source, /sun: \{ rgb:/);
  assert.match(source, /moon: \{ rgb:/);
  assert.match(source, /star: \{ rgb:/);
  assert.match(source, /fillText\(style\.symbol/);
  assert.match(source, /cornerPlacement/);
  assert.doesNotMatch(source, /state\.x\s*[+\-]=/);
  assert.doesNotMatch(source, /state\.y\s*[+\-]=/);
});
