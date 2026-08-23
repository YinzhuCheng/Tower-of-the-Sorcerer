import { TILE_SIZE } from './data.js';
import { getMapAsset } from './map-assets.js';

const WALL_BITS = Object.freeze({
  north: 1,
  east: 2,
  south: 4,
  west: 8
});

function countBits(mask) {
  let value = mask & 15;
  let count = 0;
  while (value) {
    count += value & 1;
    value >>= 1;
  }
  return count;
}

function wallExposures(mask) {
  return {
    north: (mask & WALL_BITS.north) === 0,
    east: (mask & WALL_BITS.east) === 0,
    south: (mask & WALL_BITS.south) === 0,
    west: (mask & WALL_BITS.west) === 0
  };
}

function wallNodeVisual(mask) {
  const count = countBits(mask);

  // Long runs remain continuous structure; generated art only decorates nodes.
  if (mask === 10 || mask === 5 || count === 4) return null;

  if (count === 0 || count === 1) {
    return { asset: 'wall-end-pillar-v6', rotation: 0, scale: 0.9, alpha: 0.82 };
  }

  if (count === 2) {
    const rotations = { 3: Math.PI, 6: -Math.PI / 2, 12: 0, 9: Math.PI / 2 };
    return { asset: 'wall-outer-corner-v6', rotation: rotations[mask] ?? 0, scale: 1.03, alpha: 0.78 };
  }

  if (count === 3) {
    const rotations = { 14: 0, 11: Math.PI, 7: Math.PI / 2, 13: -Math.PI / 2 };
    return { asset: 'wall-inner-corner-v6', rotation: rotations[mask] ?? 0, scale: 0.98, alpha: 0.67 };
  }

  return null;
}

function drawMaterialEdge(scene, side, px, py) {
  const horizontal = side === 'north' || side === 'south';
  const asset = horizontal ? 'wall-edge-horizontal-v6' : 'wall-edge-vertical-v6';
  const image = getMapAsset(asset);
  if (!image) return;

  const inset = TILE_SIZE * 0.09;
  let cx = px + TILE_SIZE / 2;
  let cy = py + TILE_SIZE / 2;
  let width = TILE_SIZE * 1.04;
  let height = TILE_SIZE * 0.34;
  let rotation = 0;

  if (side === 'north') cy = py + inset;
  if (side === 'south') {
    cy = py + TILE_SIZE - inset;
    rotation = Math.PI;
  }
  if (side === 'east') {
    cx = px + TILE_SIZE - inset;
    width = TILE_SIZE * 0.34;
    height = TILE_SIZE * 1.04;
  }
  if (side === 'west') {
    cx = px + inset;
    width = TILE_SIZE * 0.34;
    height = TILE_SIZE * 1.04;
    rotation = Math.PI;
  }

  scene.drawMapImage(image, cx, cy, width, height, rotation, 0.36);
}

function drawWallSurface(scene, x, y) {
  const surface = getMapAsset('wall-surface-v6');
  if (!surface) return;

  const ctx = scene.ctx;
  if (!scene.wallMaterialV6Pattern || scene.wallMaterialV6PatternSource !== surface) {
    scene.wallMaterialV6Pattern = ctx.createPattern(surface, 'repeat');
    scene.wallMaterialV6PatternSource = surface;
  }
  if (!scene.wallMaterialV6Pattern) return;

  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = scene.wallMaterialV6Pattern;
  ctx.fillRect(x * TILE_SIZE - 0.5, y * TILE_SIZE - 0.5, TILE_SIZE + 1, TILE_SIZE + 1);
  ctx.restore();
}

export function applyWallMaterialV6(scene) {
  if (!scene || scene.wallMaterialV6Applied) return scene;
  scene.wallMaterialV6Applied = true;

  const structuralBase = scene.drawWallBase.bind(scene);
  const structuralBoundary = scene.drawWallBoundary.bind(scene);
  const structuralOrnament = scene.drawWallOrnament.bind(scene);

  scene.drawWallBase = (x, y, floor) => {
    structuralBase(x, y, floor);
    drawWallSurface(scene, x, y);
  };

  scene.drawWallBoundary = (state, x, y, floor) => {
    structuralBoundary(state, x, y, floor);
    const mask = scene.wallMask(state, x, y);
    const exposed = wallExposures(mask);
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;
    if (exposed.north) drawMaterialEdge(scene, 'north', px, py);
    if (exposed.east) drawMaterialEdge(scene, 'east', px, py);
    if (exposed.south) drawMaterialEdge(scene, 'south', px, py);
    if (exposed.west) drawMaterialEdge(scene, 'west', px, py);
  };

  scene.drawWallOrnament = (state, x, y) => {
    const mask = scene.wallMask(state, x, y);
    const visual = wallNodeVisual(mask);
    if (!visual) return;
    const image = getMapAsset(visual.asset);
    if (!image) return structuralOrnament(state, x, y);
    scene.drawMapImage(
      image,
      scene.center(x),
      scene.center(y),
      TILE_SIZE * visual.scale,
      TILE_SIZE * visual.scale,
      visual.rotation,
      visual.alpha
    );
  };

  scene.canvas.dataset.wallPipeline = `${scene.canvas.dataset.wallPipeline ?? 'continuous-structure-v5'} material-overlay-v6`.trim();
  scene.canvas.dataset.wallMaterial = 'wall-materials-v6';
  return scene;
}
