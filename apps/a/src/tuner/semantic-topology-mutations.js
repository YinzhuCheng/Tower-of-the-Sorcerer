import {
  analyzeSemanticMap,
  semanticNodeKey
} from './semantic-map-graph.js';
import { analyzeFloorSpatialGrammar } from './spatial-design-grammar.js';

function isInterior(map, x, y) {
  return y > 0 && x > 0 && y < map.length - 1 && x < map[0].length - 1;
}

function manhattan(left, right) {
  return Math.abs(left.x - right.x) + Math.abs(left.y - right.y);
}

function minDistanceToNodes(node, nodes) {
  if (!nodes.length) return Infinity;
  let best = Infinity;
  for (const other of nodes) best = Math.min(best, manhattan(node, other));
  return best;
}

function cloneFloorWithSwap(floor, close, open) {
  const map = floor.map.map((row) => [...row]);
  map[close.y][close.x] = '#';
  map[open.y][open.x] = '.';
  return { ...floor, map };
}

function spatialRoomCoreSet(spatial) {
  return new Set(spatial.rooms.flatMap((room) => room.coreKeys));
}

function candidateClosures(floor, analysis, spatial, { maxClosures = 12 } = {}) {
  const { graph, routes } = analysis;
  const primaryRoute = routes[0];
  if (!primaryRoute) return [];
  const primaryKeys = new Set(primaryRoute.keys);
  const roomCoreKeys = spatialRoomCoreSet(spatial);
  const criticalNodes = graph.nodes.filter((node) => node.semantic.progressionCritical || node.semantic.kind === 'shop');
  const candidates = [];

  for (const node of graph.nodes) {
    if (node.token !== '.') continue;
    if (!isInterior(floor.map, node.x, node.y)) continue;
    if (node.degree < 2 || node.degree > 3) continue;
    if (graph.articulationKeys.has(node.key)) continue;
    // A topology hardening mutation may narrow a corridor, but should not eat
    // the core of an existing chamber. That is the failure mode that made the
    // old search produce increasingly corridor-like maps.
    if (roomCoreKeys.has(node.key)) continue;
    const criticalDistance = minDistanceToNodes(node, criticalNodes);
    if (criticalDistance <= 1) continue;
    const onPrimaryRoute = primaryKeys.has(node.key);
    const score = (onPrimaryRoute ? 100 : 0)
      + (node.degree === 2 ? 18 : 4)
      + Math.min(8, criticalDistance);
    candidates.push(Object.freeze({
      x: node.x,
      y: node.y,
      key: node.key,
      baselineToken: '.',
      onPrimaryRoute,
      degree: node.degree,
      criticalDistance,
      score
    }));
  }
  candidates.sort((a, b) => b.score - a.score || a.y - b.y || a.x - b.x);
  return candidates.slice(0, maxClosures);
}

function adjacentPassableNodes(graph, x, y) {
  const nodes = [];
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const node = graph.nodeByKey.get(semanticNodeKey(x + dx, y + dy));
    if (node) nodes.push(node);
  }
  return nodes;
}

function roomCreationPotential(graph, x, y) {
  let potential = 0;
  for (const [ox, oy] of [[-1, -1], [0, -1], [-1, 0], [0, 0]]) {
    const cells = [
      [x + ox, y + oy],
      [x + ox + 1, y + oy],
      [x + ox, y + oy + 1],
      [x + ox + 1, y + oy + 1]
    ];
    if (!cells.some(([cx, cy]) => cx === x && cy === y)) continue;
    const otherCells = cells.filter(([cx, cy]) => cx !== x || cy !== y);
    if (otherCells.every(([cx, cy]) => graph.nodeByKey.has(semanticNodeKey(cx, cy)))) potential += 1;
  }
  return potential;
}

