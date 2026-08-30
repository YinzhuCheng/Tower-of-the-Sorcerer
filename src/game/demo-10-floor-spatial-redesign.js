import { DEMO10_PROGRESSION_TOPOLOGY_ID } from './demo-10-floor-progression-topology.js';

const GRID_SIZE = 11;

export const DEMO10_SPATIAL_REDESIGN_ID = 'demo-10f-spatial-redesign-v5-single-shop-topology';

function parseMap(text) {
  const rows = text.trim().split('\n').map((row) => row.trim().split(/\s+/));
  if (rows.length !== GRID_SIZE || rows.some((row) => row.length !== GRID_SIZE)) {
    throw new Error('10F spatial redesign maps must remain 11×11.');
  }
  return rows;
}

// These layouts deliberately encode the progression topology, not numerical
// balance. Critical Boss groups, relics, gates and stairs are fixed here;
// ordinary enemy values and allowed encounter slots are tuned only afterwards.
const ROOM_MAPS = Object.freeze({
  1: parseMap(`
    # # # # # # # # # # #
    # item:sun . enemy:mote # # # item:atk # U #
    # item:hp . . # # # enemy:catMage # door:moon #
    # . . . # # # . # . #
    # item:hp # . enemy:catScout . item:def . # . #
    # enemy:mote . # enemy:mote . . # . . #
    # . . # . . . item:moon enemy:catScout . #
    # item:hp item:sun enemy:mote . # # # . . #
    # . item:codex . # # # # item:sun . #
    # S item:sun door:sun item:def # # # # # #
    # # # # # # # # # # #
  `),
  2: parseMap(`
    # # # # # # # # # # #
    # item:lucky # # # # item:atk . . U #
    # gate:dualKeyVault enemy:catBoss . # # # item:hp . enemy:foxBoss #
    # . . . # # # enemy:foxAcolyte gate:vine # #
    # item:hp # . enemy:foxAcolyte switch:vine item:def # enemy:foxArcher # #
    # enemy:vineDruid . # enemy:foxArcher . . # . # #
    # . . # . . . . enemy:foxAcolyte . #
    # item:moon item:sun enemy:foxAcolyte . # # # item:sun item:atk #
    # . . . # # # # . . #
    # D . . . # # # # # #
    # # # # # # # # # # #
  `),
  3: parseMap(`
    # # # # # # # # # # #
    # # # # # U # # # # #
    # # # # # gate:tide # # # # #
    # # # # . . . # # # #
    # item:hp . . # . # enemy:tideLancer . item:atk #
    # . switch:tideA door:star . . . door:moon switch:tideB . #
    # item:moon . # # . . # # # #
    # . . # # . # . enemy:shellGuard . #
    # # # . # . # . # # #
    # item:compass . . enemy:whaleSinger D enemy:whaleSinger . item:star . #
    # # # # # # # # # # #
  `),
  4: parseMap(`
    # # # # # # # # # # #
    # . . . # item:weapon # . door:star U #
    # . # . # gate:forge # . # . #
    # item:moon # . # . item:star . # . #
    # . # # # . . . # . #
    # . # switch:forge # enemy:swordKnight # enemy:bladePriestess # . #
    # . # door:moon # . # . # . #
    # . . . # . . . # . #
    # # # . # . # . # # #
    # D . enemy:swordApprentice . item:def . . item:hp . #
    # # # # # # # # # # #
  `),
  5: parseMap(`
    # # # # # # # # # # #
    # # item:shield # . U . # . . #
    # # gate:ember # . enemy:dragonBoss . # . . #
    # . . . . . . # . enemy:swordBoss #
    # # # # # # . # . . #
    # enemy:whaleBoss . door:star . . . door:moon . . #
    # . # # . . . # # # #
    # item:moon . . # item:star item:moon # item:star . #
    # # # # # . # # # . #
    # D . . . shop item:def . item:hp enemy:flameCaster #
    # # # # # # # # # # #
  `),
  6: parseMap(`
    # # # # # # # # # # #
    # # item:holy # . . door:moon U # # #
    # # gate:mirror # . # . # # . #
    # . . item:star . rune:B # . # . #
    # # . # . . . . . . #
    # rune:A . item:moon # enemy:mirrorDoll # # door:star # #
    # . # . # . # # . rune:C #
    # . # . . . # . # # #
    # . # # # . # # # . #
    # D . . enemy:cometArcher . item:def . enemy:starWitch . #
    # # # # # # # # # # #
  `),
  7: parseMap(`
    # # # # # # # # # # #
    # . . enemy:astralBoss . U . enemy:shadowBoss . . #
    # # # # . . . # # # #
    # # # . . . . . # # #
    # enemy:shadowWardBlade # . # gate:tri # . # enemy:shadowWardCantor #
    # door:star # . # item:ward # . # door:moon #
    # . # . # # # . # . #
    # item:moon . item:star # . # item:moon . item:star #
    # . # # # . # # # . #
    # D . item:hp enemy:duskDragon . item:atk . . item:def #
    # # # # # # # # # # #
  `)
});

