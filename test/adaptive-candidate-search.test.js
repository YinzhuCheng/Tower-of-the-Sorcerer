import test from 'node:test';
import assert from 'node:assert/strict';
import { adaptiveEditDistance, rankAdaptiveCandidates, scoreAdaptiveCandidate } from '../src/tuner/adaptive-candidate-search.js';

function candidate({ hpReward, magicPower, hard = true, margin = 0.165, highRegret = 0.2, converged = true }) {
  return {
    hpReward,
    magicPower,
    acceptedHardConstraints: hard,
    converged,
    route: { minNormalizedHpMargin: margin },
    counterfactuals: { highRegretRate: highRegret }
  };
}

test('adaptive candidate ranking rejects hard failures before soft score', () => {
  const failed = candidate({ hpReward: 900, magicPower: 164, hard: false });
  const accepted = candidate({ hpReward: 90, magicPower: 260, hard: true });
  assert.equal(scoreAdaptiveCandidate(failed), Infinity);
  const ranked = rankAdaptiveCandidates([failed, accepted]);
  assert.equal(ranked[0].report, accepted);
  assert.equal(ranked[1].report, failed);
});

test('adaptive soft score prefers target pressure/regret and smaller edits', () => {
  const compact = candidate({ hpReward: 180, magicPower: 300, margin: 0.165, highRegret: 0.20 });
  const largeEdit = candidate({ hpReward: 90, magicPower: 500, margin: 0.165, highRegret: 0.20 });
  assert.ok(adaptiveEditDistance(compact) < adaptiveEditDistance(largeEdit));
  assert.ok(scoreAdaptiveCandidate(compact) < scoreAdaptiveCandidate(largeEdit));

  const offTarget = candidate({ hpReward: 180, magicPower: 300, margin: 0.50, highRegret: 0.20 });
  assert.ok(scoreAdaptiveCandidate(offTarget) > scoreAdaptiveCandidate(compact));
});