function candidateOpenings(floor, analysis, { maxOpenings = 12 } = {}) {
  const { graph, routes } = analysis;
  const primaryRoute = routes[0];
  if (!primaryRoute) return [];
  const primaryKeys = new Set(primaryRoute.keys);
  const primaryNodes = primaryRoute.keys.map((key) => graph.nodeByKey.get(key)).filter(Boolean);
  const criticalNodes = graph.nodes.filter((node) => node.semantic.progressionCritical || node.semantic.kind === 'shop');
  const candidates = [];

  for (let y = 1; y < floor.map.length - 1; y += 1) {
    for (let x = 1; x < floor.map[y].length - 1; x += 1) {
      if (floor.map[y][x] !== '#') continue;
      const adjacent = adjacentPassableNodes(graph, x, y);
      if (adjacent.length < 2 || adjacent.length > 3) continue;
      const primaryAdjacent = adjacent.filter((node) => primaryKeys.has(node.key)).length;
      if (primaryAdjacent >= 2) continue;
      const probe = { x, y };
      const criticalDistance = minDistanceToNodes(probe, criticalNodes);
      if (criticalDistance <= 1) continue;
      const routeDistance = minDistanceToNodes(probe, primaryNodes);
      const rewardAdjacent = adjacent.filter((node) => node.semantic.reward).length;
      const chamberPotential = roomCreationPotential(graph, x, y);
      const score = adjacent.length * 10
        + Math.min(10, routeDistance)
        + rewardAdjacent * 5
        + chamberPotential * 24
        - primaryAdjacent * 4;
      candidates.push(Object.freeze({
        x,
        y,
        key: semanticNodeKey(x, y),
        baselineToken: '#',
        adjacentPassable: adjacent.length,
        primaryAdjacent,
        criticalDistance,
        routeDistance,
        rewardAdjacent,
        chamberPotential,
        score
      }));
    }
  }
  candidates.sort((a, b) => b.score - a.score || a.y - b.y || a.x - b.x);
  return candidates.slice(0, maxOpenings);
}

function summarizePreview(baseline, candidate, baselineSpatial, candidateSpatial) {
  const baselineRoute = baseline.routes[0];
  const candidateRoute = candidate.routes[0];
  const hardeningGain = candidateRoute.semanticBurden - baselineRoute.semanticBurden;
  const stepGain = candidateRoute.steps - baselineRoute.steps;
  const diversityGain = candidate.diversity.meanPairDistance - baseline.diversity.meanPairDistance;
  const paretoDelta = candidate.diversity.paretoRoutes - baseline.diversity.paretoRoutes;
  const chamberScoreGain = candidateSpatial.chamberScore - baselineSpatial.chamberScore;
  const roomCoreCoverageGain = candidateSpatial.roomCoreCoverage - baselineSpatial.roomCoreCoverage;
  const meaningfulRoomDelta = candidateSpatial.meaningfulRoomCount - baselineSpatial.meaningfulRoomCount;
  const treasureVaultDelta = candidateSpatial.treasureVaultCount - baselineSpatial.treasureVaultCount;
  return Object.freeze({
    baselineBurden: baselineRoute.semanticBurden,
    candidateBurden: candidateRoute.semanticBurden,
    hardeningGain,
    baselineSteps: baselineRoute.steps,
    candidateSteps: candidateRoute.steps,
    stepGain,
    baselineMeanRouteDistance: baseline.diversity.meanPairDistance,
    candidateMeanRouteDistance: candidate.diversity.meanPairDistance,
    diversityGain,
    baselineParetoRoutes: baseline.diversity.paretoRoutes,
    candidateParetoRoutes: candidate.diversity.paretoRoutes,
    paretoDelta,
    baselineChamberScore: baselineSpatial.chamberScore,
    candidateChamberScore: candidateSpatial.chamberScore,
    chamberScoreGain,
    baselineRoomCoreCoverage: baselineSpatial.roomCoreCoverage,
    candidateRoomCoreCoverage: candidateSpatial.roomCoreCoverage,
    roomCoreCoverageGain,
    meaningfulRoomDelta,
    treasureVaultDelta
  });
}

