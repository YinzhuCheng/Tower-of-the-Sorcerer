import test from 'node:test';
import assert from 'node:assert/strict';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import {
  createDemoTenFloorMutationCatalog,
  expandDemoTenFloorCandidate,
  withDemoTenFloorCandidate
} from '../src/tuner/demo-10-floor-mutations.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
const catalog = createDemoTenFloorMutationCatalog();

test('10F numeric setter mutation reaches authoritative data and restores baseline', () => {
  const baseline = ENEMIES.palaceWarden.magicPower;
  withDemoTenFloorCandidate({ mutationIds: ['f8-warden-magic-down10'] }, catalog, () => {
    assert.equal(ENEMIES.palaceWarden.magicPower, baseline - 10);
  });
  assert.equal(ENEMIES.palaceWarden.magicPower, baseline);
});

test('10F reward-slot swap changes placement without changing token multiset and restores afterward', () => {
  const floor8 = FLOORS.find((floor) => floor.number === 8);
  const beforeA = floor8.map[3][5];
  const beforeB = floor8.map[5][5];
  const sortedBefore = [beforeA, beforeB].sort();
  withDemoTenFloorCandidate({ mutationIds: ['f8-reward-mid-stat-swap'] }, catalog, () => {
    assert.equal(floor8.map[3][5], beforeB);
    assert.equal(floor8.map[5][5], beforeA);
    assert.deepEqual([floor8.map[3][5], floor8.map[5][5]].sort(), sortedBefore);
  });
  assert.equal(floor8.map[3][5], beforeA);
  assert.equal(floor8.map[5][5], beforeB);
});

test('10F cross-floor resource exchange preserves campaign token budget and restores both floors', () => {
  const floor8 = FLOORS.find((floor) => floor.number === 8);
  const floor9 = FLOORS.find((floor) => floor.number === 9);
  const before8 = floor8.map[5][5];
  const before9 = floor9.map[5][5];
  assert.equal(before8, 'item:def');
  assert.equal(before9, 'item:atk');
  withDemoTenFloorCandidate({ mutationIds: ['cross-stat-f8-def-f9-atk'] }, catalog, () => {
    assert.equal(floor8.map[5][5], before9);
    assert.equal(floor9.map[5][5], before8);
  });
  assert.equal(floor8.map[5][5], before8);
  assert.equal(floor9.map[5][5], before9);
});

test('10F candidate expansion never combines opposite deltas from one mutation group', () => {
  const neighbors = expandDemoTenFloorCandidate(
    { mutationIds: ['f8-warden-magic-down10'] },
    catalog,
    { maxEdits: 2 }
  );
  assert.ok(neighbors.length > 0);
  assert.ok(neighbors.every((candidate) => !candidate.mutationIds.includes('f8-warden-magic-up10')));
});

test('10F candidate expansion rejects distinct mutations that touch the same semantic slot', () => {
  const neighbors = expandDemoTenFloorCandidate(
    { mutationIds: ['f9-card-route-swap'] },
    catalog,
    { maxEdits: 2 }
  );
  assert.ok(neighbors.every((candidate) => !candidate.mutationIds.includes('cross-card-f8-sun-f9-star')));
});
