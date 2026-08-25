import { createBoundedTowerAdapter } from './tower-bounds.js';
import { GREEDY_INCUMBENT_WITNESS_TYPE } from './tower-incumbent.js';
import { hashValue } from './state.js';

const SHOP_OPTION_IDS = new Set(['atk', 'def', 'hp']);

function sameArray(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

function validateOptions(values, label, { allowEmpty = false } = {}) {
  if (!Array.isArray(values) || (!allowEmpty && values.length === 0)) {
    throw new Error(`${label} must be ${allowEmpty ? 'an array' : 'a non-empty array'}.`);
  }
  for (const optionId of values) {
    if (!SHOP_OPTION_IDS.has(optionId)) throw new Error(`${label} contains unknown shop option: ${optionId}`);
  }
}

export function fixedPurchaseOptionAt(purchaseIndex, { shopPlan, shopCycle }) {
  if (!Number.isInteger(purchaseIndex) || purchaseIndex < 0) {
    throw new Error('purchaseIndex must be a non-negative integer.');
  }
  return shopPlan[purchaseIndex] ?? shopCycle[purchaseIndex % shopCycle.length];
}

export function greedyWitnessMatchesFixedPurchasePolicy(witness, { shopPlan, shopCycle }) {
  return Boolean(
    witness
    && witness.type === GREEDY_INCUMBENT_WITNESS_TYPE
    && sameArray(witness.shopPlan ?? [], shopPlan)
    && sameArray(witness.shopCycle ?? [], shopCycle)
  );
}

/**
 * Event-order search ordering only; never used as a proof bound.
 *
 * Under a fixed purchase policy, increasing `shopPurchases` is monotone progress:
 * Gold has no non-shop use, prices depend only on purchase count, and every fixed
 * ATK/DEF/HP purchase weakly improves all future combat states (HP bought before
 * Holy is strictly no worse than buying it later). Generic Tower priority heavily
 * rewards high floor number, which can starve productive F5 -> F4 shop recovery.
 * This priority therefore orders by cores first, then completed fixed purchases,
 * then target-floor puzzle progress. It does not remove any action or label.
 */
export function fixedPurchaseEventOrderPriority(state) {
  const cores = Number(state?.cores ?? 0);
  const purchases = Number(state?.shopPurchases ?? 0);
  const floorMeta = Array.isArray(state?.floorMeta) ? state.floorMeta : [];
  const targetFloor = floorMeta.length
    ? Math.min(Math.max(0, cores), floorMeta.length - 1)
    : Math.max(0, Number(state?.floor ?? 0));
  const targetMeta = floorMeta[targetFloor] ?? {};
  const switches = Array.isArray(targetMeta.switches) ? targetMeta.switches.length : 0;
  const sequenceProgress = Number(targetMeta.sequenceProgress ?? 0);
  const onTargetFloor = Number(state?.floor ?? 0) === targetFloor ? 1 : 0;
  const stats = state?.stats ?? {};

  return cores * 1e15
    + purchases * 1e12
    + switches * 1e10
    + sequenceProgress * 1e9
    + onTargetFloor * 1e8
    + Number(stats.atk ?? 0) * 1e5
    + Number(stats.def ?? 0) * 1e4
    + Math.min(Number(stats.hp ?? 0), 9_999);
}

/**
 * Restricts only shop-choice actions while leaving every other authoritative
 * Tower macro action untouched. The Solver may therefore optimize enemy order,
 * pickup timing, door/card order, puzzle order, cross-floor recovery and Holy's
 * microscopic pickup timing under one fixed purchase policy.
 *
 * The adapter is a sub-problem definition, not a heuristic prune: at purchase
 * index p exactly one shop option belongs to the modeled policy. A greedy
 * incumbent witness can seed branch-and-bound only if its explicit policy is
 * byte-for-byte compatible with this restriction; an otherwise legal witness
 * from another purchase policy is rejected before it can influence pruning.
 */
export function createFixedPurchasePolicyTowerAdapter({
  shopPlan = [],
  shopCycle = ['def', 'atk', 'hp'],
  baseAdapter = createBoundedTowerAdapter()
} = {}) {
  validateOptions(shopPlan, 'shopPlan', { allowEmpty: true });
  validateOptions(shopCycle, 'shopCycle');
  if (!baseAdapter || typeof baseAdapter.enumerateActions !== 'function') {
    throw new Error('Fixed purchase policy adapter requires a Tower-like base adapter.');
  }

  const policy = {
    shopPlan: [...shopPlan],
    shopCycle: [...shopCycle]
  };
  const policyHash = hashValue(policy);

  return {
    ...baseAdapter,
    enumerateActions(state) {
      const expected = fixedPurchaseOptionAt(state.shopPurchases ?? 0, policy);
      return baseAdapter.enumerateActions(state).filter((action) =>
        action?.kind !== 'shop' || action.optionId === expected
      );
    },
    priority: fixedPurchaseEventOrderPriority,
    verifyIncumbent(witness, context) {
      if (!greedyWitnessMatchesFixedPurchasePolicy(witness, policy)) {
        return {
          ok: false,
          reason: 'Greedy incumbent witness purchase policy does not match the fixed purchase sub-problem.'
        };
      }
      if (typeof baseAdapter.verifyIncumbent !== 'function') {
        return { ok: false, reason: 'Base adapter cannot verify incumbent witnesses.' };
      }
      return baseAdapter.verifyIncumbent(witness, context);
    },
    rulesVersion() {
      return `${baseAdapter.rulesVersion?.() ?? 'tower'}+fixed-purchase-policy:${policyHash}+event-order-priority-v1`;
    },
    fixedPurchasePolicy: Object.freeze({
      shopPlan: Object.freeze([...shopPlan]),
      shopCycle: Object.freeze([...shopCycle]),
      policyHash
    })
  };
}
