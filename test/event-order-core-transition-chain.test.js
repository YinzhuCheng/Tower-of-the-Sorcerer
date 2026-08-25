import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyThresholdCoreChain } from '../src/analyzer/event-order-core-transition-chain.js';

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
