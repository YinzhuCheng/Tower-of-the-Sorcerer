import test from 'node:test';
import assert from 'node:assert/strict';
import { adaptFinalPressureCandidate } from '../src/tuner/adaptive-final-pressure.js';

// Full adaptive fixed-point exploration intentionally lives in
// .github/workflows/adaptive-balance-profile.yml. Ordinary `node --test` should
// guard API/safety boundaries without re-running a 40s+ optimization job.
test('adaptive final-pressure tuner rejects invalid HP reward before exploration', () => {
  assert.throws(
    () => adaptFinalPressureCandidate({ hpReward: 0 }),
    /positive hpReward/
  );
  assert.throws(
    () => adaptFinalPressureCandidate({ hpReward: Number.NaN }),
    /positive hpReward/
  );
});
