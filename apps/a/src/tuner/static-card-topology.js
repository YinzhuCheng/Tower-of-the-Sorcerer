import { CARD_TIERS, analyzeCardEconomy } from './card-economy.js';

const DIRECTIONS = Object.freeze([[1, 0], [-1, 0], [0, 1], [0, -1]]);

function emptyCards() {
  return { star: 0, moon: 0, sun: 0 };
}

function addCards(target, source) {
  for (const card of CARD_TIERS) target[card] += source?.[card] ?? 0;
  return target;
}

function subtractCards(target, source) {
  for (const card of CARD_TIERS) target[card] -= source?.[card] ?? 0;
  return target;
}

function freezeCards(cards) {
  return Object.freeze(Object.fromEntries(CARD_TIERS.map((card) => [card, cards[card] ?? 0])));
}

function isBarrier(token) {
  return /^(door|gate):/.test(String(token));
}

function isWalkable(floor, x, y, blocked) {
  const token = floor.map?.[y]?.[x];
  return token != null && token !== '#' && !blocked.has(token);
}

function findEntry(floor) {
  for (let y = 0; y < floor.map.length; y += 1) {
    for (let x = 0; x < floor.map[y].length; x += 1) {
      if (floor.map[y][x] === 'S' || floor.map[y][x] === 'D') return { x, y };
    }
  }
  throw new Error(`F${floor.number} needs an S or D entry for card topology analysis.`);
}

function labelClosedComponents(floor) {
  const blocked = new Set();
  for (const row of floor.map) {
    for (const token of row) if (isBarrier(token)) blocked.add(token);
  }

  const labels = new Map();
  let nextLabel = 0;
  for (let y = 0; y < floor.map.length; y += 1) {
    for (let x = 0; x < floor.map[y].length; x += 1) {
      const key = `${x},${y}`;
      if (!isWalkable(floor, x, y, blocked) || labels.has(key)) continue;
      const queue = [{ x, y }];
      labels.set(key, nextLabel);
      for (let index = 0; index < queue.length; index += 1) {
        const cell = queue[index];
        for (const [dx, dy] of DIRECTIONS) {
          const next = { x: cell.x + dx, y: cell.y + dy };
          const nextKey = `${next.x},${next.y}`;
          if (!isWalkable(floor, next.x, next.y, blocked) || labels.has(nextKey)) continue;
          labels.set(nextKey, nextLabel);
          queue.push(next);
        }
      }
      nextLabel += 1;
    }
  }
  return Object.freeze({ labels, componentCount: nextLabel });
}

function cardCost(floor, token) {
  const [kind, id] = String(token).split(':');
  const cost = emptyCards();
  if (kind === 'door' && CARD_TIERS.includes(id)) cost[id] = 1;
  if (kind === 'gate') {
    addCards(cost, floor.puzzles?.cardGates?.[id]);
    if (floor.puzzles?.triGate === id && !floor.puzzles?.cardGates?.[id]) {
      for (const card of CARD_TIERS) cost[card] = 1;
    }
  }
  return freezeCards(cost);
}

function hasCardCost(cost) {
  return CARD_TIERS.some((card) => cost[card] > 0);
}

function barrierGroups(floor) {
  const groups = new Map();
  for (let y = 0; y < floor.map.length; y += 1) {
    for (let x = 0; x < floor.map[y].length; x += 1) {
      const token = floor.map[y][x];
      if (!isBarrier(token)) continue;
      const group = groups.get(token) ?? { token, cells: [] };
      group.cells.push(Object.freeze({ x, y }));
      groups.set(token, group);
    }
  }
  return [...groups.values()]
    .map((group) => Object.freeze({ ...group, cost: cardCost(floor, group.token) }))
    .filter((group) => hasCardCost(group.cost));
}

function isUtilityToken(token) {
  const value = String(token);
  if (value === '.' || value === '#' || value === 'S' || value === 'D') return false;
  if (value.startsWith('item:') && CARD_TIERS.includes(value.slice(5))) return false;
  return !isBarrier(value);
}

