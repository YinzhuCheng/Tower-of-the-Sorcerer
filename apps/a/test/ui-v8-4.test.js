import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('V10 HUD stacks four icon stats and fits generated card art inside frames', async () => {
  const [html, styles, ui4, ui5, portraits, build] = await Promise.all([
    readFile(join(root, 'index.html'), 'utf8'),
    readFile(join(root, 'styles.css'), 'utf8'),
    readFile(join(root, 'ui-v8-4.css'), 'utf8'),
    readFile(join(root, 'ui-v8-5.css'), 'utf8'),
    readFile(join(root, 'src/game/anime-portraits.js'), 'utf8'),
    readFile(join(root, 'scripts/build.mjs'), 'utf8')
  ]);

  assert.match(styles, /ui-v8-4\.css\?v=4/);
  assert.match(html, /ui-v8-5\.css\?v=5/);
  assert.match(html, /stat-row-v85/);
  assert.match(ui5, /grid-template-columns:1fr!important/);
  assert.match(ui5, /grid-template-columns:24px minmax\(0,1fr\)!important/);
  assert.match(ui5, /white-space:nowrap!important/);
  assert.match(ui5, /font-variant-numeric:tabular-nums/);

  for (const id of ['stat-hp', 'stat-atk', 'stat-def', 'stat-gold']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  for (const label of ['生命', '攻击', '防御', '金币']) {
    assert.match(html, new RegExp(`aria-label="${label}"`));
  }
  assert.doesNotMatch(html, /<dt>\s*(生命|攻击|防御|金币)\s*<\/dt>/);

  // V10.3: ATK uses a purpose-drawn broad sword at HUD scale instead of the
  // thin legacy path, and generated cards never show duplicate circle emblems.
  assert.match(ui5, /\.atk-entry \.stat-icon\{display:none!important\}/);
  assert.match(ui5, /\.atk-entry \.stat-glyph::before/);
  assert.match(ui5, /data:image\/svg\+xml/);
  assert.match(ui5, /\.card-wallet-v85 \.card-emblem\{display:none!important\}/);
  assert.match(ui5, /\.card-wallet-v85 \.card-ui-art/);
  assert.match(ui5, /transform:translateX\(-50%\)!important/);
  assert.match(ui5, /overflow:hidden!important/);
  assert.match(portraits, /card-sun-v10/);
  assert.match(portraits, /card-moon-v10/);
  assert.match(portraits, /card-star-v10/);
  assert.match(portraits, /querySelector\('\.card-emblem'\)\?\.remove\(\)/);

  assert.match(build, /ui-v8-4\.css/);
  assert.match(build, /dist\/ui-v8-4\.css/);
  assert.match(build, /ui-v8-5\.css/);
  assert.match(build, /dist\/ui-v8-5\.css/);
  assert.match(ui4, /\.card-wallet\.framed-wallet/);
});
