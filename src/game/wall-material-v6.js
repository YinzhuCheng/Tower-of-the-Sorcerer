import { TILE_SIZE } from './data.js';
import { getMapAsset } from './map-assets.js';

const WALL_BITS = Object.freeze({
  north: 1,
  east: 2,
  south: 4,
  west: 8
});

const BARRIER_THEME = Object.freeze({
  sun: Object.freeze({ rgb: [244, 203, 93], symbol: '☀', name: '日曜' }),
  moon: Object.freeze({ rgb: [104, 198, 255], symbol: '☾', name: '月辉' }),
  star: Object.freeze({ rgb: [239, 111, 185], symbol: '✦', name: '星蚀' })
});

const CARD_ASSETS = Object.freeze({
  sun: ['card-sun-drop-v4', 'card-sun-ui-v4'],
  moon: ['card-moon-drop-v4', 'card-moon-ui-v4'],
  star: ['card-star-drop-v4', 'card-star-ui-v4']
});

function wallExposures(mask) {
  return {
    north: (mask & WALL_BITS.north) === 0,
    east: (mask & WALL_BITS.east) === 0,
    south: (mask & WALL_BITS.south) === 0,
    west: (mask & WALL_BITS.west) === 0
  };
}

function towerCornerRotation(scene, x, y) {
  const max = Math.round(scene.canvas.width / TILE_SIZE) - 1;
  if (x === 0 && y === 0) return 0;
  if (x === max && y === 0) return Math.PI / 2;
  if (x === max && y === max) return Math.PI;
  if (x === 0 && y === max) return -Math.PI / 2;
  return null;
}

function drawMaterialEdge(scene, side, px, py) {
  // One single-cell trim asset is used for every wall side. Vertical runs are
  // rotations of the same horizontal source so the maze keeps one visual language.
  const image = getMapAsset('wall-edge-horizontal-v6');
  if (!image) return;

  const inset = TILE_SIZE * 0.075;
  let cx = px + TILE_SIZE / 2;
  let cy = py + TILE_SIZE / 2;
  let rotation = 0;

  if (side === 'north') cy = py + inset;
  if (side === 'south') {
    cy = py + TILE_SIZE - inset;
    rotation = Math.PI;
  }
  if (side === 'east') {
    cx = px + TILE_SIZE - inset;
    rotation = Math.PI / 2;
  }
  if (side === 'west') {
    cx = px + inset;
    rotation = -Math.PI / 2;
  }

  scene.drawMapImage(
    image,
    cx,
    cy,
    TILE_SIZE,
    TILE_SIZE * 0.29,
    rotation,
    0.52
  );
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
  ctx.globalAlpha = 0.24;
  ctx.fillStyle = scene.wallMaterialV6Pattern;
  ctx.fillRect(x * TILE_SIZE - 0.5, y * TILE_SIZE - 0.5, TILE_SIZE + 1, TILE_SIZE + 1);
  ctx.restore();
}

function drawTowerCorner(scene, x, y, rotation) {
  const image = getMapAsset('wall-outer-corner-v6');
  if (!image) return false;
  scene.drawMapImage(
    image,
    scene.center(x),
    scene.center(y),
    TILE_SIZE * 0.92,
    TILE_SIZE * 0.92,
    rotation,
    0.78
  );
  return true;
}

function barrierRotation(scene, state, x, y) {
  const westEast = Number(scene.isWall(state, x - 1, y)) + Number(scene.isWall(state, x + 1, y));
  const northSouth = Number(scene.isWall(state, x, y - 1)) + Number(scene.isWall(state, x, y + 1));
  // Walls on the left/right mean the passage runs north/south, therefore the
  // barrier plane should be horizontal. Otherwise rotate the whole gate 90°.
  return westEast >= northSouth ? 0 : Math.PI / 2;
}

function rgba(rgb, alpha) {
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
}

