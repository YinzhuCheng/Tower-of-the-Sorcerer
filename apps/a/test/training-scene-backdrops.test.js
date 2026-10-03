import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTwentyFloorContent } from '../src/game/demo-20-floor-content.js';
import { applyDemoThirtyFloorContent } from '../src/game/demo-30-floor-content.js';
import { resolveStoryDialogue, CORE_BOSS_IDS } from '../src/game/story-dialogue-facts.js';
import { createGalPreviewStoryState } from '../src/game/story-preview-context.js';
const content={enemies:ENEMIES,floors:FLOORS,dialogues:DIALOGUES,gridSize:GRID_SIZE,items:ITEMS};
applyDemoTenFloorContent(content);applyDemoTwentyFloorContent(content);applyDemoThirtyFloorContent(content);
const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const corridor='/assets/anime/themes/theme-floor04-empty-blade-training-court-v2.webp';
const sidehall='/assets/anime/themes/theme-floor05-blade-guard-branch-v1.webp';
const expected={floor4:[corridor,8],bossSwordPreDemo:[sidehall,8],bossSwordPostDemo:[sidehall,7]};
const tables=['GAL_BACKDROPS','GAL_DIALOGUE_BACKDROPS','GAL_FLOOR_BACKDROPS','GAL_TRANSITIONS'].map(n=>main.match(new RegExp(`const ${n} = Object\\.freeze\\(\\{[\\s\\S]*?\\n\\}\\);`))[0]).join('\n');
const functions=['galBackdropFor','preloadGalImage','preloadGalDialogueArt','rememberGalLine'].map(n=>main.match(new RegExp(`function ${n}\\([\\s\\S]*?\\n\\}`))[0]).join('\n');
function renderer() {
 const loaded=[];
 const ctx=vm.createContext({document:{body:{dataset:{theme:'forest'}}},Image:class {set src(url){loaded.push(url);}}});
 vm.runInContext(`const galArtUrl=p=>p;const galImagePreloads=new Map();const galHistory=[];const GAL_HISTORY_LIMIT=600;const persistGalOnlyHistory=()=>{};const galTransitionFor=()=> 'witness';const dialoguePresentation=id=>({stage:'stage:'+id,avatar:'avatar:'+id});${tables}\n${functions}\nObject.assign(this,{galBackdropFor,preloadGalDialogueArt,rememberGalLine,galHistory,GAL_BACKDROPS,GAL_DIALOGUE_BACKDROPS,GAL_FLOOR_BACKDROPS});`,ctx);
 return {ctx,loaded};
}
const resolve=(id,s,edition=30)=>resolveStoryDialogue(id,DIALOGUES[id],s,{floors:FLOORS.slice(0,edition)});
function frozen(o){if(o&&typeof o==='object'){Object.freeze(o);Object.values(o).forEach(frozen);}return o;}

test('F4 empty training court and F5 sword pre/post map all 23 turns across every core subset and all editions',()=>{
 const {ctx}=renderer();const corpus=JSON.stringify(DIALOGUES);
 for(let mask=0;mask<128;mask++)for(const edition of [10,20,30]){
  const ids=CORE_BOSS_IDS.filter((_,i)=>mask&(1<<i));
  const state=frozen({cores:ids.length,floorStates:[{defeatedBossIds:ids}],storySeen:['prologue'],galSeen:['floor2'],council:{completed:false}});
  const before=JSON.stringify(state);
  for(const [id,[url,count]] of Object.entries(expected)){
   const d=resolve(id,state,edition);assert.equal(d.turns.length,count);
   for(const t of d.turns)assert.equal(ctx.galBackdropFor(id,d,t),url,`${mask}/${edition}/${id}`);
  }
  assert.equal(JSON.stringify(state),before);
 }
 assert.equal(JSON.stringify(DIALOGUES),corpus);
});

test('F2 exact bindings, cat room, Lanyin room and every broad floor binding stay independent',()=>{
 const {ctx}=renderer();const mappings=ctx.GAL_DIALOGUE_BACKDROPS;
 assert.equal(mappings.bossCatPreDemo,'moonWhiteVestibule');assert.equal(mappings.bossCatPostDemo,'moonWhiteVestibule');
 assert.match(ctx.GAL_BACKDROPS.moonWhiteVestibule,/theme-cat-wing-accepted-20261001\.png$/);
 for(const id of ['bossWhalePreDemo','bossWhalePostDemo'])assert.equal(mappings[id],'floor03TideNavigation');
 assert.equal(mappings.floor2,'floor02SenraTwoWingCorridor');
 for(const id of ['bossFoxPreDemo','bossFoxPostDemo'])assert.equal(mappings[id],'floor02FoxLeafRegistrySidehall');
 assert.equal(mappings.floor5,undefined);
 for(const id of ['bossDragonPreDemo','bossDragonPostDemo'])assert.equal(mappings[id],'floor05RedVeinShelter');
 assert.equal(ctx.GAL_FLOOR_BACKDROPS[2],'forest','no broad floor-2 fallback override');
 assert.equal(ctx.GAL_FLOOR_BACKDROPS[4],'forest');assert.equal(ctx.GAL_FLOOR_BACKDROPS[5],'floor05RedVeinShelter');
 assert.deepEqual(Object.entries(mappings).filter(([,v])=>['floor04EmptyBladeTrainingCourt','floor05BladeGuardBranch'].includes(v)).map(([k])=>k).sort(),Object.keys(expected).sort());
 // Explicit per-turn/source overrides retain their existing priority.
 assert.match(ctx.galBackdropFor('floor4',{backdrop:'night'},{}),/theme-night-tower/);
 assert.match(ctx.galBackdropFor('floor4',{backdrop:'night'},{backdrop:'sun'}),/theme-sun-sanctum/);
});

