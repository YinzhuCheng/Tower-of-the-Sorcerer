import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyTightFilteredMultiBridgeEvidence,
  summarizeTightFilteredBridges
} from '../src/analyzer/event-order-core-transition-tight-filter.js';

test('tight-filtered exact closure accepts bound-closed bridges plus exact residual suffixes', () => {
  const result = classifyTightFilteredMultiBridgeEvidence({
    fromBoundaryCoverageExact: true,
    verifiedPrefixCount: 1,
    scheduledPrefixCount: 1,
    prefixAttempts: [{ bridgeFrontier: { coverageExact: true } }],
    activeBridgeCount: 3,
    boundClosedBridgeCount: 1,
    residualBridgeCount: 2,
    scheduledResidualBridgeCount: 2,
    suffixAttempts: [
      { exactNoExploit: true },
      { exactNoExploit: true }
    ]
  });
  assert.equal(result.status, 'no-exploit-tight-filtered-multibridge-exact');
  assert.equal(result.exactNoExploit, true);
  assert.equal(result.allActiveBridgesResolved, true);
});

test('tight-filtered exact closure can resolve an all-bound-closed bridge frontier without suffix work', () => {
  const result = classifyTightFilteredMultiBridgeEvidence({
    fromBoundaryCoverageExact: true,
    verifiedPrefixCount: 1,
    scheduledPrefixCount: 1,
    prefixAttempts: [{ bridgeFrontier: { coverageExact: true } }],
    activeBridgeCount: 2,
    boundClosedBridgeCount: 2,
    residualBridgeCount: 0,
    scheduledResidualBridgeCount: 0,
    suffixAttempts: []
  });
  assert.equal(result.exactNoExploit, true);
  assert.equal(result.allResidualSuffixesExactNoExploit, true);
});

test('unscheduled residual bridge keeps the proof incomplete even when other bridges are bound-closed', () => {
  const result = classifyTightFilteredMultiBridgeEvidence({
    fromBoundaryCoverageExact: true,
    verifiedPrefixCount: 1,
    scheduledPrefixCount: 1,
    prefixAttempts: [{ bridgeFrontier: { coverageExact: true } }],
    activeBridgeCount: 3,
    boundClosedBridgeCount: 1,
    residualBridgeCount: 2,
    scheduledResidualBridgeCount: 1,
    suffixAttempts: [{ exactNoExploit: true }]
  });
  assert.equal(result.status, 'coverage-incomplete');
  assert.equal(result.exactNoExploit, false);
  assert.equal(result.attemptedAllResidualBridges, false);
});

test('incomplete c6 or c7 frontier coverage cannot be repaired by bridge-level bounds', () => {
  const result = classifyTightFilteredMultiBridgeEvidence({
    fromBoundaryCoverageExact: false,
    verifiedPrefixCount: 1,
    scheduledPrefixCount: 1,
    prefixAttempts: [{ bridgeFrontier: { coverageExact: false } }],
    activeBridgeCount: 2,
    boundClosedBridgeCount: 2,
    residualBridgeCount: 0,
    scheduledResidualBridgeCount: 0,
    suffixAttempts: []
  });
  assert.equal(result.exactNoExploit, false);
  assert.equal(result.prefixCoverageExact, false);
});

test('replayed exploit dominates tight-filtered proof bookkeeping', () => {
  const result = classifyTightFilteredMultiBridgeEvidence({
    exploitFound: true,
    fromBoundaryCoverageExact: true,
    verifiedPrefixCount: 1,
    scheduledPrefixCount: 1,
    prefixAttempts: [{ bridgeFrontier: { coverageExact: true } }],
    activeBridgeCount: 2,
    boundClosedBridgeCount: 1,
    residualBridgeCount: 1,
    scheduledResidualBridgeCount: 1,
    suffixAttempts: [{ exactNoExploit: false }]
  });
  assert.equal(result.status, 'exploit-found');
  assert.equal(result.exactNoExploit, false);
});

test('tight-filter summary reports closure rates by purchase progress', () => {
  const bridges = [
    { shopPurchases: 21, oldUpperBound: 4930, tightUpperBound: 4400, boundProof: { provesNoExploit: true, tightening: 530 } },
    { shopPurchases: 21, oldUpperBound: 4930, tightUpperBound: 4600, boundProof: { provesNoExploit: false, tightening: 330 } },
    { shopPurchases: 20, oldUpperBound: 4930, tightUpperBound: 4459, boundProof: { provesNoExploit: true, tightening: 471 } }
  ];
  const summary = summarizeTightFilteredBridges(bridges, 4459);
  assert.equal(summary.total, 3);
  assert.equal(summary.boundClosed, 2);
  assert.equal(summary.residual, 1);
  assert.equal(summary.byPurchase['21'].boundClosed, 1);
  assert.equal(summary.byPurchase['20'].boundClosed, 1);
});
