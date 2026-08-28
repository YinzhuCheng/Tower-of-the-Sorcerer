import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';
import { DEMO10_CODESIGN_POLICY_SPECS, summarizeDemoTenFloorCheckpoints } from '../src/analyzer/demo-10-floor-checkpoints.js';
import { DEMO10_EXPERT_TARGETS, demoTenFloorExpertLoss, summarizeDemoTenFloorPortfolio } from '../src/game/demo-10-floor-quality.js';
import { compareDemoTenFloorCheckpointPortfolio, createDemoTenFloorTopologyContract, validateDemoTenFloorTopology } from '../src/tuner/demo-10-floor-topology-validator.js';
import { createDemoTenFloorTopologyMutationCatalog, withDemoTenFloorTopologyMutation } from '../src/tuner/demo-10-floor-topology-mutations.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorHardMode({ enemies: ENEMIES });
const { runGreedyShopStrategy } = await import('../src/solver/greedy-strategy.js');
const { runExpertNoHpStrategy, EXPERT_NO_HP_STRATEGY_ID } = await import('../src/solver/expert-strategy.js');

const baselineExpertPlanning = runExpertNoHpStrategy({ holyPolicy: 'immediate', maxIterations: 8_000, horizon: 2, attackAdvantageRequired: 2_000 });
const frozenExpertShopPlan = Object.freeze([...baselineExpertPlanning.planning.shopPlan]);
const fullDiagnosticPolicyCount = DEMO10_CODESIGN_POLICY_SPECS.length;
const diagnosticSpecs = DEMO10_CODESIGN_POLICY_SPECS.filter((_, index) => index % 3 === 0);
const expertSpec = Object.freeze({ id: EXPERT_NO_HP_STRATEGY_ID });
const contract = createDemoTenFloorTopologyContract(FLOORS);
const catalog = createDemoTenFloorTopologyMutationCatalog({ floorNumbers: contract.floorNumbers, maxPerFloor: 16, routeSampleLimit: 6 });

function runDiagnosticPolicy(spec) {
  return runGreedyShopStrategy({ shopCycle: spec.shopCycle, shopPlan: spec.shopPlan, holyPolicy: spec.holyPolicy, maxIterations: 8_000 });
}

