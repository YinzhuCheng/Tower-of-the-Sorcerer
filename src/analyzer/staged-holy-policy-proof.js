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

/**
 * Prove the shared no-Holy prefix in stages and then branch into delayed Holy
 * policy continuations.
 *
 * Boundary discovery and continuation scheduling are deliberately separate:
 * `boundaryDiscoveryGoals` controls how many replay-verified F6/core5 entries we
 * are willing to discover, while `maxBoundarySeeds` controls how many expensive
 * core6 continuations are attempted. The scheduler may reorder the discovered
 * seeds using boss-affordability heuristics, but it never deletes seeds from the
 * proof frontier and therefore cannot strengthen an infeasibility claim.
 *
 * A finite discovery pool is still discovery mode: one verified chain is enough
 * to prove feasibility, while exact infeasibility continues to require complete
 * boundary coverage plus exact failure from every verified boundary seed.
 */
export function proveDelayedHolyPoliciesStaged({
  policies = DELAYED_POLICIES,
  boundaryMaxExpanded = 25_000,
  boundaryMaxGenerated = 250_000,
  boundaryDiscoveryGoals = 512,
  maxBoundarySeeds = 64,
  core6MaxExpanded = 8_000,
  core6MaxGenerated = 80_000,
  policyMaxExpanded = 15_000,
  policyMaxGenerated = 150_000
} = {}) {
  const unknown = policies.filter((policy) => !DELAYED_POLICIES.includes(policy));
  if (unknown.length) throw new Error(`Unsupported delayed Holy policies: ${unknown.join(', ')}`);
  if (!Number.isInteger(maxBoundarySeeds) || maxBoundarySeeds < 1) {
    throw new Error('maxBoundarySeeds must be a positive integer.');
  }
  if (!Number.isInteger(boundaryDiscoveryGoals) || boundaryDiscoveryGoals < 1) {
    throw new Error('boundaryDiscoveryGoals must be a positive integer.');
  }
  const effectiveBoundaryDiscoveryGoals = Math.max(boundaryDiscoveryGoals, maxBoundarySeeds);

  const boundary = collectPreHolyF6BoundaryFrontier({
    maxExpanded: boundaryMaxExpanded,
    maxGenerated: boundaryMaxGenerated,
    maxGoals: effectiveBoundaryDiscoveryGoals
  });
  const coreAdapter = createPreHolyStageAdapter({ stage: 'core6' });
  const verifiedSeeds = boundary.seeds.filter((seed) => seed.verified && seed.state);
  const seedSchedule = schedulePreHolyBoundarySeeds(verifiedSeeds, {
    limit: Math.min(maxBoundarySeeds, verifiedSeeds.length || maxBoundarySeeds),
    bossId: 'astralBoss'
  });
  const scheduledSeeds = seedSchedule.scheduled;
  const coreAttempts = [];
  let core6Bridge = null;
  let winningSeed = null;

  for (let seedIndex = 0; seedIndex < scheduledSeeds.length; seedIndex += 1) {
    const seed = scheduledSeeds[seedIndex];
    const scheduling = seedSchedule.diagnostics[seedIndex] ?? null;
    const solver = solve({
      adapter: coreAdapter,
      initialState: seed.state,
      mode: 'existence',
      maxExpanded: core6MaxExpanded,
      maxGenerated: core6MaxGenerated
    });
    const replay = replayContinuation(solver.certificate, {
      adapter: coreAdapter,
      initialState: seed.state
    });
    const verified = solver.solvable === true && replay?.ok === true && replay?.state;
    coreAttempts.push({
      boundaryCertificateHash: seed.certificate?.certificateHash ?? null,
      boundaryResources: { ...seed.resources },
      boundaryShopPurchases: seed.state.shopPurchases ?? 0,
      scheduling,
      solver: compactSolver(solver),
      replay: replay ? { ok: replay.ok, failures: replay.failures, final: replay.final } : null,
      verified: Boolean(verified)
    });
    if (verified) {
      core6Bridge = replay.state;
      winningSeed = seed;
      break;
    }
  }

  const attemptedAllVerifiedSeeds = scheduledSeeds.length === verifiedSeeds.length;
  const allCoreAttemptsExactUnsat = coreAttempts.length === verifiedSeeds.length
    && coreAttempts.every((attempt) => attempt.solver.solvable === false && attempt.solver.exact === true);
  const core6ExactInfeasible = !core6Bridge
    && boundary.coverageExact
    && boundary.allCertificatesVerified
    && attemptedAllVerifiedSeeds
    && allCoreAttemptsExactUnsat;

  const core6Interpretation = core6Bridge
    ? 'core6_reached_through_verified_boundary_chain'
    : core6ExactInfeasible
      ? 'core6_unreachable_from_complete_boundary_frontier_exact'
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
    schemaVersion: 3,
    model: 'staged-holy-policy-proof-v0.3-seed-scheduling',
    canonicalBalance: true,
    budgets: {
      boundaryMaxExpanded,
      boundaryMaxGenerated,
      boundaryDiscoveryGoals: effectiveBoundaryDiscoveryGoals,
      maxBoundarySeeds,
      core6MaxExpanded,
      core6MaxGenerated,
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
    core6: {
      reached: Boolean(core6Bridge),
      exactInfeasible: core6ExactInfeasible,
      interpretation: core6Interpretation,
      verifiedSeedCount: verifiedSeeds.length,
      scheduledSeedCount: scheduledSeeds.length,
      attemptedAllVerifiedSeeds,
      winningBoundaryCertificateHash: winningSeed?.certificate?.certificateHash ?? null,
      attempts: coreAttempts
    },
    policyResults
  };
}
