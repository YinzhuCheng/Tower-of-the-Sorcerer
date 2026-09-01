import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';

import { dialoguePresentation } from '../src/game/anime-portraits.js';

test('Gal scenes bridge into and out of the same Tower instead of hard-cutting from the tactical UI', async () => {
  const [main, css, witness, seal] = await Promise.all([
    readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
    readFile(new URL('../ui-v10-cinematics.css', import.meta.url), 'utf8'),
    stat(new URL('../public/assets/anime/transitions/witness-entry.webp', import.meta.url)),
    stat(new URL('../public/assets/anime/transitions/seal-shatter.webp', import.meta.url))
  ]);

  assert.ok(witness.size > 120_000, 'witness entry must be a real illustrated transition plate');
  assert.ok(seal.size > 120_000, 'Boss entry must be a real illustrated transition plate');
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
    stat(new URL('../public/assets/anime/cg/liyue-noctia-seal-cg.webp', import.meta.url)),
    stat(new URL('../public/assets/anime/cg/liyue-noctia-sovereign-cg.webp', import.meta.url))
  ]);

  assert.ok(seal.size > 250_000, 'F10 seal-break CG must be a full illustrated plate');
  assert.ok(sovereign.size > 300_000, 'F20 accountability CG must be a full illustrated plate');
  assert.match(f10, /queenPhaseDemo[\s\S]*?liyue-noctia-seal-cg\.webp/);
  assert.match(f20, /floor20[\s\S]*?liyue-noctia-sovereign-cg\.webp/);
});
