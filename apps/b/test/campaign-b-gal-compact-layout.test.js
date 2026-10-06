import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createForestGalReader} from '../src/rendering/forest-gal-reader.js';
import {createDocument,Element} from './fixtures/moth-preview-fake-dom.mjs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const css=read('../public/campaigns-b/styles.css');

test('shared normal and CG preview markup has a standalone identity chip, paper content and quiet accessible next',()=>{
 for(const route of ['index.html','art-preview/index.html']){
  const html=read('../public/campaigns-b/'+route);
  const chip=html.match(/<div class="story-speaker-row">(.*?)<div class="story-content">/s)?.[1];
  assert.ok(chip);assert.match(chip,/id="story-portrait"/);assert.match(chip,/id="story-speaker"/);assert.match(chip,/id="story-title"/);assert.doesNotMatch(chip,/story-progress/);
  assert.match(html,/<div class="story-content"><p id="story-copy" aria-live="polite">/);
  const next=html.match(/<button id="story-next"[^>]+>/)[0];
  assert.match(next,/type="button"/);assert.match(next,/aria-label="继续"/);assert.doesNotMatch(next,/data-story-help|disabled/);
  assert.doesNotMatch(html,/继续：阅读下一句对白/);assert.equal((html.match(/id="story-progress"/g)??[]).length,1);
  assert.match(html,/data-story-help="本段回顾/);assert.match(html,/aria-keyshortcuts="H"/);
 }
});

test('reading panel retains transparent chip surround and accessible controls',()=>{
 const body=css.match(/\.story-dialog \.story-body\{[^}]+/)[0];
 assert.match(body,/min-height:0/);assert.match(body,/padding:0;background:transparent/);assert.match(body,/overflow:auto/);
 const chip=css.match(/\.story-dialog \.story-speaker-row\{[^}]+/)[0];
 assert.match(chip,/width:fit-content;max-width:100%/);assert.match(chip,/border-bottom:0/);assert.match(chip,/background:#faf6e9f7/);
 assert.match(css,/\.story-dialog \.story-content\{padding:8px/);
 const compact=css.slice(css.indexOf('/* Compact GAL controls:'),css.indexOf('/* Exact B08/B12'));
 assert.equal((compact.match(/#story-copy\{min-height:0/g)??[]).length,3);
 assert.match(compact,/flex-wrap:wrap;margin:0;min-width:0/);assert.match(compact,/height:28px;min-height:28px/);assert.match(compact,/height:44px;min-height:44px/);
 assert.match(css,/#story-copy\{[^}]*white-space:pre-line;overflow-wrap:anywhere/);
 assert.doesNotMatch(css,/line-clamp/);
 for(const presentation of ['object-insert'])assert.ok(css.includes(`[data-art-presentation="${presentation}"] .story-body{top:auto;bottom:3%;min-height:0;max-height:41%}`));
});

test('narration, named short/long lines and repeat entry retain complete text and reader accessibility',()=>{
 const h=createDocument(),$=h.$;
 const nodes={dialog:$('story'),stage:$('story-stage'),body:$('story-body'),historyButton:$('story-history'),historyPanel:$('story-history-panel'),historyEntries:$('story-history-entries'),historyClose:$('story-history-close'),hideButton:$('story-hide'),restoreButton:$('story-restore'),historyTitle:$('story-history-title')};
 const reader=createForestGalReader(nodes,{createElement:tag=>new Element(tag)});
 const scene={title:'山路',turns:[{id:'a',speaker:'旁白',text:'风停了。'},{id:'b',speaker:'珂珂',portrait:'merchant',text:'扶我一下。'},{id:'c',speaker:'很长的名字'.repeat(8),portrait:'hero',text:('走过山路，继续往前。\n').repeat(40)}]};
 for(let pass=0;pass<2;pass++)for(let index=0;index<scene.turns.length;index++){
  $('story').open=true;reader.sync(scene,index);assert.equal($('story').dataset.narration,String(!scene.turns[index].portrait));
  $('story-history').click();const current=$('story-history-entries').children.at(-1);assert.equal(current.children[0].textContent,scene.turns[index].speaker);assert.equal(current.children[1].textContent,scene.turns[index].text);assert.equal($('story-body').inert,true);
  $('story-history-close').click();assert.equal($('story').attributes['aria-describedby'],'story-copy');
  $('story').emit('keydown',{key:'h'});assert.equal($('story-body').hidden,true);assert.equal($('story').attributes['aria-describedby'],undefined);
  assert.equal(reader.dismiss(),true);assert.equal($('story-body').hidden,false);assert.equal($('story-body').inert,false);
  reader.reset();assert.equal($('story-history-entries').children.length,0);assert.equal($('story').dataset.readerMode,'reading');
 }
});


test('portrait object inserts retain the eight-pouch safe area',()=>{
 for(const presentation of ['object-insert']){
  const rule=`[data-art-presentation="${presentation}"] .story-body{top:auto;bottom:max(3%,env(safe-area-inset-bottom));min-height:0;max-height:calc(54% - max(3%,env(safe-area-inset-bottom)))}`;
  assert.ok(css.includes(rule),presentation);
  for(const [w,h] of [[320,568],[390,844],[430,932],[768,1024]])for(const inset of [0,20,34,48]){
   const bottom=Math.max(h*.03,inset),maxHeight=h*.54-bottom;
   assert.ok(maxHeight>0,`${w}x${h} inset ${inset}`);
   // Long text reaches max-height; shorter content moves its top farther down.
   for(const actualHeight of [maxHeight,maxHeight/2,Math.min(80,maxHeight)]){
    const panelTop=h-bottom-actualHeight;
    assert.ok(panelTop>=h*.46-1e-9,`${presentation} ${w}x${h} inset ${inset}`);
    assert.ok(panelTop>=h*.44, 'the full 44 percent image stage stays clear');
    assert.ok(h-bottom<=h-inset+1e-9, 'panel bottom clears the safe area');
   }
   assert.ok(Math.abs((h-bottom-maxHeight)-h*.46)<1e-9);
  }
 }
});
