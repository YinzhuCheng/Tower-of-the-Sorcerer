import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createVoyageCampaign,VOYAGE_VESSEL_GEOMETRY as G,voyageDeckToVessel as physical,voyageDeckToBerth as berth,voyageVesselToBerth,voyageVesselToWorld} from '../src/campaigns/c/content.js';
import {reachablePaths} from '../src/solver/campaign-adapter.js';
import {replayCampaignCertificate} from '../src/solver/campaign-replay.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} ~= ${b}`);
const distance=(a,b)=>Math.hypot(...a.map((n,i)=>n-b[i]));
const segmentDistance=(p,a,b)=>{const d=b.map((n,i)=>n-a[i]),t=Math.max(0,Math.min(1,p.reduce((s,n,i)=>s+(n-a[i])*d[i],0)/d.reduce((s,n)=>s+n*n,0)));return distance(p,a.map((n,i)=>n+t*d[i]));};
const inside=(p,poly)=>poly.every((a,i)=>{const b=poly[(i+1)%poly.length];return (b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0])>=-1e-8;});
const deckState=r=>({...r.initialState(),location:{regionId:'C-D01',...r.region('C-D01').arrival}});
const cert=name=>JSON.parse(readFileSync(new URL(`../artifacts/campaigns/${name}.certificate.json`,import.meta.url),'utf8'));