test('existing per-scene preload closure includes the new resolved background and never the old exterior',()=>{
 for(const [id,[url]] of Object.entries(expected)){
  const {ctx,loaded}=renderer();const state=createGalPreviewStoryState(id);const d=resolve(id,state);
  ctx.preloadGalDialogueArt(id,d,d.turns);
  assert.ok(loaded.includes(url),`${id} critical scene-art closure`);
  assert.equal(loaded.filter(u=>u===url).length,1,'preload deduplicates unchanged background');
  assert.ok(!loaded.some(u=>u.includes('theme-forest-approach')));
  assert.ok(loaded.includes('stage:hero'));assert.ok(loaded.some(u=>u.includes('witness-entry')));
 }
 const tactical=fs.readFileSync(new URL('../src/game/visual-theme-v8.js',import.meta.url),'utf8');
 assert.doesNotMatch(tactical,/theme-floor0[45]-(?:empty-blade|blade-guard)/,'GAL backgrounds must not delay unrelated tactical startup');
 assert.match(tactical,/forest: galArtUrl\('\/assets\/anime\/themes\/theme-forest-sanctuary\.webp'\)/);
});

test('pure GAL and separately keyed history revisits preserve shown text while selecting the same F4/F5 environment',()=>{
 const {ctx}=renderer();
 for(const [id,[url]] of Object.entries(expected)){
  const state=createGalPreviewStoryState(id);const before=JSON.stringify(state);const d=resolve(id,state);
  d.turns.forEach((turn,i)=>ctx.rememberGalLine(`${id}:first:${i}`,turn.speaker,turn.text));
  const shown=JSON.stringify(ctx.galHistory);state.cores=7;state.floorStates=[{defeatedBossIds:[...CORE_BOSS_IDS]}];
  const revisited=resolve(id,state);
  assert.equal(JSON.stringify(ctx.galHistory),shown,'history is not re-resolved');
  assert.ok(d.turns.every(t=>ctx.galBackdropFor(id,d,t)===url));
  assert.ok(revisited.turns.every(t=>ctx.galBackdropFor(id,revisited,t)===url));
  assert.equal(JSON.stringify(createGalPreviewStoryState(id)),before);
 }
 assert.match(main,/const backdrop = galBackdropFor\(dialogueId, dialogue, turn\)/);
 assert.match(main,/--gal-backdrop:url\('\$\{escapeHtml\(backdrop\)\}'\)/);
 const css=fs.readFileSync(new URL('../ui-v10-cinematics.css',import.meta.url),'utf8');
 assert.match(css,/background-image:var\(--gal-backdrop\)/);assert.doesNotMatch(css,/theme-forest-approach/);
});

test('new runtime art bytes match the frozen compression contract; masters are not runtime payloads',()=>{
 const contract=JSON.parse(fs.readFileSync(new URL('fixtures/runtime-art-contract.json',import.meta.url)));
 for(const [url,sha256,bytes] of [[corridor,'edd63c3742317279f9b5b3270e258e693ccfed46e30c5deeaf969be2bcb5eb2c',269268],[sidehall,'7b7714200fe729eb18309529f2fe60e5396c9c2c563e7c7e009b17b23b7b2bbb',256522]]){
  const data=fs.readFileSync(new URL('../public'+url,import.meta.url));
  assert.equal(data.length,bytes);assert.equal(createHash('sha256').update(data).digest('hex'),sha256);
  assert.equal(data.subarray(8,12).toString(),'WEBP');
  assert.deepEqual(contract.files.find(e=>e.path==='public'+url),{path:'public'+url,sha256,bytes});
 }
 assert.equal(contract.files.filter(e=>/theme-floor0[45]-(empty-blade|blade-guard)/.test(e.path)).length,2);
 assert.ok(!contract.files.some(e=>/BG_A_F0[45]_|prompt_packets/.test(e.path)));
});
