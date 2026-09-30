/** Official-CI-only REAL browser evidence. Each viewport is isolated and failure reports are durable. */
import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';import {spawn} from 'node:child_process';import assert from 'node:assert/strict';
if(process.env.REVIEW_BROWSER_CI!=='1')throw Error('Browser screenshots are pending. Run only on official CI with REVIEW_BROWSER_CI=1 and installed Playwright + sandbox-capable Chromium. No local unsafe-browser workaround is permitted.');
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url))),runId=new Date().toISOString().replace(/[:.]/g,'-'),out=path.join(root,'qa/browser-evidence',runId);
await fs.mkdir(out,{recursive:true});
const report={runId,atUTC:new Date().toISOString(),evidenceType:'actual Playwright browser screenshots only',status:'RUNNING',browser:null,visualArtApproval:'PENDING HUMAN INSPECTION; automated capture is not approval',viewports:[],fatalError:null,cleanupErrors:[],serverLogs:[]};
const errorRecord=e=>({name:e?.name??'Error',message:String(e?.message??e),stack:String(e?.stack??'')});
const bounded=(promise,ms,label)=>{let timer;return Promise.race([promise,new Promise((_,reject)=>timer=setTimeout(()=>reject(Error(label)),ms))]).finally(()=>clearTimeout(timer));};
async function persist(){await fs.writeFile(path.join(out,'browser-results.json'),JSON.stringify(report,null,2)+'\n');await fs.writeFile(path.join(root,'qa/browser-evidence/latest-report.json'),JSON.stringify({runId,status:report.status,report:path.relative(root,path.join(out,'browser-results.json'))},null,2)+'\n');}
let server,browser;
try{
 const modulePath=process.env.PLAYWRIGHT_MODULE;
 const {chromium}=modulePath?await import(pathToFileURL(modulePath).href):await import('playwright');
 report.playwrightModule=modulePath??'installed playwright';report.chromiumExecutable=process.env.CHROMIUM_EXECUTABLE??'official Playwright-managed Chromium';
 server=spawn(process.execPath,['scripts/serve.mjs'],{cwd:root,env:{...process.env,PORT:'4178'},stdio:['ignore','pipe','pipe']});
 server.stdout.on('data',d=>report.serverLogs.push(String(d)));server.stderr.on('data',d=>report.serverLogs.push(String(d)));
 await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('SERVER_START_TIMEOUT')),10000);server.stdout.on('data',chunk=>{if(String(chunk).includes('http://')){clearTimeout(t);resolve();}});server.on('error',e=>{clearTimeout(t);reject(e);});server.on('exit',code=>{clearTimeout(t);reject(Error(`SERVER_EXIT:${code}`));});});
 browser=await chromium.launch({headless:true,chromiumSandbox:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{})});report.browser=await browser.version();
 for(const viewport of [{name:'desktop',width:1180,height:757},{name:'narrow',width:390,height:844}]){
  const result={viewport,status:'RUNNING',step:'create-context',captures:[],routeEvidence:[],pageErrors:[],error:null,failureEvidence:null,cleanupErrors:[]};report.viewports.push(result);
  let context,page;
  try{
   context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},deviceScaleFactor:1,colorScheme:'dark',reducedMotion:'reduce'});page=await context.newPage();
   page.on('pageerror',e=>result.pageErrors.push(errorRecord(e)));page.on('console',m=>{if(m.type()==='error')result.pageErrors.push({name:'ConsoleError',message:m.text()});});
   result.step='load-original-app';await page.goto('http://127.0.0.1:4178/',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__PAINTED_REVIEW__?.getState().ready);
   const capture=async(name)=>{
    result.step=name;await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'horizontal document overflow');assert.equal(await page.locator('#load-status').isVisible(),false,'asset load error');
    const state=await page.evaluate(()=>window.__PAINTED_REVIEW__.getState());assert.equal(state.ready,true);assert.equal(state.animation,'neutral-reference-only');
    const file=`${viewport.name}-${name}.png`;await page.screenshot({path:path.join(out,file),fullPage:false});result.captures.push({file,state});await persist();return state;
   };
   for(const scene of ['forest','harbor']){
    result.step=`load-${scene}`;await page.evaluate(id=>window.__PAINTED_REVIEW__.setScene(id),scene);
    await page.evaluate(()=>{window.__PAINTED_REVIEW__.setMode('frame');window.__PAINTED_REVIEW__.setHero(false);});await capture(`${scene}-original-frame`);
    await page.evaluate(()=>window.__PAINTED_REVIEW__.setHero(true));
    const anchors=await page.evaluate(()=>window.__PAINTED_REVIEW__.getState().anchorIds);
    for(const anchor of anchors){await page.evaluate(id=>{window.__PAINTED_REVIEW__.setAnchor(id);window.__PAINTED_REVIEW__.setMode(innerWidth<640?'native':'frame');window.__PAINTED_REVIEW__.setOverlay('feet',false);window.__PAINTED_REVIEW__.setFacing('front');},anchor);await capture(`${scene}-${anchor}-footing`);}
    // Actual background alpha QA uses an explicit well-lit floor anchor, not the last arbitrary route endpoint.
    await page.evaluate(id=>window.__PAINTED_REVIEW__.setAnchor(id),scene==='forest'?'bay':'quay');
    for(const facing of ['front','back','right','left']){await page.evaluate(id=>{window.__PAINTED_REVIEW__.setMode('native');window.__PAINTED_REVIEW__.setFacing(id);window.__PAINTED_REVIEW__.setOverlay('feet',true);},facing);await capture(`${scene}-${facing}-native-alpha-pivot`);}
    // Bounded kernel movement is stepped for reproducible intermediate footing evidence; never interpolate a screenshot in image software.
    const pairs=scene==='forest'?[['root','bay'],['upper','bay']]:[['east_foot','east-top'],['bridge','underbridge']];
    for(const [from,to]of pairs){
     await page.evaluate(([from,to])=>{const r=window.__PAINTED_REVIEW__;r.setAnchor(from);r.setMode(innerWidth<640?'native':'frame');r.beginRouteTo(to);r.pause(true);},[from,to]);
     const initial=await capture(`${scene}-${from}-to-${to}-0pct`);
     assert.equal(initial.moving,true,'Named route must actually start');assert.equal(initial.routeProgress.cursor,0);assert.ok(initial.position&&initial.physicalWorld,'Physical route start state is required');
     const routeRecord={scene,from,to,authority:'actual app adapter + original reviewed kernel advance; no anchor relocation during traversal',start:initial,checkpoints:[]};result.routeEvidence.push(routeRecord);
     for(const stop of [.25,.5,.75,1]){
      await page.evaluate(fraction=>{const r=window.__PAINTED_REVIEW__;let s=r.getState();if(!s.moving&&fraction<1)throw Error('REVIEW_ROUTE_DID_NOT_START');const goal=s.routeProgress?s.routeProgress.length*fraction:0;let n=0;while(s.moving&&s.routeProgress.cursor<goal-1e-8){s=r.stepRoute(1/30);if(++n>20000)throw Error('REVIEW_ROUTE_DID_NOT_ADVANCE');}},stop);
      const checkpoint=await capture(`${scene}-${from}-to-${to}-${Math.round(stop*100)}pct`);
      assert.ok(checkpoint.position&&checkpoint.physicalWorld);routeRecord.checkpoints.push({requestedFraction:stop,state:checkpoint});
      if(stop===1){assert.equal(checkpoint.moving,false,'Route must finish through movement');assert.equal(checkpoint.anchorId,to,'Movement endpoint must equal named target');assert.notDeepEqual(checkpoint.position,initial.position,'Position must change through route advancement');}
      await persist();
     }
    }
    await page.evaluate(()=>window.__PAINTED_REVIEW__.setQA(true));await capture(`${scene}-qa-open`);await page.locator('#qa-close').click();assert.equal(await page.locator('#qa-panel').isVisible(),false);
   }
   result.step='rapid-switch-and-repeat-controls';await page.evaluate(async()=>{await Promise.all([window.__PAINTED_REVIEW__.setScene('forest'),window.__PAINTED_REVIEW__.setScene('harbor')]);});assert.equal((await page.evaluate(()=>window.__PAINTED_REVIEW__.getState())).sceneId,'harbor');
   await page.locator('#hero-toggle').click();await page.locator('#hero-toggle').click();assert.equal(await page.locator('#hero-toggle').getAttribute('aria-pressed'),'true');
   assert.deepEqual(result.pageErrors,[]);result.status='PASS_AUTOMATED_CAPTURE';
  }catch(error){
   result.status='FAIL';result.error=errorRecord(error);
   const evidence={step:result.step,rawError:result.error,state:null,screenshot:null,evidenceErrors:[]};result.failureEvidence=evidence;
   if(page){
    try{evidence.state=await bounded(page.evaluate(()=>({review:window.__PAINTED_REVIEW__?.getState?.()??null,loadError:window.__PAINTED_REVIEW_ERROR__??null,url:location.href})),5000,'FAILURE_STATE_TIMEOUT');}catch(e){evidence.evidenceErrors.push(errorRecord(e));}
    try{const file=`${viewport.name}-FAILURE.png`;await page.screenshot({path:path.join(out,file),fullPage:false,timeout:5000});evidence.screenshot=file;}catch(e){evidence.evidenceErrors.push(errorRecord(e));}
   }
   await fs.writeFile(path.join(out,`${viewport.name}-failure.json`),JSON.stringify(evidence,null,2)+'\n');
  }finally{
   if(context)try{await bounded(context.close(),10000,'CONTEXT_CLOSE_TIMEOUT');}catch(error){result.cleanupErrors.push(errorRecord(error));}
   await persist();
  }
 }
}catch(error){report.fatalError=errorRecord(error);}
finally{
 // Terminate the server FIRST, so even an unresponsive or throwing browser.close cannot prevent it.
 if(server){try{server.kill('SIGTERM');}catch(error){report.cleanupErrors.push(errorRecord(error));}}
 if(browser)try{await bounded(browser.close(),10000,'BROWSER_CLOSE_TIMEOUT');}catch(error){report.cleanupErrors.push(errorRecord(error));}
 for(const viewport of [{name:'desktop',width:1180,height:757},{name:'narrow',width:390,height:844}])if(!report.viewports.some(r=>r.viewport.name===viewport.name))report.viewports.push({viewport,status:'BLOCKED',reason:'Browser/server/module setup failed before this viewport',originalError:report.fatalError});
 report.status=report.fatalError||report.viewports.some(v=>v.status!=='PASS_AUTOMATED_CAPTURE')?'FAIL_OR_BLOCKED':report.cleanupErrors.length||report.viewports.some(v=>v.cleanupErrors.length)?'PASS_WITH_CLEANUP_ERRORS':'PASS_AUTOMATED_CAPTURE';report.finishedAtUTC=new Date().toISOString();await persist();
}
console.log(JSON.stringify({status:report.status,report:path.join(out,'browser-results.json'),screenshots:report.viewports.reduce((n,v)=>n+(v.captures?.length??0),0),visualArtApproval:report.visualArtApproval},null,2));
if(report.status!=='PASS_AUTOMATED_CAPTURE')process.exitCode=1;
