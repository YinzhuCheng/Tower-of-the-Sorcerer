import assert from 'node:assert/strict';
import { ENEMIES, FLOORS, GRID_SIZE, SHOP_OPTIONS, getShopCost } from '../src/game/data.js';
import {
  DIRECTIONS,
  buyShopUpgrade,
  calculateBattle,
  createInitialState,
  getFloorState,
  getTile,
  parseToken,
  tryMove
} from '../src/game/engine.js';

const DIR_LIST = Object.entries(DIRECTIONS).map(([name, vector]) => ({ name, ...vector }));

function tileIsTransit(token, { allowRunes = false } = {}) {
  if (token === '.' || token === 'shop') return true;
  const parsed = parseToken(token);
  return allowRunes && parsed.type === 'rune';
}

function pathToAdjacent(state, targetX, targetY, options = {}) {
  const startKey = `${state.x},${state.y}`;
  const queue = [{ x: state.x, y: state.y }];
  const previous = new Map([[startKey, null]]);
  const previousDir = new Map();

  while (queue.length) {
    const current = queue.shift();
    if (Math.abs(current.x - targetX) + Math.abs(current.y - targetY) === 1) {
      const path = [];
      let key = `${current.x},${current.y}`;
      while (previous.get(key) !== null) {
        path.push(previousDir.get(key));
        key = previous.get(key);
      }
      return path.reverse();
    }
    for (const dir of DIR_LIST) {
      const x = current.x + dir.dx;
      const y = current.y + dir.dy;
      if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) continue;
      const key = `${x},${y}`;
      if (previous.has(key)) continue;
      const token = getTile(state, x, y);
      if (!tileIsTransit(token, options)) continue;
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
  const previous = new Map([[`${state.x},${state.y}`, null]]);
  const previousDir = new Map();
  while (queue.length) {
    const current = queue.shift();
    for (const dir of DIR_LIST) {
      const x = current.x + dir.dx;
      const y = current.y + dir.dy;
      if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) continue;
      const key = `${x},${y}`;
      if (previous.has(key)) continue;
      const token = getTile(state, x, y);
      if (!(x === targetX && y === targetY) && !tileIsTransit(token, options)) continue;
      if ((x === targetX && y === targetY) && !tileIsTransit(token, options)) continue;
      previous.set(key, `${current.x},${current.y}`);
      previousDir.set(key, dir.name);
      if (x === targetX && y === targetY) {
        const path = [];
        let cursor = key;
        while (previous.get(cursor) !== null) {
          path.push(previousDir.get(cursor));
          cursor = previous.get(cursor);
        }
        return path.reverse();
      }
      queue.push({ x, y });
    }
  }
  return null;
}

function executePath(state, path) {
  for (const name of path) {
    const dir = DIRECTIONS[name];
    const result = tryMove(state, dir.dx, dir.dy);
    assert.equal(result.blocked, false, `Unexpected block on transit path: ${result.reason}`);
    assert.equal(result.floorChanged, undefined, 'Transit path unexpectedly changed floor.');
  }
}

function getReachableActions(state) {
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
  executePath(state, action.path);
  const dx = action.x - state.x;
  const dy = action.y - state.y;
  assert.equal(Math.abs(dx) + Math.abs(dy), 1);
  return tryMove(state, dx, dy);
}

function shopReachable(state) {
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

function buyAvailableUpgrades(state) {
  const reachable = shopReachable(state);
  if (!reachable) return 0;
  executePath(state, reachable.path);
  let count = 0;
  const cycle = ['atk', 'def', 'hp'];
  while (state.stats.gold >= getShopCost(state) && count < 8) {
    const optionId = cycle[state.shopPurchases % cycle.length];
    const result = buyShopUpgrade(state, optionId);
    assert.equal(result.ok, true);
    count += 1;
  }
  return count;
}

function solveSequenceIfPossible(state) {
  const sequence = FLOORS[state.floor].puzzles?.sequence;
  if (!sequence) return false;
  const floorState = getFloorState(state);
  if (!floorState.map.some((row) => row.includes(`gate:${sequence.gate}`))) return false;

  const originalProgress = floorState.sequenceProgress;
  for (let index = originalProgress; index < sequence.order.length; index += 1) {
    const runeId = sequence.order[index];
    let rune = null;
    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        if (floorState.map[y][x] === `rune:${runeId}`) rune = { x, y };
      }
    }
    if (!rune) return false;
    const path = pathToAdjacent(state, rune.x, rune.y, { allowRunes: false });
    if (!path) return false;
    executePath(state, path);
    const result = tryMove(state, rune.x - state.x, rune.y - state.y);
    if (result.blocked) return false;
  }
  return floorState.sequenceProgress >= sequence.order.length;
}