const ROOM_PLANS = Object.freeze({
  1: Object.freeze(['入口补给室', '月影资源密室', '中央观测枢纽', '侧藏宝间', '上行门廊']),
  2: Object.freeze(['下行入口室', '猫卫长翼室', '藤蔓继电枢纽', '狐祝翼室', '双钥秘库']),
  3: Object.freeze(['港厅入口室', '星卡封锁的西潮圣所', '东潮圣所', '双潮汇流前庭', '上行航道']),
  4: Object.freeze(['下行锻炉庭院', '月卡控制室', '中央熔炉回路', '辉月魔刃封存室', '上行剑廊']),
  5: Object.freeze(['下行熔炉入口', '潮汐核心翼', '锋刃核心翼', '赤焰核心炉心', '封印上行台']),
  6: Object.freeze(['下行书库前厅', '新月镜序室', '半月回廊', '星卡封锁的满月室', '圣辉侧室']),
  7: Object.freeze(['下行影廊', '天穹守卫室', '中央双相结界室', '影仪双卫室', '王庭上行台'])
});

function copyMap(map) {
  return map.map((row) => [...row]);
}

function hasToken(map, token) {
  return map.some((row) => row.includes(token));
}

function locate(map, token) {
  for (let y = 0; y < map.length; y += 1) {
    for (let x = 0; x < map[y].length; x += 1) {
      if (map[y][x] === token) return { x, y };
    }
  }
  return null;
}

function canReach(map, start, target, blockedTokens = []) {
  const blocked = new Set(blockedTokens);
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
      if (token == null || token === '#' || blocked.has(token) || seen.has(key)) continue;
      seen.add(key);
      queue.push({ x, y });
    }
  }
  return false;
}

function assertMapContract(floorNumber, map) {
  const entry = locate(map, floorNumber === 1 ? 'S' : 'D');
  const stairs = locate(map, 'U');
  if (!entry || !stairs) throw new Error(`F${floorNumber} spatial map requires both its entry and upper stair.`);
  if (!canReach(map, entry, stairs)) throw new Error(`F${floorNumber} spatial map must stay topologically connected.`);
}

function assertTopologyAnchors(floorNumber, map) {
  const required = {
    1: [],
    2: ['enemy:catBoss', 'enemy:foxBoss', 'gate:dualKeyVault', 'item:lucky'],
    3: ['switch:tideA', 'switch:tideB', 'gate:tide'],
    4: ['switch:forge', 'gate:forge', 'item:weapon'],
    5: ['enemy:whaleBoss', 'enemy:swordBoss', 'enemy:dragonBoss', 'gate:ember', 'item:shield'],
    6: ['rune:A', 'rune:B', 'rune:C', 'gate:mirror', 'item:holy'],
    7: ['enemy:astralBoss', 'enemy:shadowBoss', 'enemy:shadowWardBlade', 'enemy:shadowWardCantor', 'gate:tri', 'item:ward']
  }[floorNumber] ?? [];
  for (const token of required) {
    if (!hasToken(map, token)) throw new Error(`F${floorNumber} topology map is missing ${token}.`);
  }
  if (floorNumber === 1 && hasToken(map, 'enemy:catBoss')) {
    throw new Error('F1 is a bossless tutorial floor in the locked progression topology.');
  }
}

function floorByNumber(floors, number) {
  return floors.find((floor) => floor.number === number) ?? null;
}

/**
 * Applies all F1–F7 room maps after content and progression topology overlays.
 * It is deliberately one atomic spatial pass: individually roomizing old
 * single-Boss floors would recreate the topology that this campaign replaces.
 */
export function applyDemoTenFloorSpatialRedesign({ floors, gridSize = GRID_SIZE } = {}) {
  if (!Array.isArray(floors)) throw new Error('10F spatial redesign requires floors.');
  if (gridSize !== GRID_SIZE) throw new Error(`10F spatial redesign requires grid size ${GRID_SIZE}.`);
  if (floors.length !== 10 || floors[9]?.demoContentId == null) {
    throw new Error('10F spatial redesign expects the installed 10F demo content overlay.');
  }
  if (floors[9]?.demoProgressionTopologyId !== DEMO10_PROGRESSION_TOPOLOGY_ID) {
    throw new Error('10F spatial redesign requires the locked progression topology first.');
  }

  let applied = false;
  const redesigned = [];
  for (const floorNumber of Object.keys(ROOM_MAPS).map(Number)) {
    const floor = floorByNumber(floors, floorNumber);
    if (!floor) throw new Error(`10F spatial redesign could not find F${floorNumber}.`);
    if (floor.demoSpatialRedesignId === DEMO10_SPATIAL_REDESIGN_ID) {
      redesigned.push(floor);
      continue;
    }
    const map = ROOM_MAPS[floorNumber];
    assertMapContract(floorNumber, map);
    assertTopologyAnchors(floorNumber, map);
    floor.map = copyMap(map);
    floor.roomPlan = ROOM_PLANS[floorNumber];
    floor.demoSpatialRedesignId = DEMO10_SPATIAL_REDESIGN_ID;
    redesigned.push(floor);
    applied = true;
  }

  return Object.freeze({
    applied,
    id: DEMO10_SPATIAL_REDESIGN_ID,
    floors: Object.freeze(redesigned)
  });
}
