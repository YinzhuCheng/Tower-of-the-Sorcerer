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

// Coupled boundary search.
//
// F9 magic is the lever that rescues the intended no-HP expert route. Directly
// compensating with more voidCore magic is counterproductive: fixed magic
// damage scales with counterattack count, so the lower-ATK expert suffers more
// marginal damage than the naive high-ATK builds we are trying to separate.
// Instead, use the F10 queen's physical ATK as the compensation axis. The
// intended expert carries high DEF and can absorb a moderate threshold increase,
// while under-invested defensive builds begin paying physical damage earlier.
const palaceMagicCandidates = [DEMO10_HARD_MODE_PRESSURE.palaceWardenMagicPower];
const blackSealMagicCandidates = [130, 125, 120, 115, 110, 100, 90];
const blackSealDefCandidates = [DEMO10_HARD_MODE_PRESSURE.blackSealKeeperDef];
const finalQueenAtkCandidates = [193, 220, 250, 280, 310, 340, 370];

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

function summarizeRouteTelemetry(report) {
  const purchaseFloors = [...new Set((report.purchaseLog ?? []).map((entry) => entry.floor))];
  const f9Purchases = (report.purchaseLog ?? []).filter((entry) => entry.floor === 9);
  const f9Battles = (report.battleLog ?? []).filter((entry) => entry.floor === 9);
  const f10Battles = (report.battleLog ?? []).filter((entry) => entry.floor === 10);
  return {
    purchases: report.purchases,
    purchaseFloors,
    f9Purchases: f9Purchases.length,
    f9PurchaseOptions: f9Purchases.map((entry) => entry.optionId),
    f9BattleIds: f9Battles.map((entry) => entry.enemyId),
    f10BattleIds: f10Battles.map((entry) => entry.enemyId),
    finalGold: report.final.gold
  };
}

function summarizeBoundary(boundary, simpleReports) {
  return {
    solvableBuilds: boundary.solvableBuilds,
    terminalHpSpread: boundary.terminalHpSpread,
    bestMargin: boundary.winner?.minNormalizedHpMargin ?? null,
    weakestMargin: boundary.weakestWinningReport?.minNormalizedHpMargin ?? null,
    aggregateF9ShopCoverage: boundary.f9ShopCoverage,
    note: 'aggregateF9ShopCoverage is computed only across winning reports; inspect per-attempt f9Purchases for failed builds.',
    violations: boundary.violations,
    attempts: simpleReports.map((report) => ({
      shopCycle: report.shopCycle.join('-'),
      solvable: report.solvable,
      floor: report.floor,
      hp: report.final.hp,
      atk: report.final.atk,
      def: report.final.def,
      ...summarizeRouteTelemetry(report),
      failure: report.failure
    }))
  };
}

function evaluate(palaceMagicPower, blackSealMagicPower, blackSealDef, finalQueenAtk, original) {
  ENEMIES.palaceWarden.magicPower = palaceMagicPower;
  ENEMIES.blackSealKeeper.magicPower = blackSealMagicPower;
  ENEMIES.blackSealKeeper.def = blackSealDef;
  ENEMIES.finalQueen.atk = finalQueenAtk;

  // Cheap gate first: most coupled candidates are rejected by the six simple
  // builds, so do not pay for the receding-horizon expert planner unnecessarily.
  const simpleReports = runSimplePortfolio();
  const boundary = summarizeDemoTenFloorPortfolio(simpleReports, DEMO10_QUALITY_TARGETS);
  const boundaryValid = boundary.violations.length === 0;

  let expertReport = null;
  let expert = null;
  let hpClean = null;
  if (boundaryValid) {
    expertReport = runExpertNoHpStrategy({
      holyPolicy: 'immediate',
      progressionPriority,
      maxIterations: 8_000,
      horizon: 2,
      attackAdvantageRequired: 2_000
    });
    expert = summarizeDemoTenFloorPortfolio([expertReport], DEMO10_EXPERT_TARGETS);
    hpClean = expertReport.purchaseCounts.hp === 0
      && expertReport.purchaseLog.every((entry) => entry.optionId !== 'hp');
  }

  const expertValid = Boolean(expert) && expert.violations.length === 0 && hpClean;
  const valid = boundaryValid && expertValid;
  const editDistance = Math.abs(blackSealMagicPower - DEMO10_HARD_MODE_PRESSURE.blackSealKeeperMagicPower)
      / DEMO10_HARD_MODE_PRESSURE.blackSealKeeperMagicPower
    + Math.abs(blackSealDef - DEMO10_HARD_MODE_PRESSURE.blackSealKeeperDef)
      / DEMO10_HARD_MODE_PRESSURE.blackSealKeeperDef
    + Math.abs(finalQueenAtk - original.finalQueenAtk) / Math.max(1, original.finalQueenAtk);

  const expertLoss = expert ? demoTenFloorExpertLoss(expert, DEMO10_EXPERT_TARGETS) : 100_000;
  const boundaryLoss = demoTenFloorQualityLoss(boundary, DEMO10_QUALITY_TARGETS) / 20;
  const expertMargin = expertReport?.minNormalizedHpMargin ?? null;
  const expertMarginOvershoot = valid && Number.isFinite(expertMargin)
    ? Math.max(0, expertMargin - DEMO10_EXPERT_TARGETS.weakestWinningMarginMin)
    : null;

  return {
    palaceMagicPower,
    blackSealMagicPower,
    blackSealDef,
    finalQueenAtk,
    valid,
    boundaryValid,
    expertValid,
    hpClean,
    editDistance,
    expertMarginOvershoot,
    score: expertLoss + boundaryLoss + editDistance * 2,
    expert: expertReport ? {
      solvable: expertReport.solvable,
      floor: expertReport.floor,
      hp: expertReport.final.hp,
      atk: expertReport.final.atk,
      def: expertReport.final.def,
      purchases: expertReport.purchases,
      purchaseCounts: expertReport.purchaseCounts,
      ...summarizeRouteTelemetry(expertReport),
      shopPlan: expertReport.planning?.shopPlan,
      guardianRescue: summarizeGuardianRescue(expertReport),
      margin: expertMargin,
      f8BossMeanMargin: expert.lateFloors[8].meanBossMinMargin,
      f9BossMeanMargin: expert.lateFloors[9].meanBossMinMargin,
      f10BossMeanMargin: expert.lateFloors[10].meanBossMinMargin,
      violations: expert.violations,
      failure: expertReport.failure
    } : null,
    boundary: summarizeBoundary(boundary, simpleReports)
  };
}

