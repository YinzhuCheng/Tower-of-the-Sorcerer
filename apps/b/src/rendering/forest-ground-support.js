import{FOREST_GROUND_MESH as mesh}from'./forest-ground-mesh.js';
import{NATIVE_FOREST_WORLD as contract}from'./forest-world-contract.js';
// Spatial bins reference only the original saved-native support triangles.
// Decorative banks, tree cards and all new props never become walking support.
const bins=new Map(),key=(x,y)=>`${x},${y}`;
for(let i=0;i<mesh.triangles.length;i++){const ps=mesh.triangles[i].map(j=>mesh.vertices[j]),xs=ps.map(p=>p[0]),ys=ps.map(p=>p[1]);for(let y=Math.floor(Math.min(...ys));y<=Math.floor(Math.max(...ys));y++)for(let x=Math.floor(Math.min(...xs));x<=Math.floor(Math.max(...xs));x++){const k=key(x,y);if(!bins.has(k))bins.set(k,[]);bins.get(k).push(i);}}
export function nativeGroundSupportAt(anchor,dx=0,dy=0){if(!anchor?.worldFootM||!Number.isFinite(dx)||!Number.isFinite(dy))return null;const x=anchor.worldFootM[0]+dx,y=anchor.worldFootM[1]+dy;let z=null;
 for(const i of bins.get(key(Math.floor(x),Math.floor(y)))??[]){const[a,b,c]=mesh.triangles[i].map(j=>mesh.vertices[j]),det=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(det)<1e-12)continue;const u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/det,v=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/det;if(u>=-1e-6&&v>=-1e-6&&u+v<=1+1e-6){const candidate=u*a[2]+v*b[2]+(1-u-v)*c[2];z=z===null?candidate:Math.max(z,candidate);}}
 if(z===null)return null;const worldFootM=[x,y,z],a=contract.affine,footPx=[a.origin_px[0]+x*a.x_m[0]+y*a.y_m[0]+z*a.z_m[0],a.origin_px[1]+x*a.x_m[1]+y*a.y_m[1]+z*a.z_m[1]],d=worldFootM.map((v,i)=>v-anchor.worldFootM[i]);return{worldFootM,footPx,footDepthM:anchor.footDepthM+d.reduce((s,v,i)=>s+v*contract.camera.forward[i],0),source:'saved-native-support-triangle'};
}
