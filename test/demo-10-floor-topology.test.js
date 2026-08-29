import test from 'node:test';
import assert from 'node:assert/strict';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import {
  analyzeDemoFloorTopology,
  compareDemoTenFloorCheckpointPortfolio,
  createDemoTenFloorTopologyContract,
  validateDemoTenFloorTopology
} from '../src/tuner/demo-10-floor-topology-validator.js';
import {
  createDemoTenFloorTopologyMutationCatalog,
  withDemoTenFloorTopologyMutation
} from '../src/tuner/demo-10-floor-topology-mutations.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
const contract = createDemoTenFloorTopologyContract(FLOORS);
const catalog = createDemoTenFloorTopologyMutationCatalog();

function floor(number) {
  return FLOORS.find((entry) => entry.number === number);
}

function checkpointPortfolio({ choiceLoss = 0.5, maxParetoWidth = 12, widths = [8, 10] } = {}) {
  return {
    choiceLoss,
    maxParetoWidth,
    choiceTargetFloors: [8, 9],
    floors: {
      8: { paretoWidth: widths[0] },
      9: { paretoWidth: widths[1] }
    }
  };
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

test('semantic topology catalogue is graph-derived and room-aware instead of coordinate-slot-driven', () => {
  assert.ok(catalog.length > 0);
  assert.ok(catalog.length <= 32);
  assert.ok(catalog.every((mutation) => mutation.kind === 'semantic-topology-wall-floor-swap'));
  assert.ok(catalog.some((mutation) => mutation.floor === 8));
  assert.ok(catalog.some((mutation) => mutation.floor === 9));
  assert.ok(catalog.every((mutation) => mutation.generator.startsWith('semantic-map-graph-v2')));
  assert.ok(catalog.every((mutation) => mutation.generator.includes('room-aware')));
  assert.ok(catalog.every((mutation) => mutation.close.baselineToken === '.'));
  assert.ok(catalog.every((mutation) => mutation.open.baselineToken === '#'));
  assert.ok(catalog.every((mutation) => mutation.close.criticalDistance > 1));
  assert.ok(catalog.every((mutation) => mutation.open.criticalDistance > 1));
  assert.ok(catalog.every((mutation) => Number.isFinite(mutation.open.chamberPotential)));
  assert.ok(catalog.every((mutation) => mutation.preview.hardeningGain >= 0));
  assert.ok(catalog.every((mutation) => Number.isFinite(mutation.preview.chamberScoreGain)));
  assert.ok(catalog.every((mutation) => mutation.preview.chamberScoreGain >= -0.03 - 1e-12));
});

test('semantic topology mutation preserves event signature and passable budget then restores exactly', () => {
  const mutation = catalog[0];
  assert.ok(mutation);
  const targetFloor = floor(mutation.floor);
  const before = analyzeDemoFloorTopology(targetFloor);
  const beforeMap = targetFloor.map.map((row) => [...row]);

  withDemoTenFloorTopologyMutation(mutation, () => {
    const current = analyzeDemoFloorTopology(targetFloor);
    assert.equal(current.eventSignature, before.eventSignature);
    assert.equal(current.passableNodes, before.passableNodes);
    assert.equal(current.components, 1);
    assert.equal(current.allPassableReachableFromDown, true);
    assert.equal(targetFloor.map[mutation.close.y][mutation.close.x], '#');
    assert.equal(targetFloor.map[mutation.open.y][mutation.open.x], '.');
  });

  assert.deepEqual(targetFloor.map, beforeMap);
  assert.equal(analyzeDemoFloorTopology(targetFloor).eventSignature, before.eventSignature);
  assert.equal(validateDemoTenFloorTopology(FLOORS, contract).ok, true);
});

test('semantic candidate preview does not cheapen the dominant static route or collapse chamber grammar', () => {
  for (const mutation of catalog) {
    assert.ok(mutation.preview.candidateBurden >= mutation.preview.baselineBurden);
    assert.ok(mutation.preview.stepGain <= 12);
    assert.ok(mutation.preview.diversityGain >= -0.18 - 1e-12);
    assert.ok(mutation.preview.chamberScoreGain >= -0.03 - 1e-12);
    assert.ok(mutation.preview.candidateParetoRoutes >= Math.max(1, mutation.preview.baselineParetoRoutes - 1));
  }
});

test('relative topology checkpoint gate accepts a nonzero baseline tie or improvement', () => {
  const baseline = checkpointPortfolio({ choiceLoss: 0.5, maxParetoWidth: 12, widths: [8, 10] });
  const tie = compareDemoTenFloorCheckpointPortfolio(
    checkpointPortfolio({ choiceLoss: 0.5, maxParetoWidth: 12, widths: [8, 10] }),
    baseline
  );
  assert.equal(tie.ok, true);
  assert.equal(tie.checkpointGain, 0);

  const improvement = compareDemoTenFloorCheckpointPortfolio(
    checkpointPortfolio({ choiceLoss: 0.375, maxParetoWidth: 11, widths: [7, 9] }),
    baseline
  );
  assert.equal(improvement.ok, true);
  assert.equal(improvement.checkpointGain, 0.125);
  assert.equal(improvement.maxParetoWidthDelta, -1);
});

test('relative topology checkpoint gate blocks aggregate or per-floor Pareto regressions', () => {
  const baseline = checkpointPortfolio({ choiceLoss: 0.5, maxParetoWidth: 12, widths: [8, 10] });
  const aggregateRegression = compareDemoTenFloorCheckpointPortfolio(
    checkpointPortfolio({ choiceLoss: 0.625, maxParetoWidth: 12, widths: [8, 10] }),
    baseline
  );
  assert.equal(aggregateRegression.ok, false);
  assert.ok(aggregateRegression.violations.includes('choice-loss-regression'));

  const floorRegression = compareDemoTenFloorCheckpointPortfolio(
    checkpointPortfolio({ choiceLoss: 0.5, maxParetoWidth: 12, widths: [9, 9] }),
    baseline
  );
  assert.equal(floorRegression.ok, false);
  assert.ok(floorRegression.violations.includes('f8:pareto-width-regression'));
});
