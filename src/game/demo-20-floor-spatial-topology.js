import {
  DEMO20_PROGRESSION_TOPOLOGY,
  DEMO20_PROGRESSION_TOPOLOGY_ID
} from './demo-20-floor-progression-topology.js';
import { buildStaticCardTopologyGraph } from '../tuner/static-card-topology.js';

const GRID_SIZE = 11;
const DIRECTIONS = Object.freeze([[1, 0], [-1, 0], [0, 1], [0, -1]]);

/**
 * This is a spatial lock, not a runtime-content overlay.  The maps use the
 * semantic IDs frozen in demo-20-floor-progression-topology.js, but do not
 * register combat values, item values, shop prices, or artwork.  Runtime
 * integration deliberately happens only after this topology is accepted.
 */
export const DEMO20_SPATIAL_TOPOLOGY_ID = 'demo-20f-spatial-topology-v1';

function parseMap(text) {
  const rows = text.trim().split('\n').map((row) => row.trim().split(/\s+/));
  if (rows.length !== GRID_SIZE || rows.some((row) => row.length !== GRID_SIZE)) {
    throw new Error('20F spatial topology maps must remain 11×11.');
  }
  return Object.freeze(rows.map((row) => Object.freeze(row)));
}

function freezeFloor({ number, map, roomPlan, puzzles = {}, exitBarrier = null, vaultBarrier = null, phaseBarrier = null, protectedBarriers = [] }) {
  return Object.freeze({
    number,
    map,
    roomPlan: Object.freeze([...roomPlan]),
    puzzles: Object.freeze({
      ...puzzles,
      cardGates: Object.freeze(Object.fromEntries(
        Object.entries(puzzles.cardGates ?? {}).map(([id, cards]) => [id, Object.freeze({ ...cards })])
      ))
    }),
    exitBarrier,
    vaultBarrier,
    phaseBarrier,
    protectedBarriers: Object.freeze(protectedBarriers.map((entry) => Object.freeze({ ...entry })))
  });
}

