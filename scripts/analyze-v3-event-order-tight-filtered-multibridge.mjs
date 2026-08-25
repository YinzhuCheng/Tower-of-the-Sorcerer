import { analyzeThresholdCoreTightFilteredMultiBridgeChain } from '../src/analyzer/event-order-core-transition-tight-filter.js';
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
const analysis = analyzeThresholdCoreTightFilteredMultiBridgeChain({
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
  bridgeMaxGoalsPerPrefix: integerFlag('bridge-max-goals-per-prefix', 32),
  maxSuffixBridges: integerFlag('max-suffix-bridges', 6),
  suffixMaxExpandedPerBridge: integerFlag('suffix-max-expanded-per-bridge', 3_000),
  suffixMaxGeneratedPerBridge: integerFlag('suffix-max-generated-per-bridge', 50_000),
  suffixPrioritySlackBucket: integerFlag('suffix-priority-slack-bucket', 500)
});

const report = {
  schemaVersion: 1,
  model: 'distributed-pressure-v3-tight-filtered-multibridge-v0.1',
  rebuild: {
    terminalHp: rebuilt.terminalHp,
    minNormalizedHpMargin: rebuilt.minNormalizedHpMargin,
    witnessHash: rebuilt.witnessHash,
    semanticFingerprint: rebuilt.semanticFingerprint,
    purchaseCount: rebuilt.purchaseCount,
    localOptimal: rebuilt.localOptimal
  },
  analysis
};

if (json) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  const bp = analysis.bridgeProof ?? {};
  console.log(`V3 tight-filtered multibridge status=${analysis.status} exploit=${analysis.exploitFound} exactNo=${analysis.exactNoExploit}`);
  console.log(`reference=${rebuilt.terminalHp} semantic=${rebuilt.semanticFingerprint}`);
  console.log(`prefix relevant=${analysis.prefixSchedule?.verifiedRelevantPrefixCount} scheduled=${analysis.prefixSchedule?.scheduledPrefixCount} boundaryExact=${analysis.fromBoundary?.coverageExact}`);
  console.log(`bridge closed=${bp.boundClosedCount} residual=${bp.residualCount} summary=${JSON.stringify(bp.summary)}`);
  for (const attempt of analysis.suffix?.attempts ?? []) {
    const s = attempt.solver ?? {};
    const t = s.telemetry ?? {};
    console.log(`suffix prefix=${attempt.prefixCertificateHash} bridge=${attempt.bridgeId} p=${attempt.shopPurchases} hp=${attempt.resources?.hp} gold=${attempt.resources?.gold} old=${attempt.oldUpperBound} tight=${attempt.tightUpperBound} slack=${attempt.tightThresholdSlack} expanded=${s.expandedStates} generated=${s.generatedStates} bound=${s.prunedBound} exact=${s.exact} stop=${s.stoppedReason} travel=${t.travelGeneratedRatio} late=${t.lateFloorExpandedRatio} exploit=${attempt.exploit}`);
  }
  console.log(`exploitHp=${analysis.exploit?.terminalHp ?? null} delta=${analysis.exploit?.deltaHp ?? null} replay=${analysis.exploit?.witnessReplay?.ok ?? null} semantic=${analysis.exploit?.witness?.semanticFingerprint ?? null}`);
}
