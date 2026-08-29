import assert from 'node:assert/strict';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent, DEMO_TEN_FLOOR_ID } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorHardMode, DEMO10_HARD_MODE_ID, DEMO10_HARD_MODE_PRESSURE } from '../src/game/demo-10-floor-hard-mode.js';
import {
  applyDemoTenFloorProgressionGrammar,
  DEMO10_F8_VAULT_GUARDIANS,
  DEMO10_F8_VAULT_ID,
  DEMO10_FINAL_SUN_SEAL_ID
} from '../src/game/demo-10-floor-progression.js';
import {
  DEMO10_EXPERT_TARGETS,
  DEMO10_QUALITY_TARGETS,
  DEMO10_SIMPLE_BUILD_PORTFOLIO,
  summarizeDemoTenFloorPortfolio
} from '../src/game/demo-10-floor-quality.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
const progressionGrammar = applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorHardMode({ enemies: ENEMIES });

const { runGreedyShopStrategy } = await import('../src/solver/greedy-strategy.js');
const { runExpertNoHpStrategy, EXPERT_NO_HP_STRATEGY_ID } = await import('../src/solver/expert-strategy.js');
const progressionPriority = 'guardian-first';

assert.equal(FLOORS.length, 10);
assert.equal(FLOORS[9].demoContentId, DEMO_TEN_FLOOR_ID);
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
assert.equal(Object.values(ENEMIES).reduce((sum, enemy) => sum + Number(enemy?.reward?.core ?? 0), 0), 7);

// Keep the legacy no-HP expert as a diagnostic player model while the map is
// undergoing large spatial/progression redesign. It remains useful telemetry for
// detecting DEF/ATK threshold mistakes, but it is no longer a release blocker:
// requiring a zero-HP-purchase route would force late-game numbers to conform to
// an old research assumption instead of the new room/vault/card grammar.
const expertReport = runExpertNoHpStrategy({
  holyPolicy: 'immediate',
  progressionPriority,
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
  progressionPriority,
  maxIterations: 8_000
}));
const strategicBoundary = summarizeDemoTenFloorPortfolio(simpleReports, DEMO10_QUALITY_TARGETS);
if (strategicBoundary.violations.length) {
  console.error('DEMO10_STRATEGIC_BOUNDARY_GATE_FAILED');
  console.error(JSON.stringify({
    violations: strategicBoundary.violations,
    progressionGrammar,
    expertDiagnostic,
    attempts: simpleReports.map((report) => ({
      shopCycle: report.shopCycle,
      solvable: report.solvable,
      floor: report.floor,
      failure: report.failure,
      cards: report.cards,
      cores: report.cores,
      final: report.final,
      minNormalizedHpMargin: report.minNormalizedHpMargin,
      f9Purchases: report.purchaseLog.filter((entry) => entry.floor === 9).length
    }))
  }, null, 2));
  process.exit(1);
}

assert.ok(simpleReports.filter((report) => report.shopCycle[0] === 'hp').some((report) => !report.solvable));
const bossIds = new Set(simpleReports.flatMap((report) =>
  report.battleLog.filter((entry) => entry.boss || entry.finalBoss).map((entry) => entry.enemyId)
));
for (const bossId of ['palaceWarden', 'blackSealKeeper', 'voidCore']) assert.ok(bossIds.has(bossId));
assert.ok(simpleReports.filter((report) => report.solvable).every((report) =>
  report.purchaseLog.some((entry) => entry.floor === 9)
));

console.log('10-floor spatial-redesign hard-mode validation passed.');
console.log(JSON.stringify({
  contentId: DEMO_TEN_FLOOR_ID,
  mode: DEMO10_HARD_MODE_ID,
  progressionPriority,
  progressionGrammar,
  pressure: DEMO10_HARD_MODE_PRESSURE,
  expertDiagnostic,
  strategicBoundary: {
    testedSimpleBuilds: strategicBoundary.testedBuilds,
    solvableSimpleBuilds: strategicBoundary.solvableBuilds,
    failedSimpleBuilds: strategicBoundary.failedBuilds,
    allowedSolvableBuilds: [DEMO10_QUALITY_TARGETS.minSolvableBuilds, DEMO10_QUALITY_TARGETS.maxSolvableBuilds],
    f9ShopCoverage: strategicBoundary.f9ShopCoverage,
    violations: strategicBoundary.violations,
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