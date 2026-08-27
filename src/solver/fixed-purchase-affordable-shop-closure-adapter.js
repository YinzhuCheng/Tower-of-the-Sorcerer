import { SHOP_OPTIONS, getShopCost } from '../game/data.js';
import { fixedPurchaseOptionAt } from './fixed-purchase-policy-adapter.js';
import { stableStringify } from './state.js';

const SAFE_SHOP_EFFECT_KEYS = new Set(['hp', 'maxHp', 'atk', 'def']);

function cloneWith(adapter, state) {
  return typeof adapter.cloneState === 'function' ? adapter.cloneState(state) : structuredClone(state);
}

function teleportAction(targetFloor) {
  return {
    kind: 'teleport',
    eventId: `teleport:f${targetFloor + 1}`,
    targetFloor
  };
}

function automaticize(steps = [], rule) {
  return steps.map((step) => ({
    ...step,
    automatic: true,
    normalizationRule: rule
  }));
}

function shopEffectIsOrderSafe(option) {
  if (!option?.effect || typeof option.effect !== 'object') return false;
  for (const [key, raw] of Object.entries(option.effect)) {
    if (!SAFE_SHOP_EFFECT_KEYS.has(key)) return false;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) return false;
  }

  const hp = Number(option.effect.hp ?? 0);
  const maxHp = Number(option.effect.maxHp ?? 0);
  // A pure heal can be wasted at the current cap and therefore is not generally
  // safe to force early. The canonical HP purchase raises current/max HP equally,
  // which is weakly better before every later fight and before Holy doubling.
  if (hp !== 0 || maxHp !== 0) return hp === maxHp && hp >= 0;
  return true;
}

function canAffordCanonicalShopCost(state, costCalculator = getShopCost) {
  const cost = Number(costCalculator(state));
  const gold = Number(state?.stats?.gold ?? NaN);
  return Number.isFinite(cost) && cost >= 0 && Number.isFinite(gold) && gold >= cost;
}

/**
 * Proof gate for forcing one shop action under a fixed purchase policy.
 *
 * Gold has no non-shop use in the canonical Tower rules, shop price depends only
 * on purchase count, and the policy fixes the option at each purchase index.
 * ATK/DEF purchases are monotone; HP purchases are accepted only when current HP
 * and max HP rise by the same nonnegative amount, so buying before Holy or before
 * damage cannot be worse than delaying the same purchase.
 */
export function isProvablyMonotoneFixedPurchaseShopAction(state, action, {
  policy,
  shopOptions = SHOP_OPTIONS,
  costCalculator = getShopCost
} = {}) {
  if (!policy?.shopCycle?.length) return false;
  if (action?.kind !== 'shop') return false;
  const purchaseIndex = Number(state?.shopPurchases ?? -1);
  if (!Number.isInteger(purchaseIndex) || purchaseIndex < 0) return false;
  const expected = fixedPurchaseOptionAt(purchaseIndex, policy);
  if (action.optionId !== expected) return false;

  const option = shopOptions.find((candidate) => candidate.id === expected);
  if (!shopEffectIsOrderSafe(option)) return false;
  return canAffordCanonicalShopCost(state, costCalculator);
}

/**
 * Shop cross-floor detours use the same topology trust boundary as the Compass
 * harvest closure, except Lucky is not required: returning to the current floor
 * must land in the same compact zero-cost component as the starting state.
 */
export function canCompassShopRoundTripWithoutComponentLoss(baseAdapter, state) {
  if (!state?.relics?.compass || !Number.isInteger(state.floor)) return false;
  const applied = baseAdapter.applyAction(
    cloneWith(baseAdapter, state),
    teleportAction(state.floor)
  );
  if (!applied?.ok || !applied.state) return false;
  return applied.state.floor === state.floor
    && stableStringify(applied.state.componentAnchor) === stableStringify(state.componentAnchor);
}

/**
 * Canonicalize affordable purchase timing for an already fixed-policy adapter.
 *
 * The wrapped normalizer runs first. Then the closure repeatedly buys the one
 * policy-compatible shop action whenever it is reachable for free on the current
 * floor. If Compass is owned and a round-trip preserves the current component,
 * already visited floors may also be probed for a reachable shop. Every teleport,
 * purchase and wrapped normalization event remains an ordinary certificate step.
 *
 * This wrapper does not change enumerateActions/applyAction/upper bounds and is
 * intended only for fixed-purchase proof/counterexample sub-problems.
 */
