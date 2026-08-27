import { runGreedyShopStrategy } from '../solver/greedy-strategy.js';
import { createFixedPurchasePolicyTowerAdapter } from '../solver/fixed-purchase-policy-adapter.js';
import { makeGreedyIncumbentWitness } from '../solver/tower-incumbent.js';
import { replayTowerCertificate } from '../solver/replay.js';
import { solve } from '../solver/search.js';
import { withBalanceEdits } from '../tuner/balance-overlay.js';
import { cloneReviewCandidate, REVIEW_CANDIDATES } from '../tuner/review-candidates.js';

function compactSolver(report) {
  return {
    solvable: report.solvable,
    exact: report.exact,
    existenceExact: report.existenceExact,
    objectiveExact: report.objectiveExact,
    stoppedReason: report.stoppedReason,
    objective: { ...report.objective },
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

function referenceRoute(candidate) {
  const policy = candidate.purchasePolicy;
  return runGreedyShopStrategy({
    shopCycle: [...policy.shopCycle],
    shopPlan: [...policy.shopPlan],
    holyPolicy: policy.referenceHolyPolicy ?? 'immediate'
  });
}

function classification({ referenceHp, solver, replay }) {
  const searchBest = solver.objective?.searchBest;
  if (Number.isFinite(searchBest) && searchBest > referenceHp) {
    return replay?.ok === true
      ? 'exploit-found'
      : 'exploit-certificate-invalid';
  }
  if (solver.objectiveExact === true) return 'fixed-purchase-event-order-optimal';
  return 'coverage-incomplete';
}

/**
 * Player best response over authoritative macro-event order while holding one
 * explicit purchase policy fixed.
 *
 * Free dimensions include optional-enemy timing/skip choices, door/card order,
 * puzzle order, pickup timing, Holy's microscopic pickup timing and productive
 * cross-floor recovery. The only removed actions are shop choices inconsistent
 * with the fixed policy.
 *
 * A verified greedy route supplies a sound feasible lower bound. Any better
 * Solver goal is authoritatively replayed and becomes an exploit witness. Queue
 * exhaustion proves optimality only inside this fixed-purchase sub-problem; a
 * budget stop remains coverage-incomplete and is never upgraded to global
 * player optimality.
 */
export function analyzeFixedPurchaseEventOrder({
  candidate = REVIEW_CANDIDATES.distributedPressureV1,
  maxExpanded = 12_000,
  maxGenerated = 180_000
} = {}) {
  const snapshot = cloneReviewCandidate(candidate);
  if (!Number.isInteger(maxExpanded) || maxExpanded < 1) throw new Error('maxExpanded must be a positive integer.');
  if (!Number.isInteger(maxGenerated) || maxGenerated < 1) throw new Error('maxGenerated must be a positive integer.');

  return withBalanceEdits(snapshot.edits, (normalizedEdits) => {
    const reference = referenceRoute(snapshot);
    const referenceHp = reference.solvable ? reference.final.hp : null;
    const expectedHp = snapshot.expectedEvidence?.terminalHp ?? null;
    const snapshotMatches = reference.solvable
      && (!Number.isFinite(expectedHp) || referenceHp === expectedHp);

    if (!snapshotMatches) {
      return {
        schemaVersion: 1,
        model: 'fixed-purchase-event-order-best-response-v0.1',
        candidateId: snapshot.id,
        status: 'candidate-snapshot-drift',
        coverageExact: false,
        exploitFound: false,
        edits: normalizedEdits,
        reference: {
          solvable: reference.solvable,
          failure: reference.failure,
          terminalHp: referenceHp,
          expectedTerminalHp: expectedHp,
          snapshotMatches
        },
        solver: null,
        replay: null
      };
    }

    const policy = snapshot.purchasePolicy;
    const adapter = createFixedPurchasePolicyTowerAdapter({
      shopPlan: policy.shopPlan,
      shopCycle: policy.shopCycle
    });
    const incumbentWitness = makeGreedyIncumbentWitness({
      id: `${snapshot.id}@fixed-purchase-reference`,
      cycle: [...policy.shopCycle],
      shopPlan: [...policy.shopPlan],
      holyPolicy: policy.referenceHolyPolicy ?? 'immediate'
    });
    const solver = solve({
      adapter,
      mode: 'optimize',
      maxExpanded,
      maxGenerated,
      incumbentWitness,
      solverVersion: 'fixed-purchase-event-order-v0.1'
    });
    const replay = solver.certificate
      ? replayTowerCertificate(solver.certificate, { adapter })
      : null;
    const searchBest = solver.objective?.searchBest;
    const exploitFound = Number.isFinite(searchBest) && searchBest > referenceHp;
    const replayedExploit = exploitFound
      && replay?.ok === true
      && replay.objective === searchBest;
    const status = classification({ referenceHp, solver, replay });

    return {
      schemaVersion: 1,
      model: 'fixed-purchase-event-order-best-response-v0.1',
      candidateId: snapshot.id,
      status,
      productionWriteAllowed: false,
      edits: normalizedEdits,
      fixedPurchasePolicy: {
        shopPlan: [...policy.shopPlan],
        shopCycle: [...policy.shopCycle],
        referenceHolyPolicy: policy.referenceHolyPolicy ?? 'immediate',
        policyHash: adapter.fixedPurchasePolicy.policyHash
      },
      reference: {
        solvable: reference.solvable,
        terminalHp: referenceHp,
        expectedTerminalHp: expectedHp,
        snapshotMatches,
        minNormalizedHpMargin: reference.minNormalizedHpMargin,
        purchaseCounts: { ...reference.purchaseCounts },
        battles: reference.battles,
        holyAcquisition: reference.holyAcquisition
      },
      coverageExact: solver.objectiveExact === true,
      exploitFound,
      replayedExploit,
      exploit: exploitFound ? {
        referenceHp,
        searchBest,
        deltaHp: searchBest - referenceHp,
        relativeGain: (searchBest - referenceHp) / Math.max(1, referenceHp),
        certificateHash: solver.certificate?.certificateHash ?? null,
        replayOk: replay?.ok === true,
        final: replay?.final ?? null
      } : null,
      solver: compactSolver(solver),
      replay: replay ? {
        ok: replay.ok,
        failures: replay.failures,
        objective: replay.objective,
        final: replay.final
      } : null,
      interpretation: status === 'exploit-found'
        ? 'authoritative_event_order_exploit_found_under_fixed_purchase_policy'
        : status === 'fixed-purchase-event-order-optimal'
          ? 'fixed_purchase_event_order_space_exhausted_without_better_route'
          : status === 'coverage-incomplete'
            ? 'bounded_event_order_search_found_no_better_replayable_route_but_did_not_exhaust_space'
            : status === 'exploit-certificate-invalid'
              ? 'search_reported_a_better_goal_but_authoritative_replay_failed'
              : 'candidate_snapshot_no_longer_matches_repository_evidence'
    };
  });
}
