import {
  DEMO10_PROGRESSION_TOPOLOGY,
  DEMO10_PROGRESSION_TOPOLOGY_ID,
  validateDemoTenFloorProgressionTopology
} from '../game/demo-10-floor-progression-topology.js';

export const DEMO10_SOLVER_TUNING_PROFILE_ID = 'demo-10f-solver-profile-v1-topology-locked';

const CRITICAL_ENEMY_IDS = Object.freeze([
  ...DEMO10_PROGRESSION_TOPOLOGY.coreBearers.map((entry) => entry.enemyId),
  ...Object.values(DEMO10_PROGRESSION_TOPOLOGY.floors)
    .flatMap((floor) => [
      ...(floor.exitGuardians ?? []),
      ...Object.values(floor.guardianGates ?? {}).flat()
    ]),
  ...(DEMO10_PROGRESSION_TOPOLOGY.floors[10]?.finalPhases ?? [])
].filter((id, index, ids) => ids.indexOf(id) === index));

const ORDINARY_ITEM_TOKENS = new Set(['item:atk', 'item:def', 'item:hp', 'item:hpLarge']);

// This is deliberately a finite, reviewable initial surface. It contains only
// ordinary encounters, ordinary stat rewards and small ordinary-enemy deltas.
// There are no card, door, rune, stair, boss, core or key-relic mutations.
const ALLOWED_MUTATION_IDS = Object.freeze([
  'f3-whale-singer-magic-down4', 'f3-whale-singer-magic-up4',
  'f5-flame-caster-magic-down5', 'f5-flame-caster-magic-up5',
  'f6-star-witch-magic-down6', 'f6-star-witch-magic-up6',
  'f7-void-priestess-magic-down6', 'f7-void-priestess-magic-up6',
  'f7-dusk-dragon-atk-down5', 'f7-dusk-dragon-atk-up5',
  'f8-hush-magic-down10', 'f8-hush-magic-up10',
  'f8-outer-atk-down6', 'f8-outer-atk-up6',
  'f9-null-magic-down10', 'f9-null-magic-up10',
  'f9-crown-atk-down6', 'f9-crown-atk-up6',
  'f10-eclipse-mage-magic-down6', 'f10-eclipse-mage-magic-up6',
  'f10-crown-knight-atk-down5', 'f10-crown-knight-atk-up5',
  'f7-reward-mid-stat-swap', 'f7-enemy-mid-swap',
  'f8-reward-mid-stat-swap',
  'f8-enemy-upper-swap', 'f8-enemy-lower-swap',
  'f9-reward-mid-stat-swap',
  'f9-enemy-upper-swap', 'f9-enemy-mid-swap'
]);

export const DEMO10_SOLVER_TUNING_PROFILE = Object.freeze({
  id: DEMO10_SOLVER_TUNING_PROFILE_ID,
  topologyId: DEMO10_PROGRESSION_TOPOLOGY_ID,
  productionWriteAllowed: false,
  releaseProgressionPriority: 'legacy-clear',
  guardianStressPriority: 'guardian-first',
  maxEdits: 2,
  beamWidth: 6,
  rounds: 2,
  criticalEnemyIds: CRITICAL_ENEMY_IDS,
  allowedMutationIds: ALLOWED_MUTATION_IDS,
  mutableFamilies: Object.freeze(['ordinary-enemy-numeric', 'ordinary-enemy-placement', 'ordinary-stat-reward-placement'])
});

function stable(value) {
  return JSON.stringify(value);
}

function isLockedMapToken(token) {
  if (token === 'S' || token === 'D' || token === 'U') return true;
  if (typeof token !== 'string') return false;
  if (/^(door|gate|switch|rune):/.test(token)) return true;
  if (token.startsWith('enemy:')) return CRITICAL_ENEMY_IDS.includes(token.slice('enemy:'.length));
  if (token.startsWith('item:')) return !ORDINARY_ITEM_TOKENS.has(token);
  return false;
}

