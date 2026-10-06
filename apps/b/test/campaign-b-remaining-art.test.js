import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {FOREST_GAL_REMAINING_CONTRACT as ROWS,forestGalRemainingArtRow as match} from '../src/rendering/forest-gal-remaining-contract.js';
import {FOREST_GAL_ASSETS,FOREST_GAL_REMAINING_ENVIRONMENTS,FOREST_GAL_CGS} from '../src/rendering/forest-gal-assets.js';
import {FOREST_GAL_BACKGROUND_CONTRACT as BG,FOREST_GAL_CG_CONTRACT as CG} from '../src/rendering/forest-gal-cg-contract.js';
import {FOREST_GAL_SAFE_ENVIRONMENT_CONTRACT as SAFE} from '../src/rendering/forest-gal-safe-environment-contract.js';
import {FOREST_GAL_STATEFUL_CONTRACT as STATE} from '../src/rendering/forest-gal-stateful-contract.js';
import {forestGalPresentation,forestGalActors,presentForestGal,clearForestGal} from '../src/rendering/forest-gal-stage.js';
import {FOREST_STORY_CONTENT as C} from '../src/campaigns/b/story/content.js';
import {forestTurnStage} from '../src/campaigns/b/story/presentation.js';
import {captureForestTurnSnapshot,readForestTurnSnapshot} from '../src/campaigns/b/story/state-snapshot.js';
import {forestStoryLocationImageErrors} from '../scripts/validate-story-location-assets.mjs';
const W=JSON.parse(readFileSync(new URL('./fixtures/b-remaining-art-witnesses.json',import.meta.url))),asset=id=>FOREST_GAL_ASSETS.find(a=>a.id===id),at=(o,k)=>k.split('.').reduce((x,k)=>x?.[k],o);
const original=(sid,t)=>({...structuredClone(t),stage:forestTurnStage(sid,t,{})});
test('71 exact identities derive from 1629 coarse observations; fact-filtered coverage is replayed separately',()=>{
 assert.equal(ROWS.length,71);assert.equal(W.length,71);assert.equal(W.reduce((n,w)=>n+w.occurrences,0),1629);assert.equal(BG.length,179);assert.equal(SAFE.length,117);assert.equal(CG.length,9);assert.equal(STATE.reduce((n,s)=>n+s.exactMatch.length,0),38);assert.equal(Object.keys(FOREST_GAL_REMAINING_ENVIRONMENTS).length,10);
 for(const w of W){const scene={sceneId:w.sceneId},before=JSON.stringify(w.turn);assert.equal(match(scene,w.turn)?.assetId,w.assetId);assert.equal(forestGalPresentation(scene,w.turn).asset,asset(w.assetId));assert.equal(match(scene,JSON.parse(before))?.assetId,w.assetId);assert.equal(JSON.stringify(w.turn),before);assert.ok(![...BG,...SAFE,...CG,...STATE.flatMap(s=>s.exactMatch)].some(r=>r.turnId===w.turn.id));}
 for(const a of new Set(W.map(w=>asset(w.assetId)))){assert.ok(a);const bytes=readFileSync(new URL('../public/'+a.file,import.meta.url));assert.deepEqual(forestStoryLocationImageErrors(a,bytes),[]);assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256);}
});
test('missing or invalid historical snapshots and exact identity mutations never borrow live facts',()=>{
 const mutations=[t=>delete t.storySnapshot,t=>t.storySnapshot=null,t=>t.storySnapshot=42,t=>t.storySnapshot.schemaVersion=99,t=>t.storySnapshot.origin='review',t=>t.storySnapshot.sourceHash='0'.repeat(64),t=>t.storySnapshot.sceneId='b01_enter',t=>t.storySnapshot.turnId='wrong',t=>t.storySnapshot.phase='wrong',t=>t.storySnapshot.resolvedTextSha256='0'.repeat(64),t=>t.storySnapshot.routes=null,t=>t.storySnapshot.warm.frozen='true',t=>t.text+=' changed',t=>delete t.stage,...['locationId','camera','backdropAssetId'].map(k=>t=>t.stage[k]='wrong'),...['id','sourceLine','branch','portrait','speaker','phase','kind'].map(k=>t=>t[k]='wrong')];
 for(const w of W){for(const mutate of mutations){const t=structuredClone(w.turn);mutate(t);const before=JSON.stringify(t);assert.equal(match({sceneId:w.sceneId,state:{flags:{'b26.heatPlanFrozen':true}}},t),null,w.turn.id);assert.doesNotThrow(()=>forestGalPresentation({sceneId:w.sceneId},t));assert.equal(JSON.stringify(t),before);}assert.equal(match({sceneId:'b01_enter'},w.turn),null);const t=structuredClone(w.turn);delete t.storySnapshot;assert.ok(!forestGalPresentation({sceneId:w.sceneId},t).asset,w.turn.id);}
});
test('all source turns and branches stay excluded outside exact reviewed rows under all warm combinations',()=>{
 for(const sid of C.order)for(const source of C.scenes[sid].turns){const t=original(sid,source);assert.equal(match({sceneId:sid},t),null);for(let bits=0;bits<16;bits++){const e=W[0].turn.storySnapshot,warm=Object.fromEntries(['greenhouse','pear','lodge','frozen'].map((k,i)=>[k,Boolean(bits&(1<<i))]));t.storySnapshot=captureForestTurnSnapshot({facts:{revision:e.revision,stateHash:e.stateHash,routes:e.routes,warm},sceneId:sid,turn:t,authoredTurn:source,openingRevision:e.openingRevision});assert.ok(readForestTurnSnapshot(t,{sceneId:sid}));const row=ROWS.find(r=>r.turnId===t.id&&r.textSha256===createHash('sha256').update(t.text).digest('hex'));assert.equal(!!match({sceneId:sid},t),!!row&&(t.portrait??null)===row.portrait&&['locationId','backdropAssetId','camera'].every(k=>t.stage[k]===row[k])&&Object.entries(row.requiredEquals).every(([k,v])=>at(t.storySnapshot,k)===v),t.id);}}
});
test('warm false flags are compared exactly and finePose-only old queues remain compatible',()=>{
 for(const w of W){const row=ROWS.find(r=>r.turnId===w.turn.id&&r.textSha256===createHash('sha256').update(w.turn.text).digest('hex'));for(const [k,v] of Object.entries(row.requiredEquals)){const t=structuredClone(w.turn);at(t.storySnapshot,k.split('.').slice(0,-1).join('.'))[k.split('.').at(-1)]=!v;assert.equal(match({sceneId:w.sceneId},t),null);}const t=structuredClone(w.turn);t.stage.finePose={x:0,y:0};assert.equal(match({sceneId:w.sceneId},t)?.assetId,w.assetId);delete t.storySnapshot;assert.equal(match({sceneId:w.sceneId},t),null);}
});
class Node{constructor(){this.dataset={};this.style={};this.children=[];this.hidden=true;this.complete=false;this.naturalWidth=0;this.naturalHeight=0;}removeAttribute(k){delete this[k];}replaceChildren(...nodes){this.children=nodes;}load(w,h){this.naturalWidth=w;this.naturalHeight=h;this.onload?.();}}
const nodes=()=>Object.fromEntries(['backdrop','actors','portrait','label','stage','dialog'].map(k=>[k,new Node()]));
function dom(fn){const prior=globalThis.document;globalThis.document={createElement:()=>new Node()};try{fn();}finally{globalThis.document=prior;}}
test('actual renderer 71 hits, load failures, dimensions, next/back/clear and stale callbacks',()=>dom(()=>{
 for(const w of W){const s={sceneId:w.sceneId},a=asset(w.assetId),n=nodes();presentForestGal(n,s,w.turn);assert.ok(n.backdrop.src.endsWith(a.file));n.backdrop.load(a.width,a.height);assert.equal(n.backdrop.hidden,false);assert.equal(n.stage.dataset.artStatus,'ready');const load=n.backdrop.onload,error=n.backdrop.onerror,t=structuredClone(w.turn);delete t.storySnapshot;presentForestGal(n,s,t);load();error();assert.equal(n.backdrop.src,undefined);assert.equal(n.backdrop.hidden,true);assert.equal(n.stage.dataset.artStatus,'unavailable');presentForestGal(n,s,w.turn);n.backdrop.load(1,1);assert.equal(n.backdrop.hidden,true);assert.equal(n.backdrop.src,undefined);clearForestGal(n);presentForestGal(n,s,w.turn);n.backdrop.onerror();assert.equal(n.backdrop.hidden,true);clearForestGal(n);presentForestGal(n,s,w.turn);const stale=n.backdrop.onload;clearForestGal(n);stale();assert.equal(n.stage.dataset.artStatus,'inactive');assert.equal(n.backdrop.src,undefined);}
 const n=nodes(),a=W[0],b=W.find(w=>w.assetId!==a.assetId);presentForestGal(n,{sceneId:a.sceneId},a.turn);const stale=n.backdrop.onload,error=n.backdrop.onerror;presentForestGal(n,{sceneId:b.sceneId},b.turn);stale();error();assert.ok(n.backdrop.src.endsWith(asset(b.assetId).file));assert.equal(n.stage.dataset.artStatus,'loading');
}));
test('all nine CGs still win; background reuse never adds winter or offscreen actor permissions',()=>dom(()=>{
 for(const r of CG){const t=original(r.sceneId,C.scenes[r.sceneId].turns.find(t=>t.id===r.turnId)),m=forestGalPresentation({sceneId:r.sceneId},t);assert.equal(m.asset,FOREST_GAL_CGS[r.assetId]);assert.equal(m.presentation,'full-frame-cg');assert.deepEqual(forestGalActors(t,m),[]);}
 for(const w of W){const t=structuredClone(w.turn);t.stage.winterClothing=true;const m=forestGalPresentation({sceneId:w.sceneId},t);assert.deepEqual(forestGalActors(t,m),[]);t.stage.winterClothing=null;t.stage.offscreen=Object.fromEntries(Object.keys(t.stage.actors).map(k=>[k,true]));assert.deepEqual(forestGalActors(t,forestGalPresentation({sceneId:w.sceneId},t)),[]);}
}));