// Each named gate appears exactly once.  That makes a gate legible in the
// room and lets the static audit prove that it is a cut rather than scenery.
const FLOOR_MAPS = Object.freeze({
  11: freezeFloor({
    number: 11,
    map: parseMap(`
      # # # # # # # # # # #
      # item:manaFlask . . # item:star . item:moon # U #
      # . # . # . # . # gate:f11LunarTrace #
      # . # . . . # . # . #
      # . # # # # # # # . #
      # . . . # item:moon . . # . #
      # . # . # . # . # . #
      # . # . . . # . . . #
      # . # # # # # # # # #
      # D . enemy:manaWisp . item:star . enemy:aetherWarden . . #
      # # # # # # # # # # #
    `),
    roomPlan: ['觉醒落点', '复苏壁龛', '附刃校准回廊', '回返补给环', '月痕上行门廊'],
    puzzles: { cardGates: { f11LunarTrace: { moon: 1 } } },
    protectedBarriers: [{ barrier: 'gate:f11LunarTrace', target: 'U' }]
  }),
  12: freezeFloor({
    number: 12,
    map: parseMap(`
      # # # # # # # # # # #
      # item:aetherPrism gate:twinChordVault . # item:moon . . . U #
      # # enemy:resonanceBlade . # . # . # . #
      # . . enemy:resonanceCantor . . . # . . #
      # . # # # . # . # . #
      # . . . # . . . # . #
      # . # . # # # # # . #
      # . # . . . # item:star . . #
      # . # # # . # . # # #
      # D . enemy:runeCantor . . enemy:aetherWarden . item:star . #
      # # # # # # # # # # #
    `),
    roomPlan: ['温室入口厅', '主路调律走廊', '双谱汇流室', '共鸣双卫宝库', '北侧上行温室'],
    vaultBarrier: 'gate:twinChordVault',
    protectedBarriers: [{ barrier: 'gate:twinChordVault', target: 'item:aetherPrism' }]
  }),
  13: freezeFloor({
    number: 13,
    map: parseMap(`
      # # # # # # # # # # #
      # item:conduitCodex . . # . item:moon . . U #
      # . . . gate:f13StarConduit . . . . . #
      # . . . # . # # # . #
      # # # # # . # . # . #
      # item:moon . . # . # . # . #
      # . . . gate:f13MoonBypass . # . # . #
      # . enemy:spellbladeDuelist . # . . . # . #
      # # # # # . # # # . #
      # D . enemy:manaWisp . . enemy:runeCantor . item:star . #
      # # # # # # # # # # #
    `),
    roomPlan: ['锻炉入口', '星导管熔铸室', '月相旁路室', '双回路汇流厅', '封印上行前庭'],
    puzzles: { cardGates: { f13StarConduit: { star: 2 }, f13MoonBypass: { moon: 2 } } },
    protectedBarriers: [
      { barrier: 'gate:f13StarConduit', target: 'item:conduitCodex' },
      { barrier: 'gate:f13MoonBypass', target: 'enemy:spellbladeDuelist' }
    ]
  }),
  14: freezeFloor({
    number: 14,
    map: parseMap(`
      # # # # # # # # # # #
      # . . . # U # . . . #
      # . # . # gate:f14TriuneSeal # . # . #
      # . # . . . . . # . #
      # . # # # . # # # . #
      # . enemy:arcaneGatekeeper . # . # . enemy:spectrumMarshal . #
      # . # . # . # . # . #
      # . # . . enemy:triuneArbiter . . # . #
      # . # # # . # # # . #
      # D . enemy:manaSentinel . item:star . item:moon . . #
      # # # # # # # # # # #
    `),
    roomPlan: ['三矢入场庭', '刃矢战场', '谱矢战场', '裁定中央封台', '三钥上行台'],
    exitBarrier: 'gate:f14TriuneSeal',
    protectedBarriers: [{ barrier: 'gate:f14TriuneSeal', target: 'U' }]
  }),
  15: freezeFloor({
    number: 15,
    map: parseMap(`
      # # # # # # # # # # #
      # item:arcaneBattery . . # . . . . U #
      # . . . gate:f15ArchiveSeal . . . . . #
      # . . . # . # # # . #
      # # # # # . # shop # . #
      # . . . # . . shop # . #
      # . # . # . # # # . #
      # . # . . . # item:moon . . #
      # . # # # . # . # # #
      # D . enemy:prismArchivist . item:star . enemy:runeCantor . . #
      # # # # # # # # # # #
    `),
    roomPlan: ['档案馆入口厅', '阅览中庭', 'MP 转换商店', '页间补给侧室', '封卷上行阶'],
    puzzles: { cardGates: { f15ArchiveSeal: { star: 2 } } },
    protectedBarriers: [{ barrier: 'gate:f15ArchiveSeal', target: 'item:arcaneBattery' }]
  }),
  16: freezeFloor({
    number: 16,
    map: parseMap(`
      # # # # # # # # # # #
      # item:mirrorReservoir . enemy:mirrorCantor # . . . . U #
      # . enemy:mirrorDuelist . gate:mirrorReservoirVault . . . . . #
      # . . . # . # # # . #
      # # # # # . # . # . #
      # item:moon . . # . # . # . #
      # . . enemy:mirrorHuntress gate:f16PrismThreshold . # . # . #
      # . . . # . . . # . #
      # # # # # . # # # . #
      # D . enemy:spellbladeDuelist . item:star . enemy:aetherWarden item:moon . #
      # # # # # # # # # # #
    `),
    roomPlan: ['镜轮落点', '外环折返廊', '棱镜门槛', '双镜战斗殿', '镜泉上行室'],
    puzzles: { cardGates: { f16PrismThreshold: { moon: 2 } } },
    vaultBarrier: 'gate:mirrorReservoirVault',
    protectedBarriers: [
      { barrier: 'gate:f16PrismThreshold', target: 'enemy:mirrorHuntress' },
      { barrier: 'gate:mirrorReservoirVault', target: 'item:mirrorReservoir' }
    ]
  }),
  17: freezeFloor({
    number: 17,
    map: parseMap(`
      # # # # # # # # # # #
      # item:crownCapacitor . . # U # item:sun . . #
      # . enemy:crownBlade . # gate:f17CrownSeal # . enemy:crownCantor . #
      # . # . # . # . # . #
      # # # . . . . # . . #
      # # # # . . # # . . #
      # . item:star . # . # . item:moon . #
      # . # . # . # . # . #
      # . # . . enemy:crownMagus . . # . #
      # D . . . . . . . . #
      # # # # # # # # # # #
    `),
    roomPlan: ['三冠入阶厅', '刃冠阶庭', '咏冠汇合台', '法冠阶庭', '冠印上行王阶'],
    exitBarrier: 'gate:f17CrownSeal',
    protectedBarriers: [{ barrier: 'gate:f17CrownSeal', target: 'U' }]
  }),
  18: freezeFloor({
    number: 18,
    map: parseMap(`
      # # # # # # # # # # #
      # . . . # U # item:moon . . #
      # . # . # gate:f18SunBridge # . # . #
      # # # . . . . . # . #
      # # # # . # # # . . #
      # item:moon . . # . # . # . #
      # . . enemy:voidHerald gate:f18StarChannel . # . # . #
      # . . . # . . . # . #
      # # # # # . # # # . #
      # D . enemy:prismArchivist . item:moon . enemy:manaSentinel . . #
      # # # # # # # # # # #
    `),
    roomPlan: ['航渠入口', '星渠交叉桥', '日桥供能台', '虚空补给停泊室', '终局前上行前厅'],
    puzzles: { cardGates: { f18SunBridge: { sun: 1 }, f18StarChannel: { star: 2 } } },
    protectedBarriers: [
      { barrier: 'gate:f18SunBridge', target: 'U' },
      { barrier: 'gate:f18StarChannel', target: 'enemy:voidHerald' }
    ]
  }),
  19: freezeFloor({
    number: 19,
    map: parseMap(`
      # # # # # # # # # # #
      # . . . # U # . . . #
      # . # . # gate:f19RegentSeal # . # . #
      # . # . # enemy:echoRegent # . # . #
      # item:originFocus # . # . # . # . #
      # . # . # . # . # . #
      # . item:star . # . # . item:moon . #
      # . # . # gate:f19ThroneLicense # . # . #
      # . # . # . # . # . #
      # D . enemy:spellbladeDuelist . . . enemy:mirrorHuntress . . #
      # # # # # # # # # # #
    `),
    roomPlan: ['回响入口厅', '执照侧廊', '摄政前庭', '回声王座门', '终局上行阶'],
    puzzles: { cardGates: { f19ThroneLicense: { moon: 2 } } },
    exitBarrier: 'gate:f19RegentSeal',
    protectedBarriers: [
      { barrier: 'gate:f19ThroneLicense', target: 'enemy:echoRegent' },
      { barrier: 'gate:f19RegentSeal', target: 'U', alsoOpen: ['gate:f19ThroneLicense'] }
    ]
  }),
  20: freezeFloor({
    number: 20,
    map: parseMap(`
      # # # # # # # # # # #
      # . . . # enemy:originCore # . . . #
      # . # . # gate:f20SovereignSeal # . # . #
      # . # . # . # . # . #
      # . # . # enemy:arcaneSovereign # . # . #
      # . # . # council # . # . #
      # . item:hpLarge . # . # . enemy:voidHerald . #
      # . # . # . # . # . #
      # . # . # . # . # . #
      # D . enemy:manaSentinel . . . enemy:manaSentinel . . #
      # # # # # # # # # # #
    `),
    roomPlan: ['起源门厅', '相位近卫廊', '主权者前庭', '核心封印桥', '双相终局室'],
    phaseBarrier: 'gate:f20SovereignSeal',
    protectedBarriers: [{ barrier: 'gate:f20SovereignSeal', target: 'enemy:originCore' }]
  })
});

