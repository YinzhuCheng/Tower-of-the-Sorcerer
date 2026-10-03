import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTwentyFloorContent } from '../src/game/demo-20-floor-content.js';
import { applyDemoThirtyFloorContent } from '../src/game/demo-30-floor-content.js';
import { resolveStoryDialogue, CORE_BOSS_IDS } from '../src/game/story-dialogue-facts.js';
import { createGalPreviewStoryState, GAL_PREVIEW_ORDER } from '../src/game/story-preview-context.js';
const c={enemies:ENEMIES,floors:FLOORS,dialogues:DIALOGUES,gridSize:GRID_SIZE,items:ITEMS};
applyDemoTenFloorContent(c);applyDemoTwentyFloorContent(c);applyDemoThirtyFloorContent(c);
const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const ctx=vm.createContext({document:{body:{dataset:{theme:'night'}}}});
const tables=['GAL_BACKDROPS','GAL_DIALOGUE_BACKDROPS','GAL_FLOOR_BACKDROPS'].map(n=>main.match(new RegExp(`const ${n} = Object\\.freeze\\(\\{[\\s\\S]*?\\n\\}\\);`))[0]).join('\n');
const names=['galBackdropFor','galCgFor','rememberGalLine'];
const fns=names.map(n=>main.match(new RegExp(`function ${n}\\([\\s\\S]*?\\n\\}`))[0]).join('\n');
vm.runInContext(`const galArtUrl=p=>p;const galHistory=[];const GAL_HISTORY_LIMIT=600;let saves=0;const persistGalOnlyHistory=()=>{saves++};${tables}\n${fns}\nObject.assign(this,{galBackdropFor,galCgFor,rememberGalLine,galHistory});`,ctx);
const state=n=>({cores:n,floorStates:[{defeatedBossIds:CORE_BOSS_IDS.slice(0,n)}],council:{completed:false}});
const resolve=(id,s,n=30)=>resolveStoryDialogue(id,DIALOGUES[id],s,{floors:FLOORS.slice(0,n)});
const plain=d=>JSON.parse(JSON.stringify(d, (k,v)=>['cg','cgHold','backdrop'].includes(k)?undefined:v));

test('all integer core counts 0..7 gate the seven-crystal CG without mutating state or authored source',()=>{
 const original=JSON.stringify(DIALOGUES.queenPhaseDemo);
 for(let n=0;n<=7;n++)for(const count of [10,20,30]){
  const s=state(n);const before=JSON.stringify(s);const d=resolve('queenPhaseDemo',s,count);
  for(const index of [4,5])assert.equal(Boolean(ctx.galCgFor(d.turns,index)),n===7,`${count}:${n}:${index}`);
  assert.equal(JSON.stringify(s),before);assert.equal(JSON.stringify(DIALOGUES.queenPhaseDemo),original);
  assert.equal(d.turns.length,6);assert.match(d.turns[4].text,n===7?/七枚核心/:new RegExp(`已收回的${n}枚核心`));
 }
});
test('30F ending turns 15..18 stay outside before, during, and after the dispatch CG for every core count',()=>{
 for(let n=0;n<=7;n++){
  const d=resolve('ending',state(n));assert.equal(d.turns.length,18);
  for(let i=14;i<=17;i++)assert.match(ctx.galBackdropFor('ending',d,d.turns[i]),/theme-ember-lighthouse\.webp$/);
  assert.equal(ctx.galCgFor(d.turns,17),null,'the final outside frame proves fallback');
  assert.match(ctx.galBackdropFor('ending',d,d.turns[13]),/writein/,'earlier interior remains');
 }
 for(const count of [10,20]){const d=resolve('ending',state(5),count);assert.equal(d.turns.length,2);assert.ok(d.turns.every(t=>t.backdrop===undefined));}
});
test('previously displayed history text stays frozen after core progress and a separately keyed revisit',()=>{
 const s=state(5),first=resolve('queenPhaseDemo',s);const oldText=first.turns[4].text;
 ctx.rememberGalLine('queenPhaseDemo:instance-1:4','旁白',oldText);
 s.cores=7;const next=resolve('queenPhaseDemo',s);
 ctx.rememberGalLine('queenPhaseDemo:instance-2:4','旁白',next.turns[4].text);
 assert.equal(ctx.galHistory[0].text,oldText);assert.match(ctx.galHistory[0].text,/5枚/);assert.match(ctx.galHistory[1].text,/七枚/);
 assert.equal(ctx.galCgFor(first.turns,4),null,'earlier resolved frame also stays frozen');
 assert.ok(ctx.galCgFor(next.turns,4));
 assert.match(main,/const historyKey = `\$\{historySceneKey\}:\$\{index\}`/);
});
test('all 57 labelled GAL scenes resolve without game mutation; the seven-core sample keeps its accepted CG',()=>{
 const game=state(0);game.storySeen=['floor2'];const before=JSON.stringify(game);
 assert.equal(GAL_PREVIEW_ORDER.length,57);
 for(const id of GAL_PREVIEW_ORDER){const s=createGalPreviewStoryState(id);const old=JSON.stringify(s);const d=resolve(id,s);assert.ok(d.turns.length);assert.equal(JSON.stringify(s),old);}
 const s=createGalPreviewStoryState('queenPhaseDemo');assert.equal(s.cores,7);assert.ok(ctx.galCgFor(resolve('queenPhaseDemo',s).turns,4));
 assert.equal(JSON.stringify(game),before);
 const source=fs.readFileSync(new URL('../src/game/story-preview-context.js',import.meta.url),'utf8');assert.doesNotMatch(source,/(?:localStorage|sessionStorage)\s*(?:\.|\[)|(?:saveGame|autoSave)\s*\(/);
 assert.match(main,/requestedGalPreviewDialogue\(\) \? createGalPreviewStoryState\(dialogueId\) : state/);
});
