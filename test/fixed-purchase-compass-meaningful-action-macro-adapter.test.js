import test from 'node:test';
import assert from 'node:assert/strict';
import { createFixedPurchaseCompassMeaningfulActionMacroAdapter } from '../src/solver/fixed-purchase-compass-meaningful-action-macro-adapter.js';

function state({
  floor = 0,
  cores = 7,
  compass = true,
  harvested2 = false
} = {}) {
  return {
    floor,
    cores,
    visitedFloors: [0, 1, 2],
    relics: { compass },
    harvested2,
    stats: { hp: 1000, maxHp: 1000, atk: 100, def: 100, gold: 0 },
    shopPurchases: 0
  };
}

function fakeBase() {
  return {
    fixedPurchasePolicy: { shopPlan: [], shopCycle: ['hp'], policyHash: 'fake' },
    cloneState: (value) => structuredClone(value),
    rulesVersion: () => 'fake-v1',
    normalize(value) {
      const next = structuredClone(value);
      if (next.floor === 2 && !next.harvested2) {
        next.harvested2 = true;
        next.stats.gold += 7;
        return {
          state: next,
          steps: [{ eventId: 'f3:auto:pickup', kind: 'tile', automatic: true }]
        };
      }
      return { state: next, steps: [] };
    },
    enumerateActions(value) {
      const actions = [];
      if (value.floor === 0) {
        actions.push({ kind: 'tile', eventId: 'f1:enemy', parsed: { type: 'enemy' } });
      }
      if (value.floor === 1) {
        actions.push({ kind: 'tile', eventId: 'f2:enemy', parsed: { type: 'enemy' } });
      }
      if (value.floor === 2) {
        actions.push({ kind: 'tile', eventId: 'f3:down', token: 'D', parsed: { type: 'D' } });
      }
      if (value.relics.compass) {
        for (const targetFloor of value.visitedFloors) {
          if (targetFloor === value.floor) continue;
          actions.push({
            kind: 'teleport',
            eventId: `teleport:f${targetFloor + 1}`,
            targetFloor
          });
        }
      }
      return actions;
    },
    applyAction(value, action) {
      const next = structuredClone(value);
      if (action.kind === 'teleport') {
        next.floor = action.targetFloor;
        return {
          ok: true,
          state: next,
          steps: [{
            eventId: action.eventId,
            kind: 'teleport',
            action: { targetFloor: action.targetFloor }
          }]
        };
      }
      if (action.eventId === 'f1:enemy' || action.eventId === 'f2:enemy') {
        next.stats.gold += 10;
        return {
          ok: true,
          state: next,
          steps: [{ eventId: action.eventId, kind: 'tile', action: { token: 'enemy' } }]
        };
      }
      if (action.eventId === 'f3:down') {
        next.floor = 1;
        next.enteredViaU = true;
        return {
          ok: true,
          state: next,
          steps: [{ eventId: action.eventId, kind: 'tile', action: { token: 'D' } }]
        };
      }
      return { ok: false, reason: 'unsupported fake action', state: value };
    },
    actionClass(action) {
      if (action.kind === 'teleport') return 'teleport';
      if (action.token === 'D') return 'D';
      if (action.parsed?.type === 'enemy') return 'enemy';
      return action.kind;
    }
  };
}

test('macro adapter leaves ordinary actions unchanged before the configured suffix core', () => {
  const base = fakeBase();
  const adapter = createFixedPurchaseCompassMeaningfulActionMacroAdapter({ baseAdapter: base, minCores: 7 });
  const actions = adapter.enumerateActions(state({ cores: 6 }));
  assert.ok(actions.some((action) => action.kind === 'teleport'));
  assert.ok(actions.some((action) => action.eventId === 'f1:enemy'));
  assert.ok(!actions.some((action) => action.kind === 'compassMacro'));
});

