import { analyzeThresholdCoreTransition } from './event-order-core-transition-proof.js';
import { buildEventOrderStepWitness } from './event-order-witness.js';
import { createCoreBoundaryAdapter } from '../solver/core-boundary-adapter.js';
import { createFixedPurchasePolicyTowerAdapter } from '../solver/fixed-purchase-policy-adapter.js';
import { createLateGameThresholdPriorityAdapter } from '../solver/late-game-threshold-priority-adapter.js';
import { createLateGameZeroDamageHarvestAdapter } from '../solver/late-game-zero-damage-harvest-adapter.js';
import { createObjectiveThresholdAdapter } from '../solver/objective-threshold-adapter.js';
import {
  replayTowerCertificateToState,
  replayTowerCertificate,
  replayTowerStepSkeleton
} from '../solver/replay.js';
import { solve } from '../solver/search.js';
import { withBalanceEdits } from '../tuner/balance-overlay.js';
import { cloneReviewCandidate, REVIEW_CANDIDATES } from '../tuner/review-candidates.js';

const SUFFIX_PRIORITY_MODES = new Set(['baseline', 'late-game-threshold']);

function ratio(numerator, denominator) {
  return denominator > 0 ? numerator / denominator : 0;
}

export function summarizeSuffixSearchTelemetry(report, {
  lateFloorFrom = 7
} = {}) {
  if (!report) return null;
  const generatedByAction = report.profile?.generatedByAction ?? {};
  const expandedByStage = report.profile?.expandedByStage ?? {};
  const teleportGenerated = Number(generatedByAction.teleport ?? 0);
  const stairUpGenerated = Number(generatedByAction.U ?? 0);
  const stairDownGenerated = Number(generatedByAction.D ?? 0);
  const stairGenerated = stairUpGenerated + stairDownGenerated;
  const travelGenerated = teleportGenerated + stairGenerated;
  const generatedStates = Number(report.generatedStates ?? 0);
  const expandedStates = Number(report.expandedStates ?? 0);

  let lateFloorExpanded = 0;
  let earlierFloorExpanded = 0;
  let unclassifiedExpanded = 0;
  for (const [stage, countRaw] of Object.entries(expandedByStage)) {
    const count = Number(countRaw ?? 0);
    const match = /^f(\d+)\//.exec(stage);
    if (!match) {
      unclassifiedExpanded += count;
      continue;
    }
    if (Number(match[1]) >= lateFloorFrom) lateFloorExpanded += count;
    else earlierFloorExpanded += count;
  }

  return {
    lateFloorFrom,
    teleportGenerated,
    stairGenerated,
    travelGenerated,
    travelGeneratedRatio: ratio(travelGenerated, generatedStates),
    nonTravelGenerated: Math.max(0, generatedStates - travelGenerated),
    lateFloorExpanded,
    lateFloorExpandedRatio: ratio(lateFloorExpanded, expandedStates),
    earlierFloorExpanded,
    earlierFloorExpandedRatio: ratio(earlierFloorExpanded, expandedStates),
    unclassifiedExpanded,
    queuePeak: report.profile?.queuePeak ?? null,
    prunedBound: report.prunedBound ?? null
  };
}

function compactSolver(report, telemetryOptions = {}) {
  if (!report) return null;
  return {
    solvable: report.solvable,
    exact: report.exact,
    existenceExact: report.existenceExact,
    stoppedReason: report.stoppedReason,
    expandedStates: report.expandedStates,
    generatedStates: report.generatedStates,
    prunedDominated: report.prunedDominated,
    prunedBound: report.prunedBound,
    structuralStates: report.structuralStates,
    activeLabels: report.activeLabels,
    frontierPeak: report.frontierPeak,
    profile: report.profile,
    telemetry: summarizeSuffixSearchTelemetry(report, telemetryOptions),
    certificateHash: report.certificate?.certificateHash ?? null,
    certificateSteps: report.certificate?.steps?.length ?? 0
  };
}

