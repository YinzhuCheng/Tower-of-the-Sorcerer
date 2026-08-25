import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createFixedPurchasePolicyTowerAdapter,
  fixedPurchaseOptionAt,
  greedyWitnessMatchesFixedPurchasePolicy
} from '../src/solver/fixed-purchase-policy-adapter.js';
import { GREEDY_INCUMBENT_WITNESS_TYPE } from '../src/solver/tower-incumbent.js';

function witness({ shopPlan = ['def', 'atk'], shopCycle = ['hp'] } = {}) {
  return {
    type: GREEDY_INCUMBENT_WITNESS_TYPE,
    strategyId: 'test',
    shopPlan,
    shopCycle,
    holyPolicy: 'immediate'
  };
}

function fakeBase() {
  let verifyCalls = 0;
  return {
    base: {
      enumerateActions() {
        return [
          { kind: 'shop', optionId: 'atk', eventId: 'shop-atk' },
          { kind: 'shop', optionId: 'def', eventId: 'shop-def' },
          { kind: 'shop', optionId: 'hp', eventId: 'shop-hp' },
          { kind: 'tile', parsed: { type: 'enemy', id: 'mote' }, eventId: 'enemy' },
          { kind: 'teleport', targetFloor: 0, eventId: 'travel' }
        ];
      },
      verifyIncumbent() {
        verifyCalls += 1;
        return { ok: true, value: 123, objectiveType: 'terminal_hp' };
      },
      rulesVersion: () => 'fake-v1'
    },
    verifyCalls: () => verifyCalls
  };
}

test('fixed purchase option follows explicit plan then cycle fallback', () => {
  const policy = { shopPlan: ['def', 'atk'], shopCycle: ['hp', 'def'] };
  assert.equal(fixedPurchaseOptionAt(0, policy), 'def');
  assert.equal(fixedPurchaseOptionAt(1, policy), 'atk');
  assert.equal(fixedPurchaseOptionAt(2, policy), 'hp');
  assert.equal(fixedPurchaseOptionAt(3, policy), 'def');
  assert.equal(fixedPurchaseOptionAt(4, policy), 'hp');
});

test('adapter filters only shop choices and preserves non-shop macro actions', () => {
  const fake = fakeBase();
  const adapter = createFixedPurchasePolicyTowerAdapter({
    shopPlan: ['def', 'atk'],
    shopCycle: ['hp'],
    baseAdapter: fake.base
  });

  const first = adapter.enumerateActions({ shopPurchases: 0 });
  assert.deepEqual(first.map((action) => action.eventId), ['shop-def', 'enemy', 'travel']);

  const second = adapter.enumerateActions({ shopPurchases: 1 });
  assert.deepEqual(second.map((action) => action.eventId), ['shop-atk', 'enemy', 'travel']);

  const fallback = adapter.enumerateActions({ shopPurchases: 2 });
  assert.deepEqual(fallback.map((action) => action.eventId), ['shop-hp', 'enemy', 'travel']);
});

test('only a witness with the exact fixed purchase policy may seed pruning', () => {
  const policy = { shopPlan: ['def', 'atk'], shopCycle: ['hp'] };
  assert.equal(greedyWitnessMatchesFixedPurchasePolicy(witness(), policy), true);
  assert.equal(greedyWitnessMatchesFixedPurchasePolicy(witness({ shopPlan: ['atk', 'def'] }), policy), false);
  assert.equal(greedyWitnessMatchesFixedPurchasePolicy(witness({ shopCycle: ['def'] }), policy), false);

  const fake = fakeBase();
  const adapter = createFixedPurchasePolicyTowerAdapter({ ...policy, baseAdapter: fake.base });
  const rejected = adapter.verifyIncumbent(witness({ shopPlan: ['atk', 'def'] }), {});
  assert.equal(rejected.ok, false);
  assert.equal(fake.verifyCalls(), 0, 'incompatible witness must not reach base verification');

  const accepted = adapter.verifyIncumbent(witness(), {});
  assert.equal(accepted.ok, true);
  assert.equal(accepted.value, 123);
  assert.equal(fake.verifyCalls(), 1);
});
