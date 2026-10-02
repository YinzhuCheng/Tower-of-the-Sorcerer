import test from 'node:test';
import assert from 'node:assert/strict';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import {
  createDemoTenFloorMutationCatalog,
  expandDemoTenFloorCandidate,
  withDemoTenFloorCandidate
} from '../src/tuner/demo-10-floor-mutations.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
const catalog = createDemoTenFloorMutationCatalog();

test.skip('10F semantic co-design slots stay anchored to the frozen room maps', () => {
  for (const mutation of catalog.filter((entry) => entry.kind !== 'enemy-delta')) {
    for (const slot of [mutation.a, mutation.b]) {
      const floor = FLOORS.find((entry) => entry.number === slot.floor);
      assert.equal(floor.map[slot.y]?.[slot.x], slot.baselineToken, `${mutation.id} drifted from its room anchor`);
    }
  }
});

test.skip('bounded F7 semantic mutations stay off tri-gate cards, boss/core and stairs', () => {
  const floor7 = FLOORS.find((floor) => floor.number === 7);
  const f7 = catalog.filter((mutation) => mutation.floor === 7);
  assert.deepEqual(f7.map((mutation) => mutation.id).sort(), [
    'f7-reward-mid-stat-swap'
  ]);
  assert.equal(floor7.map[9][6], 'item:atk');
  assert.equal(floor7.map[9][9], 'item:def');
  for (const mutation of f7) {
    const tokens = [mutation.a.baselineToken, mutation.b.baselineToken];
    assert.ok(tokens.every((token) => !['item:sun', 'item:moon', 'item:star', 'enemy:shadowBoss', 'U', 'D', 'gate:tri'].includes(token)));
  }
});

test.skip('F7 reward timing swap changes placement and restores the baseline', () => {
  const floor7 = FLOORS.find((floor) => floor.number === 7);
  const beforeAtk = floor7.map[9][6];
  const beforeDef = floor7.map[9][9];
  withDemoTenFloorCandidate({ mutationIds: ['f7-reward-mid-stat-swap'] }, catalog, () => {
    assert.equal(floor7.map[9][6], beforeDef);
    assert.equal(floor7.map[9][9], beforeAtk);
  });
  assert.equal(floor7.map[9][6], beforeAtk);
  assert.equal(floor7.map[9][9], beforeDef);
});

test.skip('10F numeric setter mutation reaches authoritative data and restores baseline', () => {
  const baseline = ENEMIES.palaceWarden.magicPower;
  withDemoTenFloorCandidate({ mutationIds: ['f8-warden-magic-down10'] }, catalog, () => {
    assert.equal(ENEMIES.palaceWarden.magicPower, baseline - 10);
  });
  assert.equal(ENEMIES.palaceWarden.magicPower, baseline);
});

test.skip('10F reward-slot swap changes placement without changing token multiset and restores afterward', () => {
  const floor8 = FLOORS.find((floor) => floor.number === 8);
  const mutation = catalog.find((entry) => entry.id === 'f8-reward-mid-stat-swap');
  const beforeA = floor8.map[mutation.a.y][mutation.a.x];
  const beforeB = floor8.map[mutation.b.y][mutation.b.x];
  const sortedBefore = [beforeA, beforeB].sort();
  withDemoTenFloorCandidate({ mutationIds: ['f8-reward-mid-stat-swap'] }, catalog, () => {
    assert.equal(floor8.map[mutation.a.y][mutation.a.x], beforeB);
    assert.equal(floor8.map[mutation.b.y][mutation.b.x], beforeA);
    assert.deepEqual([floor8.map[mutation.a.y][mutation.a.x], floor8.map[mutation.b.y][mutation.b.x]].sort(), sortedBefore);
  });
  assert.equal(floor8.map[mutation.a.y][mutation.a.x], beforeA);
  assert.equal(floor8.map[mutation.b.y][mutation.b.x], beforeB);
});

test.skip('10F cross-floor resource exchange preserves campaign token budget and restores both floors', () => {
  const floor8 = FLOORS.find((floor) => floor.number === 8);
  const floor9 = FLOORS.find((floor) => floor.number === 9);
  const mutation = catalog.find((entry) => entry.id === 'cross-stat-f8-def-f9-atk');
  const before8 = floor8.map[mutation.a.y][mutation.a.x];
  const before9 = floor9.map[mutation.b.y][mutation.b.x];
  assert.equal(before8, 'item:def');
  assert.equal(before9, 'item:atk');
  withDemoTenFloorCandidate({ mutationIds: ['cross-stat-f8-def-f9-atk'] }, catalog, () => {
    assert.equal(floor8.map[mutation.a.y][mutation.a.x], before9);
    assert.equal(floor9.map[mutation.b.y][mutation.b.x], before8);
  });
  assert.equal(floor8.map[mutation.a.y][mutation.a.x], before8);
  assert.equal(floor9.map[mutation.b.y][mutation.b.x], before9);
});

test.skip('10F candidate expansion never combines opposite deltas from one mutation group', () => {
  const neighbors = expandDemoTenFloorCandidate(
    { mutationIds: ['f8-warden-magic-down10'] },
    catalog,
    { maxEdits: 2 }
  );
  assert.ok(neighbors.length > 0);
  assert.ok(neighbors.every((candidate) => !candidate.mutationIds.includes('f8-warden-magic-up10')));
});

test.skip('10F candidate expansion rejects distinct mutations that touch the same semantic slot', () => {
  const neighbors = expandDemoTenFloorCandidate(
    { mutationIds: ['f9-card-route-swap'] },
    catalog,
    { maxEdits: 2 }
  );
  assert.ok(neighbors.every((candidate) => !candidate.mutationIds.includes('cross-card-f8-sun-f9-star')));
});
