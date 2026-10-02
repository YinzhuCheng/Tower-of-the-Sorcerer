import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { portraitUrl, dialoguePresentation } from '../src/game/anime-portraits.js';
const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root));
const json = async path => JSON.parse(await read(path));
const sha = buffer => createHash('sha256').update(buffer).digest('hex');

test('the shared-cast migration cannot absorb or redesign unrelated generic enemies', async () => {
  const enemies = await json('public/assets/anime/enemies/manifest.json');
  const release = (await json('test/fixtures/runtime-art-contract.json')).named;
  const named = new Set(release.assets.map(asset => asset.character_id));
  for (const [id, entry] of Object.entries(enemies.assets)) {
    if (named.has(id)) continue;
    assert.ok(!entry.file.includes('canonical-gal-20260930'), `${id} is an independent identity`);
    assert.ok(!entry.highResFile?.includes('canonical-gal-20260930'), `${id} cannot silently borrow a named character`);
  }
  for (const [id, file] of [['cat_scout','enemies/v1/cat-scout-map-128.webp'],['cat_mage','enemies/v1/cat-mage-map-128.webp'],['fox_acolyte','enemies/v1/fox-acolyte-map-128.webp'],['dragon_whelp','enemies/v1/dragon-whelp-map-128.webp']]) assert.equal(enemies.assets[id].file, file);
});
