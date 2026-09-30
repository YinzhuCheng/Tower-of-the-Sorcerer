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

test('all active dialogue faces publish exact accepted canonical expression derivatives', async () => {
  const release = await json('art/visual-novel/05_manifests/canonical-avatars-runtime-20260930-v1.json');
  const accepted = await json(release.source_manifest);
  assert.equal(release.count, 26);
  assert.equal(release.assets.length, 26);
  const approved = new Map(accepted.assets.map(asset => [asset.runtime_target, asset]));
  const published = new Map(release.assets.map(asset => [asset.runtime, asset]));
  const portraitModule = await readFile(new URL('src/game/anime-portraits.js', root), 'utf8');
  for (const asset of release.assets) {
    const authority = approved.get(asset.runtime);
    assert.ok(authority, `${asset.runtime} has a reviewed expression source`);
    assert.equal(asset.runtime_sha256, authority.sha256);
    assert.equal(asset.source_sha256, authority.source_sha256);
    const [runtime, master] = await Promise.all([asset.runtime, asset.master].map(path => readFile(new URL(path, root))));
    assert.deepEqual(runtime, master, `${asset.runtime} must be an unchanged accepted export`);
    assert.equal(digest(runtime), authority.sha256);
    assert.deepEqual(dimensions(runtime), [512, 512]);
    assert.ok(portraitModule.includes(asset.runtime.slice('public'.length)), `${asset.runtime} remains reachable`);
  }
  const explicitStates = {
    hero: ['resolve', 'stern', 'guarded', 'embers'],
    guide: ['gentle', 'watchful', 'lament', 'focus'],
    final_queen: ['sorrow', 'grave', 'knowing', 'cold', 'resolve'],
    echo_regent: ['grave', 'release'],
    arcane_sovereign: ['regret', 'acceptance'],
    act3_last_custodian: ['grave', 'release']
  };
  const reached = new Set();
  for (const [id, cast] of Object.entries(DIALOGUE_CAST)) {
    for (const expression of explicitStates[id] ?? [cast.expression]) {
      const presentation = dialoguePresentation(id, expression);
      reached.add(`public${presentation.avatar}`);
      await readFile(new URL(`public${presentation.stage}`, root));
    }
  }
  assert.deepEqual([...reached].sort(), [...published.keys()].sort(), 'all 26 exact runtime avatars must be reached through actual expression resolution');
  for (const [id, first, second] of [['hero', 'stern', 'resolve'], ['final_queen', 'grave', 'sorrow']]) {
    const a = published.get(`public${dialoguePresentation(id, first).avatar}`);
    const b = published.get(`public${dialoguePresentation(id, second).avatar}`);
    assert.notEqual(a.runtime_sha256, b.runtime_sha256, `${id} expressions must have distinct canonical faces`);
  }
  for (const [id, cast] of Object.entries(DIALOGUE_CAST)) {
    const asset = published.get(`public${cast.avatar}`);
    assert.ok(asset, `${id} must have a published canonical default avatar`);
    assert.equal(asset.character_id, id, `${id} must not borrow another character's face`);
  }
});

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
    await readFile(new URL(`public/assets/anime/portraits/v1/${stem}-portrait-runtime.webp`, root));
  }
  assert.match(source, /token === 'shop' && drawFeaturedProp\(scene, 'featured-shop'/, 'featured props remain available');
});
