import assert from 'node:assert/strict';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent, DEMO_TEN_FLOOR_ID } from '../src/game/demo-10-floor-content.js';
import {
  DEMO10_QUALITY_TARGETS,
  DEMO10_SIMPLE_BUILD_PORTFOLIO,
  summarizeDemoTenFloorPortfolio
} from '../src/game/demo-10-floor-quality.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });

const { runGreedyShopStrategy } = await import('../src/solver/greedy-strategy.js');

assert.equal(FLOORS.length, 10, 'Demo must expose exactly ten floors.');
assert.equal(FLOORS[9].demoContentId, DEMO_TEN_FLOOR_ID);
assert.equal(FLOORS[9].number, 10);
assert.equal(FLOORS[9].boss, 'voidCore');
assert.equal(ENEMIES.finalQueen.floor, 10);
assert.equal(ENEMIES.voidCore.floor, 10);
assert.equal(ENEMIES.palaceWarden.magicPower, 240, 'F8 pressure must match the tuned 10F v1 candidate.');
assert.equal(ENEMIES.blackSealKeeper.magicPower, 270, 'F9 pressure must match the tuned 10F v1 candidate.');

const coreRewardCount = Object.values(ENEMIES)
  .reduce((sum, enemy) => sum + Number(enemy?.reward?.core ?? 0), 0);
assert.equal(coreRewardCount, 7, '10F demo must still use exactly seven recoverable magic cores.');

const reports = DEMO10_SIMPLE_BUILD_PORTFOLIO.map((shopCycle) => runGreedyShopStrategy({
  shopCycle,
  holyPolicy: 'immediate',
  maxIterations: 8_000
}));
const quality = summarizeDemoTenFloorPortfolio(reports);
const winner = quality.winner;

if (quality.violations.length > 0) {
  console.error('DEMO10_QUALITY_GATE_FAILED');
  console.error(JSON.stringify({
    violations: quality.violations,
    targets: DEMO10_QUALITY_TARGETS,
    solvableBuilds: quality.solvableBuilds,
    terminalHpSpread: quality.terminalHpSpread,
    f9ShopCoverage: quality.f9ShopCoverage,
    lateFloors: quality.lateFloors,
    attempts: reports.map((report) => ({
      shopCycle: report.shopCycle,
      solvable: report.solvable,
      floor: report.floor,
      failure: report.failure,
      cores: report.cores,
      purchases: report.purchases,
      final: report.final,
      minNormalizedHpMargin: report.minNormalizedHpMargin
    }))
  }, null, 2));
  process.exit(1);
}

assert.ok(winner, '10F quality gate must retain a winning witness.');
assert.equal(winner.floor, 10, 'Winning witness must end on floor 10.');
assert.equal(winner.cores, 7, 'Winning witness must recover all seven magic cores.');
assert.equal(winner.victory, true, 'Winning witness must defeat the final Queen/core sequence authoritatively.');
assert.ok(winner.final.hp > 0, 'Winning witness must retain positive HP.');

for (const report of reports.filter((candidate) => candidate.solvable)) {
  const bossIds = new Set(report.battleLog.filter((entry) => entry.boss || entry.finalBoss).map((entry) => entry.enemyId));
  assert.ok(bossIds.has('palaceWarden'), `${report.shopCycle.join('-')} must defeat the F8 palace Warden.`);
  assert.ok(bossIds.has('blackSealKeeper'), `${report.shopCycle.join('-')} must defeat the F9 black-seal Keeper.`);
  assert.ok(bossIds.has('voidCore'), `${report.shopCycle.join('-')} must defeat the F10 void Core.`);
  assert.ok(
    report.purchaseLog.some((entry) => entry.floor === 9),
    `${report.shopCycle.join('-')} must convert late Gold at the F9 shop.`
  );
}

console.log('10-floor demo six-build quality validation passed.');
console.log(JSON.stringify({
  contentId: DEMO_TEN_FLOOR_ID,
  floors: FLOORS.length,
  tunedBossPressure: {
    floor8PalaceWardenMagic: ENEMIES.palaceWarden.magicPower,
    floor9BlackSealKeeperMagic: ENEMIES.blackSealKeeper.magicPower
  },
  qualityGate: {
    testedSimpleBuilds: quality.testedBuilds,
    solvableSimpleBuilds: quality.solvableBuilds,
    failedSimpleBuilds: quality.failedBuilds,
    allowedSolvableBuilds: [DEMO10_QUALITY_TARGETS.minSolvableBuilds, DEMO10_QUALITY_TARGETS.maxSolvableBuilds],
    bestMarginBand: [DEMO10_QUALITY_TARGETS.bestBuildMarginMin, DEMO10_QUALITY_TARGETS.bestBuildMarginMax],
    weakestWinningMarginMin: DEMO10_QUALITY_TARGETS.weakestWinningMarginMin,
    terminalHpSpread: quality.terminalHpSpread,
    f9ShopCoverage: quality.f9ShopCoverage,
    violations: quality.violations
  },
  checkpointPressure: Object.fromEntries(Object.entries(quality.lateFloors).map(([floor, profile]) => [floor, {
    buildsWithBattles: profile.buildsWithBattles,
    buildsWithBossBattle: profile.buildsWithBossBattle,
    buildsWithPurchases: profile.buildsWithPurchases,
    minMargin: profile.minMargin,
    meanMinMargin: profile.meanMinMargin,
    bossMinMargin: profile.bossMinMargin,
    meanBossMinMargin: profile.meanBossMinMargin,
    totalDamageRange: profile.totalDamageRange,
    purchaseCountRange: profile.purchaseCountRange
  }])),
  winner: {
    shopCycle: winner.shopCycle,
    terminalHp: winner.final.hp,
    maxHp: winner.final.maxHp,
    atk: winner.final.atk,
    def: winner.final.def,
    gold: winner.final.gold,
    purchases: winner.purchases,
    battles: winner.battles,
    turns: winner.turns,
    minNormalizedHpMargin: winner.minNormalizedHpMargin
  },
  attempts: reports.map((report) => ({
    shopCycle: report.shopCycle,
    solvable: report.solvable,
    floor: report.floor,
    cores: report.cores,
    terminalHp: report.final.hp,
    minNormalizedHpMargin: report.minNormalizedHpMargin,
    f9Purchases: report.purchaseLog.filter((entry) => entry.floor === 9).length,
    failure: report.failure
  }))
}, null, 2));
