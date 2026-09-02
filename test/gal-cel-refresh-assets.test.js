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
  const manifestUrl = new URL('../art/visual-novel/05_manifests/gal-cel-redraw-v4-manifest.json', import.meta.url);
  const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
  const source = (await Promise.all([
    '../src/main.js',
    '../src/game/data.js',
    '../src/game/demo-10-floor-content.js',
    '../src/game/demo-20-floor-content.js',
    '../src/game/demo-30-floor-content.js'
  ].map((path) => readFile(new URL(path, import.meta.url), 'utf8')))).join('\n');

  assert.equal(manifest.assets.length, 22);
  assert.equal(manifest.assets.filter(({ kind }) => kind === 'backdrop').length, 11);
  assert.equal(manifest.assets.filter(({ kind }) => kind === 'story-cg').length, 9);
  assert.equal(manifest.assets.filter(({ kind }) => kind === 'transition').length, 2);
  assert.match(source, /GAL_ART_VERSION = '20260902-cel4'/);

  for (const asset of manifest.assets) {
    const runtimeUrl = new URL(`../${asset.runtime}`, import.meta.url);
    const masterUrl = new URL(`../${asset.master}`, import.meta.url);
    const [runtime, master] = await Promise.all([readFile(runtimeUrl), readFile(masterUrl)]);
    assert.deepEqual(webpDimensions(runtime), { width: 1672, height: 941 }, `${asset.id} runtime dimensions`);
    assert.equal(Buffer.compare(master, runtime), 0, `${asset.id} master must match runtime bytes`);
    assert.equal(createHash('sha256').update(runtime).digest('hex'), asset.sha256, `${asset.id} manifest hash`);
    if (asset.referenced !== false) {
      assert.match(source, new RegExp(asset.runtime.split('/').at(-1).replace('.', '\\.')), `${asset.id} must be referenced by GAL runtime`);
    }
  }
});

function gitBlobSha(buffer) {
  return createHash('sha1')
    .update(`blob ${buffer.length}\0`)
    .update(buffer)
    .digest('hex');
}

test('the pre-refresh archive manifest traces every replaced runtime blob', async () => {
  const archiveManifestUrl = new URL('../art/visual-novel/07_archive/2026-09-02-pre-cel-gal-refresh/manifest.json', import.meta.url);
  const archive = JSON.parse(await readFile(archiveManifestUrl, 'utf8'));

  assert.equal(archive.baseline_commit, '613cd0de6e2634919884cfb0f57720776a15a9e9');
  assert.equal(archive.assets.length, 19);
  assert.equal(archive.assets.filter(({ classification }) => classification === 'BG').length, 11);
  assert.equal(archive.assets.filter(({ classification }) => classification === 'CG').length, 6);
  assert.equal(archive.assets.filter(({ classification }) => classification === 'TRANSITION').length, 2);

  for (const asset of archive.assets) {
    const archivedRuntime = await readFile(new URL(`../${asset.archived_runtime_path}`, import.meta.url));
    assert.equal(gitBlobSha(archivedRuntime), asset.original_runtime_blob_sha, `${asset.logical_asset_id} archived runtime blob`);
    assert.equal(asset.original_runtime_path, asset.replacement_runtime_path, `${asset.logical_asset_id} must replace the runtime slot in place`);

    if (!asset.original_master_path) {
      assert.equal(asset.original_master_blob_sha, null);
      assert.equal(asset.archived_master_path, null);
      continue;
    }
    const archivedMaster = await readFile(new URL(`../${asset.archived_master_path}`, import.meta.url));
    assert.equal(gitBlobSha(archivedMaster), asset.original_master_blob_sha, `${asset.logical_asset_id} archived master blob`);
  }
});

test('event CG turns suppress standing sprites while ordinary turns retain the actor layer', async () => {
  const [main, css] = await Promise.all([
    readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
    readFile(new URL('../ui-v10-cinematics.css', import.meta.url), 'utf8')
  ]);

  assert.match(main, /gal-dialogue \$\{isNarration \? 'is-narration' : ''\} \$\{cg \? 'has-cg' : ''\}/);
  assert.match(main, /\$\{cg \? `<div class="gal-cg"/);
  assert.match(css, /\.gal-dialogue\.has-cg \.gal-actor[^\{]*\{display:none\}/);
  assert.doesNotMatch(css, /\.gal-dialogue\.has-cg \.gal-portrait[^\{]*\{display:none\}/);
});

test('an explicit production QA query can open any authored GAL scene without marking story progress', async () => {
  const main = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');

  assert.match(main, /new URLSearchParams\(window\.location\.search\)\.get\('gal-preview'\)/);
  assert.match(main, /dialogueId && getDialogue\(dialogueId\) \? dialogueId : null/);
  assert.match(main, /const previewDialogueId = requestedGalPreviewDialogue\(\);\s*if \(!previewDialogueId\) autoSave\(\)/);
  assert.match(main, /previewDialogueId\s*\? \(showDialogue\(previewDialogueId, startCanvasAssets\), true\)\s*: initialGalDialogue\(startCanvasAssets\)/);
});
