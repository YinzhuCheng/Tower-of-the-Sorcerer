import { ACCEPTED_MAP_MATERIALS } from './material-assets.js';
// Presentation-only geometry. Never imports a campaign or dispatches actions.
export const MAP_ART_REVISION='continuous-samples-r1';
export const MATERIALS=Object.freeze({
 'dry-stone':{base:'#8c9290',line:'#6d7576',light:'#a3aaa4'},
 'dark-rock':{base:'#444d50',line:'#2b363b',light:'#647073'},
 'warm-planks':{base:'#94734d',line:'#574a3b',light:'#b39365'},
 'root-bark':{base:'#695339',line:'#443c2e',light:'#94794c'},
 'earth-moss':{base:'#7b8260',line:'#64694f',light:'#969876'},
 water:{base:'#284b59',line:'#345e6b',light:'#477781'},
 'dry-trench':{base:'#252d34',line:'#34434a',light:'#42545b'}
});
const key=([x,y])=>`${x},${y}`;
export function cellsWhere(map,predicate){const cells=[];map.forEach((row,y)=>[...row].forEach((token,x)=>{if(predicate(token,x,y))cells.push([x,y]);}));return cells;}
// Union boundary: shared cell edges disappear; collinear exposed edges merge.
// Convex/concave corners share exact vertices. Diagonal cells never gain area.
export function compileBoundaryRuns(cells,kind='wall'){
 const occupied=new Set(cells.map(key)),edges=[];
 for(const[x,y]of cells){for(const[dx,dy,a,b]of [[0,-1,[x,y],[x+1,y]],[1,0,[x+1,y],[x+1,y+1]],[0,1,[x,y+1],[x+1,y+1]],[-1,0,[x,y],[x,y+1]]])if(!occupied.has(`${x+dx},${y+dy}`))edges.push({a,b,side:`${dx},${dy}`});}
 const groups=new Map();for(const e of edges){const horizontal=e.a[1]===e.b[1],g=`${e.side}:${horizontal?e.a[1]:e.a[0]}`;if(!groups.has(g))groups.set(g,[]);groups.get(g).push(e);}
 const runs=[];for(const group of groups.values()){group.sort((a,b)=>a.a[0]-b.a[0]||a.a[1]-b.a[1]);let current;for(const e of group){if(current&&key(current.points[1])===key(e.a))current.points[1]=e.b;else{current={kind,side:e.side,points:[e.a,e.b]};runs.push(current);}}}return runs;
}
export const rect=(x,y,w,h,fill,stroke,lineWidth=.025,extra={})=>({type:'rect',x,y,w,h,fill,stroke,lineWidth,...extra});
export const line=(points,stroke,lineWidth=.04,extra={})=>({type:'path',points,stroke,lineWidth,...extra});
export const circle=(x,y,r,fill,stroke,lineWidth=.025,extra={})=>({type:'circle',x,y,r,fill,stroke,lineWidth,...extra});
export const label=(x,y,text,size=.2,fill='#f3ead4',extra={})=>({type:'text',x,y,text,size,fill,minPixels:8,...extra});
export function command(ctx,c,pixelScale=58){ctx.save();ctx.globalAlpha=c.alpha??1;ctx.lineWidth=c.lineWidth??.03;ctx.lineJoin='round';ctx.lineCap=c.lineCap??'round';if(c.fill)ctx.fillStyle=c.fill;if(c.stroke)ctx.strokeStyle=c.stroke;
 if(c.type==='text'){ctx.font=`600 ${Math.max(c.size??.2,(c.minPixels??0)/pixelScale)}px system-ui,sans-serif`;ctx.textAlign=c.align??'center';ctx.textBaseline='middle';ctx.fillText(c.text,c.x,c.y);}
 else{ctx.beginPath();if(c.type==='rect')ctx.rect(c.x,c.y,c.w,c.h);else if(c.type==='circle')ctx.arc(c.x,c.y,c.r,0,Math.PI*2);else if(c.points?.length){ctx.moveTo(...c.points[0]);for(const p of c.points.slice(1))ctx.lineTo(...p);if(c.closed)ctx.closePath();}if(c.fill)ctx.fill();if(c.stroke)ctx.stroke();}ctx.restore();}
