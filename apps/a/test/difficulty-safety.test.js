import test from 'node:test';
import assert from 'node:assert/strict';
import { assemble30 } from './helpers/assemble-thirty.mjs';
import { PROFILES, profileIdentity, parseProfileSave, configureDifficultySession } from '../src/game/difficulty-session.js';
import { applyDifficultyProfile, profileDataChecksum } from '../src/game/difficulty-profiles.js';
import { difficultyStorageKeys, inspectDifficultyStorage, createDifficultyPersistence as createPersistence } from '../src/game/difficulty-storage.js';
const immediateLocks = { request(name, options, fn) { return fn(); } };
const createDifficultyPersistence = (storage,id,initial) => createPersistence(storage,id,initial,{locks:immediateLocks});
const data = assemble30();
const { createInitialState, deserializeState, serializeState } = await import('../src/game/engine.js');
const base=createInitialState();
const stateFor=id=>({...structuredClone(base),profileIdentity:profileIdentity(id)});
function memoryStorage(seed={}) {const map=new Map(Object.entries(seed));return {map,get length(){return map.size;},key:i=>[...map.keys()][i]??null,getItem:k=>map.get(k)??null,setItem(k,v){map.set(k,String(v));},removeItem:k=>map.delete(k)};}

test('three exact profile mutations, immutable document identity and baseline preconditions',()=>{
  for(const id of Object.keys(PROFILES)) {
    const clone={ENEMIES:structuredClone(data.ENEMIES),FLOORS:structuredClone(data.FLOORS),ITEMS:structuredClone(data.ITEMS),SHOP_OPTIONS:structuredClone(data.SHOP_OPTIONS)};
    const expected=structuredClone(clone);
    if(id==='forgiving'){expected.ENEMIES.hushCantor.magicPower=199;expected.ENEMIES.manaSentinel.atk=280;expected.ENEMIES.prismArchivist.magicPower=135;}
    if(id==='challenge'){expected.ITEMS.act3Hp.hp=5950;expected.ITEMS.act3Hp.maxHp=5950;expected.ITEMS.act3Hp.description='生命上限与当前生命 +5950。';}
    assert.equal(applyDifficultyProfile(clone,id).applied,true);assert.deepEqual(clone,expected);
    assert.equal(profileDataChecksum(clone),PROFILES[id].dataChecksum);
    assert.equal(applyDifficultyProfile(clone,id).applied,false);
    assert.throws(()=>applyDifficultyProfile(clone,id==='classic'?'challenge':'classic'));
    clone.ENEMIES.mote.atk++; assert.throws(()=>applyDifficultyProfile(clone,id));
  }
  const bad={...data,ENEMIES:structuredClone(data.ENEMIES)};bad.ENEMIES.mote.atk++;assert.throws(()=>applyDifficultyProfile(bad,'classic'));
});
test('unknown and prototype-named profiles cannot form a runtime identity',()=>{
 for(const id of ['future','constructor','__proto__','toString']){assert.throws(()=>profileIdentity(id));assert.throws(()=>difficultyStorageKeys(id));assert.throws(()=>applyDifficultyProfile(data,id));}
});
test('classic retains exact original keys and only classic accepts markerless old v10',()=>{
  assert.equal(difficultyStorageKeys('classic').auto,'lost-magic-tower:demo-30f-afterlight-registry-v1:auto:v1');
  assert.deepEqual(parseProfileSave(JSON.stringify(base),'classic'),base);
  for(const id of ['forgiving','challenge'])assert.throws(()=>parseProfileSave(JSON.stringify(base),id));
});
for(const id of Object.keys(PROFILES))test(`${id}: slot isolation, read-only restoration and byte-preserving reads`,()=>{
  const storage=memoryStorage({'unrelated':'untouched','lost-magic-tower:other-content:auto:v1':'other'});
  for(const p of Object.keys(PROFILES)){const keys=difficultyStorageKeys(p);storage.setItem(keys.auto,JSON.stringify(stateFor(p)));}
  const snapshot=[...storage.map];const controller=createDifficultyPersistence(storage,id);
  const state=parseProfileSave(controller.read('auto'),id);assert.deepEqual([...storage.map],snapshot);
  state.turns++;controller.write('auto',state);controller.write('manual',state);
  for(const other of Object.keys(PROFILES).filter(p=>p!==id))assert.equal(storage.getItem(difficultyStorageKeys(other).auto),snapshot.find(([k])=>k===difficultyStorageKeys(other).auto)[1]);
  assert.equal(storage.getItem('unrelated'),'untouched');
});
const attacks={
  markupTurn:s=>s.turns='<b id="injected">spoof</b>', negativeTurns:s=>s.turns=-1, hugeTurns:s=>s.turns=Number.MAX_SAFE_INTEGER, fractionalBattle:s=>s.battles=0.5, stringCounter:s=>s.shopPurchases="2", nestedLog:s=>s.logs=[{}], invalidVisited:s=>s.visitedFloors=[31],
  futureGame:s=>s.version=11, futureIdentity:s=>s.profileIdentity.format='tower-profile-identity-v2', wrongProfile:s=>s.profileIdentity.profileId='challenge', wrongHash:s=>s.profileIdentity.contentHash='unknown', futureCandidate:s=>s.profileIdentity.candidateVersion='r999', foreignCampaign:s=>s.profileIdentity.campaignId='forest', unknownIdentityField:s=>s.profileIdentity.future=true, partialIdentity:s=>delete s.profileIdentity.contentHash, unknownTopLevel:s=>s.futureMetadata={}, foreignB:s=>s.floorStates=[], corruptMap:s=>s.floorStates[2].map[0]=[], malformedResources:s=>s.stats.hp=null
};
for(const [name,mutate]of Object.entries(attacks))for(const slot of ['auto','manual'])test(`reject ${name} in ${slot}, preserve both slots despite valid fallback`,()=>{
  const bad=structuredClone(stateFor('classic'));mutate(bad);const keys=difficultyStorageKeys('classic');
  const storage=memoryStorage({[keys.auto]:JSON.stringify(stateFor('classic')),[keys.manual]:JSON.stringify(stateFor('classic'))});storage.setItem(keys[slot],JSON.stringify(bad));const before=[...storage.map];
  const inspected=inspectDifficultyStorage(storage,'classic');assert.equal(inspected.blocked,true);assert.equal(inspected.hasSave,true);
  const controller=createDifficultyPersistence(storage,'classic',inspected);
  assert.throws(()=>controller.write('auto',stateFor('classic')));assert.throws(()=>controller.write('manual',stateFor('classic')));assert.throws(()=>controller.prepareNew());assert.deepEqual([...storage.map],before);
});
test('new game backup preserves exact bytes and never reuses prior backup key',()=>{
 const keys=difficultyStorageKeys('classic'),raw='  '+JSON.stringify(base)+'\n';const storage=memoryStorage({[keys.auto]:raw,[keys.manual]:raw});const c=createDifficultyPersistence(storage,'classic');c.prepareNew();c.prepareNew();const backups=[...storage.map].filter(([k])=>k.startsWith(keys.backup));assert.equal(backups.length,2);for(const[,v]of backups){assert.equal(JSON.parse(v).auto,raw);assert.equal(JSON.parse(v).manual,raw);}assert.equal(storage.getItem(keys.auto),raw);
});
test('quota failure before backup or write leaves both original slots byte exact',()=>{
 const keys=difficultyStorageKeys('classic'),raw=JSON.stringify(base);const storage=memoryStorage({[keys.auto]:raw,[keys.manual]:raw});storage.setItem=()=>{throw Error('QuotaExceededError');};const c=createDifficultyPersistence(storage,'classic');assert.throws(()=>c.prepareNew());assert.throws(()=>c.write('auto',stateFor('classic')));assert.equal(c.readOnly,true);assert.equal(storage.getItem(keys.auto),raw);assert.equal(storage.getItem(keys.manual),raw);
});
test('concurrent valid or future changes in either slot stop all writes, including reset',()=>{
 for(const slot of ['auto','manual'])for(const future of [false,true]){const keys=difficultyStorageKeys('classic'),raw=JSON.stringify(base);const storage=memoryStorage({[keys.auto]:raw,[keys.manual]:raw});const c=createDifficultyPersistence(storage,'classic');const updated=stateFor('classic');updated.turns=42;if(future)updated.profileIdentity={...updated.profileIdentity,candidateVersion:'future'};storage.setItem(keys[slot],JSON.stringify(updated));const before=[...storage.map];assert.throws(()=>c.write('auto',stateFor('classic')));assert.throws(()=>c.prepareNew());assert.deepEqual([...storage.map],before);}
});
test('engine manual deserialize/serialize checks active identity before migration and future stripping',()=>{
 configureDifficultySession({profileId:'classic',mode:'new'});
 assert.deepEqual(createInitialState().profileIdentity,profileIdentity('classic'));
 assert.deepEqual(deserializeState(JSON.stringify(base)),base);
 assert.equal(JSON.parse(serializeState(base)).profileIdentity.profileId,'classic');
 for(const mutate of Object.values(attacks)){const bad=structuredClone(stateFor('classic'));mutate(bad);assert.throws(()=>deserializeState(JSON.stringify(bad)));assert.throws(()=>serializeState(bad));}
 assert.throws(()=>configureDifficultySession({profileId:'challenge',mode:'new'}));
});

