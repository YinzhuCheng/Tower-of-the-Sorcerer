// Runs the actual app module with canonical story/session/save data. DOM events are
// deterministic surrogates, not browser rendering or visual-acceptance evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createForestCampaign} from '../src/campaigns/b/content.js';
import {createForestStory,FOREST_STORY_CONTENT} from '../src/campaigns/b/story/index.js';
import {createSaveRepository} from '../src/core/campaign.js';
import {B01_ART_ASSETS} from '../src/rendering/forest-entry-contract.js';

const runtime=createForestCampaign(),html=readFileSync(new URL('../public/campaigns-b/index.html',import.meta.url),'utf8');
const backdrop=B01_ART_ASSETS.find(a=>a.id==='backdrop');
let nonce=0;
class Element {
 constructor(tag='div'){Object.assign(this,{tagName:tag.toUpperCase(),children:[],dataset:{},events:{},style:{},open:false,hidden:false,disabled:false,srcWrites:0,complete:false,naturalWidth:0,naturalHeight:0});this.classList={add(){},remove(){},toggle(){}};}
 append(...c){this.children.push(...c);}replaceChildren(...c){this.children=c;}
 setAttribute(k,v){this[k]=v;}getAttribute(k){return this[k]??null;}removeAttribute(k){delete this[k];if(k==='src')this._src='';}
 set src(v){this._src=v;this.srcWrites++;this.complete=false;this.naturalWidth=0;this.naturalHeight=0;}get src(){return this._src??'';}
 addEventListener(k,fn){(this.events[k]??=[]).push(fn);}dispatch(k,e={}){for(const fn of this.events[k]??[])fn(e);}
 showModal(){this.open=true;}close(){this.open=false;}
 loaded(width=backdrop.width,height=backdrop.height){this.complete=true;this.naturalWidth=width;this.naturalHeight=height;this.onload?.();}
 failed(){this.complete=true;this.naturalWidth=0;this.naturalHeight=0;this.onerror?.();}
}
function memory(){const entries=new Map();return {entries,getItem:k=>entries.get(k)??null,setItem:(k,v)=>entries.set(k,v),removeItem:k=>entries.delete(k)};}
function scene(id='b01_enter',state=runtime.initialState(),openingRevision='opening-r1'){return createForestStory(runtime,{openingRevision}).resolve(id,state,{reviewMode:true});}
function saveQueue(storage,state,queue,{turnIndex=0,openingRevision='opening-r1'}={}){const seenIds=queue.flatMap(s=>s.turns.map(t=>t.id));createSaveRepository(storage,runtime).save('auto',state,{storyVersion:FOREST_STORY_CONTENT.id,openingRevision,seenIds,queue,turnIndex,paused:false});}
function b02State(){let state=runtime.initialState();for(const {action} of JSON.parse(readFileSync(new URL('../artifacts/campaigns/b-normal-partial-none.certificate.json',import.meta.url))).steps){const result=runtime.dispatch(state,action);assert.ok(result.ok);state=result.state;if(state.location.regionId==='B-02')return state;}throw Error('B02 witness absent');}
async function app(storage=memory()) {
 const nodes=new Map([...html.matchAll(/<([a-z-]+)[^>]*\bid="([^"]+)"[^>]*>/g)].map(([,tag,id])=>[id,new Element(tag)]));
 const dirs=['up','down','left','right'].map(dir=>{const e=new Element('button');e.dataset.dir=dir;return e;}),events={};
 const document={getElementById:id=>nodes.get(id),createElement:tag=>new Element(tag),createTextNode:text=>({textContent:text}),querySelector:s=>s==='dialog[open]'?[...nodes.values()].find(n=>n.tagName==='DIALOG'&&n.open)??null:null,querySelectorAll:s=>s==='[data-dir]'?dirs:[],addEventListener:(k,fn)=>events[k]=fn};
 const window={localStorage:storage,addEventListener(){}};
 const names=['window','document','Image','confirm','setTimeout','clearTimeout','requestAnimationFrame','cancelAnimationFrame'],original=Object.fromEntries(names.map(n=>[n,globalThis[n]]));
 Object.assign(globalThis,{window,document,Image:undefined,confirm:()=>true,setTimeout:()=>0,clearTimeout(){},requestAnimationFrame:undefined,cancelAnimationFrame:undefined});
 try {const code=readFileSync(new URL('../public/campaigns-b/app.js',import.meta.url),'utf8').replaceAll("from '../src/",`from '${new URL('../src/',import.meta.url).href}`)+`\n// backdrop integration ${++nonce}`;await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);return {get:id=>nodes.get(id),storage,qa:window.__FOREST_PREVIEW__,key:(key,type='keydown')=>events[type]?.({key,target:{tagName:'BODY'},preventDefault(){}}),cleanup:()=>Object.assign(globalThis,original)};}
 catch(error){Object.assign(globalThis,original);throw error;}
}
const withApp=async(storage,fn)=>{const e=await app(storage);try{await fn(e);}finally{e.cleanup();}};
function assertBound(e){const image=e.get('story-backdrop');assert.match(image.src,new RegExp(backdrop.file.replaceAll('.','\\.')+'$'));assert.equal(image.hidden,true,'pending image stays hidden');assert.match(e.get('story-art-label').textContent,/载入中/);image.loaded();assert.equal(image.hidden,false);assert.equal(e.get('story-art-label').textContent,'南坡村口 · 原生场景候选');assert.equal(e.get('story-location').textContent,'南坡村口');}

