import { analyzeV3C6ZeroDamageClosureBridgeScreen } from '../src/analyzer/event-order-c6-zero-damage-closure-bridge-screen.js';
import { rebuildDistributedPressureV3Reference } from '../src/tuner/review-candidate-v3-rebuild.js';
import { REVIEW_CANDIDATES } from '../src/tuner/review-candidates.js';

function integerFlag(name, fallback) {
  const prefix = `--${name}=`;
  const raw = process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
  if (raw == null) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) throw new Error(`Invalid --${name}: ${raw}`);
  return value;
}

const json = process.argv.includes('--json');
const rebuilt = rebuildDistributedPressureV3Reference({
  maxPurchasePasses: integerFlag('max-purchase-passes', 12)
});
const analysis = analyzeV3C6ZeroDamageClosureBridgeScreen({
  candidate: REVIEW_CANDIDATES.distributedPressureV3,
  referenceWitness: rebuilt.witness,
  fromCores: integerFlag('from-cores', 6),
  toCores: integerFlag('to-cores', 7),
  fromBoundaryMaxExpanded: integerFlag('from-boundary-max-expanded', 8_000),
  fromBoundaryMaxGenerated: integerFlag('from-boundary-max-generated', 100_000),
  fromBoundaryMaxGoals: integerFlag('from-boundary-max-goals', 64),
  maxPrefixSeeds: integerFlag('max-prefix-seeds', 6),
  bridgeMaxExpandedPerPrefix: integerFlag('bridge-max-expanded-per-prefix', 6_000),
  bridgeMaxGeneratedPerPrefix: integerFlag('bridge-max-generated-per-prefix', 90_000),
  bridgeMaxGoalsPerPrefix: integerFlag('bridge-max-goals-per-prefix', 32)
});

const report = {
  schemaVersion: 1,
  model: 'distributed-pressure-v3-c6-zero-damage-closure-bridge-screen-v0.1',
  rebuild: {
    terminalHp: rebuilt.terminalHp,
    minNormalizedHpMargin: rebuilt.minNormalizedHpMargin,
    witnessHash: rebuilt.witnessHash,
    semanticFingerprint: rebuilt.semanticFingerprint
  },
  analysis
};

if (json) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
else {
  console.log(`V3 closure bridge screen status=${analysis.status} reference=${rebuilt.terminalHp}`);
  console.log(`fromBoundary=${JSON.stringify(analysis.fromBoundary)}`);
  console.log(`prefixSchedule=${JSON.stringify(analysis.prefixSchedule)}`);
  console.log(`bridges=${JSON.stringify(analysis.bridges)}`);
}
