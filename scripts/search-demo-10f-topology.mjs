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
import {
  compareDemoTenFloorCheckpointPortfolio,
  createDemoTenFloorTopologyContract,
  validateDemoTenFloorTopology
} from '../src/tuner/demo-10-floor-topology-validator.js';
import {
  createDemoTenFloorTopologyMutationCatalog,
  withDemoTenFloorTopologyMutation
} from '../src/tuner/demo-10-floor-topology-mutations.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorHardMode({ enemies: ENEMIES });

const { runGreedyShopStrategy } = await import('../src/solver/greedy-strategy.js');
const { runExpertNoHpStrategy, EXPERT_NO_HP_STRATEGY_ID } = await import('../src/solver/expert-strategy.js');

const releaseProgressionPriority = 'legacy-clear';
const guardianStressPriority = 'guardian-first';
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
const contract = createDemoTenFloorTopologyContract(FLOORS);
const catalog = createDemoTenFloorTopologyMutationCatalog({
  floorNumbers: contract.floorNumbers,
  maxPerFloor: 16,
  routeSampleLimit: 6
});

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

function qualityPortfolio() {
  const reports = qualitySpecs.map(runQualityPolicy);
  const quality = summarizeDemoTenFloorPortfolio(reports, DEMO10_QUALITY_TARGETS);
  return { reports, quality };
}

function topologyDeltaLoss(topology) {
  const deltas = [];
  for (const floorNumber of contract.floorNumbers) {
    const current = topology.floors[floorNumber].current;
    const base = contract.profiles[floorNumber];
    deltas.push(Math.abs(current.cycleRank - base.cycleRank) / Math.max(1, contract.tolerances.cycleRank));
    deltas.push(Math.abs(current.branchNodes - base.branchNodes) / Math.max(1, contract.tolerances.branchNodes));
    deltas.push(Math.max(0, current.deadEnds - base.deadEnds) / Math.max(1, contract.tolerances.extraDeadEnds));
    deltas.push(Math.abs(current.downToUpDistance - base.downToUpDistance) / Math.max(1, contract.tolerances.downToUpDistance));
  }
  return deltas.reduce((sum, value) => sum + value, 0) / Math.max(1, deltas.length);
}

function compactTopology(topology) {
  return Object.fromEntries(contract.floorNumbers.map((floorNumber) => {
    const profile = topology.floors[floorNumber].current;
    return [floorNumber, {
      passableNodes: profile.passableNodes,
      edges: profile.edges,
      cycleRank: profile.cycleRank,
      deadEnds: profile.deadEnds,
      branchNodes: profile.branchNodes,
      downToUpDistance: profile.downToUpDistance
    }];
  }));
}

