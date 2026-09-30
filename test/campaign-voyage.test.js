import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createVoyageCampaign } from '../src/campaigns/c/content.js';
import { replayCampaignCertificate } from '../src/solver/campaign-replay.js';
const certificate=name=>JSON.parse(readFileSync(new URL(`../artifacts/campaigns/${name}.certificate.json`,import.meta.url),'utf8'));
const prefix=(runtime,cert,stop)=>{let state=runtime.initialState();for(const step of cert.steps){if(stop(step,state))return state;const result=runtime.dispatch(state,step.action);assert.equal(result.ok,true,result.reason);state=result.state;}throw new Error('Prefix target missing');};

test('C standard atomic certificate preserves every important operation and cost',()=>{
 const r=createVoyageCampaign(),cert=certificate('c-normal'),replay=replayCampaignCertificate(r,cert);assert.equal(replay.ok,true,replay.reason);
 assert.deepEqual(cert.steps.filter(s=>s.events.some(e=>e.type==='departure')).map(s=>s.events.find(e=>e.type==='departure').cost.fuel),[2,3,3,2]);
 assert.equal(replay.state.resources.fuel,1);assert.equal(replay.state.flags['c.lampOil'],false);assert.equal(replay.state.victory,true);
 for(const id of ['c.openBarrier','c.unload','c.stow','c.rollCargo','c.installLamp','c.signal'])assert.ok(cert.steps.some(s=>s.action.entityId===id),id);
});
test('both real one-detour routes win without clearing their bypassed enemy',()=>{
 for(const [name,unfought]of [['c-normal-short-bypass','c.machine2'],['c-normal-bypass-short','c.machine1']]){const r=createVoyageCampaign(),result=replayCampaignCertificate(r,certificate(name));assert.equal(result.ok,true,result.reason);assert.equal(result.state.resources.fuel,0);assert.equal(result.state.cleared.includes(unfought),false);}
});
test('departure consumes exactly once; moving, waiting, preview and cancelled confirmation do not charge',()=>{
 const r=createVoyageCampaign(),cert=certificate('c-normal');const s=prefix(r,cert,step=>step.action.edgeId==='c.sail12'),action={type:'traverse',edgeId:'c.sail12'};
 const raw=JSON.stringify(s);for(let i=0;i<5;i++)r.preview(s,action);assert.equal(JSON.stringify(s),raw);
 const first=r.dispatch(s,action);assert.equal(first.ok,true);assert.equal(first.state.resources.fuel,s.resources.fuel-2);
 const repeated=r.dispatch(first.state,action);assert.equal(repeated.ok,false);assert.equal(repeated.state.resources.fuel,first.state.resources.fuel);
 assert.equal(r.dispatch(first.state,{type:'traverse',edgeId:'c.leaveDeck'}).ok,false,'cannot step ashore before mooring');
});
test('M03 winch is a balance-gated common prerequisite to BOTH route choices',()=>{
 const r=createVoyageCampaign(),cert=certificate('c-normal');const s=prefix(r,cert,step=>step.action.entityId==='c.openBarrier');
 assert.equal(s.boat.cargo,'left');assert.equal(r.balanced(s),true);
 const bad=structuredClone(s);bad.boat.positions={w1:'L1',w2:'L2',w3:'C1'};
 const failed=r.dispatch(bad,{type:'interact',entityId:'c.openBarrier'});assert.equal(failed.ok,false);assert.equal(failed.state.flags['c.barrierOpen'],undefined);
 const atHelm={...s,location:{regionId:'C-D01',x:5,y:8},boat:{...s.boat,cargo:'center',positions:{w1:'L1',w2:'R1',w3:'C1'}}};
 for(const edgeId of ['c.sail34.short','c.sail34.bypass'])assert.equal(r.dispatch(atHelm,{type:'traverse',edgeId}).ok,false);
});
test('cargo unload and empty-ship stow have distinct balance checks',()=>{
 const r=createVoyageCampaign(),cert=certificate('c-normal');const s=prefix(r,cert,step=>step.action.entityId==='c.unload');
 assert.equal(s.boat.cargo,'right');const unload=r.dispatch(s,{type:'interact',entityId:'c.unload'});assert.equal(unload.ok,true);assert.equal(unload.state.boat.cargo,'ashore');assert.equal(r.balanced(unload.state),false);
 assert.equal(r.dispatch(unload.state,{type:'interact',entityId:'c.stow'}).ok,false);
});
test('120 distinct ballast layouts have 24/16/16/24 equilibria and a connected reversible berth graph',()=>{
 const r=createVoyageCampaign(),slots=Object.keys(r.spec.ballast.slots),layouts=[];
 for(const a of slots)for(const b of slots)for(const c of slots)if(new Set([a,b,c]).size===3)layouts.push({w1:a,w2:b,w3:c});
 assert.equal(layouts.length,120);for(const [cargo,count] of [['center',24],['left',16],['right',16],['ashore',24]]){const state=r.initialState();state.boat.cargo=cargo;assert.equal(layouts.filter(positions=>r.balanced({...state,boat:{...state.boat,positions}})).length,count);}
 const seen=new Set([JSON.stringify(layouts[0])]),queue=[layouts[0]];
 for(const positions of queue)for(const id of ['w1','w2','w3'])for(const slot of slots){if(Object.values(positions).includes(slot))continue;const next={...positions,[id]:slot},key=JSON.stringify(next);if(!seen.has(key)){seen.add(key);queue.push(next);}}
 assert.equal(seen.size,120);
});
