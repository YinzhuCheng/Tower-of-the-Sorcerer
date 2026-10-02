import { replayTowerStepSkeletonToState } from '../solver/replay.js';
import { solve } from '../solver/search.js';

export const DEMO20_MILESTONES = Object.freeze([
  Object.freeze({ id: 'f15-arrival', floorIndex: 14, label: '抵达 F15 转换点' }),
  Object.freeze({ id: 'f18-arrival', floorIndex: 17, label: '抵达 F18 终局前段' }),
  Object.freeze({ id: 'victory', floorIndex: null, label: '击败起源核心' })
]);

function stageAdapter(baseAdapter, milestone) {
  return {
    ...baseAdapter,
    // A milestone may provide a semantic predicate (for example, "the tide
    // relic was actually claimed") instead of only a floor number.  This
    // lets the route portfolio prove the irreversible decisions in short,
    // replayed segments instead of asking one blind search to rediscover all
    // of them at the final boss.
    isGoal(state) {
      if (typeof milestone.isGoal === 'function') return milestone.isGoal(state, baseAdapter);
      // Arrival stages are proof-of-reachability checkpoints. The final stage
      // retains the real engine victory predicate.
      return milestone.floorIndex == null
        ? baseAdapter.isGoal(state)
        : state.floor >= milestone.floorIndex;
    }
  };
}

function compactStageReport(report, milestone) {
  const stageTelemetry = report.profile?.stageTelemetry ?? {};
  const deepestFloor = Object.keys(stageTelemetry).reduce((maximum, key) => {
    const match = /^f(\d+)\/c\d+$/u.exec(key);
    return Math.max(maximum, Number(match?.[1] ?? 0));
  }, 0);
  return Object.freeze({
    milestone: milestone.id,
    label: milestone.label,
    reached: report.solvable === true,
    stoppedReason: report.stoppedReason,
    expandedStates: report.expandedStates,
    generatedStates: report.generatedStates,
    prunedDominated: report.prunedDominated,
    frontierPeak: report.frontierPeak,
    certificate: report.certificate,
    // A bounded failure is not an impossibility claim.  These diagnostics
    // identify the furthest authored floor and the actual branching pressure
    // before the next *numeric-only* feasibility ray is chosen.
    deepestFloor,
    stageTelemetry,
    generatedByAction: report.profile?.generatedByAction ?? {}
  });
}

/**
 * Solves a long tower as replay-verified milestone suffixes instead of making
 * every later candidate rediscover the F1–F10 prefix. A successful stage
 * contributes primitive engine steps (including collapsed F5 shop macro
 * steps) to the next one; no synthetic state becomes a proof artifact.
 */
export function runDemoTwentyFloorMilestones({
  adapter,
  routeSteps,
  milestones = DEMO20_MILESTONES,
  maxExpanded = 30_000,
  maxGenerated = 450_000
} = {}) {
  if (!adapter) throw new Error('20F milestone solver requires an adapter.');
  if (!Array.isArray(routeSteps) || routeSteps.length === 0) {
    throw new Error('20F milestone solver requires the replayed F10 route skeleton.');
  }
  if (!Array.isArray(milestones) || milestones.length === 0) {
    throw new Error('20F milestone solver requires at least one milestone.');
  }

  let prefix = [...routeSteps];
  const stages = [];
  for (const milestone of milestones) {
    const bridge = replayTowerStepSkeletonToState(prefix, { adapter, requireGoal: false });
    if (!bridge.ok) {
      throw new Error(`20F milestone prefix cannot replay before ${milestone.id}: ${bridge.failures?.[0]?.reason ?? 'unknown failure'}`);
    }
    const report = solve({
      adapter: stageAdapter(adapter, milestone),
      initialState: bridge.state,
      mode: 'existence',
      maxExpanded,
      maxGenerated,
      solverVersion: `demo20-milestone-${milestone.id}-v1`
    });
    const stage = compactStageReport(report, milestone);
    stages.push(stage);
    if (!report.certificate) break;
    prefix = [...prefix, ...report.certificate.steps];
  }

  return Object.freeze({
    milestones: Object.freeze(stages),
    completed: stages.length === milestones.length && stages.every((stage) => stage.reached),
    routeSteps: Object.freeze(prefix)
  });
}
