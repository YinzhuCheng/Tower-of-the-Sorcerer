import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const ROOT = new URL('../', import.meta.url);

function webpDimensions(buffer) {
  assert.equal(buffer.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(buffer.subarray(8, 12).toString('ascii'), 'WEBP');
  const chunk = buffer.subarray(12, 16).toString('ascii');
  if (chunk === 'VP8 ') return [buffer.readUInt16LE(26) & 0x3fff, buffer.readUInt16LE(28) & 0x3fff];
  if (chunk === 'VP8L') {
    const bits = buffer.readUInt32LE(21);
    return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
  }
  if (chunk === 'VP8X') return [buffer.readUIntLE(24, 3) + 1, buffer.readUIntLE(27, 3) + 1];
  throw new Error(`Unsupported WebP chunk ${chunk}`);
}

test('continuity completion manifest matches accepted files and runtime copies', async () => {
  const manifest = JSON.parse(await readFile(new URL('art/visual-novel/05_manifests/continuity-completion-v1-manifest.json', ROOT), 'utf8'));
  assert.equal(manifest.assets.filter(({ kind }) => kind === 'story-cg').length, 8);
  assert.equal(manifest.assets.filter(({ kind }) => kind === 'backdrop').length, 5);
  assert.equal(manifest.assets.filter(({ kind }) => kind === 'checkerboard-standee-source').length, 5);

  for (const asset of manifest.assets) {
    const final = await readFile(new URL(asset.final, ROOT));
    assert.equal(createHash('sha256').update(final).digest('hex'), asset.sha256, `${asset.id} final hash`);
    if (asset.runtime) {
      const runtime = await readFile(new URL(asset.runtime, ROOT));
      assert.deepEqual(runtime, final, `${asset.id} final/runtime bytes`);
      assert.deepEqual(webpDimensions(runtime), asset.dimensions, `${asset.id} runtime dimensions`);
    } else {
      assert.deepEqual(webpDimensions(final), asset.dimensions, `${asset.id} WebP handoff dimensions`);
      assert.equal(asset.requiresUserAlphaExtraction, true, `${asset.id} remains out of runtime`);
    }
  }
});

test('new CG beats, locations and identity routes are wired without checkerboard runtime art', async () => {
  const [main, prologue, actOne, actTwo, actThree, portraits] = await Promise.all([
    readFile(new URL('src/main.js', ROOT), 'utf8'),
    readFile(new URL('src/game/data.js', ROOT), 'utf8'),
    readFile(new URL('src/game/demo-10-floor-content.js', ROOT), 'utf8'),
    readFile(new URL('src/game/demo-20-floor-content.js', ROOT), 'utf8'),
    readFile(new URL('src/game/demo-30-floor-content.js', ROOT), 'utf8'),
    readFile(new URL('src/game/anime-portraits.js', ROOT), 'utf8')
  ]);
  const source = [main, prologue, actOne, actTwo, actThree, portraits].join('\n');
  for (const stem of [
    'seven-cantos-severed', 'yayu-seven-core-network', 'noctia-missing-fourth-step',
    'yayu-intercepted-receipt', 'noctia-missing-page', 'noctia-archive-storm',
    'archive-warden-entry', 'traceable-revocation'
  ]) assert.match(source, new RegExp(`liyue-${stem}-cg\\.webp`));

  for (const backdrop of [
    'theme-moon-white-vestibule.webp', 'theme-twin-score-greenhouse.webp',
    'theme-folded-archive-market.webp', 'theme-final-index-room.webp',
    'theme-ember-lighthouse-writein.webp'
  ]) assert.match(main, new RegExp(backdrop.replace('.', '\\.')));

  assert.match(main, /function galCgFor\(turns, index\)/);
  assert.match(main, /GAL_ART_VERSION = '20260904-continuity-completion-v1'/);
  assert.match(actOne, /静默执剑官·维拉', 'palace_warden_v2'/);
  assert.match(actOne, /黯印观测官·塞芙', 'black_seal_keeper_v2'/);
  assert.match(actThree, /最后保管人', 'act3_last_custodian'/);
  assert.doesNotMatch(source, /checker_v2\.(?:png|webp)/);
});
