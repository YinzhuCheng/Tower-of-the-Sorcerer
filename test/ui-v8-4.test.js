import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('V8.5 HUD keeps all four stats on one icon-first row and renders explicit card SVGs', async () => {
  const [html, styles, ui4, ui5] = await Promise.all([
    readFile(join(root, 'index.html'), 'utf8'),
    readFile(join(root, 'styles.css'), 'utf8'),
    readFile(join(root, 'ui-v8-4.css'), 'utf8'),
    readFile(join(root, 'ui-v8-5.css'), 'utf8')
  ]);

  assert.match(styles, /ui-v8-4\.css/);
  assert.match(html, /ui-v8-5\.css\?v=1/);
  assert.match(html, /stat-row-v85/);
  assert.match(ui5, /grid-template-columns:minmax\(0,1\.75fr\) repeat\(3,minmax\(0,\.72fr\)\)/);
  assert.match(ui5, /white-space:nowrap!important/);
  assert.match(ui5, /font-variant-numeric:tabular-nums/);

  for (const id of ['stat-hp', 'stat-atk', 'stat-def', 'stat-gold']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  for (const label of ['生命', '攻击', '防御', '金币']) {
    assert.match(html, new RegExp(`aria-label="${label}"`));
  }
  assert.doesNotMatch(html, /<dt>\s*(生命|攻击|防御|金币)\s*<\/dt>/);

  assert.match(html, /card-wallet-v85/);
  assert.match(html, /card-icon-svg sun-icon/);
  assert.match(html, /card-icon-svg moon-icon/);
  assert.match(html, /card-icon-svg star-icon/);
  assert.doesNotMatch(html, /<small>(日曜|月华|星穹)<\/small>/);
  assert.match(ui5, /\.card-wallet-v85 \.card-icon-svg/);

  // V8.4 stays as the visual foundation; V8.5 only overrides the compact strip and card glyph rendering.
  assert.match(ui4, /\.card-wallet\.framed-wallet/);
});
