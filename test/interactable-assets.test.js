import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = join(root, 'public/assets/anime/map/manifest.json');
const runtimeRoot = join(root, 'public/assets/anime/map');

const INTERACTABLE_ASSETS = [
  'seal-guardian-vault', 'switch-vine', 'seal-vine', 'seal-switch-single', 'seal-switch-dual',
  'seal-rune-sequence', 'seal-archive-index', 'relic-lucky-coin', 'relic-moon-blade',
  'relic-dragon-scale-talisman', 'relic-silent-ward-earring', 'relic-aether-prism',
  'relic-conduit-codex', 'relic-arcane-battery', 'relic-mirror-reservoir',
  'relic-crown-capacitor', 'relic-origin-focus', 'relic-shelter-aegis',
  'relic-audit-ledger', 'relic-relay-capacitor'
];

test('every generated interactable is a manifest-driven transparent runtime WebP', async () => {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  for (const id of INTERACTABLE_ASSETS) {
    const meta = manifest.assets[id];
    assert.equal(typeof meta?.file, 'string', `${id} must use a direct runtime file`);
    assert.match(meta.file, /^interactables\/.+\.webp$/, `${id} must remain in the interactables package`);
    const data = await readFile(join(runtimeRoot, meta.file));
    assert.ok(data.length > 12_000, `${id} must keep enough image detail for a map prop`);
    assert.equal(data.subarray(0, 4).toString('ascii'), 'RIFF', `${id} must be RIFF`);
    assert.equal(data.subarray(8, 12).toString('ascii'), 'WEBP', `${id} must be WebP`);
    assert.ok(data.includes(Buffer.from('ALPH')), `${id} must retain alpha transparency`);
  }
});
