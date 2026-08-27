function passable(token) {
  return token !== '#';
}

function neighbors(x, y) {
  return [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
}

function key(x, y) {
  return `${x},${y}`;
}

function eventSignature(map) {
  const events = [];
  for (let y = 0; y < map.length; y += 1) {
    for (let x = 0; x < map[y].length; x += 1) {
      const token = map[y][x];
      if (token !== '#' && token !== '.') events.push(`${x},${y}:${token}`);
    }
  }
  return events.join('|');
}

function boundaryIntact(map) {
  const h = map.length;
  const w = map[0]?.length ?? 0;
  if (!h || !w) return false;
  for (let x = 0; x < w; x += 1) {
    if (map[0][x] !== '#' || map[h - 1][x] !== '#') return false;
  }
  for (let y = 0; y < h; y += 1) {
    if (map[y][0] !== '#' || map[y][w - 1] !== '#') return false;
  }
  return true;
}

function semanticSlotsIntact(floor) {
  for (const [slotId, slot] of Object.entries(floor.codesignSlots ?? {})) {
    if (floor.map[slot.y]?.[slot.x] !== slot.expected) {
      return { ok: false, slotId, expected: slot.expected, actual: floor.map[slot.y]?.[slot.x] };
    }
  }
  return { ok: true };
}

export function analyzeDemoFloorTopology(floor) {
  const map = floor?.map;
  if (!Array.isArray(map) || map.length === 0 || !Array.isArray(map[0])) {
    throw new Error('Topology analysis requires a floor map.');
  }
  const height = map.length;
  const width = map[0].length;
  if (map.some((row) => row.length !== width)) throw new Error('Topology map must be rectangular.');

  const nodes = [];
  const downs = [];
  const ups = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const token = map[y][x];
      if (passable(token)) nodes.push([x, y]);
      if (token === 'D') downs.push([x, y]);
      if (token === 'U') ups.push([x, y]);
    }
  }
  const nodeSet = new Set(nodes.map(([x, y]) => key(x, y)));
  let edgeCount = 0;
  let deadEnds = 0;
  let branchNodes = 0;
  for (const [x, y] of nodes) {
    let degree = 0;
    for (const [nx, ny] of neighbors(x, y)) {
      if (nodeSet.has(key(nx, ny))) degree += 1;
    }
    if (degree === 1) deadEnds += 1;
    if (degree >= 3) branchNodes += 1;
    if (nodeSet.has(key(x + 1, y))) edgeCount += 1;
    if (nodeSet.has(key(x, y + 1))) edgeCount += 1;
  }

  let componentCount = 0;
  const componentSeen = new Set();
  for (const start of nodes) {
    const startKey = key(start[0], start[1]);
    if (componentSeen.has(startKey)) continue;
    componentCount += 1;
    const stack = [start];
    componentSeen.add(startKey);
    while (stack.length) {
      const [x, y] = stack.pop();
      for (const [nx, ny] of neighbors(x, y)) {
        const nkey = key(nx, ny);
        if (nodeSet.has(nkey) && !componentSeen.has(nkey)) {
          componentSeen.add(nkey);
          stack.push([nx, ny]);
        }
      }
    }
  }

  let reachableFromDown = 0;
  let downToUpDistance = null;
  if (downs.length === 1) {
    const queue = [[downs[0][0], downs[0][1], 0]];
    let head = 0;
    const seen = new Set([key(downs[0][0], downs[0][1])]);
    while (head < queue.length) {
      const [x, y, distance] = queue[head++];
      if (ups.length === 1 && x === ups[0][0] && y === ups[0][1] && downToUpDistance == null) {
        downToUpDistance = distance;
      }
      for (const [nx, ny] of neighbors(x, y)) {
        const nkey = key(nx, ny);
        if (nodeSet.has(nkey) && !seen.has(nkey)) {
          seen.add(nkey);
          queue.push([nx, ny, distance + 1]);
        }
      }
    }
    reachableFromDown = seen.size;
  }

  return {
    floor: floor.number,
    width,
    height,
    boundaryIntact: boundaryIntact(map),
    downCount: downs.length,
    upCount: ups.length,
    passableNodes: nodes.length,
    edges: edgeCount,
    components: componentCount,
    cycleRank: edgeCount - nodes.length + componentCount,
    deadEnds,
    branchNodes,
    downToUpDistance,
    reachableFromDown,
    allPassableReachableFromDown: reachableFromDown === nodes.length,
    eventSignature: eventSignature(map),
    semanticSlots: semanticSlotsIntact(floor)
  };
}

