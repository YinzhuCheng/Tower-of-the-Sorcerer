import test from 'node:test';
import assert from 'node:assert/strict';
import { solveFixedEventOrderPurchaseRecovery } from '../src/analyzer/event-order-purchase-recovery.js';

function fakeAdapter() {
  return {
    resourceFields: ['hp', 'atk', 'def', 'gold'],
    createInitialState: () => ({ hp: 3, atk: 0, def: 0, gold: 10, goal: false }),
    cloneState: (state) => ({ ...state }),
    resources: (state) => ({ hp: state.hp, atk: state.atk, def: state.def, gold: state.gold }),
    structuralKey: (state) => JSON.stringify({ goal: state.goal }),
    isGoal: (state) => state.goal === true,
    objectiveValue: (state) => state.hp,
    summarizeState: (state) => ({ ...state })
  };
}

function shop(optionId, index) {
  return {
    kind: 'shop',
    floorBefore: 0,
    eventId: `f1:shop:${index}:${optionId}`,
    path: [],
    location: [0, 0],
    action: { optionId }
  };
}

function event(kind, id, extra = {}) {
  return {
    kind,
    floorBefore: 0,
    eventId: id,
    path: [],
    location: [0, 0],
    action: {},
    ...extra
  };
}

function witness(steps) {
  return { witnessHash: 'synthetic', sourceCertificateHashes: [], steps };
}

function syntheticStepExecutor({ state, step }) {
  const next = { ...state };
  if (step.kind === 'shop') {
    const option = step.action.optionId;
    next.gold -= 1;
    if (next.gold < 0) return { ok: false, state: null, failures: [{ reason: 'gold' }] };
    if (option === 'atk') next.atk += 1;
    else if (option === 'def') next.def += 1;
    else if (option === 'hp') next.hp += 1;
    return { ok: true, state: next, failures: [] };
  }
  if (step.kind === 'fight') {
    if (next.atk < (step.requiredAtk ?? 0)) {
      return { ok: false, state: null, failures: [{ reason: 'cannot_break_defense' }] };
    }
    if (next.def < (step.requiredDef ?? 0)) {
      return { ok: false, state: null, failures: [{ reason: 'cannot_survive' }] };
    }
    next.hp -= step.damage ?? 0;
    if (next.hp <= 0) return { ok: false, state: null, failures: [{ reason: 'dead' }] };
    return { ok: true, state: next, failures: [] };
  }
  if (step.kind === 'goal') {
    next.goal = true;
    return { ok: true, state: next, failures: [] };
  }
  return { ok: true, state: next, failures: [] };
}

function syntheticFullReplay({ witness: route, adapter, initialState = null }) {
  let state = adapter.cloneState(initialState ?? adapter.createInitialState());
  const failures = [];
  for (const step of route.steps) {
    const result = syntheticStepExecutor({ state, step, adapter });
    if (!result.ok || !result.state) {
      failures.push(...(result.failures ?? [{ reason: 'synthetic_replay_failed' }]));
      break;
    }
    state = result.state;
  }
  const goal = failures.length === 0 && adapter.isGoal(state);
  if (!goal && failures.length === 0) failures.push({ reason: 'goal_not_reached' });
  return {
    ok: failures.length === 0 && goal,
    goal,
    failures,
    objective: adapter.objectiveValue(state),
    minNormalizedHpMargin: null,
    final: adapter.summarizeState(state)
  };
}

const syntheticExecutors = {
  stepExecutor: syntheticStepExecutor,
  fullReplayExecutor: syntheticFullReplay
};

test('later purchase choices can exactly recover a forced early mistake', () => {
  const route = witness([
    shop('atk', 0),
    shop('hp', 1),
    event('fight', 'fight:atk1', { requiredAtk: 1 }),
    event('goal', 'goal')
  ]);
  const result = solveFixedEventOrderPurchaseRecovery({
    witness: route,
    adapter: fakeAdapter(),
    forcedPurchaseIndex: 0,
    forcedOptionId: 'def',
    ...syntheticExecutors
  });
  assert.equal(result.exact, true);
  assert.equal(result.recoverable, true);
  assert.deepEqual(result.recoveryPurchasePlan, ['def', 'atk']);
  assert.equal(result.recoveryPurchasePlan[0], 'def', 'forced mistake must remain locked');
  assert.ok(result.peakActiveLabels >= 3, 'ATK/DEF/HP later choices must remain available before the fight');
});

test('a forced mistake is exactly unrecoverable when failure happens before any later shop', () => {
  const route = witness([
    shop('atk', 0),
    event('fight', 'fight:atk1', { requiredAtk: 1 }),
    shop('hp', 1),
    event('goal', 'goal')
  ]);
  const result = solveFixedEventOrderPurchaseRecovery({
    witness: route,
    adapter: fakeAdapter(),
    forcedPurchaseIndex: 0,
    forcedOptionId: 'def',
    ...syntheticExecutors
  });
  assert.equal(result.exact, true);
  assert.equal(result.recoverable, false);
  assert.equal(result.stoppedReason, 'all_branches_dead');
});

test('Pareto pruning preserves a necessary nondominated defensive branch', () => {
  const route = witness([
    shop('atk', 0),
    shop('hp', 1),
    event('fight', 'fight:def1', { requiredDef: 1 }),
    event('goal', 'goal')
  ]);
  const result = solveFixedEventOrderPurchaseRecovery({
    witness: route,
    adapter: fakeAdapter(),
    forcedPurchaseIndex: 0,
    forcedOptionId: 'hp',
    ...syntheticExecutors
  });
  assert.equal(result.recoverable, true);
  assert.deepEqual(result.recoveryPurchasePlan, ['hp', 'def']);
  assert.ok(result.peakActiveLabels >= 3);
});

test('label safety cap reports unknown instead of false unrecoverability', () => {
  const route = witness([
    shop('atk', 0),
    shop('hp', 1),
    event('goal', 'goal')
  ]);
  const result = solveFixedEventOrderPurchaseRecovery({
    witness: route,
    adapter: fakeAdapter(),
    forcedPurchaseIndex: 0,
    forcedOptionId: 'def',
    ...syntheticExecutors,
    maxActiveLabels: 1
  });
  assert.equal(result.exact, false);
  assert.equal(result.recoverable, false);
  assert.equal(result.stoppedReason, 'maxActiveLabels');
});
