import test from 'node:test';
import assert from 'node:assert/strict';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import {
  analyzeDemoFloorTopology,
  createDemoTenFloorTopologyContract,
  validateDemoTenFloorTopology
} from '../src/tuner/demo-10-floor-topology-validator.js';
import {
  createDemoTenFloorTopologyMutationCatalog,
  withDemoTenFloorTopologyMutation
} from '../src/tuner/demo-10-floor-topology-mutations.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
const contract = createDemoTenFloorTopologyContract(FLOORS);
const catalog = createDemoTenFloorTopologyMutationCatalog();

function floor(number) {
  return FLOORS.find((entry) => entry.number === number);
}

test('10F topology baseline exposes stable F8/F9 graph metrics', () => {
  const f8 = analyzeDemoFloorTopology(floor(8));
  const f9 = analyzeDemoFloorTopology(floor(9));
  assert.deepEqual(
    [f8.passableNodes, f8.edges, f8.cycleRank, f8.deadEnds, f8.branchNodes, f8.downToUpDistance],
    [52, 55, 4, 0, 6, 16]
  );
  assert.deepEqual(
    [f9.passableNodes, f9.edges, f9.cycleRank, f9.deadEnds, f9.branchNodes, f9.downToUpDistance],
    [53, 57, 5, 0, 7, 16]
  );
  assert.equal(f8.allPassableReachableFromDown, true);
  assert.equal(f9.allPassableReachableFromDown, true);
  assert.equal(validateDemoTenFloorTopology(FLOORS, contract).ok, true);
});

test('topology catalog contains 32 one-wall/one-floor semantic swaps', () => {
  assert.equal(catalog.length, 32);
  assert.ok(catalog.every((mutation) => mutation.kind === 'topology-wall-floor-swap'));
  assert.equal(catalog.filter((mutation) => mutation.floor === 8).length, 16);
  assert.equal(catalog.filter((mutation) => mutation.floor === 9).length, 16);
});

test('valid topology mutation preserves event signature and restores map', () => {
  const mutation = catalog.find((entry) => entry.id === 'f8-topology-wallMidWest-floorMidCenter');
  const before = analyzeDemoFloorTopology(floor(8));
  withDemoTenFloorTopologyMutation(mutation, () => {
    const report = validateDemoTenFloorTopology(FLOORS, contract);
    assert.equal(report.ok, true);
    assert.equal(report.floors[8].current.eventSignature, before.eventSignature);
    assert.equal(report.floors[8].current.passableNodes, before.passableNodes);
  });
  assert.equal(analyzeDemoFloorTopology(floor(8)).eventSignature, before.eventSignature);
  assert.equal(validateDemoTenFloorTopology(FLOORS, contract).ok, true);
});

test('topology contract rejects a wall-floor swap that creates too many dead ends', () => {
  const mutation = catalog.find((entry) => entry.id === 'f8-topology-wallNwBridge-floorNorthCenter');
  withDemoTenFloorTopologyMutation(mutation, () => {
    const report = validateDemoTenFloorTopology(FLOORS, contract);
    assert.equal(report.ok, false);
    assert.ok(report.floors[8].violations.includes('dead-ends'));
  });
  assert.equal(validateDemoTenFloorTopology(FLOORS, contract).ok, true);
});
