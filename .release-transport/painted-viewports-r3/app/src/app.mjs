import {resolveDepthMasks} from './depth.mjs';
import {SCENES} from './scenes.mjs';
import {viewTransform,artToScreen,screenToArt,heroPlacement,advanceReviewed,selectFacing} from './core.mjs';
import {loadReviewedNavigation} from './navigation.mjs';
import {drawOriginalHero,redrawOriginalOccluder} from './render.mjs';
const $=s=>document.querySelector(s), canvas=$('#scene'),ctx=canvas.getContext('2d',{alpha:false}),stage=$('#stage');
const state={sceneId:'forest',anchorId:'bay',facing:'front',showHero:true,mode:innerWidth<=640?'native':'frame',pan:[0,0],feet:false,anchors:false,masks:false,loading:true,route:null,paused:false,position:null,navigation:{enabled:false},revision:0};
let heroMeta,heroImage,background,transform,lastTime=0,toastTimer,pointer=null,sceneSequence=0;
const imageCache=new Map();
const getImage=url=>{if(!imageCache.has(url))imageCache.set(url,new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error(`原图无法载入：${url}`));im.src=url;}));return imageCache.get(url);};
const scene=()=>SCENES[state.sceneId];
const anchor=()=>scene().anchors.find(a=>a.id===state.anchorId)??scene().anchors[0];
const foot=()=>state.position&&state.navigation.enabled?state.navigation.project(state.position):anchor().pixel;
const pose=()=>state.position?{...anchor(),surfaceId:state.position.surfaceId,world:state.navigation.physical(state.position).xyz}:anchor();
const toast=message=>{clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,3800);};
function outline(poly){ctx.beginPath();poly.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();}
function hero(){drawOriginalHero(ctx,heroImage,heroMeta.views[state.facing],foot(),scene().adultHeight);}
function overlays(){
 const f=foot(),h=scene().adultHeight;
 if(state.anchors){
  for(const a of scene().anchors){const [x,y]=a.pixel;ctx.strokeStyle=a.id===state.anchorId?'#fff0bd':'#edf4db99';ctx.lineWidth=1/transform.scale;ctx.beginPath();ctx.arc(x,y,5/transform.scale,0,Math.PI*2);ctx.stroke();ctx.font=`${11/transform.scale}px system-ui`;ctx.fillStyle='#eff3e2';ctx.strokeStyle='#101d21';ctx.lineWidth=3/transform.scale;ctx.strokeText(a.label,x+9/transform.scale,y-7/transform.scale);ctx.fillText(a.label,x+9/transform.scale,y-7/transform.scale);}
 }
 if(state.feet){
  ctx.strokeStyle='#fff2b9';ctx.lineWidth=1/transform.scale;ctx.setLineDash([4/transform.scale,3/transform.scale]);ctx.beginPath();ctx.moveTo(f[0]+19,f[1]);ctx.lineTo(f[0]+19,f[1]-h);ctx.stroke();ctx.setLineDash([]);
  ctx.beginPath();ctx.moveTo(f[0]-7,f[1]);ctx.lineTo(f[0]+7,f[1]);ctx.moveTo(f[0],f[1]-7);ctx.lineTo(f[0],f[1]+7);ctx.stroke();
  ctx.beginPath();ctx.arc(...f,2/transform.scale,0,Math.PI*2);ctx.fillStyle='#fff2b9';ctx.fill();
  const v=heroMeta.views[state.facing],p=heroPlacement(v,f,h);
  for(const sole of v.soleContacts??[]){const x=p.origin[0]+sole[0]*p.scale,y=p.origin[1]+sole[1]*p.scale;ctx.beginPath();ctx.arc(x,y,2/transform.scale,0,Math.PI*2);ctx.fillStyle='#a2e7e1';ctx.fill();}
 }
 if(state.masks)for(const m of resolveDepthMasks(scene().occluders,pose()))for(const polygon of m.polygons){outline(polygon);ctx.strokeStyle='#f8bd76';ctx.lineWidth=1/transform.scale;ctx.stroke();}
}
function render(){
 if(!heroMeta||!heroImage||!background||state.loading)return;
 const rect=stage.getBoundingClientRect(),dpr=devicePixelRatio||1;
 transform=viewTransform({width:rect.width,height:rect.height,artWidth:scene().size[0],artHeight:scene().size[1],mode:state.mode,focus:foot(),pan:state.pan,dpr});
 if(canvas.width!==transform.backingWidth||canvas.height!==transform.backingHeight){canvas.width=transform.backingWidth;canvas.height=transform.backingHeight;}
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#080d10';ctx.fillRect(0,0,rect.width,rect.height);
 ctx.translate(transform.x,transform.y);ctx.scale(transform.scale,transform.scale);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.globalAlpha=1;ctx.drawImage(background,0,0);
 if(state.showHero)hero();
 // Source-pixel silhouettes clipped by real-surface identity and local physical ray depth. No fades or hidden-floor invention.
 for(const mask of resolveDepthMasks(scene().occluders,pose()))redrawOriginalOccluder(ctx,background,mask);
 overlays();ctx.setTransform(dpr,0,0,dpr,0,0);state.revision++;updateMeasurements();
}
function updateMeasurements(){
 if(!transform)return;
 const p=pose(),f=foot();
 const fields=[['原画',`${scene().size.join(' × ')} px · 原始字节`],['显示',`${state.mode==='native'?'原像素':'完整画面'} · ${(transform.scale*100).toFixed(1)}%`],['人体',`1.70 m · ${(scene().adultHeight*transform.scale).toFixed(1)} 显示 px`],['参考脚位',`${f.map(n=>n.toFixed(1)).join(', ')} 原图 px`],['支撑面',p.surfaceId],['朝向',heroMeta.views[state.facing].label],['动作','四向中性参考；没有步行动画'],['遮挡',scene().occluders.length?'局部原图重绘 / 物理深度；待真图验收':'本场景尚无校准遮挡轮廓'],['导航',state.navigation.enabled?'命名路径限定；点击标记目标':'定位审阅；不开放自由走动']];
 const dl=$('#measurements');dl.replaceChildren(...fields.flatMap(([k,v])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=k;dd.textContent=v;return [dt,dd];}));
}
function syncUI(){
 document.querySelectorAll('[data-scene]').forEach(b=>{const selected=b.dataset.scene===state.sceneId;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
 document.querySelectorAll('[data-facing]').forEach(b=>{const selected=b.dataset.facing===state.facing;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
 $('#scene-title').textContent=scene().title;$('#scene-subtitle').textContent=scene().subtitle;
 $('#hero-toggle').setAttribute('aria-pressed',String(state.showHero));$('#frame-toggle').textContent=state.mode==='frame'?'原像素':'全画面';
 const nav=$('#nav-status');nav.textContent=state.navigation.enabled?(state.sceneId==='harbor'?'物理路径 · 原画待验':'限定路径 · 原画待验'):'定位审阅';nav.classList.toggle('enabled',state.navigation.enabled);
 const options=scene().anchors.map(a=>{const o=document.createElement('option');o.value=a.id;o.textContent=a.label;return o;});$('#anchor-select').replaceChildren(...options);$('#anchor-select').value=state.anchorId;
 $('#issue-list').replaceChildren(...scene().issues.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
 $('#scope-note').textContent=scene().note;
 $('#path-toggle').hidden=!state.navigation.enabled;$('#path-toggle').setAttribute('aria-pressed',String(state.anchors));$('#route-controls').hidden=!state.navigation.enabled;$('#pause-route').disabled=!state.route;$('#pause-route').textContent=state.paused?'继续':'暂停';$('#step-route').disabled=!state.route;$('#route-status').textContent=state.route?`${state.route.path.routeId??'物理审阅路径'} · ${state.route.cursor.toFixed(2)} / ${state.route.path.length.toFixed(2)} m · ${state.paused?'已暂停':'移动中'}`:'选择命名起点，显示定位点后点击目标';
 const warning=$('#scene-warning');warning.hidden=!anchor().occlusionUnverified;warning.textContent=state.sceneId==='harbor'?'物理脚域已测，原画贴合 / 遮挡未验收':'楼梯落脚与遮挡仍待实机验收';
 updateMeasurements();
}
async function setScene(id,requestedAnchor){
 if(!SCENES[id])throw Error('UNKNOWN_SCENE');
 const seq=++sceneSequence;state.loading=true;state.route=null;state.position=null;state.navigation={enabled:false};state.sceneId=id;state.anchorId=requestedAnchor&&SCENES[id].anchors.some(a=>a.id===requestedAnchor)?requestedAnchor:SCENES[id].anchors.find(a=>a.default).id;state.pan=[0,0];
 $('#load-status').textContent='正在载入原画…';$('#load-status').hidden=false;syncUI();
 try{const [bg,nav]=await Promise.all([getImage(scene().asset),loadReviewedNavigation(id)]);if(seq!==sceneSequence)return;
  background=bg;state.navigation=nav;
  if(nav.enabled){
   // Integrators supply reviewed display anchors and kernel positions together; no screen-only relocation.
   if(nav.anchors.length)SCENES[id].anchors=nav.anchors;
   if(!SCENES[id].anchors.some(a=>a.id===state.anchorId))state.anchorId=SCENES[id].anchors[0].id;
   state.position=nav.positionForAnchor(state.anchorId);
  }
  state.loading=false;$('#load-status').hidden=true;syncUI();render();
 }catch(error){if(seq!==sceneSequence)return;state.loading=true;$('#load-status').textContent=error.message;window.__PAINTED_REVIEW_ERROR__=error.message;}
}
function setAnchor(id){
 if(!scene().anchors.some(a=>a.id===id))throw Error('UNKNOWN_ANCHOR');
 state.route=null;state.anchorId=id;state.pan=[0,0];
 // Selector is explicitly a QA pose relocation, never represented as traversal.
 state.position=state.navigation.enabled?state.navigation.positionForAnchor(id):null;syncUI();render();
}
function clickWalk(point){
 if(!state.navigation.enabled){toast('当前是定位审阅。请用下方脚位切换；未开放自由走动。');return;}
 const target=state.navigation.resolveTarget(point,state.position);
 if(!target){toast('该处不在已核验的落脚目标内');return;}
 if(target.ambiguous){toast('此处包含不同高度的支撑面，请明确选择脚位');return;}
 try{const path=state.navigation.routeTo?state.navigation.routeTo(state.position,target):state.navigation.nav.findPath(state.position,target.position??target);
  if(!path){toast('没有已核验路径连接这两个脚位');return;}state.route={path,cursor:0};state.paused=false;syncUI();toast('按已核验限定路径移动 · 当前仍是静态参考姿势');
 }catch(error){state.route=null;toast('路径校验拒绝了这次移动');console.error(error);}
}
function moveTick(dt){
 if(!state.route||!state.navigation.enabled||state.loading)return;
 try{const before=foot(),r=advanceReviewed(state.navigation.nav,state.route,state.position,dt);state.position=r.position;if(!r.route&&state.route.path.targetId)state.anchorId=state.route.path.targetId;state.route=r.route;state.facing=selectFacing(before,foot(),state.facing);state.pan=[0,0];syncUI();render();}
 catch(error){state.route=null;toast('移动已停止：位置或路径校验不一致');console.error(error);}
}
function tick(time){const dt=lastTime?Math.max(0,(time-lastTime)/1000):0;lastTime=time;if(!state.paused)moveTick(dt);requestAnimationFrame(tick);}

function setQA(open){$('#qa-panel').hidden=!open;$('#qa-toggle').setAttribute('aria-expanded',String(open));}
for(const b of document.querySelectorAll('[data-scene]'))b.addEventListener('click',()=>setScene(b.dataset.scene));
for(const b of document.querySelectorAll('[data-facing]'))b.addEventListener('click',()=>{state.facing=b.dataset.facing;syncUI();render();});
$('#anchor-select').addEventListener('change',e=>setAnchor(e.target.value));
$('#hero-toggle').addEventListener('click',()=>{state.showHero=!state.showHero;syncUI();render();});
$('#frame-toggle').addEventListener('click',()=>{state.mode=state.mode==='native'?'frame':'native';state.pan=[0,0];syncUI();render();});
$('#path-toggle').addEventListener('click',()=>{state.anchors=!state.anchors;$('#anchors-overlay').checked=state.anchors;syncUI();render();if(state.anchors)toast('点击命名脚位目标沿限定路径移动。下方选择器仅作 QA 定位。');});
$('#pause-route').addEventListener('click',()=>{state.paused=!state.paused;syncUI();});$('#step-route').addEventListener('click',()=>{state.paused=true;moveTick(1/30);syncUI();});
$('#recenter').addEventListener('click',()=>{state.pan=[0,0];render();});
$('#qa-toggle').addEventListener('click',()=>setQA($('#qa-panel').hidden));$('#qa-close').addEventListener('click',()=>setQA(false));
for(const [selector,key] of [['#feet-overlay','feet'],['#anchors-overlay','anchors'],['#mask-overlay','masks']])$(selector).addEventListener('change',e=>{state[key]=e.target.checked;if(key==='masks'&&!scene().occluders.length&&state.masks)toast('尚无已核验遮挡轮廓；保持原图，不做伪遮挡');render();});
canvas.addEventListener('pointerdown',e=>{pointer={id:e.pointerId,x:e.clientX,y:e.clientY,pan:[...state.pan],moved:false};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId||state.mode!=='native')return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;if(Math.hypot(dx,dy)>4)pointer.moved=true;if(pointer.moved){state.pan=[pointer.pan[0]+dx,pointer.pan[1]+dy];render();}});
canvas.addEventListener('pointerup',e=>{if(!pointer||pointer.id!==e.pointerId)return;const moved=pointer.moved;pointer=null;if(!moved&&transform){const r=canvas.getBoundingClientRect();clickWalk(screenToArt([e.clientX-r.left,e.clientY-r.top],transform));}});
canvas.addEventListener('pointercancel',()=>pointer=null);
canvas.addEventListener('keydown',e=>{if(e.key==='Escape'){state.paused=true;syncUI();setQA(false);}if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();if(!state.navigation.enabled){toast('自由步行未启用；方向按钮只切换静态参考');return;}toast('仅开放命名脚位之间的限定路径；请打开定位点后点击目标');}});
new ResizeObserver(()=>render()).observe(stage);
document.addEventListener('visibilitychange',()=>{lastTime=0;if(document.hidden){state.paused=true;syncUI();}});
window.__PAINTED_REVIEW__={
 async setScene(id,anchorId){await setScene(id,anchorId);return this.getState();},
 setAnchor, beginRouteTo(id){const target=scene().anchors.find(a=>a.id===id);if(!target)throw Error('UNKNOWN_ANCHOR');clickWalk(target.pixel);},pause(value=true){state.paused=!!value;syncUI();},stepRoute(dt=1/30){state.paused=true;moveTick(dt);return this.getState();},setFacing(id){if(!heroMeta.views[id])throw Error('UNKNOWN_FACING');state.facing=id;syncUI();render();},
 setMode(mode){if(!['frame','native'].includes(mode))throw Error('UNKNOWN_MODE');state.mode=mode;state.pan=[0,0];syncUI();render();},
 setHero(yes){state.showHero=!!yes;syncUI();render();},setQA,
 setOverlay(key,value){const map={feet:'#feet-overlay',anchors:'#anchors-overlay',masks:'#mask-overlay'};if(!map[key])throw Error('UNKNOWN_OVERLAY');state[key]=!!value;$(map[key]).checked=!!value;render();},
 render,getState(){return {sceneId:state.sceneId,anchorId:state.anchorId,facing:state.facing,mode:state.mode,showHero:state.showHero,ready:!state.loading,revision:state.revision,foot:foot(),surfaceId:pose().surfaceId,position:state.position?{...state.position}:null,physicalWorld:state.position&&state.navigation.physical?state.navigation.physical(state.position):null,adultHeightNative:scene().adultHeight,transform,navigationEnabled:state.navigation.enabled,moving:!!state.route,paused:state.paused,routeProgress:state.route?{id:state.route.path.routeId,cursor:state.route.cursor,length:state.route.path.length}:null,animation:'neutral-reference-only',occlusion:'r3-local-ray-depth-original-pixels-pending-visual-review',activeOccluderIds:resolveDepthMasks(scene().occluders,pose()).map(m=>m.id),overlays:{feet:state.feet,anchors:state.anchors,masks:state.masks},issues:scene().issues,anchorIds:scene().anchors.map(a=>a.id)};}
};
try{[heroMeta,heroImage]=await Promise.all([fetch('data/hero-views.json').then(r=>{if(!r.ok)throw Error('人物视序记录无法载入');return r.json();}),getImage('assets/hero.png')]);await setScene('forest');requestAnimationFrame(tick);}catch(error){$('#load-status').textContent=error.message;window.__PAINTED_REVIEW_ERROR__=error.message;}
