import { replayTowerStepSkeletonToState } from '../solver/replay.js';
import { solve } from '../solver/search.js';
import { createDemoTwentyFloorContinuationAdapter } from './demo-20-floor-continuation-adapter.js';
import {
  assertDemoTwentyFloorSolverLocks,
  captureDemoTwentyFloorSolverLocks,
  DEMO20_SOLVER_TUNING_PROFILE
} from './demo-20-floor-solver-profile.js';
import {
  createDemoTwentyFloorMutationCatalog,
  demoTwentyFloorCandidateKey,
  scoreDemoTwentyFloorPruningCandidate,
  withDemoTwentyFloorCandidate
} from './demo-20-floor-mutations.js';

function deepestFloor(stageTelemetry = {}) {
  return Object.keys(stageTelemetry).reduce((maximum, key) => {
    const match = /^f(\d+)\/c\d+$/u.exec(key);
    return Math.max(maximum, Number(match?.[1] ?? 0));
  }, 0);
}

function compactReport(report) {
  return Object.freeze({
    solvable: report.solvable,
    exact: report.exact,
    stoppedReason: report.stoppedReason,
    expandedStates: report.expandedStates,
    generatedStates: report.generatedStates,
    prunedDominated: report.prunedDominated,
    prunedBound: report.prunedBound,
    frontierPeak: report.frontierPeak,
    queuePeak: report.profile.queuePeak,
    maxDepth: report.profile.maxDepth,
    deepestFloor: deepestFloor(report.profile.stageTelemetry),
    stages: report.profile.stageTelemetry
  });
}

/**
 * Replays the frozen first-act witness against the actual 20F runtime and
 * returns the exact, compact F10-to-F11 bridge.  No hand-assembled stats or
 * fake state is accepted here.
 */
export function createDemoTwentyFloorBridge({ routeSteps, adapter }) {
  if (!Array.isArray(routeSteps) || routeSteps.length === 0) {
    throw new Error('20F mutation scout requires a non-empty replayed F10 route skeleton.');
  }
  const bridge = replayTowerStepSkeletonToState(routeSteps, { adapter, requireGoal: false });
  if (!bridge.ok || bridge.goal || bridge.final.floor !== 9 || !bridge.final.magic?.unlocked) {
    throw new Error(`20F transition witness is not a valid post-core F10 bridge: ${bridge.failures?.[0]?.reason ?? 'unexpected final state'}`);
  }
  return Object.freeze({
    state: bridge.state,
    final: Object.freeze({ ...bridge.final, magic: { ...bridge.final.magic } }),
    steps: routeSteps.length
  });
}

/**
 * Cheap bounded pass before any expensive proof run.  Numeric candidates are
 * applied reversibly, locks are checked before their search, and the result is
 * telemetry only: no candidate is promoted to production from this function.
 */
export function runDemoTwentyFloorMutationScout({
  adapter,
  routeSteps,
  candidates = [{ mutationIds: [] }],
  catalog = null,
  locks = null,
  dependencies = {},
  maxExpanded = DEMO20_SOLVER_TUNING_PROFILE.scoutExpansionBudget,
  maxGenerated = 45_000
} = {}) {
  if (!adapter) throw new Error('20F mutation scout requires a base adapter.');
  if (!Number.isInteger(maxExpanded) || maxExpanded <= 0) throw new Error('20F scout maxExpanded must be positive.');
  if (!Number.isInteger(maxGenerated) || maxGenerated <= 0) throw new Error('20F scout maxGenerated must be positive.');

  const mutationCatalog = catalog ?? createDemoTwentyFloorMutationCatalog(dependencies);
  const lockSnapshot = locks ?? captureDemoTwentyFloorSolverLocks(dependencies);
  assertDemoTwentyFloorSolverLocks(lockSnapshot, dependencies);
  const bridge = createDemoTwentyFloorBridge({ routeSteps, adapter });
  const continuationAdapter = createDemoTwentyFloorContinuationAdapter(adapter);
  const normalizedCandidates = candidates.map((candidate) => ({ mutationIds: [...(candidate?.mutationIds ?? [])].sort() }));

  const reports = normalizedCandidates.map((candidate) => {
    const pruning = scoreDemoTwentyFloorPruningCandidate(candidate, mutationCatalog);
    const report = withDemoTwentyFloorCandidate(candidate, mutationCatalog, () => {
      const result = solve({
        adapter: continuationAdapter,
        initialState: bridge.state,
        mode: 'existence',
        maxExpanded,
        maxGenerated,
        solverVersion: 'demo20-staged-mutation-scout-v1'
      });
      return compactReport(result);
    }, { ...dependencies, locks: lockSnapshot });
    return Object.freeze({
      key: demoTwentyFloorCandidateKey(candidate),
      mutationIds: Object.freeze([...candidate.mutationIds]),
      pruning,
      report
    });
  });

  assertDemoTwentyFloorSolverLocks(lockSnapshot, dependencies);
  return Object.freeze({
    profileId: DEMO20_SOLVER_TUNING_PROFILE.id,
    policy: continuationAdapter.continuationPolicy,
    bridge,
    maxExpanded,
    maxGenerated,
    reports: Object.freeze(reports)
  });
}
