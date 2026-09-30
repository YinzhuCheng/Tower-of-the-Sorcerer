import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateConfig, requireCi, chromeArgs, within, verifyOneMove, VIEWPORTS } from '../lib/config.mjs';
import { observe, observationExpression } from '../lib/observation.mjs';
import { requestPath } from '../lib/server.mjs';
import { pngDimensions } from '../lib/cdp.mjs';
import { workflow } from '../workflow/make-workflow.mjs';
const configs={};for(const id of ['a','b','c','c3d'])configs[id]=JSON.parse(await readFile(new URL(`../configs/${id}.json`,import.meta.url),'utf8'));
function element(extra={}){return {hidden:false,disabled:false,open:false,inert:false,id:'',width:638,height:638,children:[],dataset:{},textContent:'',title:'',classList:{contains:()=>false},getClientRects:()=>[{}],getBoundingClientRect:()=>({x:0,y:0,width:638,height:638,right:638,bottom:638}),getAttribute:()=>null,...extra};}
function fixture(adapter){
  const elements=new Map(),canvas=element({id:'map-canvas'}),tiles=Array.from({length:121},(_,i)=>element({classList:{contains:c=>c==='floor'},getAttribute:()=>`${i%11},${Math.floor(i/11)} 可行地面`}));
  const board=element({children:tiles,dataset:{renderer:'continuous'}});elements.set('#board',board);elements.set('#map-canvas',canvas);elements.set('.map-stage',element());
  let canvases=adapter==='c3d'?[canvas,element({id:'three-canvas',hidden:true})]:[canvas];
  const doc={querySelector:s=>elements.get(s)??null,querySelectorAll:s=>s==='canvas'?canvases:[],documentElement:{scrollWidth:390,scrollHeight:1100},readyState:'complete',title:'test'};
  const store=new Map(),reads=[];const storage={getItem:key=>{reads.push(key);return store.get(key)??null;}};
  const identity={campaignId:adapter==='b'?'forest-b':'voyage-c',difficultyId:'normal',rulesVersion:'test-rules',contentHash:'hash'};
  const state={identity,location:{regionId:'test-region',x:5,y:5},victory:false,revision:0};
  const win={innerWidth:390,innerHeight:844,devicePixelRatio:1,scrollX:0,scrollY:0,location:{href:'http://127.0.0.1:4321/'},getComputedStyle:()=>({display:'block',visibility:'visible'}),__FOREST_PREVIEW__:{getState:()=>structuredClone(state),getIdentity:()=>identity},__CAMPAIGN_PREVIEW__:{getState:()=>structuredClone(state),getIdentity:()=>identity}};
  const key=`${adapter==='c3d'?'c3d-prototype:':''}campaign:${identity.campaignId}:normal:test-rules:hash:auto`;store.set(key,JSON.stringify({$campaignSave:1,state}));
  return {elements,doc,storage,win,store,reads,key,state,canvas,canvases,config:configs[adapter],setCanvases:value=>{canvases=value;}};
}
test('all four configs specify package, output, branch and entry without guessing B/C paths',()=>{for(const c of Object.values(configs))assert.equal(validateConfig(c),c);assert.equal(configs.a.branch,'candidate/a-tower-rewrite');assert.equal(configs.c3d.packageRoot,'prototypes/c-harbor-3d');assert.equal(configs.b.startPath,'/campaigns-b/');});
test('reject unsafe config paths, remote URLs, unrecognized adapters and flags',()=>{for(const patch of [{packageRoot:'../x'},{outputDirectory:'.'},{startPath:'https://example.com/'},{startPath:'//evil/'},{startPath:'/%2e%2e/'},{branch:'main'},{adapter:'a'},{chromeFlags:['anything']},{build:[['node','-e','x']]},{build:[['node','../script.mjs']]},{build:[['npm','install']]}])assert.throws(()=>validateConfig({...configs.b,...patch}));});
test('browser capture is refused outside actual explicit CI mode',()=>{assert.throws(()=>requireCi({}));assert.throws(()=>requireCi({CI:'true'}));assert.doesNotThrow(()=>requireCi({CI:'true',GITHUB_ACTIONS:'true'}));});
test('Chrome flags preserve sandbox, normal GPU, security and scrollbars',()=>{const flags=chromeArgs('/tmp/fresh',9222,VIEWPORTS[1]);assert.deepEqual(flags,['--headless=new','--remote-debugging-address=127.0.0.1','--remote-debugging-port=9222','--user-data-dir=/tmp/fresh','--window-size=390,844','about:blank']);});
test('path helper blocks traversal and server root escapes',()=>{assert.equal(within('/repo','dist'),'/repo/dist');assert.throws(()=>within('/repo','../private'));for(const p of ['/../secret','/%2e%2e/secret','/a\\b','/%00'])assert.throws(()=>requestPath(p));assert.equal(requestPath('/campaigns/?x=1'),'./campaigns/');});
test('A opening is observable before any canvas and never called map-ready',()=>{const f=fixture('a');f.setCanvases([]);f.elements.set('#gal-root',element({textContent:'opening'}));const s=observe(f.doc,f.storage,f.win,f.config);assert.equal(s.readiness.storyOpen,true);assert.equal(s.readiness.canvasReady,false);assert.equal(s.readiness.ready,false);});
test('A readiness retains real autosave, finished asset loading and interactive shell',()=>{const f=fixture('a');f.elements.set('#app-shell',element());const loading=element({classList:{contains:c=>c==='hidden'}});f.elements.set('#loading-note',loading);const state={floor:0,x:1,y:1,floorStates:Array.from({length:30},()=>({map:['...','...','...']}))};f.store.set('lost-magic-tower:auto:v1',JSON.stringify(state));f.win.__TOWER_FORCE_CANVAS__=true;const s=observe(f.doc,f.storage,f.win,f.config);assert.equal(s.readiness.ready,true);assert.equal(s.safeMove.key,'ArrowUp');loading.classList.contains=()=>false;assert.equal(observe(f.doc,f.storage,f.win,f.config).readiness.ready,false);});
test('B and C autosave are identity-scoped and do not need A floorStates',()=>{for(const id of ['b','c']){const f=fixture(id),s=observe(f.doc,f.storage,f.win,f.config);assert.equal(s.readiness.ready,true);assert.equal(s.save.key,f.key);assert.ok(f.reads.every(k=>k.startsWith('campaign:')));assert.equal(s.safeMove.key,'ArrowUp');assert.equal(s.renderStatus.renderer,'Canvas2D continuous');}});
test('wrong or missing campaign save cannot pass map readiness',()=>{const f=fixture('b');f.store.set(f.key,JSON.stringify({...f.state,identity:{...f.state.identity,contentHash:'wrong'}}));assert.equal(observe(f.doc,f.storage,f.win,f.config).readiness.ready,false);f.store.clear();assert.equal(observe(f.doc,f.storage,f.win,f.config).save.valid,false);});
test('visible B/C modal blocks movement readiness',()=>{const f=fixture('b');f.elements.set('#story',element({open:true,textContent:'actual dialogue'}));const s=observe(f.doc,f.storage,f.win,f.config);assert.equal(s.dialog.visible,true);assert.equal(s.readiness.ready,false);assert.equal(s.safeMove,null);});
test('C3D reports pending renderer rather than accepting fallback too early',()=>{const f=fixture('c3d');f.win.__C3D_QA__={snapshot:()=>({mode:'player-play',view:'2d'})};f.elements.set('#view-health',element({textContent:'3D 正在初始化'}));assert.equal(observe(f.doc,f.storage,f.win,f.config).readiness.ready,false);});
test('C3D genuine WebGL2 failure is labeled 2D fallback',()=>{const f=fixture('c3d');f.win.__C3D_QA__={snapshot:()=>({mode:'player-play',view:'2d'})};f.elements.set('#view-health',element({textContent:'已回退 2D：WebGL2 unavailable'}));const s=observe(f.doc,f.storage,f.win,f.config);assert.equal(s.readiness.ready,true);assert.equal(s.renderStatus.renderer,'Canvas2D fallback');assert.match(s.renderStatus.viewHealth,/WebGL2 unavailable/);});
test('C3D WebGL2 label requires live visible 3D canvas and app renderer report',()=>{const f=fixture('c3d');f.setCanvases([element({id:'three-canvas'})]);f.win.__C3D_QA__={snapshot:()=>({mode:'player-play',view:'3d',stats:{calls:10}})};f.elements.set('#view-stats',element({textContent:'WebGL2 · 10 draws'}));assert.equal(observe(f.doc,f.storage,f.win,f.config).renderStatus.renderer,'WebGL2 (app-reported)');});
test('one move must be one adjacent cell, same region, without victory',()=>{const s={region:'one',x:4,y:5,victory:false};assert.equal(verifyOneMove(s,{...s,x:5}),true);for(const bad of [s,{...s,x:6},{...s,x:5,region:'two'},{...s,x:5,victory:true}])assert.throws(()=>verifyOneMove(s,bad));});
test('PNG check verifies exact viewport pixel dimensions, not full page',()=>{const b=Buffer.alloc(24);Buffer.from('89504e470d0a1a0a','hex').copy(b);b.writeUInt32BE(390,16);b.writeUInt32BE(844,20);assert.deepEqual(pngDimensions(b),{width:390,height:844});assert.throws(()=>pngDimensions(Buffer.alloc(24)));});
test('serialized read-only observation compiles without page mutation methods',()=>{const source=observationExpression(configs.b);assert.doesNotThrow(()=>new Function(`return ${source}`));assert.doesNotMatch(source,/\.setItem\(|\.removeItem\(|\.clear\(|\.click\(|\.dispatch\(/);});
test('workflow stays on exactly one candidate branch and uses read-only checkout',()=>{const s=workflow(configs.b);assert.match(s,/branches: \['candidate\/b-forest-road'\]/);assert.match(s,/contents: read/);assert.match(s,/persist-credentials: false/);assert.match(s,/if: always\(\)/);assert.doesNotMatch(s,/contents: write|pull_request_target|secrets\.|no-sandbox|unsafe-swiftshader|disable-web-security/);});

const c3dInitial=JSON.parse(await readFile(new URL('./fixtures/c3d-initial-contract.json',import.meta.url),'utf8'));
function actualC3dInitialFixture(){
  const f=fixture('c3d'),data=structuredClone(c3dInitial),state=data.initialState;
  f.store.clear();f.win.__CAMPAIGN_PREVIEW__={getState:()=>structuredClone(state),getIdentity:()=>data.identity};
  f.win.__C3D_QA__={snapshot:()=>({mode:'player-play',view:'2d',stats:null})};
  const i=data.identity,key=`c3d-prototype:campaign:${i.campaignId}:${i.difficultyId}:${i.rulesVersion}:${i.contentHash}:auto`;
  f.store.set(key,JSON.stringify({$campaignSave:1,state}));f.key=key;
  f.canvas.hidden=data.mapCanvasHidden;
  f.setCanvases([f.canvas,element({id:'three-canvas',hidden:data.threeCanvasHidden})]);
  const board=f.elements.get('#board');board.dataset.renderer=data.boardRenderer;
  board.children=data.map.flatMap((row,y)=>[...row].map((token,x)=>element({classList:{contains:c=>c==='floor'&&token==='.'},title:data.entityCoordinates.some(e=>e.x===x&&e.y===y)?'real entity':'',getAttribute:()=>`${x},${y} ${token==='.'?'可行地面':'不可行走'}`})));
  f.elements.set('#view-health',element({textContent:data.fallbackHealth}));return f;
}
test('source-derived C-M01 initial grid fallback reads only the isolated prototype save',()=>{
  const f=actualC3dInitialFixture(),s=observe(f.doc,f.storage,f.win,f.config);
  assert.equal(c3dInitial.continuousSceneAtStart,null);assert.equal(c3dInitial.continuousSamples.includes('C-M01'),false);
  assert.equal(s.save.key,f.key);assert.equal(s.save.valid,true);assert.ok(f.reads.every(k=>k.startsWith('c3d-prototype:campaign:')));
  assert.deepEqual(s.state,{region:'C-M01',x:7,y:7,victory:false,revision:0});
  assert.equal(s.readiness.canvasReady,false);assert.equal(s.readiness.boardReady,true);assert.equal(s.readiness.ready,true);
  assert.equal(s.renderStatus.renderer,'DOM grid fallback');assert.equal(s.safeMove.key,'ArrowUp');
});
test('an ordinary C save cannot masquerade as the C3D prototype autosave',()=>{
  const f=actualC3dInitialFixture(),raw=f.store.get(f.key);f.store.clear();f.store.set(f.key.replace('c3d-prototype:',''),raw);
  const s=observe(f.doc,f.storage,f.win,f.config);assert.equal(s.save.valid,false);assert.equal(s.readiness.ready,false);
});
test('grid fallback requires actual signal, hook view, complete grid, and hidden real canvases',()=>{
  for(const breakContract of [
    f=>{f.elements.get('#view-health').textContent='3D 正在初始化';},
    f=>{f.win.__C3D_QA__={snapshot:()=>({view:'3d'})};},
    f=>{f.elements.get('#board').children.pop();},
    f=>{f.elements.get('#board').hidden=true;},
    f=>{f.elements.get('#board').dataset.renderer='unknown';},
    f=>{f.canvas.hidden=false;},
    f=>{f.setCanvases([]);},
    f=>{f.store.clear();}
  ]){const f=actualC3dInitialFixture();breakContract(f);assert.equal(observe(f.doc,f.storage,f.win,f.config).readiness.ready,false);}
});
test('continuous sample fallback requires its own visible map canvas and 121 cells',()=>{
  const f=actualC3dInitialFixture();f.elements.get('#board').dataset.renderer='continuous';f.canvas.hidden=false;
  assert.equal(observe(f.doc,f.storage,f.win,f.config).renderStatus.renderer,'Canvas2D fallback');
  assert.equal(observe(f.doc,f.storage,f.win,f.config).readiness.ready,true);
  f.canvas.hidden=true;assert.equal(observe(f.doc,f.storage,f.win,f.config).readiness.ready,false);
});
test('when C3D package is present, its actual source and projection still match the fixture',async t=>{
  const packageUrl=new URL(process.env.CANDIDATE_QA_C3D_SOURCE_URL??'../../prototypes/c-harbor-3d/',import.meta.url);
  let app;try{app=await readFile(new URL('public/campaigns/app.js',packageUrl),'utf8');}catch(e){if(e.code==='ENOENT'){t.skip('C3D package absent on this candidate branch; source-derived fixture tests above still run');return;}throw e;}
  assert.match(app,/getItem:key=>localStorage\.getItem\('c3d-prototype:'\+key\)/);
  const {createVoyageCampaign}=await import(new URL('src/campaigns/c/content.js',packageUrl));
  const {projectVoyageScene,VOYAGE_MAP_SIDECAR}=await import(new URL('src/rendering/c-adapter.js',packageUrl));
  const runtime=createVoyageCampaign(),state=runtime.initialState();assert.deepEqual(runtime.identity,c3dInitial.identity);assert.deepEqual(state,c3dInitial.initialState);assert.deepEqual(VOYAGE_MAP_SIDECAR.samples,c3dInitial.continuousSamples);assert.equal(projectVoyageScene(runtime,state),null);
  const html=await readFile(new URL('public/campaigns/index.html',packageUrl),'utf8');assert.match(html,/<canvas id="three-canvas"[^>]* hidden>/);assert.match(html,/<canvas id="map-canvas"[^>]* hidden>/);
  const controller=await readFile(new URL('src/rendering/c-three-controller.js',packageUrl),'utf8');assert.match(controller,/已回退 2D：/);
  const compositor=await readFile(new URL('src/rendering/continuous-map.js',packageUrl),'utf8');assert.match(compositor,/canvas\.hidden=!scene;board\.dataset\.renderer=scene\?'continuous':'legacy'/);
});
