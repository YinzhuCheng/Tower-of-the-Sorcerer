import assert from 'node:assert/strict';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';

function installFrozenDemo() {
  applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
  applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
  applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
  applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
  applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
  applyDemoTenFloorHardMode({ enemies: ENEMIES });
}

installFrozenDemo();
const { certifyDemoTenFloorRouteFamilies } = await import('../src/solver/demo-10f-route-family-certification.js');
const { evaluateDemoTenFloorPressureProfile } = await import('../src/tuner/demo-10-floor-pressure-profile.js');
const report = evaluateDemoTenFloorPressureProfile({
  certify: () => certifyDemoTenFloorRouteFamilies({ targetFamilies: 3 })
});

assert.equal(report.pressured.complete, true, 'pressured profile must retain three route families.');
assert.equal(report.relaxed.complete, true, 'temporary mutator relaxation must remain a valid comparison baseline.');
assert.ok(report.replayableWinReduction >= 0.4, 'pressure bundle must remove at least 40% of replayable discovery wins.');
assert.ok(report.hardCandidateReduction >= 0.45, 'pressure bundle must remove at least 45% of forgiving hard candidates.');

console.log('10F pressure-profile mutation verification passed.');
console.log(JSON.stringify(report, null, 2));
