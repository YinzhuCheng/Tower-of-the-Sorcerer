import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { DIALOGUE_CAST, dialoguePresentation } from '../src/game/anime-portraits.js';
import { ENEMIES } from '../src/game/data.js';
const root = new URL('../', import.meta.url);
const json = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

function dimensions(bytes) {
  assert.equal(bytes.subarray(0, 4).toString(), 'RIFF');
  assert.equal(bytes.subarray(8, 12).toString(), 'WEBP');
  const type = bytes.subarray(12, 16).toString();
  if (type === 'VP8 ') return [bytes.readUInt16LE(26) & 0x3fff, bytes.readUInt16LE(28) & 0x3fff];
  if (type === 'VP8X') return [bytes.readUIntLE(24, 3) + 1, bytes.readUIntLE(27, 3) + 1];
  if (type === 'VP8L') {
    const bits = bytes.readUInt32LE(21);
    return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
  }
  throw new Error(`Unknown WebP type: ${type}`);
}

test('feline map encounters cannot be overridden by legacy human or fox chibi cells', async () => {
  const source = await readFile(new URL('src/game/canvas-scene.js', root), 'utf8');
  const overrides = source.match(/const FEATURED_ENEMY_ASSET = Object\.freeze\(\{([\s\S]*?)\}\)/)?.[1];
  assert.ok(overrides !== undefined, 'keep the explicitly retained featured override registry');
  const manifest = await json('public/assets/anime/enemies/manifest.json');
  for (const [id, portrait, stem] of [
    ['catScout', 'cat_scout', 'cat-scout'],
    ['catMage', 'cat_mage', 'cat-mage'],
    ['catBoss', 'cat_boss', 'cat-boss']
  ]) {
    assert.doesNotMatch(overrides, new RegExp(`\\b${id}\\s*:`), `${id} must use its canonical enemy portrait`);
    assert.equal(ENEMIES[id].portrait, portrait);
    assert.equal(manifest.assets[portrait].file, id === 'catBoss' ? 'enemies/canonical-gal-20260930/cat-boss-map.webp' : `enemies/v1/${stem}-map-128.webp`);
    const entry = manifest.assets[portrait];
    const active = entry.highResFile ?? `portraits/v1/${stem}-portrait-runtime.webp`;
    await readFile(new URL(`public${manifest.basePath}${active}`, root));
  }
  assert.match(source, /token === 'shop' && drawFeaturedProp\(scene, 'featured-shop'/, 'featured props remain available');
});
