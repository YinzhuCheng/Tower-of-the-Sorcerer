import { runGreedyShopStrategy } from './greedy-strategy.js';

export const GREEDY_INCUMBENT_WITNESS_TYPE = 'greedy-shop-cycle-v1';

export const DEFAULT_INCUMBENT_STRATEGIES = [
  { id: 'def-atk-hp', cycle: ['def', 'atk', 'hp'] },
  { id: 'def-hp-atk', cycle: ['def', 'hp', 'atk'] },
  { id: 'atk-def-hp', cycle: ['atk', 'def', 'hp'] },
  { id: 'atk-hp-def', cycle: ['atk', 'hp', 'def'] },
  { id: 'hp-def-atk', cycle: ['hp', 'def', 'atk'] },
  { id: 'hp-atk-def', cycle: ['hp', 'atk', 'def'] },
  { id: 'all-atk', cycle: ['atk'] },
  { id: 'all-def', cycle: ['def'] },
  { id: 'all-hp', cycle: ['hp'] }
];

export function makeGreedyIncumbentWitness({ id = null, cycle } = {}) {
  if (!Array.isArray(cycle) || cycle.length === 0) {
    throw new Error('Greedy incumbent witness requires a non-empty shop cycle.');
  }
  return {
    type: GREEDY_INCUMBENT_WITNESS_TYPE,
    strategyId: id,
    shopCycle: [...cycle]
  };
}

export function verifyGreedyIncumbentWitness(witness) {
  if (!witness || witness.type !== GREEDY_INCUMBENT_WITNESS_TYPE) {
    return { ok: false, reason: 'Unsupported Tower incumbent witness type.' };
  }
  if (!Array.isArray(witness.shopCycle) || witness.shopCycle.length === 0) {
    return { ok: false, reason: 'Greedy incumbent witness has no shop cycle.' };
  }

  let result;
  try {
    result = runGreedyShopStrategy({ shopCycle: witness.shopCycle });
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : String(error) };
  }
  if (!result.solvable) {
    return { ok: false, reason: result.failure ?? 'Greedy incumbent witness did not reach victory.' };
  }

  return {
    ok: true,
    value: result.final.hp,
    objectiveType: 'terminal_hp',
    witnessType: GREEDY_INCUMBENT_WITNESS_TYPE,
    strategyId: witness.strategyId ?? null,
    summary: {
      final: { ...result.final },
      cores: result.cores,
      purchases: result.purchases,
      purchaseCounts: { ...result.purchaseCounts },
      battles: result.battles,
      turns: result.turns
    }
  };
}

export function findBestGreedyIncumbent({ strategies = DEFAULT_INCUMBENT_STRATEGIES } = {}) {
  const results = strategies.map((strategy) => ({
    id: strategy.id,
    cycle: [...strategy.cycle],
    witness: makeGreedyIncumbentWitness(strategy),
    result: runGreedyShopStrategy({ shopCycle: strategy.cycle })
  }));
  const feasible = results
    .filter((entry) => entry.result.solvable)
    .sort((a, b) => b.result.final.hp - a.result.final.hp || a.id.localeCompare(b.id));

  return {
    best: feasible[0] ?? null,
    feasibleCount: feasible.length,
    attemptedCount: results.length,
    results
  };
}
