import { GRID_SIZE, ITEMS, TILE_SIZE } from './data.js';
import { parseToken } from './engine.js';
import { getMapAsset } from './map-assets.js';

const WALL_BITS = Object.freeze({
  north: 1,
  east: 2,
  south: 4,
  west: 8
});

const CARD_DROP_ASSET = Object.freeze({
  sun: 'card-sun-drop-v4',
  moon: 'card-moon-drop-v4',
  star: 'card-star-drop-v4'
});

const BARRIER_STYLE = Object.freeze({
  sun: { rgb: '244,205,101', symbol: '☀' },
  moon: { rgb: '112,200,255', symbol: '☾' },
  star: { rgb: '239,130,191', symbol: '✦' }
});

function wallExposures(mask) {
  return {
    north: (mask & WALL_BITS.north) === 0,
    east: (mask & WALL_BITS.east) === 0,
    south: (mask & WALL_BITS.south) === 0,
    west: (mask & WALL_BITS.west) === 0
  };
}

function perimeterExposures(x, y) {
  const max = GRID_SIZE - 1;
  return {
    north: y === 0,
    east: x === max,
    south: y === max,
    west: x === 0
  };
}

function drawMaterialEdge(scene, side, px, py, perimeter = false) {
  // V7 intentionally uses one single-cell edge asset. Vertical runs are the
  // same art rotated 90 degrees, so all wall faces share one brick language.
  const image = getMapAsset('wall-edge-horizontal-v6');
  if (!image) return;

  const thickness = TILE_SIZE * 0.34;
  const inset = TILE_SIZE * 0.09;
  let cx = px + TILE_SIZE / 2;
  let cy = py + TILE_SIZE / 2;
  const width = TILE_SIZE * (perimeter ? 1 : 1.04);
  const height = thickness;
  let rotation = 0;

  // Perimeter faces stay completely inside the canvas. The old V7 placement
  // centered them too close to the edge, clipping roughly half of the brick
  // strip and making the tower's outer wall look undecorated.
  if (side === 'north') cy = perimeter ? py + thickness / 2 : py + inset;
  if (side === 'south') {
    cy = perimeter ? py + TILE_SIZE - thickness / 2 : py + TILE_SIZE - inset;
    rotation = Math.PI;
  }
  if (side === 'east') {
    cx = perimeter ? px + TILE_SIZE - thickness / 2 : px + TILE_SIZE - inset;
    rotation = Math.PI / 2;
  }
  if (side === 'west') {
    cx = perimeter ? px + thickness / 2 : px + inset;
    rotation = -Math.PI / 2;
  }

  scene.drawMapImage(image, cx, cy, width, height, rotation, perimeter ? 0.74 : 0.54);
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

function cornerPlacement(x, y) {
  const max = GRID_SIZE - 1;
  const inward = 0.055;

  // The source corner is authored as the top-left tower corner. Rotating the
  // same perspective-aware artwork preserves its lighting better than mirror
  // flips, which made the other three corners look inside-out.
  if (x === 0 && y === 0) return { rotation: 0, offsetX: inward, offsetY: inward };
  if (x === max && y === 0) return { rotation: Math.PI / 2, offsetX: -inward, offsetY: inward };
  if (x === max && y === max) return { rotation: Math.PI, offsetX: -inward, offsetY: -inward };
  if (x === 0 && y === max) return { rotation: -Math.PI / 2, offsetX: inward, offsetY: -inward };
  return null;
}

function drawOuterCorner(scene, x, y) {
  const placement = cornerPlacement(x, y);
  if (!placement) return false;
  const image = getMapAsset('wall-outer-corner-v6');
  if (!image) return false;

  const ctx = scene.ctx;
  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.translate(
    scene.center(x) + placement.offsetX * TILE_SIZE,
    scene.center(y) + placement.offsetY * TILE_SIZE
  );
  ctx.rotate(placement.rotation);
  const size = TILE_SIZE * 1.08;
  ctx.drawImage(image, -size / 2, -size / 2, size, size);
  ctx.restore();
  return true;
}

function barrierOrientation(scene, state, x, y) {
  const leftRight = scene.isWall(state, x - 1, y) || scene.isWall(state, x + 1, y);
  const upDown = scene.isWall(state, x, y - 1) || scene.isWall(state, x, y + 1);
  if (leftRight && !upDown) return 'horizontal';
  if (upDown && !leftRight) return 'vertical';
  return leftRight ? 'horizontal' : 'vertical';
}

function drawBarrierPillar(scene, cx, cy, size) {
  const pillar = getMapAsset('wall-end-pillar-v6') ?? getMapAsset('wall-pillar-v4');
  if (!pillar) return false;
  return scene.drawMapImage(pillar, cx, cy, size, size, 0, 0.86);
}

function drawMagicBarrier(scene, state, x, y, kind) {
  const style = BARRIER_STYLE[kind];
  if (!style) return false;

  const ctx = scene.ctx;
  const cx = scene.center(x);
  const cy = scene.center(y);
  const orientation = barrierOrientation(scene, state, x, y);
  const horizontal = orientation === 'horizontal';
  const length = TILE_SIZE * 0.92;
  const thickness = TILE_SIZE * 0.58;
  const pillarSize = TILE_SIZE * 0.34;
  const half = length / 2;
  const t = (scene.idleClock || performance.now()) / 850;
  const pulse = 0.5 + Math.sin(t + x * 0.7 + y * 0.9) * 0.5;

  ctx.save();
  ctx.translate(cx, cy);
  if (!horizontal) ctx.rotate(Math.PI / 2);

  const gradient = ctx.createLinearGradient(-half, 0, half, 0);
  gradient.addColorStop(0, `rgba(${style.rgb},0.08)`);
  gradient.addColorStop(0.18, `rgba(${style.rgb},0.2)`);
  gradient.addColorStop(0.5, `rgba(${style.rgb},${0.2 + pulse * 0.06})`);
  gradient.addColorStop(0.82, `rgba(${style.rgb},0.2)`);
  gradient.addColorStop(1, `rgba(${style.rgb},0.08)`);
  ctx.fillStyle = gradient;
  ctx.shadowColor = `rgba(${style.rgb},0.7)`;
  ctx.shadowBlur = 12;
  ctx.fillRect(-half, -thickness / 2, length, thickness);

  ctx.shadowBlur = 4;
  ctx.strokeStyle = `rgba(${style.rgb},${0.55 + pulse * 0.18})`;
  ctx.lineWidth = 1.2;
  for (const offset of [-0.24, 0, 0.24]) {
    ctx.beginPath();
    const yy = thickness * offset;
    ctx.moveTo(-half + pillarSize * 0.42, yy);
    ctx.quadraticCurveTo(0, yy + Math.sin(t * 1.7 + offset * 8) * 3, half - pillarSize * 0.42, yy);
    ctx.stroke();
  }

  ctx.fillStyle = `rgba(${style.rgb},${0.58 + pulse * 0.18})`;
  ctx.font = `700 ${Math.round(TILE_SIZE * 0.28)}px "Noto Serif SC", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(style.symbol, 0, 0);
  ctx.restore();

  if (horizontal) {
    drawBarrierPillar(scene, cx - half, cy, pillarSize);
    drawBarrierPillar(scene, cx + half, cy, pillarSize);
  } else {
    drawBarrierPillar(scene, cx, cy - half, pillarSize);
    drawBarrierPillar(scene, cx, cy + half, pillarSize);
  }
  return true;
}

export function applyWallMaterialV6(scene) {
  if (!scene || scene.wallMaterialV6Applied) return scene;
  scene.wallMaterialV6Applied = true;

  const structuralBase = scene.drawWallBase.bind(scene);
  const structuralBoundary = scene.drawWallBoundary.bind(scene);
  const structuralRenderToken = scene.renderToken.bind(scene);

  scene.drawWallBase = (x, y, floor) => {
    structuralBase(x, y, floor);
    drawWallSurface(scene, x, y);
  };

  scene.drawWallBoundary = (state, x, y, floor) => {
    structuralBoundary(state, x, y, floor);
    const mask = scene.wallMask(state, x, y);
    const exposed = wallExposures(mask);
    const perimeter = perimeterExposures(x, y);
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;

    if (perimeter.north) drawMaterialEdge(scene, 'north', px, py, true);
    else if (exposed.north) drawMaterialEdge(scene, 'north', px, py);

    if (perimeter.east) drawMaterialEdge(scene, 'east', px, py, true);
    else if (exposed.east) drawMaterialEdge(scene, 'east', px, py);

    if (perimeter.south) drawMaterialEdge(scene, 'south', px, py, true);
    else if (exposed.south) drawMaterialEdge(scene, 'south', px, py);

    if (perimeter.west) drawMaterialEdge(scene, 'west', px, py, true);
    else if (exposed.west) drawMaterialEdge(scene, 'west', px, py);

    // Corner architecture sits over its two perimeter brick strips. This keeps
    // the four corners legible without reintroducing ornaments inside the maze.
    if (cornerPlacement(x, y)) drawOuterCorner(scene, x, y);
  };

  // Interior wall nodes intentionally have no corner/pillar ornament in V7.
  scene.drawWallOrnament = () => {};

  scene.renderToken = (x, y, token) => {
    const parsed = parseToken(token);
    if (parsed.type === 'door' && BARRIER_STYLE[parsed.id]) {
      if (drawMagicBarrier(scene, scene.bridge.getState(), x, y, parsed.id)) return;
    }

    if (parsed.type === 'item') {
      const item = ITEMS[parsed.id];
      if (item?.kind === 'card') {
        const assetName = CARD_DROP_ASSET[item.card];
        const image = assetName ? getMapAsset(assetName) : null;
        if (image) {
          scene.drawSoftShadow(scene.center(x), scene.center(y) + TILE_SIZE * 0.28, TILE_SIZE * 0.42, 0.2);
          scene.drawMapImage(image, scene.center(x), scene.center(y), TILE_SIZE * 0.76, TILE_SIZE * 0.76);
          return;
        }
        console.error(`[V7] 卡牌掉落素材未加载: card=${item.card}, asset=${assetName ?? 'unknown'}`);
      }
    }

    structuralRenderToken(x, y, token);
  };

  scene.canvas.dataset.wallPipeline = 'continuous-structure-v5 single-cell-edges-v7 perimeter-bricks-v7 rotated-outer-corners-v7';
  scene.canvas.dataset.wallMaterial = 'wall-materials-v7-cleanup';
  scene.canvas.dataset.barrierPipeline = 'programmatic-anchor-field-v7';
  return scene;
}
