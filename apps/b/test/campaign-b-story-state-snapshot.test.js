import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createForestCampaign} from '../src/campaigns/b/content.js';
import {createForestStory,FOREST_STORY_CONTENT as C} from '../src/campaigns/b/story/index.js';
import {captureForestStoryFacts,readForestTurnSnapshot,forestRouteVisualState,FOREST_STORY_SOURCE_HASH} from '../src/campaigns/b/story/state-snapshot.js';
import {FOREST_STORY_SOURCE_MANIFEST,FOREST_MONSTER_SOURCE_MANIFEST,FOREST_MONSTER_SOURCE_HASH} from '../src/campaigns/b/story/source-manifest.js';
import {createForestPreviewSession,validForestPresentation} from '../src/campaigns/b/preview-session.js';
import {createSaveRepository} from '../src/core/campaign.js';
import {createFineForestSaveExtension,fineStoryDigest} from '../src/rendering/forest-fine-save.js';
import {FOREST_GAL_BACKGROUND_CONTRACT,FOREST_GAL_CG_CONTRACT,forestGalExactArtRow} from '../src/rendering/forest-gal-cg-contract.js';
import {FOREST_GAL_SAFE_ENVIRONMENT_CONTRACT} from '../src/rendering/forest-gal-safe-environment-contract.js';
const r=createForestCampaign(),story=createForestStory(r),sha=x=>createHash('sha256').update(x).digest('hex');
const memory=()=>{const m=new Map();return{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)}};
const pres=queue=>({storyVersion:C.id,openingRevision:'opening-r1',seenIds:queue.flatMap(s=>s.turns.map(t=>t.id)),queue,turnIndex:0,paused:false});
function saved(state,p,extension=null){const storage=memory();createSaveRepository(storage,r).save('auto',state,p);return {storage,session:createForestPreviewSession(r,storage,{extension})};}