export function createSemanticTopologyMutationCatalog(floors, {
  floorNumbers = floors.map((floor) => floor.number),
  bossIdsByFloor = {},
  maxPerFloor = 16,
  maxClosures = 12,
  maxOpenings = 12,
  routeSampleLimit = 6,
  minHardeningGain = 0,
  maxStepIncrease = 12,
  maxDiversityLoss = 0.18,
  maxChamberScoreLoss = 0.03
} = {}) {
  const byNumber = new Map(floors.map((floor) => [floor.number, floor]));
  const catalog = [];

  for (const floorNumber of floorNumbers) {
    const floor = byNumber.get(floorNumber);
    if (!floor) continue;
    const bossIds = bossIdsByFloor[floorNumber] ?? bossIdsByFloor[String(floorNumber)] ?? [];
    const baseline = analyzeSemanticMap(floor, { limit: routeSampleLimit, bossIds });
    if (!baseline.graph.entryKey || !baseline.graph.goalKey || baseline.graph.componentCount !== 1 || !baseline.routes[0]) continue;
    const baselineSpatial = analyzeFloorSpatialGrammar(floor, { bossIds, graph: baseline.graph });
    const closures = candidateClosures(floor, baseline, baselineSpatial, { maxClosures });
    const openings = candidateOpenings(floor, baseline, { maxOpenings });
    const floorCandidates = [];

    for (const close of closures) {
      for (const open of openings) {
        const candidateFloor = cloneFloorWithSwap(floor, close, open);
        const candidate = analyzeSemanticMap(candidateFloor, { limit: routeSampleLimit, bossIds });
        if (candidate.graph.componentCount !== 1 || !candidate.routes[0]) continue;
        if (candidate.graph.nodes.length !== baseline.graph.nodes.length) continue;
        const candidateSpatial = analyzeFloorSpatialGrammar(candidateFloor, { bossIds, graph: candidate.graph });

        const preview = summarizePreview(baseline, candidate, baselineSpatial, candidateSpatial);
        if (preview.hardeningGain < minHardeningGain - 1e-12) continue;
        if (preview.stepGain > maxStepIncrease) continue;
        if (preview.diversityGain < -maxDiversityLoss) continue;
        if (preview.chamberScoreGain < -maxChamberScoreLoss) continue;
        if (preview.candidateParetoRoutes < Math.max(1, preview.baselineParetoRoutes - 1)) continue;
        if (preview.hardeningGain <= 1e-12
          && preview.stepGain <= 0
          && preview.diversityGain <= 0.05
          && preview.chamberScoreGain <= 0.01) continue;

        const priority = 5 * preview.hardeningGain
          + 0.25 * preview.stepGain
          + 2 * preview.diversityGain
          + 12 * preview.chamberScoreGain
          + 4 * preview.roomCoreCoverageGain
          + 0.5 * preview.meaningfulRoomDelta
          + 0.4 * preview.treasureVaultDelta
          + 0.01 * close.score
          + 0.01 * open.score;
        floorCandidates.push(Object.freeze({
          id: `f${floorNumber}-semantic-close-${close.x}-${close.y}-open-${open.x}-${open.y}`,
          kind: 'semantic-topology-wall-floor-swap',
          floor: floorNumber,
          close,
          open,
          preview,
          priority,
          editCount: 1,
          generator: 'semantic-map-graph-v2-room-aware'
        }));
      }
    }

    floorCandidates.sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
    catalog.push(...floorCandidates.slice(0, maxPerFloor));
  }
  return Object.freeze(catalog);
}

export function withSemanticTopologyMutation(floors, mutation, evaluate) {
  if (!mutation || mutation.kind !== 'semantic-topology-wall-floor-swap') {
    throw new Error('A semantic-topology-wall-floor-swap mutation is required.');
  }
  if (typeof evaluate !== 'function') throw new Error('Semantic topology evaluation callback is required.');
  const floor = floors.find((entry) => entry.number === mutation.floor);
  if (!floor) throw new Error(`Semantic topology mutation requires floor ${mutation.floor}.`);
  const closeToken = floor.map[mutation.close.y]?.[mutation.close.x];
  const openToken = floor.map[mutation.open.y]?.[mutation.open.x];
  if (closeToken !== '.' || openToken !== '#') {
    throw new Error(`Semantic topology slot drift for ${mutation.id}: ${closeToken}/${openToken}`);
  }
  try {
    floor.map[mutation.close.y][mutation.close.x] = '#';
    floor.map[mutation.open.y][mutation.open.x] = '.';
    return evaluate();
  } finally {
    floor.map[mutation.close.y][mutation.close.x] = closeToken;
    floor.map[mutation.open.y][mutation.open.x] = openToken;
  }
}

export function describeSemanticTopologyCandidate(mutation) {
  return Object.freeze({
    id: mutation.id,
    floor: mutation.floor,
    close: { x: mutation.close.x, y: mutation.close.y, onPrimaryRoute: mutation.close.onPrimaryRoute },
    open: {
      x: mutation.open.x,
      y: mutation.open.y,
      routeDistance: mutation.open.routeDistance,
      chamberPotential: mutation.open.chamberPotential
    },
    preview: mutation.preview,
    priority: mutation.priority,
    generator: mutation.generator
  });
}
