import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync,readdirSync } from 'node:fs';
import { createCampaign,createSaveRepository } from '../src/core/campaign.js';
import { createForestCampaign,createForestSpec } from '../src/campaigns/b/content.js';
import { buildForestWitness,forestPathToEntity } from '../src/campaigns/b/witness.js';
import { createForestStory,FOREST_STORY_CONTENT as C } from '../src/campaigns/b/story/index.js';
import { createForestPreviewSession,validForestPresentation } from '../src/campaigns/b/preview-session.js';
import { forestApproach,forestWalkPath,forestActionView,forestPublicRows,forestRegionActions } from '../src/campaigns/b/view.js';
import { replayCampaignCertificate } from '../src/solver/campaign-replay.js';
const memory=()=>{const entries=new Map(),writes=[];return {entries,writes,getItem:key=>entries.get(key)??null,setItem(key,value){entries.set(key,value);writes.push([key]);},removeItem:key=>entries.delete(key)};};
const runtime=createForestCampaign(),story=createForestStory(runtime),base=buildForestWitness({runtime}),roots=buildForestWitness({runtime,wedges:[7,16]});
const checkpoint=(id,w=base)=>w.checkpoints.find(p=>p.entityId===id);
const empty=()=>({storyVersion:C.id,seenIds:[],queue:[],turnIndex:0,paused:false});
function at(state){const storage=memory(),repo=createSaveRepository(storage,runtime);repo.save('auto',state,empty());return{session:createForestPreviewSession(runtime,storage),storage};}
function drain(session){let limit=3000;session.resume();while(session.current()&&limit--){const t=session.turn();if(t.choices?.length&&!t.choiceResolved){const response=t.choices.find(c=>c.presentationOnly);if(!response){session.pause();return;}assert.equal(session.respond(response.id).ok,true);}assert.equal(session.advance(),true);}assert.ok(limit>0);}

test('B preview blocks keyboard, map and requests behind story and confirmation',()=>{
 const storage=memory(),s=createForestPreviewSession(runtime,storage),initial=runtime.stateHash(s.state);assert.equal(s.isStoryOpen(),true);assert.equal(s.move({type:'move',direction:'right'}).ok,false);assert.equal(s.request({type:'interact',entityId:'b01.timberPuppet'}).ok,false);assert.equal(runtime.stateHash(s.state),initial);
 s.pause();assert.equal(s.move({type:'move',direction:'right'}).ok,true);assert.equal(s.move({type:'move',direction:'right'}).ok,true);
 const before=runtime.stateHash(s.state),request=s.request({type:'interact',entityId:'b01.timberPuppet'});assert.equal(request.confirmation,true);assert.equal(s.move({type:'move',direction:'right'}).ok,false);assert.equal(s.request({type:'interact',entityId:'b01.timberPuppet'}).ok,false);assert.equal(runtime.stateHash(s.state),before);
});

test('B confirmation cancel changes neither game nor narrative and repeated confirm pays once',()=>{
 for(const id of ['b03.heatBox','b13.coatShop','b17.warmgreenhouse','b26.confirmHeat.5','b30.together']){
 const{session:s,storage}=at(checkpoint(id).before);s.pause();const raw=runtime.serialize(s.state),presentation=JSON.stringify(s.presentation),saved=storage.getItem(s.repo.key('auto'));
 assert.equal(s.request({type:'interact',entityId:id}).confirmation,true,id);s.cancel();assert.equal(runtime.serialize(s.state),raw);assert.equal(JSON.stringify(s.presentation),presentation);assert.equal(storage.getItem(s.repo.key('auto')),saved);
 assert.equal(s.confirm().ok,false);assert.equal(s.request({type:'interact',entityId:id}).confirmation,true);assert.equal(s.confirm().ok,true);const committed=runtime.serialize(s.state);assert.equal(s.confirm().ok,false);assert.equal(runtime.serialize(s.state),committed);s.pause();assert.equal(s.request({type:'interact',entityId:id}).ok,false);assert.equal(runtime.serialize(s.state),committed);
 }
});

