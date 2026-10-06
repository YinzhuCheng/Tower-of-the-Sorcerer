import test from 'node:test';
import fs from 'node:fs';import assert from 'node:assert/strict';
import {forestGalSceneStateRow as match} from '../src/rendering/forest-gal-scene-state-contract.js';
import {forestGalPresentation as art,forestGalActors as actors} from '../src/rendering/forest-gal-stage.js';
import {readForestTurnSnapshot} from '../src/campaigns/b/story/state-snapshot.js';
import {FOREST_MONSTER_PREVIOUS_SOURCE_HASH} from '../src/campaigns/b/story/source-manifest.js';
const ws=JSON.parse(fs.readFileSync(new URL('./fixtures/b-route-mechanism-witnesses.json',import.meta.url)));test('route-mechanism exact facts, stage, text and revision contracts reject mismatches',()=>{let negatives=0,previous=0;
for(const w of ws){const s={sceneId:w.sceneId,monsterStoryRevision:w.revision},t=w.turn,bytes=JSON.stringify(t),row=match(s,t),a=art(s,t);assert.ok(row,t.id);assert.equal(a.asset?.id,w.assetId);assert.equal(JSON.stringify(t),bytes);
for(const mutate of [x=>delete x.storySnapshot,x=>x.storySnapshot.origin='review',x=>x.storySnapshot.sourceHash='0'.repeat(64),x=>x.storySnapshot.constructionHash='0'.repeat(64),x=>x.storySnapshot.resolvedTextSha256='0'.repeat(64),x=>x.storySnapshot.authoredTextSha256='0'.repeat(64),x=>x.storySnapshot.routes=null,x=>x.storySnapshot.warm=null,x=>x.text+='x',x=>x.stage.camera='wrong',x=>x.stage.portraitAllowed=!x.stage.portraitAllowed,x=>x.speaker='wrong',x=>x.storySnapshot.warm.extra=true,x=>x.storySnapshot.routes['07'].extra=true]){const x=structuredClone(t);mutate(x);if(w.revision==='mechanical-r1'&&x.storySnapshot?.constructionHash)continue;assert.equal(match(s,x),null,t.id);negatives++;}
assert.equal(match({...s,sceneId:'wrong'},t),null);negatives++;
if(w.revision==='forest-species-r1'){let old=structuredClone(t);old.storySnapshot.constructionHash=FOREST_MONSTER_PREVIOUS_SOURCE_HASH;assert.ok(readForestTurnSnapshot(old));assert.equal(match(s,old)?.assetId,w.assetId);previous++;}
}
assert.equal(ws.length,244);assert.equal(previous,122);assert.equal(negatives,3538);});
