import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTwentyFloorContent } from '../src/game/demo-20-floor-content.js';
import { applyDemoThirtyFloorContent } from '../src/game/demo-30-floor-content.js';
import { DIALOGUE_CAST } from '../src/game/anime-portraits.js';
import { BACKDROPS, CG_SCENES, KNOWN_SIGNALS, TRANSITIONS } from '../public/art-audit/registry.js';

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
  assert.equal(CG_SCENES.length, 9);
  assert.equal(BACKDROPS.length, 12);
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

  assert.match(KNOWN_SIGNALS.arcane_sovereign.join(' '), /银白短发/);
  assert.match(KNOWN_SIGNALS.arcane_sovereign.join(' '), /青黑长发/);
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
  assert.match(app, /localStorage\.setItem\(STORAGE_KEY/);
  assert.match(app, /new Blob/);
  assert.match(app, /data-record-key/);
  assert.match(app, /dialoguePresentation\(id, expression\)/);
  assert.match(css, /\.identity-grid/);
  assert.match(css, /@media \(max-width: 840px\)/);
  assert.match(build, /cp\(join\(root, 'public'\), outDir/);
});
