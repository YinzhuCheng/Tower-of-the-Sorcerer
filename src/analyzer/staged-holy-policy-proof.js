import { collectPreHolyF6BoundaryFrontier } from './pre-holy-boundary-frontier.js';
import { schedulePreHolyBoundarySeeds } from './pre-holy-seed-scheduler.js';
import { replayTowerCertificateToState } from '../solver/replay.js';
import { solve } from '../solver/search.js';
import { createHolyPolicyTowerAdapter } from '../solver/holy-policy-adapter.js';
import { createPreHolyStageAdapter } from '../solver/pre-holy-stage-adapter.js';

const DELAYED_POLICIES = ['after-core-6', 'after-core-7', 'before-final'];

function compactSolver(solver) {
  return {
    solvable: solver.solvable,
    exact: solver.exact,
    stoppedReason: solver.stoppedReason,
    expandedStates: solver.expandedStates,
    generatedStates: solver.generatedStates,
    structuralStates: solver.structuralStates,
    activeLabels: solver.activeLabels,
    certificateHash: solver.certificate?.certificateHash ?? null,
    certificateSteps: solver.certificate?.steps?.length ?? 0,
    profile: solver.profile
  };
}

function replayContinuation(certificate, { adapter, initialState }) {
  if (!certificate) return null;
  return replayTowerCertificateToState(certificate, { adapter, initialState });
}

function verifiedStageResult(solver, replay) {
  return solver.solvable === true && replay?.ok === true && replay?.state;
}

/**
 * Witness-oriented staged proof for delayed Holy policies.
 *
 * v0.5 chain:
 *
 *   F6/core5 boundary
 *     -> corridorOpen (exact zero-event path to a boss-adjacent tile)
 *     -> preBoss (boss is now a legal/winnable authoritative combat action)
 *     -> core6 (boss defeated before Holy)
 *     -> policy-specific continuation
 *
 * `corridorOpen` separates local F6 topology/event clearing from later resource
 * preparation. It is an exact property of one replayed state, not a relaxation.
 *
 * IMPORTANT proof boundary: each boundary seed continues from only the first
 * corridor witness found by existence search. Therefore failure after that
 * witness does NOT cover every possible corridor-open state for the seed. v0.5
 * may prove feasibility via one fully replayed chain, but it intentionally does
 * not claim global exact infeasibility from failed staged attempts.
 */
