import { ENEMIES, FLOORS, GAME_VERSION, ITEMS, SHOP_OPTIONS, getShopCost } from '../game/data.js';
import {
  DIRECTIONS,
  buyShopUpgrade,
  calculateBattle,
  cloneState,
  createInitialState,
  getFloorState,
  getTile,
  parseToken,
  teleportToFloor,
  tryMove
} from '../game/engine.js';
import { automaticItemRank, isSafeAutomaticItem } from './normalization-policy.js';
import { hashValue, stableStringify } from './state.js';

const DIR_LIST = Object.entries(DIRECTIONS).map(([name, vector]) => ({ name, ...vector }));
const RESOURCE_FIELDS = ['hp', 'maxHp', 'atk', 'def', 'gold', 'sun', 'moon', 'star'];
function transitToken(token) {
  return token === '.' || token === 'S' || token === 'shop';
}

function dimensions(state) {
  const map = getFloorState(state).map;
  return { height: map.length, width: Math.max(...map.map((row) => row.length)) };
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

function pathToAdjacent(state, targetX, targetY) {
  const { width, height } = dimensions(state);
  const startKey = `${state.x},${state.y}`;
  const queue = [{ x: state.x, y: state.y }];
  let head = 0;
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
      if (x < 0 || y < 0 || x >= width || y >= height) continue;
      const key = `${x},${y}`;
      if (previous.has(key)) continue;
      if (!transitToken(getTile(state, x, y))) continue;
      previous.set(key, `${current.x},${current.y}`);
      previousDir.set(key, dir.name);
      queue.push({ x, y });
    }
  }
  return null;
}

function pathToExactTransit(state, targetX, targetY) {
  if (state.x === targetX && state.y === targetY) return [];
  const { width, height } = dimensions(state);
  const startKey = `${state.x},${state.y}`;
  const queue = [{ x: state.x, y: state.y }];
  let head = 0;
  const previous = new Map([[startKey, null]]);
  const previousDir = new Map();

  while (head < queue.length) {
    const current = queue[head++];
    for (const dir of DIR_LIST) {
      const x = current.x + dir.dx;
      const y = current.y + dir.dy;
      if (x < 0 || y < 0 || x >= width || y >= height) continue;
      const key = `${x},${y}`;
      if (previous.has(key)) continue;
      if (!transitToken(getTile(state, x, y))) continue;
      previous.set(key, `${current.x},${current.y}`);
      previousDir.set(key, dir.name);
      if (x === targetX && y === targetY) return reconstructPath(previous, previousDir, key);
      queue.push({ x, y });
    }
  }
  return null;
}

function zeroCostComponentSignature(state) {
  const { width, height } = dimensions(state);
  const queue = [{ x: state.x, y: state.y }];
  let head = 0;
  const seen = new Set([`${state.x},${state.y}`]);
  while (head < queue.length) {
    const current = queue[head++];
    for (const dir of DIR_LIST) {
      const x = current.x + dir.dx;
      const y = current.y + dir.dy;
      if (x < 0 || y < 0 || x >= width || y >= height) continue;
      const key = `${x},${y}`;
      if (seen.has(key) || !transitToken(getTile(state, x, y))) continue;
      seen.add(key);
      queue.push({ x, y });
    }
  }
  return [...seen].sort().join(';');
}

function executePath(state, path) {
  for (const name of path) {
    const dir = DIRECTIONS[name];
    if (!dir) return { ok: false, reason: `Unknown direction ${name}` };
    const result = tryMove(state, dir.dx, dir.dy);
    if (result.blocked || result.floorChanged) return { ok: false, reason: result.reason ?? 'Transit path changed floor.' };
  }
  return { ok: true };
}

function stateResources(state) {
  return {
    hp: state.stats.hp,
    maxHp: state.stats.maxHp,
    atk: state.stats.atk,
    def: state.stats.def,
    gold: state.stats.gold,
    sun: state.cards.sun,
    moon: state.cards.moon,
    star: state.cards.star
  };
}

function summarizeState(state) {
  return {
    floor: state.floor,
    position: [state.x, state.y],
    stats: { ...state.stats },
    cards: { ...state.cards },
    relics: { ...state.relics },
    cores: state.cores,
    shopPurchases: state.shopPurchases,
    visitedFloors: [...state.visitedFloors].sort((a, b) => a - b),
    victory: state.victory
  };
}

