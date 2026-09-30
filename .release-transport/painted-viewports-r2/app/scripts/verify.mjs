import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const manifest=JSON.parse(await fs.readFile(path.join(root,'qa/source-integrity.json'),'utf8'));
for(const m of Object.values(manifest)){const bytes=await fs.readFile(path.join(root,m.file));if(crypto.createHash('sha256').update(bytes).digest('hex')!==m.sha256)throw Error(`SOURCE_CHANGED:${m.file}`);}
for(const file of await fs.readdir(path.join(root,'src')))if(file.endsWith('.mjs')){const r=spawnSync(process.execPath,['--check',path.join(root,'src',file)],{encoding:'utf8'});if(r.status!==0)throw Error(r.stderr);}
const result=spawnSync(process.execPath,['--test',...(await fs.readdir(path.join(root,'tests'))).filter(f=>f.endsWith('.test.mjs')).map(f=>'tests/'+f)],{cwd:root,encoding:'utf8'});process.stdout.write(result.stdout);process.stderr.write(result.stderr);if(result.status!==0)process.exit(result.status);
const summary={atUTC:new Date().toISOString(),sourceHashes:'PASS; unchanged accepted originals',jsSyntax:'PASS',nodeTests:'PASS',browserRuntime:'PENDING: no safe Chromium runtime available in this environment',browserScreenshots:'PENDING: run scripts/capture-playwright.mjs in official CI',visualApproval:false,scope:'Isolated art/footing review; no publication or core-game changes'};
await fs.writeFile(path.join(root,'qa/verification.json'),JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary,null,2));
