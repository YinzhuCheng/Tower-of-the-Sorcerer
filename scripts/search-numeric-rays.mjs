import { screenNumericLevers } from '../src/tuner/numeric-sensitivity-screen.js';
import { synthesizeBudgetedNumericCandidates } from '../src/tuner/numeric-candidate-synthesis.js';
import { searchCandidatePressureRays } from '../src/tuner/numeric-ray-search.js';

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
const editBudget = numberFlag('seed-budget', 0.30);
const maxParameters = Math.trunc(numberFlag('max-parameters', 3));
const refineIterations = Math.trunc(numberFlag('refine-iterations', 4));

const screen = screenNumericLevers({ staticTopK: topK, probeRelativeStep: 0.10 });
const candidates = synthesizeBudgetedNumericCandidates({
  screenReport: screen,
  maxCandidates,
  editBudget,
  maxParameters
});
const rays = searchCandidatePressureRays({
  screenReport: screen,
  candidates,
  targetMargin,
  refineIterations,
  exactFinal: true
});

const report = {
  schemaVersion: 1,
  model: 'numeric-pressure-ray-search-v0.1',
  publishable: false,
  targetMargin,
  screen: {
    catalogueSize: screen.catalogueSize,
    baseline: screen.baseline,
    staticTopK: screen.staticTopK
  },
  candidates,
  rays
};

if (json) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  console.log('Numeric pressure ray search');
  console.log(`target=${targetMargin} candidates=${rays.length}`);
  for (const [index, ray] of rays.entries()) {
    console.log([
      `${String(index + 1).padStart(2, ' ')}. ${ray.candidateId}`,
      `step=${ray.best?.relativeStep?.toFixed?.(4) ?? 'n/a'}`,
      `margin=${ray.best?.margin ?? 'n/a'}`,
      `distance=${ray.best?.targetDistance ?? 'n/a'}`,
      `hard=${ray.exactEvaluation?.acceptedHardConstraints ?? false}`,
      `levers=${ray.leverKeys.join(',')}`
    ].join(' | '));
  }
}