function structuralKeyObject(state) {
  return {
    floor: state.floor,
    component: zeroCostComponentSignature(state),
    floorStates: state.floorStates.map((floorState) => ({
      map: floorState.map,
      switches: [...floorState.switches].sort(),
      sequenceProgress: floorState.sequenceProgress,
      bossDefeated: floorState.bossDefeated
    })),
    relics: state.relics,
    cores: state.cores,
    shopPurchases: state.shopPurchases,
    visitedFloors: [...state.visitedFloors].sort((a, b) => a - b),
    victory: state.victory
  };
}

function structuralKey(state) {
  return stableStringify(structuralKeyObject(state));
}

function eventIdForTile(state, x, y, token) {
  const parsed = parseToken(token);
  const id = parsed.id ?? token;
  return `f${state.floor + 1}:${parsed.type}:${id}:${x},${y}`;
}

function compactEngineResult(result) {
  return {
    moved: Boolean(result.moved),
    floorChanged: Boolean(result.floorChanged),
    phaseChanged: Boolean(result.phaseChanged),
    bossDefeated: Boolean(result.bossDefeated),
    victory: Boolean(result.victory),
    events: result.events ?? [],
    battle: result.battle ? {
      enemyId: result.battle.enemyId,
      winnable: result.battle.winnable,
      heroDamage: result.battle.heroDamage,
      enemyDamage: result.battle.enemyDamage,
      rounds: result.battle.rounds,
      counterAttacks: result.battle.counterAttacks,
      totalDamage: result.battle.totalDamage,
      remainingHp: result.battle.remainingHp
    } : null
  };
}

function makeStep({ stateBefore, stateAfter, action, result = null, automatic = false }) {
  return {
    eventId: action.eventId,
    kind: action.kind,
    automatic,
    floorBefore: stateBefore.floor,
    location: action.x == null ? null : [action.x, action.y],
    path: action.path ?? [],
    action: action.kind === 'shop'
      ? { optionId: action.optionId }
      : action.kind === 'teleport'
        ? { targetFloor: action.targetFloor }
        : { token: action.token },
    resourcesBefore: stateResources(stateBefore),
    resourcesAfter: stateResources(stateAfter),
    structuralBefore: hashValue(structuralKeyObject(stateBefore)),
    structuralAfter: hashValue(structuralKeyObject(stateAfter)),
    engine: result ? compactEngineResult(result) : null
  };
}

function enumerateTileActions(state) {
  const actions = [];
  const map = getFloorState(state).map;
  for (let y = 0; y < map.length; y += 1) {
    for (let x = 0; x < map[y].length; x += 1) {
      const token = map[y][x];
      if (token === '#' || transitToken(token)) continue;
      const path = pathToAdjacent(state, x, y);
      if (!path) continue;
      const parsed = parseToken(token);

      if (parsed.type === 'door' && state.cards[parsed.id] <= 0) continue;
      if (parsed.type === 'gate') {
        const triGateId = FLOORS[state.floor].puzzles?.triGate;
        if (parsed.id !== triGateId) continue;
        if (state.cards.sun <= 0 || state.cards.moon <= 0 || state.cards.star <= 0) continue;
      }
      if (parsed.type === 'enemy') {
        const enemy = ENEMIES[parsed.id];
        if (!enemy || !calculateBattle(state.stats, enemy, state.relics).winnable) continue;
      }

      actions.push({
        kind: 'tile',
        eventId: eventIdForTile(state, x, y, token),
        x,
        y,
        token,
        parsed,
        path
      });
    }
  }
  return actions;
}

function enumerateShopActions(state) {
  if (state.stats.gold < getShopCost(state)) return [];
  const map = getFloorState(state).map;
  for (let y = 0; y < map.length; y += 1) {
    for (let x = 0; x < map[y].length; x += 1) {
      if (map[y][x] !== 'shop') continue;
      const path = pathToExactTransit(state, x, y);
      if (!path) continue;
      return SHOP_OPTIONS.map((option) => ({
        kind: 'shop',
        eventId: `f${state.floor + 1}:shop:${x},${y}:p${state.shopPurchases}:${option.id}`,
        x,
        y,
        path,
        optionId: option.id
      }));
    }
  }
  return [];
}

function enumerateTeleportActions(state) {
  if (!state.relics.compass) return [];
  return [...state.visitedFloors]
    .filter((floor) => floor !== state.floor)
    .sort((a, b) => a - b)
    .map((targetFloor) => ({
      kind: 'teleport',
      eventId: `teleport:f${targetFloor + 1}`,
      targetFloor
    }));
}

