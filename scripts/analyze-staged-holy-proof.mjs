import { proveDelayedHolyPoliciesStaged } from '../src/analyzer/staged-holy-policy-proof.js';

function numberArg(name, fallback) {
  const prefix = `--${name}=`;
  const raw = process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
  if (raw == null) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) throw new Error(`Invalid --${name}: ${raw}`);
  return value;
}

const report = proveDelayedHolyPoliciesStaged({
  boundaryMaxExpanded: numberArg('boundary-max-expanded', 25_000),
  boundaryMaxGenerated: numberArg('boundary-max-generated', 250_000),
  boundaryDiscoveryGoals: numberArg('boundary-discovery-goals', 512),
  maxBoundarySeeds: numberArg('max-boundary-seeds', 12),
  core6MaxExpanded: numberArg('core6-max-expanded', 4_000),
  core6MaxGenerated: numberArg('core6-max-generated', 40_000),
  policyMaxExpanded: numberArg('policy-max-expanded', 8_000),
  policyMaxGenerated: numberArg('policy-max-generated', 80_000)
});

process.stdout.write(`${JSON.stringify(report)}\n`);
