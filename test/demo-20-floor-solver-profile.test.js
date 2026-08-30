import test from 'node:test';
import assert from 'node:assert/strict';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS, SHOP_OPTIONS } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTwentyFloorContent } from '../src/game/demo-20-floor-content.js';
import {
  assertDemoTwentyFloorSolverLocks,
  captureDemoTwentyFloorSolverLocks,
  DEMO20_SOLVER_TUNING_PROFILE
} from '../src/tuner/demo-20-floor-solver-profile.js';
import {
  createDemoTwentyFloorMutationCatalog,
  expandDemoTwentyFloorCandidate,
  scoreDemoTwentyFloorPruningCandidate,
  withDemoTwentyFloorCandidate
} from '../src/tuner/demo-20-floor-mutations.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorHardMode({ enemies: ENEMIES });
applyDemoTwentyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });

const dependencies = { floors: FLOORS, enemies: ENEMIES, items: ITEMS, shopOptions: SHOP_OPTIONS };
const locks = captureDemoTwentyFloorSolverLocks(dependencies);
const catalog = createDemoTwentyFloorMutationCatalog(dependencies);

test('Act II mutation profile exposes numbers and MP effects but never map or placement edits', () => {
  assert.equal(DEMO20_SOLVER_TUNING_PROFILE.productionWriteAllowed, false);
  assert.ok(catalog.length > 30);
  assert.ok(catalog.every((entry) => ['enemy-scale', 'enemy-delta', 'enemy-profile', 'relic-delta', 'shop-delta'].includes(entry.kind)));
  assert.ok(catalog.every((entry) => !('x' in entry) && !('y' in entry) && !('map' in entry)));
  assert.ok(catalog.some((entry) => entry.id === 'f11to13-hp-harden6'));
  assert.ok(catalog.some((entry) => entry.id === 'f15-maxMp-maxMp-boost10'));
  assert.ok(catalog.some((entry) => entry.id === 'f14-guardians-feasibility-soften'));
});

test('numeric hardening is reversible and preserves all topology/key-unit locks', () => {
  const entry = catalog.find((candidate) => candidate.id === 'f11to13-hp-harden6');
  const baseline = ENEMIES.manaWisp.hp;
  withDemoTwentyFloorCandidate({ mutationIds: [entry.id] }, catalog, () => {
    assert.ok(ENEMIES.manaWisp.hp > baseline);
    assert.deepEqual(assertDemoTwentyFloorSolverLocks(locks, dependencies), {
      ok: true,
      profileId: DEMO20_SOLVER_TUNING_PROFILE.id
    });
  }, { ...dependencies, locks });
  assert.equal(ENEMIES.manaWisp.hp, baseline);
});

test('coarse F14 feasibility profile remains numeric-only and restores every guardian field', () => {
  const entry = catalog.find((candidate) => candidate.id === 'f14-guardians-feasibility-soften');
  const before = {
    hp: ENEMIES.arcaneGatekeeper.hp,
    magic: ENEMIES.spectrumMarshal.magicPower,
    def: ENEMIES.triuneArbiter.def
  };
  withDemoTwentyFloorCandidate({ mutationIds: [entry.id] }, catalog, () => {
    assert.ok(ENEMIES.arcaneGatekeeper.hp < before.hp);
    assert.ok(ENEMIES.spectrumMarshal.magicPower < before.magic);
    assert.ok(ENEMIES.triuneArbiter.def < before.def);
  }, { ...dependencies, locks });
  assert.deepEqual({
    hp: ENEMIES.arcaneGatekeeper.hp,
    magic: ENEMIES.spectrumMarshal.magicPower,
    def: ENEMIES.triuneArbiter.def
  }, before);
});

test('candidate expansion prevents opposite or overlapping numeric edits', () => {
  const neighbors = expandDemoTwentyFloorCandidate({ mutationIds: ['f11to13-hp-harden6'] }, catalog);
  assert.ok(neighbors.length > 0);
  assert.ok(neighbors.every((candidate) => !candidate.mutationIds.includes('f11to13-hp-soften6')));
  assert.ok(neighbors.every((candidate) => candidate.mutationIds.length === 2));
});

test('pruning score favours scoped enemy hardening before expensive solving', () => {
  const hard = scoreDemoTwentyFloorPruningCandidate({ mutationIds: ['f11to13-hp-harden6'] }, catalog);
  const soft = scoreDemoTwentyFloorPruningCandidate({ mutationIds: ['f11to13-hp-soften6'] }, catalog);
  assert.ok(hard.scoutPriority > soft.scoutPriority);
  assert.ok(hard.affectedEnemies >= 4);
});

test('profile rejects moving a fixed Act II card gate before candidate replay', () => {
  const floor13 = FLOORS.find((floor) => floor.number === 13);
  const original = floor13.map[2][4];
  assert.equal(original, 'gate:f13StarConduit');
  floor13.map[2][4] = '.';
  try {
    assert.throws(
      () => assertDemoTwentyFloorSolverLocks(locks, dependencies),
      /changed a locked topology, critical unit, relic, gate, card, room, or stair anchor/
    );
  } finally {
    floor13.map[2][4] = original;
  }
  assertDemoTwentyFloorSolverLocks(locks, dependencies);
});
