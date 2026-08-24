import { ENEMIES, FLOORS, GRID_SIZE, getShopCost } from '../game/data.js';
import {
  DIRECTIONS,
  buyShopUpgrade,
  calculateBattle,
  createInitialState,
  getFloorState,
  getTile,
  parseToken,
  tryMove
} from '../game/engine.js';

const DIR_LIST = Object.entries(DIRECTIONS).map(([name, vector]) => ({ name, ...vector }));

function tileIsTransit(token, { allowRunes = false } = {}) {
  if (token === '.' || token === 'shop') return true;
  const parsed = parseToken(token);
  return allowRunes && parsed.type === 'rune';
}

function reconstructPath(previous, previousDir, endKey) {
  const path = [];
  let cursor = endKey;
  while (previous.get(cursor) !== null) {
    path.push(previousDir.get(cursor));
    cursor = previous.get(cursor);
  }
  return path.reverse();
}

function pathToAdjacent(state, targetX, targetY, options = {}) {
  const queue = [{ x: state.x, y: state.y }];
  let head = 0;
  const startKey = `${state.x},${state.y}`;
  const previous = new Map([[startKey, null]]);
  const previousDir = new Map();

  while (head < queue.length) {
    const current = queue[head++];
    if (Math.abs(current.x - targetX) + Math.abs(current.y - targetY) === 1) {
      return reconstructPath(previous, previousDir, `${current.x},${current.y}`);
    }
    for (const dir of DIR_LIST) {
      const x = current.x + dir.dx;
      const y = current.y + dir.dy;
      if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) continue;
      const key = `${x},${y}`;
      if (previous.has(key)) continue;
      if (!tileIsTransit(getTile(state, x, y), options)) continue;
      previous.set(key, `${current.x},${current.y}`);
      previousDir.set(key, dir.name);
      queue.push({ x, y });
    }
  }
  return null;
}

function pathToExactTransit(state, targetX, targetY, options = {}) {
  if (state.x === targetX && state.y === targetY) return [];
  const queue = [{ x: state.x, y: state.y }];
  let head = 0;
  const startKey = `${state.x},${state.y}`;
  const previous = new Map([[startKey, null]]);
  const previousDir = new Map();

  while (head < queue.length) {
    const current = queue[head++];
    for (const dir of DIR_LIST) {
      const x = current.x + dir.dx;
      const y = current.y + dir.dy;
      if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) continue;
      const key = `${x},${y}`;
      if (previous.has(key)) continue;
      if (!tileIsTransit(getTile(state, x, y), options)) continue;
      previous.set(key, `${current.x},${current.y}`);
      previousDir.set(key, dir.name);
      if (x === targetX && y === targetY) return reconstructPath(previous, previousDir, key);
      queue.push({ x, y });
    }
  }
  return null;
}

function executePath(state, path) {
  for (const name of path) {
    const dir = DIRECTIONS[name];
    const result = tryMove(state, dir.dx, dir.dy);
    if (result.blocked || result.floorChanged) {
      return { ok: false, reason: result.reason ?? 'Transit path unexpectedly changed floor.' };
    }
  }
  return { ok: true };
}

function reachableActions(state) {
  const actions = [];
  const floorState = getFloorState(state);
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const token = floorState.map[y][x];
      if (token === '#' || token === '.' || token === 'shop' || token === 'D') continue;
      const path = pathToAdjacent(state, x, y, { allowRunes: false });
      if (!path) continue;
      actions.push({ x, y, token, parsed: parseToken(token), path });
    }
  }
  return actions;
}

function actOn(state, action) {
  const transit = executePath(state, action.path);
  if (!transit.ok) return transit;
  const dx = action.x - state.x;
  const dy = action.y - state.y;
  if (Math.abs(dx) + Math.abs(dy) !== 1) return { ok: false, reason: 'Target is no longer adjacent.' };
  const result = tryMove(state, dx, dy);
  return result.blocked ? { ok: false, reason: result.reason } : { ok: true, result };
}

function reachableShop(state) {
  const map = getFloorState(state).map;
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      if (map[y][x] !== 'shop') continue;
      const path = pathToExactTransit(state, x, y);
      if (path) return { x, y, path };
    }
  }
  return null;
}

function buyAvailableUpgrades(state, shopCycle, purchaseCounts, purchaseLog) {
  const shop = reachableShop(state);
  if (!shop) return { ok: true, count: 0 };
  const transit = executePath(state, shop.path);
  if (!transit.ok) return transit;

  let count = 0;
  while (state.stats.gold >= getShopCost(state) && count < 128) {
    const optionId = shopCycle[state.shopPurchases % shopCycle.length];
    const before = { ...state.stats };
    const result = buyShopUpgrade(state, optionId);
    if (!result.ok) return { ok: false, reason: result.reason };
    purchaseCounts[optionId] = (purchaseCounts[optionId] ?? 0) + 1;
    purchaseLog.push({
      purchase: state.shopPurchases,
      floor: state.floor + 1,
      optionId,
      cost: result.cost,
      before,
      after: { ...state.stats }
    });
    count += 1;
  }
  return { ok: true, count };
}

