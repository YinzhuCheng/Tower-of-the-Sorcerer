import { FrontierIndex } from './frontier.js';
import { MaxPriorityQueue } from './priority-queue.js';
import { hashValue } from './state.js';

function priorityOf(state, adapter) {
  return adapter.priority ? adapter.priority(state) : (adapter.objectiveValue?.(state) ?? 0);
}

function frontierKeyOf(state, adapter) {
  return adapter.frontierKey ? adapter.frontierKey(state) : adapter.structuralKey(state);
}

function normalizeWith(adapter, state) {
  if (!adapter.normalize) return { state, steps: [] };
  const result = adapter.normalize(state);
  if (!result?.state) throw new Error('adapter.normalize() must return { state, steps }.');
  return { state: result.state, steps: result.steps ?? [] };
}

function structuralKeyHash(key) {
  if (typeof key !== 'string') return hashValue(key);
  try {
    return hashValue(JSON.parse(key));
  } catch {
    return hashValue(key);
  }
}

function incrementCounter(counter, key, amount = 1) {
  counter[key] = (counter[key] ?? 0) + amount;
}

function edgeStepsFor(label, initialSteps) {
  const groups = [];
  let cursor = label;
  while (cursor?.parent) {
    groups.push(cursor.edgeSteps ?? []);
    cursor = cursor.parent;
  }
  groups.reverse();
  return [...initialSteps, ...groups.flat()];
}

function buildBoundaryCertificate(label, initialSteps, adapter, {
  solverVersion,
  initialStateHash
}) {
  const steps = edgeStepsFor(label, initialSteps);
  const payload = {
    schemaVersion: 1,
    solverVersion,
    mode: 'goal-frontier',
    rulesVersion: adapter.rulesVersion?.() ?? null,
    contentHash: adapter.contentHash?.() ?? null,
    initialStateHash,
    objective: {
      type: 'goal-frontier',
      value: adapter.objectiveValue ? adapter.objectiveValue(label.state) : null
    },
    steps,
    final: adapter.summarizeState ? adapter.summarizeState(label.state) : null,
    finalStructuralKeyHash: structuralKeyHash(adapter.structuralKey(label.state)),
    authoritativeReplay: null
  };
  return { ...payload, certificateHash: hashValue(payload) };
}

/**
 * Enumerate a Pareto frontier of reachable goal/boundary states.
 *
 * Unlike `solve(..., mode='existence')`, reaching a goal does not stop the whole
 * search. The goal label is inserted into a separate Pareto index and is not
 * expanded beyond the boundary. Non-goal states continue through the normal
 * structural-key + resource-dominance search.
 *
 * This is intended for staged exact proofs. A budget-limited result may provide
 * useful replayable seeds (`hasGoals=true`) but is not exhaustive unless
 * `coverageExact=true` (the non-goal queue was exhausted).
 */
