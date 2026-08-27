import test from 'node:test';
import assert from 'node:assert/strict';
import { SHOP_OPTIONS } from '../src/game/data.js';
import { buyShopUpgrade, createInitialState } from '../src/game/engine.js';
import { withBalanceEdits } from '../src/tuner/balance-overlay.js';

function hpOption() {
  return SHOP_OPTIONS.find((option) => option.id === 'hp');
}

test('balance overlay reaches authoritative engine and restores afterward', () => {
  const before = { ...hpOption().effect };
  const result = withBalanceEdits([
    { target: 'shop', id: 'hp', field: 'effect.hp', value: 450 },
    { target: 'shop', id: 'hp', field: 'effect.maxHp', value: 450 }
  ], () => {
    assert.equal(hpOption().effect.hp, 450);
    const state = createInitialState();
    state.stats.gold = 1_000;
    const bought = buyShopUpgrade(state, 'hp');
    assert.equal(bought.ok, true);
    assert.equal(state.stats.hp, 1_650);
    assert.equal(state.stats.maxHp, 1_650);
    return state.stats.hp;
  });

  assert.equal(result, 1_650);
  assert.deepEqual(hpOption().effect, before);
});

test('balance overlay restores values after a thrown evaluation', () => {
  const before = hpOption().effect.hp;
  assert.throws(() => withBalanceEdits([
    { target: 'shop', id: 'hp', field: 'effect.hp', value: 123 }
  ], () => {
    assert.equal(hpOption().effect.hp, 123);
    throw new Error('candidate failed');
  }), /candidate failed/);
  assert.equal(hpOption().effect.hp, before);
});