function suffixPriorityAdapter({
  baseAdapter,
  mode,
  threshold,
  minCores,
  slackBucket
}) {
  if (!SUFFIX_PRIORITY_MODES.has(mode)) {
    throw new Error(`Unknown suffix priority mode: ${mode}`);
  }
  if (mode === 'baseline') return baseAdapter;
  return createLateGameThresholdPriorityAdapter({
    baseAdapter,
    threshold,
    minCores,
    slackBucket
  });
}

export function classifyThresholdCoreChain({
  transitionReport,
  suffixExploit = false
} = {}) {
  if (suffixExploit) return 'exploit-found';
  if (transitionReport?.exactNoTransition === true) return 'no-exploit-via-core-transition-exact';
  return 'coverage-incomplete';
}

/**
 * Continue a replay-verified threshold-relevant core transition directly to the
 * terminal objective-threshold goal.
 *
 * `referenceWitness` is required for candidates whose review threshold is an
 * event-order step witness rather than the legacy greedy route. The witness is
 * forwarded unchanged into the transition proof, where it is independently
 * checked against the candidate's semantic identity, purchase policy, HP/margin
 * and authoritative replay before any threshold pruning is trusted.
 *
 * Proof evidence remains a three-certificate chain. When a suffix exploit is
 * found, the same three certificates are additionally stripped into a numeric-
 * agnostic step skeleton and replayed once more from the canonical engine start.
 * The skeleton is a future player warm start, not a proof certificate.
 *
 * `suffixPriorityMode` changes queue expansion order only. `baseline` preserves
 * the historical fixed-purchase priority. `late-game-threshold` adds the c7
 * threshold-slack / terminal-progress ordering from the dedicated adapter. It
 * does not remove actions, alter dominance, or introduce a proof prune.
 */
