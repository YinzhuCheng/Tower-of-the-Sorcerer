import { NATIVE_FOREST_WORLD as native } from './forest-world-contract.js';
import { FOREST_FINE_COLLISION } from './forest-fine-collision.js';
import { nativeGroundSupportAt } from './forest-ground-support.js';
import { heroFacing } from './hero-locomotion.js';

// Bounded B01 navigation experiment. Campaign coordinates, content and reducers
// are unchanged. This graph adds real local positions, not animation subframes.
export const FINE_FOREST = Object.freeze({schema:'forest-fine-nav/v1',regionId:'B-01',subdivision:4,nominalStepM:.3,actorRadiusM:.18,actorHeightM:1.66,maxSlope:.6,maxStepM:.12,meshRevision:native.revision,rulesContentHash:'a12cd07ee1ccc762'});
const D={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
const key=(x,y)=>`${x},${y}`, sourceKey=(x,y)=>`${x},${y}`, copy=x=>structuredClone(x);
const distance=(a,b)=>Math.hypot(...a.worldFootM.map((v,i)=>v-b.worldFootM[i]));
const originalCells=new Map(native.cells.filter(c=>c.sourceRegionId==='B-01').map(c=>[key(c.localX,c.localY),c]));
const originalEdges=new Set(native.edges.filter(e=>e.sourceRegionId==='B-01').flatMap(e=>[`${e.from}>${e.to}`,`${e.to}>${e.from}`]));
const anchor=originalCells.get('1,5');
const colliders=FOREST_FINE_COLLISION.colliders.map(c=>({...c,bounds:[Math.min(...c.polygon.map(p=>p[0])),Math.min(...c.polygon.map(p=>p[1])),Math.max(...c.polygon.map(p=>p[0])),Math.max(...c.polygon.map(p=>p[1]))]}));
function pointSegmentDistance(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);}
function insidePolygon(x,y,p){let inside=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
function segmentsCross(a,b,c,d){const orient=(p,q,r)=>(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);const ab1=orient(a,b,c),ab2=orient(a,b,d),cd1=orient(c,d,a),cd2=orient(c,d,b);return ab1*ab2<=0&&cd1*cd2<=0&&Math.max(Math.min(a[0],b[0]),Math.min(c[0],d[0]))<=Math.min(Math.max(a[0],b[0]),Math.max(c[0],d[0]))+1e-9&&Math.max(Math.min(a[1],b[1]),Math.min(c[1],d[1]))<=Math.min(Math.max(a[1],b[1]),Math.max(c[1],d[1]))+1e-9;}
// Analytic swept disc versus polygon edges: a thin post between legal endpoint
// positions cannot be tunneled through, even at a low frame rate.
export function fineCapsuleHitsPolygon(a,b,polygon,radius){if(insidePolygon(...a,polygon)||insidePolygon(...b,polygon))return true;return polygon.some((c,i)=>{const d=polygon[(i+1)%polygon.length];return segmentsCross(a,b,c,d)||Math.min(pointSegmentDistance(...a,c,d),pointSegmentDistance(...b,c,d),pointSegmentDistance(...c,a,b),pointSegmentDistance(...d,a,b))<radius-1e-7;});}
export function fineSweptCollider(a,b,radius=FINE_FOREST.actorRadiusM){const A=a.worldFootM,B=b.worldFootM,zmin=Math.min(A[2],B[2]),zmax=Math.max(A[2],B[2]);for(const c of colliders){if(c.maxZ<zmin+.08||c.minZ>zmax+FINE_FOREST.actorHeightM)continue;const box=c.bounds;if(Math.max(A[0],B[0])+radius<box[0]||Math.min(A[0],B[0])-radius>box[2]||Math.max(A[1],B[1])+radius<box[1]||Math.min(A[1],B[1])-radius>box[3])continue;if(fineCapsuleHitsPolygon(A.slice(0,2),B.slice(0,2),c.polygon,radius))return c.id;}return null;}
export function fineColliderAt(sample,radius=FINE_FOREST.actorRadiusM){if(!sample)return 'unsupported';const[x,y,z]=sample.worldFootM;for(const c of colliders){const b=c.bounds;if(c.maxZ<z+.08||c.minZ>z+FINE_FOREST.actorHeightM||x<b[0]-radius||x>b[2]+radius||y<b[1]-radius||y>b[3]+radius)continue;if(insidePolygon(x,y,c.polygon)||c.polygon.some((p,i)=>pointSegmentDistance(x,y,p,c.polygon[(i+1)%c.polygon.length])<radius-1e-7))return c.id;}return null;}
// Interpolate source registration in XY; every returned Z/depth comes from the
// exact saved support mesh, never the interpolation plane or painted scenery.
export function fineRegisteredXY(qx,qy){const x=Math.floor(qx-.5),y=Math.floor(qy-.5),u=qx-.5-x,v=qy-.5-y,a=originalCells.get(key(x,y)),b=originalCells.get(key(x+1,y)),c=originalCells.get(key(x,y+1)),d=originalCells.get(key(x+1,y+1));if(!a||!b||!c||!d)return null;const xy=[0,1].map(i=>(1-u)*(1-v)*a.worldFootM[i]+u*(1-v)*b.worldFootM[i]+(1-u)*v*c.worldFootM[i]+u*v*d.worldFootM[i]);return xy;}
export function fineGroundSample(qx,qy){const xy=fineRegisteredXY(qx,qy);return xy?nativeGroundSupportAt(anchor,xy[0]-anchor.worldFootM[0],xy[1]-anchor.worldFootM[1]):null;}
function bodySupported(sample){if(!sample||fineColliderAt(sample))return false;for(let i=0;i<8;i++){const a=i*Math.PI/4,s=nativeGroundSupportAt(sample,Math.cos(a)*FINE_FOREST.actorRadiusM,Math.sin(a)*FINE_FOREST.actorRadiusM);if(!s||Math.abs(s.worldFootM[2]-sample.worldFootM[2])>FINE_FOREST.maxStepM)return false;}return true;}
function safeSegment(a,b){if(fineSweptCollider(a,b))return false;const length=distance(a,b),steps=Math.max(2,Math.ceil(length/.06));for(let i=1;i<steps;i++){const t=i/steps,xy=[0,1].map(j=>a.worldFootM[j]+(b.worldFootM[j]-a.worldFootM[j])*t),s=nativeGroundSupportAt(a,xy[0]-a.worldFootM[0],xy[1]-a.worldFootM[1]);if(!bodySupported(s))return false;}return Math.abs(b.worldFootM[2]-a.worldFootM[2])<=FINE_FOREST.maxStepM+length*FINE_FOREST.maxSlope;}
let geometryCache,instanceSequence=0;
export function buildFineForestGeometry(runtime){if(runtime.identity.contentHash!==FINE_FOREST.rulesContentHash)throw Error('Fine navigation content mismatch');if(geometryCache)return geometryCache;const map=runtime.region('B-01').map,nodes=new Map(),rejected=[];
 for(let iy=0;iy<map.length*4;iy++)for(let ix=0;ix<map[0].length*4;ix++){const x=ix/4,y=iy/4,source={regionId:'B-01',x:Math.floor(x),y:Math.floor(y)};if(map[source.y]?.[source.x]!=='.')continue;const sample=fineGroundSample(x,y);if(!bodySupported(sample)){rejected.push({ix,iy,reason:sample?(fineColliderAt(sample)??'support-radius'):'support'});continue;}nodes.set(key(ix,iy),{id:key(ix,iy),ix,iy,x,y,source,sample,neighbors:[]});}
 for(const n of nodes.values())for(const[direction,[dx,dy]]of Object.entries(D)){const m=nodes.get(key(n.ix+dx,n.iy+dy));if(!m)continue;const same=n.source.x===m.source.x&&n.source.y===m.source.y;if(!same&&!originalEdges.has(`${n.source.x},${n.source.y}>${m.source.x},${m.source.y}`))continue;if(safeSegment(n.sample,m.sample))n.neighbors.push({id:m.id,direction,distanceM:distance(n.sample,m.sample),logicalMove:!same});}
 geometryCache={nodes,rejected,regionId:'B-01',subdivision:4,revision:FINE_FOREST.meshRevision};return geometryCache;
}
export function fineEntityFootprints(runtime,state,geometry=buildFineForestGeometry(runtime)){const active=runtime.region('B-01').entities.filter(e=>e.kind!=='anchor'&&!state.cleared.includes(e.id)&&runtime.meets(state,e.visibleWhen));return active.map(e=>{const cells=[...geometry.nodes.values()].filter(n=>n.source.x===e.x&&n.source.y===e.y&&(e.blocking||Math.abs(n.x-e.x-.5)<=.26&&Math.abs(n.y-e.y-.5)<=.26)).map(n=>n.id);return {entityId:e.id,blocking:Boolean(e.blocking),cells,polygon:e.blocking?[[e.x,e.y],[e.x+1,e.y],[e.x+1,e.y+1],[e.x,e.y+1]].map(p=>fineRegisteredXY(...p)):null,logicalGate:e.blocking?{x:e.x,y:e.y}:null};});}
function nodeForState(geometry,state){return geometry.nodes.get(key((state.location.x+.5)*4,(state.location.y+.5)*4));}
export function createFineForestNavigation(runtime,{state=runtime.initialState(),speedMps=1.2,authority=null,pose=null}={}){
 if(!Number.isFinite(speedMps)||speedMps<=0)throw Error('Fine navigation speed must be finite and positive');
 const instanceId=globalThis.crypto?.randomUUID?.()??`fine-${Date.now().toString(36)}-${++instanceSequence}-${Math.random().toString(36).slice(2)}`;
 runtime.assertValidState(state);const geometry=buildFineForestGeometry(runtime);let current=copy(state),node=nodeForState(geometry,current),segment=null,path=[],arrivalContact=null,held=null,pending=null,lastContact=null,epoch=0,distanceM=0,facing='front',events=[],actions=[],physical=node?.sample;
 if(current.location.regionId!=='B-01'||!node)throw Error('B01 fine navigation requires a supported source anchor');
 const footprints=()=>fineEntityFootprints(runtime,current,geometry),occupied=id=>footprints().find(e=>e.cells.includes(id));
 function blockingContact(sample,radius=FINE_FOREST.actorRadiusM){const p=sample.worldFootM.slice(0,2);return footprints().find(f=>f.blocking&&fineCapsuleHitsPolygon(p,p,f.polygon,radius));}
 function canEnter(n){return n&&runtime.passable(current,n.source.x,n.source.y)&&!blockingContact(n.sample);}
 if(pose){const checked=validateFineForestPose(runtime,current,pose,geometry);if(!checked.ok)throw Error(checked.reason);node=geometry.nodes.get(pose.nodeId);physical=node.sample;distanceM=pose.distanceM;facing=pose.facing;}
 if(!canEnter(node))throw Error('B01 fine navigation requires a clear actor footprint');
 const blocked=()=>current.victory||Boolean(authority?.blocked?.());
 function observe(result,action){if(result.ok&&!result.confirmation){current=authority?authority.getState():result.state;if(result.events)events.push(...copy(result.events));if(result.receipt)actions.push(copy(action));}return result;}
 function dispatch(action){return observe(authority?(action.type==='move'?authority.move(action):authority.request(action)):runtime.dispatch(current,action),action);}
 function settled(){authority?.settled?.();}

 function legalEdge(from,to){return from.neighbors.some(e=>e.id===to.id)&&canEnter(to)&&!footprints().some(f=>f.blocking&&fineCapsuleHitsPolygon(from.sample.worldFootM.slice(0,2),to.sample.worldFootM.slice(0,2),f.polygon,FINE_FOREST.actorRadiusM));}
 function snapshot(){return {schema:FINE_FOREST.schema,state:copy(current),nodeId:node.id,physical:copy(physical),fine:{x:segment?segment.from.x+(segment.to.x-segment.from.x)*segment.travel/segment.length:node.x,y:segment?segment.from.y+(segment.to.y-segment.from.y)*segment.travel/segment.length:node.y},moving:Boolean(segment),queuedMicrosteps:path.length,held,pending:copy(pending),distanceM,facing,speedMps,footprints:footprints(),events:copy(events),actions:copy(actions),epoch};}
 function contact(entityId){if(blocked())return{ok:false,reason:'session-blocked'};const e=runtime.entity(entityId);if(!e||e.regionId!=='B-01')return {ok:false,reason:'unknown-entity'};if(current.cleared.includes(entityId))return {ok:false,reason:'completed'};if(segment)return{ok:false,reason:'moving'};if(pending)return pending.entityId===entityId?{ok:true,pending:true,duplicate:true,token:pending.token}:{ok:false,reason:'another-pending'};
  if(lastContact===entityId)return{ok:false,reason:'contact-latched'};if(!runtime.inReach(current,entityId))return{ok:false,reason:'logical-out-of-reach'};
  const shape=footprints().find(f=>f.entityId===entityId),near=shape?.blocking?Boolean(blockingContact(node.sample,FINE_FOREST.actorRadiusM+.31)?.entityId===entityId):shape?.cells.some(id=>{const n=geometry.nodes.get(id);return Math.abs(n.ix-node.ix)+Math.abs(n.iy-node.iy)<=1;});if(!near)return{ok:false,reason:'physical-out-of-reach'};
  const action={type:'interact',entityId,expectedRevision:current.revision},preview=runtime.preview(current,action);if(!preview.legal){lastContact=entityId;return{ok:false,reason:preview.reason};}const request=authority?dispatch(action):{ok:true,confirmation:true};if(!request.ok)return request;if(!request.confirmation){epoch++;lastContact=entityId;settled();return request;}pending={request,entityId,token:`${instanceId}:${epoch}:${current.revision}:${entityId}`,action,preview};held=null;path=[];arrivalContact=null;return{...request,ok:true,pending:true,token:pending.token};
 }
 function begin(direction){if(blocked())return{ok:false,reason:current.victory?'campaign-complete':'session-blocked'};if(segment||pending)return{ok:false,reason:'busy'};const d=D[direction];if(!d)return{ok:false,reason:'direction'};const next=geometry.nodes.get(key(node.ix+d[0],node.iy+d[1]));const target=next&&(occupied(next.id)?.blocking?occupied(next.id):blockingContact(next.sample));if(target?.blocking)return contact(target.entityId);if(!next||!legalEdge(node,next))return{ok:false,reason:'blocked'};
  const edge=node.neighbors.find(e=>e.id===next.id);segment={from:node,to:next,length:edge.distanceM,travel:0,direction,logicalMove:edge.logicalMove,revision:current.revision};facing=heroFacing(next.sample.worldFootM[0]-physical.worldFootM[0],-(next.sample.worldFootM[1]-physical.worldFootM[1]),facing);return{ok:true};
 }
 function finish(){const s=segment;if(s.logicalMove){const action={type:'move',direction:s.direction,expectedRevision:s.revision},result=dispatch(action);if(!result.ok){physical=node.sample;segment=null;path=[];held=null;return result;}}node=s.to;physical=node.sample;segment=null;lastContact=null;const target=occupied(node.id);if(target&&!target.blocking)contact(target.entityId);else if(!path.length&&arrivalContact){const id=arrivalContact;arrivalContact=null;contact(id);}settled();return{ok:true};}
 function tick(seconds){if(blocked())return snapshot();let budget=Math.min(.1,Math.max(0,seconds))*speedMps;while(budget>1e-8&&!blocked()){if(!segment){const direction=path.shift()??held;if(!direction)break;const r=begin(direction);if(!r.ok||pending)break;}const take=Math.min(budget,segment.length-segment.travel);segment.travel+=take;budget-=take;distanceM+=take;const t=segment.travel/segment.length,a=segment.from.sample,b=segment.to.sample;physical=nativeGroundSupportAt(a,(b.worldFootM[0]-a.worldFootM[0])*t,(b.worldFootM[1]-a.worldFootM[1])*t);if(segment.travel>=segment.length-1e-8)finish();}return snapshot();}
 function stop({cancelSegment=false}={}){held=null;path=[];arrivalContact=null;if(cancelSegment&&segment){physical=node.sample;segment=null;}return snapshot();}
 function plan(targetId,{entityId=null}={}){if(blocked())return{ok:false,reason:current.victory?'campaign-complete':'session-blocked'};if(segment||pending)return{ok:false,reason:'busy'};let goals=new Set();if(entityId){const shape=footprints().find(e=>e.entityId===entityId);if(!shape)return{ok:false,reason:'completed'};for(const n of geometry.nodes.values()){if(!canEnter(n))continue;const st={...current,location:n.source};if(runtime.inReach(st,entityId)&&(shape.blocking?blockingContact(n.sample,FINE_FOREST.actorRadiusM+.31)?.entityId===entityId:shape.cells.some(id=>{const c=geometry.nodes.get(id);return Math.abs(c.ix-n.ix)+Math.abs(c.iy-n.iy)<=1;})))goals.add(n.id);}}else{if(!canEnter(geometry.nodes.get(targetId)))return{ok:false,reason:'blocked'};goals.add(targetId);}
  const queue=[node.id],seen=new Map([[node.id,null]]);let goal=null;while(queue.length){const id=queue.shift();if(goals.has(id)){goal=id;break;}for(const e of geometry.nodes.get(id).neighbors){if(seen.has(e.id)||!legalEdge(geometry.nodes.get(id),geometry.nodes.get(e.id)))continue;seen.set(e.id,{from:id,direction:e.direction});queue.push(e.id);}}if(!goal)return{ok:false,reason:'unreachable'};const steps=[];for(let id=goal;seen.get(id);id=seen.get(id).from)steps.unshift(seen.get(id).direction);return{ok:true,path:steps,targetId:goal,entityId};
 }
 function click(targetId){lastContact=null;const e=occupied(targetId),route=plan(targetId,{entityId:e?.entityId??null});if(!route.ok)return route;held=null;path=route.path;arrivalContact=e?.entityId??null;if(!path.length&&e)return contact(e.entityId);return{...route,microsteps:route.path.length};}
 function confirm(token){if(!pending||pending.token!==token)return{ok:false,reason:'stale-confirmation'};const p=pending;pending=null;lastContact=p.entityId;const result=authority?observe(authority.confirm(p.request.confirmationToken),p.action):dispatch(p.action);epoch++;settled();return result;}
 function cancel(){authority?.cancel?.();if(pending)lastContact=pending.entityId;pending=null;epoch++;return stop();}
 function save(){if(segment)return{ok:false,reason:'microstep-in-progress'};return {ok:true,value:JSON.stringify({schema:'forest-fine-prototype-save/v1',campaign:JSON.parse(runtime.serialize(current)),navigation:{schema:FINE_FOREST.schema,revision:FINE_FOREST.meshRevision,subdivision:4,nodeId:node.id,stateHash:runtime.stateHash(current),distanceM,facing}})};}
 // Loading is an interaction cancellation barrier, even when input is invalid.
 // Failed loads keep the campaign and current physical pose; no reset/recenter
 // occurs until every replacement field has passed validation.
 function load(raw){
  if(authority){cancel();return{ok:false,reason:'session-load-required'};}
  epoch++;pending=null;lastContact=null;stop();
  let data;try{data=JSON.parse(raw);}catch{return{ok:false,reason:'invalid-json'};}
  if(!data||typeof data!=='object'||Array.isArray(data))return{ok:false,reason:'invalid-save-root'};
  const wrapped=data.schema==='forest-fine-prototype-save/v1';let next;
  try{next=runtime.deserialize(JSON.stringify(wrapped?data.campaign:data));}catch(error){return{ok:false,reason:error.message};}
  if(next.location.regionId!=='B-01')return{ok:false,reason:'prototype-b01-only'};
  let n=nodeForState(geometry,next);
  if(wrapped){const side=data.navigation;n=geometry.nodes.get(side?.nodeId);
   if(side?.schema!==FINE_FOREST.schema||side.revision!==FINE_FOREST.meshRevision||side.subdivision!==4||side.stateHash!==runtime.stateHash(next)||!n||n.source.x!==next.location.x||n.source.y!==next.location.y||!Number.isFinite(side.distanceM)||side.distanceM<0||!['front','back','left','right'].includes(side.facing)||!runtime.passable(next,n.source.x,n.source.y))return{ok:false,reason:'incompatible-navigation-sidecar'};
  }
  if(!n)return{ok:false,reason:'unsupported-legacy-anchor'};
  const p=n.sample.worldFootM.slice(0,2),overlap=fineEntityFootprints(runtime,next,geometry).some(f=>f.blocking&&fineCapsuleHitsPolygon(p,p,f.polygon,FINE_FOREST.actorRadiusM));
  if(!runtime.passable(next,n.source.x,n.source.y)||overlap)return{ok:false,reason:'occupied-navigation-position'};
  stop({cancelSegment:true});current=next;node=n;physical=n.sample;
  distanceM=wrapped?data.navigation.distanceM:0;facing=wrapped?data.navigation.facing:'front';events=[];actions=[];
  return{ok:true,migration:wrapped?'fine-sidecar-restored':'legacy-state-unchanged-center-anchor',campaignUnchanged:true};
 }

 return {geometry,snapshot,tick,step:begin,pose(){if(segment)return{ok:false,reason:'microstep-in-progress'};return{ok:true,value:fineForestPose(runtime,current,{nodeId:node.id,distanceM,facing})};},observeState(){const next=authority?.getState();if(!next)return{ok:true};if(next.location.regionId!=='B-01'||next.location.x!==node.source.x||next.location.y!==node.source.y)return{ok:false,reason:'authority-location-changed'};current=next;return{ok:true};},press(direction){if(blocked())return{ok:false,reason:current.victory?'campaign-complete':'session-blocked'};if(pending)return{ok:false,reason:'pending-confirmation'};held=direction;path=[];arrivalContact=null;if(!segment)return begin(direction);return{ok:true};},release(){held=null;},stop,plan,click,contact,confirm,cancel,save,load};
}

// App pose metadata contains no campaign writer and cannot restore a pending action.
export const FINE_FOREST_POSE='forest-fine-pose/v1';
export function fineForestPose(runtime,state,{nodeId=`${(state.location.x+.5)*4},${(state.location.y+.5)*4}`,distanceM=0,facing='front'}={}){
 return{schema:FINE_FOREST_POSE,campaignIdentity:copy(runtime.identity),stateHash:runtime.stateHash(state),regionId:'B-01',meshRevision:FINE_FOREST.meshRevision,collisionRevision:`${FOREST_FINE_COLLISION.schema}:${FOREST_FINE_COLLISION.sourceSceneSha256}`,collisionContentHash:'c87827c8a5f3ed6ce59ce8aa2d8c7ef968264eec3903c0a9e42d3f80432804a9',subdivision:4,actorRadiusM:.18,actorHeightM:1.66,nodeId,distanceM,facing};
}
export function validateFineForestPose(runtime,state,pose,geometry=buildFineForestGeometry(runtime)){
 const fail=reason=>({ok:false,code:'fine-pose-compatibility',reason});
 if(!pose||typeof pose!=='object'||Array.isArray(pose))return fail('Invalid fine-pose metadata');
 const expected=fineForestPose(runtime,state),n=geometry.nodes.get(pose.nodeId);
 for(const key of ['schema','stateHash','regionId','meshRevision','collisionRevision','collisionContentHash','subdivision','actorRadiusM','actorHeightM'])if(pose[key]!==expected[key])return fail(`Incompatible fine-pose ${key}`);
 if(runtime.stateHash(pose.campaignIdentity)!==runtime.stateHash(runtime.identity))return fail('Incompatible fine-pose campaign identity');
 if(state.location.regionId!=='B-01'||!n||n.source.x!==state.location.x||n.source.y!==state.location.y||!Number.isFinite(pose.distanceM)||pose.distanceM<0||!['front','back','left','right'].includes(pose.facing))return fail('Invalid fine-pose node or motion metadata');
 const p=n.sample.worldFootM.slice(0,2);
 if(!runtime.passable(state,n.source.x,n.source.y)||fineEntityFootprints(runtime,state,geometry).some(f=>f.blocking&&fineCapsuleHitsPolygon(p,p,f.polygon,.18)))return fail('Occupied fine-pose actor footprint');
 return{ok:true,node:n};
}
