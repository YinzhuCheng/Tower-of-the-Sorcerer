import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {captureForestTurnSnapshot,readForestTurnSnapshot} from '../src/campaigns/b/story/state-snapshot.js';
import {createHash} from 'node:crypto';
import {FOREST_STORY_CONTENT as C} from '../src/campaigns/b/story/content.js';
import {forestTurnStage} from '../src/campaigns/b/story/presentation.js';
import {FOREST_GAL_STATEFUL_CONTRACT as CONTRACT,forestGalStatefulArtRow as match} from '../src/rendering/forest-gal-stateful-contract.js';
import {FOREST_GAL_STATEFUL_ENVIRONMENTS as ASSETS,FOREST_GAL_CGS} from '../src/rendering/forest-gal-assets.js';
import {FOREST_GAL_BACKGROUND_CONTRACT as BG,FOREST_GAL_CG_CONTRACT as CG} from '../src/rendering/forest-gal-cg-contract.js';
import {FOREST_GAL_SAFE_ENVIRONMENT_CONTRACT as SAFE} from '../src/rendering/forest-gal-safe-environment-contract.js';
import {forestGalPresentation,forestGalActors,presentForestGal,clearForestGal} from '../src/rendering/forest-gal-stage.js';
import {forestStoryLocationImageErrors} from '../scripts/validate-story-location-assets.mjs';
import {createForestCampaign} from '../src/campaigns/b/content.js';
import {createForestStory} from '../src/campaigns/b/story/index.js';
import {buildForestWitness,createForestWalker} from '../src/campaigns/b/witness.js';
const W=JSON.parse(readFileSync(new URL('./fixtures/b-stateful-art-witnesses.json',import.meta.url))),at=(o,k)=>k.split('.').reduce((x,k)=>x?.[k],o);
const original=(sid,t)=>({...structuredClone(t),stage:forestTurnStage(sid,t,{})});
test('38 exact runtime contracts select 12 states and only registered hash/dimension-verified native assets',()=>{
 assert.equal(CONTRACT.length,12);assert.equal(W.length,38);assert.equal(CONTRACT.reduce((n,s)=>n+s.exactMatch.length,0),38);
 assert.equal(BG.length,179);assert.equal(CG.length,9);assert.equal(SAFE.length,117);
 for(const w of W){const s={sceneId:w.sceneId},bytes=JSON.stringify(w.turn);assert.equal(match(s,w.turn)?.stateKey,w.stateKey);assert.equal(match(s,JSON.parse(bytes))?.stateKey,w.stateKey);assert.equal(forestGalPresentation(s,w.turn).asset,ASSETS[w.stateKey]);assert.equal(JSON.stringify(w.turn),bytes);assert.ok(!SAFE.some(r=>r.turnId===w.turn.id));assert.ok(!CG.some(r=>r.turnId===w.turn.id));}
 for(const asset of Object.values(ASSETS)){const bytes=readFileSync(new URL('../public/'+asset.file,import.meta.url));assert.deepEqual(forestStoryLocationImageErrors(asset,bytes),[]);assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);}
});
test('missing, malformed, future, review and mismatched snapshots HOLD without mutation or live-state borrowing',()=>{
 const mutations=[t=>delete t.storySnapshot,t=>t.storySnapshot=null,t=>t.storySnapshot=42,t=>t.storySnapshot.schemaVersion=99,t=>t.storySnapshot.origin='review',t=>t.storySnapshot.sourceHash='0'.repeat(64),t=>t.storySnapshot.sceneId='b01_enter',t=>t.storySnapshot.turnId='wrong',t=>t.storySnapshot.phase='wrong',t=>t.storySnapshot.resolvedTextSha256='0'.repeat(64),t=>t.storySnapshot.routes=null,t=>t.storySnapshot.warm.frozen='true',t=>t.storySnapshot.extra=()=>0,t=>t.text+=' changed',t=>delete t.stage,...['locationId','camera','backdropAssetId'].map(k=>t=>t.stage[k]='wrong'),...['id','sourceLine','branch','portrait','speaker','phase','kind'].map(k=>t=>t[k]='wrong')];
 for(const w of W){for(const mutate of mutations){const t=structuredClone(w.turn);mutate(t);assert.equal(match({sceneId:w.sceneId,state:{flags:{'b26.heatPlanFrozen':true}}},t),null,w.turn.id);const before=JSON.stringify(t);assert.doesNotThrow(()=>forestGalPresentation({sceneId:w.sceneId},t));assert.equal(JSON.stringify(t),before);}
 assert.equal(match({sceneId:'b01_enter'},w.turn),null);}
});
test('all source turns without metadata HOLD; all noncontract turns stay excluded even with valid captured identities',()=>{
 // Adversarial identity fixtures are not a reachability claim. Test every
 // authored branch against every historical fact combination in the whitelist.
 for(const sid of C.order)for(const source of C.scenes[sid].turns){
  const t=original(sid,source);assert.equal(match({sceneId:sid},t),null,t.id);
  for(const w of W){const evidence=w.turn.storySnapshot;t.storySnapshot=captureForestTurnSnapshot({facts:{revision:evidence.revision,stateHash:evidence.stateHash,routes:evidence.routes,warm:evidence.warm},sceneId:sid,turn:t,authoredTurn:source,openingRevision:evidence.openingRevision});assert.ok(readForestTurnSnapshot(t,{sceneId:sid}));
   if(!CONTRACT.some(s=>s.exactMatch.some(r=>r.turnId===t.id)))assert.equal(match({sceneId:sid},t),null,t.id);
  }
 }
});
test('route axes, warm axes and duplicate B07 L439 predicate-before-exact remain independent',()=>{
 for(const state of CONTRACT){const w=W.find(w=>w.stateKey===state.stateKey);for(const [key,value] of Object.entries(state.requiredEquals)){const t=structuredClone(w.turn),keys=key.split('.');at(t.storySnapshot,keys.slice(0,-1).join('.'))[keys.at(-1)]=!value;assert.notEqual(match({sceneId:w.sceneId},t)?.stateKey,state.stateKey);}
  const route=Object.keys(state.requiredEquals).find(k=>k.startsWith('routes.'))?.split('.')[1];const keys=route?['originalCleared','originalWorksDone','rootFixed','rootWorksDone']:['greenhouse','pear','lodge','frozen'];
  for(let bits=0;bits<16;bits++){const t=structuredClone(w.turn),o=route?t.storySnapshot.routes[route]:t.storySnapshot.warm;keys.forEach((k,i)=>o[k]=Boolean(bits&(1<<i)));assert.equal(match({sceneId:w.sceneId},t)?.stateKey===state.stateKey,Object.entries(state.requiredEquals).every(([k,v])=>at(t.storySnapshot,k)===v));}
 }
 const duplicates=W.filter(w=>w.turn.id==='b07_stone_post.L439');assert.equal(duplicates.length,2);assert.notEqual(duplicates[0].stateKey,duplicates[1].stateKey);for(const w of duplicates)assert.equal(match({sceneId:w.sceneId},w.turn).stateKey,w.stateKey);
});
class Node{constructor(){this.dataset={};this.style={};this.children=[];this.hidden=true;this.complete=false;this.naturalWidth=0;this.naturalHeight=0;}removeAttribute(k){delete this[k];}replaceChildren(...nodes){this.children=nodes;}load(w,h){this.naturalWidth=w;this.naturalHeight=h;this.onload?.();}}
const nodes=()=>Object.fromEntries(['backdrop','actors','portrait','label','stage','dialog'].map(k=>[k,new Node()]));
function dom(fn){const prior=globalThis.document;globalThis.document={createElement:()=>new Node()};try{fn();}finally{globalThis.document=prior;}}
test('renderer failure, dimensions, rapid next/back, same-image history and clear reject delayed stale callbacks',()=>dom(()=>{
 for(const w of W){for(const fail of ['error','dimensions']){const n=nodes(),s={sceneId:w.sceneId},asset=ASSETS[w.stateKey];presentForestGal(n,s,w.turn);const load=n.backdrop.onload,error=n.backdrop.onerror;assert.ok(n.backdrop.src.endsWith(asset.file));if(fail==='error')error();else n.backdrop.load(1,1);assert.equal(n.backdrop.hidden,true);assert.equal(n.backdrop.src,undefined);load();assert.equal(n.backdrop.hidden,true);clearForestGal(n);error();assert.equal(n.stage.dataset.artStatus,'inactive');}
  const n=nodes(),s={sceneId:w.sceneId};presentForestGal(n,s,w.turn);const oldLoad=n.backdrop.onload,oldError=n.backdrop.onerror;const unknown=structuredClone(w.turn);delete unknown.storySnapshot;presentForestGal(n,s,unknown);const expected=forestGalPresentation(s,unknown);oldLoad();oldError();assert.equal(n.backdrop.src?.endsWith(expected.asset?.file??'__none__')??false,!!expected.asset);presentForestGal(n,s,w.turn);n.backdrop.load(ASSETS[w.stateKey].width,ASSETS[w.stateKey].height);assert.equal(n.backdrop.hidden,false);clearForestGal(n);oldLoad();assert.equal(n.backdrop.src,undefined);
 }
 const n=nodes(),a=W[0],b=W.find(w=>w.stateKey!==a.stateKey);presentForestGal(n,{sceneId:a.sceneId},a.turn);const load=n.backdrop.onload,error=n.backdrop.onerror;presentForestGal(n,{sceneId:b.sceneId},b.turn);load();error();assert.ok(n.backdrop.src.endsWith(ASSETS[b.stateKey].file));assert.equal(n.stage.dataset.artStatus,'loading');
}));
test('all nine CGs retain priority; winter backgrounds never authorize daily bodies/offscreen portraits',()=>dom(()=>{
 for(const row of CG){const t=original(row.sceneId,C.scenes[row.sceneId].turns.find(t=>t.id===row.turnId));t.storySnapshot=structuredClone(W[0].turn.storySnapshot);const model=forestGalPresentation({sceneId:row.sceneId},t);assert.equal(model.presentation,'full-frame-cg');assert.equal(model.asset,FOREST_GAL_CGS[row.assetId]);assert.deepEqual(forestGalActors(t,model),[]);}
 for(const w of W.filter(w=>w.turn.stage.winterClothing||w.turn.stage.camera==='exterior-empty-shot')){const before=JSON.stringify(w.turn),n=nodes(),model=presentForestGal(n,{sceneId:w.sceneId},w.turn);assert.deepEqual(forestGalActors(w.turn,model),[]);assert.equal(n.actors.children.length,0);if(w.turn.stage.portraitAllowed===false||w.turn.stage.offscreen?.[w.turn.portrait])assert.equal(n.portrait.src,undefined);assert.equal(JSON.stringify(w.turn),before);}
}));
test('real certificate dispatches and both-order route dispatches select historical states without forced resolve',()=>{
 const runtime=createForestCampaign(),story=createForestStory(runtime),seen=new Set();let emitted=0;
 function collect(scene){for(const turn of scene.turns){emitted++;const row=match(scene,turn);if(row){seen.add(row.stateKey+'|'+turn.id);assert.equal(forestGalPresentation(scene,turn).asset,ASSETS[row.stateKey]);}}}
 function replay(actions){let state=runtime.initialState(),seenIds=[];for(const action of actions){const result=runtime.dispatch(state,action);assert.equal(result.ok,true);const narration=story.fromDispatch({stateBefore:state,stateAfter:result.state,events:result.events,receipt:result.receipt,seenIds});seenIds=narration.seenIds;for(const scene of narration.scenes)collect(scene);state=result.state;}return state;}
 for(const file of readdirSync(new URL('../artifacts/campaigns/',import.meta.url)).filter(f=>f.endsWith('.certificate.json'))){const cert=JSON.parse(readFileSync(new URL('../artifacts/campaigns/'+file,import.meta.url)));replay(cert.steps.map(s=>s.action));}
 for(const site of ['07','16','21','24'])for(const order of [['originalEnemy','originalWorks','fixRoot','rootWorks'],['fixRoot','rootWorks','originalEnemy','originalWorks']]){const prefix=buildForestWitness({runtime,stopBefore:`b${site}.originalEnemy`}),walker=createForestWalker(runtime,prefix.state);for(const suffix of order)walker.interact(`b${site}.${suffix}`);if(site==='24')walker.interact('b24.retrieveHandrail');const state=replay([...prefix.actions,...walker.actions]);if(site==='07')collect(story.revisit('b07_revisit',state));}
 for(const warm of ['greenhouse','pear','lodge'])replay(buildForestWitness({runtime,warmPoints:[warm]}).actions);
 assert.ok(emitted>1000);for(const w of W)assert.ok(seen.has(w.stateKey+'|'+w.turn.id),w.stateKey+' '+w.turn.id);
});

