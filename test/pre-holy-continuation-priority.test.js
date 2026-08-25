import test from 'node:test';
import assert from 'node:assert/strict';
import {
  preHolyContinuationPriority,
  relaxedBossDamageNeed
} from '../src/solver/pre-holy-stage-adapter.js';

function state({ floor, cores = 5, hp = 1000, atk = 104, def = 100, gold = 2800 } = {}) {
  return { floor, cores, stats: { hp, maxHp: 9500, atk, def, gold } };
}

function engineState(map, {
  x = 1,
  y = 1,
  hp = 5000,
  atk = 170,
  def = 170
} = {}) {
  return {
    floor: 0,
    x,
    y,
    stats: { hp, maxHp: hp, atk, def, gold: 0 },
    relics: { ward: false },
    floorStates: [{ map }]
  };
}

test('core5 preparation priority is floor-neutral for equal resources', () => {
  const f6 = state({ floor: 5 });
  const f2 = state({ floor: 1 });
  const p6 = preHolyContinuationPriority(f6, { targetCores: 6, basePriority: 9e12 });
  const p2 = preHolyContinuationPriority(f2, { targetCores: 6, basePriority: 1e12 });
  assert.equal(p6, p2);
});

test('core5 preparation priority rewards resource improvement instead of floor height', () => {
  const baseline = preHolyContinuationPriority(state({ floor: 5 }), { targetCores: 6 });
  const moreGold = preHolyContinuationPriority(state({ floor: 1, gold: 3000 }), { targetCores: 6 });
  const moreHp = preHolyContinuationPriority(state({ floor: 1, hp: 1900 }), { targetCores: 6 });
  const moreAtk = preHolyContinuationPriority(state({ floor: 1, atk: 109 }), { targetCores: 6 });
  assert.ok(moreGold > baseline);
  assert.ok(moreHp > baseline);
  assert.ok(moreAtk > baseline);
});

test('states outside the core5 preparation stage retain base priority', () => {
  const basePriority = 123456;
  const value = preHolyContinuationPriority(state({ floor: 5, cores: 6 }), {
    targetCores: 6,
    basePriority
  });
  assert.equal(value, basePriority);
});

test('relaxed damage-to-boss includes fixed damage from corridor enemies and boss', () => {
  const direct = [
    ['#', '#', '#', '#'],
    ['#', '.', 'enemy:astralBoss', '#'],
    ['#', '#', '#', '#']
  ];
  const withMote = [
    ['#', '#', '#', '#', '#'],
    ['#', '.', 'enemy:mote', 'enemy:astralBoss', '#'],
    ['#', '#', '#', '#', '#']
  ];
  const bossOnly = relaxedBossDamageNeed(engineState(direct));
  const corridor = relaxedBossDamageNeed(engineState(withMote));
  assert.ok(Number.isFinite(bossOnly));
  assert.ok(Number.isFinite(corridor));
  assert.ok(corridor >= bossOnly);
});

test('relaxed damage-to-boss prefers a zero-damage detour around a damaging enemy', () => {
  const map = [
    ['#', '#', '#', '#', '#'],
    ['#', '.', 'enemy:catMage', 'enemy:astralBoss', '#'],
    ['#', '.', '.', '.', '#'],
    ['#', '#', '#', '#', '#']
  ];
  const need = relaxedBossDamageNeed(engineState(map));
  const bossOnly = relaxedBossDamageNeed(engineState([
    ['#', '#', '#', '#'],
    ['#', '.', 'enemy:astralBoss', '#'],
    ['#', '#', '#', '#']
  ]));
  assert.equal(need, bossOnly);
});

test('Holy remains impassable in the no-Holy relaxed damage graph', () => {
  const map = [
    ['#', '#', '#', '#', '#'],
    ['#', '.', 'item:holy', 'enemy:astralBoss', '#'],
    ['#', '#', '#', '#', '#']
  ];
  assert.equal(relaxedBossDamageNeed(engineState(map)), Number.POSITIVE_INFINITY);
});

test('a relaxed boss-ready F6 state outranks an otherwise identical deficit state', () => {
  const base = state({ floor: 5, hp: 2000 });
  const deficit = preHolyContinuationPriority(base, {
    targetCores: 6,
    targetFloor: 5,
    relaxedDamageNeed: 2300,
    sequenceProgress: 0
  });
  const ready = preHolyContinuationPriority(base, {
    targetCores: 6,
    targetFloor: 5,
    relaxedDamageNeed: 1800,
    sequenceProgress: 0
  });
  assert.ok(ready > deficit);
});
