import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canonicalizeZeroDamageEnemyOrder,
  isSafeZeroDamageEnemyAction
} from '../src/solver/tower-bounds.js';

const enemyAction = (enemyId, eventId = `enemy:${enemyId}`) => ({
  kind: 'tile',
  parsed: { type: 'enemy', id: enemyId },
  eventId
});

function state({ lucky = true, atk = 100, def = 100, hp = 1000 } = {}) {
  return {
    stats: { hp, maxHp: hp, atk, def, gold: 0 },
    relics: { lucky, ward: false }
  };
}

test('zero-damage ordinary enemies become commutative only after Lucky is fixed', () => {
  assert.equal(isSafeZeroDamageEnemyAction(state({ lucky: true }), enemyAction('mote')), true);
  assert.equal(isSafeZeroDamageEnemyAction(state({ lucky: false }), enemyAction('mote')), false);
});

test('damage-bearing enemies and progression enemies remain explicit', () => {
  assert.equal(isSafeZeroDamageEnemyAction(state({ lucky: true, atk: 14, def: 0 }), enemyAction('mote')), false);
  assert.equal(isSafeZeroDamageEnemyAction(state({ lucky: true, atk: 1000, def: 1000 }), enemyAction('catBoss')), false);
  assert.equal(isSafeZeroDamageEnemyAction(state({ lucky: true, atk: 1000, def: 1000 }), enemyAction('finalQueen')), false);
});

test('POR keeps one stable zero-damage enemy while preserving all other decisions', () => {
  const current = state();
  const actions = [
    enemyAction('catScout', 'b'),
    { kind: 'shop', eventId: 'shop' },
    enemyAction('mote', 'a'),
    enemyAction('catMage', 'magic')
  ];
  const reduced = canonicalizeZeroDamageEnemyOrder(current, actions);
  // catMage deals fixed magic damage and is therefore not part of the commuting set.
  assert.deepEqual(reduced.map((action) => action.eventId), ['shop', 'a', 'magic']);
});