test('without a shared Web Locks API, saves and new games are safely read-only',()=>{
 const storage=memoryStorage();const c=createPersistence(storage,'classic',undefined,{locks:null});assert.equal(c.readOnly,true);assert.throws(()=>c.write('auto',stateFor('classic')));assert.throws(()=>c.prepareNew());assert.equal(storage.map.size,0);
});
test('shared write lock serializes concurrent writers and preserves the first successful bytes',async()=>{
 const queues=new Map();const locks={request(name,options,fn){const result=(queues.get(name)??Promise.resolve()).then(fn);queues.set(name,result.catch(()=>{}));return result;}};
 const keys=difficultyStorageKeys('classic'),raw=JSON.stringify(base),storage=memoryStorage({[keys.auto]:raw});
 const a=createPersistence(storage,'classic',undefined,{locks}),b=createPersistence(storage,'classic',undefined,{locks});
 const sa=stateFor('classic'),sb=stateFor('classic');sa.turns=111;sb.turns=222;
 const results=await Promise.allSettled([a.write('auto',sa),b.write('auto',sb)]);
 assert.equal(results[0].status,'fulfilled');assert.equal(results[1].status,'rejected');assert.equal(JSON.parse(storage.getItem(keys.auto)).turns,111);assert.equal(b.readOnly,true);
});
test('queued writes capture the intended state before waiting for the shared lock',async()=>{
 let release;const gate=new Promise(resolve=>{release=resolve;});const locks={request:(name,options,fn)=>gate.then(fn)};const storage=memoryStorage();const c=createPersistence(storage,'classic',undefined,{locks});const state=stateFor('classic');state.turns=2;const pending=c.write('auto',state);state.turns=999;release();await pending;assert.equal(JSON.parse(storage.getItem(c.keys.auto)).turns,2);
});