test('B warm and ending choices use actual reducer, pure responses and defer never write resources',()=>{
 const{session:s}=at(checkpoint('b17.warmgreenhouse').before);while(s.current()?.sceneId!=='b17_offer'){if(!s.current())throw Error('offer missing');s.skip();}
 while(!s.turn().choices)s.advance();const before=runtime.serialize(s.state);assert.equal(s.advance(),false);s.skip();assert.ok(s.turn().choices);assert.equal(s.respond('invest').ok,false);assert.equal(runtime.serialize(s.state),before);assert.equal(s.respond('defer').ok,true);assert.equal(runtime.serialize(s.state),before);
 const again=at(checkpoint('b17.warmgreenhouse').before).session;while(again.current()?.sceneId!=='b17_offer')again.skip();while(!again.turn().choices)again.advance();assert.equal(again.request({type:'interact',entityId:'b17.warmgreenhouse'},{fromChoice:true}).confirmation,true);again.cancel();assert.ok(again.turn().choices);assert.equal(again.request({type:'interact',entityId:'b17.warmgreenhouse'},{fromChoice:true}).confirmation,true);assert.equal(again.confirm().ok,true);assert.equal(again.state.resources.heat,checkpoint('b17.warmgreenhouse').state.resources.heat);assert.ok(!again.presentation.queue.some(scene=>scene.choices.some(c=>c.action?.entityId==='b17.warmgreenhouse')));
});

test('B scene choice approach walks only safe cells and never executes the selected operation',()=>{
 const{session:s}=at(checkpoint('b07.wedges').state);s.resume();let guard=500;while(s.current()?.sceneId!=='b07_choice'&&guard--)s.skip();while(!s.turn().choices)s.advance();const resources={...s.state.resources};const request={type:'interact',entityId:'b07.fixRoot'};assert.equal(s.approachChoice(request).ok,true);assert.deepEqual(s.state.resources,resources);assert.equal(s.state.flags['b07.rootFixed'],undefined);assert.equal(runtime.inReach(s.state,'b07.fixRoot'),true);assert.equal(s.request(request,{fromChoice:true}).confirmation,true);s.cancel();assert.equal(s.state.flags['b07.rootFixed'],undefined);
});

test('B state, source-turn cursor, queue, responses and paused state restore atomically',()=>{
 const storage=memory(),s=createForestPreviewSession(runtime,storage);s.advance();const wanted=structuredClone(s.presentation),state=runtime.stateHash(s.state);assert.equal(s.save(),true);const restored=createForestPreviewSession(runtime,storage);assert.equal(runtime.stateHash(restored.state),state);assert.deepEqual(restored.presentation,wanted);restored.pause();restored.move({type:'move',direction:'right'});assert.equal(restored.load('manual').ok,true);assert.deepEqual(restored.presentation,wanted);assert.equal(runtime.stateHash(restored.state),state);
 const raw=JSON.parse(storage.getItem(s.repo.key('manual')));assert.equal(raw.$campaignSave,1);assert.deepEqual(raw.presentation,wanted);assert.equal(runtime.stateHash(raw.state),state);
});

test('B reload discards uncommitted confirmation and preserves original corrupt bytes',()=>{
 const{session:s,storage}=at(checkpoint('b13.coatShop').before);s.pause();const state=runtime.stateHash(s.state);s.request({type:'interact',entityId:'b13.coatShop'});const recovered=createForestPreviewSession(runtime,storage);assert.equal(recovered.pending,null);assert.equal(runtime.stateHash(recovered.state),state);
 const broken=memory(),repo=createSaveRepository(broken,runtime);broken.setItem(repo.key('auto'),'{broken');const prior=broken.writes.length,load=createForestPreviewSession(runtime,broken);assert.equal(broken.getItem(repo.key('auto')),'{broken');assert.equal(load.restored.allowAutoSave,false);assert.ok(load.issues.length);assert.ok([...broken.entries].some(([key,value])=>key.includes('corrupt:')&&value==='{broken'));assert.equal(broken.writes.slice(prior).filter(([key])=>key===repo.key('auto')).length,0);
});

