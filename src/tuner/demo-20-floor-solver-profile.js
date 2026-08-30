import { ENEMIES, FLOORS, ITEMS, SHOP_OPTIONS } from '../game/data.js';
import {
  ACT2_RELIC_CATALOG,
  ACT2_UNIT_CATALOG,
  DEMO20_PROGRESSION_TOPOLOGY,
  DEMO20_PROGRESSION_TOPOLOGY_ID,
  validateDemoTwentyFloorProgressionTopology
} from '../game/demo-20-floor-progression-topology.js';
import {
  DEMO20_SPATIAL_TOPOLOGY_ID,
  validateDemoTwentyFloorSpatialTopology
} from '../game/demo-20-floor-spatial-topology.js';
import { DEMO20_CONTENT_ID } from '../game/demo-20-floor-content.js';

export const DEMO20_SOLVER_TUNING_PROFILE_ID = 'demo-20f-solver-profile-v1-anchors-locked';

export const DEMO20_SOLVER_TUNING_PROFILE = Object.freeze({
  id: DEMO20_SOLVER_TUNING_PROFILE_ID,
  contentId: DEMO20_CONTENT_ID,
  topologyId: DEMO20_PROGRESSION_TOPOLOGY_ID,
  spatialTopologyId: DEMO20_SPATIAL_TOPOLOGY_ID,
  productionWriteAllowed: false,
  maxEdits: 2,
  beamWidth: 8,
  scoutExpansionBudget: 3_000,
  proofExpansionBudget: 30_000,
  mutableFamilies: Object.freeze(['act2-enemy-numeric', 'act2-magic-recovery', 'act2-magic-capacity', 'f15-magic-shop-effect'])
});

const ACT2_NUMERIC_FIELDS = Object.freeze(['hp', 'atk', 'def', 'magicPower', 'gold']);

function stable(value) {
  return JSON.stringify(value);
}

function floorByNumber(floors, number) {
  const floor = floors.find((entry) => entry.number === number);
  if (!floor) throw new Error(`20F solver profile requires floor ${number}.`);
  return floor;
}

function mapFingerprint(floors) {
  return floors
    .filter((floor) => floor.number >= 10)
    .map((floor) => ({ number: floor.number, map: floor.map.map((row) => [...row]) }));
}

function progressionFingerprint(floors) {
  return Object.fromEntries(Array.from({ length: 11 }, (_, index) => index + 10).map((number) => {
    const floor = floorByNumber(floors, number);
    return [number, {
      exitGuardians: [...(floor.exitGuardians ?? [])],
      guardianGates: floor.puzzles?.guardianGates ?? {},
      cardGates: floor.puzzles?.cardGates ?? {},
      finalPhases: [...(floor.finalPhases ?? [])],
      shopOptionIds: [...(floor.shopOptionIds ?? [])],
      roomPlan: [...(floor.roomPlan ?? [])],
      boss: floor.boss ?? null
    }];
  }));
}

function unitIdentityFingerprint(enemies) {
  return Object.fromEntries(Object.entries(ACT2_UNIT_CATALOG).map(([id, semantic]) => {
    const enemy = enemies[id];
    if (!enemy) throw new Error(`20F solver profile is missing ${id}.`);
    return [id, {
      name: enemy.name,
      portrait: enemy.portrait,
      faction: enemy.faction,
      floor: enemy.floor,
      boss: Boolean(enemy.boss),
      finalBoss: Boolean(enemy.finalBoss),
      role: semantic.role
    }];
  }));
}

function relicIdentityFingerprint(items) {
  return Object.fromEntries(Object.entries(ACT2_RELIC_CATALOG).map(([id, semantic]) => {
    const item = items[id];
    if (!item) throw new Error(`20F solver profile is missing ${id}.`);
    return [id, {
      name: item.name,
      kind: item.kind,
      relic: item.relic,
      floor: semantic.floor,
      effectRole: semantic.effectRole
    }];
  }));
}

function shopIdentityFingerprint(shopOptions) {
  const options = shopOptions.filter((option) => ['mpRestore', 'maxMp'].includes(option.id));
  return options.map((option) => ({ id: option.id, label: option.label, magicOnly: option.magicOnly === true }));
}

/**
 * Captures every spatial/progression/identity promise and deliberately omits
 * the numeric fields which the next pass is allowed to explore.
 */
export function captureDemoTwentyFloorSolverLocks({ floors = FLOORS, enemies = ENEMIES, items = ITEMS, shopOptions = SHOP_OPTIONS } = {}) {
  if (!Array.isArray(floors) || floors.length !== 20) throw new Error('20F solver profile requires assembled twenty-floor content.');
  const progression = validateDemoTwentyFloorProgressionTopology();
  const spatial = validateDemoTwentyFloorSpatialTopology();
  if (!progression.ok || !spatial.ok) {
    throw new Error(`20F solver profile topology invalid: ${[...progression.violations, ...spatial.violations].join(', ')}`);
  }
  return Object.freeze({
    profileId: DEMO20_SOLVER_TUNING_PROFILE_ID,
    contentId: DEMO20_CONTENT_ID,
    progressionId: progression.id,
    spatialId: spatial.id,
    maps: mapFingerprint(floors),
    progression: progressionFingerprint(floors),
    unitIdentity: unitIdentityFingerprint(enemies),
    relicIdentity: relicIdentityFingerprint(items),
    shopIdentity: shopIdentityFingerprint(shopOptions)
  });
}

export function assertDemoTwentyFloorSolverLocks(snapshot, dependencies = {}) {
  const current = captureDemoTwentyFloorSolverLocks(dependencies);
  if (stable(snapshot) !== stable(current)) {
    throw new Error('20F solver candidate changed a locked topology, critical unit, relic, gate, card, room, or stair anchor.');
  }
  return Object.freeze({ ok: true, profileId: DEMO20_SOLVER_TUNING_PROFILE_ID });
}

export function isDemoTwentyFloorNumericField(field) {
  return ACT2_NUMERIC_FIELDS.includes(field);
}
