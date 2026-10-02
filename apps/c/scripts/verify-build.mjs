import {readFile,readdir,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join,dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../dist'),entries=[];
async function walk(p){for(const f of await readdir(p)){const q=join(p,f);if((await stat(q)).isDirectory())await walk(q);else entries.push(q);}}
await walk(root);let imports=0;
for(const p of entries.filter(x=>x.endsWith('.js'))){const s=await readFile(p,'utf8');const matches=[...s.matchAll(/(?:from\s*|import\s*\(\s*)['"]([^'"]+)['"]/g)];for(const [,ref]of matches){if(ref==='three')continue;if(!ref.startsWith('.'))throw new Error(`Unexpected bare/external import ${ref} in ${p}`);await stat(resolve(dirname(p),ref));imports++;}}
for(const f of ['geometry/vessel-physical-geometry-v1.2.json','campaigns/c-normal.certificate.json','vendor/THREE-LICENSE.txt'])await stat(join(root,f));
const html=await readFile(join(root,'campaigns/index.html'),'utf8');if(!html.includes('"three":"../vendor/three.module.js"'))throw new Error('Missing import map');
const manifest=JSON.parse(await readFile(join(root,'build-manifest.json')));if(manifest.contentHash!=='c5a5f809d5548f36')throw new Error('Unexpected build identity');
console.log(JSON.stringify({result:'PASS',files:entries.length,localModuleEdges:imports,runtimeCDNs:0,identity:manifest.contentHash,browserExecuted:false},null,2));

const recovery=await readFile(join(root,'src/rendering/recovery-presentation.js'),'utf8');if(!recovery.includes("materialsAvailable:false"))throw new Error('Missing explicit geometry-only reconstruction boundary');
