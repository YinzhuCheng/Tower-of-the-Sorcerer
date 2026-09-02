import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';

import { dialoguePresentation } from '../src/game/anime-portraits.js';

function assertHighResolutionWebp(buffer, label) {
  assert.equal(buffer.subarray(0, 4).toString('ascii'), 'RIFF', `${label} must be RIFF`);
  assert.equal(buffer.subarray(8, 12).toString('ascii'), 'WEBP', `${label} must be WebP`);
  const chunk = buffer.subarray(12, 16).toString('ascii');
  let width;
  let height;
  if (chunk === 'VP8 ') {
    width = buffer.readUInt16LE(26) & 0x3fff;
    height = buffer.readUInt16LE(28) & 0x3fff;
  } else if (chunk === 'VP8L') {
    const bits = buffer.readUInt32LE(21);
    width = (bits & 0x3fff) + 1;
    height = ((bits >> 14) & 0x3fff) + 1;
  } else if (chunk === 'VP8X') {
    width = buffer.readUIntLE(24, 3) + 1;
    height = buffer.readUIntLE(27, 3) + 1;
  } else {
    throw new Error(`unsupported WebP chunk ${JSON.stringify(chunk)}`);
  }
  assert.ok(buffer.length > 5_000, `${label} must contain substantive image data`);
  assert.ok(width >= 1_600 && height >= 900, `${label} must be at least 1600x900, got ${width}x${height}`);
}

test('Gal scenes bridge into and out of the same Tower instead of hard-cutting from the tactical UI', async () => {
  const [main, css, witness, seal] = await Promise.all([
    readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
    readFile(new URL('../ui-v10-cinematics.css', import.meta.url), 'utf8'),
    readFile(new URL('../public/assets/anime/transitions/witness-entry.webp', import.meta.url)),
    readFile(new URL('../public/assets/anime/transitions/seal-shatter.webp', import.meta.url))
  ]);

  assertHighResolutionWebp(witness, 'witness entry');
  assertHighResolutionWebp(seal, 'Boss entry');
  for (const token of ['GAL_TRANSITIONS', 'GAL_BOSS_SCENES', 'beginGalScene', 'closeGalScene', 'gal-witness-transition', 'is-entering', 'is-exiting']) {
    assert.match(main, new RegExp(token));
  }
  for (const token of ['witnessFieldEnter', 'witnessFieldExit', 'witnessStageArrive', 'witnessStageRecede', 'gal-witness-transition']) {
    assert.match(css, new RegExp(token));
  }
});

test('lead and late-Boss scene states resolve to real high-resolution standing art', async () => {
  const states = [
    ['hero', 'guarded', 'liyue-dialogue-guarded-v2.webp'],
    ['hero', 'embers', 'liyue-dialogue-embers-v2.webp'],
    ['final_queen', 'cold', 'noctia-dialogue-cold-v2.webp'],
    ['final_queen', 'knowing', 'noctia-dialogue-knowing-v2.webp'],
    ['echo_regent', 'release', 'echo-regent-dialogue-release.webp'],
    ['arcane_sovereign', 'acceptance', 'arcane-sovereign-dialogue-acceptance.webp']
  ];

  for (const [id, expression, filename] of states) {
    const presentation = dialoguePresentation(id, expression);
    assert.ok(presentation.hasPaintedExpression, `${id}:${expression} needs genuine standing art`);
    assert.match(presentation.stage, new RegExp(filename.replace('.', '\\.')));
    const asset = await stat(new URL(`../public${presentation.stage}`, import.meta.url));
    assert.ok(asset.size > 150_000, `${id}:${expression} must be a full scene asset, not a map token`);
  }
});

test('F10 and F20 climax beats bind authored CG rather than falling back to a generic backdrop', async () => {
  const [f10, f20, seal, sovereign] = await Promise.all([
    readFile(new URL('../src/game/demo-10-floor-content.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/game/demo-20-floor-content.js', import.meta.url), 'utf8'),
    readFile(new URL('../public/assets/anime/cg/liyue-noctia-seal-cg.webp', import.meta.url)),
    readFile(new URL('../public/assets/anime/cg/liyue-noctia-sovereign-cg.webp', import.meta.url))
  ]);

  assertHighResolutionWebp(seal, 'F10 seal-break CG');
  assertHighResolutionWebp(sovereign, 'F20 accountability CG');
  assert.match(f10, /queenPhaseDemo[\s\S]*?liyue-noctia-seal-cg\.webp/);
  assert.match(f20, /floor20[\s\S]*?liyue-noctia-sovereign-cg\.webp/);
});
