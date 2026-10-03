import {PROFILES,STANDARD_ID,profileById} from './registry.js';
import {contextPrefix,contextKey,inspectHeader,validRunId} from './persistence.js';
export function listContexts(storage,profile) {
  const prefix=contextPrefix(profile),runs=new Set(['']);
  for(let index=0;index<storage.length;index++) {
    const key=storage.key(index);
    if(!key?.startsWith(prefix+':run:'))continue;
    const tail=key.slice((prefix+':run:').length),runId=tail.split(':')[0];
    if(validRunId(runId))runs.add(runId);
  }
  return [...runs].map(runId=>{
    const slots=['auto','manual'].map(slot=>({slot,...inspectHeader(storage.getItem(contextKey(profile,runId,slot)),profile)}));
    const hasData=slots.some(slot=>slot.status!=='missing')||Array.from({length:storage.length},(_,i)=>storage.key(i)).some(key=>key?.startsWith(contextPrefix(profile,runId)+':checkpoint:'));
    return {profileId:profile.id,runId,slots,hasData,canResume:slots.some(slot=>slot.status==='supported'),protected:slots.some(slot=>['invalid','unsupported'].includes(slot.status))};
  }).filter(context=>context.hasData);
}
export function readSelection(url) {
  const params=new URL(url).searchParams;
  if(!params.has('profile')&&!params.has('run'))return null;
  if(params.getAll('profile').length!==1||params.getAll('run').length>1)throw Error('难度或航次参数不明确，未启动游戏');
  const profileId=params.get('profile'),runId=params.get('run')??'';
  if(!profileById(profileId)||!validRunId(runId))throw Error('链接指向未支持的难度或航次；原存档不会改写');
  return {profileId,runId};
}
export function selectionUrl(url,context) {
  if(!profileById(context.profileId)||!validRunId(context.runId))throw Error('无效的难度选择');
  const result=new URL(url);result.searchParams.set('profile',context.profileId);
  if(context.runId)result.searchParams.set('run',context.runId);else result.searchParams.delete('run');
  return result.href;
}
export function resolveBootSelection(storage,url) {
  try {const explicit=readSelection(url);if(explicit)return {context:explicit,error:null};}
  catch(error){return {context:null,error:error.message};}
  const saved=PROFILES.flatMap(profile=>listContexts(storage,profile));
  // Never compare revisions or silently choose another difficulty's fallback.
  if(saved.length===1&&saved[0].canResume)return {context:{profileId:saved[0].profileId,runId:saved[0].runId},error:null};
  return {context:null,error:saved.some(context=>context.protected)?'部分存档需要匹配版本；原内容已保留，可继续兼容航次或另开新航次':null};
}
export function freshContext(storage,profileId,{forceSeparate=false,now=Date.now,random=Math.random}={}) {
  const profile=profileById(profileId);if(!profile)throw Error('未知难度');
  if(!forceSeparate&&!listContexts(storage,profile).some(context=>context.runId===''))return {profileId,runId:''};
  for(let n=0;n<100;n++) {
    const runId=`r-${now().toString(36)}-${Math.floor(random()*Number.MAX_SAFE_INTEGER).toString(36)}`;
    if(!Array.from({length:storage.length},(_,i)=>storage.key(i)).some(key=>key?.startsWith(contextPrefix(profile,runId)+':')))return {profileId,runId};
  }
  throw Error('无法分配独立航次，请稍后重试');
}
export function mountProfileSelector({document:doc=document,storage,confirm:ask=globalThis.confirm}={}) {
  const dialog=doc.getElementById('profile-dialog'),root=doc.getElementById('profile-root');
  let active=null,generation=0;
  const add=(tag,text,parent=root)=>{const element=doc.createElement(tag);element.textContent=text;parent.append(element);return element;};
  function dismiss(value=null) {
    if(!active)return;
    const finish=active.resolve;active=null;generation++;if(dialog.open)dialog.close();finish(value);
  }
  dialog.addEventListener('cancel',event=>{event.preventDefault();if(active&&!active.mandatory)dismiss();});
  dialog.addEventListener('close',()=>{if(dialog.open||!active)return;if(active.mandatory)dialog.showModal();else dismiss();});
  function draw(profileId) {
    const token=++generation,valid=()=>Boolean(active)&&token===generation;
    root.replaceChildren();
    add('h2','选择夜航难度');
    add('p','三档共用剧情、美术、地图与燃油预算，仅两台普通巡逻机的攻击按基线 / +1 / +2 调整。HARD / EXTREME 为暂定梯度，尚未作玩家难度或唯一解认证。');
    if(active.error)add('p',active.error).setAttribute('role','status');
    const label=add('label','难度 '),select=add('select','',label);select.id='profile-choice';select.setAttribute('aria-label','选择难度');
    for(const profile of PROFILES){const option=add('option',`${profile.label}${profile.id===STANDARD_ID?' · 标准（原版）':' · 暂定'}`,select);option.value=profile.id;}
    select.value=profileId;select.onchange=()=>{if(valid())draw(select.value);};
    const profile=profileById(profileId),contexts=listContexts(storage,profile);
    add('p',`档案 ${profile.id} · ${profile.profileVersion} · 内容 ${profile.identity.contentHash}`);
    if(contexts.length) {
      const savedLabel=add('label','已有航次 '),saved=add('select','',savedLabel);saved.id='profile-saved';saved.setAttribute('aria-label','选择已有航次');
      for(const context of contexts){const option=add('option',`${context.runId||'原始航次'}${context.protected?' · 含受保护存档':''}${!context.canResume?' · 无兼容自动/手动档':''}`,saved);option.value=context.runId;}
      const preferred=contexts.find(c=>c.runId===active.current?.runId&&profileId===active.current?.profileId)??contexts.find(c=>c.canResume)??contexts[0];saved.value=preferred.runId;
      const resume=add('button','继续所选航次');resume.type='button';resume.disabled=!preferred.canResume;
      saved.onchange=()=>{if(valid())resume.disabled=!contexts.find(c=>c.runId===saved.value)?.canResume;};
      resume.onclick=()=>{if(!valid()||!contexts.find(c=>c.runId===saved.value)?.canResume)return;dismiss({profileId,runId:saved.value,mode:'resume'});};
      add('p','已有自动档、手动档和泊位检查点保留在各自航次。受保护航次可只读恢复兼容档，不能写入。');
    }
    const start=add('button',contexts.length?'另开新航次':'开始所选难度');start.type='button';
    start.onclick=()=>{
      if(!valid())return;
      if((active.current||contexts.length)&&!ask(`以 ${profile.label} 开始新的独立航次？当前及已有航次的自动档、手动档和检查点全部保留，可在难度菜单中继续。`))return;
      if(!valid())return;
      const context=freshContext(storage,profileId,{forceSeparate:Boolean(active.current)||contexts.length>0});
      dismiss({...context,mode:'new'});
    };
    if(!active.mandatory){const close=add('button','返回当前游戏');close.type='button';close.onclick=()=>{if(valid())dismiss();};}
  }
  return Object.freeze({
    open({initialId=STANDARD_ID,current=null,mandatory=false,error=null}={}) {
      if(active||doc.querySelector('dialog[open]'))return Promise.resolve(null);
      return new Promise(resolve=>{active={resolve,current,mandatory,error};draw(profileById(initialId)?initialId:STANDARD_ID);dialog.showModal();});
    },
    isOpen:()=>Boolean(active)
  });
}