function applyTileAction(state, action, automatic = false) {
  const before = cloneState(state);
  const transit = executePath(state, action.path);
  if (!transit.ok) return { ok: false, reason: transit.reason, state };
  const dx = action.x - state.x;
  const dy = action.y - state.y;
  if (Math.abs(dx) + Math.abs(dy) !== 1) return { ok: false, reason: 'Action target is no longer adjacent.', state };
  const result = tryMove(state, dx, dy);
  if (result.blocked) return { ok: false, reason: result.reason, state };
  return { ok: true, state, steps: [makeStep({ stateBefore: before, stateAfter: state, action, result, automatic })] };
}

function applyShopAction(state, action) {
  const before = cloneState(state);
  const transit = executePath(state, action.path);
  if (!transit.ok) return { ok: false, reason: transit.reason, state };
  if (state.x !== action.x || state.y !== action.y) return { ok: false, reason: 'Shop path did not end on shop.', state };
  const result = buyShopUpgrade(state, action.optionId);
  if (!result.ok) return { ok: false, reason: result.reason, state };
  return { ok: true, state, steps: [makeStep({ stateBefore: before, stateAfter: state, action, result: null })] };
}

function applyTeleportAction(state, action) {
  const before = cloneState(state);
  const result = teleportToFloor(state, action.targetFloor);
  if (!result.ok) return { ok: false, reason: result.reason, state };
  return { ok: true, state, steps: [makeStep({ stateBefore: before, stateAfter: state, action, result: null })] };
}

function safeAutomaticActions(state) {
  const tileActions = enumerateTileActions(state);
  const switches = tileActions.filter((action) => action.parsed.type === 'switch');
  if (switches.length) return switches.sort((a, b) => a.eventId.localeCompare(b.eventId));

  const items = tileActions.filter((action) =>
    action.parsed.type === 'item' && isSafeAutomaticItem(action.parsed.id)
  );
  if (!items.length) return [];
  items.sort((a, b) => automaticItemRank(a.parsed.id) - automaticItemRank(b.parsed.id)
    || a.eventId.localeCompare(b.eventId));
  return items;
}

function normalize(state) {
  const steps = [];
  let guard = 0;
  while (guard++ < 512) {
    const actions = safeAutomaticActions(state);
    if (!actions.length) break;
    const applied = applyTileAction(state, actions[0], true);
    if (!applied.ok) throw new Error(`Automatic closure failed: ${applied.reason}`);
    steps.push(...applied.steps);
  }
  if (guard >= 512) throw new Error('Automatic closure exceeded safety limit.');
  return { state, steps };
}

function actionPriority(action) {
  if (action.kind === 'shop') return 600;
  if (action.kind === 'teleport') return 50;
  if (action.parsed?.type === 'rune') return 700;
  if (action.parsed?.type === 'door' || action.parsed?.type === 'gate') return 500;
  if (action.parsed?.type === 'enemy') return 400;
  if (action.token === 'U') return 300;
  if (action.token === 'D') return 20;
  return 100;
}

function enumerateActions(state) {
  const actions = [
    ...enumerateTileActions(state),
    ...enumerateShopActions(state),
    ...enumerateTeleportActions(state)
  ];
  return actions.sort((a, b) => actionPriority(b) - actionPriority(a) || a.eventId.localeCompare(b.eventId));
}

function applyAction(state, action) {
  if (action.kind === 'tile') return applyTileAction(state, action, false);
  if (action.kind === 'shop') return applyShopAction(state, action);
  if (action.kind === 'teleport') return applyTeleportAction(state, action);
  return { ok: false, reason: `Unknown macro action kind: ${action.kind}`, state };
}

function priority(state) {
  // Search ordering only; never used as a proof bound.
  return state.cores * 1e12
    + state.floor * 1e10
    + state.stats.atk * 1e6
    + state.stats.def * 1e4
    + Math.min(state.stats.hp, 9999);
}

export function createTowerAdapter() {
  return {
    objectiveType: 'terminal_hp',
    resourceFields: RESOURCE_FIELDS,
    createInitialState,
    cloneState,
    resources: stateResources,
    structuralKey,
    summarizeState,
    normalize,
    enumerateActions,
    applyAction,
    isGoal: (state) => state.victory === true,
    objectiveValue: (state) => state.stats.hp,
    priority,
    rulesVersion: () => `game-v${GAME_VERSION}`,
    contentHash: () => hashValue({
      floors: FLOORS,
      enemies: ENEMIES,
      items: ITEMS,
      shop: SHOP_OPTIONS,
      shopCostProbe: Array.from({ length: 64 }, (_, shopPurchases) => getShopCost({ shopPurchases }))
    })
  };
}