export function createFixedPurchaseAffordableShopClosureAdapter({
  baseAdapter,
  maxAutomaticPurchases = 128
} = {}) {
  if (!baseAdapter?.fixedPurchasePolicy) {
    throw new Error('Affordable shop closure requires a fixed-purchase policy adapter.');
  }
  if (!Number.isInteger(maxAutomaticPurchases) || maxAutomaticPurchases < 1) {
    throw new Error('maxAutomaticPurchases must be a positive integer.');
  }
  if (typeof baseAdapter.normalize !== 'function'
    || typeof baseAdapter.enumerateActions !== 'function'
    || typeof baseAdapter.applyAction !== 'function') {
    throw new Error('Affordable shop closure requires normalize/enumerateActions/applyAction.');
  }

  const policy = baseAdapter.fixedPurchasePolicy;

  function eligibleShopAction(state) {
    return baseAdapter.enumerateActions(state)
      .filter((action) => isProvablyMonotoneFixedPurchaseShopAction(state, action, { policy }))
      .sort((a, b) => String(a.eventId).localeCompare(String(b.eventId)))[0] ?? null;
  }

  return {
    ...baseAdapter,
    normalize(state) {
      let normalized = baseAdapter.normalize(state);
      let working = normalized.state;
      const steps = [...(normalized.steps ?? [])];
      const homeFloor = working.floor;
      let purchases = 0;

      while (purchases < maxAutomaticPurchases) {
        const localShop = eligibleShopAction(working);
        if (localShop) {
          const applied = baseAdapter.applyAction(cloneWith(baseAdapter, working), localShop);
          if (!applied?.ok || !applied.state) {
            throw new Error(`Affordable shop closure failed at ${localShop.eventId}: ${applied?.reason ?? 'unknown'}`);
          }
          steps.push(...automaticize(applied.steps, 'fixed-purchase-affordable-shop-v1'));
          purchases += 1;
          normalized = baseAdapter.normalize(applied.state);
          working = normalized.state;
          steps.push(...(normalized.steps ?? []));
          continue;
        }

        // Shop cost depends only on purchase count, not floor. If the current
        // state cannot afford the canonical next cost, no Compass destination can
        // contain an affordable policy-compatible shop action either. This is a
        // semantics-preserving constant-time short circuit for the common case.
        if (!canAffordCanonicalShopCost(working)) break;
        if (!canCompassShopRoundTripWithoutComponentLoss(baseAdapter, working)) break;
        const targets = [...new Set(working.visitedFloors ?? [])]
          .filter((floor) => Number.isInteger(floor) && floor !== homeFloor)
          .sort((a, b) => a - b);
        let chosen = null;

        for (const targetFloor of targets) {
          const outbound = baseAdapter.applyAction(
            cloneWith(baseAdapter, working),
            teleportAction(targetFloor)
          );
          if (!outbound?.ok || !outbound.state) continue;

          const targetNormalized = baseAdapter.normalize(outbound.state);
          if (!targetNormalized?.state) continue;
          const shop = eligibleShopAction(targetNormalized.state);
          if (!shop) continue;

          const bought = baseAdapter.applyAction(
            cloneWith(baseAdapter, targetNormalized.state),
            shop
          );
          if (!bought?.ok || !bought.state) continue;
          const inbound = baseAdapter.applyAction(
            cloneWith(baseAdapter, bought.state),
            teleportAction(homeFloor)
          );
          if (!inbound?.ok || !inbound.state) continue;
          if (stableStringify(inbound.state.componentAnchor) !== stableStringify(working.componentAnchor)) continue;

          chosen = { outbound, targetNormalized, bought, inbound };
          break;
        }

        if (!chosen) break;
        steps.push(...automaticize(chosen.outbound.steps, 'fixed-purchase-affordable-shop-cross-floor-v1'));
        steps.push(...(chosen.targetNormalized.steps ?? []));
        steps.push(...automaticize(chosen.bought.steps, 'fixed-purchase-affordable-shop-v1'));
        steps.push(...automaticize(chosen.inbound.steps, 'fixed-purchase-affordable-shop-cross-floor-v1'));
        purchases += 1;
        working = chosen.inbound.state;
        normalized = baseAdapter.normalize(working);
        working = normalized.state;
        steps.push(...(normalized.steps ?? []));
      }

      if (purchases >= maxAutomaticPurchases) {
        throw new Error('Affordable shop closure exceeded safety limit.');
      }
      return { state: working, steps };
    },
    rulesVersion() {
      return `${baseAdapter.rulesVersion?.() ?? 'tower'}+fixed-purchase-affordable-shop-closure-v1`;
    },
    affordableShopClosure: Object.freeze({
      version: 1,
      fixedPolicyOnly: true,
      crossFloorRequiresCompass: true,
      preservesHomeComponent: true,
      maxAutomaticPurchases
    })
  };
}