test('B07 duplicate ID prose variants require their own exact four route facts under every combination',()=>{
 for(const w of W.filter(w=>w.turn.id==='b07_choice.L421'||w.turn.id==='b07_choice.L423')){
  const row=ROWS.find(r=>r.turnId===w.turn.id&&r.textSha256===createHash('sha256').update(w.turn.text).digest('hex'));
  for(let bits=0;bits<16;bits++){const t=structuredClone(w.turn);['originalCleared','originalWorksDone','rootFixed','rootWorksDone'].forEach((k,i)=>t.storySnapshot.routes['07'][k]=Boolean(bits&(1<<i)));assert.equal(match({sceneId:w.sceneId},t)?.assetId??null,Object.entries(row.requiredEquals).every(([k,v])=>at(t.storySnapshot,k)===v)?w.assetId:null);}
 }
 assert.equal(W.filter(w=>w.turn.id==='b07_choice.L421').length,2);assert.equal(W.filter(w=>w.turn.id==='b07_choice.L423').length,2);
});
test('prior 89 exact reuse rows remain independent and unchanged',()=>{
 const previous=JSON.parse(readFileSync(new URL('./fixtures/b-reuse-art-witnesses.json',import.meta.url)));
 for(const w of previous){assert.equal(match({sceneId:w.sceneId},w.turn),null);assert.equal(forestGalPresentation({sceneId:w.sceneId},w.turn).asset.id,w.assetId);}
});
