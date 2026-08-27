import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createFixedPurchaseTeleportTransitionMemoAdapter,
  fixedPurchaseTeleportTransitionEquivalenceKey
} from '../src/solver/fixed-purchase-teleport-transition-memo-adapter.js';

function fakeBase() {
  return {
    fixedPurchasePolicy: { shopPlan: [], shopCycle: ['hp'], policyHash: 'fake' },
    resourceFields: ['hp', 'gold', 'sun'],
    rulesVersion: () => 'fake-v1',
    resources(state) {
      return {
        hp: state.hp,
        gold: state.gold,
        sun: state.sun
      };
    },
    structuralKey(state) {
      return JSON.stringify({
        floor: state.floor,
        component: state.component,
        events: state.events,
        floorMeta: state.floorMeta,
        relicMask: state.relicMask,
        shopPurchases: state.shopPurchases,
        visitedMask: state.visitedMask,
        victory: false
      });
    },
    enumerateActions(state) {
      const actions = [{ kind: 'tile', eventId: `local:${state.floor}` }];
      if (!state.relics?.compass) return actions;
      for (const targetFloor of state.visited) {
        if (targetFloor === state.floor) continue;
        actions.push({
          kind: 'teleport',
          eventId: `teleport:f${targetFloor + 1}`,
          targetFloor
        });
      }
      return actions;
    }
  };
}

function state(overrides = {}) {
  return {
    floor: 0,
    component: 'a',
    cores: 7,
    relics: { compass: true },
    visited: [0, 1, 2],
    hp: 1000,
    gold: 50,
    sun: 2,
    events: 'evt-A',
    floorMeta: 'meta-A',
    relicMask: 7,
    shopPurchases: 21,
    visitedMask: 7,
    ...overrides
  };
}

function teleportTargets(actions) {
  return actions.filter((action) => action.kind === 'teleport').map((action) => action.targetFloor);
}

test('teleport equivalence key ignores only source floor and component', () => {
  const base = fakeBase();
  const left = state({ floor: 0, component: 'left' });
  const right = state({ floor: 1, component: 'right' });
  assert.equal(
    fixedPurchaseTeleportTransitionEquivalenceKey(base, left, 2),
    fixedPurchaseTeleportTransitionEquivalenceKey(base, right, 2)
  );

  assert.notEqual(
    fixedPurchaseTeleportTransitionEquivalenceKey(base, left, 2),
    fixedPurchaseTeleportTransitionEquivalenceKey(base, right, 0)
  );
  assert.notEqual(
    fixedPurchaseTeleportTransitionEquivalenceKey(base, left, 2),
    fixedPurchaseTeleportTransitionEquivalenceKey(base, { ...right, sun: 3 }, 2)
  );
  assert.notEqual(
    fixedPurchaseTeleportTransitionEquivalenceKey(base, left, 2),
    fixedPurchaseTeleportTransitionEquivalenceKey(base, { ...right, events: 'evt-B' }, 2)
  );
});

test('first equivalent teleport target is kept and later duplicate target is omitted', () => {
  const adapter = createFixedPurchaseTeleportTransitionMemoAdapter({ baseAdapter: fakeBase() });

  const fromFloor0 = adapter.enumerateActions(state({ floor: 0, component: 'c0' }));
  assert.deepEqual(teleportTargets(fromFloor0), [1, 2]);
  assert.ok(fromFloor0.some((action) => action.kind === 'tile'));

  const fromFloor1 = adapter.enumerateActions(state({ floor: 1, component: 'c1' }));
  // target 2 already had an equivalent transition generated from floor 0;
  // target 0 is new because floor 0 could not teleport to itself.
  assert.deepEqual(teleportTargets(fromFloor1), [0]);
  assert.ok(fromFloor1.some((action) => action.kind === 'tile'));

  assert.deepEqual(adapter.teleportTransitionMemoStats(), {
    firstTeleportClasses: 3,
    omittedEquivalentTeleports: 1,
    memoSize: 3
  });
});

test('resource or global-event changes create a fresh teleport class', () => {
  const adapter = createFixedPurchaseTeleportTransitionMemoAdapter({ baseAdapter: fakeBase() });
  adapter.enumerateActions(state({ floor: 0 }));

  const resourceChanged = adapter.enumerateActions(state({ floor: 1, hp: 999 }));
  assert.ok(teleportTargets(resourceChanged).includes(2));

  const eventChanged = adapter.enumerateActions(state({ floor: 1, events: 'evt-B' }));
  assert.ok(teleportTargets(eventChanged).includes(2));
});

test('memo is inert before minCores and without Compass', () => {
  const adapter = createFixedPurchaseTeleportTransitionMemoAdapter({
    baseAdapter: fakeBase(),
    minCores: 7
  });
  const lowCore = adapter.enumerateActions(state({ floor: 0, cores: 6 }));
  const lowCoreEquivalent = adapter.enumerateActions(state({ floor: 1, cores: 6 }));
  assert.deepEqual(teleportTargets(lowCore), [1, 2]);
  assert.deepEqual(teleportTargets(lowCoreEquivalent), [0, 2]);
  assert.deepEqual(adapter.teleportTransitionMemoStats(), {
    firstTeleportClasses: 0,
    omittedEquivalentTeleports: 0,
    memoSize: 0
  });

  const noCompass = adapter.enumerateActions(state({ relics: { compass: false } }));
  assert.equal(teleportTargets(noCompass).length, 0);
});

test('a fresh adapter instance starts with an empty solve-scoped memo', () => {
  const base = fakeBase();
  const first = createFixedPurchaseTeleportTransitionMemoAdapter({ baseAdapter: base });
  first.enumerateActions(state({ floor: 0 }));
  assert.equal(first.teleportTransitionMemoStats().memoSize, 2);

  const second = createFixedPurchaseTeleportTransitionMemoAdapter({ baseAdapter: base });
  assert.equal(second.teleportTransitionMemoStats().memoSize, 0);
  assert.deepEqual(teleportTargets(second.enumerateActions(state({ floor: 1 }))), [0, 2]);
});
