import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createGenericBalanceReviewProposal,
  evaluateGenericBalanceReviewGate
} from '../src/tuner/balance-proposal-v3.js';

function passingReport() {
  return {
    model: 'adaptive-numeric-ray-v0.3-complete-holy-coverage',
    candidateId: 'numeric-combo-test',
    leverKeys: ['shop:hp', 'enemy:a:def', 'enemy:b:magicPower'],
    acceptedHardConstraints: true,
    converged: true,
    hardChecks: {
      adaptedRouteSolvable: true,
      holyPolicyBestResponse: true
    },
    holyPolicyAnalysis: {
      stableWithinSeedPortfolio: true,
      allOptimizedLocalOptimal: true,
      coverageComplete: true,
      selectedHolyPolicy: 'immediate',
      optimizedPolicies: 4,
      attemptedPolicies: 4,
      uncoveredPolicies: []
    },
    best: {
      margin: 0.16,
      holyPolicy: 'immediate',
      edits: [
        { target: 'shop', id: 'hp', field: 'effect.hp', value: 400 },
        { target: 'shop', id: 'hp', field: 'effect.maxHp', value: 400 },
        { target: 'enemy', id: 'a', field: 'def', value: 40 }
      ]
    },
    solver: { solvable: true, exact: true },
    counterfactuals: {
      improvedMutationCount: 0,
      recoveryRate: 0.9,
      catastrophicRate: 0.05
    },
    monotonicViolations: []
  };
}

test('generic review proposal accepts complete Holy-aware proof-backed numeric edits but still blocks production writes', () => {
  const report = passingReport();
  const gate = evaluateGenericBalanceReviewGate(report);
  assert.equal(gate.passed, true);
  const proposal = createGenericBalanceReviewProposal({ report });
  assert.equal(proposal.status, 'ready_for_review');
  assert.equal(proposal.edits.length, 3);
  assert.equal(proposal.productionWriteAllowed, false);
});

test('generic review proposal blocks missing explicit edits', () => {
  const report = passingReport();
  report.best.edits = [];
  const proposal = createGenericBalanceReviewProposal({ report });
  assert.equal(proposal.status, 'blocked');
  assert.ok(proposal.gate.failures.includes('numericEdits'));
  assert.deepEqual(proposal.edits, []);
});

test('generic review proposal blocks purchase-only evidence after Holy enters the player model', () => {
  const report = passingReport();
  report.hardChecks.holyPolicyBestResponse = false;
  report.holyPolicyAnalysis.stableWithinSeedPortfolio = false;
  const proposal = createGenericBalanceReviewProposal({ report });
  assert.equal(proposal.status, 'blocked');
  assert.ok(proposal.gate.failures.includes('holyPolicyBestResponse'));
});

test('generic review proposal blocks incomplete Holy seed coverage even when the seeded policy is locally stable', () => {
  const report = passingReport();
  report.holyPolicyAnalysis.coverageComplete = false;
  report.holyPolicyAnalysis.optimizedPolicies = 1;
  report.holyPolicyAnalysis.attemptedPolicies = 4;
  report.holyPolicyAnalysis.uncoveredPolicies = ['after-core-6', 'after-core-7', 'before-final'];
  const proposal = createGenericBalanceReviewProposal({ report });
  assert.equal(proposal.status, 'blocked');
  assert.ok(proposal.gate.failures.includes('holyPolicyBestResponse'));
  assert.deepEqual(proposal.edits, []);
});
