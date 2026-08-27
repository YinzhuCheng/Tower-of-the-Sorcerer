import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMIES } from '../src/game/data.js';
import { calculateBattle } from '../src/game/engine.js';
import {
  previewPureHpAccessTightening,
  relaxedFloorAccessDamageLowerBound
} from '../src/solver/relaxed-pure-hp-access-bound.js';

test('relaxed access lower bound preserves walls and charges optimistic enemy damage', () => {
  const materialized = {
    floorStates: [{
      map: [
        ['#', '#', '#', '#', '#'],
        ['#', 'D', 'enemy:eclipseMage', 'item:hpLarge', '#'],
        ['#', '#', '#', '#', '#']
      ]
    }]
  };
  const expected = calculateBattle(
    { hp: Number.MAX_SAFE_INTEGER, atk: 224, def: 190 },
    ENEMIES.eclipseMage,
    { ward: true }
  ).totalDamage;
  assert.equal(relaxedFloorAccessDamageLowerBound({
    materialized,
    floorId: 0,
    targetX: 3,
    targetY: 1,
    atk: 224,
    def: 190,
    wardAvailable: true
  }), expected);
});

test('relaxed access graph makes doors and non-enemy mechanics free transit', () => {
  const materialized = {
    floorStates: [{
      map: [
        ['#', '#', '#', '#', '#', '#'],
        ['#', 'D', 'door:star', 'gate:any', 'item:hpLarge', '#'],
        ['#', '#', '#', '#', '#', '#']
      ]
    }]
  };
  assert.equal(relaxedFloorAccessDamageLowerBound({
    materialized,
    floorId: 0,
    targetX: 4,
    targetY: 1,
    atk: 100,
    def: 100,
    wardAvailable: false
  }), 0);
});

test('pure-HP access preview subtracts only damage beyond the existing harvest lower bound', () => {
  const materialized = {
    floorStates: [{
      map: [
        ['#', '#', '#', '#', '#'],
        ['#', 'D', 'enemy:eclipseMage', 'item:hpLarge', '#'],
        ['#', '#', '#', '#', '#']
      ]
    }]
  };
  const adapter = { materializeState: () => structuredClone(materialized) };
  const accessDamage = calculateBattle(
    { hp: Number.MAX_SAFE_INTEGER, atk: 224, def: 190 },
    ENEMIES.eclipseMage,
    { ward: true }
  ).totalDamage;
  const report = previewPureHpAccessTightening({
    adapter,
    state: {},
    boundExplanation: {
      exactMatch: true,
      explainedUpperBound: 4930,
      relaxation: { maxHarvestAtk: 224, maxHarvestDef: 190, wardAvailable: true, holyMultiplier: 1 },
      scenarios: [
        { purchaseCount: 7, fractionalHarvestDamage: 0, upperBound: 4930 },
        { purchaseCount: 8, fractionalHarvestDamage: 100, upperBound: 4800 }
      ]
    },
    floorId: 0
  });
  assert.equal(report.items.length, 1);
  assert.equal(report.scenarios.find((entry) => entry.purchaseCount === 7).additionalPenalty, Math.min(850, accessDamage));
  assert.equal(
    report.scenarios.find((entry) => entry.purchaseCount === 8).additionalPenalty,
    Math.min(850, Math.max(0, accessDamage - 100))
  );
  assert.ok(report.previewUpperBound <= report.oldUpperBound);
});

test('pure-HP access preview does not double count when harvest already covers access', () => {
  const materialized = {
    floorStates: [{
      map: [
        ['#', '#', '#', '#', '#'],
        ['#', 'D', 'enemy:eclipseMage', 'item:hpLarge', '#'],
        ['#', '#', '#', '#', '#']
      ]
    }]
  };
  const accessDamage = calculateBattle(
    { hp: Number.MAX_SAFE_INTEGER, atk: 224, def: 190 },
    ENEMIES.eclipseMage,
    { ward: true }
  ).totalDamage;
  const report = previewPureHpAccessTightening({
    adapter: { materializeState: () => structuredClone(materialized) },
    state: {},
    boundExplanation: {
      exactMatch: true,
      explainedUpperBound: 4700,
      relaxation: { maxHarvestAtk: 224, maxHarvestDef: 190, wardAvailable: true, holyMultiplier: 1 },
      scenarios: [{ purchaseCount: 7, fractionalHarvestDamage: accessDamage + 10, upperBound: 4700 }]
    },
    floorId: 0
  });
  assert.equal(report.tightening, 0);
  assert.equal(report.previewUpperBound, 4700);
});
