import {NATIVE_FOREST_WORLD as contract} from './forest-world-contract.js';
export function projectNativeWorldPoint(p){const a=contract.affine;return a.origin_px.map((v,i)=>v+p[0]*a.x_m[i]+p[1]*a.y_m[i]+p[2]*a.z_m[i]);}
export function nativeDepthAtWorldPoint(p,root){return root.footDepthM+p.reduce((s,v,i)=>s+(v-root.worldFootM[i])*contract.camera.forward[i],0);}
// Diagnostic articulated nodes receive their own geometric depth, never the
// root-depth plane copied to both shoes. Neutral facing uses the whole sprite.
export function occludeNativeHeroNode(rgba,width,height,left,top,root,node,depth,encoding=contract.depthEncoding){
 const near=encoding.nearM??encoding.near,far=encoding.farM??encoding.far,zScale=-contract.affine.z_m[1],forwardZ=contract.camera.forward[2],a=node.bonePx[0],b=node.bonePx[1],dx=b[0]-a[0],dy=b[1]-a[1],length2=dx*dx+dy*dy;let covered=0;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*4;if(!rgba[i+3])continue;const ax=Math.floor(left+x),ay=Math.floor(top+y);if(ax<0||ay<0||ax>=contract.width||ay>=contract.height)continue;const di=(ay*contract.width+ax)*4;if(!depth[di+3]||!depth[di+2])continue;
  const px=left+x+.5,py=top+y+.5,t=length2?Math.max(0,Math.min(1,((px-a[0])*dx+(py-a[1])*dy)/length2)):0,world=node.worldStartM.map((v,j)=>v+(node.worldEndM[j]-v)*t),stationY=a[1]+dy*t;
  const actorDepth=nativeDepthAtWorldPoint(world,root)+forwardZ*(stationY-py)/zScale,nativeDepth=near+(depth[di]*256+depth[di+1])/65535*(far-near);
  if(nativeDepth<actorDepth-(encoding.depthBiasM??.015)){rgba[i+3]=0;covered++;}
 }return covered;
}
