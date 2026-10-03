import test from 'node:test';
import assert from 'node:assert/strict';
import {PROFILES} from '../src/profiles/registry.js';
import {createProfileRuntime,verifyProfileRuntime} from '../src/profiles/runtime.js';
import {createProfileRepository,contextKey,inspectHeader} from '../src/profiles/persistence.js';
const presentation={seenIds:['c01'],queue:[],turnIndex:0};
const memory=()=>{const data=new Map();return {data,get length(){return data.size;},key:i=>[...data.keys()][i]??null,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};};
function fixture(p=PROFILES[0],runId=''){const storage=memory(),runtime=createProfileRuntime(p.id),repo=createProfileRepository(storage,runtime,{profileId:p.id,runId});return {storage,runtime,repo,p};}
test('three canonical runtime hashes and exact STANDARD identity stay frozen',async()=>{for(const p of PROFILES){const runtime=createProfileRuntime(p.id);await verifyProfileRuntime(runtime,p);assert.deepEqual(runtime.identity,p.identity);}assert.throws(()=>createProfileRuntime('future'));});
for(const envelope of [false,true])test(`legacy markerless STANDARD ${envelope?'presentation envelope':'raw state'} restores without rewriting bytes`,()=>{const {storage,runtime,repo}=fixture();let state=runtime.dispatch(runtime.initialState(),{type:'move',direction:'left'}).state;const raw=JSON.stringify(envelope?{$campaignSave:1,state,presentation}:state,null,1);storage.setItem(repo.key('auto'),raw);const before=[...storage.data];const restored=repo.restore();assert.equal(repo.key('auto'),'campaign:voyage-c:normal:fixed-campaign-v1.1:c5a5f809d5548f36:auto');assert.deepEqual(restored.state,state);assert.deepEqual(restored.presentation,envelope?presentation:null);assert.equal(restored.allowAutoSave,true);assert.deepEqual([...storage.data],before);});
for(const p of PROFILES.slice(1))test(`${p.label} markerless identity restores in its own namespace`,()=>{const {runtime,repo}=fixture(p);repo.save('auto',runtime.initialState(),presentation);assert.equal(repo.restore().state.identity.difficultyId,p.difficultyId);});
const variants={
 'future presentation schema':v=>({...v,presentation:{...v.presentation,schemaVersion:2}}),
 'future presentation envelope':v=>({...v,presentation:{...v.presentation,$campaignPresentation:2}}),
 'unknown envelope field':v=>({...v,futureFeature:true}),
 'future envelope':v=>({...v,$campaignSave:2}),
 'future profile':v=>({...v,profileId:'voyage-c-future-r2'}),
 'wrong profile':v=>({...v,profileId:PROFILES[1].id}),
 'future profile version':v=>({...v,profileVersion:'future'}),
 'wrong canonical hash':v=>({...v,canonicalSpecSha256:'0000'}),
 'future schema':v=>({...v,schemaVersion:2}),
 'future state schema':v=>({...v,state:{...v.state,schemaVersion:2}}),
 'foreign campaign':v=>({...v,state:{...v.state,identity:{...v.state.identity,campaignId:'foreign'}}}),
 'wrong hash':v=>({...v,state:{...v.state,identity:{...v.state.identity,contentHash:'future'}}}),
 'wrong version':v=>({...v,state:{...v.state,identity:{...v.state.identity,contentVersion:'future'}}}),
 'wrong rules':v=>({...v,state:{...v.state,identity:{...v.state.identity,rulesVersion:'future'}}}),
 'missing identity':v=>({...v,state:{...v.state,identity:undefined}}),
};
for(const [name,mutate] of Object.entries(variants))for(const slot of ['auto','manual'])test(`${name} ${slot} refuses every write even with compatible fallback`,()=>{const {storage,runtime,repo}=fixture();const state=runtime.initialState();repo.save(slot==='auto'?'manual':'auto',state,presentation);const raw=JSON.stringify(mutate({$campaignSave:1,state,presentation}));storage.setItem(repo.key(slot),raw);const before=[...storage.data];assert.equal(repo.inspect(slot).status,'unsupported');const restored=repo.restore();assert.ok(restored.source);assert.equal(restored.allowAutoSave,false);assert.throws(()=>repo.save('auto',state,presentation));assert.throws(()=>repo.save('manual',state,presentation));assert.throws(()=>repo.save('checkpoint:C-M01',state,presentation));assert.throws(()=>repo.remove(slot));assert.deepEqual([...storage.data],before);});
test('malformed data stays byte exact with compatible manual fallback and remains read-only',()=>{const {storage,runtime,repo}=fixture();repo.save('manual',runtime.initialState(),presentation);storage.setItem(repo.key('auto'),'{bad');assert.equal(repo.restore().source,'manual');assert.equal(repo.restore().allowAutoSave,false);assert.throws(()=>repo.save('auto',runtime.initialState()));assert.equal(storage.getItem(repo.key('auto')),'{bad');});
test('all profile and run contexts isolate auto/manual/checkpoints; no cross-difficulty fallback',()=>{const storage=memory();for(const p of PROFILES)for(const runId of ['','r-abc-123']){const rt=createProfileRuntime(p.id),repo=createProfileRepository(storage,rt,{profileId:p.id,runId});assert.equal(repo.restore().source,null);for(const slot of ['auto','manual','checkpoint:C-M01'])repo.save(slot,rt.initialState(),presentation);}assert.equal(storage.data.size,18);for(const p of PROFILES){const rt=createProfileRuntime(p.id),repo=createProfileRepository(storage,rt,{profileId:p.id,runId:'r-new-123'});assert.equal(repo.restore().source,null);}assert.equal(storage.data.size,18);});
test('new future bytes appearing after restore are refused at write time',()=>{const {storage,runtime,repo}=fixture();assert.equal(repo.restore().allowAutoSave,true);storage.setItem(repo.key('manual'),'future bytes');assert.throws(()=>repo.save('auto',runtime.initialState()));assert.equal(storage.getItem(repo.key('manual')),'future bytes');assert.equal(storage.getItem(repo.key('auto')),null);});
test('matching optional profile markers are accepted; foreign profile runtime is refused',()=>{const p=PROFILES[1],{runtime}=fixture(p);const raw=JSON.stringify({$campaignSave:1,state:runtime.initialState(),presentation,profileId:p.id,profileVersion:p.profileVersion,canonicalSpecSha256:p.canonicalSpecSha256});assert.equal(inspectHeader(raw,p).status,'supported');assert.throws(()=>createProfileRepository(memory(),runtime,{profileId:PROFILES[0].id}));assert.throws(()=>contextKey(p,'../../other','auto'));});
