import { createDemoTwentyFloorContinuationAdapter } from './demo-20-floor-continuation-adapter.js';

export const DEMO20_FORWARD_WITNESS_POLICY_ID = 'demo-20f-forward-milestone-witness-v1';

/**
 * A route-finding policy for the numerical convergence pass.  It searches
 * only ascending play plus the already-authorized F5 purchase macro.  This is
 * not a gameplay restriction and never makes an impossibility claim: any
 * certificate it emits still contains ordinary engine steps and is replayed
 * against the complete campaign.  Avoiding retrospective floor tours removes
 * a large amount of symmetric teleport churn while retaining a real, hard
 * forward witness for every numeric candidate.
 */
export function createDemoTwentyFloorForwardWitnessAdapter(baseAdapter) {
  const continuation = createDemoTwentyFloorContinuationAdapter(baseAdapter);

  function permitted(action) {
    if (action?.kind === 'act1-shop-return') return true;
    if (action?.kind === 'teleport') return false;
    return !(action?.kind === 'tile' && action.token === 'D');
  }

  return {
    ...continuation,
    continuationPolicy: Object.freeze({
      ...continuation.continuationPolicy,
      id: DEMO20_FORWARD_WITNESS_POLICY_ID,
      forwardWitnessOnly: true,
      preservesF5ShopChoicesAsMacros: true,
      // A solver failure under this policy means only that this compact
      // witness class did not converge; the playable game keeps all returns.
      impossibilityClaimsAllowed: false
    }),
    enumerateActions(state) {
      return continuation.enumerateActions(state).filter(permitted);
    }
  };
}
