import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');

test('repaired legacy atlases retain every declared key and trace their accepted sources', async () => {
  const map = JSON.parse(await readFile(new URL('public/assets/anime/map/manifest.json', root), 'utf8'));
  const repair = JSON.parse(await readFile(new URL('art/visual-novel/05_manifests/runtime-atlas-repair-20260930.json', root), 'utf8'));
  assert.equal(repair.atlases.length, 2);
  for (const source of Object.values(repair.sources)) {
    assert.equal(sha(await readFile(new URL(source.path, root))), source.sha256, `${source.path} provenance`);
  }
  for (const atlas of repair.atlases) {
    const meta = map.atlases[atlas.name];
    assert.equal(atlas.width, meta.cols * atlas.cell_size);
    assert.equal(atlas.height, meta.rows * atlas.cell_size);
    assert.equal(sha(await readFile(new URL(atlas.path, root))), atlas.sha256);
    const expected = Object.entries(map.assets).filter(([, entry]) => entry.atlas === atlas.name).map(([key]) => key).sort();
    const actual = atlas.slots.flatMap(({ keys }) => keys).sort();
    assert.deepEqual(actual, expected, `${atlas.name}: no referenced cell may be omitted`);
    for (const slot of atlas.slots) assert.match(slot.rgba_sha256, /^[a-f0-9]{64}$/);
  }
});

test('the art validator enforces pixel decoding and does not enable truncated-image tolerance', async () => {
  const script = await readFile(new URL('scripts/validate-runtime-art.py', root), 'utf8');
  assert.match(script, /LOAD_TRUNCATED_IMAGES = False/);
  assert.match(script, /image\.load\(\)/);
  assert.match(script, /def self_test\(\)/);
  assert.match(script, /decoded pixel hash mismatch/);
});
