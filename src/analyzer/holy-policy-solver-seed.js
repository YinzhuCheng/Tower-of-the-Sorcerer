import { replayTowerCertificate } from '../solver/replay.js';
import { solve } from '../solver/search.js';
import {
  createHolyPolicyTowerAdapter,
  extractHolyStepFromSolverCertificate,
  extractShopPlanFromSolverCertificate
} from '../solver/holy-policy-adapter.js';
import { runGreedyShopStrategy } from '../solver/greedy-strategy.js';
import { PROMOTED_PURCHASE_PLANS } from '../solver/tower-incumbent.js';

function fallbackCycle() {
  const promoted = PROMOTED_PURCHASE_PLANS[0];
  return [...(promoted?.cycle ?? ['def', 'atk', 'hp'])];
}

function compactHolyStep(step) {
  if (!step) return null;
  return {
    eventId: step.eventId,
    floorBefore: step.floorBefore,
    resourcesBefore: step.resourcesBefore ? { ...step.resourcesBefore } : null,
    resourcesAfter: step.resourcesAfter ? { ...step.resourcesAfter } : null
  };
}

/**
 * Uses constrained exact existence search as a stronger feasibility oracle for
 * one Holy policy. Search certificates are independently replayed through the
 * authoritative engine before their objective is exposed as policy evidence.
 *
 * The certificate's shop option sequence is also replayed through the
 * deterministic runner as a possible purchase-local-search seed. Certificate
 * feasibility and greedy shop-plan replay are intentionally separate claims:
 * the Solver certificate may rely on event ordering that shop choices alone do
 * not encode.
 */
export function findHolyPolicySolverSeed({
  holyPolicy,
  maxExpanded = 25_000,
  maxGenerated = 250_000
} = {}) {
  const adapter = createHolyPolicyTowerAdapter({ holyPolicy });
  const solverReport = solve({
    adapter,
    mode: 'existence',
    maxExpanded,
    maxGenerated
  });
  const certificate = solverReport.certificate;
  const shopPlan = extractShopPlanFromSolverCertificate(certificate);
  const holyStep = extractHolyStepFromSolverCertificate(certificate);

  let authoritativeReplay = null;
  let deterministicReplay = null;
  if (solverReport.solvable === true && certificate) {
    authoritativeReplay = replayTowerCertificate(certificate, { adapter });
    deterministicReplay = runGreedyShopStrategy({
      shopCycle: fallbackCycle(),
      shopPlan,
      holyPolicy
    });
  }

  const replayVerified = authoritativeReplay?.ok === true;
  const certificateObjective = replayVerified
    ? authoritativeReplay.objective
    : null;
  const policyFeasible = solverReport.solvable === true && replayVerified;

  return {
    schemaVersion: 2,
    model: 'holy-policy-solver-seed-v0.2-authoritative-replay',
    holyPolicy,
    policyFeasible,
    policyInfeasibleExact: solverReport.solvable === false && solverReport.exact === true,
    exact: solverReport.exact,
    stoppedReason: solverReport.stoppedReason,
    solver: {
      solvable: solverReport.solvable,
      exact: solverReport.exact,
      expandedStates: solverReport.expandedStates,
      generatedStates: solverReport.generatedStates,
      certificateHash: certificate?.certificateHash ?? null,
      objective: solverReport.objective
    },
    authoritativeReplay: authoritativeReplay ? {
      ok: authoritativeReplay.ok,
      failures: authoritativeReplay.failures,
      objective: authoritativeReplay.objective,
      final: authoritativeReplay.final
    } : null,
    certifiedTerminalHpLowerBound: Number.isFinite(certificateObjective)
      ? certificateObjective
      : null,
    certificate: certificate ? {
      steps: certificate.steps.length,
      shopPurchases: shopPlan.length,
      holyStep: compactHolyStep(holyStep),
      final: certificate.final
    } : null,
    shopPlan,
    deterministicReplay: deterministicReplay ? {
      solvable: deterministicReplay.solvable,
      failure: deterministicReplay.failure,
      terminalHp: deterministicReplay.solvable ? deterministicReplay.final.hp : null,
      floor: deterministicReplay.floor,
      cores: deterministicReplay.cores,
      purchases: deterministicReplay.purchases,
      holyAcquisition: deterministicReplay.holyAcquisition,
      purchaseCounts: { ...deterministicReplay.purchaseCounts }
    } : null,
    seed: policyFeasible && deterministicReplay?.solvable ? {
      id: `solver-certificate-${holyPolicy}`,
      cycle: fallbackCycle(),
      shopPlan: [...shopPlan],
      holyPolicy,
      result: deterministicReplay
    } : null,
    interpretation: solverReport.solvable === true
      ? !replayVerified
        ? 'solver_goal_found_but_authoritative_certificate_replay_failed'
        : deterministicReplay?.solvable
          ? 'policy_feasible_and_shop_plan_replays_in_deterministic_runner'
          : 'policy_feasible_but_certificate_requires_route_order_not_encoded_by_shop_plan'
      : solverReport.exact
        ? 'policy_infeasible_under_constrained_solver_rules'
        : 'policy_feasibility_unknown_within_solver_budget'
  };
}

export function findHolyPolicySolverSeeds({
  holyPolicies,
  maxExpanded = 25_000,
  maxGenerated = 250_000
} = {}) {
  if (!Array.isArray(holyPolicies) || holyPolicies.length === 0) {
    throw new Error('Holy policy Solver seed search requires at least one policy.');
  }
  return holyPolicies.map((holyPolicy) => findHolyPolicySolverSeed({
    holyPolicy,
    maxExpanded,
    maxGenerated
  }));
}
