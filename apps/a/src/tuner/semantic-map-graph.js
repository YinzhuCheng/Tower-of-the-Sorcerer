const DIRECTIONS = Object.freeze([
  Object.freeze([1, 0]),
  Object.freeze([-1, 0]),
  Object.freeze([0, 1]),
  Object.freeze([0, -1])
]);

export function semanticNodeKey(x, y) {
  return `${x},${y}`;
}

function semanticEdgeKey(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function splitToken(token) {
  const separator = String(token).indexOf(':');
  if (separator < 0) return { type: token, id: null };
  return { type: token.slice(0, separator), id: token.slice(separator + 1) };
}

export function classifySemanticToken(token, { bossIds = [] } = {}) {
  if (token === '#') return Object.freeze({ kind: 'wall', id: null, progressionCritical: false, reward: false, hazard: false });
  if (token === '.') return Object.freeze({ kind: 'floor', id: null, progressionCritical: false, reward: false, hazard: false });
  if (token === 'S') return Object.freeze({ kind: 'start', id: null, progressionCritical: true, reward: false, hazard: false });
  if (token === 'D') return Object.freeze({ kind: 'stairs-down', id: null, progressionCritical: true, reward: false, hazard: false });
  if (token === 'U') return Object.freeze({ kind: 'stairs-up', id: null, progressionCritical: true, reward: false, hazard: false });
  if (token === 'shop') return Object.freeze({ kind: 'shop', id: null, progressionCritical: false, reward: true, hazard: false });

  const parsed = splitToken(token);
  if (parsed.type === 'enemy') {
    const boss = bossIds.includes(parsed.id);
    return Object.freeze({
      kind: boss ? 'boss' : 'enemy',
      id: parsed.id,
      progressionCritical: boss,
      reward: false,
      hazard: true
    });
  }
  if (parsed.type === 'item') return Object.freeze({ kind: 'item', id: parsed.id, progressionCritical: false, reward: true, hazard: false });
  if (parsed.type === 'door') return Object.freeze({ kind: 'door', id: parsed.id, progressionCritical: true, reward: false, hazard: true });
  if (parsed.type === 'gate') return Object.freeze({ kind: 'gate', id: parsed.id, progressionCritical: true, reward: false, hazard: true });
  if (parsed.type === 'switch') return Object.freeze({ kind: 'switch', id: parsed.id, progressionCritical: true, reward: false, hazard: false });
  if (parsed.type === 'rune') return Object.freeze({ kind: 'rune', id: parsed.id, progressionCritical: true, reward: false, hazard: false });
  return Object.freeze({ kind: 'event', id: parsed.id ?? parsed.type, progressionCritical: true, reward: false, hazard: false });
}

export function defaultSemanticBurden(node) {
  switch (node?.semantic?.kind) {
    case 'enemy': return 3;
    case 'boss': return 7;
    case 'door': return 2;
    case 'gate': return 3;
    case 'switch': return 0.35;
    case 'rune': return 0.35;
    default: return 0;
  }
}

export function defaultSemanticReward(node) {
  switch (node?.semantic?.kind) {
    case 'item': return 1;
    case 'shop': return 0.75;
    default: return 0;
  }
}

function computeCutStructure(nodeByKey) {
  let time = 0;
  const discovered = new Map();
  const low = new Map();
  const parent = new Map();
  const articulationKeys = new Set();
  const bridgeEdges = new Set();

  function visit(key) {
    time += 1;
    discovered.set(key, time);
    low.set(key, time);
    let children = 0;
    const node = nodeByKey.get(key);
    for (const neighborKey of node.neighbors) {
      if (!discovered.has(neighborKey)) {
        children += 1;
        parent.set(neighborKey, key);
        visit(neighborKey);
        low.set(key, Math.min(low.get(key), low.get(neighborKey)));
        if (!parent.has(key) && children > 1) articulationKeys.add(key);
        if (parent.has(key) && low.get(neighborKey) >= discovered.get(key)) articulationKeys.add(key);
        if (low.get(neighborKey) > discovered.get(key)) bridgeEdges.add(semanticEdgeKey(key, neighborKey));
      } else if (neighborKey !== parent.get(key)) {
        low.set(key, Math.min(low.get(key), discovered.get(neighborKey)));
      }
    }
  }

  for (const key of nodeByKey.keys()) {
    if (!discovered.has(key)) visit(key);
  }
  return { articulationKeys, bridgeEdges };
}

function computeComponents(nodeByKey) {
  const seen = new Set();
  const components = [];
  for (const startKey of nodeByKey.keys()) {
    if (seen.has(startKey)) continue;
    const queue = [startKey];
    const component = [];
    seen.add(startKey);
    for (let head = 0; head < queue.length; head += 1) {
      const key = queue[head];
      component.push(key);
      for (const neighborKey of nodeByKey.get(key).neighbors) {
        if (seen.has(neighborKey)) continue;
        seen.add(neighborKey);
        queue.push(neighborKey);
      }
    }
    components.push(Object.freeze(component));
  }
  return Object.freeze(components);
}

function computeCorridors(nodeByKey) {
  const anchors = new Set();
  for (const [key, node] of nodeByKey) {
    if (node.degree !== 2 || node.semantic.kind !== 'floor') anchors.add(key);
  }
  const usedEdges = new Set();
  const corridors = [];

  for (const anchorKey of anchors) {
    const anchor = nodeByKey.get(anchorKey);
    for (const firstKey of anchor.neighbors) {
      const firstEdge = semanticEdgeKey(anchorKey, firstKey);
      if (usedEdges.has(firstEdge)) continue;
      usedEdges.add(firstEdge);
      const path = [anchorKey, firstKey];
      let previousKey = anchorKey;
      let currentKey = firstKey;
      while (!anchors.has(currentKey)) {
        const current = nodeByKey.get(currentKey);
        const nextKey = current.neighbors.find((candidate) => candidate !== previousKey);
        if (!nextKey) break;
        usedEdges.add(semanticEdgeKey(currentKey, nextKey));
        path.push(nextKey);
        previousKey = currentKey;
        currentKey = nextKey;
      }
      corridors.push(Object.freeze({
        id: `corridor:${corridors.length}`,
        from: path[0],
        to: path[path.length - 1],
        keys: Object.freeze(path),
        length: Math.max(0, path.length - 1)
      }));
    }
  }
  return Object.freeze(corridors);
}

export function buildSemanticMapGraph(floor, { bossIds = [] } = {}) {
  const map = floor?.map;
  if (!Array.isArray(map) || map.length === 0 || !Array.isArray(map[0])) {
    throw new Error('Semantic map graph requires a rectangular floor map.');
  }
  const height = map.length;
  const width = map[0].length;
  if (map.some((row) => row.length !== width)) throw new Error('Semantic map graph requires rectangular rows.');

  const resolvedBossIds = [...new Set([floor?.boss, ...bossIds].filter(Boolean))];
  const nodes = [];
  const nodeByKey = new Map();
  const landmarks = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const token = map[y][x];
      if (token === '#') continue;
      const semantic = classifySemanticToken(token, { bossIds: resolvedBossIds });
      const node = {
        key: semanticNodeKey(x, y),
        x,
        y,
        token,
        semantic,
        neighbors: [],
        degree: 0
      };
      nodes.push(node);
      nodeByKey.set(node.key, node);
      if (semantic.kind !== 'floor') landmarks.push(node.key);
    }
  }

  let edges = 0;
  for (const node of nodes) {
    for (const [dx, dy] of DIRECTIONS) {
      const neighborKey = semanticNodeKey(node.x + dx, node.y + dy);
      if (nodeByKey.has(neighborKey)) node.neighbors.push(neighborKey);
    }
    node.neighbors.sort();
    node.degree = node.neighbors.length;
    if (nodeByKey.has(semanticNodeKey(node.x + 1, node.y))) edges += 1;
    if (nodeByKey.has(semanticNodeKey(node.x, node.y + 1))) edges += 1;
  }

  const starts = nodes.filter((node) => node.semantic.kind === 'start');
  const downs = nodes.filter((node) => node.semantic.kind === 'stairs-down');
  const ups = nodes.filter((node) => node.semantic.kind === 'stairs-up');
  const bosses = nodes.filter((node) => node.semantic.kind === 'boss');
  const entryKey = downs[0]?.key ?? starts[0]?.key ?? null;
  const goalKey = ups[0]?.key ?? bosses[0]?.key ?? null;
  const components = computeComponents(nodeByKey);
  const { articulationKeys, bridgeEdges } = computeCutStructure(nodeByKey);
  const corridors = computeCorridors(nodeByKey);

  return {
    floor: floor?.number ?? null,
    width,
    height,
    nodes: Object.freeze(nodes),
    nodeByKey,
    landmarks: Object.freeze(landmarks),
    entryKey,
    goalKey,
    edges,
    components,
    componentCount: components.length,
    cycleRank: edges - nodes.length + components.length,
    articulationKeys,
    bridgeEdges,
    corridors
  };
}

