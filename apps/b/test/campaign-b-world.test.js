import {HERO_LOCOMOTION} from '../src/rendering/hero-locomotion.js';
import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync,readdirSync}from'node:fs';
import {createForestCampaign} from '../src/campaigns/b/content.js';
import {createForestPreviewSession} from '../src/campaigns/b/preview-session.js';
import {createSaveRepository} from '../src/core/campaign.js';
import {forestWalkPath} from '../src/campaigns/b/view.js';
import {FOREST_WORLD_REGISTRATION,forestWorldRegistry,projectForestWorld,forestWorldMoveAction,worldPoint,worldPointToSource,createWorldMotion,cameraViewport,worldToScreen,screenToWorld} from '../src/rendering/forest-world.js';
import {drawForestWorld} from '../src/rendering/forest-world-view.js';
const runtime=createForestCampaign(),memory=()=>{const map=new Map();return{getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};};
function walk(state,x,y){for(const action of forestWalkPath(runtime,state,x,y)){const result=runtime.dispatch(state,action);assert.equal(result.ok,true);state=result.state;}return state;}
function clearedEntrance(){let s=runtime.initialState();s=walk(s,3,5);let result=runtime.dispatch(s,{type:'interact',entityId:'b01.timberPuppet'});assert.equal(result.ok,true);return walk(result.state,9,5);}
function sessionAt(state){const storage=memory();createSaveRepository(storage,runtime).save('auto',state);const session=createForestPreviewSession(runtime,storage);session.pause();return{session,storage};}

test('finite registration binds only existing reciprocal source portals; no added game tile',()=>{
 const reg=forestWorldRegistry(runtime);assert.equal(reg.regions.length,3);assert.equal(reg.seams.length,2);assert.equal(reg.finite,true);
 assert.deepEqual(reg.regions.map(r=>r.origin),[[0,0],[12,0],[24,0]]);
 for(const seam of reg.seams){assert.equal(seam.b.x-seam.a.x,4);assert.equal(seam.a.y,seam.b.y);assert.equal(seam.gameplayCells,0);assert.equal(seam.spanMeters,4.8);}
 assert.equal(runtime.spec.regions.length,30);assert.equal(runtime.spec.transitions.length,66);assert.equal(runtime.identity.contentHash,'a12cd07ee1ccc762');
 const state=runtime.initialState(),before=runtime.serialize(state),model=projectForestWorld(runtime,state);assert.equal(model.cells.length,reg.regions.reduce((n,r)=>n+r.source.map.join('').split('').filter(c=>c==='.').length,0));
 assert.equal(worldPointToSource(model,11.5,5.5),null,'connector never manufactures a clickable game cell');assert.equal(runtime.serialize(state),before);
 for(const c of model.cells){assert.deepEqual(worldPointToSource(model,c.x+.5,c.y+.5),{regionId:c.regionId,x:c.localX,y:c.localY});}
});

test('all source-cell directions preserve legality; only exact outward anchor becomes traverse',()=>{
 for(const region of forestWorldRegistry(runtime).regions){for(let y=0;y<11;y++)for(let x=0;x<11;x++){if(region.source.map[y][x]!=='.')continue;const s={...runtime.initialState(),location:{regionId:region.id,x,y}};
 for(const direction of['left','right','up','down']){const a=forestWorldMoveAction(runtime,s,direction);if(a.type==='traverse'){const edge=runtime.spec.transitions.find(e=>e.id===a.edgeId),anchor=runtime.entity(edge.anchor);assert.deepEqual(s.location,{regionId:anchor.regionId,x:anchor.x,y:anchor.y});assert.ok(['b.edge.01-02','b.edge.02-01','b.edge.02-03','b.edge.03-02'].includes(a.edgeId));assert.equal(runtime.preview(s,a).legal,true);}else{assert.deepEqual(a,{type:'move',direction});assert.equal(runtime.preview(s,a).legal,runtime.preview(s,{type:'move',direction}).legal);}}
 }}
 const initial=runtime.initialState(),blocked=walk(initial,3,5);assert.equal(runtime.dispatch(blocked,forestWorldMoveAction(runtime,blocked,'right')).ok,false);assert.equal(blocked.cleared.length,0);
});

