import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const ROOT = new URL('../', import.meta.url);

async function bytes(path) {
  return readFile(new URL(path, ROOT));
}

function webpHasAlpha(buffer) {
  return buffer.includes(Buffer.from('ALPH')) || buffer.includes(Buffer.from('VP8L'));
}

test('tower identity redraw ships genuine transparent map and combat art', async () => {
  const transparent = [
    'public/assets/anime/map/atlases/runtime/hero-v6.webp',
    'public/assets/anime/portraits/v6/shadow-boss-portrait-runtime.webp',
    'public/assets/anime/portraits/v6/echo-regent-portrait-runtime.webp',
    'public/assets/anime/portraits/v6/arcane-sovereign-portrait-runtime.webp',
    'public/assets/anime/portraits/v6/archive-warden-portrait-runtime.webp'
  ];
  for (const path of transparent) {
    const buffer = await bytes(path);
    assert.ok(webpHasAlpha(buffer), `${path} must retain a native WebP alpha payload`);
  }

  await access(new URL('public/assets/anime/avatars/whale-boss-avatar-lament-v6.webp', ROOT));
  await access(new URL('public/assets/anime/avatars/dragon-boss-avatar-embers-v6.webp', ROOT));
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
  assert.match(portraits, /portraits\/v6\/shadow-boss-portrait-runtime\.webp/);
  assert.match(mapManifest, /hero-v6\.webp/);
  assert.match(mapManifest, /"heroRevision": "identity-audited-hero-v6"/);
});
