import {CENWEI_CONTENT} from './cenwei-content.js';
// Cenwei-only stage shape, exact-parity tested against frozen R5 presentation.
function forestTurnStage(sceneId,turn){const source=CENWEI_CONTENT.scenes[sceneId];return {locationId:source.regionId,actors:{},offscreen:{},camera:'optional-portrait-only',portraitAllowed:Boolean(turn.portrait),backdropAssetId:source.backdropAssetId,cgAssetId:null,assetStatus:'pending-validation',clearActors:true,allowImplicitHero:false,allowLegacyBackdropFallback:false,backgroundUrl:null,cgUrl:null,winterClothing:null};}

// Authored-data projection only. This module has no game state, runtime, session,
// persistence adapter, URL input, completion flags, action callbacks, or I/O.
export const WAIT_SCENE='b06_cenwei_wait', GREETING_SCENE='b05_cenwei_greeting';
export const PREVIEW_CHOICES=Object.freeze(CENWEI_CONTENT.scenes[WAIT_SCENE].choices.map(c=>Object.freeze({...c})));
const copy=value=>structuredClone(value);
function validate(sceneId,response){
 if(![WAIT_SCENE,GREETING_SCENE].includes(sceneId))throw Error('Unknown preview scene');
 if(response!==null&&!PREVIEW_CHOICES.some(c=>c.id===response))throw Error('Unknown preview response');
}
export function projectCenweiScene(sceneId,response=null){
 validate(sceneId,response);
 const source=CENWEI_CONTENT.scenes[sceneId],branch=sceneId===GREETING_SCENE?(response??'unmet'):response;
 const turns=source.turns.filter(t=>t.branch==='common'||t.branch===branch).map(t=>{const stage=forestTurnStage(sceneId,t,{});return {...copy(t),stage,...(!stage.portraitAllowed?{portrait:null,voicePortrait:t.portrait}:{}),presentationOnly:true};});
 const choices=sceneId===WAIT_SCENE&&!response?copy(source.choices):[];
 if(choices.length)turns.at(-1).choices=copy(choices);
 return {id:sceneId,sceneId,title:source.title,turns,choices,source:copy(source.source),branch,phase:null,presentationOnly:true,allowLegacyBackdropFallback:false,backdropAssetId:source.backdropAssetId,reviewMode:false};
}
const choiceIndex=CENWEI_CONTENT.scenes[WAIT_SCENE].turns.filter(t=>t.branch==='common').length-1;
export function createCenweiPreview(){
 let scene=null,index=0,response=null,revision=0;
 function build(sceneId,nextResponse){
  scene=projectCenweiScene(sceneId,nextResponse);response=nextResponse;
  // Match the authored response queue's prompt record so reader history can
  // describe the simulated choice, without creating a saved response key.
  if(sceneId===WAIT_SCENE&&response){scene.turns[choiceIndex].choices=copy(PREVIEW_CHOICES);scene.turns[choiceIndex].choiceResolved=response;}
 }
 const matches=token=>token===revision&&scene!==null;
 function snapshot(){return {revision,index,response,scene:copy(scene),turn:copy(scene?.turns[index]??null),atChoice:scene?.sceneId===WAIT_SCENE&&index===choiceIndex,atEnd:!!scene&&index===scene.turns.length-1,canNext:!!scene&&index<scene.turns.length-1,canBack:!!scene&&index>0};}
 return Object.freeze({
  snapshot,
  open(sceneId=WAIT_SCENE,nextResponse=null){validate(sceneId,nextResponse);build(sceneId,nextResponse);index=0;revision++;return snapshot();},
  next(token){if(!matches(token)||index>=scene.turns.length-1)return false;index++;revision++;return true;},
  back(token){if(!matches(token)||index===0)return false;index--;revision++;return true;},
  choose(choice,token){if(!matches(token)||scene.sceneId!==WAIT_SCENE||index!==choiceIndex||!PREVIEW_CHOICES.some(c=>c.id===choice)||choice===response)return false;build(WAIT_SCENE,choice);revision++;return true;},
  reunion(token){if(!matches(token)||scene.sceneId!==WAIT_SCENE||!response||index!==scene.turns.length-1)return false;build(GREETING_SCENE,response);index=0;revision++;return true;},
  close(){scene=null;index=0;response=null;revision++;},
 });
}
