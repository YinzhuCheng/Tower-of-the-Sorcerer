import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEMO10_CODESIGN_POLICY_SPECS,
  paretoCheckpointSamples,
  summarizeDemoTenFloorCheckpoints
} from '../src/analyzer/demo-10-floor-checkpoints.js';

function sample(policyId, atk, def, hp = 100) {
  return {
    policyId,
    stateClass: 'p:3|c:1|holy:true|ward:false|lucky:false',
    resources: { hp, maxHp: 100, atk, def, gold: 10 },
    cards: { sun: 1, moon: 1, star: 0 }
  };
}

function report(atk, def) {
  return {
    solvable: true,
    holyPolicy: 'immediate',
    purchaseLog: [],
    battleLog: [{
      floor: 2,
      enemyId: 'boss',
      boss: true,
      statsBefore: { hp: 100, maxHp: 100, atk, def, gold: 10 },
      purchasesBefore: 3,
      coresBefore: 1,
      cardsBefore: { sun: 1, moon: 1, star: 0 },
      relicsBefore: { holy: true }
    }]
  };
}

test('10F diagnostic player portfolio keeps six hard cycles but broadens heuristic coverage', () => {
  assert.equal(DEMO10_CODESIGN_POLICY_SPECS.length, 33);
  assert.equal(DEMO10_CODESIGN_POLICY_SPECS.filter((spec) => spec.qualityGate).length, 6);
  assert.equal(DEMO10_CODESIGN_POLICY_SPECS.filter((spec) => spec.diagnosticFamily === 'pure-stat-extreme').length, 3);
  assert.equal(DEMO10_CODESIGN_POLICY_SPECS.filter((spec) => spec.diagnosticFamily === 'one-purchase-perturbation').length, 12);
});

test('checkpoint Pareto keeps tradeoffs and drops a dominated resource state', () => {
  const frontier = paretoCheckpointSamples([
    sample('atk', 20, 10),
    sample('def', 10, 20),
    sample('dominated', 9, 9)
  ]);
  assert.deepEqual(frontier.map((entry) => entry.policyId).sort(), ['atk', 'def']);
});

test('checkpoint Pareto counts equivalent resource states once while retaining policy provenance', () => {
  const frontier = paretoCheckpointSamples([
    sample('same-a', 20, 10),
    sample('same-b', 20, 10),
    sample('other', 10, 20)
  ]);
  assert.equal(frontier.length, 2);
  const duplicateState = frontier.find((entry) => entry.resources.atk === 20);
  assert.deepEqual(duplicateState.equivalentPolicyIds, ['same-a', 'same-b']);
});

test('10F checkpoint summary exposes controlled Pareto width and prunability evidence', () => {
  const reports = [report(20, 10), report(10, 20), report(9, 9)];
  const policySpecs = [{ id: 'atk' }, { id: 'def' }, { id: 'weak' }];
  const summary = summarizeDemoTenFloorCheckpoints(reports, {
    policySpecs,
    floors: [2],
    choiceTargetFloors: [2]
  });
  assert.equal(summary.floors[2].paretoWidth, 2);
  assert.equal(summary.choiceLoss, 0);
  assert.equal(summary.prunabilityEvidence.routePortfolio.paretoWidth, 2);
  assert.equal(summary.heuristicOnly, true);
});
