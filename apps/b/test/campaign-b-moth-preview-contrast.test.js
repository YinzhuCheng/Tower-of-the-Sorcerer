import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const css=await readFile(new URL('../public/campaigns-b/moth-preview/src/portrait-preview.css',import.meta.url),'utf8');
const rules=[...css.replace(/\/\*[\s\S]*?\*\//g,'').matchAll(/([^{}]+)\{([^{}]*)\}/g)];
function declarations(selector,{responsive=false}={}){
 const matches=rules.filter(([,key])=>key.trim()===selector);
 if(responsive)assert.ok(matches.length>0,`Local rule for ${selector}`);
 else assert.equal(matches.length,1,`Exactly one local rule for ${selector}`);
 return Object.fromEntries(matches.flatMap(match=>match[2].split(';').filter(Boolean).map(item=>{const at=item.indexOf(':');return[item.slice(0,at).trim(),item.slice(at+1).trim()];})));
}
function luminance(hex){
 assert.match(hex,/^#[0-9a-f]{6}$/i,'Palette uses explicit opaque colors');
 const rgb=[1,3,5].map(at=>parseInt(hex.slice(at,at+2),16)/255).map(n=>n<=0.04045?n/12.92:((n+0.055)/1.055)**2.4);
 return rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722;
}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);}
const baseSelector='.moth-preview .preview-art-tools button';
const hoverSelector=baseSelector+':not([aria-pressed="true"]):hover:not(:disabled)';
const selectedSelector='.moth-preview .preview-expression-controls button[aria-pressed="true"]';

test('inspector close and inactive expression labels have their own contrasting palette',()=>{
 const base=declarations(baseSelector);
 assert.equal(base.color,'#243b31');
 assert.equal(base.background,'#fcfaee');
 assert.ok(contrast(base.color,base.background)>=4.5);
 assert.equal(base['min-height'],'38px');
 assert.equal(base['font-size'],'12px');
 // The original inherited dark fill fails dramatically; this is the regression.
 assert.ok(contrast(base.color,'#273e34')<1.1);
});

test('hover remains readable and does not erase the selected-expression state',()=>{
 const base=declarations(baseSelector),hover=declarations(hoverSelector),selected=declarations(selectedSelector);
 assert.ok(contrast(base.color,hover.background)>=4.5);
 assert.ok(contrast(base.color,selected.background)>=4.5);
 assert.notEqual(base.background,selected.background);
 assert.notEqual(hover.background,selected.background);
 assert.match(hoverSelector,/:not\(\[aria-pressed="true"\]\)/);
});

test('keyboard focus is visible against the light inspector and every button fill',()=>{
 const focus=declarations(baseSelector+':focus-visible');
 const panel=declarations('.moth-preview .preview-art-tools',{responsive:true});
 const fills=[panel.background,declarations(baseSelector).background,declarations(hoverSelector).background,declarations(selectedSelector).background];
 for(const fill of fills)assert.ok(contrast(focus['outline-color'],fill)>=3,`Focus contrast for ${fill}`);
});

test('color overrides remain scoped to the readonly moth inspector',()=>{
 for(const selector of [baseSelector,hoverSelector,baseSelector+':focus-visible',selectedSelector]){
  assert.ok(selector.startsWith('.moth-preview '));
  assert.ok(!/[#.]story-|:root|body\b/.test(selector));
 }
 assert.doesNotMatch(css,/!important[^}]*color|color[^}]*!important/);
});
