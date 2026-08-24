import { screenNumericLevers } from '../src/tuner/numeric-sensitivity-screen.js';
import { synthesizeBudgetedNumericCandidates } from '../src/tuner/numeric-candidate-synthesis.js';
import { searchCandidatePressureRays } from '../src/tuner/numeric-ray-search.js';
import { adaptNumericRayCandidate } from '../src/tuner/adaptive-numeric-ray.js';

function numberFlag(name, fallback) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((value) => value.startsWith(prefix));
  if (!arg) return fallback;
  const value = Number(arg.slice(prefix.length));
  if (!Number.isFinite(value)) throw new Error(`Invalid --${name} value.`);
  return value;
}

const json = process.argv.includes('--json');
const topK = Math.trunc(numberFlag('top-k', 16));
const maxCandidates = Math.trunc(numberFlag('max-candidates', 4));
const targetMargin = numberFlag('target-margin', 0.165);
const maxAdaptiveIterations = Math.trunc(numberFlag('max-adaptive-iterations', 6));
const maxLocalPasses = Math.trunc(numberFlag('max-local-passes', 12));
const marginTolerance = numberFlag('margin-tolerance', 0.02);
const stepTolerance = numberFlag('step-tolerance', 0.01);

const screen = screenNumericLevers({ staticTopK: topK, probeRelativeStep: 0.10 });
const candidates = synthesizeBudgetedNumericCandidates({
  screenReport: screen,
  maxCandidates,
  editBudget: 0.30,
  maxParameters: 3
});
const protectedRays = searchCandidatePressureRays({
  screenReport: screen,
  candidates,
  targetMargin,
  refineIterations: 4,
  exactFinal: true
});
const candidateById = new Map(candidates.map((candidate) => [candidate.id, candidate]));
const seedRay = protectedRays.find((ray) => ray.exactEvaluation?.acceptedHardConstraints === true && ray.best?.solvable)
  ?? protectedRays.find((ray) => ray.best?.solvable)
  ?? null;
if (!seedRay) throw new Error('No protected numeric ray is available for adaptive response.');
const candidate = candidateById.get(seedRay.candidateId);
if (!candidate) throw new Error(`Missing synthesized candidate for ${seedRay.candidateId}.`);

const adaptive = adaptNumericRayCandidate({
  screenReport: screen,
  candidate,
  targetMargin,
  marginTolerance,
  stepTolerance,
  maxAdaptiveIterations,
  maxLocalPasses,
  maxExpanded: 5_000,
  maxGenerated: 50_000
});

const report = {
  schemaVersion: 1,
  model: 'adaptive-numeric-ray-cli-v0.1',
  publishable: false,
  seedProtectedRay: {
    candidateId: seedRay.candidateId,
    leverKeys: seedRay.leverKeys,
    best: seedRay.best,
    exactEvaluation: seedRay.exactEvaluation
  },
  adaptive
};

if (json) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  console.log('Adaptive numeric ray');
  console.log(`seed=${seedRay.candidateId} protectedStep=${seedRay.best?.relativeStep} protectedMargin=${seedRay.best?.margin}`);
  console.log(`adaptiveStep=${adaptive.best?.relativeStep} margin=${adaptive.best?.margin} hp=${adaptive.best?.finalHp} converged=${adaptive.converged} hard=${adaptive.acceptedHardConstraints}`);
  console.log(`bracket=${adaptive.bracket ? `${adaptive.bracket.lowStep}-${adaptive.bracket.highStep}` : 'none'} monotonicViolations=${adaptive.monotonicViolations?.length ?? 0}`);
  console.log(`proof=${adaptive.solver?.solvable}/${adaptive.solver?.exact} localImprovements=${adaptive.counterfactuals?.improvedMutationCount} recovery=${adaptive.counterfactuals?.recoveryRate} catastrophic=${adaptive.counterfactuals?.catastrophicRate}`);
  console.log(`levers=${adaptive.leverKeys.join(',')}`);
}
