import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canonicalizePreHolyReturnTravel,
  preHolyContinuationPriority
} from '../src/solver/pre-holy-stage-adapter.js';

function state({ floor, cores = 5, hp = 1000, atk = 104, def = 100, gold = 2800 } = {}) {
  return {
    floor,
    cores,
    stats: { hp, maxHp: 9500, atk, def, gold },
    relics: { compass: true },
    visitedFloors: [0, 1, 2, 3, 4, 5]
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

test('pre-Holy return travel replaces upward U with one legal target-floor teleport', () => {
  const actions = [
    { kind: 'tile', token: 'U', eventId: 'u' },
    { kind: 'teleport', targetFloor: 0, eventId: 'down-f1' },
    { kind: 'shop', optionId: 'hp', eventId: 'shop' }
  ];
  const canonical = canonicalizePreHolyReturnTravel(state({ floor: 1 }), actions, { targetFloor: 5 });
  assert.equal(canonical.some((action) => action.kind === 'tile' && action.token === 'U'), false);
  assert.equal(canonical.some((action) => action.kind === 'teleport' && action.targetFloor === 0), true);
  assert.equal(canonical.some((action) => action.kind === 'shop'), true);
  const returns = canonical.filter((action) => action.kind === 'teleport' && action.targetFloor === 5);
  assert.equal(returns.length, 1);
});

test('pre-Holy direct return is not invented without compass or target visitation', () => {
  const actions = [{ kind: 'tile', token: 'U', eventId: 'u' }];
  const noCompass = { ...state({ floor: 1 }), relics: { compass: false } };
  assert.deepEqual(canonicalizePreHolyReturnTravel(noCompass, actions, { targetFloor: 5 }), actions);

  const unvisited = { ...state({ floor: 1 }), visitedFloors: [0, 1, 2] };
  assert.deepEqual(canonicalizePreHolyReturnTravel(unvisited, actions, { targetFloor: 5 }), actions);
});
