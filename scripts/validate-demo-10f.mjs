import assert from 'node:assert/strict';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent, DEMO_TEN_FLOOR_ID } from '../src/game/demo-10-floor-content.js';
import {
  applyDemoTenFloorHardMode,
  DEMO10_HARD_MODE_ID,
  DEMO10_HARD_MODE_PRESSURE,
  DEMO10_HARD_MODE_ORDINARY_PRESSURE,
  DEMO10_HARD_ROUTE_PROOF
} from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTenFloorSpatialRedesign, DEMO10_SPATIAL_REDESIGN_ID } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import {
  applyDemoTenFloorProgressionGrammar,
  DEMO10_F8_VAULT_GUARDIANS,
  DEMO10_F8_VAULT_ID,
  DEMO10_FINAL_SUN_SEAL_ID
} from '../src/game/demo-10-floor-progression.js';
import {
  DEMO10_EXPERT_TARGETS,
  DEMO10_SIMPLE_BUILD_PORTFOLIO,
  summarizeDemoTenFloorPortfolio
} from '../src/game/demo-10-floor-quality.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
const progressionGrammar = applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorHardMode({ enemies: ENEMIES });

const { runGreedyShopStrategy } = await import('../src/solver/greedy-strategy.js');
const { runExpertNoHpStrategy, EXPERT_NO_HP_STRATEGY_ID } = await import('../src/solver/expert-strategy.js');
const { createTowerAdapter } = await import('../src/solver/tower-adapter.js');
const { replayTowerStepSkeleton } = await import('../src/solver/replay.js');
const { certifyDemoTenFloorRouteFamilies } = await import('../src/solver/demo-10f-route-family-certification.js');

// Fixed purchase cycles are retained as difficulty telemetry only. The release
// proof is instead a fully replayed engine route; a hard tower may legitimately
// have most simple cycles fail.
const releaseProgressionPriority = 'legacy-clear';
const guardianStressPriority = 'guardian-first';
const hardRouteProof = DEMO10_HARD_ROUTE_PROOF;
const PROOF_MARGIN = Object.freeze({ min: 0.04, max: 0.20 });

assert.equal(FLOORS.length, 10);
assert.equal(FLOORS[9].demoContentId, DEMO_TEN_FLOOR_ID);
assert.equal(FLOORS[0].demoSpatialRedesignId, DEMO10_SPATIAL_REDESIGN_ID);
assert.equal(FLOORS[9].boss, 'voidCore');
assert.equal(progressionGrammar.supply.sun, 1);
assert.ok(progressionGrammar.uniqueSunLocation);
assert.equal(DEMO10_FINAL_SUN_SEAL_ID, 'throneSeal');
assert.ok(progressionGrammar.throneSeal.sealTiles.length >= 2);
assert.deepEqual(FLOORS[9].puzzles?.cardGates?.[DEMO10_FINAL_SUN_SEAL_ID], { sun: 1 });
assert.equal(progressionGrammar.guardianVault.gateId, DEMO10_F8_VAULT_ID);
assert.deepEqual(progressionGrammar.guardianVault.guardians, DEMO10_F8_VAULT_GUARDIANS);
assert.deepEqual(FLOORS[7].puzzles?.guardianGates?.[DEMO10_F8_VAULT_ID], [...DEMO10_F8_VAULT_GUARDIANS]);
assert.equal(FLOORS[7].boss, 'palaceWarden', 'optional vault guardians must remain separate from the stair guardian');
assert.equal(ENEMIES.palaceWarden.magicPower, DEMO10_HARD_MODE_PRESSURE.palaceWardenMagicPower);
assert.equal(ENEMIES.blackSealKeeper.magicPower, DEMO10_HARD_MODE_PRESSURE.blackSealKeeperMagicPower);
assert.equal(ENEMIES.blackSealKeeper.def, DEMO10_HARD_MODE_PRESSURE.blackSealKeeperDef);
assert.equal(ENEMIES.hushCantor.magicPower, DEMO10_HARD_MODE_ORDINARY_PRESSURE.hushCantorMagicPower);
assert.equal(ENEMIES.outerCrown.atk, DEMO10_HARD_MODE_ORDINARY_PRESSURE.outerCrownAtk);
assert.equal(ENEMIES.nullCantor.magicPower, DEMO10_HARD_MODE_ORDINARY_PRESSURE.nullCantorMagicPower);
assert.equal(ENEMIES.eclipseMage.magicPower, DEMO10_HARD_MODE_ORDINARY_PRESSURE.eclipseMageMagicPower);
assert.equal(Object.values(ENEMIES).reduce((sum, enemy) => sum + Number(enemy?.reward?.core ?? 0), 0), 7);

