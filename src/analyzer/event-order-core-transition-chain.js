import { analyzeThresholdCoreTransition } from './event-order-core-transition-proof.js';
import { createCoreBoundaryAdapter } from '../solver/core-boundary-adapter.js';
import { createFixedPurchasePolicyTowerAdapter } from '../solver/fixed-purchase-policy-adapter.js';
import { createObjectiveThresholdAdapter } from '../solver/objective-threshold-adapter.js';
import { replayTowerCertificateToState, replayTowerCertificate } from '../solver/replay.js';
import { solve } from '../solver/search.js';
import { withBalanceEdits } from '../tuner/balance-overlay.js';
import { cloneReviewCandidate, REVIEW_CANDIDATES } from '../tuner/review-candidates.js';

function compactSolver(report) {
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
    certificateHash: report.certificate?.certificateHash ?? null,
    certificateSteps: report.certificate?.steps?.length ?? 0
  };
}

/**
 * Evidence classification for a staged threshold chain.
 *
 * Exact failure of one suffix bridge is deliberately NOT promoted to global
 * no-exploit: another threshold-relevant c7 bridge may still succeed. Global
 * exact no-exploit is inherited only when the transition proof itself has
 * complete from-core coverage and proves that no threshold-relevant next-core
 * bridge exists at all.
 */
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
 * The proof chain is kept as three separately replayable certificates:
 *
 *   canonical start -> c6 prefix -> c7 transition -> terminal HP > reference
 *
 * We intentionally do not flatten certificates from different initial states.
 * Every continuation verifies the previous bridge state hash before executing.
 */
export function analyzeThresholdCoreTransitionChain({
  candidate = REVIEW_CANDIDATES.distributedPressureV1,
  fromCores = 6,
  toCores = fromCores + 1,
  boundaryMaxExpanded = 8_000,
  boundaryMaxGenerated = 100_000,
  boundaryMaxGoals = 64,
  maxTransitionSeeds = 8,
  transitionMaxExpanded = 5_000,
  transitionMaxGenerated = 70_000,
  suffixMaxExpanded = 8_000,
  suffixMaxGenerated = 100_000
} = {}) {
  const snapshot = cloneReviewCandidate(candidate);
  const transitionReport = analyzeThresholdCoreTransition({
    candidate: snapshot,
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
      schemaVersion: 1,
      model: 'event-order-core-transition-chain-v0.1',
      candidateId: snapshot.id,
      fromCores,
      toCores,
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
    const thresholdAdapter = createObjectiveThresholdAdapter({
      threshold: referenceHp,
      baseAdapter: fixedAdapter
    });
    const fromBoundaryAdapter = createCoreBoundaryAdapter({
      targetCores: fromCores,
      baseAdapter: thresholdAdapter
    });
    const toBoundaryAdapter = createCoreBoundaryAdapter({
      targetCores: toCores,
      baseAdapter: thresholdAdapter
    });

    const prefixCertificate = transitionReport.transition.prefixCertificate;
    const transitionCertificate = transitionReport.transition.transitionCertificate;
    const prefixReplay = replayTowerCertificateToState(prefixCertificate, {
      adapter: fromBoundaryAdapter
    });
    if (!prefixReplay.ok || !prefixReplay.state) {
      return {
        schemaVersion: 1,
        model: 'event-order-core-transition-chain-v0.1',
        candidateId: snapshot.id,
        fromCores,
        toCores,
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
        schemaVersion: 1,
        model: 'event-order-core-transition-chain-v0.1',
        candidateId: snapshot.id,
        fromCores,
        toCores,
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
    const suffixSolver = solve({
      adapter: thresholdAdapter,
      initialState: transitionReplay.state,
      mode: 'existence',
      maxExpanded: suffixMaxExpanded,
      maxGenerated: suffixMaxGenerated,
      solverVersion: `fixed-purchase-core${toCores}-threshold-suffix-v0.1`
    });
    const suffixReplay = suffixSolver.certificate
      ? replayTowerCertificate(suffixSolver.certificate, {
          adapter: thresholdAdapter,
          initialState: transitionReplay.state
        })
      : null;
    const suffixExploit = suffixSolver.solvable === true
      && suffixReplay?.ok === true
      && Number.isFinite(suffixReplay.objective)
      && suffixReplay.objective > referenceHp;
    const status = classifyThresholdCoreChain({ transitionReport, suffixExploit });
    const suffixExactNoExploitFromThisBridge = suffixSolver.solvable === false && suffixSolver.exact === true;

    const exploit = suffixExploit ? {
      terminalHp: suffixReplay.objective,
      deltaHp: suffixReplay.objective - referenceHp,
      relativeGain: (suffixReplay.objective - referenceHp) / Math.max(1, referenceHp),
      replayOk: true,
      chain: {
        prefixCertificateHash: prefixCertificate?.certificateHash ?? null,
        transitionCertificateHash: transitionCertificate?.certificateHash ?? null,
        suffixCertificateHash: suffixSolver.certificate?.certificateHash ?? null
      },
      final: suffixReplay.final
    } : null;

    return {
      schemaVersion: 1,
      model: 'event-order-core-transition-chain-v0.1',
      candidateId: snapshot.id,
      fromCores,
      toCores,
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
        solver: compactSolver(suffixSolver),
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
        ? 'three_stage_authoritative_certificate_chain_proves_event_order_exploit_above_reference'
        : suffixExactNoExploitFromThisBridge
          ? 'this_threshold_relevant_core7_bridge_is_exactly_non_exploiting_but_other_core7_bridges_remain_possible'
          : 'threshold_relevant_core7_bridge_found_but_terminal_suffix_coverage_is_incomplete'
    };
  });
}
