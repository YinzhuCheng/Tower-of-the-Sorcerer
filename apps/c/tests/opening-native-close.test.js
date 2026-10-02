import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {startOpeningPrelude} from '../src/opening/prelude.js';
import {documentMock} from './helpers/dom-mock.js';
const opening=JSON.parse(fs.readFileSync(new URL('../public/opening/opening.json',import.meta.url)));
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const read=async()=>({ok:true,json:async()=>opening});
function fixture(){
  const doc=documentMock(),dialog=doc.getElementById('opening-dialog'),root=doc.getElementById('opening-root');
  let closeCount=0,modalCount=0;
  dialog.showModal=()=>{assert.equal(dialog.open,false,'showModal is only used on a closed dialog');dialog.open=true;modalCount++;};
  dialog.close=()=>{if(!dialog.open)return;dialog.open=false;closeCount++;for(const fn of dialog.events.close??[])fn({type:'close'});};
  const click=text=>{const button=root.find(text);assert.ok(button,text);assert.equal(button.disabled,false);button.onclick();return button;};
  const escape=()=>{const event={key:'Escape',defaultPrevented:false,stopped:false,preventDefault(){this.defaultPrevented=true;},stopPropagation(){this.stopped=true;}};for(const fn of doc.events.keydown??[])fn(event);return event;};
  // Deliberately model an uncancelable native close. The old mock never did.
  const nativeForcedClose=()=>{for(const fn of dialog.events.cancel??[])fn({preventDefault(){}});dialog.close();};
  return {doc,dialog,root,click,escape,nativeForcedClose,closeCount:()=>closeCount,modalCount:()=>modalCount};
}
test('pending loading capture, uncancelable native close, and early review recovery cannot boot',async()=>{
  const h=fixture();let resolve,boot=0;
  const task=startOpeningPrelude({document:h.doc,fetch:()=>new Promise(r=>{resolve=r;})}).then(g=>{boot++;return g;});
  assert.equal(h.dialog.open,true);assert.equal(typeof h.doc.getElementById('opening-review').onclick,'function');
  for(let i=0;i<3;i++){const e=h.escape();assert.equal(e.defaultPrevented,true);assert.equal(e.stopped,true);h.nativeForcedClose();assert.equal(h.dialog.open,true);}
  h.dialog.open=false;h.doc.getElementById('opening-review').onclick();assert.equal(h.dialog.open,true);
  assert.equal(boot,0);resolve(await read());await tick();assert.ok(h.root.text.includes('1 / 52'));
  h.click('跳至结尾（不确认作业）');h.click('读完，进入实际码头');await task;assert.equal(boot,1);assert.equal(h.dialog.open,false);
});
test('ready, paused, and skipped pending states survive repeated native Escape without Finish',async()=>{
  const h=fixture();let boot=0;const task=startOpeningPrelude({document:h.doc,fetch:read}).then(g=>{boot++;return g;});await tick();
  for(let i=0;i<3;i++){h.escape();h.nativeForcedClose();assert.equal(h.dialog.open,true);assert.ok(h.root.find('继续阅读'));assert.equal(boot,0);}
  h.click('继续阅读');assert.ok(h.root.text.includes('1 / 52'));h.click('下一句');h.click('关闭阅读');assert.equal(h.dialog.open,true);h.escape();h.click('继续阅读');assert.ok(h.root.text.includes('2 / 52'));
  h.click('跳至结尾（不确认作业）');const detachedFinish=h.root.find('读完，进入实际码头');h.escape();h.nativeForcedClose();detachedFinish.onclick();await tick();assert.equal(boot,0);assert.ok(h.root.find('继续阅读'));
  h.click('继续阅读');assert.ok(h.root.text.includes('52 / 52'));const finish=h.click('读完，进入实际码头');finish.onclick();const gate=await task;assert.equal(boot,1);assert.equal(gate.blocked(),false);assert.equal(gate.replacesOriginalOpening(),true);assert.equal(h.dialog.open,false);
  const e=h.escape();assert.equal(e.defaultPrevented,false);assert.equal(e.stopped,false);assert.equal(h.dialog.open,false);
});
test('saved-game optional review keeps ordinary Escape dismissal and no startup guard',async()=>{
  const h=fixture(),gate=await startOpeningPrelude({document:h.doc,skip:true,fetch:read});
  assert.equal(h.modalCount(),0);assert.equal(gate.blocked(),false);assert.equal(gate.replacesOriginalOpening(),false);
  h.doc.getElementById('opening-review').onclick();assert.equal(gate.blocked(),true);assert.equal(h.escape().defaultPrevented,false);h.nativeForcedClose();assert.equal(h.dialog.open,false);assert.equal(gate.blocked(),false);assert.equal(gate.replacesOriginalOpening(),false);
  h.doc.getElementById('opening-review').onclick();h.click('下一句');h.dialog.close();assert.equal(gate.blocked(),false);assert.equal(h.dialog.open,false);
  h.doc.getElementById('opening-review').onclick();for(const fn of h.dialog.events.close)fn({type:'close'});assert.equal(h.dialog.open,true);assert.equal(gate.blocked(),true,'stale close cannot pause a newly reopened optional review');
  h.click('关闭阅读');assert.equal(h.dialog.open,false);assert.equal(gate.blocked(),false);
});
for(const failure of ['network','http','json','identity'])test(`${failure} failure remains fail-closed fresh and nonblocking for saves`,async()=>{
  const fetch=async()=>{if(failure==='network')throw Error('offline');return {ok:failure!=='http',status:503,json:async()=>{if(failure==='json')throw SyntaxError('invalid JSON');return {id:'bad'};}};};
  const fresh=fixture();await assert.rejects(startOpeningPrelude({document:fresh.doc,fetch}));fresh.escape();fresh.nativeForcedClose();assert.equal(fresh.dialog.open,true);fresh.dialog.open=false;fresh.doc.getElementById('opening-review').onclick();assert.equal(fresh.dialog.open,true);
  const saved=fixture(),gate=await startOpeningPrelude({document:saved.doc,skip:true,fetch});assert.equal(gate.blocked(),false);assert.equal(gate.snapshot().unavailable,true);assert.equal(saved.dialog.open,false);assert.equal(saved.doc.getElementById('opening-review').disabled,true);assert.equal(saved.escape().defaultPrevented,false);
});
