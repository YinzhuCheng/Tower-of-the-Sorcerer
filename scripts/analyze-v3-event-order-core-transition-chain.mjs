import { analyzeThresholdCoreTransitionChain } from '../src/analyzer/event-order-core-transition-chain.js';
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
const fromCores = integerFlag('from-cores', 6);
const rebuilt = rebuildDistributedPressureV3Reference({
  maxPurchasePasses: integerFlag('max-purchase-passes', 12)
});
const chain = analyzeThresholdCoreTransitionChain({
  candidate: REVIEW_CANDIDATES.distributedPressureV3,
  referenceWitness: rebuilt.witness,
  fromCores,
  toCores: integerFlag('to-cores', fromCores + 1),
  boundaryMaxExpanded: integerFlag('boundary-max-expanded', 8_000),
  boundaryMaxGenerated: integerFlag('boundary-max-generated', 100_000),
  boundaryMaxGoals: integerFlag('boundary-max-goals', 64),
  maxTransitionSeeds: integerFlag('max-transition-seeds', 8),
  transitionMaxExpanded: integerFlag('transition-max-expanded', 5_000),
  transitionMaxGenerated: integerFlag('transition-max-generated', 70_000),
  suffixMaxExpanded: integerFlag('suffix-max-expanded', 8_000),
  suffixMaxGenerated: integerFlag('suffix-max-generated', 100_000),
  suffixPriorityMode: 'late-game-threshold',
  suffixPrioritySlackBucket: integerFlag('suffix-priority-slack-bucket', 500)
});

const report = {
  schemaVersion: 1,
  model: 'distributed-pressure-v3-core-transition-chain-profile-v0.1',
  candidateId: REVIEW_CANDIDATES.distributedPressureV3.id,
  rebuild: {
    terminalHp: rebuilt.terminalHp,
    minNormalizedHpMargin: rebuilt.minNormalizedHpMargin,
    witnessHash: rebuilt.witnessHash,
    semanticFingerprint: rebuilt.semanticFingerprint,
    purchaseCount: rebuilt.purchaseCount,
    localOptimal: rebuilt.localOptimal
  },
  chain
};

if (json) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  const suffix = chain.suffix?.solver ?? {};
  const telemetry = suffix.telemetry ?? {};
  const exploit = chain.exploit ?? {};
  console.log(`V3 c${fromCores}->c${chain.toCores} chain status=${chain.status} exploit=${chain.exploitFound}`);
  console.log(`reference=${rebuilt.terminalHp} semantic=${rebuilt.semanticFingerprint} transition=${chain.transition?.status} bridgeUpper=${chain.bridge?.optimisticTerminalHpUpperBound ?? null}`);
  console.log(`suffix solvable=${suffix.solvable} exact=${suffix.exact} expanded=${suffix.expandedStates} generated=${suffix.generatedStates} bound=${suffix.prunedBound} stop=${suffix.stoppedReason}`);
  console.log(`travelRatio=${telemetry.travelGeneratedRatio ?? null} lateRatio=${telemetry.lateFloorExpandedRatio ?? null}`);
  console.log(`exploitHp=${exploit.terminalHp ?? null} delta=${exploit.deltaHp ?? null} replay=${exploit.witnessReplay?.ok ?? null}`);
}
