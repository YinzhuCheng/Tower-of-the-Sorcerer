import test from 'node:test';
import assert from 'node:assert/strict';
import {FOREST_STORY_CONTENT as C} from '../src/campaigns/b/story/content.js';
import {forestTurnStage} from '../src/campaigns/b/story/presentation.js';
import {FOREST_GAL_CG_CONTRACT as CG,FOREST_GAL_BACKGROUND_CONTRACT as BG,forestGalExactArtRow} from '../src/rendering/forest-gal-cg-contract.js';
import {FOREST_GAL_CGS} from '../src/rendering/forest-gal-assets.js';
import {forestGalBackdrop,forestGalPresentation,presentForestGal,clearForestGal} from '../src/rendering/forest-gal-stage.js';
const scene=sceneId=>({sceneId,backdropAssetId:C.scenes[sceneId].backdropAssetId});
const turn=(sid,id)=>{const t=structuredClone(C.scenes[sid].turns.find(t=>t.id===id));t.stage=forestTurnStage(sid,t,{});return t;};
class Node{constructor(){this.dataset={};this.style={};this.children=[];this.hidden=true;this.complete=false;this.naturalWidth=0;this.naturalHeight=0;}removeAttribute(k){delete this[k];}replaceChildren(...nodes){this.children=nodes;}load(w=1672,h=941){this.naturalWidth=w;this.naturalHeight=h;this.onload?.();}}
const nodes=()=>Object.fromEntries(['backdrop','actors','portrait','label','stage','dialog'].map(id=>[id,new Node()]));
function dom(fn){const original=globalThis.document;globalThis.document={createElement:()=>new Node()};try{fn();}finally{globalThis.document=original;}}

test('exact frozen whitelist: 179 backgrounds, 9 CG turns; all other turns reject CG',()=>{
 assert.equal(BG.length,179);assert.equal(CG.length,9);const before=JSON.stringify(C);
 for(const rows of [BG,CG])for(const row of rows){const s=scene(row.sceneId),t=turn(row.sceneId,row.turnId);assert.equal(forestGalExactArtRow(rows,s,t),row,row.turnId);
  for(const patch of [{id:'other'},{sourceLine:-1},{branch:'wrong'},{phase:'wrong'},{speaker:'wrong'},{portrait:'wrong'},{kind:'wrong'},{text:t.text+' '}])assert.equal(forestGalExactArtRow(rows,s,{...t,...patch}),null,JSON.stringify(patch));
  for(const key of ['locationId','backdropAssetId','camera'])assert.equal(forestGalExactArtRow(rows,s,{...t,stage:{...t.stage,[key]:'wrong'}}),null);
  assert.equal(forestGalExactArtRow(rows,{...s,sceneId:'wrong'},t),null);assert.equal(forestGalExactArtRow(rows,s,{...t,stage:undefined}),null);
 }
 for(const sid of C.order)for(const original of C.scenes[sid].turns){const t=turn(sid,original.id),model=forestGalPresentation(scene(sid),t),row=CG.find(r=>r.turnId===t.id);assert.equal(model.presentation==='full-frame-cg',!!row,t.id);if(row)assert.equal(model.asset,FOREST_GAL_CGS[row.assetId]);}
 assert.equal(JSON.stringify(C),before);
});

