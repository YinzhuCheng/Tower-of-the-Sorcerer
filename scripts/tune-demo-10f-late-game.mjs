import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorHardMode, DEMO10_HARD_MODE_PRESSURE } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import {
  DEMO10_EXPERT_TARGETS,
  DEMO10_QUALITY_TARGETS,
  DEMO10_SIMPLE_BUILD_PORTFOLIO,
  demoTenFloorExpertLoss,
  demoTenFloorQualityLoss,
  summarizeDemoTenFloorPortfolio
} from '../src/game/demo-10-floor-quality.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorHardMode({ enemies: ENEMIES });
const { runGreedyShopStrategy } = await import('../src/solver/greedy-strategy.js');
const { runExpertNoHpStrategy } = await import('../src/solver/expert-strategy.js');
const progressionPriority = 'guardian-first';

// First-pass boundary search: keep every hard-mode lever fixed except the F9
// magic pulse and move only toward a softer value. This finds the smallest
// legitimate correction before considering any coupled F10 compensation.
const palaceMagicCandidates = [DEMO10_HARD_MODE_PRESSURE.palaceWardenMagicPower];
const blackSealMagicCandidates = [190, 180, 170, 160, 150, 140, 130, 120, 110, 100, 90, 80];
const blackSealDefCandidates = [DEMO10_HARD_MODE_PRESSURE.blackSealKeeperDef];

function runSimplePortfolio() {
  return DEMO10_SIMPLE_BUILD_PORTFOLIO.map((shopCycle) => runGreedyShopStrategy({
    shopCycle,
    holyPolicy: 'immediate',
    progressionPriority,
    maxIterations: 8_000
  }));
}

function summarizeGuardianRescue(report) {
  const rescue = report.planning?.guardianRescue;
  if (!rescue) return null;
  return {
    attempted: Boolean(rescue.attempted),
    candidatesEvaluated: rescue.candidatesEvaluated ?? 0,
    selectedFlips: rescue.selectedFlips ?? [],
    baselineDeficit: rescue.baselinePressure?.totalDeficit ?? null,
    selectedDeficit: rescue.selectedPressure?.totalDeficit ?? null,
    selectedSignature: rescue.selectedPressure?.signature ?? null
  };
}

function evaluate(palaceMagicPower, blackSealMagicPower, blackSealDef) {
  ENEMIES.palaceWarden.magicPower = palaceMagicPower;
  ENEMIES.blackSealKeeper.magicPower = blackSealMagicPower;
  ENEMIES.blackSealKeeper.def = blackSealDef;

  const expertReport = runExpertNoHpStrategy({
    holyPolicy: 'immediate',
    progressionPriority,
    maxIterations: 8_000,
    horizon: 2,
    attackAdvantageRequired: 2_000
  });
  const expert = summarizeDemoTenFloorPortfolio([expertReport], DEMO10_EXPERT_TARGETS);
  const simpleReports = runSimplePortfolio();
  const boundary = summarizeDemoTenFloorPortfolio(simpleReports, DEMO10_QUALITY_TARGETS);
  const hpClean = expertReport.purchaseCounts.hp === 0
    && expertReport.purchaseLog.every((entry) => entry.optionId !== 'hp');
  const valid = expert.violations.length === 0 && boundary.violations.length === 0 && hpClean;
  const editDistance = Math.abs(blackSealMagicPower - DEMO10_HARD_MODE_PRESSURE.blackSealKeeperMagicPower)
      / DEMO10_HARD_MODE_PRESSURE.blackSealKeeperMagicPower
    + Math.abs(blackSealDef - DEMO10_HARD_MODE_PRESSURE.blackSealKeeperDef)
      / DEMO10_HARD_MODE_PRESSURE.blackSealKeeperDef;

  return {
    palaceMagicPower,
    blackSealMagicPower,
    blackSealDef,
    valid,
    hpClean,
    editDistance,
    score: demoTenFloorExpertLoss(expert, DEMO10_EXPERT_TARGETS)
      + demoTenFloorQualityLoss(boundary, DEMO10_QUALITY_TARGETS) / 20
      + editDistance * 2,
    expert: {
      solvable: expertReport.solvable,
      floor: expertReport.floor,
      hp: expertReport.final.hp,
      atk: expertReport.final.atk,
      def: expertReport.final.def,
      purchases: expertReport.purchases,
      purchaseCounts: expertReport.purchaseCounts,
      shopPlan: expertReport.planning?.shopPlan,
      guardianRescue: summarizeGuardianRescue(expertReport),
      margin: expertReport.minNormalizedHpMargin,
      f8BossMeanMargin: expert.lateFloors[8].meanBossMinMargin,
      f9BossMeanMargin: expert.lateFloors[9].meanBossMinMargin,
      f10BossMeanMargin: expert.lateFloors[10].meanBossMinMargin,
      violations: expert.violations,
      failure: expertReport.failure
    },
    boundary: {
      solvableBuilds: boundary.solvableBuilds,
      terminalHpSpread: boundary.terminalHpSpread,
      bestMargin: boundary.winner?.minNormalizedHpMargin ?? null,
      weakestMargin: boundary.weakestWinningReport?.minNormalizedHpMargin ?? null,
      violations: boundary.violations,
      attempts: simpleReports.map((report) => ({
        shopCycle: report.shopCycle.join('-'),
        solvable: report.solvable,
        floor: report.floor,
        hp: report.final.hp,
        failure: report.failure
      }))
    }
  };
}

const original = {
  palaceMagicPower: ENEMIES.palaceWarden.magicPower,
  blackSealMagicPower: ENEMIES.blackSealKeeper.magicPower,
  blackSealDef: ENEMIES.blackSealKeeper.def
};
const candidates = [];
try {
  for (const palaceMagicPower of palaceMagicCandidates) {
    for (const blackSealMagicPower of blackSealMagicCandidates) {
      for (const blackSealDef of blackSealDefCandidates) {
        candidates.push(evaluate(palaceMagicPower, blackSealMagicPower, blackSealDef));
      }
    }
  }
} finally {
  ENEMIES.palaceWarden.magicPower = original.palaceMagicPower;
  ENEMIES.blackSealKeeper.magicPower = original.blackSealMagicPower;
  ENEMIES.blackSealKeeper.def = original.blackSealDef;
}

candidates.sort((a, b) => Number(b.valid) - Number(a.valid)
  || a.score - b.score
  || a.editDistance - b.editDistance
  || b.blackSealMagicPower - a.blackSealMagicPower);
const best = candidates[0] ?? null;
const validCandidates = candidates.filter((candidate) => candidate.valid);
console.log('DEMO10_LATE_GAME_TUNER');
console.log(JSON.stringify({
  model: 'expert-def-threshold-no-hp-hard-mode-v2-minimal-f9-softening',
  progressionPriority,
  selectedCurrent: original,
  search: {
    fixedPalaceMagicPower: palaceMagicCandidates[0],
    fixedBlackSealDef: blackSealDefCandidates[0],
    blackSealMagicCandidates,
    direction: 'soften-f9-magic-only'
  },
  target: {
    primaryPlayer: 'DEF-first; ATK only on meaningful downstream thresholds; shop HP forbidden',
    expertTargets: DEMO10_EXPERT_TARGETS,
    naiveBoundaryTargets: DEMO10_QUALITY_TARGETS,
    productionWriteAllowed: false
  },
  validCandidateCount: validCandidates.length,
  recommended: best,
  validCandidates,
  topCandidates: candidates.slice(0, 12)
}, null, 2));
if (!best) throw new Error('Hard-mode tuner produced no candidates.');