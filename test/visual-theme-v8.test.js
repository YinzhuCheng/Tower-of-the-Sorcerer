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

test('V8.1 scene layer uses gray walls, light-blue slab corridors and navy exterior trim', async () => {
  const source = await readFile(join(root, 'src/game/visual-theme-v8.js'), 'utf8');

  assert.match(source, /#272c32/);
  assert.match(source, /#79b9d0/);
  assert.match(source, /#67a9c3/);
  assert.match(source, /#4f8da9/);
  assert.match(source, /wall-surface-v6/);
  assert.match(source, /wall-edge-horizontal-v6/);
  assert.match(source, /navy-perimeter-v8\.1/);
  assert.match(source, /rgba\(8,39,68,\.96\)/);
  assert.match(source, /symmetric-caps-v8\.1/);
  assert.doesNotMatch(source, /getMapAsset\('wall-outer-corner-v6'\)/);
  assert.doesNotMatch(source, /floor-main-v4/);
  assert.doesNotMatch(source, /floor-main'/);

  assert.match(source, /strict-border-only-v8\.1/);
  assert.match(source, /pixels\[i\] <= 22/);
  assert.match(source, /programmatic-card-v8/);
  assert.match(source, /sun: \{ rgb:/);
  assert.match(source, /moon: \{ rgb:/);
  assert.match(source, /star: \{ rgb:/);
  assert.match(source, /fillText\(style\.symbol/);
  assert.doesNotMatch(source, /state\.x\s*[+\-]=/);
  assert.doesNotMatch(source, /state\.y\s*[+\-]=/);
});
