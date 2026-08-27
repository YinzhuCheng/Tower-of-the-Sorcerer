import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMIES } from '../src/game/data.js';
import { calculateBattle } from '../src/game/engine.js';
import {
  integerMinimumCostForValue,
  previewDiscreteHarvestAndPureHpAccessTightening
} from '../src/solver/discrete-harvest-bound-preview.js';

test('integer harvest does not allow fractional enemy kills', () => {
  const offers = [
    { value: 10, cost: 0 },
    { value: 10, cost: 10 }
  ];
  assert.equal(integerMinimumCostForValue(offers, 10), 0);
  assert.equal(integerMinimumCostForValue(offers, 15), 10);
  assert.equal(integerMinimumCostForValue(offers, 20), 10);
});

test('integer harvest reports infinity when relaxed harvest Gold is insufficient', () => {
  assert.equal(integerMinimumCostForValue([{ value: 10, cost: 0 }], 11), Number.POSITIVE_INFINITY);
});

test('combined preview uses full enemy cost and does not double count HP access combat', () => {
  const eclipse = ENEMIES.eclipseMage;
  const damage = calculateBattle(
    { hp: Number.MAX_SAFE_INTEGER, atk: 224, def: 190 },
    eclipse,
    { ward: true }
  ).totalDamage;
  const value = eclipse.gold * 2 + (eclipse.reward?.gold ?? 0);
  const materialized = {
    floorStates: [{
      map: [
        ['#', '#', '#', '#', '#'],
        ['#', 'D', 'enemy:eclipseMage', 'item:hpLarge', '#'],
        ['#', '#', '#', '#', '#']
      ]
    }]
  };
  const fractional = damage / 2;
  const report = previewDiscreteHarvestAndPureHpAccessTightening({
    adapter: { materializeState: () => structuredClone(materialized) },
    state: {},
    boundExplanation: {
      exactMatch: true,
      explainedUpperBound: 1000 - fractional,
      relaxation: {
        maxHarvestAtk: 224,
        maxHarvestDef: 190,
        wardAvailable: true,
        luckyMultiplier: 2,
        holyMultiplier: 1
      },
      scenarios: [{
        purchaseCount: 1,
        requiredEnemyGold: Math.max(1, Math.floor(value / 2)),
        fractionalHarvestDamage: fractional,
        upperBound: 1000 - fractional
      }]
    },
    floorId: 0
  });
  assert.equal(report.best.discreteHarvestDamage, damage);
  assert.equal(report.best.accessAdditionalPenalty, 0, 'same eclipse combat already covers item access');
  assert.equal(report.previewUpperBound, 1000 - damage);
});

test('zero-damage Gold remains zero-cost in the integer relaxation', () => {
  const offers = [
    { value: 100, cost: 0 },
    { value: 50, cost: 20 }
  ];
  assert.equal(integerMinimumCostForValue(offers, 80), 0);
  assert.equal(integerMinimumCostForValue(offers, 120), 20);
});