test('fresh app binds the real canonical descriptor without inventing scene.regionId',()=>withApp(memory(),e=>{
 const current=e.qa.getPresentation().queue[0];assert.equal(current.sceneId,'b01_enter');assert.equal(current.regionId,undefined);assert.equal(current.turns.length,22);assert.equal(current.turns[0].stage.locationId,'B-01');assertBound(e);
 assert.equal(e.get('story-progress').textContent,'1 / 22');assert.equal(e.get('story-copy').textContent,current.turns[0].text);
 const state=e.qa.getState();e.key('ArrowRight');assert.deepEqual(e.qa.getState(),state,'story blocks movement');
 e.get('story-next').onclick();assert.equal(e.get('story-progress').textContent,'2 / 22');assert.equal(e.get('story-copy').textContent,current.turns[1].text);assert.equal(e.get('story-backdrop').srcWrites,1,'turn advance must not reload');
 let cancelled=false;e.get('story').dispatch('cancel',{preventDefault(){cancelled=true;}});assert.ok(cancelled);assert.equal(e.get('story').open,false);assert.equal(e.qa.getPresentation().paused,true);
 e.get('resume-story').onclick();assert.equal(e.get('story').open,true);assert.equal(e.get('story-progress').textContent,'2 / 22');assert.equal(e.get('story-backdrop').hidden,false);assert.deepEqual(e.qa.getState(),state);
 e.get('story-pause').onclick();e.key('ArrowRight');e.key('ArrowRight','keyup');assert.equal(e.qa.getState().revision,state.revision+1,'map input still works after pause');
}));

test('legacy saved queue preserves prose, progress and revision while binding B01',async()=>{
 const storage=memory(),state=runtime.initialState(),legacy=scene('b01_enter',state,'legacy-v1.1');assert.equal(legacy.regionId,undefined);saveQueue(storage,state,[legacy],{openingRevision:'legacy-v1.1',turnIndex:3});
 await withApp(storage,e=>{assertBound(e);assert.equal(e.get('story-progress').textContent,`4 / ${legacy.turns.length}`);assert.equal(e.get('story-copy').textContent,legacy.turns[3].text);const p=e.qa.getPresentation();assert.equal(p.openingRevision,'legacy-v1.1');assert.deepEqual(p.queue[0],legacy);assert.deepEqual(e.qa.getState(),state);});
});

test('B01 history review uses authored location while player is in B02',async()=>{
 const storage=memory(),state=b02State(),review=scene('b01_enter',state);saveQueue(storage,state,[review]);
 await withApp(storage,e=>{assert.equal(e.qa.getState().location.regionId,'B-02');assertBound(e);assert.equal(e.get('story-stage').dataset.locationId,'B-01');assert.deepEqual(e.qa.getState(),state);assert.deepEqual(e.qa.getPresentation().queue[0],review);});
});

test('older stage-less queue resolves canonical B01 metadata without changing saved turns',async()=>{
 const storage=memory(),state=b02State(),review=scene('b01_enter',state,'legacy-v1.1');for(const turn of review.turns)delete turn.stage;saveQueue(storage,state,[review],{openingRevision:'legacy-v1.1'});
 await withApp(storage,e=>{assertBound(e);assert.equal(e.get('story-stage').dataset.locationId,'B-01');assert.deepEqual(e.qa.getPresentation().queue[0],review);});
});

test('B02 review while player is in B01 never borrows the entry image',async()=>{
 const storage=memory(),state=runtime.initialState(),review=scene('b02_enter',state);saveQueue(storage,state,[review]);
 await withApp(storage,e=>{assert.equal(e.qa.getState().location.regionId,'B-01');assert.equal(e.get('story-backdrop').hidden,true);assert.equal(e.get('story-backdrop').src,'');assert.match(e.get('story-art-label').textContent,/本区背景待制作/);assert.equal(e.get('story-location').textContent,runtime.region('B-02').title);});
});

test('asynchronous failure stays honest across next/pause/resume and preserves play',()=>withApp(memory(),e=>{
 const image=e.get('story-backdrop'),before=e.qa.getState();assert.match(image.src,/forest-entry\/static-backdrop\.png$/);image.failed();assert.equal(image.hidden,true);assert.match(e.get('story-art-label').textContent,/背景加载失败/);
 e.get('story-next').onclick();e.get('story-pause').onclick();e.get('resume-story').onclick();assert.equal(image.hidden,true);assert.equal(image.srcWrites,1);assert.match(e.get('story-art-label').textContent,/背景加载失败/);assert.equal(e.get('story-progress').textContent,'2 / 22');assert.deepEqual(e.qa.getState(),before);
}));

test('stale asynchronous image callbacks cannot resurrect B01 during B02 review',async()=>{
 const storage=memory(),state=runtime.initialState(),first=scene(),second=scene('b02_enter',state);saveQueue(storage,state,[first,second]);
 await withApp(storage,e=>{const image=e.get('story-backdrop'),oldLoad=image.onload,oldError=image.onerror;assert.equal(typeof oldLoad,'function');e.get('story-skip').onclick();assert.equal(e.qa.getPresentation().queue[0].sceneId,'b02_enter');assert.equal(image.hidden,true);assert.equal(image.src,'');image.naturalWidth=backdrop.width;image.naturalHeight=backdrop.height;oldLoad();oldError();assert.equal(image.hidden,true);assert.match(e.get('story-art-label').textContent,/本区背景待制作/);});
});

test('unexpected dimensions fail closed rather than marking the backdrop ready',()=>withApp(memory(),e=>{e.get('story-backdrop').loaded(1,1);assert.equal(e.get('story-backdrop').hidden,true);assert.match(e.get('story-art-label').textContent,/背景加载失败/);}));
