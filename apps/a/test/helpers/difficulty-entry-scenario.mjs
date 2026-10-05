// Small event-capable DOM double, not browser or visual acceptance.
import assert from 'node:assert/strict';
import {assemble30} from './assemble-thirty.mjs';
import {profileIdentity,getDifficultySession} from '../../src/game/difficulty-session.js';
import {difficultyStorageKeys} from '../../src/game/difficulty-storage.js';
import {chooseDifficulty} from '../../src/game/difficulty-entry.js';
const data=assemble30();
const {createInitialState}=await import('../../src/game/engine.js');
const stateFor=id=>({...createInitialState(),profileIdentity:profileIdentity(id)});
const scenario=process.argv[2],map=new Map(),keys=difficultyStorageKeys('forgiving-r1');
const raw=' \n'+JSON.stringify(stateFor('forgiving-r1'))+'\n';
if(scenario!=='empty')map.set(keys.auto,scenario==='legacy-corrupt'?'{broken-old':raw);
if(['cancel-new','cancel-pending'].includes(scenario))map.set(difficultyStorageKeys('forgiving').auto,JSON.stringify(stateFor('forgiving')));
const storage={get length(){return map.size;},key:i=>[...map.keys()][i]??null,getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v))};
let release;const gate=new Promise(r=>release=r);
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{locks:{request:(n,o,fn)=>scenario==='cancel-pending'?gate.then(fn):fn()}}});
let section=null,download=null,blob=null;
const makeElement=tag=>({tag,listeners:{},innerHTML:'',dataset:{},setAttribute(){},addEventListener(event,fn){this.listeners[event]=fn;},querySelector(){return {focus(){}};},remove(){this.removed=true;},click(){download={name:this.download,href:this.href};}});
const document={createElement:makeElement,documentElement:{dataset:{},classList:{add(){},remove(){}}},body:{append(el){if(el.tag==='section')section=el;}}};
class FakeURL extends URL {static createObjectURL(value){blob=value;return 'blob:test';}static revokeObjectURL(){}}
const href='https://tower.example/a/'+(scenario==='legacy-url'?'?difficulty=forgiving-r1':scenario==='cancel-new'||scenario==='cancel-pending'?'':'?difficulty=forgiving');
const window={location:{href},history:{replaceState(a,b,url){window.location.href=url.href;}},URL:FakeURL,Blob,setTimeout:fn=>fn(),addEventListener(){}};
const before=[...map];const pending=chooseDifficulty({document,window,storage});
const click=(action,id,index)=>section.listeners.click({target:{closest:()=>({dataset:{action,id,index},disabled:false})}});
if(scenario==='legacy-url'){
 const session=await pending;assert.equal(section,null);assert.equal(session.profile.id,'forgiving-r1');assert.equal(session.serialized,raw);assert.deepEqual([...map],before);
}else{
 assert.equal((section.innerHTML.match(/<section class="difficulty-option/g)??[]).length,3);assert.equal(getDifficultySession(),null);assert.deepEqual([...map],before);
 if(scenario==='empty'){assert.ok(!section.innerHTML.includes('继续旧版宽容 r1'));}
 if(scenario==='legacy-continue'){
  assert.match(section.innerHTML,/检测到旧版宽容 r1/);await click('continue','forgiving-r1');const session=await pending;assert.equal(session.profile.label,'宽容（旧版 r1）');assert.equal(session.serialized,raw);assert.deepEqual([...map],before);
 }
 if(scenario==='legacy-export'||scenario==='legacy-corrupt'){
  await click('export-legacy',undefined,'0');assert.equal(await blob.text(),scenario==='legacy-corrupt'?'{broken-old':raw);assert.match(download.name,/旧版宽容-r1/);assert.equal(getDifficultySession(),null);assert.deepEqual([...map],before);
  if(scenario==='legacy-corrupt'){assert.match(section.innerHTML,/有效进度仅只读继续/);assert.match(section.innerHTML,/data-id="forgiving-r1" disabled/);await click('new','forgiving');assert.equal((await pending).profile.id,'forgiving');assert.equal(map.get(keys.auto),'{broken-old');}
 }
 if(scenario==='current-new'){
  await click('new','forgiving');const session=await pending;assert.equal(session.identity.candidateVersion,'tower-forgiving-r2');assert.deepEqual([...map],before);
  session.persistence.write('auto',stateFor('forgiving'));assert.equal(map.get(keys.auto),raw);
 }
 if(scenario==='cancel-new'||scenario==='cancel-pending'){
  await click('new','forgiving');assert.match(section.innerHTML,/备份并开始新游戏/);
  if(scenario==='cancel-new'){await click('cancel');assert.equal(getDifficultySession(),null);assert.deepEqual([...map],before);}
  else{const confirmed=click('confirm','forgiving');await click('cancel');release();await confirmed;assert.equal(getDifficultySession(),null);assert.deepEqual([...map],before);}
 }
}
console.log(JSON.stringify({scenario,passed:true,browserExecuted:false}));
