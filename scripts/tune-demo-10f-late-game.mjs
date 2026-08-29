import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorHardMode, DEMO10_HARD_MODE_PRESSURE } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import {
  DEMO10_EXPERT_TARGETS,
  DEMO10_QUALITY_TARGETS,
  DEMO10_SIMPLE_BUILD_PORTFOLIO,
  summarizeDemoTenFloorPortfolio
} from '../src/game/demo-10-floor-quality.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
const progressionGrammar = applyDemoTenFloorProgressionGrammar({
  enemies: ENEMIES,
  floors: FLOORS,
  dialogues: DIALOGUES
});
applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorHardMode({ enemies: ENEMIES });

const { runGreedyShopStrategy } = await import('../src/solver/greedy-strategy.js');
const { runExpertNoHpStrategy } = await import('../src/solver/expert-strategy.js');
const releaseProgressionPriority = 'legacy-clear';
const guardianStressPriority = 'guardian-first';

function summarizeReport(report) {
  return {
    shopCycle: report.shopCycle?.join('-') ?? null,
    solvable: report.solvable,
    floor: report.floor,
    hp: report.final.hp,
    atk: report.final.atk,
    def: report.final.def,
    gold: report.final.gold,
    purchases: report.purchases,
    purchaseCounts: report.purchaseCounts,
    purchaseFloors: [...new Set((report.purchaseLog ?? []).map((entry) => entry.floor))],
    f9Purchases: (report.purchaseLog ?? []).filter((entry) => entry.floor === 9).length,
    minNormalizedHpMargin: report.minNormalizedHpMargin,
    failure: report.failure
  };
}

const simpleReports = DEMO10_SIMPLE_BUILD_PORTFOLIO.map((shopCycle) => runGreedyShopStrategy({
  shopCycle,
  holyPolicy: 'immediate',
  progressionPriority: releaseProgressionPriority,
  maxIterations: 8_000
}));
const strategicBoundary = summarizeDemoTenFloorPortfolio(simpleReports, DEMO10_QUALITY_TARGETS);

const guardianStressReports = DEMO10_SIMPLE_BUILD_PORTFOLIO.map((shopCycle) => runGreedyShopStrategy({
  shopCycle,
  holyPolicy: 'immediate',
  progressionPriority: guardianStressPriority,
  maxIterations: 8_000
}));
const guardianStressSummary = summarizeDemoTenFloorPortfolio(guardianStressReports, DEMO10_QUALITY_TARGETS);

// The no-HP route is intentionally diagnostic during spatial redesign. It is
// still useful for exposing ATK/DEF breakpoint behavior, but it is not allowed
// to drive production numbers while rooms, optional vaults and card permissions
// are changing underneath the old research policy.
const expertReport = runExpertNoHpStrategy({
  holyPolicy: 'immediate',
  progressionPriority: guardianStressPriority,
  maxIterations: 8_000,
  horizon: 2,
  attackAdvantageRequired: 2_000
});
const expertSummary = summarizeDemoTenFloorPortfolio([expertReport], DEMO10_EXPERT_TARGETS);

const result = {
  model: 'spatial-redesign-diagnostics-v2',
  releaseProgressionPriority,
  guardianStressPriority,
  productionWriteAllowed: false,
  pressure: DEMO10_HARD_MODE_PRESSURE,
  progressionGrammar: {
    supply: progressionGrammar.supply,
    doors: progressionGrammar.doors,
    uniqueSunLocation: progressionGrammar.uniqueSunLocation,
    guardianVault: progressionGrammar.guardianVault,
    throneSeal: progressionGrammar.throneSeal
  },
  releaseGateSource: 'scripts/validate-demo-10f.mjs',
  strategicBoundary: {
    valid: strategicBoundary.violations.length === 0,
    solvableBuilds: strategicBoundary.solvableBuilds,
    allowedSolvableBuilds: [DEMO10_QUALITY_TARGETS.minSolvableBuilds, DEMO10_QUALITY_TARGETS.maxSolvableBuilds],
    f9ShopCoverage: strategicBoundary.f9ShopCoverage,
    terminalHpSpread: strategicBoundary.terminalHpSpread,
    winnerLateMinMargin: strategicBoundary.winnerLateMinMargin,
    weakestWinningLateMargin: strategicBoundary.weakestWinningLateMargin,
    violations: strategicBoundary.violations,
    attempts: simpleReports.map(summarizeReport)
  },
  guardianStressDiagnostic: {
    blocking: false,
    solvableBuilds: guardianStressSummary.solvableBuilds,
    violationsAgainstReleaseTargets: guardianStressSummary.violations,
    attempts: guardianStressReports.map(summarizeReport)
  },
  expertDiagnostic: {
    blocking: false,
    validAgainstLegacyExpertTargets: expertSummary.violations.length === 0,
    report: summarizeReport(expertReport),
    shopPlan: expertReport.planning?.shopPlan ?? null,
    guardianRescue: expertReport.planning?.guardianRescue ?? null,
    violations: expertSummary.violations
  }
};

console.log('DEMO10_LATE_GAME_DIAGNOSTICS');
console.log(JSON.stringify(result, null, 2));
