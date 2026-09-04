import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { dialoguePresentation } from '../src/game/anime-portraits.js';

const ROOT = new URL('../', import.meta.url);

function pngMetadata(buffer) {
  assert.deepEqual(buffer.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  return {
    dimensions: [buffer.readUInt32BE(16), buffer.readUInt32BE(20)],
    colorType: buffer.readUInt8(25)
  };
}

function webpDimensions(buffer) {
  assert.equal(buffer.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(buffer.subarray(8, 12).toString('ascii'), 'WEBP');
  const chunk = buffer.subarray(12, 16).toString('ascii');
  if (chunk === 'VP8X') return [buffer.readUIntLE(24, 3) + 1, buffer.readUIntLE(27, 3) + 1];
  if (chunk === 'VP8L') {
    const bits = buffer.readUInt32LE(21);
    return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
  }
  throw new Error(`alpha WebP must use VP8X or VP8L, got ${JSON.stringify(chunk)}`);
}

test('five user-cut standees preserve native alpha and match the production manifest', async () => {
  const manifest = JSON.parse(await readFile(new URL('art/visual-novel/05_manifests/native-alpha-standees-v2-manifest.json', ROOT), 'utf8'));
  assert.equal(manifest.status, 'runtime-ready');
  assert.equal(manifest.assets.length, 5);

  for (const asset of manifest.assets) {
    const [source, runtime] = await Promise.all([
      readFile(new URL(asset.source, ROOT)),
      readFile(new URL(asset.runtime, ROOT))
    ]);
    const sourceMeta = pngMetadata(source);
    assert.deepEqual(sourceMeta.dimensions, asset.dimensions, `${asset.id} source dimensions`);
    assert.equal(sourceMeta.colorType, 6, `${asset.id} source must be RGBA`);
    assert.equal(createHash('sha256').update(source).digest('hex'), asset.sourceSha256, `${asset.id} source hash`);
    assert.deepEqual(webpDimensions(runtime), asset.dimensions, `${asset.id} runtime dimensions`);
    assert.ok(runtime.includes(Buffer.from('ALPH')) || runtime.subarray(12, 16).toString('ascii') === 'VP8L', `${asset.id} runtime alpha`);
    assert.equal(createHash('sha256').update(runtime).digest('hex'), asset.runtimeSha256, `${asset.id} runtime hash`);
  }
});

test('the five accepted standees are active in Gal presentation and visible to the audit page', () => {
  const mappings = [
    ['palace_warden_v2', 'duty', 'vela-dialogue-duty.webp'],
    ['black_seal_keeper_v2', 'watchful', 'seph-dialogue-watchful.webp'],
    ['act3_last_custodian', 'grave', 'last-custodian-dialogue-release.webp'],
    ['final_queen', 'resolve', 'noctia-dialogue-resolve.webp'],
    ['guide', 'focus', 'shawu-dialogue-focus.webp']
  ];
  for (const [id, expression, filename] of mappings) {
    const presentation = dialoguePresentation(id, expression);
    assert.equal(presentation.hasPaintedExpression, true, `${id}:${expression}`);
    assert.match(presentation.stage, new RegExp(filename.replace('.', '\\.')));
  }
});
