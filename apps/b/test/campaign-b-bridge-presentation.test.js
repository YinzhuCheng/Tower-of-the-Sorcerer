import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
import{createForestCampaign}from'../src/campaigns/b/content.js';
import{createWorldMotion,worldPoint}from'../src/rendering/forest-world.js';
import{ForestHeroPresentation,forestBridgeSnapshot}from'../src/rendering/forest-bridge-presentation.mjs';
import{NativeFootPointIndex}from'../src/rendering/fine-presentation.mjs';
import{FOREST_FINE_WORLD_COLLISION}from'../src/rendering/forest-fine-world-collision.js';
import{NATIVE_FOREST_WORLD}from'../src/rendering/forest-world-contract.js';
import{nativeGroundSupportAt}from'../src/rendering/forest-ground-support.js';
import{buildFineForestGeometry,fineCapsuleHitsPolygon}from'../src/rendering/forest-fine-navigation.js';
import{createHeroWorldRuntime}from'../src/rendering/hero-world-runtime.js';
const runtime=createForestCampaign(),index=new NativeFootPointIndex(FOREST_FINE_WORLD_COLLISION.colliders),anchor=NATIVE_FOREST_WORLD.cells[0],support=p=>nativeGroundSupportAt(anchor,p[0]-anchor.worldFootM[0],p[1]-anchor.worldFootM[1]);
const geometry=id=>buildFineForestGeometry(runtime,id),from={regionId:'B-01',x:9,y:5},to={regionId:'B-02',x:1,y:5};
function fine(location){const g=geometry(location.regionId),n=g.nodes.get(`${(location.x+.5)*4},${(location.y+.5)*4}`),state=runtime.initialState();state.location=structuredClone(location);return{active:true,state,physical:structuredClone(n.sample),nodeId:n.id,facing:'right',footprints:[],moving:false,queuedMicrosteps:0};}
function make(g=geometry(from.regionId)){return new ForestHeroPresentation({geometry:g,support,staticPointBlocked:p=>index.blocked(p),capsuleHits:fineCapsuleHitsPolygon});}
const tickMicro=()=>new Promise(r=>setImmediate(r));

test('BR02 bridge schema is read-only, uses rendered position, and rejects arbitrary or interrupted paths',()=>{
 const motion=createWorldMotion(runtime);motion.reset(from);assert.equal(forestBridgeSnapshot(motion.snapshot()),null);motion.sync(to);const coarse=motion.snapshot(),frozen=JSON.stringify(coarse),s=forestBridgeSnapshot(coarse);assert.equal(s.schema,'forest-bridge-presentation/v1');assert.equal(s.progress,0);assert.deepEqual(s.physical.worldFootM,NATIVE_FOREST_WORLD.joins[0].samples[0].worldFootM);assert.notDeepEqual(s.physical.worldFootM,NATIVE_FOREST_WORLD.joins[0].samples.at(-1).worldFootM);assert.equal(JSON.stringify(coarse),frozen);assert(!('state' in s));assert(!('active' in s));
 assert.equal(forestBridgeSnapshot({...coarse,hero:{x:coarse.hero.x,y:coarse.hero.y+1}}),null);assert.equal(forestBridgeSnapshot({...coarse,location:{regionId:'B-04',x:1,y:5}}),null);assert.equal(forestBridgeSnapshot({...coarse,crossing:false}),null);
 for(let i=0;i<250;i++)motion.tick(1/60);assert.equal(forestBridgeSnapshot(motion.snapshot()),null);assert.equal(forestBridgeSnapshot(motion.snapshot(),s).progress,1);assert.equal(forestBridgeSnapshot({...motion.snapshot(),moving:true},s),null);
});

