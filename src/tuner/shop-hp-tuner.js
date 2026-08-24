import { SHOP_OPTIONS } from '../game/data.js';
import { evaluateProtectedBalanceCandidate, rankBalanceCandidates } from './numeric-evaluator.js';

function currentHpReward() {
  const option = SHOP_OPTIONS.find((candidate) => candidate.id === 'hp');
  if (!option) throw new Error('Shop HP option is missing.');
  if (option.effect.hp !== option.effect.maxHp) {
    throw new Error('Shop HP tuner requires current HP and max-HP rewards to match.');
  }
  return option.effect.hp;
}

export function generateShopHpRewardCandidates({
  multipliers = [1, 0.8, 0.6, 0.45, 0.3, 0.2, 0.1],
  roundTo = 10
} = {}) {
  const baseline = currentHpReward();
  const values = [...new Set(multipliers.map((multiplier) => {
    if (!Number.isFinite(multiplier) || multiplier <= 0) throw new Error(`Invalid HP reward multiplier: ${multiplier}`);
    const raw = baseline * multiplier;
    return Math.max(1, Math.round(raw / roundTo) * roundTo);
  }))].sort((a, b) => b - a);

  return values.map((value) => ({
    id: `shop-hp-${value}`,
    parameter: 'shop.hp.reward',
    baseline,
    value,
    multiplier: value / baseline,
    edits: [
      { target: 'shop', id: 'hp', field: 'effect.hp', value },
      { target: 'shop', id: 'hp', field: 'effect.maxHp', value }
    ]
  }));
}

export function dryRunShopHpTuning({
  multipliers,
  roundTo = 10,
  maxExpanded = 5_000,
  maxGenerated = 50_000,
  editPenaltyWeight = 0.05
} = {}) {
  const generated = generateShopHpRewardCandidates({ multipliers, roundTo });
  const evaluated = generated.map((candidate) => ({
    ...candidate,
    evaluation: evaluateProtectedBalanceCandidate({
      id: candidate.id,
      edits: candidate.edits,
      maxExpanded,
      maxGenerated,
      editPenaltyWeight
    })
  }));
  const rankedEvaluations = rankBalanceCandidates(evaluated.map((entry) => entry.evaluation));
  const byId = new Map(evaluated.map((entry) => [entry.id, entry]));
  const ranked = rankedEvaluations.map((evaluation) => ({
    ...byId.get(evaluation.id),
    evaluation
  }));

  return {
    schemaVersion: 1,
    model: 'protected-shop-hp-tuner-v0.1',
    dryRun: true,
    parameter: 'shop.hp.reward',
    baseline: currentHpReward(),
    candidates: ranked,
    bestAccepted: ranked.find((entry) => entry.evaluation.acceptedHardConstraints) ?? null
  };
}
