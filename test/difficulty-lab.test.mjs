import test from 'node:test';
import assert from 'node:assert/strict';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {readFile,readdir} from 'node:fs/promises';
import {POLICY,DELTAS,makeProbe,assertLocked,measureActions,certifyAndReplay,summarizeCorpus} from '../scripts/difficulty-lab/lab.mjs';
const root=resolve(process.env.TOWER_CORE ?? '.');
const load=p=>import(pathToFileURL(join(root,p)).href);
const {createForestSpec}=await load('apps/b/src/campaigns/b/content.js');
const {createCampaign,createSaveRepository}=await load('apps/b/src/core/campaign.js');
const replayApi=await load('apps/b/src/solver/campaign-replay.js');
const base=createForestSpec(),normal=createCampaign(base);
const cert=JSON.parse(await readFile(join(root,'apps/b/artifacts/campaigns/b-normal-zero-wedge-greenhouse-lodge.certificate.json')));
const probe=d=>makeProbe({base,createCampaign,candidate:'b',delta:d});

test('zero delta preserves exact baseline spec, identity and certificate',()=>{
 const rt=probe(0);assert.deepEqual(rt.spec,base);assert.deepEqual(rt.identity,normal.identity);
 assert.equal(replayApi.replayCampaignCertificate(rt,cert).ok,true);
});
test('every reviewed probe leaves original input and protected content untouched',()=>{
 const before=structuredClone(base);for(const d of DELTAS){const rt=probe(d);assertLocked(base,rt.spec,POLICY.b,d);}
 assert.deepEqual(base,before);
});
test('unreviewed mutations, campaigns and stale baseline are rejected',()=>{
 for(const d of [-3,3,.5,NaN])assert.throws(()=>probe(d));
 assert.throws(()=>makeProbe({base,createCampaign,candidate:'d',delta:0}));
 const changed=structuredClone(base);changed.initial.stats.hp++;
 assert.throws(()=>makeProbe({base:changed,createCampaign,candidate:'b',delta:1}),/Baseline content drift/);
});
test('lock rejects topology, story, finite-economy, boss and unlisted numeric changes',()=>{
 const changes=[s=>s.regions[0].map[1]='...........',s=>s.regions[0].entities[0].storyId='invented',
  s=>s.initial.resources.heat++,s=>s.regions[0].entities[0].once=false,
  s=>s.transitions[0].requires={flag:'unreviewed'},
  s=>s.regions.flatMap(r=>r.entities).find(e=>e.id==='b28.guardDrive').enemy.atk++,
  s=>s.regions.flatMap(r=>r.entities).find(e=>e.id==='b05.sluicePuppet').enemy.hp++];
 for(const mutate of changes){const s=structuredClone(probe(1).spec);mutate(s);assert.throws(()=>assertLocked(base,s,POLICY.b,1));}
});
test('probe identities and existing save-key contract prevent cross-profile saves',()=>{
 const storage={getItem:()=>null,setItem(){},removeItem(){}};
 const keys=DELTAS.map(d=>{const rt=probe(d);if(d)assert.throws(()=>rt.deserialize(normal.serialize(normal.initialState())),/identity mismatch/);return createSaveRepository(storage,rt).key('auto');});
 assert.equal(new Set(keys).size,DELTAS.length);
});
test('old certificate cannot be reused for numerically changed content',()=>{
 assert.equal(replayApi.replayCampaignCertificate(probe(1),cert).ok,false);
});
test('newly certified route independently replays; tampering fails',()=>{
 const rt=probe(-1),fresh=certifyAndReplay(rt,cert.steps.map(s=>s.action),replayApi,'test');
 assert.equal(fresh.final.victory,true);assert.equal(fresh.final.stats.hp,58);
 const bad=structuredClone(fresh);bad.steps[0].after='tampered';
 assert.equal(replayApi.replayCampaignCertificate(rt,bad).ok,false);
});
test('B +1 survives but +2 cannot pass frozen zero-wedge route screening',()=>{
 const actions=cert.steps.map(s=>s.action),one=measureActions(probe(1),actions),two=measureActions(probe(2),actions);
 assert.equal(one.ok,true);assert.equal(one.finalHp,12);assert.equal(two.ok,false);
 assert.equal(two.failedAction.entityId,'b28.guardDrive');
 const summary=summarizeCorpus([{file:'zero-wedge',...two}]);assert.equal(summary.zeroWedgeRoutesSurvive,false);
 assert.equal(summary.minimumWinningHpFraction,null);assert.match(summary.coverage,/not proof of unsolvability/);
});
test('repeat-cleared enemy remains unavailable under each numeric probe',()=>{
 for(const d of DELTAS){const rt=probe(d);let s=rt.initialState();
 for(const step of cert.steps){const r=rt.dispatch(s,step.action);assert.equal(r.ok,true);s=r.state;
 if(step.action.entityId==='b01.timberPuppet'){const repeat=rt.dispatch(s,step.action);assert.equal(repeat.ok,false);assert.deepEqual(repeat.state,s);break;}}
 }
});
test('all generated corpus/search evidence files carry valid new identities and replays',async()=>{
 const out=resolve(process.env.TOWER_REPORTS ?? 'reports');
 const files=(await readdir(join(out,'certificates'))).filter(f=>f.endsWith('.certificate.json'));
 assert.equal(files.length,15);
 const {createVoyageSpec}=await load('apps/c/src/campaigns/c/content.js');
 const cCore=await load('apps/c/src/core/campaign.js');
 const cReplay=await load('apps/c/src/solver/campaign-replay.js');
 for(const file of files){const candidate=file[0],c=JSON.parse(await readFile(join(out,'certificates',file))),delta=c.identity.difficultyId==='normal'?0:Number(c.identity.difficultyId.endsWith('1')?1:2)*(c.identity.difficultyId.includes('minus')?-1:1);
  const rt=makeProbe({base:candidate==='b'?base:createVoyageSpec(),createCampaign:candidate==='b'?createCampaign:cCore.createCampaign,candidate,delta});
  assert.equal((candidate==='b'?replayApi:cReplay).replayCampaignCertificate(rt,c).ok,true,file);
 }
});
