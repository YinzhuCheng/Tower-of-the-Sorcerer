import { ENEMIES, FLOORS, ITEMS, SHOP_OPTIONS } from '../game/data.js';
import { runDemoTwentyFloorMilestones } from './demo-20-floor-milestone-solver.js';
import {
  assertDemoTwentyFloorSolverLocks,
  captureDemoTwentyFloorSolverLocks
} from './demo-20-floor-solver-profile.js';

// This endpoint is deliberately generous: it establishes whether the F17
// guardian cluster is a numerical bottleneck after the actual F15 conversion
// choices, before a narrower pressure window is selected.
export const DEMO20_F17_CROWN_FEASIBILITY_ENDPOINT = Object.freeze({
  crownBlade: Object.freeze({ hp: 2000, atk: 266, def: 210 }),
  crownCantor: Object.freeze({ hp: 1900, atk: 255, def: 209, magicPower: 120 }),
  crownMagus: Object.freeze({ hp: 2050, atk: 262, def: 212 })
});

const F18_ARRIVAL = Object.freeze({ id: 'f18-arrival', floorIndex: 17, label: '抵达 F18 终局前段' });

function dependenciesFrom(overrides = {}) {
  return { floors: FLOORS, enemies: ENEMIES, items: ITEMS, shopOptions: SHOP_OPTIONS, ...overrides };
}

function assertStrength(strength) {
  if (!Number.isFinite(strength) || strength < 0 || strength > 1) {
    throw new Error('F17 crown ray strength must be inside [0, 1].');
  }
}

export function materializeDemoTwentyFloorF17CrownRay(strength, { enemies = ENEMIES } = {}) {
  assertStrength(strength);
  const changes = [];
  for (const [enemyId, endpoint] of Object.entries(DEMO20_F17_CROWN_FEASIBILITY_ENDPOINT)) {
    const enemy = enemies[enemyId];
    if (!enemy) throw new Error(`F17 crown ray is missing ${enemyId}.`);
    for (const [field, target] of Object.entries(endpoint)) {
      const baseline = Number(enemy[field]);
      if (!Number.isFinite(baseline)) throw new Error(`F17 crown ray needs numeric ${enemyId}.${field}.`);
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

/** Apply a diagnostic F17 point synchronously and restore every number. */
export function withDemoTwentyFloorF17CrownRay(strength, evaluate, dependencies = {}) {
  if (typeof evaluate !== 'function') throw new Error('F17 crown ray requires an evaluation callback.');
  const source = dependenciesFrom(dependencies);
  const locks = dependencies.locks ?? captureDemoTwentyFloorSolverLocks(source);
  assertDemoTwentyFloorSolverLocks(locks, source);
  const changes = materializeDemoTwentyFloorF17CrownRay(strength, source);
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

function compactSample(strength, changes, result) {
  const stage = result.milestones.at(-1);
  return Object.freeze({
    strength,
    changes,
    reachedF18: stage?.reached === true,
    stoppedReason: stage?.stoppedReason ?? null,
    expandedStates: stage?.expandedStates ?? 0,
    generatedStates: stage?.generatedStates ?? 0,
    deepestFloor: stage?.deepestFloor ?? 0,
    terminalHp: stage?.certificate?.final?.stats?.hp ?? null,
    routeSteps: result.routeSteps.length
  });
}

/**
 * Samples only the mandatory F17 guardian values. It has no topology writes,
 * makes no monotonicity assertion, and is never a publication path.
 */
export function scanDemoTwentyFloorF17CrownRay({
  adapter,
  routeSteps,
  prefixMilestones = [],
  strengths = [0.5, 0.7, 1],
  dependencies = {},
  maxExpanded = 3_000,
  maxGenerated = 45_000
} = {}) {
  if (!adapter) throw new Error('F17 crown ray scan requires an adapter.');
  const source = dependenciesFrom(dependencies);
  const locks = dependencies.locks ?? captureDemoTwentyFloorSolverLocks(source);
  const samples = strengths.map((strength) => withDemoTwentyFloorF17CrownRay(strength, ({ changes }) => {
    const result = runDemoTwentyFloorMilestones({
      adapter,
      routeSteps,
      milestones: [...prefixMilestones, F18_ARRIVAL],
      maxExpanded,
      maxGenerated
    });
    return compactSample(strength, changes, result);
  }, { ...source, locks }));
  assertDemoTwentyFloorSolverLocks(locks, source);
  const feasible = samples.filter((sample) => sample.reachedF18);
  return Object.freeze({
    endpoint: DEMO20_F17_CROWN_FEASIBILITY_ENDPOINT,
    samples: Object.freeze(samples),
    leastSoftenedSuccessfulSample: feasible.sort((a, b) => a.strength - b.strength)[0] ?? null,
    publishable: false
  });
}
