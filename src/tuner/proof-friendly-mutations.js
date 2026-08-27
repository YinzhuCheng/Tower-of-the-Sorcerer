import { prunabilityMetrics } from './prunability-score.js';

function pushSuggestion(suggestions, id, severity, rationale, levers) {
  suggestions.push({
    id,
    severity: Math.min(1, Math.max(0, Number(severity) || 0)),
    rationale,
    levers: [...levers]
  });
}

/**
 * Translate proof-hostility diagnostics into SETTER-SIDE mutation families.
 *
 * The output is deliberately abstract. A later neighborhood generator decides
 * which concrete enemy/reward/shop/door/topology edit to instantiate. This keeps
 * the diagnostic layer independent from any one map layout.
 */
export function proposeProofFriendlyMutations(evidence = {}, options = {}) {
  const metrics = prunabilityMetrics(evidence, options);
  const suggestions = [];
  const portfolio = evidence.routePortfolio ?? {};
  const purchase = evidence.purchaseTiming ?? {};

  if (metrics.historyInflation > 4) {
    pushSuggestion(
      suggestions,
      'checkpoint-reconvergence',
      Math.min(1, (metrics.historyInflation - 4) / 12),
      'Many distinct histories reach only a small number of current action surfaces. Make optional branches rejoin before the next core/shop/checkpoint and move non-decision rewards after the merge.',
      ['move-pickup-after-merge', 'merge-corridors-before-checkpoint', 'canonicalize-card-inventory', 'make-safe-harvest-mandatory-before-checkpoint']
    );
  }

  if (metrics.travelRatio > 0.45) {
    pushSuggestion(
      suggestions,
      'reduce-cross-floor-permutation',
      (metrics.travelRatio - 0.45) / 0.55,
      'Too much search effort is spent on teleport/backtrack ordering. Concentrate old-floor rewards before a progression checkpoint or make their later value clearly dominated.',
      ['move-reward-before-compass', 'delay-compass', 'gate-old-floor-reentry', 'convert-late-free-harvest-to-mandatory-checkpoint-reward']
    );
  }

  if (metrics.losses.weakBoundPruning > 0.5) {
    pushSuggestion(
      suggestions,
      'tighten-optimistic-slack-by-design',
      metrics.losses.weakBoundPruning,
      'The admissible upper bound remains far above the reference on many states. Reduce globally-free HP/Gold or put valuable rewards behind unavoidable positive cost so optimistic branches close earlier.',
      ['guard-large-hp-with-mandatory-damage', 'reduce-zero-damage-gold-harvest', 'move-hp-behind-checkpoint-tax', 'increase-mandatory-late-damage']
    );
  }

  if (metrics.residual > 32 || metrics.paretoWidth > 8) {
    pushSuggestion(
      suggestions,
      'separate-near-tie-branches',
      Math.max(metrics.losses.residual, metrics.losses.paretoWidth),
      'Too many non-dominated route families survive. Adjust local enemy costs/rewards so most branches become resource-dominated after reconvergence while preserving a small meaningful Pareto set.',
      ['enemy-atk-def-small-delta', 'branch-reward-small-delta', 'door-card-cost-delta', 'move-reward-across-reconvergence']
    );
  }

  const nearTieCount = Number(portfolio.nearTieCount ?? 0);
  if (nearTieCount > 8) {
    pushSuggestion(
      suggestions,
      'break-objective-near-ties',
      Math.min(1, (nearTieCount - 8) / 24),
      'Many routes have nearly identical objective value. Increase separation between branch outcomes so beam search and dominance pruning agree earlier.',
      ['small-reward-delta', 'small-enemy-cost-delta', 'checkpoint-bonus-for-intended-tradeoff']
    );
  }

  const deferredPurchases = Number(purchase.deferredAffordablePurchases ?? 0);
  if (deferredPurchases > 0) {
    pushSuggestion(
      suggestions,
      'checkpoint-shop-timing',
      Math.min(1, deferredPurchases / 4),
      'Affordable fixed-policy purchases are being deferred across many events, creating purchase-timing permutations. Put the shop at a reconvergence checkpoint or tune Gold thresholds so purchase count is nearly canonical.',
      ['move-shop-to-checkpoint', 'tune-gold-threshold', 'reduce-extra-shop-access', 'checkpoint-auto-purchase-in-proof-model']
    );
  }

  if (metrics.paretoWidth < 2 && Number(portfolio.paretoWidth ?? 0) > 0) {
    pushSuggestion(
      suggestions,
      'restore-meaningful-choice',
      0.5,
      'The route family has collapsed too far. Add one controlled tradeoff branch so proofability does not degenerate into a single forced corridor.',
      ['add-two-way-stat-tradeoff', 'optional-risk-reward-pocket', 'alternate-card-spend']
    );
  }

  return suggestions.sort((a, b) => b.severity - a.severity || a.id.localeCompare(b.id));
}
