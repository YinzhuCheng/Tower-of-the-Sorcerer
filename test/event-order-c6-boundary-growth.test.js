import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeGoalCaps } from '../src/analyzer/event-order-c6-boundary-growth.js';

test('c6 boundary growth normalizes positive unique ascending caps', () => {
  assert.deepEqual(normalizeGoalCaps([256, 64, 128, 128, -1, 0]), [64, 128, 256]);
});

test('c6 boundary growth rejects an empty valid cap set', () => {
  assert.throws(() => normalizeGoalCaps([0, -1, 1.5]), /positive c6 goal cap/);
});
