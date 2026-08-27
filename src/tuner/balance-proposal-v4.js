import {
  BALANCE_REVIEW_RULES_V3,
  evaluateGenericBalanceReviewGate
} from './balance-proposal-v3.js';

export const BALANCE_REVIEW_RULES_V4 = Object.freeze({
  ...BALANCE_REVIEW_RULES_V3,
  requireEventOrderBestResponse: true
});

function eventOrderCoverageSatisfied(evidence) {
  if (!evidence) return false;
  if (evidence.exploitFound === true || evidence.status === 'exploit-proven') return false;
  return evidence.exactNoExploit === true
    || evidence.coverageExact === true
    || evidence.status === 'fixed-purchase-event-order-optimal'
    || evidence.status === 'exact-no-exploit';
}

/**
 * Review gate after event-order adaptation enters the player model.
 *
 * A bounded search that merely failed to find an exploit is not enough. This
 * gate passes the new axis only when there is exact no-exploit evidence for the
 * modeled event-order sub-problem. Any replay-verified superior route blocks the
 * proposal immediately.
 */
export function evaluateEventOrderAwareBalanceReviewGate(report, {
  eventOrderEvidence = report?.eventOrderAnalysis ?? null,
  rules = BALANCE_REVIEW_RULES_V4
} = {}) {
  const base = evaluateGenericBalanceReviewGate(report, rules);
  const checks = {
    ...base.checks,
    eventOrderBestResponse: rules.requireEventOrderBestResponse
      ? eventOrderCoverageSatisfied(eventOrderEvidence)
      : true
  };
  const failures = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);
  return {
    ...base,
    passed: failures.length === 0,
    checks,
    failures,
    rules,
    eventOrderEvidence
  };
}

export function createEventOrderAwareBalanceReviewProposal({
  report,
  eventOrderEvidence = report?.eventOrderAnalysis ?? null,
  candidateScore = null
} = {}) {
  const gate = evaluateEventOrderAwareBalanceReviewGate(report, { eventOrderEvidence });
  return {
    schemaVersion: 4,
    model: 'balance-review-proposal-v0.4-event-order-aware',
    status: gate.passed ? 'ready_for_review' : 'blocked',
    candidateScore: Number.isFinite(candidateScore) ? candidateScore : null,
    gate,
    edits: gate.passed ? gate.edits : [],
    evidence: report ? {
      model: report.model ?? null,
      candidateId: report.candidateId ?? null,
      margin: gate.margin,
      solver: report.solver ?? null,
      counterfactuals: report.counterfactuals ?? null,
      holyPolicyAnalysis: report.holyPolicyAnalysis ?? null,
      eventOrderAnalysis: eventOrderEvidence
    } : null,
    productionWriteAllowed: false,
    productionBlockReason: gate.passed
      ? 'Joint purchase/event-order and near-optimal/global exploit coverage are still insufficient for unattended production writes.'
      : 'Current review evidence does not close the event-order best-response axis.'
  };
}
