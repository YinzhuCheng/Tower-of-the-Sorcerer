function clamp01(value) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(1, Math.max(0, value));
}

function ratio(numerator, denominator, fallback = 0) {
  const n = Number(numerator);
  const d = Number(denominator);
  if (!Number.isFinite(n) || !Number.isFinite(d) || d <= 0) return fallback;
  return n / d;
}

function distanceToBand(value, [low, high]) {
  if (!Number.isFinite(value)) return 1;
  if (value < low) return clamp01((low - value) / Math.max(1, low));
  if (value > high) return clamp01((value - high) / Math.max(1, high));
  return 0;
}

function logarithmicLoss(value, softLimit) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (!Number.isFinite(softLimit) || softLimit <= 0) return 1;
  return clamp01(Math.log1p(value) / Math.log1p(softLimit * 4));
}

/**
 * Convert heterogeneous Solver / boundary / bridge diagnostics into a stable
 * [0, 1] "proof difficulty" vector. 0 means the candidate is easy to collapse;
 * 1 means the current search evidence is highly permutation-heavy / proof-hostile.
 *
 * This is intentionally a DESIGN score, not a correctness proof. Approximate or
 * bounded searches may feed it while the generator is exploring tower variants.
 * Promotion still uses the repository's authoritative replay / exact-or-sound
 * proof gates.
 */
export function prunabilityMetrics(evidence = {}, {
  paretoWidthBand = [2, 8],
  residualSoftLimit = 32,
  historyInflationSoftLimit = 4,
  travelRatioTarget = 0.35,
  boundPruneTarget = 0.12,
  dominancePruneTarget = 0.10
} = {}) {
  const search = evidence.search ?? {};
  const boundary = evidence.boundary ?? {};
  const bridge = evidence.bridge ?? {};
  const suffix = evidence.suffix ?? {};
  const portfolio = evidence.routePortfolio ?? {};

  const paretoWidth = Number(portfolio.paretoWidth ?? boundary.activeGoalLabels ?? 0);
  const residual = Number(bridge.residual ?? boundary.residual ?? 0);
  const goalStructural = Number(boundary.goalStructuralStates ?? boundary.activeGoalLabels ?? 0);
  const actionSurfaces = Number(boundary.actionSurfaceStructuralStates ?? goalStructural || 1);
  const historyInflation = goalStructural > 0 ? goalStructural / Math.max(1, actionSurfaces) : 1;

  const boundPruneRate = ratio(search.prunedBound, Number(search.expandedStates ?? 0) + Number(search.prunedBound ?? 0));
  const dominancePruneRate = ratio(search.prunedDominated, search.generatedStates);
  const travelRatio = clamp01(Number(suffix.travelRatio ?? suffix.travelGeneratedRatio ?? 0));

  const budgetPressure = Math.max(
    ratio(search.expandedStates, search.maxExpanded),
    ratio(search.generatedStates, search.maxGenerated)
  );

  const losses = {
    paretoWidth: distanceToBand(paretoWidth, paretoWidthBand),
    residual: logarithmicLoss(residual, residualSoftLimit),
    historyInflation: historyInflation <= 1
      ? 0
      : clamp01((historyInflation - 1) / Math.max(1e-9, historyInflationSoftLimit - 1)),
    travelPermutation: travelRatio <= travelRatioTarget
      ? 0
      : clamp01((travelRatio - travelRatioTarget) / Math.max(1e-9, 1 - travelRatioTarget)),
    weakBoundPruning: boundPruneRate >= boundPruneTarget
      ? 0
      : clamp01((boundPruneTarget - boundPruneRate) / Math.max(1e-9, boundPruneTarget)),
    weakDominancePruning: dominancePruneRate >= dominancePruneTarget
      ? 0
      : clamp01((dominancePruneTarget - dominancePruneRate) / Math.max(1e-9, dominancePruneTarget)),
    budgetPressure: clamp01(budgetPressure)
  };

  return {
    paretoWidth,
    residual,
    goalStructuralStates: goalStructural,
    actionSurfaceStructuralStates: actionSurfaces,
    historyInflation,
    boundPruneRate,
    dominancePruneRate,
    travelRatio,
    budgetPressure: clamp01(budgetPressure),
    losses
  };
}

export function scorePrunabilityEvidence(evidence = {}, {
  weights = {
    paretoWidth: 0.18,
    residual: 0.22,
    historyInflation: 0.16,
    travelPermutation: 0.14,
    weakBoundPruning: 0.14,
    weakDominancePruning: 0.08,
    budgetPressure: 0.08
  },
  ...metricOptions
} = {}) {
  const metrics = prunabilityMetrics(evidence, metricOptions);
  let weighted = 0;
  let totalWeight = 0;
  for (const [key, rawWeight] of Object.entries(weights)) {
    const weight = Number(rawWeight);
    if (!Number.isFinite(weight) || weight <= 0) continue;
    weighted += weight * Number(metrics.losses[key] ?? 0);
    totalWeight += weight;
  }
  return {
    score: totalWeight > 0 ? weighted / totalWeight : 0,
    metrics
  };
}

/**
 * Candidate score for the "we are the puzzle setter" loop.
 *
 * A replay-verified solvability witness is the only mandatory generation-time
 * gate. Exact closure is deliberately NOT required here: heuristic / beam / MCTS
 * player models may guide mutation. Exact-or-sound proof remains a later
 * promotion gate.
 */
export function scoreTowerCodesignCandidate({
  qualityLoss = 0,
  funLoss = 0,
  editLoss = 0,
  solvabilityWitnessVerified = false,
  prunabilityEvidence = {}
} = {}, {
  qualityWeight = 0.40,
  funWeight = 0.20,
  prunabilityWeight = 0.35,
  editWeight = 0.05,
  prunabilityOptions = {}
} = {}) {
  if (!solvabilityWitnessVerified) return {
    score: Number.POSITIVE_INFINITY,
    prunability: scorePrunabilityEvidence(prunabilityEvidence, prunabilityOptions)
  };
  const prunability = scorePrunabilityEvidence(prunabilityEvidence, prunabilityOptions);
  const score = Number(qualityLoss) * qualityWeight
    + Number(funLoss) * funWeight
    + prunability.score * prunabilityWeight
    + Number(editLoss) * editWeight;
  return { score, prunability };
}
