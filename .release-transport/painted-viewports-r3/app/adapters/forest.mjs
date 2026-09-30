import {compileWorld} from './forest-kernel/navigation.js';
import {createPaintedPathReview,REVIEW_ANCHORS} from './forest-kernel/painted-path-review.js';
import {projectForestPhysical,nearestProjectedCandidate} from '../src/core.mjs';
export const WORLD_SHA256='a039a737f3676e80c5eb5200a0336e85744433a879c6850d3cce180e01bbea7b';
// Fixed review fixture only. These do not read/write any game, inventory, story, or combat state.
export const REVIEW_FIXTURE=Object.freeze({enemyCleared:true,rootFixed:true,toolTaken:false});
const idMap={root:'root',bay:'tool',upper:'west'},labels={root:'树根 → 石台 · 路径起点',bay:'石台 → 树根 · 路径起点',upper:'上桥 → 石台 · 路径起点'};
const same=(a,b)=>a?.cellId===b.cellId&&a?.surfaceId===b.surfaceId&&Math.hypot(a.x-b.x,a.y-b.y)<1e-8;
export function createForestReview(spec){
 const fixture=createPaintedPathReview(spec),snapshot=compileWorld(spec,{id:'b-person',radius:.32,maxStep:.5,allowedModes:['person']}).snapshot(REVIEW_FIXTURE);
 const project=pos=>projectForestPhysical([pos.x,pos.y,snapshot.heightAt(pos)]);
 const anchors=Object.entries(idMap).map(([id,sourceId])=>{const position=REVIEW_ANCHORS[sourceId];return {id,label:labels[id],sourceId,position,surfaceId:position.surfaceId,pixel:project(position),world:[position.x,position.y,snapshot.heightAt(position)],default:id==='bay'};});
 const names={'root-to-tool':['root','bay'],'tool-to-root':['bay','root'],'west-to-tool':['upper','bay']};
 function positionForAnchor(id){const a=anchors.find(a=>a.id===id);if(!a)throw Error('UNKNOWN_ANCHOR');return snapshot.validatePosition(a.position);}
 function resolveTarget(pixel,current){
  const allowed=Object.values(names).filter(([from])=>same(current,positionForAnchor(from))).map(([,to])=>anchors.find(a=>a.id===to));
  return nearestProjectedCandidate(allowed,pixel,26);
 }
 function routeTo(current,target){
  const id=Object.keys(names).find(key=>same(current,positionForAnchor(names[key][0]))&&names[key][1]===target.id);
  if(!id)return null;const session=fixture.begin(id,current,REVIEW_FIXTURE);
  return Object.freeze({session,length:session.length,start:current,targetId:target.id,routeId:id});
 }
 const nav=Object.freeze({profile:snapshot.profile,advance(path,cursor,current,budget){
  const status=path.session.status();if(Math.abs(status.cursor-cursor)>1e-8||!same(status.position,current))throw Error('CURSOR_POSITION_MISMATCH');
  if(!Number.isFinite(budget)||budget<0||budget>snapshot.profile.maxStep)throw Error('REMOTE_MOVEMENT_REJECTED');
  return path.session.advance(budget/1.35,REVIEW_FIXTURE,{speedMetresPerSecond:1.35});
 }});
 return {nav,anchors,project,resolveTarget,routeTo,positionForAnchor,physical:pos=>({axes:'east,north,up',xyz:[pos.x,pos.y,snapshot.heightAt(pos)]}),scope:fixture.scope,fixture:REVIEW_FIXTURE};
}
export async function createNavigation(){
 const response=await fetch('data/forest-reviewed-world.json',{cache:'no-store'});if(!response.ok)throw Error('MISSING_REVIEW_WORLD');
 const bytes=await response.arrayBuffer(),digest=await crypto.subtle.digest('SHA-256',bytes),hex=[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
 if(hex!==WORLD_SHA256)throw Error('REVIEW_WORLD_HASH_MISMATCH');
 return createForestReview(JSON.parse(new TextDecoder().decode(bytes)));
}