function drawBarrierGate(scene, x, y, kind) {
  const theme = BARRIER_THEME[kind];
  if (!theme) return false;

  const ctx = scene.ctx;
  const state = scene.bridge.getState();
  const rotation = barrierRotation(scene, state, x, y);
  const cx = scene.center(x);
  const cy = scene.center(y);
  const t = scene.idleClock || performance.now();
  const pulse = 0.84 + Math.sin(t / 540 + x * 0.9 + y * 1.1) * 0.08;
  const membraneW = TILE_SIZE * 0.69;
  const membraneH = TILE_SIZE * 0.72;
  const pillarSize = TILE_SIZE * 0.39;
  const pillar = getMapAsset('wall-end-pillar-v6');

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  // The barrier deliberately occupies the visible gap between the two anchors,
  // so a blocked tile never looks like empty walkable floor.
  const gradient = ctx.createLinearGradient(-membraneW / 2, 0, membraneW / 2, 0);
  gradient.addColorStop(0, rgba(theme.rgb, 0.05));
  gradient.addColorStop(0.18, rgba(theme.rgb, 0.24 * pulse));
  gradient.addColorStop(0.5, rgba(theme.rgb, 0.12 * pulse));
  gradient.addColorStop(0.82, rgba(theme.rgb, 0.24 * pulse));
  gradient.addColorStop(1, rgba(theme.rgb, 0.05));
  ctx.fillStyle = gradient;
  ctx.fillRect(-membraneW / 2, -membraneH / 2, membraneW, membraneH);

  ctx.strokeStyle = rgba(theme.rgb, 0.76 * pulse);
  ctx.lineWidth = 1.4;
  ctx.shadowColor = rgba(theme.rgb, 0.72);
  ctx.shadowBlur = 7;
  ctx.strokeRect(-membraneW / 2, -membraneH / 2, membraneW, membraneH);

  ctx.lineWidth = 1;
  for (const offset of [-0.2, 0, 0.2]) {
    const yy = membraneH * offset;
    ctx.beginPath();
    ctx.moveTo(-membraneW * 0.46, yy);
    ctx.quadraticCurveTo(0, yy + Math.sin(t / 420 + offset * 8) * 3, membraneW * 0.46, yy);
    ctx.stroke();
  }

  ctx.shadowBlur = 4;
  ctx.fillStyle = rgba(theme.rgb, 0.92);
  ctx.font = `700 ${Math.round(TILE_SIZE * 0.28)}px "Noto Serif SC", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(theme.symbol, 0, 0);

  // Two wall pillars become functional barrier anchors instead of generic maze
  // decoration. If their art is unavailable, small luminous nodes keep the rule clear.
  if (pillar) {
    ctx.globalAlpha = 0.84;
    ctx.drawImage(pillar, -membraneW / 2 - pillarSize * 0.48, -pillarSize / 2, pillarSize, pillarSize);
    ctx.drawImage(pillar, membraneW / 2 - pillarSize * 0.52, -pillarSize / 2, pillarSize, pillarSize);
  } else {
    ctx.fillStyle = rgba(theme.rgb, 0.9);
    for (const px of [-membraneW / 2, membraneW / 2]) {
      ctx.beginPath();
      ctx.arc(px, 0, TILE_SIZE * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
  return true;
}

function cardImage(kind) {
  for (const assetName of CARD_ASSETS[kind] ?? []) {
    const image = getMapAsset(assetName);
    if (image) return image;
  }
  return null;
}

function drawCardDrop(scene, x, y, kind) {
  const theme = BARRIER_THEME[kind];
  if (!theme) return false;

  const cx = scene.center(x);
  const cy = scene.center(y);
  const image = cardImage(kind);
  const ctx = scene.ctx;
  const w = TILE_SIZE * 0.48;
  const h = TILE_SIZE * 0.66;

  // A small programmatic card silhouette remains underneath the generated art.
  // This guarantees a readable collectible even if a browser cannot decode an asset.
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(((x + y) % 2 ? 1 : -1) * 0.045);
  ctx.fillStyle = 'rgba(13,10,32,.92)';
  ctx.strokeStyle = rgba(theme.rgb, 0.92);
  ctx.lineWidth = 1.6;
  ctx.shadowColor = rgba(theme.rgb, 0.45);
  ctx.shadowBlur = 7;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = rgba(theme.rgb, 0.9);
  ctx.font = `700 ${Math.round(TILE_SIZE * 0.24)}px "Noto Serif SC", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(theme.symbol, 0, 0);
  ctx.restore();

  if (image) {
    scene.drawSoftShadow(cx, cy + TILE_SIZE * 0.28, TILE_SIZE * 0.36, 0.18);
    scene.drawMapImage(image, cx, cy, TILE_SIZE * 0.72, TILE_SIZE * 0.82, 0, 1);
  }
  return true;
}

export function applyWallMaterialV6(scene) {
  if (!scene || scene.wallMaterialV6Applied) return scene;
  scene.wallMaterialV6Applied = true;

  const structuralBase = scene.drawWallBase.bind(scene);
  const structuralBoundary = scene.drawWallBoundary.bind(scene);
  const structuralToken = scene.renderToken.bind(scene);

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

  // Complex corner artwork is reserved for the four tower corners only. Internal
  // maze turns stay clean and are described entirely by the continuous wall edge.
  scene.drawWallOrnament = (_state, x, y) => {
    const rotation = towerCornerRotation(scene, x, y);
    if (rotation == null) return;
    drawTowerCorner(scene, x, y, rotation);
  };

  scene.renderToken = (x, y, token) => {
    if (typeof token === 'string' && token.startsWith('door:')) {
      const kind = token.slice(5);
      if (drawBarrierGate(scene, x, y, kind)) return;
    }
    if (typeof token === 'string' && token.startsWith('item:')) {
      const kind = token.slice(5);
      if (kind === 'sun' || kind === 'moon' || kind === 'star') {
        drawCardDrop(scene, x, y, kind);
        return;
      }
    }
    return structuralToken(x, y, token);
  };

  scene.canvas.dataset.wallPipeline = `${scene.canvas.dataset.wallPipeline ?? 'continuous-structure-v5'} material-overlay-v6 clean-perimeter-v7`.trim();
  scene.canvas.dataset.wallMaterial = 'wall-materials-v6';
  scene.canvas.dataset.barrierPipeline = 'anchored-barrier-v7';
  return scene;
}
