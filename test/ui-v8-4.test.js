import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('V8.4 HUD uses icon-only stat labels and compact framed card counters', async () => {
  const [html, styles, ui] = await Promise.all([
    readFile(join(root, 'index.html'), 'utf8'),
    readFile(join(root, 'styles.css'), 'utf8'),
    readFile(join(root, 'ui-v8-4.css'), 'utf8')
  ]);

  assert.match(styles, /ui-v8-4\.css/);
  for (const kind of ['hp', 'atk', 'def', 'gold']) {
    assert.match(html, new RegExp(`stat-icon ${kind}`));
  }
  assert.doesNotMatch(html, /<dt>\s*(生命|攻击|防御|金币)\s*<\/dt>/);
  assert.match(html, /class="card-wallet framed-wallet"/);
  assert.doesNotMatch(html, /<small>(日曜|月华|星穹)<\/small>/);

  assert.match(ui, /white-space:nowrap!important/);
  assert.match(ui, /\.card-wallet\.framed-wallet/);
  assert.match(ui, /\.stat-grid-icons/);
  assert.match(ui, /font-variant-numeric:tabular-nums/);
});
