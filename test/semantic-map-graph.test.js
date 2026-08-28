import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeSemanticMap,
  buildSemanticMapGraph,
  classifySemanticToken,
  findSemanticRoute,
  paretoSemanticRoutes,
  semanticRouteDistance
} from '../src/tuner/semantic-map-graph.js';

function parseMap(text) {
  return text.trim().split('\n').map((row) => row.trim().split(/\s+/));
}

test('semantic token classification separates progression, rewards and hazards', () => {
  assert.equal(classifySemanticToken('item:atk').reward, true);
  assert.equal(classifySemanticToken('enemy:guard').hazard, true);
  assert.equal(classifySemanticToken('door:sun').progressionCritical, true);
  assert.equal(classifySemanticToken('enemy:boss', { bossIds: ['boss'] }).kind, 'boss');
  assert.equal(classifySemanticToken('shop').kind, 'shop');
});

test('semantic graph extracts landmarks, cut structure and corridors', () => {
  const floor = {
    number: 1,
    boss: 'boss',
    map: parseMap(`
      # # # # # # #
      # S . . . U #
      # . # . # . #
      # item:atk . enemy:guard . . #
      # # # . # # #
      # . . enemy:boss . . #
      # # # # # # #
    `)
  };
  const graph = buildSemanticMapGraph(floor);
  assert.equal(graph.entryKey, '1,1');
  assert.equal(graph.goalKey, '5,1');
  assert.equal(graph.componentCount, 1);
  assert.ok(graph.landmarks.length >= 5);
  assert.ok(graph.corridors.length > 0);
  assert.ok(graph.articulationKeys.size > 0);
  assert.ok(graph.bridgeEdges.size > 0);
});

test('semantic route sampler exposes distinct alternatives and Pareto tradeoffs', () => {
  const floor = {
    number: 2,
    map: parseMap(`
      # # # # # # #
      # S . . . U #
      # . # . # . #
      # item:atk . enemy:guard . . #
      # . # . # . #
      # . . shop . . #
      # # # # # # #
    `)
  };
  const analysis = analyzeSemanticMap(floor, { limit: 6, diversityPenalty: 2 });
  assert.equal(analysis.graph.componentCount, 1);
  assert.ok(analysis.routes.length >= 2);
  assert.ok(semanticRouteDistance(analysis.routes[0], analysis.routes[1]) > 0);
  assert.ok(paretoSemanticRoutes(analysis.routes).length >= 1);
  assert.ok(analysis.diversity.meanPairDistance > 0);
});

test('custom route burden can reuse graph search without changing map semantics', () => {
  const floor = {
    number: 3,
    map: parseMap(`
      # # # # # # #
      # S enemy:a . . U #
      # . # # # . #
      # . . enemy:b . . #
      # # # # # # #
    `)
  };
  const graph = buildSemanticMapGraph(floor);
  const defaultRoute = findSemanticRoute(graph);
  const customRoute = findSemanticRoute(graph, {
    nodeBurden: (node) => node.token === 'enemy:a' ? 20 : node.token === 'enemy:b' ? 1 : 0
  });
  assert.ok(defaultRoute);
  assert.ok(customRoute);
  assert.notDeepEqual(customRoute.keys, defaultRoute.keys);
  assert.ok(customRoute.keys.includes('3,3'));
});
