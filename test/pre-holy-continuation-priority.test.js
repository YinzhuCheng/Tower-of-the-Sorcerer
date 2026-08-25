import test from 'node:test';
import assert from 'node:assert/strict';
import {
  preHolyContinuationPriority,
  relaxedBossBarrierDistance
} from '../src/solver/pre-holy-stage-adapter.js';

function state({ floor, cores = 5, hp = 1000, atk = 104, def = 100, gold = 2800 } = {}) {
  return { floor, cores, stats: { hp, maxHp: 9500, atk, def, gold } };
}

function engineState(map, { x = 1, y = 1 } = {}) {
  return {
    floor: 0,
    x,
    y,
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

test('relaxed boss barrier distance counts unresolved enemy/door blockers but not the boss', () => {
  const map = [
    ['#', '#', '#', '#', '#'],
    ['#', '.', 'enemy:guard', 'enemy:astralBoss', '#'],
    ['#', '#', '#', '#', '#']
  ];
  assert.equal(relaxedBossBarrierDistance(engineState(map)), 1);
});

test('relaxed boss barrier distance prefers a free detour over blocker crossings', () => {
  const map = [
    ['#', '#', '#', '#', '#'],
    ['#', '.', 'door:moon', 'enemy:astralBoss', '#'],
    ['#', '.', '.', '.', '#'],
    ['#', '#', '#', '#', '#']
  ];
  assert.equal(relaxedBossBarrierDistance(engineState(map)), 0);
});

test('Holy remains impassable in the no-Holy relaxed topology', () => {
  const map = [
    ['#', '#', '#', '#', '#'],
    ['#', '.', 'item:holy', 'enemy:astralBoss', '#'],
    ['#', '#', '#', '#', '#']
  ];
  assert.equal(relaxedBossBarrierDistance(engineState(map)), Number.POSITIVE_INFINITY);
});

test('F6 topology progress can outrank an otherwise identical farther state', () => {
  const base = state({ floor: 5 });
  const farther = preHolyContinuationPriority(base, {
    targetCores: 6,
    targetFloor: 5,
    bossBarrierDistance: 4,
    sequenceProgress: 0
  });
  const nearer = preHolyContinuationPriority(base, {
    targetCores: 6,
    targetFloor: 5,
    bossBarrierDistance: 2,
    sequenceProgress: 1
  });
  assert.ok(nearer > farther);
});
