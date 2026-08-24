import { BALANCE_REVIEW_RULES_V2 } from './balance-proposal-v2.js';

function finite(value) {
  return Number.isFinite(value);
}

function reportMargin(report) {
  if (finite(report?.best?.margin)) return report.best.margin;
  if (finite(report?.route?.minNormalizedHpMargin)) return report.route.minNormalizedHpMargin;
  return null;
}

function reportEdits(report) {
  const edits = report?.best?.edits ?? report?.edits ?? [];
  return Array.isArray(edits) ? edits.map((edit) => ({ ...edit })) : [];
}

function adaptedRouteSolvable(report) {
  if (report?.hardChecks?.adaptedRouteSolvable === true) return true;
  if (report?.route?.solvable === true) return true;
  return false;
}

function numericEditsValid(edits) {
  return edits.length > 0 && edits.every((edit) =>
    typeof edit?.target === 'string' && edit.target.length > 0
    && typeof edit?.id === 'string' && edit.id.length > 0
    && typeof edit?.field === 'string' && edit.field.length > 0
    && finite(edit?.value)
  );
}

function holyBestResponseSatisfied(report) {
  return report?.hardChecks?.holyPolicyBestResponse === true
    && report?.holyPolicyAnalysis?.stableWithinSeedPortfolio === true
    && report?.holyPolicyAnalysis?.allOptimizedLocalOptimal === true;
}

export const BALANCE_REVIEW_RULES_V3 = Object.freeze({
  ...BALANCE_REVIEW_RULES_V2,
  requireExplicitNumericEdits: true,
  requireHolyPolicyBestResponse: true
});

/**
 * Generic review gate for adaptive numeric candidates.
 *
 * V2 was intentionally tied to shop HP + voidCore magicPower. V3 accepts an
 * arbitrary explicit numeric edit set while preserving proof and robustness
 * requirements. Once the Holy timing axis entered the player model, V3 also
 * requires evidence that the selected route is the modeled best response across
 * all Holy policies that received feasible seeds.
 */
export function evaluateGenericBalanceReviewGate(report, rules = BALANCE_REVIEW_RULES_V3) {
  const margin = reportMargin(report);
  const edits = reportEdits(report);
  const checks = {
    candidatePresent: Boolean(report),
    adaptiveHardConstraints: report?.acceptedHardConstraints === true,
    converged: rules.requireConvergence ? report?.converged === true : true,
    playerOneOptimal: rules.requirePlayerOneOptimal
      ? report?.counterfactuals?.improvedMutationCount === 0
      : true,
    holyPolicyBestResponse: rules.requireHolyPolicyBestResponse
      ? holyBestResponseSatisfied(report)
      : true,
    adaptedRouteSolvable: adaptedRouteSolvable(report),
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
    numericEdits: rules.requireExplicitNumericEdits ? numericEditsValid(edits) : true
  };
  const failures = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);
  return {
    passed: failures.length === 0,
    checks,
    failures,
    rules,
    margin,
    edits
  };
}

export function createGenericBalanceReviewProposal({
  report,
  candidateScore = null
} = {}) {
  const gate = evaluateGenericBalanceReviewGate(report);
  return {
    schemaVersion: 3,
    model: 'balance-review-proposal-v0.3',
    status: gate.passed ? 'ready_for_review' : 'blocked',
    candidateScore: finite(candidateScore) ? candidateScore : null,
    gate,
    edits: gate.passed ? gate.edits : [],
    evidence: report ? {
      model: report.model ?? null,
      candidateId: report.candidateId ?? null,
      leverKeys: report.leverKeys ?? null,
      converged: report.converged === true,
      playerOneOptimal: report.counterfactuals?.improvedMutationCount === 0,
      holyPolicyBestResponse: holyBestResponseSatisfied(report),
      holyPolicyAnalysis: report.holyPolicyAnalysis ?? null,
      margin: gate.margin,
      best: report.best ?? null,
      solver: report.solver ?? null,
      counterfactuals: report.counterfactuals ?? null,
      monotonicViolations: report.monotonicViolations ?? null
    } : null,
    productionWriteAllowed: false,
    productionBlockReason: 'Near-optimal/global exploit coverage is still insufficient for unattended production writes.'
  };
}
