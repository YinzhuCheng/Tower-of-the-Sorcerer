import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const out=join(root,'dist-c-preview');
// Explicit allowlist: never copy main's art bundle or production index.
const files=[
 'src/core/battle.js','src/core/campaign.js','src/game/magic-blade.js','src/solver/state.js',
 'src/solver/campaign-adapter.js','src/solver/campaign-replay.js','src/campaigns/c/content.js',
 'public/campaigns/index.html','public/campaigns/styles.css','public/campaigns/app.js','public/campaigns/c-normal.certificate.json'
];
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
for(const file of files){const destination=join(out,file.replace(/^public\//,''));await mkdir(dirname(destination),{recursive:true});await cp(join(root,file),destination);}
await writeFile(join(out,'index.html'),'<!doctype html><meta charset="utf-8"><title>C开发预览</title><meta http-equiv="refresh" content="0;url=./campaigns/"><a href="./campaigns/">打开双灯夜航规则原型（正式美术待制作）</a>');
await writeFile(join(out,'.nojekyll'),'');
console.log(`C text-only rules preview written to ${out}; entry /campaigns/`);
