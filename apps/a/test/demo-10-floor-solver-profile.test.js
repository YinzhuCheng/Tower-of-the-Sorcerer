import test from 'node:test';
import assert from 'node:assert/strict';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import {
  assertDemoTenFloorSolverLocks,
  captureDemoTenFloorSolverLocks,
  DEMO10_SOLVER_TUNING_PROFILE,
  selectDemoTenFloorSolverMutations
} from '../src/tuner/demo-10-floor-solver-profile.js';
import {
  createDemoTenFloorMutationCatalog,
  withDemoTenFloorCandidate
} from '../src/tuner/demo-10-floor-mutations.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorHardMode({ enemies: ENEMIES });

const fullCatalog = createDemoTenFloorMutationCatalog();
const catalog = selectDemoTenFloorSolverMutations(fullCatalog);
const locks = captureDemoTenFloorSolverLocks({ floors: FLOORS, enemies: ENEMIES });

test('topology-locked solver profile exposes only ordinary mutations', () => {
  assert.equal(catalog.length, DEMO10_SOLVER_TUNING_PROFILE.allowedMutationIds.length);
  assert.ok(catalog.every((mutation) => DEMO10_SOLVER_TUNING_PROFILE.allowedMutationIds.includes(mutation.id)));
  assert.ok(catalog.every((mutation) => mutation.enemyId !== 'palaceWarden'));
  assert.ok(catalog.every((mutation) => mutation.enemyId !== 'blackSealKeeper'));
  assert.ok(catalog.every((mutation) => !/card|door|rune|cross/.test(mutation.id)));
  assert.equal(DEMO10_SOLVER_TUNING_PROFILE.productionWriteAllowed, false);
});

test('profile permits an ordinary numeric probe while preserving all locked anchors', () => {
  const baseline = ENEMIES.eclipseMage.magicPower;
  withDemoTenFloorCandidate({ mutationIds: ['f10-eclipse-mage-magic-up6'] }, catalog, () => {
    assert.equal(ENEMIES.eclipseMage.magicPower, baseline + 6);
    assert.deepEqual(assertDemoTenFloorSolverLocks(locks, { floors: FLOORS, enemies: ENEMIES }), {
      ok: true,
      profileId: DEMO10_SOLVER_TUNING_PROFILE.id
    });
  });
  assert.equal(ENEMIES.eclipseMage.magicPower, baseline);
});

test('profile lock assertion catches a critical relic movement before replay', () => {
  const floor2 = FLOORS.find((floor) => floor.number === 2);
  const original = floor2.map[1][1];
  assert.equal(original, 'item:lucky');
  floor2.map[1][1] = 'item:atk';
  try {
    assert.throws(
      () => assertDemoTenFloorSolverLocks(locks, { floors: FLOORS, enemies: ENEMIES }),
      /changed a locked progression anchor/
    );
  } finally {
    floor2.map[1][1] = original;
  }
  assertDemoTenFloorSolverLocks(locks, { floors: FLOORS, enemies: ENEMIES });
});

test('profile rejects legacy guardian mutations even when the broad catalog still supports them', () => {
  assert.ok(fullCatalog.some((mutation) => mutation.id === 'f8-warden-magic-down10'));
  assert.ok(!catalog.some((mutation) => mutation.id === 'f8-warden-magic-down10'));
  assert.throws(
    () => withDemoTenFloorCandidate({ mutationIds: ['f8-warden-magic-down10'] }, catalog, () => {}),
    /Unknown 10F mutation/
  );
});
