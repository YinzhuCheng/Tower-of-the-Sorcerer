import {compileWorld} from './navigation.js';
export const REVIEW_SCOPE=Object.freeze({geometry:'r0.5.1-independent-reviewed-local-CANDIDATE',radius:.32,maxStep:.5,artStatus:'INCONCLUSIVE: manual-mask uncertainty, tread detail and occlusion remain unaccepted',movement:'named-path-only; no free roam or teleport',camera:{width:1180,height:664,u:[42,7,0,-2525],v:[0,-28,-40,2098]},adultHeightMetres:1.7,adultRuntimeHeightPx:68});
export const REVIEW_ANCHORS=Object.freeze({root:Object.freeze({cellId:'root-local',surfaceId:'S05_root_span',x:61.5,y:43.5}),tool:Object.freeze({cellId:'tool-bay',surfaceId:'S17_bay_and_top_landing',x:65,y:49.7}),west:Object.freeze({cellId:'upper-west',surfaceId:'S04_upper_span',x:59,y:54.4})});
const routes={'root-to-tool':['root','tool','rootFixed'],'tool-to-root':['tool','root','rootFixed'],'west-to-tool':['west','tool','enemyCleared']};
const same=(a,b)=>a?.cellId===b.cellId&&a?.surfaceId===b.surfaceId&&Math.hypot(a.x-b.x,a.y-b.y)<1e-8;
const requireThat=(x,msg)=>{if(!x)throw new Error(msg)};
/** Geometry review fixture only. No game state writes, inventory, event triggering or arbitrary screen-coordinate targets. */
export function createPaintedPathReview(spec){
 requireThat(spec.version===REVIEW_SCOPE.geometry,'Exact reviewed candidate version required; verify SHA256 from manifest before import');
 const world=compileWorld(spec,{id:'b-person',radius:.32,maxStep:.5,allowedModes:['person']});
 return Object.freeze({
  scope:REVIEW_SCOPE,anchors:REVIEW_ANCHORS,
  begin(routeId,current,state){
   const route=routes[routeId];requireThat(route,'Unknown review route');requireThat(state[route[2]]===true,`Route gate closed: ${route[2]}`);
   const nav=world.snapshot(state),start=REVIEW_ANCHORS[route[0]],target=REVIEW_ANCHORS[route[1]];requireThat(same(current,start),'Current position must already be at this route start; repositioning/snap is forbidden');nav.validatePosition(current);
   const path=nav.findPath(current,target);requireThat(path,'No legal path');let position=current,cursor=0;const stateKeys=Object.keys(state).sort(),snapshot=stateKeys.map(k=>state[k]);
   return Object.freeze({
    routeId,length:path.length,scope:REVIEW_SCOPE,
    status(){return Object.freeze({position:{...position},cursor,done:cursor>=path.length-1e-8,events:[]})},
    advance(dtSeconds,currentState,{speedMetresPerSecond=2.4,paused=false}={}){
     requireThat(currentState&&Object.keys(currentState).length===stateKeys.length&&stateKeys.every((k,i)=>currentState[k]===snapshot[i]),'State changed; stop and revalidate without teleporting');requireThat(Number.isFinite(dtSeconds)&&dtSeconds>=0,'Invalid elapsed time');requireThat(Number.isFinite(speedMetresPerSecond)&&speedMetresPerSecond>=0&&speedMetresPerSecond<=6,'Invalid review speed');
     // Discard suspended-frame time. Never spend an accumulated teleport budget.
     const budget=paused?0:Math.min(.5,speedMetresPerSecond*Math.min(dtSeconds,1/30));const next=nav.advance(path,cursor,position,budget);position=next.position;cursor=next.cursor;return next;
    },
    project(nativeWidth=1180,nativeHeight=664){const z=nav.heightAt(position),{x,y}=position;return Object.freeze({u:(42*x+7*y-2525)*nativeWidth/1180,v:(-28*y-40*z+2098)*nativeHeight/664,z,position:{...position},adultHeightPx:68*nativeHeight/664})}
   });
  }
 });
}
