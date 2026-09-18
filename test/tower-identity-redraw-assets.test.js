import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const ROOT = new URL('../', import.meta.url);

async function bytes(path) {
  return readFile(new URL(path, ROOT));
}

function webpHasAlpha(buffer) {
  return buffer.includes(Buffer.from('ALPH')) || buffer.includes(Buffer.from('VP8L'));
}

function webpDimensions(buffer) {
  const chunk = buffer.subarray(12, 16).toString('ascii');
  if (chunk === 'VP8 ') return {
    width: buffer.readUInt16LE(26) & 0x3fff,
    height: buffer.readUInt16LE(28) & 0x3fff
  };
  if (chunk === 'VP8L') {
    const bits = buffer.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === 'VP8X') return {
    width: buffer.readUIntLE(24, 3) + 1,
    height: buffer.readUIntLE(27, 3) + 1
  };
  throw new Error(`unsupported WebP chunk ${JSON.stringify(chunk)}`);
}

test('tower identity redraw v7 uses canonical transparent GAL identities directly', async () => {
  const transparent = [
    'public/assets/anime/map/atlases/runtime/hero-v6.webp',
    'public/assets/anime/characters/yayu-dialogue-guarded.webp',
    'public/assets/anime/characters/echo-regent-dialogue-grave.webp',
    'public/assets/anime/characters/arcane-sovereign-dialogue-regret.webp',
    'public/assets/anime/characters/archive-warden-dialogue-duty.webp'
  ];
  for (const path of transparent) {
    const buffer = await bytes(path);
    assert.ok(webpHasAlpha(buffer), `${path} must retain a native WebP alpha payload`);
  }

  await access(new URL('public/assets/anime/avatars/whale-boss-avatar-lament-v7.webp', ROOT));
  await access(new URL('public/assets/anime/avatars/dragon-boss-avatar-embers-audit-v3.webp', ROOT));
});

test('v7 avatars and low-noise CG redraws keep their runtime dimensions', async () => {
  for (const path of [
    'public/assets/anime/avatars/whale-boss-avatar-lament-v7.webp',
    'public/assets/anime/avatars/dragon-boss-avatar-embers-audit-v3.webp'
  ]) {
    const buffer = await bytes(path);
    assert.deepEqual(webpDimensions(buffer), { width: 512, height: 512 }, `${path} must remain a square avatar`);
    assert.ok(buffer.length > 20_000, `${path} must contain substantive art`);
  }

  for (const path of [
    'public/assets/anime/cg/liyue-noctia-truth-cg-audit-v3.webp',
    'public/assets/anime/cg/liyue-noctia-seal-cg-audit-v3.webp',
    'public/assets/anime/cg/liyue-echo-ledger-cg-audit-v3.webp',
    'public/assets/anime/cg/liyue-noctia-sovereign-cg-audit-v3.webp'
  ]) {
    const buffer = await bytes(path);
    assert.deepEqual(webpDimensions(buffer), { width: 1672, height: 941 }, `${path} must preserve the 16:9 runtime frame`);
    assert.ok(buffer.length > 70_000, `${path} must contain substantive art`);
  }
});

test('v7 manifest locks every newly generated runtime asset', async () => {
  const manifest = JSON.parse(await readFile(new URL('art/visual-novel/05_manifests/art-audit-v7-manifest.json', ROOT), 'utf8'));
  assert.equal(manifest.generatedAssets.length, 6);
  for (const asset of manifest.generatedAssets) {
    const buffer = await bytes(asset.runtime);
    const hash = createHash('sha256').update(buffer).digest('hex');
    assert.equal(hash, asset.sha256, `${asset.id} runtime hash`);
  }
});

test('map runtime prefers high-resolution portraits and preserves their aspect ratio', async () => {
  const [loader, scene, portraits, mapManifest] = await Promise.all([
    readFile(new URL('src/game/enemy-assets.js', ROOT), 'utf8'),
    readFile(new URL('src/game/anime-canvas-scene.js', ROOT), 'utf8'),
    readFile(new URL('src/game/anime-portraits.js', ROOT), 'utf8'),
    readFile(new URL('public/assets/anime/map/manifest.json', ROOT), 'utf8')
  ]);

  assert.match(loader, /preferredMapFile/);
  assert.match(loader, /portraits\/v1\/\$\{match\[1\]\}-portrait-runtime\.webp/);
  assert.match(loader, /fallbackUrl/);
  assert.match(scene, /drawMapUnitImage/);
  assert.match(scene, /sourceHeight <= sourceWidth \* 1\.14/);
  assert.match(scene, /footY/);
  assert.match(portraits, /characters\/yayu-dialogue-guarded\.webp/);
  assert.match(portraits, /characters\/echo-regent-dialogue-grave\.webp/);
  assert.match(portraits, /characters\/arcane-sovereign-dialogue-regret\.webp/);
  assert.match(portraits, /characters\/archive-warden-dialogue-duty\.webp/);
  assert.match(mapManifest, /hero-v6\.webp/);
  assert.match(portraits, /avatars\/liyue-avatar-embers-cel\.webp/);
  assert.match(mapManifest, /"heroRevision": "identity-audited-hero-v7"/);
});
