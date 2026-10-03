import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chooseViewportLayout} from '../src/rendering/c-viewport-layout.js';

// Source and arithmetic contracts, not real-browser layout or glyph-raster evidence.
const css=await readFile(new URL('../public/campaigns/styles.css',import.meta.url),'utf8');
const entry=await readFile(new URL('../public/campaigns/app.js',import.meta.url),'utf8');
const fix=css.slice(css.indexOf('/* Equal fixed tracks'));
const rule=selector=>{
 const escaped=selector.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const match=fix.match(new RegExp(`${escaped}\\{([^}]+)\\}`));
 assert.ok(match,`Missing fixed-grid rule: ${selector}`);
 return Object.fromEntries(match[1].split(';').filter(Boolean).map(d=>{const i=d.indexOf(':');return[d.slice(0,i).trim(),d.slice(i+1).trim()];}));
};
const dimensions=mapSize=>{
 const count=11,border=1,padding=4,gap=2;
 const cell=(mapSize-2*border-2*padding-(count-1)*gap)/count;
 return {cell,lastBottom:border+padding+count*cell+(count-1)*gap,contentBottom:mapSize-border-padding};
};

test('fallback declares exactly eleven constrained tracks in both dimensions',()=>{
 const board=rule('#board');
 assert.equal(board['grid-template-columns'],'repeat(11,minmax(0,1fr))');
 assert.equal(board['grid-template-rows'],'repeat(11,minmax(0,1fr))');
 assert.equal(board['--fallback-cell-size'],'calc((var(--measured-map-size,440px) - 30px) / 11)');
 // If original border/padding/gap values change, update the glyph budget with them.
 assert.match(css,/#board\{[^}]*gap:2px;padding:4px;[^}]*border:1px solid/);
 assert.match(entry,/for\(let y=0;y<11;y\+\+\)for\(let x=0;x<11;x\+\+\)/);
});

test('tile intrinsic size and inherited line-height cannot inflate or overlap tracks',()=>{
 const tile=rule('#board .tile');
 assert.equal(tile['min-height'],'0');
 assert.equal(tile['aspect-ratio'],'auto');
 assert.equal(tile['line-height'],'1');
 assert.equal(tile.overflow,'hidden');
 assert.match(css,/\.tile\{[^}]*min-width:0;/);
});

test('352px board from the observed 1188x761 failure keeps the final row inside',()=>{
 const d=dimensions(352);
 assert.ok(Math.abs(d.cell-29.2727272727)<1e-8);
 assert.equal(d.lastBottom,347);
 assert.equal(d.lastBottom,d.contentBottom);
 // Earlier glyph line boxes were 38.75/44.94px. Fixed tracks must ignore both.
 for(const intrinsic of [38.75,44.9375,100])assert.ok(d.cell<intrinsic);
});

test('modeled desktop and 320-1000px narrow layouts retain all eleven square rows',()=>{
 const sample={viewportHeight:761,mainTop:88,mainPaddingY:14,sectionChromeY:26,otherHeight:281,innerWidth:715};
 for(const viewportWidth of [320,360,390,768,820,1000,1188,1440]){
  const layout=chooseViewportLayout({...sample,viewportWidth,innerWidth:viewportWidth<=1000?viewportWidth-50:715});
  const d=dimensions(layout.mapSize);
  assert.ok(d.cell>0);
  assert.ok(Math.abs(d.lastBottom-d.contentBottom)<1e-8);
  assert.ok(d.lastBottom<layout.mapSize);
  // Nominal single-character line boxes and padded ballast text fit the cell.
  const normal=Math.min(viewportWidth<=820?22:Math.min(25,Math.max(16,viewportWidth*.024)),d.cell),hero=Math.min(29,d.cell),ballast=Math.min(16,d.cell*.5);
  assert.ok(normal<=d.cell&&hero<=d.cell);
  assert.ok(ballast+8<=d.cell);
  const slotLabel=Math.min(8,d.cell/3),winch=Math.min(viewportWidth<=820?22:25,d.cell-3);
  assert.ok(slotLabel*3<=d.cell+1e-8&&slotLabel<=8);
  assert.ok(winch+3<=d.cell);
  if(viewportWidth<=1000)assert.ok(layout.mapSize<=viewportWidth-50);
 }
});

test('glyph bounds are scoped to fallback and leave continuous transparent controls intact',()=>{
 const fallback='#board:not([data-renderer="continuous"])';
 assert.equal(rule(`${fallback} .tile`)['font-size'],'min(clamp(16px,2.4vw,25px),var(--fallback-glyph-size))');
 assert.equal(rule(`${fallback} .tile.hero`)['font-size'],'min(29px,var(--fallback-glyph-size))');
 assert.equal(rule(`${fallback} .tile.balance-slot`)['font-size'],'min(16px,calc(var(--fallback-cell-size) * .5))');
 assert.equal(rule(`${fallback} .tile:not(.hero):not(.balance-slot)`)['font-size'],'min(22px,var(--fallback-glyph-size))');
 assert.match(css,/#board\[data-renderer="continuous"\]\{gap:0;padding:0;border:0;/);
 assert.match(css,/#board\[data-renderer="continuous"\] \.tile\{[^}]*font-size:0;/);
 assert.match(css,/\.three-active #board\{[^}]*width:1px!important;height:1px!important;/);
});

// These are precautionary legacy-fallback bounds, not reproduced browser defects.
test('narrow fallback labels and winch borders fit the fixed cell budget',()=>{
 const fallback='#board:not([data-renderer="continuous"])';
 assert.equal(rule(`${fallback} .tile`)['--fallback-glyph-size'],'var(--fallback-cell-size)');
 const winch=rule(`${fallback} .tile.winch-body,${fallback} .tile.winch-handle`);
 assert.equal(winch['--fallback-glyph-size'],'calc(var(--fallback-cell-size) - 3px)');
 const label=rule(`${fallback} .tile.balance-slot small`);
 assert.equal(label['font-size'],'min(8px,calc(var(--fallback-cell-size) / 3))');
 assert.equal(label['white-space'],'nowrap');
 assert.equal(label['line-height'],'1');
});
