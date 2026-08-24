import test from 'node:test';
import assert from 'node:assert/strict';
import { adaptFinalPressureCandidate } from '../src/tuner/adaptive-final-pressure.js';

test('adaptive final-pressure loop co-optimizes player plan under bounded exploration', { timeout: 60_000 }, () => {
  const report = adaptFinalPressureCandidate({
    hpReward: 90,
    targetMargin: 0.165,
    maxOuterIterations: 3,
    maxLocalPasses: 4,
    maxExpanded: 5_000,
    maxGenerated: 50_000
  });

  assert.equal(report.model, 'adaptive-final-pressure-v0.1');
  assert.equal(report.hpReward, 90);
  assert.ok(Number.isFinite(report.magicPower));
  assert.ok(report.iterations.length >= 1 && report.iterations.length <= 3);
  assert.ok(report.route?.solvable, report.failure ?? report.rejection ?? 'adaptive route should remain solvable');
  assert.equal(report.solver?.solvable, true);
  assert.equal(report.solver?.exact, true);
  assert.equal(report.counterfactuals?.totalMutations, 60);
  assert.ok(report.counterfactuals?.recoveryRate >= 0 && report.counterfactuals?.recoveryRate <= 1);
  assert.ok(report.counterfactuals?.catastrophicRate >= 0 && report.counterfactuals?.catastrophicRate <= 1);

  console.log(`TOWER_ADAPTIVE_PRESSURE_PROFILE ${JSON.stringify({
    hpReward: report.hpReward,
    magicPower: report.magicPower,
    targetMargin: report.targetMargin,
    converged: report.converged,
    acceptedHardConstraints: report.acceptedHardConstraints,
    hardChecks: report.hardChecks,
    rejection: report.rejection,
    iterations: report.iterations,
    route: report.route,
    solver: report.solver,
    counterfactuals: report.counterfactuals
  })}`);
});
