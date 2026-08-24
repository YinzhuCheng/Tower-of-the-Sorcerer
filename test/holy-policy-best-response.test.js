import test from 'node:test';
import assert from 'node:assert/strict';
import {
  rankHolyPolicyResponses,
  summarizeHolyPolicyResponses
} from '../src/analyzer/holy-policy-best-response.js';

function response(holyPolicy, hp, { localOptimal = true, status = 'optimized' } = {}) {
  return {
    holyPolicy,
    status,
    seedCount: 3,
    feasibleSeedCount: status === 'optimized' ? 2 : 0,
    localOptimal: status === 'optimized' ? localOptimal : null,
    bestTerminalHp: status === 'optimized' ? hp : null
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
  assert.deepEqual(summary.uncoveredPolicies, ['before-final']);
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
