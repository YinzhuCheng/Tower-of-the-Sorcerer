import { mutateEventOrderWitnessShopChoice } from './event-order-purchase-local-search.js';
import { replayTowerStepSkeleton } from '../solver/replay.js';

function quantile(values, q) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return null;
  if (sorted.length === 1) return sorted[0];
  const position = Math.min(1, Math.max(0, q)) * (sorted.length - 1);
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  const weight = position - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function shopSteps(witness) {
  return witness.steps
    .map((step, stepIndex) => ({ step, stepIndex }))
    .filter(({ step }) => step.kind === 'shop');
}

/**
 * Single-purchase robustness around a fixed event-order step witness.
 *
 * Unlike the older greedy-route counterfactual analyzer, every mutation keeps
 * the same 241-step (or future equivalent) action skeleton and replays it through
 * canonical engine transitions. The result therefore measures purchase mistakes
 * under the stronger event-order player model used by the candidate reference.
 */
export function analyzeEventOrderWitnessPurchaseCounterfactuals({
  witness,
  adapter,
  highRegretRelative = 0.20
} = {}) {
  if (!witness?.steps?.length) throw new Error('Event-order counterfactuals require a witness.');
  if (!adapter) throw new Error('Event-order counterfactuals require an adapter.');
  const baseline = replayTowerStepSkeleton(witness.steps, { adapter });
  if (!baseline.ok) throw new Error(`Baseline event-order witness is not replayable: ${baseline.failures?.[0]?.reason ?? 'unknown'}`);

  const shops = shopSteps(witness);
  if (!shops.length) throw new Error('Event-order witness has no shop actions to perturb.');
  const options = ['atk', 'def', 'hp'];
  const mutations = [];

  for (let purchaseIndex = 0; purchaseIndex < shops.length; purchaseIndex += 1) {
    const { step, stepIndex } = shops[purchaseIndex];
    const baselineOption = step.action?.optionId;
    for (const alternativeOption of options) {
      if (alternativeOption === baselineOption) continue;
      const mutated = mutateEventOrderWitnessShopChoice(witness, stepIndex, alternativeOption);
      const replay = replayTowerStepSkeleton(mutated.steps, { adapter });
      const terminalHp = replay.ok ? replay.objective : null;
      const regret = replay.ok ? baseline.objective - terminalHp : null;
      const normalizedRegret = replay.ok
        ? regret / Math.max(1, baseline.objective)
        : null;
      mutations.push({
        purchaseIndex,
        purchaseNumber: purchaseIndex + 1,
        stepIndex,
        floor: step.floorBefore + 1,
        eventId: step.eventId,
        baselineOption,
        alternativeOption,
        solvable: replay.ok,
        failure: replay.ok ? null : (replay.failures?.[0]?.reason ?? 'unknown'),
        terminalHp,
        terminalHpDelta: replay.ok ? terminalHp - baseline.objective : null,
        regret,
        normalizedRegret,
        minNormalizedHpMargin: replay.minNormalizedHpMargin,
        witnessHash: mutated.witnessHash
      });
    }
  }

  const solvable = mutations.filter((entry) => entry.solvable);
  const catastrophic = mutations.filter((entry) => !entry.solvable);
  const improved = solvable.filter((entry) => entry.terminalHp > baseline.objective)
    .sort((a, b) => b.terminalHp - a.terminalHp);
  const highRegret = solvable.filter((entry) => entry.normalizedRegret >= highRegretRelative);

  return {
    schemaVersion: 1,
    model: 'event-order-single-purchase-counterfactual-v0.1',
    confidence: 'authoritative-fixed-event-order-counterfactual',
    baselineTerminalHp: baseline.objective,
    baselineMinNormalizedHpMargin: baseline.minNormalizedHpMargin,
    baselineWitnessHash: witness.witnessHash ?? null,
    baselinePurchaseCount: shops.length,
    totalMutations: mutations.length,
    solvableMutations: solvable.length,
    catastrophicMutations: catastrophic.length,
    recoveryRate: mutations.length ? solvable.length / mutations.length : null,
    catastrophicRate: mutations.length ? catastrophic.length / mutations.length : null,
    highRegretThresholdRelative: highRegretRelative,
    highRegretRate: solvable.length ? highRegret.length / solvable.length : null,
    medianNormalizedRegret: quantile(solvable.map((entry) => entry.normalizedRegret), 0.50),
    p90NormalizedRegret: quantile(solvable.map((entry) => entry.normalizedRegret), 0.90),
    maxNormalizedRegret: solvable.length ? Math.max(...solvable.map((entry) => entry.normalizedRegret)) : null,
    improvedMutationCount: improved.length,
    bestMutation: improved[0] ?? ([...solvable].sort((a, b) => b.terminalHp - a.terminalHp)[0] ?? null),
    catastrophicExamples: catastrophic.slice(0, 10),
    mostSensitivePurchases: shops.map(({ step }, purchaseIndex) => {
      const entries = mutations.filter((entry) => entry.purchaseIndex === purchaseIndex);
      const recovered = entries.filter((entry) => entry.solvable);
      const worst = [...recovered].sort((a, b) => b.normalizedRegret - a.normalizedRegret)[0] ?? null;
      return {
        purchaseIndex,
        purchaseNumber: purchaseIndex + 1,
        floor: step.floorBefore + 1,
        baselineOption: step.action?.optionId ?? null,
        alternatives: entries.length,
        recoverable: recovered.length,
        catastrophic: entries.length - recovered.length,
        worstNormalizedRegret: worst?.normalizedRegret ?? null,
        worstAlternativeOption: worst?.alternativeOption ?? null,
        bestTerminalHp: recovered.length ? Math.max(...recovered.map((entry) => entry.terminalHp)) : null
      };
    }).sort((a, b) => b.catastrophic - a.catastrophic
      || (b.worstNormalizedRegret ?? -Infinity) - (a.worstNormalizedRegret ?? -Infinity)).slice(0, 10),
    mutations
  };
}
