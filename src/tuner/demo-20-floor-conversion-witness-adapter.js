import { createDemoTwentyFloorForwardWitnessAdapter } from './demo-20-floor-forward-witness-adapter.js';

export const DEMO20_CONVERSION_WITNESS_POLICY_ID = 'demo-20f-f15-conversion-witness-v1';

/**
 * A stricter *certificate* policy for numeric convergence.  F5 remains a
 * real Act II resource before the F15 conversion point, but after reaching
 * F16 the witness must live with its F15 allocation (stats / restoration /
 * capacity) instead of repeatedly reopening the old shop.  The player-facing
 * campaign is unchanged; a certificate found here is still a legal engine
 * replay, while a failure is explicitly non-conclusive.
 */
export function createDemoTwentyFloorConversionWitnessAdapter(baseAdapter, {
  conversionFloorIndex = 14
} = {}) {
  const forward = createDemoTwentyFloorForwardWitnessAdapter(baseAdapter);
  if (!Number.isInteger(conversionFloorIndex) || conversionFloorIndex < 0) {
    throw new Error('20F conversion witness requires a non-negative F15 floor index.');
  }

  return {
    ...forward,
    continuationPolicy: Object.freeze({
      ...forward.continuationPolicy,
      id: DEMO20_CONVERSION_WITNESS_POLICY_ID,
      conversionFloorIndex,
      f5ShopReturnsCloseAfterConversion: true,
      impossibilityClaimsAllowed: false
    }),
    enumerateActions(state) {
      return forward.enumerateActions(state).filter((action) => (
        action.kind !== 'act1-shop-return' || state.floor <= conversionFloorIndex
      ));
    }
  };
}
