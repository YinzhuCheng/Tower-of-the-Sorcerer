import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {FOREST_STORY_CONTENT as C,createForestStory} from '../src/campaigns/b/story/index.js';
import {createForestCampaign} from '../src/campaigns/b/content.js';
import {buildForestWitness} from '../src/campaigns/b/witness.js';
import {createForestPreviewSession} from '../src/campaigns/b/preview-session.js';
import {createSaveRepository} from '../src/core/campaign.js';
import {forestTurnStage} from '../src/campaigns/b/story/presentation.js';
import {FOREST_STORY_LOCATION_CONTRACT as CONTRACT,forestStoryLocationPresentation} from '../src/rendering/forest-gal-story-locations.js';
import {FOREST_GAL_STORY_LOCATIONS} from '../src/rendering/forest-gal-assets.js';
import {forestGalBackdrop,forestGalActors,presentForestGal,clearForestGal} from '../src/rendering/forest-gal-stage.js';
const draft=JSON.parse(readFileSync(new URL('./fixtures/b05-dialogue-reviewed-r1.json',import.meta.url)));
const rows=CONTRACT.turns.filter(r=>r.locationId==='B-05');
const sha=t=>createHash('sha256').update(t).digest('hex');
const staged=(sid,t)=>({...structuredClone(t),stage:forestTurnStage(sid,t,{})});
const scene=id=>({sceneId:id,backdropAssetId:C.scenes[id].backdropAssetId});
const eligible=t=>t.phase==='pipeWorks'||t.id.startsWith('b05_revisit.');
const args=(s,t)=>({sceneId:s.id,turn:t,locationId:s.regionId,backdropAssetId:s.backdropAssetId});
const storage=()=>{const entries=new Map(),writes=[];return{entries,writes,getItem:k=>entries.get(k)??null,setItem(k,v){entries.set(k,String(v));writes.push([k,String(v)]);},removeItem(k){entries.delete(k);writes.push([k,null]);}};};

test('B05 preserves all 23 IDs, roles, order, phases, choices and directives; exactly six reviewed text changes',()=>{
 let count=0,changed=0;const ids=[];
 for(const s of draft.scenes){const actual=C.scenes[s.id];assert.equal(actual.title,s.title);assert.equal(actual.regionId,s.regionId);assert.equal(actual.backdropAssetId,s.backdropAssetId);assert.deepEqual(actual.choices,s.choices);assert.deepEqual(actual.directives,s.directives);assert.deepEqual(actual.turns.map(t=>t.id),s.turns.map(t=>t.id));
  for(const [i,t]of s.turns.entries()){const a=actual.turns[i];for(const k of ['id','sourceLine','speaker','portrait','branch','phase','kind','expression'])assert.equal(a[k]??(k==='kind'?'dialogue':null),t[k]??null,`${t.id}:${k}`);assert.equal(a.text,t.proposedText);assert.equal(sha(a.text),t.proposedTextSha256);assert.equal(sha(t.originalText),t.originalTextSha256);assert.equal(t.changed,t.originalText!==t.proposedText);if(t.changed){changed++;ids.push(t.id);}count++;}
 }
 assert.equal(count,23);assert.equal(changed,6);assert.deepEqual(ids,['b05_pre.L279','b05_pre.L281','b05_pre.L283','b05_pre.L289','b05_valve.L309','b05_valve.L319']);assert.match(C.scenes.b05_pre.turns[2].text,/^（让星盘停在管边）/);assert.equal(C.id,'forest-b-gal-v1.1');assert.equal(createForestCampaign().identity.contentHash,'a12cd07ee1ccc762');
});

