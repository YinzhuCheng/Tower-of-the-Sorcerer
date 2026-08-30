import { createDemoTwentyFloorForwardWitnessAdapter } from './demo-20-floor-forward-witness-adapter.js';

export const DEMO30_EXPERT_WITNESS_POLICY_ID = 'demo-30f-forward-expert-witness-v1';

/**
 * A deliberately narrow *witness* policy for the release verifier.  It does
 * not alter game legality or make negative claims: every retained action is
 * ordinary engine input and every resulting route is replayed without this
 * wrapper.  It removes symmetric compass/backtrack churn and samples the
 * useful low, medium and high MP commitments instead of treating every tier
 * as a separate strategic doctrine.
 */
export function createDemoThirtyFloorExpertWitnessAdapter(baseAdapter) {
  const forward = createDemoTwentyFloorForwardWitnessAdapter(baseAdapter);

  function permitted(state, action) {
    if (action?.kind === 'teleport') return false;
    if (action?.kind === 'act1-shop-return') return state.floor < 20;
    if (action?.kind === 'tile' && action.token === 'D') return false;
    if (action?.kind === 'tile' && action.parsed?.type === 'enemy') {
      const tier = Number(action.magicTier ?? 0);
      const capacity = Math.floor(Math.min(state.magic?.maxMp ?? 0, state.magic?.mp ?? 0) / 10);
      const medium = Math.max(0, Math.min(6, capacity));
      return tier === 0 || tier === medium || tier === capacity;
    }
    return true;
  }

  return {
    ...forward,
    continuationPolicy: Object.freeze({
      ...forward.continuationPolicy,
      id: DEMO30_EXPERT_WITNESS_POLICY_ID,
      act3ForwardOnly: true,
      magicTierSamples: Object.freeze(['0', 'min(6, capacity)', 'capacity']),
      impossibilityClaimsAllowed: false
    }),
    enumerateActions(state) {
      return forward.enumerateActions(state).filter((action) => permitted(state, action));
    },
    searchHeuristic(state) {
      // Ordering only, never a bound: a completed charter and a later floor
      // are generally better evidence of a viable authored route.
      return (baseAdapter.searchHeuristic?.(state) ?? 0)
        + (state.charter?.completedId ? 3_000_000 : 0)
        + (state.charter?.selectedId ? 1_000_000 : 0)
        + Math.min(state.magic?.mp ?? 0, 250) * 100;
    }
  };
}
