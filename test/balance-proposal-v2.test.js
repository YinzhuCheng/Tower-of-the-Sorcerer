import test from 'node:test';
import assert from 'node:assert/strict';
import { createBalanceReviewProposal, evaluateBalanceReviewGate } from '../src/tuner/balance-proposal-v2.js';

function report(overrides = {}) {
  return {
    hpReward: 180,
    magicPower: 300,
    converged: true,
    acceptedHardConstraints: true,
    route: { solvable: true, final: { hp: 2000 }, minNormalizedHpMargin: 0.165, purchaseCounts: {} },
    solver: { solvable: true, exact: true },
    counterfactuals: { recoveryRate: 0.8, catastrophicRate: 0.05, highRegretRate: 0.2, improvedMutationCount: 0 },
    ...overrides
  };
}

test('review proposal requires a locally stable player response', () => {
  const stable = evaluateBalanceReviewGate(report());
  assert.equal(stable.passed, true);
  const proposal = createBalanceReviewProposal({ report: report(), candidateScore: 0.03 });
  assert.equal(proposal.status, 'ready_for_review');
  assert.equal(proposal.productionWriteAllowed, false);
  assert.equal(proposal.edits.length, 3);
});

test('candidate with a better one-purchase neighbor is blocked', () => {
  const unstable = report({
    counterfactuals: { recoveryRate: 1, catastrophicRate: 0, highRegretRate: 0.15, improvedMutationCount: 1 }
  });
  const proposal = createBalanceReviewProposal({ report: unstable });
  assert.equal(proposal.status, 'blocked');
  assert.equal(proposal.edits.length, 0);
  assert.ok(proposal.gate.failures.includes('playerOneOptimal'));
});
