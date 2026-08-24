import { FrontierIndex } from './frontier.js';
import { MaxPriorityQueue } from './priority-queue.js';
import { hashValue } from './state.js';

function defaultObjective(state, adapter) {
  return adapter.objectiveValue ? adapter.objectiveValue(state) : 0;
}

function defaultPriority(state, adapter) {
  return adapter.priority ? adapter.priority(state) : defaultObjective(state, adapter);
}

function defaultFrontierKey(state, adapter) {
  return adapter.frontierKey ? adapter.frontierKey(state) : adapter.structuralKey(state);
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
    finalStructuralKeyHash: structuralKeyHash(adapter.structuralKey(goalLabel.state)),
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
  incumbentLowerBound = null,
  incumbentWitness = null,
  solverVersion = 'macro-pareto-v0.4'
} = {}) {
  if (!adapter) throw new Error('solve() requires an adapter.');
  if (!['existence', 'optimize'].includes(mode)) throw new Error(`Unknown solver mode: ${mode}`);
  if (incumbentLowerBound != null && !Number.isFinite(incumbentLowerBound)) {
    throw new Error('incumbentLowerBound must be a finite number or null.');
  }

  const requestedLowerBound = incumbentLowerBound == null
    ? Number.NEGATIVE_INFINITY
    : incumbentLowerBound;
  const initialRaw = initialState ?? adapter.createInitialState();

  // A naked numeric lower bound is intentionally NOT trusted for pruning. A
  // branch-and-bound lower bound must be backed by a feasible witness that the
  // domain adapter replays/validates against its authoritative rules. This
  // prevents callers from accidentally pruning the true optimum with a typo or
  // stale external score.
  let incumbentVerification = null;
  if (incumbentWitness != null) {
    if (typeof adapter.verifyIncumbent !== 'function') {
      throw new Error('incumbentWitness requires adapter.verifyIncumbent().');
    }
    const verification = adapter.verifyIncumbent(incumbentWitness, {
      initialState: adapter.cloneState(initialRaw)
    });
    if (!verification?.ok) {
      throw new Error(`incumbentWitness verification failed: ${verification?.reason ?? 'unknown reason'}`);
    }
    if (!Number.isFinite(verification.value)) {
      throw new Error('incumbentWitness verification must return a finite value.');
    }
    if (verification.objectiveType && verification.objectiveType !== (adapter.objectiveType ?? 'custom')) {
      throw new Error(`incumbentWitness objective mismatch: ${verification.objectiveType}`);
    }
    incumbentVerification = verification;
  }

  const verifiedWitnessValue = incumbentVerification?.value ?? Number.NEGATIVE_INFINITY;
  const trustedSeededLowerBound = verifiedWitnessValue;
  const initialStateHash = hashValue(adapter.summarizeState ? adapter.summarizeState(initialRaw) : initialRaw);
  const initialNormalized = normalizeWith(adapter, adapter.cloneState(initialRaw));
  const frontier = new FrontierIndex({ fields: adapter.resourceFields ?? null });
  const queue = new MaxPriorityQueue();
  let nextId = 1;
  let expandedStates = 0;
  let generatedStates = 0;
  let prunedDominated = 0;
  let prunedBound = 0;
  let stalePops = 0;
  let bestGoal = null;
  let stoppedReason = null;

  let queuePeak = 0;
  let maxDepth = 0;
  let normalizedSteps = initialNormalized.steps.length;
  let branchSamples = 0;
  let branchTotal = 0;
  let branchMax = 0;
  let keySamples = 0;
  let keyCharsTotal = 0;
  let keyCharsMax = 0;
  const expandedByStage = {};
  const generatedByAction = {};

  function currentObjectiveLowerBound() {
    const searchBest = bestGoal
      ? defaultObjective(bestGoal.state, adapter)
      : Number.NEGATIVE_INFINITY;
    return Math.max(trustedSeededLowerBound, searchBest);
  }

  function boundPrunes(state) {
    if (mode !== 'optimize' || !adapter.objectiveUpperBound || adapter.isGoal(state)) return false;
    const upperBound = adapter.objectiveUpperBound(state);
    if (!Number.isFinite(upperBound)) return false;
    return upperBound <= currentObjectiveLowerBound();
  }

  function recordAcceptedKey(key) {
    if (typeof key !== 'string') return;
    keySamples += 1;
    keyCharsTotal += key.length;
    keyCharsMax = Math.max(keyCharsMax, key.length);
  }

  const initialResources = adapter.resources(initialNormalized.state);
  const initialKey = defaultFrontierKey(initialNormalized.state, adapter);
  const initialLabel = {
    id: nextId++,
    state: initialNormalized.state,
    resources: initialResources,
    key: initialKey,
    parent: null,
    edgeSteps: [],
    minHp: initialResources.hp ?? null,
    depth: 0,
    active: true
  };
  frontier.insert(initialLabel.key, initialLabel);
  recordAcceptedKey(initialKey);
  queue.push(initialLabel, defaultPriority(initialLabel.state, adapter));
  queuePeak = Math.max(queuePeak, queue.size);

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
    maxDepth = Math.max(maxDepth, label.depth ?? 0);
    const stage = adapter.stageKey ? adapter.stageKey(label.state) : 'all';
    incrementCounter(expandedByStage, stage);

    if (adapter.isGoal(label.state)) {
      if (labelIsBetterGoal(label, bestGoal, adapter)) bestGoal = label;
      if (mode === 'existence') {
        stoppedReason = 'goalFound';
        break;
      }
      continue;
    }

    // Re-check queued labels because a verified incumbent or a newly discovered
    // goal may have raised the trusted lower bound after this label was queued.
    if (boundPrunes(label.state)) {
      prunedBound += 1;
      continue;
    }

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
      normalizedSteps += normalized.steps.length;
      const nextState = normalized.state;
      if (adapter.provenDeadEnd?.(nextState)) {
        prunedBound += 1;
        continue;
      }
      if (boundPrunes(nextState)) {
        prunedBound += 1;
        continue;
      }

      const resources = adapter.resources(nextState);
      const key = defaultFrontierKey(nextState, adapter);
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
        depth: (label.depth ?? 0) + 1,
        active: true
      };

      const insertion = frontier.insert(key, nextLabel);
      if (!insertion.accepted) {
        prunedDominated += 1;
        continue;
      }
      prunedDominated += insertion.removed.length;
      recordAcceptedKey(key);
      queue.push(nextLabel, defaultPriority(nextState, adapter));
      queuePeak = Math.max(queuePeak, queue.size);
    }
  }

  const exhausted = queue.size === 0 && stoppedReason === null;
  const searchBest = bestGoal ? defaultObjective(bestGoal.state, adapter) : null;
  const bestKnown = Math.max(
    searchBest ?? Number.NEGATIVE_INFINITY,
    verifiedWitnessValue
  );
  const hasFeasibleWitness = Boolean(bestGoal) || Boolean(incumbentVerification?.ok);
  const existenceExact = hasFeasibleWitness || exhausted;
  // Every optimization prune is now justified only by a verified feasible
  // witness or a goal found by this search. Therefore queue exhaustion is a
  // complete optimality proof even if the search never re-discovers the seeded
  // route itself.
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
    stateEncoding: adapter.stateEncoding ?? 'adapter-defined',
    solvable: hasFeasibleWitness ? true : (exhausted ? false : null),
    exact: mode === 'existence' ? existenceExact : objectiveExact,
    existenceExact,
    objectiveExact,
    stoppedReason,
    incumbentVerification,
    objective: {
      type: adapter.objectiveType ?? 'custom',
      best: Number.isFinite(bestKnown) ? bestKnown : null,
      searchBest,
      seededLowerBound: Number.isFinite(verifiedWitnessValue) ? verifiedWitnessValue : null,
      requestedLowerBound: Number.isFinite(requestedLowerBound) ? requestedLowerBound : null
    },
    expandedStates,
    generatedStates,
    prunedDominated,
    prunedBound,
    stalePops,
    structuralStates: frontier.structuralStates,
    activeLabels: frontier.activeCount(),
    frontierPeak: frontier.peakWidth,
    certificate,
    profile: {
      maxDepth,
      goalDepth: bestGoal?.depth ?? null,
      queuePeak,
      normalizationSteps: normalizedSteps,
      branching: {
        samples: branchSamples,
        mean: branchSamples ? branchTotal / branchSamples : 0,
        max: branchMax
      },
      structuralKeyChars: {
        samples: keySamples,
        mean: keySamples ? keyCharsTotal / keySamples : 0,
        max: keyCharsMax
      },
      expandedByStage,
      generatedByAction
    }
  };
}
