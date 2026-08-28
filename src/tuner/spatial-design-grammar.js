import { buildSemanticMapGraph, semanticNodeKey } from './semantic-map-graph.js';

const CARD_VALUES = Object.freeze({ star: 0.75, moon: 1.75, sun: 4.5 });
const HIGH_VALUE_ITEMS = new Set(['weapon', 'shield', 'holy', 'lucky', 'ward', 'dual']);

function rewardTokenValue(token) {
  if (!String(token).startsWith('item:')) return token === 'shop' ? 1.5 : 0;
  const id = String(token).slice(5);
  if (id in CARD_VALUES) return CARD_VALUES[id];
  if (HIGH_VALUE_ITEMS.has(id)) return 3;
  if (id === 'hpLarge') return 1.5;
  if (['atk', 'def', 'hp'].includes(id)) return 1;
  return 1.25;
}

function connectedComponents(keys, graph) {
  const allowed = new Set(keys);
  const seen = new Set();
  const components = [];
  for (const start of allowed) {
    if (seen.has(start)) continue;
    const queue = [start];
    const component = [];
    seen.add(start);
    for (let head = 0; head < queue.length; head += 1) {
      const key = queue[head];
      component.push(key);
      for (const neighbor of graph.nodeByKey.get(key)?.neighbors ?? []) {
        if (!allowed.has(neighbor) || seen.has(neighbor)) continue;
        seen.add(neighbor);
        queue.push(neighbor);
      }
    }
    components.push(component);
  }
  return components;
}

function roomCoreKeys(graph) {
  const keys = new Set();
  for (let y = 0; y < graph.height - 1; y += 1) {
    for (let x = 0; x < graph.width - 1; x += 1) {
      const block = [
        semanticNodeKey(x, y),
        semanticNodeKey(x + 1, y),
        semanticNodeKey(x, y + 1),
        semanticNodeKey(x + 1, y + 1)
      ];
      if (block.every((key) => graph.nodeByKey.has(key))) block.forEach((key) => keys.add(key));
    }
  }
  return keys;
}

function roomType({ rewardValue, rewardCount, hazardCount, bossCount, entrances, coreArea }) {
  const rewardDensity = rewardCount / Math.max(1, coreArea);
  if (bossCount > 0 || hazardCount >= 3) return 'boss-arena';
  if (rewardValue >= 4 && rewardDensity >= 0.2 && entrances <= 3) return 'treasure-vault';
  if (entrances >= 3) return 'junction-room';
  return 'chamber';
}

function summarizeRoom(component, graph, index) {
  const coreSet = new Set(component);
  const entranceKeys = new Set();
  const landmarkKinds = {};
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let rewardCount = 0;
  let rewardValue = 0;
  let hazardCount = 0;
  let bossCount = 0;

  for (const key of component) {
    const node = graph.nodeByKey.get(key);
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x);
    maxY = Math.max(maxY, node.y);
    if (node.semantic.kind !== 'floor') {
      landmarkKinds[node.semantic.kind] = (landmarkKinds[node.semantic.kind] ?? 0) + 1;
    }
    const value = rewardTokenValue(node.token);
    if (value > 0) {
      rewardCount += 1;
      rewardValue += value;
    }
    if (node.semantic.hazard) hazardCount += 1;
    if (node.semantic.kind === 'boss') bossCount += 1;
    for (const neighbor of node.neighbors) if (!coreSet.has(neighbor)) entranceKeys.add(neighbor);
  }

  const entranceKinds = {};
  let gatedEntrances = 0;
  for (const key of entranceKeys) {
    const kind = graph.nodeByKey.get(key)?.semantic?.kind ?? 'floor';
    entranceKinds[kind] = (entranceKinds[kind] ?? 0) + 1;
    if (['door', 'gate', 'boss'].includes(kind)) gatedEntrances += 1;
  }

  const coreArea = component.length;
  const entrances = entranceKeys.size;
  return Object.freeze({
    id: `room:${index}`,
    coreKeys: Object.freeze([...component]),
    coreArea,
    bbox: Object.freeze({ x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 }),
    entrances,
    entranceKeys: Object.freeze([...entranceKeys]),
    entranceKinds: Object.freeze(entranceKinds),
    gatedEntrances,
    rewardCount,
    rewardValue,
    hazardCount,
    bossCount,
    landmarkKinds: Object.freeze(landmarkKinds),
    type: roomType({ rewardValue, rewardCount, hazardCount, bossCount, entrances, coreArea })
  });
}

