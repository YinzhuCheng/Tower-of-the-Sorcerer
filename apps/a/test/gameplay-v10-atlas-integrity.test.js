import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const mapRoot = join(root, 'public/assets/anime/map');

test('V10.1 gameplay atlas reconstructs the verified clean WebP exactly', async () => {
  const manifest = JSON.parse(await readFile(join(mapRoot, 'manifest.json'), 'utf8'));
  assert.equal(manifest.revision, 'generated-gameplay-v10.1');
  const atlas = manifest.atlases.gameplayV10;
  assert.deepEqual(atlas.base64Chunks, [
    'atlases/v10/gameplay-v10-ultra-01.b64',
    'atlases/v10/gameplay-v10-ultra-02-fixed.b64'
  ]);
  assert.equal(atlas.cols, 4);
  assert.equal(atlas.rows, 4);

  const parts = await Promise.all(atlas.base64Chunks.map(async (path) =>
    (await readFile(join(mapRoot, path), 'utf8')).trim()
  ));
  const payload = parts.join('');
  assert.equal(payload.length, 18072);

  const data = Buffer.from(payload, 'base64');
  assert.equal(data.length, 13554);
  assert.equal(data.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(data.subarray(8, 12).toString('ascii'), 'WEBP');
  assert.equal(
    createHash('sha256').update(data).digest('hex'),
    'dd1b308334377c46e36cd2bdcb634a20d450fa0c1547f8bc50af9d204e23c79d'
  );
});
