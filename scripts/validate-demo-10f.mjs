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
const winner = reports
  .filter((report) => report.solvable)
  .sort((a, b) => b.final.hp - a.final.hp)[0] ?? null;

if (!winner) {
  console.error('DEMO10_AUTOSOLVER_FAILED');
  console.error(JSON.stringify(reports.map((report) => ({
    shopCycle: report.shopCycle,
    floor: report.floor,
    failure: report.failure,
    cores: report.cores,
    purchases: report.purchases,
    final: report.final
  })), null, 2));
  process.exit(1);
}

assert.equal(winner.floor, 10, 'Winning witness must end on floor 10.');
assert.equal(winner.cores, 7, 'Winning witness must recover all seven magic cores.');
assert.ok(winner.final.hp > 0, 'Winning witness must retain positive HP.');

console.log('10-floor demo authoritative heuristic validation passed.');
console.log(JSON.stringify({
  contentId: DEMO_TEN_FLOOR_ID,
  floors: FLOORS.length,
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
    failure: report.failure
  }))
}, null, 2));