function floorByNumber(floors, number) {
  const floor = floors.find((entry) => entry.number === number);
  if (!floor) throw new Error(`10F solver profile requires floor ${number}.`);
  return floor;
}

function protectedMapAnchors(floors) {
  return floors.map((floor) => ({
    floor: floor.number,
    anchors: floor.map.flatMap((row, y) => row.flatMap((token, x) => (
      isLockedMapToken(token) ? [{ x, y, token }] : []
    )))
  }));
}

function protectedEnemyStats(enemies) {
  return Object.fromEntries(CRITICAL_ENEMY_IDS.map((id) => {
    const enemy = enemies[id];
    if (!enemy) throw new Error(`10F solver profile is missing critical enemy ${id}.`);
    return [id, {
      hp: enemy.hp ?? null,
      atk: enemy.atk ?? null,
      def: enemy.def ?? null,
      magicPower: enemy.magicPower ?? null,
      gold: enemy.gold ?? null,
      core: enemy.core ?? null,
      boss: enemy.boss ?? null,
      special: enemy.special ?? null
    }];
  }));
}

function progressionState(floors) {
  return Object.fromEntries(Object.keys(DEMO10_PROGRESSION_TOPOLOGY.floors).map(Number).map((number) => {
    const floor = floorByNumber(floors, number);
    return [number, {
      exitGuardians: [...(floor.exitGuardians ?? [])],
      guardianGates: floor.puzzles?.guardianGates ?? {},
      boss: floor.boss ?? null
    }];
  }));
}

/** Capture only the data the locked campaign promises never to mutate. */
export function captureDemoTenFloorSolverLocks({ floors, enemies } = {}) {
  if (!Array.isArray(floors) || !enemies) throw new Error('10F solver profile requires floors and enemies.');
  const topology = validateDemoTenFloorProgressionTopology();
  if (!topology.ok) throw new Error(`10F solver profile topology invalid: ${topology.violations.join(', ')}`);
  return Object.freeze({
    profileId: DEMO10_SOLVER_TUNING_PROFILE_ID,
    topologyId: topology.id,
    progression: progressionState(floors),
    mapAnchors: protectedMapAnchors(floors),
    criticalEnemyStats: protectedEnemyStats(enemies)
  });
}

/**
 * Reject a candidate as soon as it alters a progression anchor, even if a
 * downstream greedy replay would still happen to finish the tower.
 */
export function assertDemoTenFloorSolverLocks(snapshot, { floors, enemies } = {}) {
  const current = captureDemoTenFloorSolverLocks({ floors, enemies });
  if (stable(snapshot) !== stable(current)) {
    throw new Error('10F solver candidate changed a locked progression anchor.');
  }
  return Object.freeze({ ok: true, profileId: DEMO10_SOLVER_TUNING_PROFILE_ID });
}

/** Filter a general co-design catalog into the only mutation surface this pass may use. */
export function selectDemoTenFloorSolverMutations(catalog = []) {
  if (!Array.isArray(catalog)) throw new Error('10F solver profile requires a mutation catalog array.');
  const selected = catalog.filter((mutation) => ALLOWED_MUTATION_IDS.includes(mutation.id));
  const selectedIds = new Set(selected.map((mutation) => mutation.id));
  for (const id of ALLOWED_MUTATION_IDS) {
    if (!selectedIds.has(id)) throw new Error(`10F solver profile mutation unavailable: ${id}`);
  }
  for (const mutation of selected) {
    if (mutation.kind === 'enemy-delta' && CRITICAL_ENEMY_IDS.includes(mutation.enemyId)) {
      throw new Error(`10F solver profile cannot tune critical enemy ${mutation.enemyId}.`);
    }
    const tokens = mutation.kind === 'enemy-delta' ? [] : [mutation.a?.baselineToken, mutation.b?.baselineToken];
    if (tokens.some(isLockedMapToken)) {
      throw new Error(`10F solver profile mutation touches a locked map token: ${mutation.id}`);
    }
  }
  return Object.freeze(selected);
}
