export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
export const sub=(a,b)=>a.map((x,i)=>x-b[i]);
export const normalize=v=>v.map(x=>x/Math.hypot(...v));
export const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
/** Aspect-preserving orthographic art registration. C physical axes X east,Y up,Z south. */
const eye=[-17,18,23],target=[2,2,-7];
const forward=normalize(sub(target,eye));
const right=normalize(cross(forward,[0,1,0]));
const up=normalize(cross(right,forward));
export const C_CAMERA=Object.freeze({eye,target,forward,right,up,pixelsPerMetre:1586/35,artFitHeight:1586*1050/1680,verticalOffset:(992-1586*1050/1680)/2});
export function projectHarborPhysical(p){const d=sub(p,target);return [793+dot(d,right)*C_CAMERA.pixelsPerMetre,496-dot(d,up)*C_CAMERA.pixelsPerMetre];}
/** B data is authored in the exact 1180x664 registration. Only coordinates receive the tiny original-raster ratio. */
export function projectForestPhysical(p){const [x,y,z]=p;return [(42*x+7*y-2525)*1672/1180,(-28*y-40*z+2098)*941/664];}
export function projectedAdultHeight(scene,metres=1.7){return scene==='forest'?40*metres*941/664:C_CAMERA.pixelsPerMetre*up[1]*metres;}
export function sceneProjection(scene,world){return scene==='forest'?projectForestPhysical(world):projectHarborPhysical(world);}
export function viewTransform({width,height,artWidth,artHeight,mode='frame',focus=[artWidth/2,artHeight/2],pan=[0,0],dpr=1}){
 if (![width,height,artWidth,artHeight,dpr].every(x=>Number.isFinite(x)&&x>0))throw Error('INVALID_VIEWPORT');
 // "native" means one source pixel per CSS pixel; DPR only affects the backing store.
 const scale=mode==='native'?1:Math.min(width/artWidth,height/artHeight,1);
 let x=(width-artWidth*scale)/2,y=(height-artHeight*scale)/2;
 if(mode==='native'){
  x=width/2-focus[0]*scale+pan[0];y=height*.57-focus[1]*scale+pan[1];
  x=artWidth*scale>width?clamp(x,width-artWidth*scale,0):(width-artWidth*scale)/2;
  y=artHeight*scale>height?clamp(y,height-artHeight*scale,0):(height-artHeight*scale)/2;
 }
 return {width,height,scale,x,y,dpr,backingWidth:Math.round(width*dpr),backingHeight:Math.round(height*dpr)};
}
export const artToScreen=(p,t)=>[p[0]*t.scale+t.x,p[1]*t.scale+t.y];
export const screenToArt=(p,t)=>[(p[0]-t.x)/t.scale,(p[1]-t.y)/t.scale];
export function heroPlacement(view,foot,physicalPixelHeight){
 if(!(view.referenceHeight>0&&physicalPixelHeight>0))throw Error('INVALID_HERO_HEIGHT');
 const scale=physicalPixelHeight/view.referenceHeight;
 return {scale,origin:[foot[0]-view.pivot[0]*scale,foot[1]-view.pivot[1]*scale],foot:[...foot],height:physicalPixelHeight};
}
export function pointInPolygon(point,poly){
 let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){
 const [xi,yi]=poly[i],[xj,yj]=poly[j];
 if(((yi>point[1])!==(yj>point[1]))&&(point[0]<(xj-xi)*(point[1]-yi)/(yj-yi)+xi))yes=!yes;
 }return yes;
}
/** No global Y sorting: each candidate mask is explicitly attached to a physical surface/pose. */
export function activeOccluders(registry,pose,enabled=false){return enabled?registry.filter(m=>m.enabled&&m.surfaceIds.includes(pose.surfaceId)&&(!m.anchorIds||m.anchorIds.includes(pose.id))):[];}
export function selectFacing(from,to,current='front'){
 const dx=to[0]-from[0],dy=to[1]-from[1];if(Math.hypot(dx,dy)<.01)return current;
 return Math.abs(dx)>Math.abs(dy)*.8?(dx>0?'right':'left'):(dy>0?'front':'back');
}
/** Advance only via the reviewed kernel with a bounded budget; a long frame never teleports. */
export function advanceReviewed(nav,route,current,dt,speed=1.35){
 if(!route)return {position:current,route:null};
 const budget=Math.min(nav.profile.maxStep,Math.max(0,Math.min(dt,.1))*speed);
 const next=nav.advance(route.path,route.cursor,current,budget);
 return {position:next.position,route:next.done?null:{path:route.path,cursor:next.cursor}};
}
export function nearestProjectedCandidate(candidates,point,maxPixels=24){
 const ranked=candidates.map(c=>({...c,distance:Math.hypot(c.pixel[0]-point[0],c.pixel[1]-point[1])})).filter(c=>c.distance<=maxPixels).sort((a,b)=>a.distance-b.distance);
 // Multiple layers at one click are never silently resolved by screen Y.
 return ranked.length>1&&ranked[0].surfaceId!==ranked[1].surfaceId&&Math.abs(ranked[0].distance-ranked[1].distance)<3?{ambiguous:true,candidates:ranked}:ranked[0]??null;
}
