// Runs the actual app module with canonical story/session/save data. DOM events are
// deterministic surrogates, not browser rendering or visual-acceptance evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createForestCampaign} from '../src/campaigns/b/content.js';
import {createForestStory,FOREST_STORY_CONTENT} from '../src/campaigns/b/story/index.js';
import {createSaveRepository} from '../src/core/campaign.js';
import {FOREST_GAL_BACKDROP,FOREST_GAL_CAST,FOREST_GAL_ENVIRONMENTS,FOREST_GAL_DAILY_CAST} from '../src/rendering/forest-gal-assets.js';
import {forestGalActors,forestGalBackdrop} from '../src/rendering/forest-gal-stage.js';

const runtime=createForestCampaign(),html=readFileSync(new URL('../public/campaigns-b/index.html',import.meta.url),'utf8');
const backdrop=FOREST_GAL_BACKDROP;
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
function b02State({winterPlan=false}={}){let state=runtime.initialState();for(const {action} of JSON.parse(readFileSync(new URL('../artifacts/campaigns/b-normal-partial-none.certificate.json',import.meta.url))).steps){const result=runtime.dispatch(state,action);assert.ok(result.ok);state=result.state;if(winterPlan?state.flags['b02.winterPlanKnown']:state.location.regionId==='B-02')return state;}throw Error('B02 witness absent');}
async function app(storage=memory()) {
 const nodes=new Map([...html.matchAll(/<([a-z-]+)[^>]*\bid="([^"]+)"[^>]*>/g)].map(([,tag,id])=>[id,new Element(tag)]));
 const dirs=['up','down','left','right'].map(dir=>{const e=new Element('button');e.dataset.dir=dir;return e;}),events={};
 const document={getElementById:id=>nodes.get(id),createElement:tag=>new Element(tag),createTextNode:text=>({textContent:text}),querySelector:s=>s==='dialog[open]'?[...nodes.values()].find(n=>n.tagName==='DIALOG'&&n.open)??null:null,querySelectorAll:s=>s==='[data-dir]'?dirs:[],addEventListener:(k,fn)=>events[k]=fn};
 const window={localStorage:storage,addEventListener(){}};
 const names=['window','document','Image','confirm','setTimeout','clearTimeout','requestAnimationFrame','cancelAnimationFrame'],original=Object.fromEntries(names.map(n=>[n,globalThis[n]]));
 Object.assign(globalThis,{window,document,Image:undefined,confirm:()=>true,setTimeout:()=>0,clearTimeout(){},requestAnimationFrame:undefined,cancelAnimationFrame:undefined});
 try {const code=readFileSync(new URL('../public/campaigns-b/app.js',import.meta.url),'utf8').replaceAll("from '../src/",`from '${new URL('../src/',import.meta.url).href}`)+`\n// backdrop integration ${++nonce}`;await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);return {get:id=>nodes.get(id),storage,qa:window.__FOREST_PREVIEW__,key:(key,type='keydown',extra={})=>events[type]?.({key,target:{tagName:'BODY'},preventDefault(){},...extra}),cleanup:()=>Object.assign(globalThis,original)};}
 catch(error){Object.assign(globalThis,original);throw error;}
}
const withApp=async(storage,fn)=>{const e=await app(storage);try{await fn(e);}finally{e.cleanup();}};
function assertBound(e){const image=e.get('story-backdrop');assert.match(image.src,new RegExp(backdrop.file.replaceAll('.','\\.')+'$'));assert.equal(image.hidden,true,'pending image stays hidden');assert.match(e.get('story-art-label').textContent,/载入中/);image.loaded();assert.equal(image.hidden,false);assert.equal(e.get('story-art-label').textContent,'南坡村口 · 雨后暖林');assert.equal(e.get('story-location').textContent,'南坡村口');}

