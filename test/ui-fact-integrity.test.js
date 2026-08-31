import test from 'node:test';
import assert from 'node:assert/strict';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTwentyFloorContent } from '../src/game/demo-20-floor-content.js';
import { applyDemoThirtyFloorContent } from '../src/game/demo-30-floor-content.js';
import { buildEnemyHoverPreview, buildMapUnitHoverPreview } from '../src/game/tactical-interaction.js';
import { getEndingDebrief } from '../src/game/ending-debrief.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorHardMode({ enemies: ENEMIES });
applyDemoTwentyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });
applyDemoThirtyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });

const { createInitialState } = await import('../src/game/engine.js');

function findToken(state, token) {
  const map = state.floorStates[state.floor].map;
  for (let y = 0; y < map.length; y += 1) {
    const x = map[y].indexOf(token);
    if (x >= 0) return { x, y };
  }
  throw new Error(`Token not found: ${token}`);
}

test('critical map interactions disclose their own rule before the player commits', () => {
  const state = createInitialState();

  state.floor = 17; // F18
  const starGate = findToken(state, 'gate:f18StarChannel');
  const gatePreview = buildMapUnitHoverPreview(state, starGate.x, starGate.y);
  assert.equal(gatePreview.title, '星渠封锁结界');
  assert.ok(gatePreview.details.some((entry) => entry.label === '完成效果' && /生命 -18%/.test(entry.value)));
  const herald = findToken(state, 'enemy:voidHerald');
  assert.match(buildMapUnitHoverPreview(state, herald.x, herald.y).ruleText, /生命 -18%/);

  state.floor = 19; // F20
  const council = findToken(state, 'council');
  const councilPreview = buildMapUnitHoverPreview(state, council.x, council.y);
  assert.equal(councilPreview.kind, 'council');
  assert.match(councilPreview.description, /敌方顺序、可出战盟友、可分配 MP 与预演结果/);

  state.floor = 26; // F27
  const firstGuardian = findToken(state, 'enemy:marginDuelist');
  assert.match(buildMapUnitHoverPreview(state, firstGuardian.x, firstGuardian.y).ruleText, /若它是首个被击败/);

  state.floor = 10; // F11
  const f11Stairs = findToken(state, 'U');
  assert.match(buildMapUnitHoverPreview(state, f11Stairs.x, f11Stairs.y).details[0].value, /选择一座专家宝库/);

  state.floor = 3; // F4
  const weapon = findToken(state, 'item:weapon');
  assert.match(buildMapUnitHoverPreview(state, weapon.x, weapon.y).description, /不影响上行阶梯/);
});

test('hover and ending rules use the same effective late-game mechanics as combat', () => {
  const state = createInitialState();
  state.stats = { hp: 1_000_000, maxHp: 1_000_000, atk: 1_000_000, def: 1_000_000, gold: 0 };
  state.floor = 29; // F30
  state.charter = { selectedId: 'audit', completedId: 'audit', relayRefilled: false, legacyOpen: false };
  state.handoff = { selectedId: 'proofread', beaconRefilled: false, legacyOpen: false };
  const archiveWarden = findToken(state, 'enemy:archiveWarden');
  const archivePreview = buildMapUnitHoverPreview(state, archiveWarden.x, archiveWarden.y);
  assert.equal(archivePreview.enemy.hp, Math.round(ENEMIES.archiveWarden.hp * 0.79));
  assert.equal(archivePreview.enemy.magicPower, ENEMIES.archiveWarden.magicPower - 150);
  assert.match(archivePreview.ruleText, /逐页校验/);
  assert.match(archivePreview.ruleText, /校验优先/);

  const mpBlocked = createInitialState();
  mpBlocked.stats.atk = 1_000;
  mpBlocked.magic = { unlocked: true, mp: 0, maxMp: 100, tier: 1 };
  const blockedPreview = buildEnemyHoverPreview(mpBlocked, 'catScout');
  assert.equal(blockedPreview.magicAffordable, false);
  assert.match(blockedPreview.remainingText, /本战不能开始/);

  const ending = getEndingDebrief({
    alliance: { bonds: { milu: false, lanin: false, yanli: false, yayu: false } },
    council: { outcome: { survivors: [], modifiers: { labels: [] } } },
    handoff: { selectedId: 'proofread', beaconRefilled: false, legacyOpen: false }
  });
  assert.ok(ending.activatedRules.some((label) => /校验优先/.test(label)));
});
