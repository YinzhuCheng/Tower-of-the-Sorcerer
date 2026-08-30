import { ENEMIES, FLOORS, GAME_VERSION, ITEMS, SHOP_OPTIONS, getShopCost } from '../game/data.js';
import {
  DIRECTIONS,
  buyShopUpgrade,
  calculateBattle,
  cloneState as cloneEngineState,
  createInitialState as createEngineInitialState,
  getEffectiveEnemy,
  getFloorState,
  getShopOptions,
  getTile,
  parseToken,
  resolveWarCouncil,
  setMagicTier,
  teleportToFloor,
  tryMove
} from '../game/engine.js';
import { enumerateWarCouncilPlans } from '../game/war-council.js';
import {
  ROUTE_DOCTRINES,
  canSelectRouteDoctrine,
  routeDoctrineGateAccess,
  selectRouteDoctrine
} from '../game/route-doctrines.js';
import { getRouteDoctrineExitBlocker } from '../game/route-doctrine-effects.js';
import { automaticItemRank, isSafeAutomaticItem } from './normalization-policy.js';
import { hashValue, stableStringify } from './state.js';
import { createTowerStateCodec } from './tower-codec.js';
import { getMagicTierCapacity, getMagicTierCost } from '../game/magic-blade.js';
import {
  getCardGateRequirements,
  getGuardianGateRequirements,
  getMissingCards,
  getMissingGuardianIds
} from '../game/progression-rules.js';

const DIR_LIST = Object.entries(DIRECTIONS).map(([name, vector]) => ({ name, ...vector }));
const RESOURCE_FIELDS = ['hp', 'maxHp', 'atk', 'def', 'gold', 'mp', 'maxMp', 'sun', 'moon', 'star'];
const BASE_ENGINE_STATE = createEngineInitialState();
const CODEC = createTowerStateCodec({ baseState: BASE_ENGINE_STATE, floors: FLOORS, enemies: ENEMIES });
const RELIC_KEYS = Object.keys(BASE_ENGINE_STATE.relics).sort();

function transitToken(token, { completedRunes = [] } = {}) {
  if (token === '.' || token === 'S' || token === 'shop') return true;
  const parsed = parseToken(token);
  return parsed.type === 'rune' && completedRunes.includes(parsed.id);
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

function pathToAdjacent(state, targetX, targetY, options = {}) {
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
      if (!transitToken(getTile(state, x, y), options)) continue;
      previous.set(key, `${current.x},${current.y}`);
      previousDir.set(key, dir.name);
      queue.push({ x, y });
    }
  }
  return null;
}

function pathToExactTransit(state, targetX, targetY, options = {}) {
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
      if (!transitToken(getTile(state, x, y), options)) continue;
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
    if (!dir) return { ok: false, reason: `Unknown direction ${name}` };
    const result = tryMove(state, dir.dx, dir.dy);
    if (result.blocked || result.floorChanged) {
      return { ok: false, reason: result.reason ?? 'Transit path changed floor.' };
    }
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
    mp: state.magic?.mp ?? 0,
    maxMp: state.magic?.maxMp ?? 0,
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
    magic: { ...state.magic },
    council: state.council?.completed ? {
      completed: true,
      modifiers: { ...(state.council.outcome?.modifiers ?? {}) },
      survivors: (state.council.outcome?.survivors ?? []).map((unit) => unit.id).sort()
    } : { completed: false },
    alliance: { bonds: { ...(state.alliance?.bonds ?? {}) } },
    challenge: {
      selectedId: state.challenge?.selectedId ?? null,
      result: state.challenge?.result ? { ...state.challenge.result, missing: [...(state.challenge.result.missing ?? [])] } : null
    },
    doctrine: {
      selectedId: state.doctrine?.selectedId ?? null,
      legacyOpen: state.doctrine?.legacyOpen === true
    },
    relics: { ...state.relics },
    cores: state.cores,
    shopPurchases: state.shopPurchases,
    visitedFloors: [...state.visitedFloors].sort((a, b) => a - b),
    victory: state.victory
  };
}

function bitMask(keys, predicate) {
  let mask = 0;
  for (let index = 0; index < keys.length; index += 1) {
    if (predicate(keys[index])) mask += 2 ** index;
  }
  return mask;
}

