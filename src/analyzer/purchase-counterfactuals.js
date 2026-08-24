import { runGreedyShopStrategy } from '../solver/greedy-strategy.js';
import { makeGreedyIncumbentWitness } from '../solver/tower-incumbent.js';

const SHOP_OPTIONS = ['atk', 'def', 'hp'];

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

export function analyzeSinglePurchaseCounterfactuals({
  bestEntry,
  highRegretRelative = 0.20
} = {}) {
  if (!bestEntry?.result?.solvable) {
    throw new Error('Single-purchase counterfactuals require a feasible representative strategy.');
  }

  const baseline = bestEntry.result;
  const baselineSequence = baseline.purchaseLog.map((entry) => entry.optionId);
  if (!baselineSequence.length) throw new Error('Representative strategy has no shop purchases to perturb.');

  const mutations = [];
  for (let index = 0; index < baselineSequence.length; index += 1) {
    const baselineOption = baselineSequence[index];
    for (const alternativeOption of SHOP_OPTIONS) {
      if (alternativeOption === baselineOption) continue;
      const shopPlan = [...baselineSequence];
      shopPlan[index] = alternativeOption;
      const result = runGreedyShopStrategy({
        shopCycle: bestEntry.cycle ?? baseline.shopCycle,
        shopPlan,
        holyPolicy: bestEntry.holyPolicy ?? baseline.holyPolicy
      });
      const terminalHp = result.solvable ? result.final.hp : null;
      const regret = result.solvable ? baseline.final.hp - terminalHp : null;
      const normalizedRegret = result.solvable
        ? regret / Math.max(1, baseline.final.hp)
        : null;
      mutations.push({
        purchaseIndex: index,
        purchaseNumber: index + 1,
        baselineFloor: baseline.purchaseLog[index]?.floor ?? null,
        baselineCost: baseline.purchaseLog[index]?.cost ?? null,
        baselineOption,
        alternativeOption,
        solvable: result.solvable,
        failure: result.failure,
        failureFloor: result.solvable ? null : result.floor,
        terminalHp,
        regret,
        normalizedRegret,
        terminalHpDelta: result.solvable ? terminalHp - baseline.final.hp : null,
        purchasesCompleted: result.purchases,
        coresRecovered: result.cores,
        minNormalizedHpMargin: result.minNormalizedHpMargin,
        shopPlan
      });
    }
  }

  const solvable = mutations.filter((entry) => entry.solvable);
  const catastrophic = mutations.filter((entry) => !entry.solvable);
  const highRegret = solvable.filter((entry) => entry.normalizedRegret >= highRegretRelative);
  const improved = solvable.filter((entry) => entry.terminalHp > baseline.final.hp)
    .sort((a, b) => b.terminalHp - a.terminalHp);
  const bestMutation = [...solvable].sort((a, b) => b.terminalHp - a.terminalHp)[0] ?? null;

  const byPurchase = [];
  for (let index = 0; index < baselineSequence.length; index += 1) {
    const entries = mutations.filter((entry) => entry.purchaseIndex === index);
    const recovered = entries.filter((entry) => entry.solvable);
    const worstRecovered = [...recovered].sort((a, b) => b.normalizedRegret - a.normalizedRegret)[0] ?? null;
    byPurchase.push({
      purchaseIndex: index,
      purchaseNumber: index + 1,
      floor: baseline.purchaseLog[index]?.floor ?? null,
      cost: baseline.purchaseLog[index]?.cost ?? null,
      baselineOption: baselineSequence[index],
      alternatives: entries.length,
      recoverable: recovered.length,
      catastrophic: entries.length - recovered.length,
      worstNormalizedRegret: worstRecovered?.normalizedRegret ?? null,
      worstAlternativeOption: worstRecovered?.alternativeOption ?? null,
      bestTerminalHp: recovered.length ? Math.max(...recovered.map((entry) => entry.terminalHp)) : null
    });
  }

  const bestImprovementWitness = improved.length
    ? makeGreedyIncumbentWitness({
        id: `${bestEntry.id ?? 'representative'}@single-purchase-${improved[0].purchaseNumber}-${improved[0].alternativeOption}`,
        cycle: bestEntry.cycle ?? baseline.shopCycle,
        holyPolicy: bestEntry.holyPolicy ?? baseline.holyPolicy,
        shopPlan: improved[0].shopPlan
      })
    : null;

  return {
    schemaVersion: 1,
    model: 'single-purchase-counterfactual-v0.1',
    confidence: 'authoritative-representative-route-counterfactual',
    representativeStrategyId: bestEntry.id ?? null,
    baselineTerminalHp: baseline.final.hp,
    baselinePurchaseCount: baselineSequence.length,
    baselineSequence,
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
    bestMutation: bestMutation ? {
      purchaseNumber: bestMutation.purchaseNumber,
      floor: bestMutation.baselineFloor,
      baselineOption: bestMutation.baselineOption,
      alternativeOption: bestMutation.alternativeOption,
      terminalHp: bestMutation.terminalHp,
      terminalHpDelta: bestMutation.terminalHpDelta,
      normalizedRegret: bestMutation.normalizedRegret,
      solvable: bestMutation.solvable
    } : null,
    bestImprovementWitness,
    mostSensitivePurchases: [...byPurchase]
      .sort((a, b) => {
        if (a.catastrophic !== b.catastrophic) return b.catastrophic - a.catastrophic;
        return (b.worstNormalizedRegret ?? -Infinity) - (a.worstNormalizedRegret ?? -Infinity);
      })
      .slice(0, 10),
    catastrophicExamples: catastrophic.slice(0, 10).map((entry) => ({
      purchaseNumber: entry.purchaseNumber,
      floor: entry.baselineFloor,
      baselineOption: entry.baselineOption,
      alternativeOption: entry.alternativeOption,
      failureFloor: entry.failureFloor,
      failure: entry.failure,
      purchasesCompleted: entry.purchasesCompleted,
      coresRecovered: entry.coresRecovered
    })),
    mutations
  };
}
