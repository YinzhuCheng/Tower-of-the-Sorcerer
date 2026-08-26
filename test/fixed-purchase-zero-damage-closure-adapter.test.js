import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createFixedPurchaseZeroDamageClosureAdapter,
  isProvablyMonotoneLuckyZeroDamageEnemyAction
} from '../src/solver/fixed-purchase-zero-damage-closure-adapter.js';

const ACTION = {
  kind: 'tile',
  eventId: 'f1:0,0:enemy:test',
  parsed: { type: 'enemy', id: 'test' }
};

function state({ lucky = true } = {}) {
  return {
    relics: { lucky },
    stats: { hp: 1000, maxHp: 1000, atk: 100, def: 100, gold: 0 }
  };
}

function qualifies(enemy, { lucky = true, damage = 0 } = {}) {
  return isProvablyMonotoneLuckyZeroDamageEnemyAction(state({ lucky }), ACTION, {
    enemies: { test: enemy },
    battleCalculator: () => ({ winnable: true, totalDamage: damage })
  });
}

test('zero-damage closure gate accepts only Lucky-owned ordinary monotone enemies', () => {
  assert.equal(qualifies({ hp: 10, atk: 1, def: 0, gold: 5 }), true);
  assert.equal(qualifies({ hp: 10, atk: 1, def: 0, gold: 5 }, { lucky: false }), false);
  assert.equal(qualifies({ hp: 10, atk: 1, def: 0, gold: 5 }, { damage: 1 }), false);
  assert.equal(qualifies({ hp: 10, atk: 1, def: 0, gold: -1 }), false);
});

test('zero-damage closure gate rejects boss, phase, core and unknown reward semantics', () => {
  assert.equal(qualifies({ hp: 10, atk: 1, def: 0, gold: 5, boss: true }), false);
  assert.equal(qualifies({ hp: 10, atk: 1, def: 0, gold: 5, finalBoss: true }), false);
  assert.equal(qualifies({ hp: 10, atk: 1, def: 0, gold: 5, phaseNext: 'other' }), false);
  assert.equal(qualifies({ hp: 10, atk: 1, def: 0, gold: 5, reward: { core: 1 } }), false);
  assert.equal(qualifies({ hp: 10, atk: 1, def: 0, gold: 5, reward: { hp: -1 } }), false);
  assert.equal(qualifies({ hp: 10, atk: 1, def: 0, gold: 5, reward: { hp: 5, mystery: 1 } }), false);
  assert.equal(qualifies({ hp: 10, atk: 1, def: 0, gold: 5, reward: { hp: 5, maxHp: 5, atk: 1, def: 1, gold: 1 } }), true);
});

test('fixed-policy wrapper recursively forces reachable exact-zero-damage enemies and records automatic steps', () => {
  const baseAdapter = {
    fixedPurchasePolicy: { policyHash: 'test' },
    cloneState: (value) => structuredClone(value),
    normalize(value) {
      return { state: structuredClone(value), steps: [] };
    },
    enumerateActions(value) {
      if (value.remaining <= 0) return [];
      return [{
        kind: 'tile',
        eventId: `f1:enemy:mote:${value.remaining}`,
        parsed: { type: 'enemy', id: 'mote' }
      }];
    },
    applyAction(value, action) {
      const next = structuredClone(value);
      next.remaining -= 1;
      next.kills += 1;
      return {
        ok: true,
        state: next,
        steps: [{ eventId: action.eventId, automatic: false }]
      };
    },
    rulesVersion: () => 'fake-fixed-v1'
  };
  const adapter = createFixedPurchaseZeroDamageClosureAdapter({ baseAdapter });
  const normalized = adapter.normalize({
    remaining: 3,
    kills: 0,
    relics: { lucky: true },
    stats: { hp: 1000, maxHp: 1000, atk: 100, def: 100, gold: 0 }
  });

  assert.equal(normalized.state.remaining, 0);
  assert.equal(normalized.state.kills, 3);
  assert.equal(normalized.steps.length, 3);
  assert.ok(normalized.steps.every((step) => step.automatic === true));
  assert.ok(normalized.steps.every((step) => step.normalizationRule === 'lucky-zero-damage-enemy-v1'));
  assert.match(adapter.rulesVersion(), /lucky-zero-damage-enemy-closure-v1$/);
});

test('zero-damage closure refuses non-fixed adapters', () => {
  assert.throws(() => createFixedPurchaseZeroDamageClosureAdapter({
    baseAdapter: { normalize() {}, enumerateActions() {}, applyAction() {} }
  }), /fixed-purchase policy/);
});