export function collectGoalFrontier({
  adapter,
  initialState = null,
  maxExpanded = 100_000,
  maxGenerated = 1_000_000,
  solverVersion = 'goal-frontier-v0.1'
} = {}) {
  if (!adapter) throw new Error('collectGoalFrontier() requires an adapter.');

  const initialRaw = initialState ?? adapter.createInitialState();
  const initialStateHash = hashValue(adapter.summarizeState ? adapter.summarizeState(initialRaw) : initialRaw);
  const initialNormalized = normalizeWith(adapter, adapter.cloneState(initialRaw));
  const searchFrontier = new FrontierIndex({ fields: adapter.resourceFields ?? null });
  const goalFrontier = new FrontierIndex({ fields: adapter.resourceFields ?? null });
  const goalLabels = [];
  const queue = new MaxPriorityQueue();
  let nextId = 1;
  let expandedStates = 0;
  let generatedStates = 0;
  let prunedDominated = 0;
  let stalePops = 0;
  let stoppedReason = null;
  let queuePeak = 0;
  let branchSamples = 0;
  let branchTotal = 0;
  let branchMax = 0;
  const expandedByStage = {};
  const generatedByAction = {};

  function makeLabel({ state, parent = null, edgeSteps = [], depth = 0 }) {
    const resources = adapter.resources(state);
    return {
      id: nextId++,
      state,
      resources,
      key: frontierKeyOf(state, adapter),
      parent,
      edgeSteps,
      minHp: parent?.minHp == null || resources.hp == null
        ? (resources.hp ?? parent?.minHp ?? null)
        : Math.min(parent.minHp, resources.hp),
      depth,
      active: true
    };
  }

  function acceptGoal(label) {
    const insertion = goalFrontier.insert(label.key, label);
    if (!insertion.accepted) {
      prunedDominated += 1;
      label.active = false;
      return false;
    }
    prunedDominated += insertion.removed.length;
    goalLabels.push(label);
    return true;
  }

  function acceptSearch(label) {
    const insertion = searchFrontier.insert(label.key, label);
    if (!insertion.accepted) {
      prunedDominated += 1;
      label.active = false;
      return false;
    }
    prunedDominated += insertion.removed.length;
    queue.push(label, priorityOf(label.state, adapter));
    queuePeak = Math.max(queuePeak, queue.size);
    return true;
  }

  const initialLabel = makeLabel({ state: initialNormalized.state });
  if (adapter.isGoal(initialLabel.state)) acceptGoal(initialLabel);
  else acceptSearch(initialLabel);

  while (queue.size > 0) {
    if (expandedStates >= maxExpanded) {
      stoppedReason = 'maxExpanded';
      break;
    }
    if (generatedStates >= maxGenerated) {
      stoppedReason = 'maxGenerated';
      break;
    }

    const label = queue.pop();
    if (!label?.active) {
      stalePops += 1;
      continue;
    }

    expandedStates += 1;
    const stage = adapter.stageKey ? adapter.stageKey(label.state) : 'all';
    incrementCounter(expandedByStage, stage);
    const actions = adapter.enumerateActions(label.state);
    branchSamples += 1;
    branchTotal += actions.length;
    branchMax = Math.max(branchMax, actions.length);

    for (const action of actions) {
      if (generatedStates >= maxGenerated) break;
      generatedStates += 1;
      const actionClass = adapter.actionClass ? adapter.actionClass(action) : (action.kind ?? 'unknown');
      incrementCounter(generatedByAction, actionClass);

      const applied = adapter.applyAction(adapter.cloneState(label.state), action);
      if (!applied?.ok) continue;
      const normalized = normalizeWith(adapter, applied.state);
      const nextState = normalized.state;
      if (adapter.provenDeadEnd?.(nextState)) continue;

      const nextLabel = makeLabel({
        state: nextState,
        parent: label,
        edgeSteps: [...(applied.steps ?? []), ...normalized.steps],
        depth: (label.depth ?? 0) + 1
      });
      if (adapter.isGoal(nextState)) acceptGoal(nextLabel);
      else acceptSearch(nextLabel);
    }
  }

  const exhausted = queue.size === 0 && stoppedReason === null;
  const activeGoals = goalLabels.filter((label) => label.active);
  const goals = activeGoals.map((label) => ({
    id: label.id,
    state: adapter.cloneState(label.state),
    resources: { ...label.resources },
    structuralKey: label.key,
    depth: label.depth,
    minHp: label.minHp,
    certificate: buildBoundaryCertificate(label, initialNormalized.steps, adapter, {
      solverVersion,
      initialStateHash
    })
  }));

  return {
    schemaVersion: 1,
    solverVersion,
    stateEncoding: adapter.stateEncoding ?? 'adapter-defined',
    hasGoals: goals.length > 0,
    coverageExact: exhausted,
    stoppedReason,
    expandedStates,
    generatedStates,
    prunedDominated,
    stalePops,
    structuralStates: searchFrontier.structuralStates,
    activeSearchLabels: searchFrontier.activeCount(),
    goalStructuralStates: goalFrontier.structuralStates,
    activeGoalLabels: goals.length,
    goalFrontierPeak: goalFrontier.peakWidth,
    goals,
    profile: {
      queuePeak,
      branching: {
        samples: branchSamples,
        mean: branchSamples ? branchTotal / branchSamples : 0,
        max: branchMax
      },
      expandedByStage,
      generatedByAction
    }
  };
}
