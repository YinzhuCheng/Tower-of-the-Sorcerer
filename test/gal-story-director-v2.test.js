import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';

import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTwentyFloorContent } from '../src/game/demo-20-floor-content.js';
import { applyDemoThirtyFloorContent } from '../src/game/demo-30-floor-content.js';
import { dialoguePresentation } from '../src/game/anime-portraits.js';

const shippedScenes = [
  'theme-red-vein.webp',
  'theme-star-mirror.webp',
  'theme-echo-court.webp',
  'theme-origin-core.webp',
  'theme-ash-registry.webp',
  'theme-night-shelter-v8.webp',
  'theme-audit-chamber-v8.webp',
  'theme-relay-gallery-v8.webp',
  'theme-triage-index-v8.webp',
  'theme-archive-storm.webp',
  'theme-ember-lighthouse.webp'
];

const keyStageStates = [
  ['cat_boss', 'alert', 'milu-dialogue-alert-v8.webp'],
  ['fox_boss', 'watchful', 'feiye-dialogue-watchful-v8.webp'],
  ['whale_boss', 'lament', 'lanyin-dialogue-lament-v8.webp'],
  ['sword_boss', 'stern', 'serena-dialogue-stern-audit-v3.webp'],
  ['dragon_boss', 'embers', 'yanli-dialogue-embers.webp'],
  ['astral_boss', 'focus', 'lumi-dialogue-focus-v8.webp'],
  ['shadow_boss', 'guarded', 'yayu-dialogue-guarded.webp'],
  ['echo_regent', 'grave', 'echo-regent-dialogue-grave.webp'],
  ['arcane_sovereign', 'regret', 'arcane-sovereign-dialogue-regret.webp'],
  ['act3_archive_warden', 'duty', 'archive-warden-dialogue-duty.webp']
];

function webpDimensions(buffer) {
  assert.equal(buffer.subarray(0, 4).toString('ascii'), 'RIFF', 'scene asset must be RIFF');
  assert.equal(buffer.subarray(8, 12).toString('ascii'), 'WEBP', 'scene asset must be WebP');
  const chunk = buffer.subarray(12, 16).toString('ascii');

  if (chunk === 'VP8 ') {
    assert.equal(buffer.subarray(23, 26).toString('hex'), '9d012a', 'VP8 frame header missing');
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff
    };
  }

  if (chunk === 'VP8L') {
    assert.equal(buffer[20], 0x2f, 'VP8L signature missing');
    const bits = buffer.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1
    };
  }

  if (chunk === 'VP8X') {
    return {
      width: buffer.readUIntLE(24, 3) + 1,
      height: buffer.readUIntLE(27, 3) + 1
    };
  }

  throw new Error(`unsupported WebP chunk ${JSON.stringify(chunk)}`);
}

test('witness-field story direction ships real scene art and stage art for the decisive Boss scenes', async () => {
  const main = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
  for (const filename of shippedScenes) {
    const assetUrl = new URL(`../public/assets/anime/themes/${filename}`, import.meta.url);
    const asset = await readFile(assetUrl);
    const { width, height } = webpDimensions(asset);
    // Flat cel-shaded art compresses dramatically better than the previous
    // painterly/noisy backgrounds, so byte size is no longer a quality proxy.
    assert.ok(asset.length > 5_000, `${filename} must contain substantive scene art`);
    assert.ok(width >= 640 && height >= 360, `${filename} must be at least 640x360, got ${width}x${height}`);
    assert.match(main, new RegExp(filename.replace('.', '\\.')));
  }

  for (const [id, expression, filename] of keyStageStates) {
    const presentation = dialoguePresentation(id, expression);
    assert.ok(presentation.hasPaintedExpression, `${id}:${expression} needs true standing art`);
    assert.match(presentation.stage, new RegExp(filename.replace('.', '\\.')));
    const asset = await stat(new URL(`../public${presentation.stage}`, import.meta.url));
    assert.ok(asset.size > 60_000, `${id}:${expression} must not be a scaled map token`);
  }

  for (const filename of ['liyue-echo-ledger-cg-audit-v3.webp', 'liyue-lighthouse-archive-cg.webp']) {
    const asset = await readFile(new URL(`../public/assets/anime/cg/${filename}`, import.meta.url));
    const { width, height } = webpDimensions(asset);
    assert.ok(asset.length > 10_000, `${filename} must contain substantive story art`);
    assert.ok(width >= 1600 && height >= 900, `${filename} must be at least 1600x900, got ${width}x${height}`);
  }
});

test('F5, F19, F20 and F30 use authored long Gal scenes with visual beats', () => {
  applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
  applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
  applyDemoTwentyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });
  applyDemoThirtyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });

  const scenes = [
    ['bossDragonPreDemo', 'dragon_boss'],
    ['floor19', 'echo_regent'],
    ['floor20', 'arcane_sovereign'],
    ['floor30', 'act3_archive_warden']
  ];
  for (const [sceneId, witness] of scenes) {
    const turns = DIALOGUES[sceneId]?.turns ?? [];
    assert.ok(turns.length >= 4, `${sceneId} should be a real confrontation, not a two-line tooltip`);
    assert.ok(turns.some((turn) => turn.kind === 'narration'), `${sceneId} needs a visible scene beat`);
    assert.ok(turns.some((turn) => turn.portrait === witness), `${sceneId} must stage its decisive witness`);
  }

  assert.equal(DIALOGUES.floor19.turns.some((turn) => turn.cg === '/assets/anime/cg/liyue-echo-ledger-cg-audit-v3.webp'), true);
  assert.equal(DIALOGUES.ending.turns.some((turn) => turn.cg === '/assets/anime/cg/liyue-lighthouse-archive-cg.webp'), true);
});
