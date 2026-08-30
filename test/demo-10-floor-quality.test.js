import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEMO10_EXPERT_TARGETS,
  summarizeDemoTenFloorPortfolio
} from '../src/game/demo-10-floor-quality.js';

function battle(floor, normalizedHpMargin) {
  return {
    floor,
    enemyId: `boss-${floor}`,
    boss: true,
    finalBoss: floor === 10,
    normalizedHpMargin,
    battle: { totalDamage: 100 },
    goldGain: 0
  };
}

function report({ lateMargins = [0.20, 0.18, 0.25] } = {}) {
  return {
    solvable: true,
    final: { hp: 1000 },
    minNormalizedHpMargin: 0.007281553398058253,
    battleLog: [
      battle(3, 0.007281553398058253),
      battle(8, lateMargins[0]),
      battle(9, lateMargins[1]),
      battle(10, lateMargins[2])
    ],
    purchaseLog: [{ floor: 5, optionId: 'def' }]
  };
}

test('10F hard-quality margin gates ignore canonical F1-F7 historical brittleness', () => {
  const source = report();
  const summary = summarizeDemoTenFloorPortfolio([source], DEMO10_EXPERT_TARGETS);

  assert.equal(summary.winner.minNormalizedHpMargin, 0.007281553398058253);
  assert.equal(summary.weakestWinningReport.minNormalizedHpMargin, 0.007281553398058253);
  assert.equal(summary.winnerLateMinMargin, 0.18);
  assert.equal(summary.weakestWinningLateMargin, 0.18);
  assert.deepEqual(summary.violations, []);
});

test('10F hard-quality margin gates still reject a brittle late-floor battle', () => {
  const summary = summarizeDemoTenFloorPortfolio([
    report({ lateMargins: [0.20, 0.03, 0.25] })
  ], DEMO10_EXPERT_TARGETS);

  assert.equal(summary.winnerLateMinMargin, 0.03);
  assert.equal(summary.weakestWinningLateMargin, 0.03);
  assert(summary.violations.includes('best-build-too-brittle:0.03'));
  assert(summary.violations.includes('weakest-win-too-brittle:0.03'));
});
