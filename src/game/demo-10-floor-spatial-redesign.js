const GRID_SIZE = 11;

export const DEMO10_SPATIAL_REDESIGN_ID = 'demo-10f-spatial-redesign-v2';

const F1_EVENT_HISTOGRAM = Object.freeze({
  'door:sun': 3,
  'enemy:catBoss': 1,
  'enemy:catMage': 1,
  'enemy:catScout': 3,
  'enemy:mote': 4,
  'item:atk': 1,
  'item:codex': 1,
  'item:def': 2,
  'item:hp': 3,
  'item:moon': 1,
  'item:sun': 4,
  S: 1,
  shop: 1,
  U: 1
});

const F2_EVENT_HISTOGRAM = Object.freeze({
  D: 1,
  'door:moon': 1,
  'door:sun': 2,
  'enemy:foxAcolyte': 4,
  'enemy:foxArcher': 3,
  'enemy:foxBoss': 1,
  'enemy:vineDruid': 1,
  'gate:vine': 1,
  'item:atk': 2,
  'item:def': 2,
  'item:hp': 2,
  'item:moon': 2,
  'item:sun': 2,
  'switch:vine': 1,
  U: 1
});

function parseMap(text) {
  const rows = text.trim().split('\n').map((row) => row.trim().split(/\s+/));
  if (rows.length !== GRID_SIZE || rows.some((row) => row.length !== GRID_SIZE)) {
    throw new Error('F1 spatial redesign must remain an 11×11 map.');
  }
  return rows;
}

// F1 teaches the player to read a room, choose optional rewards, then return
// through a clear hub before entering the boss room. Every existing event token
// is retained so this is a spatial redesign, not an economy rebalance.
const F1_ROOM_MAP = parseMap(`
  # # # # # # # # # # #
  # item:sun door:sun enemy:mote # # # item:atk enemy:catScout U #
  # item:hp . . # # # enemy:catBoss enemy:catMage item:moon #
  # . . . # # # . # # #
  # item:hp # . enemy:catScout . item:def . # # #
  # enemy:mote . # enemy:mote shop . # . . #
  # . door:sun # . . . . enemy:catScout . #
  # item:hp item:sun enemy:mote . # # # . . #
  # . item:codex . # # # # item:sun item:def #
  # S item:sun door:sun . # # # # # #
  # # # # # # # # # # #
`);

// F2 turns the vine mechanism into a legible spatial promise: the player can
// see the sealed boss court, find the switch in the central relay, and choose
// whether to clear either side chamber before returning to the main route.
const F2_ROOM_MAP = parseMap(`
  # # # # # # # # # # #
  # item:def door:sun enemy:foxArcher # # # item:atk # U #
  # item:moon . . # # # item:hp . enemy:foxBoss #
  # . . . # # # enemy:foxAcolyte gate:vine # #
  # item:hp # . enemy:foxAcolyte switch:vine item:def # enemy:foxArcher # #
  # enemy:vineDruid . # enemy:foxArcher . . # . # #
  # . door:moon # . . . . enemy:foxAcolyte . #
  # item:moon item:sun enemy:foxAcolyte . # # # item:sun item:atk #
  # . . . # # # # door:sun . #
  # D . . . # # # # # #
  # # # # # # # # # # #
`);

function eventHistogram(map) {
  const counts = {};
  for (const row of map) {
    for (const token of row) {
      if (token === '#' || token === '.') continue;
      counts[token] = (counts[token] ?? 0) + 1;
    }
  }
  return counts;
}

function sameHistogram(left, right) {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  return [...keys].every((key) => left[key] === right[key]);
}

function locate(map, token) {
  for (let y = 0; y < map.length; y += 1) {
    for (let x = 0; x < map[y].length; x += 1) {
      if (map[y][x] === token) return { x, y };
    }
  }
  return null;
}

function canReach(map, start, target, blockedToken = null) {
  const queue = [start];
  const seen = new Set([`${start.x},${start.y}`]);
  for (let head = 0; head < queue.length; head += 1) {
    const current = queue[head];
    if (current.x === target.x && current.y === target.y) return true;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const x = current.x + dx;
      const y = current.y + dy;
      const token = map[y]?.[x];
      const key = `${x},${y}`;
      if (token == null || token === '#' || token === blockedToken || seen.has(key)) continue;
      seen.add(key);
      queue.push({ x, y });
    }
  }
  return false;
}

