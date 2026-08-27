import test from 'node:test';
import assert from 'node:assert/strict';
import { ParetoFrontier } from '../src/solver/frontier.js';
import { solve } from '../src/solver/search.js';
import { hashValue, resourceRelation, stableStringify } from '../src/solver/state.js';
import { isSafeAutomaticItem } from '../src/solver/normalization-policy.js';

test('stableStringify and hashValue ignore object insertion order', () => {
  const a = { z: 3, nested: { b: 2, a: 1 } };
  const b = { nested: { a: 1, b: 2 }, z: 3 };
  assert.equal(stableStringify(a), stableStringify(b));
  assert.equal(hashValue(a), hashValue(b));
});

test('normalization keeps Holy as an explicit timing decision', () => {
  assert.equal(isSafeAutomaticItem('hp'), true);
  assert.equal(isSafeAutomaticItem('lucky'), true);
  assert.equal(isSafeAutomaticItem('holy'), false);
  assert.equal(isSafeAutomaticItem('futureUnknownItem'), false);
});

test('resource relation preserves incomparable trade-offs', () => {
  assert.equal(resourceRelation({ hp: 100, atk: 10 }, { hp: 90, atk: 9 }), 'dominates');
  assert.equal(resourceRelation({ hp: 100, atk: 8 }, { hp: 90, atk: 9 }), 'incomparable');
  assert.equal(resourceRelation({ hp: 100, atk: 8 }, { hp: 100, atk: 8 }), 'equal');
});

test('Pareto frontier removes dominated labels but keeps trade-offs', () => {
  const frontier = new ParetoFrontier({ fields: ['hp', 'atk'] });
  const weak = { active: true, resources: { hp: 90, atk: 8 } };
  const attack = { active: true, resources: { hp: 80, atk: 12 } };
  const strong = { active: true, resources: { hp: 100, atk: 9 } };
  assert.equal(frontier.insert(weak).accepted, true);
  assert.equal(frontier.insert(attack).accepted, true);
  const result = frontier.insert(strong);
  assert.equal(result.accepted, true);
  assert.equal(weak.active, false);
  assert.equal(attack.active, true);
  assert.equal(frontier.size, 2);
  assert.equal(frontier.insert({ active: true, resources: { hp: 100, atk: 9 } }).accepted, false);
});

function mockAdapter() {
  const graph = {
    start: [
      { id: 'safe', next: 'mid', hp: -10, atk: 0 },
      { id: 'power', next: 'mid', hp: -30, atk: 5 }
    ],
    mid: [
      { id: 'finish-safe', next: 'goal', hp: -20, requiresAtk: 0 },
      { id: 'finish-power', next: 'goal', hp: -5, requiresAtk: 5 }
    ],
    goal: []
  };

  return {
    objectiveType: 'terminal_hp',
    resourceFields: ['hp', 'atk'],
    createInitialState: () => ({ node: 'start', hp: 100, atk: 0, victory: false }),
    cloneState: (state) => ({ ...state }),
    resources: (state) => ({ hp: state.hp, atk: state.atk }),
    structuralKey: (state) => state.node,
    summarizeState: (state) => ({ ...state }),
    normalize: (state) => ({ state, steps: [] }),
    enumerateActions: (state) => graph[state.node],
    applyAction: (state, action) => {
      if ((action.requiresAtk ?? 0) > state.atk) return { ok: false, state, reason: 'atk' };
      const before = { ...state };
      state.hp += action.hp;
      state.atk += action.atk ?? 0;
      state.node = action.next;
      state.victory = state.node === 'goal';
      return {
        ok: state.hp > 0,
        state,
        steps: [{ eventId: action.id, resourcesBefore: { hp: before.hp, atk: before.atk }, resourcesAfter: { hp: state.hp, atk: state.atk } }]
      };
    },
    isGoal: (state) => state.victory,
    objectiveValue: (state) => state.hp,
    priority: (state) => (state.victory ? 1_000_000 : 0) + state.hp,
    rulesVersion: () => 'mock-v1',
    contentHash: () => 'mock-content'
  };
}

