import { FrontierIndex } from './frontier.js';
import { MaxPriorityQueue } from './priority-queue.js';
import { hashValue } from './state.js';

function defaultObjective(state, adapter) {
  return adapter.objectiveValue ? adapter.objectiveValue(state) : 0;
}

function defaultPriority(state, adapter) {
  return adapter.priority ? adapter.priority(state) : defaultObjective(state, adapter);
}

function normalizeWith(adapter, state) {
  if (!adapter.normalize) return { state, steps: [] };
  const result = adapter.normalize(state);
  if (!result || !result.state) throw new Error('adapter.normalize() must return { state, steps }.');
  return { state: result.state, steps: result.steps ?? [] };
}

function labelIsBetterGoal(candidate, current, adapter) {
  if (!current) return true;
  const a = defaultObjective(candidate.state, adapter);
  const b = defaultObjective(current.state, adapter);
  if (a !== b) return a > b;
  const aMin = candidate.minHp ?? Number.NEGATIVE_INFINITY;
  const bMin = current.minHp ?? Number.NEGATIVE_INFINITY;
  return aMin > bMin;
}

function buildCertificate(goalLabel, initialSteps, adapter, metadata) {
  if (!goalLabel) return null;
  const edgeGroups = [];
  let cursor = goalLabel;
  while (cursor?.parent) {
    edgeGroups.push(cursor.edgeSteps ?? []);
    cursor = cursor.parent;
  }
  edgeGroups.reverse();
  const transitions = edgeGroups.flat();
  const steps = [...initialSteps, ...transitions];
  const payload = {
    schemaVersion: 1,
    solverVersion: metadata.solverVersion,
    mode: metadata.mode,
    rulesVersion: adapter.rulesVersion?.() ?? null,
    contentHash: adapter.contentHash?.() ?? null,
    initialStateHash: metadata.initialStateHash,
    objective: {
      type: adapter.objectiveType ?? 'custom',
      value: defaultObjective(goalLabel.state, adapter)
    },
    steps,
    final: adapter.summarizeState ? adapter.summarizeState(goalLabel.state) : null,
    finalStructuralKeyHash: hashValue(adapter.structuralKey(goalLabel.state)),
    authoritativeReplay: null
  };
  return { ...payload, certificateHash: hashValue(payload) };
}

export function solve({
  adapter,
  initialState = null,
  mode = 'existence',
  maxExpanded = 100_000,
  maxGenerated = 1_000_000,
  solverVersion = 'macro-pareto-v0.1'
} = {}) {
  if (!adapter) throw new Error('solve() requires an adapter.');
  if (!['existence', 'optimize'].includes(mode)) throw new Error(`Unknown solver mode: ${mode}`);

  const initialRaw = initialState ?? adapter.createInitialState();
  const initialStateHash = hashValue(adapter.summarizeState ? adapter.summarizeState(initialRaw) : initialRaw);
  const initialNormalized = normalizeWith(adapter, adapter.cloneState(initialRaw));
  const frontier = new FrontierIndex({ fields: adapter.resourceFields ?? null });
  const queue = new MaxPriorityQueue();
  let nextId = 1;
  let expandedStates = 0;
  let generatedStates = 0;
  let prunedDominated = 0;
  let stalePops = 0;
  let bestGoal = null;
  let stoppedReason = null;

  const initialResources = adapter.resources(initialNormalized.state);
  const initialLabel = {
    id: nextId++,
    state: initialNormalized.state,
    resources: initialResources,
    key: adapter.structuralKey(initialNormalized.state),
    parent: null,
    edgeSteps: [],
    minHp: initialResources.hp ?? null,
    active: true
  };
  frontier.insert(initialLabel.key, initialLabel);
  queue.push(initialLabel, defaultPriority(initialLabel.state, adapter));

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
    if (adapter.isGoal(label.state)) {
      if (labelIsBetterGoal(label, bestGoal, adapter)) bestGoal = label;
      if (mode === 'existence') {
        stoppedReason = 'goalFound';
        break;
      }
      continue;
    }

    const actions = adapter.enumerateActions(label.state);
    for (const action of actions) {
      if (generatedStates >= maxGenerated) break;
      generatedStates += 1;
      const applied = adapter.applyAction(adapter.cloneState(label.state), action);
      if (!applied?.ok) continue;

      const normalized = normalizeWith(adapter, applied.state);
      const nextState = normalized.state;
      const resources = adapter.resources(nextState);
      const key = adapter.structuralKey(nextState);
      const edgeSteps = [...(applied.steps ?? []), ...normalized.steps];
      const nextLabel = {
        id: nextId++,
        state: nextState,
        resources,
        key,
        parent: label,
        edgeSteps,
        minHp: label.minHp == null || resources.hp == null
          ? label.minHp
          : Math.min(label.minHp, resources.hp),
        active: true
      };

      const insertion = frontier.insert(key, nextLabel);
      if (!insertion.accepted) {
        prunedDominated += 1;
        continue;
      }
      prunedDominated += insertion.removed.length;
      queue.push(nextLabel, defaultPriority(nextState, adapter));
    }
  }

  const exhausted = queue.size === 0 && stoppedReason === null;
  const solvable = Boolean(bestGoal);
  const existenceExact = solvable || exhausted;
  const objectiveExact = mode === 'optimize' && exhausted;
  const certificate = buildCertificate(bestGoal, initialNormalized.steps, adapter, {
    solverVersion,
    mode,
    initialStateHash
  });

  return {
    schemaVersion: 1,
    solverVersion,
    mode,
    solvable: solvable ? true : (exhausted ? false : null),
    exact: mode === 'existence' ? existenceExact : objectiveExact,
    existenceExact,
    objectiveExact,
    stoppedReason,
    objective: solvable ? {
      type: adapter.objectiveType ?? 'custom',
      best: defaultObjective(bestGoal.state, adapter)
    } : {
      type: adapter.objectiveType ?? 'custom',
      best: null
    },
    expandedStates,
    generatedStates,
    prunedDominated,
    prunedBound: 0,
    stalePops,
    structuralStates: frontier.structuralStates,
    activeLabels: frontier.activeCount(),
    frontierPeak: frontier.peakWidth,
    certificate
  };
}
