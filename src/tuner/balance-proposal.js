export const BALANCE_PROMOTION_RULES = Object.freeze({
  pressureBand: Object.freeze([0.08, 0.25]),
  minimumRecoveryRate: 0.60,
  maximumCatastrophicRate: 0.10,
  requireConvergence: true,
  requireExactExistence: true
});

function finite(value) {
  return Number.isFinite(value);
}

function pressurePass(report, [low, high]) {
  const margin = report?.route?.minNormalizedHpMargin;
  return finite(margin) && margin >= low && margin <= high;
}

export function evaluatePromotionGate(report, rules = BALANCE_PROMOTION_RULES) {
  const checks = {
    candidatePresent: Boolean(report),
    adaptiveHardConstraints: report?.acceptedHardConstraints === true,
    converged: rules.requireConvergence ? report?.converged === true : true,
    adaptedRouteSolvable: report?.route?.solvable === true,
    exactExistence: rules.requireExactExistence
      ? report?.solver?.solvable === true && report?.solver?.exact === true
      : report?.solver?.solvable === true,
    pressureTarget: pressurePass(report, rules.pressureBand),
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
  return {
    passed: failures.length === 0,
    checks,
    failures,
    rules
  };
}

export function createBalanceProposal({
  report,
  candidateScore = null,
  source = 'adaptive-final-pressure-v0.1'
} = {}) {
  const gate = evaluatePromotionGate(report);
  const status = gate.passed ? 'ready_for_review' : 'blocked';
  const edits = gate.passed ? [
    { target: 'shop', id: 'hp', field: 'effect.hp', value: report.hpReward },
    { target: 'shop', id: 'hp', field: 'effect.maxHp', value: report.hpReward },
    { target: 'enemy', id: 'voidCore', field: 'magicPower', value: report.magicPower }
  ] : [];

  return {
    schemaVersion: 1,
    model: 'balance-promotion-proposal-v0.1',
    status,
    source,
    candidateScore: finite(candidateScore) ? candidateScore : null,
    gate,
    edits,
    evidence: report ? {
      hpReward: report.hpReward,
      magicPower: report.magicPower,
      converged: report.converged,
      hardChecks: report.hardChecks,
      route: report.route ? {
        final: report.route.final,
        minNormalizedHpMargin: report.route.minNormalizedHpMargin,
        purchaseCounts: report.route.purchaseCounts,
        tightestBattle: report.route.tightestBattle
      } : null,
      solver: report.solver,
      counterfactuals: report.counterfactuals ? {
        totalMutations: report.counterfactuals.totalMutations,
        recoveryRate: report.counterfactuals.recoveryRate,
        catastrophicRate: report.counterfactuals.catastrophicRate,
        highRegretRate: report.counterfactuals.highRegretRate,
        improvedMutationCount: report.counterfactuals.improvedMutationCount,
        bestMutation: report.counterfactuals.bestMutation
      } : null
    } : null,
    note: gate.passed
      ? 'Proposal is eligible for human/CI review; production data has not been modified.'
      : `Proposal blocked by: ${gate.failures.join(', ') || 'unknown gate failure'}.`
  };
}
