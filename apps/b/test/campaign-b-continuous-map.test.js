// B-scoped copy of four unchanged shared/B assertions from the frozen continuous samples r1 package.
import test from 'node:test';import assert from 'node:assert/strict';
import {createForestCampaign}from'../src/campaigns/b/content.js';import{buildForestWitness}from'../src/campaigns/b/witness.js';
import{compileBoundaryRuns,renderContinuousMap,setMaterialImage,fitMapViewport,command,label}from'../src/rendering/continuous-map.js';
import{projectForestScene}from'../src/rendering/b-adapter.js';
import{readFileSync}from'node:fs';
const mock=()=>{const calls=[];const ctx=new Proxy({calls},{get(o,k){if(k in o)return o[k];return(...args)=>calls.push([k,...args]);},set(o,k,v){o[k]=v;return true;}});return ctx;};
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} ~= ${b}`);
test('union boundaries close straight, convex, concave, T, cross and diagonal masks without inner seams',()=>{
 const shapes=[[[0,0]],[[0,0],[1,0],[2,0]],[[0,0],[1,0],[0,1]],[[0,0],[1,0],[2,0],[1,1]],[[1,0],[0,1],[1,1],[2,1],[1,2]],[[0,0],[1,1]]];
 for(const cells of shapes){const runs=compileBoundaryRuns(cells),n=new Set(cells.map(String));let perimeter=0;for(const[x,y]of cells)for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]])if(!n.has([x+dx,y+dy].join()))perimeter++;assert.equal(runs.reduce((a,b)=>a+Math.hypot(b.points[1][0]-b.points[0][0],b.points[1][1]-b.points[0][1]),0),perimeter);const vertices=new Map();for(const r of runs)for(const p of r.points)vertices.set(String(p),(vertices.get(String(p))??0)+1);assert.ok([...vertices.values()].every(n=>n%2===0));}
 assert.equal(compileBoundaryRuns([[0,0],[1,0],[2,0]]).length,4);assert.equal(compileBoundaryRuns([[0,0],[1,1]]).length,8);
});
test('surface union is clipped once and world UV never restarts on each gameplay cell',()=>{
 const ctx=mock(),image={width:1024,height:1024};setMaterialImage('dry-stone',image,{mode:'world-domain'});const camera=renderContinuousMap(ctx,{width:11,height:11,surfaces:[{material:'dry-stone',cells:[[0,0],[1,0],[2,0]]}]},{width:360,height:360,dpr:2});assert.equal(ctx.calls.filter(c=>c[0]==='clip').length,1);assert.deepEqual(ctx.calls.find(c=>c[0]==='drawImage').slice(2),[0,0,11,11]);assert.deepEqual(camera.cellAt(359,359),{x:10,y:10});close(camera.scale,360/11);assert.deepEqual(ctx.calls.find(c=>c[0]==='setTransform').slice(1),[2,0,0,2,0,0]);
});
test('B root/person/public variants preserve original live enemy and authoritative cuts',()=>{
 const r=createForestCampaign(),w=buildForestWitness({runtime:r,wedges:[7,16]}),before=w.checkpoints.find(x=>x.entityId==='b07.fixRoot').before,fixed=w.checkpoints.find(x=>x.entityId==='b07.fixRoot').state,finished=w.checkpoints.find(x=>x.entityId==='b07.rootWorks').state;
 for(const[state,variant]of[[before,'closed'],[fixed,'person'],[finished,'public']]){const hash=r.stateHash(state),scene=projectForestScene(r,state);assert.equal(scene.routeStates.root,variant);assert.equal(scene.routeStates.original,'closed');assert.ok(scene.objects.some(o=>o.entityId==='b07.originalEnemy'));assert.equal(scene.passability[8][4],r.passable(state,4,8));assert.equal(scene.passability[2][4],false);assert.equal(r.stateHash(state),hash);assert.deepEqual(projectForestScene(r,state),scene);}
 const b9=w.checkpoints.find(x=>x.entityId==='b09.bridgeWorks');assert.equal(projectForestScene(r,b9.before).routeStates.bridge,'construction');assert.equal(projectForestScene(r,b9.state).routeStates.bridge,'public');assert.equal(r.identity.contentHash,'a12cd07ee1ccc762');
});
test('desktop map sizing reserves the full trailing controls; short/mobile-sized budgets remain scrollable',()=>{assert.equal(fitMapViewport({viewportHeight:757,top:220,trailing:150,width:520}),371);assert.equal(fitMapViewport({viewportHeight:900,top:230,trailing:160,width:610}),494);assert.equal(fitMapViewport({viewportHeight:620,top:220,trailing:150,width:400}),308);assert.equal(fitMapViewport({viewportHeight:600,top:300,trailing:160,width:280}),280);});
