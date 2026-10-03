import {createFineForestNavigation,buildFineForestGeometry,fineForestPose,validateFineForestPose} from './forest-fine-navigation.js';
import {forestWorldMoveAction} from './forest-world.js';

// All physical navigation is disposable. The existing preview session alone
// writes campaign resources, receipts, story queues and the two save slots.
export function createFineForestAppAdapter(runtime,session,extension,{blocked=()=>false,onChange=()=>{},onResult=()=>{},onConfirmation=()=>{},onPortalReady=()=>{},speedMps=1.2}={}){
 const geometry=buildFineForestGeometry(runtime);let nav=null,active=false,disposed=false,portal=null,queuedClick=null,lastShown=null,results=[],savedPose=extension.restoredPose,lastStateHash=null;
 const blockedNow=()=>disposed||session.state.location.regionId!=='B-01'||blocked()||Boolean(session.compatibilityFailure)||session.state.victory||session.isStoryOpen()||Boolean(session.pending);
 const remember=result=>{results.push(result);return result;};
 function create(pose=savedPose){
  if(pose&&!validateFineForestPose(runtime,session.state,pose).ok)pose=null;
  nav=createFineForestNavigation(runtime,{state:session.state,speedMps,pose,authority:{getState:()=>session.state,blocked:blockedNow,move:action=>remember(session.move(action)),request:action=>remember(session.request(action)),confirm:token=>remember(session.confirm(token)),cancel:()=>session.cancel(),settled:()=>session.saveAuto()}});
  lastStateHash=runtime.stateHash(session.state);lastShown=null;
 }
 function interrupt({invalidate=false}={}){portal=null;queuedClick=null;if(nav){if(invalidate)nav.cancel();else nav.stop();}if(invalidate)lastShown=null;return snapshot();}
 function replace(state,pose){if(nav)nav.cancel();nav=null;portal=null;savedPose=pose;lastStateHash=null;lastShown=null;if(active&&state.location.regionId==='B-01'&&!session.compatibilityFailure)create(pose);}
 extension.bind({pose:()=>nav&&active?nav.pose():null,beforeLoad:()=>interrupt({invalidate:true}),afterLoad:replace});
 function sync(enabled){
  const next=Boolean(enabled&&!disposed&&session.state.location.regionId==='B-01'&&!session.compatibilityFailure);
  if(!next){if(active){interrupt({invalidate:true});nav?.stop({cancelSegment:true});savedPose=nav?.pose().value??null;}active=false;return false;}
  active=true;
  if(!nav)create();
  else if(runtime.stateHash(session.state)!==lastStateHash){queuedClick=null;portal=null;interrupt({invalidate:true});nav.stop({cancelSegment:true});create(null);lastStateHash=runtime.stateHash(session.state);}
  return true;
 }
 function flush(before){
  const state=nav?.snapshot();lastStateHash=runtime.stateHash(session.state);
  for(const r of results.splice(0))onResult(r);
  if(state?.pending&&state.pending.token!==lastShown){lastShown=state.pending.token;onConfirmation({...state.pending.request,token:state.pending.token,fine:true});}
  if(before!==undefined&&(before!==lastStateHash||!state?.moving))onChange();
 }
 function finishPortal(){
  if(!portal||!nav||nav.snapshot().moving||nav.snapshot().queuedMicrosteps||blockedNow())return;
  const intent=portal;portal=null;const state=nav.snapshot();
  if(runtime.stateHash(session.state)!==intent.stateHash||state.nodeId!==intent.targetId)return;
  nav.stop();onPortalReady(session.state.location,nav.snapshot());const result=remember(session.request(intent.action));flush();onChange();return result;
 }
 function tick(dt){if(!active||!nav||blockedNow())return snapshot();const before=runtime.stateHash(session.state),wasMoving=nav.snapshot().moving;nav.tick(dt);if(portal){if(portal.stateHash!==before)portal=null;else{portal.stateHash=runtime.stateHash(session.state);portal.action.expectedRevision=session.state.revision;}}if(queuedClick&&!nav.snapshot().moving&&!blockedNow()){const id=queuedClick;queuedClick=null;const result=nav.click(id);if(!result.ok)results.push(result);}if(portal)finishPortal();const after=nav.snapshot();flush(before!==runtime.stateHash(session.state)||wasMoving&&!after.moving?before:undefined);return snapshot();}
 function portalAction(action){
  if(!active||blockedNow()||nav.snapshot().moving)return{ok:false,reason:'session-blocked'};
  const edge=runtime.spec.transitions.find(e=>e.id===action.edgeId),anchor=edge&&runtime.entity(edge.anchor);
  if(!anchor||anchor.regionId!=='B-01'||!runtime.inReach(session.state,anchor.id))return{ok:false,reason:'portal-out-of-reach'};
  // Only the original portal centre enters the unchanged coarse bridge.
  // An explicit portal click/outward tap owns this short approach; release only
  // clears held walking. A newer intent or any interruption cancels the portal.
  const targetId=`${(anchor.x+.5)*4},${(anchor.y+.5)*4}`,route=nav.click(targetId);if(!route.ok)return route;
  portal={action:{...action,expectedRevision:session.state.revision},targetId,stateHash:runtime.stateHash(session.state)};finishPortal();return{ok:true,portalApproach:true};
 }
 function movement(direction,{held=false}={}){
  if(!active||blockedNow())return{ok:false,reason:'session-blocked'};
  portal=null;queuedClick=null;const action=forestWorldMoveAction(runtime,session.state,direction);
  if(action.type==='traverse'&&nav.snapshot().moving){nav.stop();return{ok:false,reason:'microstep-in-progress'};}const result=action.type==='traverse'?portalAction(action):(held?nav.press(direction):nav.step(direction));flush();return result;
 }
 function click(id){if(!active||blockedNow())return{ok:false,reason:'session-blocked'};portal=null;queuedClick=null;nav.stop();if(nav.snapshot().moving){if(!geometry.nodes.has(id))return{ok:false,reason:'unsupported-target'};queuedClick=id;return{ok:true,deferredUntilMicrostep:id};}const r=nav.click(id);flush();return r;}
 function entity(id){const shape=nav?.snapshot().footprints.find(f=>f.entityId===id);return shape?click(shape.cells[0]):{ok:false,reason:'completed'};}
 function confirm(token){const result=nav?nav.confirm(token):{ok:false,reason:'stale-confirmation'};flush();return result;}
 function snapshot(){return{active,queuedClick,portal:portal&&{...portal},...(nav?nav.snapshot():{}),saveFailure:extension.lastFailure};}
 return{geometry,sync,tick,snapshot,step:direction=>movement(direction),press:direction=>movement(direction,{held:true}),release(){nav?.release();},click,entity,portalAction,interrupt,confirm,cancel(){interrupt({invalidate:true});},dispose(){interrupt({invalidate:true});active=false;disposed=true;},get active(){return active;},get moving(){return active&&Boolean(nav?.snapshot().moving);}};
}
