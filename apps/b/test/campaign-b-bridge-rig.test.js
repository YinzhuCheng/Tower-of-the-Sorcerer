// Actual app import with deterministic DOM/canvas/RAF helpers. No real browser.
import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
import{SoftwareHero}from'../src/rendering/software-hero.mjs';
import{SoftwareFootShadows}from'../src/rendering/foot-shadows.mjs';
import{createForestCampaign}from'../src/campaigns/b/content.js';
import{createSaveRepository}from'../src/core/campaign.js';
import{createForestPreviewSession}from'../src/campaigns/b/preview-session.js';
import{createFineForestSaveExtension}from'../src/rendering/forest-fine-save.js';
import{nativeWorldCell}from'../src/rendering/forest-world-native.js';
const mesh=JSON.parse(readFileSync(new URL('../public/assets/hero-world/hero-mesh.json',import.meta.url),'utf8'));
const html=readFileSync(new URL('../public/campaigns-b/index.html',import.meta.url),'utf8');
const metrics={heroRenders:0,shadowRenders:0,canvasUploads:0,mapPaints:0,heroMs:0};
const rawHeroRender=SoftwareHero.prototype.render,rawShadowRender=SoftwareFootShadows.prototype.render;
SoftwareHero.prototype.render=function(...args){metrics.heroRenders++;const s=performance.now();const r=rawHeroRender.apply(this,args);metrics.heroMs+=performance.now()-s;return r;};
SoftwareFootShadows.prototype.render=function(...args){metrics.shadowRenders++;return rawShadowRender.apply(this,args);};
const context=()=>new Proxy({putImageData(){metrics.canvasUploads++;},fillRect(){metrics.mapPaints++;},measureText:t=>({width:t.length*7}),createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}}),getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4),width:w,height:h})},{get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});
class Element{constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.events={};this.style={};this.open=false;this.hidden=false;this.inert=false;this.disabled=false;this.classList={add(){}};if(tag==='canvas')this.getContext=()=>this.context??=context();}append(...c){this.children.push(...c);}replaceChildren(...c){this.children=c;}setAttribute(k,v){this[k]=v;}removeAttribute(k){delete this[k];}addEventListener(k,v){this.events[k]=v;}showModal(){this.open=true;}close(){this.open=false;}focus(){this.focused=true;}getBoundingClientRect(){return this.box??{width:700,height:500,left:0,top:0};}}
function memory(){const entries=new Map();return{entries,getItem:k=>entries.get(k)??null,setItem:(k,v)=>entries.set(k,v),removeItem:k=>entries.delete(k)};}
async function boot(storage=memory()){
 const nodes=new Map([...html.matchAll(/<([a-z-]+)[^>]*\bid="([^"]+)"[^>]*>/g)].map(([,tag,id])=>[id,new Element(tag)])),dirs=['up','down','left','right'].map(dir=>{const b=new Element('button');b.dataset.dir=dir;return b;}),events={},windowEvents={},frames=new Map(),images=[],allImages=[];let clock=0,id=0;
 const document={hidden:false,getElementById:id=>nodes.get(id),createElement:t=>new Element(t),createTextNode:t=>({textContent:t}),querySelector:s=>s==='dialog[open]'?[...nodes.values()].find(n=>n.tagName==='DIALOG'&&n.open)??null:null,querySelectorAll:s=>s==='[data-dir]'?dirs:s==='[data-close]'?[]:[],addEventListener:(k,fn)=>events[k]=fn};
 class Image{set src(s){this.url=s;this.naturalWidth=s.includes('hero-four-views')?1774:s.includes('world-')?4096:1024;this.naturalHeight=s.includes('hero-four-views')?887:s.includes('world-')?1792:1536;images.push(this);allImages.push(this);}get src(){return this.url;}}
 const saved={};for(const k of['window','document','confirm','requestAnimationFrame','cancelAnimationFrame','Image','ImageData','devicePixelRatio','fetch','setTimeout','clearTimeout'])saved[k]=globalThis[k];Object.assign(globalThis,{window:{localStorage:storage,addEventListener:(k,fn)=>windowEvents[k]=fn},document,confirm:()=>true,Image,ImageData:class{constructor(data,width,height){Object.assign(this,{data,width,height});}},fetch:async url=>{assert(String(url).endsWith('/assets/hero-world/hero-mesh.json'));return{ok:true,json:async()=>mesh};},requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:i=>frames.delete(i),setTimeout:()=>0,clearTimeout:()=>{}});
 let code=readFileSync(new URL('../public/campaigns-b/app.js',import.meta.url),'utf8').replaceAll("from '../src/",`from '${new URL('../src/',import.meta.url).href}`);code+=`\n// unique harness ${Math.random()}\n//# sourceURL=fine-entry-harness.js`;await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);for(let round=0;round<8;round++){await new Promise(resolve=>setImmediate(resolve));for(const image of images.splice(0))image.onload?.();}
 const qa=window.__FOREST_PREVIEW__,get=k=>nodes.get(k),tick=(n=25,dt=100)=>{for(let i=0;i<n;i++){clock+=dt;const callbacks=[...frames.values()];frames.clear();for(const fn of callbacks)fn(clock);assert.ok(frames.size<=1,`fine entry must retain one animation driver, found ${frames.size}`);}},down=(key,code,extra={})=>events.keydown({key,code,target:{tagName:'BODY'},repeat:false,preventDefault(){},...extra}),up=(key,code)=>events.keyup({key,code}),tap=(key,code)=>{down(key,code);up(key,code);},click=id=>get('board').children.find(n=>n.dataset.fineNode===id).onclick();
 return{qa,get,tick,down,up,tap,click,storage,events,windowEvents,document,frames,allImages,restore:()=>Object.assign(globalThis,saved)};
}



