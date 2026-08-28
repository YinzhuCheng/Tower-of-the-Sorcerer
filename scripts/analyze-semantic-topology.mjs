import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';
import { analyzeSemanticMap } from '../src/tuner/semantic-map-graph.js';
import {
  createSemanticTopologyMutationCatalog,
  describeSemanticTopologyCandidate
} from '../src/tuner/semantic-topology-mutations.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
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
  const analysis = analyzeSemanticMap(floor, { limit: 8, bossIds: floorBossIds[floor.number] ?? [] });
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

console.log('SEMANTIC_TOPOLOGY_AUDIT');
console.log(JSON.stringify({
  schemaVersion: 1,
  model: 'semantic-map-graph-v2',
  heuristicOnly: true,
  productionWriteAllowed: false,
  purpose: 'cheap topology candidate generation before authoritative solver/portfolio gates',
  floors: FLOORS.map(compactFloor),
  candidateCount: catalog.length,
  candidatesByFloor
}, null, 2));
