import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const ROOT = new URL('../', import.meta.url);

function webpDimensions(buffer) {
  assert.equal(buffer.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(buffer.subarray(8, 12).toString('ascii'), 'WEBP');
  const chunk = buffer.subarray(12, 16).toString('ascii');
  if (chunk === 'VP8 ') return [buffer.readUInt16LE(26) & 0x3fff, buffer.readUInt16LE(28) & 0x3fff];
  if (chunk === 'VP8L') {
    const bits = buffer.readUInt32LE(21);
    return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
  }
  if (chunk === 'VP8X') return [buffer.readUIntLE(24, 3) + 1, buffer.readUIntLE(27, 3) + 1];
  throw new Error(`unsupported WebP chunk ${JSON.stringify(chunk)}`);
}

test('B2 runtime manifest publishes all accepted standees with exact hashes and alpha', async () => {
  const manifest = JSON.parse(await readFile(new URL('art/visual-novel/05_manifests/b2-runtime-accepted-20260921-v1.json', ROOT), 'utf8'));
  assert.equal(manifest.active_b2_slots, 25);
  assert.equal(manifest.supplemental_guide_expressions, 2);
  assert.equal(manifest.runtime_count, 27);

  for (const asset of manifest.assets) {
    const runtime = await readFile(new URL(asset.runtime, ROOT));
    assert.deepEqual(webpDimensions(runtime), [1024, 1536], asset.slot);
    assert.equal(createHash('sha256').update(runtime).digest('hex'), asset.runtime_sha256, asset.slot);
    assert.ok(runtime.includes(Buffer.from('ALPH')) || runtime.subarray(12,16).toString('ascii') === 'VP8L', `${asset.slot} alpha`);
  }
});

test('GAL expression mapping is promoted to the B2 runtime namespace', async () => {
  const source = await readFile(new URL('src/game/anime-portraits.js', ROOT), 'utf8');
  const required = [
    'hero-resolve-b2.webp','hero-guarded-b2.webp','hero-embers-b2.webp',
    'guide-gentle-b2.webp','guide-focus-b2.webp','guide-watchful-b2.webp','guide-lament-b2.webp',
    'final-queen-sorrow-b2.webp','final-queen-cold-b2.webp','final-queen-knowing-b2.webp','final-queen-resolve-b2.webp',
    'cat-boss-alert-b2.webp','fox-boss-watchful-b2.webp','whale-boss-lament-b2.webp',
    'sword-boss-stern-b2.webp','dragon-boss-embers-b2.webp','astral-boss-focus-b2.webp',
    'shadow-boss-guarded-b2.webp','echo-regent-grave-b2.webp','echo-regent-release-b2.webp',
    'arcane-sovereign-regret-b2.webp','arcane-sovereign-acceptance-b2.webp',
    'archive-warden-duty-b2.webp','palace-warden-duty-b2.webp',
    'black-seal-keeper-watchful-b2.webp','last-custodian-release-b2.webp'
  ];
  for (const file of required) assert.match(source, new RegExp(file.replace('.', '\\.')));
});
