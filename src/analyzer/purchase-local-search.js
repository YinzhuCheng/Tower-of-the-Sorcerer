import { runGreedyShopStrategy } from '../solver/greedy-strategy.js';
import { makeGreedyIncumbentWitness } from '../solver/tower-incumbent.js';
import { analyzeSinglePurchaseCounterfactuals } from './purchase-counterfactuals.js';

function bestSolvableMutation(report) {
  return [...report.mutations]
    .filter((entry) => entry.solvable)
    .sort((a, b) => b.terminalHp - a.terminalHp)[0] ?? null;
}

export function optimizePurchasePlanLocally({
  seedEntry,
  maxPasses = 12,
  highRegretRelative = 0.20
} = {}) {
  if (!seedEntry?.result?.solvable) {
    throw new Error('Purchase-plan local search requires a feasible seed entry.');
  }
  if (!Number.isInteger(maxPasses) || maxPasses < 1) {
    throw new Error('maxPasses must be a positive integer.');
  }

  const cycle = [...(seedEntry.cycle ?? seedEntry.result.shopCycle)];
  const holyPolicy = seedEntry.holyPolicy ?? seedEntry.result.holyPolicy;
  let currentPlan = seedEntry.result.purchaseLog.map((entry) => entry.optionId);
  let currentResult = seedEntry.result;
  let evaluatedMutations = 0;
  const history = [];
  let localOptimal = false;

  for (let pass = 1; pass <= maxPasses; pass += 1) {
    const currentEntry = {
      ...seedEntry,
      id: `${seedEntry.id ?? 'seed'}@local-${pass - 1}`,
      cycle,
      holyPolicy,
      result: currentResult
    };
    const neighborhood = analyzeSinglePurchaseCounterfactuals({
      bestEntry: currentEntry,
      highRegretRelative
    });
    evaluatedMutations += neighborhood.totalMutations;
    const best = bestSolvableMutation(neighborhood);

    if (!best || best.terminalHp <= currentResult.final.hp) {
      localOptimal = true;
      history.push({
        pass,
        accepted: false,
        terminalHp: currentResult.final.hp,
        bestNeighborHp: best?.terminalHp ?? null
      });
      break;
    }

    const beforeHp = currentResult.final.hp;
    currentPlan = [...best.shopPlan];
    currentResult = runGreedyShopStrategy({
      shopCycle: cycle,
      shopPlan: currentPlan,
      holyPolicy
    });
    if (!currentResult.solvable) {
      throw new Error('Accepted local-search mutation failed authoritative replay on confirmation.');
    }
    if (currentResult.final.hp !== best.terminalHp) {
      throw new Error('Accepted local-search mutation was not deterministic on replay.');
    }

    history.push({
      pass,
      accepted: true,
      purchaseNumber: best.purchaseNumber,
      floor: best.baselineFloor,
      from: best.baselineOption,
      to: best.alternativeOption,
      beforeHp,
      afterHp: currentResult.final.hp,
      improvement: currentResult.final.hp - beforeHp
    });
  }

  const witness = makeGreedyIncumbentWitness({
    id: `${seedEntry.id ?? 'seed'}@purchase-local-search`,
    cycle,
    holyPolicy,
    shopPlan: currentPlan
  });

  return {
    schemaVersion: 1,
    model: 'purchase-plan-1opt-v0.1',
    seedStrategyId: seedEntry.id ?? null,
    seedTerminalHp: seedEntry.result.final.hp,
    maxPasses,
    localOptimal,
    improvementPasses: history.filter((entry) => entry.accepted).length,
    evaluatedMutations,
    history,
    bestTerminalHp: currentResult.final.hp,
    totalImprovement: currentResult.final.hp - seedEntry.result.final.hp,
    bestPlan: currentPlan,
    bestResult: currentResult,
    bestWitness: witness
  };
}