test('B presentation validates queue cursor and saves are campaign, difficulty and content isolated',()=>{
 const p=empty();assert.equal(validForestPresentation(p),true);for(const bad of [{...p,turnIndex:1},{...p,storyVersion:'other'},{...p,queue:[{sceneId:'unknown',title:'x',turns:[{id:'x',text:'x'}]}]},{...p,seenIds:['x','x']}])assert.equal(validForestPresentation(bad),false);
 const storage=memory(),normal=createSaveRepository(storage,runtime),spec=createForestSpec();normal.save('auto',checkpoint('b03.heatBox').state,p);for(const change of [{id:'other-campaign'},{difficulty:'hard'},{version:'other-version'}]){const other=createSaveRepository(storage,createCampaign({...spec,...change}));assert.notEqual(other.key('auto'),normal.key('auto'));assert.equal(other.inspect('auto').status,'missing');}
});

test('B safe path and all four double-route cuts cannot cross enemies or root gates',()=>{
 for(const n of [7,16,21,24]){const id=`b${String(n).padStart(2,'0')}`,s=checkpoint(`${id}.originalEnemy`).before,target=runtime.entity(`${id}.fixRoot`);const path=forestApproach(runtime,s,target.id);if(path){let state=s;for(const action of path){const next=runtime.dispatch(state,action);assert.equal(next.ok,true);assert.notDeepEqual([next.state.location.x,next.state.location.y],[target.x,target.y]);state=next.state;}}
 const far=runtime.region(s.location.regionId).arrival;assert.ok(forestWalkPath(runtime,s,far.x,far.y));}
 const fixed=checkpoint('b07.fixRoot',roots).state;assert.equal(forestPublicRows(runtime,story,fixed)[0].publicReady,false);assert.equal(forestPublicRows(runtime,story,fixed)[0].person,true);assert.equal(fixed.cleared.includes('b07.originalEnemy'),false);
});

test('B all region actions retain specific reasons, forecasts, actual portals and irreversible details',()=>{
 const s=checkpoint('b17.warmgreenhouse').before,warm=forestActionView(runtime,story,s,{type:'interact',entityId:'b17.warmgreenhouse'});assert.equal(warm.requiresConfirmation,true);assert.match(warm.details.join(),/不可取回/);assert.match(warm.details.join(),/四阀仍须保留 2/);
 const root=forestActionView(runtime,story,checkpoint('b07.fixRoot',roots).before,{type:'interact',entityId:'b07.fixRoot'});assert.match(root.details.join(),/原路敌人仍在/);
 const initial=runtime.initialState(),actions=forestRegionActions(runtime,story,initial);assert.ok(actions.find(a=>a.action.entityId==='b01.timberPuppet').details.join().includes('固定损伤'));assert.equal(runtime.spec.regions.length,30);assert.equal(runtime.spec.transitions.length,66);
 const edge=runtime.spec.transitions.find(e=>e.anchor===actions.find(a=>a.action.type==='traverse').anchor.id),entity=runtime.entity(edge.anchor),atEdge={...initial,location:{...initial.location,x:entity.x,y:entity.y}};assert.equal(forestActionView(runtime,story,atEdge,{type:'traverse',edgeId:edge.id}).requiresConfirmation,false);
});

test('B UI session replays every frozen certificate without changing any rule result',()=>{
 const files=readdirSync(new URL('../artifacts/campaigns/',import.meta.url)).filter(file=>/^b-normal-.*\.certificate\.json$/.test(file));assert.equal(files.length,16);
 for(const file of files){const certificate=JSON.parse(readFileSync(new URL(`../artifacts/campaigns/${file}`,import.meta.url)));assert.equal(replayCampaignCertificate(runtime,certificate).ok,true);const s=createForestPreviewSession(runtime,memory());s.pause();for(const step of certificate.steps){assert.equal(runtime.stateHash(s.state),step.before,file);let result=step.action.type==='move'?s.move(step.action):s.request(step.action);if(result.confirmation)result=s.confirm();assert.equal(result.ok,true,`${file}: ${JSON.stringify(step.action)} ${result.reason}`);assert.equal(runtime.stateHash(s.state),step.after,file);}assert.equal(s.state.victory,true);drain(s);assert.equal(s.current(),null,file);assert.equal(runtime.stateHash(s.state),certificate.steps.at(-1).after,file);assert.equal(validForestPresentation(s.presentation),true);}
});

