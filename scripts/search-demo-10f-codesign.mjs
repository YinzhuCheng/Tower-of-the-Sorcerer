import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
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
import {
  assertDemoTenFloorSolverLocks,
  captureDemoTenFloorSolverLocks,
  DEMO10_SOLVER_TUNING_PROFILE,
  selectDemoTenFloorSolverMutations
} from '../src/tuner/demo-10-floor-solver-profile.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorHardMode({ enemies: ENEMIES });

const { runGreedyShopStrategy } = await import('../src/solver/greedy-strategy.js');
const { runExpertNoHpStrategy, EXPERT_NO_HP_STRATEGY_ID } = await import('../src/solver/expert-strategy.js');

const { releaseProgressionPriority, guardianStressPriority } = DEMO10_SOLVER_TUNING_PROFILE;

// The six public recurring cycles are the blocking release witness. Extra policy
// families remain heuristic checkpoint probes. The frozen no-HP expert remains
// a nonblocking threshold/stress diagnostic and cannot reopen the topology lock.
const qualitySpecs = DEMO10_CODESIGN_POLICY_SPECS.filter((spec) => spec.qualityGate);
if (qualitySpecs.length !== DEMO10_SIMPLE_BUILD_PORTFOLIO.length) {
  throw new Error(`Expected ${DEMO10_SIMPLE_BUILD_PORTFOLIO.length} release quality policies, got ${qualitySpecs.length}.`);
}
const diagnosticPool = DEMO10_CODESIGN_POLICY_SPECS.filter((spec) => !spec.qualityGate);
// Do not thin the declared diagnostic portfolio. A candidate that merely looks
// good under a rotating 1/3 sample can overfit the omitted purchase, Holy or
// guardian-order responses.
const diagnosticSpecs = diagnosticPool;
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
const fullCatalog = createDemoTenFloorMutationCatalog();
const catalog = selectDemoTenFloorSolverMutations(fullCatalog);
const lockedCampaign = captureDemoTenFloorSolverLocks({ floors: FLOORS, enemies: ENEMIES });

function runQualityPolicy(spec) {
  return runGreedyShopStrategy({
    shopCycle: spec.shopCycle,
    shopPlan: spec.shopPlan,
    holyPolicy: spec.holyPolicy,
    progressionPriority: spec.progressionPriority ?? releaseProgressionPriority,
    maxIterations: 8_000
  });
}

function runDiagnosticPolicy(spec) {
  return runGreedyShopStrategy({
    shopCycle: spec.shopCycle,
    shopPlan: spec.shopPlan,
    holyPolicy: spec.holyPolicy,
    progressionPriority: spec.progressionPriority ?? releaseProgressionPriority,
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
    assertDemoTenFloorSolverLocks(lockedCampaign, { floors: FLOORS, enemies: ENEMIES });
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
        adaptiveMutationPlanRole: 'diagnostic-only; solver-profile whitelist controls expansion',
        checkpoints: compactCheckpoint(checkpoints)
      }
    };
  });
}

function expandWithinSolverProfile(candidate) {
  return expandDemoTenFloorCandidate(candidate, catalog, {
    maxEdits: DEMO10_SOLVER_TUNING_PROFILE.maxEdits
  });
}

const result = runTowerCodesignBeamSearch({
  seeds: [{ mutationIds: [] }],
  expand: expandWithinSolverProfile,
  evaluate: evaluateCandidate,
  keyOf: demoTenFloorCandidateKey,
  beamWidth: DEMO10_SOLVER_TUNING_PROFILE.beamWidth,
  rounds: DEMO10_SOLVER_TUNING_PROFILE.rounds,
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
  milestone: 'topology-locked-solver-tuning',
  tuningProfile: {
    id: DEMO10_SOLVER_TUNING_PROFILE.id,
    topologyId: DEMO10_SOLVER_TUNING_PROFILE.topologyId,
    productionWriteAllowed: DEMO10_SOLVER_TUNING_PROFILE.productionWriteAllowed,
    mutableFamilies: DEMO10_SOLVER_TUNING_PROFILE.mutableFamilies,
    protectedCriticalEnemyCount: DEMO10_SOLVER_TUNING_PROFILE.criticalEnemyIds.length,
    fullCatalogSize: fullCatalog.length,
    allowedMutationIds: DEMO10_SOLVER_TUNING_PROFILE.allowedMutationIds
  },
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
  diagnosticCoverage: 'complete-declared-portfolio',
  evaluatedCandidates: result.evaluatedCandidates,
  history: result.history,
  best: compactEntry(result.best),
  portfolio: result.portfolio.map(compactEntry)
}, null, 2));

if (result.productionWriteAllowed !== false || DEMO10_SOLVER_TUNING_PROFILE.productionWriteAllowed !== false) {
  throw new Error('10F co-design search must never enable production writes.');
}
if (!result.best || !Number.isFinite(result.best.score.score)) {
  throw new Error('10F co-design search failed to retain any release-portfolio-gated candidate.');
}
