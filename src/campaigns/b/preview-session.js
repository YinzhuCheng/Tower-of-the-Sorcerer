import { createSaveRepository } from '../../core/campaign.js';
import { createForestStory, FOREST_STORY_CONTENT } from './story/index.js';
import { cleanForestAction, forestActionView, forestApproach } from './view.js';
const copy=x=>structuredClone(x);
const empty=()=>({storyVersion:FOREST_STORY_CONTENT.id,seenIds:[],queue:[],turnIndex:0,paused:false});
export function validForestPresentation(p){
 if(p==null)return true;
 return p.storyVersion===FOREST_STORY_CONTENT.id&&Array.isArray(p.seenIds)&&p.seenIds.every(x=>typeof x==='string')&&new Set(p.seenIds).size===p.seenIds.length&&Array.isArray(p.queue)&&p.queue.every(scene=>FOREST_STORY_CONTENT.scenes[scene.sceneId]&&typeof scene.title==='string'&&Array.isArray(scene.turns)&&scene.turns.length>0&&scene.turns.every(turn=>typeof turn.id==='string'&&typeof turn.text==='string'&&(!turn.choices||Array.isArray(turn.choices))))&&Number.isInteger(p.turnIndex)&&p.turnIndex>=0&&(p.queue.length?p.turnIndex<p.queue[0].turns.length:p.turnIndex===0)&&typeof p.paused==='boolean';
}
export function createForestPreviewSession(runtime,storage){
 const story=createForestStory(runtime),repo=createSaveRepository(storage,runtime,{validatePresentation:validForestPresentation});
 let restored;try{restored=repo.restore();}catch(error){restored={state:null,presentation:null,source:null,issues:[{reason:`读取或备份存档失败，未覆盖原档：${error.message}`}],allowAutoSave:false};}
 let state=restored.state??runtime.initialState(),presentation=restored.presentation??empty(),allowAutoSave=restored.allowAutoSave,pending=null;
 const issues=[...restored.issues];
 function persist(slot='auto'){if(slot==='auto'&&!allowAutoSave)return false;try{repo.save(slot,state,presentation);return true;}catch(error){issues.push({reason:`无法保存：${error.message}`});return false;}}
 function enqueue(result){presentation.seenIds=result.seenIds;for(const scene of result.scenes){if(!scene.turns.length&&scene.choices.length)scene.turns=[{id:`ui:choice:${scene.id}`,kind:'choice-prompt',speaker:'你的选择',text:'请在下方选择；实际消耗会在执行前再次确认',choices:copy(scene.choices),presentationOnly:true}];if(scene.turns.length)presentation.queue.push(scene);}return result;}
 function current(){return presentation.queue[0]??null;}
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
  if(!internal&&(pending||isStoryOpen()))return {ok:false,reason:'请先处理眼前的对话或确认'};
  const before=state,result=runtime.dispatch(state,action);if(!result.ok)return result;
  state=result.state;
  enqueue(story.fromDispatch({stateBefore:before,stateAfter:state,events:result.events,receipt:result.receipt,seenIds:presentation.seenIds}));
  reconcileChoices();persist();return result;
 }
 function request(input,{fromChoice=false}={}){
  if(pending)return {ok:false,reason:'已有一项操作等待确认'};
  if(isStoryOpen()&&!fromChoice)return {ok:false,reason:'请先读完对话或返回地图'};
  if(fromChoice&&!turn()?.choices?.some(c=>c.action?.entityId===input.entityId||c.actions?.some(p=>p.action.entityId===input.entityId)))return {ok:false,reason:'这不是当前对话中的操作'};
  const view=forestActionView(runtime,story,state,input);if(!view.preview.legal)return {ok:false,reason:view.details.at(-1)};
  if(!view.requiresConfirmation)return commit(view.action,{internal:fromChoice});
  pending={action:view.action,fromChoice};return {ok:true,confirmation:true,...view};
 }
 function confirm(){const held=pending;pending=null;if(!held)return{ok:false,reason:'没有待确认的操作'};return commit(held.action,{internal:true});}
 function cancel(){pending=null;}
 function advance(){if(pending)return false;if(turn()?.choices?.length&&!turn().choiceResolved)return false;presentation.turnIndex++;normalize();persist();return true;}
 function skip(){if(pending)return false;const scene=current();if(!scene)return false;const index=scene.turns.findIndex((t,i)=>i>=presentation.turnIndex&&t.choices?.length&&!t.choiceResolved);presentation.turnIndex=index>=0?index:scene.turns.length;normalize();persist();return true;}
 function respond(choiceId){if(pending)return {ok:false,reason:'请先处理确认'};const scene=current(),t=turn(),choice=t?.choices?.find(c=>c.id===choiceId);if(!choice?.presentationOnly||t.choiceResolved)return{ok:false,reason:'这项选择须在现场实际完成'};
  try{const response=story.response(scene.sceneId,choice.id,state),seen=new Set(presentation.seenIds),newTurns=response.turns.filter(t=>!seen.has(t.id));t.choiceResolved=choice.id;newTurns.forEach(t=>seen.add(t.id));seen.add(`${scene.sceneId}|${choice.id}|`);presentation.seenIds=[...seen];scene.turns.splice(presentation.turnIndex+1,0,...newTurns);persist();return {ok:true};}catch(error){return{ok:false,reason:error.message};}}
 function approachChoice(input){
  if(pending)return{ok:false,reason:'请先处理确认'};
  if(!turn()?.choices?.some(c=>c.action?.entityId===input.entityId||c.actions?.some(p=>p.action.entityId===input.entityId)))return{ok:false,reason:'这不是当前对话中的操作'};
  const path=forestApproach(runtime,state,input.entityId);if(path==null)return{ok:false,reason:'目前没有安全路线到达；先从地图处理挡路机关或敌人'};
  for(const action of path){const result=commit(action,{internal:true});if(!result.ok)return result;}return{ok:true};
 }
 function load(slot){pending=null;try{const info=repo.inspect(slot);if(info.status!=='valid'){if(info.status==='invalid'){const recovery=repo.restore({preferred:slot,fallback:null});issues.push(...recovery.issues);}return{ok:false,reason:info.status==='missing'?'这个位置还没有存档':'存档无法读取，原始内容已保留'};}
  state=info.state;presentation=info.presentation??empty();allowAutoSave=true;catchUp();persist();return{ok:true};}catch(error){return{ok:false,reason:`读取或备份存档失败，未覆盖原档：${error.message}`};}}
 function restart(){pending=null;state=runtime.initialState();presentation=empty();allowAutoSave=true;catchUp();persist();}
 function revisit(sceneId){if(pending||current())return{ok:false,reason:'请先处理眼前的对话'};try{const scene=story.revisit(sceneId,state);if(!scene.turns.length)return{ok:false,reason:scene.stateNotice??'这里的施工还没有完成'};presentation.queue.unshift(scene);presentation.turnIndex=0;presentation.paused=false;persist();return{ok:true};}catch(error){return{ok:false,reason:error.message};}}
 catchUp();persist();
 return Object.freeze({runtime,story,repo,restored,get state(){return state;},get presentation(){return presentation;},get pending(){return pending;},get issues(){return copy(issues);},current,turn,isStoryOpen,request,confirm,cancel,advance,skip,respond,approachChoice,load,restart,revisit,save:()=>persist('manual'),pause(){if(pending)return false;presentation.paused=true;persist();return true;},resume(){presentation.paused=false;normalize();persist();},move(action){if(action.type!=='move')return{ok:false,reason:'请通过操作面板继续'};return commit(cleanForestAction(action));}});
}
