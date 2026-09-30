import * as THREE from 'three';
import { GEOMETRY as G, buildViewModel, logicalPoint, metricToCell, berthPoint, deckPoint, rigidYaw } from './c-three-model.js';
const v=p=>new THREE.Vector3(...p);
const COLORS={hull:0x243943,trim:0xb39c72,metal:0x5c7278,steel:0xa9b8b2,rope:0xd6be88,rack:0x726953,crate:0xbb915b,water:0x32616b,stone:0x81908d};
export function makeCamera(model,width=700,height=600){
 const aspect=width/height,halfH=model.deck?Math.max(4.65,4.4/aspect):Math.max(6.9,6.9/aspect),halfW=halfH*aspect,camera=new THREE.OrthographicCamera(-halfW,halfW,halfH,-halfH,.1,100);
 const target=v(rigidYaw(model.deck?[.3,.6,0]:[.5,.6,0],model.yaw));
 camera.position.copy(target).add(new THREE.Vector3(5.0,13.5,8.0));camera.lookAt(target);camera.updateMatrixWorld(true);return camera;
}
export function projectLogical(camera,model,x,y,width,height){const p=v(rigidYaw(logicalPoint(model.regionId,x,y),model.yaw)).project(camera);return {x:(p.x+1)*width/2,y:(1-p.y)*height/2};}
export function pickLogical(camera,model,px,py,width,height){
 const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(px/width*2-1,1-py/height*2),camera);
 const point=ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-G.hull.deckY),new THREE.Vector3());
 if(!point)return null;const cell=metricToCell(model.regionId,rigidYaw(point.toArray(),-model.yaw));return cell.x>=0&&cell.y>=0&&cell.x<11&&cell.y<11?cell:null;
}
export async function createThreeScene({canvas,labels,runtime,onPick,onFailure,onStats}){
 const context=canvas.getContext('webgl2',{alpha:false,antialias:true,powerPreference:'low-power'});if(!context)throw new Error('WebGL2 unavailable');
 const renderer=new THREE.WebGLRenderer({canvas,context,antialias:true,alpha:false,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0x102832);
 const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xe8f1dd,0x26404a,2.1));const sun=new THREE.DirectionalLight(0xffe5b1,2.4);sun.position.set(-5,11,3);scene.add(sun);
 let root=null,model=null,camera=null,active=true,disposed=false,labelsVisible=true,lastState=null;
 const textureLoader=new THREE.TextureLoader(),textures=new Map();
 for(const id of ['warm-planks','water','dry-stone']){
  const tex=await textureLoader.loadAsync(new URL(`../../assets/continuous-map/${id}.webp`,import.meta.url).href);
  tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.ClampToEdgeWrapping;tex.anisotropy=Math.min(2,renderer.capabilities.getMaxAnisotropy());textures.set(id,tex);
 }
 const physical=await(await fetch(new URL('../../geometry/vessel-physical-geometry-v1.2.json',import.meta.url))).json();
 if(physical.identity.contentHash!==runtime.identity.contentHash||physical.geometry.geometryId!==G.geometryId)throw new Error('Physical mesh identity mismatch');
 function material(color,extra={}){return new THREE.MeshLambertMaterial({color,...extra});}
 const materials={hull:material(COLORS.hull),trim:material(COLORS.trim),metal:material(COLORS.metal),steel:material(COLORS.steel),rope:material(COLORS.rope),rack:material(COLORS.rack),crate:material(COLORS.crate),dark:material(0x253a3d),gold:material(0xeacb8c),slot:material(0x899590),marker:new THREE.MeshBasicMaterial({color:0xffe8b0,side:THREE.DoubleSide}),water:material(0x547d86,{map:textures.get('water')}),wood:material(0xc5b08b,{map:textures.get('warm-planks')}),stone:material(0xa2aaa0,{map:textures.get('dry-stone')})};
 function mesh(geometry,mat,position,name){const m=new THREE.Mesh(geometry,typeof mat==='string'?materials[mat]:mat);if(position)m.position.copy(v(position));m.name=name??'';root.add(m);return m;}
 function box(position,size,mat,name){return mesh(new THREE.BoxGeometry(...size),mat,position,name);}
 function rod(a,b,r=.025,mat='metal',name){const vector=v(b).sub(v(a));const m=mesh(new THREE.CylinderGeometry(r,r,vector.length(),8),mat,v(a).add(v(b)).multiplyScalar(.5).toArray(),name);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vector.normalize());return m;}
 function wheel(position,r=.13,axis='z',name){const m=mesh(new THREE.TorusGeometry(r,.026,6,16),'trim',position,name);if(axis==='x')m.rotation.y=Math.PI/2;for(let i=0;i<4;i++){const a=i*Math.PI/2,delta=axis==='x'?[0,Math.cos(a)*r,Math.sin(a)*r]:[Math.cos(a)*r,Math.sin(a)*r,0];rod(position,position.map((p,k)=>p+delta[k]),.015,'trim');}return m;}
 function line(points,r=.018,mat='rope',name){for(let i=1;i<points.length;i++)rod(points[i-1],points[i],r,mat,`${name??'line'}-${i}`);}
 function surface(points,y,mat,domain,name){const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z))),geo=new THREE.ShapeGeometry(shape);geo.rotateX(-Math.PI/2);const pos=geo.attributes.position,uv=geo.attributes.uv;for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)-domain[0])/domain[2],1-(pos.getZ(i)-domain[1])/domain[3]);return mesh(geo,mat,[0,y,0],name);}
 function clearRoot(){if(!root)return;scene.remove(root);root.traverse(o=>o.geometry?.dispose());root=null;labels.replaceChildren();}
 function tag(text,position,{kind='fixture',id='',cell=null}={}){const el=document.createElement(cell?'button':'span');el.className=`world-label ${kind}`;el.textContent=text;el.dataset.entityId=id;el._position=position;if(cell){el.type='button';el.title=`交互标记（非物体）：${text}`;el.onclick=e=>{e.stopPropagation();onPick(...cell);};}labels.append(el);return el;}
 function hull(){
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(physical.mesh.vertices.flat(),3));geo.setIndex(physical.mesh.triangles.flat());geo.computeVertexNormals();mesh(geo,'hull',[0,0,0],G.geometryId);
  surface(G.hull.outlineXZ,.807,'wood',[-3.3,-3,6.6,6.6],'continuous-deck');
  // The two rail runs leave exactly one starboard opening; cutaway-height rail is intentional.
  for(const pts of [[[-1.5,.94,-2.4],[-1.5,.94,3]],[[1.5,.94,-2.4],[1.5,.94,1.26]],[[1.5,.94,1.74],[1.5,.94,3]],[[1.5,.94,3],[-1.5,.94,3]],[[0,.94,-3],[1.5,.94,-2.4]],[[-1.5,.94,-2.4],[0,.94,-3]]])line(pts,.035,'trim','cutaway-rail');
  for(const x of[-1.5,1.5])for(let z=-2.2;z<=3;z+=.65){if(x>0&&z>1.1&&z<1.9)continue;rod([x,.8,z],[x,.96,z],.025,'metal','rail-post');}
  const [a,b]=G.berthSampling.gangwayCenterlineGrid.map(p=>berthPoint(p));box([(a[0]+b[0])/2,.80,a[2]],[b[0]-a[0],.09,G.berthSampling.gangwayWidth],'rack','unique-gangway');for(let x=a[0];x<=b[0];x+=.13)rod([x,.854,a[2]-.21],[x,.854,a[2]+.21],.009,'trim','gangway-plank');
  for(const[id,p]of Object.entries(G.fixtures.cargoRack.poses)){const[x,,z]=deckPoint(p);box([x,.86,z],[.47,.11,.43],'dark',`rack-${id}`);for(const dx of[-.21,.21])box([x+dx,.93,z],[.025,.13,.4],'steel');}
  // Flush recessed socket lids and low weight tops never become tall walk-blocking boxes.
  for(const s of model.slots){const[x,,z]=s.position;box([x,.819,z],[.36,.021,.32],'dark',`socket-${s.id}`);box([x,.833,z],[.3,.009,.26],'slot');tag(s.id,[x,.86,z+.23],{kind:'slot'});}
  for(const w of model.weights){const[x,,z]=w.position,side=w.mass===2?.245:.19;box([x,.85,z],[side,.035,side],'metal',`weight-${w.id}`);rod([x-.05,.876,z],[x+.05,.876,z],.012,'trim');tag(`${w.id} · ${w.mass}`,[x,.86,z-.12],{kind:'weight'});}
  const cargo=model.cargo;if(cargo.pose!=='ashore'||!model.deck){const[x,,z]=cargo.position;box([x,1.06,z],[.44,.48,.40],'crate',cargo.id);for(const dx of[-.15,.15])box([x+dx,1.065,z],[.035,.49,.412],'trim');for(const dz of[-.14,.14])box([x,1.065,z+dz],[.45,.49,.03],'trim');tag(model.lampInstalled?'灯座 · 已装配':'灯座 · 2',[x,1.44,z],{kind:'cargo'});}
  const hatch=deckPoint(G.fixtures.smallCargoLocker.grid);box([hatch[0],.815,hatch[2]],[.31,.013,.24],'rack','flush-locker');rod([hatch[0]-.035,.827,hatch[2]],[hatch[0]+.035,.827,hatch[2]],.015,'metal');
  const helm=deckPoint(G.fixtures.helm);rod([0,.8,2.9],[0,1.10,2.72],.05,'metal','helm-stern-support');rod([0,1.10,2.72],[helm[0],1.1,helm[2]],.045,'rack','helm-tiller');
  const signal=deckPoint(G.fixtures.sternSignal.grid);rod([1.5,.8,signal[2]],[1.5,1.02,signal[2]],.025,'metal');box([1.5,1.08,signal[2]],[.13,.15,.13],'gold','stern-signal-not-mooring-switch');
  for(const [i,lead]of [G.fixtures.mooring.bowFairleadXYZ,G.fixtures.mooring.sternFairleadXYZ].entries()){const shore=berthPoint(G.fixtures.mooring.shoreBollardsGrid[i]);box(lead,[.16,.10,.13],'steel',`fairlead-${i}`);rod([shore[0],.8,shore[2]],[shore[0],1.18,shore[2]],.10,'metal',`shore-bollard-${i}`);rod([shore[0]-.17,1.16,shore[2]],[shore[0]+.17,1.16,shore[2]],.06,'metal');if(model.moored)line([lead,[shore[0],1.12,shore[2]]],.023,'rope',`main-mooring-${i}`);}
 }
 function shore(){
  surface([[-5.5,-6],[5.5,-6],[5.5,5],[-5.5,5]],-.04,'water',[-5.5,-6,11,11],'one-world-water-domain');
  const shoreMap=runtime.region(model.deck?model.dock:model.regionId).map;
  // All contiguous quays share one UV domain. Exact tile rectangles have shared vertices and no gutter.
  const positions=[],uvs=[];for(let y=0;y<11;y++)for(let x=0;x<11;x++)if('.#'.includes(shoreMap[y][x])){
   const [X,,Z]=berthPoint([x,y]);if(x===6&&y===7)continue;const left=x===7?-.25:-.5;for(const [dx,dz]of[[left,-.5],[.5,.5],[.5,-.5],[left,-.5],[left,.5],[.5,.5]]){positions.push(X+dx,.8,Z+dz);uvs.push((x+dx+.5)/11,1-(y+dz+.5)/11);}
   if(x===7&&y===7)continue; // no invented wall at the sole landing
   if(shoreMap[y][x]==='#')box([X,.9,Z],[.45,.2,.65],'dark','bollard-seat');
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.computeVertexNormals();mesh(geo,'stone',[0,0,0],'continuous-quay');
  for(let y=1;y<10;y++){const row=shoreMap[y];for(let x=0;x<11;x++)if('.#'.includes(row[x])&&!'.#'.includes(row[x-1]??'~')){const [X,,Z]=berthPoint([x,y]);box([X-(x===7?.25:.5),.36,Z],[.045,.8,1],'dark','quay-face');}}
  if(model.dock==='C-M03'){const z=-3.5,w=4.8,centerX=model.barrierOpen?-5.4:-1.5;box([centerX,.19,z],[w,.27,.25],'rack','same-floating-gate');for(let x=centerX-w/2;x<centerX+w/2;x+=.4)rod([x,.25,z],[x,.47,z],.035,'trim');}
  if(model.dock==='C-M05'){for(let z=-1.6;z<.5;z+=.22)rod([2.9,.84,z],[3.7,.84,z],.035,'steel','cargo-rollers');for(let y=3;y<=5;y++){const p=berthPoint([10,y]);line([[p[0]-.4,.81,p[2]-.4],[p[0]+.4,.81,p[2]+.4]],.027,'trim','broken-platform-mark');}}
 }
 function devices(){for(const d of model.devices){if(d.id==='one-gate-winch'){
  const[x,,z]=d.body;rod([x-.23,1.01,z],[x+.23,1.01,z],.19,'metal','winch-drum');box([x,.87,z],[.43,.12,.40],'steel','winch-foot');rod([x,1.01,z],[d.handle[0],1.01,d.handle[2]],.052,'steel','winch-shaft');wheel([d.handle[0],1.01,d.handle[2]],.16,'x','winch-handle');line(d.cable,.018,'rope','winch-cable');tag('牵栅绞盘 · 操作位 4,4',[x,1.44,z],{kind:'interaction',id:'c.openBarrier',cell:[4,3]});tag('观察位（UI）',deckPoint(G.fixtures.bowObserver,1),{kind:'slot'});
 }else{
  const foot=d.hullMountXYZ,body=d.outboardHousingXYZ,handle=d.handleXYZ;
  box([foot[0],.84,foot[2]],[.18,.08,.22],'steel','davit-in-hull-foot');rod(foot,body,.07,'steel','davit-rigid-bracket');box(body,[.24,.22,.3],'metal','davit-outboard-housing');rod(body,handle,.045,'steel','davit-forward-shaft');wheel(handle,.14,'z','davit-handwheel');
  const mast=[body[0],1.75,body[2]],tip=d.stowed?[1.85,1.7,-1.5]:[2.8,1.85,-.65];rod(body,mast,.07,'steel','davit-mast');rod(mast,tip,.06,'steel','davit-boom');rod([body[0],1.32,body[2]],tip,.034,'metal','davit-brace');const hook=[tip[0],d.stowed?1.4:.96,tip[2]];line([tip,hook],.016,'rope','davit-hoist-rope');wheel(hook,.055,'z','davit-hook');
  if(!d.stowed&&model.cargo.pose==='right'){line([hook,[1.38,1.31,-.9]],.014,'rope','cargo-lifting-sling');const guide=deckPoint(G.fixtures.guideRopeOperator,.96);line([[1.38,1.12,-.9],guide],.012,'rope','cargo-guide-rope');tag('牵绳位（UI）',guide,{kind:'slot'});}
  tag(d.stowed?'吊臂 · 已收妥':'船载手摇吊臂',[body[0],2.03,body[2]],{kind:'interaction',id:'c.unload',cell:[8,2]});
 }} }
 function actorsAndLabels(){
  const [x,,z]=model.hero;const ring=mesh(new THREE.RingGeometry(.14,.205,24),'marker',[x,.88,z],'temporary-player-position-marker');ring.rotation.x=-Math.PI/2;
  tag('璃 · 角色图待换',[x,1.18,z],{kind:'hero'});
  for(const t of model.targets){if(t.kind==='anchor')continue; if(model.deck&&['c.openBarrier','c.shiftLeft','c.centerCargo','c.shiftRight','c.unload','c.stow'].includes(t.id))continue;
   if(t.kind==='enemy'){const[X,,Z]=t.position;box([X,1.0,Z],[.46,.34,.45],'metal',`${t.id}-provisional-machine`);for(const dx of[-.25,.25])rod([X+dx,.91,Z-.18],[X+dx,.91,Z+.18],.1,'dark');}
   if(!model.deck&&t.kind==='pickup'){const[X,,Z]=t.position;box([X,.94,Z],[.28,.28,.28],'crate',`${t.id}-supply`);}
   tag((t.inReach?'• ':'')+t.title,t.position.map((n,i)=>i===1?n+.45:n),{id:t.id,cell:t.cell,kind:'interaction'});
  }
 }
 function updateLabels(width,height){for(const el of labels.children){const p=v(rigidYaw(el._position,model.yaw)).project(camera);el.style.left=`${(p.x+1)*width/2}px`;el.style.top=`${(1-p.y)*height/2}px`;el.hidden=!labelsVisible||Math.abs(p.x)>1||Math.abs(p.y)>1;}}
 function draw(){if(disposed||!model||!active)return;const width=canvas.clientWidth||600,height=canvas.clientHeight||600;renderer.setSize(width,height,false);camera=makeCamera(model,width,height);const t=performance.now();renderer.render(scene,camera);updateLabels(width,height);onStats?.({calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,textures:renderer.info.memory.textures,geometries:renderer.info.memory.geometries,cpuSubmitMs:Number((performance.now()-t).toFixed(2)),renderer:'WebGL2',dpr:renderer.getPixelRatio()});}
 function refresh(state){lastState=state;const next=buildViewModel(runtime,state);if(model?.hash===next.hash){draw();return;}model=next;clearRoot();root=new THREE.Group();root.rotation.y=-model.yaw;scene.add(root);shore();hull();devices();actorsAndLabels();draw();}
 const resize=new ResizeObserver(draw);resize.observe(canvas);
 const onClick=e=>{if(!active||!camera)return;const r=canvas.getBoundingClientRect(),cell=pickLogical(camera,model,e.clientX-r.left,e.clientY-r.top,r.width,r.height);if(cell)onPick(cell.x,cell.y);};canvas.addEventListener('click',onClick);
 const onLost=e=>{e.preventDefault();active=false;onFailure?.('WebGL context lost; 2D selected');};canvas.addEventListener('webglcontextlost',onLost);
 return {refresh,setActive(value){active=value;if(active&&lastState)draw();},setLabels(value){labelsVisible=value;draw();},pickTile(clientX,clientY){if(!camera)return null;const r=canvas.getBoundingClientRect();return pickLogical(camera,model,clientX-r.left,clientY-r.top,r.width,r.height);},projectTile(x,y){return camera?projectLogical(camera,model,x,y,canvas.clientWidth,canvas.clientHeight):null;},stats:()=>({calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,textures:renderer.info.memory.textures}),destroy(){disposed=true;resize.disconnect();canvas.removeEventListener('click',onClick);canvas.removeEventListener('webglcontextlost',onLost);clearRoot();for(const m of Object.values(materials))m.dispose();for(const t of textures.values())t.dispose();renderer.dispose();}};
}
