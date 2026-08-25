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
      return `${baseAdapter.rulesVersion?.() ?? 'tower'}+fixed-purchase-policy:${policyHash}`;
    },
    fixedPurchasePolicy: Object.freeze({
      shopPlan: Object.freeze([...shopPlan]),
      shopCycle: Object.freeze([...shopCycle]),
      policyHash
    })
  };
}
