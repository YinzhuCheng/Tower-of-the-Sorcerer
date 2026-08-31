import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = join(root, 'public/assets/anime/items/manifest.json');
const sourceMapPath = join(root, 'public/assets/anime/items/source-map.json');

test('item art manifest never references missing runtime files', async () => {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const entries = Object.entries(manifest.assets ?? {});
  assert.equal(manifest.basePath, '/assets/anime/items/');
  assert.equal(manifest.status, 'ready');
  assert.deepEqual(entries.map(([id]) => id).sort(), [
    'astral-codex', 'holy-elixir', 'mana-flask', 'moon-compass'
  ]);

  for (const [id, meta] of entries) {
    assert.equal(typeof meta.file, 'string', `${id} must declare a file`);
    const path = join(root, 'public/assets/anime/items', meta.file);
    await access(path);
    const data = await readFile(path);
    assert.ok(data.length > 24 * 1024, `${id} must retain a production-quality image payload`);
    assert.equal(data.subarray(0, 4).toString('ascii'), 'RIFF', `${id} must have RIFF header`);
    assert.equal(data.subarray(8, 12).toString('ascii'), 'WEBP', `${id} must be WebP`);
    assert.equal(typeof meta.role, 'string', `${id} must declare a role`);
    assert.equal(typeof meta.semantic, 'string', `${id} must declare gameplay semantics`);
  }
});

test('critical relics use the item pipeline instead of the legacy sheet or generic map art', async () => {
  const [scene, baseScene] = await Promise.all([
    readFile(join(root, 'src/game/canvas-scene.js'), 'utf8'),
    readFile(join(root, 'src/game/anime-canvas-scene.js'), 'utf8')
  ]);

  assert.match(baseScene, /import \{ preloadItemAssets \} from '\.\/item-assets\.js';/);
  assert.match(baseScene, /preloadItemAssets\(\)/);
  assert.match(scene, /import \{ getItemAsset \} from '\.\/item-assets\.js';/);
  assert.match(scene, /function drawItemProp/);
  for (const [id, asset] of Object.entries({
    manaFlask: 'mana-flask',
    act3Mana: 'mana-flask',
    compass: 'moon-compass',
    codex: 'astral-codex',
    holy: 'holy-elixir'
  })) {
    assert.match(scene, new RegExp(`${id}: \\{ asset: '${asset}'`), `${id} must resolve to its item art`);
  }
  assert.doesNotMatch(scene, /relic-mana-flask|featured-codex-shrine|featured-treasure/);
});

test('item source map documents exactly the active runtime relic files', async () => {
  const [manifest, sourceMap] = await Promise.all([
    readFile(manifestPath, 'utf8').then(JSON.parse),
    readFile(sourceMapPath, 'utf8').then(JSON.parse)
  ]);
  assert.deepEqual(
    Object.keys(sourceMap.runtimeSources ?? {}).sort(),
    Object.values(manifest.assets).map((meta) => meta.file).sort()
  );
});
