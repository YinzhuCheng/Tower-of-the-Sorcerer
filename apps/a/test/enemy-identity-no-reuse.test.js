import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTwentyFloorContent } from '../src/game/demo-20-floor-content.js';
import { applyDemoThirtyFloorContent } from '../src/game/demo-30-floor-content.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorHardMode({ enemies: ENEMIES });
applyDemoTwentyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });
applyDemoThirtyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });

test('every distinct logical enemy in the active 30-floor campaign has a dedicated visual key', async () => {
  const manifest = JSON.parse(await readFile(join(root, 'public/assets/anime/enemies/manifest.json'), 'utf8'));
  const ownerByPortrait = new Map();

  for (const [id, enemy] of Object.entries(ENEMIES)) {
    if (!enemy?.name || !enemy.portrait) continue;
    assert.ok(manifest.assets[enemy.portrait], `${id} (${enemy.name}) must resolve through the enemy art manifest`);
    const firstOwner = ownerByPortrait.get(enemy.portrait);
    assert.equal(firstOwner, undefined, `${id} (${enemy.name}) must not reuse ${enemy.portrait} from ${firstOwner}`);
    ownerByPortrait.set(enemy.portrait, id);
  }

  assert.ok(ownerByPortrait.size >= 70, 'the active campaign should retain its full logical enemy roster');
});