// Keep the legacy no-HP expert as a diagnostic player model while the map is
// undergoing large spatial/progression redesign. It remains useful telemetry for
// detecting DEF/ATK threshold mistakes, but it is no longer a release blocker.
const expertReport = runExpertNoHpStrategy({
  holyPolicy: 'immediate',
  progressionPriority: guardianStressPriority,
  maxIterations: 8_000,
  horizon: 2,
  attackAdvantageRequired: 2_000
});
const expertQuality = summarizeDemoTenFloorPortfolio([expertReport], DEMO10_EXPERT_TARGETS);
assert.equal(expertReport.strategyId, EXPERT_NO_HP_STRATEGY_ID);
assert.equal(expertReport.purchaseCounts.hp, 0);
assert.ok(expertReport.purchaseLog.every((entry) => entry.optionId !== 'hp'));
const expertDiagnostic = {
  blocking: false,
  progressionPriority: guardianStressPriority,
  solvable: expertReport.solvable,
  floor: expertReport.floor,
  failure: expertReport.failure,
  cores: expertReport.cores,
  purchases: expertReport.purchases,
  purchaseCounts: expertReport.purchaseCounts,
  shopPlan: expertReport.planning?.shopPlan,
  f9Purchases: expertReport.purchaseLog.filter((entry) => entry.floor === 9).length,
  cards: expertReport.cards,
  final: expertReport.final,
  minNormalizedHpMargin: expertReport.minNormalizedHpMargin,
  violations: expertQuality.violations
};

const simpleReports = DEMO10_SIMPLE_BUILD_PORTFOLIO.map((shopCycle) => runGreedyShopStrategy({
  shopCycle,
  holyPolicy: 'immediate',
  progressionPriority: releaseProgressionPriority,
  maxIterations: 8_000
}));
const strategyDiagnostics = summarizeDemoTenFloorPortfolio(simpleReports);

const proofRoute = runGreedyShopStrategy({
  ...hardRouteProof,
  traceActions: true,
  maxIterations: 8_000
});
const proofReplay = replayTowerStepSkeleton(proofRoute.routeSteps, {
  adapter: createTowerAdapter(),
  requireGoal: true
});
assert.equal(proofRoute.solvable, true, '10F must retain one reproducible winning route.');
assert.equal(proofReplay.ok, true, 'The winning route must replay through authoritative engine actions.');
assert.ok(proofReplay.minNormalizedHpMargin >= PROOF_MARGIN.min, 'The proof route is too brittle.');
assert.ok(proofReplay.minNormalizedHpMargin <= PROOF_MARGIN.max, 'The proof route is too forgiving.');
const existenceProof = {
  blocking: true,
  route: { ...hardRouteProof, shopCycle: [...hardRouteProof.shopCycle] },
  routeSteps: proofRoute.routeSteps.length,
  replayOk: proofReplay.ok,
  final: proofReplay.final,
  minNormalizedHpMargin: proofReplay.minNormalizedHpMargin,
  marginTarget: PROOF_MARGIN
};

