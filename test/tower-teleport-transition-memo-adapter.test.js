import test from 'node:test';
import assert from 'node:assert/strict';
import { createTowerAdapter } from '../src/solver/tower-adapter.js';
import {
  createTowerTeleportTransitionMemoAdapter,
  towerTeleportTransitionEquivalenceKey
} from '../src/solver/tower-teleport-transition-memo-adapter.js';

function fakeBase() {
  return {
    resources(state) {
      return { hp: state.hp, sun: state.sun };
    },
    structuralKey(state) {
      return JSON.stringify({
        floor: state.floor,
        component: state.component,
        events: state.events,
        relicMask: state.relicMask,
        visitedMask: state.visitedMask
      });
    },
    enumerateActions(state) {
      const actions = [{ kind: 'tile', eventId: `local:${state.floor}` }];
      if (!state.relics?.compass) return actions;
      for (const targetFloor of state.visited) {
        if (targetFloor !== state.floor) {
          actions.push({ kind: 'teleport', eventId: `teleport:f${targetFloor + 1}`, targetFloor });
        }
      }
      return actions;
    }
  };
}

function state(overrides = {}) {
  return {
    floor: 0,
    component: 'left',
    cores: 0,
    relics: { compass: true },
    visited: [0, 1, 2],
    hp: 1000,
    sun: 2,
    events: 'events-A',
    relicMask: 3,
    visitedMask: 7,
    ...overrides
  };
}

function teleportTargets(actions) {
  return actions.filter((action) => action.kind === 'teleport').map((action) => action.targetFloor);
}

test('generic Tower memo needs no fixed shop policy and merges only an equal target transition', () => {
  const adapter = createTowerTeleportTransitionMemoAdapter({ baseAdapter: fakeBase() });

  assert.deepEqual(teleportTargets(adapter.enumerateActions(state({ floor: 0 }))), [1, 2]);
  assert.deepEqual(teleportTargets(adapter.enumerateActions(state({ floor: 1, component: 'right' }))), [0]);
  assert.equal(adapter.teleportTransitionMemo.fixedPolicyOnly, false);
  assert.deepEqual(adapter.teleportTransitionMemoStats(), {
    firstTeleportClasses: 3,
    omittedEquivalentTeleports: 1,
    memoSize: 3
  });
});

test('generic key retains resources and every non-location structural axis', () => {
  const base = fakeBase();
  const left = state({ floor: 0, component: 'left' });
  const right = state({ floor: 1, component: 'right' });
  assert.equal(
    towerTeleportTransitionEquivalenceKey(base, left, 2),
    towerTeleportTransitionEquivalenceKey(base, right, 2)
  );
  assert.notEqual(
    towerTeleportTransitionEquivalenceKey(base, left, 2),
    towerTeleportTransitionEquivalenceKey(base, { ...right, hp: 999 }, 2)
  );
  assert.notEqual(
    towerTeleportTransitionEquivalenceKey(base, left, 2),
    towerTeleportTransitionEquivalenceKey(base, { ...right, events: 'events-B' }, 2)
  );
});

test('authoritative Tower teleport successors are identical for a merged source pair', () => {
  const base = createTowerAdapter();
  const seed = base.normalize(base.createInitialState()).state;
  seed.relics.compass = true;
  seed.visitedFloors = [0, 1, 2];

  const sourceF1 = base.cloneState(seed);
  sourceF1.floor = 0;
  sourceF1.x = 1;
  sourceF1.y = 9;
  const sourceF2 = base.cloneState(seed);
  sourceF2.floor = 1;
  sourceF2.x = 1;
  sourceF2.y = 9;

  assert.equal(
    towerTeleportTransitionEquivalenceKey(base, sourceF1, 2),
    towerTeleportTransitionEquivalenceKey(base, sourceF2, 2)
  );

  const successor = (source) => {
    const applied = base.applyAction(base.cloneState(source), {
      kind: 'teleport', eventId: 'teleport:f3', targetFloor: 2
    });
    assert.equal(applied.ok, true, applied.reason);
    return base.normalize(applied.state).state;
  };
  const left = successor(sourceF1);
  const right = successor(sourceF2);
  assert.equal(base.structuralKey(left), base.structuralKey(right));
  assert.deepEqual(base.resources(left), base.resources(right));
});
