import { ACCEPTED_MAP_MATERIALS } from '../src/rendering/material-assets.js';
import { cp,mkdir,rm,writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname,join } from 'node:path';
const root=join(dirname(fileURLToPath(import.meta.url)),'..'),out=join(root,'dist-b-preview');
// Independent module + accepted-material allowlist. Never copy A/C entry points or unrelated art.
export const B_PREVIEW_FILES=[
 'src/rendering/continuous-map.js','src/rendering/material-assets.js','src/rendering/b-adapter.js',
 'src/core/battle.js','src/core/campaign.js','src/game/magic-blade.js','src/solver/state.js','src/solver/campaign-adapter.js',
 'src/campaigns/b/content.js','src/campaigns/b/geography.js','src/campaigns/b/view.js','src/campaigns/b/player-copy.js','src/campaigns/b/preview-session.js',
 'src/campaigns/b/story/index.js','src/campaigns/b/story/content.js','src/campaigns/b/story/presentation.js',
 'public/campaigns-b/index.html','public/campaigns-b/styles.css','public/campaigns-b/app.js'
];
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
for(const file of B_PREVIEW_FILES){const destination=join(out,file.replace(/^public\//,''));await mkdir(dirname(destination),{recursive:true});await cp(join(root,file),destination);}
for(const a of ACCEPTED_MAP_MATERIALS){const destination=join(out,a.file);await mkdir(dirname(destination),{recursive:true});await cp(join(root,'public',a.file),destination);}
await writeFile(join(out,'index.html'),'<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>山路把冬天带回家 · B 开发预览</title><meta http-equiv="refresh" content="0;url=./campaigns-b/"><a href="./campaigns-b/">进入 B 霜径标准文字预览（背景和 CG 待验）</a></html>');
await writeFile(join(out,'.nojekyll'),'');
console.log(`B continuous sample preview written to ${out}; entry /campaigns-b/; only accepted map materials included; GAL artwork remains pending`);
