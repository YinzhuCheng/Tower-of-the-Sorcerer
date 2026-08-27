import assert from 'node:assert/strict';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent, DEMO_TEN_FLOOR_ID } from '../src/game/demo-10-floor-content.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });

const { runGreedyShopStrategy } = await import('../src/solver/greedy-strategy.js');

assert.equal(FLOORS.length, 10, 'Demo must expose exactly ten floors.');
assert.equal(FLOORS[9].demoContentId, DEMO_TEN_FLOOR_ID);
assert.equal(FLOORS[9].number, 10);
assert.equal(FLOORS[9].boss, 'voidCore');
assert.equal(ENEMIES.finalQueen.floor, 10);
assert.equal(ENEMIES.voidCore.floor, 10);

const coreRewardCount = Object.values(ENEMIES)
  .reduce((sum, enemy) => sum + Number(enemy?.reward?.core ?? 0), 0);
assert.equal(coreRewardCount, 7, '10F demo must still use exactly seven recoverable magic cores.');

const policies = [
  ['def', 'atk', 'hp'],
  ['atk', 'def', 'hp'],
  ['def', 'hp', 'atk'],
  ['atk', 'hp', 'def']
];

const reports = policies.map((shopCycle) => runGreedyShopStrategy({
  shopCycle,
  holyPolicy: 'immediate',
  maxIterations: 8_000
}));
const solvableReports = reports
  .filter((report) => report.solvable)
  .sort((a, b) => b.final.hp - a.final.hp);
const winner = solvableReports[0] ?? null;

if (!winner || solvableReports.length < 3) {
  console.error('DEMO10_AUTOSOLVER_FAILED');
  console.error(JSON.stringify(reports.map((report) => ({
    shopCycle: report.shopCycle,
    solvable: report.solvable,
    floor: report.floor,
    failure: report.failure,
    cores: report.cores,
    purchases: report.purchases,
    final: report.final,
    minNormalizedHpMargin: report.minNormalizedHpMargin
  })), null, 2));
  process.exit(1);
}

assert.equal(winner.floor, 10, 'Winning witness must end on floor 10.');
assert.equal(winner.cores, 7, 'Winning witness must recover all seven magic cores.');
assert.ok(winner.final.hp > 0, 'Winning witness must retain positive HP.');
assert.ok(
  winner.minNormalizedHpMargin >= 0.15,
  `Best simple build is too brittle for a public demo: ${winner.minNormalizedHpMargin}`
);
assert.ok(
  winner.minNormalizedHpMargin <= 0.55,
  `Best simple build is too forgiving for the intended demo pressure: ${winner.minNormalizedHpMargin}`
);

const weakestWinner = solvableReports.at(-1);
const terminalHpSpread = winner.final.hp - weakestWinner.final.hp;

console.log('10-floor demo authoritative heuristic validation passed.');
console.log(JSON.stringify({
  contentId: DEMO_TEN_FLOOR_ID,
  floors: FLOORS.length,
  qualityGate: {
    testedSimpleBuilds: reports.length,
    solvableSimpleBuilds: solvableReports.length,
    requiredSolvableSimpleBuilds: 3,
    bestMarginBand: [0.15, 0.55],
    terminalHpSpread
  },
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
    failure: report.failure
  }))
}, null, 2));
