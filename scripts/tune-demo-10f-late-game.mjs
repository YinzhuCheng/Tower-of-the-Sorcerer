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
const palaceMagicCandidates = [245, 220, 200, 180, 160, 140, 120];
const blackSealMagicCandidates = [190, 160, 130, 110, 90, 70, 50, 35, 20];
const voidCoreMagicCandidates = [506, 480, 450, 420, 390, 360, 330, 300, 270, 240, 210];
const expertF9ProbeCandidates = [190, 130, 90, 70, 60, 50, 40, 35, 30, 25, 20];

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

function tightestBattle(report) {
  const battles = (report.battleLog ?? []).filter((entry) => Number.isFinite(entry.normalizedHpMargin));
  if (!battles.length) return null;
  const entry = battles.reduce((best, current) =>
    current.normalizedHpMargin < best.normalizedHpMargin ? current : best
  );
  return {
    floor: entry.floor,
    enemyId: entry.enemyId,
    boss: entry.boss,
    normalizedHpMargin: entry.normalizedHpMargin,
    hpBefore: entry.statsBefore.hp,
    totalDamage: entry.battle.totalDamage,
    remainingHp: entry.battle.remainingHp,
    counterAttacks: entry.battle.counterAttacks
  };
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
    minNormalizedHpMargin: report.minNormalizedHpMargin,
    tightestBattle: tightestBattle(report),
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

// Diagnostic 1: expose exactly which successful battle creates the current
// shared <15% margin. Use a final-core-softened reference so 4-5 simple routes
// can finish and the global minimum margin is observable.
const palaceReferenceScan = [];
try {
  ENEMIES.blackSealKeeper.magicPower = original.blackSealMagicPower;
  ENEMIES.voidCore.magicPower = 200;
  for (const palaceMagicPower of palaceMagicCandidates) {
    ENEMIES.palaceWarden.magicPower = palaceMagicPower;
    const reports = runSimplePortfolio();
    const boundary = summarizeDemoTenFloorPortfolio(reports, DEMO10_QUALITY_TARGETS);
    palaceReferenceScan.push({
      palaceMagicPower,
      blackSealMagicPower: original.blackSealMagicPower,
      voidCoreMagicPower: 200,
      boundary: summarizeBoundary(boundary, reports)
    });
  }
} finally {
  ENEMIES.palaceWarden.magicPower = original.palaceMagicPower;
  ENEMIES.blackSealKeeper.magicPower = original.blackSealMagicPower;
  ENEMIES.voidCore.magicPower = original.voidCoreMagicPower;
}

// Diagnostic 2: map the no-HP F9 threshold with the current F8/F10 pressure.
// This is diagnostic only; the full search below can soften F8 and therefore
// may find a valid expert at a higher F9 value.
const expertF9BaselineScan = [];
try {
  ENEMIES.palaceWarden.magicPower = original.palaceMagicPower;
  ENEMIES.voidCore.magicPower = original.voidCoreMagicPower;
  for (const blackSealMagicPower of expertF9ProbeCandidates) {
    ENEMIES.blackSealKeeper.magicPower = blackSealMagicPower;
    expertF9BaselineScan.push({
      blackSealMagicPower,
      expert: summarizeExpert(runExpert())
    });
  }
} finally {
  ENEMIES.blackSealKeeper.magicPower = original.blackSealMagicPower;
}

function evaluate(palaceMagicPower, blackSealMagicPower, voidCoreMagicPower) {
  ENEMIES.palaceWarden.magicPower = palaceMagicPower;
  ENEMIES.blackSealKeeper.magicPower = blackSealMagicPower;
  ENEMIES.voidCore.magicPower = voidCoreMagicPower;

  const simpleReports = runSimplePortfolio();
  const boundaryPortfolio = summarizeDemoTenFloorPortfolio(simpleReports, DEMO10_QUALITY_TARGETS);
  const boundaryValid = boundaryPortfolio.violations.length === 0;
  const expertSummary = boundaryValid ? summarizeExpert(runExpert()) : null;
  const valid = boundaryValid && Boolean(expertSummary?.valid);

  const editDistance = Math.abs(palaceMagicPower - original.palaceMagicPower)
      / Math.max(1, original.palaceMagicPower)
    + Math.abs(blackSealMagicPower - original.blackSealMagicPower)
      / Math.max(1, original.blackSealMagicPower)
    + Math.abs(voidCoreMagicPower - original.voidCoreMagicPower)
      / Math.max(1, original.voidCoreMagicPower);
  const boundaryLoss = demoTenFloorQualityLoss(boundaryPortfolio, DEMO10_QUALITY_TARGETS) / 20;
  const expertLoss = expertSummary?.loss ?? 100_000;
  const expertMarginOvershoot = valid && Number.isFinite(expertSummary.margin)
    ? Math.max(0, expertSummary.margin - DEMO10_EXPERT_TARGETS.weakestWinningMarginMin)
    : null;

  return {
    palaceMagicPower,
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
  for (const palaceMagicPower of palaceMagicCandidates) {
    for (const blackSealMagicPower of blackSealMagicCandidates) {
      for (const voidCoreMagicPower of voidCoreMagicCandidates) {
        candidates.push(evaluate(palaceMagicPower, blackSealMagicPower, voidCoreMagicPower));
      }
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
  || b.palaceMagicPower - a.palaceMagicPower
  || b.blackSealMagicPower - a.blackSealMagicPower
  || b.voidCoreMagicPower - a.voidCoreMagicPower);

const validCandidates = candidates.filter((candidate) => candidate.valid);
const boundaryCandidates = candidates.filter((candidate) => candidate.boundaryValid);
const best = candidates[0] ?? null;
const result = {
  model: 'expert-no-hp-hard-mode-v5-three-stage-magic-redistribution',
  progressionPriority,
  selectedCurrent: original,
  search: {
    fixedBlackSealDef: original.blackSealDef,
    fixedFinalQueenAtk: original.finalQueenAtk,
    palaceMagicCandidates,
    blackSealMagicCandidates,
    voidCoreMagicCandidates,
    direction: 'soften-shared-f8-brittleness-then-find-f9-f10-4-to-5-of-6-boundary',
    expensiveExpertGate: 'run-only-after-simple-boundary-passes'
  },
  target: {
    primaryPlayer: 'DEF-first; ATK only on meaningful downstream thresholds; shop HP forbidden',
    expertTargets: DEMO10_EXPERT_TARGETS,
    naiveBoundaryTargets: DEMO10_QUALITY_TARGETS,
    productionWriteAllowed: false
  },
  palaceReferenceScan,
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