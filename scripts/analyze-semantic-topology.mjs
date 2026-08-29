import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { analyzeCardEconomy, validateDemoTenFloorCardHierarchy } from '../src/tuner/card-economy.js';
import { analyzeSemanticMap } from '../src/tuner/semantic-map-graph.js';
import {
  analyzeFloorSpatialGrammar,
  analyzeTowerPressureGrammar
} from '../src/tuner/spatial-design-grammar.js';
import {
  createSemanticTopologyMutationCatalog,
  describeSemanticTopologyCandidate
} from '../src/tuner/semantic-topology-mutations.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
const progressionGrammar = applyDemoTenFloorProgressionGrammar({
  enemies: ENEMIES,
  floors: FLOORS,
  dialogues: DIALOGUES
});
applyDemoTenFloorHardMode({ enemies: ENEMIES });

function bossIdsByFloor() {
  const result = {};
  for (const [enemyId, enemy] of Object.entries(ENEMIES)) {
    if (!enemy?.boss || !Number.isInteger(enemy.floor)) continue;
    (result[enemy.floor] ??= []).push(enemyId);
  }
  return result;
}

const floorBossIds = bossIdsByFloor();

function landmarkHistogram(analysis) {
  const counts = {};
  for (const key of analysis.graph.landmarks) {
    const node = analysis.graph.nodeByKey.get(key);
    counts[node.semantic.kind] = (counts[node.semantic.kind] ?? 0) + 1;
  }
  return counts;
}

function compactFloor(floor) {
  const bossIds = floorBossIds[floor.number] ?? [];
  const analysis = analyzeSemanticMap(floor, { limit: 8, bossIds });
  const spatial = analyzeFloorSpatialGrammar(floor, { bossIds, graph: analysis.graph });
  return {
    floor: floor.number,
    title: floor.title,
    nodes: analysis.graph.nodes.length,
    edges: analysis.graph.edges,
    components: analysis.graph.componentCount,
    cycleRank: analysis.graph.cycleRank,
    entryKey: analysis.graph.entryKey,
    goalKey: analysis.graph.goalKey,
    articulationPoints: analysis.graph.articulationKeys.size,
    graphBridges: analysis.graph.bridgeEdges.size,
    corridors: analysis.graph.corridors.length,
    landmarks: landmarkHistogram(analysis),
    spatial: {
      roomCoreCoverage: spatial.roomCoreCoverage,
      corridorCoverage: spatial.corridorCoverage,
      roomCount: spatial.roomCount,
      meaningfulRoomCount: spatial.meaningfulRoomCount,
      largestRoomCoreArea: spatial.largestRoomCoreArea,
      treasureVaultCount: spatial.treasureVaultCount,
      bossArenaCount: spatial.bossArenaCount,
      junctionRoomCount: spatial.junctionRoomCount,
      chamberScore: spatial.chamberScore,
      rooms: spatial.rooms.map((room) => ({
        id: room.id,
        type: room.type,
        coreArea: room.coreArea,
        bbox: room.bbox,
        entrances: room.entrances,
        gatedEntrances: room.gatedEntrances,
        rewardCount: room.rewardCount,
        rewardValue: room.rewardValue,
        hazardCount: room.hazardCount,
        bossCount: room.bossCount
      }))
    },
    routes: analysis.routes.map((route) => ({
      steps: route.steps,
      semanticBurden: route.semanticBurden,
      rewardValue: route.rewardValue,
      eventKinds: route.eventKinds
    })),
    diversity: analysis.diversity
  };
}

const floorNumbers = FLOORS.map((floor) => floor.number);
const catalog = createSemanticTopologyMutationCatalog(FLOORS, {
  floorNumbers,
  bossIdsByFloor: floorBossIds,
  maxPerFloor: 8,
  maxClosures: 12,
  maxOpenings: 12,
  routeSampleLimit: 8
});

const candidatesByFloor = Object.fromEntries(floorNumbers.map((floorNumber) => [
  floorNumber,
  catalog
    .filter((mutation) => mutation.floor === floorNumber)
    .map(describeSemanticTopologyCandidate)
]));
const pressure = analyzeTowerPressureGrammar(FLOORS, ENEMIES);
const cardEconomy = analyzeCardEconomy(FLOORS);
const cardHierarchy = validateDemoTenFloorCardHierarchy(FLOORS);

console.log('SEMANTIC_TOPOLOGY_AUDIT');
console.log(JSON.stringify({
  schemaVersion: 3,
  model: 'semantic-map-graph-v2-room-aware-card-hierarchy',
  heuristicOnly: true,
  productionWriteAllowed: false,
  purpose: 'cheap room/corridor, pressure-cluster and topology candidate analysis before authoritative solver/portfolio gates',
  designSignals: {
    progressionGrammar,
    pressure,
    cardEconomy: {
      supply: cardEconomy.supply,
      demand: cardEconomy.demand,
      net: cardEconomy.net
    },
    cardHierarchy: {
      valid: cardHierarchy.valid,
      preFinalSunDemand: cardHierarchy.preFinalSunDemand,
      finalSunDemand: cardHierarchy.finalSunDemand,
      finalSunGate: cardHierarchy.finalSunGate,
      violations: cardHierarchy.violations
    }
  },
  floors: FLOORS.map(compactFloor),
  candidateCount: catalog.length,
  candidatesByFloor
}, null, 2));
