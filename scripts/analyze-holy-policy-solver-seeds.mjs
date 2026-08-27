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

function stringFlag(name) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((value) => value.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : null;
}

const json = process.argv.includes('--json');
const maxExpanded = Math.trunc(numberFlag('max-expanded', 25_000));
const maxGenerated = Math.trunc(numberFlag('max-generated', 250_000));
const policyFlag = stringFlag('policy');
const delayedPolicies = HOLY_POLICIES.filter((policy) => policy !== 'immediate');
if (policyFlag && !delayedPolicies.includes(policyFlag)) {
  throw new Error(`--policy must be one of: ${delayedPolicies.join(', ')}`);
}
const policies = policyFlag ? [policyFlag] : delayedPolicies;

const results = findHolyPolicySolverSeeds({
  holyPolicies: policies,
  maxExpanded,
  maxGenerated
});
const report = {
  schemaVersion: 2,
  model: 'holy-policy-solver-seed-diagnostic-v0.2',
  canonicalBalance: true,
  requestedPolicy: policyFlag,
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
    const auth = result.authoritativeReplay ?? {};
    console.log([
      result.holyPolicy,
      `feasible=${result.policyFeasible}`,
      `exact=${result.exact}`,
      `stop=${result.stoppedReason ?? 'none'}`,
      `expanded=${result.solver.expandedStates}`,
      `generated=${result.solver.generatedStates}`,
      `shops=${result.certificate?.shopPurchases ?? 0}`,
      `certReplay=${auth.ok ?? false}`,
      `certHp=${result.certifiedTerminalHpLowerBound ?? 'n/a'}`,
      `greedyReplay=${replay.solvable ?? false}`,
      `interpretation=${result.interpretation}`
    ].join(' | '));
  }
}
