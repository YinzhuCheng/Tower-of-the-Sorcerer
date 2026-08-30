import { ENEMIES } from '../game/data.js';
import { createInitialState } from '../game/engine.js';
import { getWarCouncilBalanceReport, WAR_COUNCIL_TUNING } from '../game/war-council.js';

export const WAR_COUNCIL_RELEASE_WINDOW = Object.freeze({
  minWinningPlans: 12,
  maxWinningPlans: 36,
  minWinRate: 0.05,
  maxWinRate: 0.16
});

// A synthetic state is enough because availability depends on the named
// liberated guardians, not exploration resources.  Keeping it small means a
// mutation scout can evaluate this tactical puzzle without re-running F1–F20.
export function createWarCouncilBalanceState() {
  const state = createInitialState();
  for (const enemyId of ['catBoss', 'whaleBoss', 'dragonBoss', 'shadowBoss']) {
    const floor = (ENEMIES[enemyId]?.floor ?? 1) - 1;
    state.floorStates[floor].defeatedBossIds.push(enemyId);
  }
  return state;
}

export function evaluateWarCouncilBalance({ state = createWarCouncilBalanceState(), window = WAR_COUNCIL_RELEASE_WINDOW } = {}) {
  const report = getWarCouncilBalanceReport(state);
  const tooHard = report.winningPlans < window.minWinningPlans || report.winRate < window.minWinRate;
  const tooEasy = report.winningPlans > window.maxWinningPlans || report.winRate > window.maxWinRate;
  return Object.freeze({
    ...report,
    tuning: { loyalistScale: WAR_COUNCIL_TUNING.loyalistScale },
    status: tooHard ? 'too-hard' : tooEasy ? 'too-easy' : 'release-ready',
    publishable: !tooHard && !tooEasy,
    window
  });
}
