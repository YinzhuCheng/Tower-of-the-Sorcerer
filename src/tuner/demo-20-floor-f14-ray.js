import { ENEMIES, FLOORS, ITEMS, SHOP_OPTIONS } from '../game/data.js';
import { runDemoTwentyFloorMilestones } from './demo-20-floor-milestone-solver.js';
import {
  assertDemoTwentyFloorSolverLocks,
  captureDemoTwentyFloorSolverLocks
} from './demo-20-floor-solver-profile.js';

export const DEMO20_F14_GUARDIAN_FEASIBILITY_ENDPOINT = Object.freeze({
  arcaneGatekeeper: Object.freeze({ hp: 1160, atk: 240, def: 201 }),
  spectrumMarshal: Object.freeze({ hp: 1100, atk: 234, def: 199, magicPower: 50 }),
  triuneArbiter: Object.freeze({ hp: 1280, atk: 246, def: 204 })
});

const F15_ARRIVAL = Object.freeze({ id: 'f15-arrival', floorIndex: 14, label: '抵达 F15 转换点' });

function dependenciesFrom(overrides = {}) {
  return {
    floors: FLOORS,
    enemies: ENEMIES,
    items: ITEMS,
    shopOptions: SHOP_OPTIONS,
    ...overrides
  };
}

function assertStrength(strength) {
  if (!Number.isFinite(strength) || strength < 0 || strength > 1) {
    throw new Error('F14 guardian ray strength must be inside [0, 1].');
  }
}

/**
 * Interpolate from the current baseline (0) toward a deliberately over-soft
 * feasibility endpoint (1).  This is a diagnostic ray, not a monotonicity
 * proof and not a production edit list.
 */
export function materializeDemoTwentyFloorF14GuardianRay(strength, { enemies = ENEMIES } = {}) {
  assertStrength(strength);
  const changes = [];
  for (const [enemyId, endpoint] of Object.entries(DEMO20_F14_GUARDIAN_FEASIBILITY_ENDPOINT)) {
    const enemy = enemies[enemyId];
    if (!enemy) throw new Error(`F14 guardian ray is missing ${enemyId}.`);
    for (const [field, target] of Object.entries(endpoint)) {
      const baseline = Number(enemy[field]);
      if (!Number.isFinite(baseline)) throw new Error(`F14 guardian ray needs numeric ${enemyId}.${field}.`);
      changes.push(Object.freeze({
        enemyId,
        field,
        baseline,
        target,
        value: Math.max(0, Math.round(baseline + (target - baseline) * strength))
      }));
    }
  }
  return Object.freeze(changes);
}

/** Apply one ray point synchronously and always restore the exact baseline. */
export function withDemoTwentyFloorF14GuardianRay(strength, evaluate, dependencies = {}) {
  if (typeof evaluate !== 'function') throw new Error('F14 guardian ray requires an evaluation callback.');
  const source = dependenciesFrom(dependencies);
  const locks = dependencies.locks ?? captureDemoTwentyFloorSolverLocks(source);
  assertDemoTwentyFloorSolverLocks(locks, source);
  const changes = materializeDemoTwentyFloorF14GuardianRay(strength, source);
  const undo = [];
  try {
    for (const change of changes) {
      const enemy = source.enemies[change.enemyId];
      const before = enemy[change.field];
      undo.push(() => { enemy[change.field] = before; });
      enemy[change.field] = change.value;
    }
    assertDemoTwentyFloorSolverLocks(locks, source);
    return evaluate(Object.freeze({ strength, changes }));
  } finally {
    for (let index = undo.length - 1; index >= 0; index -= 1) undo[index]();
  }
}

function compactF15Sample(strength, changes, result) {
  const stage = result.milestones[0];
  const final = stage?.certificate?.final ?? null;
  return Object.freeze({
    strength,
    changes,
    reachedF15: stage?.reached === true,
    stoppedReason: stage?.stoppedReason ?? null,
    expandedStates: stage?.expandedStates ?? 0,
    generatedStates: stage?.generatedStates ?? 0,
    terminalHp: final?.stats?.hp ?? null,
    routeSteps: result.routeSteps.length
  });
}

/**
 * Samples a coarse feasibility ray.  A failed bounded search remains
 * "unresolved", rather than evidence that stronger softening is necessary;
 * only a successful engine-replayed F15 arrival establishes feasibility.
 */
export function scanDemoTwentyFloorF14GuardianRay({
  adapter,
  routeSteps,
  strengths = [0, 0.5, 0.7, 0.75, 1],
  dependencies = {},
  maxExpanded = 3_000,
  maxGenerated = 45_000
} = {}) {
  if (!adapter) throw new Error('F14 guardian ray scan requires a continuation adapter.');
  const source = dependenciesFrom(dependencies);
  const locks = dependencies.locks ?? captureDemoTwentyFloorSolverLocks(source);
  const samples = strengths.map((strength) => withDemoTwentyFloorF14GuardianRay(strength, ({ changes }) => {
    const result = runDemoTwentyFloorMilestones({
      adapter,
      routeSteps,
      milestones: [F15_ARRIVAL],
      maxExpanded,
      maxGenerated
    });
    return compactF15Sample(strength, changes, result);
  }, { ...source, locks }));

  assertDemoTwentyFloorSolverLocks(locks, source);
  const feasible = samples.filter((sample) => sample.reachedF15);
  return Object.freeze({
    endpoint: DEMO20_F14_GUARDIAN_FEASIBILITY_ENDPOINT,
    samples: Object.freeze(samples),
    // This is only the least softened successful *sample*. The scan does not
    // claim a binary boundary until monotonicity is independently established.
    leastSoftenedSuccessfulSample: feasible.sort((a, b) => a.strength - b.strength)[0] ?? null,
    publishable: false
  });
}