class MinHeap {
  constructor() { this.items = []; }
  push(item) {
    this.items.push(item);
    let index = this.items.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.items[parent].priority <= item.priority) break;
      this.items[index] = this.items[parent];
      index = parent;
    }
    this.items[index] = item;
  }
  pop() {
    if (this.items.length === 0) return null;
    const root = this.items[0];
    const tail = this.items.pop();
    if (this.items.length === 0) return root;
    let index = 0;
    while (true) {
      const left = index * 2 + 1;
      const right = left + 1;
      if (left >= this.items.length) break;
      let child = left;
      if (right < this.items.length && this.items[right].priority < this.items[left].priority) child = right;
      if (this.items[child].priority >= tail.priority) break;
      this.items[index] = this.items[child];
      index = child;
    }
    this.items[index] = tail;
    return root;
  }
}

function reconstructRoute(graph, previous, startKey, goalKey, nodeBurden, nodeReward, searchCost) {
  const keys = [];
  let cursor = goalKey;
  while (cursor != null) {
    keys.push(cursor);
    if (cursor === startKey) break;
    cursor = previous.get(cursor) ?? null;
  }
  if (keys[keys.length - 1] !== startKey) return null;
  keys.reverse();

  let semanticBurden = 0;
  let rewardValue = 0;
  const eventKinds = {};
  for (let index = 0; index < keys.length; index += 1) {
    const node = graph.nodeByKey.get(keys[index]);
    if (index > 0) semanticBurden += Math.max(0, Number(nodeBurden(node)) || 0);
    rewardValue += Math.max(0, Number(nodeReward(node)) || 0);
    if (node.semantic.kind !== 'floor') eventKinds[node.semantic.kind] = (eventKinds[node.semantic.kind] ?? 0) + 1;
  }

  return Object.freeze({
    startKey,
    goalKey,
    keys: Object.freeze(keys),
    steps: Math.max(0, keys.length - 1),
    semanticBurden,
    rewardValue,
    searchCost,
    eventKinds: Object.freeze(eventKinds)
  });
}

