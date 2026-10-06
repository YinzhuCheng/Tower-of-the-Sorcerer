import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {FOREST_STORY_CONTENT as C} from '../src/campaigns/b/story/content.js';
import {forestTurnStage} from '../src/campaigns/b/story/presentation.js';
import {FOREST_GAL_SAFE_ENVIRONMENT_CONTRACT as E} from '../src/rendering/forest-gal-safe-environment-contract.js';
import {FOREST_GAL_CG_CONTRACT as CG,forestGalExactArtRow} from '../src/rendering/forest-gal-cg-contract.js';
import {FOREST_GAL_SAFE_ENVIRONMENTS as A,FOREST_GAL_CGS} from '../src/rendering/forest-gal-assets.js';
import {forestGalBackdrop,forestGalPresentation,forestGalActors,presentForestGal,clearForestGal} from '../src/rendering/forest-gal-stage.js';
import {forestStoryLocationForTurn} from '../src/rendering/forest-gal-story-locations.js';
import {createForestGalReader} from '../src/rendering/forest-gal-reader.js';
const scene=sceneId=>({sceneId,backdropAssetId:C.scenes[sceneId].backdropAssetId});
const turn=(sid,id)=>{const t=structuredClone(C.scenes[sid].turns.find(t=>t.id===id));assert.ok(t,id);t.stage=forestTurnStage(sid,t,{});return t;};
const exact=(s,t)=>forestGalExactArtRow(E,s,t);
class Node{constructor(){this.dataset={};this.style={};this.children=[];this.hidden=true;this.complete=false;this.naturalWidth=0;this.naturalHeight=0;this.attributes={};this.events={};}removeAttribute(k){delete this[k];delete this.attributes[k];}setAttribute(k,v){this.attributes[k]=v;}addEventListener(k,f){this.events[k]=f;}focus(){}append(...n){this.children.push(...n);}replaceChildren(...nodes){this.children=nodes;}load(w=1672,h=941){this.naturalWidth=w;this.naturalHeight=h;this.onload?.();}}
const nodes=()=>Object.fromEntries(['backdrop','actors','portrait','label','stage','dialog'].map(id=>[id,new Node()]));
function dom(fn){const old=globalThis.document;globalThis.document={createElement:()=>new Node()};try{fn();}finally{globalThis.document=old;}}

test('117 frozen exact keys in 11 states; each field and hash drift fails closed; history stays immutable',()=>{
 assert.equal(E.length,117);assert.equal(new Set(E.map(r=>r.turnId)).size,117);assert.equal(new Set(E.map(r=>r.stateKey)).size,11);assert.equal(Object.keys(A).length,11);
 const before=JSON.stringify(C);
 for(const r of E){const s=scene(r.sceneId),t=turn(r.sceneId,r.turnId),snapshot=JSON.stringify(t);assert.equal(exact(s,t),r);const m=forestGalPresentation(s,t);assert.equal(m.asset,A[r.assetId]);assert.equal(m.semanticLocationId,r.semanticLocationId);assert.equal(m.locationId,r.locationId);assert.equal(m.environmentContract,r);
  for(const patch of [{id:'unknown'},{sourceLine:-1},{branch:'other'},{phase:'other'},{speaker:'other'},{portrait:'other'},{kind:'other'},{text:t.text+' '},{stage:undefined}])assert.equal(exact(s,{...t,...patch}),null,`${r.turnId} ${JSON.stringify(patch)}`);
  for(const key of ['locationId','backdropAssetId','camera'])assert.equal(exact(s,{...t,stage:{...t.stage,[key]:'other'}}),null,`${r.turnId} ${key}`);
  assert.equal(exact({...s,sceneId:'other'},t),null);
  assert.equal(forestGalPresentation({...s,state:{flags:{winter:true,invested:true},regionId:'B-01',route:'other'}},t).asset,m.asset);
  assert.deepEqual(forestGalActors(t,m),forestGalActors(t,forestStoryLocationForTurn(t)),`body policy ${r.turnId}`);assert.equal(JSON.stringify(t),snapshot);
 }
 assert.equal(JSON.stringify(C),before);
});

test('all source turns form exact positive/negative partition; source prefixes and live state never widen it',()=>{
 let hits=0,misses=0;for(const sid of C.order)for(const original of C.scenes[sid].turns){const t=turn(sid,original.id),r=E.find(r=>r.turnId===t.id);assert.equal(exact(scene(sid),t),r??null,t.id);if(r)hits++;else misses++;if(/^(b16_|b21_|b24_|b27_|b30_end_two_ends)/.test(sid))assert.equal(exact(scene(sid),t),null,t.id);}
 assert.equal(hits,117);assert.equal(misses,751);
 for(const r of E){const s=scene(r.sceneId),t=turn(r.sceneId,r.turnId);assert.equal(forestGalBackdrop(s,{...t,text:'older history prose'}).environmentContract,null);assert.equal(forestGalBackdrop(s,{...t,stage:undefined}).environmentContract,null);}
});

