import {profileById} from './registry.js';
import {createProfileRuntime,verifyProfileRuntime} from './runtime.js';
import {createProfileRepository} from './persistence.js';
import {resolveBootSelection,selectionUrl} from './selection.js';
export async function prepareProfileSession({storage,url,selector,onSelected=()=>{},createRuntime=createProfileRuntime,verifyRuntime=verifyProfileRuntime}={}) {
  const resolved=resolveBootSelection(storage,url);
  let context=resolved.context??await selector.open({mandatory:true,error:resolved.error});
  if(!context)throw Error('尚未选择难度');
  let profile=profileById(context.profileId);
  // Runtime construction and restore happen only after a supported selection.
  let runtime,repo,restored;
  for(;;){
    runtime=createRuntime(profile.id);await verifyRuntime(runtime,profile);
    repo=createProfileRepository(storage,runtime,context);restored=repo.restore();
    if(restored.source||restored.issues.length===0)break;
    context=await selector.open({mandatory:true,initialId:profile.id,error:'这个航次没有兼容存档，原内容保持不变。请选择其他航次或另开新航次。'});
    if(!context)throw Error('没有可读取的兼容航次');
    profile=profileById(context.profileId);
  }
  await onSelected(selectionUrl(url,context));
  return {context:{profileId:context.profileId,runId:context.runId},profile,runtime,repo,restored};
}
