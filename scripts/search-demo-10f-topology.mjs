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
import {
  createDemoTenFloorTopologyContract,
  validateDemoTenFloorTopology
} from '../src/tuner/demo-10-floor-topology-validator.js';
import {
  createDemoTenFloorTopologyMutationCatalog,
  withDemoTenFloorTopologyMutation
} from '../src/tuner/demo-10-floor-topology-mutations.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
const { runGreedyShopStrategy } = await import('../src/solver/greedy-strategy.js');

const qualitySpecs = DEMO10_CODESIGN_POLICY_SPECS.filter((spec) => spec.qualityGate);
const diagnosticSpecs = DEMO10_CODESIGN_POLICY_SPECS.filter((spec) => !spec.qualityGate);
const contract = createDemoTenFloorTopologyContract(FLOORS);
const catalog = createDemoTenFloorTopologyMutationCatalog();

function runPolicy(spec) {
  return runGreedyShopStrategy({
    shopCycle: spec.shopCycle,
    shopPlan: spec.shopPlan,
    holyPolicy: spec.holyPolicy,
    maxIterations: 8_000
  });
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

const baselineTopology = validateDemoTenFloorTopology(FLOORS, contract);
if (!baselineTopology.ok) throw new Error(`Baseline topology contract failed: ${baselineTopology.violations.join(',')}`);

const baselineQualityReports = qualitySpecs.map(runPolicy);
const baselineQuality = summarizeDemoTenFloorPortfolio(baselineQualityReports);
if (baselineQuality.violations.length) throw new Error(`Baseline 10F quality failed: ${baselineQuality.violations.join(',')}`);
const baselineDiagnosticReports = diagnosticSpecs.map(runPolicy);
const baselineCheckpoints = summarizeDemoTenFloorCheckpoints(
  [...baselineQualityReports, ...baselineDiagnosticReports],
  { policySpecs: [...qualitySpecs, ...diagnosticSpecs] }
);

const rejectedStatic = [];
const rejectedQuality = [];
const rejectedCheckpoint = [];
const accepted = [];

for (const mutation of catalog) {
  const result = withDemoTenFloorTopologyMutation(mutation, () => {
    const topology = validateDemoTenFloorTopology(FLOORS, contract);
    if (!topology.ok) return { stage: 'static', topology };

    const qualityReports = qualitySpecs.map(runPolicy);
    const quality = summarizeDemoTenFloorPortfolio(qualityReports);
    if (quality.violations.length) return { stage: 'quality', topology, quality };

    const diagnosticReports = diagnosticSpecs.map(runPolicy);
    const checkpoints = summarizeDemoTenFloorCheckpoints(
      [...qualityReports, ...diagnosticReports],
      { policySpecs: [...qualitySpecs, ...diagnosticSpecs] }
    );
    if (checkpoints.choiceLoss > 0) return { stage: 'checkpoint', topology, quality, checkpoints };

    const structuralLoss = topologyDeltaLoss(topology);
    const qualityLoss = demoTenFloorQualityLoss(quality) / 50;
    return {
      stage: 'accepted',
      topology,
      quality,
      checkpoints,
      score: qualityLoss + 0.20 * structuralLoss,
      qualityLoss,
      structuralLoss
    };
  });

  const compact = { id: mutation.id, floor: mutation.floor };
  if (result.stage === 'static') {
    rejectedStatic.push({ ...compact, violations: result.topology.violations });
  } else if (result.stage === 'quality') {
    rejectedQuality.push({ ...compact, violations: result.quality.violations });
  } else if (result.stage === 'checkpoint') {
    rejectedCheckpoint.push({
      ...compact,
      oversized: result.checkpoints.oversizedCheckpoints,
      collapsed: result.checkpoints.collapsedCheckpoints
    });
  } else {
    accepted.push({
      ...compact,
      score: result.score,
      qualityLoss: result.qualityLoss,
      structuralLoss: result.structuralLoss,
      solvableBuilds: result.quality.solvableBuilds,
      bestMargin: result.quality.winner?.minNormalizedHpMargin ?? null,
      weakestMargin: result.quality.weakestWinningReport?.minNormalizedHpMargin ?? null,
      terminalHpSpread: result.quality.terminalHpSpread,
      topology: compactTopology(result.topology),
      checkpoints: compactCheckpoints(result.checkpoints)
    });
  }
}

accepted.sort((a, b) => a.score - b.score || a.id.localeCompare(b.id));

console.log('DEMO10_TOPOLOGY_SEARCH');
console.log(JSON.stringify({
  schemaVersion: 1,
  model: 'demo-10f-constrained-topology-wave1-v0.1',
  heuristicOnly: true,
  productionWriteAllowed: false,
  catalogSize: catalog.length,
  baseline: {
    qualityViolations: baselineQuality.violations,
    solvableBuilds: baselineQuality.solvableBuilds,
    checkpointChoiceLoss: baselineCheckpoints.choiceLoss,
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

if (catalog.length !== 32) throw new Error(`Expected 32 topology mutations, got ${catalog.length}.`);
if (baselineCheckpoints.choiceLoss !== 0) throw new Error('Baseline checkpoint width contract must remain healthy.');
