import { ParetoFrontier } from '../solver/frontier.js';
import { replayTowerStepSkeleton, replayTowerStepSkeletonToState } from '../solver/replay.js';
import { mutateEventOrderWitnessShopChoice } from './event-order-purchase-local-search.js';

const SHOP_OPTIONS = Object.freeze(['atk', 'def', 'hp']);
const FAILURE_CORE_EXAMPLE_LIMIT = 12;

function shopSteps(witness) {
  return witness.steps
    .map((step, stepIndex) => ({ step, stepIndex }))
    .filter(({ step }) => step.kind === 'shop');
}

function replaceShopOption(step, optionId) {
  const copy = {
    ...step,
    path: [...(step.path ?? [])],
    location: Array.isArray(step.location) ? [...step.location] : step.location,
    action: step.action ? { ...step.action, optionId } : { optionId }
  };
  const parts = String(copy.eventId ?? '').split(':');
  if (parts.length) {
    parts[parts.length - 1] = optionId;
    copy.eventId = parts.join(':');
  }
  return copy;
}

function buildWitnessWithPurchasePlan(witness, purchasePlan) {
  let result = witness;
  const shops = shopSteps(witness);
  for (let purchaseIndex = 0; purchaseIndex < shops.length; purchaseIndex += 1) {
    const desired = purchasePlan[purchaseIndex];
    const current = result.steps[shops[purchaseIndex].stepIndex].action?.optionId;
    if (desired !== current) {
      result = mutateEventOrderWitnessShopChoice(result, shops[purchaseIndex].stepIndex, desired);
    }
  }
  return result;
}

function defaultStepExecutor({ state, step, adapter }) {
  return replayTowerStepSkeletonToState([step], {
    adapter,
    initialState: state,
    requireGoal: false
  });
}

function defaultFullReplayExecutor({ witness, adapter, initialState }) {
  return replayTowerStepSkeleton(witness.steps, { adapter, initialState });
}

function gatherFrontier(frontiers) {
  const labels = [];
  for (const frontier of frontiers.values()) labels.push(...frontier.activeLabels());
  return labels;
}

function betterTerminal(adapter, left, right) {
  if (!right) return true;
  const a = adapter.objectiveValue(left.state);
  const b = adapter.objectiveValue(right.state);
  return a > b;
}

function replayFailureReason(replay) {
  return replay?.failures?.[0]?.reason ?? 'step_replay_failed';
}

function compactFailureAttempt({ label, optionId, step, replay }) {
  const failure = replay?.failures?.[0] ?? null;
  return {
    optionId: optionId ?? null,
    eventId: failure?.eventId ?? step?.eventId ?? null,
    reason: failure?.reason ?? 'step_replay_failed',
    resourcesBefore: { ...(label?.resources ?? {}) },
    purchasePlanBefore: [...(label?.purchasePlan ?? [])],
    replayFinal: replay?.final ?? null
  };
}

function buildFailureCore({
  stepIndex,
  purchaseIndex,
  baselineStep,
  options,
  failedAttempts
}) {
  const failureReasons = {};
  for (const attempt of failedAttempts) {
    const reason = attempt.reason ?? 'step_replay_failed';
    failureReasons[reason] = (failureReasons[reason] ?? 0) + 1;
  }
  return {
    kind: 'first-all-branches-dead-step',
    stepIndex,
    purchaseIndex: purchaseIndex >= 0 ? purchaseIndex : null,
    purchaseNumber: purchaseIndex >= 0 ? purchaseIndex + 1 : null,
    stepKind: baselineStep?.kind ?? null,
    eventId: baselineStep?.eventId ?? null,
    action: baselineStep?.action ? { ...baselineStep.action } : null,
    attemptedOptions: baselineStep?.kind === 'shop' ? [...options] : [],
    attemptedBranches: failedAttempts.length,
    failureReasons,
    examples: failedAttempts.slice(0, FAILURE_CORE_EXAMPLE_LIMIT)
  };
}