const snapshotMetrics=()=>({...metrics});
const deltaMetrics=before=>Object.fromEntries(Object.keys(metrics).map(k=>[k,metrics[k]-before[k]]));
test('BR01 four original bridge directions retain one world rig, measured travel, original state and camera',async()=>{
 const runtime=createForestCampaign();
 for(const[from,to,direction,x,offset,target]of[['B-01','B-02','ArrowRight',9,'39,22','6,22'],['B-02','B-01','ArrowLeft',1,'7,22','38,22'],['B-02','B-03','ArrowRight',9,'39,22','6,22'],['B-03','B-02','ArrowLeft',1,'7,22','38,22']]){
  const storage=memory(),state=runtime.initialState();state.location={regionId:from,x,y:5};state.visited=[...new Set([...state.visited,from])];state.flags['b01.basicEntrance']=true;state.flags['b02.winterPlanKnown']=true;state.cleared.push('b01.timberPuppet','b02.winterPlan');createSaveRepository(storage,runtime).save('auto',state);
  const pre=createForestPreviewSession(runtime,storage,{extension:createFineForestSaveExtension(runtime)});pre.pause();pre.save();const e=await boot(storage);
  try{const{qa,get,tick,tap,click}=e;get('story-pause').onclick();click(offset);tick(7);const generation=qa.getVisualState().world.heroRuntime.generation;tap(direction,direction);
   let began=false,done=false,committed=null,totalDelta=0,lastRoot=null,startTravel=null,bridgeFrames=0;
   for(let i=0;i<330;i++){
    tick(1,1000/60);const q=qa.getVisualState(),h=q.world.heroRuntime;
    assert.equal(h.error,null,`${from}>${to} frame ${i}: ${h.error}`);assert.equal(q.world.heroPresentationMode,'cpu-world-rig');assert.equal(h.generation,generation,'bridge must retain scene rig generation');assert.equal(h.bindings,1);
    if(q.world.visualOwner==='coarse'&&q.world.moving){began=true;bridgeFrames++;assert(h.bridge);assert.equal(q.fine.active,false);committed??=qa.getState();assert.deepEqual(qa.getState(),committed);const root=h.lastPaint.rootM;if(lastRoot)totalDelta+=Math.hypot(...root.map((v,k)=>v-lastRoot[k]));else startTravel=h.lastPaint.poseTravelM;lastRoot=root;
     if(bridgeFrames===35){const before=structuredClone(h.lastPaint),worldHero=q.world.hero; e.windowEvents.blur();tick(1,16);let counts=snapshotMetrics();tick(30,1000);assert.equal(deltaMetrics(counts).heroRenders,0);assert.equal(deltaMetrics(counts).canvasUploads,0);assert.deepEqual(qa.getVisualState().world.hero,worldHero);e.windowEvents.focus();tick(1,30000);assert.equal(qa.getVisualState().world.heroRuntime.lastPaint.poseTravelM,before.poseTravelM);}
     if(bridgeFrames===95){get('resume-story').onclick();assert.equal(get('story').open,false,'queued story waits for original bridge');assert.equal(qa.getPresentation().paused,false);assert(qa.getPresentation().queue.length>0);}
     if(bridgeFrames===125){get('settings').showModal();tick(1,16);const before=qa.getVisualState(),counts=snapshotMetrics();tick(30,1000);assert.equal(deltaMetrics(counts).heroRenders,0);assert.deepEqual(qa.getVisualState().world.hero,before.world.hero);get('settings').close();tick(1,30000);assert.equal(qa.getVisualState().world.heroRuntime.lastPaint.poseTravelM,before.world.heroRuntime.lastPaint.poseTravelM);}
     if(bridgeFrames===65){e.document.hidden=true;e.events.visibilitychange();tick(1,16);const before=qa.getVisualState(),counts=snapshotMetrics();tick(30,1000);assert.equal(deltaMetrics(counts).heroRenders,0);assert.deepEqual(qa.getVisualState().world.hero,before.world.hero);e.document.hidden=false;e.events.visibilitychange();tick(1,30000);assert.equal(qa.getVisualState().world.heroRuntime.lastPaint.poseTravelM,before.world.heroRuntime.lastPaint.poseTravelM);}
    }
    if(q.fine.active&&q.region===to){done=true;assert.equal(q.fine.nodeId,target);assert(!q.world.moving);assert.equal(h.bridge,null);break;}
   }
   assert(began&&done,`${from}>${to} bridge completed`);assert(bridgeFrames>=239&&bridgeFrames<=245,`unchanged 4-second coarse bridge: ${bridgeFrames}`);assert.equal(qa.getState().revision,state.revision+1);assert.deepEqual(qa.getState().stats,state.stats);assert.deepEqual(qa.getState().inventory,state.inventory);assert.deepEqual(qa.getState().flags,state.flags);assert.deepEqual(qa.getState().cleared,state.cleared);assert(totalDelta>4.75&&totalDelta<5.1);assert(Math.abs((qa.getVisualState().world.heroRuntime.lastPaint.poseTravelM-startTravel)-totalDelta)<.08);
   assert(get('story').open,'unpaused queued story opens after visible bridge');get('save').onclick();const saved=qa.getVisualState().fine.physical;get('load-manual').onclick();assert.deepEqual(qa.getVisualState().fine.physical,saved);assert.equal(qa.getVisualState().world.heroRuntime.generation,generation+1);assert.equal(qa.getVisualState().world.heroRuntime.lastPaint.poseTravelM,0);assert.equal(qa.getVisualState().world.heroRuntime.bridge,null);
   console.log(JSON.stringify({kind:'bridge-rig-source',from,to,bridgeFrames,totalDelta,travel:qa.getVisualState().world.heroRuntime.lastPaint.poseTravelM,generation}));
  }finally{e.restore();}
 }
});