test('fresh app binds the real canonical descriptor without inventing scene.regionId',()=>withApp(memory(),e=>{
 const current=e.qa.getPresentation().queue[0];assert.equal(current.sceneId,'b01_enter');assert.equal(current.regionId,undefined);assert.equal(current.turns.length,22);assert.equal(current.turns[0].stage.locationId,'B-01');assertBound(e);
 assert.equal(e.get('story-progress').textContent,'1 / 22');assert.equal(e.get('story-copy').textContent,current.turns[0].text);
 const state=e.qa.getState();e.key('ArrowRight');assert.deepEqual(e.qa.getState(),state,'story blocks movement');
 e.get('story-next').onclick();assert.equal(e.get('story-progress').textContent,'2 / 22');assert.equal(e.get('story-copy').textContent,current.turns[1].text);assert.equal(e.get('story-backdrop').srcWrites,1,'turn advance must not reload');
 let cancelled=false;e.get('story').dispatch('cancel',{preventDefault(){cancelled=true;}});assert.ok(cancelled);assert.equal(e.get('story').open,false);assert.equal(e.qa.getPresentation().paused,true);
 e.get('resume-story').onclick();assert.equal(e.get('story').open,true);assert.equal(e.get('story-progress').textContent,'2 / 22');assert.equal(e.get('story-backdrop').hidden,true);e.get('story-backdrop').loaded();assert.equal(e.get('story-backdrop').hidden,false);assert.deepEqual(e.qa.getState(),state);
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
 await withApp(storage,e=>{assert.equal(e.qa.getState().location.regionId,'B-01');assert.equal(e.get('story-backdrop').hidden,true);assert.match(e.get('story-backdrop').src,/b02-return-branch-square.webp$/);assert.match(e.get('story-art-label').textContent,/回枝广场.*载入中/);e.get('story-backdrop').loaded();assert.equal(e.get('story-backdrop').hidden,false);assert.equal(e.get('story-location').textContent,runtime.region('B-02').title);});
});

test('asynchronous failure stays honest across next/pause/resume and preserves play',()=>withApp(memory(),e=>{
 const image=e.get('story-backdrop'),before=e.qa.getState();assert.match(image.src,/forest-gal\/b01-village-entrance\.png$/);image.failed();assert.equal(image.hidden,true);assert.match(e.get('story-art-label').textContent,/背景加载失败/);
 e.get('story-next').onclick();e.get('story-pause').onclick();e.get('resume-story').onclick();assert.equal(image.hidden,true);assert.equal(image.srcWrites,2);assert.match(e.get('story-art-label').textContent,/载入中/);image.failed();assert.match(e.get('story-art-label').textContent,/背景加载失败/);assert.equal(e.get('story-progress').textContent,'2 / 22');assert.deepEqual(e.qa.getState(),before);
}));

test('stale asynchronous image callbacks cannot resurrect B01 during B02 review',async()=>{
 const storage=memory(),state=runtime.initialState(),first=scene(),second=scene('b02_enter',state);saveQueue(storage,state,[first,second]);
 await withApp(storage,e=>{const image=e.get('story-backdrop'),oldLoad=image.onload,oldError=image.onerror;assert.equal(typeof oldLoad,'function');e.get('story-skip').onclick();assert.equal(e.qa.getPresentation().queue[0].sceneId,'b02_enter');assert.equal(image.hidden,true);assert.match(image.src,/b02-return-branch-square.webp$/);image.naturalWidth=backdrop.width;image.naturalHeight=backdrop.height;oldLoad();oldError();assert.equal(image.hidden,true);assert.match(e.get('story-art-label').textContent,/回枝广场.*载入中/);image.loaded();assert.equal(image.hidden,false);assert.match(e.get('story-art-label').textContent,/回枝广场/);});
});

test('unexpected dimensions fail closed rather than marking the backdrop ready',()=>withApp(memory(),e=>{e.get('story-backdrop').loaded(1,1);assert.equal(e.get('story-backdrop').hidden,true);assert.match(e.get('story-art-label').textContent,/背景加载失败/);}));


test('daily entry preserves truthful action shots and stable dialogue actor nodes',()=>withApp(memory(),e=>{
 const stage=e.get('story-actors');assert.equal(stage.children.length,0,'arrival action uses the environment');
 e.get('story-next').onclick();const first=[...stage.children];assert.deepEqual(first.map(i=>i.dataset.characterId),['merchant','hero']);
 for(const image of first){assert.equal(image.hidden,true);image.loaded(1024,1536);assert.equal(image.hidden,false);}
 assert.match(first[1].src,/hero-daily-sheathed-r1.webp$/);assert.equal(first[0].dataset.speaking,'true');assert.equal(first[0].srcWrites,1);
 e.get('story-portrait').loaded(512,512);assert.equal(e.get('story-portrait').hidden,false);
 const p=e.qa.getPresentation(),state=e.qa.getState();e.get('story-close').onclick();assert.equal(stage.children.length,0);assert.equal(e.qa.getPresentation().turnIndex,p.turnIndex);assert.deepEqual(e.qa.getState(),state);
 e.get('resume-story').onclick();assert.equal(stage.children.length,2);assert.equal(e.qa.getPresentation().turnIndex,p.turnIndex);assert.deepEqual(e.qa.getState(),state);
 e.get('story-next').onclick();assert.equal(stage.children.length,0,'supporting the backpack uses the authored action/environment shot');
 e.get('story-next').onclick();const next=[...stage.children];e.get('story-next').onclick();assert.deepEqual(stage.children,next,'consecutive safe dialogue keeps actor nodes');
}));

test('late backdrop, actor and portrait callbacks cannot revive dismissed art',()=>withApp(memory(),e=>{
 e.get('story-next').onclick();const actor=e.get('story-actors').children[0],face=e.get('story-portrait'),back=e.get('story-backdrop');const callbacks=[actor.onload,face.onload,back.onload];
 e.get('story-close').onclick();actor.naturalWidth=face.naturalWidth=back.naturalWidth=1024;actor.naturalHeight=face.naturalHeight=back.naturalHeight=1536;callbacks.forEach(fn=>fn());
 assert.equal(actor.hidden,true);assert.equal(face.hidden,true);assert.equal(back.hidden,true);assert.equal(e.get('story-actors').children.length,0);assert.equal(e.get('story-stage').dataset.artStatus,'inactive');
}));

test('empty and offscreen shots clear previous actors and prohibit implicit heroine',async()=>{
 assert.deepEqual(forestGalActors({portrait:'hero'}),[]);
 assert.deepEqual(forestGalActors({portrait:'hero',stage:{actors:{},clearActors:true,allowImplicitHero:false}}),[]);
 assert.deepEqual(forestGalActors({portrait:'hero',stage:{actors:{hero:{},guide:{}},offscreen:{hero:'outside'}}}).map(a=>a.id),['guide']);
 assert.deepEqual(forestGalActors({stage:{actors:{hero:{}},camera:'exterior-empty-shot'}}),[]);
 assert.deepEqual(forestGalActors({stage:{actors:{hero:{}},camera:'winter-interior-closeup',winterClothing:'worn-outside-not-rendered-in-unapproved-art'}}),[]);
 const storage=memory(),state=runtime.initialState(),empty=scene('b30_enter',state);assert.equal(empty.turns[0].stage.camera,'exterior-empty-shot');saveQueue(storage,state,[scene(),empty]);
 await withApp(storage,e=>{e.get('story-next').onclick();const image=e.get('story-actors').children[0],late=image.onload;e.get('story-skip').onclick();assert.equal(e.get('story-actors').children.length,0);assert.equal(e.get('story-portrait').hidden,true);image.naturalWidth=1024;image.naturalHeight=1536;late();assert.equal(image.hidden,true);assert.equal(e.get('story-backdrop').src,'');});
});

test('only explicitly authored B01 scene/location/variant triplets bind village pixels',()=>{
 for(const id of ['b01_enter','b01_pre','b01_post']){const s=scene(id);assert.equal(forestGalBackdrop(s,s.turns[0]).asset,backdrop);}
 const s=scene();for(const stage of [{locationId:'B-02'},{locationId:'B-01.inner-room'},{backdropAssetId:'B_ENV_01:winter'}])assert.equal(forestGalBackdrop(s,{...s.turns[0],stage:{...s.turns[0].stage,...stage}}).asset,null);
 assert.equal(forestGalBackdrop({sceneId:'b02_enter',backdropAssetId:'B_ENV_01:enter'},{stage:{locationId:'B-01',backdropAssetId:'B_ENV_01:enter'}}).asset,null);
});

test('conditional choice keeps the exact session handlers and gameplay state',async()=>{
 const storage=memory(),state=b02State({winterPlan:true}),s=createForestStory(runtime).resolve('b02_choice',state);s.turns=[{id:'ui:choice:b02_choice',kind:'choice-prompt',speaker:'你的选择',text:'',choices:structuredClone(s.choices),presentationOnly:true}];saveQueue(storage,state,[s],{turnIndex:s.turns.length-1});
 await withApp(storage,e=>{const before=e.qa.getState(),p=e.qa.getPresentation(),turn=p.queue[0].turns[p.turnIndex];assert.ok(turn.choices.length);assert.equal(e.get('story').dataset.choices,'true');assert.equal(e.get('story-next').disabled,true);assert.equal(e.get('story-choices').children.length,turn.choices.length);assert.deepEqual(e.qa.getState(),before);e.get('story-pause').onclick();e.get('resume-story').onclick();assert.equal(e.qa.getPresentation().turnIndex,p.turnIndex);assert.deepEqual(e.qa.getState(),before);e.get('story-choices').children[0].children[0].onclick();assert.deepEqual(e.qa.getState(),before,'a pure story response never changes gameplay');assert.equal(e.get('story').dataset.choices,'false');});
});


test('compact landscape scene metadata uses the footer below dialogue, outside actor faces',()=>{
 const css=readFileSync(new URL('../public/campaigns-b/styles.css',import.meta.url),'utf8'),compact=css.slice(css.indexOf('/* Compact landscape metadata'));
 assert.match(compact,/@media\(max-height:520px\) and \(orientation:landscape\)/);
 assert.match(compact,/story-scene-heading\{top:auto;bottom:0;left:3%;right:3%;max-width:none;height:4%/);
 assert.match(compact,/story-scene-heading \.eyebrow\{display:none/);
 assert.match(compact,/story-scene-heading \.story-art-label\{align-self:auto;font-size:inherit;line-height:1/);
 for(const [width,height]of [[844,390],[667,375],[568,320],[960,480]]){
  const footer={x:.03*width,y:.96*height,width:.94*width,height:.04*height};
  const dialogueBottom=.96*height;
  // Reviewed merchant face source box; middle-depth 86% contain geometry.
  const scale=Math.min(.41*width/1024,.86*height/1536),top=.97*height-1536*scale;
  const face={y:top+70*scale,bottom:top+254*scale};
  assert.ok(footer.y>=dialogueBottom,'metadata starts below the dialogue frame');
  assert.ok(face.bottom<footer.y,`${width}x${height}: face stays above metadata`);
 }
});


test('two-person portrait scenes explicitly override the narrower desktop actor width',()=>{
 const css=readFileSync(new URL('../public/campaigns-b/styles.css',import.meta.url),'utf8'),mobile=css.slice(css.indexOf('/* Portrait:'));
 assert.match(mobile,/\.story-dialog \.story-actors\[data-count="2"\] \.story-actor\{width:78%\}/);
 const post=scene('b29_shawu'),spoken=post.turns.find(t=>t.id==='b29_shawu.L1809');assert.ok(spoken);assert.deepEqual(forestGalActors(spoken).map(a=>a.id).sort(),['guide','hero']);
 const imageWidth=.78*390,imageHeight=Math.min(.64*844,.75*844-118,imageWidth*1.5);assert.ok(imageHeight>400);assert.ok(imageHeight<=.67*844);
});


test('reader tools preserve state/queue/turn and Escape restores tools before pausing',()=>withApp(memory(),e=>{
 e.get('story-next').onclick();const state=e.qa.getState(),presentation=e.qa.getPresentation(),stored=[...e.storage.entries];
 e.get('story-history').onclick();assert.equal(e.get('story-history-panel').hidden,false);assert.equal(e.get('story-history-entries').children.length,2);assert.equal(e.get('story-body').inert,true);
 e.get('story').dispatch('cancel',{preventDefault(){}});assert.equal(e.get('story').open,true);assert.equal(e.get('story-history-panel').hidden,true);assert.deepEqual(e.qa.getPresentation(),presentation);
 e.get('story-hide').onclick();assert.equal(e.get('story-body').hidden,true);assert.equal(e.get('story-restore').hidden,false);
 e.get('story').dispatch('cancel',{preventDefault(){}});assert.equal(e.get('story').open,true);assert.equal(e.get('story-body').hidden,false);assert.deepEqual(e.qa.getPresentation(),presentation);assert.deepEqual(e.qa.getState(),state);assert.deepEqual([...e.storage.entries],stored);
 e.get('story').dispatch('cancel',{preventDefault(){}});assert.equal(e.get('story').open,false);assert.equal(e.qa.getPresentation().paused,true);e.get('resume-story').onclick();assert.equal(e.get('story-body').hidden,false);assert.equal(e.get('story').dataset.readerMode,'reading');assert.equal(e.qa.getPresentation().turnIndex,presentation.turnIndex);assert.deepEqual(e.qa.getState(),state);
}));

test('eight-pouch insert is exactly bounded and clears actor and portrait layers',async()=>{
 const state=runtime.initialState(),rules=scene('b03_rules',state),storage=memory();saveQueue(storage,state,[rules]);
 await withApp(storage,e=>{const before=e.qa.getState(),image=e.get('story-backdrop');assert.match(image.src,/b03-eight-heat-pouches-open.webp$/);assert.equal(e.get('story').dataset.artPresentation,'object-insert');assert.equal(e.get('story-actors').children.length,0);assert.equal(e.get('story-portrait').src,'');
 image.loaded(1672,941);assert.equal(image.hidden,false);assert.equal(e.get('story-copy').textContent,rules.turns[0].text);
 const old=image.onload;while(e.qa.getPresentation().queue[0].turns[e.qa.getPresentation().turnIndex].id!=='b03_rules.L207')e.get('story-next').onclick();
 assert.match(image.src,/b03-tree-heart-veranda.webp$/);assert.equal(e.get('story').dataset.artPresentation,'environment');assert.equal(image.hidden,true);old();assert.equal(image.hidden,true);assert.match(e.get('story-art-label').textContent,/载入中/);image.loaded(1672,941);assert.equal(image.hidden,false);assert.deepEqual(e.qa.getState(),before);
 });
});

test('new art failures, repeated reopen and wrong dimensions remain safe',async()=>{
 for(const id of ['b02_enter','b03_enter','b03_rules']){const storage=memory(),state=runtime.initialState();saveQueue(storage,state,[scene(id,state)]);
 await withApp(storage,e=>{const image=e.get('story-backdrop'),p=e.qa.getPresentation();image.failed();assert.equal(image.hidden,true);assert.match(e.get('story-art-label').textContent,/背景加载失败/);e.get('story-close').onclick();e.get('resume-story').onclick();image.loaded(1,1);assert.equal(image.hidden,true);assert.deepEqual(e.qa.getState(),state);assert.equal(e.qa.getPresentation().turnIndex,p.turnIndex);});}
});

test('history arrows keep browser scrolling default and never move the game',()=>withApp(memory(),e=>{
 e.get('story-history').onclick();const before=e.qa.getState();let prevented=false;
 // The document handler is the same one used by ordinary arrow map input.
 e.key('ArrowDown','keydown',{target:e.get('story-history-entries'),preventDefault(){prevented=true;}});assert.equal(prevented,false);assert.deepEqual(e.qa.getState(),before);
 const source=readFileSync(new URL('../public/campaigns-b/app.js',import.meta.url),'utf8');assert.match(source,/if\(modalOpen\(\)\|\|session.pending\|\|session.isStoryOpen\(\)\)\{clearHeldMovement\(\);return;\}event.preventDefault\(\)/);
}));