test('source provenance covers checked current story construction, including adaptations',()=>{
 for(const row of FOREST_STORY_SOURCE_MANIFEST)assert.equal(sha(readFileSync(new URL(['index.js','state-snapshot.js'].includes(row.file)?`./fixtures/legacy-story-construction/${row.file}`:`../src/campaigns/b/story/${row.file}`,import.meta.url))),row.sha256,row.file);
 assert.equal(sha(JSON.stringify(FOREST_STORY_SOURCE_MANIFEST)),FOREST_STORY_SOURCE_HASH);
 for(const row of FOREST_MONSTER_SOURCE_MANIFEST)assert.equal(sha(readFileSync(new URL(`../src/campaigns/b/story/${row.file}`,import.meta.url))),row.sha256,row.file);
 assert.equal(sha(JSON.stringify(FOREST_MONSTER_SOURCE_MANIFEST)),FOREST_MONSTER_SOURCE_HASH);
 assert.notEqual(FOREST_MONSTER_SOURCE_HASH,FOREST_STORY_SOURCE_HASH);
 assert.notEqual(FOREST_STORY_SOURCE_HASH,C.source['full-v1.1.md'].sha256);
});
test('new turns independently freeze allowlisted evidence without changing state or source',()=>{
 const state=r.initialState(),before=structuredClone(state),scene=story.resolve('b01_enter',state),a=scene.turns[0],b=scene.turns[1],s=readForestTurnSnapshot(a,{sceneId:scene.sceneId});
 assert.ok(s);assert.equal(s.origin,'runtime-resolve');assert.equal(s.stateHash,r.stateHash(state));assert.equal(s.revision,state.revision);
 assert.equal(s.authoredTextSha256,sha(C.scenes.b01_enter.turns[0].text));assert.equal(s.resolvedTextSha256,sha(a.text));assert.notEqual(a.storySnapshot,b.storySnapshot);assert.notEqual(a.storySnapshot.routes,b.storySnapshot.routes);
 assert.ok(Object.isFrozen(a.storySnapshot.routes['07']));assert.throws(()=>{a.storySnapshot.routes['07'].rootFixed=true});assert.deepEqual(state,before);
 assert.deepEqual(Object.keys(captureForestStoryFacts(r,state)).sort(),['revision','routes','stateHash','warm']);
 assert.equal(forestRouteVisualState(s,7),'none');assert.equal(readForestTurnSnapshot(a,{sceneId:'b24_route'}),null);
});
test('all 16 route combinations retain independent axes and never infer both',()=>{
 for(const site of ['07','16','21','24'])for(let bits=0;bits<16;bits++){
  const state=r.initialState(),keys=['originalCleared','originalWorksDone','rootFixed','rootWorksDone'];keys.forEach((k,i)=>state.flags[`b${site}.${k}`]=Boolean(bits&(1<<i)));
  const facts=captureForestStoryFacts(r,state),snapshot=readForestTurnSnapshot(story.resolve('b01_enter',state).turns[0]),value=forestRouteVisualState(snapshot,site);
  keys.forEach((k,i)=>assert.equal(facts.routes[site][k],Boolean(bits&(1<<i))));assert.equal(value==='both',bits===15);
  if(bits===4)assert.equal(value,'root-fixed');if(bits===1)assert.equal(value,'original-cleared');if(bits===13)assert.equal(value,'original-cleared+root-ready');if(bits===7)assert.equal(value,'original-ready+root-fixed');
 }
 assert.equal(forestRouteVisualState(null,7),'unknown');assert.equal(forestRouteVisualState({schemaVersion:2},7),'unknown');
 const review=story.resolve('b01_enter',r.initialState(),{reviewMode:true,allBranches:true}).turns[0];assert.equal(readForestTurnSnapshot(review).origin,'review');assert.equal(forestRouteVisualState(readForestTurnSnapshot(review),7),'unknown');
});
test('warm investments and frozen plan remain independent in saved historical turns',()=>{
 for(let bits=0;bits<16;bits++){
  const state=r.initialState();['greenhouse','pear','lodge'].forEach((key,i)=>state.flags[`b.warm.${key}`]=Boolean(bits&(1<<i)));state.flags['b26.heatPlanFrozen']=Boolean(bits&8);
  const turn=story.resolve('b01_enter',state).turns[0],frozen=JSON.stringify(turn);state.flags['b.warm.greenhouse']=!state.flags['b.warm.greenhouse'];state.flags['b26.heatPlanFrozen']=!state.flags['b26.heatPlanFrozen'];
  const warm=readForestTurnSnapshot(turn).warm;['greenhouse','pear','lodge','frozen'].forEach((key,i)=>assert.equal(warm[key],Boolean(bits&(1<<i))));assert.equal(JSON.stringify(turn),frozen);
 }
});
test('missing, damaged and future snapshots HOLD without rewriting or rejecting old envelopes',()=>{
 const state=r.initialState(),base=story.resolve('b01_enter',state);
 for(const damage of [t=>delete t.storySnapshot,t=>t.storySnapshot.schemaVersion=999,t=>t.storySnapshot.routes['07'].rootFixed=null,t=>t.storySnapshot.turnId='wrong',t=>t.storySnapshot.sourceHash='0'.repeat(64),t=>t.text+=' changed',t=>t.storySnapshot.resolvedTextSha256='f'.repeat(64),t=>t.storySnapshot.phase='future',t=>t.storySnapshot.branch='root',...['__proto__','constructor','toString'].map(name=>t=>t.storySnapshot.sceneId=name)]){
  const scene=structuredClone(base);damage(scene.turns[0]);const before=structuredClone(scene),p=pres([scene]);assert.equal(readForestTurnSnapshot(scene.turns[0]),null);assert.ok(validForestPresentation(p));
  const {session}=saved(state,p);assert.equal(session.compatibilityFailure,null);assert.deepEqual(session.current(),before);assert.equal(readForestTurnSnapshot(session.turn()),null);assert.deepEqual(session.state,state);
 }
});
test('old raw finePose digest is checked before catch-up and capture; old metadata stays absent',()=>{
 for(const slot of ['auto','manual'])for(const legacy of [false,true]){
  const state=r.initialState(),scene=createForestStory(r,{openingRevision:legacy?'legacy-v1.1':'opening-r1'}).resolve('b01_enter',state);scene.turns.forEach(t=>delete t.storySnapshot);
  const p=pres([scene]);if(legacy)delete p.openingRevision;
  const ext=createFineForestSaveExtension(r),captured=ext.capture(state,p).presentation,storage=memory(),repo=createSaveRepository(storage,r);repo.save(slot,state,captured);
  const raw=repo.inspect(slot).presentation,oldDigest=fineStoryDigest(r,raw),calls=[];
  const wrapper={...ext,validateRestore(s,p){calls.push(structuredClone(p));return ext.validateRestore(s,p)}};
  const session=createForestPreviewSession(r,storage,{extension:wrapper});assert.equal(session.compatibilityFailure,null);assert.ok(calls.some(p=>p?.finePose?.presentationHash===oldDigest));assert.deepEqual(session.current(),scene);
  assert.ok(session.save());assert.equal(session.load('manual').ok,true);assert.deepEqual(session.current(),scene);assert.equal(session.turn().storySnapshot,undefined);assert.equal(ext.validateRestore(session.state,session.presentation).ok,true);
 }
});
test('state-only saves capture new evidence but legacy queued turns remain unknown even if live both',()=>{
 const state=r.initialState();for(const key of ['originalCleared','originalWorksDone','rootFixed','rootWorksDone'])state.flags[`b07.${key}`]=true;
 const storage=memory(),repo=createSaveRepository(storage,r);repo.save('auto',state);const fresh=createForestPreviewSession(r,storage);assert.equal(forestRouteVisualState(readForestTurnSnapshot(fresh.turn()),7),'both');
 const scene=structuredClone(story.resolve('b01_enter',state));scene.turns.forEach(t=>delete t.storySnapshot);const old=saved(state,pres([scene])).session;assert.equal(forestRouteVisualState(readForestTurnSnapshot(old.turn()),7),'unknown');assert.deepEqual(old.current(),scene);
});
test('response insertion captures its own time and does not overwrite earlier scene turns',()=>{
 const early=r.initialState();early.flags['b02.winterPlanKnown']=true;
 // Mixed-time saved-scene fixture; real dispatch reachability is tested separately.
 const scene=structuredClone(story.response('b12_choice','response1',early));scene.choices=[{id:'response2',presentationOnly:true}];scene.turns.at(-1).choices=structuredClone(scene.choices);
 const late=structuredClone(early);late.flags['b.warm.pear']=true;late.flags['b16.rootFixed']=true;late.revision++;
 const p=pres([scene]);p.turnIndex=scene.turns.findIndex(t=>t.choices?.length);assert.ok(p.turnIndex>=0);const {session}=saved(late,p),oldTurns=structuredClone(session.current().turns),choice=session.turn().choices.find(c=>c.presentationOnly);assert.ok(choice);
 assert.equal(session.respond(choice.id).ok,true);const inserted=session.current().turns.filter(t=>!oldTurns.some(old=>old.id===t.id));assert.ok(inserted.length);
 for(const t of inserted){assert.equal(t.storySnapshot.revision,late.revision);assert.equal(t.storySnapshot.warm.pear,true);assert.equal(t.storySnapshot.routes['16'].rootFixed,true);assert.ok(readForestTurnSnapshot(t));}
 for(const old of oldTurns){const now=session.current().turns.find(t=>t.id===old.id);assert.deepEqual(now.storySnapshot,old.storySnapshot);assert.equal(now.text,old.text);assert.deepEqual(now.stage,old.stage);}
 assert.ok(session.save());assert.equal(session.load('manual').ok,true);assert.deepEqual(session.state,late);
});
test('existing 117 background and 9 CG exact contracts ignore nonvisual snapshot metadata',()=>{
 assert.equal(FOREST_GAL_BACKGROUND_CONTRACT.length,179);assert.equal(FOREST_GAL_SAFE_ENVIRONMENT_CONTRACT.length,117);assert.equal(FOREST_GAL_CG_CONTRACT.length,9);
 for(const rows of [FOREST_GAL_BACKGROUND_CONTRACT,FOREST_GAL_CG_CONTRACT,FOREST_GAL_SAFE_ENVIRONMENT_CONTRACT])for(const row of rows){
  const scene=story.resolve(row.sceneId,r.initialState(),{reviewMode:true,allBranches:true}),turn=scene.turns.find(t=>t.id===row.turnId);assert.ok(turn,row.turnId);assert.equal(forestGalExactArtRow(rows,scene,turn),row);
  const old=structuredClone(turn);delete old.storySnapshot;assert.equal(forestGalExactArtRow(rows,scene,old),row);old.storySnapshot={schemaVersion:999};assert.equal(forestGalExactArtRow(rows,scene,old),row);
 }
});
test('existing boundary adaptations keep distinct authored/resolved provenance without new prose',()=>{
 const state=r.initialState();state.flags['b16.rootFixed']=true;state.flags['b16.rootWorksDone']=true;state.flags['b16.originalCleared']=true;
 const scene=story.resolve('b16_route',state,{branch:'root'}),turn=scene.turns.find(t=>t.sourceLine===965),s=readForestTurnSnapshot(turn);
 assert.ok(s);assert.equal(s.adaptationId,'B-EDGE-001');assert.notEqual(s.authoredTextSha256,s.resolvedTextSha256);assert.equal(s.authoredTextSha256,sha(C.scenes.b16_route.turns.find(t=>t.id===turn.id).text));assert.equal(s.resolvedTextSha256,sha(turn.text));
 assert.equal(forestRouteVisualState(s,16),'original-cleared+root-ready');assert.equal(turn.branch,'root');
});
test('failed finePose digest remains blocked and unmodified instead of metadata being repaired',()=>{
 const state=r.initialState(),scene=structuredClone(story.resolve('b01_enter',state));scene.turns.forEach(t=>delete t.storySnapshot);
 const ext=createFineForestSaveExtension(r),p=ext.capture(state,pres([scene])).presentation;p.finePose.presentationHash='wrong';const storage=memory(),repo=createSaveRepository(storage,r);repo.save('auto',state,p);const raw=storage.getItem(repo.key('auto'));
 const session=createForestPreviewSession(r,storage,{extension:ext});assert.equal(session.compatibilityFailure.code,'fine-pose-compatibility');assert.equal(session.saveAuto(),false);assert.equal(session.current(),null);assert.equal(storage.getItem(repo.key('auto')),raw);
});

test('unvalidated JSON and partial snapshots cannot be mistaken for visual facts',()=>{const turn=story.resolve('b01_enter',r.initialState()).turns[0];assert.equal(forestRouteVisualState(structuredClone(turn.storySnapshot),7),'unknown');assert.equal(forestRouteVisualState(readForestTurnSnapshot(structuredClone(turn)),7),'none');assert.equal(forestRouteVisualState({schemaVersion:1,origin:'runtime-resolve',routes:{'07':{originalCleared:true,originalWorksDone:true,rootFixed:true,rootWorksDone:true}}},7),'unknown');});
