import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = join(root, 'public/assets/anime/enemies/manifest.json');

function runtimePath(basePath, relativePath) {
  const base = basePath.replace(/^\//, '');
  return join(root, 'public', base, relativePath);
}

function assertWebP(base64, label) {
  const data = Buffer.from(base64.trim(), 'base64');
  assert.ok(data.length > 16, `${label} must not be empty`);
  assert.equal(data.subarray(0, 4).toString('ascii'), 'RIFF', `${label} must have a RIFF header`);
  assert.equal(data.subarray(8, 12).toString('ascii'), 'WEBP', `${label} must be WebP`);
}

test('enemy art manifest resolves all 20 HD enemy entries', async () => {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const entries = Object.entries(manifest.assets ?? {});
  assert.equal(entries.length, 20);

  const bundleCache = new Map();
  for (const [portrait, meta] of entries) {
    const sourceCount = [meta.file, meta.base64File, meta.bundle].filter(Boolean).length;
    assert.equal(sourceCount, 1, `${portrait} must declare exactly one asset source`);

    if (meta.file) {
      const data = await readFile(runtimePath(manifest.basePath, meta.file));
      assert.ok(data.length > 16, `${portrait} file must not be empty`);
      continue;
    }

    if (meta.base64File) {
      const base64 = await readFile(runtimePath(manifest.basePath, meta.base64File), 'utf8');
      assertWebP(base64, portrait);
      continue;
    }

    const bundlePath = runtimePath(manifest.basePath, meta.bundle);
    if (!bundleCache.has(bundlePath)) {
      bundleCache.set(bundlePath, JSON.parse(await readFile(bundlePath, 'utf8')));
    }
    const payload = bundleCache.get(bundlePath);
    assert.equal(typeof payload[meta.key], 'string', `${portrait} bundle key must exist`);
    assertWebP(payload[meta.key], portrait);
  }
});