function analyzeFloorCardBarriers(floor) {
  const closed = labelClosedComponents(floor);
  const entry = findEntry(floor);
  const entryComponent = closed.labels.get(`${entry.x},${entry.y}`);
  const barriers = barrierGroups(floor).map((group) => {
    const neighboringComponents = new Set();
    for (const cell of group.cells) {
      for (const [dx, dy] of DIRECTIONS) {
        const label = closed.labels.get(`${cell.x + dx},${cell.y + dy}`);
        if (label != null) neighboringComponents.add(label);
      }
    }
    const protectedComponents = [...neighboringComponents]
      .filter((component) => component !== entryComponent)
      .sort((a, b) => a - b);
    const utilityAnchors = [];
    for (let y = 0; y < floor.map.length; y += 1) {
      for (let x = 0; x < floor.map[y].length; x += 1) {
        if (!protectedComponents.includes(closed.labels.get(`${x},${y}`))) continue;
        const token = floor.map[y][x];
        if (!isUtilityToken(token)) continue;
        utilityAnchors.push(Object.freeze({ x, y, token }));
      }
    }
    return Object.freeze({
      id: `F${floor.number}:${group.token}`,
      floor: floor.number,
      token: group.token,
      cells: Object.freeze(group.cells),
      cost: group.cost,
      entryComponent,
      neighboringComponents: Object.freeze([...neighboringComponents].sort((a, b) => a - b)),
      protectedComponents: Object.freeze(protectedComponents),
      utilityAnchors: Object.freeze(utilityAnchors)
    });
  });
  return Object.freeze({
    floor: floor.number,
    entry,
    componentCount: closed.componentCount,
    barriers: Object.freeze(barriers)
  });
}

function buildCampaignLedger(floors) {
  const economy = analyzeCardEconomy(floors);
  const carry = emptyCards();
  const states = [];
  for (const floor of economy.perFloor) {
    const arrival = freezeCards(carry);
    addCards(carry, floor.supply);
    const beforeSpend = freezeCards(carry);
    subtractCards(carry, floor.demand);
    states.push(Object.freeze({
      floor: floor.floor,
      arrival,
      collected: floor.supply,
      spent: floor.demand,
      beforeSpend,
      departure: freezeCards(carry),
      viable: CARD_TIERS.every((card) => carry[card] >= 0)
    }));
  }
  return Object.freeze({ economy, states: Object.freeze(states), final: freezeCards(carry) });
}

/**
 * A deliberately non-combat, non-solver audit of card topology.  It models
 * only the campaign card ledger and the closed-map components around every
 * card barrier.  That makes it safe to use while room topology is being
 * frozen, before combat numbers or mutation search are allowed to influence
 * the design.
 */
export function buildStaticCardTopologyGraph(floors) {
  if (!Array.isArray(floors) || floors.length === 0) {
    throw new Error('Static card topology graph requires floors.');
  }
  const floorReports = floors
    .slice()
    .sort((a, b) => a.number - b.number)
    .map(analyzeFloorCardBarriers);
  const barriers = floorReports.flatMap((floor) => floor.barriers);
  const ledger = buildCampaignLedger(floors);
  const violations = [];
  for (const barrier of barriers) {
    if (barrier.neighboringComponents.length < 2) violations.push(`${barrier.id}:not-a-cut`);
    if (barrier.protectedComponents.length === 0) violations.push(`${barrier.id}:no-protected-side`);
    if (barrier.utilityAnchors.length === 0) violations.push(`${barrier.id}:empty-protected-side`);
  }
  for (const state of ledger.states) {
    if (!state.viable) violations.push(`F${state.floor}:card-ledger-negative`);
  }
  return Object.freeze({
    valid: violations.length === 0,
    floorReports: Object.freeze(floorReports),
    barriers: Object.freeze(barriers),
    ledger,
    violations: Object.freeze(violations)
  });
}
