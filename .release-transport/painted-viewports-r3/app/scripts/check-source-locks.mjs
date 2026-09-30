import fs from 'node:fs';import crypto from 'node:crypto';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url))),baseline=JSON.parse(fs.readFileSync(path.join(root,'qa/r2-input-sha256.json')));
const frozen=Object.keys(baseline).filter(p=>p.startsWith('assets/')||p.startsWith('data/')||p.startsWith('adapters/kernel/')||p.startsWith('adapters/forest-kernel/')||p==='adapters/harbor-kernel/source-adapter.mjs');
for(const p of frozen){const actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');if(actual!==baseline[p])throw Error('FROZEN_SOURCE_CHANGED:'+p);}
console.log(`PASS: ${frozen.length} original PNG, frozen data and kernel files are byte-identical to r2`);
