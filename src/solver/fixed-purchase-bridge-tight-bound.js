import { explainFixedPurchaseTerminalHpUpperBound } from './fixed-purchase-bound-diagnostics.js';
import { previewDiscreteHarvestAndPureHpAccessTightening } from './discrete-harvest-bound-preview.js';

/**
 * Sound bridge-level proof that no terminal objective strictly above `threshold`
 * can descend from one replay-verified fixed-purchase Tower state.
 *
 * This deliberately runs only at staged bridge boundaries. It first reconstructs
 * the existing proof-level fixed-purchase upper bound and requires an exact match
 * with `adapter.objectiveUpperBound(state)`. It then applies two tighter but still
 * optimistic relaxations:
 *
 * 1. remaining enemy Gold is indivisible (0/1 minimum-damage harvest rather than
 *    fractional enemy kills), while topology/order remain relaxed;
 * 2. one pure-HP F8 reward obeys a skip-or-collect access constraint on a graph
 *    that preserves walls but relaxes every non-enemy mechanic to free transit.
 *
 * The access constraint overlaps with the discrete harvest damage through max,
 * never sum, so the same battle is not charged twice. The strongest single HP
 * reward is used rather than summing shared access paths.
 *
 * If the resulting admissible upper bound is <= threshold, existence of a goal
 * with objective > threshold is impossible from this bridge. Otherwise this
 * helper says only "not closed"; it never treats residual slack as an exploit or
 * infeasibility proof.
 */
export function proveFixedPurchaseBridgeBelowThreshold({
  adapter,
  state,
  threshold,
  shopPlan = [],
  shopCycle = ['def', 'atk', 'hp'],
  pureHpFloorId = 7
} = {}) {
  if (!adapter || typeof adapter.objectiveUpperBound !== 'function') {
    throw new Error('Bridge tight-bound proof requires objectiveUpperBound().');
  }
  if (!Number.isFinite(threshold)) throw new Error('Bridge tight-bound proof requires a finite threshold.');

  const old = explainFixedPurchaseTerminalHpUpperBound({
    adapter,
    state,
    shopPlan,
    shopCycle
  });
  if (!old.exactMatch) {
    throw new Error('Bridge tight-bound proof refuses an unverified old-bound decomposition.');
  }

  const tight = previewDiscreteHarvestAndPureHpAccessTightening({
    adapter,
    state,
    boundExplanation: old,
    floorId: pureHpFloorId
  });
  const oldUpperBound = old.explainedUpperBound;
  const tightUpperBound = tight.previewUpperBound;
  if (!Number.isFinite(oldUpperBound)) {
    throw new Error('Bridge tight-bound proof requires a finite old upper bound.');
  }
  if (tightUpperBound > oldUpperBound + 1e-9) {
    throw new Error(`Tight bridge bound weakened the old bound: ${tightUpperBound} > ${oldUpperBound}.`);
  }

  const provesNoExploit = Number.isFinite(tightUpperBound)
    && tightUpperBound <= threshold;
  const best = tight.best ?? null;
  const access = best?.strongestAccessConstraint ?? null;
  return {
    schemaVersion: 1,
    model: 'fixed-purchase-bridge-tight-bound-proof-v0.1',
    soundOverApproximation: true,
    proofScope: 'single-replay-verified-fixed-purchase-bridge',
    proofBoundModifiedGlobally: false,
    threshold: {
      objective: 'terminal_hp',
      strictGreaterThan: threshold
    },
    rulesVersion: adapter.rulesVersion?.() ?? null,
    oldUpperBound,
    tightUpperBound,
    tightening: oldUpperBound - tightUpperBound,
    oldThresholdSlack: oldUpperBound - threshold,
    tightThresholdSlack: tightUpperBound - threshold,
    provesNoExploit,
    relaxation: {
      discreteEnemyHarvest: true,
      singlePureHpAccessConstraint: true,
      topologyOtherwiseRelaxed: true,
      fractionalHarvestDamage: best?.fractionalHarvestDamage ?? null,
      discreteHarvestDamage: best?.discreteHarvestDamage ?? null,
      discreteHarvestIncrement: best?.discreteIncrement ?? null,
      zeroDamageGold: tight.harvest?.zeroDamageGold ?? null,
      totalHarvestGold: tight.harvest?.totalHarvestGold ?? null,
      excludedUnwinnableGold: tight.harvest?.excludedUnwinnableGold ?? null,
      bestPurchaseCount: best?.purchaseCount ?? null,
      requiredEnemyGold: best?.requiredEnemyGold ?? null,
      accessConstraint: access ? {
        itemId: access.itemId,
        x: access.x,
        y: access.y,
        creditedObjectiveHp: access.creditedObjectiveHp,
        accessDamageLowerBound: access.accessDamageLowerBound,
        accessBeyondHarvest: access.accessBeyondHarvest,
        additionalPenalty: best?.accessAdditionalPenalty ?? 0
      } : null
    },
    interpretation: provesNoExploit
      ? 'tight_admissible_bridge_upper_bound_eliminates_every_terminal_objective_above_threshold'
      : 'tight_admissible_bridge_upper_bound_remains_above_threshold_and_suffix_search_is_still_required'
  };
}
