import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import { Cdp, sleep, waitFor, pngDimensions } from './lib/cdp.mjs';
import { chromeArgs, verifyOneMove, requireCi } from './lib/config.mjs';
import { observationExpression } from './lib/observation.mjs';
const json=(path,value)=>writeFile(path,JSON.stringify(value,null,2)+'\n');
async function port(){const s=createServer();await new Promise((r,j)=>{s.once('error',j);s.listen(0,'127.0.0.1',r);});const p=s.address().port;await new Promise(r=>s.close(r));return p;}
async function stop(child){if(child.exitCode!==null)return;child.kill('SIGTERM');await Promise.race([new Promise(r=>child.once('exit',r)),sleep(2000)]);if(child.exitCode===null)child.kill('SIGKILL');}
function chromeBinary(){for(const command of [process.env.CHROME_BIN,'google-chrome','google-chrome-stable'].filter(Boolean)){const r=spawnSync(command,['--version'],{encoding:'utf8'});if(r.status===0 && /Google Chrome/.test(r.stdout))return {command,version:r.stdout.trim()};}throw Error('Official Google Chrome is missing on this CI runner; no alternate insecure launch will be attempted');}
async function click(client,selector,actions){
  const point=await client.evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el||el.disabled||el.hidden||!el.getClientRects().length)throw Error('UI control unavailable');el.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});const r=el.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,hit=document.elementFromPoint(x,y);if(!hit||!(hit===el||el.contains(hit)))throw Error('UI control is covered');return {x,y};})()`);
  await client.send('Input.dispatchMouseEvent',{type:'mouseMoved',...point});
  await client.send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});
  await client.send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});
  actions.push({type:'real-pointer-click',selector,...point});
}
export async function capture(config,viewport,url,output){
  requireCi(process.env);
  await mkdir(output,{recursive:true});
  const report={schemaVersion:1,candidate:config.id,viewport,sourceCommit:process.env.GITHUB_SHA??null,branch:process.env.GITHUB_REF_NAME??null,evidenceMode:'normal-start-and-one-ui-move',manualPlaythrough:false,certificateDriven:false,threeDVisualAcceptance:false,status:'running',actions:[],screenshots:[],errors:[],warnings:[]};
  const events={console:[],exceptions:[],http:[],resources404:[],failedRequests:[],blockedExternal:[],javascriptDialogs:[],protocolErrors:[]};
  const profile=await mkdtemp(join(tmpdir(),'candidate-viewport-chrome-')),debugPort=await port();
  let chrome=null,client=null,browser=null,stderr='';
  const inflight=new Set();let lastNetwork=Date.now();
  try {
    const binary=chromeBinary();report.chrome=binary;
    const args=chromeArgs(profile,debugPort,viewport);report.chromeFlags=args.map(a=>a.startsWith('--user-data-dir=')?'--user-data-dir=<fresh-disposable-profile>':a);
    chrome=spawn(binary.command,args,{stdio:['ignore','ignore','pipe']});
    chrome.stderr.on('data',b=>{stderr+=String(b);});let spawnError=null;chrome.on('error',e=>{spawnError=e;});
    const devtools=await waitFor(async()=>{if(spawnError)throw spawnError;if(chrome.exitCode!==null)throw Error(`Chrome exited with ${chrome.exitCode}; sandbox and GPU flags will not be weakened`);try{const r=await fetch(`http://127.0.0.1:${debugPort}/json/version`,{signal:AbortSignal.timeout(1000)});return r.ok?await r.json():false;}catch{return false;}},'Chrome DevTools endpoint did not become ready',20000);
    report.browserVersion=devtools;
    browser=new Cdp(devtools.webSocketDebuggerUrl);await browser.connect();
    try{report.gpu=await browser.send('SystemInfo.getInfo');}catch(e){report.warnings.push(`GPU diagnostic unavailable: ${e.message}`);}
    const targets=await(await fetch(`http://127.0.0.1:${debugPort}/json/list`,{signal:AbortSignal.timeout(3000)})).json();
    const target=targets.find(x=>x.type==='page');if(!target)throw Error('Chrome page target absent');
    client=new Cdp(target.webSocketDebuggerUrl);await client.connect();
    const origin=new URL(url).origin;
    client.on('Runtime.consoleAPICalled',e=>events.console.push({type:e.type,text:e.args.map(a=>a.value??a.description??a.type).join(' '),timestamp:e.timestamp}));
    client.on('Runtime.exceptionThrown',e=>events.exceptions.push(e.exceptionDetails));
    client.on('Page.javascriptDialogOpening',e=>events.javascriptDialogs.push(e));
    client.on('Network.requestWillBeSent',e=>{inflight.add(e.requestId);lastNetwork=Date.now();});
    client.on('Network.responseReceived',e=>{const r=e.response;events.http.push({url:r.url,status:r.status,type:e.type,mimeType:r.mimeType});if(r.status===404)events.resources404.push({url:r.url,type:e.type});});
    client.on('Network.loadingFinished',e=>{inflight.delete(e.requestId);lastNetwork=Date.now();});
    client.on('Network.loadingFailed',e=>{inflight.delete(e.requestId);lastNetwork=Date.now();events.failedRequests.push(e);});
    client.on('Fetch.requestPaused',e=>{const u=e.request.url;const allowed=u.startsWith('data:')||u.startsWith('blob:')||new URL(u).origin===origin;if(!allowed)events.blockedExternal.push({url:u,type:e.resourceType});client.send(allowed?'Fetch.continueRequest':'Fetch.failRequest',allowed?{requestId:e.requestId}:{requestId:e.requestId,errorReason:'BlockedByClient'}).catch(e=>events.protocolErrors.push(e.message));});
    for(const domain of ['Page','Runtime','Network'])await client.send(`${domain}.enable`);
    await client.send('Fetch.enable',{patterns:[{urlPattern:'*',requestStage:'Request'}]});
    await client.send('Emulation.setDeviceMetricsOverride',{width:viewport.width,height:viewport.height,deviceScaleFactor:1,mobile:false});
    await client.send('Page.navigate',{url});
    await waitFor(async()=>{try{return await client.evaluate(`location.href === ${JSON.stringify(url)} && document.readyState !== 'loading'`);}catch(e){if(/context|navigation/i.test(e.message))return false;throw e;}},'Initial local document did not load',45000);
    const inspect=async()=>{if(events.javascriptDialogs.length)throw Error('Unexpected native confirmation dialog; no acceptance attempted');const state=await client.evaluate(observationExpression(config));if(state.url!==url)throw Error(`Unexpected navigation: ${state.url}`);return state;};
    const settle=async()=>{await waitFor(async()=>{await inspect();return inflight.size===0 && Date.now()-lastNetwork>700;},'Resources did not finish loading',45000);await client.evaluate('document.fonts.ready.then(()=>true)');await client.evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');};
    const screenshot=async(name,kind)=>{
      const observation=await inspect();
      if(observation.viewport.width!==viewport.width||observation.viewport.height!==viewport.height)throw Error('CSS viewport does not match requested viewport');
      const shot=await client.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});
      const bytes=Buffer.from(shot.data,'base64'),dimensions=pngDimensions(bytes);
      if(dimensions.width!==viewport.width||dimensions.height!==viewport.height)throw Error(`PNG viewport mismatch: ${JSON.stringify(dimensions)}`);
      await writeFile(join(output,`${name}.png`),bytes);await json(join(output,`${name}.json`),{kind,observation});
      report.screenshots.push({file:`${name}.png`,sidecar:`${name}.json`,kind,dimensions,renderer:observation.renderStatus.renderer});return observation;
    };
    // A has no canvas during its opening. Never require the A canvas to exist
    // before releasing that opening through the game's visible skip control.
    await waitFor(async()=>{const s=await inspect();return s.readiness.storyOpen||s.readiness.ready;},'Neither initial story nor a ready map appeared',60000);
    await settle();const startup=await screenshot('01-startup','normal initial page');report.initial=startup;
    if(!startup.readiness.storyOpen)throw Error('Fresh launch did not expose the expected opening dialogue; no fixture is used to invent it');
    await screenshot('02-current-dialog','actual opening/current dialogue before UI dismissal');
    for(let count=0;count<8;count++){
      const s=await inspect();if(!s.readiness.storyOpen)break;
      await click(client,config.adapter==='a'?'#gal-root [data-gal-control="skip"]':config.adapter==='b'?'#story-pause':'#story-skip',report.actions);
      await sleep(150);
      if(count===7 && (await inspect()).readiness.storyOpen)throw Error('Opening still requires a real player choice; QA does not select story choices');
    }
    await waitFor(async()=>{const s=await inspect();return s.readiness.ready?s:false;},'Real map/save/renderer readiness not reached after UI release',60000);
    await settle();await client.evaluate('window.scrollTo({top:0,left:0,behavior:"instant"})');await screenshot('03-map-page-top','map ready, original top-of-page viewport');
    const mapSelector=config.adapter==='a'?'#game-container':'.map-stage';
    await client.evaluate(`document.querySelector(${JSON.stringify(mapSelector)}).scrollIntoView({block:'center',inline:'nearest',behavior:'instant'})`);
    await settle();const before=await screenshot('04-map','map-ready viewport after normal document scrolling');
    if(!before.safeMove)throw Error('No plain adjacent floor cell is observable for a safe single move');
    const key=before.safeMove.key;
    await client.send('Input.dispatchKeyEvent',{type:'keyDown',key,code:key,windowsVirtualKeyCode:{ArrowUp:38,ArrowDown:40,ArrowLeft:37,ArrowRight:39}[key]});
    await client.send('Input.dispatchKeyEvent',{type:'keyUp',key,code:key});report.actions.push({type:'real-keypress',key,expected:before.safeMove});
    const after=await waitFor(async()=>{const s=await inspect();return s.state && (s.state.x!==before.state.x || s.state.y!==before.state.y)?s:false;},'Single UI key did not move the player',5000);
    verifyOneMove(before.state,after.state);
    await waitFor(async()=>{const s=await inspect();return s.readiness.ready;},'Map lost readiness after the legal move',10000);await settle();
    report.final=await screenshot('05-after-one-move','one real legal UI move; no completion claim');report.move={before:before.state,after:report.final.state,key};
    verifyOneMove(before.state,report.final.state);
    if(config.adapter==='b'){
      await click(client,'#resume-story',report.actions);await waitFor(async()=>(await inspect()).readiness.storyOpen,'Paused B dialogue did not resume');await settle();await screenshot('06-resumed-dialog','paused current B dialogue resumed through UI');
    }
    const problemHttp=events.http.filter(e=>e.status>=400 && new URL(e.url).pathname!=='/favicon.ico');
    const consoleErrors=events.console.filter(e=>e.type==='error');
    if(problemHttp.length||events.exceptions.length||consoleErrors.length||events.failedRequests.length||events.blockedExternal.length||events.protocolErrors.length)throw Error('Browser/resource errors found; inspect browser-events.json');
    for(const warning of events.console.filter(e=>e.type==='warning'||e.type==='warn').slice(0,20))report.warnings.push(`Browser warning: ${warning.text}`);
    if(events.resources404.some(e=>new URL(e.url).pathname==='/favicon.ico'))report.warnings.push('favicon.ico returned 404; recorded as non-blocking, unlike application resources');
    const measured=report.final;
    if(measured.document.horizontalOverflow)report.warnings.push('Document is wider than the viewport; inspect screenshot and layout dimensions');
    const m=measured.ui.map;if(m&&(m.x< -1||m.right>viewport.width+1))report.warnings.push('Map extends horizontally outside the viewport');
    if(['Canvas2D fallback','DOM grid fallback'].includes(measured.renderStatus.renderer))report.warnings.push('WebGL2 was unavailable. This records the real 2D fallback and is not a 3D quality pass');
    report.status=report.warnings.length?'captured-with-warnings':'captured';
  } catch(e) {
    report.status='failed';report.errors.push(e.stack??String(e));
    if(client)try{await json(join(output,'failure-observation.json'),await client.evaluate(observationExpression(config)));const shot=await client.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});await writeFile(join(output,'failure.png'),Buffer.from(shot.data,'base64'));}catch(d){report.errors.push(`Failure diagnostic unavailable: ${d.message}`);}
  } finally {
    client?.close();browser?.close();if(chrome)await stop(chrome);await rm(profile,{recursive:true,force:true});
    await writeFile(join(output,'chrome-stderr.log'),stderr);await json(join(output,'browser-events.json'),events);await json(join(output,'render-status.json'),{status:report.status,initial:report.initial?.renderStatus??null,final:report.final?.renderStatus??null,threeDVisualAcceptance:false});await json(join(output,'report.json'),report);
  }
  return report;
}
