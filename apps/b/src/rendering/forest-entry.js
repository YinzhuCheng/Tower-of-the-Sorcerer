import { B01_PROJECTION, B01_ART_ASSETS } from './forest-entry-contract.js';
import { forestActionVisible } from '../campaigns/b/player-copy.js';
// Source-camera projection is presentation-only. Never grants a route or action.
export const B01_RENDER_REVISION='b01-source-render-r1';
const imageCache=new Map(),failures=new Set(),listeners=new Set();let started=false;
const contract=B01_PROJECTION;
export const forestEntryAssets=()=>B01_ART_ASSETS;
export const forestEntryContract=()=>contract;
const cellKey=(x,y)=>`${x},${y}`;
const cells=new Map(contract.cells.map(c=>[cellKey(c.x,c.y),c]));
export function forestEntryCell(x,y){return cells.get(cellKey(x,y))??null;}
export function entryPointToCell(px,py){
 // Convex projected source cell polygons, not CSS screen-space tile coordinates.
 for(const c of contract.cells){let sign=0,inside=true;for(let i=0;i<4;i++){const a=c.polygon[i],b=c.polygon[(i+1)%4],cross=(b[0]-a[0])*(py-a[1])-(b[1]-a[1])*(px-a[0]);if(Math.abs(cross)<1e-7)continue;const current=Math.sign(cross);if(sign&&current!==sign){inside=false;break;}sign=current;}if(inside)return{x:c.x,y:c.y};}return null;
}
export function projectForestEntry(runtime,state){
 const view=runtime.projectView(state);if(view.region.id!=='B-01'||runtime.identity.contentHash!==contract.contentHash||view.region.map.join('|')!==contract.map.join('|'))return null;
 const objects=view.entities.filter(e=>runtime.meets(state,e.visibleWhen)&&forestActionVisible(runtime,state,e)&&!e.completed).map(e=>({id:e.id,kind:e.kind,blocking:Boolean(e.blocking),title:e.title,x:e.x,y:e.y,cell:forestEntryCell(e.x,e.y),destination:e.portal?.to??null}));
 objects.push({id:'hero',kind:'hero',title:'璃',x:state.location.x,y:state.location.y,cell:forestEntryCell(state.location.x,state.location.y)});
 objects.sort((a,b)=>b.cell.depth-a.cell.depth||(a.kind==='hero'?1:-1));
 return {regionId:view.region.id,width:contract.width,height:contract.height,revision:B01_RENDER_REVISION,objects,cells:contract.cells.map(c=>({...c,passable:runtime.passable(state,c.x,c.y)}))};
}
export function projectEntryControl(tile,cell){
 const xs=cell.polygon.map(p=>p[0]),ys=cell.polygon.map(p=>p[1]),left=Math.min(...xs),top=Math.min(...ys),width=Math.max(...xs)-left,height=Math.max(...ys)-top;
 Object.assign(tile.style,{position:'absolute',left:`${100*left/contract.width}%`,top:`${100*top/contract.height}%`,width:`${100*width/contract.width}%`,height:`${100*height/contract.height}%`,clipPath:`polygon(${cell.polygon.map(p=>`${100*(p[0]-left)/width}% ${100*(p[1]-top)/height}%`).join(',')})`});
 tile.dataset.sourceCell=cellKey(cell.x,cell.y);tile.dataset.projectedFoot=cell.foot.join(',');
}
export function preloadForestEntry(onChange){if(onChange)listeners.add(onChange);if(started||typeof Image!=='function')return;started=true;for(const asset of B01_ART_ASSETS){const img=new Image();img.onload=()=>{if(img.naturalWidth!==asset.width||img.naturalHeight!==asset.height){failures.add(asset.id);}else imageCache.set(asset.id,img);if(failures.size||B01_ART_ASSETS.every(a=>imageCache.has(a.id)))for(const f of listeners)f();};img.onerror=()=>{failures.add(asset.id);for(const f of listeners)f();};img.src=new URL('../../'+asset.file,import.meta.url).href;}}
export function forestEntryAvailability(){return {ready:B01_ART_ASSETS.every(a=>imageCache.has(a.id)),loaded:imageCache.size,total:B01_ART_ASSETS.length,failed:[...failures]};}
const ellipse=(ctx,x,y,rx,ry,fill,stroke)=>{ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,2*Math.PI);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}};
function drawObject(ctx,o,images){const[x,y]=o.cell.foot,unit=contract.cellPixelWidth,small=unit*.25;
 if(o.kind==='hero'){
  const image=images.get('hero-standee'),height=Math.abs(o.cell.head166[1]-y),scale=height/(1523-13);if(image)ctx.drawImage(image,x-590*scale,y-1523*scale,1024*scale,1536*scale);return;
 }
 ctx.save();ctx.translate(x,y);ctx.lineWidth=Math.max(2,unit*.022);ctx.lineJoin='round';
 if(o.kind==='enemy'){
  // Independent old-timber-puppet cart, not a baked enemy or a borrowed identity.
  ctx.strokeStyle='#352c21';ctx.fillStyle='#8e603b';ctx.fillRect(-small,-small*1.3,small*2,small);ctx.strokeRect(-small,-small*1.3,small*2,small);ctx.fillStyle='#bc965b';ctx.fillRect(-small*.75,-small*1.62,small*1.5,small*.25);ctx.strokeRect(-small*.75,-small*1.62,small*1.5,small*.25);
  for(const wx of [-small*.77,small*.77])ellipse(ctx,wx,-small*.05,small*.24,small*.24,'#3d352b','#b69b62');
  ctx.strokeStyle='#e9d09c';ctx.beginPath();ctx.moveTo(-small*.4,-small*1.25);ctx.lineTo(small*.4,-small*.42);ctx.moveTo(small*.4,-small*1.25);ctx.lineTo(-small*.4,-small*.42);ctx.stroke();
 }else if(o.kind==='pickup'){
  ctx.fillStyle='#b7b5a0';ctx.strokeStyle='#41493c';ctx.beginPath();ctx.moveTo(-small*.7,-small*1.25);ctx.lineTo(small*.7,-small*1.25);ctx.lineTo(small*.55,-small*.35);ctx.lineTo(0,0);ctx.lineTo(-small*.55,-small*.35);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#efe5ac';ctx.beginPath();ctx.moveTo(0,-small*1.12);ctx.lineTo(0,-small*.2);ctx.stroke();
 }else if(o.kind==='anchor'){
  ctx.strokeStyle='#efdba6';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-small*.75,-small*.2);ctx.lineTo(small*.75,-small*.2);ctx.lineTo(small*.35,-small*.55);ctx.moveTo(small*.75,-small*.2);ctx.lineTo(small*.35,small*.14);ctx.stroke();
 }else{ellipse(ctx,0,-small*.35,small*.4,small*.4,'#899f71','#f4deb4');}
 ctx.restore();
}
export function drawForestEntry(ctx,model,images,{width=model.width,height=model.height,dpr=1,readable=false,selected=null,createLayer}={}){
 ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);ctx.fillStyle='#14271f';ctx.fillRect(0,0,width,height);ctx.scale(width/model.width,height/model.height);ctx.drawImage(images.get('backdrop'),0,0,model.width,model.height);
 if(readable){for(const c of model.cells.filter(c=>c.passable)){ctx.beginPath();ctx.moveTo(...c.polygon[0]);c.polygon.slice(1).forEach(p=>ctx.lineTo(...p));ctx.closePath();ctx.fillStyle='#f5df9240';ctx.fill();ctx.strokeStyle='#fff0b6a0';ctx.lineWidth=2;ctx.stroke();}}
 for(const o of model.objects){const[x,y]=o.cell.foot;
  ellipse(ctx,x,y,contract.cellPixelWidth*(o.kind==='hero'?.2:.25),contract.cellPixelWidth*.055,'#11190f88');
  const mask=images.get(o.cell.maskId);
  if(mask&&createLayer){const layer=createLayer(model.width,model.height),lc=layer.getContext('2d');lc.clearRect(0,0,model.width,model.height);drawObject(lc,o,images);lc.globalCompositeOperation='destination-out';lc.drawImage(mask,0,0,model.width,model.height);lc.globalCompositeOperation='source-over';ctx.drawImage(layer,0,0);}else drawObject(ctx,o,images);
  // Readability indicators are explicit UI, intentionally above real occlusion.
  if(o.kind==='hero'||readable){ellipse(ctx,x,y,contract.cellPixelWidth*.22,contract.cellPixelWidth*.085,'#11241322',o.kind==='hero'?'#f6e1a9':'#e3c881');}
  const occupiedByHero=model.objects.some(a=>a.kind==='hero'&&a.x===o.x&&a.y===o.y),samePortal=model.objects.find(a=>a.kind==='anchor'&&a.x===o.x&&a.y===o.y);
  if(o.kind==='hero'||(o.kind==='anchor'&&!occupiedByHero)||(readable&&o.kind!=='hero'&&o.kind!=='anchor')){const font=Math.max(18,11*model.width/width);ctx.font=`600 ${font}px "Noto Sans SC",sans-serif`;ctx.textAlign='center';ctx.fillStyle='#0d221bee';const text=o.kind==='hero'?`璃${samePortal?' · ↔ '+samePortal.destination.slice(2):''}`:o.kind==='anchor'?`↔ ${o.destination?.slice(2)??''}`:o.kind==='enemy'?'旧运木偶':'旧护片',tw=ctx.measureText(text).width;ctx.fillRect(x-tw/2-6,y+8,tw+12,font*1.35);ctx.fillStyle='#ffe4a8';ctx.fillText(text,x,y+8+font);}
 }
 if(selected?.region==='B-01'){const cell=forestEntryCell(selected.x,selected.y);ctx.beginPath();ctx.moveTo(...cell.polygon[0]);cell.polygon.slice(1).forEach(p=>ctx.lineTo(...p));ctx.closePath();ctx.strokeStyle='#fff1b7';ctx.lineWidth=3;ctx.stroke();}
 ctx.restore();return {width,height,objects:model.objects.map(o=>({id:o.id,kind:o.kind,foot:o.cell.foot,maskId:o.cell.maskId})),sourceCamera:true};
}
const displays=new WeakMap();
export function presentForestEntry(canvas,board,stage,model,{readable=false,selected=null}={}){
 if(!model||!forestEntryAvailability().ready||!canvas.getContext?.('2d'))return false;
 canvas.hidden=false;canvas.dataset.region='B-01';canvas.dataset.artRevision=B01_RENDER_REVISION;board.dataset.renderer='native-b01';stage.dataset.aspect=String(model.width/model.height);
 let display=displays.get(canvas);if(!display){display={};display.draw=()=>{if(canvas.hidden||canvas.dataset.region!=='B-01'||board.dataset.renderer!=='native-b01')return;const width=canvas.getBoundingClientRect?.().width||638,height=width*contract.height/contract.width,dpr=globalThis.devicePixelRatio||1;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);const createLayer=(w,h)=>{display.layer??=document.createElement('canvas');display.layer.width=w;display.layer.height=h;return display.layer;};drawForestEntry(canvas.getContext('2d'),display.model,imageCache,{width,height,dpr,readable:display.readable,selected:display.selected,createLayer});};displays.set(canvas,display);if(typeof ResizeObserver==='function'){display.observer=new ResizeObserver(display.draw);display.observer.observe(canvas);}}
 Object.assign(display,{model,readable,selected});display.draw();return true;
}
export function setStoryEntryBackdrop(image,scene){const asset=B01_ART_ASSETS.find(a=>a.id==='backdrop');image.hidden=scene.regionId!=='B-01';if(image.hidden)return;image.src=new URL('../../'+asset.file,import.meta.url).href;image.onerror=()=>{image.hidden=true;};}
