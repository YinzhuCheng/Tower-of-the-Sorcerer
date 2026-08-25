import test from 'node:test';
import assert from 'node:assert/strict';
import { collectGoalFrontier } from '../src/solver/goal-frontier.js';

function mockBoundaryAdapter() {
  const actions = [
    { id: 'hp', hp: 100, atk: 5 },
    { id: 'atk', hp: 90, atk: 10 },
    { id: 'weak', hp: 80, atk: 4 }
  ];
  return {
    objectiveType: 'terminal_hp',
    resourceFields: ['hp', 'atk'],
    createInitialState: () => ({ node: 'start', hp: 0, atk: 0 }),
    cloneState: (state) => ({ ...state }),
    resources: (state) => ({ hp: state.hp, atk: state.atk }),
    structuralKey: (state) => JSON.stringify({ node: state.node }),
    frontierKey: (state) => state.node,
    summarizeState: (state) => ({ ...state }),
    normalize: (state) => ({ state, steps: [] }),
    enumerateActions: (state) => state.node === 'start' ? actions : [],
    applyAction: (state, action) => {
      state.node = 'boundary';
      state.hp = action.hp;
      state.atk = action.atk;
      return {
        ok: true,
        state,
        steps: [{ eventId: action.id, kind: 'mock', resourcesAfter: { hp: state.hp, atk: state.atk } }]
      };
    },
    isGoal: (state) => state.node === 'boundary',
    objectiveValue: (state) => state.hp,
    priority: () => 0,
    actionClass: () => 'mock',
    rulesVersion: () => 'mock-boundary-v1',
    contentHash: () => 'mock-content'
  };
}

test('goal frontier keeps incomparable boundary labels and removes dominated ones', () => {
  const result = collectGoalFrontier({ adapter: mockBoundaryAdapter() });
  assert.equal(result.coverageExact, true);
  assert.equal(result.hasGoals, true);
  assert.equal(result.activeGoalLabels, 2);
  const resources = result.goals
    .map((goal) => goal.resources)
    .sort((a, b) => b.atk - a.atk);
  assert.deepEqual(resources, [
    { hp: 90, atk: 10 },
    { hp: 100, atk: 5 }
  ]);
  assert.ok(result.goals.every((goal) => goal.certificate?.certificateHash));
});

test('goal discovery limit returns valid seeds without claiming exact coverage', () => {
  const result = collectGoalFrontier({
    adapter: mockBoundaryAdapter(),
    maxGoals: 1
  });
  assert.equal(result.hasGoals, true);
  assert.equal(result.activeGoalLabels, 1);
  assert.equal(result.coverageExact, false);
  assert.equal(result.stoppedReason, 'maxGoals');
});

test('budget-limited goal frontier never claims exhaustive coverage', () => {
  const result = collectGoalFrontier({
    adapter: mockBoundaryAdapter(),
    maxExpanded: 0
  });
  assert.equal(result.coverageExact, false);
  assert.equal(result.stoppedReason, 'maxExpanded');
  assert.equal(result.hasGoals, false);
});