export function analyzeFloorSpatialGrammar(floor, { bossIds = [], graph = null } = {}) {
  const resolvedGraph = graph ?? buildSemanticMapGraph(floor, { bossIds });
  const coreKeys = roomCoreKeys(resolvedGraph);
  const roomComponents = connectedComponents(coreKeys, resolvedGraph);
  const rooms = roomComponents.map((component, index) => summarizeRoom(component, resolvedGraph, index));
  const meaningfulRooms = rooms.filter((room) => room.coreArea >= 4);
  const passableTiles = resolvedGraph.nodes.length;
  const corridorLikeTiles = resolvedGraph.nodes.filter((node) => !coreKeys.has(node.key) && node.degree <= 2).length;
  const roomCoreTiles = coreKeys.size;
  const largestRoomCoreArea = rooms.reduce((best, room) => Math.max(best, room.coreArea), 0);
  const meanRoomCoreArea = rooms.length > 0
    ? rooms.reduce((sum, room) => sum + room.coreArea, 0) / rooms.length
    : 0;
  const treasureVaults = rooms.filter((room) => room.type === 'treasure-vault');
  const bossArenas = rooms.filter((room) => room.type === 'boss-arena');
  const junctionRooms = rooms.filter((room) => room.type === 'junction-room');
  const roomCoreCoverage = roomCoreTiles / Math.max(1, passableTiles);
  const corridorCoverage = corridorLikeTiles / Math.max(1, passableTiles);
  const chamberScore = 0.45 * Math.min(1, roomCoreCoverage / 0.35)
    + 0.2 * Math.min(1, meaningfulRooms.length / 3)
    + 0.2 * Math.min(1, largestRoomCoreArea / 12)
    + 0.1 * Math.min(1, (treasureVaults.length + bossArenas.length) / 2)
    + 0.05 * Math.min(1, junctionRooms.length / 2);

  return Object.freeze({
    floor: floor?.number ?? null,
    passableTiles,
    roomCoreTiles,
    roomCoreCoverage,
    corridorLikeTiles,
    corridorCoverage,
    roomCount: rooms.length,
    meaningfulRoomCount: meaningfulRooms.length,
    largestRoomCoreArea,
    meanRoomCoreArea,
    treasureVaultCount: treasureVaults.length,
    bossArenaCount: bossArenas.length,
    junctionRoomCount: junctionRooms.length,
    chamberScore,
    rooms: Object.freeze(rooms)
  });
}

function visibleBossIdsOnFloor(floor, enemies = {}) {
  const ids = [];
  for (const row of floor.map ?? []) {
    for (const token of row) {
      if (!String(token).startsWith('enemy:')) continue;
      const id = String(token).slice(6);
      if (enemies[id]?.boss) ids.push(id);
    }
  }
  return [...new Set(ids)];
}

export function analyzeTowerPressureGrammar(floors, enemies = {}) {
  const perFloor = floors.map((floor) => {
    const bossIds = visibleBossIdsOnFloor(floor, enemies);
    const exitGuardians = Array.isArray(floor.exitGuardians)
      ? [...new Set(floor.exitGuardians)]
      : floor.boss ? [floor.boss] : [];
    return Object.freeze({
      floor: floor.number,
      visibleBossIds: Object.freeze(bossIds),
      visibleBossCount: bossIds.length,
      exitGuardians: Object.freeze(exitGuardians),
      exitGuardianCount: exitGuardians.length
    });
  });
  const totalVisibleBosses = perFloor.reduce((sum, floor) => sum + floor.visibleBossCount, 0);
  const bossFloors = perFloor.filter((floor) => floor.visibleBossCount > 0);
  const bosslessFloors = perFloor.filter((floor) => floor.visibleBossCount === 0);
  const multiBossFloors = perFloor.filter((floor) => floor.visibleBossCount >= 2);
  const pressureConcentration = totalVisibleBosses > 0
    ? perFloor.reduce((sum, floor) => sum + (floor.visibleBossCount / totalVisibleBosses) ** 2, 0)
    : 0;
  return Object.freeze({
    totalVisibleBosses,
    bossFloorCount: bossFloors.length,
    bosslessFloorCount: bosslessFloors.length,
    multiBossFloorCount: multiBossFloors.length,
    maxBossesOnFloor: perFloor.reduce((best, floor) => Math.max(best, floor.visibleBossCount), 0),
    pressureConcentration,
    perFloor: Object.freeze(perFloor)
  });
}

export function analyzeTowerSpatialGrammar(floors, enemies = {}) {
  const perFloor = floors.map((floor) => {
    const bossIds = visibleBossIdsOnFloor(floor, enemies);
    return analyzeFloorSpatialGrammar(floor, { bossIds });
  });
  return Object.freeze({
    perFloor: Object.freeze(perFloor),
    meanChamberScore: perFloor.reduce((sum, floor) => sum + floor.chamberScore, 0) / Math.max(1, perFloor.length),
    meanRoomCoreCoverage: perFloor.reduce((sum, floor) => sum + floor.roomCoreCoverage, 0) / Math.max(1, perFloor.length),
    totalMeaningfulRooms: perFloor.reduce((sum, floor) => sum + floor.meaningfulRoomCount, 0),
    totalTreasureVaults: perFloor.reduce((sum, floor) => sum + floor.treasureVaultCount, 0),
    totalBossArenas: perFloor.reduce((sum, floor) => sum + floor.bossArenaCount, 0),
    pressure: analyzeTowerPressureGrammar(floors, enemies)
  });
}
