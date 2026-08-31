const CORE_BEARERS = Object.freeze([
  Object.freeze({ floor: 2, enemyId: 'catBoss', core: '月影核心' }),
  Object.freeze({ floor: 2, enemyId: 'foxBoss', core: '森罗核心' }),
  Object.freeze({ floor: 5, enemyId: 'whaleBoss', core: '潮汐核心' }),
  Object.freeze({ floor: 5, enemyId: 'swordBoss', core: '锋刃核心' }),
  Object.freeze({ floor: 5, enemyId: 'dragonBoss', core: '赤焰核心' }),
  Object.freeze({ floor: 7, enemyId: 'astralBoss', core: '天穹核心' }),
  Object.freeze({ floor: 7, enemyId: 'shadowBoss', core: '虚影核心' })
]);

// A shop is a major act-level conversion decision, not an every-floor service.
// Its floor belongs to the topology contract because moving or duplicating it
// changes the player decision graph and the solver's action space.
export const DEMO10_ACT_I_SHOP_FLOORS = Object.freeze([5]);

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
  shopFloors: DEMO10_ACT_I_SHOP_FLOORS,
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
  if ((topology?.shopFloors ?? []).join(',') !== DEMO10_ACT_I_SHOP_FLOORS.join(',')) {
    violations.push('act-i-shop-floor-set');
  }

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

function floorByNumber(floors, number) {
  return floors.find((floor) => floor.number === number) ?? null;
}

function configureFloor(floor, { title, objective, exitGuardians, guardianGates, primaryBoss } = {}) {
  if (!floor) throw new Error('10F progression topology could not find a required floor.');
  if (title) floor.title = title;
  if (objective) floor.objective = objective;
  floor.exitGuardians = [...(exitGuardians ?? [])];
  if (guardianGates) {
    floor.puzzles = {
      ...(floor.puzzles ?? {}),
      guardianGates: {
        ...(floor.puzzles?.guardianGates ?? {}),
        ...Object.fromEntries(Object.entries(guardianGates).map(([gateId, ids]) => [gateId, [...ids]]))
      }
    };
  }
  if (primaryBoss) floor.boss = primaryBoss;
  else delete floor.boss;
  floor.demoProgressionTopologyId = DEMO10_PROGRESSION_TOPOLOGY_ID;
}

function installShadowWardens(enemies) {
  Object.assign(enemies, {
    shadowWardBlade: {
      name: '影仪近卫·断棱', portrait: 'sword_boss', faction: '虚影织界·四相仪式', floor: 7,
      hp: 1180, atk: 174, def: 82, gold: 260, boss: true, special: 'firstStrike',
      description: '四相仪式的执刃近卫。她不持有核心，但与其余守卫共同维持通往王庭的上楼结界。'
    },
    shadowWardCantor: {
      name: '影仪近卫·残歌', portrait: 'void_priestess', faction: '虚影织界·四相仪式', floor: 7,
      hp: 1120, atk: 168, def: 78, gold: 260, boss: true, special: 'magic', magicPower: 118,
      description: '四相仪式的咏唱近卫。她的固定魔法伤害迫使玩家在进入王庭前确认防护与生命储备。'
    }
  });
}

/**
 * Applies the demo-only progression topology before the spatial redesign.
 * The spatial layer is responsible for giving these semantics authored rooms
 * and final coordinates. No engine transition is duplicated here.
 */
export function applyDemoTenFloorProgressionTopology({ floors, enemies } = {}) {
  if (!Array.isArray(floors) || !enemies) {
    throw new Error('10F progression topology requires floors and enemies.');
  }
  if (floors.length !== 10 || floors[9]?.demoContentId == null) {
    throw new Error('10F progression topology expects installed ten-floor demo content.');
  }
  if (floors[9]?.demoProgressionTopologyId === DEMO10_PROGRESSION_TOPOLOGY_ID) {
    return Object.freeze({ applied: false, id: DEMO10_PROGRESSION_TOPOLOGY_ID });
  }

  const validation = validateDemoTenFloorProgressionTopology();
  if (!validation.ok) throw new Error(`Invalid 10F progression topology: ${validation.violations.join(', ')}`);
  for (const bearer of CORE_BEARERS) {
    if (!enemies[bearer.enemyId]) throw new Error(`10F progression topology requires ${bearer.enemyId}.`);
    enemies[bearer.enemyId].floor = bearer.floor;
  }
  installShadowWardens(enemies);

  configureFloor(floorByNumber(floors, 1), {
    title: '月白门廊',
    objective: '拿图鉴，查看敌人耗血；卡门会消耗对应卡。',
    exitGuardians: []
  });
  configureFloor(floorByNumber(floors, 2), {
    title: '森罗双钥',
    objective: '主路可直接上行；双钥宝库为可选奖励。',
    exitGuardians: [],
    guardianGates: { dualKeyVault: ['catBoss', 'foxBoss'] }
  });
  configureFloor(floorByNumber(floors, 3), {
    title: '深蓝航道',
    objective: '踩亮两枚潮汐开关，打开上行封锁。',
    exitGuardians: []
  });
  configureFloor(floorByNumber(floors, 4), {
    title: '锋刃锻炉',
    objective: '开启锻炉，拿辉月魔刃后前往中层。',
    exitGuardians: []
  });
  configureFloor(floorByNumber(floors, 5), {
    title: '赤焰熔心',
    objective: '商店只在此处；击败三名核心守卫才能上行。',
    exitGuardians: ['whaleBoss', 'swordBoss', 'dragonBoss'],
    primaryBoss: 'dragonBoss'
  });
  configureFloor(floorByNumber(floors, 6), {
    title: '星镜书库',
    objective: '按符文顺序完成星镜仪式，取得圣辉原液。',
    exitGuardians: []
  });
  configureFloor(floorByNumber(floors, 7), {
    title: '虚影合鸣',
    objective: '穿过双相结界；四名守卫全部落败后才能上行。',
    exitGuardians: ['astralBoss', 'shadowBoss', 'shadowWardBlade', 'shadowWardCantor'],
    primaryBoss: 'shadowBoss'
  });
  configureFloor(floorByNumber(floors, 8), {
    exitGuardians: ['palaceWarden'],
    primaryBoss: 'palaceWarden'
  });
  configureFloor(floorByNumber(floors, 9), {
    exitGuardians: ['blackSealKeeper'],
    primaryBoss: 'blackSealKeeper'
  });
  configureFloor(floorByNumber(floors, 10), {
    primaryBoss: 'voidCore'
  });

  return Object.freeze({
    applied: true,
    id: DEMO10_PROGRESSION_TOPOLOGY_ID,
    coreBearersByFloor: coreBearerIdsByFloor(),
    shadowWardens: Object.freeze(['shadowWardBlade', 'shadowWardCantor'])
  });
}