function chooseAction(state, actions) {
  const items = actions.filter((a) => a.parsed.type === 'item');
  if (items.length) {
    const priority = ['atk', 'def', 'dual', 'weapon', 'shield', 'hpLarge', 'hp', 'codex', 'compass', 'lucky', 'ward', 'holy', 'sun', 'moon', 'star'];
    items.sort((a, b) => priority.indexOf(a.parsed.id) - priority.indexOf(b.parsed.id));
    return items[0];
  }

  const switches = actions.filter((a) => a.parsed.type === 'switch');
  if (switches.length) return switches[0];

  const triGate = actions.find((a) => a.token === 'gate:tri' && state.cards.sun > 0 && state.cards.moon > 0 && state.cards.star > 0);
  if (triGate) return triGate;

  const doors = actions.filter((a) => a.parsed.type === 'door' && state.cards[a.parsed.id] > 0);
  if (doors.length) {
    doors.sort((a, b) => state.cards[b.parsed.id] - state.cards[a.parsed.id]);
    return doors[0];
  }

  const enemies = actions
    .filter((a) => a.parsed.type === 'enemy')
    .map((a) => ({ ...a, battle: calculateBattle(state.stats, ENEMIES[a.parsed.id], state.relics) }))
    .filter((a) => a.battle.winnable)
    .sort((a, b) => {
      const bossA = ENEMIES[a.parsed.id].boss ? 1 : 0;
      const bossB = ENEMIES[b.parsed.id].boss ? 1 : 0;
      return bossA - bossB || a.battle.totalDamage - b.battle.totalDamage;
    });
  if (enemies.length) return enemies[0];

  const up = actions.find((a) => a.token === 'U');
  if (up) return up;
  return null;
}

function dumpState(state, actions) {
  return {
    floor: FLOORS[state.floor].number,
    position: [state.x, state.y],
    stats: state.stats,
    cards: state.cards,
    relics: state.relics,
    actions: actions.map((a) => a.token),
    map: getFloorState(state).map.map((row) => row.join(' '))
  };
}

const state = createInitialState();
const floorSummaries = [];
let iterations = 0;
let currentFloor = state.floor;
let startHp = state.stats.hp;
let startBattles = state.battles;

while (!state.victory && iterations < 5000) {
  iterations += 1;

  buyAvailableUpgrades(state);
  solveSequenceIfPossible(state);

  const actions = getReachableActions(state);
  const action = chooseAction(state, actions);
  if (!action) {
    const purchased = buyAvailableUpgrades(state);
    if (purchased > 0) continue;
    console.error('AUTOSOLVER STUCK');
    console.error(JSON.stringify(dumpState(state, actions), null, 2));
    process.exit(1);
  }

  const result = actOn(state, action);
  if (result.blocked) {
    console.error('Chosen action was blocked', action, result);
    process.exit(1);
  }

  if (state.floor !== currentFloor) {
    floorSummaries.push({
      floor: currentFloor + 1,
      hpSpent: startHp - state.stats.hp,
      battles: state.battles - startBattles,
      statsAfter: { ...state.stats },
      cardsAfter: { ...state.cards }
    });
    currentFloor = state.floor;
    startHp = state.stats.hp;
    startBattles = state.battles;
  }
}

assert.equal(state.victory, true, 'Final boss was not defeated.');
assert.ok(state.stats.hp > 0, 'Hero must finish with positive HP.');
assert.equal(state.cores, 7, 'All seven magic cores must be recovered.');

floorSummaries.push({
  floor: 8,
  hpRemaining: state.stats.hp,
  battles: state.battles - startBattles,
  statsAfter: { ...state.stats },
  cardsAfter: { ...state.cards }
});

console.log('Solvability validation passed.');
console.log(JSON.stringify({ iterations, turns: state.turns, battles: state.battles, cores: state.cores, final: state.stats, floorSummaries }, null, 2));
