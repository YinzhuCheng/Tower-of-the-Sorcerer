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
        return preHolyContinuationPriority(state, { targetCores, basePriority: base });
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
