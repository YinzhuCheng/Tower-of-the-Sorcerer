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
 * Prove the shared no-Holy prefix in stages and then branch into delayed Holy
 * policy continuations.
 *
 * Proof chain in v0.4:
 *
 *   F6/core5 boundary
 *     -> preBoss (astralBoss is a legal combat action)
 *     -> core6 (boss defeated, still no Holy)
 *     -> policy-specific continuation
 *
 * Separating preBoss from core6 prevents resource preparation/shop search from
 * being conflated with the short boss transition itself. Every bridge is rebuilt
 * only from an authoritative replayed certificate state.
 *
 * Boundary discovery and continuation scheduling remain separate. The scheduler
 * may reorder a bounded attempt set but may not delete frontier states or
 * strengthen an exact-infeasibility claim.
 */
export function proveDelayedHolyPoliciesStaged({
  policies = DELAYED_POLICIES,
  boundaryMaxExpanded = 25_000,
  boundaryMaxGenerated = 250_000,
  boundaryDiscoveryGoals = 512,
  maxBoundarySeeds = 64,
  preBossMaxExpanded = 8_000,
  preBossMaxGenerated = 80_000,
  bossMaxExpanded = 128,
  bossMaxGenerated = 2_000,
  policyMaxExpanded = 15_000,
  policyMaxGenerated = 150_000,
  // Backward-compatible aliases for callers from v0.3. If present they become
  // the preBoss preparation budget, because that is the work formerly embedded
  // in the direct core6 search.
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

  if (Number.isFinite(core6MaxExpanded)) preBossMaxExpanded = core6MaxExpanded;
  if (Number.isFinite(core6MaxGenerated)) preBossMaxGenerated = core6MaxGenerated;
  const effectiveBoundaryDiscoveryGoals = Math.max(boundaryDiscoveryGoals, maxBoundarySeeds);

  const boundary = collectPreHolyF6BoundaryFrontier({
    maxExpanded: boundaryMaxExpanded,
    maxGenerated: boundaryMaxGenerated,
    maxGoals: effectiveBoundaryDiscoveryGoals
  });
  const preBossAdapter = createPreHolyStageAdapter({ stage: 'preBoss' });
  const core6Adapter = createPreHolyStageAdapter({ stage: 'core6' });
  const verifiedSeeds = boundary.seeds.filter((seed) => seed.verified && seed.state);
  const seedSchedule = schedulePreHolyBoundarySeeds(verifiedSeeds, {
    limit: Math.min(maxBoundarySeeds, verifiedSeeds.length || maxBoundarySeeds),
    bossId: 'astralBoss'
  });
  const scheduledSeeds = seedSchedule.scheduled;
  const attempts = [];
  let preBossBridge = null;
  let core6Bridge = null;
  let winningSeed = null;

  for (let seedIndex = 0; seedIndex < scheduledSeeds.length; seedIndex += 1) {
    const seed = scheduledSeeds[seedIndex];
    const scheduling = seedSchedule.diagnostics[seedIndex] ?? null;

    const preBossSolver = solve({
      adapter: preBossAdapter,
      initialState: seed.state,
      mode: 'existence',
      maxExpanded: preBossMaxExpanded,
      maxGenerated: preBossMaxGenerated
    });
    const preBossReplay = replayContinuation(preBossSolver.certificate, {
      adapter: preBossAdapter,
      initialState: seed.state
    });
    const preBossVerified = verifiedStageResult(preBossSolver, preBossReplay);

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
      preBoss: {
        solver: compactSolver(preBossSolver),
        replay: preBossReplay ? {
          ok: preBossReplay.ok,
          failures: preBossReplay.failures,
          final: preBossReplay.final
        } : null,
        verified: Boolean(preBossVerified)
      },
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
      preBossBridge = preBossReplay.state;
      core6Bridge = bossReplay.state;
      winningSeed = seed;
      break;
    }
  }

  const attemptedAllVerifiedSeeds = scheduledSeeds.length === verifiedSeeds.length;
  const allAttemptsExactUnsat = attempts.length === verifiedSeeds.length
    && attempts.every((attempt) => {
      const pre = attempt.preBoss?.solver;
      if (pre?.solvable === false && pre.exact === true) return true;
      const boss = attempt.core6?.solver;
      return pre?.solvable === true
        && pre.exact === true
        && boss?.solvable === false
        && boss.exact === true;
    });
  const core6ExactInfeasible = !core6Bridge
    && boundary.coverageExact
    && boundary.allCertificatesVerified
    && attemptedAllVerifiedSeeds
    && allAttemptsExactUnsat;

  const reachedPreBoss = attempts.some((attempt) => attempt.preBoss?.verified);
  const preBossInterpretation = reachedPreBoss
    ? 'preboss_reached_through_verified_boundary_chain'
    : core6ExactInfeasible
      ? 'preboss_or_core6_unreachable_from_complete_boundary_frontier_exact'
      : 'preboss_reachability_unknown_after_staged_search';
  const core6Interpretation = core6Bridge
    ? 'core6_reached_through_verified_preboss_chain'
    : core6ExactInfeasible
      ? 'core6_unreachable_from_complete_boundary_frontier_exact'
      : reachedPreBoss
        ? 'preboss_reached_but_core6_bridge_not_verified'
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

      // Exact failure from one core6 bridge is not global policy infeasibility:
      // another nondominated core6 bridge may still satisfy the policy. A single
      // verified success, however, is globally sufficient as an existence proof.
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
        exact: core6ExactInfeasible,
        continuationExact: null,
        policyInfeasibleExact: core6ExactInfeasible,
        interpretation: core6ExactInfeasible
          ? 'policy_infeasible_because_core6_prefix_is_exactly_unreachable'
          : 'policy_unknown_because_core6_bridge_not_found',
        solver: null,
        replay: null
      });
    }
  }

  return {
    schemaVersion: 4,
    model: 'staged-holy-policy-proof-v0.4-preboss-bridge',
    canonicalBalance: true,
    budgets: {
      boundaryMaxExpanded,
      boundaryMaxGenerated,
      boundaryDiscoveryGoals: effectiveBoundaryDiscoveryGoals,
      maxBoundarySeeds,
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
      attemptedAllVerifiedSeeds,
      winningBoundaryCertificateHash: winningSeed?.certificate?.certificateHash ?? null,
      bridgeResources: core6Bridge ? core6Adapter.resources(core6Bridge) : null,
      attempts
    },
    policyResults
  };
}