export const DEMO20_SPATIAL_TOPOLOGY = Object.freeze({
  id: DEMO20_SPATIAL_TOPOLOGY_ID,
  progressionTopologyId: DEMO20_PROGRESSION_TOPOLOGY_ID,
  floors: Object.freeze(Object.values(FLOOR_MAPS))
});

function isBarrier(token) {
  return /^(door|gate):/.test(String(token));
}

function locate(map, token) {
  for (let y = 0; y < map.length; y += 1) {
    for (let x = 0; x < map[y].length; x += 1) {
      if (map[y][x] === token) return { x, y };
    }
  }
  return null;
}

function entryPoint(floor) {
  return locate(floor.map, 'D') ?? locate(floor.map, 'S');
}

function reachable(floor, { openedBarrier = null, alsoOpen = [] } = {}) {
  const entry = entryPoint(floor);
  if (!entry) return new Set();
  const opened = new Set([openedBarrier, ...alsoOpen].filter(Boolean));
  const reached = new Set([`${entry.x},${entry.y}`]);
  const queue = [entry];
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    for (const [dx, dy] of DIRECTIONS) {
      const x = current.x + dx;
      const y = current.y + dy;
      const token = floor.map[y]?.[x];
      const key = `${x},${y}`;
      if (token == null || token === '#' || (isBarrier(token) && !opened.has(token)) || reached.has(key)) continue;
      reached.add(key);
      queue.push({ x, y });
    }
  }
  return reached;
}

