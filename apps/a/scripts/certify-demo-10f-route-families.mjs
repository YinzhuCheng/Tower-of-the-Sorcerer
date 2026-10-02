import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';

function parseArgs(argv) {
  const config = { json: false, require: false, maxCycleLength: 3, targetFamilies: 3 };
  for (const arg of argv) {
    if (arg === '--json') config.json = true;
    else if (arg === '--require') config.require = true;
    else if (arg.startsWith('--max-cycle-length=')) config.maxCycleLength = Number(arg.slice('--max-cycle-length='.length));
    else if (arg.startsWith('--target-families=')) config.targetFamilies = Number(arg.slice('--target-families='.length));
    else if (arg === '--help') config.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(config.maxCycleLength) || config.maxCycleLength < 2 || config.maxCycleLength > 5) {
    throw new Error('--max-cycle-length must be an integer from 2 through 5.');
  }
  if (!Number.isInteger(config.targetFamilies) || config.targetFamilies < 2 || config.targetFamilies > 6) {
    throw new Error('--target-families must be an integer from 2 through 6.');
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

function compactAttempt(attempt, selected = []) {
  return {
    discoverySeed: attempt.id,
    decisions: attempt.family.decisions,
    purchaseCounts: attempt.family.purchaseCounts,
    steps: attempt.family.stepCount,
    final: attempt.family.final,
    minNormalizedHpMargin: attempt.family.minNormalizedHpMargin,
    minimumDistanceToOtherSelected: selected.length <= 1
      ? null
      : Math.min(...selected.filter((entry) => entry !== attempt)
        .map((entry) => ['f8Vault', 'holyTiming', 'shopStyle']
          .reduce((distance, field) => distance + Number(
            attempt.family.decisions[field] !== entry.family.decisions[field]
          ), 0)))
  };
}

const config = parseArgs(process.argv.slice(2));
if (config.help) {
  console.log('Usage: node scripts/certify-demo-10f-route-families.mjs [--max-cycle-length=3] [--target-families=3] [--json] [--require]');
  process.exit(0);
}

installFrozenDemo();
const { certifyDemoTenFloorRouteFamilies } = await import('../src/solver/demo-10f-route-family-certification.js');
const selection = certifyDemoTenFloorRouteFamilies({
  maxCycleLength: config.maxCycleLength,
  targetFamilies: config.targetFamilies,
});
const report = {
  model: selection.model,
  discoverySeeds: selection.discoverySeeds,
  replayableWins: selection.replayableWins,
  hardCandidates: selection.hardCandidates,
  discoveredFamilies: selection.discoveredFamilies,
  requiredFamilies: selection.targetFamilies,
  minimumDecisionDistance: selection.minDistance,
  complete: selection.complete,
  selected: selection.selected.map((attempt) => compactAttempt(attempt, selection.selected))
};

if (config.json) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`10F independent route families: ${report.complete ? 'PASS' : 'FAIL'} selected=${report.selected.length}/${report.requiredFamilies}`);
  console.log(`discoverySeeds=${report.discoverySeeds} replayableWins=${report.replayableWins} hardCandidates=${report.hardCandidates} discoveredFamilies=${report.discoveredFamilies}`);
  for (const route of report.selected) {
    console.log(`${route.discoverySeed} decisions=${JSON.stringify(route.decisions)} margin=${route.minNormalizedHpMargin} steps=${route.steps}`);
  }
}

if (config.require && !report.complete) process.exitCode = 1;
