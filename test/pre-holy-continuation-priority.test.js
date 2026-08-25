import test from 'node:test';
import assert from 'node:assert/strict';
import { preHolyContinuationPriority } from '../src/solver/pre-holy-stage-adapter.js';

function state({ floor, cores = 5, hp = 1000, atk = 104, def = 100, gold = 2800 } = {}) {
  return { floor, cores, stats: { hp, maxHp: 9500, atk, def, gold } };
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
