import { clone } from '../core/campaign.js';
import { hashValue, stableStringify } from './state.js';

export function certifyCampaignActions(runtime,actions,{source='solver',coverage='witness',requireGoal=true}={}) {
  let state=runtime.initialState(); const initialStateHash=runtime.stateHash(state),steps=[];
  for (const [index,action] of actions.entries()) {
    const result=runtime.dispatch(state,action);
    if (!result.ok) return {ok:false,index,reason:result.reason,state,certificate:null};
    steps.push({action:clone(action),before:runtime.stateHash(state),after:runtime.stateHash(result.state),events:result.events});
    state=result.state;
  }
  if (requireGoal&&!state.victory) return {ok:false,index:actions.length,reason:'Route ended before campaign goal',state,certificate:null};
  const payload={schemaVersion:1,identity:clone(runtime.identity),source,coverage,initialStateHash,steps,final:clone(state),claim:requireGoal?'at-least-one-replayed-winning-route':'replayed-prefix'};
  return {ok:true,state,certificate:{...payload,certificateHash:hashValue(payload)}};
}
export function replayCampaignCertificate(runtime,certificate,{requireGoal=true}={}) {
  if (!certificate || stableStringify(certificate.identity)!==stableStringify(runtime.identity)) return {ok:false,index:-1,reason:'Campaign/difficulty/content/rules mismatch'};
  const {certificateHash,...payload}=certificate;
  if (hashValue(payload)!==certificateHash) return {ok:false,index:-1,reason:'Certificate checksum mismatch'};
  let state=runtime.initialState();
  if (runtime.stateHash(state)!==certificate.initialStateHash) return {ok:false,index:-1,reason:'Initial state mismatch'};
  for (const [index,step] of certificate.steps.entries()) {
    if (runtime.stateHash(state)!==step.before) return {ok:false,index,reason:'Before-state mismatch'};
    const result=runtime.dispatch(state,step.action);
    if (!result.ok) return {ok:false,index,reason:result.reason};
    if (runtime.stateHash(result.state)!==step.after || stableStringify(result.events)!==stableStringify(step.events)) return {ok:false,index,reason:'After-state/events mismatch'};
    state=result.state;
  }
  if (stableStringify(state)!==stableStringify(certificate.final)) return {ok:false,index:certificate.steps.length,reason:'Final state mismatch'};
  if (requireGoal&&!state.victory) return {ok:false,index:certificate.steps.length,reason:'Goal not reached'};
  return {ok:true,state,steps:certificate.steps.length,claim:'existence-only'};
}