test('two-way repeated crossing commits exactly one original event and preserves finite resources and save identity',()=>{
 const{session:s,storage}=sessionAt(clearedEntrance()),initialResources={...s.state.resources},initialStats={...s.state.stats};
 for(let i=0;i<8;i++){const before=s.state,dir=i%2?'left':'right',action=forestWorldMoveAction(runtime,before,dir),expected=runtime.dispatch(before,{...action,expectedRevision:before.revision});const result=s.request(action);assert.equal(result.ok,true);assert.equal(result.events.filter(e=>e.type==='traverse').length,1);assert.deepEqual(s.state,expected.state);assert.equal(s.state.revision,before.revision+1);assert.deepEqual(s.state.resources,initialResources);assert.deepEqual(s.state.stats,initialStats);s.pause();}
 s.save();const wanted=runtime.serialize(s.state),presentation=structuredClone(s.presentation),restored=createForestPreviewSession(runtime,storage);assert.equal(runtime.serialize(restored.state),wanted);assert.deepEqual(restored.presentation,presentation);assert.deepEqual(restored.state.identity,runtime.identity);
 // The original once-only pickup remains one time after walking and crossing.
 let state=walk(s.state,4,7),take=runtime.dispatch(state,{type:'interact',entityId:'b01.guardPlate'});assert.equal(take.ok,true);assert.equal(runtime.dispatch(take.state,{type:'interact',entityId:'b01.guardPlate'}).ok,false);assert.equal(take.state.stats.def,initialStats.def+2);
});

test('B02→B03→B02 and heat pickup retain original resources and request semantics',()=>{
 let state=clearedEntrance();state=runtime.dispatch(state,forestWorldMoveAction(runtime,state,'right')).state;state=walk(state,9,5);const{session:s}=sessionAt(state),r=s.request(forestWorldMoveAction(runtime,s.state,'right'));assert.equal(r.ok,true);assert.equal(s.state.location.regionId,'B-03');assert.equal(s.state.resources.heat,0);s.pause();
 const back=s.request(forestWorldMoveAction(runtime,s.state,'left'));assert.equal(back.ok,true);assert.equal(s.state.location.regionId,'B-02');assert.equal(s.state.resources.heat,0);s.pause();
 s.request(forestWorldMoveAction(runtime,s.state,'right'));s.pause();for(const a of forestWalkPath(runtime,s.state,2,3))assert.equal(s.move(a).ok,true);assert.equal(s.request({type:'interact',entityId:'b03.heatBox'}).ok,true);assert.equal(s.state.resources.heat,8);s.pause();assert.equal(s.request({type:'interact',entityId:'b03.heatBox'}).ok,false);assert.equal(s.state.resources.heat,8);
});

test('hero and camera remain continuous across seam and reversal; load resets to source location',()=>{
 const motion=createWorldMotion(runtime),from={regionId:'B-01',x:9,y:5},to={regionId:'B-02',x:1,y:5};motion.reset(from);const before=motion.snapshot();motion.sync(to);assert.deepEqual(motion.snapshot().hero,before.hero);assert.deepEqual(motion.snapshot().camera,before.camera);assert.equal(motion.snapshot().crossing,true);
 let prior=before,maxHeroStep=0,maxCameraStep=0;for(let i=0;i<720;i++){const next=motion.tick(1/60);maxHeroStep=Math.max(maxHeroStep,Math.hypot(next.hero.x-prior.hero.x,next.hero.y-prior.hero.y));maxCameraStep=Math.max(maxCameraStep,Math.hypot(next.camera.x-prior.camera.x,next.camera.y-prior.camera.y));prior=next;}
 assert.ok(maxHeroStep<=HERO_LOCOMOTION.speedMps/1.2/60+1e-10);assert.ok(maxCameraStep<.13);assert.equal(prior.crossing,false);assert.deepEqual(prior.hero,worldPoint(to));assert.ok(Math.abs(prior.camera.x-prior.hero.x)<1e-8);
 motion.sync(from);for(let i=0;i<720;i++)motion.tick(1/60);assert.deepEqual(motion.snapshot().hero,worldPoint(from));motion.reset({regionId:'B-03',x:3,y:3});assert.equal(motion.snapshot().queuedSegments,0);assert.deepEqual(motion.snapshot().hero,motion.snapshot().camera);
});

