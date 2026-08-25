import { analyzeV3C7DiscreteBoundPreview } from '../src/analyzer/event-order-core-bridge-discrete-bound-preview.js';
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
const rebuilt = rebuildDistributedPressureV3Reference({ maxPurchasePasses: integerFlag('max-purchase-passes', 12) });
const analysis = analyzeV3C7DiscreteBoundPreview({
  candidate: REVIEW_CANDIDATES.distributedPressureV3,
  referenceWitness: rebuilt.witness,
  fromCores: integerFlag('from-cores', 6),
  toCores: integerFlag('to-cores', 7),
  fromBoundaryMaxExpanded: integerFlag('from-boundary-max-expanded', 8000),
  fromBoundaryMaxGenerated: integerFlag('from-boundary-max-generated', 100000),
  fromBoundaryMaxGoals: integerFlag('from-boundary-max-goals', 64),
  bridgeMaxExpanded: integerFlag('bridge-max-expanded', 6000),
  bridgeMaxGenerated: integerFlag('bridge-max-generated', 90000),
  bridgeMaxGoals: integerFlag('bridge-max-goals', 32)
});
const report = { schemaVersion: 1, model: 'distributed-pressure-v3-c7-discrete-bound-preview-v0.1', rebuild: { terminalHp: rebuilt.terminalHp, semanticFingerprint: rebuilt.semanticFingerprint }, analysis };
if (json) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
else {
  console.log(`V3 discrete preview status=${analysis.status} reference=${rebuilt.terminalHp} proofModified=${analysis.proofBoundModified}`);
  for (const e of analysis.representatives ?? []) {
    const p=e.preview??{}, h=p.harvest??{}, b=p.best??{}, c=b.strongestAccessConstraint??{}, r=e.resources??{};
    console.log(`${e.role} p=${e.shopPurchases} hp=${r.hp} gold=${r.gold} old=${e.oldUpperBound} preview=${e.previewUpperBound} tightening=${e.tightening} slack=${e.previewThresholdSlack} prune=${e.previewWouldPruneThreshold}`);
    console.log(`  harvest zeroGold=${h.zeroDamageGold} totalGold=${h.totalHarvestGold} offers=${h.offerCount} positive=${h.positiveDamageOfferCount} excluded=${h.excludedUnwinnableGold}`);
    console.log(`  best buys=${b.purchaseCount} needGold=${b.requiredEnemyGold} frac=${b.fractionalHarvestDamage} discrete=${b.discreteHarvestDamage} increment=${b.discreteIncrement} access=${c.accessDamageLowerBound} accessPenalty=${b.accessAdditionalPenalty} upper=${b.previewUpperBound}`);
  }
}
