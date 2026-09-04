import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTwentyFloorContent } from '../src/game/demo-20-floor-content.js';
import { dialoguePresentation } from '../src/game/anime-portraits.js';

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
  throw new Error(`unsupported WebP chunk ${JSON.stringify(chunk)}`);
}

function pngDimensionsAndColorType(buffer) {
  assert.deepEqual(buffer.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  return {
    dimensions: [buffer.readUInt32BE(16), buffer.readUInt32BE(20)],
    colorType: buffer.readUInt8(25)
  };
}

test('story art v8 manifest locks every approved runtime file', async () => {
  const manifest = JSON.parse(await readFile(new URL('art/visual-novel/05_manifests/story-art-v8-manifest.json', ROOT), 'utf8'));
  assert.equal(manifest.status, 'runtime-ready');
  assert.equal(manifest.assets.length, 15);
  assert.equal(manifest.assets.filter(({ kind }) => kind === 'standing').length, 5);
  assert.equal(manifest.assets.filter(({ kind }) => kind === 'backdrop').length, 4);
  assert.equal(manifest.assets.filter(({ kind }) => kind === 'story-cg').length, 2);

  for (const asset of manifest.assets) {
    const [runtime, final] = await Promise.all([
      readFile(new URL(asset.runtime, ROOT)),
      readFile(new URL(asset.final, ROOT))
    ]);
    assert.deepEqual(runtime, final, `${asset.id} final and runtime must match`);
    assert.deepEqual(webpDimensions(runtime), asset.dimensions, `${asset.id} dimensions`);
    assert.equal(createHash('sha256').update(runtime).digest('hex'), asset.sha256, `${asset.id} hash`);
    if (asset.alphaRequired) {
      assert.ok(runtime.includes(Buffer.from('ALPH')) || runtime.subarray(12, 16).toString('ascii') === 'VP8L', `${asset.id} alpha`);
    }
    if (asset.sourceMode === 'user-provided-native-alpha') {
      const source = await readFile(new URL(asset.source, ROOT));
      const png = pngDimensionsAndColorType(source);
      assert.deepEqual(png.dimensions, asset.dimensions, `${asset.id} source dimensions`);
      assert.equal(png.colorType, 6, `${asset.id} source must be RGBA PNG`);
    }
  }
});

test('early guardians and Lumi resolve to production standing art and matching avatars', () => {
  const states = [
    ['cat_boss', 'alert', 'milu-dialogue-alert-v8.webp', 'cat-boss-avatar-alert-v8.webp'],
    ['fox_boss', 'watchful', 'feiye-dialogue-watchful-v8.webp', 'fox-boss-avatar-watchful-v8.webp'],
    ['whale_boss', 'lament', 'lanyin-dialogue-lament-v8.webp', 'whale-boss-avatar-lament-v8.webp'],
    ['sword_boss', 'stern', 'serena-dialogue-stern-v8.webp', 'sword-boss-avatar-stern-v8.webp'],
    ['astral_boss', 'focus', 'lumi-dialogue-focus-v8.webp', 'astral-boss-avatar-focus.webp']
  ];
  for (const [id, expression, standing, avatar] of states) {
    const presentation = dialoguePresentation(id, expression);
    assert.equal(presentation.hasPaintedExpression, true, `${id}:${expression} standing`);
    assert.match(presentation.stage, new RegExp(standing.replace('.', '\\.')));
    assert.match(presentation.avatar, new RegExp(avatar.replace('.', '\\.')));
  }
});

test('new explanatory CGs bind to their story beats and act-three floors use functional scenes', async () => {
  applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
  applyDemoTwentyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });
  assert.equal(DIALOGUES.bossWhalePostDemo.turns.some(({ cg }) => cg === '/assets/anime/cg/liyue-lanyin-northstar-arrival-cg-v8.webp'), true);
  assert.equal(DIALOGUES.floor17.turns.some(({ cg }) => cg === '/assets/anime/cg/liyue-lumi-seventeen-minute-splice-cg-v8.webp'), true);

  const main = await readFile(new URL('src/main.js', ROOT), 'utf8');
  assert.match(main, /22: 'nightShelter', 23: 'auditChamber', 24: 'relayGallery', 25: 'triageIndex'/);
  assert.match(main, /26: 'triageIndex', 27: 'triageIndex'/);
  assert.match(main, /GAL_ART_VERSION = '20260903-story-art-v8-native-alpha'/);
});
