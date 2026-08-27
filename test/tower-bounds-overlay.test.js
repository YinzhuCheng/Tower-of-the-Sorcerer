import test from 'node:test';
import assert from 'node:assert/strict';
import { createTowerAdapter } from '../src/solver/tower-adapter.js';
import { optimisticTerminalHpUpperBound } from '../src/solver/tower-bounds.js';
import { withBalanceEdits } from '../src/tuner/balance-overlay.js';

test('terminal HP upper bound reads current shop HP effect instead of a stale constant', () => {
  const base = createTowerAdapter();
  const state = base.createInitialState();
  const canonical = optimisticTerminalHpUpperBound(base, state);

  const lower = withBalanceEdits([
    { target: 'shop', id: 'hp', field: 'effect.hp', value: 320 },
    { target: 'shop', id: 'hp', field: 'effect.maxHp', value: 320 }
  ], () => optimisticTerminalHpUpperBound(base, state));

  const higher = withBalanceEdits([
    { target: 'shop', id: 'hp', field: 'effect.hp', value: 1_200 },
    { target: 'shop', id: 'hp', field: 'effect.maxHp', value: 1_200 }
  ], () => optimisticTerminalHpUpperBound(base, state));

  assert.ok(lower < canonical, `expected lowered shop HP bound ${lower} < ${canonical}`);
  assert.ok(higher > canonical, `expected raised shop HP bound ${higher} > ${canonical}`);
});

test('terminal HP upper bound reads current enemy gold contributions under overlay', () => {
  const base = createTowerAdapter();
  const state = base.createInitialState();
  const canonical = optimisticTerminalHpUpperBound(base, state);
  const richerEnemy = withBalanceEdits([
    { target: 'enemy', id: 'mote', field: 'gold', value: 400 }
  ], () => optimisticTerminalHpUpperBound(base, state));

  assert.ok(richerEnemy > canonical, `expected extra optimistic enemy gold to raise bound: ${richerEnemy} > ${canonical}`);
});
