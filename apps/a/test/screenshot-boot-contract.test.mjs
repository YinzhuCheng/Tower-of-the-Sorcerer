import test from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { captureBootState, captureBootExpression, SKIP_OPENING_EXPRESSION } from '../scripts/screenshot-boot-contract.mjs';
function fixture(patch = {}) {
  let clicks = 0;
  const nodes = {
    '#game-container canvas': { width: 638, height: 638 },
    '#gal-root': { classList: { contains: () => true } },
    '#gal-root [data-gal-control="skip"]': { disabled: false, click: () => clicks++ },
    '#loading-note': { classList: { contains: () => true }, textContent: '' },
    '#app-shell': { inert: false },
    ...patch
  };
  return { document: { querySelector: key => nodes[key] }, localStorage: { getItem: key => key === 'auto' ? JSON.stringify({floorStates:Array(30).fill({map:[]})}) : null }, clicks: () => clicks };
}
test('ready requires actual canvas, valid saved campaign, assets and active shell', () => {
  const f=fixture(); assert.equal(captureBootState(f.document,f.localStorage,'auto').ready,true);
  assert.equal(runInNewContext(captureBootExpression('auto'),f).ready,true);
});
test('opening has no canvas: skip real control once, never fake ready', () => {
  const f=fixture({'#game-container canvas':null,'#gal-root':{classList:{contains:()=>false}},'#app-shell':{inert:true}});
  const b=captureBootState(f.document,f.localStorage,'auto'); assert.equal(b.ready,false);assert.equal(b.openingCanSkip,true);
  assert.equal(runInNewContext(SKIP_OPENING_EXPRESSION,f),true);assert.equal(f.clicks(),1);
  assert.equal(captureBootState(f.document,f.localStorage,'auto').ready,false);
});
for (const [label,patch] of [
  ['zero-sized canvas',{'#game-container canvas':{width:0,height:638}}],
  ['missing canvas',{'#game-container canvas':null}],
  ['assets still loading',{'#loading-note':{classList:{contains:()=>false},textContent:'loading'}}],
  ['visible GAL',{'#gal-root':{classList:{contains:()=>false}}}],
  ['inert shell',{'#app-shell':{inert:true}}],
]) test(`reject ${label}`,()=>{const f=fixture(patch);assert.equal(captureBootState(f.document,f.localStorage,'auto').ready,false)});
test('malformed, missing and incomplete saves fail without writing',()=>{
  for(const value of [null,'{bad','{}',JSON.stringify({floorStates:[]})]) {const f=fixture();f.localStorage.getItem=()=>value;assert.equal(captureBootState(f.document,f.localStorage,'auto').ready,false)}
});
test('closed/disabled/missing skip is never clicked',()=>{
  for(const patch of [{},{'#gal-root':{classList:{contains:()=>false}},'#gal-root [data-gal-control="skip"]':null},{'#gal-root':{classList:{contains:()=>false}},'#gal-root [data-gal-control="skip"]':{disabled:true,click:()=>{throw Error('unexpected')}}}]) {
    const f=fixture(patch);assert.equal(runInNewContext(SKIP_OPENING_EXPRESSION,f),false);assert.equal(f.clicks(),0);
  }
});
test('capture orchestration releases GAL before renderer wait and never CSS-hides it',async()=>{
  const {readFile}=await import('node:fs/promises');
  const s=await readFile(new URL('../scripts/capture-demo-10f-screenshots.mjs',import.meta.url),'utf8');
  assert.ok(s.indexOf('initialBoot.openingCanSkip')<s.indexOf('The tactical map did not become ready'));
  assert.ok(s.includes('SKIP_OPENING_EXPRESSION'));
  assert.equal(s.includes("classList.add('hidden')"),false);
  assert.ok(s.includes('boot-diagnostic.json'));
});