const original = {
  palaceMagicPower: ENEMIES.palaceWarden.magicPower,
  blackSealMagicPower: ENEMIES.blackSealKeeper.magicPower,
  blackSealDef: ENEMIES.blackSealKeeper.def,
  finalQueenAtk: ENEMIES.finalQueen.atk,
  voidCoreMagicPower: ENEMIES.voidCore?.magicPower ?? null
};
const candidates = [];
try {
  for (const palaceMagicPower of palaceMagicCandidates) {
    for (const blackSealMagicPower of blackSealMagicCandidates) {
      for (const blackSealDef of blackSealDefCandidates) {
        for (const finalQueenAtk of finalQueenAtkCandidates) {
          candidates.push(evaluate(
            palaceMagicPower,
            blackSealMagicPower,
            blackSealDef,
            finalQueenAtk,
            original
          ));
        }
      }
    }
  }
} finally {
  ENEMIES.palaceWarden.magicPower = original.palaceMagicPower;
  ENEMIES.blackSealKeeper.magicPower = original.blackSealMagicPower;
  ENEMIES.blackSealKeeper.def = original.blackSealDef;
  ENEMIES.finalQueen.atk = original.finalQueenAtk;
  if (ENEMIES.voidCore && Number.isFinite(original.voidCoreMagicPower)) {
    ENEMIES.voidCore.magicPower = original.voidCoreMagicPower;
  }
}

candidates.sort((a, b) => Number(b.valid) - Number(a.valid)
  || (a.valid && b.valid ? a.editDistance - b.editDistance : 0)
  || (a.valid && b.valid
    ? (a.expertMarginOvershoot ?? Infinity) - (b.expertMarginOvershoot ?? Infinity)
    : 0)
  || Number(b.boundaryValid) - Number(a.boundaryValid)
  || a.score - b.score
  || a.editDistance - b.editDistance
  || b.blackSealMagicPower - a.blackSealMagicPower
  || a.finalQueenAtk - b.finalQueenAtk);
const best = candidates[0] ?? null;
const validCandidates = candidates.filter((candidate) => candidate.valid);
const boundaryCandidates = candidates.filter((candidate) => candidate.boundaryValid);
console.log('DEMO10_LATE_GAME_TUNER');
console.log(JSON.stringify({
  model: 'expert-def-threshold-no-hp-hard-mode-v3-coupled-f9-f10-physical',
  progressionPriority,
  selectedCurrent: original,
  search: {
    fixedPalaceMagicPower: palaceMagicCandidates[0],
    fixedBlackSealDef: blackSealDefCandidates[0],
    fixedVoidCoreMagicPower: original.voidCoreMagicPower,
    blackSealMagicCandidates,
    finalQueenAtkCandidates,
    direction: 'soften-f9-magic-and-compensate-with-f10-physical-atk',
    expensiveExpertGate: 'run-only-after-simple-boundary-passes'
  },
  target: {
    primaryPlayer: 'DEF-first; ATK only on meaningful downstream thresholds; shop HP forbidden',
    expertTargets: DEMO10_EXPERT_TARGETS,
    naiveBoundaryTargets: DEMO10_QUALITY_TARGETS,
    productionWriteAllowed: false
  },
  validCandidateCount: validCandidates.length,
  boundaryCandidateCount: boundaryCandidates.length,
  recommended: best,
  validCandidates,
  boundaryCandidates: boundaryCandidates.slice(0, 12),
  topCandidates: candidates.slice(0, 12)
}, null, 2));
if (!best) throw new Error('Hard-mode tuner produced no candidates.');