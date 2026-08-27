import { analyzeThresholdCoreTransition } from '../src/analyzer/event-order-core-transition-proof.js';
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
const report = analyzeThresholdCoreTransition({
  candidate: REVIEW_CANDIDATES.distributedPressureV1,
  fromCores,
  toCores: integerFlag('to-cores', fromCores + 1),
  boundaryMaxExpanded: integerFlag('boundary-max-expanded', 6_000),
  boundaryMaxGenerated: integerFlag('boundary-max-generated', 70_000),
  boundaryMaxGoals: integerFlag('boundary-max-goals', 32),
  maxTransitionSeeds: integerFlag('max-transition-seeds', 4),
  transitionMaxExpanded: integerFlag('transition-max-expanded', 2_500),
  transitionMaxGenerated: integerFlag('transition-max-generated', 35_000)
});

if (json) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  const b = report.boundary ?? {};
  console.log('Threshold-relevant core transition proof');
  console.log(`candidate=${report.candidateId} transition=c${report.fromCores}->c${report.toCores} status=${report.status} found=${report.transitionFound} exactNoTransition=${report.exactNoTransition}`);
  console.log(`boundary relevant=${b.verifiedRelevantGoals}/${b.discoveredGoals} exact=${b.coverageExact} expanded=${b.expandedStates} generated=${b.generatedStates} stop=${b.stoppedReason}`);
  for (const attempt of report.attempts ?? []) {
    const s = attempt.solver ?? {};
    console.log(`seed=${attempt.prefixCertificateHash} ub=${attempt.prefixUpperBound} hp=${attempt.prefixResources?.hp} gold=${attempt.prefixResources?.gold} p=${attempt.prefixShopPurchases} found=${attempt.transitionFound} exactNo=${attempt.exactNoTransition} expanded=${s.expandedStates} generated=${s.generatedStates} bound=${s.prunedBound} stop=${s.stoppedReason} nextUb=${attempt.replay?.nextStateUpperBound}`);
  }
}
