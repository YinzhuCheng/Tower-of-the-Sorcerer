import { screenNumericLevers } from '../src/tuner/numeric-sensitivity-screen.js';
import {
  evaluateSynthesizedNumericCandidates,
  synthesizeBudgetedNumericCandidates
} from '../src/tuner/numeric-candidate-synthesis.js';

function readNumberFlag(name, fallback) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((value) => value.startsWith(prefix));
  if (!arg) return fallback;
  const value = Number(arg.slice(prefix.length));
  if (!Number.isFinite(value)) throw new Error(`Invalid --${name} value.`);
  return value;
}

const json = process.argv.includes('--json');
const evaluate = process.argv.includes('--evaluate');
const topK = Math.trunc(readNumberFlag('top-k', 16));
const maxCandidates = Math.trunc(readNumberFlag('max-candidates', 6));
const editBudget = readNumberFlag('edit-budget', 0.30);
const maxParameters = Math.trunc(readNumberFlag('max-parameters', 3));
const probeRelativeStep = readNumberFlag('relative-step', 0.10);

const screen = screenNumericLevers({
  staticTopK: topK,
  probeRelativeStep
});
const candidates = synthesizeBudgetedNumericCandidates({
  screenReport: screen,
  maxCandidates,
  editBudget,
  maxParameters
});
const evaluated = evaluate
  ? evaluateSynthesizedNumericCandidates({ candidates })
  : null;

const report = {
  schemaVersion: 1,
  model: 'budgeted-numeric-candidate-synthesis-v0.1',
  publishable: false,
  screen: {
    catalogueSize: screen.catalogueSize,
    staticTopK: screen.staticTopK,
    probeRelativeStep: screen.probeRelativeStep,
    baseline: screen.baseline
  },
  synthesis: {
    maxCandidates,
    editBudget,
    maxParameters,
    candidates
  },
  evaluated
};

if (json) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  console.log('Budgeted numeric candidate synthesis');
  console.log(`candidates=${candidates.length} budget=${editBudget} maxParameters=${maxParameters} evaluated=${Boolean(evaluated)}`);
  const rows = evaluated ?? candidates.map((candidate) => ({ candidate, evaluation: null }));
  for (const [index, row] of rows.entries()) {
    const candidate = row.candidate;
    const evaluation = row.evaluation;
    console.log([
      `${String(index + 1).padStart(2, ' ')}. ${candidate.id}`,
      `levers=${candidate.leverKeys.join(',')}`,
      `budget=${candidate.editBudgetUsed.toFixed(3)}`,
      evaluation ? `hard=${evaluation.acceptedHardConstraints}` : null,
      evaluation?.pressure ? `margin=${evaluation.pressure.minNormalizedHpMargin}` : null,
      evaluation ? `score=${Number.isFinite(evaluation.score) ? evaluation.score.toFixed(4) : 'inf'}` : null
    ].filter(Boolean).join(' | '));
  }
}