function structuralKeyObject(state) {
  const compact = CODEC.isCompact(state) ? state : CODEC.compact(state);
  return {
    floor: compact.floor,
    component: compact.componentAnchor,
    events: CODEC.changedEventSignature(compact),
    // This sits on every frontier label. A positional tuple preserves all
    // world axes exactly while avoiding repeated JSON property names.
    floorMeta: compact.floorMeta.map((meta) => [
      meta.switches,
      meta.sequenceProgress,
      meta.bossDefeated ? 1 : 0,
      meta.defeatedBossMask ?? '0'
    ]),
    relicMask: bitMask(RELIC_KEYS, (key) => compact.relics[key]),
    magicUnlocked: Boolean(compact.magic?.unlocked),
    council: compact.council?.completed ? {
      modifiers: compact.council.outcome?.modifiers ?? {},
      survivors: (compact.council.outcome?.survivors ?? []).map((unit) => unit.id).sort()
    } : null,
    alliance: { ...(compact.alliance?.bonds ?? {}) },
    challenge: {
      selectedId: compact.challenge?.selectedId ?? null,
      result: compact.challenge?.result ?? null
    },
    doctrine: {
      selectedId: compact.doctrine?.selectedId ?? null,
      legacyOpen: compact.doctrine?.legacyOpen === true
    },
    shopPurchases: compact.shopPurchases,
    visitedMask: bitMask(FLOORS.map((_, index) => index), (index) => compact.visitedFloors.includes(index)),
    victory: compact.victory
  };
}

function structuralKey(state) {
  return stableStringify(structuralKeyObject(state));
}

function structuralHash(state) {
  return hashValue(structuralKeyObject(state));
}

function eventIdForTile(state, x, y, token) {
  return CODEC.eventIdAt(state.floor, x, y, token);
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
      remainingHp: result.battle.remainingHp,
      magicTier: result.battle.magicTier ?? 0,
      magicCost: result.battle.magicCost ?? 0
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
        : action.kind === 'council'
          ? { order: [...action.plan.order], allocations: { ...action.plan.allocations } }
          : action.kind === 'doctrine'
            ? { doctrineId: action.doctrineId }
        : { token: action.token, magicTier: action.magicTier ?? 0 },
    resourcesBefore: stateResources(stateBefore),
    resourcesAfter: stateResources(stateAfter),
    structuralBefore: structuralHash(stateBefore),
    structuralAfter: structuralHash(stateAfter),
    engine: result ? compactEngineResult(result) : null
  };
}

function sequenceGatePresent(state, sequence) {
  return getFloorState(state).map.some((row) => row.includes(`gate:${sequence.gate}`));
}

function completedRunesForState(state) {
  const sequence = FLOORS[state.floor]?.puzzles?.sequence;
  if (!sequence) return [];
  return sequence.order.slice(0, getFloorState(state).sequenceProgress);
}

function findTokenOnCurrentFloor(state, token) {
  const map = getFloorState(state).map;
  for (let y = 0; y < map.length; y += 1) {
    for (let x = 0; x < map[y].length; x += 1) {
      if (map[y][x] === token) return { x, y };
    }
  }
  return null;
}

