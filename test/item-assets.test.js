import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = join(root, 'public/assets/anime/items/manifest.json');

test('item art manifest contains 20 valid runtime assets', async () => {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const entries = Object.entries(manifest.assets ?? {});
  assert.equal(entries.length, 20);
  assert.equal(manifest.basePath, '/assets/anime/items/');

  for (const [id, meta] of entries) {
    assert.equal(typeof meta.file, 'string', `${id} must declare a file`);
    const path = join(root, 'public/assets/anime/items', meta.file);
    await access(path);
    const data = await readFile(path);
    assert.ok(data.length > 16, `${id} must not be empty`);
    assert.equal(data.subarray(0, 4).toString('ascii'), 'RIFF', `${id} must have RIFF header`);
    assert.equal(data.subarray(8, 12).toString('ascii'), 'WEBP', `${id} must be WebP`);
  }
});
