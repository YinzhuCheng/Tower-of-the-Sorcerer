import { createCoreBoundaryAdapter } from '../solver/core-boundary-adapter.js';
import { createFixedPurchasePolicyTowerAdapter } from '../solver/fixed-purchase-policy-adapter.js';
import { collectGoalFrontier } from '../solver/goal-frontier.js';
import { createObjectiveThresholdAdapter } from '../solver/objective-threshold-adapter.js';
import { replayTowerCertificateToState } from '../solver/replay.js';
import { hashValue } from '../solver/state.js';
import { withBalanceEdits } from '../tuner/balance-overlay.js';
import { resolveReviewCandidateReference } from '../tuner/review-candidate-reference.js';
import { cloneReviewCandidate, REVIEW_CANDIDATES } from '../tuner/review-candidates.js';

function certificateHash(certificate) {
  return certificate?.certificateHash ?? null;
}

function compactFrontier(report) {
  return {
    hasGoals: report.hasGoals,
    coverageExact: report.coverageExact,
    stoppedReason: report.stoppedReason,
    maxGoals: report.maxGoals,
    activeGoalLabels: report.activeGoalLabels,
    goalStructuralStates: report.goalStructuralStates,
    goalFrontierPeak: report.goalFrontierPeak,
    expandedStates: report.expandedStates,
    generatedStates: report.generatedStates,
    prunedDominated: report.prunedDominated,
    stalePops: report.stalePops,
    structuralStates: report.structuralStates,
    activeSearchLabels: report.activeSearchLabels,
    profile: report.profile
  };
}

function cardsSignature(resources = {}) {
  return `${resources.sun ?? 0}/${resources.moon ?? 0}/${resources.star ?? 0}`;
}

function numericRange(values) {
  const finite = values.map(Number).filter(Number.isFinite);
  if (!finite.length) return { min: null, max: null };
  return { min: Math.min(...finite), max: Math.max(...finite) };
}

/**
 * Summarize a replay-verified bridge set by purchase progress, resources, cards
 * and authoritative structural identity. This is pure telemetry: no bucket is
 * treated as a proof abstraction.
 */
export function summarizeBridgeFrontierDiversity(bridges = []) {
  const byPurchase = new Map();
  for (const bridge of bridges) {
    const purchase = Number(bridge.shopPurchases);
    if (!byPurchase.has(purchase)) byPurchase.set(purchase, []);
    byPurchase.get(purchase).push(bridge);
  }

  const strata = [...byPurchase.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([shopPurchases, entries]) => {
      const structuralSignatures = new Set(entries.map((entry) => entry.structuralKeyHash));
      const cardSignatures = new Set(entries.map((entry) => cardsSignature(entry.resources)));
      const upperBounds = entries.map((entry) => entry.upperBound);
      const gold = entries.map((entry) => entry.resources?.gold);
      const hp = entries.map((entry) => entry.resources?.hp);
      const maxHp = entries.map((entry) => entry.resources?.maxHp);
      return {
        shopPurchases,
        count: entries.length,
        uniqueStructuralStates: structuralSignatures.size,
        uniqueCardVectors: cardSignatures.size,
        cardVectors: [...cardSignatures].sort(),
        gold: numericRange(gold),
        hp: numericRange(hp),
        maxHp: numericRange(maxHp),
        upperBound: numericRange(upperBounds),
        samples: [...entries]
          .sort((a, b) => b.upperBound - a.upperBound
            || (b.resources?.gold ?? 0) - (a.resources?.gold ?? 0)
            || String(a.certificateHash).localeCompare(String(b.certificateHash)))
          .slice(0, 4)
          .map((entry) => ({
            certificateHash: entry.certificateHash,
            resources: entry.resources,
            upperBound: entry.upperBound,
            structuralKeyHash: entry.structuralKeyHash
          }))
      };
    });

  return {
    bridgeCount: bridges.length,
    purchaseStrataCount: strata.length,
    purchaseCounts: strata.map((entry) => entry.shopPurchases),
    uniqueStructuralStates: new Set(bridges.map((entry) => entry.structuralKeyHash)).size,
    uniqueCardVectors: new Set(bridges.map((entry) => cardsSignature(entry.resources))).size,
    gold: numericRange(bridges.map((entry) => entry.resources?.gold)),
    hp: numericRange(bridges.map((entry) => entry.resources?.hp)),
    upperBound: numericRange(bridges.map((entry) => entry.upperBound)),
    strata
  };
}

