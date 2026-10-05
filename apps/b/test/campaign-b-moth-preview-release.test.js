import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash,webcrypto} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createDocument} from './fixtures/moth-preview-fake-dom.mjs';

const appRoot=new URL('../',import.meta.url);
const route=new URL('public/campaigns-b/moth-preview/',appRoot);
const assetRoot=new URL('public/assets/moth-preview/',appRoot);
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
async function files(root){const out=[];for(const d of await readdir(root,{withFileTypes:true})){const u=new URL(d.name+(d.isDirectory()?'/':''),root);if(d.isDirectory())out.push(...await files(u));else out.push(u);}return out;}

test('moth route has a closed isolated local module/CSS graph with no persistence, gameplay or external-code dependency',async()=>{
 const list=await files(route),paths=new Set(list.map(u=>u.href));let modules=0;
 assert.equal(list.length,15);
 for(const file of list){
  const source=await readFile(file,'utf8');
  const refs=[...source.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)].map(m=>m[1]);
  if(file.pathname.endsWith('.html'))refs.push(...[...source.matchAll(/(?:src|href)="([^"#]+)"/g)].map(m=>m[1]));
  if(file.pathname.endsWith('.css'))refs.push(...[...source.matchAll(/(?:url\(\s*|@import\s*)['"]?([^'"\s)]+)['"]?\s*\)?/g)].map(m=>m[1]));
  for(const ref of refs){assert.ok(ref.startsWith('.'),ref);const next=new URL(ref,file);assert.ok(next.href.startsWith(route.href),ref);assert.ok(paths.has(next.href),ref);}
  if(/\.m?js$/.test(file.pathname)){modules++;assert.doesNotMatch(source,/\b(?:localStorage|sessionStorage|indexedDB|XMLHttpRequest|WebSocket|EventSource|serviceWorker|URLSearchParams)\b|document\.cookie|\.(?:setItem|getItem|dispatch)\(|location\.(?:search|hash)|createSaveRepository|createForestCampaign|\b(?:eval|Function)\s*\(/);assert.doesNotMatch(source,/import\s*\(/);}
 }
 assert.equal(modules,11);
 const html=await readFile(new URL('index.html',route),'utf8');assert.match(html,/connect-src 'self'/);assert.match(html,/worker-src 'none'/);assert.match(html,/form-action 'none'/);assert.doesNotMatch(html,/<form|<iframe|\bon\w+=|https?:\/\//);
});

test('the integrated browser route maps its only four image requests to the existing assets namespace with exact bytes',async()=>{
 const {PORTRAITS,STANDING,createPreviewArtRegistry}=await import(new URL('src/portrait-contract.mjs',route));
 const images=[...Object.values(PORTRAITS),STANDING];assert.equal((await files(assetRoot)).length,4);
 for(const asset of images){const bytes=await readFile(new URL(asset.file,assetRoot));assert.equal(digest(bytes),asset.sha256);assert.equal(bytes.readUInt32BE(16),asset.width);assert.equal(bytes.readUInt32BE(20),asset.height);}
 for(const expression of Object.keys(PORTRAITS))for(const role of ['portrait','dialogue-standing']){
  const result=createPreviewArtRegistry(expression).resolve({enemyId:'b06.sideTender',role,view:'neutral',phase:'before'});
  assert.equal(result.url,new URL(result.asset.file,assetRoot).href);
  const browser=new URL('../../../assets/moth-preview/'+result.asset.file,'https://candidate.invalid/b/campaigns-b/moth-preview/src/portrait-contract.mjs');
  assert.equal(browser.pathname,'/b/assets/moth-preview/'+result.asset.file);
 }
});

test('default asset loader and all menu/scenario/reader/inspector controls run with hostile state APIs and no external fetch',async()=>{
 const h=createDocument(),touched=[],denied=name=>({configurable:true,get(){touched.push(name);throw Error('Forbidden state API: '+name);},set(){touched.push(name);throw Error('Forbidden state write: '+name);}});
 for(const target of [globalThis,h.document.defaultView])for(const key of ['localStorage','sessionStorage','indexedDB','caches','XMLHttpRequest','WebSocket','EventSource'])Object.defineProperty(target,key,denied(key));
 Object.defineProperty(h.document,'cookie',denied('cookie'));
 h.document.defaultView.navigator={};Object.defineProperty(h.document.defaultView.navigator,'serviceWorker',denied('serviceWorker'));
 const originalNavigator=Object.getOwnPropertyDescriptor(globalThis,'navigator');Object.defineProperty(globalThis,'navigator',{configurable:true,value:h.document.defaultView.navigator});
 const allowed=new Set((await files(assetRoot)).map(fileURLToPath)),requests=[],urls=new Map();let id=0;
 const win=h.document.defaultView;
 win.crypto=webcrypto;win.Blob=Blob;
 win.URL={createObjectURL(blob){const url='blob:headless-moth-'+(++id);urls.set(url,blob);return url;},revokeObjectURL(url){urls.delete(url);}};
 win.Image=class{async decode(){const blob=urls.get(this.src);assert.ok(blob);const bytes=Buffer.from(await blob.arrayBuffer());this.naturalWidth=bytes.readUInt32BE(16);this.naturalHeight=bytes.readUInt32BE(20);}};
 win.fetch=async(url,options)=>{assert.ok(allowed.has(fileURLToPath(url)),url);assert.equal(options.credentials,'omit');assert.equal(options.mode,'same-origin');assert.equal(options.redirect,'error');requests.push(url);const bytes=await readFile(new URL(url));return {ok:true,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)};};
 Object.defineProperty(globalThis,'fetch',denied('global external fetch'));
 const {mountMothPreview}=await import(new URL('src/preview.mjs',route));
 const app=mountMothPreview(h.document);
 const settled=async()=>{for(let i=0;i<500;i++){await new Promise(resolve=>setTimeout(resolve,2));if(['ready','inactive','failed'].includes(app.portraitStatus().displayStatus))return;}assert.fail('preview did not settle');};
 try{
  h.$('preview-start').click();await settled();assert.equal(app.portraitStatus().displayStatus,'ready');
  h.$('preview-art-open').click();
  for(const button of h.document.expressions){button.click();await settled();assert.equal(h.$('story-portrait').dataset.expressionId,button.dataset.previewExpression);assert.equal(h.$('preview-standing').dataset.expressionId,'neutral-fixed');}
  h.$('preview-art-close').click();h.$('story-next').click();h.$('story-back').click();h.$('story-history').click();h.$('story-history-close').click();h.$('story-hide').click();h.$('story').emit('cancel');
  for(const button of h.document.variants){button.click();await settled();h.$('story-next').click();h.$('story-back').click();h.$('preview-menu').click();assert.equal(app.snapshot().scene,null);}
  h.$('preview-start').click();await settled();win.emit('pagehide');assert.equal(h.$('story').open,false);assert.equal(app.snapshot().scene,null);
  assert.ok(requests.length>=6);assert.deepEqual(touched,[]);
 }finally{for(const key of ['localStorage','sessionStorage','indexedDB','caches','XMLHttpRequest','WebSocket','EventSource','fetch'])delete globalThis[key];if(originalNavigator)Object.defineProperty(globalThis,'navigator',originalNavigator);else delete globalThis.navigator;}
});

test('build allowlist and validator contain exactly the new route and fixed hashes while game registries stay separate',async()=>{
 const build=await readFile(new URL('scripts/build-b-preview.mjs',appRoot),'utf8'),validate=await readFile(new URL('scripts/validate-b-preview-build.mjs',appRoot),'utf8');
 for(const file of [...await files(route),...await files(assetRoot)]){const relative=path.relative(fileURLToPath(appRoot),fileURLToPath(file)).split(path.sep).join('/');assert.ok(build.includes("'"+relative+"'"),relative);}
 assert.match(validate,/await visit\('campaigns-b\/moth-preview\/index.html'\)/);
 const {PORTRAITS,STANDING}=await import(new URL('src/portrait-contract.mjs',route));
 for(const asset of [...Object.values(PORTRAITS),STANDING])assert.ok(validate.includes("{file:'assets/moth-preview/"+asset.file+"',sha256:'"+asset.sha256+"'}"));
 const contract=(await import(new URL('src/contract-data.mjs',route))).PRODUCTION_CONTRACT;assert.deepEqual(contract.assets,{});
});
