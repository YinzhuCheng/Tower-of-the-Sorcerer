import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createVoyageCampaign} from '../src/campaigns/c/content.js';
import {createVoyageStory,VOYAGE_STORY_IDS} from '../src/campaigns/c/story/index.js';
const reports=[];
for(const name of ['c-normal','c-normal-short-bypass','c-normal-bypass-short']){
 const runtime=createVoyageCampaign(),story=createVoyageStory(runtime),certificate=JSON.parse(await readFile(`artifacts/campaigns/${name}.certificate.json`,'utf8'));
 let state=runtime.initialState(),seenIds=[],scenes=[];
 for(const step of certificate.steps){const before=state,result=runtime.dispatch(before,step.action);assert.equal(result.ok,true);state=result.state;const beforeHash=runtime.stateHash(before),afterHash=runtime.stateHash(state);const batch=story.fromDispatch({stateBefore:before,stateAfter:state,events:result.events,receipt:result.receipt,seenIds});assert.deepEqual(batch.narrativeConflicts,[]);assert.equal(runtime.stateHash(before),beforeHash);assert.equal(runtime.stateHash(state),afterHash);seenIds=batch.seenIds;scenes.push(...batch.scenes);}
 assert.equal(state.victory,true);
 for(const choice of ['lampRoom','bow']){const ending=story.epilogue(state,choice,{seenIds});assert.deepEqual(ending.narrativeConflicts,[]);assert.deepEqual([...new Set([...scenes,...ending.scenes].map(s=>s.sceneId))].sort(),[...VOYAGE_STORY_IDS].sort());}
 reports.push({name,scenes:20,bothEpilogues:true,resourcesUnchangedByStory:true});
}
console.log(JSON.stringify({ok:true,sourceStoryVersion:'v1.1',reports},null,2));
