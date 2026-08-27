import { analyzeEventOrderJointBestResponse } from '../src/analyzer/event-order-joint-best-response.js';
import { screenNumericLevers } from '../src/tuner/numeric-sensitivity-screen.js';
import { synthesizeBudgetedNumericCandidates } from '../src/tuner/numeric-candidate-synthesis.js';
import {
  DISTRIBUTED_PRESSURE_LEVER_KEYS,
  findNumericRayCandidateByLeverKeys,
  searchEventOrderWitnessPressureRay
} from '../src/tuner/event-order-witness-ray.js';
import { REVIEW_CANDIDATES } from '../src/tuner/review-candidates.js';

function numberFlag(name, fallback) {
  const prefix = `--${name}=`;
  const raw = process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
  if (raw == null) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value)) throw new Error(`Invalid --${name}: ${raw}`);
  return value;
}

function integerFlag(name, fallback) {
  const value = numberFlag(name, fallback);
  if (!Number.isInteger(value) || value < 1) throw new Error(`--${name} must be a positive integer.`);
  return value;
}

const json = process.argv.includes('--json');
const referenceStep = numberFlag('reference-step', 0.6453125);
const targetMargin = numberFlag('target-margin', 0.165);
const maxPurchasePasses = integerFlag('max-purchase-passes', 12);

// Rebuild the stronger player witness from repository algorithms rather than
// depending on a transient CI artifact or VM-local 241-step constant.
const jointSeed = analyzeEventOrderJointBestResponse({
  candidate: REVIEW_CANDIDATES.distributedPressureV1,
  maxPurchasePasses,
  boundaryMaxExpanded: integerFlag('seed-boundary-max-expanded', 8_000),
  boundaryMaxGenerated: integerFlag('seed-boundary-max-generated', 100_000),
  boundaryMaxGoals: integerFlag('seed-boundary-max-goals', 64),
  maxTransitionSeeds: integerFlag('seed-transition-count', 8),
  transitionMaxExpanded: integerFlag('seed-transition-max-expanded', 5_000),
  transitionMaxGenerated: integerFlag('seed-transition-max-generated', 70_000),
  suffixMaxExpanded: integerFlag('seed-suffix-max-expanded', 8_000),
  suffixMaxGenerated: integerFlag('seed-suffix-max-generated', 100_000)
});
const seedLocal = jointSeed.jointPurchaseResponse;
if (!seedLocal?.bestWitness || seedLocal.bestReplay?.ok !== true) {
  throw new Error('Could not rebuild a replayable joint event-order witness.');
}

const screen = screenNumericLevers({
  staticTopK: integerFlag('top-k', 16),
  probeRelativeStep: 0.10
});
const candidates = synthesizeBudgetedNumericCandidates({
  screenReport: screen,
  maxCandidates: integerFlag('max-candidates', 8),
  editBudget: 0.30,
  maxParameters: 3,
  sourcePoolSize: integerFlag('source-pool-size', 12)
});
const candidate = findNumericRayCandidateByLeverKeys(candidates, DISTRIBUTED_PRESSURE_LEVER_KEYS);
if (!candidate) {
  throw new Error(`Could not locate distributed-pressure ray by lever keys: ${DISTRIBUTED_PRESSURE_LEVER_KEYS.join(', ')}`);
}

const ray = searchEventOrderWitnessPressureRay({
  screenReport: screen,
  candidate,
  seedWitness: seedLocal.bestWitness,
  referenceStep,
  targetMargin,
  marginTolerance: numberFlag('margin-tolerance', 0.02),
  stepTolerance: numberFlag('step-tolerance', 0.005),
  refineIterations: integerFlag('refine-iterations', 6),
  maxPurchasePasses
});

const report = {
  schemaVersion: 1,
  model: 'event-order-witness-ray-cli-v0.1',
  publishable: false,
  productionWriteAllowed: false,
  seed: {
    candidateId: jointSeed.candidateId,
    chainExploitHp: jointSeed.chain?.exploit?.terminalHp ?? null,
    jointBestHp: seedLocal.bestTerminalHp,
    jointMinMargin: seedLocal.bestReplay?.minNormalizedHpMargin ?? null,
    jointLocalOptimal: seedLocal.localOptimal,
    jointWitnessHash: seedLocal.bestWitness?.witnessHash ?? null,
    steps: seedLocal.bestWitness?.steps?.length ?? 0,
    shopSteps: seedLocal.shopSteps ?? null,
    improvementPasses: seedLocal.improvementPasses ?? null,
    evaluatedMutations: seedLocal.evaluatedMutations ?? null
  },
  ray
};

if (json) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  console.log('Event-order witness-aware numeric ray');
  console.log(`seedHp=${report.seed.jointBestHp} seedMargin=${report.seed.jointMinMargin} witness=${report.seed.jointWitnessHash}`);
  console.log(`candidate=${ray.candidateId} levers=${ray.leverKeys.join(',')}`);
  console.log(`bestStep=${ray.best?.relativeStep} bestHp=${ray.best?.finalHp} margin=${ray.best?.margin} target=${ray.targetMargin} converged=${ray.converged}`);
  console.log(`bracket=${ray.bracket ? `${ray.bracket.lowStep}-${ray.bracket.highStep}` : 'none'} violations=${ray.monotonicViolations.length}`);
  for (const sample of ray.samples) {
    console.log(`SAMPLE step=${sample.relativeStep} hp=${sample.finalHp} margin=${sample.margin} status=${sample.pressureStatus} local=${sample.localSearch?.localOptimal} passes=${sample.localSearch?.improvementPasses} witness=${sample.witnessHash}`);
  }
}
