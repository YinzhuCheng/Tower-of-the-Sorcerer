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
await visit('index.html');await visit('campaigns-b/index.html');
const html=await readFile(join(root,'campaigns-b/index.html'),'utf8'),app=await readFile(join(root,'campaigns-b/app.js'),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);if(new Set(ids).size!==ids.length)errors.push('Duplicate DOM id');for(const[,id]of app.matchAll(/\$\('([^']+)'\)/g))if(!ids.includes(id))errors.push(`Missing DOM node: ${id}`);
for(const illegal of ['../src/campaigns/a/','../src/campaigns/c/','assets/anime','setFlag','moveBallast'])if(app.includes(illegal))errors.push(`Unexpected B UI dependency: ${illegal}`);
const sourceCore=await readFile(resolve(root,'../src/core/campaign.js'),'utf8'),builtCore=await readFile(join(root,'src/core/campaign.js'),'utf8');if(sourceCore!==builtCore)errors.push('Built kernel differs from source');
let bytes=0;for(const file of seen)bytes+=(await stat(file)).size;
const heroBytes=await readFile(join(root,HERO_MOTION_ASSET.file)).catch(()=>null);if(!heroBytes||createHash('sha256').update(heroBytes).digest('hex')!==HERO_MOTION_ASSET.sha256)errors.push('Hero four-facing source missing or hash drift');
for(const asset of [...FOREST_GAL_ASSETS,...HERO_WORLD_ASSETS]){const bytes=await readFile(join(root,asset.file)).catch(()=>null);if(!bytes||(asset.sha256&&createHash('sha256').update(bytes).digest('hex')!==asset.sha256))errors.push(`GAL source missing or hash drift: ${asset.file}`);}
const art=await validateContinuousMapAssets(root);errors.push(...art.errors);
console.log(JSON.stringify({ok:!errors.length,entry:'campaigns-b/',reachableStaticModulesAndPages:seen.size,bytes,externalDependencies:0,artAssets:art.artAssets,artStatus:art.artStatus,domIds:ids.length,errors},null,2));if(errors.length)process.exitCode=1;
