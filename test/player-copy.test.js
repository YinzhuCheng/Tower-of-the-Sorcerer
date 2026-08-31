import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { combatRuleCopy, HELP_SECTIONS, PLAYER_COPY_VERSION } from '../src/game/player-copy.js';
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

test('combat copy states timing and defense exceptions explicitly', () => {
  assert.equal(PLAYER_COPY_VERSION, 'object-facts-v2');
  assert.match(combatRuleCopy({ special: 'magic', magicPower: 28 }), /每次反击固定造成 28 点伤害，不受防御影响/);
  assert.match(combatRuleCopy({ special: 'firstStrike' }), /开战前会额外攻击 1 次/);
  assert.match(combatRuleCopy({ special: 'doubleHit' }), /每次反击会造成 2 段伤害/);
  assert.equal(HELP_SECTIONS.length, 3);
});

test('main UI presents object facts instead of fixed objectives or route forecasts', async () => {
  const [source, markup] = await Promise.all([
    readFile(join(root, 'src/main.js'), 'utf8'),
    readFile(join(root, 'index.html'), 'utf8')
  ]);
  assert.match(source, /专家选择/);
  assert.match(source, /跳过叙事/);
  assert.doesNotMatch(source, /getFreeRouteIntel|showRouteIntel|路线情报/);
  assert.doesNotMatch(markup, /floor-objective|btn-route-intel|路线情报/);
  assert.match(HELP_SECTIONS[0].lines.join('\n'), /效果、条件、消耗与当前状态/);
  assert.match(HELP_SECTIONS[0].lines.join('\n'), /结界本身会显示实际消耗/);
  assert.doesNotMatch(HELP_SECTIONS.flatMap((section) => section.lines).join('\n'), /主路|支线|先在.*情报/);
});

test('internal floor metadata stays concise without leaking solver terminology into current dialogue', async () => {
  const source = await Promise.all([
    readFile(join(root, 'src/game/demo-10-floor-progression-topology.js'), 'utf8'),
    readFile(join(root, 'src/game/demo-20-floor-content.js'), 'utf8'),
    readFile(join(root, 'src/game/demo-30-floor-content.js'), 'utf8')
  ]);
  for (const file of source) {
    assert.doesNotMatch(file, /路线代价仍由你承担|本层不设 Boss 税|数值收敛配置统一管理/);
  }
  assert.match(source[2], /首战决定终局支援/);
  assert.doesNotMatch(source[1], /主路可上行/);
});

test('assembled 30F campaign keeps automatic story and objectives scannable', () => {
  applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
  applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
  applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
  applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
  applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
  applyDemoTenFloorHardMode({ enemies: ENEMIES });
  applyDemoTwentyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });
  applyDemoThirtyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });

  assert.equal(FLOORS.length, 30);
  assert.ok(FLOORS.every((floor) => [...floor.objective].length <= 40));
  const automaticLines = Object.values(DIALOGUES)
    .flatMap((dialogue) => dialogue.turns ?? [dialogue])
    .map((turn) => String(turn.text ?? '').replaceAll('\n', ''));
  assert.ok(automaticLines.every((line) => [...line].length <= 70));
});

test('production copy does not present the starting codex as a combat-intel gate', async () => {
  const { createInitialState } = await import('../src/game/engine.js');
  const { buildMapUnitHoverPreview } = await import('../src/game/tactical-interaction.js');
  const state = createInitialState();
  assert.equal(state.relics.codex, true);
  assert.ok(!state.floorStates.some((floorState) => floorState.map.some((row) => row.includes('item:codex'))));
  assert.doesNotMatch(FLOORS[0].objective, /拿图鉴|取得魔眼图鉴/);

  const enemyRow = state.floorStates[0].map.findIndex((row) => row.some((token) => token.startsWith('enemy:')));
  const enemyColumn = state.floorStates[0].map[enemyRow].findIndex((token) => token.startsWith('enemy:'));
  state.relics.codex = false;
  const directEnemyIntel = buildMapUnitHoverPreview(state, enemyColumn, enemyRow);
  assert.equal(directEnemyIntel?.kind, 'enemy');
  assert.match(directEnemyIntel?.damageText ?? '', /HP|无法破防/);

  const activeCopy = [
    ...FLOORS.map((floor) => floor.objective),
    ...Object.values(DIALOGUES).flatMap((dialogue) => [
      dialogue.text,
      ...(dialogue.turns ?? []).map((turn) => turn.text)
    ]),
    ...Object.values(ENEMIES).map((enemy) => enemy.description)
  ].filter(Boolean).join('\n');
  assert.doesNotMatch(activeCopy, /先拿.*图鉴|取得.*图鉴.*耗血|图鉴中查看/);

  const mainSource = await readFile(join(root, 'src/main.js'), 'utf8');
  assert.doesNotMatch(mainSource, /function updateBattlePreview\(\) \{\s*if \(!state\.relics\.codex\)/);
  assert.match(mainSource, /const previews = getAdjacentEnemyPreviews\(state\);/);
});
