import { analyzeV3C7FixedPurchaseBoundDiagnostics } from '../src/analyzer/event-order-core-bridge-bound-diagnostics.js';
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
const analysis = analyzeV3C7FixedPurchaseBoundDiagnostics({
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
  model: 'distributed-pressure-v3-c7-bound-diagnostics-v0.1',
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
  console.log(`V3 c7 bound diagnostics status=${analysis.status} reference=${rebuilt.terminalHp}`);
  for (const entry of analysis.representatives ?? []) {
    const r = entry.explanation?.relaxation ?? {};
    const b = entry.explanation?.best ?? {};
    console.log(`${entry.role} p=${entry.shopPurchases} hp=${entry.resources?.hp} gold=${entry.resources?.gold} cards=${entry.resources?.sun}/${entry.resources?.moon}/${entry.resources?.star} ub=${entry.upperBound} slack=${entry.thresholdSlack}`);
    console.log(`  freeHp=${r.flatHpGain} freeAtk=${r.flatAtkGain} freeDef=${r.flatDefGain} enemyGold=${r.remainingEnemyGold} purchases=${r.additionalPurchases} bestBuys=${b.purchaseCount} opts=${b.purchaseOptions} purchaseCost=${b.purchaseCost} requiredEnemyGold=${b.requiredEnemyGold} harvestDamage=${b.fractionalHarvestDamage} finalDamage=${b.finalBossDamageLowerBound} hpBeforeFinal=${b.hpBeforeFinal}`);
  }
}
