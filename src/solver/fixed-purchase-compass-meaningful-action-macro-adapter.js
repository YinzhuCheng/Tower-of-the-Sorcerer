function cloneWith(adapter, state) {
  return typeof adapter.cloneState === 'function' ? adapter.cloneState(state) : structuredClone(state);
}

function teleportAction(targetFloor) {
  return {
    kind: 'teleport',
    eventId: `teleport:f${targetFloor + 1}`,
    targetFloor
  };
}

function normalizeWith(adapter, state) {
  if (typeof adapter.normalize !== 'function') return { state, steps: [] };
  const normalized = adapter.normalize(state);
  if (!normalized?.state) throw new Error('Compass macro base normalize() must return { state, steps }.');
  return { state: normalized.state, steps: normalized.steps ?? [] };
}

function macroEventId(targetFloor, mode, innerAction = null) {
  const target = `f${targetFloor + 1}`;
  if (mode === 'normalize') return `compass-macro:${target}:normalize`;
  return `compass-macro:${target}:${innerAction?.eventId ?? innerAction?.kind ?? 'action'}`;
}

function remoteTargets(state) {
  if (!state?.relics?.compass) return [];
  const currentFloor = Number(state.floor);
  return [...new Set(state.visitedFloors ?? [])]
    .filter((floor) => Number.isInteger(floor) && floor >= 0 && floor !== currentFloor)
    .sort((a, b) => a - b);
}

/**
 * Remove pure Compass-teleport search nodes without removing any first
 * productive continuation from a visited floor.
 *
 * For every visited remote floor the adapter authoritatively simulates:
 *
 *   teleport(target) -> wrapped normalize(target)
 *
 * and then exposes either/both of:
 *
 * - a `normalize` macro when target normalization itself performs one or more
 *   automatic events; this preserves routes whose first useful effect after a
 *   teleport is normalization rather than an explicit action;
 * - one `action` macro for every ordinary non-teleport action available after
 *   that normalization. The inner action may itself be a stair, preserving
 *   U/D-anchor component transitions that cannot be replaced by direct Compass
 *   landing at the D anchor.
 *
 * Ordinary pure teleport actions are omitted only when Compass is owned. If a
 * teleport has empty normalization and the next action would be another
 * teleport, the first teleport is redundant because all targets were already
 * visited and the second teleport can be taken directly from the original
 * state. If normalization is non-empty, the dedicated normalize macro preserves
 * those side effects before any subsequent teleport.
 *
 * Every macro is re-executed through the wrapped adapter in applyAction(), and
 * the returned Solver edge contains the exact ordinary teleport, normalization
 * and inner-action certificate steps. No event/card/resource field is quotiented.
 */
export function createFixedPurchaseCompassMeaningfulActionMacroAdapter({
  baseAdapter,
  minCores = 7
} = {}) {
  if (!baseAdapter?.fixedPurchasePolicy) {
    throw new Error('Compass meaningful-action macros require a fixed-purchase policy adapter.');
  }
  if (typeof baseAdapter.enumerateActions !== 'function'
    || typeof baseAdapter.applyAction !== 'function') {
    throw new Error('Compass meaningful-action macros require enumerateActions/applyAction.');
  }
  if (!Number.isInteger(minCores) || minCores < 0) {
    throw new Error('minCores must be a non-negative integer.');
  }

  function enumerateRemoteMacros(state) {
    const macros = [];
    for (const targetFloor of remoteTargets(state)) {
      const outbound = baseAdapter.applyAction(
        cloneWith(baseAdapter, state),
        teleportAction(targetFloor)
      );
      if (!outbound?.ok || !outbound.state) continue;

      const normalized = normalizeWith(baseAdapter, outbound.state);
      if ((normalized.steps?.length ?? 0) > 0) {
        macros.push({
          kind: 'compassMacro',
          macroMode: 'normalize',
          eventId: macroEventId(targetFloor, 'normalize'),
          targetFloor
        });
      }

      const innerActions = baseAdapter.enumerateActions(normalized.state)
        .filter((action) => action?.kind !== 'teleport');
      for (const innerAction of innerActions) {
        macros.push({
          kind: 'compassMacro',
          macroMode: 'action',
          eventId: macroEventId(targetFloor, 'action', innerAction),
          targetFloor,
          innerAction
        });
      }
    }
    return macros;
  }

  function applyMacro(state, action) {
    const outbound = baseAdapter.applyAction(state, teleportAction(action.targetFloor));
    if (!outbound?.ok || !outbound.state) {
      return { ok: false, reason: outbound?.reason ?? 'Compass macro teleport failed.', state };
    }
    const normalized = normalizeWith(baseAdapter, outbound.state);
    const prefixSteps = [...(outbound.steps ?? []), ...(normalized.steps ?? [])];

    if (action.macroMode === 'normalize') {
      if (normalized.steps.length === 0) {
        return { ok: false, reason: 'Compass normalize macro became unproductive.', state };
      }
      return { ok: true, state: normalized.state, steps: prefixSteps };
    }

    if (action.macroMode !== 'action' || !action.innerAction) {
      return { ok: false, reason: 'Unknown Compass macro mode.', state };
    }
    if (action.innerAction.kind === 'teleport') {
      return { ok: false, reason: 'Compass action macro cannot wrap another teleport.', state };
    }

    const applied = baseAdapter.applyAction(normalized.state, action.innerAction);
    if (!applied?.ok || !applied.state) {
      return { ok: false, reason: applied?.reason ?? 'Compass macro inner action failed.', state };
    }
    return {
      ok: true,
      state: applied.state,
      steps: [...prefixSteps, ...(applied.steps ?? [])]
    };
  }

  return {
    ...baseAdapter,
    enumerateActions(state) {
      const baseActions = baseAdapter.enumerateActions(state);
      if (!state?.relics?.compass || Number(state.cores ?? 0) < minCores) return baseActions;
      const localActions = baseActions.filter((action) => action?.kind !== 'teleport');
      return [...localActions, ...enumerateRemoteMacros(state)];
    },
    applyAction(state, action) {
      if (action?.kind !== 'compassMacro') return baseAdapter.applyAction(state, action);
      return applyMacro(state, action);
    },
    actionClass(action) {
      if (action?.kind !== 'compassMacro') {
        return typeof baseAdapter.actionClass === 'function'
          ? baseAdapter.actionClass(action)
          : (action?.kind ?? 'unknown');
      }
      if (action.macroMode === 'normalize') return 'remoteNormalize';
      return typeof baseAdapter.actionClass === 'function'
        ? baseAdapter.actionClass(action.innerAction)
        : (action.innerAction?.kind ?? 'remoteAction');
    },
    rulesVersion() {
      return `${baseAdapter.rulesVersion?.() ?? 'tower'}+compass-meaningful-action-macro-v1:c${minCores}`;
    },
    compassMeaningfulActionMacro: Object.freeze({
      version: 1,
      fixedPolicyOnly: true,
      minCores,
      removesPureTeleportNodes: true,
      preservesProductiveRemoteNormalization: true,
      preservesInnerStairs: true,
      certificateVisible: true
    })
  };
}
