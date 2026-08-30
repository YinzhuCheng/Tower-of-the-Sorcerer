import {
  createTowerTeleportTransitionMemoAdapter,
  towerTeleportTransitionEquivalenceKey
} from './tower-teleport-transition-memo-adapter.js';

// Compatibility alias for the existing fixed-policy suffix studies. Compass
// transition equivalence itself never depended on a shop policy; new generic
// searches should use the Tower-named API directly.
export const fixedPurchaseTeleportTransitionEquivalenceKey = towerTeleportTransitionEquivalenceKey;

export function createFixedPurchaseTeleportTransitionMemoAdapter({
  baseAdapter,
  minCores = 7
} = {}) {
  if (!baseAdapter?.fixedPurchasePolicy) {
    throw new Error('Teleport transition memo requires a fixed-purchase policy adapter.');
  }

  const generic = createTowerTeleportTransitionMemoAdapter({ baseAdapter, minCores });
  return {
    ...generic,
    rulesVersion() {
      return `${baseAdapter.rulesVersion?.() ?? 'tower'}+fixed-purchase-teleport-transition-memo-v2:c${minCores}`;
    },
    teleportTransitionMemo: Object.freeze({
      ...generic.teleportTransitionMemo,
      fixedPolicyOnly: true,
    })
  };
}
