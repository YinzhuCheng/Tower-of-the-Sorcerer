// DOM event wiring smoke test only. This is not a visual/browser signoff.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../public/campaigns-b/index.html',import.meta.url),'utf8');
class Element{
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.events={};this.style={};this.open=false;this.hidden=false;this.disabled=false;this.classList={add:(...names)=>{this.classes??=new Set();names.forEach(name=>this.classes.add(name));}};}
 append(...children){this.children.push(...children);}replaceChildren(...children){this.children=[...children];}removeAttribute(name){delete this[name];}setAttribute(name,value){this[name]=value;}addEventListener(name,fn){this.events[name]=fn;}showModal(){this.open=true;}close(){this.open=false;}
}
function environment(storage){const nodes=new Map([...html.matchAll(/<([a-z-]+)[^>]*\bid="([^"]+)"[^>]*>/g)].map(([,tag,id])=>[id,new Element(tag)])),dirs=['up','down','left','right'].map(dir=>{const b=new Element('button');b.dataset.dir=dir;return b;}),closers=['plans','world-map','settings'].map(id=>{const b=new Element('button');b.dataset.close=id;return b;}),events={};return{nodes,dirs,document:{getElementById:id=>nodes.get(id),createElement:tag=>new Element(tag),createTextNode:text=>({textContent:text}),querySelector:selector=>selector==='dialog[open]'?[...nodes.values()].find(n=>n.tagName==='DIALOG'&&n.open)??null:null,querySelectorAll:selector=>selector==='[data-dir]'?dirs:selector==='[data-close]'?closers:[],addEventListener:(type,fn)=>{events[type]=fn;}},events,window:{localStorage:storage}};}

test('B real app startup, dialogs, movement, cancel, repeated confirmation and refresh wire safely',async()=>{
 const entries=new Map(),storage={getItem:key=>entries.get(key)??null,setItem:(key,value)=>entries.set(key,value),removeItem:key=>entries.delete(key)},env=environment(storage),get=id=>env.nodes.get(id);
 const original={window:globalThis.window,document:globalThis.document,confirm:globalThis.confirm,setTimeout:globalThis.setTimeout,clearTimeout:globalThis.clearTimeout};Object.assign(globalThis,{window:env.window,document:env.document,confirm:()=>true,setTimeout:()=>0,clearTimeout:()=>{}});
 try{
 const code=readFileSync(new URL('../public/campaigns-b/app.js',import.meta.url),'utf8').replaceAll("from '../src/",`from '${new URL('../src/',import.meta.url).href}`);
 await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
 const state=()=>env.window.__FOREST_PREVIEW__.getState(),key=()=>env.events.keydown({key:'ArrowRight',target:{tagName:'BODY'},preventDefault(){}});assert.equal(get('board').children.length,121);assert.equal(get('story').open,true);const initial=JSON.stringify(state());key();assert.equal(JSON.stringify(state()),initial);
 get('story-skip').onclick();get('story-skip').onclick();assert.equal(get('story').open,false);key();key();assert.equal(state().location.x,3);const battleRow=()=>get('actions').children.find(row=>row.dataset.entityId==='b01.timberPuppet'),request=()=>battleRow().children.at(-1).children.at(-1).onclick();
 request();assert.equal(get('confirmation').open,true);const before=JSON.stringify(state());key();assert.equal(JSON.stringify(state()),before);get('confirm-cancel').onclick();assert.equal(get('confirmation').open,false);assert.equal(JSON.stringify(state()),before);request();get('confirm-yes').onclick();const after=JSON.stringify(state());assert.notEqual(after,before);get('confirm-yes').onclick();assert.equal(JSON.stringify(state()),after);assert.equal(get('story').open,true);key();assert.equal(JSON.stringify(state()),after);
 const raw=JSON.parse([...entries].find(([key])=>key.endsWith(':auto'))[1]);assert.deepEqual(raw.state,state());assert.deepEqual(raw.presentation,env.window.__FOREST_PREVIEW__.getPresentation());assert.equal(raw.presentation.queue[0].sceneId,'b01_post');assert.equal(get('story-stage').dataset.backdropAssetId.startsWith('B_ENV_'),true);assert.ok(!get('story-stage').children.some(child=>child.tagName==='IMG'));
 get('story-pause').onclick();const planState=JSON.stringify(state());get('plan').onclick();assert.equal(get('plans').open,true);
 const allText=node=>[node.textContent??'',...(node.children??[]).map(allText)].join('\n'),plan=allText(get('plan-content'));
 assert.match(plan,/总共 8 份/);assert.match(plan,/共留 4 份/);assert.match(plan,/温室 2 份、老梨树 1 份、候车屋 2 份/);assert.match(plan,/07 \/ 16 \/ 21 \/ 24/);assert.match(plan,/两条路都要各自施工/);assert.match(plan,/以现在的装备会损失/);assert.doesNotMatch(plan,/请先完成：/);assert.equal(JSON.stringify(state()),planState);
 }finally{Object.assign(globalThis,original);}
});