function barrierComponents(floor) {
  const labels = new Map();
  let nextLabel = 0;
  const walkable = (x, y) => {
    const token = floor.map[y]?.[x];
    return token != null && token !== '#' && !isBarrier(token);
  };
  for (let y = 0; y < floor.map.length; y += 1) {
    for (let x = 0; x < floor.map[y].length; x += 1) {
      const key = `${x},${y}`;
      if (!walkable(x, y) || labels.has(key)) continue;
      const queue = [{ x, y }];
      labels.set(key, nextLabel);
      for (let index = 0; index < queue.length; index += 1) {
        const current = queue[index];
        for (const [dx, dy] of DIRECTIONS) {
          const nx = current.x + dx;
          const ny = current.y + dy;
          const nextKey = `${nx},${ny}`;
          if (!walkable(nx, ny) || labels.has(nextKey)) continue;
          labels.set(nextKey, nextLabel);
          queue.push({ x: nx, y: ny });
        }
      }
      nextLabel += 1;
    }
  }

  const report = [];
  for (let y = 0; y < floor.map.length; y += 1) {
    for (let x = 0; x < floor.map[y].length; x += 1) {
      const token = floor.map[y][x];
      if (!isBarrier(token)) continue;
      const components = new Set();
      for (const [dx, dy] of DIRECTIONS) {
        const label = labels.get(`${x + dx},${y + dy}`);
        if (label != null) components.add(label);
      }
      report.push(Object.freeze({ token, x, y, componentCount: components.size }));
    }
  }
  return Object.freeze(report);
}

function tokenCount(map, token) {
  return map.flat().filter((cell) => cell === token).length;
}

function hasToken(map, token) {
  return locate(map, token) != null;
}

function hasReachableTarget(floor, target, options) {
  const point = locate(floor.map, target);
  return point != null && reachable(floor, options).has(`${point.x},${point.y}`);
}

function allBarrierTokens(floor) {
  return [...new Set(floor.map.flat().filter(isBarrier))];
}

function walkableCellCount(floor) {
  return floor.map.flat().filter((token) => token !== '#').length;
}

/**
 * Static-only acceptance gate for the topology phase. It proves all visual
 * gates are cuts and checks each card spend has a viable, non-empty protected
 * side. It intentionally never invokes combat, the solver, or the mutator.
 */