test('camera resize/hit projection retains exact cell coordinates, readable neighborhood, and minimum actor scale',()=>{
 for(const[width,height]of[[570,439],[930,560],[366,440],[280,360]]){const viewport=cameraViewport(width,height),camera={x:11.1,y:5.5};assert.ok(viewport.scale>=40);assert.ok(width/viewport.scale<15);assert.ok(1.4*viewport.scale>=56);const point={x:13.5,y:5.5},screen=worldToScreen(point,camera,viewport),back=screenToWorld(screen,camera,viewport);assert.ok(Math.abs(back.x-point.x)<1e-10);assert.ok(Math.abs(back.y-point.y)<1e-10);}
});

test('render frames use one world and shared camera without mutating gameplay; accepted sprite uses its foot anchor',()=>{
 const s=clearedEntrance(),raw=runtime.serialize(s),model=projectForestWorld(runtime,s),calls=[],ctx=new Proxy({measureText:t=>({width:t.length*.18})},{get:(t,k)=>k in t?t[k]:(...args)=>calls.push([k,...args]),set:(t,k,v)=>(t[k]=v,true)}),motion=createWorldMotion(runtime);motion.reset(s.location);const img={};const report=drawForestWorld(ctx,model,motion.snapshot(),{width:570,height:439,image:img});assert.equal(report.regions.length,3);assert.equal(report.art,'structural-proxy');assert.equal(runtime.serialize(s),raw);assert.ok(report.heroHeightPixels>80);const draw=calls.find(c=>c[0]==='drawImage'&&c[1]===img),k=draw[4]/1024;assert.ok(Math.abs(draw[2]+590*k-report.hero.x)<1e-10);assert.ok(Math.abs(draw[3]+1523*k-report.hero.y)<1e-10);
});

test('legacy viewport resize listener cannot restore square framing after returning to continuous world',async()=>{
 const {fitCampaignMapViewport}=await import('../src/rendering/continuous-map.js'),callbacks=[],events={},stage={dataset:{aspect:'1'},style:{},getBoundingClientRect:()=>({top:100,width:700})},section={children:[stage],getBoundingClientRect:()=>({width:700})};stage.parentElement=section;const canvas={parentElement:stage};
 const keys=['requestAnimationFrame','window','innerWidth','innerHeight','getComputedStyle','scrollY'],saved=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));Object.assign(globalThis,{requestAnimationFrame:fn=>callbacks.push(fn),window:{addEventListener:(event,fn)=>events[event]=fn},innerWidth:1200,innerHeight:800,scrollY:0,getComputedStyle:()=>({paddingLeft:'0',paddingRight:'0'})});
 try{fitCampaignMapViewport(canvas);callbacks.shift()();assert.ok(parseFloat(stage.style.width)>0);stage.dataset.aspect='world';stage.style.width='';stage.style.height='';events.resize();callbacks.shift()();assert.equal(stage.style.width,'');assert.equal(stage.style.height,'');}finally{Object.assign(globalThis,saved);}
});

test('a stale legacy observer cannot paint over the world even when a region identifier matches',async()=>{
 const{presentContinuousScene}=await import('../src/rendering/continuous-map.js'),saved=globalThis.ResizeObserver;let observer,draws=0;globalThis.ResizeObserver=class{constructor(fn){observer=fn;}observe(){}};const context=new Proxy({},{get:()=>()=>{draws++;}}),canvas={dataset:{},getContext:()=>context,getBoundingClientRect:()=>({width:100})},board={dataset:{}};
 try{presentContinuousScene(canvas,board,{regionId:'B-01',artRevision:'test',width:11,height:11});assert.ok(draws>0);draws=0;board.dataset.renderer='continuous-world';observer();assert.equal(draws,0);}finally{globalThis.ResizeObserver=saved;}
});
