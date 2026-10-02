import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

function webpDimensions(buffer) {
  assert.equal(buffer.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(buffer.subarray(8, 12).toString('ascii'), 'WEBP');
  const chunk = buffer.subarray(12, 16).toString('ascii');
  if (chunk === 'VP8 ') {
    assert.equal(buffer.subarray(23, 26).toString('hex'), '9d012a');
    return [buffer.readUInt16LE(26) & 0x3fff, buffer.readUInt16LE(28) & 0x3fff];
  }
  if (chunk === 'VP8L') {
    assert.equal(buffer[20], 0x2f);
    const bits = buffer.readUInt32LE(21);
    return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
  }
  if (chunk === 'VP8X') {
    return [buffer.readUIntLE(24, 3) + 1, buffer.readUIntLE(27, 3) + 1];
  }
  throw new Error(`unsupported WebP chunk ${JSON.stringify(chunk)}`);
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function gitBlobSha(buffer) {
  return createHash('sha1')
    .update(`blob ${buffer.length}\0`)
    .update(buffer)
    .digest('hex');
}

test('Lumi and Noctia derivatives remain identity-synchronized across runtime roles', async () => {
  const [portraits, enemyManifest, source] = await Promise.all([
    readFile(new URL('../src/game/anime-portraits.js', import.meta.url), 'utf8'),
    readFile(new URL('../public/assets/anime/enemies/manifest.json', import.meta.url), 'utf8').then(JSON.parse),
    readFile(new URL('../src/main.js', import.meta.url), 'utf8')
  ]);

  assert.match(portraits, /astral_boss: '\/assets\/anime\/avatars\/astral-boss-avatar-focus\.webp'/);
  assert.match(portraits, /'final_queen:sorrow': '\/assets\/anime\/characters\/b2-20260921\/final-queen-sorrow-b2\.webp'/);
  assert.equal(enemyManifest.assets.astral_boss.file, 'enemies/canonical-gal-20260930/astral-boss-map.webp');
  assert.match(source, /GAL_ART_VERSION = '20260923-floor-environment-refresh-v1'/);
});
