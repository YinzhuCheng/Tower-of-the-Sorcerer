import { forestActionVisible } from '../campaigns/b/player-copy.js';
// Presentation registration only. The immutable campaign reducer owns every move,
// portal, cost and receipt. Connector spans contain no additional gameplay tiles.
export const FOREST_WORLD_REVISION='b-connected-world-r1';
export const FOREST_WORLD_REGISTRATION=Object.freeze({
 schema:'tower-finite-forest-world/v1',contentHash:'a12cd07ee1ccc762',cellMeters:1.2,
 metricAxes:'X right; Y negative source-row; Z support height',
 regions:Object.freeze({'B-01':Object.freeze([0,0]),'B-02':Object.freeze([12,0]),'B-03':Object.freeze([24,0])}),
 seams:Object.freeze([
  Object.freeze({forward:'b.edge.01-02',backward:'b.edge.02-01',direction:'right',reverse:'left'}),
  Object.freeze({forward:'b.edge.02-03',backward:'b.edge.03-02',direction:'right',reverse:'left'})
 ]),
 provenance:'New explicit candidate registration of authored source anchors; source worldPosition is schematic and is not treated as measured geometry.'
});
const ids=Object.keys(FOREST_WORLD_REGISTRATION.regions);
const dirs={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
export const hasForestWorld=regionId=>ids.includes(regionId);
export function worldPoint(location){const o=FOREST_WORLD_REGISTRATION.regions[location.regionId];return o?{x:o[0]+location.x+.5,y:o[1]+location.y+.5}:null;}
export function metricPoint(location){const p=worldPoint(location);return p?{x:p.x*1.2,y:-p.y*1.2,z:0}:null;}
export function forestWorldRegistry(runtime){
 if(runtime.identity.contentHash!==FOREST_WORLD_REGISTRATION.contentHash)throw new Error('Forest world registration does not match campaign content');
 const seams=FOREST_WORLD_REGISTRATION.seams.map(s=>{
  const edge=runtime.spec.transitions.find(e=>e.id===s.forward),back=runtime.spec.transitions.find(e=>e.id===s.backward);
  if(!edge||!back||edge.reciprocal!==back.id||back.reciprocal!==edge.id)throw new Error('Missing reciprocal source portal');
  const anchor=runtime.entity(edge.anchor),returnAnchor=runtime.entity(back.anchor);
  if(edge.to!==returnAnchor.regionId||back.to!==anchor.regionId||edge.at.x!==returnAnchor.x||edge.at.y!==returnAnchor.y||back.at.x!==anchor.x||back.at.y!==anchor.y)throw new Error('Portal endpoint registration mismatch');
  const a=worldPoint(anchor),b=worldPoint(returnAnchor);
  if(b.x-a.x!==4||a.y!==b.y)throw new Error('Invalid corridor span');
  return {...s,from:anchor.regionId,to:returnAnchor.regionId,a,b,sourceAnchor:{regionId:anchor.regionId,x:anchor.x,y:anchor.y},targetAnchor:{regionId:returnAnchor.regionId,x:returnAnchor.x,y:returnAnchor.y},spanMeters:4.8,gameplayCells:0};
 });
 return {revision:FOREST_WORLD_REVISION,regions:ids.map(id=>({id,origin:FOREST_WORLD_REGISTRATION.regions[id],source:runtime.region(id)})),seams,bounds:{left:-1,right:36,top:-1,bottom:12},finite:true};
}
// Only a deliberate outward step while standing on the exact existing anchor
// requests a portal. Nearness, world-space collision, and neighbor pixels alone
// never grant travel. The session then evaluates the original edge normally.
export function forestWorldMoveAction(runtime,state,direction){
 const fallback={type:'move',direction};if(!hasForestWorld(state.location.regionId)||!dirs[direction])return fallback;
 for(const s of forestWorldRegistry(runtime).seams){for(const [edgeId,dir]of[[s.forward,s.direction],[s.backward,s.reverse]]){
  const edge=runtime.spec.transitions.find(e=>e.id===edgeId),anchor=runtime.entity(edge.anchor);
  if(direction===dir&&state.location.regionId===anchor.regionId&&state.location.x===anchor.x&&state.location.y===anchor.y)return {type:'traverse',edgeId};
 }}return fallback;
}
export function forestWorldMotion(runtime,from,to){
 const a=worldPoint(from),b=worldPoint(to);if(!a||!b)return null;
 if(from.regionId===to.regionId)return {points:[a,b],crossing:false};
 for(const s of forestWorldRegistry(runtime).seams){
  if(from.regionId===s.from&&to.regionId===s.to)return {points:[a,s.a,s.b,b],crossing:true,edgeId:s.forward};
  if(from.regionId===s.to&&to.regionId===s.from)return {points:[a,s.b,s.a,b],crossing:true,edgeId:s.backward};
 }return null;
}
export function projectForestWorld(runtime,state){
 if(!hasForestWorld(state.location.regionId))return null;
 const registry=forestWorldRegistry(runtime),cells=[],objects=[],scenery=[];
 for(const r of registry.regions){
  const projectedState={...state,location:{regionId:r.id,...r.source.arrival}};
  for(let y=0;y<r.source.map.length;y++)for(let x=0;x<r.source.map[y].length;x++){
   const token=r.source.map[y][x],p=worldPoint({regionId:r.id,x,y}),cell={regionId:r.id,localX:x,localY:y,x:p.x-.5,y:p.y-.5,token};
   if(token==='.')cells.push({...cell,passable:runtime.passable({...state,location:{...state.location,regionId:r.id}},x,y)});else scenery.push(cell);
  }
  for(const e of runtime.projectView(projectedState).entities){if(e.completed||!runtime.meets(state,e.visibleWhen)||!forestActionVisible(runtime,state,e))continue;objects.push({...e,...worldPoint(e),localX:e.x,localY:e.y,active:r.id===state.location.regionId});}
 }
 return {...registry,activeRegion:state.location.regionId,stateRevision:state.revision,location:{...state.location},hero:worldPoint(state.location),cells,scenery,objects};
}
export function worldPointToSource(model,x,y){
 // Connector pixels intentionally have no source hit target.
 const cell=model.cells.find(c=>x>=c.x&&x<c.x+1&&y>=c.y&&y<c.y+1);
 return cell?{regionId:cell.regionId,x:cell.localX,y:cell.localY}:null;
}
export function cameraViewport(width,height){const scale=Math.max(40,Math.min(64,width/9));return {width,height,scale};}
export function worldToScreen(point,camera,viewport){return {x:(point.x-camera.x)*viewport.scale+viewport.width/2,y:(point.y-camera.y)*viewport.scale+viewport.height*.56};}
export function screenToWorld(point,camera,viewport){return {x:(point.x-viewport.width/2)/viewport.scale+camera.x,y:(point.y-viewport.height*.56)/viewport.scale+camera.y};}
export function followCamera(camera,hero,dt){const a=1-Math.exp(-Math.max(0,dt)*7);return{x:camera.x+(hero.x-camera.x)*a,y:camera.y+(hero.y-camera.y)*a};}
// Bounded animation state, independent of save state. Refresh/load reconstruct it
// from the real saved location; camera/motion never change the game snapshot.
export function createWorldMotion(runtime){
 let hero=null,camera=null,location=null,queue=[],crossing=false;
 function reset(next){location={...next};hero=worldPoint(next);camera=hero?{...hero}:null;queue=[];crossing=false;}
 function sync(next){if(!hero){reset(next);return;}if(location.regionId===next.regionId&&location.x===next.x&&location.y===next.y)return;
  const motion=forestWorldMotion(runtime,location,next);if(!motion){reset(next);return;}
  for(const p of motion.points.slice(1)){const previous=queue.at(-1)?.point??hero;if(Math.hypot(p.x-previous.x,p.y-previous.y)>1e-8)queue.push({point:p,crossing:motion.crossing});}
  crossing=queue.some(q=>q.crossing);location={...next};
 }
 function tick(seconds){let remaining=Math.min(.1,Math.max(0,seconds))*7;
  while(queue.length&&remaining>0){const q=queue[0],distance=Math.hypot(q.point.x-hero.x,q.point.y-hero.y);if(distance<=remaining){hero={...q.point};queue.shift();remaining-=distance;}else{hero={x:hero.x+(q.point.x-hero.x)*remaining/distance,y:hero.y+(q.point.y-hero.y)*remaining/distance};remaining=0;}}
  crossing=queue.some(q=>q.crossing);if(hero)camera=followCamera(camera,hero,Math.min(.1,Math.max(0,seconds)));return snapshot();
 }
 function snapshot(){return {hero:hero&&{...hero},camera:camera&&{...camera},crossing,moving:queue.length>0,queuedSegments:queue.length,location:location&&{...location}};}
 return {reset,sync,tick,snapshot};
}
