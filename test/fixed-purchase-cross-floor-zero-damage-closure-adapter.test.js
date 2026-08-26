import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canCompassRoundTripWithoutComponentLoss,
  createFixedPurchaseCrossFloorZeroDamageClosureAdapter
} from '../src/solver/fixed-purchase-cross-floor-zero-damage-closure-adapter.js';

function fakeBase({ returnAnchor = 'home', targetProgress = true } = {}) {
  return {
    fixedPurchasePolicy: { policyHash: 'fake-fixed' },
    cloneState: (state) => structuredClone(state),
    rulesVersion: () => 'fake-v1',
    normalize(state) {
      const next = structuredClone(state);
      if (targetProgress && next.floor === 0 && !next.harvested) {
        next.harvested = true;
        return {
          state: next,
          steps: [{ eventId: 'f1:item:safe', kind: 'tile', automatic: true }]
        };
      }
      return { state: next, steps: [] };
    },
    enumerateActions() {
      return [];
    },
    applyAction(state, action) {
      if (action.kind !== 'teleport') return { ok: false, reason: 'unsupported', state };
      const next = structuredClone(state);
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
  };
}

function baseState({ anchor = 'home', lucky = true, compass = true } = {}) {
  return {
    floor: 1,
    componentAnchor: anchor,
    visitedFloors: [0, 1],
    relics: { lucky, compass },
    stats: { hp: 1000, maxHp: 1000, atk: 100, def: 100, gold: 0 },
    harvested: false
  };
}

test('Compass round-trip probe requires Lucky, Compass and the same return component', () => {
  assert.equal(canCompassRoundTripWithoutComponentLoss(fakeBase(), baseState()), true);
  assert.equal(canCompassRoundTripWithoutComponentLoss(fakeBase({ returnAnchor: 'other' }), baseState()), false);
  assert.equal(canCompassRoundTripWithoutComponentLoss(fakeBase(), baseState({ lucky: false })), false);
  assert.equal(canCompassRoundTripWithoutComponentLoss(fakeBase(), baseState({ compass: false })), false);
});

test('cross-floor closure commits only productive target visits and returns home with certificate teleports', () => {
  const adapter = createFixedPurchaseCrossFloorZeroDamageClosureAdapter({ baseAdapter: fakeBase() });
  const normalized = adapter.normalize(baseState());

  assert.equal(normalized.state.floor, 1);
  assert.equal(normalized.state.componentAnchor, 'home');
  assert.equal(normalized.state.harvested, true);
  assert.deepEqual(normalized.steps.map((step) => step.eventId), [
    'teleport:f1',
    'f1:item:safe',
    'teleport:f2'
  ]);
  assert.equal(normalized.steps[0].automatic, true);
  assert.equal(normalized.steps[0].normalizationRule, 'compass-cross-floor-zero-damage-v1');
  assert.equal(normalized.steps[2].automatic, true);
  assert.equal(normalized.steps[2].normalizationRule, 'compass-cross-floor-zero-damage-v1');
});

test('cross-floor closure does not leave home when Compass return would change component', () => {
  const adapter = createFixedPurchaseCrossFloorZeroDamageClosureAdapter({
    baseAdapter: fakeBase({ returnAnchor: 'other' })
  });
  const normalized = adapter.normalize(baseState());
  assert.equal(normalized.state.harvested, false);
  assert.equal(normalized.state.floor, 1);
  assert.equal(normalized.steps.length, 0);
});

test('cross-floor closure skips an unproductive target rather than emitting pure travel', () => {
  const adapter = createFixedPurchaseCrossFloorZeroDamageClosureAdapter({
    baseAdapter: fakeBase({ targetProgress: false })
  });
  const normalized = adapter.normalize(baseState());
  assert.equal(normalized.state.harvested, false);
  assert.equal(normalized.steps.length, 0);
});
