import {FineHeroPresentation} from './fine-presentation.mjs';
import {WorldGait,v} from './gait-runtime.mjs';
import {NATIVE_FOREST_WORLD} from './forest-world-contract.js';
import {worldPoint} from './forest-world.js';
import {nativeWorldSample} from './forest-world-native.js';

// An explicit read-only presentation snapshot, never a fine-navigation position.
// Only the two existing authored joins qualify. The accepted coarse motion and
// native 65-sample strip remain the sole authorities for position and timing.
export function forestBridgeSnapshot(motion,previous=null){
 if(!motion?.hero||!motion.location||(!motion.crossing&&!previous))return null;
 for(const join of NATIVE_FOREST_WORLD.joins){
  const reverse=motion.location.regionId===join.from;
  if(!reverse&&motion.location.regionId!==join.to)continue;
  const fromRegionId=reverse?join.to:join.from,toRegionId=reverse?join.from:join.to;
  const a=worldPoint({regionId:join.from,x:join.fromCell[0],y:join.fromCell[1]}),b=worldPoint({regionId:join.to,x:join.toCell[0],y:join.toCell[1]}),dx=b.x-a.x,dy=b.y-a.y,t=((motion.hero.x-a.x)*dx+(motion.hero.y-a.y)*dy)/(dx*dx+dy*dy);
  if(t< -1e-7||t>1+1e-7||Math.abs((motion.hero.x-a.x)*dy-(motion.hero.y-a.y)*dx)>1e-6)continue;
  const id=join.id+(reverse?':reverse':':forward');
  if(!motion.crossing&&(previous?.id!==id||Math.abs(t-(reverse?0:1))>1e-7||motion.moving))continue;
  const physical=nativeWorldSample(motion.hero);if(!physical)return null;
  const segment=Math.min(join.samples.length-2,Math.max(0,Math.floor(t*(join.samples.length-1)))),a3=join.samples[segment].worldFootM,b3=join.samples[segment+1].worldFootM,sign=reverse?-1:1,yaw=Math.atan2(sign*(b3[0]-a3[0]),-sign*(b3[1]-a3[1]));
  return {schema:'forest-bridge-presentation/v1',id,fromRegionId,toRegionId,physical,moving:motion.moving,facing:motion.facing,yaw,progress:reverse?1-t:t};
 }
 return null;
}

// Fine navigation retains its existing controller contract. This narrow adapter
// keeps its disposable world feet only across an explicitly registered bridge;
// arbitrary region changes, loads, scene changes and unsupported paths reset.
export class ForestHeroPresentation extends FineHeroPresentation {
 finishFineApproach(snapshot){
  if(this.bridge||!this.gait||snapshot?.state.location.regionId!==this.regionId)return;
  this.snapshot=snapshot;
  // The portal callback arrives during the fine tick, before its usual visual
  // tick. Consume that last accepted source displacement once, retaining intent
  // until the pending bridge is bound; never consume the target logical centre.
  const moved=v.len(v.sub(snapshot.physical.worldFootM,this.gait.state.rootM))>1e-9;
  this.lastPose=this.gait.update({sceneToken:this.sceneToken,rootM:snapshot.physical.worldFootM,moving:moved||this.gait.state.moving,dt:0});
 }
 enterBridge({sceneToken,snapshot}){
  if(snapshot?.schema!=='forest-bridge-presentation/v1'||!snapshot.physical?.worldFootM)throw Error('Explicit native bridge presentation required');
  if(this.bridge){if(this.bridge.id!==snapshot.id)throw Error('Bridge changed without a presentation reset');}
  else if(this.gait){
   if(this.regionId!==snapshot.fromRegionId||snapshot.progress>1e-6||v.len(v.sub(this.gait.state.rootM,snapshot.physical.worldFootM))>2e-5)throw Error('Bridge must begin at the current accepted source foot');
  }else{
   this.generation++;this.stats.binds++;this.supportCaches=[new Map(),new Map()];this.sceneToken=sceneToken;this.regionId=snapshot.fromRegionId;this.lastTickId=-1;
   this.gait=new WorldGait({support:this.support,canPlace:p=>this.canPlace(p)});
   this.lastPose=this.gait.reset({sceneToken,rootM:snapshot.physical.worldFootM,yaw:snapshot.facing==='left'?-Math.PI/2:Math.PI/2,reason:'bridge-bind'});
  }
  if(!this.bridge&&snapshot.moving){
   // A newly accepted bridge may reverse while the previous stop is still
   // settling. Restore motion intent at ZERO accepted displacement first, then
   // let the unchanged gait's reversal planner retarget only the airborne foot.
   // This does not advance phase, time, the root, planted feet or campaign state.
   const rootM=[...this.gait.state.rootM];
   if(!this.gait.state.moving)this.lastPose=this.gait.update({sceneToken:this.sceneToken,rootM,moving:true,yaw:this.gait.state.targetYaw,dt:0});
   this.lastPose=this.gait.update({sceneToken:this.sceneToken,rootM,moving:true,yaw:snapshot.yaw,dt:0});
  }
  this.bridge=snapshot;return this.lease();
 }
 tickBridge({lease,snapshot,paused=false,dt=0,tickId}={}){
  if(!this.accepts(lease)){this.stats.staleCallbacks++;return null;}
  if(!this.bridge||snapshot?.id!==this.bridge.id)throw Error('Stale bridge presentation');
  if(tickId!==undefined&&tickId<=this.lastTickId){this.stats.duplicateTicks++;return this.lastPose;}
  if(tickId!==undefined)this.lastTickId=tickId;
  this.bridge=snapshot;
  this.lastPose=this.gait.update({sceneToken:this.sceneToken,rootM:snapshot.physical.worldFootM,moving:snapshot.moving,paused,dt});
  return this.lastPose;
 }
 resumeFine(snapshot,geometry){
  if(!this.bridge)return false;
  if(snapshot.state.location.regionId!==this.bridge.toRegionId||this.bridge.progress<1-1e-7||v.len(v.sub(snapshot.physical.worldFootM,this.gait.state.rootM))>2e-5)return false;
  this.geometry=geometry;this.regionId=snapshot.state.location.regionId;this.snapshot=snapshot;this.bridge=null;return true;
 }
 dispose(){this.bridge=null;super.dispose();}
}
