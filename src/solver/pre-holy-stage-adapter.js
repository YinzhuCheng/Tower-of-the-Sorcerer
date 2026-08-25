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
 * Canonicalize upward return during F6/core5 delayed-Holy preparation.
 *
 * `createBoundedTowerAdapter()` globally removes upward compass teleports and
 * keeps U traversal. That is a good default for whole-game search, but a lower
 * floor preparation excursion can then require several same-resource U states
 * before returning to the already visited F6 target.
 *
 * The engine natively permits compass teleport from any position to any visited
 * floor. Teleporting upward to F6 lands on F6's D anchor, exactly as entering F6
 * through U. Therefore, for an already visited target F6, every upward U chain
 * can be represented as one direct target-floor teleport. If a strategy wanted
 * to stop on an intermediate upper floor, it can first return to F6 and then use
 * a legal downward teleport to that intermediate floor; both land at its D
 * anchor and no modeled mechanic depends on travel turn count.
 *
 * This function changes only the canonical representation of free travel:
 * - downward teleports from the bounded adapter are retained;
 * - U is removed while below targetFloor;
 * - one legal direct teleport back to targetFloor is added;
 * - D is already absent under canonical-travel-v1.
 *
 * It never creates access to an unvisited floor and does not remove any
 * resource-changing event.
 */
export function canonicalizePreHolyReturnTravel(state, actions, { targetFloor = 5 } = {}) {
  const list = [...actions];
  if (!state?.relics?.compass) return list;
  if ((state.floor ?? 0) >= targetFloor) return list;
  if (!Array.isArray(state.visitedFloors) || !state.visitedFloors.includes(targetFloor)) return list;

  const withoutUp = list.filter((action) => !(action.kind === 'tile' && action.token === 'U'));
  const alreadyHasTargetTeleport = withoutUp.some((action) =>
    action.kind === 'teleport' && action.targetFloor === targetFloor
  );
  if (alreadyHasTargetTeleport) return withoutUp;
  return [
    ...withoutUp,
    {
      kind: 'teleport',
      eventId: `teleport:f${targetFloor + 1}:preholy-return`,
      targetFloor
    }
  ];
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

  function stageActions(state) {
    const noHoly = filterPreHolyActions(baseActions(state));
    if (stage === 'preBoss' || stage === 'core6') {
      return canonicalizePreHolyReturnTravel(state, noHoly, { targetFloor });
    }
    return noHoly;
  }

  return {
    ...baseAdapter,
    enumerateActions(state) {
      return stageActions(state);
    },
    isGoal(state) {
      if (state.relics?.holy) return false;
      if (stage === 'f6Entry') {
        return state.floor === targetFloor && (state.cores ?? 0) === targetCores - 1;
      }
      if (stage === 'core6') return (state.cores ?? 0) >= targetCores;
      return stageActions(state).some((action) => actionIsEnemy(action, bossId));
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
      return `${baseAdapter.rulesVersion?.() ?? 'tower'}+pre-holy-stage:${stage}+direct-return-f${targetFloor + 1}-v1`;
    },
    diagnosticStage: stage,
    diagnosticBossId: bossId,
    diagnosticTargetCores: targetCores,
    diagnosticTargetFloor: targetFloor
  };
}