function enumerateTileActionsEngine(state) {
  const actions = [];
  const map = getFloorState(state).map;
  const floorSequence = FLOORS[state.floor].puzzles?.sequence;
  for (let y = 0; y < map.length; y += 1) {
    for (let x = 0; x < map[y].length; x += 1) {
      const token = map[y][x];
      if (token === '#' || transitToken(token)) continue;
      if (token === 'council') continue;
      const parsed = parseToken(token);
      if (parsed.type === 'rune' && floorSequence) continue;
      if (token === 'U' && getRouteDoctrineExitBlocker(state)) continue;
      const path = pathToAdjacent(state, x, y, {
        completedRunes: completedRunesForState(state)
      });
      if (!path) continue;

      if (parsed.type === 'door' && state.cards[parsed.id] <= 0) continue;
      if (parsed.type === 'gate') {
        // Keep solver reachability exactly aligned with engine.js.  The old
        // branch only recognised the historical F7 three-card gate, which
        // silently removed every named Act II card/guardian gate from the
        // action graph.  New authored gates are still checked here before
        // expansion so a blocked action does not inflate the frontier.
        const floor = FLOORS[state.floor];
        if (!routeDoctrineGateAccess(state, parsed.id).ok) continue;
        const cardRequirements = getCardGateRequirements(floor, parsed.id);
        const guardianRequirements = getGuardianGateRequirements(floor, parsed.id);
        if (cardRequirements && getMissingCards(state.cards, cardRequirements).length > 0) continue;
        if (guardianRequirements && getMissingGuardianIds(getFloorState(state), floor, parsed.id).length > 0) continue;
        if (!cardRequirements && !guardianRequirements) continue;
      }
      if (parsed.type === 'enemy') {
        const enemy = getEffectiveEnemy(state, parsed.id);
        if (!enemy) continue;
        const tiers = enumerateUsefulMagicTiers(state, enemy);
        for (const magicTier of tiers) {
          const battle = calculateBattle(state.stats, enemy, state.relics, { ...state.magic, tier: magicTier });
          if (!battle.winnable) continue;
          actions.push({
            kind: 'tile',
            eventId: `${eventIdForTile(state, x, y, token)}:m${magicTier}`,
            x,
            y,
            token,
            parsed,
            path,
            magicTier
          });
        }
        continue;
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

function enumerateCouncilActionsEngine(state) {
  if (state.council?.completed) return [];
  const council = findTokenOnCurrentFloor(state, 'council');
  if (!council) return [];
  const path = pathToAdjacent(state, council.x, council.y, {
    completedRunes: completedRunesForState(state)
  });
  if (!path) return [];
  // The game UI exposes every legal allocation.  Solver expansion keeps the
  // best 24 deterministic winning plans, which preserves distinct final-boss
  // modifier outcomes without turning one F20 event into an unbounded branch.
  return enumerateWarCouncilPlans(state, { winningOnly: true, limit: 24 }).map((report, index) => ({
    kind: 'council',
    eventId: `${eventIdForTile(state, council.x, council.y, 'council')}:plan${index + 1}:${report.plan.order.join('-')}`,
    x: council.x,
    y: council.y,
    token: 'council',
    path,
    plan: report.plan
  }));
}

function enumerateDoctrineActionsEngine(state) {
  if (!canSelectRouteDoctrine(state)) return [];
  return ROUTE_DOCTRINES.map((doctrine) => ({
    kind: 'doctrine',
    eventId: `f11:doctrine:${doctrine.id}`,
    doctrineId: doctrine.id,
    token: 'doctrine'
  }));
}

/**
 * A selected tier is a free pre-battle action.  For one enemy, any higher
 * tier producing the same number of hero hits costs more MP with no benefit,
 * so only the least tier at every newly reduced round count is generated.
 * This keeps a max-MP increase from multiplying the search tree linearly.
 */
export function enumerateUsefulMagicTiers(state, enemy) {
  const magic = state?.magic;
  if (!magic?.unlocked) return [0];
  const maximumTier = Math.min(getMagicTierCapacity(magic), Math.floor((magic.mp ?? 0) / getMagicTierCost(1)));
  const tiers = [];
  const roundsSeen = new Set();
  for (let tier = 0; tier <= maximumTier; tier += 1) {
    const battle = calculateBattle(state.stats, enemy, state.relics, { ...magic, tier });
    if (battle.heroDamage <= 0 || !battle.magicAffordable) continue;
    if (roundsSeen.has(battle.rounds)) continue;
    roundsSeen.add(battle.rounds);
    tiers.push(tier);
  }
  return tiers;
}

function buildSequenceActionEngine(state) {
  const sequence = FLOORS[state.floor].puzzles?.sequence;
  if (!sequence || !sequenceGatePresent(state, sequence)) return null;
  const working = cloneEngineState(state);
  const startProgress = getFloorState(working).sequenceProgress;
  const segments = [];

  for (let index = startProgress; index < sequence.order.length; index += 1) {
    const runeId = sequence.order[index];
    const rune = findTokenOnCurrentFloor(working, `rune:${runeId}`);
    if (!rune) return null;
    const path = pathToAdjacent(working, rune.x, rune.y, {
      completedRunes: sequence.order.slice(0, index)
    });
    if (!path) return null;
    const transit = executePath(working, path);
    if (!transit.ok) return null;
    const result = tryMove(working, rune.x - working.x, rune.y - working.y);
    if (result.blocked) return null;
    segments.push({
      kind: 'tile',
      eventId: eventIdForTile(working, rune.x, rune.y, `rune:${runeId}`),
      x: rune.x,
      y: rune.y,
      token: `rune:${runeId}`,
      path
    });
  }

  if (getFloorState(working).sequenceProgress < sequence.order.length) return null;
  if (sequenceGatePresent(working, sequence)) return null;
  const floorNumber = FLOORS[state.floor].number;
  return {
    kind: 'sequence',
    eventId: `f${floorNumber}:sequence:${sequence.gate}:p${startProgress}`,
    segments
  };
}

function enumerateShopActionsEngine(state) {
  if (state.stats.gold < getShopCost(state)) return [];
  const map = getFloorState(state).map;
  for (let y = 0; y < map.length; y += 1) {
    for (let x = 0; x < map[y].length; x += 1) {
      if (map[y][x] !== 'shop') continue;
      const path = pathToExactTransit(state, x, y, {
        completedRunes: completedRunesForState(state)
      });
      if (!path) continue;
      return getShopOptions(state).map((option) => ({
        kind: 'shop',
        eventId: `f${FLOORS[state.floor].number}:shop:p${state.shopPurchases}:${option.id}`,
        x,
        y,
        path,
        optionId: option.id
      }));
    }
  }
  return [];
}

function enumerateTeleportActionsEngine(state) {
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

function applyTileActionEngine(state, action, automatic = false) {
  const before = cloneEngineState(state);
  const transit = executePath(state, action.path);
  if (!transit.ok) return { ok: false, reason: transit.reason, state };
  const dx = action.x - state.x;
  const dy = action.y - state.y;
  if (Math.abs(dx) + Math.abs(dy) !== 1) {
    return { ok: false, reason: 'Action target is no longer adjacent.', state };
  }
  // Tier zero is also emitted for pre-awakening battles so one action format
  // can replay the whole campaign.  A dormant state does not need (and must
  // not be asked) to select a magic tier.
  if (action.magicTier != null && (state.magic?.unlocked || action.magicTier > 0)) {
    const tierResult = setMagicTier(state, action.magicTier);
    if (!tierResult.ok) return { ok: false, reason: tierResult.reason, state };
  }
  const result = tryMove(state, dx, dy);
  if (result.blocked) return { ok: false, reason: result.reason, state };
  return {
    ok: true,
    state,
    steps: [makeStep({ stateBefore: before, stateAfter: state, action, result, automatic })]
  };
}

function applySequenceActionEngine(state, action) {
  const steps = [];
  for (const segment of action.segments) {
    const applied = applyTileActionEngine(state, segment, false);
    if (!applied.ok) return applied;
    steps.push(...applied.steps);
  }
  return { ok: true, state, steps };
}

function applyShopActionEngine(state, action) {
  const before = cloneEngineState(state);
  const transit = executePath(state, action.path);
  if (!transit.ok) return { ok: false, reason: transit.reason, state };
  if (state.x !== action.x || state.y !== action.y) {
    return { ok: false, reason: 'Shop path did not end on shop.', state };
  }
  const result = buyShopUpgrade(state, action.optionId);
  if (!result.ok) return { ok: false, reason: result.reason, state };
  return {
    ok: true,
    state,
    steps: [makeStep({ stateBefore: before, stateAfter: state, action, result: null })]
  };
}

function applyTeleportActionEngine(state, action) {
  const before = cloneEngineState(state);
  const result = teleportToFloor(state, action.targetFloor);
  if (!result.ok) return { ok: false, reason: result.reason, state };
  return {
    ok: true,
    state,
    steps: [makeStep({ stateBefore: before, stateAfter: state, action, result: null })]
  };
}

function applyDoctrineActionEngine(state, action) {
  const before = cloneEngineState(state);
  const result = selectRouteDoctrine(state, action.doctrineId);
  if (!result.ok) return { ok: false, reason: result.reason, state };
  return {
    ok: true,
    state,
    steps: [makeStep({ stateBefore: before, stateAfter: state, action, result: null })]
  };
}

function applyCouncilActionEngine(state, action) {
  const before = cloneEngineState(state);
  const transit = executePath(state, action.path);
  if (!transit.ok) return { ok: false, reason: transit.reason, state };
  const dx = action.x - state.x;
  const dy = action.y - state.y;
  if (Math.abs(dx) + Math.abs(dy) !== 1 || getTile(state, action.x, action.y) !== 'council') {
    return { ok: false, reason: 'Council location is no longer available.', state };
  }
  const result = resolveWarCouncil(state, action.plan);
  if (!result.ok) return { ok: false, reason: result.reason, state };
  return {
    ok: true,
    state,
    steps: [makeStep({ stateBefore: before, stateAfter: state, action, result })]
  };
}

function safeAutomaticActionsEngine(state) {
  const tileActions = enumerateTileActionsEngine(state);
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
  const engineState = CODEC.materialize(state);
  const steps = [];
  let guard = 0;
  while (guard++ < 512) {
    const actions = safeAutomaticActionsEngine(engineState);
    if (!actions.length) break;
    const applied = applyTileActionEngine(engineState, actions[0], true);
    if (!applied.ok) throw new Error(`Automatic closure failed: ${applied.reason}`);
    steps.push(...applied.steps);
  }
  if (guard >= 512) throw new Error('Automatic closure exceeded safety limit.');
  return { state: CODEC.compact(engineState), steps };
}

function actionPriority(action) {
  if (action.kind === 'council') return 900;
  if (action.kind === 'doctrine') return 850;
  if (action.kind === 'sequence') return 750;
  if (action.kind === 'shop') return 600;
  if (action.kind === 'teleport') return 50;
  if (action.parsed?.type === 'door' || action.parsed?.type === 'gate') return 500;
  if (action.parsed?.type === 'enemy') return 400;
  if (action.token === 'U') return 300;
  if (action.token === 'D') return 20;
  return 100;
}

function enumerateActions(state) {
  const engineState = CODEC.materialize(state);
  const sequenceAction = buildSequenceActionEngine(engineState);
  const actions = [
    ...enumerateTileActionsEngine(engineState),
    ...enumerateCouncilActionsEngine(engineState),
    ...enumerateDoctrineActionsEngine(engineState),
    ...(sequenceAction ? [sequenceAction] : []),
    ...enumerateShopActionsEngine(engineState),
    ...enumerateTeleportActionsEngine(engineState)
  ];
  return actions.sort((a, b) => actionPriority(b) - actionPriority(a) || a.eventId.localeCompare(b.eventId));
}

function applyAction(state, action) {
  const engineState = CODEC.materialize(state);
  let applied;
  if (action.kind === 'tile') applied = applyTileActionEngine(engineState, action, false);
  else if (action.kind === 'sequence') applied = applySequenceActionEngine(engineState, action);
  else if (action.kind === 'shop') applied = applyShopActionEngine(engineState, action);
  else if (action.kind === 'teleport') applied = applyTeleportActionEngine(engineState, action);
  else if (action.kind === 'doctrine') applied = applyDoctrineActionEngine(engineState, action);
  else if (action.kind === 'council') applied = applyCouncilActionEngine(engineState, action);
  else return { ok: false, reason: `Unknown macro action kind: ${action.kind}`, state };
  if (!applied.ok) return { ...applied, state };
  return { ok: true, state: CODEC.compact(applied.state), steps: applied.steps };
}

function encodedBossCount(floorMeta = []) {
  let count = 0;
  for (const meta of floorMeta) {
    let mask = 0n;
    for (const character of String(meta?.defeatedBossMask ?? '0').toLowerCase()) {
      const digit = '0123456789abcdefghijklmnopqrstuvwxyz'.indexOf(character);
      if (digit >= 0) mask = mask * 36n + BigInt(digit);
    }
    while (mask > 0n) {
      count += Number(mask & 1n);
      mask >>= 1n;
    }
  }
  return count;
}

function priority(state) {
  // Search ordering only; never used as a proof bound.
  return state.cores * 1e12
    + state.floor * 1e10
    // Guardian clusters are deliberately an authored commitment, not optional
    // loot. Without this tie-break, a best-first frontier repeatedly prefers
    // a pristine pre-Boss label over the legal "spent HP, opened progress"
    // label and can starve F14/F17 completions under a bounded scout. The
    // count comes from compact boss masks, so it cannot invent progress.
    + encodedBossCount(state.floorMeta) * 1e8
    + state.stats.atk * 1e6
    + state.stats.def * 1e4
    + Math.min(state.stats.hp, 9999)
    + (state.magic?.mp ?? 0) * 10
    + (state.magic?.maxMp ?? 0);
}

function actionClass(action) {
  if (action.kind !== 'tile') return action.kind;
  if (action.parsed?.type === 'enemy') return ENEMIES[action.parsed.id]?.boss ? 'boss' : 'enemy';
  return action.parsed?.type ?? action.token ?? 'tile';
}

export function createTowerAdapter() {
  return {
    objectiveType: 'terminal_hp',
    resourceFields: RESOURCE_FIELDS,
    stateEncoding: CODEC.stateEncoding,
    createInitialState: () => CODEC.compact(createEngineInitialState()),
    cloneState: CODEC.cloneCompact,
    compactState: CODEC.compact,
    materializeState: CODEC.materialize,
    resources: stateResources,
    structuralKey,
    summarizeState,
    normalize,
    enumerateActions,
    applyAction,
    actionClass,
    stageKey: (state) => `f${state.floor + 1}/c${state.cores}`,
    isGoal: (state) => state.victory === true,
    objectiveValue: (state) => state.stats.hp,
    priority,
    rulesVersion: () => `game-v${GAME_VERSION}`,
    contentHash: () => hashValue({
      floors: FLOORS,
      enemies: ENEMIES,
      items: ITEMS,
      shop: SHOP_OPTIONS,
      eventCatalog: CODEC.eventCatalogSummary(),
      shopCostProbe: Array.from({ length: 64 }, (_, shopPurchases) => getShopCost({ shopPurchases }))
    }),
    eventCatalog: () => CODEC.eventCatalogSummary()
  };
}
