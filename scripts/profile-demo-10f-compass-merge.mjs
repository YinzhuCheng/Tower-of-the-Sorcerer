import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';

function parseArgs(argv) {
  const config = { maxExpanded: 10_000, maxGenerated: 100_000, require: false, json: false };
  for (const arg of argv) {
    if (arg === '--require') config.require = true;
    else if (arg === '--json') config.json = true;
    else if (arg.startsWith('--max-expanded=')) config.maxExpanded = Number(arg.slice(15));
    else if (arg.startsWith('--max-generated=')) config.maxGenerated = Number(arg.slice(16));
    else if (arg === '--help') config.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  for (const [name, value] of Object.entries({ maxExpanded: config.maxExpanded, maxGenerated: config.maxGenerated })) {
    if (!Number.isInteger(value) || value <= 0) throw new Error(`${name} must be a positive integer.`);
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

function compact(report) {
  return {
    stop: report.stoppedReason ?? 'exhausted',
    solvable: report.solvable,
    expanded: report.expandedStates,
    generated: report.generatedStates,
    structural: report.structuralStates,
    frontierPeak: report.frontierPeak,
    teleports: report.profile.generatedByAction.teleport ?? 0
  };
}

const config = parseArgs(process.argv.slice(2));
if (config.help) {
  console.log('Usage: node scripts/profile-demo-10f-compass-merge.mjs [--max-expanded=N] [--max-generated=N] [--require] [--json]');
  process.exit(0);
}

// The adapter codec captures the authored event catalogue at module load, so
// install the frozen 10F overlay before importing the solver modules.
installFrozenDemo();
const [{ solve }, { createTowerAdapter }, { createTowerTeleportTransitionMemoAdapter }] = await Promise.all([
  import('../src/solver/search.js'),
  import('../src/solver/tower-adapter.js'),
  import('../src/solver/tower-teleport-transition-memo-adapter.js')
]);

function run(useMemo) {
  const baseAdapter = createTowerAdapter();
  const adapter = useMemo
    ? createTowerTeleportTransitionMemoAdapter({ baseAdapter, minCores: 0 })
    : baseAdapter;
  const startedAt = performance.now();
  const report = solve({
    adapter,
    mode: 'existence',
    maxExpanded: config.maxExpanded,
    maxGenerated: config.maxGenerated,
    solverVersion: 'demo-10f-compass-merge-profile-v1'
  });
  return {
    ...compact(report),
    elapsedMs: Math.round(performance.now() - startedAt),
    memo: adapter.teleportTransitionMemoStats?.() ?? null
  };
}

const baseline = run(false);
const merged = run(true);
const result = {
  schemaVersion: 1,
  model: 'same-authoritative-search-budget',
  budget: { maxExpanded: config.maxExpanded, maxGenerated: config.maxGenerated },
  baseline,
  merged,
  reduction: {
    generated: 1 - merged.generated / baseline.generated,
    teleports: baseline.teleports ? 1 - merged.teleports / baseline.teleports : 0
  },
  sameStructuralFrontierAtBudget: baseline.structural === merged.structural
    && baseline.frontierPeak === merged.frontierPeak
};

if (config.json) console.log(JSON.stringify(result, null, 2));
else {
  console.log(`Compass exact-merge profile: expanded=${config.maxExpanded} generated ${baseline.generated} -> ${merged.generated} (${(result.reduction.generated * 100).toFixed(1)}% fewer)`);
  console.log(`teleports ${baseline.teleports} -> ${merged.teleports} (${(result.reduction.teleports * 100).toFixed(1)}% fewer); omitted=${merged.memo?.omittedEquivalentTeleports ?? 0}`);
  console.log(`same-structural-frontier=${result.sameStructuralFrontierAtBudget} stop=${baseline.stop}/${merged.stop}`);
}

if (config.require && (!result.sameStructuralFrontierAtBudget || merged.generated >= baseline.generated || (merged.memo?.omittedEquivalentTeleports ?? 0) <= 0)) {
  process.exitCode = 1;
}
