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
test('paused GAL and art reuse raster without changing state; resize and resume repaint',async()=>{
 const e=await boot();try{
  assert.equal(e.qa.getVisualState().world.heroRuntime.ready,true);assert.equal(e.get('story').open,true);
  e.tick(1,16.6667);const state=e.qa.getState(),presentation=e.qa.getPresentation(),pose=e.qa.getVisualState().fine.physical.worldFootM;
  let before=snapshotMetrics(),start=performance.now();e.tick(120,16.6667);const reading={...deltaMetrics(before),elapsedMs:performance.now()-start};
  e.get('story').events.keydown({key:'h',target:e.get('story-hide'),preventDefault(){},stopPropagation(){}});assert.equal(e.get('story').dataset.readerMode,'art');
  before=snapshotMetrics();start=performance.now();e.tick(120,16.6667);const art={...deltaMetrics(before),elapsedMs:performance.now()-start};
  e.get('story').events.keydown({key:'h',target:e.get('story-restore'),preventDefault(){},stopPropagation(){}});assert.equal(e.get('story').dataset.readerMode,'reading');
  assert.deepEqual(e.qa.getState(),state);assert.deepEqual(e.qa.getPresentation(),presentation);assert.deepEqual(e.qa.getVisualState().fine.physical.worldFootM,pose);
  console.log(JSON.stringify({kind:'paused-render-count',reading,art}));
  assert.equal(reading.heroRenders,0,'paused reading must not repeat CPU hero raster');assert.equal(art.heroRenders,0,'H/art must not repeat CPU hero raster');assert.equal(reading.canvasUploads,0);assert.equal(art.canvasUploads,0);
  e.get('map-canvas').box={width:640,height:420,left:0,top:0};before=snapshotMetrics();e.windowEvents.resize();e.tick(1,16.6667);assert.equal(deltaMetrics(before).heroRenders,1,'resize invalidates paused image once');assert.equal(e.qa.getVisualState().world.viewport.width,640);before=snapshotMetrics();e.tick(30,16.6667);assert.equal(deltaMetrics(before).heroRenders,0);
  e.get('map-canvas').box={width:660,height:450,left:0,top:0};before=snapshotMetrics();e.tick(1,16.6667);assert.equal(deltaMetrics(before).heroRenders,1,'container-only resize also repaints');assert.equal(e.qa.getVisualState().world.viewport.width,660);globalThis.devicePixelRatio=2;before=snapshotMetrics();e.tick(1,16.6667);assert.equal(deltaMetrics(before).heroRenders,1,'DPR-only change repaints');assert.equal(e.get('map-canvas').width,1320);before=snapshotMetrics();e.tick(30,16.6667);assert.equal(deltaMetrics(before).heroRenders,0);
  const lateHeroImage=e.allImages.find(image=>image.url.includes('hero-neutral.png'));assert(lateHeroImage);before=snapshotMetrics();lateHeroImage.onload();assert.equal(deltaMetrics(before).heroRenders,1,'late asset completion still paints while paused');before=snapshotMetrics();e.tick(30,16.6667);assert.equal(deltaMetrics(before).heroRenders,0);
  assert.deepEqual(e.qa.getState(),state);assert.deepEqual(e.qa.getPresentation(),presentation);
  // Repeat controls without changing a story turn or invalidating the world.
  before=snapshotMetrics();for(let i=0;i<12;i++){e.get('story-hide').onclick();e.tick(1,16.6667);e.get('story').events.cancel({preventDefault(){}});e.tick(1,16.6667);e.get('story-history').onclick();e.tick(1,16.6667);e.get('story-history-close').onclick();e.tick(1,16.6667);}assert.equal(deltaMetrics(before).heroRenders,0);assert.deepEqual(e.qa.getState(),state);assert.deepEqual(e.qa.getPresentation(),presentation);
  e.get('story-pause').onclick();e.tick(1,16.6667);
  e.document.hidden=true;e.events.visibilitychange();e.tick(1,16.6667);const hiddenState=e.qa.getState(),hiddenPose=e.qa.getVisualState().fine.physical.worldFootM;before=snapshotMetrics();e.tick(120,16.6667);const hidden=deltaMetrics(before);assert.equal(hidden.heroRenders,0);assert.equal(hidden.canvasUploads,0);assert.deepEqual(e.qa.getState(),hiddenState);assert.deepEqual(e.qa.getVisualState().fine.physical.worldFootM,hiddenPose);
  e.document.hidden=false;e.events.visibilitychange();e.tick(1,30000);assert.deepEqual(e.qa.getVisualState().fine.physical.worldFootM,hiddenPose,'visibility resume must not consume hidden wall time');
  e.down('d','KeyD');e.tick(5,16.6667);e.windowEvents.blur();e.tick(1,16.6667);const blurState=e.qa.getState(),blurPose=e.qa.getVisualState().fine.physical.worldFootM,blurPaint=e.qa.getVisualState().world.heroRuntime.lastPaint;before=snapshotMetrics();e.tick(120,16.6667);const blur=deltaMetrics(before);assert.equal(blur.heroRenders,0);assert.equal(blur.canvasUploads,0);assert.deepEqual(e.qa.getState(),blurState);assert.deepEqual(e.qa.getVisualState().fine.physical.worldFootM,blurPose);
  e.windowEvents.focus();e.tick(1,30000);assert.deepEqual(e.qa.getVisualState().fine.physical.worldFootM,blurPose,'focus resume must not catch up old dt');assert.equal(e.qa.getVisualState().world.heroRuntime.lastPaint.poseTravelM,blurPaint.poseTravelM);e.up('d','KeyD');e.tick(30,16.6667);
  const stopped=e.qa.getVisualState().fine.physical.worldFootM;before=snapshotMetrics();e.tap('a','KeyA');e.tick(30,16.6667);assert(deltaMetrics(before).heroRenders>0,'reverse movement remains rendered');assert(e.qa.getVisualState().fine.physical.worldFootM[0]<stopped[0]);assert.equal(e.qa.getVisualState().world.heroRuntime.error,null);assert(e.frames.size<=1);
  e.get('resume-story').onclick();e.tick(1,16.6667);before=snapshotMetrics();e.tick(30,16.6667);assert.equal(deltaMetrics(before).heroRenders,0,'reentered GAL freezes the new world image');assert.equal(e.qa.getPresentation().turnIndex,presentation.turnIndex);
  console.log(JSON.stringify({kind:'hidden-blur-count',hidden,blur,finalFrames:e.frames.size}));

 }finally{e.restore();}
});