function solveSequenceIfPossible(state) {
  const sequence = FLOORS[state.floor].puzzles?.sequence;
  if (!sequence) return { ok: true, changed: false };
  const floorState = getFloorState(state);
  if (!floorState.map.some((row) => row.includes(`gate:${sequence.gate}`))) {
    return { ok: true, changed: false };
  }

  const originalProgress = floorState.sequenceProgress;
  const deferred = () => ({
    ok: true,
    changed: floorState.sequenceProgress !== originalProgress,
    deferred: true
  });

  for (let index = originalProgress; index < sequence.order.length; index += 1) {
    const runeId = sequence.order[index];
    let rune = null;
    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        if (floorState.map[y][x] === `rune:${runeId}`) rune = { x, y };
      }
    }
    // Match validate-game.mjs: an unavailable next rune simply means the
    // deterministic runner should keep clearing other reachable progress and
    // retry the sequence on a later iteration. It is not a route failure.
    if (!rune) return deferred();
    const path = pathToAdjacent(state, rune.x, rune.y, { allowRunes: false });
    if (!path) return deferred();
    const transit = executePath(state, path);
    if (!transit.ok) return deferred();
    const result = tryMove(state, rune.x - state.x, rune.y - state.y);
    if (result.blocked) return deferred();
  }
  return { ok: true, changed: floorState.sequenceProgress !== originalProgress, deferred: false };
}

function chooseAction(state, actions) {
  const items = actions.filter((action) => action.parsed.type === 'item');
  if (items.length) {
    const priority = ['atk', 'def', 'dual', 'weapon', 'shield', 'hpLarge', 'hp', 'codex', 'compass', 'lucky', 'ward', 'holy', 'sun', 'moon', 'star'];
    items.sort((a, b) => priority.indexOf(a.parsed.id) - priority.indexOf(b.parsed.id));
    return items[0];
  }

  const switches = actions.filter((action) => action.parsed.type === 'switch');
  if (switches.length) return switches[0];

  const triGate = actions.find((action) =>
    action.token === 'gate:tri' && state.cards.sun > 0 && state.cards.moon > 0 && state.cards.star > 0
  );
  if (triGate) return triGate;

  const doors = actions.filter((action) =>
    action.parsed.type === 'door' && state.cards[action.parsed.id] > 0
  );
  if (doors.length) {
    doors.sort((a, b) => state.cards[b.parsed.id] - state.cards[a.parsed.id]);
    return doors[0];
  }

  const enemies = actions
    .filter((action) => action.parsed.type === 'enemy')
    .map((action) => ({
      ...action,
      battle: calculateBattle(state.stats, ENEMIES[action.parsed.id], state.relics)
    }))
    .filter((action) => action.battle.winnable)
    .sort((a, b) => {
      const bossA = ENEMIES[a.parsed.id].boss ? 1 : 0;
      const bossB = ENEMIES[b.parsed.id].boss ? 1 : 0;
      return bossA - bossB || a.battle.totalDamage - b.battle.totalDamage;
    });
  if (enemies.length) return enemies[0];

  return actions.find((action) => action.token === 'U') ?? null;
}

export function runGreedyShopStrategy({
  shopCycle = ['atk', 'def', 'hp'],
  maxIterations = 5_000
} = {}) {
  if (!Array.isArray(shopCycle) || shopCycle.length === 0) throw new Error('shopCycle must not be empty.');
  for (const optionId of shopCycle) {
    if (!['atk', 'def', 'hp'].includes(optionId)) throw new Error(`Unknown shop option in cycle: ${optionId}`);
  }

  const state = createInitialState();
  const purchaseCounts = { atk: 0, def: 0, hp: 0 };
  const purchaseLog = [];
  let iterations = 0;
  let failure = null;

  while (!state.victory && iterations < maxIterations) {
    iterations += 1;

    const bought = buyAvailableUpgrades(state, shopCycle, purchaseCounts, purchaseLog);
    if (!bought.ok) {
      failure = bought.reason;
      break;
    }

    const sequence = solveSequenceIfPossible(state);
    if (!sequence.ok) {
      failure = sequence.reason;
      break;
    }

    const actions = reachableActions(state);
    const action = chooseAction(state, actions);
    if (!action) {
      const retry = buyAvailableUpgrades(state, shopCycle, purchaseCounts, purchaseLog);
      if (!retry.ok) {
        failure = retry.reason;
        break;
      }
      if (retry.count > 0) continue;
      failure = `No reachable progress action on floor ${state.floor + 1}.`;
      break;
    }

    const applied = actOn(state, action);
    if (!applied.ok) {
      failure = applied.reason;
      break;
    }
  }

  if (!state.victory && !failure && iterations >= maxIterations) failure = 'Iteration limit reached.';

  return {
    solvable: state.victory,
    failure,
    shopCycle: [...shopCycle],
    iterations,
    purchases: state.shopPurchases,
    purchaseCounts,
    purchaseLog,
    cores: state.cores,
    floor: state.floor + 1,
    final: { ...state.stats },
    cards: { ...state.cards },
    relics: { ...state.relics },
    battles: state.battles,
    turns: state.turns
  };
}
