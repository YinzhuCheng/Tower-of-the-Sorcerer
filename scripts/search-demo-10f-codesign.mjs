import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import {
  DEMO10_CODESIGN_POLICY_SPECS,
  summarizeDemoTenFloorCheckpoints
} from '../src/analyzer/demo-10-floor-checkpoints.js';
import {
  DEMO10_QUALITY_TARGETS,
  DEMO10_SIMPLE_BUILD_PORTFOLIO,
  demoTenFloorQualityLoss,
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
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorHardMode({ enemies: ENEMIES });

const { runGreedyShopStrategy } = await import('../src/solver/greedy-strategy.js');
const { runExpertNoHpStrategy, EXPERT_NO_HP_STRATEGY_ID } = await import('../src/solver/expert-strategy.js');

const releaseProgressionPriority = 'legacy-clear';
const guardianStressPriority = 'guardian-first';

// The six public recurring cycles are the blocking release witness. Extra policy
// families remain heuristic checkpoint probes. The old no-HP expert is retained
// only as a nonblocking threshold/stress diagnostic during spatial redesign.
const qualitySpecs = DEMO10_CODESIGN_POLICY_SPECS.filter((spec) => spec.qualityGate);
if (qualitySpecs.length !== DEMO10_SIMPLE_BUILD_PORTFOLIO.length) {
  throw new Error(`Expected ${DEMO10_SIMPLE_BUILD_PORTFOLIO.length} release quality policies, got ${qualitySpecs.length}.`);
}
const diagnosticPool = DEMO10_CODESIGN_POLICY_SPECS.filter((spec) => !spec.qualityGate);
const diagnosticSpecs = diagnosticPool.filter((_, index) => index % 3 === 0);
const fullDiagnosticPolicyCount = diagnosticPool.length;
const expertSpec = Object.freeze({ id: EXPERT_NO_HP_STRATEGY_ID });

const baselineExpertPlanning = runExpertNoHpStrategy({
  holyPolicy: 'immediate',
  progressionPriority: guardianStressPriority,
  maxIterations: 8_000,
  horizon: 2,
  attackAdvantageRequired: 2_000
});
const frozenExpertShopPlan = Object.freeze([...(baselineExpertPlanning.planning?.shopPlan ?? [])]);
const catalog = createDemoTenFloorMutationCatalog();

function runQualityPolicy(spec) {
  return runGreedyShopStrategy({
    shopCycle: spec.shopCycle,
    shopPlan: spec.shopPlan,
    holyPolicy: spec.holyPolicy,
    progressionPriority: releaseProgressionPriority,
    maxIterations: 8_000
  });
}

function runDiagnosticPolicy(spec) {
  return runGreedyShopStrategy({
    shopCycle: spec.shopCycle,
    shopPlan: spec.shopPlan,
    holyPolicy: spec.holyPolicy,
    progressionPriority: releaseProgressionPriority,
    maxIterations: 8_000
  });
}

function runExpertDiagnosticPolicy() {
  const report = runGreedyShopStrategy({
    shopCycle: ['def'],
    shopPlan: frozenExpertShopPlan,
    holyPolicy: 'immediate',
    progressionPriority: guardianStressPriority,
    maxIterations: 8_000
  });
  return {
    ...report,
    strategyId: EXPERT_NO_HP_STRATEGY_ID,
    strategy: {
      shopHpAllowed: false,
      defaultInvestment: 'def',
      progressionPriority: guardianStressPriority,
      witnessMode: 'frozen-baseline-plan-with-def-fallback'
    },
    planning: { shopPlan: [...frozenExpertShopPlan] }
  };
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

function compactExpertDiagnostic(report) {
  return {
    blocking: false,
    progressionPriority: guardianStressPriority,
    solvable: report.solvable,
    floor: report.floor,
    failure: report.failure,
    minNormalizedHpMargin: report.minNormalizedHpMargin,
    purchaseCounts: report.purchaseCounts,
    f9Purchases: report.purchaseLog.filter((entry) => entry.floor === 9).length
  };
}

function evaluateCandidate(candidate) {
  return withDemoTenFloorCandidate(candidate, catalog, () => {
    const qualityReports = qualitySpecs.map(runQualityPolicy);
    const quality = summarizeDemoTenFloorPortfolio(qualityReports, DEMO10_QUALITY_TARGETS);
    const releaseWitnessVerified = quality.violations.length === 0;
    if (!releaseWitnessVerified) {
      return {
        solvabilityWitnessVerified: false,
        qualityLoss: 1_000 + quality.violations.length,
        funLoss: 1,
        editLoss: demoTenFloorCandidateEditLoss(candidate, catalog),
        prunabilityEvidence: {},
        compact: {
          qualityViolations: quality.violations,
          solvableBuilds: quality.solvableBuilds,
          f9ShopCoverage: quality.f9ShopCoverage
        }
      };
    }

    const expertReport = runExpertDiagnosticPolicy();
    const diagnosticReports = diagnosticSpecs.map(runDiagnosticPolicy);
    const checkpointReports = [...qualityReports, ...diagnosticReports, expertReport];
    const checkpointSpecs = [...qualitySpecs, ...diagnosticSpecs, expertSpec];
    const checkpoints = summarizeDemoTenFloorCheckpoints(checkpointReports, { policySpecs: checkpointSpecs });
    const mutationPlan = proposeDemoTenFloorAdaptiveMutations(checkpoints, catalog);

    return {
      solvabilityWitnessVerified: true,
      qualityLoss: demoTenFloorQualityLoss(quality, DEMO10_QUALITY_TARGETS) / 50,
      funLoss: checkpoints.choiceLoss,
      editLoss: demoTenFloorCandidateEditLoss(candidate, catalog),
      prunabilityEvidence: checkpoints.prunabilityEvidence,
      checkpointDiagnostics: checkpoints,
      mutationPlan,
      compact: {
        qualityViolations: quality.violations,
        solvableBuilds: quality.solvableBuilds,
        terminalHpSpread: quality.terminalHpSpread,
        winnerLateMinMargin: quality.winnerLateMinMargin,
        weakestWinningLateMargin: quality.weakestWinningLateMargin,
        f9ShopCoverage: quality.f9ShopCoverage,
        expertDiagnostic: compactExpertDiagnostic(expertReport),
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
  return expandDemoTenFloorCandidate(
    candidate,
    catalog.filter((mutation) => activeIds.has(mutation.id)),
    { maxEdits: 2 }
  );
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
    prunabilityOptions: { weights: { paretoWidth: 0.72, historyInflation: 0.28 } }
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
  milestone: 'spatial-redesign-release-portfolio',
  primaryPlayerModel: 'six-build-release-portfolio',
  releaseProgressionPriority,
  guardianStressPriority,
  expertDiagnosticModel: EXPERT_NO_HP_STRATEGY_ID,
  frozenExpertDiagnostic: true,
  heuristicOnly: result.heuristicOnly,
  productionWriteAllowed: result.productionWriteAllowed,
  mutationCatalogSize: catalog.length,
  policyPortfolioSize: qualitySpecs.length + diagnosticSpecs.length + 1,
  qualityPolicyCount: qualitySpecs.length,
  diagnosticPolicyCount: diagnosticSpecs.length + 1,
  fullDiagnosticPolicyCount: fullDiagnosticPolicyCount + 1,
  evaluatedCandidates: result.evaluatedCandidates,
  history: result.history,
  best: compactEntry(result.best),
  portfolio: result.portfolio.map(compactEntry)
}, null, 2));

if (result.productionWriteAllowed !== false) {
  throw new Error('10F co-design search must never enable production writes.');
}
if (!result.best || !Number.isFinite(result.best.score.score)) {
  throw new Error('10F co-design search failed to retain any release-portfolio-gated candidate.');
}
