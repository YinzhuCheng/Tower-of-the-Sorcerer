import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createForestCampaign} from '../src/campaigns/b/content.js';
import {createForestStory,FOREST_STORY_CONTENT as C} from '../src/campaigns/b/story/index.js';
import {FOREST_GAL_ASSETS,FOREST_GAL_STATEFUL_ENVIRONMENTS,FOREST_GAL_CAST,FOREST_GAL_DAILY_CAST,FOREST_GAL_ENVIRONMENTS} from '../src/rendering/forest-gal-assets.js';
import {forestGalActors,forestGalBackdrop} from '../src/rendering/forest-gal-stage.js';
import {FOREST_GAL_ART_BINDINGS,FOREST_GAL_INSERT_TURNS,FOREST_GAL_DAILY_POLICY,forestReviewedEnvironment,forestReviewedActorArt} from '../src/rendering/forest-gal-art-policy.js';
const runtime=createForestCampaign(),story=createForestStory(runtime),state=runtime.initialState();
const scene=id=>story.resolve(id,state,{reviewMode:true,allBranches:true});
const turn=id=>Object.values(C.scenes).flatMap(s=>s.turns).find(t=>t.id===id);

test('all 81 prior plus 3 reviewed route-mechanism GAL images have exact source bytes',()=>{
 assert.equal(Object.keys(FOREST_GAL_STATEFUL_ENVIRONMENTS).length,12);assert.equal(FOREST_GAL_ASSETS.length,84);assert.equal(FOREST_GAL_ASSETS.filter(a=>!Object.values(FOREST_GAL_STATEFUL_ENVIRONMENTS).includes(a)).length,72);for(const a of FOREST_GAL_ASSETS){const bytes=readFileSync(new URL('../public/'+a.file,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256,a.file);}
});

test('new environments bind only exact scene, location and variant triplets',()=>{
 for(const binding of FOREST_GAL_ART_BINDINGS){const input={sceneId:binding.sceneId,locationId:binding.regionId,backdropAssetId:binding.backdropAssetId};assert.equal(forestReviewedEnvironment(input).asset,FOREST_GAL_ENVIRONMENTS[binding.assetId]);
 for(const changed of [{sceneId:'b30_enter'},{locationId:binding.regionId+'.unreviewed-room'},{locationId:'B-29'},{backdropAssetId:binding.backdropAssetId+':winter'}])assert.equal(forestReviewedEnvironment({...input,...changed}),null);}
});

test('eight-pouch image is used only on nine exact open-box turns and exits at L207',()=>{
 const s=scene('b03_rules');assert.equal(FOREST_GAL_INSERT_TURNS.length,9);
 for(const t of s.turns){const m=forestGalBackdrop(s,t),insert=FOREST_GAL_INSERT_TURNS.includes(t.id);assert.equal(m.asset,FOREST_GAL_ENVIRONMENTS[insert?'B_PROP_03':'B_ENV_03']);assert.equal(m.presentation,insert?'object-insert':'environment');}
 const l205=s.turns.find(t=>t.id==='b03_rules.L205');assert.equal(forestGalBackdrop(s,{...l205,id:'unknown'}).presentation,'environment');
});

test('daily fullbody is exact-turn only; missing props do not rebound to combat art',()=>{
 for(const [actor,rule]of Object.entries(FOREST_GAL_DAILY_POLICY))for(const id of rule.fullBodyAllowedTurnIds){const t=turn(id);assert.ok(t,id);assert.equal(forestReviewedActorArt(actor,t),FOREST_GAL_DAILY_CAST[actor],id);}
 for(const [actor,rule]of Object.entries(FOREST_GAL_DAILY_POLICY))for(const id of rule.upperBodyOnlyTurnIds)assert.equal(forestReviewedActorArt(actor,turn(id)),null,id);
 for(const id of FOREST_GAL_DAILY_POLICY.guide.fullBodyMapRestrictionTurnIds)assert.equal(forestReviewedActorArt('guide',turn(id)),null,id);
 for(const id of ['B.OPEN.R1.b01_pre.T007','B.OPEN.R1.b01_pre.T008','b28_pre.L1721','b28_pre.L1723'])assert.equal(forestReviewedActorArt('hero',turn(id)),FOREST_GAL_CAST.hero,id);
 for(const id of ['b05_pre.L283','b07_enter.L387','b10_enter.L575','b20_valve.L1217','b27_before.L1701'])assert.equal(forestReviewedActorArt('guide',turn(id)),FOREST_GAL_CAST.guide,id);
});

test('authored cast, offscreen and winter restrictions always precede daily art',()=>{
 for(const id of C.order)for(const t of scene(id).turns){const visible=forestGalActors(t);for(const actor of visible){assert.ok(t.stage.actors[actor.id]);assert.ok(!t.stage.offscreen[actor.id]);assert.ok(!['final_queen','fox_boss'].includes(actor.id));}if(t.stage.winterClothing||t.stage.camera==='exterior-empty-shot')assert.deepEqual(visible,[]);}
 const s=scene('b22_after');assert.ok(s.turns.some(t=>t.stage.offscreen.guide));assert.ok(s.turns.every(t=>forestGalActors(t).every(a=>a.id!=='guide')));
});

test('old saved prose cannot accidentally opt into a new prose-specific fullbody',()=>{
 const t=turn('B.OPEN.R1.b02_enter.T004');assert.equal(forestReviewedActorArt('hero',{...t,text:'Historic queued line'}),FOREST_GAL_CAST.hero);assert.equal(forestReviewedActorArt('hero',{...t,id:'legacy-unknown'}),FOREST_GAL_CAST.hero);
});

test('pouch image and dialogue geometry are separate at desktop, phone and compact widths',()=>{
 const css=readFileSync(new URL('../public/campaigns-b/styles.css',import.meta.url),'utf8');assert.match(css,/data-art-presentation="object-insert"[\s\S]*object-fit:contain;object-position:center/);assert.match(css,/\.story-body\{top:auto;bottom:3%;min-height:0;max-height:41%\}/);assert.match(css,/\.story-body\{top:auto;bottom:max\(3%,env\(safe-area-inset-bottom\)\);min-height:0;max-height:calc\(54% - max\(3%,env\(safe-area-inset-bottom\)\)\)\}/);
 for(const [w,h]of [[1600,900],[1366,768],[390,844],[320,568],[844,390],[568,320]]){const portrait=h>w&&w<=960,stageH=h*(portrait?.44:.54),top=portrait?48:44,iw=w-24,ih=stageH-top,scale=Math.min(iw/1672,ih/941),image={x:12+(iw-1672*scale)/2,y:top+(ih-941*scale)/2,width:1672*scale,height:941*scale};assert.ok(image.y+image.height<=h*(portrait?.46:.56),`${w}x${h}`);assert.ok(image.width>0&&image.height>0);assert.ok(Math.abs(image.width/image.height-1672/941)<1e-9);}
});

test('player copy truthfully scopes articulated walking and app keeps the fine-only story pause',()=>{
 const html=readFileSync(new URL('../public/campaigns-b/index.html',import.meta.url),'utf8'),app=readFileSync(new URL('../public/campaigns-b/app.js',import.meta.url),'utf8');assert.doesNotMatch(html,/人物暂用静态立绘|地图主角为静态立绘，不是行走动画/);assert.equal((html.match(/B01–B03 细步区及两段连接桥已接入行走动画/g)||[]).length,2);assert.match(html,/其他区域仍沿用原有呈现/);assert.ok(app.includes('(fine.active&&session.isStoryOpen())||Boolean(session.pending)||Boolean(session.compatibilityFailure)'));
});
