import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = join(root, 'public/assets/anime/map/manifest.json');
const atlasRoot = join(root, 'public/assets/anime/map');

const EXPECTED_ASSETS = [
  'featured-cat-scout',
  'featured-cat-mage',
  'featured-sword-apprentice',
  'featured-cat-boss',
  'featured-shop',
  'featured-codex-shrine',
  'featured-treasure',
  'featured-switch-single',
  'featured-switch-dual',
  'featured-rune-sequence'
];

test('featured v2 atlas reconstructs the verified transparent WebP', async () => {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  assert.ok(manifest.version >= 3);
  const atlas = manifest.atlases.featuredV2;
  assert.equal(atlas.cols, 5);
  assert.equal(atlas.rows, 2);
  assert.equal(atlas.base64Chunks.length, 10);

  const chunks = await Promise.all(
    atlas.base64Chunks.map(async (relativePath) => (await readFile(join(atlasRoot, relativePath), 'utf8')).trim())
  );
  const base64 = chunks.join('');
  assert.equal(base64.length, 96180);

  const data = Buffer.from(base64, 'base64');
  assert.equal(data.length, 72134);
  assert.equal(data.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(data.subarray(8, 12).toString('ascii'), 'WEBP');
  assert.ok(data.includes(Buffer.from('VP8X')), 'extended WebP header must exist');
  assert.ok(data.includes(Buffer.from('ALPH')), 'featured atlas must retain an alpha channel');
  assert.equal(
    createHash('sha256').update(data).digest('hex'),
    '3e3a3e6ea341ec420e3a67707c85612218c90f19c324db52949684262c245ae6'
  );

  EXPECTED_ASSETS.forEach((name, index) => {
    assert.equal(manifest.assets[name]?.atlas, 'featuredV2', `${name} must use featuredV2 atlas`);
    assert.equal(manifest.assets[name]?.index, index, `${name} must keep stable cell index`);
  });
});

test('canvas entrypoint preserves transparent legacy cleanup and avoids generic featured art for migrated relics', async () => {
  const source = await readFile(join(root, 'src/game/canvas-scene.js'), 'utf8');
  assert.match(source, /buildTransparentCell/);
  assert.match(source, /FEATURED_ENEMY_ASSET/);
  assert.doesNotMatch(source, /featured-codex-shrine|featured-treasure/);
  assert.match(source, /ITEM_PIPELINE_ASSET/);
  assert.match(source, /seal-switch-dual/);
  assert.match(source, /seal-rune-sequence/);
  assert.match(source, /INTERACTABLE_ITEM_ASSET/);
  assert.match(source, /drawLegacySprite/);
  assert.match(source, /moonlit-v4/);
});
