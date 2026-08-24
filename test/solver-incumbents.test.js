import test from 'node:test';
import assert from 'node:assert/strict';
import { HOLY_POLICIES, runGreedyShopStrategy } from '../src/solver/greedy-strategy.js';
import {
  DEFAULT_INCUMBENT_STRATEGIES,
  GREEDY_INCUMBENT_WITNESS_TYPE,
  PROMOTED_PURCHASE_PLANS,
  findBestGreedyIncumbent,
  findBestKnownIncumbent,
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
  });
}

test('all-HP immediate-Holy greedy strategy is rejected before the endgame', () => {
  const result = runGreedyShopStrategy({ shopCycle: ['hp'], holyPolicy: 'immediate' });
  assert.equal(result.solvable, false);
  assert.ok(result.floor < 8);
  assert.match(result.failure ?? '', /No reachable progress action|守护者|阵眼/);
});

test('incumbent policy portfolio scans shop order and Holy timing', () => {
  const portfolio = findBestGreedyIncumbent();
  assert.equal(DEFAULT_INCUMBENT_STRATEGIES.length, 9 * HOLY_POLICIES.length);
  assert.equal(portfolio.attemptedCount, DEFAULT_INCUMBENT_STRATEGIES.length);
  assert.ok(portfolio.feasibleCount >= 8);
  assert.equal(portfolio.best.result.final.hp, 12_536);
  assert.equal(portfolio.best.witness.type, GREEDY_INCUMBENT_WITNESS_TYPE);
});

test('promoted purchase plan is the strongest reproducible known incumbent', () => {
  assert.equal(PROMOTED_PURCHASE_PLANS.length, 1);
  assert.equal(PROMOTED_PURCHASE_PLANS[0].expectedHp, 26_041);
  assert.equal(PROMOTED_PURCHASE_PLANS[0].shopPlan.length, 30);

  const known = findBestKnownIncumbent();
  assert.equal(known.best.id, 'purchase-1opt-v1');
  assert.equal(known.best.source, 'promoted-plan');
  assert.equal(known.best.result.solvable, true);
  assert.equal(known.best.result.final.hp, 26_041);
  assert.deepEqual(known.best.result.purchaseCounts, { atk: 1, def: 4, hp: 25 });

  const verification = verifyGreedyIncumbentWitness(known.best.witness);
  assert.equal(verification.ok, true);
  assert.equal(verification.value, 26_041);
  assert.equal(verification.summary.explicitShopPlan, true);
  assert.equal(verification.summary.shopPlanLength, 30);
});

test('unreplayable incumbent witness is rejected', () => {
  const invalid = verifyGreedyIncumbentWitness({
    type: GREEDY_INCUMBENT_WITNESS_TYPE,
    strategyId: 'all-hp',
    shopCycle: ['hp'],
    shopPlan: null,
    holyPolicy: 'immediate'
  });
  assert.equal(invalid.ok, false);
});
