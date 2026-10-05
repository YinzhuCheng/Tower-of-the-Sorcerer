import {validateStoryLocationAssets} from './validate-story-location-assets.mjs';
import {HERO_WORLD_ASSETS} from '../src/rendering/hero-world-runtime.js';
import {FOREST_GAL_ASSETS} from '../src/rendering/forest-gal-assets.js';
import {HERO_MOTION_ASSET} from '../src/rendering/hero-neutral.js';
import {createHash} from 'node:crypto';
import { validateContinuousMapAssets } from './validate-continuous-map-assets.mjs';
import { readFile,stat,readdir } from 'node:fs/promises';
import { join,resolve,dirname,relative } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../dist-b-preview'),seen=new Set(),errors=[];
async function visit(file){file=resolve(root,file);if((await stat(file).catch(()=>null))?.isDirectory())file=join(file,'index.html');if(!file.startsWith(root+'/')){errors.push(`Escaping reference: ${file}`);return;}if(seen.has(file))return;seen.add(file);let text;try{text=await readFile(file,'utf8');}catch{errors.push(`Missing: ${relative(root,file)}`);return;}
 const refs=file.endsWith('.html')?[...text.matchAll(/(?:src|href)="([^"#]+)"/g)].map(x=>x[1]):(/\.m?js$/.test(file))?[...text.matchAll(/(?:from\s+|import\s+)['"]([^'"]+)['"]/g)].map(x=>x[1]):[];
 for(const ref of refs){if(/^https?:|^\//.test(ref)){errors.push(`Nonportable external/root reference: ${ref}`);continue;}if(ref.startsWith('.'))await visit(resolve(dirname(file),ref));}
}
await visit('index.html');await visit('campaigns-b/index.html');await visit('campaigns-b/gal-preview/index.html');await visit('campaigns-b/moth-preview/index.html');
const html=await readFile(join(root,'campaigns-b/index.html'),'utf8'),app=await readFile(join(root,'campaigns-b/app.js'),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);if(new Set(ids).size!==ids.length)errors.push('Duplicate DOM id');for(const[,id]of app.matchAll(/\$\('([^']+)'\)/g))if(!ids.includes(id))errors.push(`Missing DOM node: ${id}`);
for(const illegal of ['../src/campaigns/a/','../src/campaigns/c/','assets/anime','setFlag','moveBallast'])if(app.includes(illegal))errors.push(`Unexpected B UI dependency: ${illegal}`);
const sourceCore=await readFile(resolve(root,'../src/core/campaign.js'),'utf8'),builtCore=await readFile(join(root,'src/core/campaign.js'),'utf8');if(sourceCore!==builtCore)errors.push('Built kernel differs from source');
// Preview-only approved artwork is deliberately absent from ordinary game art
// registries. Extend only this build validator's approval set, after exact-byte
// verification; never whitelist a directory, basename pattern, or failed hash.
const previewOnlyAssets=[
 {file:'assets/moth-preview/BBOSS-001_anthro-avatar_v3-style.png',sha256:'cd921b34a9c704e30f63fbfc4409eaf62208996f7a3958e2a7f138959454d50e'},
 {file:'assets/moth-preview/BBOSS-001_anthro-expression_alert_v1.png',sha256:'0d0a39076f2dc72efbcc0e7de134e650499b856f04d1db5bf1df32c352758fac'},
 {file:'assets/moth-preview/BBOSS-001_anthro-expression_gentle-smile_v1.png',sha256:'75f289406330052eb970d3d0eaad6863d1bc872672b35ad434833bf1d966fc1e'},
 {file:'assets/moth-preview/BBOSS-001_anthro-standing_v2.png',sha256:'0494a03a02eb3f401145a479f8f6f5cdbfd5939760c6cb7a03eb3be54e72e8ed'},
 {file:'assets/forest-canonical/cenwei-japanese-vn-r3.png',sha256:'d6aaf1450ebdfbd14f0d8bf56b292e9e063df0e50d1ce971fbfdeb2605480c6e'},
 {file:'assets/forest-gal/environments/b06-cenwei-neutral.webp',sha256:'452934f5565e4f8f728d19b3eeffd232754c6dba10f483bf1f7f5295c922db79'}
],verifiedPreviewArtwork=new Set();
for(const asset of previewOnlyAssets){
 const data=await readFile(join(root,asset.file)).catch(()=>null);
 if(!data||createHash('sha256').update(data).digest('hex')!==asset.sha256)errors.push('Read-only preview asset missing or hash drift: '+asset.file);
 else verifiedPreviewArtwork.add(asset.file);
}
let bytes=0;for(const file of seen)bytes+=(await stat(file)).size;
const heroBytes=await readFile(join(root,HERO_MOTION_ASSET.file)).catch(()=>null);if(!heroBytes||createHash('sha256').update(heroBytes).digest('hex')!==HERO_MOTION_ASSET.sha256)errors.push('Hero four-facing source missing or hash drift');
for(const asset of [...FOREST_GAL_ASSETS,...HERO_WORLD_ASSETS]){const bytes=await readFile(join(root,asset.file)).catch(()=>null);if(!bytes||(asset.sha256&&createHash('sha256').update(bytes).digest('hex')!==asset.sha256))errors.push(`GAL source missing or hash drift: ${asset.file}`);}
const storyLocations=await validateStoryLocationAssets(root,{built:true});errors.push(...storyLocations.errors);
const art=await validateContinuousMapAssets(root,{additionalApprovedAssets:previewOnlyAssets.filter(asset=>verifiedPreviewArtwork.has(asset.file))});
errors.push(...art.errors);
console.log(JSON.stringify({ok:!errors.length,entry:'campaigns-b/',reachableStaticModulesAndPages:seen.size,bytes,externalDependencies:0,artAssets:art.artAssets,previewOnlyArtAssets:verifiedPreviewArtwork.size,artStatus:art.artStatus,domIds:ids.length,storyLocationAssets:storyLocations.storyLocationAssets,storyLocationBytes:storyLocations.storyLocationBytes,errors},null,2));if(errors.length)process.exitCode=1;
