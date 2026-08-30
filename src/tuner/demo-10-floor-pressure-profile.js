import { ENEMIES, FLOORS } from '../game/data.js';
import {
  assertDemoTenFloorSolverLocks,
  captureDemoTenFloorSolverLocks
} from './demo-10-floor-solver-profile.js';
import {
  createDemoTenFloorMutationCatalog,
  withDemoTenFloorCandidate
} from './demo-10-floor-mutations.js';

// Reversing this bundle returns the four ordinary late-game encounters to the
// post-scaling v2 values.  It is intentionally evaluated through the normal
// mutator, so a pressure check can prove both temporary rollback and automatic
// restoration without ever touching a gate, a key item, a core bearer, or a
// boss statistic.
export const DEMO10_PRESSURE_RELAXATION_CANDIDATE = Object.freeze({
  mutationIds: Object.freeze([
    'f8-hush-magic-down100',
    'f8-outer-atk-down42',
    'f9-null-magic-down100',
    'f10-eclipse-mage-magic-down60'
  ])
});

function compact(selection) {
  return {
    replayableWins: selection.replayableWins,
    hardCandidates: selection.hardCandidates,
    discoveredFamilies: selection.discoveredFamilies,
    complete: selection.complete,
    selected: selection.selected.map((attempt) => ({
      id: attempt.id,
      decisions: attempt.family.decisions,
      minNormalizedHpMargin: attempt.family.minNormalizedHpMargin
    }))
  };
}

/**
 * Compare the authored pressure profile to a temporary, mutator-driven
 * relaxation.  `certify` is injected because its Tower adapter must be loaded
 * only after the demo overlay has installed the live event catalogue.
 */
export function evaluateDemoTenFloorPressureProfile({ certify } = {}) {
  if (typeof certify !== 'function') {
    throw new Error('10F pressure profile requires a route-family certification callback.');
  }
  const catalog = createDemoTenFloorMutationCatalog();
  const locks = captureDemoTenFloorSolverLocks({ floors: FLOORS, enemies: ENEMIES });
  const pressured = certify();
  assertDemoTenFloorSolverLocks(locks, { floors: FLOORS, enemies: ENEMIES });

  const relaxed = withDemoTenFloorCandidate(
    DEMO10_PRESSURE_RELAXATION_CANDIDATE,
    catalog,
    () => {
      assertDemoTenFloorSolverLocks(locks, { floors: FLOORS, enemies: ENEMIES });
      return certify();
    }
  );
  assertDemoTenFloorSolverLocks(locks, { floors: FLOORS, enemies: ENEMIES });

  return {
    model: 'demo-10f-frozen-topology-pressure-profile-v1',
    relaxationCandidate: [...DEMO10_PRESSURE_RELAXATION_CANDIDATE.mutationIds],
    pressured: compact(pressured),
    relaxed: compact(relaxed),
    replayableWinReduction: relaxed.replayableWins === 0
      ? null
      : 1 - pressured.replayableWins / relaxed.replayableWins,
    hardCandidateReduction: relaxed.hardCandidates === 0
      ? null
      : 1 - pressured.hardCandidates / relaxed.hardCandidates
  };
}
