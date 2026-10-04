import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {FOREST_STORY_CONTENT as C} from '../src/campaigns/b/story/content.js';
import {forestTurnStage} from '../src/campaigns/b/story/presentation.js';
import {FOREST_STORY_LOCATION_CONTRACT as CONTRACT,forestStoryLocationPresentation,forestStoryLocationForTurn,forestStoryTextSha256,forestStoryLocationPortraitAllowed} from '../src/rendering/forest-gal-story-locations.js';
import {forestGalActors,forestGalBackdrop,presentForestGal,clearForestGal} from '../src/rendering/forest-gal-stage.js';
import {FOREST_GAL_STORY_LOCATIONS,FOREST_GAL_CAST} from '../src/rendering/forest-gal-assets.js';
import {FOREST_CAST_ART} from '../src/rendering/forest-cast-art.js';
import {forestStoryLocationSourceErrors,forestStoryLocationImageErrors,validateStoryLocationAssets} from '../scripts/validate-story-location-assets.mjs';
const scene=id=>({sceneId:id,backdropAssetId:C.scenes[id].backdropAssetId});
const turn=id=>{const sid=CONTRACT.turns.find(t=>t.turnId===id)?.sceneId;const t=structuredClone(C.scenes[sid].turns.find(t=>t.id===id));t.stage=forestTurnStage(sid,t,{});return t;};
const sha=text=>createHash('sha256').update(text).digest('hex');
function args(s,t){return {sceneId:s.id,turn:t,locationId:s.regionId,backdropAssetId:s.backdropAssetId};}

test('80 exact runtime positive cases and 1348 original proposal negatives fail closed without mutation',()=>{
 let positive=0,negative=0;const before=JSON.stringify(C),contract=JSON.stringify(CONTRACT);
 for(const s of Object.values(C.scenes))for(const t of s.turns){
  const input=args(s,t),m=forestStoryLocationPresentation(input);
  if(CONTRACT.turns.some(row=>row.turnId===t.id)){
   assert.ok(m,t.id);assert.equal(m.contract.body.mode,'empty');assert.deepEqual(m.contract.body.actorIds,[]);positive++;
   for(const bad of [{sceneId:'b29_home'},{turn:{...t,id:'unlisted-turn'}},{turn:{...t,branch:'uncommitted-branch'}},{turn:{...t,phase:'wrong-phase'}},{locationId:'B-29'},{backdropAssetId:'B_ENV_29:home'},{turn:{...t,text:'old queued prose'}}]){assert.equal(forestStoryLocationPresentation({...input,...bad}),null);negative++;}
  }else{assert.equal(m,null);negative++;}
 }
 assert.equal(positive,80);assert.equal(negative,1348);assert.equal(JSON.stringify(C),before);assert.equal(JSON.stringify(CONTRACT),contract);
});

test('exact UTF-8 source/text SHA guard, schema rows and metadata cannot borrow another speaker or turn',()=>{
 const content=readFileSync(new URL('../src/campaigns/b/story/content.js',import.meta.url));assert.equal(sha(content),CONTRACT.sourceContentSha256);assert.deepEqual(forestStoryLocationSourceErrors(content),[]);assert.equal(forestStoryLocationSourceErrors(Buffer.concat([content,Buffer.from(' ')] )).length,1);
 for(const value of ['', 'abc','\ud800','璃🌿\u0000纱雾',...Array.from({length:130},(_,i)=>'a'.repeat(i)),...Object.values(C.scenes).flatMap(s=>s.turns.map(t=>t.text))])assert.equal(forestStoryTextSha256(value),sha(value));
 for(const row of CONTRACT.turns){const t=turn(row.turnId),s=C.scenes[row.sceneId];assert.equal(sha(t.text),row.textSha256);assert.ok(Object.isFrozen(row.body.actorIds));
  for(const patch of [{sourceLine:-1},{speaker:'米露'},{portrait:'cat_boss'},{kind:'choice-prompt'},{text:t.text+' '},{id:t.id+'old'}])assert.equal(forestStoryLocationPresentation(args(s,{...t,...patch})),null);
  assert.notEqual(forestStoryTextSha256(t.text+'旧文'),row.textSha256);
 }
});

test('B08 camp and sleep shots explicitly have no standing body; portraits remain a stricter subset',()=>{
 for(const row of CONTRACT.turns.filter(t=>t.sceneId.startsWith('b08'))){const t=turn(row.turnId),m=forestGalBackdrop(scene(row.sceneId),t);assert.ok(m.asset);assert.deepEqual(forestGalActors(t,m),[]);assert.deepEqual(forestGalActors(t),[]);assert.equal(m.contract.futureBody.approvedAssets.length,0);
  if(row.sceneId==='b08_night'){assert.deepEqual(row.offscreenActorIds,['merchant']);assert.ok(!row.portraitCandidateIds.includes('merchant'));}
  for(const restriction of [{portraitAllowed:false},{offscreen:{[t.portrait]:'out'}}])assert.equal(forestStoryLocationPortraitAllowed(m,{...t,stage:{...t.stage,...restriction}}),false);
 }
});