test('closed winter lodge admits only L1933.2 with both own lodge and frozen facts',()=>{
 const state=CONTRACT.find(s=>s.stateKey==='B19.winter-retained-warm-lodge'),w=W.find(w=>w.stateKey===state.stateKey);assert.equal(state.exactMatch.length,1);assert.equal(w.turn.id,'b30_heat_partial.L1933.2');assert.deepEqual(state.requiredEquals,{'warm.lodge':true,'warm.frozen':true});
 for(const [sid,id] of [['b30_heat_partial','b30_heat_partial.L1933'],['b30_heat_partial','b30_heat_partial.L1935'],['b30_heat_partial','b30_heat_partial.L1935.2'],['b30_heat_greenhouse_lodge','b30_heat_greenhouse_lodge.L1851'],['b30_heat_lodge_pear','b30_heat_lodge_pear.L1913']]){const source=C.scenes[sid].turns.find(t=>t.id===id);assert.ok(source,id);const t=original(sid,source),evidence=w.turn.storySnapshot;t.storySnapshot=captureForestTurnSnapshot({facts:{revision:evidence.revision,stateHash:evidence.stateHash,routes:evidence.routes,warm:evidence.warm},sceneId:sid,turn:t,authoredTurn:source,openingRevision:evidence.openingRevision});assert.ok(readForestTurnSnapshot(t,{sceneId:sid}));assert.notEqual(match({sceneId:sid},t)?.stateKey,state.stateKey,id);}
});
