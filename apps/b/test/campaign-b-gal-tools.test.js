import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createForestGalTooltips,createForestGalReader} from '../src/rendering/forest-gal-reader.js';
class Element {
 constructor(id, help=''){this.id=id;this.dataset={storyHelp:help};this.attributes={};this.events={};this.hidden=false;this.inert=false;this.disabled=false;this.textContent='';}
 setAttribute(k,v){this.attributes[k]=v;}removeAttribute(k){delete this.attributes[k];}
 addEventListener(k,fn,capture=false){(this.events[k]??=[]).push({fn,capture});}
 emit(type,props={}){const e={defaultPrevented:false,stopped:false,preventDefault(){this.defaultPrevented=true;},stopImmediatePropagation(){this.stopped=true;},...props};for(const h of [...this.events[type]??[]].sort((a,b)=>Number(b.capture)-Number(a.capture))){h.fn(e);if(e.stopped)break;}return e;}
}
function fixture(){
 const hint=new Element('story-tool-help'),buttons=['history','hide','pause','skip','next'].map(k=>new Element(`story-${k}`,`${k}：完整的按钮含义`));hint.hidden=true;
 const body={hidden:false,inert:false,querySelector:()=>hint,querySelectorAll:()=>buttons},tasks=new Map();let nonce=0;
 const tools=createForestGalTooltips(body,{schedule(fn,ms){assert.equal(ms,450);tasks.set(++nonce,fn);return nonce;},cancel:id=>tasks.delete(id)});
 return {hint,buttons,body,tasks,tools,hold(){for(const fn of [...tasks.values()])fn();tasks.clear();}};
}
test('compact tools: hover and keyboard focus expose a real tooltip, leave/blur clears descriptions',()=>{
 const {hint,buttons:[history,hide]}=fixture();
 history.emit('pointerenter',{pointerType:'mouse'});assert.equal(hint.hidden,false);assert.equal(hint.textContent,history.dataset.storyHelp);assert.equal(history.attributes['aria-describedby'],hint.id);
 history.emit('pointerleave',{pointerType:'mouse'});assert.equal(hint.hidden,true);assert.equal(history.attributes['aria-describedby'],undefined);
 hide.emit('focus');history.emit('pointerenter',{pointerType:'mouse'});assert.equal(hint.textContent,history.dataset.storyHelp);history.emit('pointerleave',{pointerType:'mouse'});assert.equal(hint.textContent,hide.dataset.storyHelp);hide.emit('blur');assert.equal(hint.hidden,true);
});
test('compact tools: short touch keeps a single normal action; holding reveals meaning and consumes only that click',()=>{
 const h=fixture(),skip=h.buttons[3];let actions=0;skip.addEventListener('click',()=>actions++);
 skip.emit('pointerenter',{pointerType:'touch'});assert.equal(h.hint.hidden,true);
 skip.emit('pointerdown',{pointerType:'touch',clientX:20,clientY:20});skip.emit('pointerup');skip.emit('click');assert.equal(actions,1);assert.equal(h.tasks.size,0);
 skip.emit('pointerdown',{pointerType:'touch',clientX:20,clientY:20});h.hold();assert.equal(h.hint.hidden,false);skip.emit('pointerup');assert.equal(skip.emit('click').defaultPrevented,true);assert.equal(actions,1);
 skip.emit('pointerdown',{pointerType:'touch',clientX:20,clientY:20});skip.emit('pointerup');skip.emit('click');assert.equal(actions,2);
});
test('compact tools: scrolling, cancellation and later keyboard activation never execute a held action accidentally',()=>{
 const h=fixture(),skip=h.buttons[3];let actions=0;skip.addEventListener('click',()=>actions++);
 skip.emit('pointerdown',{pointerType:'touch',clientX:20,clientY:20});skip.emit('pointermove',{clientX:20,clientY:45});h.hold();assert.equal(h.hint.hidden,true);assert.equal(h.tasks.size,0);
 skip.emit('pointerdown',{pointerType:'touch',clientX:20,clientY:20});h.hold();assert.equal(skip.emit('contextmenu').defaultPrevented,true);skip.emit('pointercancel');assert.equal(h.hint.hidden,true);
 skip.emit('pointerdown',{pointerType:'touch',clientX:20,clientY:20});h.hold();skip.emit('pointerup');const key=skip.emit('keydown',{key:'Enter'});assert.equal(key.defaultPrevented,false);skip.emit('click');assert.equal(actions,1);
});
test('compact tools: reset cancels delayed touch hints and hidden/inert/disabled UI cannot reveal one',()=>{
 const h=fixture(),button=h.buttons[0];button.emit('pointerdown',{pointerType:'touch',clientX:0,clientY:0});h.tools.reset();h.hold();assert.equal(h.hint.hidden,true);assert.equal(button.attributes['aria-describedby'],undefined);
 for(const [target,key]of [[h.body,'hidden'],[h.body,'inert'],[button,'disabled']]){target[key]=true;button.emit('focus');assert.equal(h.hint.hidden,true);target[key]=false;}
 button.emit('focus');h.tools.reset();assert.equal(h.hint.hidden,true);assert.equal(button.attributes['aria-describedby'],undefined);
});
test('compact tools: very long explanations remain literal text, without truncation or HTML interpretation',()=>{
 const h=fixture(),button=h.buttons[0],text='<img onerror="unsafe()">'+ '这是一段长说明，完整显示而不裁切。'.repeat(20);button.dataset.storyHelp=text;button.emit('focus');assert.equal(h.hint.textContent,text);assert.equal(h.hint.hidden,false);
});
test('compact tools: exact native buttons retain accessible names, state and keyboard order',()=>{
 const html=readFileSync(new URL('../public/campaigns-b/index.html',import.meta.url),'utf8'),tools=html.match(/<div class="dialog-tools story-reading-tools"[\s\S]+?(?=<\/div><button id="story-restore")/)[0];
 assert.deepEqual([...tools.matchAll(/<button id="([^"]+)"/g)].map(m=>m[1]),['story-history','story-hide','story-pause','story-skip','story-next']);
 for(const name of ['本段回顾','欣赏画面','返回地图','快进本段','继续'])assert.ok(tools.includes(`aria-label="${name}"`));
 assert.equal((tools.match(/<svg /g)||[]).length,5);assert.equal((tools.match(/focusable="false"/g)||[]).length,5);assert.doesNotMatch(tools,/tabindex=|title=/);assert.match(tools,/role="tooltip" hidden/);assert.match(tools,/aria-controls="story-history-panel" aria-expanded="false"/);assert.match(tools,/aria-pressed="false" aria-keyshortcuts="H"/);
 const css=readFileSync(new URL('../public/campaigns-b/styles.css',import.meta.url),'utf8'),compact=css.slice(css.indexOf('/* Compact GAL controls:'),css.indexOf('/* Exact B08/B12'));
 assert.match(compact,/grid-template-columns:minmax\(0,1fr\) auto auto/);assert.match(compact,/width:18px;height:18px/);assert.match(compact,/#story-copy\{min-height:0/);assert.doesNotMatch(compact,/min-height:[345]\.[47]em/);assert.match(compact,/@media\(any-pointer:coarse\)/);assert.match(compact,/width:44px;min-width:44px;height:44px;min-height:44px/);assert.match(compact,/story-tool-help\{grid-column:1\/-1;min-width:0;max-width:100%/);assert.match(compact,/white-space:normal;overflow-wrap:anywhere/);assert.doesNotMatch(compact,/text-overflow|line-clamp|position:absolute|position:fixed|overflow:hidden/);
});


test('compact tools: canceled and dragged touch gestures consume any trailing click; fresh taps and keys remain live',()=>{
 const h=fixture(),skip=h.buttons[3];let actions=0;skip.addEventListener('click',()=>actions++);
 for(const held of [false,true]){
  skip.emit('pointerdown',{pointerType:'touch',clientX:20,clientY:20});if(held)h.hold();
  skip.emit('pointercancel');assert.equal(skip.emit('click').defaultPrevented,true);assert.equal(actions,0);assert.equal(h.hint.hidden,true);
 }
 skip.emit('pointerdown',{pointerType:'touch',clientX:20,clientY:20});skip.emit('pointermove',{clientX:60,clientY:20});skip.emit('pointerup');
 assert.equal(skip.emit('click').defaultPrevented,true);assert.equal(actions,0);
 skip.emit('pointerdown',{pointerType:'touch',clientX:20,clientY:20});skip.emit('pointerup');skip.emit('click');assert.equal(actions,1);
 skip.emit('pointerdown',{pointerType:'touch',clientX:20,clientY:20});skip.emit('pointercancel');skip.emit('keydown',{key:'Enter'});skip.emit('click');assert.equal(actions,2);
});
test('compact tools: coarse and hoverless devices have an explicit long-press instruction, without title reliance',()=>{
 const html=readFileSync(new URL('../public/campaigns-b/index.html',import.meta.url),'utf8'),css=readFileSync(new URL('../public/campaigns-b/styles.css',import.meta.url),'utf8');
 assert.match(html,/<span class="story-touch-hint">长按图标查看说明<\/span>/);assert.match(css,/@media\(any-pointer:coarse\),\(hover:none\)/);assert.match(css,/story-tool-help:not\(\[hidden\]\)~\.story-touch-hint\{display:none\}/);
});


test('compact reader: nested Escape is scoped to an open modal, repeat-safe and leaves the next reading Escape available',()=>{
 const keys=['dialog','stage','body','historyButton','historyPanel','historyEntries','historyClose','hideButton','restoreButton','historyTitle'];
 const nodes=Object.fromEntries(keys.map(k=>[k,new Element(k)])),document=new Element('document');nodes.dialog.ownerDocument=document;nodes.dialog.open=true;nodes.historyEntries.replaceChildren=()=>{};
 for(const node of Object.values(nodes))node.focus=()=>{document.activeElement=node;};
 const reader=createForestGalReader(nodes);nodes.hideButton.onclick();assert.equal(reader.mode,'art');
 const first=document.emit('keydown',{key:'Escape',target:{tagName:'BODY'}});assert.equal(first.defaultPrevented,true);assert.equal(reader.mode,'reading');assert.equal(document.activeElement,nodes.hideButton);
 for(let i=0;i<3;i++)assert.equal(document.emit('keydown',{key:'Escape',repeat:true}).defaultPrevented,true);
 assert.equal(nodes.dialog.emit('cancel').stopped,true);document.emit('keyup',{key:'Escape'});
 assert.equal(document.emit('keydown',{key:'Escape'}).defaultPrevented,false);assert.equal(nodes.dialog.emit('cancel').stopped,false);
 nodes.hideButton.onclick();nodes.dialog.open=false;assert.equal(document.emit('keydown',{key:'Escape'}).defaultPrevented,false);assert.equal(reader.mode,'art');
 nodes.dialog.open=true;assert.equal(document.emit('keydown',{key:'Escape',ctrlKey:true}).defaultPrevented,false);assert.equal(reader.mode,'art');
 assert.equal(document.emit('keydown',{key:'Escape',repeat:true}).defaultPrevented,true);assert.equal(reader.mode,'art');
 document.emit('keydown',{key:'Escape'});reader.reset();assert.equal(document.emit('keydown',{key:'Escape'}).defaultPrevented,false);
});
