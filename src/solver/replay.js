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

export function replayTowerCertificate(certificate, { adapter = createTowerAdapter() } = {}) {
  const state = createInitialState();
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

  const goal = adapter.isGoal(state);
  if (!goal) failures.push({ index: certificate.steps.length, eventId: null, reason: 'Certificate ended before victory.' });

  return {
    ok: failures.length === 0 && goal,
    failures,
    final: adapter.summarizeState(state),
    objective: adapter.objectiveValue(state)
  };
}
