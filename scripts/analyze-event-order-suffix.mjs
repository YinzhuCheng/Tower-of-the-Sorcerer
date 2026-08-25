import { analyzeCoreSuffixEventOrder } from '../src/analyzer/event-order-suffix-response.js';
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
const report = analyzeCoreSuffixEventOrder({
  candidate: REVIEW_CANDIDATES.distributedPressureV1,
  targetCores: integerFlag('target-cores', 7),
  boundaryMaxExpanded: integerFlag('boundary-max-expanded', 8_000),
  boundaryMaxGenerated: integerFlag('boundary-max-generated', 100_000),
  boundaryMaxGoals: integerFlag('boundary-max-goals', 64),
  maxSuffixSeeds: integerFlag('max-suffix-seeds', 8),
  suffixMaxExpanded: integerFlag('suffix-max-expanded', 3_000),
  suffixMaxGenerated: integerFlag('suffix-max-generated', 45_000)
});

if (json) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  const b = report.boundary ?? {};
  console.log('Staged core-suffix event-order best response');
  console.log(`candidate=${report.candidateId} core=${report.targetCores} status=${report.status} exploit=${report.exploitFound} exact=${report.coverageExact}`);
  console.log(`boundary goals=${b.verifiedGoals}/${b.discoveredGoals} exact=${b.coverageExact} expanded=${b.expandedStates} generated=${b.generatedStates} stop=${b.stoppedReason}`);
  for (const attempt of report.attempts ?? []) {
    const s = attempt.suffix ?? {};
    console.log(`seed=${attempt.prefixCertificateHash} ub=${attempt.optimisticTerminalHpUpperBound} hp=${attempt.bridgeResources?.hp} gold=${attempt.bridgeResources?.gold} purchases=${attempt.bridgeShopPurchases} best=${s.objective?.searchBest} exact=${s.objectiveExact} stop=${s.stoppedReason} exploit=${attempt.exploit}`);
  }
  if (report.exploitFound) {
    console.log(`EXPLOIT terminalHp=${report.exploit.terminalHp} delta=${report.exploit.deltaHp} gain=${report.exploit.relativeGain}`);
  }
}
