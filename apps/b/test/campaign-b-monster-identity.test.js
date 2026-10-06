import test from 'node:test';import assert from 'node:assert/strict';
import {createForestCampaign} from '../src/campaigns/b/content.js';
import {createSaveRepository} from '../src/core/campaign.js';
import {buildForestWitness,createForestWalker} from '../src/campaigns/b/witness.js';
import {createForestStory,FOREST_STORY_CONTENT as C} from '../src/campaigns/b/story/index.js';
import {createForestPreviewSession} from '../src/campaigns/b/preview-session.js';
import {forestActionView} from '../src/campaigns/b/view.js';
import {NEW_MONSTER_REVISION as NEW,LEGACY_MONSTER_REVISION as OLD,FOREST_MONSTER_IDENTITIES,FOREST_MONSTER_TEXT,forestMonsterRevision,forestMonsterArtIdentity} from '../src/campaigns/b/story/monster-identity.js';
import {readForestTurnSnapshot} from '../src/campaigns/b/story/state-snapshot.js';
import {forestGalPresentation} from '../src/rendering/forest-gal-stage.js';
const r=createForestCampaign(),memory=()=>{const m=new Map();return {m,getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};};
const p=revision=>({storyVersion:C.id,openingRevision:'opening-r1',...(revision?{monsterStoryRevision:revision}:{}),seenIds:[],queue:[],turnIndex:0,paused:true});
const oldStory=createForestStory(r,{monsterStoryRevision:OLD}),newStory=createForestStory(r,{monsterStoryRevision:NEW});
function bossState(){const pre=buildForestWitness({runtime:r,stopBefore:'b06.sawPuppet'}),w=createForestWalker(r,pre.state);w.approach('b06.sideTender');return w.state;}
function at(state,revision=NEW,pres=null){const storage=memory(),repo=createSaveRepository(storage,r);repo.save('auto',state,pres??p(revision));return {storage,repo,session:createForestPreviewSession(r,storage)};}
function drain(s){for(let n=0;s.current()&&n<500;n++){if(s.turn()?.choices?.length)break;s.skip();}}
test('new, legacy, absent and unknown revisions retain independent restore semantics',()=>{
 const fresh=createForestPreviewSession(r,memory());assert.equal(fresh.monsterStoryRevision,NEW);
 for(const marker of [undefined,OLD,NEW]){const s=at(r.initialState(),marker,p(marker)).session;assert.equal(s.monsterStoryRevision,marker??OLD);assert.equal(s.compatibilityFailure,null);}
 const {storage,repo,session}=at(r.initialState(),'future-species-r99');const raw=storage.getItem(repo.key('auto'));assert.equal(session.compatibilityFailure.code,'monster-story-compatibility');assert.equal(session.save(),false);assert.equal(storage.getItem(repo.key('auto')),raw);session.restart();assert.equal(session.monsterStoryRevision,NEW);
 assert.equal(forestMonsterRevision({queue:[{monsterStoryRevision:NEW,turns:[]}]}).ok,false);
});
test('all four IDs and display surfaces use species only for the explicit new revision',()=>{
 const state=bossState();for(const [id,row] of Object.entries(FOREST_MONSTER_IDENTITIES)){assert.equal(r.entity(id).title,row.legacy);assert.equal(oldStory.actionPanel(state,id).title,row.legacy);assert.equal(newStory.actionPanel(state,id).title,row.name);assert.equal(forestActionView(r,newStory,state,{type:'interact',entityId:id}).title,row.name);assert.equal(forestActionView(r,oldStory,state,{type:'interact',entityId:id}).title,row.legacy);assert.equal(forestMonsterArtIdentity(id,OLD),null);assert.equal(forestMonsterArtIdentity(id,NEW).form,'beast');assert.equal(forestMonsterArtIdentity(id,NEW,{role:'dialogue'}).form,id==='b06.sideTender'?'anthro':'beast');}
});
test('only reviewed 24 texts change, every new hash survives JSON history round-trip and altered text is rejected',()=>{
 assert.equal(Object.keys(FOREST_MONSTER_TEXT).length,24);
 const state=r.initialState();for(const [id,text]of Object.entries(FOREST_MONSTER_TEXT)){const sid=id.split('.')[0],old=oldStory.resolve(sid,state,{reviewMode:true}).turns.find(t=>t.id===id),fresh=newStory.resolve(sid,state,{reviewMode:true}).turns.find(t=>t.id===id);assert.equal(old.text,C.scenes[sid].turns.find(t=>t.id===id).text);assert.equal(fresh.text,text);assert.ok(readForestTurnSnapshot(JSON.parse(JSON.stringify(fresh)),{sceneId:sid}));assert.equal(readForestTurnSnapshot({...fresh,text:text+'?'}),null);assert.equal(readForestTurnSnapshot({...fresh,storySnapshot:{...fresh.storySnapshot,monsterStoryRevision:'future'}}),null);}
});
test('old queued prose, snapshots and source hash are never migrated on save/load',()=>{
 const state=bossState(),scene=oldStory.resolve('b06_enter',state),pres={...p(),queue:[scene],seenIds:scene.turns.map(t=>t.id),paused:false};const original=JSON.stringify(scene);const {session:s}=at(state,undefined,pres);assert.equal(JSON.stringify(s.current()),original);assert.equal(s.monsterStoryRevision,OLD);s.save();assert.equal(s.load('manual').ok,true);assert.equal(JSON.stringify(s.current()),original);assert.equal(s.story.artIdentity('b06.sawPuppet'),null);
});
test('moth before, cancel, leave and restore do not change state or create aftermath',()=>{
 const state=bossState(),{session:s,storage}=at(state);drain(s);s.pause();const before=r.stateHash(s.state);assert.equal(s.request({type:'interact',entityId:'b06.sideTender'}).story,true);assert.equal(s.current().sceneId,'b06_moth_before');s.skip();const req=s.request({type:'interact',entityId:'b06.sideTender'},{fromChoice:true});assert.equal(req.confirmation,true);s.cancel();assert.equal(r.stateHash(s.state),before);assert.equal(s.presentation.queue.some(q=>q.sceneId==='b06_moth_after'),false);
 s.save();const restored=createForestPreviewSession(r,storage);assert.equal(restored.current().sceneId,'b06_moth_before');assert.equal(restored.pending,null);assert.equal(r.stateHash(restored.state),before);assert.equal(restored.respond('leave').ok,true);restored.advance();assert.equal(restored.presentation.queue.some(q=>q.sceneId==='b06_moth_after'),false);assert.equal(r.stateHash(restored.state),before);
});
test('moth settles once, only receipt unlocks aftermath, reload never invents or repeats it',()=>{
 const {session:s,storage}=at(bossState());drain(s);s.pause();s.request({type:'interact',entityId:'b06.sideTender'});s.skip();const before=s.state,req=s.request({type:'interact',entityId:'b06.sideTender'},{fromChoice:true}),expected=r.dispatch(before,req.action);assert.equal(expected.ok,true);const result=s.confirm(req.confirmationToken);assert.equal(result.ok,true);assert.deepEqual(s.state,expected.state);assert.equal(s.current().sceneId,'b06_moth_after');assert.equal(s.presentation.queue.filter(q=>q.sceneId==='b06_moth_after').length,1);assert.equal(s.confirm(req.confirmationToken).ok,false);assert.deepEqual(s.state,expected.state);const saved=JSON.stringify(s.current());s.save();const loaded=createForestPreviewSession(r,storage);assert.equal(JSON.stringify(loaded.current()),saved);drain(loaded);loaded.pause();assert.equal(loaded.request({type:'interact',entityId:'b06.sideTender'}).ok,false);assert.equal(loaded.presentation.queue.some(q=>q.sceneId==='b06_moth_after'),false);
 assert.throws(()=>newStory.resolve('b06_moth_after',loaded.state),/receipt/);const old=at(loaded.state,OLD).session;assert.equal(old.presentation.queue.some(q=>q.sceneId.startsWith('b06_moth')),false);const catchup=at(loaded.state,NEW).session;assert.equal(catchup.presentation.queue.some(q=>q.sceneId.startsWith('b06_moth')),false);
});
test('unwinnable moth and forged receipt cannot create a fight or postscene',()=>{
 const state=bossState();state.stats.hp=1;const {session:s}=at(state);drain(s);s.pause();const before=r.stateHash(s.state);s.request({type:'interact',entityId:'b06.sideTender'});s.skip();assert.equal(s.request({type:'interact',entityId:'b06.sideTender'},{fromChoice:true}).ok,false);assert.equal(s.pending,null);assert.equal(r.stateHash(s.state),before);assert.equal(s.presentation.queue.some(q=>q.sceneId==='b06_moth_after'),false);assert.equal(newStory.fromDispatch({stateBefore:state,stateAfter:state,events:[{type:'battle',entityId:'b06.sideTender'}],receipt:null}).scenes.length,0);
});

