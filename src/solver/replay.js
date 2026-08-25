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

function battleTraceEntry(step, result, statsBefore, statsAfter) {
  if (!result?.battle || result.blocked) return null;
  const battle = result.battle;
  const hpBefore = Number(statsBefore.hp ?? 0);
  const totalDamage = Number(battle.totalDamage ?? 0);
  return {
    eventId: step.eventId,
    floor: step.floorBefore + 1,
    enemyId: battle.enemyId,
    enemyName: battle.enemy?.name ?? null,
    boss: Boolean(battle.enemy?.boss),
    finalBoss: Boolean(battle.enemy?.finalBoss),
    special: battle.enemy?.special ?? null,
    statsBefore: { ...statsBefore },
    statsAfter: { ...statsAfter },
    battle: {
      winnable: battle.winnable,
      heroDamage: battle.heroDamage,
      enemyDamage: battle.enemyDamage,
      rounds: battle.rounds,
      counterAttacks: battle.counterAttacks,
      totalDamage,
      remainingHp: battle.remainingHp
    },
    hpMargin: hpBefore - totalDamage - 1,
    normalizedHpMargin: (hpBefore - totalDamage - 1) / Math.max(1, hpBefore)
  };
}

function applyCertificateSteps(state, certificate, { battleLog = null } = {}) {
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
        const statsBefore = { ...state.stats };
        const result = tryMove(state, dx, dy);
        if (result.blocked) {
          failures.push({ index, eventId: step.eventId, reason: result.reason });
        } else if (battleLog) {
          const entry = battleTraceEntry(step, result, statsBefore, state.stats);
          if (entry) battleLog.push(entry);
        }
      }
    }
    if (failures.length) break;
  }
  return failures;
}

function compactReplayState(adapter, state) {
  if (typeof adapter.compactState === 'function') return adapter.compactState(state);
  if (typeof adapter.cloneState === 'function') return adapter.cloneState(state);
  return structuredClone(state);
}

/**
 * Authoritatively replays a Solver certificate including resource/structural
 * snapshots. Use this for proof certificates whose numeric state must match.
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

  return { ...replay, state: compactReplayState(adapter, bridge) };
}

/**
 * Replay an action skeleton and also expose the exact compact continuation
 * state. Unlike a proof certificate, resource/structural snapshots on the input
 * steps are ignored; every action itself is still executed by canonical
 * `engine.js`.
 *
 * This helper is intentionally low-level. It enables dynamic programs that
 * branch only at selected actions (for example later shop choices after one
 * forced mistake) while keeping all non-branching event-order transitions
 * authoritative. The returned state is valid only when `ok=true`.
 */
export function replayTowerStepSkeletonToState(steps, {
  adapter = createTowerAdapter(),
  initialState = null,
  requireGoal = false
} = {}) {
  if (!Array.isArray(steps)) throw new Error('Step skeleton must be an array.');
  const state = replayInitialState(adapter, initialState);
  const battleLog = [];
  const failures = applyCertificateSteps(state, { steps }, { battleLog });
  const goal = failures.length === 0 && adapter.isGoal(state);
  if (failures.length === 0 && requireGoal && !goal) {
    failures.push({ index: steps.length, eventId: null, reason: 'Step skeleton ended before adapter goal.' });
  }
  const margins = battleLog.map((entry) => entry.normalizedHpMargin).filter(Number.isFinite);
  const ok = failures.length === 0 && (!requireGoal || goal);
  return {
    ok,
    goal,
    failures,
    state: ok ? compactReplayState(adapter, state) : null,
    final: adapter.summarizeState(state),
    objective: adapter.objectiveValue(state),
    battleLog,
    minNormalizedHpMargin: margins.length ? Math.min(...margins) : null
  };
}

/**
 * Replay only the topological/action skeleton of one or more prior certificates.
 *
 * Resource and structural snapshots are intentionally ignored. This is for
 * numeric-only balance mutation: the same map action sequence can be attempted
 * under new enemy/shop values, and every move/fight/purchase is still executed
 * by canonical `engine.js`. If a changed fight becomes illegal, the skeleton
 * fails naturally at that step.
 *
 * This is a player warm-start witness, NOT a proof certificate. It must never be
 * used as a branch-and-bound incumbent without a domain-specific verification
 * step for the current candidate.
 */
export function replayTowerStepSkeleton(steps, {
  adapter = createTowerAdapter(),
  initialState = null,
  requireGoal = true
} = {}) {
  const replay = replayTowerStepSkeletonToState(steps, {
    adapter,
    initialState,
    requireGoal
  });
  return {
    ok: replay.ok,
    goal: replay.goal,
    failures: replay.failures,
    final: replay.final,
    objective: replay.objective,
    battleLog: replay.battleLog,
    minNormalizedHpMargin: replay.minNormalizedHpMargin
  };
}
