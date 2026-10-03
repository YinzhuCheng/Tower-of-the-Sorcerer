import assert from 'node:assert/strict';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {POLICY,DELTAS,makeProbe,probeId,measureActions,certifyAndReplay,summarizeCorpus} from './lab.mjs';

const root = resolve(process.argv[2] ?? '.');
const out = resolve(process.argv[3] ?? 'difficulty-reports');
assert.notEqual(root, out, 'Use a separate report directory');
const load = p => import(pathToFileURL(join(root,p)).href);
const {solve} = await load('apps/a/src/solver/search.js');
const report = {schemaVersion:1, status:'offline-development-screen', releaseReady:false,
  claims:['Atomic replays establish existence only','Numeric probes are not final easy/normal/hard releases',
    'No runtime UI, story, art, geometry, resource economy, save schema, or baseline files were edited'],
  fingerprints:{}, candidates:{}};
await mkdir(join(out,'certificates'),{recursive:true});
for (const id of ['b','c']) {
  const contentPath = `apps/${id}/src/campaigns/${id}/content.js`;
  const api = await load(contentPath);
  const createSpec = id === 'b' ? api.createForestSpec : api.createVoyageSpec;
  const {createCampaign} = await load(`apps/${id}/src/core/campaign.js`);
  const replayApi = await load(`apps/${id}/src/solver/campaign-replay.js`);
  const {createCampaignAdapter} = await load(`apps/${id}/src/solver/campaign-adapter.js`);
  const base = createSpec(), baseline = createCampaign(base);
  for (const p of [contentPath,`apps/${id}/src/core/campaign.js`,`apps/${id}/src/solver/campaign-replay.js`,
    `apps/${id}/src/solver/campaign-adapter.js`]) {
    report.fingerprints[p] = createHash('sha256').update(await readFile(join(root,p))).digest('hex');
  }
  const certDir = join(root,`apps/${id}/artifacts/campaigns`);
  const corpus = [];
  for (const file of (await readdir(certDir)).filter(f => f.endsWith('.certificate.json')).sort()) {
    const certificate = JSON.parse(await readFile(join(certDir,file),'utf8'));
    const original = replayApi.replayCampaignCertificate(baseline,certificate);
    assert.equal(original.ok,true,`${file}: ${original.reason}`);
    corpus.push({file,certificate,actions:certificate.steps.map(s=>s.action)});
  }
  const entry = {baselineIdentity:baseline.identity, reviewedEnemyIds:POLICY[id].enemyIds,
    baselineCertificates:corpus.length, baselineActions:corpus.reduce((n,c)=>n+c.actions.length,0), probes:[]};
  for (const delta of DELTAS) {
    const runtime = makeProbe({base,createCampaign,candidate:id,delta});
    const rows = corpus.map(({file,actions})=>({file,...measureActions(runtime,actions)}));
    const probe = {id:probeId(delta),delta,identity:runtime.identity,corpus:summarizeCorpus(rows),routes:rows};
    // One independently checksum-verified certificate per surviving probe.
    const preferred = corpus.find(c => id === 'b' ? c.file.includes('zero-wedge-greenhouse-lodge') : c.file === 'c-normal.certificate.json');
    const selected = [preferred,...corpus].filter(Boolean).find(c=>rows.find(r=>r.file===c.file)?.ok);
    if (selected) {
      const certificate = certifyAndReplay(runtime, selected.actions, replayApi, `numeric-probe:${selected.file}`);
      const file = `${id}-${probe.id}-corpus.certificate.json`;
      await writeFile(join(out,'certificates',file),JSON.stringify(certificate,null,2)+'\n');
      probe.certificate = {file:`certificates/${file}`,hash:certificate.certificateHash,steps:certificate.steps.length,
        source: selected.file, zeroWedge: selected.file.includes('zero-wedge')};
    }
    // C's bounded general macro search is fresh discovery, independent of old routes.
    // B retains explicit corpus evidence; this is not a claim of exhaustive B search.
    if (id === 'c') {
      const search = solve({adapter:createCampaignAdapter(runtime),mode:'existence',maxExpanded:100,maxGenerated:2500});
      probe.search = {solvable:search.solvable,stoppedReason:search.stoppedReason,
        expandedStates:search.expandedStates,generatedStates:search.generatedStates,
        optimalityProven:false, atomicReplayVerified:false};
      if (search.solvable) {
        const actions = search.certificate.steps.map(s=>s.action);
        const certificate = certifyAndReplay(runtime,actions,replayApi,'bounded-macro-search');
        const file = `${id}-${probe.id}-search.certificate.json`;
        await writeFile(join(out,'certificates',file),JSON.stringify(certificate,null,2)+'\n');
        Object.assign(probe.search,{atomicReplayVerified:true,certificate:`certificates/${file}`,
          certificateHash:certificate.certificateHash,...measureActions(runtime,actions)});
      }
    }
    entry.probes.push(probe);
    console.log(`${id}/${probe.id}: corpus ${probe.corpus.wins}/${probe.corpus.routes}; zero-wedge ${probe.corpus.zeroWedgeRoutesSurvive}; search ${probe.search?.stoppedReason ?? 'not run'}`);
  }
  report.candidates[id] = entry;
}
report.fingerprints['apps/a/src/solver/search.js'] = createHash('sha256').update(await readFile(join(root,'apps/a/src/solver/search.js'))).digest('hex');
await writeFile(join(out,'difficulty-screen.json'),JSON.stringify(report,null,2)+'\n');
console.log(`Wrote ${join(out,'difficulty-screen.json')}`);
