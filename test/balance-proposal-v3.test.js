import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createGenericBalanceReviewProposal,
  evaluateGenericBalanceReviewGate
} from '../src/tuner/balance-proposal-v3.js';

function passingReport() {
  return {
    model: 'adaptive-numeric-ray-v0.1',
    candidateId: 'numeric-combo-test',
    leverKeys: ['shop:hp', 'enemy:a:def', 'enemy:b:magicPower'],
    acceptedHardConstraints: true,
    converged: true,
    hardChecks: { adaptedRouteSolvable: true },
    best: {
      margin: 0.16,
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

test('generic review proposal accepts proof-backed arbitrary numeric edits but still blocks production writes', () => {
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
