import { ENEMIES } from '../game/data.js';
import { calculateBattle, parseToken } from '../game/engine.js';
import {
  relaxedFloorAccessDamageLowerBound,
  remainingPureHpItemsOnFloor
} from './relaxed-pure-hp-access-bound.js';

function enemyGold(enemy, luckyMultiplier) {
  return Math.max(0, Number(enemy?.gold ?? 0)) * luckyMultiplier
    + Math.max(0, Number(enemy?.reward?.gold ?? 0));
}

/** Exact 0/1 minimum cost to collect at least target value from indivisible offers. */
export function integerMinimumCostForValue(offers, targetValue) {
  const target = Math.max(0, Math.ceil(Number(targetValue) || 0));
  if (target === 0) return 0;
  const normalized = (offers ?? [])
    .map((offer) => ({
      value: Math.max(0, Math.floor(Number(offer.value) || 0)),
      cost: Number(offer.cost)
    }))
    .filter((offer) => offer.value > 0 && Number.isFinite(offer.cost) && offer.cost >= 0);
  if (normalized.reduce((sum, offer) => sum + offer.value, 0) < target) {
    return Number.POSITIVE_INFINITY;
  }

  const dp = Array(target + 1).fill(Number.POSITIVE_INFINITY);
  dp[0] = 0;
  for (const offer of normalized) {
    const next = [...dp];
    for (let value = 0; value <= target; value += 1) {
      if (!Number.isFinite(dp[value])) continue;
      const reached = Math.min(target, value + offer.value);
      const cost = dp[value] + offer.cost;
      if (cost < next[reached]) next[reached] = cost;
    }
    for (let value = 0; value <= target; value += 1) dp[value] = next[value];
  }
  return dp[target];
}

export function remainingEnemyHarvestOffers({
  adapter,
  state,
  atk,
  def,
  wardAvailable,
  luckyMultiplier
} = {}) {
  if (!adapter || typeof adapter.materializeState !== 'function') {
    throw new Error('Discrete harvest preview requires materializeState().');
  }
  const materialized = adapter.materializeState(state);
  const offers = [];
  let excludedUnwinnableGold = 0;
  for (let floor = 0; floor < materialized.floorStates.length; floor += 1) {
    const map = materialized.floorStates[floor]?.map ?? [];
    for (let y = 0; y < map.length; y += 1) {
      for (let x = 0; x < map[y].length; x += 1) {
        const parsed = parseToken(map[y][x]);
        if (parsed.type !== 'enemy') continue;
        const enemy = ENEMIES[parsed.id];
        if (!enemy) continue;
        const value = enemyGold(enemy, luckyMultiplier);
        if (value <= 0) continue;
        const battle = calculateBattle(
          { hp: Number.MAX_SAFE_INTEGER, atk, def },
          enemy,
          { ward: wardAvailable }
        );
        if (!battle.winnable || !Number.isFinite(battle.totalDamage)) {
          // max optimistic future stats are an upper envelope of all actual
          // pre-terminal combat stats. If an enemy remains unwinnable even here,
          // its Gold cannot fund a real pre-terminal purchase.
          excludedUnwinnableGold += value;
          continue;
        }
        offers.push({
          floor: floor + 1,
          x,
          y,
          enemyId: parsed.id,
          value,
          cost: Math.max(0, battle.totalDamage)
        });
      }
    }
  }
  return {
    offers,
    excludedUnwinnableGold,
    totalHarvestGold: offers.reduce((sum, offer) => sum + offer.value, 0),
    zeroDamageGold: offers.filter((offer) => offer.cost === 0).reduce((sum, offer) => sum + offer.value, 0),
    positiveDamageOffers: offers.filter((offer) => offer.cost > 0)
  };
}

/**
 * Diagnostic-only combination of two sound lower-bound improvements:
 *
 * 1. enemy Gold is indivisible (0/1 minimum-damage knapsack rather than a
 *    fractional relaxation);
 * 2. one pure-HP reward may require positive relaxed access damage.
 *
 * The access constraint is combined with the discrete harvest lower bound via
 * max, not sum, because the same enemy combat may satisfy both obligations.
 */
