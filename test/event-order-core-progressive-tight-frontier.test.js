import test from 'node:test';
import assert from 'node:assert/strict';
import { nextProgressiveResidualGoalCap } from '../src/analyzer/event-order-core-progressive-tight-frontier.js';

test('progressive frontier doubles cap only when residual quota is still short', () => {
  assert.equal(nextProgressiveResidualGoalCap({ currentCap: 32, maxCap: 256, residualGoals: 10, targetResidualGoals: 32 }), 64);
  assert.equal(nextProgressiveResidualGoalCap({ currentCap: 64, maxCap: 256, residualGoals: 20, targetResidualGoals: 32 }), 128);
});

test('progressive frontier stops once residual quota is met or frontier is exact', () => {
  assert.equal(nextProgressiveResidualGoalCap({ currentCap: 32, maxCap: 256, residualGoals: 32, targetResidualGoals: 32 }), null);
  assert.equal(nextProgressiveResidualGoalCap({ currentCap: 32, maxCap: 256, residualGoals: 0, targetResidualGoals: 32, coverageExact: true }), null);
});

test('progressive frontier never exceeds configured safety cap', () => {
  assert.equal(nextProgressiveResidualGoalCap({ currentCap: 128, maxCap: 192, residualGoals: 1, targetResidualGoals: 32 }), 192);
  assert.equal(nextProgressiveResidualGoalCap({ currentCap: 192, maxCap: 192, residualGoals: 1, targetResidualGoals: 32 }), null);
});