export function validateDemoTwentyFloorSpatialTopology(topology = DEMO20_SPATIAL_TOPOLOGY) {
  const violations = [];
  if (topology?.id !== DEMO20_SPATIAL_TOPOLOGY_ID) violations.push('unexpected-spatial-topology-id');
  if (topology?.progressionTopologyId !== DEMO20_PROGRESSION_TOPOLOGY_ID) violations.push('unexpected-progression-topology-id');
  const floors = topology?.floors ?? [];
  const expectedNumbers = Array.from({ length: 10 }, (_, index) => index + 11);
  if (floors.map((floor) => floor.number).join(',') !== expectedNumbers.join(',')) violations.push('floor-set');

  const plans = new Set();
  for (const floor of floors) {
    if (floor.map?.length !== GRID_SIZE || floor.map.some((row) => row.length !== GRID_SIZE)) violations.push(`F${floor.number}:grid`);
    if (!entryPoint(floor)) violations.push(`F${floor.number}:entry`);
    if (floor.number < 20 && !hasToken(floor.map, 'U')) violations.push(`F${floor.number}:upper-stair`);
    if (floor.number === 20 && hasToken(floor.map, 'U')) violations.push('F20:must-not-have-upper-stair');
    if ((floor.roomPlan?.length ?? 0) < 5) violations.push(`F${floor.number}:room-plan`);
    plans.add(floor.roomPlan?.join('|'));
    // A room may be intentionally closed at the beginning, but it must join
    // the traversable floor once all of its own declared permissions are
    // satisfied. Otherwise a visual "room" is merely unreachable scenery.
    const fullyOpened = reachable(floor, { alsoOpen: allBarrierTokens(floor) });
    if (fullyOpened.size !== walkableCellCount(floor)) violations.push(`F${floor.number}:unreachable-room-after-open`);
    for (const barrier of barrierComponents(floor)) {
      if (barrier.componentCount < 2) violations.push(`F${floor.number}:${barrier.token}:not-a-cut`);
    }
    for (const { barrier, target, alsoOpen = [] } of floor.protectedBarriers ?? []) {
      if (!hasToken(floor.map, barrier)) violations.push(`F${floor.number}:${barrier}:missing`);
      if (!hasToken(floor.map, target)) violations.push(`F${floor.number}:${target}:missing`);
      if (hasReachableTarget(floor, target)) violations.push(`F${floor.number}:${barrier}:does-not-protect:${target}`);
      if (!hasReachableTarget(floor, target, { openedBarrier: barrier, alsoOpen })) {
        violations.push(`F${floor.number}:${barrier}:does-not-open:${target}`);
      }
    }
  }
  if (plans.size !== expectedNumbers.length) violations.push('reused-room-plan');

  const contracts = DEMO20_PROGRESSION_TOPOLOGY.floors;
  for (const floor of floors) {
    const contract = contracts[floor.number];
    const expectedCardGates = contract?.cardGates ?? [];
    const actualCardGates = Object.keys(floor.puzzles?.cardGates ?? {});
    if (actualCardGates.join(',') !== expectedCardGates.join(',')) violations.push(`F${floor.number}:card-gate-set`);
    for (const id of [...(contract?.exitGuardians ?? []), ...Object.values(contract?.guardianGates ?? {}).flat(), ...(contract?.finalPhases ?? [])]) {
      const token = `enemy:${id}`;
      if (tokenCount(floor.map, token) !== 1) violations.push(`F${floor.number}:unit-count:${id}`);
    }
    for (const id of contract?.keyRelics ?? []) {
      const token = `item:${id}`;
      if (tokenCount(floor.map, token) !== 1) violations.push(`F${floor.number}:relic-count:${id}`);
    }
  }

  const shopFloors = floors.filter((floor) => hasToken(floor.map, 'shop')).map((floor) => floor.number);
  if (shopFloors.join(',') !== '15') violations.push('shop-cadence');

  const cardTopology = buildStaticCardTopologyGraph(floors);
  if (!cardTopology.valid) violations.push(...cardTopology.violations.map((issue) => `card:${issue}`));

  const f14 = floors.find((floor) => floor.number === 14);
  const f17 = floors.find((floor) => floor.number === 17);
  const f19 = floors.find((floor) => floor.number === 19);
  const f20 = floors.find((floor) => floor.number === 20);
  for (const [floor, group] of [[f14, contracts[14].exitGuardians], [f17, contracts[17].exitGuardians], [f19, contracts[19].exitGuardians]]) {
    if (!floor || floor.exitBarrier == null) {
      violations.push(`F${floor?.number ?? '?'}:exit-barrier`);
      continue;
    }
    if (!group.every((id) => hasToken(floor.map, `enemy:${id}`))) violations.push(`F${floor.number}:exit-guardian-group`);
    const exitBarrier = (floor.protectedBarriers ?? []).find((entry) => entry.barrier === floor.exitBarrier && entry.target === 'U');
    if (!hasReachableTarget(floor, 'U', {
      openedBarrier: floor.exitBarrier,
      alsoOpen: exitBarrier?.alsoOpen ?? []
    })) violations.push(`F${floor.number}:exit-gate-does-not-open`);
  }
  if (f20?.phaseBarrier !== 'gate:f20SovereignSeal') violations.push('F20:phase-barrier');
  if (f20 && (!hasToken(f20.map, 'enemy:arcaneSovereign') || !hasToken(f20.map, 'enemy:originCore'))) violations.push('F20:final-phase-units');
  if (f20 && tokenCount(f20.map, 'council') !== 1) violations.push('F20:council-count');
  if (f20 && !hasReachableTarget(f20, 'council')) violations.push('F20:council-unreachable');

  return Object.freeze({
    id: topology?.id,
    ok: violations.length === 0,
    violations: Object.freeze(violations),
    cardTopology,
    shopFloors: Object.freeze(shopFloors)
  });
}
