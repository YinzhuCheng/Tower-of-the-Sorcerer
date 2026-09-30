#!/usr/bin/env node
import { mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { spawn } from 'node:child_process';
import { validateConfig, within, requireCi, VIEWPORTS } from './lib/config.mjs';
import { serve } from './lib/server.mjs';
import { capture } from './capture.mjs';
const argv=process.argv.slice(2);
if(argv.length!==2 || argv[0]!=='--config')throw Error('Usage: node candidate-viewport-qa/ci.mjs --config candidate-viewport-qa/configs/b.json');
requireCi(process.env);
const root=await realpath(process.cwd()),config=validateConfig(JSON.parse(await readFile(within(root,argv[1]),'utf8')));
if(!config.branch || process.env.GITHUB_REF_NAME!==config.branch)throw Error(`Candidate branch mismatch; expected ${config.branch??'publisher to assign A branch'}`);
if(process.env.GITHUB_EVENT_NAME==='pull_request_target')throw Error('Privileged pull_request_target is not supported');
const pkg=await realpath(within(root,config.packageRoot));within(root,pkg);
const output=within(root,`.qa-artifacts/${config.id}`);await mkdir(output,{recursive:true});
const run={schemaVersion:1,candidate:config.id,config,commit:process.env.GITHUB_SHA??null,branch:process.env.GITHUB_REF_NAME,status:'running',startedAt:new Date().toISOString(),build:[],viewports:[],manualPlaythrough:false,certificateDriven:false,threeDVisualAcceptance:false};
let server=null;const requests=[];
try {
  for(const command of config.build){
    const [file,...args]=command;const result=await new Promise((resolveRun,reject)=>{const p=spawn(file,args,{cwd:pkg,env:process.env,stdio:['ignore','pipe','pipe']});let log='';p.stdout.on('data',b=>{log+=b;process.stdout.write(b);});p.stderr.on('data',b=>{log+=b;process.stderr.write(b);});p.on('error',reject);p.on('exit',(code,signal)=>resolveRun({command,code,signal,log}));});
    const logFile=`build-${run.build.length+1}.log`;await writeFile(join(output,logFile),result.log);run.build.push({command,code:result.code,signal:result.signal,logFile});if(result.code!==0)throw Error(`Build failed: ${command.join(' ')}`);
  }
  const built=await realpath(within(pkg,config.outputDirectory));within(pkg,built);if(built===pkg||built===root)throw Error('Refusing to serve source root');
  await realpath(join(built,'index.html'));
  server=await serve(built,requests);run.localStartUrl=server.url+config.startPath;
  for(const viewport of VIEWPORTS){const result=await capture(config,viewport,run.localStartUrl,join(output,viewport.id));run.viewports.push({id:viewport.id,status:result.status,report:`${viewport.id}/report.json`,renderer:result.final?.renderStatus.renderer??null,screenshotCount:result.screenshots.length});}
  run.status=run.viewports.some(v=>v.status==='failed')?'failed':run.viewports.some(v=>v.status==='captured-with-warnings')?'captured-with-warnings':'captured';
} catch(e){run.status='failed';run.error=e.stack??String(e);process.stderr.write(String(e)+'\n');}
finally {
  if(server)await server.close();run.finishedAt=new Date().toISOString();await writeFile(join(output,'server-requests.json'),JSON.stringify(requests,null,2)+'\n');await writeFile(join(output,'manifest.json'),JSON.stringify(run,null,2)+'\n');
}
console.log(JSON.stringify({candidate:run.candidate,status:run.status,viewports:run.viewports,artifacts:output,manualPlaythrough:false,threeDVisualAcceptance:false},null,2));
if(run.status==='failed')process.exitCode=1;
