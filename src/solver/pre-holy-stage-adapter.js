import { ENEMIES } from '../game/data.js';
import { calculateBattle } from '../game/engine.js';
import { createBoundedTowerAdapter } from './tower-bounds.js';

function actionIsHoly(action) {
  return action?.kind === 'tile'
    && action?.parsed?.type === 'item'
    && action?.parsed?.id === 'holy';
}

function actionIsEnemy(action, enemyId) {
  return action?.kind === 'tile'
    && action?.parsed?.type === 'enemy'
    && action?.parsed?.id === enemyId;
}

function parseTokenLocal(token) {
  const separator = token.indexOf(':');
  if (separator < 0) return { type: token, id: null };
  return { type: token.slice(0, separator), id: token.slice(separator + 1) };
}

function relaxedTraversalDamage(engineState, token, bossId) {
  if (token === '#') return Number.POSITIVE_INFINITY;
  if (token === '.' || token === 'S' || token === 'shop' || token === 'U' || token === 'D') return 0;
  const parsed = parseTokenLocal(token);
  if (parsed.type === 'item') return parsed.id === 'holy' ? Number.POSITIVE_INFINITY : 0;
  if (parsed.type === 'rune' || parsed.type === 'door' || parsed.type === 'gate' || parsed.type === 'switch') return 0;
  if (parsed.type !== 'enemy') return 0;
  const enemy = ENEMIES[parsed.id];
  if (!enemy) return Number.POSITIVE_INFINITY;
  const battle = calculateBattle(engineState.stats, enemy, engineState.relics ?? {});
  if (!battle.winnable || !Number.isFinite(battle.totalDamage)) return Number.POSITIVE_INFINITY;
  // The boss damage is included when its tile is entered. The caller can then
  // compare total relaxed route damage directly with current HP.
  return battle.totalDamage;
}

/**
 * Optimistic minimum fixed damage from the current location through the current
 * dynamic floor to the requested boss, including the boss battle itself.
 *
 * Doors/gates/switches/runes are relaxed to zero cost, so this is NOT a legal
 * route proof. Regular free items are also zero-cost; normalization normally
 * collects immediately reachable monotone items before priority is evaluated.
 * Holy remains impassable because this stage explicitly forbids acquiring it.
 * Enemy costs use the authoritative deterministic `calculateBattle()` formula.
 *
 * The output is scheduling information only. Infinity means that even this
 * relaxed damage graph cannot currently break through some enemy/boss defense.
 */
export function relaxedBossDamageNeed(engineState, {
  bossId = 'astralBoss'
} = {}) {
  const floorState = engineState?.floorStates?.[engineState.floor];
  const map = floorState?.map;
  if (!Array.isArray(map) || map.length === 0) return Number.POSITIVE_INFINITY;
  let boss = null;
  for (let y = 0; y < map.length; y += 1) {
    for (let x = 0; x < (map[y]?.length ?? 0); x += 1) {
      if (map[y][x] === `enemy:${bossId}`) boss = { x, y };
    }
  }
  if (!boss) return 0;

  const height = map.length;
  const width = Math.max(...map.map((row) => row.length));
  const dist = Array.from({ length: height }, () => Array(width).fill(Number.POSITIVE_INFINITY));
  const pending = [{ x: engineState.x, y: engineState.y, damage: 0 }];
  dist[engineState.y][engineState.x] = 0;

  // 11x11 floor: dependency-free Dijkstra via sorted small array is simpler and
  // fast enough for a queue heuristic. We intentionally optimize clarity here.
  while (pending.length > 0) {
    pending.sort((a, b) => b.damage - a.damage);
    const current = pending.pop();
    if (current.damage !== dist[current.y][current.x]) continue;
    if (current.x === boss.x && current.y === boss.y) return current.damage;
    const neighbors = [
      [current.x, current.y - 1],
      [current.x, current.y + 1],
      [current.x - 1, current.y],
      [current.x + 1, current.y]
    ];
    for (const [x, y] of neighbors) {
      if (x < 0 || y < 0 || y >= height || x >= (map[y]?.length ?? 0)) continue;
      const edgeDamage = relaxedTraversalDamage(engineState, map[y][x], bossId);
      if (!Number.isFinite(edgeDamage)) continue;
      const next = current.damage + edgeDamage;
      if (next >= dist[y][x]) continue;
      dist[y][x] = next;
      pending.push({ x, y, damage: next });
    }
  }
  return Number.POSITIVE_INFINITY;
}

export function filterPreHolyActions(actions) {
  return [...actions].filter((action) => !actionIsHoly(action));
}

