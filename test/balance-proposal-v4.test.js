import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createEventOrderAwareBalanceReviewProposal,
  evaluateEventOrderAwareBalanceReviewGate
} from '../src/tuner/balance-proposal-v4.js';
import { EVENT_ORDER_EVIDENCE } from '../src/tuner/event-order-evidence.js';

function passingV3Report() {
  return {
    model: 'adaptive-numeric-ray-v0.3-complete-holy-coverage',
    candidateId: 'distributed-pressure-v1',
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
      optimizedPolicies: 1,
      provenInfeasiblePolicies: 3,
      attemptedPolicies: 4,
      uncoveredPolicies: []
    },
    best: {
      margin: 0.116,
      edits: [
        { target: 'enemy', id: 'whaleSinger', field: 'magicPower', value: 56 },
        { target: 'shop', id: 'hp', field: 'effect.hp', value: 320 },
        { target: 'shop', id: 'hp', field: 'effect.maxHp', value: 320 },
        { target: 'enemy', id: 'flameCaster', field: 'def', value: 63 }
      ]
    },
    solver: { solvable: true, exact: true },
    counterfactuals: {
      improvedMutationCount: 0,
      recoveryRate: 0.9333333333,
      catastrophicRate: 0.0666666667
    }
  };
}

test('known replay-verified event-order exploit blocks a V3-passing candidate', () => {
  const report = passingV3Report();
  const evidence = EVENT_ORDER_EVIDENCE.distributedPressureV1;
  const gate = evaluateEventOrderAwareBalanceReviewGate(report, { eventOrderEvidence: evidence });
  assert.equal(gate.passed, false);
  assert.equal(gate.checks.eventOrderBestResponse, false);
  assert.ok(gate.failures.includes('eventOrderBestResponse'));

  const proposal = createEventOrderAwareBalanceReviewProposal({ report, eventOrderEvidence: evidence });
  assert.equal(proposal.status, 'blocked');
  assert.deepEqual(proposal.edits, []);
  assert.equal(proposal.productionWriteAllowed, false);
});

test('bounded no-exploit discovery is not sufficient to pass event-order gate', () => {
  const report = passingV3Report();
  const gate = evaluateEventOrderAwareBalanceReviewGate(report, {
    eventOrderEvidence: {
      status: 'coverage-incomplete',
      exploitFound: false,
      exactNoExploit: false
    }
  });
  assert.equal(gate.passed, false);
  assert.ok(gate.failures.includes('eventOrderBestResponse'));
});

test('exact no-exploit evidence can satisfy the new event-order axis', () => {
  const report = passingV3Report();
  const gate = evaluateEventOrderAwareBalanceReviewGate(report, {
    eventOrderEvidence: {
      status: 'exact-no-exploit',
      exploitFound: false,
      exactNoExploit: true
    }
  });
  assert.equal(gate.passed, true);
  assert.equal(gate.checks.eventOrderBestResponse, true);
});
