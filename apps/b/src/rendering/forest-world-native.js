import {buildHeroNeutralFrame,drawHeroNeutral} from './hero-neutral.js';
import {projectNativeWorldPoint,occludeNativeHeroNode} from './forest-hero-depth.js';
import {drawForestProp,forestPropBounds,forestPropContacts,drawForestContact} from './forest-scene-props.js';
import {nativeGroundSupportAt} from './forest-ground-support.js';
export {nativeGroundSupportAt};
import { FOREST_WORLD_RUNTIME_ASSETS } from './forest-world-runtime-assets.js';
import { NATIVE_FOREST_WORLD as contract } from './forest-world-contract.js';
import { FOREST_WORLD_REGISTRATION, worldPoint } from './forest-world.js';
const cells=new Map(contract.cells.map(c=>[`${c.sourceRegionId}:${c.localX},${c.localY}`,c]));
export const nativeWorldContract=()=>contract;
export const nativeWorldCell=(regionId,x,y)=>cells.get(`${regionId}:${x},${y}`);
const segments=[...contract.edges.map(e=>({a:worldPoint({regionId:e.sourceRegionId,x:e.from[0],y:e.from[1]}),b:worldPoint({regionId:e.sourceRegionId,x:e.to[0],y:e.to[1]}),samples:e.samples})),...contract.joins.map(e=>({a:worldPoint({regionId:e.from,x:e.fromCell[0],y:e.fromCell[1]}),b:worldPoint({regionId:e.to,x:e.toCell[0],y:e.toCell[1]}),samples:e.samples}))];
function interpolate(samples,t){const value=Math.max(0,Math.min(1,t))*(samples.length-1),i=Math.min(samples.length-2,Math.floor(value)),f=value-i,a=samples[i],b=samples[i+1],lerp=(x,y)=>x+(y-x)*f;return{footPx:a.footPx.map((v,j)=>lerp(v,b.footPx[j])),worldFootM:a.worldFootM.map((v,j)=>lerp(v,b.worldFootM[j])),footDepthM:lerp(a.footDepthM,b.footDepthM)};}
// Exact native floor/edge/join samples are the presentation authority. Camera
// translation never guesses support from a screenshot or a flat grid plane.
export function nativeWorldSample(point){
 if(!point||!Number.isFinite(point.x)||!Number.isFinite(point.y))return null;
 for(const s of segments){const dx=s.b.x-s.a.x,dy=s.b.y-s.a.y,len=dx*dx+dy*dy,t=((point.x-s.a.x)*dx+(point.y-s.a.y)*dy)/len;if(t>=-1e-7&&t<=1+1e-7&&Math.abs((point.x-s.a.x)*dy-(point.y-s.a.y)*dx)<1e-6)return interpolate(s.samples,t);}
 for(const [id,o]of Object.entries(FOREST_WORLD_REGISTRATION.regions)){const x=point.x-o[0]-.5,y=point.y-o[1]-.5;if(Math.abs(x-Math.round(x))<1e-6&&Math.abs(y-Math.round(y))<1e-6)return nativeWorldCell(id,Math.round(x),Math.round(y))??null;}return null;
}
export function nativeViewport(width,height){const scale=Math.max(.84,Math.min(1.25,width/700));return {width,height,scale};}
export const nativeToScreen=(point,camera,view)=>({x:(point[0]-camera.x)*view.scale+view.width/2,y:(point[1]-camera.y)*view.scale+view.height*.56});
export function projectNativeControl(tile,cell,camera,view){if(!cell)return;const p=cell.groundPolygonPx.map(point=>nativeToScreen(point,camera,view)),xs=p.map(p=>p.x),ys=p.map(p=>p.y),left=Math.min(...xs),top=Math.min(...ys),width=Math.max(...xs)-left,height=Math.max(...ys)-top;Object.assign(tile.style,{position:'absolute',left:`${left}px`,top:`${top}px`,width:`${width}px`,height:`${height}px`,clipPath:`polygon(${p.map(p=>`${100*(p.x-left)/width}% ${100*(p.y-top)/height}%`).join(',')})`});}
let assets=null,started=false;const failures=[];
export function nativeWorldAvailability(){return{ready:Boolean(assets),failed:[...failures],width:contract.width,height:contract.height};}
export function preloadNativeWorld(onChange){if(started||typeof Image!=='function'||typeof document==='undefined')return;started=true;const loaded={};
 for(const id of['backdrop','depth']){const image=new Image();image.onload=()=>{if(image.naturalWidth!==contract.width||image.naturalHeight!==contract.height){failures.push(id+': dimensions');onChange?.();return;}loaded[id]=image;
  if(loaded.backdrop&&loaded.depth){try{const canvas=document.createElement('canvas');canvas.width=contract.width;canvas.height=contract.height;const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(loaded.depth,0,0);assets={backdrop:loaded.backdrop,depth:c.getImageData(0,0,contract.width,contract.height).data};onChange?.();}catch(error){failures.push('depth decode: '+error.message);onChange?.();}}
 };image.onerror=()=>{failures.push(id);onChange?.();};image.src=new URL('../../'+FOREST_WORLD_RUNTIME_ASSETS[id].file,import.meta.url).href;}
}
export const nativeWorldAssets=()=>assets;
export function occludeNativeSprite(rgba,width,height,left,top,sample,depth,encoding=contract.depthEncoding){
 if(!encoding)throw new Error('Native depth encoding is missing');const near=encoding.nearM??encoding.near,far=encoding.farM??encoding.far,zScale=-contract.affine.z_m[1],forwardZ=contract.camera.forward[2];let covered=0;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*4;if(!rgba[i+3])continue;const ax=Math.floor(left+x),ay=Math.floor(top+y);if(ax<0||ax>=contract.width||ay<0||ay>=contract.height)continue;const di=(ay*contract.width+ax)*4;if(!depth[di+3]||!depth[di+2])continue;const nativeDepth=near+(depth[di]*256+depth[di+1])/65535*(far-near),heightM=(sample.footPx[1]-(top+y+.5))/zScale,actorDepth=sample.footDepthM+forwardZ*heightM;
  if(nativeDepth<actorDepth-.015){rgba[i+3]=0;covered++;}
 }return covered;
}
// Ground-contact shadows have their own support-space depth, separate from
// vertical actor columns. The blue flag means occluding geometry, NOT ground.
export function nativeSupportAtPixel(sample,px,py){
 if(!sample?.worldFootM)return null;const dx=(px-sample.footPx[0])/contract.affine.x_m[0],dy=py-sample.footPx[1];let offsetY=dy/contract.affine.y_m[1],ground=null;
 for(let i=0;i<3;i++){ground=nativeGroundSupportAt(sample,dx,offsetY);if(!ground)return null;offsetY=(dy-(ground.worldFootM[2]-sample.worldFootM[2])*contract.affine.z_m[1])/contract.affine.y_m[1];}return ground;
}
export function occludeNativeGroundShadow(rgba,width,height,left,top,sample,depth,encoding=contract.depthEncoding){
 const near=encoding.nearM??encoding.near,far=encoding.farM??encoding.far;let covered=0;
 for(let py=0;py<height;py++)for(let px=0;px<width;px++){const i=(py*width+px)*4;if(!rgba[i+3])continue;const x=Math.floor(left+px),y=Math.floor(top+py);if(x<0||x>=contract.width||y<0||y>=contract.height){rgba[i+3]=0;continue;}const di=(y*contract.width+x)*4;
  if(!depth[di+3]){rgba[i+3]=0;continue;}
  const ground=sample.worldFootM?nativeSupportAtPixel(sample,left+px+.5,top+py+.5):null;if(sample.worldFootM&&!ground){rgba[i+3]=0;covered++;continue;}if(!depth[di+2])continue;
  const foregroundDepth=near+(depth[di]*256+depth[di+1])/65535*(far-near),dy=(top+py+.5)-sample.footPx[1],groundDepth=ground?.footDepthM??sample.footDepthM+dy/contract.affine.y_m[1]*contract.camera.forward[1];
  if(foregroundDepth<groundDepth-(encoding.depthBiasM??.015)){rgba[i+3]=0;covered++;}
 }return covered;
}
function badge(ctx,label,x,y,view,color='#f5e0a9'){ctx.save();ctx.font=`600 ${12/view.scale}px system-ui,sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';const w=ctx.measureText(label).width;ctx.fillStyle='#102018e6';ctx.fillRect(x-w/2-5/view.scale,y-8/view.scale,w+10/view.scale,18/view.scale);ctx.fillStyle=color;ctx.fillText(label,x,y+1/view.scale);ctx.restore();}
export function drawNativeForestWorld(ctx,model,motion,native,{width=800,height=500,dpr=1,readable=false,selected=null,image,heroMotionImage,heroDiagnosticFrame=null,drawHeroDiagnosticNode=null,createLayer,camera}={}){
 const hero=nativeWorldSample(motion.hero??model.hero);if(!hero)return null;camera??={x:hero.footPx[0],y:hero.footPx[1]};const view=nativeViewport(width,height),zoom=view.scale;
 ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#14271f';ctx.fillRect(0,0,width,height);ctx.translate(width/2-camera.x*zoom,height*.56-camera.y*zoom);ctx.scale(zoom,zoom);ctx.drawImage(native.backdrop,0,0,contract.width,contract.height);
 if(readable){for(const c of model.cells){const cell=nativeWorldCell(c.regionId,c.localX,c.localY);if(!cell)continue;ctx.beginPath();ctx.moveTo(...cell.groundPolygonPx[0]);cell.groundPolygonPx.slice(1).forEach(p=>ctx.lineTo(...p));ctx.closePath();ctx.fillStyle=c.passable?'#f6e09c2e':'#c779642e';ctx.fill();ctx.strokeStyle='#e7d39977';ctx.lineWidth=1.2/zoom;ctx.stroke();}}
 const objects=model.objects.map(o=>({...o,sample:nativeWorldCell(o.regionId,o.localX,o.localY)})).filter(o=>o.sample);objects.push({id:'hero',kind:'hero',sample:hero,active:true});objects.sort((a,b)=>b.sample.footDepthM-a.sample.footDepthM);let depthPixels=0,shadowPixels=0,drawn=0;const drawnObjects=[];let heroMode='canonical-static-fallback';const heroFeet=[],heroNodes=[];
 for(const o of objects){const sample=o.sample,[x,y]=sample.footPx,scr=nativeToScreen(sample.footPx,camera,view);if(scr.x< -100||scr.x>width+100||scr.y< -20||scr.y>height+140)continue;
  const h=-contract.affine.z_m[1]*1.66,frame=o.kind==='hero'&&heroMotionImage?(heroDiagnosticFrame??buildHeroNeutralFrame({facing:motion.facing,footPx:[x,y],pixelHeight:h,rootM:sample.worldFootM,projectWorld:projectNativeWorldPoint,sampleSupport:p=>nativeGroundSupportAt(sample,p[0]-sample.worldFootM[0],p[1]-sample.worldFootM[1])})):null,bounds=o.kind==='hero'?{left:-60,top:-h-20,right:60,bottom:20}:forestPropBounds(o),left=Math.floor(x+bounds.left),top=Math.floor(y+bounds.top),lw=Math.ceil(bounds.right-bounds.left),lh=Math.ceil(bounds.bottom-bounds.top),layer=createLayer(lw,lh),lc=layer.getContext('2d',{willReadFrequently:true});
  // Body and shadows are both derived only from the current visible objects.
  if(o.kind!=='anchor'){
   const contacts=frame?frame.feet.map(foot=>{const ground=nativeGroundSupportAt(sample,foot.worldM[0]-sample.worldFootM[0],foot.worldM[1]-sample.worldFootM[1]);return ground?{id:foot.id,sample:ground,x:ground.footPx[0]-x,y:ground.footPx[1]-y,rx:foot.id==='far'?3.5:4.1,ry:1.8,opacity:.28*(foot.fade??1),liftM:foot.liftM,sourceSole:foot.sourceSole}:null;}).filter(Boolean):o.kind==='hero'?[{id:'near',x:-3.2,y:0,rx:4.3,ry:1.8,opacity:.27},{id:'far',x:3.2,y:.2,rx:4.3,ry:1.8,opacity:.27}]:forestPropContacts(o);
   for(const contact of contacts){
    lc.clearRect(0,0,lw,lh);lc.save();lc.translate(x-left,y-top);drawForestContact(lc,contact);lc.restore();const ground=contact.sample??sample,shadow=lc.getImageData(0,0,lw,lh),masked=occludeNativeGroundShadow(shadow.data,lw,lh,left,top,ground,native.depth);shadowPixels+=masked;lc.clearRect(0,0,lw,lh);lc.putImageData(shadow,0,0);ctx.drawImage(layer,left,top);
    if(o.kind==='hero')heroFeet.push({id:contact.id,footPx:[x+contact.x,y+contact.y],worldFootM:ground.worldFootM,footDepthM:ground.footDepthM,liftM:contact.liftM??0,opacity:contact.opacity,maskedPixels:masked,sourceSole:contact.sourceSole});
   }
   const diagnostic=frame&&heroDiagnosticFrame&&typeof drawHeroDiagnosticNode==='function';
   if(diagnostic){heroMode='diagnostic-articulated-HOLD';for(const node of frame.nodes){lc.clearRect(0,0,lw,lh);lc.save();lc.translate(-left,-top);drawHeroDiagnosticNode(lc,heroMotionImage,frame,node);lc.restore();const pixels=lc.getImageData(0,0,lw,lh),masked=occludeNativeHeroNode(pixels.data,lw,lh,left,top,sample,node,native.depth);depthPixels+=masked;lc.clearRect(0,0,lw,lh);lc.putImageData(pixels,0,0);ctx.drawImage(layer,left,top);heroNodes.push({id:node.id,maskedPixels:masked,worldStartM:node.worldStartM,worldEndM:node.worldEndM});}}
   else{
    lc.clearRect(0,0,lw,lh);lc.save();lc.translate(x-left,y-top);
    if(frame){heroMode='four-facing-neutral';lc.translate(-x,-y);drawHeroNeutral(lc,heroMotionImage,frame);}
    else if(o.kind==='hero'){if(image){const k=h/1510;lc.drawImage(image,-590*k,-1523*k,1024*k,1536*k);}else{lc.fillStyle='#eee2c2';lc.beginPath();lc.arc(0,-25,13,0,Math.PI*2);lc.fill();}}
    else drawForestProp(lc,o);
    lc.restore();const pixels=lc.getImageData(0,0,lw,lh),masked=occludeNativeSprite(pixels.data,lw,lh,left,top,sample,native.depth);depthPixels+=masked;lc.clearRect(0,0,lw,lh);lc.putImageData(pixels,0,0);ctx.drawImage(layer,left,top);
    if(o.kind==='hero')heroNodes.push({id:frame?'source-neutral':'canonical-fallback',maskedPixels:masked});
   }
   drawn++;drawnObjects.push(o.id);
  }
  if(o.kind==='hero'){ctx.beginPath();ctx.ellipse(x,y,15,5,0,0,Math.PI*2);ctx.strokeStyle='#f5d88d';ctx.lineWidth=2/zoom;ctx.stroke();badge(ctx,'璃',x,y+17/zoom,view);}
  else if(o.kind==='anchor')badge(ctx,'↔ '+o.portal.to.slice(2),x,y+9/zoom,view,o.active?'#f5e0a9':'#b5c8ad');
  else if(readable)badge(ctx,o.title,x,y+18/zoom,view);
 }
 if(selected){const c=nativeWorldCell(selected.region,selected.x,selected.y);if(c){ctx.beginPath();ctx.moveTo(...c.groundPolygonPx[0]);c.groundPolygonPx.slice(1).forEach(p=>ctx.lineTo(...p));ctx.closePath();ctx.strokeStyle='#ffe8a4';ctx.lineWidth=2/zoom;ctx.stroke();}}
 ctx.restore();return{...view,camera:{...camera},hero:{x:hero.footPx[0],y:hero.footPx[1]},heroHeightPixels:-contract.affine.z_m[1]*1.66*zoom,visibleWorldWidth:width/zoom/(contract.metresPerCell*contract.affine.x_m[0]),regions:model.regions.map(r=>r.id),art:'native-shared-atlas',projection:'native',finite:true,depthPixels,shadowPixels,drawn,drawnObjects,heroMode,heroFeet,heroNodes};
}
