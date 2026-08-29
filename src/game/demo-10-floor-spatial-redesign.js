const GRID_SIZE = 11;

export const DEMO10_SPATIAL_REDESIGN_ID = 'demo-10f-spatial-redesign-v1';

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

function assertF1SpatialContract(map) {
  if (!sameHistogram(eventHistogram(map), F1_EVENT_HISTOGRAM)) {
    throw new Error('F1 spatial redesign must preserve the complete F1 event inventory.');
  }
  const start = locate(map, 'S');
  const exit = locate(map, 'U');
  if (!start || !exit || !canReach(map, start, exit)) {
    throw new Error('F1 spatial redesign must keep every room connected from the entry.');
  }
  if (canReach(map, start, exit, 'enemy:catBoss')) {
    throw new Error('F1 spatial redesign must keep the upward stair behind catBoss.');
  }
}

/**
 * Applies the first floor's room-based layout after the 10F content overlay.
 * The map stays idempotent and keeps the event/economy inventory unchanged.
 */
export function applyDemoTenFloorSpatialRedesign({ floors, gridSize = GRID_SIZE } = {}) {
  if (!Array.isArray(floors)) throw new Error('F1 spatial redesign requires floors.');
  if (gridSize !== GRID_SIZE) throw new Error(`F1 spatial redesign requires grid size ${GRID_SIZE}.`);
  if (floors.length !== 10 || floors[9]?.demoContentId == null) {
    throw new Error('F1 spatial redesign expects the installed 10F demo content overlay.');
  }

  const floor = floors.find((entry) => entry.number === 1);
  if (!floor) throw new Error('F1 spatial redesign could not find floor 1.');
  if (floor.demoSpatialRedesignId === DEMO10_SPATIAL_REDESIGN_ID) {
    return { applied: false, id: DEMO10_SPATIAL_REDESIGN_ID, floor };
  }

  const originalInventory = eventHistogram(floor.map);
  if (!sameHistogram(originalInventory, F1_EVENT_HISTOGRAM)) {
    throw new Error('F1 spatial redesign received unexpected F1 event inventory.');
  }
  assertF1SpatialContract(F1_ROOM_MAP);

  floor.map = F1_ROOM_MAP.map((row) => [...row]);
  Object.assign(floor, {
    objective: '从入口室选择补给路径，在中央商店准备后挑战猫卫长米露并回收月影核心。',
    demoSpatialRedesignId: DEMO10_SPATIAL_REDESIGN_ID,
    roomPlan: Object.freeze(['入口补给室', '月影资源密室', '中央商店枢纽', '侧藏宝间', '猫卫长战斗室'])
  });

  return { applied: true, id: DEMO10_SPATIAL_REDESIGN_ID, floor };
}