test('same-prefix interiors, placement actions and exits have separate semantic identities',()=>{
 const sequences={b14_enter:[[795,'B14.inn-common-room'],[819,'B14.inn-common-room']],b14_greenhouse:[[849,null],[851,'B14.ordinary-greenhouse'],[863,'B14.ordinary-greenhouse'],[865,null]],b22_enter:[[1361,null],[1363,null],[1365,'B22.relay']],b22_after:[[1401,'B22.relay'],[1403,null]],b26_shawu:[[1607,null],[1615,null],[1617,null],[1619,'B26.shawu-bedroom']],b29_home:[[1791,null],[1793,'B29.home-night-after-tea'],[1801,'B29.home-night-after-tea'],[1803,null]],b30_end_together:[[1997,null],[1999,'B30.inn-upstairs-map'],[2007,'B30.inn-upstairs-map'],[2009,null],[2011,null],[2013,null]],b10_valve:[[583,null],[585,'B10.valve-stable']]};
 for(const [sid,seq]of Object.entries(sequences))for(const [line,key]of seq)assert.equal(exact(scene(sid),turn(sid,`${sid}.L${line}`))?.stateKey??null,key,`${sid} ${line}`);
 const bedroom=E.find(r=>r.stateKey==='B26.shawu-bedroom'),guest=E.find(r=>r.stateKey==='B30.inn-upstairs-map');assert.notEqual(bedroom.locationId,bedroom.semanticLocationId);assert.equal(guest.locationId,'B-14.inn-table');assert.equal(guest.semanticLocationId,'B-14.inn-upstairs-guestroom');
});

test('new environment entry, switch, missing, close, failure and stale callbacks clear safely for all 11 assets',()=>dom(()=>{
 const reps=Object.keys(A).map(id=>E.find(r=>r.assetId===id));
 for(let i=0;i<reps.length;i++){const a=reps[i],b=reps[(i+1)%reps.length],n=nodes(),s=scene(a.sceneId),t=turn(a.sceneId,a.turnId);presentForestGal(n,s,t);const oldLoad=n.backdrop.onload,oldError=n.backdrop.onerror;
  presentForestGal(n,scene(b.sceneId),turn(b.sceneId,b.turnId));oldLoad();oldError();assert.ok(n.backdrop.src.endsWith(A[b.assetId].file));n.backdrop.load(A[b.assetId].width,A[b.assetId].height);assert.equal(n.backdrop.hidden,false);
  presentForestGal(n,s,{...t,text:'old prose'});assert.equal(n.backdrop.src,undefined);assert.equal(n.backdrop.onload,null);assert.equal(n.backdrop.onerror,null);oldLoad();oldError();assert.equal(n.backdrop.src,undefined);
  for(const fail of ['error','size']){presentForestGal(n,s,t);const load=n.backdrop.onload,error=n.backdrop.onerror;if(fail==='error')error();else n.backdrop.load(1,1);assert.equal(n.stage.dataset.artStatus,'failed');assert.equal(n.backdrop.src,undefined);assert.equal(n.backdrop.onload,null);assert.equal(n.backdrop.onerror,null);load();error();assert.equal(n.stage.dataset.artStatus,'failed');clearForestGal(n);load();error();assert.equal(n.stage.dataset.artStatus,'inactive');}
  presentForestGal(n,s,t);const load=n.backdrop.onload,error=n.backdrop.onerror;clearForestGal(n);load();error();assert.equal(n.backdrop.src,undefined);assert.equal(n.actors.children.length,0);assert.equal(n.portrait.src,undefined);
 }
}));

test('all 9 CG rows keep highest priority; error and wrong dimensions cannot borrow adjacent backgrounds',()=>dom(()=>{
 const n=nodes(),r=E.find(r=>r.stateKey==='B30.inn-upstairs-map');
 for(const cg of CG)for(const fail of ['error','size']){presentForestGal(n,scene(r.sceneId),turn(r.sceneId,r.turnId));n.backdrop.load();const s=scene(cg.sceneId),t=turn(cg.sceneId,cg.turnId);presentForestGal(n,s,t);assert.equal(n.stage.dataset.artPresentation,'full-frame-cg');assert.equal(forestGalPresentation(s,t).asset,FOREST_GAL_CGS[cg.assetId]);assert.equal(n.actors.children.length,0);assert.equal(n.portrait.src,undefined);const load=n.backdrop.onload,error=n.backdrop.onerror;if(fail==='error')error();else n.backdrop.load(1,1);const fallback=forestGalBackdrop(s,t);assert.equal(n.backdrop.src?.endsWith(fallback.asset?.file??'missing')??false,!!fallback.asset);load();error();assert.notEqual(n.stage.dataset.artPresentation,'full-frame-cg');clearForestGal(n);}
}));

test('reader hide/history/Escape/reset does not change exact immutable environment decision',()=>{
 const r=E.find(r=>r.stateKey==='B26.shawu-bedroom'),t=turn(r.sceneId,r.turnId),s={...scene(r.sceneId),turns:[t]},before=JSON.stringify(s);const n=Object.fromEntries(['dialog','stage','body','historyButton','historyPanel','historyEntries','historyClose','hideButton','restoreButton','historyTitle'].map(id=>[id,new Node()]));const reader=createForestGalReader(n,{createElement:()=>new Node()});reader.sync(s,0);n.hideButton.onclick();assert.equal(reader.mode,'art');reader.dismiss();n.historyButton.onclick();assert.equal(reader.mode,'history');reader.dismiss();reader.reset();reader.sync(s,0);assert.equal(forestGalPresentation(s,t).asset,A[r.assetId]);assert.equal(JSON.stringify(s),before);
});

test('all 11 lossless production files are explicit hashed registered assets',()=>{for(const a of Object.values(A)){const bytes=readFileSync(new URL('../public/'+a.file,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256);assert.equal(bytes.length,a.bytes);assert.equal(a.mime,'image/webp');assert.equal(a.width,a.id==='B_ENV_STATE_B29_home_night_after_tea'?1671:1672);assert.equal(a.height,941);}const build=readFileSync(new URL('../scripts/build-b-preview.mjs',import.meta.url),'utf8');assert.ok(build.includes("'src/rendering/forest-gal-safe-environment-contract.js'"));});
