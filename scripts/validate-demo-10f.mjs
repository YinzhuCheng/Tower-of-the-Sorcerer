import assert from 'node:assert/strict';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent, DEMO_TEN_FLOOR_ID } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorHardMode, DEMO10_HARD_MODE_ID, DEMO10_HARD_MODE_PRESSURE } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTenFloorProgressionGrammar, DEMO10_FINAL_SUN_SEAL_ID } from '../src/game/demo-10-floor-progression.js';
import { DEMO10_EXPERT_TARGETS, DEMO10_QUALITY_TARGETS, DEMO10_SIMPLE_BUILD_PORTFOLIO, summarizeDemoTenFloorPortfolio } from '../src/game/demo-10-floor-quality.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
const progressionGrammar = applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorHardMode({ enemies: ENEMIES });

const { runGreedyShopStrategy } = await import('../src/solver/greedy-strategy.js');
const { runExpertNoHpStrategy, EXPERT_NO_HP_STRATEGY_ID } = await import('../src/solver/expert-strategy.js');

assert.equal(FLOORS.length, 10);
assert.equal(FLOORS[9].demoContentId, DEMO_TEN_FLOOR_ID);
assert.equal(FLOORS[9].boss, 'voidCore');
assert.equal(progressionGrammar.supply.sun, 1);
assert.ok(progressionGrammar.uniqueSunLocation);
assert.equal(DEMO10_FINAL_SUN_SEAL_ID, 'throneSeal');
assert.ok(progressionGrammar.throneSeal.sealTiles.length >= 2);
assert.deepEqual(FLOORS[9].puzzles?.cardGates?.[DEMO10_FINAL_SUN_SEAL_ID], { sun: 1 });
assert.equal(ENEMIES.palaceWarden.magicPower, DEMO10_HARD_MODE_PRESSURE.palaceWardenMagicPower);
assert.equal(ENEMIES.blackSealKeeper.magicPower, DEMO10_HARD_MODE_PRESSURE.blackSealKeeperMagicPower);
assert.equal(ENEMIES.blackSealKeeper.def, DEMO10_HARD_MODE_PRESSURE.blackSealKeeperDef);
assert.equal(Object.values(ENEMIES).reduce((sum, enemy) => sum + Number(enemy?.reward?.core ?? 0), 0), 7);

const expertReport = runExpertNoHpStrategy({ holyPolicy: 'immediate', maxIterations: 8_000, horizon: 2, attackAdvantageRequired: 2_000 });
const expertQuality = summarizeDemoTenFloorPortfolio([expertReport], DEMO10_EXPERT_TARGETS);
if (expertQuality.violations.length) {
  console.error('DEMO10_EXPERT_HARD_MODE_GATE_FAILED');
  console.error(JSON.stringify({ violations: expertQuality.violations, progressionGrammar, pressure: DEMO10_HARD_MODE_PRESSURE, expert: { solvable: expertReport.solvable, floor: expertReport.floor, failure: expertReport.failure, cores: expertReport.cores, purchases: expertReport.purchases, purchaseCounts: expertReport.purchaseCounts, shopPlan: expertReport.planning?.shopPlan, cards: expertReport.cards, final: expertReport.final, minNormalizedHpMargin: expertReport.minNormalizedHpMargin }, lateFloors: expertQuality.lateFloors }, null, 2));
  process.exit(1);
}
assert.equal(expertReport.strategyId, EXPERT_NO_HP_STRATEGY_ID);
assert.equal(expertReport.solvable, true);
assert.equal(expertReport.floor, 10);
assert.equal(expertReport.cores, 7);
assert.equal(expertReport.purchaseCounts.hp, 0);
assert.ok(expertReport.purchaseCounts.def > 0);
assert.ok(expertReport.purchaseCounts.atk > 0);
assert.ok(expertReport.purchaseLog.every((entry) => entry.optionId !== 'hp'));
const bossIds = new Set(expertReport.battleLog.filter((entry) => entry.boss || entry.finalBoss).map((entry) => entry.enemyId));
for (const bossId of ['palaceWarden', 'blackSealKeeper', 'voidCore']) assert.ok(bossIds.has(bossId));
assert.ok(expertReport.purchaseLog.some((entry) => entry.floor === 9));

const simpleReports = DEMO10_SIMPLE_BUILD_PORTFOLIO.map((shopCycle) => runGreedyShopStrategy({ shopCycle, holyPolicy: 'immediate', maxIterations: 8_000 }));
const strategicBoundary = summarizeDemoTenFloorPortfolio(simpleReports, DEMO10_QUALITY_TARGETS);
if (strategicBoundary.violations.length) {
  console.error('DEMO10_STRATEGIC_BOUNDARY_GATE_FAILED');
  console.error(JSON.stringify({ violations: strategicBoundary.violations, progressionGrammar, attempts: simpleReports.map((report) => ({ shopCycle: report.shopCycle, solvable: report.solvable, floor: report.floor, failure: report.failure, cards: report.cards, cores: report.cores, final: report.final, minNormalizedHpMargin: report.minNormalizedHpMargin })) }, null, 2));
  process.exit(1);
}
assert.ok(simpleReports.filter((report) => report.shopCycle[0] === 'hp').some((report) => !report.solvable));

console.log('10-floor hard-mode expert validation passed.');
console.log(JSON.stringify({ contentId: DEMO_TEN_FLOOR_ID, mode: DEMO10_HARD_MODE_ID, progressionGrammar, pressure: DEMO10_HARD_MODE_PRESSURE, expertGate: { strategyId: expertReport.strategyId, shopHpAllowed: false, solvable: expertReport.solvable, terminalHp: expertReport.final.hp, atk: expertReport.final.atk, def: expertReport.final.def, purchases: expertReport.purchases, purchaseCounts: expertReport.purchaseCounts, shopPlan: expertReport.planning?.shopPlan, minNormalizedHpMargin: expertReport.minNormalizedHpMargin, f9Purchases: expertReport.purchaseLog.filter((entry) => entry.floor === 9).length, violations: expertQuality.violations }, strategicBoundary: { testedSimpleBuilds: strategicBoundary.testedBuilds, solvableSimpleBuilds: strategicBoundary.solvableBuilds, failedSimpleBuilds: strategicBoundary.failedBuilds, allowedSolvableBuilds: [DEMO10_QUALITY_TARGETS.minSolvableBuilds, DEMO10_QUALITY_TARGETS.maxSolvableBuilds], violations: strategicBoundary.violations, attempts: simpleReports.map((report) => ({ shopCycle: report.shopCycle.join('-'), solvable: report.solvable, floor: report.floor, terminalHp: report.final.hp, cards: report.cards, failure: report.failure })) } }, null, 2));