test('new marker plus explicit old lineage or unmarked old species prose fails closed without rewriting bytes',()=>{
 const state=bossState(),legacy=oldStory.resolve('b06_enter',state);
 for(const mode of ['explicit-scene','unmarked-old-text','explicit-turn']){
  const scene=structuredClone(legacy);if(mode!=='explicit-scene')delete scene.monsterStoryRevision;
  if(mode==='explicit-turn'){scene.turns=scene.turns.filter(t=>t.id==='b06_enter.L337');scene.turns[0].monsterStoryRevision=OLD;}
  const queue=[scene],pres={...p(NEW),queue,seenIds:scene.turns.map(t=>t.id),paused:false},storage=memory(),repo=createSaveRepository(storage,r);repo.save('auto',state,pres);repo.save('manual',state,pres);const raw=storage.getItem(repo.key('auto')),manual=storage.getItem(repo.key('manual')),original=JSON.stringify(queue),s=createForestPreviewSession(r,storage);
  assert.equal(s.compatibilityFailure?.code,'monster-story-compatibility',mode);assert.equal(s.save(),false);assert.equal(s.load('manual').ok,false);assert.equal(storage.getItem(repo.key('auto')),raw);assert.equal(storage.getItem(repo.key('manual')),manual);assert.equal(JSON.stringify(s.presentation.queue),original);assert.match(s.compatibilityFailure.reason,/未改写对话/);
 }
 const absent={...p(),queue:[structuredClone(legacy)],seenIds:legacy.turns.map(t=>t.id),paused:false};assert.equal(at(state,undefined,absent).session.compatibilityFailure,null);
});
