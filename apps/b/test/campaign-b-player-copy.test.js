import test from 'node:test';
import assert from 'node:assert/strict';
import { createSaveRepository } from '../src/core/campaign.js';
import { createForestCampaign } from '../src/campaigns/b/content.js';
import { buildForestWitness } from '../src/campaigns/b/witness.js';
import { createForestStory, FOREST_STORY_CONTENT as C } from '../src/campaigns/b/story/index.js';
import { createForestPreviewSession } from '../src/campaigns/b/preview-session.js';
import { forestActionView, forestRegionActions, forestChecklist } from '../src/campaigns/b/view.js';
import { forestPlayerCopy, forestActionVisible, forestDeferredNotice, forestChoicePrompt, forestActionResult, forestMapTitle } from '../src/campaigns/b/player-copy.js';
const runtime=createForestCampaign(),story=createForestStory(runtime),route=buildForestWitness({runtime});
const checkpoint=id=>route.checkpoints.find(c=>c.entityId===id);
const memory=()=>{const entries=new Map();return {getItem:key=>entries.get(key)??null,setItem:(key,value)=>entries.set(key,value),removeItem:key=>entries.delete(key)};};
function sessionAt(state){const storage=memory(),repo=createSaveRepository(storage,runtime);repo.save('auto',state,{storyVersion:C.id,seenIds:[],queue:[],turnIndex:0,paused:false});return {storage,session:createForestPreviewSession(runtime,storage)};}

test('B early tree-heart cards show the heat box, not later meals, sealing or maintenance tasks',()=>{
 const state=checkpoint('b03.heatBox').before,raw=runtime.serialize(state),actions=forestRegionActions(runtime,story,state);
 assert.deepEqual(actions.filter(a=>a.entity).map(a=>a.entity.id),['b03.heatBox']);
 const text=actions.flatMap(a=>[a.title,...a.details]).join('\n');
 assert.doesNotMatch(text,/最终确认|最后.*暖夜|抽屉|请先完成|总阀|护臂/);
 assert.match(text,/8 份暖脂/);assert.match(text,/留 4 份/);
 assert.match(forestDeferredNotice(state),/检修入口暂未开放/);
 for(const a of actions.filter(a=>a.edge&&!runtime.meets(state,a.edge.requires)))assert.equal(forestMapTitle(runtime,state,a.anchor),'尚未开放的小路');
 assert.equal(runtime.serialize(state),raw);
});

test('B free conversations, beneficial pickups and free works commit once without a generic confirmation',()=>{
 for(const id of ['b02.winterPlan','b03.heatBox','b01.guardPlate','b04.housing','b09.bridgeWorks','b12.overlook']){
  const {session,storage}=sessionAt(checkpoint(id).before);session.pause();
  const result=session.request({type:'interact',entityId:id});assert.equal(result.ok,true,id);assert.equal(result.confirmation,undefined,id);assert.equal(session.pending,null);
  assert.equal(runtime.stateHash(session.state),runtime.stateHash(checkpoint(id).state),id);
  const committed=runtime.serialize(session.state);assert.equal(session.request({type:'interact',entityId:id}).ok,false);assert.equal(runtime.serialize(session.state),committed);
  const restored=createForestPreviewSession(runtime,storage);assert.equal(runtime.serialize(restored.state),committed);assert.equal(restored.pending,null);
 }
});

test('B all battles and costly or irreversible choices retain numeric previews and explicit confirmation',()=>{
 for(const id of ['b01.timberPuppet','b05.valve','b13.coatShop','b17.warmgreenhouse','b26.confirmHeat.5','b28.serviceLever','b28.stopMainValve','b30.together']){
  const s=checkpoint(id).before,view=forestActionView(runtime,story,s,{type:'interact',entityId:id});assert.equal(view.requiresConfirmation,true,id);assert.equal(view.preview.legal,true,id);
 }
 const battle=forestActionView(runtime,story,checkpoint('b01.timberPuppet').before,{type:'interact',entityId:'b01.timberPuppet'});assert.match(battle.details.join(),/固定损伤 12/);
 const warm=forestActionView(runtime,story,checkpoint('b17.warmgreenhouse').before,{type:'interact',entityId:'b17.warmgreenhouse'});assert.match(warm.details.join(),/暖脂 -2/);assert.match(warm.details.join(),/不可取回/);
});

test('B side-root and original-road construction are distinct and never narrated early',()=>{
 const state=checkpoint('b07.originalEnemy').before,actions=forestRegionActions(runtime,story,state);
 assert.ok(actions.some(a=>a.entity?.id==='b07.fixRoot'));assert.ok(actions.some(a=>a.entity?.id==='b07.originalEnemy'));
 assert.ok(!actions.some(a=>/\.originalWorks|\.rootWorks/.test(a.entity?.id??'')));
 assert.match(actions.find(a=>a.entity?.id==='b07.originalEnemy').details.join(),/还要清残件、修栏和试车/);
 assert.match(actions.find(a=>a.entity?.id==='b07.fixRoot').details.join(),/仅.*人行|先开放人行/);
 assert.equal(forestActionVisible(runtime,checkpoint('b07.originalWorks').before,runtime.entity('b07.originalWorks')),true);
 assert.match(forestActionResult(runtime,{entityId:'b07.fixRoot'}),/现在只能步行/);
});

test('B pause, skip, unread choices and refresh do not make a conversation choice or change game state',()=>{
 const {session:s,storage}=sessionAt(checkpoint('b02.winterPlan').state),initial=runtime.serialize(s.state);
 while(s.current()?.sceneId!=='b02_choice')assert.equal(s.skip(),true);
 s.skip();assert.ok(s.turn().choices?.length);assert.equal(s.advance(),false);s.pause();s.resume();
 const restored=createForestPreviewSession(runtime,storage);assert.deepEqual(restored.presentation,s.presentation);assert.equal(runtime.serialize(restored.state),initial);
 const choice=restored.turn().choices[0];assert.equal(restored.respond(choice.id).ok,true);assert.equal(runtime.serialize(restored.state),initial);assert.equal(restored.respond(choice.id).ok,false);
 assert.equal(forestChoicePrompt({sceneId:'b02_choice',choices:[{presentationOnly:true}]}),'你想怎么回答？');
 assert.doesNotMatch(forestChoicePrompt({sceneId:'b30_relationship_offer',choices:[{presentationOnly:false}]}),/消耗|消费/);
});

test('B route guide retains the complete mechanical checklist in player language',()=>{
 const state=checkpoint('b03.heatBox').state,b=story.budget(state),before=runtime.serialize(state);
 assert.equal(b.boxTotal,8);assert.equal(b.requiredValveReserve,4);assert.deepEqual(b.points.map(p=>p.cost),[2,1,2]);assert.equal(b.wedges.total,2);assert.deepEqual(b.wedges.sites.map(p=>p.site),[7,16,21,24]);
 const missing=forestChecklist(runtime,state,runtime.spec.semantics.readyRequirements);assert.equal(missing.length,runtime.spec.semantics.readyRequirements.length);
 assert.doesNotMatch(missing.map(m=>m.text).join(),/请先完成：/);
 assert.equal(runtime.serialize(state),before);assert.equal(runtime.identity.contentHash,'a12cd07ee1ccc762');
 for(const cp of route.checkpoints){const entity=runtime.entity(cp.entityId);assert.equal(forestActionVisible(runtime,cp.before,entity),true,cp.entityId);assert.equal(runtime.entity(cp.entityId),entity);assert.ok(forestPlayerCopy(entity).title);}
});
