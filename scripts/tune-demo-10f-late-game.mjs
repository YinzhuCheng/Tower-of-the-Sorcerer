import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import {
  DEMO10_SIMPLE_BUILD_PORTFOLIO,
  demoTenFloorQualityLoss,
  summarizeDemoTenFloorPortfolio
} from '../src/game/demo-10-floor-quality.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
const { runGreedyShopStrategy } = await import('../src/solver/greedy-strategy.js');

// Quality track: keep the narrow historical pressure scan for comparison.
const palaceMagicCandidates = [220, 240, 260, 280];
const blackSealMagicCandidates = [220, 230, 240, 250, 260, 270, 280];

// Playable-first track: F9 is the observed cliff for the two HP-first cycles.
// Search only the two highest-leverage F9 boss fields so the algorithm can
// rescue broad playability without flattening every earlier floor.
const playableBlackSealMagicCandidates = [80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 270];
const playableBlackSealDefCandidates = [80, 85, 90, 95, 100];

function runPortfolio() {
  return DEMO10_SIMPLE_BUILD_PORTFOLIO.map((shopCycle) => runGreedyShopStrategy({
    shopCycle,
    holyPolicy: 'immediate',
    maxIterations: 8_000
  }));
}

function evaluate(palaceMagicPower, blackSealMagicPower, blackSealDef = ENEMIES.blackSealKeeper.def) {
  ENEMIES.palaceWarden.magicPower = palaceMagicPower;
  ENEMIES.blackSealKeeper.magicPower = blackSealMagicPower;
  ENEMIES.blackSealKeeper.def = blackSealDef;

  const reports = runPortfolio();
  const summary = summarizeDemoTenFloorPortfolio(reports);
  return {
    palaceMagicPower,
    blackSealMagicPower,
    blackSealDef,
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

function playableFirstLoss(candidate, baseline) {
  const missingBuilds = DEMO10_SIMPLE_BUILD_PORTFOLIO.length - candidate.solvableBuilds;
  const weakest = Number.isFinite(candidate.weakestMargin) ? candidate.weakestMargin : -1;
  const desiredWeakest = 0.08;
  const editDistance = Math.abs(candidate.blackSealMagicPower - baseline.magicPower) / Math.max(1, baseline.magicPower)
    + Math.abs(candidate.blackSealDef - baseline.def) / Math.max(1, baseline.def);
  return missingBuilds * 10_000
    + Math.abs(weakest - desiredWeakest) * 100
    + editDistance * 4;
}

const originalPalaceMagic = ENEMIES.palaceWarden.magicPower;
const originalBlackSealMagic = ENEMIES.blackSealKeeper.magicPower;
const originalBlackSealDef = ENEMIES.blackSealKeeper.def;
const baselineBlackSeal = { magicPower: originalBlackSealMagic, def: originalBlackSealDef };
const qualityCandidates = [];
const playableCandidates = [];
try {
  for (const palaceMagicPower of palaceMagicCandidates) {
    for (const blackSealMagicPower of blackSealMagicCandidates) {
      qualityCandidates.push(evaluate(palaceMagicPower, blackSealMagicPower, originalBlackSealDef));
    }
  }

  for (const blackSealMagicPower of playableBlackSealMagicCandidates) {
    for (const blackSealDef of playableBlackSealDefCandidates) {
      const candidate = evaluate(originalPalaceMagic, blackSealMagicPower, blackSealDef);
      candidate.playableFirstLoss = playableFirstLoss(candidate, baselineBlackSeal);
      playableCandidates.push(candidate);
    }
  }
} finally {
  ENEMIES.palaceWarden.magicPower = originalPalaceMagic;
  ENEMIES.blackSealKeeper.magicPower = originalBlackSealMagic;
  ENEMIES.blackSealKeeper.def = originalBlackSealDef;
}

qualityCandidates.sort((a, b) => a.score - b.score
  || Number(b.valid) - Number(a.valid)
  || a.palaceMagicPower - b.palaceMagicPower
  || a.blackSealMagicPower - b.blackSealMagicPower);

playableCandidates.sort((a, b) => b.solvableBuilds - a.solvableBuilds
  || a.playableFirstLoss - b.playableFirstLoss
  || a.blackSealDef - b.blackSealDef
  || a.blackSealMagicPower - b.blackSealMagicPower);

const qualityBest = qualityCandidates[0];
const playableBest = playableCandidates[0];
const compact = (candidate) => ({
  palaceMagicPower: candidate.palaceMagicPower,
  blackSealMagicPower: candidate.blackSealMagicPower,
  blackSealDef: candidate.blackSealDef,
  valid: candidate.valid,
  score: candidate.score,
  playableFirstLoss: candidate.playableFirstLoss,
  solvableBuilds: candidate.solvableBuilds,
  bestMargin: candidate.bestMargin,
  weakestMargin: candidate.weakestMargin,
  terminalHpSpread: candidate.terminalHpSpread,
  f8BossMeanMargin: candidate.f8BossMeanMargin,
  f9BossMeanMargin: candidate.f9BossMeanMargin,
  f10MeanMargin: candidate.f10MeanMargin,
  f9ShopCoverage: candidate.f9ShopCoverage,
  violations: candidate.violations,
  attempts: candidate.attempts
});

console.log('DEMO10_LATE_GAME_TUNER');
console.log(JSON.stringify({
  selectedCurrent: {
    palaceMagicPower: originalPalaceMagic,
    blackSealMagicPower: originalBlackSealMagic,
    blackSealDef: originalBlackSealDef
  },
  qualityRecommended: compact(qualityBest),
  playableFirstRecommended: compact(playableBest),
  playableFirstTarget: {
    priority: 'maximize-solvable-simple-builds',
    desiredSolvableBuilds: DEMO10_SIMPLE_BUILD_PORTFOLIO.length,
    desiredWeakestWinningMargin: 0.08,
    productionWriteAllowed: false
  },
  qualityTopCandidates: qualityCandidates.slice(0, 5).map(compact),
  playableTopCandidates: playableCandidates.slice(0, 10).map(compact)
}, null, 2));
