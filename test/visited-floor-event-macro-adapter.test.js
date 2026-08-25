import test from 'node:test';
import assert from 'node:assert/strict';
import { createVisitedFloorEventMacroAdapter } from '../src/solver/visited-floor-event-macro-adapter.js';

function fakeBase() {
  return {
    cloneState: (state) => structuredClone(state),
    structuralKey: (state) => JSON.stringify({ floor: state.floor, componentAnchor: state.componentAnchor, done: state.done ?? [] }),
    frontierKey: (state) => `${state.floor};${state.componentAnchor};${(state.done ?? []).join(',')}`,
    rulesVersion: () => 'fake-v1',
    normalize(state) {
      const next = structuredClone(state);
      const steps = [];
      if (next.floor === 0 && !next.autoCollected) {
        next.autoCollected = true;
        steps.push({ kind: 'tile', eventId: 'auto:f1' });
      }
      return { state: next, steps };
    },
    enumerateActions(state) {
      return [
        { kind: 'tile', eventId: `event:f${state.floor + 1}`, floor: state.floor },
        { kind: 'teleport', eventId: `teleport:f${state.floor + 1}`, targetFloor: 0 }
      ];
    },
    applyAction(state, action) {
      const next = structuredClone(state);
      if (action.kind === 'teleport') {
        next.floor = action.targetFloor;
        next.componentAnchor = 100 + action.targetFloor;
        return { ok: true, state: next, steps: [{ kind: 'teleport', eventId: action.eventId }] };
      }
      if (action.kind === 'tile') {
        next.done = [...(next.done ?? []), action.eventId];
        return { ok: true, state: next, steps: [{ kind: 'tile', eventId: action.eventId }] };
      }
      return { ok: false, reason: 'unknown', state };
    },
    actionClass: (action) => action.kind === 'tile' ? 'enemy' : action.kind
  };
}

function lateState(floor = 2) {
  return {
    floor,
    componentAnchor: 100 + floor,
    visitedFloors: [0, 1, 2],
    cores: 7,
    relics: { compass: true },
    done: []
  };
}

test('late macro action surface removes pure teleports and exposes first event on every visited floor', () => {
  const adapter = createVisitedFloorEventMacroAdapter({ baseAdapter: fakeBase(), minCores: 7 });
  const actions = adapter.enumerateActions(lateState(2));
  assert.equal(actions.some((action) => action.kind === 'teleport'), false);
  assert.ok(actions.some((action) => action.kind === 'tile' && action.eventId === 'event:f3'));
  assert.ok(actions.some((action) => action.kind === 'travelEvent' && action.targetFloor === 1 && action.innerAction.eventId === 'event:f2'));
  assert.ok(actions.some((action) => action.kind === 'travelEvent' && action.targetFloor === 0 && action.innerAction.eventId === 'event:f1'));
  assert.ok(actions.some((action) => action.kind === 'travelClosure' && action.targetFloor === 0), 'travel exposing automatic closure must remain representable without forcing another event');
});

test('travel-event macro executes real travel, closure and inner event steps in order', () => {
  const adapter = createVisitedFloorEventMacroAdapter({ baseAdapter: fakeBase(), minCores: 7 });
  const state = lateState(2);
  const action = adapter.enumerateActions(state).find((candidate) =>
    candidate.kind === 'travelEvent' && candidate.targetFloor === 0 && candidate.innerAction.eventId === 'event:f1'
  );
  const applied = adapter.applyAction(state, action);
  assert.equal(applied.ok, true);
  assert.equal(applied.state.floor, 0);
  assert.equal(applied.state.autoCollected, true);
  assert.deepEqual(applied.state.done, ['event:f1']);
  assert.deepEqual(applied.steps.map((step) => step.eventId), ['macro:teleport:f1', 'auto:f1', 'event:f1']);
  assert.equal(adapter.actionClass(action), 'enemy');
});

test('late frontier quotient ignores current free-travel location but keeps strategic structure', () => {
  const adapter = createVisitedFloorEventMacroAdapter({ baseAdapter: fakeBase(), minCores: 7 });
  const a = lateState(2);
  const b = lateState(1);
  assert.equal(adapter.frontierKey(a), adapter.frontierKey(b));

  b.done = ['event:f1'];
  assert.notEqual(adapter.frontierKey(a), adapter.frontierKey(b));
});

test('before threshold/Compass the adapter is a transparent wrapper', () => {
  const base = fakeBase();
  const adapter = createVisitedFloorEventMacroAdapter({ baseAdapter: base, minCores: 7 });
  const state = { ...lateState(2), cores: 6 };
  assert.deepEqual(adapter.enumerateActions(state), base.enumerateActions(state));
  assert.equal(adapter.frontierKey(state), base.frontierKey(state));
});
