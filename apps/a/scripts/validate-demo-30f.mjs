import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorHardMode, DEMO10_HARD_ROUTE_PROOF } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTwentyFloorContent } from '../src/game/demo-20-floor-content.js';
import { applyDemoThirtyFloorContent, DEMO30_CONTENT_ID, validateDemoThirtyFloorContent } from '../src/game/demo-30-floor-content.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorHardMode({ enemies: ENEMIES });

const { runGreedyShopStrategy } = await import('../src/solver/greedy-strategy.js');
const f10Witness = runGreedyShopStrategy({ ...DEMO10_HARD_ROUTE_PROOF, traceActions: true, maxIterations: 8_000 });
if (f10Witness.failure) throw new Error(`F10 release witness failed: ${f10Witness.failure}`);

applyDemoTwentyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });
applyDemoThirtyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });

const { createTowerAdapter } = await import('../src/solver/tower-adapter.js');
const { createDemoThirtyFloorExpertWitnessAdapter } = await import('../src/tuner/demo-30-floor-expert-witness-adapter.js');
const { createDoctrineRouteAdapter } = await import('../src/tuner/demo-20-route-portfolio.js');
const { evaluateAct3CharterPortfolio, evaluateAct3HandoffPortfolio, evaluateAct3HandoffDecisionMatrix } = await import('../src/tuner/demo-30-route-portfolio.js');
const { createDemoThirtyFloorMutationCatalog, withDemoThirtyFloorCandidate } = await import('../src/tuner/demo-30-floor-mutations.js');
const baseAdapter = createTowerAdapter();
// Ember is a deliberately high-pressure Act II witness; the Act III portfolio
// then proves all three incompatible chapter choices on top of a real bond +
// council route rather than a generous synthetic F20 state.
const adapter = createDemoThirtyFloorExpertWitnessAdapter(createDoctrineRouteAdapter(baseAdapter, 'ember'));
const requestedCharter = process.env.CHARTER ?? null;
const charterIds = requestedCharter ? [requestedCharter] : undefined;
const includeDecisionMatrix = process.env.DECISION_MATRIX === '1';
const requestedMutationIds = (process.env.MUTATION ?? '')
  .split(',').map((id) => id.trim()).filter(Boolean);
const mutationCatalog = createDemoThirtyFloorMutationCatalog();
for (const mutationId of requestedMutationIds) {
  if (!mutationCatalog.some((mutation) => mutation.id === mutationId)) {
    throw new Error(`Unknown Act III mutation '${mutationId}'.`);
  }
}
const evaluatePortfolio = () => {
  const charters = evaluateAct3CharterPortfolio({
    adapter,
    routeSteps: f10Witness.routeSteps,
    charterIds,
    maxExpanded: 4_000,
    maxGenerated: 70_000,
    includeDiagnostics: process.env.DEBUG_DEMO30 === '1',
    onStage: (id, stage) => console.error(`[${id}] ${stage.milestone}: ${stage.reached ? 'reached' : stage.stoppedReason} (${stage.expandedStates} expanded; ${JSON.stringify(stage.generatedByAction)})`)
  });
  const handoffs = evaluateAct3HandoffPortfolio({
    adapter,
    routeSteps: f10Witness.routeSteps,
    maxExpanded: 4_000,
    maxGenerated: 70_000,
    onStage: (id, stage) => console.error(`[${id}] ${stage.milestone}: ${stage.reached ? 'reached' : stage.stoppedReason} (${stage.expandedStates} expanded; ${JSON.stringify(stage.generatedByAction)})`)
  });
  return Object.freeze({
    ...charters,
    handoffPortfolio: handoffs,
    publishable: charters.publishable && handoffs.publishable
  });
};
const portfolio = requestedMutationIds.length
  ? withDemoThirtyFloorCandidate({ mutationIds: requestedMutationIds }, mutationCatalog, evaluatePortfolio)
  : evaluatePortfolio();
const decisionMatrix = includeDecisionMatrix
  ? evaluateAct3HandoffDecisionMatrix({
      adapter,
      routeSteps: f10Witness.routeSteps,
      maxExpanded: 4_000,
      maxGenerated: 70_000,
      onStage: (id, stage) => console.error(`[matrix:${id}] ${stage.milestone}: ${stage.reached ? 'reached' : stage.stoppedReason} (${stage.expandedStates} expanded; ${JSON.stringify(stage.generatedByAction)})`)
    })
  : null;
const structure = validateDemoThirtyFloorContent({ floors: FLOORS, enemies: ENEMIES, items: ITEMS });
const report = {
  publishable: structure.ok
    && (requestedCharter ? portfolio.entries.every((entry) => entry.completed) : portfolio.publishable)
    && portfolio.handoffPortfolio.entries.every((entry) => entry.completed),
  contentId: DEMO30_CONTENT_ID,
  mutation: requestedMutationIds,
  floors: FLOORS.length,
  structure,
  entries: portfolio.entries.map((entry) => ({
    id: entry.id,
    completed: entry.completed,
    minNormalizedHpMargin: entry.minNormalizedHpMargin,
    milestones: entry.result.milestones.map((stage) => ({ id: stage.milestone, reached: stage.reached, expanded: stage.expandedStates, generated: stage.generatedStates })),
    insights: entry.insights,
    strategicDecisions: process.env.DEBUG_DEMO30 === '1' ? entry.strategicDecisions : undefined,
    diagnostics: process.env.DEBUG_DEMO30 === '1'
      ? {
        stages: entry.result.milestones.map((stage) => ({
          id: stage.milestone,
          progress: stage.diagnostics?.progressWitness?.final ?? null,
          progressDepth: stage.diagnostics?.progressWitness?.depth ?? null,
          stageTelemetry: stage.stageTelemetry,
          rejectedByAction: stage.rejectedByAction
        })),
        stalled: entry.diagnostics
      }
      : undefined,
    lateBattleLog: process.env.DEBUG_DEMO30 === '1'
      ? entry.replay.battleLog.filter((battle) => battle.floor >= 21)
      : undefined,
    final: process.env.DEBUG_DEMO30 === '1' ? entry.replay.final : undefined
  })),
  handoffEntries: portfolio.handoffPortfolio.entries.map((entry) => ({
    id: entry.id,
    charterId: entry.charterId,
    handoffId: entry.handoffId,
    completed: entry.completed,
    minNormalizedHpMargin: entry.minNormalizedHpMargin,
    insights: entry.insights,
    strategicDecisions: process.env.DEBUG_DEMO30 === '1' ? entry.strategicDecisions : undefined
  })),
  decisionMatrix: decisionMatrix
    ? {
        expectedCells: decisionMatrix.expectedCells,
        evaluatedCells: decisionMatrix.evaluatedCells,
        coverageComplete: decisionMatrix.coverageComplete,
        completedCells: decisionMatrix.completedCells,
        blockedCells: decisionMatrix.blockedCells,
        minCompletedMargin: decisionMatrix.minCompletedMargin,
        maxCompletedMargin: decisionMatrix.maxCompletedMargin,
        byCharter: decisionMatrix.byCharter,
        byHandoff: decisionMatrix.byHandoff,
        entries: decisionMatrix.entries.map((entry) => ({
          id: entry.id,
          charterId: entry.charterId,
          handoffId: entry.handoffId,
          completed: entry.completed,
          minNormalizedHpMargin: entry.minNormalizedHpMargin
        }))
      }
    : undefined
};
console.log(JSON.stringify(report, null, 2));
if (!report.publishable) process.exitCode = 1;
