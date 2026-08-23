import { TILE_SIZE } from './data.js';
import { parseToken } from './engine.js';

const GEM_STYLE = Object.freeze({
  atk: { core: '#ff577b', edge: '#ffd5df', glow: '255,74,115' },
  def: { core: '#63baf2', edge: '#dff5ff', glow: '80,174,235' },
  dual: { core: '#b07cff', edge: '#f0ddff', glow: '177,111,245' }
});

function installStyle() {
  if (document.querySelector('style[data-visual-patch-v83]')) return;
  const style = document.createElement('style');
  style.dataset.visualPatchV83 = '1';
  style.textContent = `
    .ui-frame-v82.corner{width:30px!important;height:30px!important;opacity:.28!important}
    .ui-frame-v82.corner.tl{left:1px!important;top:1px!important;transform:scale(.78)!important}
    .ui-frame-v82.corner.tr{right:1px!important;top:1px!important;transform:scaleX(-1) scale(.78)!important}
    .ui-frame-v82.corner.bl{left:1px!important;bottom:1px!important;transform:scaleY(-1) scale(.78)!important}
    .ui-frame-v82.corner.br{right:1px!important;bottom:1px!important;transform:scale(-1) scale(.78)!important}
    .ui-frame-v82.edge{left:31px!important;right:31px!important;height:5px!important;opacity:.16!important}
    .stats-panel>.ui-frame-v82,.intel-panel>.ui-frame-v82,.modal-card>.ui-frame-v82{filter:saturate(.82) brightness(.9)}
    #game-container>.ui-frame-v82{display:none!important}
    .panel{box-shadow:0 16px 48px rgba(0,0,0,.2),inset 0 0 0 1px rgba(145,198,232,.025)!important}
  `;
  document.head.append(style);
}

export function installV83UiFixes() {
  installStyle();
}

function drawGem(scene, x, y, kind) {
  const style = GEM_STYLE[kind];
  if (!style) return false;
  const ctx = scene.ctx;
  const cx = scene.center(x);
  const cy = scene.center(y);
  const w = TILE_SIZE * 0.37;
  const h = TILE_SIZE * 0.46;
  const t = (scene.idleClock || performance.now()) / 760;
  const bob = Math.sin(t + x * 0.8 + y * 0.55) * 1.05;

  scene.drawSoftShadow(cx, cy + TILE_SIZE * 0.22, TILE_SIZE * 0.34, 0.15);
  ctx.save();
  ctx.translate(cx, cy + bob);
  ctx.shadowColor = `rgba(${style.glow},.54)`;
  ctx.shadowBlur = 10;

  const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  if (kind === 'dual') {
    grad.addColorStop(0, '#ff6f91');
    grad.addColorStop(0.49, '#ff6f91');
    grad.addColorStop(0.51, '#6bc7f5');
    grad.addColorStop(1, '#6bc7f5');
  } else {
    grad.addColorStop(0, style.edge);
    grad.addColorStop(0.36, style.core);
    grad.addColorStop(1, '#223b62');
  }

  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(w * 0.45, -h * 0.16);
  ctx.lineTo(w * 0.34, h * 0.34);
  ctx.lineTo(0, h / 2);
  ctx.lineTo(-w * 0.34, h * 0.34);
  ctx.lineTo(-w * 0.45, -h * 0.16);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = style.edge;
  ctx.lineWidth = 1.25;
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.62;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 0.75;
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.4);
  ctx.lineTo(0, h * 0.38);
  ctx.moveTo(-w * 0.36, -h * 0.13);
  ctx.lineTo(w * 0.36, -h * 0.13);
  ctx.moveTo(-w * 0.28, h * 0.27);
  ctx.lineTo(w * 0.28, h * 0.27);
  ctx.stroke();
  ctx.restore();
  return true;
}

function drawPotion(scene, x, y, large = false) {
  const ctx = scene.ctx;
  const cx = scene.center(x);
  const cy = scene.center(y);
  const scale = large ? 1.08 : 0.92;
  const w = TILE_SIZE * 0.34 * scale;
  const h = TILE_SIZE * 0.49 * scale;
  const t = (scene.idleClock || performance.now()) / 820;
  const bob = Math.sin(t + x * 0.43 + y * 0.71) * 0.9;

  scene.drawSoftShadow(cx, cy + TILE_SIZE * 0.22, TILE_SIZE * 0.32 * scale, 0.14);
  ctx.save();
  ctx.translate(cx, cy + bob);
  ctx.shadowColor = 'rgba(255,95,157,.5)';
  ctx.shadowBlur = 9;

  const glass = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  glass.addColorStop(0, 'rgba(214,242,255,.48)');
  glass.addColorStop(0.45, 'rgba(248,253,255,.18)');
  glass.addColorStop(1, 'rgba(135,202,235,.38)');

  ctx.beginPath();
  ctx.moveTo(-w * 0.18, -h * 0.46);
  ctx.lineTo(w * 0.18, -h * 0.46);
  ctx.lineTo(w * 0.18, -h * 0.3);
  ctx.bezierCurveTo(w * 0.42, -h * 0.2, w * 0.48, h * 0.05, w * 0.42, h * 0.28);
  ctx.bezierCurveTo(w * 0.36, h * 0.47, -w * 0.36, h * 0.47, -w * 0.42, h * 0.28);
  ctx.bezierCurveTo(-w * 0.48, h * 0.05, -w * 0.42, -h * 0.2, -w * 0.18, -h * 0.3);
  ctx.closePath();
  ctx.fillStyle = glass;
  ctx.fill();
  ctx.strokeStyle = 'rgba(224,247,255,.9)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.shadowBlur = 5;
  const liquid = ctx.createLinearGradient(0, -h * 0.05, 0, h * 0.38);
  liquid.addColorStop(0, large ? '#ff8fc5' : '#ff77ad');
  liquid.addColorStop(1, large ? '#b62d77' : '#9e285f');
  ctx.beginPath();
  ctx.ellipse(0, h * 0.18, w * 0.34, h * 0.21, 0, 0, Math.PI * 2);
  ctx.fillStyle = liquid;
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#d7b980';
  ctx.fillRect(-w * 0.2, -h * 0.53, w * 0.4, h * 0.1);
  ctx.strokeStyle = '#fff1cb';
  ctx.lineWidth = 0.7;
  ctx.strokeRect(-w * 0.2, -h * 0.53, w * 0.4, h * 0.1);

  ctx.fillStyle = 'rgba(255,255,255,.72)';
  ctx.beginPath();
  ctx.ellipse(-w * 0.17, -h * 0.03, w * 0.055, h * 0.13, -0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  return true;
}

function drawFramelessStatDrop(scene, x, y, id) {
  if (id === 'atk' || id === 'def' || id === 'dual') return drawGem(scene, x, y, id);
  if (id === 'hp') return drawPotion(scene, x, y, false);
  if (id === 'hpLarge') return drawPotion(scene, x, y, true);
  return false;
}

export function applyV83RenderFixes(scene) {
  if (!scene?.ctx || scene.visualPatchV83Applied) return scene;
  scene.visualPatchV83Applied = true;
  const previousRenderToken = scene.renderToken.bind(scene);
  scene.renderToken = (x, y, token) => {
    const parsed = parseToken(token);
    if (parsed.type === 'item' && drawFramelessStatDrop(scene, x, y, parsed.id)) return;
    previousRenderToken(x, y, token);
  };
  scene.canvas.dataset.statItemPipeline = 'frameless-programmatic-v8.3';
  return scene;
}
