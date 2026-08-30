import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS, SHOP_OPTIONS } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorHardMode, DEMO10_HARD_ROUTE_PROOF } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTwentyFloorContent, DEMO20_CONTENT_ID } from '../src/game/demo-20-floor-content.js';

// Build exactly the browser runtime before loading the state codec.  The
// codec snapshots the dynamic event vocabulary at module initialization time.
applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorHardMode({ enemies: ENEMIES });

const { runGreedyShopStrategy } = await import('../src/solver/greedy-strategy.js');
const f10Witness = runGreedyShopStrategy({
  ...DEMO10_HARD_ROUTE_PROOF,
  traceActions: true,
  maxIterations: 8_000
});
if (f10Witness.failure) throw new Error(`F10 release witness failed: ${f10Witness.failure}`);

applyDemoTwentyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });

const { createTowerAdapter } = await import('../src/solver/tower-adapter.js');
const { createDemoTwentyFloorForwardWitnessAdapter } = await import('../src/tuner/demo-20-floor-forward-witness-adapter.js');
const { runDemoTwentyFloorMilestones } = await import('../src/tuner/demo-20-floor-milestone-solver.js');
const { replayTowerStepSkeletonToState } = await import('../src/solver/replay.js');
const { evaluateWarCouncilBalance } = await import('../src/tuner/war-council-balance.js');

const baseAdapter = createTowerAdapter();
const adapter = createDemoTwentyFloorForwardWitnessAdapter(baseAdapter);
const result = runDemoTwentyFloorMilestones({
  adapter,
  routeSteps: f10Witness.routeSteps,
  maxExpanded: 8_000,
  maxGenerated: 160_000,
  solverVersion: 'demo20-release-council-v1'
});
const replay = result.completed
  ? replayTowerStepSkeletonToState(result.routeSteps, { adapter: baseAdapter, requireGoal: true })
  : { ok: false, final: null };
const council = evaluateWarCouncilBalance();
const report = {
  publishable: Boolean(result.completed && replay.ok && council.publishable),
  contentId: DEMO20_CONTENT_ID,
  floors: FLOORS.length,
  f10WitnessSteps: f10Witness.routeSteps.length,
  milestones: result.milestones.map((stage) => ({
    id: stage.milestone,
    reached: stage.reached,
    stoppedReason: stage.stoppedReason,
    expanded: stage.expandedStates,
    generated: stage.generatedStates
  })),
  council: {
    status: council.status,
    winningPlans: council.winningPlans,
    totalPlans: council.totalPlans,
    winRate: council.winRate,
    loyalistScale: council.tuning.loyalistScale
  },
  final: replay.final
};
console.log(JSON.stringify(report, null, 2));
if (!report.publishable) process.exitCode = 1;
