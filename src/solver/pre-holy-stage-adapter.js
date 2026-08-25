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

function transitToken(token) {
  return token === '.' || token === 'S' || token === 'shop';
}

/**
 * Exact zero-event movement question on the current dynamic floor: can the hero
 * stand next to `bossId` without crossing another event tile?
 *
 * This intentionally uses the same transit grammar as `tower-adapter.js`
 * path-to-adjacent (`.`, `S`, `shop`). Items, runes, doors, gates and enemies
 * remain blockers until the authoritative engine/adapter has actually processed
 * them. Therefore `true` is a structural fact about the current state, not a
 * relaxed heuristic.
 */
export function hasFreeBossCorridor(engineState, { bossId = 'astralBoss' } = {}) {
  const floorState = engineState?.floorStates?.[engineState.floor];
  const map = floorState?.map;
  if (!Array.isArray(map) || map.length === 0) return false;
  let boss = null;
  for (let y = 0; y < map.length; y += 1) {
    for (let x = 0; x < (map[y]?.length ?? 0); x += 1) {
      if (map[y][x] === `enemy:${bossId}`) boss = { x, y };
    }
  }
  if (!boss) return false;

  const height = map.length;
  const width = Math.max(...map.map((row) => row.length));
  const queue = [{ x: engineState.x, y: engineState.y }];
  let head = 0;
  const seen = new Set([`${engineState.x},${engineState.y}`]);
  while (head < queue.length) {
    const current = queue[head++];
    if (Math.abs(current.x - boss.x) + Math.abs(current.y - boss.y) === 1) return true;
    const neighbors = [
      [current.x, current.y - 1],
      [current.x, current.y + 1],
      [current.x - 1, current.y],
      [current.x + 1, current.y]
    ];
    for (const [x, y] of neighbors) {
      if (x < 0 || y < 0 || y >= height || x >= (map[y]?.length ?? 0)) continue;
      const key = `${x},${y}`;
      if (seen.has(key)) continue;
      if (!transitToken(map[y][x])) continue;
      seen.add(key);
      queue.push({ x, y });
    }
  }
  return false;
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
  basePriority = 0
} = {}) {
  if ((state?.cores ?? 0) !== targetCores - 1) return basePriority;
  const stats = state.stats ?? {};
  return (state.cores ?? 0) * 1e12
    + 5e11
    + (stats.atk ?? 0) * 1e6
    + (stats.def ?? 0) * 1e5
    + Math.min(stats.hp ?? 0, 50_000) * 1e3
    + Math.min(stats.gold ?? 0, 100_000) * 1e2;
}

/**
 * Stage-scoped adapter for the shared delayed-Holy prefix.
 *
 * `f6Entry`: first F6/core5 boundary before Holy.
 * `corridorOpen`: current state has exact zero-event movement to a tile adjacent
 *                 to astralBoss, without requiring that the boss is winnable.
 * `preBoss`: astralBoss is a legal authoritative combat action right now.
 * `core6`: sixth core obtained before Holy.
 */
export function createPreHolyStageAdapter({
  stage = 'core6',
  bossId = 'astralBoss',
  targetCores = 6,
  targetFloor = 5,
  baseAdapter = createBoundedTowerAdapter()
} = {}) {
  if (!['f6Entry', 'corridorOpen', 'preBoss', 'core6'].includes(stage)) {
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
      if (stage === 'corridorOpen') {
        if (state.floor !== targetFloor || (state.cores ?? 0) !== targetCores - 1) return false;
        if (!baseAdapter.materializeState) return false;
        return hasFreeBossCorridor(baseAdapter.materializeState(state), { bossId });
      }
      if (stage === 'core6') return (state.cores ?? 0) >= targetCores;
      return baseActions(state).some((action) => actionIsEnemy(action, bossId));
    },
    priority(state) {
      const base = baseAdapter.priority ? baseAdapter.priority(state) : 0;
      if (stage === 'preBoss' || stage === 'core6') {
        return preHolyContinuationPriority(state, { targetCores, basePriority: base });
      }
      if (stage === 'corridorOpen') {
        // Corridor proof should first consume/resolve the local F6 blockers. The
        // normal Tower floor preference is useful here because a successful
        // witness is expected to exist without first solving the later boss
        // resource-preparation problem. This remains ordering-only; a miss is
        // not interpreted as global infeasibility unless the full frontier is
        // actually exhausted.
        return base + (state.floor === targetFloor ? 5e10 : 0);
      }
      const nearTarget = (state.cores ?? 0) === targetCores - 1 && (state.floor ?? 0) >= targetFloor;
      return base + (nearTarget ? 5e9 : 0);
    },
    stageKey(state) {
      const base = baseAdapter.stageKey ? baseAdapter.stageKey(state) : 'all';
      return `${base}/preHoly:${stage}`;
    },
    rulesVersion() {
      return `${baseAdapter.rulesVersion?.() ?? 'tower'}+pre-holy-stage:${stage}`;
    },
    diagnosticStage: stage,
    diagnosticBossId: bossId,
    diagnosticTargetCores: targetCores,
    diagnosticTargetFloor: targetFloor
  };
}
