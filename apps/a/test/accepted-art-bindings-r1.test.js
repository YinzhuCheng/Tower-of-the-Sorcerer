import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
const root = new URL('../', import.meta.url);
const catUrl = '/assets/anime/themes/theme-cat-wing-accepted-20261001.png';
const queenUrl = '/assets/anime/cg/noctia-arrival-silence-accepted-20261001.png';
const queenText = '诺克缇娅看向七枚核心。米露的铃声、澜音的船长回话、露米的时间记录在殿中依次响起，她的剑尖第一次动摇。';

async function renderer() {
  const source = await readFile(new URL('src/main.js', root), 'utf8');
  const context = vm.createContext({ document: { body: { dataset: { theme: 'night' } } } });
  const tables = ['GAL_BACKDROPS', 'GAL_DIALOGUE_BACKDROPS', 'GAL_FLOOR_BACKDROPS'].map(name => {
    const declaration = source.match(new RegExp(`const ${name} = Object\\.freeze\\(\\{[\\s\\S]*?\\n\\}\\);`));
    assert.ok(declaration, name);
    return declaration[0];
  }).join('\n');
  const functions = ['galBackdropFor', 'galCgFor'].map(name => {
    const declaration = source.match(new RegExp(`function ${name}\\([\\s\\S]*?\\n\\}`));
    assert.ok(declaration, name);
    return declaration[0];
  }).join('\n');
  vm.runInContext(`const galArtUrl = path => path;\n${tables}\n${functions}\nthis.resolveBackdrop = galBackdropFor; this.resolveCg = galCgFor;`, context);
  return context;
}

test('accepted cat room is used by all 16 current cat pre/post turns without broader bindings', async () => {
  const r = await renderer();
  for (const [id, count] of [['bossCatPreDemo', 9], ['bossCatPostDemo', 7]]) {
    const scene = DIALOGUES[id];
    assert.equal(scene.turns.length, count);
    for (const turn of scene.turns) assert.equal(r.resolveBackdrop(id, scene, turn), catUrl);
  }
  assert.match(DIALOGUES.bossCatPreDemo.turns[1].text, /长桌.*靠墙的小凳/);
  for (const id of ['bossFoxPreDemo','bossFoxPostDemo','bossQueenPreDemo','floor2']) {
    const scene = DIALOGUES[id];
    for (const turn of scene.turns) assert.notEqual(r.resolveBackdrop(id, scene, turn), catUrl, id);
  }
});

test('queen remains unbound while current narration and historical source card differ', async () => {
  const turns = DIALOGUES.bossQueenPreDemo.turns;
  assert.equal(turns[6].text, queenText);
  assert.match(turns[10].text, /必须亲口承担/);
  const r = await renderer();
  for (let index = 0; index < turns.length; index++) {
    assert.equal(turns[index].cg, undefined);
    assert.equal(r.resolveCg(turns,index), null, `turn ${index}`);
  }
});

test('the only added runtime art is exact accepted master bytes and has direct renderer/content references', async () => {
  const assets = [
    [catUrl, 'ba7648262038f2e4524617b18d39a2d789d32b317cdf851d767f11084951d04b', 'src/main.js']
  ];
  const contract = JSON.parse(await readFile(new URL('test/fixtures/runtime-art-contract.json', root)));
  for (const [url, expected, ref] of assets) {
    const bytes = await readFile(new URL(`public${url}`, root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expected);
    assert.ok(contract.files.some(f => f.path === `public${url}` && f.sha256 === expected && f.bytes === bytes.length));
    assert.ok((await readFile(new URL(ref, root), 'utf8')).includes(url));
  }
  assert.equal(contract.files.filter(f => /accepted-20261001/.test(f.path)).length, 1);
  assert.equal(contract.files.some(f => /theme-moon-white-vestibule/.test(f.path)), false, 'superseded cat-only background is excluded');
  assert.equal(contract.files.some(f => f.path === `public${queenUrl}`), false, 'queen needs a proven current text match');
  assert.equal(contract.files.some(f => /fox-wing/.test(f.path)), false, 'empty fox rack is intentionally not promoted');
});
