import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTwentyFloorContent } from '../src/game/demo-20-floor-content.js';
import { applyDemoThirtyFloorContent } from '../src/game/demo-30-floor-content.js';
import { DIALOGUE_CAST, portraitName, portraitUrl } from '../src/game/anime-portraits.js';
import {
  AUDIT_VERSION,
  BACKDROPS,
  CG_SCENES,
  KNOWN_SIGNALS,
  NON_LIVING_UNIT_PORTRAITS,
  TRANSITIONS
} from '../public/art-audit/registry.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTwentyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });
applyDemoThirtyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });

test('art audit page covers every speaking character and every authored CG mapping', async () => {
  const spokenIds = new Set(Object.values(DIALOGUES)
    .flatMap((dialogue) => dialogue.turns?.length ? dialogue.turns : [dialogue])
    .map((turn) => turn.portrait)
    .filter(Boolean));

  assert.deepEqual([...spokenIds].sort(), Object.keys(DIALOGUE_CAST).sort());
  assert.equal(CG_SCENES.length, 19);
  assert.equal(BACKDROPS.length, 21);
  assert.equal(TRANSITIONS.length, 2);

  const dialogueCgs = new Set(Object.values(DIALOGUES)
    .flatMap((dialogue) => dialogue.turns?.length ? dialogue.turns : [dialogue])
    .map((turn) => turn.cg)
    .filter(Boolean));
  const auditedCgPaths = new Set(CG_SCENES.map(({ path }) => path));
  for (const cg of dialogueCgs) assert.ok(auditedCgPaths.has(cg), `${cg} must appear in the human audit page`);

  for (const asset of [...CG_SCENES, ...BACKDROPS, ...TRANSITIONS]) {
    await access(new URL(`../public${asset.path}`, import.meta.url));
  }

  assert.equal(AUDIT_VERSION, '2026-09-04-continuity-completion-v1');
  assert.deepEqual(NON_LIVING_UNIT_PORTRAITS, ['void_core', 'origin_core', 'act3_errata_core']);
  assert.deepEqual(KNOWN_SIGNALS, {});
});

test('art audit page covers every living combat unit, the hero and the merchant', async () => {
  const enemyManifest = JSON.parse(await readFile(new URL('../public/assets/anime/enemies/manifest.json', import.meta.url), 'utf8'));
  const mapManifest = JSON.parse(await readFile(new URL('../public/assets/anime/map/manifest.json', import.meta.url), 'utf8'));
  const excluded = new Set(NON_LIVING_UNIT_PORTRAITS);
  const livingEnemies = Object.values(ENEMIES).filter(({ portrait }) => !excluded.has(portrait));

  assert.equal(Object.keys(ENEMIES).length, 81);
  assert.equal(livingEnemies.length, 78);
  assert.equal(portraitName('arcane_sovereign'), '奥术主权者');
  assert.equal(portraitName('act3_archive_warden'), '档案守望者');
  assert.equal(mapManifest.atlases.hero.file, 'atlases/runtime/hero-v6.webp');
  assert.equal(mapManifest.atlases.heroPortraitV4.file, 'atlases/runtime/hero-portrait-v4.webp');
  assert.equal(portraitUrl('hero'), '/assets/anime/avatars/liyue-avatar-embers-cel.webp');
  assert.ok(enemyManifest.assets.merchant.file);

  for (const enemy of livingEnemies) {
    const entry = enemyManifest.assets[enemy.portrait];
    const lowResolutionMatch = entry?.file?.match(/^enemies\/v1\/(.+)-map-128\.webp$/);
    const mapFile = entry?.highResFile
      ?? (lowResolutionMatch ? `portraits/v1/${lowResolutionMatch[1]}-portrait-runtime.webp` : entry?.file);
    assert.ok(mapFile, `${enemy.portrait} must have a direct map-unit image`);
    await access(new URL(`../public/assets/anime/${mapFile}`, import.meta.url));
    const runtimePortrait = portraitUrl(enemy.portrait);
    assert.match(runtimePortrait, /^\/assets\//, `${enemy.portrait} must expose an auditable runtime portrait`);
    await access(new URL(`../public${runtimePortrait}`, import.meta.url));
  }

  const lowResolutionEntries = Object.values(enemyManifest.assets)
    .filter(({ file }) => /-map-128\.webp$/.test(file));
  assert.equal(lowResolutionEntries.length, 48);
  for (const entry of lowResolutionEntries) {
    const highResolutionFile = entry.highResFile
      ?? entry.file.replace(/^enemies\/v1\//, 'portraits/v1/').replace(/-map-128\.webp$/, '-portrait-runtime.webp');
    assert.notEqual(highResolutionFile, entry.file);
    await access(new URL(`../public/assets/anime/${highResolutionFile}`, import.meta.url));
  }

  assert.equal(enemyManifest.assets.shadow_boss.highResFile, 'characters/yayu-dialogue-guarded.webp');
  assert.equal(enemyManifest.assets.echo_regent.highResFile, 'characters/echo-regent-dialogue-grave.webp');
  assert.equal(enemyManifest.assets.arcane_sovereign.highResFile, 'characters/arcane-sovereign-dialogue-regret.webp');
  assert.equal(enemyManifest.assets.act3_archive_warden.highResFile, 'characters/archive-warden-dialogue-duty.webp');
});

test('art audit page ships review persistence, filters, lightbox and JSON export', async () => {
  const [html, app, css, build] = await Promise.all([
    readFile(new URL('../public/art-audit/index.html', import.meta.url), 'utf8'),
    readFile(new URL('../public/art-audit/app.js', import.meta.url), 'utf8'),
    readFile(new URL('../public/art-audit/styles.css', import.meta.url), 'utf8'),
    readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8')
  ]);

  assert.match(html, /id="search"/);
  assert.match(html, /id="status-filter"/);
  assert.match(html, /id="lightbox"/);
  assert.match(html, /导出审核 JSON/);
  assert.match(html, /data-kind="tower-unit">魔塔单位/);
  assert.match(html, /href="\/art-audit\/styles\.css"/);
  assert.match(html, /src="\/art-audit\/app\.js"/);
  assert.match(app, /localStorage\.setItem\(STORAGE_KEY/);
  assert.match(app, /art-audit:reviews:v2/);
  assert.match(app, /new Blob/);
  assert.match(app, /data-record-key/);
  assert.match(app, /dialoguePresentation\(id, expression\)/);
  assert.match(app, /buildTowerUnits/);
  assert.match(app, /highResFile/);
  assert.match(app, /assets\/anime\/enemies\/manifest\.json/);
  assert.match(app, /tower-unit-card/);
  assert.match(css, /\.identity-grid/);
  assert.match(css, /\.unit-identity-grid/);
  assert.match(css, /@media \(max-width: 840px\)/);
  assert.match(build, /cp\(join\(root, 'public'\), outDir/);
});
