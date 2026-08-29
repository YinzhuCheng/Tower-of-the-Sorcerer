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
const blackSealMagicCandidates = [190, 180, 170, 160, 150, 140, 130, 120, 110, 100, 90, 80];
const voidCoreMagicCandidates = [506, 480, 460, 440, 420, 400, 380, 360, 340, 320, 300, 280, 260, 240, 220, 200];

function runSimplePortfolio() {
  return DEMO10_SIMPLE_BUILD_PORTFOLIO.map((shopCycle) => runGreedyShopStrategy({
    shopCycle,
    holyPolicy: 'immediate',
    progressionPriority,
    maxIterations: 8_000
  }));
}

function runExpert() {
  return runExpertNoHpStrategy({
    holyPolicy: 'immediate',
    progressionPriority,
    maxIterations: 8_000,
    horizon: 2,
    attackAdvantageRequired: 2_000
  });
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

function summarizeBoundary(boundary, reports) {
  return {
    solvableBuilds: boundary.solvableBuilds,
    terminalHpSpread: boundary.terminalHpSpread,
    bestMargin: boundary.winner?.minNormalizedHpMargin ?? null,
    weakestMargin: boundary.weakestWinningReport?.minNormalizedHpMargin ?? null,
    aggregateF9ShopCoverage: boundary.f9ShopCoverage,
    note: 'aggregateF9ShopCoverage is winner-only; inspect each attempt f9Purchases for failed builds.',
    violations: boundary.violations,
    attempts: reports.map((report) => ({
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

function summarizeExpert(report) {
  const portfolio = summarizeDemoTenFloorPortfolio([report], DEMO10_EXPERT_TARGETS);
  const hpClean = report.purchaseCounts.hp === 0
    && report.purchaseLog.every((entry) => entry.optionId !== 'hp');
  return {
    valid: portfolio.violations.length === 0 && hpClean,
    hpClean,
    solvable: report.solvable,
    floor: report.floor,
    hp: report.final.hp,
    atk: report.final.atk,
    def: report.final.def,
    purchaseCounts: report.purchaseCounts,
    ...summarizeRouteTelemetry(report),
    shopPlan: report.planning?.shopPlan,
    guardianRescue: summarizeGuardianRescue(report),
    margin: report.minNormalizedHpMargin,
    f8BossMeanMargin: portfolio.lateFloors[8].meanBossMinMargin,
    f9BossMeanMargin: portfolio.lateFloors[9].meanBossMinMargin,
    f10BossMeanMargin: portfolio.lateFloors[10].meanBossMinMargin,
    violations: portfolio.violations,
    failure: report.failure,
    loss: demoTenFloorExpertLoss(portfolio, DEMO10_EXPERT_TARGETS)
  };
}

const original = {
  palaceMagicPower: ENEMIES.palaceWarden.magicPower,
  blackSealMagicPower: ENEMIES.blackSealKeeper.magicPower,
  blackSealDef: ENEMIES.blackSealKeeper.def,
  finalQueenAtk: ENEMIES.finalQueen.atk,
  voidCoreMagicPower: ENEMIES.voidCore.magicPower
};

// First expose the F9 expert threshold while keeping the production final core.
// This prevents a coupled search from hiding whether a candidate actually fixes
// the intended no-HP route or merely moves the failure to F10.
const expertF9BaselineScan = [];
try {
  for (const blackSealMagicPower of blackSealMagicCandidates) {
    ENEMIES.blackSealKeeper.magicPower = blackSealMagicPower;
    ENEMIES.voidCore.magicPower = original.voidCoreMagicPower;
    expertF9BaselineScan.push({
      blackSealMagicPower,
      voidCoreMagicPower: original.voidCoreMagicPower,
      expert: summarizeExpert(runExpert())
    });
  }
} finally {
  ENEMIES.blackSealKeeper.magicPower = original.blackSealMagicPower;
  ENEMIES.voidCore.magicPower = original.voidCoreMagicPower;
}

function evaluate(blackSealMagicPower, voidCoreMagicPower) {
  ENEMIES.blackSealKeeper.magicPower = blackSealMagicPower;
  ENEMIES.voidCore.magicPower = voidCoreMagicPower;

  // Six simple strategies are cheap and define the hard-mode boundary. Only
  // candidates that preserve that boundary pay for the expensive expert replay.
  const simpleReports = runSimplePortfolio();
  const boundaryPortfolio = summarizeDemoTenFloorPortfolio(simpleReports, DEMO10_QUALITY_TARGETS);
  const boundaryValid = boundaryPortfolio.violations.length === 0;

  let expertSummary = null;
  if (boundaryValid) expertSummary = summarizeExpert(runExpert());

  const valid = boundaryValid && Boolean(expertSummary?.valid);
  const editDistance = Math.abs(blackSealMagicPower - original.blackSealMagicPower)
      / Math.max(1, original.blackSealMagicPower)
    + Math.abs(voidCoreMagicPower - original.voidCoreMagicPower)
      / Math.max(1, original.voidCoreMagicPower);
  const boundaryLoss = demoTenFloorQualityLoss(boundaryPortfolio, DEMO10_QUALITY_TARGETS) / 20;
  const expertLoss = expertSummary?.loss ?? 100_000;
  const expertMarginOvershoot = valid && Number.isFinite(expertSummary.margin)
    ? Math.max(0, expertSummary.margin - DEMO10_EXPERT_TARGETS.weakestWinningMarginMin)
    : null;

  return {
    palaceMagicPower: original.palaceMagicPower,
    blackSealMagicPower,
    blackSealDef: original.blackSealDef,
    finalQueenAtk: original.finalQueenAtk,
    voidCoreMagicPower,
    valid,
    boundaryValid,
    expertValid: Boolean(expertSummary?.valid),
    editDistance,
    expertMarginOvershoot,
    score: expertLoss + boundaryLoss + editDistance * 2,
    expert: expertSummary,
    boundary: summarizeBoundary(boundaryPortfolio, simpleReports)
  };
}

const candidates = [];
try {
  for (const blackSealMagicPower of blackSealMagicCandidates) {
    for (const voidCoreMagicPower of voidCoreMagicCandidates) {
      candidates.push(evaluate(blackSealMagicPower, voidCoreMagicPower));
    }
  }
} finally {
  ENEMIES.palaceWarden.magicPower = original.palaceMagicPower;
  ENEMIES.blackSealKeeper.magicPower = original.blackSealMagicPower;
  ENEMIES.blackSealKeeper.def = original.blackSealDef;
  ENEMIES.finalQueen.atk = original.finalQueenAtk;
  ENEMIES.voidCore.magicPower = original.voidCoreMagicPower;
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
  || b.voidCoreMagicPower - a.voidCoreMagicPower);

const validCandidates = candidates.filter((candidate) => candidate.valid);
const boundaryCandidates = candidates.filter((candidate) => candidate.boundaryValid);
const best = candidates[0] ?? null;
const result = {
  model: 'expert-no-hp-hard-mode-v4-coupled-f9-f10-magic-softening',
  progressionPriority,
  selectedCurrent: original,
  search: {
    fixedPalaceMagicPower: original.palaceMagicPower,
    fixedBlackSealDef: original.blackSealDef,
    fixedFinalQueenAtk: original.finalQueenAtk,
    blackSealMagicCandidates,
    voidCoreMagicCandidates,
    direction: 'soften-f9-magic-and-soften-final-core-magic-to-recover-4-to-5-of-6-boundary',
    expensiveExpertGate: 'run-only-after-simple-boundary-passes',
    independentExpertF9Scan: 'production-voidCore-magic'
  },
  target: {
    primaryPlayer: 'DEF-first; ATK only on meaningful downstream thresholds; shop HP forbidden',
    expertTargets: DEMO10_EXPERT_TARGETS,
    naiveBoundaryTargets: DEMO10_QUALITY_TARGETS,
    productionWriteAllowed: false
  },
  expertF9BaselineScan,
  validCandidateCount: validCandidates.length,
  boundaryCandidateCount: boundaryCandidates.length,
  recommended: best,
  validCandidates: validCandidates.slice(0, 24),
  boundaryCandidates: boundaryCandidates.slice(0, 24),
  topCandidates: candidates.slice(0, 24)
};

console.log('DEMO10_LATE_GAME_TUNER');
console.log(JSON.stringify(result, null, 2));
if (!best) throw new Error('Hard-mode tuner produced no candidates.');