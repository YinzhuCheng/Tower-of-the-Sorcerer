import { createSaveRepository } from '../../core/campaign.js';
import { createForestStory, FOREST_STORY_CONTENT } from './story/index.js';
import { cleanForestAction, forestActionView, forestApproach } from './view.js';
import { forestOpeningRevision, NEW_OPENING_REVISION } from './story/opening-revision.js';
import { forestChoicePrompt } from './player-copy.js';
const copy=x=>structuredClone(x);
const empty=(fresh=false)=>({storyVersion:FOREST_STORY_CONTENT.id,...(fresh?{openingRevision:NEW_OPENING_REVISION}:{}),seenIds:[],queue:[],turnIndex:0,paused:false});
export function validForestPresentation(p){
 if(p==null)return true;
 return typeof p==='object'&&!Array.isArray(p)&&p.storyVersion===FOREST_STORY_CONTENT.id&&Array.isArray(p.seenIds)&&p.seenIds.every(x=>typeof x==='string')&&new Set(p.seenIds).size===p.seenIds.length&&Array.isArray(p.queue)&&p.queue.every(scene=>FOREST_STORY_CONTENT.scenes[scene.sceneId]&&typeof scene.title==='string'&&Array.isArray(scene.turns)&&scene.turns.length>0&&scene.turns.every(turn=>typeof turn.id==='string'&&typeof turn.text==='string'&&(!turn.choices||Array.isArray(turn.choices))))&&Number.isInteger(p.turnIndex)&&p.turnIndex>=0&&(p.queue.length?p.turnIndex<p.queue[0].turns.length:p.turnIndex===0)&&typeof p.paused==='boolean';
}
export function createForestPreviewSession(runtime,storage,{extension=null}={}){
 const repo=createSaveRepository(storage,runtime,{validatePresentation:validForestPresentation});
 let restored;try{restored=repo.restore();}catch(error){restored={state:null,presentation:null,source:null,issues:[{reason:`读取或备份存档失败，未覆盖原档：${error.message}`}],allowAutoSave:false};}
 let state=restored.state??runtime.initialState(),presentation=restored.presentation??empty(!restored.state),allowAutoSave=restored.allowAutoSave,pending=null;
 const routing=forestOpeningRevision(presentation,{fresh:!restored.state});
 let openingRevision=routing.revision??NEW_OPENING_REVISION,story=createForestStory(runtime,{openingRevision}),compatibilityFailure=routing.ok?null:routing;
 const issues=[...restored.issues],blockedSlots=new Set();
 if(compatibilityFailure){blockedSlots.add(restored.source);allowAutoSave=false;issues.push({...compatibilityFailure,slot:restored.source});}
 // Protect even an unselected compatible-envelope slot before Save can overwrite it.
 for(const slot of ['auto','manual'])if(slot!==restored.source){try{const info=repo.inspect(slot);if(info.status==='valid'){const route=forestOpeningRevision(info.presentation);if(!route.ok){blockedSlots.add(slot);issues.push({...route,slot});}const fine=extension?.validateRestore(info.state,info.presentation);if(fine&&!fine.ok){blockedSlots.add(slot);issues.push({...fine,slot});}}}catch{/* Existing repository failure reporting remains authoritative. */}}
 const extensionStatus=extension?.validateRestore(state,presentation);
 if(extensionStatus&&!extensionStatus.ok){compatibilityFailure=extensionStatus;blockedSlots.add(restored.source);allowAutoSave=false;issues.push({...extensionStatus,slot:restored.source});}
 if(!compatibilityFailure)extension?.afterRestore(state,presentation);
 const instance=globalThis.crypto?.randomUUID?.()??`session-${Date.now()}-${Math.random()}`;let generation=0;
 const blocked=()=>compatibilityFailure?{...compatibilityFailure}:null;
 function persist(slot='auto'){if(compatibilityFailure||blockedSlots.has(slot))return false;if(slot==='auto'&&!allowAutoSave)return false;try{const captured=extension?.capture(state,presentation);if(captured&&!captured.ok)return false;if(captured)presentation=captured.presentation;repo.save(slot,state,presentation);return true;}catch(error){issues.push({reason:`无法保存：${error.message}`});return false;}}
 function enqueue(result){presentation.seenIds=result.seenIds;for(const scene of result.scenes){if(!scene.turns.length&&scene.choices.length)scene.turns=[{id:`ui:choice:${scene.id}`,kind:'choice-prompt',speaker:'你的选择',text:forestChoicePrompt(scene),choices:copy(scene.choices),presentationOnly:true}];if(scene.turns.length)presentation.queue.push(scene);}return result;}
 function current(){return compatibilityFailure?null:presentation.queue[0]??null;}
 function turn(){return current()?.turns[presentation.turnIndex]??null;}
 function isStoryOpen(){return Boolean(current()&&!presentation.paused);}
 function normalize(){while(current()&&presentation.turnIndex>=current().turns.length){presentation.queue.shift();presentation.turnIndex=0;}if(!current())presentation.turnIndex=0;}
 function reconcileChoices(){
  const previous=current(),previousTurn=turn();
  for(const scene of presentation.queue){
   const choiceTurn=scene.turns.find(t=>t.choices?.some(c=>!c.presentationOnly)&&!t.choiceResolved);if(!choiceTurn)continue;
   const warm={b17_offer:'greenhouse',b18_offer:'pear',b19_offer:'lodge'}[scene.sceneId];
   const settled=warm?(state.flags[`b.warm.${warm}`]||state.flags['b26.heatPlanFrozen']):scene.sceneId==='b07_choice'?(state.flags['b07.rootFixed']||state.flags['b07.originalCleared']):scene.sceneId==='b26_review'?state.flags['b26.heatPlanFrozen']:scene.sceneId==='b30_relationship_offer'?state.flags['b30.epilogueComplete']:false;
   if(settled){scene.choices=[];if(choiceTurn.kind==='choice-prompt')scene.turns=scene.turns.filter(t=>t!==choiceTurn);else delete choiceTurn.choices;}
   else{try{const fresh=story.resolve(scene.sceneId,state);scene.choices=copy(fresh.choices);choiceTurn.choices=copy(fresh.choices);}catch{/* Historical prose remains readable if no new choice is available. */}}
  }
  presentation.queue=presentation.queue.filter(scene=>scene.turns.length);
  if(current()!==previous)presentation.turnIndex=0;else if(previousTurn&&current())presentation.turnIndex=Math.max(0,current().turns.indexOf(previousTurn));
  normalize();
 }
 function catchUp(){enqueue(story.location(state,{seenIds:presentation.seenIds}));if(state.victory)enqueue(story.epilogue(state,{seenIds:presentation.seenIds}));reconcileChoices();}
 function commit(action,{internal=false}={}){
  if(compatibilityFailure)return blocked();
  if(!internal&&(pending||isStoryOpen()))return {ok:false,reason:'请先处理眼前的对话或确认'};
  const before=state,result=runtime.dispatch(state,action);if(!result.ok)return result;
  state=result.state;
  enqueue(story.fromDispatch({stateBefore:before,stateAfter:state,events:result.events,receipt:result.receipt,seenIds:presentation.seenIds}));
  reconcileChoices();persist();return result;
 }
 function request(input,{fromChoice=false}={}){
  if(compatibilityFailure)return blocked();
  if(pending)return {ok:false,reason:'已有一项操作等待确认'};
  if(isStoryOpen()&&!fromChoice)return {ok:false,reason:'请先读完对话或返回地图'};
  if(fromChoice&&!turn()?.choices?.some(c=>c.action?.entityId===input.entityId||c.actions?.some(p=>p.action.entityId===input.entityId)))return {ok:false,reason:'这不是当前对话中的操作'};
  const view=forestActionView(runtime,story,state,input);if(!view.preview.legal)return {ok:false,reason:view.details.at(-1)};
  if(!view.requiresConfirmation)return commit(view.action,{internal:fromChoice});
  pending={action:view.action,fromChoice,token:`${instance}:${++generation}:${state.revision}`};return {ok:true,confirmation:true,...view,confirmationToken:pending.token};
 }
 function confirm(token){if(compatibilityFailure)return blocked();if(token!==undefined&&token!==pending?.token)return{ok:false,reason:'stale-confirmation'};const held=pending;pending=null;if(!held)return{ok:false,reason:'没有待确认的操作'};return commit(held.action,{internal:true});}
 function cancel(){generation++;pending=null;}
 function advance(){if(compatibilityFailure||pending)return false;if(turn()?.choices?.length&&!turn().choiceResolved)return false;presentation.turnIndex++;normalize();persist();return true;}
 function skip(){if(compatibilityFailure||pending)return false;const scene=current();if(!scene)return false;const index=scene.turns.findIndex((t,i)=>i>=presentation.turnIndex&&t.choices?.length&&!t.choiceResolved);presentation.turnIndex=index>=0?index:scene.turns.length;normalize();persist();return true;}
 function respond(choiceId){if(compatibilityFailure)return blocked();if(pending)return {ok:false,reason:'请先处理确认'};const scene=current(),t=turn(),choice=t?.choices?.find(c=>c.id===choiceId);if(!choice?.presentationOnly||t.choiceResolved)return{ok:false,reason:'这项选择须在现场实际完成'};
  try{const response=story.response(scene.sceneId,choice.id,state),seen=new Set(presentation.seenIds),newTurns=response.turns.filter(t=>!seen.has(t.id));t.choiceResolved=choice.id;newTurns.forEach(t=>seen.add(t.id));seen.add(`${scene.sceneId}|${choice.id}|`);presentation.seenIds=[...seen];scene.turns.splice(presentation.turnIndex+1,0,...newTurns);persist();return {ok:true};}catch(error){return{ok:false,reason:error.message};}}
 function approachChoice(input){
  if(compatibilityFailure)return blocked();
  if(pending)return{ok:false,reason:'请先处理确认'};
  if(!turn()?.choices?.some(c=>c.action?.entityId===input.entityId||c.actions?.some(p=>p.action.entityId===input.entityId)))return{ok:false,reason:'这不是当前对话中的操作'};
  const path=forestApproach(runtime,state,input.entityId);if(path==null)return{ok:false,reason:'目前没有安全路线到达；先从地图处理挡路机关或敌人'};
  for(const action of path){const result=commit(action,{internal:true});if(!result.ok)return result;}return{ok:true};
 }
 function load(slot){cancel();extension?.beforeLoad();try{const info=repo.inspect(slot);if(info.status!=='valid'){pending=null;if(info.status==='invalid'){const recovery=repo.restore({preferred:slot,fallback:null});issues.push(...recovery.issues);}return{ok:false,reason:info.status==='missing'?'这个位置还没有存档':'存档无法读取，原始内容已保留'};}
  const route=forestOpeningRevision(info.presentation);if(!route.ok){blockedSlots.add(slot);issues.push({...route,slot});return route;}
  const fine=extension?.validateRestore(info.state,info.presentation);if(fine&&!fine.ok){blockedSlots.add(slot);issues.push({...fine,slot});return fine;}
  pending=null;state=info.state;presentation=info.presentation??empty();openingRevision=route.revision;story=createForestStory(runtime,{openingRevision});compatibilityFailure=null;allowAutoSave=true;extension?.afterRestore(state,presentation);catchUp();persist();return{ok:true};}catch(error){pending=null;return{ok:false,reason:`读取或备份存档失败，未覆盖原档：${error.message}`};}}
 function restart(){cancel();extension?.beforeLoad();pending=null;compatibilityFailure=null;blockedSlots.delete('auto');state=runtime.initialState();presentation=empty(true);openingRevision=NEW_OPENING_REVISION;story=createForestStory(runtime,{openingRevision});allowAutoSave=true;extension?.afterRestore(state,presentation);catchUp();persist();}
 function revisit(sceneId){if(compatibilityFailure)return blocked();if(pending||current())return{ok:false,reason:'请先处理眼前的对话'};try{const scene=story.revisit(sceneId,state);if(!scene.turns.length)return{ok:false,reason:scene.stateNotice??'这里的施工还没有完成'};presentation.queue.unshift(scene);presentation.turnIndex=0;presentation.paused=false;persist();return{ok:true};}catch(error){return{ok:false,reason:error.message};}}
 if(!compatibilityFailure){catchUp();persist();}
 return Object.freeze({runtime,get story(){return story;},get openingRevision(){return openingRevision;},get compatibilityFailure(){return copy(compatibilityFailure);},repo,restored,get state(){return state;},get presentation(){return presentation;},get pending(){return pending;},get issues(){return copy(issues);},current,turn,isStoryOpen,request,confirm,cancel,advance,skip,respond,approachChoice,load,restart,revisit,save:()=>persist('manual'),saveAuto:()=>persist('auto'),pause(){if(compatibilityFailure||pending)return false;presentation.paused=true;persist();return true;},resume(){if(compatibilityFailure)return false;presentation.paused=false;normalize();persist();},move(action){if(action.type!=='move')return{ok:false,reason:'请通过操作面板继续'};return commit(cleanForestAction(action));}});
}
