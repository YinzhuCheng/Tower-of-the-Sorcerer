import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {FOREST_STORY_CONTENT as C} from '../src/campaigns/b/story/content.js';
import {FOREST_GAL_CG_CONTRACT as CG} from '../src/rendering/forest-gal-cg-contract.js';
import {forestGalPresentation} from '../src/rendering/forest-gal-stage.js';
import {createDocument,Element} from './fixtures/moth-preview-fake-dom.mjs';
const route=new URL('../public/campaigns-b/art-preview/',import.meta.url);
const code=await readFile(new URL('preview-model.js',route),'utf8');
const modelURL='data:text/javascript;base64,'+Buffer.from(code.replaceAll('../../src/',new URL('../src/',import.meta.url).href)).toString('base64');
const {ART_PREVIEW_ENTRIES,createArtPreviewScene}=await import(modelURL);
const mountCode=(await readFile(new URL('preview.js',route),'utf8')).replaceAll('../../src/',new URL('../src/',import.meta.url).href).replace('./preview-model.js',modelURL);
const {mountArtPreview}=await import('data:text/javascript;base64,'+Buffer.from(mountCode).toString('base64'));

test('all 9 exact CG turns and six images come from untouched real story, with true adjacent exit turns',()=>{
 const before=JSON.stringify(C);assert.equal(ART_PREVIEW_ENTRIES.length,10);assert.equal(new Set(CG.map(r=>r.assetId)).size,6);
 for(const row of CG){const {scene,index}=createArtPreviewScene(row.turnId),turn=scene.turns[index];assert.equal(turn.id,row.turnId);assert.equal(forestGalPresentation(scene,turn).presentation,'full-frame-cg');
 for(const t of scene.turns){const original=C.scenes[scene.sceneId].turns.find(o=>o.id===t.id);const {stage,...clone}=t;assert.deepEqual(clone,original);assert.notEqual(t,original);}
 const last=scene.turns.at(-1);if(row.sceneId==='b18_private')assert.equal(last.id,'b18_private.L1113');else assert.notEqual(forestGalPresentation(scene,last).presentation,'full-frame-cg');
 turn.text='local change';assert.notEqual(C.scenes[scene.sceneId].turns.find(t=>t.id===row.turnId).text,'local change');}
 assert.equal(JSON.stringify(C),before);assert.throws(()=>createArtPreviewScene('unknown'));
 const baseline=createArtPreviewScene(ART_PREVIEW_ENTRIES[0].turnId);assert.notEqual(forestGalPresentation(baseline.scene,baseline.scene.turns[baseline.index]).presentation,'full-frame-cg');
});

test('normal clicks, skip, close/reopen, H and history reuse production reader without touching persistence',()=>{
 const h=createDocument(),baseGet=h.document.getElementById;for(const id of ['art-preview-entries','story-pause','story-skip'])h.nodes[id]=new Element(id==='art-preview-entries'?'div':'button',id,h.document);
 h.document.getElementById=id=>h.nodes[id]??baseGet(id);
 const oldDoc=globalThis.document,prior=new Map();for(const key of ['localStorage','sessionStorage','indexedDB','fetch','XMLHttpRequest','WebSocket']){prior.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{configurable:true,get(){throw Error('Forbidden '+key);}});}
 globalThis.document=h.document;
 try{const mounted=mountArtPreview(h.document),buttons=h.$('art-preview-entries').children;assert.equal(buttons.length,10);
 for(const button of buttons){button.click();assert.equal(h.$('story').open,true);assert.equal(h.$('story').dataset.turnId,button.dataset.previewTurnId);
 h.$('story').emit('keydown',{key:'h'});assert.equal(h.$('story').dataset.readerMode,'art');h.$('story-restore').click();assert.equal(h.$('story').dataset.readerMode,'reading');
 h.$('story-history').click();assert.equal(h.$('story').dataset.readerMode,'history');assert.ok(h.$('story-history-entries').children.length);h.$('story-history-close').click();
 h.$('story-skip').click();if(h.$('story').open)h.$('story-skip').click();assert.equal(h.$('story').open,false);assert.equal(h.$('story-backdrop').src,'');assert.equal(h.$('story-actors').children.length,0);assert.equal(h.$('story-history-entries').children.length,0);
 button.click();h.$('story-close').click();assert.equal(h.$('story').open,false);assert.equal(h.document.activeElement,button);}
 buttons[1].click();buttons[2].click();assert.equal(h.$('story').dataset.turnId,buttons[2].dataset.previewTurnId);mounted.close();
 }finally{globalThis.document=oldDoc;for(const [key,descriptor]of prior){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}
});

test('isolated route has no game entry hook, outbound connection or storage API; production stage styling unchanged',async()=>{
 const html=await readFile(new URL('index.html',route),'utf8'),css=await readFile(new URL('preview.css',route),'utf8');
 assert.match(html,/connect-src 'none'/);assert.match(html,/href="\.\.\/styles.css"/);assert.doesNotMatch(css,/\.story-|#story-/);
 for(const source of [code,mountCode])assert.doesNotMatch(source,/localStorage|sessionStorage|indexedDB|createSaveRepository|createForestCampaign|fetch\(|XMLHttpRequest|WebSocket|location\.|URLSearchParams/);
 const main=await readFile(new URL('../public/campaigns-b/index.html',import.meta.url),'utf8');assert.doesNotMatch(main,/art-preview/);
});
