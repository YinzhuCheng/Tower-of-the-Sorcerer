import {fineForestPose,validateFineForestPose,hasFineForest} from './forest-fine-navigation.js';
const own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k);
export const fineStoryDigest=(runtime,presentation)=>{const p=structuredClone(presentation??{});delete p.finePose;return runtime.stateHash(p);};
// This extension participates in the existing atomic campaign+story envelope.
// It neither writes a parallel campaign slot nor dispatches a reducer action.
export function createFineForestSaveExtension(runtime){
 let readPose=null,barrier=()=>{},replace=()=>{},restoredPose=null,lastFailure=null;
 function validateRestore(state,presentation){
  if(!own(presentation,'finePose')){
   if(!hasFineForest(state.location.regionId))return{ok:true};
   return validateFineForestPose(runtime,state,fineForestPose(runtime,state));
  }
  const pose=presentation.finePose,result=validateFineForestPose(runtime,state,pose);
  if(!result.ok)return result;
  if(pose.presentationHash!==fineStoryDigest(runtime,presentation))return{ok:false,code:'fine-pose-compatibility',reason:'Fine pose does not match the saved story envelope'};
  return{ok:true};
 }
 function capture(state,presentation){
  if(!hasFineForest(state.location.regionId))return{ok:true,presentation:(()=>{const p=structuredClone(presentation);delete p.finePose;return p;})()};
  // A bind may precede its first geometry sync. Preserve an exact restored offset
  // until a live pose is available; the state hash prevents stale-pose reuse.
  const physical=readPose?.(),fallback=restoredPose&&validateFineForestPose(runtime,state,restoredPose).ok?restoredPose:fineForestPose(runtime,state),result=physical??{ok:true,value:fallback};
  if(!result.ok){lastFailure=result.reason;return result;}
  const checked=validateFineForestPose(runtime,state,result.value);if(!checked.ok){lastFailure=checked.reason;return checked;}
  lastFailure=null;return{ok:true,presentation:{...structuredClone(presentation),finePose:{...result.value,presentationHash:fineStoryDigest(runtime,presentation)}}};
 }
 return{validateRestore,capture,get lastFailure(){return lastFailure;},get restoredPose(){return structuredClone(restoredPose);},bind({pose,beforeLoad,afterLoad}){readPose=pose;barrier=beforeLoad;replace=afterLoad;},beforeLoad(){barrier();},afterRestore(state,presentation){restoredPose=own(presentation,'finePose')?structuredClone(presentation.finePose):null;replace(state,restoredPose);}};
}
