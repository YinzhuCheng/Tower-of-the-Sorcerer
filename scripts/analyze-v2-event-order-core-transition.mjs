import { analyzeThresholdCoreTransition } from '../src/analyzer/event-order-core-transition-proof.js';
import { rebuildDistributedPressureV2Reference } from '../src/tuner/review-candidate-v2-rebuild.js';
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
const fromCores = integerFlag('from-cores', 6);
const rebuilt = rebuildDistributedPressureV2Reference({
  maxPurchasePasses: integerFlag('max-purchase-passes', 12)
});
const report = analyzeThresholdCoreTransition({
  candidate: REVIEW_CANDIDATES.distributedPressureV2,
  referenceWitness: rebuilt.witness,
  fromCores,
  toCores: integerFlag('to-cores', fromCores + 1),
  boundaryMaxExpanded: integerFlag('boundary-max-expanded', 8_000),
  boundaryMaxGenerated: integerFlag('boundary-max-generated', 100_000),
  boundaryMaxGoals: integerFlag('boundary-max-goals', 64),
  maxTransitionSeeds: integerFlag('max-transition-seeds', 8),
  transitionMaxExpanded: integerFlag('transition-max-expanded', 5_000),
  transitionMaxGenerated: integerFlag('transition-max-generated', 70_000)
});

const output = {
  schemaVersion: 1,
  model: 'distributed-pressure-v2-core-transition-profile-v0.1',
  rebuild: {
    terminalHp: rebuilt.terminalHp,
    minNormalizedHpMargin: rebuilt.minNormalizedHpMargin,
    witnessHash: rebuilt.witnessHash,
    purchaseCount: rebuilt.purchaseCount,
    sourceRayStep: rebuilt.sourceRayStep,
    localOptimal: rebuilt.localOptimal
  },
  transition: report
};

if (json) {
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
} else {
  const b = report.boundary ?? {};
  console.log('Distributed-pressure V2 threshold core transition');
  console.log(`reference=${rebuilt.terminalHp} witness=${rebuilt.witnessHash} transition=c${report.fromCores}->c${report.toCores}`);
  console.log(`status=${report.status} found=${report.transitionFound} exactNo=${report.exactNoTransition}`);
  console.log(`boundary relevant=${b.verifiedRelevantGoals}/${b.discoveredGoals} exact=${b.coverageExact} expanded=${b.expandedStates} generated=${b.generatedStates} stop=${b.stoppedReason}`);
  for (const attempt of report.attempts ?? []) {
    const s = attempt.solver ?? {};
    console.log(`seed=${attempt.prefixCertificateHash} ub=${attempt.prefixUpperBound} hp=${attempt.prefixResources?.hp} gold=${attempt.prefixResources?.gold} p=${attempt.prefixShopPurchases} found=${attempt.transitionFound} exactNo=${attempt.exactNoTransition} expanded=${s.expandedStates} generated=${s.generatedStates} bound=${s.prunedBound} stop=${s.stoppedReason} nextUb=${attempt.replay?.nextStateUpperBound}`);
  }
}
