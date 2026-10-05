import {STORY_SOURCE} from './story-data.mjs';
const copy=value=>structuredClone(value);
const freeze=value=>{if(value&&typeof value==='object'){for(const v of Object.values(value))freeze(v);Object.freeze(value);}return value;};
freeze(STORY_SOURCE);
// These are explicit editorial scenarios, never inferred from user/game state.
export const SCENARIOS=freeze([
 {id:'portrait_check',title:'冠蛾发言摘读',description:'原候选的两句初遇发言，用于检查小头像接线'},
 {id:'intro',title:'石坎旁的初遇',description:'候选初遇全文；不开始战斗'},
 {id:'after_hurt',title:'假设驱离后 · 有损伤',description:'只试读既有有损伤文案，不计算或修改生命'},
 {id:'after_unhurt',title:'假设驱离后 · 无损伤',description:'只试读既有无损伤文案，不计算或修改生命'},
 {id:'leave',title:'假设先回货道',description:'只试读既有离开文案，不记录选择'},
]);
const sources={
 portrait_check:STORY_SOURCE.commonBefore.filter(t=>t.speakerIdentity?.formId==='BBOSS-001-ANTHRO'),
 intro:STORY_SOURCE.commonBefore,
 after_hurt:[...STORY_SOURCE.afterStart,STORY_SOURCE.afterHealthVariant.damage_positive,...STORY_SOURCE.afterEnd],
 after_unhurt:[...STORY_SOURCE.afterStart,STORY_SOURCE.afterHealthVariant.damage_zero,...STORY_SOURCE.afterEnd],
 leave:STORY_SOURCE.stateVariants.leave_before_confirm,
};
const sourceTurns=new Map(Object.values(sources).flat().map(t=>[t.id,t]));
export function isExactSourceTurn(turn){const source=sourceTurns.get(turn?.id);return !!source&&JSON.stringify(source)===JSON.stringify(turn);}
export function portraitRequestForTurn(turn){
 if(!isExactSourceTurn(turn)||!['before','after'].includes(turn.presentationPhase)||turn.speakerIdentity?.monsterId!=='BBOSS-001'||turn.speakerIdentity?.entityId!=='b06.sideTender'||turn.speakerIdentity?.formId!=='BBOSS-001-ANTHRO')return null;
 return Object.freeze({enemyId:'b06.sideTender',role:'portrait',view:'neutral',phase:turn.presentationPhase});
}
export function projectMothScene(id){
 const metadata=SCENARIOS.find(s=>s.id===id);if(!metadata)throw new Error('Unknown read-only preview scenario');
 return {...copy(metadata),sceneId:id,turns:copy(sources[id]),presentationOnly:true};
}
export function createMothPreview(){
 let scene=null,index=0,revision=0;
 const matches=token=>scene!==null&&token===revision;
 const snapshot=()=>({scene:copy(scene),turn:copy(scene?.turns[index]??null),index,revision,canNext:!!scene&&index<scene.turns.length-1,canBack:!!scene&&index>0,atEnd:!!scene&&index===scene.turns.length-1});
 return Object.freeze({snapshot,open(id='portrait_check'){scene=projectMothScene(id);index=0;revision++;return snapshot();},next(token){if(!matches(token)||index>=scene.turns.length-1)return false;index++;revision++;return true;},back(token){if(!matches(token)||index===0)return false;index--;revision++;return true;},close(){scene=null;index=0;revision++;}});
}
// Expression choice belongs only to this read-only art preview. Existing story
// source records are unchanged, and these mappings create no gameplay flags.
export function defaultExpressionForTurn(turn){
 if(!portraitRequestForTurn(turn))return null;
 return turn.presentationPhase==='after'?'gentle-smile':'alert';
}