test('B12 distant Keke, continuing map and future independently reviewed hands-hidden bust schema',()=>{
 for(const row of CONTRACT.turns.filter(t=>t.sceneId.startsWith('b12'))){const t=turn(row.turnId),model=forestGalBackdrop(scene(row.sceneId),t);assert.deepEqual(forestGalActors(t,model),[]);assert.deepEqual(row.futureBody.candidateIds,['hero','guide']);assert.deepEqual(row.futureBody.approvedAssets,[]);assert.equal(row.futureBody.mode,'reviewed-hands-hidden-bust');assert.ok(row.futureBody.requirements.length);
  if(row.sourceLine>=683){assert.ok(!row.nearActorIds.includes('merchant'));assert.deepEqual(row.distantActorIds,['merchant']);assert.equal(forestStoryLocationPortraitAllowed(model,{...t,portrait:'merchant'}),false);}
  if(row.sceneId==='b12_choice')assert.ok(row.risks.includes('guide_map_not_put_away_until_L735'));
 }
});

test('old queue prose and cross-scene, stage, winter, location and synthetic choice mismatches never bind new art',()=>{
 const t=turn('b08_enter.L455');const old={...t,text:'historical saved prose'};assert.equal(forestGalBackdrop(scene('b08_enter'),old).asset,null);assert.equal(forestStoryLocationForTurn(old),null);assert.ok(forestGalActors(old).some(a=>a.id==='merchant'&&a.art===FOREST_GAL_CAST.merchant),'legacy policy stays unchanged');
 for(const stage of [{winterClothing:'unapproved-winter'},{camera:'exterior-empty-shot'},{locationId:'B-08.inner-room'},{backdropAssetId:'B_ENV_08:winter'}]){const changed={...t,stage:{...t.stage,...stage}};assert.equal(forestGalBackdrop(scene('b08_enter'),changed).asset,null);}
 assert.deepEqual(forestGalActors({...t,stage:{...t.stage,winterClothing:'unapproved-winter'}}),[]);
 assert.equal(forestGalBackdrop(scene('b12_enter'),t).asset,null);assert.equal(forestGalBackdrop(scene('b08_enter'),{...t,id:'ui:choice:b08_enter',kind:'choice-prompt',text:''}).asset,null);
});

test('runtime assets have closed source/dimension/MIME/bytes/SHA integrity; corrupt variants rejected',async()=>{
 const check=await validateStoryLocationAssets(new URL('../',import.meta.url).pathname);assert.deepEqual(check.errors,[]);assert.equal(check.storyLocationAssets,3);assert.equal(check.storyLocationBytes,3564956);
 for(const a of Object.values(FOREST_GAL_STORY_LOCATIONS)){const bytes=readFileSync(new URL('../public/'+a.file,import.meta.url));assert.deepEqual(forestStoryLocationImageErrors(a,bytes),[]);assert.equal(a.mime,'image/webp');assert.deepEqual([a.width,a.height],a.id==='B_ENV_05'?[1536,1024]:[1672,941]);assert.equal(a.fit,'preserve-full-frame');assert.ok(forestStoryLocationImageErrors({...a,sha256:'0'.repeat(64)},bytes).some(e=>e.includes('SHA256')));assert.ok(forestStoryLocationImageErrors({...a,width:1},bytes).some(e=>e.includes('dimensions')));assert.ok(forestStoryLocationImageErrors({...a,bytes:1},bytes).some(e=>e.includes('byte size')));assert.ok(forestStoryLocationImageErrors(a,null).length);}
});

class ImageNode{constructor(){this.dataset={};this.style={};this.children=[];this.hidden=true;this.complete=false;this.naturalWidth=0;this.naturalHeight=0;}removeAttribute(k){delete this[k];}replaceChildren(...nodes){this.children=nodes;}load(w,h){this.naturalWidth=w;this.naturalHeight=h;this.onload?.();}}
const nodes=()=>Object.fromEntries(['backdrop','actors','portrait','label','stage','dialog'].map(id=>[id,new ImageNode()]));
test('late image events across scenes/cancel/failure cannot revive art or restore forbidden bodies/heads',()=>{
 const original=globalThis.document;globalThis.document={createElement:()=>new ImageNode()};
 try{const n=nodes(),a=turn('b08_enter.L455'),b=turn('b12_choice.L733');presentForestGal(n,scene('b08_enter'),a);const old=n.backdrop.onload,oldFace=n.portrait.onload;assert.deepEqual(n.actors.children,[]);assert.equal(n.portrait.dataset.characterId,'merchant');
  presentForestGal(n,scene('b12_choice'),b);const current=n.backdrop.onload;old();oldFace();assert.equal(n.backdrop.hidden,true);assert.equal(n.portrait.hidden,true);assert.equal(n.portrait.dataset.characterId,'guide');assert.equal(n.stage.dataset.artPresentation,'story-location');
  n.backdrop.load(1,1);assert.equal(n.stage.dataset.artStatus,'failed');assert.equal(n.backdrop.hidden,true);assert.deepEqual(n.actors.children,[]);clearForestGal(n);current();assert.equal(n.stage.dataset.artStatus,'inactive');assert.equal(n.backdrop.hidden,true);assert.equal(n.portrait.hidden,true);
  presentForestGal(n,scene('b12_choice'),b);n.backdrop.load(1672,941);n.portrait.load(FOREST_CAST_ART.guide.width,FOREST_CAST_ART.guide.height);assert.equal(n.backdrop.hidden,false);assert.equal(n.portrait.hidden,false);presentForestGal(n,scene('b12_choice'),turn('b12_choice.L735'));assert.equal(n.portrait.hidden,true);assert.equal(n.portrait.dataset.characterId,'');assert.deepEqual(n.actors.children,[]);
 }finally{globalThis.document=original;}
});
