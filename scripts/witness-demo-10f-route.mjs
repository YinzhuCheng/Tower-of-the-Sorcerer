import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { hashValue } from '../src/solver/state.js';

function parseArgs(argv) {
  const config = { multipliers: {}, cycle: ['def', 'atk', 'hp'], json: false, require: false };
  for (const arg of argv) {
    if (arg === '--json') config.json = true;
    else if (arg === '--require') config.require = true;
    else if (arg.startsWith('--cycle=')) {
      const cycle = arg.slice('--cycle='.length).split(',').filter(Boolean);
      if (!cycle.length || cycle.some((option) => !['atk', 'def', 'hp'].includes(option))) {
        throw new Error('--cycle must be a comma-separated non-empty subset of atk,def,hp.');
      }
      config.cycle = cycle;
    } else if (arg.startsWith('--multiplier=')) {
      const [floorText, multiplierText] = arg.slice('--multiplier='.length).split(':');
      const floor = Number(floorText);
      const multiplier = Number(multiplierText);
      if (!Number.isInteger(floor) || floor < 1 || floor > 10 || !Number.isFinite(multiplier) || multiplier <= 0) {
        throw new Error('--multiplier must use FLOOR:POSITIVE_NUMBER, e.g. --multiplier=5:1.4.');
      }
      config.multipliers[floor] = multiplier;
    } else if (arg === '--help') config.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return config;
}

function installFrozenDemo() {
  applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
  applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
  applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
  applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
  applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
  applyDemoTenFloorHardMode({ enemies: ENEMIES });
}

const config = parseArgs(process.argv.slice(2));
if (config.help) {
  console.log('Usage: node scripts/witness-demo-10f-route.mjs [--cycle=def,atk,hp] [--multiplier=5:1.4] [--json] [--require]');
  process.exit(0);
}

installFrozenDemo();
for (const [floorNumber, multiplier] of Object.entries(config.multipliers)) {
  FLOORS[Number(floorNumber) - 1].shopEffectMultiplier = multiplier;
}

const [{ runGreedyShopStrategy }, { createTowerAdapter }, { replayTowerStepSkeleton }] = await Promise.all([
  import('../src/solver/greedy-strategy.js'),
  import('../src/solver/tower-adapter.js'),
  import('../src/solver/replay.js')
]);
const route = runGreedyShopStrategy({
  shopCycle: config.cycle,
  holyPolicy: 'immediate',
  progressionPriority: 'legacy-clear',
  traceActions: true,
  maxIterations: 8_000
});
const adapter = createTowerAdapter();
const certificate = {
  schemaVersion: 1,
  type: 'demo-10f-engine-route-witness-v1',
  rulesVersion: adapter.rulesVersion(),
  contentHash: adapter.contentHash(),
  shopCycle: [...config.cycle],
  temporaryShopTiers: Object.fromEntries(Object.entries(config.multipliers).map(([floor, multiplier]) => [`f${floor}`, multiplier])),
  steps: route.routeSteps ?? [],
  expectedFinal: route.solvable ? { ...route.final } : null
};
certificate.certificateHash = hashValue(certificate);
const replay = replayTowerStepSkeleton(certificate.steps, { adapter, requireGoal: true });
const report = {
  model: 'demo-10f-frozen-topology-route-witness-v1',
  routeSolvable: route.solvable,
  routeFailure: route.failure,
  certificate: {
    certificateHash: certificate.certificateHash,
    stepCount: certificate.steps.length,
    replayOk: replay.ok,
    replayGoal: replay.goal,
    final: replay.final,
    minNormalizedHpMargin: replay.minNormalizedHpMargin,
    failures: replay.failures
  },
  witness: certificate
};

if (config.json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`10F route witness: route=${report.routeSolvable ? 'WIN' : 'FAIL'} replay=${report.certificate.replayOk ? 'PASS' : 'FAIL'} steps=${report.certificate.stepCount}`);
  console.log(`certificate=${report.certificate.certificateHash} final=${JSON.stringify(report.certificate.final)} minMargin=${report.certificate.minNormalizedHpMargin}`);
  if (report.routeFailure) console.log(`routeFailure=${report.routeFailure}`);
  if (report.certificate.failures.length) console.log(`replayFailure=${JSON.stringify(report.certificate.failures[0])}`);
}

if (config.require && (!route.solvable || !replay.ok)) process.exitCode = 1;
