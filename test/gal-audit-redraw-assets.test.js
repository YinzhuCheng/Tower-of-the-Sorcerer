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
    return [buffer.readUInt16LE(26) & 0x3fff, buffer.readUInt16LE(28) & 0x3fff];
  }
  if (chunk === 'VP8L') {
    assert.equal(buffer[20], 0x2f);
    const bits = buffer.readUInt32LE(21);
    return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
  }
  if (chunk === 'VP8X') {
    return [buffer.readUIntLE(24, 3) + 1, buffer.readUIntLE(27, 3) + 1];
  }
  throw new Error(`unsupported WebP chunk ${JSON.stringify(chunk)}`);
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function gitBlobSha(buffer) {
  return createHash('sha1')
    .update(`blob ${buffer.length}\0`)
    .update(buffer)
    .digest('hex');
}

test('audit redraw v5 ships every approved replacement with exact dimensions, hashes and alpha', async () => {
  const manifest = JSON.parse(await readFile(new URL('../art/visual-novel/05_manifests/gal-audit-redraw-v5-manifest.json', import.meta.url), 'utf8'));

  assert.equal(manifest.assets.length, 16);
  assert.equal(manifest.assets.filter(({ kind }) => kind === 'story-cg').length, 6);
  assert.equal(manifest.assets.filter(({ kind }) => kind === 'candidate-cg').length, 1);
  assert.equal(manifest.assets.filter(({ kind }) => kind === 'avatar').length, 5);
  assert.equal(manifest.assets.filter(({ alpha_required }) => alpha_required).length, 4);

  for (const asset of manifest.assets) {
    const runtime = await readFile(new URL(`../${asset.runtime}`, import.meta.url));
    assert.deepEqual(webpDimensions(runtime), asset.dimensions, `${asset.id} dimensions`);
    assert.equal(sha256(runtime), asset.sha256, `${asset.id} runtime hash`);
    if (asset.alpha_required) {
      assert.ok(runtime.includes(Buffer.from('ALPH')), `${asset.id} must contain a real WebP alpha chunk`);
    }

    const working = await readFile(new URL(`../${asset.working}`, import.meta.url));
    assert.ok(working.length > 0, `${asset.id} working master`);
    if (asset.final) {
      const final = await readFile(new URL(`../${asset.final}`, import.meta.url));
      assert.equal(sha256(final), asset.sha256, `${asset.id} final and runtime must match`);
    }
  }
});

test('audit redraw v5 archive preserves the exact pre-replacement Git blobs', async () => {
  const archive = JSON.parse(await readFile(new URL('../art/visual-novel/07_archive/2026-09-03-pre-audit-redraw/manifest.json', import.meta.url), 'utf8'));

  assert.equal(archive.baseline_commit, 'e79fd7f60913c59959e348451cfb889cccca1d1f');
  assert.equal(archive.assets.length, 18);
  assert.equal(archive.assets.filter(({ classification }) => classification === 'CG').length, 7);
  assert.equal(archive.assets.filter(({ classification }) => classification === 'AVATAR').length, 5);

  for (const asset of archive.assets) {
    const archived = await readFile(new URL(`../${asset.archived_path}`, import.meta.url));
    assert.equal(gitBlobSha(archived), asset.original_blob_sha, `${asset.original_path} archived blob`);
  }
});

test('Lumi and Noctia derivatives remain identity-synchronized across runtime roles', async () => {
  const [portraits, enemyManifest, source] = await Promise.all([
    readFile(new URL('../src/game/anime-portraits.js', import.meta.url), 'utf8'),
    readFile(new URL('../public/assets/anime/enemies/manifest.json', import.meta.url), 'utf8').then(JSON.parse),
    readFile(new URL('../src/main.js', import.meta.url), 'utf8')
  ]);

  assert.match(portraits, /astral_boss: '\/assets\/anime\/portraits\/v1\/astral-boss-portrait-runtime\.webp'/);
  assert.match(portraits, /'final_queen:sorrow': '\/assets\/anime\/characters\/noctia-dialogue-sorrow\.webp'/);
  assert.equal(enemyManifest.assets.astral_boss.file, 'enemies/v1/astral-boss-map-128.webp');
  assert.match(source, /GAL_ART_VERSION = '20260903-audit-redraw-v5'/);
});
