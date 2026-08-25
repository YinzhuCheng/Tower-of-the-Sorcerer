import { DEFAULT_INCUMBENT_STRATEGIES } from '../src/solver/tower-incumbent.js';
import { HOLY_POLICIES } from '../src/solver/greedy-strategy.js';
import { rescuePurchasePrefixForHolyPolicy } from '../src/analyzer/purchase-prefix-rescue.js';

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

function cyclesForPolicy(policy) {
  const seen = new Set();
  const cycles = [];
  for (const strategy of DEFAULT_INCUMBENT_STRATEGIES) {
    if ((strategy.holyPolicy ?? 'immediate') !== policy) continue;
    const key = JSON.stringify(strategy.cycle);
    if (seen.has(key)) continue;
    seen.add(key);
    cycles.push([...strategy.cycle]);
  }
  return cycles;
}

function compactAttempt(attempt) {
  if (!attempt) return null;
  return {
    id: attempt.id,
    shopPlan: [...attempt.shopPlan],
    result: {
      solvable: attempt.result.solvable,
      failure: attempt.result.failure,
      floor: attempt.result.floor,
      cores: attempt.result.cores,
      battles: attempt.result.battles,
      purchases: attempt.result.purchases,
      holy: attempt.result.relics?.holy ?? false,
      final: attempt.result.final ? { ...attempt.result.final } : null
    }
  };
}

const json = process.argv.includes('--json');
const policy = stringFlag('policy') ?? 'after-core-6';
if (!HOLY_POLICIES.includes(policy) || policy === 'immediate') {
  throw new Error(`--policy must be a delayed Holy policy.`);
}
const maxDepth = Math.trunc(numberFlag('max-depth', 20));
const beamWidth = Math.trunc(numberFlag('beam-width', 24));
const maxEvaluations = Math.trunc(numberFlag('max-evaluations', 2_000));

const rescue = rescuePurchasePrefixForHolyPolicy({
  holyPolicy: policy,
  cycles: cyclesForPolicy(policy),
  maxDepth,
  beamWidth,
  maxEvaluations
});
const report = {
  schemaVersion: 1,
  model: 'holy-purchase-rescue-diagnostic-v0.1',
  canonicalBalance: true,
  holyPolicy: policy,
  found: rescue.found,
  depth: rescue.depth,
  evaluations: rescue.evaluations,
  beamWidth: rescue.beamWidth,
  maxDepth: rescue.maxDepth,
  stoppedReason: rescue.stoppedReason,
  bestSeed: compactAttempt(rescue.bestSeed),
  bestProgress: compactAttempt(rescue.bestProgress),
  failureReasons: rescue.failureReasons.map((entry) => ({ ...entry }))
};

if (json) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  console.log(`HOLY_RESCUE policy=${policy} found=${report.found} depth=${report.depth} evaluations=${report.evaluations} stop=${report.stoppedReason}`);
  const p = report.bestProgress?.result ?? {};
  console.log(`BEST_PROGRESS floor=${p.floor} cores=${p.cores} battles=${p.battles} purchases=${p.purchases} holy=${p.holy} failure=${p.failure ?? 'none'}`);
  for (const failure of report.failureReasons.slice(0, 8)) {
    console.log(`FAIL ${failure.count} x ${failure.reason}`);
  }
}