export function previewDiscreteHarvestAndPureHpAccessTightening({
  adapter,
  state,
  boundExplanation,
  floorId = 7
} = {}) {
  if (!boundExplanation?.exactMatch || !Array.isArray(boundExplanation.scenarios)) {
    throw new Error('Discrete harvest preview requires a cross-checked old bound explanation.');
  }
  const relaxation = boundExplanation.relaxation ?? {};
  const harvest = remainingEnemyHarvestOffers({
    adapter,
    state,
    atk: relaxation.maxHarvestAtk,
    def: relaxation.maxHarvestDef,
    wardAvailable: relaxation.wardAvailable,
    luckyMultiplier: relaxation.luckyMultiplier
  });
  const materialized = adapter.materializeState(state);
  const hpItems = remainingPureHpItemsOnFloor(materialized, floorId).map((item) => ({
    ...item,
    creditedObjectiveHp: item.hp * Number(relaxation.holyMultiplier ?? 1),
    accessDamageLowerBound: relaxedFloorAccessDamageLowerBound({
      materialized,
      floorId,
      targetX: item.x,
      targetY: item.y,
      atk: relaxation.maxHarvestAtk,
      def: relaxation.maxHarvestDef,
      wardAvailable: relaxation.wardAvailable
    })
  }));

  const scenarios = boundExplanation.scenarios.map((scenario) => {
    const fractionalHarvestDamage = Number(scenario.fractionalHarvestDamage ?? 0);
    const requiredEnemyGold = Math.max(0, Number(scenario.requiredEnemyGold ?? 0));
    const discreteHarvestDamage = integerMinimumCostForValue(harvest.offers, requiredEnemyGold);
    const preHarvestUpper = scenario.upperBound + fractionalHarvestDamage;
    if (!Number.isFinite(discreteHarvestDamage)) {
      return {
        purchaseCount: scenario.purchaseCount,
        requiredEnemyGold,
        fractionalHarvestDamage,
        discreteHarvestDamage,
        discreteIncrement: Number.POSITIVE_INFINITY,
        strongestAccessConstraint: null,
        accessAdditionalPenalty: 0,
        previewUpperBound: Number.NEGATIVE_INFINITY,
        scenarioRelaxationFeasible: false
      };
    }
    const constraints = hpItems.map((item) => {
      const accessBeyondHarvest = Math.max(0, item.accessDamageLowerBound - discreteHarvestDamage);
      return {
        itemId: item.itemId,
        x: item.x,
        y: item.y,
        creditedObjectiveHp: item.creditedObjectiveHp,
        accessDamageLowerBound: item.accessDamageLowerBound,
        accessBeyondHarvest,
        additionalPenalty: Math.min(item.creditedObjectiveHp, accessBeyondHarvest)
      };
    }).sort((a, b) => b.additionalPenalty - a.additionalPenalty
      || b.accessDamageLowerBound - a.accessDamageLowerBound
      || `${a.y},${a.x}`.localeCompare(`${b.y},${b.x}`));
    const strongestAccessConstraint = constraints[0] ?? null;
    const accessAdditionalPenalty = strongestAccessConstraint?.additionalPenalty ?? 0;
    return {
      purchaseCount: scenario.purchaseCount,
      requiredEnemyGold,
      fractionalHarvestDamage,
      discreteHarvestDamage,
      discreteIncrement: discreteHarvestDamage - fractionalHarvestDamage,
      strongestAccessConstraint,
      accessAdditionalPenalty,
      previewUpperBound: preHarvestUpper - discreteHarvestDamage - accessAdditionalPenalty,
      scenarioRelaxationFeasible: true
    };
  }).sort((a, b) => b.previewUpperBound - a.previewUpperBound
    || a.purchaseCount - b.purchaseCount);

  const best = scenarios[0] ?? null;
  const previewUpperBound = best?.previewUpperBound ?? boundExplanation.explainedUpperBound;
  if (previewUpperBound > boundExplanation.explainedUpperBound + 1e-9) {
    throw new Error('Discrete harvest/access preview unexpectedly weakens the old proof bound.');
  }
  return {
    schemaVersion: 1,
    model: 'discrete-harvest-pure-hp-access-bound-preview-v0.1',
    proofBoundModified: false,
    soundDiscreteHarvestRelaxation: true,
    soundSingleRewardAccessConstraint: true,
    oldUpperBound: boundExplanation.explainedUpperBound,
    previewUpperBound,
    tightening: boundExplanation.explainedUpperBound - previewUpperBound,
    harvest: {
      offerCount: harvest.offers.length,
      totalHarvestGold: harvest.totalHarvestGold,
      zeroDamageGold: harvest.zeroDamageGold,
      excludedUnwinnableGold: harvest.excludedUnwinnableGold,
      positiveDamageOfferCount: harvest.positiveDamageOffers.length,
      positiveDamageOffers: harvest.positiveDamageOffers
    },
    hpItems,
    best,
    scenarios
  };
}
