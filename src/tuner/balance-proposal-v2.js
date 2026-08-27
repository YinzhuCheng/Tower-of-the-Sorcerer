import { BALANCE_PROMOTION_RULES } from './balance-proposal.js';

function finite(value) {
  return Number.isFinite(value);
}

export const BALANCE_REVIEW_RULES_V2 = Object.freeze({
  ...BALANCE_PROMOTION_RULES,
  requirePlayerOneOptimal: true
});

export function evaluateBalanceReviewGate(report, rules = BALANCE_REVIEW_RULES_V2) {
  const margin = report?.route?.minNormalizedHpMargin;
  const checks = {
    candidatePresent: Boolean(report),
    adaptiveHardConstraints: report?.acceptedHardConstraints === true,
    converged: rules.requireConvergence ? report?.converged === true : true,
    playerOneOptimal: rules.requirePlayerOneOptimal
      ? report?.counterfactuals?.improvedMutationCount === 0
      : true,
    adaptedRouteSolvable: report?.route?.solvable === true,
    exactExistence: rules.requireExactExistence
      ? report?.solver?.solvable === true && report?.solver?.exact === true
      : report?.solver?.solvable === true,
    pressureTarget: finite(margin)
      && margin >= rules.pressureBand[0]
      && margin <= rules.pressureBand[1],
    recovery: finite(report?.counterfactuals?.recoveryRate)
      && report.counterfactuals.recoveryRate >= rules.minimumRecoveryRate,
    catastrophic: finite(report?.counterfactuals?.catastrophicRate)
      && report.counterfactuals.catastrophicRate <= rules.maximumCatastrophicRate,
    numericEdits: finite(report?.hpReward) && report.hpReward > 0
      && finite(report?.magicPower) && report.magicPower > 0
  };
  const failures = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);
  return { passed: failures.length === 0, checks, failures, rules };
}

export function createBalanceReviewProposal({ report, candidateScore = null } = {}) {
  const gate = evaluateBalanceReviewGate(report);
  return {
    schemaVersion: 2,
    model: 'balance-review-proposal-v0.2',
    status: gate.passed ? 'ready_for_review' : 'blocked',
    candidateScore: finite(candidateScore) ? candidateScore : null,
    gate,
    edits: gate.passed ? [
      { target: 'shop', id: 'hp', field: 'effect.hp', value: report.hpReward },
      { target: 'shop', id: 'hp', field: 'effect.maxHp', value: report.hpReward },
      { target: 'enemy', id: 'voidCore', field: 'magicPower', value: report.magicPower }
    ] : [],
    evidence: report ? {
      hpReward: report.hpReward,
      magicPower: report.magicPower,
      converged: report.converged,
      playerOneOptimal: report.counterfactuals?.improvedMutationCount === 0,
      route: report.route,
      solver: report.solver,
      counterfactuals: report.counterfactuals
    } : null,
    productionWriteAllowed: false,
    productionBlockReason: 'Global/near-optimal exploit coverage is not yet strong enough for unattended production writes.'
  };
}
