import { ENEMIES, FLOORS, ITEMS, SHOP_OPTIONS } from '../game/data.js';
import {
  assertDemoTwentyFloorSolverLocks,
  captureDemoTwentyFloorSolverLocks
} from './demo-20-floor-solver-profile.js';

/**
 * Named, composable late-game feasibility endpoints.  They are intentionally
 * separate from the production baseline: a ray answers where a later cluster
 * becomes reachable, never what its final pressure should be.
 */
export const DEMO20_LATE_GAME_FEASIBILITY_ENDPOINTS = Object.freeze({
  act2Ordinary: Object.freeze({
    manaWisp: Object.freeze({ hp: 650, atk: 200, def: 150 }),
    aetherWarden: Object.freeze({ hp: 800, atk: 220, def: 170 }),
    runeCantor: Object.freeze({ hp: 700, atk: 210, def: 160, magicPower: 70 }),
    spellbladeDuelist: Object.freeze({ hp: 800, atk: 220, def: 170 }),
    manaSentinel: Object.freeze({ hp: 1000, atk: 230, def: 180 }),
    prismArchivist: Object.freeze({ hp: 800, atk: 210, def: 160, magicPower: 70 }),
    mirrorHuntress: Object.freeze({ hp: 900, atk: 220, def: 170 }),
    voidHerald: Object.freeze({ hp: 1100, atk: 230, def: 180, magicPower: 80 })
  }),
  f19Regent: Object.freeze({
    echoRegent: Object.freeze({ hp: 3500, atk: 310, def: 220, magicPower: 160 })
  }),
  f20Final: Object.freeze({
    arcaneSovereign: Object.freeze({ hp: 1800, atk: 260, def: 190, magicPower: 50 }),
    originCore: Object.freeze({ hp: 2200, atk: 265, def: 195 })
  })
});

function dependenciesFrom(overrides = {}) {
  return { floors: FLOORS, enemies: ENEMIES, items: ITEMS, shopOptions: SHOP_OPTIONS, ...overrides };
}

function endpointFor(rayId) {
  const endpoint = DEMO20_LATE_GAME_FEASIBILITY_ENDPOINTS[rayId];
  if (!endpoint) throw new Error(`Unknown 20F late-game ray: ${rayId}`);
  return endpoint;
}

function assertStrength(strength) {
  if (!Number.isFinite(strength) || strength < 0 || strength > 1) {
    throw new Error('20F late-game ray strength must be inside [0, 1].');
  }
}

export function materializeDemoTwentyFloorLateGameRay(rayId, strength, { enemies = ENEMIES } = {}) {
  assertStrength(strength);
  const changes = [];
  for (const [enemyId, endpoint] of Object.entries(endpointFor(rayId))) {
    const enemy = enemies[enemyId];
    if (!enemy) throw new Error(`20F ${rayId} ray is missing ${enemyId}.`);
    for (const [field, target] of Object.entries(endpoint)) {
      const baseline = Number(enemy[field]);
      if (!Number.isFinite(baseline)) throw new Error(`20F ${rayId} ray needs numeric ${enemyId}.${field}.`);
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

/** Apply one or more numeric-only rays and always restore their baselines. */
export function withDemoTwentyFloorLateGameRays(rays, evaluate, dependencies = {}) {
  if (typeof evaluate !== 'function') throw new Error('20F late-game rays require an evaluation callback.');
  if (!Array.isArray(rays) || rays.length === 0) throw new Error('20F late-game rays require at least one ray.');
  const source = dependenciesFrom(dependencies);
  const locks = dependencies.locks ?? captureDemoTwentyFloorSolverLocks(source);
  assertDemoTwentyFloorSolverLocks(locks, source);
  const seen = new Set();
  const changes = rays.flatMap(({ id, strength }) => materializeDemoTwentyFloorLateGameRay(id, strength, source));
  const undo = [];
  try {
    for (const change of changes) {
      const key = `${change.enemyId}.${change.field}`;
      if (seen.has(key)) throw new Error(`Overlapping 20F late-game ray field: ${key}`);
      seen.add(key);
      const enemy = source.enemies[change.enemyId];
      const before = enemy[change.field];
      undo.push(() => { enemy[change.field] = before; });
      enemy[change.field] = change.value;
    }
    assertDemoTwentyFloorSolverLocks(locks, source);
    return evaluate(Object.freeze({
      rays: Object.freeze(rays.map(({ id, strength }) => Object.freeze({ id, strength }))),
      changes: Object.freeze(changes)
    }));
  } finally {
    for (let index = undo.length - 1; index >= 0; index -= 1) undo[index]();
  }
}
