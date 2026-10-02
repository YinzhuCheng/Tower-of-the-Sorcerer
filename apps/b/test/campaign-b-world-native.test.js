import {FOREST_WORLD_RUNTIME_ASSETS} from '../src/rendering/forest-world-runtime-assets.js';
import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import{createHash}from'node:crypto';
import {nativeWorldContract,nativeWorldCell,nativeWorldSample,occludeNativeSprite,nativeViewport,nativeToScreen,projectNativeControl} from '../src/rendering/forest-world-native.js';
import{createForestCampaign}from'../src/campaigns/b/content.js';import{worldPoint}from'../src/rendering/forest-world.js';
const c=nativeWorldContract(),runtime=createForestCampaign();
test('native shared world assets and geometry are source-locked and finite',()=>{
 assert.equal(c.rulesContentHash,runtime.identity.contentHash);assert.equal(c.finite,true);assert.equal(c.regions.length,3);assert.equal(c.joins.length,2);assert.equal(c.cells.length,363);assert.equal(c.cells.filter(c=>c.walkable).length,173);for(const a of Object.values(FOREST_WORLD_RUNTIME_ASSETS)){assert.equal(createHash('sha256').update(readFileSync(new URL('../public/'+a.file,import.meta.url))).digest('hex'),a.sha256,a.file);assert.equal(c.assetHashes[a.canonicalFile],a.canonicalSha256);}
 for(const cell of c.cells){assert.equal(cell.walkable,runtime.region(cell.sourceRegionId).map[cell.localY][cell.localX]==='.');assert.ok(cell.head166Px[1]<cell.footPx[1]);}
});
test('native sampler follows all authored local edges and joins in both directions, including sloped support',()=>{
 const routes=[...c.edges.map(e=>({...e,a:worldPoint({regionId:e.sourceRegionId,x:e.from[0],y:e.from[1]}),b:worldPoint({regionId:e.sourceRegionId,x:e.to[0],y:e.to[1]})})),...c.joins.map(e=>({...e,a:worldPoint({regionId:e.from,x:e.fromCell[0],y:e.fromCell[1]}),b:worldPoint({regionId:e.to,x:e.toCell[0],y:e.toCell[1]})}))];let samples=0;
 for(const e of routes){for(const s of [...e.samples,...e.samples.toReversed()]){const p={x:e.a.x+(e.b.x-e.a.x)*s.t,y:e.a.y+(e.b.y-e.a.y)*s.t},actual=nativeWorldSample(p);assert.ok(actual,e.id);for(let j=0;j<3;j++)assert.ok(Math.abs(actual.worldFootM[j]-s.worldFootM[j])<.001,`${e.id} support ${j}`);for(let j=0;j<2;j++)assert.ok(Math.abs(actual.footPx[j]-s.footPx[j])<.01,`${e.id} pixel ${j}`);samples++;}}
 assert.equal(samples,2*(c.edges.length*13+c.joins.length*65));assert.equal(nativeWorldSample({x:11,y:2}),null,'no native support invented for off-route connector space');
});
test('moving depth mask treats source depth, blocker flag and no-hit alpha independently',()=>{
 const depth=new Uint8ClampedArray(c.width*c.height*4),left=100,top=100,sample={footPx:[100.5,110.5],footDepthM:35},i=(top*c.width+left)*4,encode=d=>Math.round((d-c.depthEncoding.nearM)/(c.depthEncoding.farM-c.depthEncoding.nearM)*65535);const set=(d,b,a)=>{const code=encode(d);depth[i]=code>>8;depth[i+1]=code&255;depth[i+2]=b;depth[i+3]=a;};
 for(const[d,b,a,expected]of[[30,255,255,0],[40,255,255,255],[30,0,255,255],[30,255,0,255]]){set(d,b,a);const pixels=new Uint8ClampedArray([250,220,190,255]);occludeNativeSprite(pixels,1,1,left,top,sample,depth);assert.equal(pixels[3],expected);}
});
test('native projected controls and camera crop use the same source polygons at all viewport sizes',()=>{
 const cell=nativeWorldCell('B-02',1,5),camera={x:cell.footPx[0],y:cell.footPx[1]};for(const[width,height]of[[570,439],[366,440],[930,600]]){const view=nativeViewport(width,height),tile={style:{}};projectNativeControl(tile,cell,camera,view);const foot=nativeToScreen(cell.footPx,camera,view);assert.equal(foot.x,width/2);assert.equal(foot.y,height*.56);assert.ok(parseFloat(tile.style.width)>60);assert.match(tile.style.clipPath,/^polygon/);assert.ok(-c.affine.z_m[1]*1.66*view.scale>=60);}
});

test('native asset failure is explicit and leaves deterministic world fallback available',async()=>{
 const{preloadNativeWorld,nativeWorldAvailability}=await import('../src/rendering/forest-world-native.js'),saved={Image:globalThis.Image,document:globalThis.document};let notified=0;Object.assign(globalThis,{document:{},Image:class{set src(value){queueMicrotask(()=>this.onerror());}}});
 try{preloadNativeWorld(()=>notified++);await new Promise(resolve=>setImmediate(resolve));assert.equal(nativeWorldAvailability().ready,false);assert.deepEqual(nativeWorldAvailability().failed,['backdrop','depth']);assert.equal(notified,2);}finally{Object.assign(globalThis,saved);}
});