test('only 13 pipeWorks and 2 revisit turns bind exact current prose; pre6 and valve2 remain excluded',()=>{
 assert.equal(rows.length,15);assert.equal(new Set(rows.map(r=>r.turnId)).size,15);assert.equal(rows.filter(r=>r.phase==='pipeWorks').length,13);assert.equal(rows.filter(r=>r.sceneId==='b05_revisit').length,2);
 for(const s of draft.scenes)for(const expected of s.turns){const t=staged(s.id,C.scenes[s.id].turns.find(t=>t.id===expected.id)),before=JSON.stringify(t),model=forestGalBackdrop(scene(s.id),t);assert.equal(Boolean(model.asset),eligible(t),t.id);
  if(eligible(t)){assert.equal(model.asset,FOREST_GAL_STORY_LOCATIONS.B_ENV_05);assert.equal(model.presentation,'story-location');assert.equal(model.contract.textSha256,expected.proposedTextSha256);assert.deepEqual(forestGalActors(t,model),[]);assert.deepEqual(model.contract.body,{mode:'empty',actorIds:[],reviewedAssets:[]});assert.deepEqual(model.contract.portraitCandidateIds,t.portrait?[t.portrait]:[]);}
  assert.equal(JSON.stringify(t),before);
 }
});

test('B05 art fails closed for every mismatched ID, text, phase, branch, role, location, stage or synthetic scene',()=>{
 let negatives=0;
 for(const row of rows){const s=C.scenes[row.sceneId],t=staged(s.id,s.turns.find(t=>t.id===row.turnId)),input=args(s,t);
  for(const bad of [{sceneId:'unknown'},{sceneId:'b05_pre'},{locationId:'B-05.other'},{backdropAssetId:'B_ENV_05:pre'},{turn:{...t,id:t.id+'old'}},{turn:{...t,text:t.text+' '}},{turn:{...t,phase:'valve'}},{turn:{...t,branch:'response1'}},{turn:{...t,sourceLine:-1}},{turn:{...t,speaker:'unknown'}},{turn:{...t,portrait:'merchant'}},{turn:{...t,kind:'choice-prompt'}},{turn:{...t,stage:{...t.stage,winterClothing:true}}},{turn:{...t,stage:{...t.stage,camera:'exterior-empty-shot'}}},{turn:{...t,stage:{...t.stage,locationId:'B-12'}}},{turn:{...t,stage:{...t.stage,backdropAssetId:'B_ENV_12:enter'}}}]){assert.equal(forestStoryLocationPresentation({...input,...bad}),null,JSON.stringify(bad));negatives++;}
 }
 assert.equal(negatives,240);
});

test('historical B05 queue texts restore verbatim; old L309/L319 and unknown text fallback; exact approved L295/L297 additionally bind',()=>{
 const runtime=createForestCampaign(),story=createForestStory(runtime),witness=buildForestWitness({runtime,stopBefore:'b07.wedges'}),state=witness.steps.find(s=>s.action.entityId==='b05.pipeWorks').state,s=story.resolve('b05_valve',state);
 const olds=draft.scenes.find(x=>x.id==='b05_valve').turns;for(const t of s.turns)t.text=olds.find(x=>x.id===t.id).originalText;
 const p={storyVersion:C.id,openingRevision:'opening-r1',seenIds:story.location(state,{seenIds:s.turns.map(t=>t.id)}).seenIds,queue:[s],turnIndex:5,paused:false};const store=storage();const repo=createSaveRepository(store,runtime);repo.save('auto',state,p);const bytes=[...store.entries],writes=store.writes.length;const session=createForestPreviewSession(runtime,store);
 assert.deepEqual(session.state,state);assert.deepEqual(session.presentation,p);assert.deepEqual([...store.entries],bytes);assert.equal(store.writes.length,writes+1);assert.match(repo.key('auto'),/a12cd07ee1ccc762/);
 for(const t of session.current().turns){const match=(eligible(t)&&!['b05_valve.L309','b05_valve.L319'].includes(t.id))||['b05_valve.L295','b05_valve.L297'].includes(t.id);assert.equal(Boolean(forestGalBackdrop(session.current(),t).asset),match,t.id);}
 const unknown={...s.turns[3],text:'没有经过审查的旧存档文字'};assert.equal(forestGalBackdrop(s,unknown).asset,null);assert.deepEqual(session.presentation,p);assert.deepEqual([...store.entries],bytes);assert.equal(store.writes.length,writes+1);assert.equal(story.location(state,{seenIds:p.seenIds}).scenes.flatMap(s=>s.turns).filter(t=>p.seenIds.includes(t.id)).length,0);
});