/**
 * Exact dynamic program for one forced purchase error under one fixed event
 * order.
 *
 * Purchases before `forcedPurchaseIndex` stay equal to the baseline witness.
 * The forced purchase is replaced by `forcedOptionId` and is permanently locked.
 * Every later shop branches over ATK / DEF / HP. All non-shop steps are the exact
 * baseline event skeleton and are executed through `stepExecutor` (canonical
 * `engine.js` by default).
 *
 * At each skeleton step, labels with the same structural state are reduced to a
 * Pareto antichain using the adapter's resource vector. Because every future
 * transition is deterministic apart from later shop choices and resource-monotone
 * dominance is the same relation used by the main Solver, dominated labels cannot
 * recover into a solution that their dominator cannot also realize.
 *
 * When this function returns `exact=true`, every later purchase combination under
 * the fixed event order has been considered. `recoverable=false` therefore means
 * exact unrecoverability for this event skeleton only; it is not a global
 * event-order impossibility proof.
 *
 * When every active label dies at one skeleton step, `failureCore` records that
 * first universally failing semantic event, the replay failure-reason histogram,
 * and representative resources immediately before the failure. The core is a
 * localization diagnostic for future tuner sensitivity analysis; it is not an
 * infeasibility proof outside this fixed event skeleton.
 *
 * `stepExecutor` and `fullReplayExecutor` are injectable only to test the generic
 * DP kernel on synthetic transition systems. Production callers use the defaults,
 * so both incremental transitions and the final recovered witness are executed by
 * canonical Tower replay.
 */
