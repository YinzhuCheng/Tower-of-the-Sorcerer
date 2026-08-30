import test from 'node:test';
import assert from 'node:assert/strict';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorHardMode({ enemies: ENEMIES });

const { certifyDemoTenFloorRouteFamilies } = await import('../src/solver/demo-10f-route-family-certification.js');
const { evaluateDemoTenFloorPressureProfile } = await import('../src/tuner/demo-10-floor-pressure-profile.js');

test('10F mutator pressure removes forgiving routes while preserving frozen topology and three hard families', { timeout: 60_000 }, () => {
  const report = evaluateDemoTenFloorPressureProfile({
    certify: () => certifyDemoTenFloorRouteFamilies({ targetFamilies: 3 })
  });

  assert.equal(report.pressured.complete, true);
  assert.equal(report.relaxed.complete, true);
  assert.ok(report.replayableWinReduction >= 0.4);
  assert.ok(report.hardCandidateReduction >= 0.45);
  assert.equal(report.pressured.selected.length, 3);
});
