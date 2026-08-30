import { runGreedyShopStrategy } from './greedy-strategy.js';
import { createTowerAdapter } from './tower-adapter.js';
import { replayTowerStepSkeleton } from './replay.js';
import {
  createDemoTenFloorRouteDiscoveryPolicies,
  describeDemoTenFloorRouteFamily,
  selectIndependentDemoTenFloorRoutes
} from './demo-10f-route-families.js';

/**
 * Discover and independently replay a small portfolio of player-visible route
 * families. Import this module only after the 10F overlay is applied because
 * tower-adapter captures the installed event catalogue at module load time.
 */
export function certifyDemoTenFloorRouteFamilies({
  maxCycleLength = 3,
  targetFamilies = 3,
  hardMargin = { min: 0.04, max: 0.25 }
} = {}) {
  const adapter = createTowerAdapter();
  const attempts = createDemoTenFloorRouteDiscoveryPolicies({ maxCycleLength }).map((policy) => {
    const route = runGreedyShopStrategy({ ...policy, traceActions: true, maxIterations: 8_000 });
    const replay = route.solvable
      ? replayTowerStepSkeleton(route.routeSteps, { adapter, requireGoal: true })
      : { ok: false, minNormalizedHpMargin: null };
    return {
      id: `${policy.shopCycle.join('-')}/${policy.holyPolicy}/${policy.progressionPriority}`,
      policy,
      route,
      replay,
      family: describeDemoTenFloorRouteFamily(route, replay)
    };
  });
  const hardAttempts = attempts.filter((attempt) => attempt.route.solvable
    && attempt.replay.ok
    && attempt.family.minNormalizedHpMargin >= hardMargin.min
    && attempt.family.minNormalizedHpMargin <= hardMargin.max);
  const selection = selectIndependentDemoTenFloorRoutes(hardAttempts, {
    targetFamilies,
    minDistance: 2
  });
  return {
    model: 'demo-10f-frozen-topology-route-families-v1',
    discoverySeeds: attempts.length,
    replayableWins: attempts.filter((attempt) => attempt.route.solvable && attempt.replay.ok).length,
    hardCandidates: hardAttempts.length,
    hardMargin: { ...hardMargin },
    ...selection
  };
}
