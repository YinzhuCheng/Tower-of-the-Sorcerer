import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { portraitUrl, dialoguePresentation } from '../src/game/anime-portraits.js';
const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root));
const json = async path => JSON.parse(await read(path));
const sha = buffer => createHash('sha256').update(buffer).digest('hex');

test('named tower cast maps and HUD faces use the approved shared GAL identity', async () => {
  const release = await json('art/visual-novel/05_manifests/named-cast-tower-gal-20260930-v1.json');
  const enemies = await json('public/assets/anime/enemies/manifest.json');
  assert.equal(release.assets.length, 15);
  assert.equal(release.hud_only.length, 2);
  assert.equal(new Set(release.assets.map(asset => asset.runtime)).size, 15);
  assert.equal(enemies.identityRevision, 'named-cast-gal-20260930');
  for (const asset of release.assets) {
    const [source, output] = await Promise.all([read(asset.source), read(asset.runtime)]);
    assert.equal(sha(source), asset.source_sha256, `${asset.character_id} approved source`);
    assert.equal(sha(output), asset.runtime_sha256, `${asset.character_id} exact derivative`);
    assert.deepEqual(asset.dimensions, [384, 576]);
    assert.ok(output.includes(Buffer.from('ALPH')), `${asset.character_id} transparent map silhouette`);
    assert.equal(output.subarray(12, 16).toString(), 'VP8X');
    assert.deepEqual([output.readUIntLE(24, 3) + 1, output.readUIntLE(27, 3) + 1], [384, 576]);
    const entry = enemies.assets[asset.character_id];
    const relative = asset.runtime.replace('public/assets/anime/', '');
    assert.equal(entry.highResFile, relative);
    assert.equal(entry.file, relative, `${asset.character_id} cannot fall back to an obsolete identity`);
    assert.equal(portraitUrl(asset.character_id), asset.hud_avatar, `${asset.character_id} gets a face crop for HUD/codex`);
    assert.match(asset.hud_avatar, /^\/assets\/anime\/avatars\//);
    await read(`public${asset.hud_avatar}`);
    assert.match(dialoguePresentation(asset.character_id).stage, /\/characters\//, 'dialogue keeps its fullbody stage separate from HUD face');
  }
  for (const asset of release.hud_only) assert.equal(portraitUrl(asset.character_id), asset.hud_avatar);
  const map = await json('public/assets/anime/map/manifest.json');
  assert.equal(map.atlases.hero.file, 'atlases/runtime/hero-v6.webp', 'hero keeps its identity-matched four-direction token');
});

test('the shared-cast migration cannot absorb or redesign unrelated generic enemies', async () => {
  const enemies = await json('public/assets/anime/enemies/manifest.json');
  const release = await json('art/visual-novel/05_manifests/named-cast-tower-gal-20260930-v1.json');
  const named = new Set(release.assets.map(asset => asset.character_id));
  for (const [id, entry] of Object.entries(enemies.assets)) {
    if (named.has(id)) continue;
    assert.ok(!entry.file.includes('canonical-gal-20260930'), `${id} is an independent identity`);
    assert.ok(!entry.highResFile?.includes('canonical-gal-20260930'), `${id} cannot silently borrow a named character`);
  }
  for (const [id, file] of [['cat_scout','enemies/v1/cat-scout-map-128.webp'],['cat_mage','enemies/v1/cat-mage-map-128.webp'],['fox_acolyte','enemies/v1/fox-acolyte-map-128.webp'],['dragon_whelp','enemies/v1/dragon-whelp-map-128.webp']]) assert.equal(enemies.assets[id].file, file);
});