test('multi-label search keeps Pareto alternatives and proves optimum when exhausted', () => {
  const report = solve({ adapter: mockAdapter(), mode: 'optimize', maxExpanded: 100 });
  assert.equal(report.solvable, true);
  assert.equal(report.exact, true);
  assert.equal(report.objective.best, 70);
  assert.equal(report.certificate.steps.map((step) => step.eventId).join(','), 'safe,finish-safe');
  assert.ok(report.prunedDominated >= 1);
});

test('certificate preserves multiple steps inside each macro edge', () => {
  const adapter = mockAdapter();
  const originalApply = adapter.applyAction;
  adapter.applyAction = (state, action) => {
    const result = originalApply(state, action);
    if (!result.ok) return result;
    const step = result.steps[0];
    result.steps = [
      { ...step, eventId: `${step.eventId}:a` },
      { ...step, eventId: `${step.eventId}:b` }
    ];
    return result;
  };
  const report = solve({ adapter, mode: 'optimize', maxExpanded: 100 });
  assert.deepEqual(
    report.certificate.steps.map((step) => step.eventId),
    ['safe:a', 'safe:b', 'finish-safe:a', 'finish-safe:b']
  );
});

test('existence mode returns an exact existence proof after first goal', () => {
  const report = solve({ adapter: mockAdapter(), mode: 'existence', maxExpanded: 100 });
  assert.equal(report.solvable, true);
  assert.equal(report.exact, true);
  assert.equal(report.existenceExact, true);
  assert.equal(report.objectiveExact, false);
  assert.equal(report.stoppedReason, 'goalFound');
});

test('bounded optimization reports unknown exactness instead of claiming optimality', () => {
  const report = solve({ adapter: mockAdapter(), mode: 'optimize', maxExpanded: 1 });
  assert.equal(report.exact, false);
  assert.equal(report.solvable, null);
  assert.equal(report.stoppedReason, 'maxExpanded');
});

test('verified incumbent witness can close an optimality proof without rediscovery', () => {
  const adapter = mockAdapter();
  adapter.objectiveUpperBound = () => 70;
  adapter.verifyIncumbent = (witness) => witness?.type === 'mock-feasible'
    ? { ok: true, value: 70, objectiveType: 'terminal_hp', witnessType: witness.type, summary: { route: 'known' } }
    : { ok: false, reason: 'bad witness' };

  const report = solve({
    adapter,
    mode: 'optimize',
    incumbentWitness: { type: 'mock-feasible' },
    maxExpanded: 100
  });

  assert.equal(report.solvable, true);
  assert.equal(report.exact, true);
  assert.equal(report.objectiveExact, true);
  assert.equal(report.objective.best, 70);
  assert.equal(report.objective.searchBest, null);
  assert.equal(report.objective.seededLowerBound, 70);
  assert.equal(report.incumbentVerification.ok, true);
  assert.equal(report.prunedBound, 1);
  assert.equal(report.certificate, null, 'external witness is not disguised as a search certificate');
});

test('unverified numeric lower bound is reported but never trusted for pruning', () => {
  const adapter = mockAdapter();
  adapter.objectiveUpperBound = () => 100;
  const report = solve({
    adapter,
    mode: 'optimize',
    incumbentLowerBound: 999_999,
    maxExpanded: 100
  });

  assert.equal(report.exact, true);
  assert.equal(report.objective.best, 70);
  assert.equal(report.objective.seededLowerBound, null);
  assert.equal(report.objective.requestedLowerBound, 999_999);
  assert.equal(report.certificate.objective.value, 70);
});

test('invalid or unverifiable incumbent witnesses are rejected before search', () => {
  assert.throws(
    () => solve({ adapter: mockAdapter(), mode: 'optimize', incumbentWitness: { type: 'unknown' } }),
    /verifyIncumbent/
  );

  const adapter = mockAdapter();
  adapter.verifyIncumbent = () => ({ ok: false, reason: 'replay failed' });
  assert.throws(
    () => solve({ adapter, mode: 'optimize', incumbentWitness: { type: 'bad' } }),
    /verification failed: replay failed/
  );
});
