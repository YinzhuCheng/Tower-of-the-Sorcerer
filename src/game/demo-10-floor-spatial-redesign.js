import { DEMO10_PROGRESSION_TOPOLOGY_ID } from './demo-10-floor-progression-topology.js';

const GRID_SIZE = 11;

export const DEMO10_SPATIAL_REDESIGN_ID = 'demo-10f-spatial-redesign-v4-topology-locked';

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
    # item:sun . enemy:mote # # # item:atk enemy:catScout U #
    # item:hp . . # # # enemy:catMage item:moon . #
    # . . . # # # . # . #
    # item:hp # . enemy:catScout . item:def . # . #
    # enemy:mote . # enemy:mote shop . # . . #
    # . . # . . . . enemy:catScout . #
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
    # # # # . enemy:whaleSinger . U # # #
    # # # # . enemy:whaleSinger # # # # #
    # # # # # gate:tide # # # # #
    # item:atk enemy:shellGuard . . . . . enemy:shellGuard item:hp #
    # item:moon . enemy:tideLancer switch:tideB . switch:tideA enemy:tideLancer . item:moon #
    # item:compass . . # . # item:hpLarge . # #
    # . . enemy:whaleSinger . . . enemy:whaleSinger . . #
    # item:def . . # . # . . item:def #
    # . item:sun . enemy:whaleSinger D item:atk . item:hp . #
    # # # # # # # # # # #
  `),
  4: parseMap(`
    # # # # # # # # # # #
    # item:hp enemy:swordKnight # item:weapon # . enemy:bladePriestess . U #
    # . # # gate:forge # . # # . #
    # item:moon # enemy:swordApprentice . . switch:forge # item:star enemy:swordKnight #
    # . # . # # # # . # #
    # item:hp enemy:bladePriestess . # item:def . enemy:swordKnight . # #
    # # # . # . # # . # #
    # item:sun . . enemy:swordApprentice . # item:atk item:sun item:hpLarge #
    # . # # # # # . # . #
    # D . item:moon . enemy:swordApprentice item:def . item:hp . #
    # # # # # # # # # # #
  `),
  5: parseMap(`
    # # # # # # # # # # #
    # item:dual enemy:whaleBoss # item:shield # . enemy:swordBoss . U #
    # . # # gate:ember # . # # . #
    # switch:emberB # enemy:flameCaster . . switch:emberA # item:star enemy:dragonGuard #
    # . # . # # # # . # #
    # item:hpLarge enemy:dragonGuard . # item:def . enemy:dragonBoss . # #
    # # # . # . # # . # #
    # item:moon . . enemy:flameCaster . # item:atk item:moon item:hpLarge #
    # . # # # # # . # . #
    # D . item:moon . enemy:flameCaster item:def shop item:hp item:star #
    # # # # # # # # # # #
  `),
  6: parseMap(`
    # # # # # # # # # # #
    # item:dual enemy:mirrorDoll # item:holy # . enemy:starWitch enemy:starWitch U #
    # . # # gate:mirror # . # # . #
    # rune:C # enemy:cometArcher . item:def . # item:star enemy:starWitch #
    # . # . # # # # . # #
    # item:hpLarge enemy:starWitch . rune:B item:atk . enemy:mirrorDoll . # #
    # # # . # . # # . # #
    # item:moon . . enemy:cometArcher . # rune:A item:def . #
    # . # # # # # . # . #
    # D . item:star . enemy:mirrorDoll item:atk . item:hp . #
    # # # # # # # # # # #
  `),
  7: parseMap(`
    # # # # # # # # # # #
    # . enemy:astralBoss # item:ward # item:dual enemy:shadowWardBlade enemy:shadowBoss U #
    # . # # gate:tri # . # # . #
    # item:sun # enemy:shadowNinja . item:def . # item:star enemy:shadowWardCantor #
    # . # . # # # # . # #
    # item:hpLarge enemy:voidPriestess . # item:atk . enemy:duskDragon . # #
    # # # . # . # # . # #
    # item:moon . . enemy:shadowNinja . # item:star item:moon item:hpLarge #
    # . # # # # # . # . #
    # D . item:moon . enemy:duskDragon item:atk . item:hp . #
    # # # # # # # # # # #
  `)
});

const ROOM_PLANS = Object.freeze({
  1: Object.freeze(['入口补给室', '月影资源密室', '中央商店枢纽', '侧藏宝间', '上行门廊']),
  2: Object.freeze(['下行入口室', '猫卫长翼室', '藤蔓继电枢纽', '狐祝翼室', '双钥秘库']),
  3: Object.freeze(['港厅入口室', '西潮圣所', '东潮圣所', '中轴潮门前庭', '上行航道']),
  4: Object.freeze(['下行庭院', '左侧锻炉翼', '中央锻炉室', '右侧资源翼', '上行剑廊']),
  5: Object.freeze(['下行熔炉入口', '潮汐核心室', '锋刃核心室', '赤焰核心室', '封印上行台']),
  6: Object.freeze(['下行书库前厅', '镜序准备室', '星镜仪式室', '圣辉侧室', '上行藏书廊']),
  7: Object.freeze(['下行影廊', '天穹守卫室', '双相结界厅', '影仪双卫室', '王庭上行台'])
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
