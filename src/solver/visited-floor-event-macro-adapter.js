function macroEnabled(state, minCores) {
  return Boolean(state?.relics?.compass) && (state?.cores ?? 0) >= minCores;
}

function syntheticTeleport(targetFloor) {
  return {
    kind: 'teleport',
    targetFloor,
    eventId: `macro:teleport:f${targetFloor + 1}`
  };
}

function normalizeWith(baseAdapter, state) {
  if (typeof baseAdapter.normalize !== 'function') return { state, steps: [] };
  const normalized = baseAdapter.normalize(state);
  if (!normalized?.state) throw new Error('base normalize() must return { state, steps }.');
  return { state: normalized.state, steps: normalized.steps ?? [] };
}

function prepareVisitedFloor(baseAdapter, state, targetFloor) {
  let current = baseAdapter.cloneState(state);
  const steps = [];
  if (targetFloor !== state.floor) {
    const travel = baseAdapter.applyAction(current, syntheticTeleport(targetFloor));
    if (!travel?.ok) return null;
    current = travel.state;
    steps.push(...(travel.steps ?? []));
    const normalized = normalizeWith(baseAdapter, current);
    current = normalized.state;
    steps.push(...normalized.steps);
  }
  return { state: current, steps };
}

function canonicalLateFrontierKey(baseAdapter, state) {
  if (typeof baseAdapter.frontierKey !== 'function') return baseAdapter.structuralKey(state);
  const canonical = baseAdapter.cloneState(state);
  // The wrapper's action surface is the union of first strategic events across
  // all visited floors, so current free-travel location is quotient state only.
  canonical.floor = 0;
  if ('componentAnchor' in canonical) canonical.componentAnchor = 0;
  return baseAdapter.frontierKey(canonical);
}

/**
 * Late-game free-travel quotient for staged exploit search.
 *
 * Once Compass exists and the requested core threshold is reached, standalone
 * inter-floor travel is not a strategic decision: `teleportToFloor()` is free,
 * every already-crossed blocker is monotone-cleared, and any useful sequence can
 * be represented by travelling to the floor that contains its first subsequent
 * non-teleport event. This adapter therefore exposes the union of those first
 * events as legal composite edges.
 *
 * Each composite edge is executed as real authoritative operations:
 *
 *     teleport -> safe automatic closure -> one ordinary base action
 *
 * and returns the constituent certificate steps. A closure-only edge is also
 * emitted when travel itself exposes safe automatic pickups. `U` remains a real
 * event so an unvisited next floor can still be entered normally.
 *
 * This quotient is intentionally staged-only. Earlier whole-game travel-fold
 * experiments increased branching; this adapter is restricted to the measured
 * core7 cleanup bottleneck and should be kept only if A/B improves the suffix.
 */
export function createVisitedFloorEventMacroAdapter({
  baseAdapter,
  minCores = 7
} = {}) {
  if (!baseAdapter || typeof baseAdapter.enumerateActions !== 'function' || typeof baseAdapter.applyAction !== 'function') {
    throw new Error('visited-floor macro adapter requires a Tower-like base adapter.');
  }
  if (!Number.isInteger(minCores) || minCores < 1) throw new Error('minCores must be a positive integer.');

  return {
    ...baseAdapter,
    enumerateActions(state) {
      if (!macroEnabled(state, minCores)) return baseAdapter.enumerateActions(state);
      const targets = [...new Set(state.visitedFloors ?? [state.floor])].sort((a, b) => a - b);
      const actions = [];

      for (const targetFloor of targets) {
        if (targetFloor === state.floor) {
          actions.push(...baseAdapter.enumerateActions(state).filter((action) => action.kind !== 'teleport'));
          continue;
        }

        const prepared = prepareVisitedFloor(baseAdapter, state, targetFloor);
        if (!prepared) continue;
        const innerActions = baseAdapter.enumerateActions(prepared.state)
          .filter((action) => action.kind !== 'teleport');

        if (prepared.steps.length > 1) {
          actions.push({
            kind: 'travelClosure',
            targetFloor,
            eventId: `macro:travel-closure:f${targetFloor + 1}`
          });
        }

        for (const innerAction of innerActions) {
          actions.push({
            kind: 'travelEvent',
            targetFloor,
            innerAction,
            eventId: `macro:f${targetFloor + 1}->${innerAction.eventId}`
          });
        }
      }

      return actions;
    },
    applyAction(state, action) {
      if (action?.kind !== 'travelEvent' && action?.kind !== 'travelClosure') {
        return baseAdapter.applyAction(state, action);
      }
      const prepared = prepareVisitedFloor(baseAdapter, state, action.targetFloor);
      if (!prepared) return { ok: false, reason: 'Macro travel target is no longer reachable.', state };
      if (action.kind === 'travelClosure') {
        return { ok: true, state: prepared.state, steps: prepared.steps };
      }
      const applied = baseAdapter.applyAction(prepared.state, action.innerAction);
      if (!applied?.ok) return { ...applied, state };
      return {
        ok: true,
        state: applied.state,
        steps: [...prepared.steps, ...(applied.steps ?? [])]
      };
    },
    actionClass(action) {
      if (action?.kind === 'travelEvent') {
        return baseAdapter.actionClass ? baseAdapter.actionClass(action.innerAction) : (action.innerAction?.kind ?? 'event');
      }
      if (action?.kind === 'travelClosure') return 'travelClosure';
      return baseAdapter.actionClass ? baseAdapter.actionClass(action) : (action?.kind ?? 'unknown');
    },
    frontierKey(state) {
      return macroEnabled(state, minCores)
        ? canonicalLateFrontierKey(baseAdapter, state)
        : (baseAdapter.frontierKey ? baseAdapter.frontierKey(state) : baseAdapter.structuralKey(state));
    },
    rulesVersion() {
      return `${baseAdapter.rulesVersion?.() ?? 'tower'}+visited-floor-event-macro-v1:c${minCores}`;
    },
    visitedFloorEventMacro: Object.freeze({ minCores })
  };
}
