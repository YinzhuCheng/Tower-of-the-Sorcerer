import {FOREST_STORY_CONTENT as CONTENT} from '../../src/campaigns/b/story/content.js';
import {forestTurnStage} from '../../src/campaigns/b/story/presentation.js';
import {FOREST_GAL_CG_CONTRACT as CONTRACT} from '../../src/rendering/forest-gal-cg-contract.js';
import {FOREST_GAL_CGS} from '../../src/rendering/forest-gal-assets.js';

export const ART_PREVIEW_ENTRIES=Object.freeze([
 Object.freeze({sceneId:'b01_enter',turnId:'B.OPEN.R1.b01_enter.T002',label:'正常背景 · 村口'}),
 ...CONTRACT.map(row=>Object.freeze({...row,label:`${FOREST_GAL_CGS[row.assetId].label} · ${row.turnId}`}))
]);
// Independent in-memory reading windows. No session, reducer, progress or save API.
// Keep the complete consecutive CG block and its adjacent authored turns. Do not
// invent a next turn at a scene boundary or mix mutually exclusive branches.
export function createArtPreviewScene(turnId){
 const entry=ART_PREVIEW_ENTRIES.find(row=>row.turnId===turnId);
 if(!entry)throw new Error('Unknown preview turn');
 const source=CONTENT.scenes[entry.sceneId],original=source.turns;
 const target=original.findIndex(turn=>turn.id===turnId);
 const cgIds=new Set(CONTRACT.filter(row=>row.sceneId===entry.sceneId).map(row=>row.turnId));
 let first=target,last=target;
 while(first>0&&cgIds.has(original[first-1].id))first--;
 while(last+1<original.length&&cgIds.has(original[last+1].id))last++;
 const compatible=turn=>turn.branch===original[target].branch&&!turn.text.includes('{{');
 if(first>0&&compatible(original[first-1]))first--;
 if(last+1<original.length&&compatible(original[last+1]))last++;
 const turns=original.slice(first,last+1).map(sourceTurn=>{
  const turn=structuredClone(sourceTurn);turn.stage=forestTurnStage(entry.sceneId,turn,{});return turn;
 });
 return {scene:{sceneId:entry.sceneId,title:source.title??entry.sceneId,backdropAssetId:source.backdropAssetId,turns},index:target-first};
}
