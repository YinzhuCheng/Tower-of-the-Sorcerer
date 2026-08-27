import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyMultiBridgeChainEvidence,
  schedulePrefixRoundRobinBridges
} from '../src/analyzer/event-order-core-transition-multibridge.js';
import { ParetoFrontier } from '../src/solver/frontier.js';

test('multi-bridge exact no-exploit requires complete prefix, bridge and suffix obligations', () => {
  const result = classifyMultiBridgeChainEvidence({
    fromBoundaryCoverageExact: true,
    verifiedPrefixCount: 2,
    scheduledPrefixCount: 2,
    prefixAttempts: [
      { bridgeFrontier: { coverageExact: true } },
      { bridgeFrontier: { coverageExact: true } }
    ],
    activeBridgeCount: 3,
    scheduledBridgeCount: 3,
    suffixAttempts: [
      { exactNoExploit: true },
      { exactNoExploit: true },
      { exactNoExploit: true }
    ]
  });
  assert.equal(result.status, 'no-exploit-multibridge-exact');
  assert.equal(result.exactNoExploit, true);
});

test('unscheduled relevant prefix keeps multi-bridge proof coverage incomplete', () => {
  const result = classifyMultiBridgeChainEvidence({
    fromBoundaryCoverageExact: true,
    verifiedPrefixCount: 3,
    scheduledPrefixCount: 2,
    prefixAttempts: [
      { bridgeFrontier: { coverageExact: true } },
      { bridgeFrontier: { coverageExact: true } }
    ],
    activeBridgeCount: 2,
    scheduledBridgeCount: 2,
    suffixAttempts: [
      { exactNoExploit: true },
      { exactNoExploit: true }
    ]
  });
  assert.equal(result.status, 'coverage-incomplete');
  assert.equal(result.exactNoExploit, false);
  assert.equal(result.prefixCoverageExact, false);
});

test('one bounded suffix keeps multi-bridge proof coverage incomplete', () => {
  const result = classifyMultiBridgeChainEvidence({
    fromBoundaryCoverageExact: true,
    verifiedPrefixCount: 1,
    scheduledPrefixCount: 1,
    prefixAttempts: [{ bridgeFrontier: { coverageExact: true } }],
    activeBridgeCount: 2,
    scheduledBridgeCount: 2,
    suffixAttempts: [
      { exactNoExploit: true },
      { exactNoExploit: false }
    ]
  });
  assert.equal(result.status, 'coverage-incomplete');
  assert.equal(result.allSuffixesExactNoExploit, false);
});

test('a replayed exploit dominates any incomplete proof obligations', () => {
  const result = classifyMultiBridgeChainEvidence({
    exploitFound: true,
    fromBoundaryCoverageExact: false,
    verifiedPrefixCount: 64,
    scheduledPrefixCount: 1,
    prefixAttempts: [],
    activeBridgeCount: 100,
    scheduledBridgeCount: 1,
    suffixAttempts: []
  });
  assert.equal(result.status, 'exploit-found');
  assert.equal(result.exactNoExploit, false);
});

test('prefix round-robin schedules one bridge per family before a second from any family', () => {
  const bridges = [
    { id: 'a1', prefixCertificateHash: 'A', upperBound: 5000, resources: { hp: 100, gold: 50 } },
    { id: 'a2', prefixCertificateHash: 'A', upperBound: 4990, resources: { hp: 100, gold: 40 } },
    { id: 'b1', prefixCertificateHash: 'B', upperBound: 4980, resources: { hp: 100, gold: 30 } },
    { id: 'b2', prefixCertificateHash: 'B', upperBound: 4970, resources: { hp: 100, gold: 20 } },
    { id: 'c1', prefixCertificateHash: 'C', upperBound: 4960, resources: { hp: 100, gold: 10 } },
    { id: 'c2', prefixCertificateHash: 'C', upperBound: 4950, resources: { hp: 100, gold: 0 } }
  ];
  const scheduled = schedulePrefixRoundRobinBridges(bridges, { maxBridges: 4 });
  assert.deepEqual(scheduled.map((bridge) => bridge.id), ['a1', 'b1', 'c1', 'a2']);
  assert.equal(new Set(scheduled.slice(0, 3).map((bridge) => bridge.prefixCertificateHash)).size, 3);
});

test('Pareto rejection marks retained provenance labels inactive', () => {
  const frontier = new ParetoFrontier({ fields: ['hp', 'atk'] });
  const strong = { active: true, resources: { hp: 100, atk: 10 } };
  const weak = { active: true, resources: { hp: 90, atk: 9 } };
  assert.equal(frontier.insert(strong).accepted, true);
  const rejected = frontier.insert(weak);
  assert.equal(rejected.accepted, false);
  assert.equal(weak.active, false);
  assert.deepEqual(frontier.activeLabels(), [strong]);
});
