import {C_CAMERA,dot} from './core.mjs';
/** Orthographic ray through a native source-art pixel. The actor is an upright
 * view-facing plane through its real X/Z, NOT a screen-Y sorted sprite. */
function rayOrigin(pixel){const c=C_CAMERA;return c.target.map((v,i)=>v+c.right[i]*(pixel[0]-793)/c.pixelsPerMetre+c.up[i]*(496-pixel[1])/c.pixelsPerMetre);}
export function planeDepthAt(pixel,plane){const den=dot(plane.normal,C_CAMERA.forward);if(Math.abs(den)<1e-8)throw Error('DEPTH_PLANE_PARALLEL');return (plane.constant-dot(plane.normal,rayOrigin(pixel)))/den;}
export function actorDepthPlane(world){const f=C_CAMERA.forward,n=[f[0],0,f[2]];return {normal:n,constant:dot(n,world)};}
export function objectInFrontAt(pixel,plane,world){return planeDepthAt(pixel,plane)<planeDepthAt(pixel,actorDepthPlane(world))-1e-7;}
/** Clip each silhouette to the object's local ray-depth halfplane. */
export function depthClipPolygon(polygon,plane,world){
 const actor=actorDepthPlane(world),value=p=>planeDepthAt(p,actor)-planeDepthAt(p,plane)-1e-7;let result=[];
 for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length],va=value(a),vb=value(b),ia=va>=0,ib=vb>=0;if(ia)result.push(a);if(ia!==ib){const t=va/(va-vb);result.push(a.map((v,k)=>v+(b[k]-v)*t));}}
 return result.length>=3?result:[];
}
export function resolveDepthMasks(registry,pose){
 if(!Array.isArray(pose.world)||pose.world.length!==3||!pose.world.every(Number.isFinite))return [];
 return registry.filter(m=>m.enabled&&m.surfaceIds.includes(pose.surfaceId)).flatMap(m=>{const polygons=m.polygons.map(p=>depthClipPolygon(p,m.depthPlane,pose.world)).filter(p=>p.length>=3);return polygons.length?[{...m,polygons}]:[];});
}
export function strip(a,b,width){const dx=b[0]-a[0],dy=b[1]-a[1],n=Math.hypot(dx,dy),x=-dy/n*width/2,y=dx/n*width/2;return [[a[0]+x,a[1]+y],[b[0]+x,b[1]+y],[b[0]-x,b[1]-y],[a[0]-x,a[1]-y]];}
export const polyline=(points,width)=>points.slice(1).map((p,i)=>strip(points[i],p,width));