function assertSpatialInventory(map, expected, label) {
  if (!sameHistogram(eventHistogram(map), expected)) {
    throw new Error(`${label} spatial redesign must preserve the complete event inventory.`);
  }
}

function assertF1SpatialContract(map) {
  assertSpatialInventory(map, F1_EVENT_HISTOGRAM, 'F1');
  const start = locate(map, 'S');
  const exit = locate(map, 'U');
  if (!start || !exit || !canReach(map, start, exit)) {
    throw new Error('F1 spatial redesign must keep every room connected from the entry.');
  }
  if (canReach(map, start, exit, 'enemy:catBoss')) {
    throw new Error('F1 spatial redesign must keep the upward stair behind catBoss.');
  }
}

function assertF2SpatialContract(map) {
  assertSpatialInventory(map, F2_EVENT_HISTOGRAM, 'F2');
  const start = locate(map, 'D');
  const exit = locate(map, 'U');
  const vineSwitch = locate(map, 'switch:vine');
  if (!start || !exit || !vineSwitch || !canReach(map, start, vineSwitch, 'gate:vine')) {
    throw new Error('F2 spatial redesign must keep the vine switch reachable from the entry.');
  }
  if (canReach(map, start, exit, 'gate:vine')) {
    throw new Error('F2 spatial redesign must keep the boss court behind the vine gate.');
  }
  if (canReach(map, start, exit, 'enemy:foxBoss')) {
    throw new Error('F2 spatial redesign must keep the upward stair behind foxBoss.');
  }
}

/**
 * Applies the first two floors' room-based layouts after the 10F content overlay.
 * The map stays idempotent and keeps the event/economy inventory unchanged.
 */
export function applyDemoTenFloorSpatialRedesign({ floors, gridSize = GRID_SIZE } = {}) {
  if (!Array.isArray(floors)) throw new Error('10F spatial redesign requires floors.');
  if (gridSize !== GRID_SIZE) throw new Error(`10F spatial redesign requires grid size ${GRID_SIZE}.`);
  if (floors.length !== 10 || floors[9]?.demoContentId == null) {
    throw new Error('10F spatial redesign expects the installed 10F demo content overlay.');
  }

  const floor1 = floors.find((entry) => entry.number === 1);
  const floor2 = floors.find((entry) => entry.number === 2);
  if (!floor1 || !floor2) throw new Error('10F spatial redesign could not find floors 1 and 2.');
  let applied = false;

  if (floor1.demoSpatialRedesignId !== DEMO10_SPATIAL_REDESIGN_ID) {
    assertSpatialInventory(floor1.map, F1_EVENT_HISTOGRAM, 'F1');
    assertF1SpatialContract(F1_ROOM_MAP);
    floor1.map = F1_ROOM_MAP.map((row) => [...row]);
    Object.assign(floor1, {
      objective: '从入口室选择补给路径，在中央商店准备后挑战猫卫长米露并回收月影核心。',
      demoSpatialRedesignId: DEMO10_SPATIAL_REDESIGN_ID,
      roomPlan: Object.freeze(['入口补给室', '月影资源密室', '中央商店枢纽', '侧藏宝间', '猫卫长战斗室'])
    });
    applied = true;
  }

  if (floor2.demoSpatialRedesignId !== DEMO10_SPATIAL_REDESIGN_ID) {
    assertSpatialInventory(floor2.map, F2_EVENT_HISTOGRAM, 'F2');
    assertF2SpatialContract(F2_ROOM_MAP);
    floor2.map = F2_ROOM_MAP.map((row) => [...row]);
    Object.assign(floor2, {
      objective: '探索藤蔓侧室，启动中央继电机关，穿过藤蔓门后击败狐祝绯叶。',
      demoSpatialRedesignId: DEMO10_SPATIAL_REDESIGN_ID,
      roomPlan: Object.freeze(['入口补给室', '藤蔓资源室', '中央继电枢纽', '侧路宝库', '狐祝战斗室'])
    });
    applied = true;
  }

  return { applied, id: DEMO10_SPATIAL_REDESIGN_ID, floors: [floor1, floor2] };
}
