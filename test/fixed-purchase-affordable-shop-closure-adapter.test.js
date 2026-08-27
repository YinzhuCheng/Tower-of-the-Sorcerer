import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canCompassShopRoundTripWithoutComponentLoss,
  createFixedPurchaseAffordableShopClosureAdapter,
  isProvablyMonotoneFixedPurchaseShopAction
} from '../src/solver/fixed-purchase-affordable-shop-closure-adapter.js';

const POLICY = {
  shopPlan: ['hp', 'hp', 'hp'],
  shopCycle: ['hp'],
  policyHash: 'fake-fixed'
};

function fakeBase({ returnAnchor = 'home', shopFloor = 0 } = {}) {
  return {
    fixedPurchasePolicy: POLICY,
    cloneState: (state) => structuredClone(state),
    rulesVersion: () => 'fake-v1',
    normalize(state) {
      return { state: structuredClone(state), steps: [] };
    },
    enumerateActions(state) {
      const cost = 45 + state.shopPurchases * 25;
      if (state.floor !== shopFloor || state.stats.gold < cost) return [];
      return [{
        kind: 'shop',
        eventId: `f${state.floor + 1}:shop:p${state.shopPurchases}:hp`,
        optionId: 'hp'
      }];
    },
    applyAction(state, action) {
      const next = structuredClone(state);
      if (action.kind === 'teleport') {
        next.floor = action.targetFloor;
        next.componentAnchor = action.targetFloor === 1 ? returnAnchor : `anchor-${action.targetFloor}`;
        return {
          ok: true,
          state: next,
          steps: [{
            eventId: action.eventId,
            kind: 'teleport',
            automatic: false,
            action: { targetFloor: action.targetFloor }
          }]
        };
      }
      if (action.kind === 'shop') {
        const cost = 45 + next.shopPurchases * 25;
        if (next.stats.gold < cost) return { ok: false, reason: 'insufficient', state };
        next.stats.gold -= cost;
        next.shopPurchases += 1;
        next.stats.hp += 100;
        next.stats.maxHp += 100;
        return {
          ok: true,
          state: next,
          steps: [{ eventId: action.eventId, kind: 'shop', automatic: false, action: { optionId: 'hp' } }]
        };
      }
      return { ok: false, reason: 'unsupported', state };
    }
  };
}

function baseState({
  floor = 1,
  anchor = 'home',
  compass = true,
  gold = 200,
  shopPurchases = 0
} = {}) {
  return {
    floor,
    componentAnchor: anchor,
    visitedFloors: [0, 1],
    relics: { compass },
    stats: { hp: 1000, maxHp: 1000, atk: 100, def: 100, gold },
    shopPurchases
  };
}

test('fixed-policy shop proof gate requires expected option and affordability', () => {
  const state = baseState({ floor: 0, gold: 100 });
  assert.equal(isProvablyMonotoneFixedPurchaseShopAction(
    state,
    { kind: 'shop', optionId: 'hp' },
    { policy: POLICY }
  ), true);
  assert.equal(isProvablyMonotoneFixedPurchaseShopAction(
    state,
    { kind: 'shop', optionId: 'atk' },
    { policy: POLICY }
  ), false);
  assert.equal(isProvablyMonotoneFixedPurchaseShopAction(
    baseState({ floor: 0, gold: 44 }),
    { kind: 'shop', optionId: 'hp' },
    { policy: POLICY }
  ), false);
});

test('shop Compass round-trip probe requires Compass and the same return component', () => {
  assert.equal(canCompassShopRoundTripWithoutComponentLoss(fakeBase(), baseState()), true);
  assert.equal(canCompassShopRoundTripWithoutComponentLoss(fakeBase({ returnAnchor: 'other' }), baseState()), false);
  assert.equal(canCompassShopRoundTripWithoutComponentLoss(fakeBase(), baseState({ compass: false })), false);
});

test('affordable shop closure buys repeatedly on the current floor while policy purchases remain affordable', () => {
  const adapter = createFixedPurchaseAffordableShopClosureAdapter({
    baseAdapter: fakeBase({ shopFloor: 0 })
  });
  const normalized = adapter.normalize(baseState({ floor: 0, anchor: 'anchor-0', gold: 200 }));

  assert.equal(normalized.state.shopPurchases, 2);
  assert.equal(normalized.state.stats.gold, 85);
  assert.equal(normalized.state.stats.hp, 1200);
  assert.deepEqual(normalized.steps.map((step) => step.eventId), [
    'f1:shop:p0:hp',
    'f1:shop:p1:hp'
  ]);
  assert.ok(normalized.steps.every((step) => step.automatic === true));
  assert.ok(normalized.steps.every((step) => step.normalizationRule === 'fixed-purchase-affordable-shop-v1'));
});

test('cross-floor affordable shop closure buys, returns home, and keeps certificate-visible travel', () => {
  const adapter = createFixedPurchaseAffordableShopClosureAdapter({ baseAdapter: fakeBase() });
  const normalized = adapter.normalize(baseState({ gold: 200 }));

  assert.equal(normalized.state.floor, 1);
  assert.equal(normalized.state.componentAnchor, 'home');
  assert.equal(normalized.state.shopPurchases, 2);
  assert.equal(normalized.state.stats.gold, 85);
  assert.equal(normalized.state.stats.hp, 1200);
  assert.deepEqual(normalized.steps.map((step) => step.eventId), [
    'teleport:f1',
    'f1:shop:p0:hp',
    'teleport:f2',
    'teleport:f1',
    'f1:shop:p1:hp',
    'teleport:f2'
  ]);
  assert.equal(normalized.steps[0].normalizationRule, 'fixed-purchase-affordable-shop-cross-floor-v1');
  assert.equal(normalized.steps[1].normalizationRule, 'fixed-purchase-affordable-shop-v1');
  assert.equal(normalized.steps[2].normalizationRule, 'fixed-purchase-affordable-shop-cross-floor-v1');
});

test('cross-floor affordable shop closure refuses component-losing detours', () => {
  const adapter = createFixedPurchaseAffordableShopClosureAdapter({
    baseAdapter: fakeBase({ returnAnchor: 'other' })
  });
  const normalized = adapter.normalize(baseState({ gold: 200 }));
  assert.equal(normalized.state.shopPurchases, 0);
  assert.equal(normalized.state.stats.gold, 200);
  assert.equal(normalized.steps.length, 0);
});
