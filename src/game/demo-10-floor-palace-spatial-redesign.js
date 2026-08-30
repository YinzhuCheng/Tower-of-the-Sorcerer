const GRID_SIZE = 11;

export const DEMO10_PALACE_SPATIAL_REDESIGN_ID = 'demo-10f-palace-spatial-redesign-v1-topology-lock';

function parseMap(text) {
  const rows = text.trim().split('\n').map((row) => row.trim().split(/\s+/));
  if (rows.length !== GRID_SIZE || rows.some((row) => row.length !== GRID_SIZE)) {
    throw new Error('10F palace spatial redesign maps must remain 11×11.');
  }
  return rows;
}

// These are authored after the progression grammar: F8 already contains its
// optional guardian vault and F10 already contains the unique Sun throne seal.
// They therefore move no content across the campaign, and only give the late
// floors a readable spatial identity and real card-gated decisions.
const PALACE_ROOM_MAPS = Object.freeze({
  8: parseMap(`
    # # # # # # # # # # #
    # enemy:outerCrown . item:hp . item:hpLarge enemy:hushCantor . enemy:palaceWarden U #
    # . # . # # # # # # #
    # enemy:hushCantor . item:atk . . . item:def . enemy:outerCrown #
    # # # # gate:hush gate:hush gate:hush # # # #
    # item:hpLarge . item:star . . . enemy:outerCrown enemy:muteGuard enemy:hushCantor #
    # . # . # # # # # . #
    # . . door:star switch:hushB # . door:moon switch:hushA # #
    # . # item:star # item:moon . enemy:hushVaultBlade # # #
    # D item:moon enemy:muteGuard item:moon item:def . enemy:hushVaultCantor gate:hushVault item:dual #
    # # # # # # # # # # #
  `),
  9: parseMap(`
    # # # # # # # # # # #
    # enemy:starSentinel . item:dual . item:hpLarge enemy:nullCantor . enemy:blackSealKeeper U #
    # . # . # # # . # . #
    # item:hpLarge . enemy:nullCantor . item:def . . enemy:crownShade . #
    # # # # gate:blackstar gate:blackstar gate:blackstar # # # #
    # enemy:starSentinel . item:atk rune:A . . enemy:nullCantor enemy:crownShade . #
    # . . # . # . # # # #
    # . door:star rune:C # item:sun rune:B door:moon shop item:hp #
    # . # # . . . # # # #
    # D item:moon . enemy:starSentinel item:atk item:def . item:star . #
    # # # # # # # # # # #
  `),
  10: parseMap(`
    # # # # # # # # # # #
    # item:dual enemy:crownKnight . gate:throneSeal enemy:finalQueen gate:throneSeal . enemy:eclipseMage item:hpLarge #
    # . # . # # # . # . #
    # item:hpLarge . enemy:silenceGuard . item:atk . enemy:silenceGuard . item:hpLarge #
    # . # . # . # . # . #
    # item:def enemy:eclipseMage . . . . enemy:crownKnight . . #
    # . # # # # # # # . #
    # . . door:moon item:dual # item:moon . enemy:eclipseMage . #
    # . # # # # # . # . #
    # D item:star enemy:crownKnight item:def . item:star . item:hpLarge . #
    # # # # # # # # # # #
  `)
});

const PALACE_ROOM_PLANS = Object.freeze({
  8: Object.freeze([
    '下行谒见庭',
    '星卡封锁的静默西龛',
    '月卡封锁的静默东龛',
    '双开关前庭与王庭闸门',
    '寂光双卫可选宝库',
    '执剑官上行庭'
  ]),
  9: Object.freeze([
    '倒悬桥入口厅',
    '星卡封锁的星落观测室',
    '晨辉与月蚀校准台',
    '月卡封锁的最终商店',
    '黑印桥闸与观测官庭',
    '王座上行桥'
  ]),
  10: Object.freeze([
    '王座谒见厅',
    '月卡封锁的最后补给侧室',
    '左右近卫廊',
    '双向日卡王座封印',
    '无声女王御座'
  ])
});

function copyMap(map) {
  return map.map((row) => [...row]);
}

function floorByNumber(floors, number) {
  return floors.find((floor) => floor.number === number) ?? null;
}

function locate(map, token) {
  for (let y = 0; y < map.length; y += 1) {
    for (let x = 0; x < map[y].length; x += 1) {
      if (map[y][x] === token) return { x, y };
    }
  }
  return null;
}

function tokenCounts(map) {
  const counts = new Map();
  for (const row of map) {
    for (const token of row) {
      // Walls and empty floor are intentionally the only things a room pass
      // may change. Every interactive token stays exactly conserved.
      if (token === '#' || token === '.') continue;
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }
  return counts;
}

function assertSameInventory(floor, nextMap) {
  const current = tokenCounts(floor.map);
  const next = tokenCounts(nextMap);
  const tokens = new Set([...current.keys(), ...next.keys()]);
  for (const token of tokens) {
    if ((current.get(token) ?? 0) !== (next.get(token) ?? 0)) {
      throw new Error(
        `F${floor.number} palace redesign must preserve ${token}: `
        + `${current.get(token) ?? 0} → ${next.get(token) ?? 0}.`
      );
    }
  }
}

function assertLateFloorAnchors(floorNumber, map) {
  const required = {
    8: ['D', 'U', 'switch:hushA', 'switch:hushB', 'gate:hush', 'gate:hushVault', 'enemy:palaceWarden'],
    9: ['D', 'U', 'rune:A', 'rune:B', 'rune:C', 'gate:blackstar', 'enemy:blackSealKeeper', 'shop'],
    10: ['D', 'door:moon', 'gate:throneSeal', 'enemy:finalQueen']
  }[floorNumber] ?? [];
  for (const token of required) {
    if (!locate(map, token)) throw new Error(`F${floorNumber} palace redesign is missing ${token}.`);
  }
}

/**
 * Roomizes the late palace after its dynamic progression features have been
 * installed.  Its multiset invariant deliberately prevents accidental enemy,
 * card, reward, or gate-count changes while the topology is being frozen.
 */
export function applyDemoTenFloorPalaceSpatialRedesign({ floors, gridSize = GRID_SIZE } = {}) {
  if (!Array.isArray(floors) || floors.length !== 10) {
    throw new Error('10F palace spatial redesign requires assembled ten-floor content.');
  }
  if (gridSize !== GRID_SIZE) throw new Error(`10F palace spatial redesign requires grid size ${GRID_SIZE}.`);

  let applied = false;
  const redesigned = [];
  for (const floorNumber of Object.keys(PALACE_ROOM_MAPS).map(Number)) {
    const floor = floorByNumber(floors, floorNumber);
    if (!floor) throw new Error(`10F palace spatial redesign could not find F${floorNumber}.`);
    if (floor.demoPalaceSpatialRedesignId === DEMO10_PALACE_SPATIAL_REDESIGN_ID) {
      redesigned.push(floor);
      continue;
    }
    const nextMap = PALACE_ROOM_MAPS[floorNumber];
    assertLateFloorAnchors(floorNumber, nextMap);
    assertSameInventory(floor, nextMap);
    floor.map = copyMap(nextMap);
    floor.roomPlan = PALACE_ROOM_PLANS[floorNumber];
    floor.demoPalaceSpatialRedesignId = DEMO10_PALACE_SPATIAL_REDESIGN_ID;
    redesigned.push(floor);
    applied = true;
  }

  return Object.freeze({
    applied,
    id: DEMO10_PALACE_SPATIAL_REDESIGN_ID,
    floors: Object.freeze(redesigned)
  });
}