test('D01 uses one narrow workdeck with permanent cargo-rack exclusions and all 42 cells connected',()=>{
 const r=createVoyageCampaign(),region=r.region('C-D01'),state=deckState(r),points=[];
 for(let y=0;y<11;y++)for(let x=0;x<11;x++)if(r.passable(state,x,y))points.push([x,y]);
 assert.equal(points.length,42);assert.equal(reachablePaths(r,state).size,42);
 for(const [x,y]of points)assert.ok(x>=3&&x<=7&&y>=1&&y<=9);
 for(const [x,y]of G.deckSampling.reservedRackCells)assert.equal(region.map[y][x],'#');
 for(const entity of region.entities)assert.ok([...reachablePaths(r,state).keys()].some(key=>{const[x,y]=key.split(',').map(Number);return r.inReach({...state,location:{...state.location,x,y}},entity.id);}),entity.id);
});
test('one 3m by 6m hull has exact berth envelope and isotropic .6m deck mapping',()=>{
 const ring=G.hull.outlineXZ.map(([X,Z])=>voyageVesselToBerth([X,G.hull.deckY,Z]));
 assert.deepEqual([Math.min(...ring.map(p=>p[0])),Math.min(...ring.map(p=>p[1])),Math.max(...ring.map(p=>p[0])),Math.max(...ring.map(p=>p[1]))],G.berthSampling.hullEnvelopeGrid);
 for(let y=1;y<9;y++)for(let x=3;x<7;x++){close(distance(physical([x,y]),physical([x+1,y])),.6);close(distance(physical([x,y]),physical([x,y+1])),.6);}
 assert.deepEqual(berth([7,7]),[6.2,7]);assert.deepEqual(berth([8,7]),[6.8,7]);
 const bowGrid=[5,(-3+2.7)/.6];close(bowGrid[1],-.5);assert.equal(G.hull.length/G.hull.beam,2);
});
test('every navigable edge has physical hull clearance and avoids all three rack footprints',()=>{
 const r=createVoyageCampaign(),state=deckState(r),ring=G.hull.outlineXZ,rad=G.deckSampling.actorRadius;
 const crates=Object.values(G.fixtures.cargoRack.poses).map(g=>{const[X,,Z]=physical(g);return[X,Z];});
 const check=g=>{const[X,,Z]=physical(g),p=[X,Z];assert.ok(inside(p,ring),`inside ${g}`);
  for(let i=0;i<ring.length;i++)assert.ok(segmentDistance(p,ring[i],ring[(i+1)%ring.length])+1e-8>=rad,`hull clearance ${g}`);
  for(const[cx,cz]of crates){const dx=Math.max(0,Math.abs(X-cx)-.22),dz=Math.max(0,Math.abs(Z-cz)-.2);assert.ok(Math.hypot(dx,dz)+1e-8>=rad,`rack clearance ${g}`);}
 };
 for(let y=1;y<=9;y++)for(let x=3;x<=7;x++)if(r.passable(state,x,y)){
  check([x,y]);for(const[dx,dy]of[[1,0],[0,1]])if(r.passable(state,x+dx,y+dy))for(let k=1;k<=20;k++)check([x+dx*k/20,y+dy*k/20]);
 }
});
test('six socket lever arms equal the published normalized rule; cargo positions do not enter slots',()=>{
 const r=createVoyageCampaign();for(const[id,xy]of Object.entries(r.spec.ballast.slotCoordinates))close(physical(xy)[0],1.2*r.spec.ballast.slots[id]);
 for(const[cargo,xy]of Object.entries(G.fixtures.cargoRack.poses))close(2*physical(xy)[0],1.2*r.spec.ballast.cargoTorques[cargo]);
 const sockets=Object.values(r.spec.ballast.slotCoordinates).map(String);for(const xy of Object.values(G.fixtures.cargoRack.poses))assert.ok(!sockets.includes(String(xy)));
});
test('davit and gangway remain nonwalkable edge devices operated only from safe adjacent deck stands',()=>{
 const r=createVoyageCampaign(),s=deckState(r);for(const id of['c.unload','c.stow']){
  const e=r.entity(id);assert.deepEqual([e.x,e.y],[8,2]);assert.deepEqual(e.interactionAt,{x:7,y:2});assert.equal(r.passable(s,e.x,e.y),false);
  assert.equal(r.inReach({...s,location:{...s.location,x:7,y:2}},id),true);
  assert.equal(r.inReach({...s,location:{...s.location,x:7,y:3}},id),false);
 }
 assert.equal(r.passable(s,8,7),false);assert.equal(r.inReach({...s,location:{...s.location,x:7,y:7}},'c.deckGangway'),true);
 const operator=physical([7,2]),cargo=physical([7,3]);assert.ok(cargo[2]-operator[2]>.2+G.deckSampling.actorRadius);
 assert.deepEqual(r.spec.visualLinks.find(l=>l.id==='c.davit').body,{x:8,y:3});
});
test('gate operator/observer avoid cable; mooring lines stay outboard and are separate from signal lamp',()=>{
 const f=G.fixtures,cable=f.gateWinch.cablePathXZ;
 for(const grid of[f.gateWinch.operator,f.bowObserver]){const[X,,Z]=physical(grid);for(let i=0;i<cable.length-1;i++)assert.ok(segmentDistance([X,Z],cable[i],cable[i+1])>.25);}
 for(const p of[f.mooring.bowFairleadXYZ,f.mooring.sternFairleadXYZ])assert.ok(p[0]>physical([7,5])[0]);
 assert.deepEqual(f.mooring.shoreBollardsGrid,[[7,3],[7,8]]);assert.equal(f.mooring.signalDoesNotOperateLines,true);
 assert.equal(f.securedSword.visible,false);assert.deepEqual(f.securedSword.legacyAnchorRetired,[2,7]);
});
test('world view uses the berth rigid yaw and uniform scale without reflecting starboard at M04',()=>{
 const p=physical([7,4]),c=physical([5,4]),a={origin:[24,64],yaw_deg:0,scale:4},b={origin:[96,48],yaw_deg:180,scale:4};
 close(distance(voyageVesselToWorld(p,a),voyageVesselToWorld(c,a)),4*distance(p,c));
 close(distance(voyageVesselToWorld(p,b),voyageVesselToWorld(c,b)),4*distance(p,c));
 assert.ok(voyageVesselToWorld(p,a)[0]>voyageVesselToWorld(c,a)[0]);assert.ok(voyageVesselToWorld(p,b)[0]<voyageVesselToWorld(c,b)[0]);
 for(const t of[a,b,{origin:[0,0],yaw_deg:53,scale:4}]){const origin=voyageVesselToWorld([0,0,0],t),[u,v,w]=[[1,0,0],[0,1,0],[0,0,1]].map(p=>voyageVesselToWorld(p,t).map((n,i)=>n-origin[i]));const det=u[0]*(v[1]*w[2]-v[2]*w[1])-v[0]*(u[1]*w[2]-u[2]*w[1])+w[0]*(u[1]*v[2]-u[2]*v[1]);assert.ok(Math.abs(det-64)<1e-6,`proper rigid basis ${det}`);}
});
test('new geometry requires new namespace, rejects old snapshots/certificates, and keeps all three real victories',()=>{
 const r=createVoyageCampaign(),old=JSON.parse(readFileSync(new URL('../artifacts/campaigns/history/c-geometry-v1.1/c-normal.certificate.json',import.meta.url),'utf8'));
 assert.notEqual(r.identity.contentHash,old.identity.contentHash);assert.equal(replayCampaignCertificate(r,old).ok,false);
 const oldState=r.initialState();oldState.identity=old.identity;assert.throws(()=>r.deserialize(JSON.stringify(oldState)),/identity mismatch/);
 for(const[x,y]of[[2,5],[8,3],[3,3],[5,3],[7,3]]){const bad=r.initialState();bad.location={regionId:'C-D01',x,y};assert.throws(()=>r.assertValidState(bad),/not a floor tile/);}
 for(const name of['c-normal','c-normal-short-bypass','c-normal-bypass-short']){const result=replayCampaignCertificate(r,cert(name));assert.equal(result.ok,true,result.reason);assert.equal(result.state.victory,true);}
});
test('geometry revision changes no numeric, task, plot source, transition, enemy or action-effect semantics',()=>{
 const now=createVoyageCampaign().spec,old=JSON.parse(readFileSync(new URL('../artifacts/campaigns/history/c-geometry-v1.1/spec.json',import.meta.url),'utf8'));
 for(const key of['initial','source','transitions','ballast','goal'])assert.deepEqual(now[key],old[key],key);
 assert.deepEqual(now.regions.map(r=>r.id),old.regions.map(r=>r.id));
 for(const region of now.regions){const previous=old.regions.find(r=>r.id===region.id);assert.deepEqual(region.arrival,previous.arrival);if(region.id!=='C-D01')assert.deepEqual(region,previous);
  const semantics=e=>Object.fromEntries(Object.entries(e).filter(([key])=>!['x','y','interactionAt'].includes(key)));
  assert.deepEqual(region.entities.map(semantics),previous.entities.map(semantics));
 }
});
test('outboard davit has a real in-hull foot clear of cargo and its operator, with one connected housing/handwheel',()=>{
 const d=G.fixtures.cargoDavit,[X,,Z]=d.hullMountXYZ,foot=[X,Z];assert.ok(inside(foot,G.hull.outlineXZ));
 const[cx,,cz]=physical(G.fixtures.cargoRack.poses.right),[ox,,oz]=physical(d.operator);
 assert.ok(Math.hypot(Math.max(0,Math.abs(X-cx)-.22),Math.max(0,Math.abs(Z-cz)-.2))>.04);
 assert.ok(distance(foot,[ox,oz])>G.deckSampling.actorRadius+.04);
 assert.equal(d.outboardHousingXYZ[0],d.handleXYZ[0]);close(Math.abs(d.handleXYZ[2]-d.outboardHousingXYZ[2]),.6);assert.match(d.connection,/Rigid bracket.*visible forward shaft/i);
});
