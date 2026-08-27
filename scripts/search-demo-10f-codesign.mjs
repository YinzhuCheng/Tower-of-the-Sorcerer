import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import {
  DEMO10_CODESIGN_POLICY_SPECS,
  summarizeDemoTenFloorCheckpoints
} from '../src/analyzer/demo-10-floor-checkpoints.js';
import {
  demoTenFloorQualityLoss,
  summarizeDemoTenFloorPortfolio
} from '../src/game/demo-10-floor-quality.js';
import { runTowerCodesignBeamSearch } from '../src/tuner/codesign-beam-search.js';
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
    historyInflation: Number(profile.historyInflation.toFixed(3))
  }]));
}

function evaluateCandidate(candidate) {
  return withDemoTenFloorCandidate(candidate, catalog, () => {
    const qualityReports = qualitySpecs.map(runPolicy);
    const quality = summarizeDemoTenFloorPortfolio(qualityReports);
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
    return {
      solvabilityWitnessVerified: true,
      qualityLoss: demoTenFloorQualityLoss(quality) / 50,
      funLoss: checkpoints.choiceLoss,
      editLoss: demoTenFloorCandidateEditLoss(candidate, catalog),
      prunabilityEvidence: checkpoints.prunabilityEvidence,
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
        maxHistoryInflation: checkpoints.maxHistoryInflation,
        oversizedCheckpoints: checkpoints.oversizedCheckpoints,
        collapsedCheckpoints: checkpoints.collapsedCheckpoints,
        checkpoints: compactCheckpoint(checkpoints)
      }
    };
  });
}

const result = runTowerCodesignBeamSearch({
  seeds: [{ mutationIds: [] }],
  expand: (candidate) => expandDemoTenFloorCandidate(candidate, catalog, { maxEdits: 2 }),
  evaluate: evaluateCandidate,
  keyOf: demoTenFloorCandidateKey,
  beamWidth: 6,
  rounds: 2,
  scoreOptions: {
    qualityWeight: 0.45,
    funWeight: 0.20,
    prunabilityWeight: 0.30,
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
  heuristicOnly: result.heuristicOnly,
  productionWriteAllowed: result.productionWriteAllowed,
  mutationCatalogSize: catalog.length,
  policyPortfolioSize: DEMO10_CODESIGN_POLICY_SPECS.length,
  evaluatedCandidates: result.evaluatedCandidates,
  history: result.history,
  best: compactEntry(result.best),
  portfolio: result.portfolio.map(compactEntry)
}, null, 2));

if (result.productionWriteAllowed !== false) {
  throw new Error('10F co-design search must never enable production writes.');
}
if (!result.best || !Number.isFinite(result.best.score.score)) {
  throw new Error('10F co-design search failed to retain any quality-gated candidate.');
}
