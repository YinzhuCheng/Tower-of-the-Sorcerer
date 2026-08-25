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

function relaxedTraversalCost(token, bossId) {
  if (token === '#') return Number.POSITIVE_INFINITY;
  if (token === '.' || token === 'S' || token === 'shop' || token === 'U' || token === 'D') return 0;
  const parsed = parseTokenLocal(token);
  if (parsed.type === 'enemy' && parsed.id === bossId) return 0;
  if (parsed.type === 'item') return parsed.id === 'holy' ? Number.POSITIVE_INFINITY : 0;
  if (parsed.type === 'rune') return 0;
  if (parsed.type === 'enemy' || parsed.type === 'door' || parsed.type === 'gate' || parsed.type === 'switch') return 1;
  return 1;
}

/**
 * 0/1 relaxed topological distance from the current location to the requested
 * boss. Resource preconditions are intentionally ignored for doors/gates/enemies
 * so this remains an optimistic progress heuristic rather than a feasibility
 * test. Holy is treated as impassable because the stage explicitly forbids
 * acquiring it.
 *
 * Result = minimum number of unresolved blocking events on any relaxed path,
 * excluding the boss itself. Infinity means even the relaxation has no path.
 */
export function relaxedBossBarrierDistance(engineState, {
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
  const deque = [{ x: engineState.x, y: engineState.y }];
  dist[engineState.y][engineState.x] = 0;
  let head = 0;

  // Small 11x11 maps make a simple repeated-relaxation deque adequate here;
  // zero-cost edges are inserted before the remaining unprocessed tail.
  while (head < deque.length) {
    const current = deque[head++];
    const base = dist[current.y][current.x];
    if (current.x === boss.x && current.y === boss.y) return base;
    const neighbors = [
      [current.x, current.y - 1],
      [current.x, current.y + 1],
      [current.x - 1, current.y],
      [current.x + 1, current.y]
    ];
    for (const [x, y] of neighbors) {
      if (x < 0 || y < 0 || y >= height || x >= (map[y]?.length ?? 0)) continue;
      const cost = relaxedTraversalCost(map[y][x], bossId);
      if (!Number.isFinite(cost)) continue;
      const next = base + cost;
      if (next >= dist[y][x]) continue;
      dist[y][x] = next;
      if (cost === 0) {
        // Move zero-cost nodes to the current processing frontier. Array splice
        // is fine at 11x11 scale and keeps the implementation dependency-free.
        deque.splice(head, 0, { x, y });
      } else {
        deque.push({ x, y });
      }
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
 * During preBoss/core6 while cores==targetCores-1 we therefore remove floor from
 * the ordering signal. Resource improvements still raise priority, but a free
 * downward travel with unchanged resources competes on equal terms with staying
 * on F6. This function changes queue order only; it is never a proof bound.
 */
export function preHolyContinuationPriority(state, {
  targetCores = 6,
  basePriority = 0,
  targetFloor = 5,
  bossBarrierDistance = null,
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

  if ((state.floor ?? -1) === targetFloor && Number.isFinite(bossBarrierDistance)) {
    // Barrier progress deliberately dominates small stat deltas so that states
    // which actually open the F6 route are popped before unrelated permutations.
    // 32 exceeds any possible blocker count on the current 11x11 floor.
    value += Math.max(0, 32 - bossBarrierDistance) * 1e8;
    value += Math.max(0, sequenceProgress) * 5e7;
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
        let bossBarrierDistance = null;
        let sequenceProgress = 0;
        if ((state.floor ?? -1) === targetFloor && baseAdapter.materializeState) {
          const engineState = baseAdapter.materializeState(state);
          bossBarrierDistance = relaxedBossBarrierDistance(engineState, { bossId });
          sequenceProgress = engineState.floorStates?.[targetFloor]?.sequenceProgress ?? 0;
        }
        return preHolyContinuationPriority(state, {
          targetCores,
          basePriority: base,
          targetFloor,
          bossBarrierDistance,
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
      return `${baseAdapter.rulesVersion?.() ?? 'tower'}+pre-holy-stage:${stage}+relaxed-boss-distance-v1`;
    },
    diagnosticStage: stage,
    diagnosticBossId: bossId,
    diagnosticTargetCores: targetCores,
    diagnosticTargetFloor: targetFloor
  };
}
