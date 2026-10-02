import {readFile,writeFile} from 'node:fs/promises';
import {createVoyageCampaign} from '../src/campaigns/c/content.js';
import {buildViewModel} from '../src/rendering/c-three-model.js';
const runtime=createVoyageCampaign(),cert=JSON.parse(await readFile(new URL('../public/campaigns/c-normal.certificate.json',import.meta.url)));let state=runtime.initialState();const records=[];
for(const[index,step]of cert.steps.entries()){const before=runtime.stateHash(state),r=runtime.dispatch(state,step.action);if(!r.ok||before!==step.before||runtime.stateHash(r.state)!==step.after)throw new Error(`Replay mismatch ${index}`);state=r.state;if(step.action.type!=='move')records.push({step:index+1,action:step.action,stateHash:runtime.stateHash(state),location:state.location,boat:state.boat,visibleDevices:buildViewModel(runtime,state).devices.map(d=>d.id),victory:state.victory});}
await writeFile(new URL('../reports/reached-route-states.json',import.meta.url),JSON.stringify({identity:runtime.identity,source:'actual initialState + each certificate action dispatched in order; no fixtures or state injection',final:state,records},null,2));
console.log(`Verified ${cert.steps.length} sequential actions; ${records.length} significant state records`);
