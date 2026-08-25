import { collectGoalFrontier } from '../solver/goal-frontier.js';
import { replayTowerCertificateToState } from '../solver/replay.js';
import { createPreHolyStageAdapter } from '../solver/pre-holy-stage-adapter.js';

/**
 * Collect the shared F6/core5/no-Holy boundary as a structural-keyed Pareto set.
 *
 * Every returned continuation seed is reconstructed by authoritative certificate
 * replay. Collector-resident states are never trusted directly as bridge states.
 */
export function collectPreHolyF6BoundaryFrontier({
  maxExpanded = 25_000,
  maxGenerated = 250_000
} = {}) {
  const adapter = createPreHolyStageAdapter({ stage: 'f6Entry' });
  const frontier = collectGoalFrontier({
    adapter,
    maxExpanded,
    maxGenerated,
    solverVersion: 'pre-holy-f6-boundary-v0.1'
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
    model: 'pre-holy-f6-boundary-frontier-v0.1',
    canonicalBalance: true,
    maxExpanded,
    maxGenerated,
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
