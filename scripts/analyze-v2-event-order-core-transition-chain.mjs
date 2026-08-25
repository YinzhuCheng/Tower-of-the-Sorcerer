import { analyzeThresholdCoreTransitionChain } from '../src/analyzer/event-order-core-transition-chain.js';
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

function choiceFlag(name, fallback, choices) {
  const prefix = `--${name}=`;
  const raw = process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
  const value = raw ?? fallback;
  if (!choices.includes(value)) throw new Error(`Invalid --${name}: ${value}`);
  return value;
}

const json = process.argv.includes('--json');
const fromCores = integerFlag('from-cores', 6);
const suffixPriorityMode = choiceFlag(
  'suffix-priority',
  'late-game-threshold',
  ['baseline', 'late-game-threshold']
);
const suffixPrioritySlackBucket = integerFlag('suffix-priority-slack-bucket', 25);
const rebuilt = rebuildDistributedPressureV2Reference({
  maxPurchasePasses: integerFlag('max-purchase-passes', 12)
});
const chain = analyzeThresholdCoreTransitionChain({
  candidate: REVIEW_CANDIDATES.distributedPressureV2,
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
  suffixPriorityMode,
  suffixPrioritySlackBucket
});

const report = {
  schemaVersion: 2,
  model: 'distributed-pressure-v2-core-transition-chain-profile-v0.2-suffix-priority',
  candidateId: REVIEW_CANDIDATES.distributedPressureV2.id,
  suffixPriority: {
    mode: suffixPriorityMode,
    slackBucket: suffixPriorityMode === 'late-game-threshold'
      ? suffixPrioritySlackBucket
      : null
  },
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
  console.log('V2 event-order core transition chain');
  console.log(`reference=${rebuilt.terminalHp} semantic=${rebuilt.semanticFingerprint} status=${chain.status} exploit=${chain.exploitFound}`);
  console.log(`priority=${suffixPriorityMode} slackBucket=${report.suffixPriority.slackBucket ?? 'n/a'} transition=${chain.transition?.status} bridgeUpper=${chain.bridge?.optimisticTerminalHpUpperBound ?? null}`);
  console.log(`suffix solvable=${suffix.solvable} exact=${suffix.exact} expanded=${suffix.expandedStates} generated=${suffix.generatedStates} stop=${suffix.stoppedReason}`);
  console.log(`travel=${telemetry.travelGenerated ?? null} travelRatio=${telemetry.travelGeneratedRatio ?? null} lateExpanded=${telemetry.lateFloorExpanded ?? null} lateRatio=${telemetry.lateFloorExpandedRatio ?? null} queuePeak=${telemetry.queuePeak ?? null} bound=${telemetry.prunedBound ?? null}`);
  console.log(`exploitHp=${exploit.terminalHp ?? null} delta=${exploit.deltaHp ?? null} replay=${exploit.witnessReplay?.ok ?? null} witness=${exploit.witness?.semanticFingerprint ?? null}`);
}
