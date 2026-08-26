import { analyzeV3C6FactorizationAudit } from '../src/analyzer/event-order-c6-factorization-audit.js';
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
const analysis = analyzeV3C6FactorizationAudit({
  candidate: REVIEW_CANDIDATES.distributedPressureV3,
  referenceWitness: rebuilt.witness,
  targetCores: integerFlag('target-cores', 6),
  maxGoals: integerFlag('max-goals', 512),
  maxExpanded: integerFlag('max-expanded', 50_000),
  maxGenerated: integerFlag('max-generated', 700_000)
});

const report = {
  schemaVersion: 1,
  model: 'distributed-pressure-v3-c6-factorization-audit-v0.1',
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
  console.log(`V3 c6 factorization audit status=${analysis.status} reference=${rebuilt.terminalHp}`);
  console.log(analysis.projections);
  console.log(analysis.stateAxes);
  console.log(analysis.monotoneCandidates);
  for (const floor of analysis.floorVariation ?? []) console.log(floor);
}
