import { HOLY_POLICIES } from '../src/solver/greedy-strategy.js';
import { findHolyPolicySolverSeeds } from '../src/analyzer/holy-policy-solver-seed.js';

function numberFlag(name, fallback) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((value) => value.startsWith(prefix));
  if (!arg) return fallback;
  const value = Number(arg.slice(prefix.length));
  if (!Number.isFinite(value)) throw new Error(`Invalid --${name} value.`);
  return value;
}

const json = process.argv.includes('--json');
const maxExpanded = Math.trunc(numberFlag('max-expanded', 25_000));
const maxGenerated = Math.trunc(numberFlag('max-generated', 250_000));
const policies = HOLY_POLICIES.filter((policy) => policy !== 'immediate');

const results = findHolyPolicySolverSeeds({
  holyPolicies: policies,
  maxExpanded,
  maxGenerated
});
const report = {
  schemaVersion: 1,
  model: 'holy-policy-solver-seed-diagnostic-v0.1',
  canonicalBalance: true,
  maxExpanded,
  maxGenerated,
  results
};

if (json) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  console.log('Holy-policy constrained Solver seed diagnostic');
  for (const result of results) {
    const replay = result.deterministicReplay ?? {};
    console.log([
      result.holyPolicy,
      `feasible=${result.policyFeasible}`,
      `exact=${result.exact}`,
      `stop=${result.stoppedReason ?? 'none'}`,
      `expanded=${result.solver.expandedStates}`,
      `generated=${result.solver.generatedStates}`,
      `shops=${result.certificate?.shopPurchases ?? 0}`,
      `greedyReplay=${replay.solvable ?? false}`,
      `interpretation=${result.interpretation}`
    ].join(' | '));
  }
}