/**
 * Expand a small number of representative c7 bridge frontiers before spending
 * more terminal-suffix budget. The goal is to discover whether the current
 * 8-goal sample hides new purchase/economic/structural strata.
 *
 * This analyzer is diagnostic-only and can never claim exact no-exploit. A
 * frontier may itself exhaust exactly, but no terminal suffixes are analyzed
 * here and unscheduled c6 prefixes remain uncovered.
 */
export function analyzeThresholdCoreBridgeFrontierGrowth({
  candidate = REVIEW_CANDIDATES.distributedPressureV3,
  referenceWitness = null,
  fromCores = 6,
  toCores = fromCores + 1,
  fromBoundaryMaxExpanded = 8_000,
  fromBoundaryMaxGenerated = 100_000,
  fromBoundaryMaxGoals = 64,
  maxPrefixSeeds = 3,
  bridgeMaxExpandedPerPrefix = 6_000,
  bridgeMaxGeneratedPerPrefix = 90_000,
  bridgeMaxGoalsPerPrefix = 32
} = {}) {
  const snapshot = cloneReviewCandidate(candidate);
  for (const [name, value] of Object.entries({
    fromCores,
    toCores,
    fromBoundaryMaxExpanded,
    fromBoundaryMaxGenerated,
    fromBoundaryMaxGoals,
    maxPrefixSeeds,
    bridgeMaxExpandedPerPrefix,
    bridgeMaxGeneratedPerPrefix,
    bridgeMaxGoalsPerPrefix
  })) {
    if (!Number.isInteger(value) || value < 1) throw new Error(`${name} must be a positive integer.`);
  }
  if (toCores <= fromCores) throw new Error('toCores must be greater than fromCores.');

  return withBalanceEdits(snapshot.edits, () => {
    const policy = snapshot.purchasePolicy;
    const fixedAdapter = createFixedPurchasePolicyTowerAdapter({
      shopPlan: policy.shopPlan,
      shopCycle: policy.shopCycle
    });
    const reference = resolveReviewCandidateReference({
      candidate: snapshot,
      adapter: fixedAdapter,
      referenceWitness
    });
    const referenceHp = reference.ok ? reference.terminalHp : null;
    if (!reference.ok || !Number.isFinite(referenceHp)) {
      return {
        schemaVersion: 1,
        model: 'event-order-core-bridge-frontier-growth-v0.1',
        candidateId: snapshot.id,
        productionWriteAllowed: false,
        status: 'candidate-snapshot-drift',
        exactNoExploit: false,
        reference: {
          terminalHp: reference.terminalHp ?? null,
          expectedTerminalHp: snapshot.expectedEvidence?.terminalHp ?? null,
          failures: reference.failures ?? ['reference_resolution_failed']
        },
        interpretation: 'reference_failed_before_bridge_frontier_growth'
      };
    }

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

    const fromFrontier = collectGoalFrontier({
      adapter: fromBoundaryAdapter,
      maxExpanded: fromBoundaryMaxExpanded,
      maxGenerated: fromBoundaryMaxGenerated,
      maxGoals: fromBoundaryMaxGoals,
      solverVersion: `fixed-purchase-core${fromCores}-bridge-growth-prefix-v0.1`
    });
    const verifiedPrefixes = fromFrontier.goals.map((goal) => {
      const replay = replayTowerCertificateToState(goal.certificate, { adapter: fromBoundaryAdapter });
      if (!replay.ok || !replay.state) return null;
      const upperBound = fixedAdapter.objectiveUpperBound(replay.state);
      if (!Number.isFinite(upperBound) || upperBound <= referenceHp) return null;
      return {
        goal,
        state: replay.state,
        resources: fixedAdapter.resources(replay.state),
        shopPurchases: replay.state.shopPurchases,
        upperBound
      };
    }).filter(Boolean).sort((a, b) => b.upperBound - a.upperBound
      || (b.resources?.gold ?? 0) - (a.resources?.gold ?? 0)
      || String(certificateHash(a.goal.certificate)).localeCompare(String(certificateHash(b.goal.certificate))));
    const scheduledPrefixes = verifiedPrefixes.slice(0, maxPrefixSeeds);

    const attempts = [];
    for (const prefix of scheduledPrefixes) {
      const bridgeFrontier = collectGoalFrontier({
        adapter: toBoundaryAdapter,
        initialState: prefix.state,
        maxExpanded: bridgeMaxExpandedPerPrefix,
        maxGenerated: bridgeMaxGeneratedPerPrefix,
        maxGoals: bridgeMaxGoalsPerPrefix,
        solverVersion: `fixed-purchase-core${fromCores}-to-core${toCores}-bridge-growth-v0.1-g${bridgeMaxGoalsPerPrefix}`
      });
      const replayable = [];
      let replayFailures = 0;
      let belowThreshold = 0;
      for (const goal of bridgeFrontier.goals) {
        const replay = replayTowerCertificateToState(goal.certificate, {
          adapter: toBoundaryAdapter,
          initialState: prefix.state
        });
        if (!replay.ok || !replay.state) {
          replayFailures += 1;
          continue;
        }
        const upperBound = fixedAdapter.objectiveUpperBound(replay.state);
        if (!Number.isFinite(upperBound) || upperBound <= referenceHp) {
          belowThreshold += 1;
          continue;
        }
        const structuralKey = fixedAdapter.structuralKey(replay.state);
        replayable.push({
          certificateHash: certificateHash(goal.certificate),
          resources: fixedAdapter.resources(replay.state),
          shopPurchases: replay.state.shopPurchases,
          upperBound,
          thresholdSlack: upperBound - referenceHp,
          structuralKeyHash: hashValue(structuralKey)
        });
      }
      attempts.push({
        prefixCertificateHash: certificateHash(prefix.goal.certificate),
        prefixResources: prefix.resources,
        prefixShopPurchases: prefix.shopPurchases,
        prefixUpperBound: prefix.upperBound,
        frontier: compactFrontier(bridgeFrontier),
        replayFailures,
        belowThreshold,
        replayableThresholdRelevant: replayable.length,
        diversity: summarizeBridgeFrontierDiversity(replayable)
      });
    }

    const observedPurchaseCounts = [...new Set(attempts.flatMap((attempt) => attempt.diversity.purchaseCounts))]
      .sort((a, b) => b - a);
    return {
      schemaVersion: 1,
      model: 'event-order-core-bridge-frontier-growth-v0.1',
      candidateId: snapshot.id,
      fromCores,
      toCores,
      productionWriteAllowed: false,
      status: 'diagnostic-complete',
      exactNoExploit: false,
      reference: {
        terminalHp: referenceHp,
        minNormalizedHpMargin: reference.minNormalizedHpMargin,
        referenceWitnessHash: reference.referenceWitnessHash ?? null,
        purchaseCount: reference.purchaseCount ?? null
      },
      fromBoundary: compactFrontier(fromFrontier),
      prefixSchedule: {
        verifiedRelevantPrefixCount: verifiedPrefixes.length,
        scheduledPrefixCount: scheduledPrefixes.length,
        attemptedAllVerified: scheduledPrefixes.length === verifiedPrefixes.length
      },
      bridgeGoalCap: bridgeMaxGoalsPerPrefix,
      observedPurchaseCounts,
      observedNewPurchaseStratumBeyond20And21: observedPurchaseCounts.some((count) => count !== 20 && count !== 21),
      attempts,
      interpretation: observedPurchaseCounts.some((count) => count !== 20 && count !== 21)
        ? 'expanded_c7_frontiers_expose_new_purchase-progress_strata_for_future_suffix_sampling'
        : attempts.some((attempt) => attempt.frontier.stoppedReason === 'maxGoals')
          ? 'expanded_c7_frontiers_still_hit_the_goal_cap_without_new_purchase_strata_so_structural_card_diversity_or_bound_quality_is_the_next_axis'
          : 'representative_c7_frontiers_were_profiled_without_new_purchase_strata'
    };
  });
}
