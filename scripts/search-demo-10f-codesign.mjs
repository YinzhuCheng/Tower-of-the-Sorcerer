import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import {
  DEMO10_CODESIGN_POLICY_SPECS,
  summarizeDemoTenFloorCheckpoints
} from '../src/analyzer/demo-10-floor-checkpoints.js';
import {
  DEMO10_PLAYABILITY_TARGETS,
  demoTenFloorPlayabilityLoss,
  summarizeDemoTenFloorPortfolio
} from '../src/game/demo-10-floor-quality.js';
import { runTowerCodesignBeamSearch } from '../src/tuner/codesign-beam-search.js';
import { proposeDemoTenFloorAdaptiveMutations } from '../src/tuner/demo-10-floor-adaptive-mutations.js';
import {
  createDemoTenFloorMutationCatalog,
  demoTenFloorCandidateEditLoss,
  demoTenFloorCandidateKey,
  expandDemoTenFloorCandidate,
  withDemoTenFloorCandidate
} from '../src/tuner/demo-10-floor-mutations.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
const { runGreedyShopStrategy } = await import('../src/solver/greedy-strategy.js');

const catalog = createDemoTenFloorMutationCatalog();
const qualitySpecs = DEMO10_CODESIGN_POLICY_SPECS.filter((spec) => spec.qualityGate);
const explorationSpecs = DEMO10_CODESIGN_POLICY_SPECS.filter((spec) => !spec.qualityGate);

function runPolicy(spec) {
  return runGreedyShopStrategy({
    shopCycle: spec.shopCycle,
    shopPlan: spec.shopPlan,
    holyPolicy: spec.holyPolicy,
    maxIterations: 8_000
  });
}

function compactCheckpoint(checkpoints) {
  return Object.fromEntries(Object.entries(checkpoints.floors).map(([floor, profile]) => [floor, {
    sampledPolicies: profile.sampledPolicies,
    uniqueResourceStates: profile.uniqueResourceStates,
    paretoWidth: profile.paretoWidth,
    policyMultiplicity: Number(profile.policyMultiplicity.toFixed(3)),
    eventOrderHistoryInflation: profile.eventOrderHistoryInflation
  }]));
}

function compactMutationPlan(plan) {
  return {
    reasons: plan.reasons,
    issueFloors: plan.issueFloors,
    unhandledFloors: plan.unhandledFloors,
    policyMultiplicityIgnored: plan.policyMultiplicityIgnored,
    selectedMutationCount: plan.selectedMutationIds.length,
    selectedMutationIds: plan.selectedMutationIds
  };
}

function evaluateCandidate(candidate) {
  return withDemoTenFloorCandidate(candidate, catalog, () => {
    const qualityReports = qualitySpecs.map(runPolicy);
    const quality = summarizeDemoTenFloorPortfolio(qualityReports, DEMO10_PLAYABILITY_TARGETS);
    const witnessVerified = quality.violations.length === 0 && Boolean(quality.winner?.solvable);
    if (!witnessVerified) {
      return {
        solvabilityWitnessVerified: false,
        qualityLoss: 1000 + quality.violations.length,
        funLoss: 1,
        editLoss: demoTenFloorCandidateEditLoss(candidate, catalog),
        prunabilityEvidence: {},
        compact: {
          qualityViolations: quality.violations,
          solvableBuilds: quality.solvableBuilds
        }
      };
    }

    const explorationReports = explorationSpecs.map(runPolicy);
    const reports = [...qualityReports, ...explorationReports];
    const specs = [...qualitySpecs, ...explorationSpecs];
    const checkpoints = summarizeDemoTenFloorCheckpoints(reports, { policySpecs: specs });
    const mutationPlan = proposeDemoTenFloorAdaptiveMutations(checkpoints, catalog);
    return {
      solvabilityWitnessVerified: true,
      qualityLoss: demoTenFloorPlayabilityLoss(quality) / 50,
      funLoss: checkpoints.choiceLoss,
      editLoss: demoTenFloorCandidateEditLoss(candidate, catalog),
      prunabilityEvidence: checkpoints.prunabilityEvidence,
      checkpointDiagnostics: checkpoints,
      mutationPlan,
      compact: {
        qualityViolations: quality.violations,
        solvableBuilds: quality.solvableBuilds,
        bestMargin: quality.winner?.minNormalizedHpMargin ?? null,
        weakestMargin: quality.weakestWinningReport?.minNormalizedHpMargin ?? null,
        terminalHpSpread: quality.terminalHpSpread,
        f9ShopCoverage: quality.f9ShopCoverage,
        checkpointChoiceLoss: checkpoints.choiceLoss,
        maxParetoWidth: checkpoints.maxParetoWidth,
        meanParetoWidth: checkpoints.meanParetoWidth,
        maxPolicyMultiplicity: checkpoints.maxPolicyMultiplicity,
        eventOrderHistoryInflationMeasured: checkpoints.eventOrderHistoryInflationMeasured,
        oversizedCheckpoints: checkpoints.oversizedCheckpoints,
        collapsedCheckpoints: checkpoints.collapsedCheckpoints,
        adaptiveMutationPlan: compactMutationPlan(mutationPlan),
        checkpoints: compactCheckpoint(checkpoints)
      }
    };
  });
}

function expandFromEvidence(candidate, _round, parentEvaluation) {
  const requested = parentEvaluation?.mutationPlan?.selectedMutationIds ?? [];
  const activeIds = new Set([...(candidate.mutationIds ?? []), ...requested]);
  const activeCatalog = catalog.filter((mutation) => activeIds.has(mutation.id));
  return expandDemoTenFloorCandidate(candidate, activeCatalog, { maxEdits: 2 });
}

const result = runTowerCodesignBeamSearch({
  seeds: [{ mutationIds: [] }],
  expand: expandFromEvidence,
  evaluate: evaluateCandidate,
  keyOf: demoTenFloorCandidateKey,
  beamWidth: 6,
  rounds: 2,
  scoreOptions: {
    qualityWeight: 0.55,
    funWeight: 0.20,
    prunabilityWeight: 0.20,
    editWeight: 0.05,
    prunabilityOptions: {
      weights: {
        paretoWidth: 0.72,
        historyInflation: 0.28
      }
    }
  }
});

const compactEntry = (entry) => entry ? ({
  key: entry.key,
  mutationIds: entry.candidate.mutationIds,
  score: entry.score.score,
  prunabilityScore: entry.score.prunability.score,
  compact: entry.evaluation.compact
}) : null;

console.log('DEMO10_CODESIGN_SEARCH');
console.log(JSON.stringify({
  model: result.model,
  milestone: 'playable-first-10f',
  heuristicOnly: result.heuristicOnly,
  productionWriteAllowed: result.productionWriteAllowed,
  mutationCatalogSize: catalog.length,
  policyPortfolioSize: DEMO10_CODESIGN_POLICY_SPECS.length,
  qualityPolicyCount: qualitySpecs.length,
  diagnosticPolicyCount: explorationSpecs.length,
  evaluatedCandidates: result.evaluatedCandidates,
  history: result.history,
  best: compactEntry(result.best),
  portfolio: result.portfolio.map(compactEntry)
}, null, 2));

if (result.productionWriteAllowed !== false) {
  throw new Error('10F co-design search must never enable production writes.');
}
if (!result.best || !Number.isFinite(result.best.score.score)) {
  throw new Error('10F co-design search failed to retain any playability-gated candidate.');
}
