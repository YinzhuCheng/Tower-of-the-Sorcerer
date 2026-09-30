import {createHarborNavigation,projectPhysical} from './harbor-kernel/source-adapter.mjs';
import {nearestProjectedCandidate} from '../src/core.mjs';
export const WORLD_SHA256='00fb819ad5227cdccdf1baa1de366678a9be9fc2a4da960d4a38ba5690a615a6';
export const ANCHORS_SHA256='8a2522ee1c3eb405fe1c053936c3ca89c78c4ae4bf90db5dd8640a4ee68b58c2';
const labels={quay:'码头 · 低层',upper_bridge:'主桥 · 高层',under_bridge:'桥下 · 低层',west_entry:'西桥口 · 高层',east_junction:'东接入口 · 高层',east_highwalk:'右高廊 · 高层',east_top:'右梯 · 顶台',east_upper_stair:'右梯 · 后跑',east_turn:'右梯 · 转台',east_lower_stair:'右梯 · 前跑',east_foot:'右梯 · 低层梯脚',low_door_front:'门前 · 仍为低街',quay_edge_north:'岸缘 · 北段',quay_edge_south:'岸缘 · 南段'};
const ids={upper_bridge:'bridge',under_bridge:'underbridge',east_turn:'east-turn',east_upper_stair:'east-flight',east_top:'east-top',low_door_front:'door'};
export function createHarborReview(world,profile,sourceAnchors){
 const adapter=createHarborNavigation(world,profile),snapshot=adapter.snapshot;
 const project=pos=>projectPhysical(adapter.physical(pos)).artPixelAspectFit;
 const anchors=Object.keys(labels).map(sourceId=>{const a=sourceAnchors[sourceId];if(!a)throw Error('MISSING_FROZEN_ANCHOR:'+sourceId);snapshot.validatePosition(a.position);return {id:ids[sourceId]??sourceId,sourceId,label:labels[sourceId],position:a.position,surfaceId:a.position.surfaceId,world:[a.physical.X,a.physical.Y,a.physical.Z],pixel:project(a.position),default:sourceId==='quay',occlusionUnverified:true};});
 function positionForAnchor(id){const a=anchors.find(a=>a.id===id);if(!a)throw Error('UNKNOWN_ANCHOR');return snapshot.validatePosition(a.position);}
 function resolveTarget(pixel){return nearestProjectedCandidate(anchors,pixel,22);}
 function routeTo(current,target){
  // Only explicit visible QA target identities. No unqualified XY cell/layer picking.
  if(!anchors.includes(target)&&!anchors.some(a=>a.id===target.id&&a.surfaceId===target.surfaceId))return null;
  const path=snapshot.findPath(current,positionForAnchor(target.id));
  return path?Object.freeze({certified:path,length:path.length,start:path.start,targetId:target.id,routeId:`physical-to-${target.id}`}):null;
 }
 const nav=Object.freeze({profile:snapshot.profile,advance(path,cursor,current,budget){return snapshot.advance(path.certified,cursor,current,budget);}});
 return {nav,anchors,project,resolveTarget,routeTo,positionForAnchor,physical:pos=>{const p=adapter.physical(pos);return {axes:'east,up,south',xyz:[p.X,p.Y,p.Z]};},scope:'static physical footprint review only; painted edges, occlusion and body/animation unaccepted'};
}
async function checkedJSON(url,expected){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error('MISSING_HARBOR_DOCUMENT');const bytes=await r.arrayBuffer();if(expected){const digest=await crypto.subtle.digest('SHA-256',bytes),hex=[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');if(hex!==expected)throw Error('HARBOR_DOCUMENT_HASH_MISMATCH');}return JSON.parse(new TextDecoder().decode(bytes));}
export async function createNavigation(){const [world,anchors,profile]=await Promise.all([checkedJSON('data/harbor-reviewed-world.json',WORLD_SHA256),checkedJSON('data/harbor-reviewed-anchors.json',ANCHORS_SHA256),checkedJSON('data/harbor-actor-profile.json')]);return createHarborReview(world,profile,anchors);}
