import {compileWorld} from '../kernel/navigation.js';
export const ACTOR_RADIUS=0.18;
/** Browser-safe pure adapter. Caller supplies the exact bundled JSON documents. */
export function createHarborNavigation(world,profile){
 if(profile.radius!==ACTOR_RADIUS)throw new Error('C_ACTOR_RADIUS_IMMUTABLE');
 if(world.geometryId!=='C-M03-R7-local-physical-navigation')throw new Error('WRONG_HARBOR_GEOMETRY');
 const snapshot=compileWorld(world,profile).snapshot({});
 const pointIn=(p,poly)=>{let sign=0;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],v=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);if(Math.abs(v)<1e-8)continue;if(sign&&sign!==Math.sign(v))return false;sign=Math.sign(v);}return true};
 function locate(surfaceId,X,Z){if(typeof surfaceId!=='string')throw new Error('EXPLICIT_SURFACE_REQUIRED');const cell=world.cells.find(c=>c.surfaceId===surfaceId&&pointIn([X,-Z],c.polygon));if(!cell)return null;return snapshot.validatePosition({cellId:cell.id,surfaceId,x:X,y:-Z});}
 function physical(position){const p=snapshot.validatePosition(position);return {X:p.x,Y:snapshot.heightAt(p),Z:-p.y,cellId:p.cellId,surfaceId:p.surfaceId};}
 function authoredSupports(position){const p=snapshot.validatePosition(position);return world.floors.filter(f=>f.surfaceId===p.surfaceId&&pointIn([p.x,p.y],f.polygon)).map(f=>({floorId:f.id,authoredSurfaceId:f.authoredSurfaceId??null,authoredObject:f.authoredObject??null}));}
 // No unqualified screen/XY picking, movement snapping, cell reassignment or scene-state side effects.
 return Object.freeze({snapshot,locate,physical,authoredSupports,world,profile});
}
const position=[-17,18,23],target=[2,2,-7];
const sub=(a,b)=>a.map((v,i)=>v-b[i]);const dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0);const normalize=a=>a.map(v=>v/Math.hypot(...a));const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const forward=normalize(sub(target,position)),right=normalize(cross(forward,[0,1,0])),up=normalize(cross(right,forward));
export function projectPhysical({X,Y,Z}){const relative=sub([X,Y,Z],target);const geometry=[840+dot(relative,right)*48,525-dot(relative,up)*48];const scale=1586/1680;return Object.freeze({geometryPixel1680:geometry,artPixelAspectFit:[geometry[0]*scale,geometry[1]*scale+.375],legacyExpectedArtPixel:[geometry[0]*(1586/1680),geometry[1]*(992/1050)],mapping:'uniform scale1586/1680, content1586x991.25 centered y+.375 in1586x992; expected geometry, uncalibrated art'});}