export function solveFixedEventOrderPurchaseRecovery({
  witness,
  adapter,
  forcedPurchaseIndex,
  forcedOptionId,
  initialState = null,
  stepExecutor = defaultStepExecutor,
  fullReplayExecutor = defaultFullReplayExecutor,
  maxActiveLabels = 50_000
} = {}) {
  if (!witness?.steps?.length) throw new Error('Purchase recovery requires an event-order witness.');
  if (!adapter) throw new Error('Purchase recovery requires an adapter.');
  if (!Number.isInteger(forcedPurchaseIndex) || forcedPurchaseIndex < 0) {
    throw new Error('forcedPurchaseIndex must be a non-negative integer.');
  }
  if (!SHOP_OPTIONS.includes(forcedOptionId)) throw new Error(`Unknown forced shop option: ${forcedOptionId}`);
  if (typeof stepExecutor !== 'function' || typeof fullReplayExecutor !== 'function') {
    throw new Error('Purchase recovery executors must be functions.');
  }
  if (!Number.isInteger(maxActiveLabels) || maxActiveLabels < 1) {
    throw new Error('maxActiveLabels must be a positive integer.');
  }

  const shops = shopSteps(witness);
  if (forcedPurchaseIndex >= shops.length) throw new Error('forcedPurchaseIndex exceeds witness purchase count.');
  const baselineOption = shops[forcedPurchaseIndex].step.action?.optionId;
  if (forcedOptionId === baselineOption) throw new Error('Forced recovery option must differ from the baseline purchase.');

  const canonicalInitial = initialState ?? adapter.createInitialState();
  let labels = [{
    state: adapter.cloneState(canonicalInitial),
    purchasePlan: [],
    resources: adapter.resources(canonicalInitial),
    active: true
  }];
  let purchaseIndex = -1;
  let generatedTransitions = 0;
  let prunedDominated = 0;
  let peakActiveLabels = 1;
  let peakStructuralStates = 1;
  let stoppedReason = null;
  let failureCore = null;

  for (let stepIndex = 0; stepIndex < witness.steps.length; stepIndex += 1) {
    const baselineStep = witness.steps[stepIndex];
    const isShop = baselineStep.kind === 'shop';
    if (isShop) purchaseIndex += 1;
    let options = [null];
    if (isShop) {
      if (purchaseIndex < forcedPurchaseIndex) options = [baselineStep.action?.optionId];
      else if (purchaseIndex === forcedPurchaseIndex) options = [forcedOptionId];
      else options = SHOP_OPTIONS;
    }

    const byStructure = new Map();
    const failedAttempts = [];
    for (const label of labels) {
      for (const optionId of options) {
        const step = isShop ? replaceShopOption(baselineStep, optionId) : baselineStep;
        const replay = stepExecutor({
          state: adapter.cloneState(label.state),
          step,
          stepIndex,
          purchaseIndex,
          adapter
        });
        generatedTransitions += 1;
        if (!replay?.ok || !replay.state) {
          failedAttempts.push(compactFailureAttempt({ label, optionId, step, replay }));
          continue;
        }
        const nextState = replay.state;
        const resources = adapter.resources(nextState);
        const key = adapter.structuralKey(nextState);
        let frontier = byStructure.get(key);
        if (!frontier) {
          frontier = new ParetoFrontier({ fields: adapter.resourceFields ?? null });
          byStructure.set(key, frontier);
        }
        const nextLabel = {
          state: nextState,
          resources,
          purchasePlan: isShop
            ? [...label.purchasePlan, optionId]
            : label.purchasePlan,
          active: true
        };
        const insertion = frontier.insert(nextLabel);
        if (!insertion.accepted) prunedDominated += 1;
        prunedDominated += insertion.removed.length;
      }
    }

    labels = gatherFrontier(byStructure);
    peakActiveLabels = Math.max(peakActiveLabels, labels.length);
    peakStructuralStates = Math.max(peakStructuralStates, byStructure.size);
    if (labels.length === 0) {
      stoppedReason = 'all_branches_dead';
      failureCore = buildFailureCore({
        stepIndex,
        purchaseIndex,
        baselineStep,
        options,
        failedAttempts
      });
      break;
    }
    if (labels.length > maxActiveLabels) {
      stoppedReason = 'maxActiveLabels';
      break;
    }
  }

  const exact = stoppedReason !== 'maxActiveLabels';
  const goals = exact
    ? labels.filter((label) => adapter.isGoal(label.state))
    : [];
  let best = null;
  for (const label of goals) {
    if (betterTerminal(adapter, label, best)) best = label;
  }
  const recoverable = Boolean(best);
  let recoveryWitness = null;
  let authoritativeReplay = null;
  if (recoverable) {
    recoveryWitness = buildWitnessWithPurchasePlan(witness, best.purchasePlan);
    authoritativeReplay = fullReplayExecutor({
      witness: recoveryWitness,
      adapter,
      initialState
    });
    if (!authoritativeReplay?.ok || authoritativeReplay.objective !== adapter.objectiveValue(best.state)) {
      throw new Error(`Recovery witness replay mismatch: ${authoritativeReplay?.failures?.[0]?.reason ?? 'objective mismatch'}`);
    }
  }

  return {
    schemaVersion: 2,
    model: 'fixed-event-order-purchase-recovery-v0.2-failure-core',
    confidence: exact
      ? 'exact-within-fixed-event-order-and-later-purchase-choice-space'
      : 'bounded-fixed-event-order-recovery-search',
    exact,
    stoppedReason: stoppedReason ?? 'skeleton_exhausted',
    recoverable,
    forcedPurchaseIndex,
    forcedPurchaseNumber: forcedPurchaseIndex + 1,
    baselineOption,
    forcedOptionId,
    purchaseCount: shops.length,
    generatedTransitions,
    prunedDominated,
    peakActiveLabels,
    peakStructuralStates,
    failureCore,
    terminalHp: recoverable ? authoritativeReplay.objective : null,
    minNormalizedHpMargin: recoverable ? authoritativeReplay.minNormalizedHpMargin : null,
    recoveryPurchasePlan: recoverable ? [...best.purchasePlan] : null,
    recoveryWitnessHash: recoveryWitness?.witnessHash ?? null,
    authoritativeReplay: authoritativeReplay ? {
      ok: authoritativeReplay.ok,
      objective: authoritativeReplay.objective,
      minNormalizedHpMargin: authoritativeReplay.minNormalizedHpMargin,
      failures: authoritativeReplay.failures ?? []
    } : null,
    interpretation: recoverable
      ? 'forced_purchase_error_is_recoverable_by_later_purchase_choices_under_the_same_event_order'
      : exact
        ? 'no_later_purchase_sequence_can_recover_this_forced_error_under_the_same_event_order'
        : 'recovery_status_unknown_because_the_fixed_event_order_purchase_search_hit_its_label_budget'
  };
}

