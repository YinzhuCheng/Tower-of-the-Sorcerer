import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyThresholdCoreChain,
  summarizeSuffixSearchTelemetry
} from '../src/analyzer/event-order-core-transition-chain.js';

test('a replayable suffix exploit dominates staged incompleteness', () => {
  assert.equal(classifyThresholdCoreChain({
    transitionReport: { exactNoTransition: false },
    suffixExploit: true
  }), 'exploit-found');
});

test('exact absence of every threshold-relevant next-core bridge closes the chain', () => {
  assert.equal(classifyThresholdCoreChain({
    transitionReport: { exactNoTransition: true },
    suffixExploit: false
  }), 'no-exploit-via-core-transition-exact');
});

test('exact failure from one suffix bridge must remain coverage-incomplete globally', () => {
  // The classifier deliberately receives no suffix-exact shortcut: another c7
  // bridge can still exploit even if one bridge is exhausted exactly.
  assert.equal(classifyThresholdCoreChain({
    transitionReport: { exactNoTransition: false },
    suffixExploit: false
  }), 'coverage-incomplete');
});

test('suffix telemetry exposes travel pressure and late-floor coverage without changing proof semantics', () => {
  const telemetry = summarizeSuffixSearchTelemetry({
    expandedStates: 8_000,
    generatedStates: 34_986,
    prunedBound: 2_097,
    profile: {
      queuePeak: 7_585,
      expandedByStage: {
        'f7/c7/objective>4578': 294,
        'f8/c7/objective>4578': 298,
        'f1/c7/objective>4578': 1_607,
        'f2/c7/objective>4578': 2_338,
        'f3/c7/objective>4578': 1_316,
        'f4/c7/objective>4578': 1_131,
        'f5/c7/objective>4578': 628,
        'f6/c7/objective>4578': 388
      },
      generatedByAction: {
        shop: 8,
        door: 5_800,
        gate: 143,
        enemy: 4_455,
        U: 7_623,
        teleport: 16_665,
        boss: 292
      }
    }
  }, { lateFloorFrom: 7 });

  assert.equal(telemetry.travelGenerated, 24_288);
  assert.equal(telemetry.lateFloorExpanded, 592);
  assert.equal(telemetry.earlierFloorExpanded, 7_408);
  assert.equal(telemetry.queuePeak, 7_585);
  assert.equal(telemetry.prunedBound, 2_097);
  assert.ok(Math.abs(telemetry.travelGeneratedRatio - 0.6942205453610015) < 1e-12);
  assert.equal(telemetry.lateFloorExpandedRatio, 0.074);
});