test('B storage quota failure is visible and never silently resets an existing raw save',()=>{
 const entries=new Map(),normal=memory(),key=createSaveRepository(normal,runtime).key('auto');entries.set(key,'{bad');const storage={getItem:key=>entries.get(key)??null,setItem(){throw Error('quota full');},removeItem:key=>entries.delete(key)};const s=createForestPreviewSession(runtime,storage);assert.equal(s.restored.allowAutoSave,false);assert.match(s.issues[0].reason,/未覆盖原档/);assert.equal(entries.get(key),'{bad');assert.equal(s.save(),false);assert.match(s.issues.at(-1).reason,/无法保存/);
});

test('B runtime integration has portable imports, all DOM targets and no borrowed art or voyage controls',()=>{
 const html=readFileSync(new URL('../public/campaigns-b/index.html',import.meta.url),'utf8'),app=readFileSync(new URL('../public/campaigns-b/app.js',import.meta.url),'utf8'),css=readFileSync(new URL('../public/campaigns-b/styles.css',import.meta.url),'utf8'),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(new Set(ids).size,ids.length);for(const[,id]of app.matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.includes(id),id);assert.doesNotMatch(app,/assets\/anime|campaigns\/c\/|moveBallast|boat\.|setFlag|\bfetch\(/);assert.match(app,/dataset\.backdropAssetId/);assert.match(app,/dataset\.cgAssetId/);assert.match(app,/function gameBlocked/);assert.match(css,/max-width:680px/);assert.match(css,/dvh/);assert.match(html,/不是成品画面/);
});

test('B paused final review refreshes its real heat-confirmation action after a late warm investment',()=>{
 const witness=buildForestWitness({runtime,warmPoints:[],stopBefore:'b26.confirmHeat.0'}),{session:s}=at(witness.state);s.pause();const walkTo=id=>{for(const a of forestPathToEntity(runtime,s.state,id)){const r=a.type==='move'?s.move(a):s.request(a);assert.equal(r.ok,true);assert.equal(r.confirmation,undefined);}};
 assert.ok(s.presentation.queue.some(scene=>scene.sceneId==='b26_review'&&scene.choices.find(c=>c.id==='confirm')?.actions[0].entityId==='b26.confirmHeat.0'));
 walkTo('b17.warmgreenhouse');assert.equal(s.request({type:'interact',entityId:'b17.warmgreenhouse'}).confirmation,true);assert.equal(s.confirm().ok,true);walkTo('b26.confirmHeat.1');
 const review=s.presentation.queue.find(scene=>scene.sceneId==='b26_review');assert.equal(review.choices.find(c=>c.id==='confirm').actions[0].entityId,'b26.confirmHeat.1');assert.equal(s.state.flags['b26.heatPlanFrozen'],undefined);const before=runtime.stateHash(s.state);s.resume();assert.equal(runtime.stateHash(s.state),before);
});

test('B legacy completed saves catch up the actual ending and never offer an impossible new ending',()=>{
 const storage=memory(),repo=createSaveRepository(storage,runtime);repo.save('auto',base.state);const s=createForestPreviewSession(runtime,storage);assert.equal(s.state.victory,true);assert.ok(s.presentation.queue.some(scene=>scene.sceneId==='b30_end_together'));assert.ok(!s.presentation.queue.some(scene=>scene.turns.some(turn=>turn.choices?.some(c=>!c.presentationOnly))));
 const hash=runtime.stateHash(s.state);s.save();s.restart();assert.equal(s.state.revision,0);assert.equal(s.load('manual').ok,true);assert.equal(runtime.stateHash(s.state),hash);
});
