import { proveDelayedHolyPoliciesStaged } from '../src/analyzer/staged-holy-policy-proof.js';

function numberArg(name, fallback) {
  const prefix = `--${name}=`;
  const raw = process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
  if (raw == null) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) throw new Error(`Invalid --${name}: ${raw}`);
  return value;
}

const legacyCoreExpanded = numberArg('core6-max-expanded', null);
const legacyCoreGenerated = numberArg('core6-max-generated', null);
const report = proveDelayedHolyPoliciesStaged({
  boundaryMaxExpanded: numberArg('boundary-max-expanded', 25_000),
  boundaryMaxGenerated: numberArg('boundary-max-generated', 250_000),
  boundaryDiscoveryGoals: numberArg('boundary-discovery-goals', 512),
  maxBoundarySeeds: numberArg('max-boundary-seeds', 12),
  preBossMaxExpanded: numberArg('preboss-max-expanded', legacyCoreExpanded ?? 4_000),
  preBossMaxGenerated: numberArg('preboss-max-generated', legacyCoreGenerated ?? 40_000),
  bossMaxExpanded: numberArg('boss-max-expanded', 128),
  bossMaxGenerated: numberArg('boss-max-generated', 2_000),
  policyMaxExpanded: numberArg('policy-max-expanded', 8_000),
  policyMaxGenerated: numberArg('policy-max-generated', 80_000)
});

process.stdout.write(`${JSON.stringify(report)}\n`);
