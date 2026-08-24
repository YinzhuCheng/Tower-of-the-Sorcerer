import test from 'node:test';
import assert from 'node:assert/strict';
import { isSafeZeroDamageEnemyAction } from '../src/solver/tower-bounds.js';

const enemyAction = (enemyId) => ({
  kind: 'tile',
  parsed: { type: 'enemy', id: enemyId },
  eventId: `enemy:${enemyId}`
});

function state({ lucky = true, atk = 50, def = 100, hp = 1000 } = {}) {
  return {
    stats: { hp, maxHp: hp, atk, def, gold: 0 },
    relics: { lucky, ward: false }
  };
}

test('zero-damage ordinary enemies become order-safe only after Lucky is fixed', () => {
  assert.equal(isSafeZeroDamageEnemyAction(state({ lucky: true }), enemyAction('mote')), true);
  assert.equal(isSafeZeroDamageEnemyAction(state({ lucky: false }), enemyAction('mote')), false);
});

test('damage-bearing enemies and progression enemies remain explicit', () => {
  assert.equal(isSafeZeroDamageEnemyAction(state({ lucky: true, def: 0 }), enemyAction('mote')), false);
  assert.equal(isSafeZeroDamageEnemyAction(state({ lucky: true, atk: 1000, def: 1000 }), enemyAction('catBoss')), false);
  assert.equal(isSafeZeroDamageEnemyAction(state({ lucky: true, atk: 1000, def: 1000 }), enemyAction('finalQueen')), false);
});
