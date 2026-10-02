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
  assert.match(portraits, /avatars\/shadow-boss-avatar-guarded\.webp/);
  assert.match(portraits, /avatars\/echo-regent-avatar-grave\.webp/);
  assert.match(portraits, /avatars\/arcane-sovereign-avatar-regret\.webp/);
  assert.match(portraits, /avatars\/archive-warden-avatar-duty\.webp/);
  assert.match(mapManifest, /hero-v6\.webp/);
  assert.match(portraits, /avatars\/liyue-avatar-embers-cel\.webp/);
  assert.match(mapManifest, /"heroRevision": "identity-audited-hero-v7"/);
});
