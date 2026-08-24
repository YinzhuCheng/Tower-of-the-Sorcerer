import { createTowerAdapter } from './tower-adapter.js';

function isTeleport(action) {
  return action?.kind === 'teleport';
}

function nonTeleportActions(adapter, state) {
  return adapter.enumerateActions(state).filter((action) => !isTeleport(action));
}

/**
 * Search-only composition layer.
 *
 * Teleporting between already visited floors is free in the canonical rules:
 * it changes neither resources nor world events. Keeping the pure teleport as
 * its own queued state therefore creates a large number of navigation-only
 * labels. This wrapper replaces
 *
 *   teleport -> normalize target floor -> real macro event
 *
 * with one search edge while preserving every authoritative certificate step.
 * The wrapped Tower adapter remains the sole mechanics implementation.
 */
export function createTowerSearchAdapter() {
  const base = createTowerAdapter();

  function enumerateActions(state) {
    const direct = base.enumerateActions(state);
    const local = direct.filter((action) => !isTeleport(action));
    const travel = [];

    for (const teleport of direct.filter(isTeleport)) {
      const moved = base.applyAction(base.cloneState(state), teleport);
      if (!moved?.ok) continue;

      // The unwrapped search normalizes after every edge. Do exactly the same
      // before discovering events on the destination floor.
      const normalized = base.normalize(moved.state);
      for (const inner of nonTeleportActions(base, normalized.state)) {
        travel.push({
          kind: 'travel',
          eventId: `travel:${teleport.eventId}->${inner.eventId}`,
          teleport,
          inner
        });
      }
    }

    return [...local, ...travel];
  }

  function applyAction(state, action) {
    if (action.kind !== 'travel') {
      return base.applyAction(base.cloneState(state), action);
    }

    const moved = base.applyAction(base.cloneState(state), action.teleport);
    if (!moved?.ok) return moved;

    const normalized = base.normalize(moved.state);
    const applied = base.applyAction(base.cloneState(normalized.state), action.inner);
    if (!applied?.ok) return applied;

    return {
      ok: true,
      state: applied.state,
      steps: [
        ...(moved.steps ?? []),
        ...(normalized.steps ?? []),
        ...(applied.steps ?? [])
      ]
    };
  }

  function actionClass(action) {
    if (action.kind === 'travel') {
      const innerClass = base.actionClass?.(action.inner) ?? action.inner?.kind ?? 'event';
      return `travel/${innerClass}`;
    }
    return base.actionClass?.(action) ?? action.kind ?? 'unknown';
  }

  return {
    ...base,
    stateEncoding: `${base.stateEncoding}+travel-fold-v1`,
    enumerateActions,
    applyAction,
    actionClass
  };
}
