import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import {
  DEMO10_SIMPLE_BUILD_PORTFOLIO,
  demoTenFloorQualityLoss,
  summarizeDemoTenFloorPortfolio
} from '../src/game/demo-10-floor-quality.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
const { runGreedyShopStrategy } = await import('../src/solver/greedy-strategy.js');

const palaceMagicCandidates = [220, 240, 260, 280];
const blackSealMagicCandidates = [220, 230, 240, 250, 260, 270, 280];

function evaluate(palaceMagicPower, blackSealMagicPower) {
  ENEMIES.palaceWarden.magicPower = palaceMagicPower;
  ENEMIES.blackSealKeeper.magicPower = blackSealMagicPower;

  const reports = DEMO10_SIMPLE_BUILD_PORTFOLIO.map((shopCycle) => runGreedyShopStrategy({
    shopCycle,
    holyPolicy: 'immediate',
    maxIterations: 8_000
  }));
  const summary = summarizeDemoTenFloorPortfolio(reports);
  return {
    palaceMagicPower,
    blackSealMagicPower,
    score: demoTenFloorQualityLoss(summary),
    valid: summary.violations.length === 0,
    solvableBuilds: summary.solvableBuilds,
    terminalHpSpread: summary.terminalHpSpread,
    bestMargin: summary.winner?.minNormalizedHpMargin ?? null,
    weakestMargin: summary.weakestWinningReport?.minNormalizedHpMargin ?? null,
    f8BossMeanMargin: summary.lateFloors[8].meanBossMinMargin,
    f9BossMeanMargin: summary.lateFloors[9].meanBossMinMargin,
    f10MeanMargin: summary.lateFloors[10].meanMinMargin,
    f9ShopCoverage: summary.f9ShopCoverage,
    violations: summary.violations,
    attempts: reports.map((report) => ({
      shopCycle: report.shopCycle.join('-'),
      solvable: report.solvable,
      floor: report.floor,
      hp: report.final.hp,
      margin: report.minNormalizedHpMargin,
      failure: report.failure
    }))
  };
}

const originalPalaceMagic = ENEMIES.palaceWarden.magicPower;
const originalBlackSealMagic = ENEMIES.blackSealKeeper.magicPower;
const candidates = [];
try {
  for (const palaceMagicPower of palaceMagicCandidates) {
    for (const blackSealMagicPower of blackSealMagicCandidates) {
      candidates.push(evaluate(palaceMagicPower, blackSealMagicPower));
    }
  }
} finally {
  ENEMIES.palaceWarden.magicPower = originalPalaceMagic;
  ENEMIES.blackSealKeeper.magicPower = originalBlackSealMagic;
}

candidates.sort((a, b) => a.score - b.score
  || Number(b.valid) - Number(a.valid)
  || a.palaceMagicPower - b.palaceMagicPower
  || a.blackSealMagicPower - b.blackSealMagicPower);

const best = candidates[0];
console.log('DEMO10_LATE_GAME_TUNER');
console.log(JSON.stringify({
  selectedCurrent: {
    palaceMagicPower: originalPalaceMagic,
    blackSealMagicPower: originalBlackSealMagic
  },
  recommended: best,
  topCandidates: candidates.slice(0, 10).map((candidate) => ({
    palaceMagicPower: candidate.palaceMagicPower,
    blackSealMagicPower: candidate.blackSealMagicPower,
    valid: candidate.valid,
    score: candidate.score,
    solvableBuilds: candidate.solvableBuilds,
    bestMargin: candidate.bestMargin,
    weakestMargin: candidate.weakestMargin,
    terminalHpSpread: candidate.terminalHpSpread,
    f8BossMeanMargin: candidate.f8BossMeanMargin,
    f9BossMeanMargin: candidate.f9BossMeanMargin,
    f10MeanMargin: candidate.f10MeanMargin,
    f9ShopCoverage: candidate.f9ShopCoverage,
    violations: candidate.violations
  }))
}, null, 2));
