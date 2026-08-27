import { collectGoalFrontier } from '../solver/goal-frontier.js';
import { replayTowerCertificateToState } from '../solver/replay.js';
import { createPreHolyStageAdapter } from '../solver/pre-holy-stage-adapter.js';

/**
 * Collect the shared F6/core5/no-Holy boundary as a structural-keyed Pareto set.
 *
 * `maxGoals` may be finite for fast seed discovery. Such a result is explicitly
 * incomplete (`coverageExact=false`) but every emitted seed is still required to
 * pass authoritative certificate replay before it can become a bridge state.
 */
export function collectPreHolyF6BoundaryFrontier({
  maxExpanded = 25_000,
  maxGenerated = 250_000,
  maxGoals = Number.POSITIVE_INFINITY
} = {}) {
  const adapter = createPreHolyStageAdapter({ stage: 'f6Entry' });
  const frontier = collectGoalFrontier({
    adapter,
    maxExpanded,
    maxGenerated,
    maxGoals,
    solverVersion: 'pre-holy-f6-boundary-v0.2-discovery'
  });

  const seeds = frontier.goals.map((goal) => {
    const replay = replayTowerCertificateToState(goal.certificate, { adapter });
    return {
      verified: replay.ok === true,
      state: replay.ok ? replay.state : null,
      resources: { ...goal.resources },
      depth: goal.depth,
      minHp: goal.minHp,
      structuralKey: goal.structuralKey,
      certificate: goal.certificate,
      replay: {
        ok: replay.ok,
        failures: replay.failures,
        final: replay.final,
        objective: replay.objective
      }
    };
  });

  const verifiedSeeds = seeds.filter((seed) => seed.verified);
  const allCertificatesVerified = seeds.every((seed) => seed.verified);

  return {
    schemaVersion: 1,
    model: 'pre-holy-f6-boundary-frontier-v0.2-discovery',
    canonicalBalance: true,
    maxExpanded,
    maxGenerated,
    maxGoals: Number.isFinite(maxGoals) ? maxGoals : null,
    hasBoundaryStates: frontier.hasGoals,
    coverageExact: frontier.coverageExact,
    stoppedReason: frontier.stoppedReason,
    allCertificatesVerified,
    seedCount: seeds.length,
    verifiedSeedCount: verifiedSeeds.length,
    seeds,
    solver: {
      expandedStates: frontier.expandedStates,
      generatedStates: frontier.generatedStates,
      prunedDominated: frontier.prunedDominated,
      stalePops: frontier.stalePops,
      structuralStates: frontier.structuralStates,
      activeSearchLabels: frontier.activeSearchLabels,
      goalStructuralStates: frontier.goalStructuralStates,
      activeGoalLabels: frontier.activeGoalLabels,
      goalFrontierPeak: frontier.goalFrontierPeak,
      profile: frontier.profile
    },
    interpretation: !frontier.hasGoals
      ? (frontier.coverageExact
          ? 'f6_core5_boundary_unreachable_exact'
          : 'f6_core5_boundary_unknown_within_budget')
      : (frontier.coverageExact && allCertificatesVerified
          ? 'f6_core5_boundary_frontier_complete_and_verified'
          : frontier.stoppedReason === 'maxGoals' && allCertificatesVerified
            ? 'f6_core5_boundary_discovery_limit_reached_with_verified_seeds'
            : 'f6_core5_boundary_seeds_verified_frontier_incomplete')
  };
}

export function summarizePreHolyF6BoundaryFrontier(report) {
  return {
    schemaVersion: report.schemaVersion,
    model: report.model,
    canonicalBalance: report.canonicalBalance,
    maxExpanded: report.maxExpanded,
    maxGenerated: report.maxGenerated,
    maxGoals: report.maxGoals,
    hasBoundaryStates: report.hasBoundaryStates,
    coverageExact: report.coverageExact,
    stoppedReason: report.stoppedReason,
    allCertificatesVerified: report.allCertificatesVerified,
    seedCount: report.seedCount,
    verifiedSeedCount: report.verifiedSeedCount,
    solver: report.solver,
    interpretation: report.interpretation,
    seeds: report.seeds.map((seed) => ({
      verified: seed.verified,
      resources: seed.resources,
      depth: seed.depth,
      minHp: seed.minHp,
      certificateHash: seed.certificate?.certificateHash ?? null,
      certificateSteps: seed.certificate?.steps?.length ?? 0,
      final: seed.replay?.final ?? null,
      replayFailures: seed.replay?.failures ?? []
    }))
  };
}
