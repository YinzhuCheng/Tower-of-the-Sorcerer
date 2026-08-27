import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createLateGameThresholdPriorityAdapter,
  lateGameThresholdSuffixPriority
} from '../src/solver/late-game-threshold-priority-adapter.js';

function state({
  floor = 7,
  cores = 7,
  upper = 5_049,
  shopPurchases = 20,
  gold = 1_304,
  hp = 3_881,
  atk = 206,
  def = 168
} = {}) {
  return {
    floor,
    cores,
    upper,
    shopPurchases,
    stats: { hp, maxHp: 23_590, atk, def, gold },
    floorMeta: Array.from({ length: 8 }, () => ({
      switches: [],
      sequenceProgress: 0,
      bossDefeated: false
    }))
  };
}

function baseAdapter() {
  return {
    enumerateActions: () => [{ kind: 'teleport', targetFloor: 0 }],
    applyAction: (_state, action) => ({ ok: true, state: _state, steps: [{ action }] }),
    objectiveUpperBound: (value) => value.upper,
    priority: () => 123,
    rulesVersion: () => 'base-v1'
  };
}

test('late-game threshold priority is queue-order-only and preserves actions', () => {
  const base = baseAdapter();
  const adapter = createLateGameThresholdPriorityAdapter({
    baseAdapter: base,
    threshold: 4_578,
    minCores: 7,
    slackBucket: 25
  });
  const sample = state();

  assert.deepEqual(adapter.enumerateActions(sample), base.enumerateActions(sample));
  assert.equal(adapter.applyAction, base.applyAction);
  assert.equal(adapter.lateGameThresholdPriority.correctnessRole, 'queue-order-only');
  assert.match(adapter.rulesVersion(), /late-game-threshold-priority-v1/);
});

test('within one slack corridor, terminal-floor progress outranks pure old-floor travel', () => {
  const base = baseAdapter();
  const target = state({ floor: 7, upper: 5_049 });
  const oldFloor = state({ floor: 2, upper: 5_049 });

  const targetPriority = lateGameThresholdSuffixPriority(target, {
    baseAdapter: base,
    threshold: 4_578,
    minCores: 7,
    slackBucket: 25
  });
  const oldPriority = lateGameThresholdSuffixPriority(oldFloor, {
    baseAdapter: base,
    threshold: 4_578,
    minCores: 7,
    slackBucket: 25
  });

  assert.ok(targetPriority > oldPriority);
});

test('shop affordability can rescue a productive old-floor recovery from the travel penalty', () => {
  const base = baseAdapter();
  const shopReadyOldFloor = state({ floor: 3, upper: 5_049, gold: 1_304, shopPurchases: 20 });
  const targetButNotAffordable = state({ floor: 7, upper: 5_049, gold: 0, shopPurchases: 20 });

  const oldPriority = lateGameThresholdSuffixPriority(shopReadyOldFloor, {
    baseAdapter: base,
    threshold: 4_578,
    minCores: 7,
    slackBucket: 25
  });
  const targetPriority = lateGameThresholdSuffixPriority(targetButNotAffordable, {
    baseAdapter: base,
    threshold: 4_578,
    minCores: 7,
    slackBucket: 25
  });

  assert.ok(oldPriority > targetPriority);
});

test('a stronger upper-bound slack corridor remains the first ordering tier', () => {
  const base = baseAdapter();
  const higherSlackOldFloor = state({ floor: 1, upper: 5_080, gold: 0 });
  const lowerSlackTarget = state({ floor: 7, upper: 5_049, gold: 0 });

  const highPriority = lateGameThresholdSuffixPriority(higherSlackOldFloor, {
    baseAdapter: base,
    threshold: 4_578,
    minCores: 7,
    slackBucket: 25
  });
  const lowPriority = lateGameThresholdSuffixPriority(lowerSlackTarget, {
    baseAdapter: base,
    threshold: 4_578,
    minCores: 7,
    slackBucket: 25
  });

  assert.ok(highPriority > lowPriority);
});