export function findSemanticRoute(graph, {
  startKey = graph?.entryKey,
  goalKey = graph?.goalKey,
  nodeBurden = defaultSemanticBurden,
  nodeReward = defaultSemanticReward,
  edgePenalty = new Map(),
  stepCost = 0.05
} = {}) {
  if (!graph?.nodeByKey || !startKey || !goalKey) return null;
  if (!graph.nodeByKey.has(startKey) || !graph.nodeByKey.has(goalKey)) return null;

  const distances = new Map([[startKey, 0]]);
  const previous = new Map();
  const heap = new MinHeap();
  heap.push({ key: startKey, priority: 0 });

  while (heap.items.length) {
    const current = heap.pop();
    if (current.priority !== distances.get(current.key)) continue;
    if (current.key === goalKey) break;
    const node = graph.nodeByKey.get(current.key);
    for (const neighborKey of node.neighbors) {
      const neighbor = graph.nodeByKey.get(neighborKey);
      const penalty = Number(edgePenalty.get(semanticEdgeKey(current.key, neighborKey))) || 0;
      const weight = Math.max(0, stepCost) + Math.max(0, Number(nodeBurden(neighbor)) || 0) + Math.max(0, penalty);
      const candidate = current.priority + weight;
      if (candidate + 1e-12 >= (distances.get(neighborKey) ?? Infinity)) continue;
      distances.set(neighborKey, candidate);
      previous.set(neighborKey, current.key);
      heap.push({ key: neighborKey, priority: candidate });
    }
  }

  if (!distances.has(goalKey)) return null;
  return reconstructRoute(graph, previous, startKey, goalKey, nodeBurden, nodeReward, distances.get(goalKey));
}

