import { runGreedyShopStrategy } from '../solver/greedy-strategy.js';
import { createFixedPurchasePolicyTowerAdapter } from '../solver/fixed-purchase-policy-adapter.js';
import { createObjectiveThresholdAdapter } from '../solver/objective-threshold-adapter.js';
import { replayTowerCertificate } from '../solver/replay.js';
import { solve } from '../solver/search.js';
import { withBalanceEdits } from '../tuner/balance-overlay.js';
import { cloneReviewCandidate, REVIEW_CANDIDATES } from '../tuner/review-candidates.js';

function referenceRoute(candidate) {
  const policy = candidate.purchasePolicy;
  return runGreedyShopStrategy({
    shopCycle: [...policy.shopCycle],
    shopPlan: [...policy.shopPlan],
    holyPolicy: policy.referenceHolyPolicy ?? 'immediate'
  });
}

function compactSolver(report) {
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
 * Exact-question version of the fixed-purchase event-order analysis:
 *
 *     exists victory with terminal HP > authoritative reference HP ?
 *
 * Unlike ordinary optimize mode, this proof does not need to install the
 * reference route as an incumbent. The objective-threshold adapter turns the
 * overlay-aware fixed-policy terminal-HP upper bound into a proof-level dead-end
 * test. Queue exhaustion with no goal therefore proves there is no better event
 * ordering under this purchase policy. A bounded stop remains incomplete.
 */
export function proveFixedPurchaseEventOrderThreshold({
  candidate = REVIEW_CANDIDATES.distributedPressureV1,
  maxExpanded = 50_000,
  maxGenerated = 400_000
} = {}) {
  const snapshot = cloneReviewCandidate(candidate);
  if (!Number.isInteger(maxExpanded) || maxExpanded < 1) throw new Error('maxExpanded must be positive.');
  if (!Number.isInteger(maxGenerated) || maxGenerated < 1) throw new Error('maxGenerated must be positive.');

  return withBalanceEdits(snapshot.edits, (normalizedEdits) => {
    const reference = referenceRoute(snapshot);
    const referenceHp = reference.solvable ? reference.final.hp : null;
    const expectedHp = snapshot.expectedEvidence?.terminalHp ?? null;
    if (!reference.solvable || (Number.isFinite(expectedHp) && referenceHp !== expectedHp)) {
      return {
        schemaVersion: 1,
        model: 'fixed-purchase-event-order-threshold-proof-v0.1',
        candidateId: snapshot.id,
        status: 'candidate-snapshot-drift',
        exactNoExploit: false,
        exploitFound: false,
        reference: {
          solvable: reference.solvable,
          failure: reference.failure,
          terminalHp: referenceHp,
          expectedTerminalHp: expectedHp
        }
      };
    }

    const policy = snapshot.purchasePolicy;
    const fixedAdapter = createFixedPurchasePolicyTowerAdapter({
      shopPlan: policy.shopPlan,
      shopCycle: policy.shopCycle
    });
    const thresholdAdapter = createObjectiveThresholdAdapter({
      threshold: referenceHp,
      baseAdapter: fixedAdapter
    });
    const solver = solve({
      adapter: thresholdAdapter,
      mode: 'existence',
      maxExpanded,
      maxGenerated,
      solverVersion: 'fixed-purchase-event-order-threshold-proof-v0.1'
    });
    const replay = solver.certificate
      ? replayTowerCertificate(solver.certificate, { adapter: thresholdAdapter })
      : null;
    const exploitFound = solver.solvable === true
      && replay?.ok === true
      && Number.isFinite(replay.objective)
      && replay.objective > referenceHp;
    const exactNoExploit = solver.solvable === false && solver.exact === true;
    const status = exploitFound
      ? 'exploit-found'
      : exactNoExploit
        ? 'no-exploit-exact'
        : 'coverage-incomplete';

    return {
      schemaVersion: 1,
      model: 'fixed-purchase-event-order-threshold-proof-v0.1',
      candidateId: snapshot.id,
      status,
      productionWriteAllowed: false,
      exploitFound,
      exactNoExploit,
      edits: normalizedEdits,
      reference: {
        terminalHp: referenceHp,
        expectedTerminalHp: expectedHp,
        minNormalizedHpMargin: reference.minNormalizedHpMargin,
        purchaseCounts: { ...reference.purchaseCounts }
      },
      threshold: {
        objective: 'terminal_hp',
        strictGreaterThan: referenceHp,
        proofRule: 'admissible fixed-policy terminal-HP upper bound <= threshold is a proven dead end'
      },
      solver: compactSolver(solver),
      exploit: exploitFound ? {
        terminalHp: replay.objective,
        deltaHp: replay.objective - referenceHp,
        relativeGain: (replay.objective - referenceHp) / Math.max(1, referenceHp),
        certificateHash: solver.certificate?.certificateHash ?? null,
        replayOk: replay.ok,
        final: replay.final
      } : null,
      replay: replay ? {
        ok: replay.ok,
        failures: replay.failures,
        objective: replay.objective,
        final: replay.final
      } : null,
      interpretation: exploitFound
        ? 'authoritative_whole_game_event_order_exploit_found_under_fixed_purchase_policy'
        : exactNoExploit
          ? 'whole_fixed_purchase_event_order_space_exhausted_above_reference_threshold'
          : 'whole_game_threshold_search_found_no_exploit_within_budget_but_did_not_exhaust_space'
    };
  });
}