test('macro adapter removes pure teleports and exposes remote first actions', () => {
  const adapter = createFixedPurchaseCompassMeaningfulActionMacroAdapter({ baseAdapter: fakeBase() });
  const actions = adapter.enumerateActions(state());

  assert.ok(actions.some((action) => action.eventId === 'f1:enemy'));
  assert.ok(!actions.some((action) => action.kind === 'teleport'));
  assert.ok(actions.some((action) =>
    action.kind === 'compassMacro'
      && action.macroMode === 'action'
      && action.targetFloor === 1
      && action.innerAction?.eventId === 'f2:enemy'
  ));
  assert.ok(actions.some((action) =>
    action.kind === 'compassMacro'
      && action.macroMode === 'normalize'
      && action.targetFloor === 2
  ));
  assert.ok(actions.some((action) =>
    action.kind === 'compassMacro'
      && action.macroMode === 'action'
      && action.targetFloor === 2
      && action.innerAction?.eventId === 'f3:down'
  ));
});

test('remote action macro replays ordinary teleport, target normalization and inner action steps', () => {
  const adapter = createFixedPurchaseCompassMeaningfulActionMacroAdapter({ baseAdapter: fakeBase() });
  const source = state();
  const action = adapter.enumerateActions(source).find((candidate) =>
    candidate.kind === 'compassMacro'
      && candidate.macroMode === 'action'
      && candidate.targetFloor === 2
      && candidate.innerAction?.eventId === 'f3:down'
  );
  const applied = adapter.applyAction(structuredClone(source), action);

  assert.equal(applied.ok, true);
  assert.equal(applied.state.floor, 1);
  assert.equal(applied.state.harvested2, true);
  assert.equal(applied.state.enteredViaU, true);
  assert.equal(applied.state.stats.gold, 7);
  assert.deepEqual(applied.steps.map((step) => step.eventId), [
    'teleport:f3',
    'f3:auto:pickup',
    'f3:down'
  ]);
});

test('productive remote normalization is preserved even without an explicit target action', () => {
  const base = fakeBase();
  base.enumerateActions = (value) => {
    if (!value.relics.compass) return [];
    return value.visitedFloors
      .filter((targetFloor) => targetFloor !== value.floor)
      .map((targetFloor) => ({
        kind: 'teleport',
        eventId: `teleport:f${targetFloor + 1}`,
        targetFloor
      }));
  };
  const adapter = createFixedPurchaseCompassMeaningfulActionMacroAdapter({ baseAdapter: base });
  const source = state();
  const action = adapter.enumerateActions(source).find((candidate) =>
    candidate.kind === 'compassMacro'
      && candidate.macroMode === 'normalize'
      && candidate.targetFloor === 2
  );
  assert.ok(action);

  const applied = adapter.applyAction(structuredClone(source), action);
  assert.equal(applied.ok, true);
  assert.equal(applied.state.floor, 2);
  assert.equal(applied.state.harvested2, true);
  assert.equal(applied.state.stats.gold, 7);
  assert.deepEqual(applied.steps.map((step) => step.eventId), ['teleport:f3', 'f3:auto:pickup']);
});

test('remote stair stays explicit as the macro inner action and retains stair telemetry class', () => {
  const adapter = createFixedPurchaseCompassMeaningfulActionMacroAdapter({ baseAdapter: fakeBase() });
  const action = adapter.enumerateActions(state()).find((candidate) =>
    candidate.kind === 'compassMacro'
      && candidate.innerAction?.eventId === 'f3:down'
  );
  assert.ok(action);
  assert.equal(adapter.actionClass(action), 'D');
});

test('an unproductive remote floor with no non-teleport action produces no search node', () => {
  const base = fakeBase();
  base.normalize = (value) => ({ state: structuredClone(value), steps: [] });
  base.enumerateActions = (value) => value.relics.compass
    ? value.visitedFloors
        .filter((targetFloor) => targetFloor !== value.floor)
        .map((targetFloor) => ({
          kind: 'teleport',
          eventId: `teleport:f${targetFloor + 1}`,
          targetFloor
        }))
    : [];
  const adapter = createFixedPurchaseCompassMeaningfulActionMacroAdapter({ baseAdapter: base });
  assert.deepEqual(adapter.enumerateActions(state()), []);
});
