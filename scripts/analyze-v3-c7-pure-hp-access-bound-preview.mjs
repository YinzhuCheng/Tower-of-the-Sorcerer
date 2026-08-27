import { analyzeV3C7PureHpAccessBoundPreview } from '../src/analyzer/event-order-core-bridge-access-bound-preview.js';
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
const analysis = analyzeV3C7PureHpAccessBoundPreview({
  candidate: REVIEW_CANDIDATES.distributedPressureV3,
  referenceWitness: rebuilt.witness,
  fromCores: integerFlag('from-cores', 6),
  toCores: integerFlag('to-cores', 7),
  fromBoundaryMaxExpanded: integerFlag('from-boundary-max-expanded', 8_000),
  fromBoundaryMaxGenerated: integerFlag('from-boundary-max-generated', 100_000),
  fromBoundaryMaxGoals: integerFlag('from-boundary-max-goals', 64),
  bridgeMaxExpanded: integerFlag('bridge-max-expanded', 6_000),
  bridgeMaxGenerated: integerFlag('bridge-max-generated', 90_000),
  bridgeMaxGoals: integerFlag('bridge-max-goals', 32)
});

const report = {
  schemaVersion: 1,
  model: 'distributed-pressure-v3-c7-pure-hp-access-bound-preview-v0.1',
  rebuild: {
    terminalHp: rebuilt.terminalHp,
    minNormalizedHpMargin: rebuilt.minNormalizedHpMargin,
    witnessHash: rebuilt.witnessHash,
    semanticFingerprint: rebuilt.semanticFingerprint
  },
  analysis
};

if (json) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  console.log(`V3 pure-HP access preview status=${analysis.status} reference=${rebuilt.terminalHp} proofModified=${analysis.proofBoundModified}`);
  for (const entry of analysis.representatives ?? []) {
    const p = entry.accessPreview ?? {};
    const best = p.best ?? {};
    const constraint = best.strongestConstraint ?? {};
    console.log(`${entry.role} p=${entry.shopPurchases} hp=${entry.resources?.hp} gold=${entry.resources?.gold} old=${entry.oldUpperBound} preview=${entry.previewUpperBound} tightening=${entry.tightening} slack=${entry.previewThresholdSlack} prune=${entry.previewWouldPruneThreshold}`);
    for (const item of p.items ?? []) {
      console.log(`  item=${item.itemId}@${item.x},${item.y} credit=${item.creditedObjectiveHp} accessDamageLB=${item.accessDamageLowerBound}`);
    }
    console.log(`  bestScenario buys=${best.purchaseCount} old=${best.oldUpperBound} harvest=${best.harvestDamageLowerBound} item=${constraint.itemId}@${constraint.x},${constraint.y} access=${constraint.accessDamageLowerBound} beyondHarvest=${constraint.accessBeyondHarvest} penalty=${best.additionalPenalty} preview=${best.previewUpperBound}`);
  }
}
