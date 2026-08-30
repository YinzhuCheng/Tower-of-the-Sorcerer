import { replayTowerStepSkeletonToState } from '../solver/replay.js';
import { solve } from '../solver/search.js';

/** Long deterministic towers are easier to audit as replayed milestone
 * suffixes.  The later stages keep all real resource state; only the search
 * root is reused, never synthesized. */
export const DEMO30_MILESTONES = Object.freeze([
  Object.freeze({ id: 'f15-arrival', floorIndex: 14, label: '抵达 F15 转换点' }),
  Object.freeze({ id: 'f18-arrival', floorIndex: 17, label: '抵达 F18 终局前段' }),
  Object.freeze({ id: 'f21-arrival', floorIndex: 20, label: '抵达 F21 章程台' }),
  Object.freeze({ id: 'f24-arrival', floorIndex: 23, label: '通过三条章程后的接力室入口' }),
  Object.freeze({ id: 'f25-arrival', floorIndex: 24, label: '通过三条章程的中段账本' }),
  Object.freeze({ id: 'f28-arrival', floorIndex: 27, label: '通过接力校场' }),
  Object.freeze({ id: 'victory', floorIndex: null, label: '击败勘误核心' })
]);

function stageAdapter(baseAdapter, milestone) {
  return {
    ...baseAdapter,
    isGoal(state) {
      return milestone.floorIndex == null ? baseAdapter.isGoal(state) : state.floor >= milestone.floorIndex;
    }
  };
}

function reportStage(report, milestone, initialState) {
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
    diagnostics: report.diagnostics,
    // Kept for in-process author diagnostics only.  The public validator
    // emits summaries/certificates, never this mutable search root.
    initialState,
    generatedByAction: report.profile?.generatedByAction ?? {},
    rejectedByAction: report.profile?.rejectedByAction ?? {},
    stageTelemetry: report.profile?.stageTelemetry ?? {}
  });
}

export function runDemoThirtyFloorMilestones({
  adapter,
  routeSteps,
  milestones = DEMO30_MILESTONES,
  maxExpanded = 18_000,
  maxGenerated = 360_000,
  onStage = null
} = {}) {
  if (!adapter) throw new Error('30F milestone solver requires an adapter.');
  if (!Array.isArray(routeSteps) || routeSteps.length === 0) throw new Error('30F milestone solver requires an F10 replay skeleton.');
  let prefix = [...routeSteps];
  const stages = [];
  for (const milestone of milestones) {
    const bridge = replayTowerStepSkeletonToState(prefix, { adapter, requireGoal: false });
    if (!bridge.ok) throw new Error(`30F milestone prefix cannot replay before ${milestone.id}: ${bridge.failures?.[0]?.reason ?? 'unknown failure'}`);
    const report = solve({
      adapter: stageAdapter(adapter, milestone),
      initialState: bridge.state,
      mode: 'existence',
      maxExpanded,
      maxGenerated,
      heuristic: adapter.searchHeuristic,
      solverVersion: `demo30-milestone-${milestone.id}-v1`
    });
    const stage = reportStage(report, milestone, bridge.state);
    stages.push(stage);
    onStage?.(stage);
    if (!report.certificate) break;
    prefix = [...prefix, ...report.certificate.steps];
  }
  return Object.freeze({
    milestones: Object.freeze(stages),
    completed: stages.length === milestones.length && stages.every((stage) => stage.reached),
    routeSteps: Object.freeze(prefix)
  });
}
