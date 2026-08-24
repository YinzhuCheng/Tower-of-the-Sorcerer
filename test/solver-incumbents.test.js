import test from 'node:test';
import assert from 'node:assert/strict';
import { HOLY_POLICIES, runGreedyShopStrategy } from '../src/solver/greedy-strategy.js';
import {
  DEFAULT_INCUMBENT_STRATEGIES,
  GREEDY_INCUMBENT_WITNESS_TYPE,
  findBestGreedyIncumbent,
  verifyGreedyIncumbentWitness
} from '../src/solver/tower-incumbent.js';

const CASES = [
  { name: 'def-atk-hp', cycle: ['def', 'atk', 'hp'], hp: 12536, maxHp: 36910, atk: 209, def: 215 },
  { name: 'def-hp-atk', cycle: ['def', 'hp', 'atk'], hp: 12508, maxHp: 36910, atk: 209, def: 215 },
  { name: 'atk-def-hp', cycle: ['atk', 'def', 'hp'], hp: 10520, maxHp: 36910, atk: 209, def: 215 },
  { name: 'atk-hp-def', cycle: ['atk', 'hp', 'def'], hp: 10220, maxHp: 36910, atk: 209, def: 215 },
  { name: 'hp-def-atk', cycle: ['hp', 'def', 'atk'], hp: 8247, maxHp: 37810, atk: 209, def: 215 },
  { name: 'hp-atk-def', cycle: ['hp', 'atk', 'def'], hp: 7975, maxHp: 37810, atk: 209, def: 215 },
  { name: 'all-atk', cycle: ['atk'], hp: 3763, maxHp: 27010, atk: 309, def: 165 },
  { name: 'all-def', cycle: ['def'], hp: 3665, maxHp: 27010, atk: 159, def: 315 }
];

for (const scenario of CASES) {
  test(`authoritative engine confirms immediate-Holy ${scenario.name} incumbent`, () => {
    const result = runGreedyShopStrategy({ shopCycle: scenario.cycle, holyPolicy: 'immediate' });
    assert.equal(result.solvable, true, result.failure ?? scenario.name);
    assert.equal(result.purchases, 30);
    assert.equal(result.cores, 7);
    assert.deepEqual(result.final, {
      hp: scenario.hp,
      maxHp: scenario.maxHp,
      atk: scenario.atk,
      def: scenario.def,
      gold: result.final.gold
    });
    console.log(`TOWER_INCUMBENT ${scenario.name} holy=immediate hp=${result.final.hp} gold=${result.final.gold} purchases=${JSON.stringify(result.purchaseCounts)}`);
  });
}

test('all-HP immediate-Holy greedy strategy is rejected before the endgame', () => {
  const result = runGreedyShopStrategy({ shopCycle: ['hp'], holyPolicy: 'immediate' });
  assert.equal(result.solvable, false);
  assert.ok(result.floor < 8);
  assert.match(result.failure ?? '', /No reachable progress action|守护者|阵眼/);
  console.log(`TOWER_INCUMBENT all-hp holy=immediate FAIL floor=${result.floor} hp=${result.final.hp} atk=${result.final.atk} def=${result.final.def}`);
});

test('incumbent portfolio scans shop order and Holy timing', () => {
  const portfolio = findBestGreedyIncumbent();
  assert.equal(DEFAULT_INCUMBENT_STRATEGIES.length, 9 * HOLY_POLICIES.length);
  assert.equal(portfolio.attemptedCount, DEFAULT_INCUMBENT_STRATEGIES.length);
  assert.ok(portfolio.feasibleCount >= 8);
  assert.ok(portfolio.best.result.final.hp >= 12_536);
  assert.equal(portfolio.best.witness.type, GREEDY_INCUMBENT_WITNESS_TYPE);
  assert.ok(HOLY_POLICIES.includes(portfolio.best.witness.holyPolicy));
  console.log(`TOWER_PORTFOLIO_BEST id=${portfolio.best.id} holy=${portfolio.best.holyPolicy} hp=${portfolio.best.result.final.hp} acquisition=${JSON.stringify(portfolio.best.result.holyAcquisition)}`);
});

test('greedy incumbent witness is re-executed by the authoritative engine', () => {
  const portfolio = findBestGreedyIncumbent();
  const verification = verifyGreedyIncumbentWitness(portfolio.best.witness);
  assert.equal(verification.ok, true);
  assert.equal(verification.value, portfolio.best.result.final.hp);
  assert.equal(verification.objectiveType, 'terminal_hp');
  assert.equal(verification.summary.cores, 7);
  assert.equal(verification.summary.purchases, portfolio.best.result.purchases);
  assert.equal(verification.summary.holyPolicy, portfolio.best.holyPolicy);

  const invalid = verifyGreedyIncumbentWitness({
    type: GREEDY_INCUMBENT_WITNESS_TYPE,
    strategyId: 'all-hp',
    shopCycle: ['hp'],
    holyPolicy: 'immediate'
  });
  assert.equal(invalid.ok, false);
});