// This is a blocking diversity certificate. The small policy grid merely
// discovers routes; acceptance is based on replayed F8 vault choice, Holy
// timing, and actual shop mix. It deliberately replaces any fixed-cycle count.
const routeFamilyProof = certifyDemoTenFloorRouteFamilies({ targetFamilies: 3 });
assert.equal(routeFamilyProof.complete, true, '10F must retain three independent replayed route families.');
const independentRoutes = routeFamilyProof.selected.map((attempt) => ({
  discoverySeed: attempt.id,
  decisions: attempt.family.decisions,
  minNormalizedHpMargin: attempt.family.minNormalizedHpMargin,
  final: attempt.family.final
}));

const guardianStressReports = DEMO10_SIMPLE_BUILD_PORTFOLIO.map((shopCycle) => runGreedyShopStrategy({
  shopCycle,
  holyPolicy: 'immediate',
  progressionPriority: guardianStressPriority,
  maxIterations: 8_000
}));
const guardianStress = {
  blocking: false,
  progressionPriority: guardianStressPriority,
  solvableBuilds: guardianStressReports.filter((report) => report.solvable).length,
  attempts: guardianStressReports.map((report) => ({
    shopCycle: report.shopCycle.join('-'),
    solvable: report.solvable,
    floor: report.floor,
    terminalHp: report.final.hp,
    f9Purchases: report.purchaseLog.filter((entry) => entry.floor === 9).length,
    failure: report.failure
  }))
};

assert.ok(simpleReports.filter((report) => report.shopCycle[0] === 'hp').some((report) => !report.solvable));
// Simple cycles are intentionally non-blocking telemetry: a hard tower may
// reject all of them.  Boss coverage belongs to the engine-replayed release
// route, not to a convenient heuristic portfolio.
const bossIds = new Set(proofRoute.battleLog
  .filter((entry) => entry.boss || entry.finalBoss)
  .map((entry) => entry.enemyId));
for (const bossId of ['palaceWarden', 'blackSealKeeper', 'voidCore']) assert.ok(bossIds.has(bossId));
assert.ok(simpleReports.filter((report) => report.solvable).every((report) =>
  report.purchaseLog.some((entry) => entry.floor === 9)
));

console.log('10-floor spatial-redesign hard-mode validation passed.');
console.log(JSON.stringify({
  contentId: DEMO_TEN_FLOOR_ID,
  mode: DEMO10_HARD_MODE_ID,
  releaseProgressionPriority,
  progressionGrammar,
  pressure: DEMO10_HARD_MODE_PRESSURE,
  existenceProof,
  routeFamilyProof: {
    blocking: true,
    discoverySeeds: routeFamilyProof.discoverySeeds,
    replayableWins: routeFamilyProof.replayableWins,
    hardCandidates: routeFamilyProof.hardCandidates,
    discoveredFamilies: routeFamilyProof.discoveredFamilies,
    minimumDecisionDistance: routeFamilyProof.minDistance,
    routes: independentRoutes
  },
  expertDiagnostic,
  guardianStress,
  strategyDiagnostics: {
    blocking: false,
    testedSimpleBuilds: strategyDiagnostics.testedBuilds,
    solvableSimpleBuilds: strategyDiagnostics.solvableBuilds,
    failedSimpleBuilds: strategyDiagnostics.failedBuilds,
    f9ShopCoverage: strategyDiagnostics.f9ShopCoverage,
    terminalHpSpread: strategyDiagnostics.terminalHpSpread,
    winnerLateMinMargin: strategyDiagnostics.winnerLateMinMargin,
    weakestWinningLateMargin: strategyDiagnostics.weakestWinningLateMargin,
    historicalViolations: strategyDiagnostics.violations,
    attempts: simpleReports.map((report) => ({
      shopCycle: report.shopCycle.join('-'),
      solvable: report.solvable,
      floor: report.floor,
      terminalHp: report.final.hp,
      f9Purchases: report.purchaseLog.filter((entry) => entry.floor === 9).length,
      cards: report.cards,
      failure: report.failure
    }))
  }
}, null, 2));