test('BR03 fine-to-bridge-to-fine phase is physical arc only; redraw, pause and duplicate tick do not advance',()=>{
 for(const join of NATIVE_FOREST_WORLD.joins)for(const reverse of[false,true]){
  const a={regionId:reverse?join.to:join.from,x:(reverse?join.toCell:join.fromCell)[0],y:5},b={regionId:reverse?join.from:join.to,x:(reverse?join.fromCell:join.toCell)[0],y:5},c=make(geometry(a.regionId)),initial=fine(a),lease=c.bind({sceneToken:join.id+reverse,snapshot:initial}),motion=createWorldMotion(runtime);motion.reset(a);motion.sync(b);let s=forestBridgeSnapshot(motion.snapshot()),last=c.lastPose,arc=0,previous=[...last.rootM],id=0;
  assert.deepEqual(c.enterBridge({sceneToken:'unused',snapshot:s}),lease);for(let i=0;i<241;i++){
   if(i===40){const frozen=structuredClone(c.lastPose);for(let k=0;k<20;k++)c.tickBridge({lease,snapshot:s,dt:.1,paused:true,tickId:++id});assert.deepEqual({...c.lastPose,paused:false},{...frozen,paused:false});}
   motion.tick(1/60);s=forestBridgeSnapshot(motion.snapshot(),s);const p=c.tickBridge({lease,snapshot:s,dt:1/60,tickId:++id});arc+=Math.hypot(...p.rootM.map((x,k)=>x-previous[k]));previous=[...p.rootM];assert(Math.abs(p.travelM-arc)<1e-10);assert(Math.abs(p.phase-(arc/.86)%1)<1e-10);assert.equal(c.tickBridge({lease,snapshot:s,dt:.1,tickId:id}),p);assert.equal(c.poseForDraw(lease),p);last=p;
  }
  assert.equal(c.stats.binds,1);assert(c.resumeFine(fine(b),geometry(b.regionId)));assert.equal(c.stats.binds,1);assert.equal(c.lastPose,last);assert.equal(c.gait.state.travelM,arc);assert.equal(c.bridge,null);assert.equal(c.regionId,b.regionId);
  c.tick({lease,snapshot:fine(b),dt:0,tickId:++id});assert(Math.abs(c.lastPose.travelM-arc)<2e-6);
  let here=b,there=a;
  for(const waitFrames of[0,1,5,10,30]){
   const endpoint=fine(here);for(let k=0;k<waitFrames;k++)c.tick({lease,snapshot:endpoint,dt:1/60,tickId:++id});
   c.finishFineApproach(endpoint);const before=structuredClone(c.lastPose);motion.sync(there);s=forestBridgeSnapshot(motion.snapshot());c.enterBridge({snapshot:s});
   assert.equal(c.lastPose.travelM,before.travelM);assert.equal(c.lastPose.phase,before.phase);assert.deepEqual(c.lastPose.rootM,before.rootM);assert.equal(c.lastPose.clock,before.clock);
   while(motion.snapshot().moving){motion.tick(1/60);s=forestBridgeSnapshot(motion.snapshot(),s);c.enterBridge({snapshot:s});c.tickBridge({lease,snapshot:s,dt:1/60,tickId:++id});}
   assert(c.resumeFine(fine(there),geometry(there.regionId)));c.tick({lease,snapshot:fine(there),dt:0,tickId:++id});assert.equal(c.stats.binds,1);[here,there]=[there,here];
  }
 }
});

test('BR04 leases and late assets cannot resurrect disposed bridge or wrong fine target',async()=>{
 const c=make(),m=createWorldMotion(runtime);m.reset(from);m.sync(to);let s=forestBridgeSnapshot(m.snapshot()),lease=c.enterBridge({sceneToken:'old-scene',snapshot:s});let resolve,ready=0;const wait=c.loadAssets(()=>new Promise(r=>resolve=r),()=>ready++);assert.equal(c.resumeFine(fine(to),geometry(to.regionId)),false,'cannot adopt target logical centre before visible arrival');c.dispose();resolve({old:true});assert.equal(await wait,false);assert.equal(ready,0);assert.equal(c.poseForDraw(lease),null);assert.equal(c.tickBridge({lease,snapshot:s,dt:.1,tickId:1}),null);
 const rebound=c.bind({sceneToken:'new-scene',snapshot:fine(to)});assert.notDeepEqual(rebound,lease);assert.equal(c.lastPose.travelM,0);assert.equal(c.bridge,null);assert.equal(c.tick({lease,snapshot:fine(to),dt:.1,tickId:999}),null);
});

test('BR05 runtime asset-late, fail fallback, reset and recovery preserve ownership and zero target jump',async()=>{
 const model=JSON.parse(readFileSync(new URL('../public/assets/hero-world/hero-mesh.json',import.meta.url),'utf8')),assets={model,texture:{width:1,height:1,data:new Uint8ClampedArray([180,180,180,255])}},native={depth:new Uint8ClampedArray(4)};
 let resolve,ready=0;const h=createHeroWorldRuntime(runtime,()=>ready++,{loadAssets:()=>new Promise(r=>resolve=r)}),m=createWorldMotion(runtime);m.reset(from);m.sync(to);h.sync(null,geometry(from.regionId),native,m.snapshot());await tickMicro();assert.equal(h.ready,false);const generation=h.snapshot().generation;
 for(let i=0;i<50;i++){m.tick(1/60);h.sync(null,geometry(from.regionId),native,m.snapshot());h.tick(null,{dt:1/60});}resolve(assets);await tickMicro();assert(h.ready);assert.equal(h.snapshot().generation,generation);assert.equal(h.snapshot().bindings,1);assert.equal(ready,1);assert(h.snapshot().bridge.progress>.1);
 h.reset();assert.equal(h.snapshot().generation,generation+1);h.sync(fine(to),geometry(to.regionId),native);assert.equal(h.snapshot().bridge,null);assert(h.ready);assert.equal(h.snapshot().bindings,1);
 let oldResolve;const stale=createHeroWorldRuntime(runtime,()=>ready++,{loadAssets:()=>new Promise(r=>oldResolve=r)});stale.sync(null,geometry(from.regionId),native,m.snapshot());await tickMicro();stale.reset();const r=ready;oldResolve(assets);await tickMicro();assert.equal(ready,r);assert.equal(stale.ready,false);assert.equal(stale.snapshot().bridge,null);
 const bad=createHeroWorldRuntime(runtime,()=>{}, {loadAssets:async()=>{throw Error('asset missing');}});bad.sync(null,geometry(from.regionId),native,m.snapshot());await tickMicro();assert.equal(bad.snapshot().mode,'failed-fallback');assert.equal(bad.snapshot().error,'asset missing');assert.equal(bad.ready,false);bad.sync(null,geometry(from.regionId),native,m.snapshot());assert.equal(bad.snapshot().mode,'failed-fallback');bad.reset();assert.equal(bad.snapshot().disabled,false);
});