test('cancelling a new game while its lock is pending prevents backup and writes',async()=>{
 let release;const gate=new Promise(resolve=>{release=resolve;});const locks={request:(name,options,fn)=>gate.then(fn)};const keys=difficultyStorageKeys('classic');const raw=JSON.stringify(base);const storage=memoryStorage({[keys.auto]:raw});const before=[...storage.map];const c=createPersistence(storage,'classic',undefined,{locks});let current=true;const pending=c.prepareNew({isCurrent:()=>current});current=false;release();await assert.rejects(pending,/取消/);assert.deepEqual([...storage.map],before);
});

test('history recovery lists only matching profile backups and exports exact original bytes',()=>{
 const storage=memoryStorage();const raw='  '+JSON.stringify(base)+'\n';storage.setItem(difficultyStorageKeys('classic').auto,raw);const classic=createDifficultyPersistence(storage,'classic');classic.prepareNew();
 const other=createDifficultyPersistence(storage,'forgiving');other.write('auto',stateFor('forgiving'));other.prepareNew();
 const backups=classic.listBackups();assert.equal(backups.length,1);assert.equal(backups[0].raw,raw);assert.equal(backups[0].slot,'auto');assert.equal(other.listBackups().length,1);assert.equal(JSON.parse(other.listBackups()[0].raw).profileIdentity.profileId,'forgiving');
 const before=[...storage.map];classic.listBackups();assert.deepEqual([...storage.map],before);
});

test('damaged, future and extra-metadata backups remain downloadable byte-for-byte without restore eligibility',()=>{
 const storage=memoryStorage(),keys=difficultyStorageKeys('classic');const raws=[' {broken future bytes ',JSON.stringify({format:'tower-before-new-backup-v99',data:'future'}),JSON.stringify({format:'tower-before-new-backup-v1',identity:profileIdentity('classic'),savedAt:'<img onerror=1>',auto:'unknown-save',manual:null}),JSON.stringify({format:'tower-before-new-backup-v1',identity:profileIdentity('classic'),savedAt:'',auto:JSON.stringify(base),manual:null,future:true})];raws.forEach((raw,i)=>storage.setItem(keys.backup+':'+i,raw));const c=createDifficultyPersistence(storage,'classic');const before=[...storage.map];const backups=c.listBackups();assert.equal(backups.length,4);assert.ok(backups.every(b=>b.compatible===false));assert.equal(backups.find(b=>b.slot==='auto').raw,'unknown-save');for(const raw of [raws[0],raws[1],raws[3]])assert.ok(backups.some(b=>b.raw===raw));assert.deepEqual([...storage.map],before);
});
