import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = join(root, 'public/assets/anime/enemies/manifest.json');
const runtimeCharacters = [
  'liyue-runtime.webp',
  'shawu-runtime.webp',
  'noctia-runtime.webp',
  'echo-regent-runtime.webp',
  'arcane-sovereign-runtime.webp'
];

function runtimePath(basePath, relativePath) {
  const base = basePath.replace(/^\//, '');
  return join(root, 'public', base, relativePath);
}

function assertWebP(base64, label) {
  const data = Buffer.from(base64.trim(), 'base64');
  assert.ok(data.length > 16, `${label} must not be empty`);
  assert.equal(data.subarray(0, 4).toString('ascii'), 'RIFF', `${label} must have a RIFF header`);
  assert.equal(data.subarray(8, 12).toString('ascii'), 'WEBP', `${label} must be WebP`);
}

test('enemy art manifest resolves all generated enemy and NPC entries, including Act III', async () => {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const entries = Object.entries(manifest.assets ?? {});
  assert.equal(manifest.assets.mote?.file, 'enemies/v1/mote-map-128.webp');
  for (const key of [
    'act3_cinder_scribe', 'act3_ash_custodian', 'act3_shelter_warden', 'act3_audit_bailiff',
    'act3_relay_runner', 'act3_relay_conductor', 'act3_ledger_mage', 'act3_archive_lancer',
    'act3_shelf_warden', 'act3_triage_knight', 'act3_margin_duelist', 'act3_errata_cantor',
    'act3_archive_marshal', 'act3_index_beast', 'act3_last_custodian', 'act3_archive_warden',
    'act3_errata_core'
  ]) assert.match(manifest.assets[key]?.file ?? '', /^enemies\/act3\/.*-map-384\.webp$/);

  for (const key of ['void_core', 'palace_warden_v2', 'black_seal_keeper_v2', 'echo_regent', 'arcane_sovereign']) {
    assert.match(manifest.assets[key]?.file ?? '', /^enemies\/v2\/.*-map-384\.webp$/, `${key} must have a dedicated map sprite`);
  }

  for (const key of [
    'vine_druid', 'shell_guard', 'blade_priestess', 'crown_knight',
    'dragon_guard', 'dusk_dragon', 'comet_archer'
  ]) assert.match(manifest.assets[key]?.file ?? '', /^enemies\/v3\/.*-map-384\.webp$/, `${key} must have a dedicated identity sprite`);

  const bundleCache = new Map();
  for (const [portrait, meta] of entries) {
    const sourceCount = [meta.file, meta.base64File, meta.bundle].filter(Boolean).length;
    assert.equal(sourceCount, 1, `${portrait} must declare exactly one asset source`);

    if (meta.file) {
      const data = await readFile(runtimePath(manifest.basePath, meta.file));
      assert.ok(data.length > 16, `${portrait} file must not be empty`);
      if (meta.file.startsWith('enemies/act3/') || meta.file.startsWith('enemies/v2/') || meta.file.startsWith('enemies/v3/')) {
        assert.ok(data.includes(Buffer.from('ALPH')), `${portrait} must retain native alpha`);
      }
      continue;
    }

    if (meta.base64File) {
      const base64 = await readFile(runtimePath(manifest.basePath, meta.base64File), 'utf8');
      assertWebP(base64, portrait);
      continue;
    }

    const bundlePath = runtimePath(manifest.basePath, meta.bundle);
    if (!bundleCache.has(bundlePath)) {
      bundleCache.set(bundlePath, JSON.parse(await readFile(bundlePath, 'utf8')));
    }
    const payload = bundleCache.get(bundlePath);
    assert.equal(typeof payload[meta.key], 'string', `${portrait} bundle key must exist`);
    assertWebP(payload[meta.key], portrait);
  }
});

test('runtime dialogue portraits are compact standalone WebP files', async () => {
  for (const filename of runtimeCharacters) {
    const data = await readFile(join(root, 'public/assets/anime/characters', filename));
    assertWebP(data.toString('base64'), filename);
    assert.ok(data.length < 80_000, `${filename} should remain suitable for ordinary Git and first load`);
  }
});
