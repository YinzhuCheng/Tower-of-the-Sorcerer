import test from 'node:test';
import assert from 'node:assert/strict';
import {
  optimizePurchasePlanAcrossHolyPolicies,
  rankHolyPolicyResponses,
  summarizeHolyPolicyResponses
} from '../src/analyzer/holy-policy-best-response.js';

function response(holyPolicy, hp, {
  localOptimal = true,
  status = 'optimized',
  proof = null
} = {}) {
  return {
    holyPolicy,
    status,
    seedCount: status === 'optimized' ? 3 : 0,
    feasibleSeedCount: status === 'optimized' ? 2 : 0,
    localOptimal: status === 'optimized' ? localOptimal : null,
    bestTerminalHp: status === 'optimized' ? hp : null,
    infeasibilityProof: proof
  };
}

test('Holy best-response ranking selects highest locally optimized terminal HP', () => {
  const responses = [
    response('after-core-7', 8_000),
    response('immediate', 9_500),
    response('after-core-6', 9_000),
    response('before-final', null, { status: 'uncovered' })
  ];
  const ranked = rankHolyPolicyResponses(responses);
  assert.equal(ranked[0].holyPolicy, 'immediate');

  const summary = summarizeHolyPolicyResponses(responses);
  assert.equal(summary.best.holyPolicy, 'immediate');
  assert.equal(summary.optimizedPolicies, 3);
  assert.equal(summary.provenInfeasiblePolicies, 0);
  assert.deepEqual(summary.uncoveredPolicies, ['before-final']);
  assert.equal(summary.coverageComplete, false);
  assert.equal(summary.stableWithinSeedPortfolio, true);
  assert.equal(summary.alternatives.find((entry) => entry.holyPolicy === 'after-core-6').normalizedRegret > 0, true);
});

test('Holy response is not stable when a seeded policy has not reached local 1-opt', () => {
  const summary = summarizeHolyPolicyResponses([
    response('immediate', 9_500),
    response('after-core-6', 9_600, { localOptimal: false })
  ]);
  assert.equal(summary.best.holyPolicy, 'after-core-6');
  assert.equal(summary.allOptimizedLocalOptimal, false);
  assert.equal(summary.stableWithinSeedPortfolio, false);
});

test('proven infeasible policies complete coverage without pretending to be optimized', () => {
  const cut = { type: 'STATIC_CUT', certificateHash: 'cut-1' };
  const summary = summarizeHolyPolicyResponses([
    response('immediate', 9_500),
    response('after-core-6', null, { status: 'infeasible-proven', proof: cut }),
    response('after-core-7', null, { status: 'infeasible-proven', proof: cut }),
    response('before-final', null, { status: 'infeasible-proven', proof: cut })
  ]);
  assert.equal(summary.best.holyPolicy, 'immediate');
  assert.equal(summary.optimizedPolicies, 1);
  assert.equal(summary.provenInfeasiblePolicies, 3);
  assert.deepEqual(summary.provenInfeasiblePolicyIds, ['after-core-6', 'after-core-7', 'before-final']);
  assert.equal(summary.coveredPolicies, 4);
  assert.equal(summary.policyCoverageRatio, 1);
  assert.equal(summary.seedCoverageRatio, 0.25);
  assert.deepEqual(summary.uncoveredPolicies, []);
  assert.equal(summary.coverageComplete, true);
  assert.equal(summary.allOptimizedLocalOptimal, true);
  assert.equal(summary.stableWithCompleteCoverage, true);
  assert.equal(summary.alternatives.find((entry) => entry.holyPolicy === 'after-core-6').bestTerminalHp, null);
});

test('canonical delayed policy is classified from the STATIC_CUT before rescue search', () => {
  const result = optimizePurchasePlanAcrossHolyPolicies({
    holyPolicies: ['after-core-6'],
    rescueEnabled: true,
    maxPasses: 1
  });
  assert.equal(result.responses.length, 1);
  assert.equal(result.responses[0].status, 'infeasible-proven');
  assert.equal(result.responses[0].seedCount, 0);
  assert.equal(result.responses[0].rescue, null);
  assert.equal(result.responses[0].infeasibilityProof.type, 'STATIC_CUT');
  assert.equal(result.coverageComplete, true);
  assert.equal(result.provenInfeasiblePolicies, 1);
  assert.deepEqual(result.uncoveredPolicies, []);
  assert.equal(result.best, null);
});
