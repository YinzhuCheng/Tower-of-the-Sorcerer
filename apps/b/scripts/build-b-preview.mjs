import {validateStoryLocationAssets} from './validate-story-location-assets.mjs';
import {HERO_WORLD_ASSETS} from '../src/rendering/hero-world-runtime.js';
import {FOREST_GAL_ASSETS} from '../src/rendering/forest-gal-assets.js';
import {HERO_MOTION_ASSET} from '../src/rendering/hero-neutral.js';
import { FOREST_WORLD_RUNTIME_ASSETS } from '../src/rendering/forest-world-runtime-assets.js';
import { B01_ART_ASSETS } from '../src/rendering/forest-entry-contract.js';
import { FOREST_CHARACTER_ASSETS } from '../src/rendering/forest-cast-art.js';
import { ACCEPTED_MAP_MATERIALS } from '../src/rendering/material-assets.js';
import { cp,mkdir,rm,writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname,join } from 'node:path';
const root=join(dirname(fileURLToPath(import.meta.url)),'..'),out=join(root,'dist-b-preview');
const storyLocationCheck=await validateStoryLocationAssets(root);
if(storyLocationCheck.errors.length)throw Error(storyLocationCheck.errors.join('\n'));
// Independent module + accepted-material allowlist. Never copy A/C entry points or unrelated art.
export const B_PREVIEW_FILES=[
 'src/rendering/forest-gal-cg-contract.js','src/rendering/hero-world-runtime.js','src/rendering/forest-bridge-presentation.mjs','src/rendering/native-support-fast.mjs','src/rendering/gait-runtime.mjs','src/rendering/fine-presentation.mjs','src/rendering/software-hero.mjs','src/rendering/canvas-layer.mjs','src/rendering/foot-shadows.mjs','src/rendering/forest-gal-story-location-contract.js','src/rendering/forest-gal-story-locations.js','src/rendering/forest-gal-art-policy.js','src/rendering/forest-gal-reader.js','src/rendering/forest-gal-stage.js','src/rendering/forest-gal-assets.js','src/rendering/forest-fine-navigation.js','src/rendering/forest-fine-collision.js','src/rendering/forest-fine-world-collision.js','src/rendering/forest-fine-save.js','src/rendering/forest-fine-app.js','src/rendering/forest-fine-controls.js','src/rendering/hero-locomotion.js','src/rendering/hero-input.js','src/rendering/hero-neutral.js','src/rendering/forest-hero-depth.js',
 'src/rendering/forest-scene-props.js','src/rendering/forest-ground-support.js','src/rendering/forest-ground-mesh.js','src/rendering/forest-world-runtime-assets.js','src/rendering/forest-world-contract.js','src/rendering/forest-world-native.js','src/rendering/forest-world.js','src/rendering/forest-world-view.js','src/rendering/forest-entry.js','src/rendering/forest-entry-contract.js','src/rendering/forest-cast-art.js','src/rendering/continuous-map.js','src/rendering/material-assets.js','src/rendering/b-adapter.js',
 'src/core/battle.js','src/core/campaign.js','src/game/magic-blade.js','src/solver/state.js','src/solver/campaign-adapter.js',
 'src/campaigns/b/content.js','src/campaigns/b/geography.js','src/campaigns/b/view.js','src/campaigns/b/player-copy.js','src/campaigns/b/preview-session.js',
 'src/campaigns/b/story/opening-legacy.js','src/campaigns/b/story/opening-revision.js','src/campaigns/b/story/index.js','src/campaigns/b/story/content.js','src/campaigns/b/story/presentation.js',
 'public/campaigns-b/gal-preview/cenwei-art-contract.js','public/campaigns-b/gal-preview/cenwei-content.js','public/campaigns-b/gal-preview/index.html','public/campaigns-b/gal-preview/preview-model.js','public/campaigns-b/gal-preview/preview-stage.js','public/campaigns-b/gal-preview/preview.css','public/campaigns-b/gal-preview/preview.js','public/assets/forest-canonical/cenwei-japanese-vn-r3.png','public/assets/forest-gal/environments/b06-cenwei-neutral.webp',
 'public/campaigns-b/index.html','public/campaigns-b/styles.css','public/campaigns-b/app.js',
 // Isolated moth art reader; exact files only, no gameplay or production asset registry changes.
 'public/campaigns-b/moth-preview/index.html',
 'public/campaigns-b/moth-preview/src/main.mjs',
 'public/campaigns-b/moth-preview/src/standing-layout.mjs',
 'public/campaigns-b/moth-preview/src/preview.mjs',
 'public/campaigns-b/moth-preview/src/preview-model.mjs',
 'public/campaigns-b/moth-preview/src/portrait-stage.mjs',
 'public/campaigns-b/moth-preview/src/portrait-contract.mjs',
 'public/campaigns-b/moth-preview/src/portrait-preview.css',
 'public/campaigns-b/moth-preview/src/story-data.mjs',
 'public/campaigns-b/moth-preview/src/contract-data.mjs',
 'public/campaigns-b/moth-preview/vendor/b-source/forest-gal-reader.js',
 'public/campaigns-b/moth-preview/vendor/b-source/styles.css',
 'public/campaigns-b/moth-preview/vendor/b-source/preview.css',
 'public/campaigns-b/moth-preview/vendor/dual-form/boss-presentation.mjs',
 'public/campaigns-b/moth-preview/vendor/dual-form/verified-asset-loader.mjs',
 'public/assets/moth-preview/BBOSS-001_anthro-avatar_v3-style.png',
 'public/assets/moth-preview/BBOSS-001_anthro-expression_alert_v1.png',
 'public/assets/moth-preview/BBOSS-001_anthro-expression_gentle-smile_v1.png',
 'public/assets/moth-preview/BBOSS-001_anthro-standing_v2.png'
];
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
for(const file of B_PREVIEW_FILES){const destination=join(out,file.replace(/^public\//,''));await mkdir(dirname(destination),{recursive:true});await cp(join(root,file),destination);}
for(const a of [...HERO_WORLD_ASSETS,...FOREST_GAL_ASSETS,HERO_MOTION_ASSET,...ACCEPTED_MAP_MATERIALS,...FOREST_CHARACTER_ASSETS,...B01_ART_ASSETS,...Object.values(FOREST_WORLD_RUNTIME_ASSETS)]){const destination=join(out,a.file);await mkdir(dirname(destination),{recursive:true});await cp(join(root,'public',a.file),destination);}
await writeFile(join(out,'index.html'),'<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>山路把冬天带回家 · B 开发预览</title><meta http-equiv="refresh" content="0;url=./campaigns-b/"><a href="./campaigns-b/">进入 B01–B03 连续森林绘景候选（B01–B03 精细地面与世界足点步态候选，原场景与棋盘可切换）</a></html>');
await writeFile(join(out,'.nojekyll'),'');
console.log(`B finite continuous-world candidate written to ${out}; entry /campaigns-b/; registered finite B01-B03 fine ground + shared neighborhood camera + reversible source projections; not browser-accepted`);