export function routeEdgeSet(route) {
  const edges = new Set();
  for (let index = 1; index < (route?.keys?.length ?? 0); index += 1) {
    edges.add(semanticEdgeKey(route.keys[index - 1], route.keys[index]));
  }
  return edges;
}

export function semanticRouteDistance(left, right) {
  const a = routeEdgeSet(left);
  const b = routeEdgeSet(right);
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const edge of a) if (b.has(edge)) intersection += 1;
  return 1 - intersection / Math.max(1, a.size + b.size - intersection);
}

export function paretoSemanticRoutes(routes) {
  const list = [...(routes ?? [])];
  return Object.freeze(list.filter((candidate, index) => !list.some((other, otherIndex) => {
    if (index === otherIndex) return false;
    const noWorse = other.semanticBurden <= candidate.semanticBurden
      && other.steps <= candidate.steps
      && other.rewardValue >= candidate.rewardValue;
    const strictlyBetter = other.semanticBurden < candidate.semanticBurden
      || other.steps < candidate.steps
      || other.rewardValue > candidate.rewardValue;
    return noWorse && strictlyBetter;
  })));
}

export function sampleSemanticRoutes(graph, {
  limit = 6,
  diversityPenalty = 2.5,
  nodeBurden = defaultSemanticBurden,
  nodeReward = defaultSemanticReward,
  stepCost = 0.05
} = {}) {
  if (!graph?.entryKey || !graph?.goalKey || limit <= 0) return Object.freeze([]);
  const routes = [];
  const signatures = new Set();
  const edgePenalty = new Map();
  const attempts = Math.max(limit * 4, limit);

  for (let attempt = 0; attempt < attempts && routes.length < limit; attempt += 1) {
    const route = findSemanticRoute(graph, { nodeBurden, nodeReward, stepCost, edgePenalty });
    if (!route) break;
    const signature = route.keys.join('>');
    if (!signatures.has(signature)) {
      signatures.add(signature);
      routes.push(route);
    }
    for (const edge of routeEdgeSet(route)) {
      edgePenalty.set(edge, (edgePenalty.get(edge) ?? 0) + Math.max(0, diversityPenalty));
    }
  }
  return Object.freeze(routes);
}

export function summarizeStrategicRouteDiversity(routes) {
  const sampled = [...(routes ?? [])];
  const pareto = [...paretoSemanticRoutes(sampled)];
  const comparisonSet = pareto.length >= 2 ? pareto : sampled;
  const distances = [];
  for (let i = 0; i < comparisonSet.length; i += 1) {
    for (let j = i + 1; j < comparisonSet.length; j += 1) {
      distances.push(semanticRouteDistance(comparisonSet[i], comparisonSet[j]));
    }
  }
  const sortedBurden = sampled.map((route) => route.semanticBurden).sort((a, b) => a - b);
  const bestBurden = sortedBurden[0] ?? null;
  const secondBestBurden = sortedBurden[1] ?? null;
  const dominantRouteAdvantage = Number.isFinite(bestBurden) && Number.isFinite(secondBestBurden)
    ? Math.max(0, secondBestBurden - bestBurden) / Math.max(1, secondBestBurden)
    : 0;
  return Object.freeze({
    sampledRoutes: sampled.length,
    paretoRoutes: pareto.length,
    meanPairDistance: distances.length ? distances.reduce((sum, value) => sum + value, 0) / distances.length : 0,
    minPairDistance: distances.length ? Math.min(...distances) : 0,
    bestBurden,
    secondBestBurden,
    dominantRouteAdvantage
  });
}

export function analyzeSemanticMap(floor, options = {}) {
  const graph = buildSemanticMapGraph(floor, options);
  const routes = sampleSemanticRoutes(graph, options);
  return {
    graph,
    routes,
    paretoRoutes: paretoSemanticRoutes(routes),
    diversity: summarizeStrategicRouteDiversity(routes)
  };
}