const imageMaterials=new Map(),materialFailures=new Set();let materialListeners=new Set();
export function setMaterialImage(id,image,{mode='world-domain',period=4,periodX=4}={}){if(!MATERIALS[id])throw new Error(`Unknown map material ${id}`);imageMaterials.set(id,{image,mode,period,periodX});for(const f of materialListeners)f();}
// All marks are sampled in WORLD coordinates once, under a union mask. No cell UV reset.
function drawMaterial(ctx,id,width,height,uv={}){const m=MATERIALS[id]??MATERIALS['dry-stone'];ctx.fillStyle=m.base;ctx.fillRect(0,0,width,height);
 const asset=imageMaterials.get(id);if(asset){const[ox,oy]=uv.origin??[0,0];
  if(asset.mode==='repeat-preview'){const period=uv.period??asset.period;for(let y=oy+Math.floor(-oy/period)*period;y<height;y+=period)for(let x=ox+Math.floor(-ox/period)*period;x<width;x+=period)ctx.drawImage(asset.image,x,y,period,period);}
  else if(asset.mode==='repeat-x-preview'){const px=uv.periodX??asset.periodX,extentY=uv.height??height;for(let x=ox+Math.floor(-ox/px)*px;x<width;x+=px)ctx.drawImage(asset.image,x,oy,px,extentY);}
  else{const[x,y,w,h]=uv.domain??[0,0,width,height];if(uv.rotate===90){ctx.save();ctx.translate(x+w,y);ctx.rotate(Math.PI/2);ctx.drawImage(asset.image,0,0,h,w);ctx.restore();}else ctx.drawImage(asset.image,x,y,w,h);}return;}

 ctx.lineWidth=.012;ctx.strokeStyle=m.line;ctx.beginPath();
 if(id==='warm-planks'||id==='root-bark'){for(let x=.17;x<width;x+=.36){ctx.moveTo(x,0);ctx.lineTo(x,height);for(let y=(Math.round(x*100)%4)*.55;y<height;y+=2.35){ctx.moveTo(x,y);ctx.lineTo(x+.36,y);}}}
 else if(id==='dry-stone'){for(let y=.22;y<height;y+=.68){ctx.moveTo(0,y);ctx.lineTo(width,y);for(let x=(Math.round(y*10)%2)*.71;x<width;x+=1.43){ctx.moveTo(x,y);ctx.lineTo(x,y+.68);}}}
 else if(id==='water'){for(let y=.1;y<height;y+=.3)for(let x=((Math.round(y*10)%3)*.21);x<width;x+=1.6){ctx.moveTo(x,y);ctx.lineTo(x+.8,y-.05);}}
 else{for(let y=.13;y<height;y+=.47)for(let x=.21;x<width;x+=.67){const n=Math.sin(x*17.2+y*7.3);ctx.moveTo(x,y);ctx.lineTo(x+.22,y+n*.08);}}
 ctx.stroke();ctx.strokeStyle=m.light;ctx.lineWidth=.009;ctx.beginPath();for(let y=.31;y<height;y+=.83)for(let x=.19;x<width;x+=1.31){ctx.moveTo(x,y);ctx.lineTo(x+.28,y+.01);}ctx.stroke();
}
function surfacePath(ctx,s){ctx.beginPath();if(s.polygon?.length){ctx.moveTo(...s.polygon[0]);for(const p of s.polygon.slice(1))ctx.lineTo(...p);ctx.closePath();}else for(const[x,y]of s.cells??[])ctx.rect(x,y,1,1);}
function boundary(ctx,b){const p=b.points,scale=b.scale??1;if(!p?.length)return;const rail=b.kind==='rail',water=b.kind==='shore',trench=b.kind==='trench',cabinet=b.kind==='cabinet';
 command(ctx,line(p,water?'#aac0ad':trench?'#657576':cabinet?'#3d3028':'#202e33',(water?.035:rail?.11:.13)*scale));
 command(ctx,line(p,rail?'#b9ae86':cabinet?'#b69a68':water?'#7caca7':'#83908c',(rail?.047:.025)*scale));
 if(rail){const[a,z]=p,length=Math.hypot(z[0]-a[0],z[1]-a[1]),count=Math.ceil(length/(.55*scale));for(let i=0;i<=count;i++){const t=i/count;command(ctx,circle(a[0]+(z[0]-a[0])*t,a[1]+(z[1]-a[1])*t,.064*scale,'#d0bd8e','#343d39',.025));}}
}
export function renderContinuousMap(ctx,scene,{width=638,height=638,dpr=1}={}){
 const scale=Math.min(width/scene.width,height/scene.height),offsetX=(width-scene.width*scale)/2,offsetY=(height-scene.height*scale)/2;
 ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle=scene.background??'#192d35';ctx.fillRect(0,0,width,height);ctx.translate(offsetX,offsetY);ctx.scale(scale,scale);
 for(const s of scene.surfaces??[]){ctx.save();surfacePath(ctx,s);ctx.clip();drawMaterial(ctx,s.material,scene.width,scene.height,s.uv??(s.domain?{domain:s.domain}:{}));ctx.restore();}
 if(scene.ambient){ctx.save();ctx.globalAlpha=scene.ambient.alpha;ctx.fillStyle=scene.ambient.color;ctx.fillRect(0,0,scene.width,scene.height);ctx.restore();}
 for(const b of scene.boundaryRuns??[])boundary(ctx,b);
 for(const c of scene.structures??[])command(ctx,c,scale);for(const c of scene.objects??[])command(ctx,c,scale);if(materialFailures.size){command(ctx,rect(0,10.55,11,.45,'#142632'));command(ctx,label(5.5,10.77,'部分材质未载入 · 当前显示结构预览',.2,'#f1d28e'));}ctx.restore();
 return Object.freeze({scale,offsetX,offsetY,width,height,cellAt:(px,py)=>({x:Math.floor((px-offsetX)/scale),y:Math.floor((py-offsetY)/scale)})});
}
export function entityCommands(entity,{hero=false}={}){const x=entity.x+.5,y=entity.y+.5;
 if(hero)return [circle(x,y,.25,'#26394dcc','#e4d8b0',.045,{role:'temporary-player-position-marker'}),label(x,y,'璃',.24,'#fff2d1',{minPixels:10})];
 if(entity.kind==='enemy')return [circle(x,y+.21,.29,'#1a232a88'),rect(x-.26,y-.23,.52,.45,'#766c63','#362f2c',.04),circle(x-.25,y+.2,.12,'#343b3e','#a49f86'),circle(x+.25,y+.2,.12,'#343b3e','#a49f86'),rect(x-.16,y-.14,.32,.1,'#bf7560'),line([[x-.1,y-.3],[x+.09,y-.3]],'#d3ba80',.035)];
 if(entity.kind==='pickup')return [rect(x-.17,y-.16,.34,.33,'#b09257','#403b32',.035),line([[x-.18,y],[x+.18,y]],'#e1c98b',.045)];
 if(entity.kind==='anchor')return [line([[x-.24,y+.12],[x+.24,y+.12]],'#d9d0a6',.045),line([[x,y-.17],[x+.2,y+.03],[x-.2,y+.03],[x,y-.17]],'#d9d0a6',.045)];
 if(entity.kind==='shop')return [rect(x-.3,y-.15,.6,.28,'#aa8455','#473b32'),line([[x-.27,y+.18],[x-.27,y+.3]],'#594839',.07),line([[x+.27,y+.18],[x+.27,y+.3]],'#594839',.07)];
 return [circle(x,y,.14,'#798b85','#d8d2b1'),line([[x-.1,y],[x+.1,y]],'#d8d2b1',.035)];
}
let assetsStarted=false;
export function preloadMapMaterials(onChange){if(onChange)materialListeners.add(onChange);if(assetsStarted||typeof Image!=='function')return;assetsStarted=true;for(const a of ACCEPTED_MAP_MATERIALS){const image=new Image();image.onload=()=>setMaterialImage(a.id,image,a);image.onerror=()=>{materialFailures.add(a.id);console.warn(`Map material failed to load: ${a.id}; deterministic geometry remains visible`);for(const f of materialListeners)f();};image.src=new URL('../../'+a.file,import.meta.url).href;}}
const presentations=new WeakMap();
export function presentContinuousScene(canvas,board,scene){if(!canvas||!board)return;canvas.hidden=!scene;board.dataset.renderer=scene?'continuous':'legacy';if(!scene){canvas.dataset.region='';return;}
 let record=presentations.get(canvas);if(!record){record={scene};record.draw=()=>{if(canvas.hidden||canvas.dataset.region!==record.scene.regionId)return;const ctx=canvas.getContext?.('2d',{alpha:false});if(!ctx)return;const box=canvas.getBoundingClientRect?.(),size=box?.width||638,dpr=globalThis.devicePixelRatio||1;canvas.width=Math.round(size*dpr);canvas.height=Math.round(size*dpr);record.camera=renderContinuousMap(ctx,record.scene,{width:size,height:size,dpr});};presentations.set(canvas,record);if(typeof ResizeObserver==='function'){record.observer=new ResizeObserver(record.draw);record.observer.observe(canvas);}materialListeners.add(record.draw);}record.scene=scene;preloadMapMaterials();canvas.dataset.artRevision=scene.artRevision;canvas.dataset.region=scene.regionId;record.draw();return record.camera;
}
// Desktop B reserves the measured legend/pad/tool stack. Small screens scroll
// rather than shrinking 11 rows below a readable 28px target.
export function fitMapViewport({viewportHeight,top,trailing,width,minSize=308}){return Math.floor(Math.min(width,638,Math.max(Math.min(minSize,width),viewportHeight-top-trailing-16)));}
const viewportFits=new WeakMap();
export function fitCampaignMapViewport(canvas){const stage=canvas?.parentElement,section=stage?.parentElement;if(!stage||!section||typeof requestAnimationFrame!=='function')return;let update=viewportFits.get(stage);if(!update){update=()=>requestAnimationFrame(()=>{if(innerWidth<=680){stage.style.width='';stage.style.height='';stage.style.aspectRatio=stage.dataset.aspect||'1';return;}const siblings=[...section.children],index=siblings.indexOf(stage),style=getComputedStyle(section),width=section.getBoundingClientRect().width-parseFloat(style.paddingLeft||0)-parseFloat(style.paddingRight||0);let trailing=0;for(const child of siblings.slice(index+1)){if(child.hidden||getComputedStyle(child).display==='none')continue;const css=getComputedStyle(child);trailing+=child.getBoundingClientRect().height+parseFloat(css.marginTop||0)+parseFloat(css.marginBottom||0);}const ratio=Number(stage.dataset.aspect)||1,top=stage.getBoundingClientRect().top+scrollY,size=ratio===1?fitMapViewport({viewportHeight:innerHeight,top,trailing,width}):Math.floor(Math.min(width,850,Math.max(Math.min(308,width),(innerHeight-top-trailing-16)*ratio)));stage.style.width=`${size}px`;stage.style.height=`${size/ratio}px`;});viewportFits.set(stage,update);window.addEventListener('resize',update);}update();}
