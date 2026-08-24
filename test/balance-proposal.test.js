import test from 'node:test';
import assert from 'node:assert/strict';
import { createBalanceProposal, evaluatePromotionGate } from '../src/tuner/balance-proposal.js';

function report(overrides = {}) {
  return {
    hpReward: 180,
    magicPower: 300,
    converged: true,
    acceptedHardConstraints: true,
    hardChecks: {},
    route: { solvable: true, final: { hp: 2000 }, minNormalizedHpMargin: 0.165, purchaseCounts: { atk: 4, def: 6, hp: 20 }, tightestBattle: null },
    solver: { solvable: true, exact: true },
    counterfactuals: { totalMutations: 60, recoveryRate: 0.8, catastrophicRate: 0.05, highRegretRate: 0.2, improvedMutationCount: 0 },
    ...overrides
  };
}

test('promotion gate admits only converged proof-backed candidates', () => {
  const gate = evaluatePromotionGate(report());
  assert.equal(gate.passed, true);
  assert.deepEqual(gate.failures, []);
  const proposal = createBalanceProposal({ report: report(), candidateScore: 0.03 });
  assert.equal(proposal.status, 'ready_for_review');
  assert.equal(proposal.edits.length, 3);
  assert.equal(proposal.edits[0].value, 180);
  assert.equal(proposal.edits[2].value, 300);
});

test('promotion gate blocks non-converged or fragile candidates without emitting edits', () => {
  const fragile = report({
    converged: false,
    route: { solvable: true, final: { hp: 100 }, minNormalizedHpMargin: 0.03, purchaseCounts: {}, tightestBattle: null },
    counterfactuals: { totalMutations: 60, recoveryRate: 0.4, catastrophicRate: 0.2, highRegretRate: 0.4, improvedMutationCount: 3 }
  });
  const proposal = createBalanceProposal({ report: fragile });
  assert.equal(proposal.status, 'blocked');
  assert.equal(proposal.edits.length, 0);
  assert.ok(proposal.gate.failures.includes('converged'));
  assert.ok(proposal.gate.failures.includes('pressureTarget'));
  assert.ok(proposal.gate.failures.includes('recovery'));
  assert.ok(proposal.gate.failures.includes('catastrophic'));
});
