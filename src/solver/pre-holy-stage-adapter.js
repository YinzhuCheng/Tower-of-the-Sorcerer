import { createTowerAdapter } from './tower-adapter.js';

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
 * `preBoss` asks whether a state exists where astralBoss is an actually legal
 * combat action under current stats/resources while Holy has never been taken.
 * `core6` asks whether the boss can actually be defeated and the sixth core
 * obtained before Holy.
 *
 * Both goals terminate before the delayed Holy policies diverge, removing F7/F8
 * and later Holy timing choices from the diagnostic state space.
 */
export function createPreHolyStageAdapter({
  stage = 'core6',
  bossId = 'astralBoss',
  targetCores = 6,
  baseAdapter = createTowerAdapter()
} = {}) {
  if (!['preBoss', 'core6'].includes(stage)) {
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
      if (stage === 'core6') return (state.cores ?? 0) >= targetCores;
      return baseActions(state).some((action) => actionIsEnemy(action, bossId));
    },
    priority(state) {
      // Keep the canonical progress-first ordering, with a small additional
      // preference for F6/c5 states. This changes exploration order only.
      const base = baseAdapter.priority ? baseAdapter.priority(state) : 0;
      const nearTarget = (state.cores ?? 0) === targetCores - 1 && (state.floor ?? 0) >= 5;
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
    diagnosticTargetCores: targetCores
  };
}
