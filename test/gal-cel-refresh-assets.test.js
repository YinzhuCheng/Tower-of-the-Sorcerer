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
    return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === 'VP8L') {
    assert.equal(buffer[20], 0x2f);
    const bits = buffer.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === 'VP8X') {
    return { width: buffer.readUIntLE(24, 3) + 1, height: buffer.readUIntLE(27, 3) + 1 };
  }
  throw new Error(`unsupported WebP chunk ${JSON.stringify(chunk)}`);
}

test('the complete GAL cel-refresh manifest is valid, exact and cache-busted', async () => {
  const manifestUrl = new URL('../art/visual-novel/05_manifests/gal-cel-refresh-v3-manifest.json', import.meta.url);
  const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
  const source = (await Promise.all([
    '../src/main.js',
    '../src/game/data.js',
    '../src/game/demo-10-floor-content.js',
    '../src/game/demo-20-floor-content.js',
    '../src/game/demo-30-floor-content.js'
  ].map((path) => readFile(new URL(path, import.meta.url), 'utf8')))).join('\n');

  assert.equal(manifest.assets.length, 19);
  assert.equal(manifest.assets.filter(({ kind }) => kind === 'backdrop').length, 11);
  assert.equal(manifest.assets.filter(({ kind }) => kind === 'story-cg').length, 6);
  assert.equal(manifest.assets.filter(({ kind }) => kind === 'transition').length, 2);
  assert.match(source, /GAL_ART_VERSION = '20260902-cel3'/);

  for (const asset of manifest.assets) {
    const runtimeUrl = new URL(`../${asset.runtime}`, import.meta.url);
    const masterUrl = new URL(`../${asset.master}`, import.meta.url);
    const [runtime, master] = await Promise.all([readFile(runtimeUrl), readFile(masterUrl)]);
    assert.deepEqual(webpDimensions(runtime), { width: 1672, height: 941 }, `${asset.id} runtime dimensions`);
    assert.equal(Buffer.compare(master, runtime), 0, `${asset.id} master must match runtime bytes`);
    assert.equal(createHash('sha256').update(runtime).digest('hex'), asset.sha256, `${asset.id} manifest hash`);
    assert.match(source, new RegExp(asset.runtime.split('/').at(-1).replace('.', '\\.')), `${asset.id} must be referenced by GAL runtime`);
  }
});
