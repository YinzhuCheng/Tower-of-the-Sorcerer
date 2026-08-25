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
