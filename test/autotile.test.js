import test from 'node:test';
import assert from 'node:assert/strict';
import { selectWallVisual } from '../src/game/autotile.js';

test('straight walls choose continuous horizontal/vertical pieces', () => {
  assert.equal(selectWallVisual(10).asset, 'wall-horizontal');
  assert.equal(selectWallVisual(5).asset, 'wall-vertical');
});

test('dead ends use terminal caps with directional rotation', () => {
  assert.equal(selectWallVisual(8).asset, 'wall-end-cap');
  assert.equal(selectWallVisual(8).rotation, 0);
  assert.equal(selectWallVisual(2).rotation, Math.PI);
  assert.equal(selectWallVisual(1).rotation, Math.PI / 2);
  assert.equal(selectWallVisual(4).rotation, -Math.PI / 2);
});

test('bends are welded by a decorative pillar instead of a square tile frame', () => {
  for (const mask of [3, 6, 9, 12]) assert.equal(selectWallVisual(mask).asset, 'wall-pillar');
});

test('T junctions rotate from the south-facing canonical piece', () => {
  assert.equal(selectWallVisual(14).asset, 'wall-t-junction');
  assert.equal(selectWallVisual(14).rotation, 0);
  assert.equal(selectWallVisual(11).rotation, Math.PI);
  assert.equal(selectWallVisual(7).rotation, Math.PI / 2);
  assert.equal(selectWallVisual(13).rotation, -Math.PI / 2);
});

test('four-way and isolated wall nodes remain solid magical masonry', () => {
  assert.equal(selectWallVisual(15).asset, 'wall-body');
  assert.equal(selectWallVisual(0).asset, 'wall-pillar');
});
