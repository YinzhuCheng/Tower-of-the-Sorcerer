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
 * Uses exact existence search as a stronger feasibility oracle for one Holy
 * policy. If a goal certificate is found, its shop option sequence is replayed
 * through the deterministic runner as a possible local-search seed.
 *
 * A Solver proof of policy feasibility and a successful deterministic replay are
 * intentionally reported separately: the certificate may use event ordering the
 * greedy runner cannot currently express with shop choices alone.
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

  let deterministicReplay = null;
  if (solverReport.solvable === true && certificate) {
    deterministicReplay = runGreedyShopStrategy({
      shopCycle: fallbackCycle(),
      shopPlan,
      holyPolicy
    });
  }

  return {
    schemaVersion: 1,
    model: 'holy-policy-solver-seed-v0.1',
    holyPolicy,
    policyFeasible: solverReport.solvable === true,
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
    seed: deterministicReplay?.solvable ? {
      id: `solver-certificate-${holyPolicy}`,
      cycle: fallbackCycle(),
      shopPlan: [...shopPlan],
      holyPolicy,
      result: deterministicReplay
    } : null,
    interpretation: solverReport.solvable === true
      ? deterministicReplay?.solvable
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