class ImageNode{constructor(){this.dataset={};this.style={};this.children=[];this.hidden=true;this.complete=false;this.naturalWidth=0;this.naturalHeight=0;}removeAttribute(k){delete this[k];}replaceChildren(...nodes){this.children=nodes;}}
const nodes=()=>Object.fromEntries(['backdrop','actors','portrait','label','stage','dialog'].map(id=>[id,new ImageNode()]));
test('B05 A→B08→B05 rejects late A/B image events and clear resets contain without state writes',()=>{
 const oldDocument=globalThis.document;globalThis.document={createElement:()=>new ImageNode()};try{
  const n=nodes(),a=staged('b05_valve',C.scenes.b05_valve.turns.find(t=>t.id==='b05_valve.L309')),b=staged('b08_enter',C.scenes.b08_enter.turns[1]),snapshot=JSON.stringify([a,b]);
  presentForestGal(n,scene('b05_valve'),a);const firstA=n.backdrop.onload,firstFace=n.portrait.onload;presentForestGal(n,scene('b08_enter'),b);const oldB=n.backdrop.onload;presentForestGal(n,scene('b05_valve'),a);const currentA=n.backdrop.onload;assert.notEqual(firstA,currentA);n.backdrop.naturalWidth=1536;n.backdrop.naturalHeight=1024;firstA();oldB();firstFace();assert.equal(n.backdrop.hidden,true);assert.equal(n.portrait.hidden,true);assert.equal(n.stage.dataset.artStatus,'loading');assert.equal(n.stage.dataset.artPresentation,'story-location');assert.deepEqual(n.actors.children,[]);currentA();assert.equal(n.backdrop.hidden,false);clearForestGal(n);currentA();assert.equal(n.backdrop.hidden,true);assert.equal(n.backdrop.src,undefined);assert.equal(n.stage.dataset.artStatus,'inactive');assert.equal(n.dialog.dataset.artPresentation,'environment');assert.equal(n.stage.dataset.artPresentation,'environment');assert.equal(JSON.stringify([a,b]),snapshot);
 }finally{globalThis.document=oldDocument;}
});

test('new cutaway is static full-frame 1536×1024 with explicit no-navigation/no-action provenance',()=>{
 const a=FOREST_GAL_STORY_LOCATIONS.B_ENV_05;assert.deepEqual([a.width,a.height],[1536,1024]);assert.equal(a.bytes,2195842);assert.equal(a.sha256,'612c0cb1b44c0efffe503e8ec2891d1a303b0ca189f632f25cf8a04cb1728bbc');assert.match(a.scope,/never physical-world geometry, collision or support/);assert.equal(a.fit,'preserve-full-frame');for(const r of rows){assert.ok(r.risks.includes('static_water_is_not_steam_thinning_animation'));assert.ok(r.risks.includes('no_standing_body_substitute_for_crouching_or_touching_water'));}
 const css=readFileSync(new URL('../public/campaigns-b/styles.css',import.meta.url),'utf8');assert.ok(css.includes('.story-dialog[data-art-presentation="story-location"] #story-backdrop{object-fit:contain;object-position:center}\n'));for(const [w,h]of [[1536,1024],[1440,810],[844,390],[667,375],[568,320],[960,480],[390,844],[375,667],[320,568]]){const s=Math.min(w/a.width,h/a.height);assert.ok(a.width*s<=w+1e-9);assert.ok(a.height*s<=h+1e-9);}
});
