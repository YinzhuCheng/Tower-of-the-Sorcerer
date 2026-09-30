import { validateContinuousMapAssets } from './validate-continuous-map-assets.mjs';
import { readFile, stat } from 'node:fs/promises';
import { join,resolve,dirname } from 'node:path';
const root=resolve('dist-c-preview'),seen=new Set(),errors=[];
async function visit(relative){const file=resolve(root,relative);if(!file.startsWith(root+'/')){errors.push(`Escaping reference ${relative}`);return;}if(seen.has(file))return;seen.add(file);let text;try{text=await readFile(file,'utf8');}catch{errors.push(`Missing ${relative}`);return;}
 const refs=file.endsWith('.html')?[...text.matchAll(/(?:src|href)="([^"#]+)"/g)].map(x=>x[1]):file.endsWith('.js')?[...text.matchAll(/(?:from\s+|import\s+)['"]([^'"]+)['"]/g)].map(x=>x[1]):[];
 for(const ref of refs){if(/^https?:/.test(ref)){errors.push(`Unexpected external dependency ${ref}`);continue;}if(ref.startsWith('/')){errors.push(`Nonportable root-absolute reference ${ref}`);continue;}if(!ref.startsWith('.'))continue;const child=resolve(dirname(file),ref);await visit(child.slice(root.length+1));}
}
await visit('campaigns/index.html');await stat(join(root,'campaigns/c-normal.certificate.json'));
const art=await validateContinuousMapAssets(root);errors.push(...art.errors);
console.log(JSON.stringify({ok:errors.length===0,reachableStaticModulesAndPages:seen.size,externalDependencies:0,artAssets:art.artAssets,artStatus:art.artStatus,errors},null,2));if(errors.length)process.exitCode=1;
