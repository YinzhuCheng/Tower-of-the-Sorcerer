const CORE_BEARERS = Object.freeze([
  Object.freeze({ floor: 2, enemyId: 'catBoss', core: '月影核心' }),
  Object.freeze({ floor: 2, enemyId: 'foxBoss', core: '森罗核心' }),
  Object.freeze({ floor: 5, enemyId: 'whaleBoss', core: '潮汐核心' }),
  Object.freeze({ floor: 5, enemyId: 'swordBoss', core: '锋刃核心' }),
  Object.freeze({ floor: 5, enemyId: 'dragonBoss', core: '赤焰核心' }),
  Object.freeze({ floor: 7, enemyId: 'astralBoss', core: '天穹核心' }),
  Object.freeze({ floor: 7, enemyId: 'shadowBoss', core: '虚影核心' })
]);

const FLOORS = Object.freeze({
  1: Object.freeze({ exitGuardians: Object.freeze([]) }),
  2: Object.freeze({
    exitGuardians: Object.freeze([]),
    guardianGates: Object.freeze({ dualKeyVault: Object.freeze(['catBoss', 'foxBoss']) }),
    keyRelics: Object.freeze(['lucky'])
  }),
  3: Object.freeze({ exitGuardians: Object.freeze([]) }),
  4: Object.freeze({ exitGuardians: Object.freeze([]), keyRelics: Object.freeze(['weapon']) }),
  5: Object.freeze({ exitGuardians: Object.freeze(['whaleBoss', 'swordBoss', 'dragonBoss']) }),
  6: Object.freeze({ exitGuardians: Object.freeze([]), keyRelics: Object.freeze(['holy']) }),
  7: Object.freeze({
    exitGuardians: Object.freeze(['astralBoss', 'shadowBoss', 'shadowWardBlade', 'shadowWardCantor']),
    keyRelics: Object.freeze(['ward'])
  }),
  8: Object.freeze({
    exitGuardians: Object.freeze(['palaceWarden']),
    guardianGates: Object.freeze({ hushVault: Object.freeze(['hushVaultBlade', 'hushVaultCantor']) })
  }),
  9: Object.freeze({ exitGuardians: Object.freeze(['blackSealKeeper']) }),
  10: Object.freeze({ finalPhases: Object.freeze(['finalQueen', 'voidCore']) })
});

export const DEMO10_PROGRESSION_TOPOLOGY_ID = 'demo-10f-progression-topology-v1';

/**
 * Source-of-truth semantic contract for the product-facing ten-floor campaign.
 * It intentionally contains no coordinates or numeric values: room maps and
 * the later tuning pass own those concerns, while this module freezes the
 * boss cadence and progression meaning they must preserve.
 */
export const DEMO10_PROGRESSION_TOPOLOGY = Object.freeze({
  id: DEMO10_PROGRESSION_TOPOLOGY_ID,
  coreBearers: CORE_BEARERS,
  floors: FLOORS,
  newGuardianIds: Object.freeze(['shadowWardBlade', 'shadowWardCantor']),
  bosslessFloors: Object.freeze([1, 3, 4, 6]),
  clusteredGuardianFloors: Object.freeze([2, 5, 7, 8, 10])
});

function idsAreUnique(ids) {
  return new Set(ids).size === ids.length;
}

export function coreBearerIdsByFloor(topology = DEMO10_PROGRESSION_TOPOLOGY) {
  const grouped = {};
  for (const entry of topology.coreBearers ?? []) {
    (grouped[entry.floor] ??= []).push(entry.enemyId);
  }
  return Object.freeze(Object.fromEntries(
    Object.entries(grouped).map(([floor, ids]) => [floor, Object.freeze(ids)])
  ));
}

export function validateDemoTenFloorProgressionTopology(topology = DEMO10_PROGRESSION_TOPOLOGY) {
  const violations = [];
  const floors = topology?.floors ?? {};
  const coreBearers = topology?.coreBearers ?? [];
  const bossless = topology?.bosslessFloors ?? [];

  if (topology?.id !== DEMO10_PROGRESSION_TOPOLOGY_ID) {
    violations.push('unexpected-topology-id');
  }
  if (coreBearers.length !== 7) violations.push('core-bearer-count');

  const coreIds = coreBearers.map((entry) => entry.enemyId);
  if (!idsAreUnique(coreIds)) violations.push('duplicate-core-bearer');

  const coreDistribution = coreBearerIdsByFloor(topology);
  const expectedDistribution = { 2: 2, 5: 3, 7: 2 };
  for (const [floor, expected] of Object.entries(expectedDistribution)) {
    if (coreDistribution[floor]?.length !== expected) violations.push(`core-distribution-f${floor}`);
  }
  if (Object.keys(coreDistribution).some((floor) => !(floor in expectedDistribution))) {
    violations.push('unexpected-core-floor');
  }

  for (const floor of [1, 3, 4, 6]) {
    if (!Array.isArray(floors[floor]?.exitGuardians) || floors[floor].exitGuardians.length !== 0) {
      violations.push(`bossless-floor-f${floor}`);
    }
  }
  if (!idsAreUnique(bossless) || bossless.length !== 4) violations.push('bossless-floor-set');

  const expectedExitGroups = {
    5: ['whaleBoss', 'swordBoss', 'dragonBoss'],
    7: ['astralBoss', 'shadowBoss', 'shadowWardBlade', 'shadowWardCantor'],
    8: ['palaceWarden'],
    9: ['blackSealKeeper']
  };
  for (const [floor, expected] of Object.entries(expectedExitGroups)) {
    const actual = floors[floor]?.exitGuardians ?? [];
    if (actual.length !== expected.length || actual.some((id, index) => id !== expected[index])) {
      violations.push(`exit-guardian-group-f${floor}`);
    }
  }

  const f2Vault = floors[2]?.guardianGates?.dualKeyVault ?? [];
  if (f2Vault.length !== 2 || f2Vault[0] !== 'catBoss' || f2Vault[1] !== 'foxBoss') {
    violations.push('f2-dual-key-vault');
  }
  if (!floors[2]?.keyRelics?.includes('lucky')) violations.push('f2-lucky-vault');
  if (!floors[4]?.keyRelics?.includes('weapon')) violations.push('f4-weapon');
  if (!floors[6]?.keyRelics?.includes('holy')) violations.push('f6-holy');
  if (!floors[7]?.keyRelics?.includes('ward')) violations.push('f7-ward');

  const f8Vault = floors[8]?.guardianGates?.hushVault ?? [];
  if (f8Vault.length !== 2 || f8Vault[0] !== 'hushVaultBlade' || f8Vault[1] !== 'hushVaultCantor') {
    violations.push('f8-optional-vault');
  }
  if (floors[10]?.finalPhases?.join(',') !== 'finalQueen,voidCore') violations.push('f10-final-phases');

  return Object.freeze({
    id: topology?.id,
    ok: violations.length === 0,
    violations: Object.freeze(violations),
    coreBearersByFloor: coreDistribution,
    exitGuardiansByFloor: Object.freeze(Object.fromEntries(
      Object.keys(floors).map((floor) => [floor, Object.freeze([...(floors[floor]?.exitGuardians ?? [])])])
    ))
  });
}
