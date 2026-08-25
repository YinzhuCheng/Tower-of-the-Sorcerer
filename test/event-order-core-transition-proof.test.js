import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyThresholdCoreTransitionEvidence } from '../src/analyzer/event-order-core-transition-proof.js';

test('a replay-verified transition witness is sufficient existence evidence', () => {
  const result = classifyThresholdCoreTransitionEvidence({
    transitionFound: true,
    boundaryCoverageExact: false,
    verifiedRelevantSeedCount: 100,
    scheduledSeedCount: 1,
    attempts: [{ exactNoTransition: false }]
  });
  assert.equal(result.status, 'threshold-relevant-transition-found');
  assert.equal(result.exactNoTransition, false);
});

test('bounded scheduling miss cannot become exact no-transition', () => {
  const result = classifyThresholdCoreTransitionEvidence({
    transitionFound: false,
    boundaryCoverageExact: true,
    verifiedRelevantSeedCount: 8,
    scheduledSeedCount: 4,
    attempts: Array.from({ length: 4 }, () => ({ exactNoTransition: true }))
  });
  assert.equal(result.status, 'coverage-incomplete');
  assert.equal(result.attemptedAllVerified, false);
  assert.equal(result.exactNoTransition, false);
});

test('incomplete from-core boundary cannot prove no transition even when scheduled attempts are exact', () => {
  const result = classifyThresholdCoreTransitionEvidence({
    transitionFound: false,
    boundaryCoverageExact: false,
    verifiedRelevantSeedCount: 2,
    scheduledSeedCount: 2,
    attempts: [
      { exactNoTransition: true },
      { exactNoTransition: true }
    ]
  });
  assert.equal(result.status, 'coverage-incomplete');
  assert.equal(result.attemptedAllVerified, true);
  assert.equal(result.exactNoTransition, false);
});

test('all relevant seeds plus complete boundary plus exact failures closes the transition exactly', () => {
  const result = classifyThresholdCoreTransitionEvidence({
    transitionFound: false,
    boundaryCoverageExact: true,
    verifiedRelevantSeedCount: 3,
    scheduledSeedCount: 3,
    attempts: [
      { exactNoTransition: true },
      { exactNoTransition: true },
      { exactNoTransition: true }
    ]
  });
  assert.equal(result.status, 'no-threshold-relevant-transition-exact');
  assert.equal(result.attemptedAllVerified, true);
  assert.equal(result.allAttemptsExactNoTransition, true);
  assert.equal(result.exactNoTransition, true);
});

test('one bounded continuation keeps the global transition result unknown', () => {
  const result = classifyThresholdCoreTransitionEvidence({
    transitionFound: false,
    boundaryCoverageExact: true,
    verifiedRelevantSeedCount: 3,
    scheduledSeedCount: 3,
    attempts: [
      { exactNoTransition: true },
      { exactNoTransition: false },
      { exactNoTransition: true }
    ]
  });
  assert.equal(result.status, 'coverage-incomplete');
  assert.equal(result.exactNoTransition, false);
});
