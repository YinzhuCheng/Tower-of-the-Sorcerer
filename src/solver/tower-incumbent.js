import { runGreedyShopStrategy } from './greedy-strategy.js';

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

export function findBestGreedyIncumbent({ strategies = DEFAULT_INCUMBENT_STRATEGIES } = {}) {
  const results = strategies.map((strategy) => ({
    id: strategy.id,
    cycle: [...strategy.cycle],
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
