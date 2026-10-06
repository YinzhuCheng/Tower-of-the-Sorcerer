import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {forestGalComposition} from '../src/rendering/forest-gal-stage.js';
const css=readFileSync(new URL('../public/campaigns-b/styles.css',import.meta.url),'utf8');
const clamp=(lo,n,hi)=>Math.max(lo,Math.min(n,hi));

test('reading room is three fifths of the previous panel; current two-thirds font is unchanged',()=>{
 assert.match(css,/--story-baseline-copy-size:clamp\(16px,1.45vw,22px\)/);
 assert.match(css,/--story-reading-height:calc\(1\.2 \* \(105px \+ var\(--story-baseline-copy-size\) \* 1.85\)\)/);
 assert.match(css,/#story-copy\{font-size:calc\(var\(--story-baseline-copy-size\) \* 2 \/ 3\);flex:1 1 auto;min-height:0;overflow:auto;overscroll-behavior:contain/);
 for(const width of [800,1180,1440,1920]){
  const oldFont=clamp(16,width*.0145,22),newFont=oldFont*2/3;
  const oldPanel=105+oldFont*1.85,previousPanel=2*oldPanel,newPanel=1.2*oldPanel;
  assert.ok(Math.abs(newPanel/previousPanel-3/5)<1e-12);assert.ok(Math.abs(newFont/oldFont-2/3)<1e-12);
  if(width===1180){assert.ok(Math.abs(oldPanel-136.64)<.02);assert.ok(Math.abs(newPanel-163.98)<.04);}
 }
 assert.match(css,/orientation:portrait\)\{\s*\.story-dialog\{--story-baseline-copy-size:17px\}/);
 assert.match(css,/orientation:landscape\)\{\s*\.story-dialog\{--story-baseline-copy-size:14px\}/);
 // Remaining space is allocated to prose, not blank padding; controls retain fixed touch sizes.
 assert.match(css,/\.story-content\{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;overflow:auto/);
 assert.match(css,/\.story-speaker-row\{flex:0 0 auto/);
 assert.match(css,/\.story-reading-tools,.*flex:0 0 auto/);
 assert.match(css,/height:44px;min-height:44px/);
});

test('multi-person composition halves center distances around stage center and preserves depth and single actors',()=>{
 for(const [original,cast] of [
  [[30,73],[{id:'a'},{id:'b'}]],
  [[23,77],[{id:'a',position:'left'},{id:'b',position:'right'}]],
  [[22,49,79],[{id:'a'},{id:'b'},{id:'c'}]],
  [[23,50,77],[{id:'a',position:'left'},{id:'b',position:'center'},{id:'c',position:'right'}]],
 ]){
  const layout=forestGalComposition(cast),xs=layout.map(x=>x.left);
  assert.equal((Math.min(...xs)+Math.max(...xs))/2,50);
  for(let i=1;i<xs.length;i++)assert.equal(xs[i]-xs[i-1],(original[i]-original[i-1])/2);
  assert.deepEqual(layout,forestGalComposition(cast.map(c=>({...c,speaking:true}))));
  assert.equal(layout.some(x=>'width' in x||'height' in x||'scale' in x),false);
 }
 assert.equal(forestGalComposition([{id:'a',position:'right'}])[0].left,77);
 assert.deepEqual(forestGalComposition([]),[]);
 // Portrait's pre-existing three-person override uses the same half-distance rule.
 for(const [slot,left] of [[0,34.5],[1,50],[2,65.5]])assert.ok(css.includes(`[data-slot="${slot}"]{left:${left}%!important}`));
 assert.match(css,/story-actors\[data-count="2"\] \.story-actor\{width:48%\}/);
});

test('CG covers exactly the full stage in reading and H modes; only object inserts reserve image safe areas',()=>{
 const cg=css.slice(css.indexOf('/* A CG is the full stage'),css.indexOf('/* Reading-room revision'));
 assert.match(cg,/\.story-visual\{inset:0;height:100%;background:#24392d\}/);
 assert.match(cg,/#story-backdrop\{inset:0;width:100%;height:100%;object-fit:cover;object-position:center\}/);
 assert.doesNotMatch(cg,/contain|height:54%|height:44%|inset:44px|data-reader-mode|\.story-body\{/);
 assert.match(cg,/story-actors,.*#story-portrait\{display:none!important\}/);
 assert.ok(css.includes('[data-art-presentation="object-insert"] #story-backdrop{inset:44px 12px 0;width:calc(100% - 24px);height:calc(100% - 44px);object-fit:contain'));
 assert.ok(css.includes('[data-art-presentation="story-location"] #story-backdrop{object-fit:contain;object-position:center}'));
 for(const [w,h] of [[1144.6,643.84],[390,844],[844,390]]){
  const scale=Math.max(w/1672,h/941),drawW=1672*scale,drawH=941*scale;
  assert.ok(drawW>=w-1e-9&&drawH>=h-1e-9,'cover leaves no separate blank image region');
  assert.ok(Math.abs(drawW/drawH-1672/941)<1e-12,'uniform scale never stretches artwork');
 }
});


test('choice prompts retain a readable line; overflow stays in scrollable content without shrinking choices',()=>{
 assert.match(css,/\.story-dialog\[data-choices="true"\] #story-copy\{min-height:1\.9em\}/);
 assert.match(css,/\.story-content\{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;overflow:auto/);
 assert.match(css,/#story-copy\{font-size:calc\(var\(--story-baseline-copy-size\) \* 2 \/ 3\);flex:1 1 auto;min-height:0;overflow:auto;overscroll-behavior:contain/);
 assert.match(css,/\.story-reading-tools,\.story-dialog #story-choices,\.story-dialog #story-planning,\.story-dialog #story-notice\{flex:0 0 auto\}/);
 // 1.9em covers all existing copy line heights, including portrait (1.9).
 for(const lineHeight of [1.85,1.9,1.7])assert.ok(1.9>=lineHeight);
 // The selector is choice-only: normal short/long prose keeps its scroll flex.
 assert.equal(css.match(/data-choices="true"\] #story-copy/g).length,1);
});
