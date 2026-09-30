import test from 'node:test';
import assert from 'node:assert/strict';
import { createCampaign, createSaveRepository } from '../src/core/campaign.js';
import { createVoyageCampaign, createVoyageSpec } from '../src/campaigns/c/content.js';
import { createCampaignAdapter } from '../src/solver/campaign-adapter.js';
import { certifyCampaignActions, replayCampaignCertificate } from '../src/solver/campaign-replay.js';
const tiny=()=>({id:'tiny',difficulty:'normal',version:'1',title:'Fixture',initial:{location:{regionId:'room',x:1,y:1},stats:{hp:20,maxHp:20,atk:10,def:5,gold:5},resources:{heat:8}},regions:[{id:'room',map:['#####','#...#','#...#','#...#','#####'],arrival:{x:1,y:1},entities:[{id:'cache',x:2,y:1,kind:'pickup',effects:{resources:{heat:1}}},{id:'finish',x:3,y:3,kind:'operation',requires:{resource:'heat',min:1},effects:{resources:{heat:-1},flags:{done:true}}}]}],goal:{flag:'done'}});

test('context is cloned, immutable, and independent of later input or another difficulty',()=>{
  const input=tiny(),r=createCampaign(input),hash=r.identity.contentHash; input.initial.resources.heat=99;
  assert.equal(r.initialState().resources.heat,8);assert.throws(()=>{r.spec.initial.resources.heat=10;});
  const other=createCampaign({...tiny(),difficulty:'hard'});assert.notEqual(other.identity.contentHash,hash);
  assert.throws(()=>other.deserialize(r.serialize(r.initialState())),/identity/);
});
test('preview and transaction use same state change; input and rejects do not mutate',()=>{
  const r=createCampaign(tiny()),s=r.initialState(),before=JSON.stringify(s),action={type:'interact',entityId:'cache'};
  const p=r.preview(s,action),a=r.dispatch(s,action);assert.equal(p.legal,true);assert.deepEqual(p.nextState,a.state);assert.equal(JSON.stringify(s),before);
  const again=r.dispatch(a.state,action);assert.equal(again.ok,false);assert.equal(again.state,a.state);assert.equal(again.state.resources.heat,9);
  assert.equal(r.dispatch(s,{type:'interact',entityId:'finish'}).ok,false);
  assert.equal(r.dispatch(s,{type:'move',direction:'teleport'}).ok,false);
  assert.equal(r.dispatch(a.state,{...action,expectedRevision:0}).ok,false);
});
test('heat reservation condition and exact zero fuel work without special UI logic',()=>{
  const r=createCampaign(tiny()),s=r.initialState();s.resources.heat=4;
  assert.equal(r.meets(s,{resource:'heat',min:1,reserveUntrueFlags:['a','b','c','d']}),false);
  s.flags.a=true;assert.equal(r.meets(s,{resource:'heat',min:1,reserveUntrueFlags:['a','b','c','d']}),true);
});
test('simple macro certificate replays only atomic engine actions and rejects edits',()=>{
  const r=createCampaign(tiny()),adapter=createCampaignAdapter(r);let s=r.initialState(),actions=[];
  for(const id of ['cache','finish']){
    const macro=adapter.enumerateActions(s).find(a=>a.command.entityId===id);assert.ok(macro);
    const result=adapter.applyAction(s,macro);assert.equal(result.ok,true);s=result.state;actions.push(...result.steps.map(step=>step.action));
  }
  const proof=certifyCampaignActions(r,actions);assert.equal(proof.ok,true);assert.equal(replayCampaignCertificate(r,proof.certificate).ok,true);
  const bad=structuredClone(proof.certificate);bad.steps[0].action.entityId='finish';assert.equal(replayCampaignCertificate(r,bad).ok,false);
  assert.equal(replayCampaignCertificate(createCampaign({...tiny(),difficulty:'other'}),proof.certificate).ok,false);
});
test('voyage deck is tied to current berth and same mutable state, with six slots',()=>{
  const r=createVoyageCampaign(),s=r.initialState();s.location={regionId:'C-D01',x:5,y:5};
  assert.equal(r.balanced(s),false);
  const moved=r.dispatch(s,{type:'moveBallast',weightId:'w2',slot:'R1'});assert.equal(moved.ok,true);assert.equal(r.balanced(moved.state),true);
  assert.equal(r.dispatch(moved.state,{type:'moveBallast',weightId:'w1',slot:'R1'}).ok,false);
  const onGangway={...moved.state,location:{regionId:'C-D01',x:7,y:7}};
  const shore=r.dispatch(onGangway,{type:'traverse',edgeId:'c.leaveDeck'});assert.equal(shore.state.location.regionId,'C-M01');assert.equal(shore.state.resources.fuel,9);
  assert.equal(r.spec.regions.length,6);assert.ok(r.spec.regions.every(x=>x.map.length===11&&x.map.every(y=>y.length===11)));
});
test('cargo, task lamp oil, and fuel remain separate; unknown flag commands cannot win',()=>{
  const r=createVoyageCampaign(),s=r.initialState();
  assert.equal(r.dispatch(s,{type:'setFlag',id:'c.bothLamps',value:true}).ok,false);
  assert.equal(s.flags['c.lampOil'],true);assert.equal(s.resources.lampOil,undefined);
  const altered=createVoyageSpec();altered.initial.resources.fuel=10;assert.notEqual(createCampaign(altered).identity.contentHash,r.identity.contentHash);
});
test('save slots are isolated between campaign difficulty and content',()=>{
  const values=new Map(),storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
  const a=createCampaign(tiny()),b=createCampaign({...tiny(),difficulty:'hard'}),sa=createSaveRepository(storage,a),sb=createSaveRepository(storage,b);
  sa.save('auto',a.initialState());assert.deepEqual(sa.load('auto'),a.initialState());assert.equal(sb.load('auto'),null);
});
test('bootstrap restores autosave before any write; corrupt bytes are preserved',()=>{
  const values=new Map(),writes=[],storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>{writes.push(k);values.set(k,v);},removeItem:k=>values.delete(k)};
  const r=createCampaign(tiny()),repo=createSaveRepository(storage,r);
  const advanced=r.dispatch(r.initialState(),{type:'interact',entityId:'cache'}).state;
  repo.save('manual',r.initialState());repo.save('auto',advanced);writes.length=0;
  const restored=repo.restore();assert.equal(restored.source,'auto');assert.equal(restored.state.resources.heat,9);assert.equal(writes.length,0);
  values.set(repo.key('auto'),'{broken');
  const recovered=repo.restore();assert.equal(recovered.source,'manual');assert.equal(recovered.issues.length,1);assert.equal(values.get(recovered.issues[0].backup),'{broken');assert.equal(values.get(repo.key('auto')),'{broken');
  values.delete(repo.key('manual'));assert.equal(repo.restore().allowAutoSave,false);
});
test('content compiler refuses repeatable rewards and free infinite shops',()=>{
 const a=tiny();a.regions[0].entities[0].once=false;assert.throws(()=>createCampaign(a),/Repeatable/);
 const b=tiny();b.regions[0].entities[0]={id:'shop',x:2,y:1,kind:'shop',once:false,price:0,effects:{stats:{atk:1}}};assert.throws(()=>createCampaign(b),/Unbounded/);
});
