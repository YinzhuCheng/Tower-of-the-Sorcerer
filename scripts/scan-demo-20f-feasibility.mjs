import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS, SHOP_OPTIONS } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorHardMode, DEMO10_HARD_ROUTE_PROOF } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTwentyFloorContent } from '../src/game/demo-20-floor-content.js';

function readNumber(name, fallback) {
  const raw = process.argv.find((entry) => entry.startsWith(`--${name}=`))?.slice(name.length + 3);
  if (raw == null) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value)) throw new Error(`--${name} must be a finite number.`);
  return value;
}

function readUnitInterval(name, fallback) {
  const value = readNumber(name, fallback);
  if (value < 0 || value > 1) throw new Error(`--${name} must be inside [0, 1].`);
  return value;
}

const strengths = Object.freeze({
  ordinary: readUnitInterval('ordinary', 1),
  f14: readUnitInterval('f14', 1),
  f17: readUnitInterval('f17', 1),
  f19: readUnitInterval('f19', 1),
  f20: readUnitInterval('f20', 1)
});
const maxExpanded = Math.trunc(readNumber('maxExpanded', 3_000));
const maxGenerated = Math.trunc(readNumber('maxGenerated', 45_000));
if (maxExpanded <= 0 || maxGenerated <= 0) throw new Error('Search budgets must be positive.');

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorHardMode({ enemies: ENEMIES });

// These must load after the mutable 20F content overlay. tower-adapter owns a
// complete token codec at module initialization time.
const { runGreedyShopStrategy } = await import('../src/solver/greedy-strategy.js');
const f10Witness = runGreedyShopStrategy({
  ...DEMO10_HARD_ROUTE_PROOF,
  traceActions: true,
  maxIterations: 8_000
});
if (f10Witness.failure) throw new Error(`F10 witness failed: ${f10Witness.failure}`);
applyDemoTwentyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });

const { createTowerAdapter } = await import('../src/solver/tower-adapter.js');
const { createDemoTwentyFloorForwardWitnessAdapter } = await import('../src/tuner/demo-20-floor-forward-witness-adapter.js');
const { runDemoTwentyFloorMilestones } = await import('../src/tuner/demo-20-floor-milestone-solver.js');
const { withDemoTwentyFloorF14GuardianRay } = await import('../src/tuner/demo-20-floor-f14-ray.js');
const { withDemoTwentyFloorF17CrownRay } = await import('../src/tuner/demo-20-floor-f17-ray.js');
const { withDemoTwentyFloorLateGameRays } = await import('../src/tuner/demo-20-floor-late-game-ray.js');

const adapter = createDemoTwentyFloorForwardWitnessAdapter(createTowerAdapter());
const dependencies = { floors: FLOORS, enemies: ENEMIES, items: ITEMS, shopOptions: SHOP_OPTIONS };
const milestones = Object.freeze([
  Object.freeze({ id: 'f15-arrival', floorIndex: 14, label: '抵达 F15 转换点' }),
  Object.freeze({ id: 'victory', floorIndex: null, label: '击败起源核心' })
]);

const result = withDemoTwentyFloorF14GuardianRay(strengths.f14, () => withDemoTwentyFloorF17CrownRay(
  strengths.f17,
  () => withDemoTwentyFloorLateGameRays([
    { id: 'act2Ordinary', strength: strengths.ordinary },
    { id: 'f19Regent', strength: strengths.f19 },
    { id: 'f20Final', strength: strengths.f20 }
  ], () => runDemoTwentyFloorMilestones({
    adapter,
    routeSteps: f10Witness.routeSteps,
    milestones,
    maxExpanded,
    maxGenerated
  }), dependencies),
  dependencies
), dependencies);

const finalStage = result.milestones.at(-1);
console.log(JSON.stringify({
  publishable: false,
  policy: adapter.continuationPolicy,
  strengths,
  completed: result.completed,
  routeSteps: result.routeSteps.length,
  stages: result.milestones.map((stage) => ({
    milestone: stage.milestone,
    reached: stage.reached,
    stoppedReason: stage.stoppedReason,
    expandedStates: stage.expandedStates,
    generatedStates: stage.generatedStates,
    prunedDominated: stage.prunedDominated,
    frontierPeak: stage.frontierPeak,
    deepestFloor: stage.deepestFloor
  })),
  final: finalStage?.certificate?.final ?? null
}, null, 2));
