// Executes the real C app render against a small DOM double. Not visual/browser QA.
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync}from'node:fs';
import {createVoyageCampaign}from'../src/campaigns/c/content.js';import{createSaveRepository}from'../src/core/campaign.js';
const html=readFileSync(new URL('../public/campaigns/index.html',import.meta.url),'utf8');
class Element{constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.events={};this.style={};this.open=false;this.hidden=false;this.disabled=false;this.classes=new Set();this.classList={add:(...names)=>names.forEach(n=>this.classes.add(n))};}append(...nodes){this.children.push(...nodes);}replaceChildren(...nodes){this.children=[...nodes];}setAttribute(k,v){this[k]=v;}addEventListener(k,v){this.events[k]=v;}showModal(){this.open=true;}close(){this.open=false;}}
function env(){const nodes=new Map([...html.matchAll(/<([a-z-]+)[^>]*\bid="([^"]+)"[^>]*>/g)].map(([,tag,id])=>[id,new Element(tag)]));return{nodes,window:{},document:{getElementById:id=>nodes.get(id),createElement:tag=>new Element(tag),querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){}}};}
test('C actual map renderer hides other-berth operations while current task glyphs remain visible',async()=>{
 const runtime=createVoyageCampaign(),source=readFileSync(new URL('../public/campaigns/app.js',import.meta.url),'utf8').replaceAll("from '../src/",`from '${new URL('../src/',import.meta.url).href}`),keys=['window','document','localStorage','confirm','setTimeout','clearTimeout'];
 const original=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));
 try{for(let n=1;n<=5;n++){
  const e=env(),entries=new Map(),storage={getItem:k=>entries.get(k)??null,setItem:(k,v)=>entries.set(k,v),removeItem:k=>entries.delete(k)},state=runtime.initialState();state.location={regionId:'C-D01',x:7,y:7};state.boat.dock=`C-M0${n}`;
  createSaveRepository(storage,runtime).save('auto',state,{seenIds:[],queue:[],turnIndex:0});Object.assign(globalThis,{window:e.window,document:e.document,localStorage:storage,confirm:()=>true,setTimeout:()=>0,clearTimeout:()=>{}});
  await import(`data:text/javascript;base64,${Buffer.from(source+`\n// visibility-fixture-${n}`).toString('base64')}`);
  const board=e.nodes.get('board').children,cell=(x,y)=>board[y*11+x];assert.equal(board.length,121);
  assert.equal(cell(4,3).classes.has('entity'),n===3,`M0${n} winch visibility`);
  assert.equal(cell(8,2).classes.has('entity'),n===5,`M0${n} davit work visibility`);
  assert.equal(cell(7,9).classes.has('entity'),n>=2,`M0${n} mooring visibility`);
  assert.equal(cell(8,7).classes.has('entity'),true,'gangway available at every berth');
  assert.deepEqual(e.window.__CAMPAIGN_PREVIEW__.getState(),state,'render/story presentation does not mutate rules');
 }}finally{for(const k of keys)if(original[k]===undefined)delete globalThis[k];else globalThis[k]=original[k];}
});