export function createDemoTenFloorTopologyContract(floors, floorNumbers = [8, 9]) {
  const byNumber = new Map(floors.map((floor) => [floor.number, floor]));
  const profiles = {};
  for (const floorNumber of floorNumbers) {
    const floor = byNumber.get(floorNumber);
    if (!floor) throw new Error(`Topology contract requires floor ${floorNumber}.`);
    profiles[floorNumber] = analyzeDemoFloorTopology(floor);
  }
  return Object.freeze({
    schemaVersion: 1,
    model: 'demo-10f-topology-contract-v0.1',
    floorNumbers: Object.freeze([...floorNumbers]),
    profiles: Object.freeze(profiles),
    tolerances: Object.freeze({ cycleRank: 2, branchNodes: 3, extraDeadEnds: 2, downToUpDistance: 4 })
  });
}

export function validateDemoFloorTopology(floor, baseline, tolerances = {}) {
  const current = analyzeDemoFloorTopology(floor);
  const limits = {
    cycleRank: 2,
    branchNodes: 3,
    extraDeadEnds: 2,
    downToUpDistance: 4,
    ...tolerances
  };
  const violations = [];
  if (current.width !== baseline.width || current.height !== baseline.height) violations.push('dimensions');
  if (!current.boundaryIntact) violations.push('boundary');
  if (current.downCount !== 1 || current.upCount !== 1) violations.push('stairs');
  if (current.eventSignature !== baseline.eventSignature) violations.push('event-signature');
  if (!current.semanticSlots.ok) violations.push(`semantic-slot:${current.semanticSlots.slotId}`);
  if (current.passableNodes !== baseline.passableNodes) violations.push('passable-budget');
  if (current.components !== 1 || !current.allPassableReachableFromDown) violations.push('connectivity');
  if (Math.abs(current.cycleRank - baseline.cycleRank) > limits.cycleRank) violations.push('cycle-rank');
  if (Math.abs(current.branchNodes - baseline.branchNodes) > limits.branchNodes) violations.push('branch-nodes');
  if (current.deadEnds > baseline.deadEnds + limits.extraDeadEnds) violations.push('dead-ends');
  if (!Number.isFinite(current.downToUpDistance)
    || Math.abs(current.downToUpDistance - baseline.downToUpDistance) > limits.downToUpDistance) {
    violations.push('stairs-distance');
  }
  return {
    ok: violations.length === 0,
    violations,
    current,
    baseline: {
      floor: baseline.floor,
      passableNodes: baseline.passableNodes,
      edges: baseline.edges,
      cycleRank: baseline.cycleRank,
      deadEnds: baseline.deadEnds,
      branchNodes: baseline.branchNodes,
      downToUpDistance: baseline.downToUpDistance
    }
  };
}

export function validateDemoTenFloorTopology(floors, contract) {
  const byNumber = new Map(floors.map((floor) => [floor.number, floor]));
  const floorsReport = {};
  const violations = [];
  for (const floorNumber of contract.floorNumbers) {
    const report = validateDemoFloorTopology(
      byNumber.get(floorNumber),
      contract.profiles[floorNumber],
      contract.tolerances
    );
    floorsReport[floorNumber] = report;
    for (const violation of report.violations) violations.push(`f${floorNumber}:${violation}`);
  }
  return { ok: violations.length === 0, violations, floors: floorsReport };
}