test('CG clears real actor nodes, src, event handlers and portrait; exit independently restores next turn',()=>dom(()=>{
 const exits={'b07_choice.L417':'b07_choice.L419','b08_night.L505':'b08_night.L507','b12_choice.L725':'b12_choice.L729','b12_choice.L727':'b12_choice.L729','b29_home.L1785':'b29_home.L1791','b29_home.L1787':'b29_home.L1791','b29_home.L1789':'b29_home.L1791','b30_end_together.L2011':'b30_end_together.L2013'};
 for(const row of CG){const n=nodes();presentForestGal(n,scene('b01_enter'),turn('b01_enter','B.OPEN.R1.b01_enter.T002'));const prior=[...n.actors.children];assert.ok(prior.length);const t=turn(row.sceneId,row.turnId);presentForestGal(n,scene(row.sceneId),t);
  assert.equal(n.actors.dataset.count,'0');assert.deepEqual(n.actors.children,[]);assert.equal(n.portrait.src,undefined);assert.equal(n.portrait.onload,null);assert.equal(n.portrait.onerror,null);for(const image of prior){assert.equal(image.src,undefined);assert.equal(image.onload,null);assert.equal(image.onerror,null);}
  n.backdrop.load();assert.equal(n.stage.dataset.artPresentation,'full-frame-cg');assert.equal(n.backdrop.hidden,false);
  if(exits[row.turnId]){const next=turn(row.sceneId,exits[row.turnId]),expected=forestGalBackdrop(scene(row.sceneId),next);presentForestGal(n,scene(row.sceneId),next);assert.notEqual(n.stage.dataset.artPresentation,'full-frame-cg');assert.equal(n.backdrop.src?.endsWith(expected.asset?.file??'__missing__')??false,!!expected.asset);}
  clearForestGal(n);assert.equal(n.backdrop.src,undefined);assert.equal(n.portrait.src,undefined);assert.equal(n.actors.dataset.count,'0');
 }
}));

test('CG failure/dimension mismatch falls back to current environment; late events cannot revive it',()=>dom(()=>{
 for(const fail of ['error','dimensions'])for(const row of CG){const n=nodes(),t=turn(row.sceneId,row.turnId),s=scene(row.sceneId);presentForestGal(n,s,t);const oldLoad=n.backdrop.onload,oldError=n.backdrop.onerror;
  if(fail==='error')n.backdrop.onerror();else n.backdrop.load(1,1);
  const fallback=forestGalBackdrop(s,t);assert.notEqual(n.stage.dataset.artPresentation,'full-frame-cg');assert.equal(n.backdrop.src?.endsWith(fallback.asset?.file??'__missing__')??false,!!fallback.asset);assert.equal(n.portrait.src,undefined);assert.equal(n.actors.children.length,0);
  oldLoad();oldError();assert.notEqual(n.stage.dataset.artPresentation,'full-frame-cg');clearForestGal(n);oldLoad();oldError();assert.equal(n.stage.dataset.artStatus,'inactive');
 }
 const n=nodes(),a=CG[0],b=CG[1];presentForestGal(n,scene(a.sceneId),turn(a.sceneId,a.turnId));const stale=n.backdrop.onload,staleError=n.backdrop.onerror;presentForestGal(n,scene(b.sceneId),turn(b.sceneId,b.turnId));stale();staleError();assert.ok(n.backdrop.src.endsWith(FOREST_GAL_CGS[b.assetId].file));assert.equal(n.stage.dataset.artStatus,'loading');clearForestGal(n);
}));

test('historical queues do not depend on live flags, broad semantic cgAssetId or winter-wide permission',()=>{
 for(const row of CG){const s=scene(row.sceneId),t=turn(row.sceneId,row.turnId),snapshot=JSON.stringify(t);assert.equal(forestGalPresentation({...s,state:{flags:{winter:true}}},t).asset,FOREST_GAL_CGS[row.assetId]);assert.equal(JSON.stringify(t),snapshot);assert.notEqual(forestGalPresentation(s,{...t,text:'older saved prose'}).presentation,'full-frame-cg');}
 for(const [sid,id] of [['b07_choice','b07_choice.L413'],['b07_choice','b07_choice.L415'],['b07_choice','b07_choice.L419'],['b29_home','b29_home.L1791'],['b30_end_together','b30_end_together.L2009'],['b30_end_together','b30_end_together.L2013']]){const t=turn(sid,id);t.presentation={cgAssetId:'B_CG_30_EXACT'};assert.notEqual(forestGalPresentation(scene(sid),t).presentation,'full-frame-cg');}
 for(const original of C.scenes.b30_end_two_ends?.turns??[])assert.notEqual(forestGalPresentation(scene('b30_end_two_ends'),turn('b30_end_two_ends',original.id)).presentation,'full-frame-cg');
});
