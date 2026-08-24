import { ENEMIES, SHOP_OPTIONS } from '../game/data.js';
import { adaptFinalPressureCandidate } from './adaptive-final-pressure.js';

function baselineHpReward() {
  const option = SHOP_OPTIONS.find((candidate) => candidate.id === 'hp');
  if (!option) throw new Error('Adaptive candidate search requires the HP shop option.');
  return option.effect.hp;
}

export function adaptiveEditDistance(report, {
  hpBaseline = baselineHpReward(),
  magicBaseline = ENEMIES.voidCore.magicPower
} = {}) {
  if (!report || !Number.isFinite(report.hpReward) || !Number.isFinite(report.magicPower)) {
    return Number.POSITIVE_INFINITY;
  }
  const hpDistance = Math.abs(report.hpReward - hpBaseline) / Math.max(1, Math.abs(hpBaseline));
  const magicDistance = Math.abs(report.magicPower - magicBaseline) / Math.max(1, Math.abs(magicBaseline));
  return (hpDistance + magicDistance) / 2;
}

function distanceToBand(value, [low, high]) {
  if (!Number.isFinite(value)) return Number.POSITIVE_INFINITY;
  const width = Math.max(1e-9, high - low);
  if (value < low) return (low - value) / width;
  if (value > high) return (value - high) / width;
  return 0;
}

function distanceToRegretBand(value, [low, high]) {
  if (!Number.isFinite(value)) return 0;
  const width = Math.max(1e-9, high - low);
  if (value < low) return (low - value) / width;
  if (value > high) return (value - high) / width;
  return 0;
}

export function scoreAdaptiveCandidate(report, {
  pressureBand = [0.08, 0.25],
  regretBand = [0.08, 0.30],
  editPenaltyWeight = 0.05,
  convergencePenalty = 0.10
} = {}) {
  if (!report?.acceptedHardConstraints) return Number.POSITIVE_INFINITY;
  const pressureLoss = distanceToBand(report.route?.minNormalizedHpMargin, pressureBand);
  const regretLoss = distanceToRegretBand(report.counterfactuals?.highRegretRate, regretBand);
  const editDistance = adaptiveEditDistance(report);
  const convergence = report.converged ? 0 : convergencePenalty;
  return pressureLoss ** 2 + regretLoss ** 2 + editDistance * editPenaltyWeight + convergence;
}

export function rankAdaptiveCandidates(reports, options = {}) {
  return [...reports]
    .map((report) => ({
      report,
      score: scoreAdaptiveCandidate(report, options),
      editDistance: adaptiveEditDistance(report)
    }))
    .sort((a, b) => {
      if (a.report.acceptedHardConstraints !== b.report.acceptedHardConstraints) {
        return a.report.acceptedHardConstraints ? -1 : 1;
      }
      return a.score - b.score || a.report.hpReward - b.report.hpReward;
    });
}

/**
 * Expensive dry-run search. Every candidate includes a player best-response
 * loop, exact existence proof and one-purchase robustness analysis.
 */
export function searchAdaptiveBalanceCandidates({
  hpRewards = [90, 180, 270],
  targetMargin = 0.165,
  maxOuterIterations = 6,
  maxLocalPasses = 12,
  maxExpanded = 5_000,
  maxGenerated = 50_000,
  highRegretRelative = 0.20,
  editPenaltyWeight = 0.05
} = {}) {
  const reports = hpRewards.map((hpReward) => adaptFinalPressureCandidate({
    hpReward,
    targetMargin,
    maxOuterIterations,
    maxLocalPasses,
    maxExpanded,
    maxGenerated,
    highRegretRelative
  }));
  const ranked = rankAdaptiveCandidates(reports, { editPenaltyWeight });
  return {
    schemaVersion: 1,
    model: 'adaptive-balance-search-v0.1',
    dryRun: true,
    targetMargin,
    hpRewards: [...hpRewards],
    candidates: ranked,
    bestAccepted: ranked.find((entry) => entry.report.acceptedHardConstraints) ?? null
  };
}