/**
 * Upgrade the old no-recourse single-purchase robustness report without erasing
 * it. Directly replayable mutations are trivially recoverable. Only mutations
 * that killed the unchanged continuation need the exact later-purchase dynamic
 * program.
 */
export function analyzeEventOrderWitnessPurchaseRecovery({
  witness,
  adapter,
  noRecourseReport,
  maxActiveLabels = 50_000
} = {}) {
  if (!noRecourseReport?.mutations) throw new Error('Recovery analysis requires the no-recourse counterfactual report.');
  const results = [];
  for (const mutation of noRecourseReport.mutations) {
    if (mutation.solvable) {
      results.push({
        purchaseIndex: mutation.purchaseIndex,
        purchaseNumber: mutation.purchaseNumber,
        baselineOption: mutation.baselineOption,
        forcedOptionId: mutation.alternativeOption,
        noRecourseSolvable: true,
        recoverable: true,
        exact: true,
        recoveryMode: 'no_recourse_needed',
        terminalHp: mutation.terminalHp,
        minNormalizedHpMargin: mutation.minNormalizedHpMargin,
        recoveryPurchasePlan: null,
        recoveryWitnessHash: mutation.witnessHash,
        generatedTransitions: 0,
        prunedDominated: 0,
        peakActiveLabels: 1,
        failureCore: null
      });
      continue;
    }
    const recovery = solveFixedEventOrderPurchaseRecovery({
      witness,
      adapter,
      forcedPurchaseIndex: mutation.purchaseIndex,
      forcedOptionId: mutation.alternativeOption,
      maxActiveLabels
    });
    results.push({
      purchaseIndex: mutation.purchaseIndex,
      purchaseNumber: mutation.purchaseNumber,
      baselineOption: mutation.baselineOption,
      forcedOptionId: mutation.alternativeOption,
      noRecourseSolvable: false,
      recoverable: recovery.recoverable,
      exact: recovery.exact,
      recoveryMode: 'later_purchase_exact_dp',
      terminalHp: recovery.terminalHp,
      minNormalizedHpMargin: recovery.minNormalizedHpMargin,
      recoveryPurchasePlan: recovery.recoveryPurchasePlan,
      recoveryWitnessHash: recovery.recoveryWitnessHash,
      generatedTransitions: recovery.generatedTransitions,
      prunedDominated: recovery.prunedDominated,
      peakActiveLabels: recovery.peakActiveLabels,
      stoppedReason: recovery.stoppedReason,
      failureCore: recovery.failureCore
    });
  }

  const exactResults = results.filter((entry) => entry.exact);
  const recovered = results.filter((entry) => entry.recoverable);
  const unrecoverableExact = results.filter((entry) => entry.exact && !entry.recoverable);
  const unknown = results.filter((entry) => !entry.exact);
  return {
    schemaVersion: 2,
    model: 'event-order-single-purchase-recovery-v0.2-failure-core',
    confidence: unknown.length === 0
      ? 'exact-within-fixed-event-order-for-all-single-purchase-errors'
      : 'mixed-exact-and-bounded-fixed-event-order-recovery',
    baselineTerminalHp: noRecourseReport.baselineTerminalHp,
    totalMutations: results.length,
    noRecourseCatastrophicMutations: noRecourseReport.catastrophicMutations,
    noRecourseCatastrophicRate: noRecourseReport.catastrophicRate,
    exactRecoveryClassifiedMutations: exactResults.length,
    recoveredMutations: recovered.length,
    exactUnrecoverableMutations: unrecoverableExact.length,
    unknownMutations: unknown.length,
    fixedEventOrderRecoveryRate: results.length ? recovered.length / results.length : null,
    fixedEventOrderUnrecoverableRate: results.length ? unrecoverableExact.length / results.length : null,
    formerlyCatastrophicRecovered: results.filter((entry) => !entry.noRecourseSolvable && entry.recoverable),
    exactUnrecoverableExamples: unrecoverableExact.slice(0, 10),
    unknownExamples: unknown.slice(0, 10),
    results
  };
}