export function analyzeThresholdCoreTransitionChain({
  candidate = REVIEW_CANDIDATES.distributedPressureV1,
  referenceWitness = null,
  fromCores = 6,
  toCores = fromCores + 1,
  boundaryMaxExpanded = 8_000,
  boundaryMaxGenerated = 100_000,
  boundaryMaxGoals = 64,
  maxTransitionSeeds = 8,
  transitionMaxExpanded = 5_000,
  transitionMaxGenerated = 70_000,
  suffixMaxExpanded = 8_000,
  suffixMaxGenerated = 100_000,
  lateGameZeroDamageClosure = true,
  suffixPriorityMode = 'baseline',
  suffixPrioritySlackBucket = 25
} = {}) {
  if (!SUFFIX_PRIORITY_MODES.has(suffixPriorityMode)) {
    throw new Error(`Unknown suffix priority mode: ${suffixPriorityMode}`);
  }
  const snapshot = cloneReviewCandidate(candidate);
  const transitionReport = analyzeThresholdCoreTransition({
    candidate: snapshot,
    referenceWitness,
    fromCores,
    toCores,
    boundaryMaxExpanded,
    boundaryMaxGenerated,
    boundaryMaxGoals,
    maxTransitionSeeds,
    transitionMaxExpanded,
    transitionMaxGenerated
  });

  if (!transitionReport.transitionFound || !transitionReport.transition) {
    return {
      schemaVersion: 5,
      model: 'event-order-core-transition-chain-v0.5-suffix-priority',
      candidateId: snapshot.id,
      fromCores,
      toCores,
      suffixPriorityMode,
      status: classifyThresholdCoreChain({ transitionReport }),
      productionWriteAllowed: false,
      exploitFound: false,
      exactNoExploit: transitionReport.exactNoTransition === true,
      transition: transitionReport,
      suffix: null,
      exploit: null,
      interpretation: transitionReport.exactNoTransition
        ? 'complete_threshold_transition_proof_eliminates_all_terminal_exploits_through_this_mandatory_core_transition'
        : 'threshold_relevant_next_core_bridge_not_yet_available_for_suffix_search'
    };
  }

  return withBalanceEdits(snapshot.edits, () => {
    const referenceHp = transitionReport.reference?.terminalHp;
    const policy = snapshot.purchasePolicy;
    const fixedAdapter = createFixedPurchasePolicyTowerAdapter({
      shopPlan: policy.shopPlan,
      shopCycle: policy.shopCycle
    });

    const transitionThresholdAdapter = createObjectiveThresholdAdapter({
      threshold: referenceHp,
      baseAdapter: fixedAdapter
    });
    const fromBoundaryAdapter = createCoreBoundaryAdapter({
      targetCores: fromCores,
      baseAdapter: transitionThresholdAdapter
    });
    const toBoundaryAdapter = createCoreBoundaryAdapter({
      targetCores: toCores,
      baseAdapter: transitionThresholdAdapter
    });

    const prefixCertificate = transitionReport.transition.prefixCertificate;
    const transitionCertificate = transitionReport.transition.transitionCertificate;
    const prefixReplay = replayTowerCertificateToState(prefixCertificate, {
      adapter: fromBoundaryAdapter
    });
    if (!prefixReplay.ok || !prefixReplay.state) {
      return {
        schemaVersion: 5,
        model: 'event-order-core-transition-chain-v0.5-suffix-priority',
        candidateId: snapshot.id,
        fromCores,
        toCores,
        suffixPriorityMode,
        status: 'bridge-replay-failed',
        productionWriteAllowed: false,
        exploitFound: false,
        exactNoExploit: false,
        transition: transitionReport,
        suffix: null,
        exploit: null,
        replayFailure: { stage: 'prefix', failures: prefixReplay.failures }
      };
    }

    const transitionReplay = replayTowerCertificateToState(transitionCertificate, {
      adapter: toBoundaryAdapter,
      initialState: prefixReplay.state
    });
    if (!transitionReplay.ok || !transitionReplay.state) {
      return {
        schemaVersion: 5,
        model: 'event-order-core-transition-chain-v0.5-suffix-priority',
        candidateId: snapshot.id,
        fromCores,
        toCores,
        suffixPriorityMode,
        status: 'bridge-replay-failed',
        productionWriteAllowed: false,
        exploitFound: false,
        exactNoExploit: false,
        transition: transitionReport,
        suffix: null,
        exploit: null,
        replayFailure: { stage: 'transition', failures: transitionReplay.failures }
      };
    }

    const bridgeUpperBound = fixedAdapter.objectiveUpperBound(transitionReplay.state);
    const harvestedSuffixBaseAdapter = lateGameZeroDamageClosure
      ? createLateGameZeroDamageHarvestAdapter({
          baseAdapter: fixedAdapter,
          minCores: toCores,
          requireLucky: true
        })
      : fixedAdapter;
    const orderedSuffixBaseAdapter = suffixPriorityAdapter({
      baseAdapter: harvestedSuffixBaseAdapter,
      mode: suffixPriorityMode,
      threshold: referenceHp,
      minCores: toCores,
      slackBucket: suffixPrioritySlackBucket
    });
    const suffixThresholdAdapter = createObjectiveThresholdAdapter({
      threshold: referenceHp,
      baseAdapter: orderedSuffixBaseAdapter
    });
    const suffixSolver = solve({
      adapter: suffixThresholdAdapter,
      initialState: transitionReplay.state,
      mode: 'existence',
      maxExpanded: suffixMaxExpanded,
      maxGenerated: suffixMaxGenerated,
      solverVersion: `fixed-purchase-core${toCores}-threshold-suffix-v0.5-${suffixPriorityMode}`
    });
    const suffixCertificate = suffixSolver.certificate;
    const suffixReplay = suffixCertificate
      ? replayTowerCertificate(suffixCertificate, {
          adapter: suffixThresholdAdapter,
          initialState: transitionReplay.state
        })
      : null;
    const suffixExploit = suffixSolver.solvable === true
      && suffixReplay?.ok === true
      && Number.isFinite(suffixReplay.objective)
      && suffixReplay.objective > referenceHp;
    const status = classifyThresholdCoreChain({ transitionReport, suffixExploit });
    const suffixExactNoExploitFromThisBridge = suffixSolver.solvable === false && suffixSolver.exact === true;

    let eventOrderWitness = null;
    let eventOrderWitnessReplay = null;
    if (suffixExploit) {
      eventOrderWitness = buildEventOrderStepWitness({
        candidateId: snapshot.id,
        referenceTerminalHp: referenceHp,
        expectedTerminalHp: suffixReplay.objective,
        certificates: [prefixCertificate, transitionCertificate, suffixCertificate]
      });
      eventOrderWitnessReplay = replayTowerStepSkeleton(eventOrderWitness.steps, {
        adapter: fixedAdapter
      });
    }

    const exploit = suffixExploit ? {
      terminalHp: suffixReplay.objective,
      deltaHp: suffixReplay.objective - referenceHp,
      relativeGain: (suffixReplay.objective - referenceHp) / Math.max(1, referenceHp),
      replayOk: true,
      chain: {
        prefixCertificateHash: prefixCertificate?.certificateHash ?? null,
        transitionCertificateHash: transitionCertificate?.certificateHash ?? null,
        suffixCertificateHash: suffixCertificate?.certificateHash ?? null
      },
      witness: eventOrderWitness,
      witnessReplay: eventOrderWitnessReplay ? {
        ok: eventOrderWitnessReplay.ok,
        failures: eventOrderWitnessReplay.failures,
        objective: eventOrderWitnessReplay.objective,
        final: eventOrderWitnessReplay.final,
        minNormalizedHpMargin: eventOrderWitnessReplay.minNormalizedHpMargin,
        battles: eventOrderWitnessReplay.battleLog.length
      } : null,
      final: suffixReplay.final
    } : null;

    return {
      schemaVersion: 5,
      model: 'event-order-core-transition-chain-v0.5-suffix-priority',
      candidateId: snapshot.id,
      fromCores,
      toCores,
      suffixPriorityMode,
      status,
      productionWriteAllowed: false,
      exploitFound: Boolean(exploit),
      exactNoExploit: false,
      threshold: { objective: 'terminal_hp', strictGreaterThan: referenceHp },
      transition: transitionReport,
      bridge: {
        prefixReplayOk: prefixReplay.ok,
        transitionReplayOk: transitionReplay.ok,
        cores: transitionReplay.state.cores,
        resources: fixedAdapter.resources(transitionReplay.state),
        shopPurchases: transitionReplay.state.shopPurchases,
        optimisticTerminalHpUpperBound: bridgeUpperBound
      },
      suffix: {
        lateGameZeroDamageClosure,
        priorityMode: suffixPriorityMode,
        prioritySlackBucket: suffixPriorityMode === 'late-game-threshold'
          ? suffixPrioritySlackBucket
          : null,
        solver: compactSolver(suffixSolver, { lateFloorFrom: toCores }),
        replay: suffixReplay ? {
          ok: suffixReplay.ok,
          failures: suffixReplay.failures,
          final: suffixReplay.final,
          objective: suffixReplay.objective
        } : null,
        exactNoExploitFromThisBridge: suffixExactNoExploitFromThisBridge
      },
      exploit,
      interpretation: exploit
        ? (eventOrderWitnessReplay?.ok && eventOrderWitnessReplay.objective === suffixReplay.objective
            ? 'three_stage_exploit_and_numeric_agnostic_step_witness_both_replay_authoritatively'
            : 'three_stage_authoritative_certificate_chain_proves_event_order_exploit_but_step_witness_needs_attention')
        : suffixExactNoExploitFromThisBridge
          ? 'this_threshold_relevant_core7_bridge_is_exactly_non_exploiting_but_other_core7_bridges_remain_possible'
          : 'threshold_relevant_core7_bridge_found_but_terminal_suffix_coverage_is_incomplete'
    };
  });
}