export function proveDelayedHolyPoliciesStaged({
  policies = DELAYED_POLICIES,
  boundaryMaxExpanded = 25_000,
  boundaryMaxGenerated = 250_000,
  boundaryDiscoveryGoals = 512,
  maxBoundarySeeds = 64,
  corridorMaxExpanded = 1_500,
  corridorMaxGenerated = 15_000,
  preBossMaxExpanded = 2_500,
  preBossMaxGenerated = 25_000,
  bossMaxExpanded = 128,
  bossMaxGenerated = 2_000,
  policyMaxExpanded = 15_000,
  policyMaxGenerated = 150_000,
  core6MaxExpanded = null,
  core6MaxGenerated = null
} = {}) {
  const unknown = policies.filter((policy) => !DELAYED_POLICIES.includes(policy));
  if (unknown.length) throw new Error(`Unsupported delayed Holy policies: ${unknown.join(', ')}`);
  if (!Number.isInteger(maxBoundarySeeds) || maxBoundarySeeds < 1) {
    throw new Error('maxBoundarySeeds must be a positive integer.');
  }
  if (!Number.isInteger(boundaryDiscoveryGoals) || boundaryDiscoveryGoals < 1) {
    throw new Error('boundaryDiscoveryGoals must be a positive integer.');
  }

  if (Number.isFinite(core6MaxExpanded)) {
    const total = Math.max(2, Math.floor(core6MaxExpanded));
    corridorMaxExpanded = Math.max(1, Math.floor(total * 0.375));
    preBossMaxExpanded = Math.max(1, total - corridorMaxExpanded);
  }
  if (Number.isFinite(core6MaxGenerated)) {
    const total = Math.max(2, Math.floor(core6MaxGenerated));
    corridorMaxGenerated = Math.max(1, Math.floor(total * 0.375));
    preBossMaxGenerated = Math.max(1, total - corridorMaxGenerated);
  }
  const effectiveBoundaryDiscoveryGoals = Math.max(boundaryDiscoveryGoals, maxBoundarySeeds);

  const boundary = collectPreHolyF6BoundaryFrontier({
    maxExpanded: boundaryMaxExpanded,
    maxGenerated: boundaryMaxGenerated,
    maxGoals: effectiveBoundaryDiscoveryGoals
  });
  const corridorAdapter = createPreHolyStageAdapter({ stage: 'corridorOpen' });
  const preBossAdapter = createPreHolyStageAdapter({ stage: 'preBoss' });
  const core6Adapter = createPreHolyStageAdapter({ stage: 'core6' });
  const verifiedSeeds = boundary.seeds.filter((seed) => seed.verified && seed.state);
  const seedSchedule = schedulePreHolyBoundarySeeds(verifiedSeeds, {
    limit: Math.min(maxBoundarySeeds, verifiedSeeds.length || maxBoundarySeeds),
    bossId: 'astralBoss'
  });
  const scheduledSeeds = seedSchedule.scheduled;
  const attempts = [];
  let corridorBridge = null;
  let preBossBridge = null;
  let core6Bridge = null;
  let winningSeed = null;

  for (let seedIndex = 0; seedIndex < scheduledSeeds.length; seedIndex += 1) {
    const seed = scheduledSeeds[seedIndex];
    const scheduling = seedSchedule.diagnostics[seedIndex] ?? null;

    const corridorSolver = solve({
      adapter: corridorAdapter,
      initialState: seed.state,
      mode: 'existence',
      maxExpanded: corridorMaxExpanded,
      maxGenerated: corridorMaxGenerated
    });
    const corridorReplay = replayContinuation(corridorSolver.certificate, {
      adapter: corridorAdapter,
      initialState: seed.state
    });
    const corridorVerified = verifiedStageResult(corridorSolver, corridorReplay);

    let preBossSolver = null;
    let preBossReplay = null;
    let preBossVerified = false;
    if (corridorVerified) {
      preBossSolver = solve({
        adapter: preBossAdapter,
        initialState: corridorReplay.state,
        mode: 'existence',
        maxExpanded: preBossMaxExpanded,
        maxGenerated: preBossMaxGenerated
      });
      preBossReplay = replayContinuation(preBossSolver.certificate, {
        adapter: preBossAdapter,
        initialState: corridorReplay.state
      });
      preBossVerified = Boolean(verifiedStageResult(preBossSolver, preBossReplay));
    }

    let bossSolver = null;
    let bossReplay = null;
    let bossVerified = false;
    if (preBossVerified) {
      bossSolver = solve({
        adapter: core6Adapter,
        initialState: preBossReplay.state,
        mode: 'existence',
        maxExpanded: bossMaxExpanded,
        maxGenerated: bossMaxGenerated
      });
      bossReplay = replayContinuation(bossSolver.certificate, {
        adapter: core6Adapter,
        initialState: preBossReplay.state
      });
      bossVerified = Boolean(verifiedStageResult(bossSolver, bossReplay));
    }

    attempts.push({
      boundaryCertificateHash: seed.certificate?.certificateHash ?? null,
      boundaryResources: { ...seed.resources },
      boundaryShopPurchases: seed.state.shopPurchases ?? 0,
      scheduling,
      corridor: {
        solver: compactSolver(corridorSolver),
        replay: corridorReplay ? {
          ok: corridorReplay.ok,
          failures: corridorReplay.failures,
          final: corridorReplay.final
        } : null,
        verified: Boolean(corridorVerified)
      },
      preBoss: preBossSolver ? {
        solver: compactSolver(preBossSolver),
        replay: preBossReplay ? {
          ok: preBossReplay.ok,
          failures: preBossReplay.failures,
          final: preBossReplay.final
        } : null,
        verified: preBossVerified
      } : null,
      core6: bossSolver ? {
        solver: compactSolver(bossSolver),
        replay: bossReplay ? {
          ok: bossReplay.ok,
          failures: bossReplay.failures,
          final: bossReplay.final
        } : null,
        verified: bossVerified
      } : null,
      verified: bossVerified
    });

    if (bossVerified) {
      corridorBridge = corridorReplay.state;
      preBossBridge = preBossReplay.state;
      core6Bridge = bossReplay.state;
      winningSeed = seed;
      break;
    }
  }

  const reachedCorridor = attempts.some((attempt) => attempt.corridor?.verified);
  const reachedPreBoss = attempts.some((attempt) => attempt.preBoss?.verified);
  const core6ExactInfeasible = false;

  const corridorInterpretation = reachedCorridor
    ? 'boss_corridor_opened_through_verified_boundary_chain'
    : 'boss_corridor_reachability_unknown_after_staged_search';
  const preBossInterpretation = reachedPreBoss
    ? 'preboss_reached_through_verified_corridor_chain'
    : reachedCorridor
      ? 'corridor_opened_but_preboss_resource_readiness_unknown'
      : 'preboss_unknown_because_corridor_bridge_not_found';
  const core6Interpretation = core6Bridge
    ? 'core6_reached_through_verified_preboss_chain'
    : reachedPreBoss
      ? 'preboss_reached_but_core6_bridge_not_verified'
      : reachedCorridor
        ? 'corridor_opened_but_core6_resource_preparation_unknown'
        : 'core6_reachability_unknown_after_staged_search';

  const policyResults = [];
  if (core6Bridge) {
    for (const holyPolicy of policies) {
      const adapter = createHolyPolicyTowerAdapter({ holyPolicy });
      const solver = solve({
        adapter,
        initialState: core6Bridge,
        mode: 'existence',
        maxExpanded: policyMaxExpanded,
        maxGenerated: policyMaxGenerated
      });
      const replay = replayContinuation(solver.certificate, { adapter, initialState: core6Bridge });
      const feasible = solver.solvable === true && replay?.ok === true;
      policyResults.push({
        holyPolicy,
        feasible,
        exact: feasible,
        continuationExact: solver.exact,
        policyInfeasibleExact: false,
        interpretation: feasible
          ? 'policy_feasible_via_verified_staged_chain'
          : (solver.solvable === false && solver.exact
              ? 'policy_exactly_unreachable_from_this_core6_bridge_but_global_status_unknown'
              : 'policy_continuation_unknown_within_budget'),
        solver: compactSolver(solver),
        replay: replay ? {
          ok: replay.ok,
          failures: replay.failures,
          final: replay.final,
          objective: replay.objective
        } : null
      });
    }
  } else {
    for (const holyPolicy of policies) {
      policyResults.push({
        holyPolicy,
        feasible: false,
        exact: false,
        continuationExact: null,
        policyInfeasibleExact: false,
        interpretation: 'policy_unknown_because_core6_bridge_not_found',
        solver: null,
        replay: null
      });
    }
  }

  return {
    schemaVersion: 5,
    model: 'staged-holy-policy-proof-v0.5-corridor-preboss-bridge',
    canonicalBalance: true,
    proofCapability: {
      provesExistence: true,
      provesGlobalInfeasibility: false,
      reason: 'only_the_first_corridor_witness_per_boundary_seed_is_continued'
    },
    budgets: {
      boundaryMaxExpanded,
      boundaryMaxGenerated,
      boundaryDiscoveryGoals: effectiveBoundaryDiscoveryGoals,
      maxBoundarySeeds,
      corridorMaxExpanded,
      corridorMaxGenerated,
      preBossMaxExpanded,
      preBossMaxGenerated,
      bossMaxExpanded,
      bossMaxGenerated,
      policyMaxExpanded,
      policyMaxGenerated
    },
    boundary: {
      hasBoundaryStates: boundary.hasBoundaryStates,
      coverageExact: boundary.coverageExact,
      allCertificatesVerified: boundary.allCertificatesVerified,
      seedCount: boundary.seedCount,
      verifiedSeedCount: boundary.verifiedSeedCount,
      stoppedReason: boundary.stoppedReason,
      solver: boundary.solver,
      interpretation: boundary.interpretation
    },
    seedSchedule: {
      scheduler: seedSchedule.scheduler,
      candidateCount: seedSchedule.candidateCount,
      scheduledCount: seedSchedule.scheduledCount,
      diagnostics: seedSchedule.diagnostics
    },
    corridor: {
      reached: reachedCorridor,
      interpretation: corridorInterpretation,
      winningBoundaryCertificateHash: winningSeed?.certificate?.certificateHash ?? null,
      bridgeResources: corridorBridge ? corridorAdapter.resources(corridorBridge) : null
    },
    preBoss: {
      reached: reachedPreBoss,
      interpretation: preBossInterpretation,
      winningBoundaryCertificateHash: winningSeed?.certificate?.certificateHash ?? null,
      bridgeResources: preBossBridge ? preBossAdapter.resources(preBossBridge) : null
    },
    core6: {
      reached: Boolean(core6Bridge),
      exactInfeasible: core6ExactInfeasible,
      interpretation: core6Interpretation,
      verifiedSeedCount: verifiedSeeds.length,
      scheduledSeedCount: scheduledSeeds.length,
      winningBoundaryCertificateHash: winningSeed?.certificate?.certificateHash ?? null,
      bridgeResources: core6Bridge ? core6Adapter.resources(core6Bridge) : null,
      attempts
    },
    policyResults
  };
}
