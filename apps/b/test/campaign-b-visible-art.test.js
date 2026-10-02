import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {createForestCampaign} from '../src/campaigns/b/content.js';import {forestWalkPath} from '../src/campaigns/b/view.js';
import {FOREST_CAST_ART,forestPortrait} from '../src/rendering/forest-cast-art.js';
import {B01_PROJECTION,B01_ART_ASSETS} from '../src/rendering/forest-entry-contract.js';
import {projectForestEntry,forestEntryCell,entryPointToCell,projectEntryControl,drawForestEntry} from '../src/rendering/forest-entry.js';
const runtime=createForestCampaign(),sha=b=>createHash('sha256').update(b).digest('hex');

test('B visual art keeps canonical identities and byte-identical approved pixels',()=>{
 for(const [id,a] of Object.entries(FOREST_CAST_ART)){assert.equal(sha(readFileSync(new URL('../public/'+a.file,import.meta.url))),a.sha256);assert.equal(forestPortrait({portrait:id}),a);assert.equal(a.width,512);assert.equal(a.height,512);}
 assert.equal(forestPortrait({speaker:'旁白',portrait:null}),null);assert.equal(forestPortrait({portrait:'unaccepted-new-hero'}),null);assert.equal(forestPortrait({voicePortrait:'guide'}),null);assert.equal(forestPortrait({portrait:'hero',stage:{portraitAllowed:false}}),null);
 assert.equal(FOREST_CAST_ART.cat_boss.name,'米露');assert.equal(Object.keys(FOREST_CAST_ART).length,4);
 for(const a of B01_ART_ASSETS)assert.equal(sha(readFileSync(new URL('../public/'+a.file,import.meta.url))),a.sha256,a.id);
 assert.equal(new Set(B01_ART_ASSETS.map(a=>a.file)).size,B01_ART_ASSETS.length);
});

test('B01 exact source-camera polygons resolve all 121 centres and preserve source direction',()=>{
 assert.equal(B01_PROJECTION.cells.length,121);assert.equal(B01_PROJECTION.width,1400);assert.equal(B01_PROJECTION.height,1100);
 assert.equal(B01_PROJECTION.contentHash,runtime.identity.contentHash);assert.deepEqual(B01_PROJECTION.map,runtime.region('B-01').map);
 for(const cell of B01_PROJECTION.cells){assert.deepEqual(entryPointToCell(...cell.foot),{x:cell.x,y:cell.y});assert.ok(cell.head166[1]<cell.foot[1]);if(cell.x<10)assert.ok(forestEntryCell(cell.x+1,cell.y).foot[0]>cell.foot[0]);if(cell.y<10)assert.ok(forestEntryCell(cell.x,cell.y+1).foot[1]>cell.foot[1]);
 const tile={style:{},dataset:{}};projectEntryControl(tile,cell);assert.equal(tile.dataset.sourceCell,`${cell.x},${cell.y}`);assert.equal(tile.dataset.projectedFoot,cell.foot.join(','));assert.match(tile.style.clipPath,/^polygon\(/);}
 assert.equal(entryPointToCell(-20,-20),null);
});

test('B01 render objects and projected clicks never grant paths, pay resources, or change scene rules',()=>{
 const state=runtime.initialState(),raw=JSON.stringify(state),scene=projectForestEntry(runtime,state);assert.equal(scene.objects.length,4);assert.equal(JSON.stringify(state),raw);assert.deepEqual(scene.objects.find(o=>o.id==='hero').cell.foot,forestEntryCell(state.location.x,state.location.y).foot);assert.equal(scene.objects.find(o=>o.kind==='anchor').destination,'B-02');
 for(const cell of scene.cells){const click=entryPointToCell(...cell.foot);assert.deepEqual(forestWalkPath(runtime,state,click.x,click.y),forestWalkPath(runtime,state,cell.x,cell.y));assert.equal(cell.passable,runtime.passable(state,cell.x,cell.y));}
 let changed=state;for(const direction of ['right','right'])changed=runtime.dispatch(changed,{type:'move',direction}).state;changed=runtime.dispatch(changed,{type:'interact',entityId:'b01.timberPuppet'}).state;assert.ok(!projectForestEntry(runtime,changed).objects.some(o=>o.id==='b01.timberPuppet'));assert.ok(projectForestEntry(runtime,changed).cells.find(c=>c.x===4&&c.y===5).passable);
 assert.equal(projectForestEntry(runtime,{...state,location:{regionId:'B-02',x:1,y:5}}),null);
});

test('B01 independent actor composites apply per-cell alpha masks without a global foreground overlay',()=>{
 const model=projectForestEntry(runtime,runtime.initialState()),calls=[],ctx=new Proxy({measureText:text=>({width:text.length*12})},{get(target,key){return key in target?target[key]:(...args)=>calls.push([String(key),...args]);},set(target,key,value){calls.push(['set',String(key),value]);target[key]=value;return true;}}),images=new Map(B01_ART_ASSETS.map(a=>[a.id,{id:a.id}]));let layers=0;
 const before=JSON.stringify(runtime.initialState()),result=drawForestEntry(ctx,model,images,{width:638,height:638*11/14,readable:true,createLayer:()=>{layers++;return{getContext:()=>ctx};}});
 assert.equal(layers,model.objects.length);assert.equal(calls.filter(c=>c[0]==='set'&&c[1]==='globalCompositeOperation'&&c[2]==='destination-out').length,model.objects.length);for(const o of model.objects)assert.ok(images.has(o.cell.maskId));assert.equal(result.sourceCamera,true);assert.equal(JSON.stringify(runtime.initialState()),before);
 const hero=calls.find(c=>c[0]==='drawImage'&&c[1]?.id==='hero-standee'),foot=model.objects.find(o=>o.kind==='hero').cell.foot,scale=hero[4]/1024;assert.ok(Math.abs(hero[2]+590*scale-foot[0])<1e-8);assert.ok(Math.abs(hero[3]+1523*scale-foot[1])<1e-8);
});
