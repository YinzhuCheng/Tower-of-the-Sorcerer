import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createVoyageCampaign,VOYAGE_VESSEL_GEOMETRY as G} from '../src/campaigns/c/content.js';
import {reachablePaths} from '../src/solver/campaign-adapter.js';
import {replayCampaignCertificate} from '../src/solver/campaign-replay.js';
const root='docs/campaigns/c-geometry-v1.2',runtime=createVoyageCampaign();
const contract=JSON.parse(await readFile(`${root}/map-space-contract-v1.2.json`,'utf8'));
const geometry=JSON.parse(await readFile(`${root}/vessel-physical-geometry-v1.2.json`,'utf8'));
assert.deepEqual(geometry.geometry,G);assert.deepEqual(geometry.identity,runtime.identity);assert.deepEqual(contract.runtimeIdentity,runtime.identity);
const snapshot={identity:runtime.identity,regions:runtime.spec.regions,ballast:runtime.spec.ballast,visualLinks:runtime.spec.visualLinks,vesselGeometry:G};
const text=JSON.stringify(snapshot,null,2)+'\n';await writeFile(`${root}/qa/runtime-map-snapshot-v1.2.json`,text);
const checks=runtime.spec.regions.map(region=>{
 const reference=contract.regions.find(r=>r.id===region.id),normalized=reference.grid.map(row=>[...row].map(c=>'=rds'.includes(c)?'.':c).join(''));
 const state=runtime.initialState();state.location={regionId:region.id,...region.arrival};const paths=reachablePaths(runtime,state);
 return {region:region.id,dimensions11:region.map.length===11&&region.map.every(row=>row.length===11),normalizedMaskMatches:JSON.stringify(normalized)===JSON.stringify(region.map),reachableCells:paths.size,entities:region.entities.map(e=>({id:e.id,at:[e.x,e.y],requiredStand:e.interactionAt??null,reachable:[...paths.keys()].some(key=>{const[x,y]=key.split(',').map(Number);return runtime.inReach({...state,location:{...state.location,x,y}},e.id);})}))};
});
const edges=new Map();for(const face of geometry.mesh.triangles)for(let i=0;i<3;i++){const a=face[i],b=face[(i+1)%3],key=[a,b].sort((x,y)=>x-y).join(',');const uses=edges.get(key)??[];uses.push([a,b]);edges.set(key,uses);}
const manifold=[...edges.values()].every(uses=>uses.length===2&&uses[0][0]===uses[1][1]&&uses[0][1]===uses[1][0]);assert.equal(manifold,true);
const routes=[];for(const name of['c-normal','c-normal-short-bypass','c-normal-bypass-short']){const certificate=JSON.parse(await readFile(`artifacts/campaigns/${name}.certificate.json`,'utf8')),result=replayCampaignCertificate(runtime,certificate);assert.equal(result.ok,true,result.reason);routes.push({name,actions:certificate.steps.length,hp:result.state.stats.hp,fuel:result.state.resources.fuel,victory:result.state.victory});}
const report={status:checks.every(c=>c.dimensions11&&c.normalizedMaskMatches&&c.entities.every(e=>e.reachable))?'PASS':'FAIL',scope:'Six actual masks and all entity stands; watertight single metric mesh; three authoritative initial-state certificate replays. Physical swept-path tests are in test/campaign-c-geometry.test.js. No pixel-art acceptance claim.',runtimeIdentity:runtime.identity,runtimeSnapshotSha256:createHash('sha256').update(text).digest('hex'),geometryId:G.geometryId,metricHull:{beam:G.hull.beam,length:G.hull.length,vertices:geometry.mesh.vertices.length,triangles:geometry.mesh.triangles.length,manifold},deckPitch:G.deckSampling.pitch,deckReachableCells:checks.find(c=>c.region==='C-D01').reachableCells,checks,routes};
await writeFile(`${root}/qa/map-correspondence-validation-v1.2.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));assert.equal(report.status,'PASS');
