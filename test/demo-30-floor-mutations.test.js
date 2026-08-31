
import assert from 'node:assert/strict';
import test from 'node:test';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTwentyFloorContent } from '../src/game/demo-20-floor-content.js';
import { applyDemoThirtyFloorContent, DEMO30_NUMERIC_BASELINE, DEMO30_NUMERIC_BASELINE_ID } from '../src/game/demo-30-floor-content.js';
import {
  DEMO30_MUTATION_SCOPE,
  createDemoThirtyFloorMutationCatalog,
  evaluateDemoThirtyFloorMutationCandidate,
  withDemoThirtyFloorCandidate
} from '../src/tuner/demo-30-floor-mutations.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorHardMode({ enemies: ENEMIES });
applyDemoTwentyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });
applyDemoThirtyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });

test('Act III mutator is numeric-only and restores authoritative values', () => {
  const catalog = createDemoThirtyFloorMutationCatalog();
  const baseline = ENEMIES.errataCore.hp;
  const observed = withDemoThirtyFloorCandidate({ mutationIds: ['act3-final-hp-plus4'] }, catalog, () => ENEMIES.errataCore.hp);
  assert.ok(observed > baseline);
  assert.equal(ENEMIES.errataCore.hp, baseline);
  assert.deepEqual(DEMO30_MUTATION_SCOPE.locked, ['maps', 'charter-gates', 'charter-items', 'handoff-order', 'card-prices', 'enemy-order', 'final-phase-order']);
});

test('Act III release baseline keeps the certified F27 and F30 pressure', () => {
  assert.equal(DEMO30_NUMERIC_BASELINE_ID, 'demo-30f-afterlight-route-baseline-v2');
  assert.equal(DEMO30_NUMERIC_BASELINE.marginDuelist.atk, 381);
  assert.equal(DEMO30_NUMERIC_BASELINE.errataCantor.magicPower, 294);
  assert.equal(DEMO30_NUMERIC_BASELINE.archiveMarshal.atk, 385);
  assert.deepEqual(
    DEMO30_NUMERIC_BASELINE.archiveWarden,
    { hp: 13_728, atk: 400, def: 310, gold: 0, boss: true, special: 'magic', magicPower: 443, phaseNext: 'errataCore' }
  );
  assert.deepEqual(
    DEMO30_NUMERIC_BASELINE.errataCore,
    { hp: 16_016, atk: 515, def: 310, gold: 0, boss: true, finalBoss: true, special: 'doubleHit' }
  );
});

test('Act III hardening refuses a portfolio that loses any charter route', () => {
  const catalog = createDemoThirtyFloorMutationCatalog();
  const result = evaluateDemoThirtyFloorMutationCandidate({
    candidate: { mutationIds: ['act3-final-hp-plus4'] },
    catalog,
    evaluatePortfolio: () => ({
      publishable: false,
      entries: [{ id: 'shelter', completed: true }, { id: 'audit', completed: true }, { id: 'relay', completed: false }]
    })
  });
  assert.equal(result.publishable, false);
});