function runExpertPolicy() {
  const report = runGreedyShopStrategy({ shopCycle: ['def'], shopPlan: frozenExpertShopPlan, holyPolicy: 'immediate', maxIterations: 8_000 });
  return {
    ...report,
    strategyId: EXPERT_NO_HP_STRATEGY_ID,
    strategy: {
      shopHpAllowed: false,
      defaultInvestment: 'def',
      witnessMode: 'frozen-baseline-plan-with-def-fallback'
    },
    planning: { shopPlan: [...frozenExpertShopPlan] }
  };
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

function qualityReport() {
  const report = runExpertPolicy();
  const quality = summarizeDemoTenFloorPortfolio([report], DEMO10_EXPERT_TARGETS);
  const hpClean = report.purchaseCounts.hp === 0 && report.purchaseLog.every((entry) => entry.optionId !== 'hp');
  if (!hpClean) quality.violations.push('expert-shop-hp-purchase');
  return { report, quality };
}

const baselineTopology = validateDemoTenFloorTopology(FLOORS, contract);
if (!baselineTopology.ok) throw new Error(`Baseline topology contract failed: ${baselineTopology.violations.join(',')}`);
const baselineExpert = qualityReport();
if (baselineExpert.quality.violations.length) throw new Error(`Baseline 10F expert hard-mode gate failed: ${baselineExpert.quality.violations.join(',')}`);
const baselineDiagnosticReports = diagnosticSpecs.map(runDiagnosticPolicy);
const baselineCheckpoints = summarizeDemoTenFloorCheckpoints(
  [baselineExpert.report, ...baselineDiagnosticReports],
  { policySpecs: [expertSpec, ...diagnosticSpecs] }
);

const rejectedStatic = [];
const rejectedQuality = [];
const rejectedCheckpoint = [];
const accepted = [];

for (const mutation of catalog) {
  const result = withDemoTenFloorTopologyMutation(mutation, () => {
    const topology = validateDemoTenFloorTopology(FLOORS, contract);
    if (!topology.ok) return { stage: 'static', topology };

    const expert = qualityReport();
    if (expert.quality.violations.length) {
      return { stage: 'quality', topology, quality: expert.quality, expertReport: expert.report };
    }

    const diagnosticReports = diagnosticSpecs.map(runDiagnosticPolicy);
    const checkpoints = summarizeDemoTenFloorCheckpoints(
      [expert.report, ...diagnosticReports],
      { policySpecs: [expertSpec, ...diagnosticSpecs] }
    );
    const checkpointComparison = compareDemoTenFloorCheckpointPortfolio(checkpoints, baselineCheckpoints);
    if (!checkpointComparison.ok) {
      return { stage: 'checkpoint', topology, quality: expert.quality, checkpoints, checkpointComparison };
    }

    const structuralLoss = topologyDeltaLoss(topology);
    const qualityLoss = demoTenFloorExpertLoss(expert.quality, DEMO10_EXPERT_TARGETS) / 50;
    const checkpointGain = checkpointComparison.checkpointGain ?? 0;
    const semanticHardeningGain = mutation.preview?.hardeningGain ?? 0;
    const semanticDiversityGain = mutation.preview?.diversityGain ?? 0;
    return {
      stage: 'accepted',
      topology,
      quality: expert.quality,
      expertReport: expert.report,
      checkpoints,
      checkpointComparison,
      score: qualityLoss + 0.20 * structuralLoss - 0.50 * checkpointGain - 0.08 * semanticHardeningGain - 0.05 * semanticDiversityGain,
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
      expertFloor: result.expertReport?.floor ?? null,
      expertFailure: result.expertReport?.failure ?? null
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
      collapsed: result.checkpoints.collapsedCheckpoints
    });
  } else {
    accepted.push({
      ...compact,
      score: result.score,
      qualityLoss: result.qualityLoss,
      structuralLoss: result.structuralLoss,
      checkpointGain: result.checkpointGain,
      choiceLoss: result.checkpoints.choiceLoss,
      baselineChoiceLoss: baselineCheckpoints.choiceLoss,
      maxParetoWidth: result.checkpoints.maxParetoWidth,
      expertMargin: result.expertReport.minNormalizedHpMargin,
      expertPurchaseCounts: result.expertReport.purchaseCounts,
      topology: compactTopology(result.topology),
      checkpoints: compactCheckpoints(result.checkpoints)
    });
  }
}

accepted.sort((a, b) => a.score - b.score || a.id.localeCompare(b.id));
console.log('DEMO10_TOPOLOGY_SEARCH');
console.log(JSON.stringify({
  schemaVersion: 5,
  model: 'demo-10f-semantic-topology-v2-expert-hard-mode',
  milestone: 'semantic-topology-v2',
  heuristicOnly: true,
  productionWriteAllowed: false,
  mutationGenerator: 'semantic-map-graph-v2',
  coordinateSlotsRequired: false,
  catalogSize: catalog.length,
  catalogByFloor: Object.fromEntries(contract.floorNumbers.map((floorNumber) => [
    floorNumber,
    catalog.filter((mutation) => mutation.floor === floorNumber).length
  ])),
  playabilityGate: EXPERT_NO_HP_STRATEGY_ID,
  frozenExpertWitness: true,
  diagnosticPolicyCount: diagnosticSpecs.length,
  fullDiagnosticPolicyCount,
  checkpointGate: 'baseline-relative-no-regression',
  baseline: {
    qualityViolations: baselineExpert.quality.violations,
    expertMargin: baselineExpert.report.minNormalizedHpMargin,
    expertPurchaseCounts: baselineExpert.report.purchaseCounts,
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
