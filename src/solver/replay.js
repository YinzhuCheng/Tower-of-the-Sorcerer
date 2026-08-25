import { buyShopUpgrade, createInitialState, DIRECTIONS, teleportToFloor, tryMove } from '../game/engine.js';
import { hashValue } from './state.js';
import { createTowerAdapter } from './tower-adapter.js';

function resourcesEqual(left, right) {
  return Object.keys(right).every((key) => Number(left[key]) === Number(right[key]));
}

function replayPath(state, path) {
  for (const name of path ?? []) {
    const dir = DIRECTIONS[name];
    if (!dir) return { ok: false, reason: `Unknown direction in certificate: ${name}` };
    const result = tryMove(state, dir.dx, dir.dy);
    if (result.blocked || result.floorChanged) {
      return { ok: false, reason: result.reason ?? 'Certificate transit path changed floor.' };
    }
  }
  return { ok: true };
}

/**
 * Clone an explicit replay starting state in the adapter's canonical search
 * representation.
 *
 * Staged proof/search bridges are already compact Solver states. Calling
 * `compactState()` on such a bridge treats it as an engine-shaped state in the
 * Tower codec and is invalid. `cloneState()` is the correct first operation: the
 * Tower adapter's clone is intentionally representation-aware and accepts either
 * a compact state or an engine state. Adapters without a clone hook retain the
 * previous compact-then-structuredClone fallback.
 */
function cloneReplayInput(adapter, initialState) {
  if (typeof adapter.cloneState === 'function') return adapter.cloneState(initialState);
  let candidate = initialState;
  if (typeof adapter.compactState === 'function') candidate = adapter.compactState(candidate);
  return structuredClone(candidate);
}

function replayInitialState(adapter, initialState) {
  if (initialState == null) return createInitialState();
  const cloned = cloneReplayInput(adapter, initialState);
  return typeof adapter.materializeState === 'function'
    ? adapter.materializeState(cloned)
    : cloned;
}

function summarizedHash(adapter, state) {
  const summary = adapter.summarizeState ? adapter.summarizeState(state) : state;
  return hashValue(summary);
}

function applyCertificateSteps(state, certificate) {
  const failures = [];
  for (let index = 0; index < certificate.steps.length; index += 1) {
    const step = certificate.steps[index];
    if (state.floor !== step.floorBefore) {
      failures.push({ index, eventId: step.eventId, reason: `Floor mismatch: ${state.floor} != ${step.floorBefore}` });
      break;
    }

    if (step.kind === 'teleport') {
      const result = teleportToFloor(state, step.action.targetFloor);
      if (!result.ok) failures.push({ index, eventId: step.eventId, reason: result.reason });
    } else {
      const pathResult = replayPath(state, step.path);
      if (!pathResult.ok) {
        failures.push({ index, eventId: step.eventId, reason: pathResult.reason });
        break;
      }

      if (step.kind === 'shop') {
        const result = buyShopUpgrade(state, step.action.optionId);
        if (!result.ok) failures.push({ index, eventId: step.eventId, reason: result.reason });
      } else {
        const [x, y] = step.location;
        const dx = x - state.x;
        const dy = y - state.y;
        if (Math.abs(dx) + Math.abs(dy) !== 1) {
          failures.push({ index, eventId: step.eventId, reason: 'Tile event is not adjacent after replay path.' });
          break;
        }
        const result = tryMove(state, dx, dy);
        if (result.blocked) failures.push({ index, eventId: step.eventId, reason: result.reason });
      }
    }
    if (failures.length) break;
  }
  return failures;
}

/**
 * Authoritatively replays a Solver certificate.
 *
 * `initialState` is optional. When supplied, it must match the certificate's
 * `initialStateHash`. This allows proof decomposition (verified prefix state ->
 * verified continuation certificate) without reconstructing a bridge state from
 * a lossy summary. The explicit state may be either an adapter-native compact
 * state or an engine-shaped Tower state. Existing whole-game certificates
 * continue to replay from the canonical engine initial state.
 */
export function replayTowerCertificate(certificate, {
  adapter = createTowerAdapter(),
  initialState = null
} = {}) {
  const state = replayInitialState(adapter, initialState);
  const failures = [];

  if (certificate?.initialStateHash) {
    const actualInitialStateHash = summarizedHash(adapter, state);
    if (actualInitialStateHash !== certificate.initialStateHash) {
      failures.push({
        index: -1,
        eventId: null,
        reason: 'Certificate initial state hash mismatch.',
        expected: certificate.initialStateHash,
        actual: actualInitialStateHash
      });
    }
  }

  if (failures.length === 0) {
    for (let index = 0; index < certificate.steps.length; index += 1) {
      const step = certificate.steps[index];
      const stepFailures = applyCertificateSteps(state, { steps: [step] });
      if (stepFailures.length) {
        failures.push({ ...stepFailures[0], index });
        break;
      }

      const resources = adapter.resources(state);
      if (!resourcesEqual(resources, step.resourcesAfter)) {
        failures.push({ index, eventId: step.eventId, reason: 'Resource snapshot mismatch.', expected: step.resourcesAfter, actual: resources });
      }
      const structuralHash = hashValue(JSON.parse(adapter.structuralKey(state)));
      if (structuralHash !== step.structuralAfter) {
        failures.push({ index, eventId: step.eventId, reason: 'Structural state hash mismatch.', expected: step.structuralAfter, actual: structuralHash });
      }
      if (failures.length) break;
    }
  }

  const goal = failures.length === 0 && adapter.isGoal(state);
  if (failures.length === 0 && !goal) {
    failures.push({ index: certificate.steps.length, eventId: null, reason: 'Certificate ended before adapter goal.' });
  }

  return {
    ok: failures.length === 0 && goal,
    failures,
    final: adapter.summarizeState(state),
    objective: adapter.objectiveValue(state)
  };
}

/**
 * Replay a certificate and expose its exact compact terminal state only after
 * authoritative validation succeeds. Intended for staged proof continuation.
 */
export function replayTowerCertificateToState(certificate, {
  adapter = createTowerAdapter(),
  initialState = null
} = {}) {
  const replay = replayTowerCertificate(certificate, { adapter, initialState });
  if (!replay.ok) return { ...replay, state: null };

  const bridge = replayInitialState(adapter, initialState);
  const failures = applyCertificateSteps(bridge, certificate);
  if (failures.length) return { ...replay, ok: false, failures, state: null };

  const compactBridge = typeof adapter.compactState === 'function'
    ? adapter.compactState(bridge)
    : (adapter.cloneState ? adapter.cloneState(bridge) : structuredClone(bridge));
  return { ...replay, state: compactBridge };
}
