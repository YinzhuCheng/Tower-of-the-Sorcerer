import test from 'node:test';
import assert from 'node:assert/strict';
import { solveFixedEventOrderPurchaseRecovery } from '../src/analyzer/event-order-purchase-recovery.js';

function adapter() {
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

function shop(optionId) {
  return {
    kind: 'shop',
    floorBefore: 0,
    eventId: `f1:shop:0:${optionId}`,
    path: [],
    location: [0, 0],
    action: { optionId }
  };
}

function fight() {
  return {
    kind: 'fight',
    floorBefore: 0,
    eventId: 'f1:enemy:synthetic-breakpoint#1',
    path: [],
    location: [0, 0],
    action: {},
    requiredAtk: 1
  };
}

function stepExecutor({ state, step }) {
  const next = { ...state };
  if (step.kind === 'shop') {
    next.gold -= 1;
    if (step.action.optionId === 'atk') next.atk += 1;
    else if (step.action.optionId === 'def') next.def += 1;
    else next.hp += 1;
    return { ok: true, state: next, failures: [], final: { ...next } };
  }
  if (step.kind === 'fight' && next.atk < step.requiredAtk) {
    return {
      ok: false,
      state: null,
      failures: [{ eventId: step.eventId, reason: 'cannot_break_defense' }],
      final: { ...next }
    };
  }
  return { ok: true, state: next, failures: [], final: { ...next } };
}

test('exact all-branches-dead result exposes the first semantic failure core', () => {
  const result = solveFixedEventOrderPurchaseRecovery({
    witness: { witnessHash: 'synthetic', sourceCertificateHashes: [], steps: [shop('atk'), fight()] },
    adapter: adapter(),
    forcedPurchaseIndex: 0,
    forcedOptionId: 'def',
    stepExecutor,
    fullReplayExecutor: () => { throw new Error('unrecoverable test must not replay a terminal witness'); }
  });

  assert.equal(result.schemaVersion, 2);
  assert.equal(result.exact, true);
  assert.equal(result.recoverable, false);
  assert.equal(result.stoppedReason, 'all_branches_dead');
  assert.deepEqual(result.failureCore, {
    kind: 'first-all-branches-dead-step',
    stepIndex: 1,
    purchaseIndex: 0,
    purchaseNumber: 1,
    stepKind: 'fight',
    eventId: 'f1:enemy:synthetic-breakpoint#1',
    action: {},
    attemptedOptions: [],
    attemptedBranches: 1,
    failureReasons: { cannot_break_defense: 1 },
    examples: [{
      optionId: null,
      eventId: 'f1:enemy:synthetic-breakpoint#1',
      reason: 'cannot_break_defense',
      resourcesBefore: { hp: 3, atk: 0, def: 1, gold: 9 },
      purchasePlanBefore: ['def'],
      replayFinal: { hp: 3, atk: 0, def: 1, gold: 9, goal: false }
    }]
  });
});
