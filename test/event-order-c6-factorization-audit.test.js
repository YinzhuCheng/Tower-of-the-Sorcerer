import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalizeInactivePuzzleMeta } from '../src/analyzer/event-order-c6-factorization-audit.js';

test('c6 factorization erases switch/sequence history only after every gate is gone', () => {
  const compact = {
    floorMeta: [
      { switches: ['emberB', 'emberA'], sequenceProgress: 2, bossDefeated: true },
      { switches: ['liveB', 'liveA'], sequenceProgress: 1, bossDefeated: false }
    ]
  };
  const materialized = {
    floorStates: [
      { map: [['.', '.', '#'], ['rune:A', '.', '.']] },
      { map: [['.', 'gate:mirror', '.']] }
    ]
  };

  assert.deepEqual(canonicalizeInactivePuzzleMeta(compact, materialized), [
    { switches: [], sequenceProgress: 0, bossDefeated: true },
    { switches: ['liveA', 'liveB'], sequenceProgress: 1, bossDefeated: false }
  ]);
});

test('c6 factorization treats a floor without a map as gate-free conservatively for dead history', () => {
  const compact = {
    floorMeta: [{ switches: ['x'], sequenceProgress: 3, bossDefeated: false }]
  };
  const materialized = { floorStates: [{}] };
  assert.deepEqual(canonicalizeInactivePuzzleMeta(compact, materialized), [
    { switches: [], sequenceProgress: 0, bossDefeated: false }
  ]);
});