function compactCheckpoints(checkpoints) {
  return Object.fromEntries(checkpoints.choiceTargetFloors.map((floorNumber) => {
    const profile = checkpoints.floors[floorNumber];
    return [floorNumber, {
      sampledPolicies: profile.sampledPolicies,
      paretoWidth: profile.paretoWidth,
      uniqueResourceStates: profile.uniqueResourceStates,
      policyMultiplicity: Number(profile.policyMultiplicity.toFixed(3))
    }];
  }));
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

function checkpointPortfolio(qualityReports, expertReport) {
  const diagnosticReports = diagnosticSpecs.map(runDiagnosticPolicy);
  return summarizeDemoTenFloorCheckpoints(
    [...qualityReports, ...diagnosticReports, expertReport],
    { policySpecs: [...qualitySpecs, ...diagnosticSpecs, expertSpec] }
  );
}

const baselineTopology = validateDemoTenFloorTopology(FLOORS, contract);
if (!baselineTopology.ok) {
  throw new Error(`Baseline topology contract failed: ${baselineTopology.violations.join(',')}`);
}
const baselineQuality = qualityPortfolio();
if (baselineQuality.quality.violations.length) {
  throw new Error(`Baseline 10F release portfolio gate failed: ${baselineQuality.quality.violations.join(',')}`);
}
const baselineExpert = runExpertDiagnosticPolicy();
const baselineCheckpoints = checkpointPortfolio(baselineQuality.reports, baselineExpert);

const rejectedStatic = [];
const rejectedQuality = [];
const rejectedCheckpoint = [];
const accepted = [];

for (const mutation of catalog) {
  const result = withDemoTenFloorTopologyMutation(mutation, () => {
    const topology = validateDemoTenFloorTopology(FLOORS, contract);
    if (!topology.ok) return { stage: 'static', topology };

    const release = qualityPortfolio();
    if (release.quality.violations.length) {
      return { stage: 'quality', topology, quality: release.quality };
    }

    const expertReport = runExpertDiagnosticPolicy();
    const checkpoints = checkpointPortfolio(release.reports, expertReport);
    const checkpointComparison = compareDemoTenFloorCheckpointPortfolio(checkpoints, baselineCheckpoints);
    if (!checkpointComparison.ok) {
      return {
        stage: 'checkpoint',
        topology,
        quality: release.quality,
        checkpoints,
        checkpointComparison,
        expertReport
      };
    }

    const structuralLoss = topologyDeltaLoss(topology);
    const qualityLoss = demoTenFloorQualityLoss(release.quality, DEMO10_QUALITY_TARGETS) / 50;
    const checkpointGain = checkpointComparison.checkpointGain ?? 0;
    const semanticHardeningGain = mutation.preview?.hardeningGain ?? 0;
    const semanticDiversityGain = mutation.preview?.diversityGain ?? 0;
    return {
      stage: 'accepted',
      topology,
      quality: release.quality,
      expertReport,
      checkpoints,
      checkpointComparison,
      score: qualityLoss
        + 0.20 * structuralLoss
        - 0.50 * checkpointGain
        - 0.08 * semanticHardeningGain
        - 0.05 * semanticDiversityGain,
      qualityLoss,
      structuralLoss,
      checkpointGain
    };
  });

  const compact = { id: mutation.id, floor: mutation.floor, semanticPreview: mutation.preview };
  if (result.stage === 'static') {
    rejectedStatic.push({ ...compact, violations: result.topology.violations });
  } else if (result.stage === 'quality') {
    rejectedQuality.push({
      ...compact,
      violations: result.quality.violations,
      solvableBuilds: result.quality.solvableBuilds,
      f9ShopCoverage: result.quality.f9ShopCoverage
    });
  } else if (result.stage === 'checkpoint') {
    rejectedCheckpoint.push({
      ...compact,
      violations: result.checkpointComparison.violations,
      choiceLoss: result.checkpoints.choiceLoss,
      baselineChoiceLoss: baselineCheckpoints.choiceLoss,
      choiceLossDelta: result.checkpointComparison.choiceLossDelta,
      maxParetoWidth: result.checkpoints.maxParetoWidth,
      baselineMaxParetoWidth: baselineCheckpoints.maxParetoWidth,
      oversized: result.checkpoints.oversizedCheckpoints,
      collapsed: result.checkpoints.collapsedCheckpoints,
      expertDiagnostic: compactExpertDiagnostic(result.expertReport)
    });
  } else {
    accepted.push({
      ...compact,
      score: result.score,
      qualityLoss: result.qualityLoss,
      structuralLoss: result.structuralLoss,
      checkpointGain: result.checkpointGain,
      solvableBuilds: result.quality.solvableBuilds,
      f9ShopCoverage: result.quality.f9ShopCoverage,
      terminalHpSpread: result.quality.terminalHpSpread,
      winnerLateMinMargin: result.quality.winnerLateMinMargin,
      weakestWinningLateMargin: result.quality.weakestWinningLateMargin,
      choiceLoss: result.checkpoints.choiceLoss,
      baselineChoiceLoss: baselineCheckpoints.choiceLoss,
      maxParetoWidth: result.checkpoints.maxParetoWidth,
      expertDiagnostic: compactExpertDiagnostic(result.expertReport),
      topology: compactTopology(result.topology),
      checkpoints: compactCheckpoints(result.checkpoints)
    });
  }
}

accepted.sort((a, b) => a.score - b.score || a.id.localeCompare(b.id));
console.log('DEMO10_TOPOLOGY_SEARCH');
console.log(JSON.stringify({
  schemaVersion: 6,
  model: 'demo-10f-semantic-topology-v2-release-portfolio',
  milestone: 'semantic-topology-v2-spatial-redesign',
  heuristicOnly: true,
  productionWriteAllowed: false,
  mutationGenerator: 'semantic-map-graph-v2-room-aware',
  coordinateSlotsRequired: false,
  catalogSize: catalog.length,
  catalogByFloor: Object.fromEntries(contract.floorNumbers.map((floorNumber) => [
    floorNumber,
    catalog.filter((mutation) => mutation.floor === floorNumber).length
  ])),
  playabilityGate: 'six-build-release-portfolio',
  releaseProgressionPriority,
  guardianStressPriority,
  expertDiagnosticModel: EXPERT_NO_HP_STRATEGY_ID,
  frozenExpertDiagnostic: true,
  qualityPolicyCount: qualitySpecs.length,
  diagnosticPolicyCount: diagnosticSpecs.length + 1,
  fullDiagnosticPolicyCount: fullDiagnosticPolicyCount + 1,
  checkpointGate: 'baseline-relative-no-regression',
  baseline: {
    qualityViolations: baselineQuality.quality.violations,
    solvableBuilds: baselineQuality.quality.solvableBuilds,
    f9ShopCoverage: baselineQuality.quality.f9ShopCoverage,
    terminalHpSpread: baselineQuality.quality.terminalHpSpread,
    winnerLateMinMargin: baselineQuality.quality.winnerLateMinMargin,
    weakestWinningLateMargin: baselineQuality.quality.weakestWinningLateMargin,
    expertDiagnostic: compactExpertDiagnostic(baselineExpert),
    checkpointChoiceLoss: baselineCheckpoints.choiceLoss,
    maxParetoWidth: baselineCheckpoints.maxParetoWidth,
    checkpoints: compactCheckpoints(baselineCheckpoints),
    topology: compactTopology(baselineTopology)
  },
  counts: {
    staticRejected: rejectedStatic.length,
    qualityRejected: rejectedQuality.length,
    checkpointRejected: rejectedCheckpoint.length,
    accepted: accepted.length
  },
  bestAlternative: accepted[0] ?? null,
  accepted,
  rejectedStatic,
  rejectedQuality,
  rejectedCheckpoint
}, null, 2));

if (catalog.length === 0) throw new Error('Semantic topology generator produced no candidates.');
for (const floorNumber of contract.floorNumbers) {
  if (!catalog.some((mutation) => mutation.floor === floorNumber)) {
    throw new Error(`Semantic topology generator produced no candidates for floor ${floorNumber}.`);
  }
}
if (!Number.isFinite(baselineCheckpoints.choiceLoss) || !Number.isFinite(baselineCheckpoints.maxParetoWidth)) {
  throw new Error('Baseline checkpoint portfolio must expose finite relative-gate metrics.');
}
