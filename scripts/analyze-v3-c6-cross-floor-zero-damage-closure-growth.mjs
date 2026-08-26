import { analyzeV3C6CrossFloorZeroDamageClosureGrowth } from '../src/analyzer/event-order-c6-cross-floor-zero-damage-closure-growth.js';
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
function capsFlag(fallback) {
  const raw = process.argv.find((arg) => arg.startsWith('--goal-caps='))?.slice('--goal-caps='.length);
  if (!raw) return fallback;
  const values = raw.split(',').map(Number);
  if (values.some((value) => !Number.isInteger(value) || value < 1)) throw new Error(`Invalid --goal-caps: ${raw}`);
  return values;
}

const json = process.argv.includes('--json');
const rebuilt = rebuildDistributedPressureV3Reference({ maxPurchasePasses: integerFlag('max-purchase-passes', 12) });
const analysis = analyzeV3C6CrossFloorZeroDamageClosureGrowth({
  candidate: REVIEW_CANDIDATES.distributedPressureV3,
  referenceWitness: rebuilt.witness,
  targetCores: integerFlag('target-cores', 6),
  goalCaps: capsFlag([64, 128, 256, 512]),
  maxExpanded: integerFlag('max-expanded', 50_000),
  maxGenerated: integerFlag('max-generated', 700_000)
});

const report = {
  schemaVersion: 1,
  model: 'distributed-pressure-v3-c6-cross-floor-zero-damage-closure-growth-v0.1',
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
  console.log(`V3 cross-floor c6 growth status=${analysis.status} reference=${rebuilt.terminalHp}`);
  for (const round of analysis.rounds ?? []) console.log(round);
}
