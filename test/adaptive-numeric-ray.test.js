import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyAdaptiveRaySample, nextAdaptiveRayStep } from '../src/tuner/adaptive-numeric-ray.js';

test('adaptive ray classifies easy and hard samples', () => {
  assert.equal(classifyAdaptiveRaySample({ solvable: true, margin: 0.30 }, 0.165), 'too_easy');
  assert.equal(classifyAdaptiveRaySample({ solvable: true, margin: 0.10 }, 0.165), 'too_hard');
  assert.equal(classifyAdaptiveRaySample({ solvable: false, margin: null }, 0.165), 'too_hard_or_failed');
});

test('adaptive ray midpoint stays inside an ordered bracket', () => {
  assert.ok(Math.abs(nextAdaptiveRayStep(0.4, 0.8) - 0.6) < 1e-12);
  assert.throws(() => nextAdaptiveRayStep(0.8, 0.4));
});
