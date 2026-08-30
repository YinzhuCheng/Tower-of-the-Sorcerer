import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';

function parseArgs(argv) {
  const config = {
    maxExpanded: 100_000,
    maxGenerated: 1_000_000,
    multipliers: {},
    cycle: null,
    json: false,
    require: false
  };
  for (const arg of argv) {
    if (arg === '--json') config.json = true;
    else if (arg.startsWith('--multiplier=')) {
      const [floorText, multiplierText] = arg.slice('--multiplier='.length).split(':');
      const floor = Number(floorText);
      const multiplier = Number(multiplierText);
      if (!Number.isInteger(floor) || floor < 1 || floor > 10 || !Number.isFinite(multiplier) || multiplier <= 0) {
        throw new Error('--multiplier must use FLOOR:POSITIVE_NUMBER, e.g. --multiplier=5:1.4.');
      }
      config.multipliers[floor] = multiplier;
    }
    else if (arg.startsWith('--cycle=')) {
      const cycle = arg.slice('--cycle='.length).split(',').filter(Boolean);
      if (!cycle.length || cycle.some((option) => !['atk', 'def', 'hp'].includes(option))) {
        throw new Error('--cycle must be a comma-separated non-empty subset of atk,def,hp.');
      }
      config.cycle = cycle;
    }
    else if (arg === '--require') config.require = true;
    else if (arg.startsWith('--max-expanded=')) config.maxExpanded = Number(arg.slice('--max-expanded='.length));
    else if (arg.startsWith('--max-generated=')) config.maxGenerated = Number(arg.slice('--max-generated='.length));
    else if (arg === '--help') config.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(config.maxExpanded) || config.maxExpanded <= 0) {
    throw new Error('--max-expanded must be a positive integer.');
  }
  if (!Number.isInteger(config.maxGenerated) || config.maxGenerated <= 0) {
    throw new Error('--max-generated must be a positive integer.');
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

function compactReport(report) {
  return {
    model: 'demo-10f-topology-frozen-existence-v1',
    solvable: report.solvable,
    exact: report.exact,
    stoppedReason: report.stoppedReason,
    expandedStates: report.expandedStates,
    generatedStates: report.generatedStates,
    structuralStates: report.structuralStates,
    frontierPeak: report.frontierPeak,
    certificate: report.certificate ? {
      hash: report.certificate.certificateHash,
      stepCount: report.certificate.steps.length,
      final: report.certificate.final,
      replay: report.certificate.authoritativeReplay
    } : null
  };
}

const config = parseArgs(process.argv.slice(2));
if (config.help) {
  console.log(`Usage: node scripts/solve-demo-10f-existence.mjs [options]\n\nOptions:\n  --max-expanded=N\n  --max-generated=N\n  --multiplier=F:V   Apply a temporary 10F shop-tier candidate\n  --cycle=a,b,c      Solve the exact movement/event subproblem for one discovered shop policy\n  --json             Print the full replayable certificate\n  --require          Return non-zero unless one certificate is found and replays\n`);
  process.exit(0);
}

// Import the adapter only *after* the content overlay is installed: its codec
// records the actual event catalogue, so this script proves the frozen 10F map
// rather than the unrelated 8F baseline.
installFrozenDemo();
for (const [floorNumber, multiplier] of Object.entries(config.multipliers)) {
  FLOORS[Number(floorNumber) - 1].shopEffectMultiplier = multiplier;
}
const [{ solve }, { createTowerAdapter }, { replayTowerCertificate }, { createFixedPurchasePolicyTowerAdapter }] = await Promise.all([
  import('../src/solver/search.js'),
  import('../src/solver/tower-adapter.js'),
  import('../src/solver/replay.js'),
  import('../src/solver/fixed-purchase-policy-adapter.js')
]);

const adapter = config.cycle
  ? createFixedPurchasePolicyTowerAdapter({ shopCycle: config.cycle })
  : createTowerAdapter();
const report = solve({
  adapter,
  mode: 'existence',
  maxExpanded: config.maxExpanded,
  maxGenerated: config.maxGenerated,
  solverVersion: 'demo-10f-topology-frozen-existence-v1'
});
if (report.certificate) {
  report.certificate.authoritativeReplay = replayTowerCertificate(report.certificate, { adapter });
}

if (config.json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const summary = compactReport(report);
  console.log(`10F frozen-topology existence: solvable=${summary.solvable} exact=${summary.exact} stop=${summary.stoppedReason ?? 'exhausted'}`);
  if (Object.keys(config.multipliers).length) console.log(`temporary-shop-tiers=${JSON.stringify(config.multipliers)}`);
  if (config.cycle) console.log(`fixed-discovery-policy=${config.cycle.join('-')}`);
  console.log(`expanded=${summary.expandedStates} generated=${summary.generatedStates} structural=${summary.structuralStates} frontierPeak=${summary.frontierPeak}`);
  if (summary.certificate) {
    console.log(`certificate=${summary.certificate.hash} steps=${summary.certificate.stepCount} replay=${summary.certificate.replay.ok ? 'PASS' : 'FAIL'}`);
    console.log(`final=${JSON.stringify(summary.certificate.final)}`);
  }
}

if (config.require && (report.solvable !== true || report.certificate?.authoritativeReplay?.ok !== true)) {
  process.exitCode = 1;
}