/**
 * Search-order heuristic for the shared core5 preparation stage.
 *
 * Generic Tower priority rewards `floor * 1e10`. That is useful for ordinary
 * upward progress but pathological after reaching the F6/core5 boundary: legal
 * delayed-Holy preparation may require travelling down to a previously visited
 * shop or resource, and the floor reward starves those states under a bounded
 * existence search.
 *
 * During preBoss/core6 while cores==targetCores-1 we remove floor from the base
 * ordering signal. When the state is on target F6, an optimistic minimum damage
 * path to astralBoss is added as a much stronger goal-directed signal.
 * Everything here changes queue order only; none of it is a proof bound.
 */
export function preHolyContinuationPriority(state, {
  targetCores = 6,
  basePriority = 0,
  targetFloor = 5,
  relaxedDamageNeed = null,
  sequenceProgress = 0
} = {}) {
  if ((state?.cores ?? 0) !== targetCores - 1) return basePriority;
  const stats = state.stats ?? {};
  let value = (state.cores ?? 0) * 1e12
    + 5e11
    + (stats.atk ?? 0) * 1e6
    + (stats.def ?? 0) * 1e5
    + Math.min(stats.hp ?? 0, 50_000) * 1e3
    + Math.min(stats.gold ?? 0, 100_000) * 1e2;

  if ((state.floor ?? -1) === targetFloor && Number.isFinite(relaxedDamageNeed)) {
    const relaxedMargin = (stats.hp ?? 0) - relaxedDamageNeed - 1;
    // A relaxed route that can already survive corridor + boss gets a decisive
    // readiness bonus. Otherwise decreasing the damage deficit is still useful.
    value += relaxedMargin >= 0 ? 2e10 : 0;
    value += Math.max(-20_000, Math.min(20_000, relaxedMargin)) * 1e6;
    value += Math.max(0, sequenceProgress) * 1e7;
  }
  return value;
}

/**
 * Stage-scoped adapter for the shared delayed-Holy prefix.
 *
 * `f6Entry` is the first F6/core5 boundary before Holy. It intentionally stops
 * before requiring astralBoss affordability so a separate Pareto collector can
 * retain resource trade-offs at the expensive shared-prefix boundary.
 * `preBoss` asks whether astralBoss is currently a legal combat action.
 * `core6` asks whether the sixth core can be obtained before Holy.
 */
export function createPreHolyStageAdapter({
  stage = 'core6',
  bossId = 'astralBoss',
  targetCores = 6,
  targetFloor = 5,
  baseAdapter = createBoundedTowerAdapter()
} = {}) {
  if (!['f6Entry', 'preBoss', 'core6'].includes(stage)) {
    throw new Error(`Unknown pre-Holy stage: ${stage}`);
  }
  if (!Number.isInteger(targetCores) || targetCores < 1) {
    throw new Error('targetCores must be a positive integer.');
  }

  function baseActions(state) {
    return baseAdapter.enumerateActions(state);
  }

  return {
    ...baseAdapter,
    enumerateActions(state) {
      return filterPreHolyActions(baseActions(state));
    },
    isGoal(state) {
      if (state.relics?.holy) return false;
      if (stage === 'f6Entry') {
        return state.floor === targetFloor && (state.cores ?? 0) === targetCores - 1;
      }
      if (stage === 'core6') return (state.cores ?? 0) >= targetCores;
      return baseActions(state).some((action) => actionIsEnemy(action, bossId));
    },
    priority(state) {
      const base = baseAdapter.priority ? baseAdapter.priority(state) : 0;
      if (stage === 'preBoss' || stage === 'core6') {
        let relaxedDamageNeed = null;
        let sequenceProgress = 0;
        if ((state.floor ?? -1) === targetFloor && baseAdapter.materializeState) {
          const engineState = baseAdapter.materializeState(state);
          relaxedDamageNeed = relaxedBossDamageNeed(engineState, { bossId });
          sequenceProgress = engineState.floorStates?.[targetFloor]?.sequenceProgress ?? 0;
        }
        return preHolyContinuationPriority(state, {
          targetCores,
          basePriority: base,
          targetFloor,
          relaxedDamageNeed,
          sequenceProgress
        });
      }
      const nearTarget = (state.cores ?? 0) === targetCores - 1 && (state.floor ?? 0) >= targetFloor;
      return base + (nearTarget ? 5e9 : 0);
    },
    stageKey(state) {
      const base = baseAdapter.stageKey ? baseAdapter.stageKey(state) : 'all';
      return `${base}/preHoly:${stage}`;
    },
    rulesVersion() {
      return `${baseAdapter.rulesVersion?.() ?? 'tower'}+pre-holy-stage:${stage}+relaxed-boss-damage-v1`;
    },
    diagnosticStage: stage,
    diagnosticBossId: bossId,
    diagnosticTargetCores: targetCores,
    diagnosticTargetFloor: targetFloor
  };
}
