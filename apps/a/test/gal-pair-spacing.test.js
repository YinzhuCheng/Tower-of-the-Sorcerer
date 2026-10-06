import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const css = await readFile(new URL('../ui-v10-cinematics.css', import.meta.url), 'utf8');
const main = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
const marker = '/* Paired standing art:';
const patch = css.slice(css.indexOf(marker));
const selectors = [...patch.matchAll(/\.gal-root \.gal-stage:has\(> \.gal-actor-left:not\(\[hidden\]\)\):has\(> \.gal-actor-right:not\(\[hidden\]\)\) > \.gal-actor-(left|right)\{(left|right):(-?[\d.]+)%\}/g)];

test('only paired slots receive horizontal offsets, with both existing breakpoints covered', () => {
  assert.equal(selectors.length, 4);
  assert.deepEqual(selectors.map((m) => [m[1], m[2], Number(m[3])]), [
    ['left', 'left', 15.83], ['right', 'right', 15.83],
    ['left', 'left', -7.76], ['right', 'right', -7.76]
  ]);
  assert.match(patch, /@media \(max-width:700px\), \(max-aspect-ratio:4\/5\)/);
  assert.doesNotMatch(patch, /[{;]\s*(?:width|height|transform|scale|opacity|z-index|object-fit)\s*:/);
  // Empty and explicitly hidden slots must not trigger paired placement.
  for (const left of ['missing', 'hidden', 'visible']) {
    for (const right of ['missing', 'hidden', 'visible']) {
      const children = [
        ...(left === 'missing' ? [] : [{ side: 'left', hidden: left === 'hidden' }]),
        ...(right === 'missing' ? [] : [{ side: 'right', hidden: right === 'hidden' }])
      ];
      const matchesGuard = (side) => children.some((child) => child.side === side && !child.hidden);
      assert.equal(matchesGuard('left') && matchesGuard('right'), left === 'visible' && right === 'visible');
    }
  }
});

test('paired actor centers move halfway toward the original midpoint without resizing', () => {
  const base = css.slice(0, css.indexOf(marker));
  const desktopWidth = Number(base.match(/\.gal-root \.gal-actor\{[^}]*width:([\d.]+)%/)[1]);
  const desktopInset = Number(base.match(/\.gal-root \.gal-actor-left\{left:([\d.]+)%/)[1]);
  const mobileWidth = Number(base.match(/\.gal-root \.gal-actor\{bottom:0;width:([\d.]+)%/)[1]);
  const mobileInset = Number(base.match(/\.gal-root \.gal-actor-left\{left:(-[\d.]+)%/)[1]);
  for (const [width, oldInset, nextInset] of [
    [desktopWidth, desktopInset, Number(selectors[0][3])],
    [mobileWidth, mobileInset, Number(selectors[2][3])]
  ]) {
    const oldLeft = oldInset + width / 2;
    const nextLeft = nextInset + width / 2;
    assert.ok(Math.abs(nextLeft - (oldLeft + 50) / 2) < 1e-9);
    assert.ok(Math.abs((100 - 2 * nextLeft) / (100 - 2 * oldLeft) - .5) < 1e-9);
    assert.equal(nextLeft + (100 - nextLeft), 100);
  }
});

test('the current A stage has two persistent slots, not a synthetic three-person arrangement', () => {
  assert.match(main, /const stage = \{ left: \{ id: 'hero', expression: null \}, right: null \}/);
  assert.match(main, /galActorHtml\('left', stage.left/);
  assert.match(main, /galActorHtml\('right', stage.right/);
  assert.doesNotMatch(main, /galActorHtml\('(?:center|middle|third)'/);
});
