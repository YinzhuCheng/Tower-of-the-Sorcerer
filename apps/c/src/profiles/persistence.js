import {createSaveRepository} from '../core/campaign.js';
import {stableStringify} from '../solver/state.js';
import {profileById} from './registry.js';
const same=(a,b)=>stableStringify(a)===stableStringify(b);
export const validPresentation=p=>p==null||(Array.isArray(p.seenIds)&&p.seenIds.every(x=>typeof x==='string')&&Array.isArray(p.queue)&&p.queue.every(scene=>typeof scene.title==='string'&&Array.isArray(scene.turns)&&scene.turns.every(turn=>typeof turn.text==='string'))&&Number.isInteger(p.turnIndex)&&p.turnIndex>=0);
export const validRunId=id=>id===''||/^r-[0-9a-z]{1,16}-[0-9a-z]{1,16}$/.test(id);
export function contextPrefix(profile,runId='') {
  if(!validRunId(runId))throw Error('未支持的航次标记');
  const i=profile.identity;
  return `campaign:${i.campaignId}:${i.difficultyId}:${i.rulesVersion}:${i.contentHash}${runId?`:run:${runId}`:''}`;
}
export const contextKey=(profile,runId,slot)=>`${contextPrefix(profile,runId)}:${slot}`;
// Classify before engine deserialization or any write. No missing marker means
// STANDARD unless the entire original five-field identity actually matches.
export function inspectHeader(raw,profile) {
  if(raw==null)return {status:'missing'};
  try {
    const parsed=JSON.parse(raw);
    if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw Error('无效存档');
    const envelope=Object.hasOwn(parsed,'$campaignSave');
    if(envelope&&parsed.$campaignSave!==1)return {status:'unsupported',reason:'未支持的存档封装版本'};
    const state=envelope?parsed.state:parsed;
    if(envelope&&Object.keys(parsed).some(key=>!['$campaignSave','state','presentation','profileId','profileVersion','canonicalSpecSha256'].includes(key)))return {status:'unsupported',reason:'未支持的存档封装字段'};
    if(parsed.presentation&&Object.keys(parsed.presentation).some(key=>!['seenIds','queue','turnIndex'].includes(key)))return {status:'unsupported',reason:'未支持的剧情阅读版本或字段'};
    for(const item of [parsed,state]) {
      if(!item||typeof item!=='object')throw Error('缺少存档状态');
      for(const [key,expected] of [['profileId',profile.id],['profileVersion',profile.profileVersion],['canonicalSpecSha256',profile.canonicalSpecSha256]]) {
        if(Object.hasOwn(item,key)&&item[key]!==expected)return {status:'unsupported',reason:`未支持或不匹配的 ${key}`};
      }
      for(const key of ['schemaVersion','$harborProfile','$profileSave','saveVersion'])if(Object.hasOwn(item,key))return {status:'unsupported',reason:`未支持的版本标记 ${key}`};
    }
    if(!same(state.identity,profile.identity))return {status:'unsupported',reason:'战役、难度、规则版本或内容身份不匹配'};
    if(envelope&&!validPresentation(parsed.presentation??null))throw Error('无效剧情阅读状态');
    return {status:'supported',state,presentation:envelope?parsed.presentation??null:null};
  } catch(error) { return {status:'invalid',reason:error.message}; }
}
export function createProfileRepository(storage,runtime,{profileId,runId=''}={}) {
  const profile=profileById(profileId);
  if(!profile||!same(runtime.identity,profile.identity))throw Error('存档上下文与难度不匹配');
  const basePrefix=contextPrefix(profile),prefix=contextPrefix(profile,runId);
  const adapter={getItem:key=>storage.getItem(prefix+key.slice(basePrefix.length)),setItem:(key,value)=>storage.setItem(prefix+key.slice(basePrefix.length),value),removeItem:key=>storage.removeItem(prefix+key.slice(basePrefix.length))};
  const base=createSaveRepository(adapter,runtime,{validatePresentation:validPresentation});
  const key=slot=>contextKey(profile,runId,slot);
  function inspect(slot) {
    const raw=storage.getItem(key(slot)),header=inspectHeader(raw,profile);
    if(header.status==='missing')return {...header,slot};
    if(header.status!=='supported')return {...header,slot,raw};
    const result=base.inspect(slot);
    return {...result,raw};
  }
  function issues() { return ['auto','manual'].map(inspect).filter(info=>['invalid','unsupported'].includes(info.status)); }
  function restore({preferred='auto',fallback='manual'}={}) {
    const problems=issues();let selected=null;
    for(const slot of [...new Set([preferred,fallback].filter(Boolean))]) {
      const result=inspect(slot);
      if(!selected&&result.status==='valid')selected=result;
      if(['invalid','unsupported'].includes(result.status)&&!problems.some(p=>p.slot===slot))problems.push(result);
    }
    return {state:selected?.state??null,presentation:selected?.presentation??null,source:selected?.slot??null,
      issues:problems.map(({slot,status,reason})=>({slot,status,reason})),allowAutoSave:problems.length===0};
  }
  function assertWritable(slot) {
    // A future auto cannot be overwritten by loading an old but valid manual.
    // Manual saves are protected by the same rule, even when auto is compatible.
    const blocked=issues();const target=inspect(slot);
    if(blocked.length||['invalid','unsupported'].includes(target.status))throw Error('存档含未支持或损坏的数据，已保留原始内容；请另开新航次');
  }
  return Object.freeze({key,inspect,restore,canWrite:()=>issues().length===0,
    save(slot,state,presentation=null){assertWritable(slot);
      if(profile.difficultyId==='normal'){base.save(slot,state,presentation);return;}
      const serialized=runtime.serialize(state);
      if(!validPresentation(presentation))throw Error('无效剧情阅读状态');
      storage.setItem(key(slot),JSON.stringify({$campaignSave:1,profileId:profile.id,profileVersion:profile.profileVersion,canonicalSpecSha256:profile.canonicalSpecSha256,state:JSON.parse(serialized),presentation:structuredClone(presentation)}));
    },
    load(slot){const info=inspect(slot);if(info.status==='missing')return null;if(info.status!=='valid')throw Error(info.reason);return info.state;},
    remove(slot){assertWritable(slot);base.remove(slot);}});
}
