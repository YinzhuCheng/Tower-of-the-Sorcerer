import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS } from '/src/game/data.js';
import { applyDemoTenFloorContent } from '/src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionGrammar } from '/src/game/demo-10-floor-progression.js';
import { applyDemoTwentyFloorContent } from '/src/game/demo-20-floor-content.js';
import { applyDemoThirtyFloorContent } from '/src/game/demo-30-floor-content.js';
import { DIALOGUE_CAST, dialoguePresentation } from '/src/game/anime-portraits.js';
import { AUDIT_VERSION, BACKDROPS, CG_SCENES, KNOWN_SIGNALS, TRANSITIONS } from './registry.js';

const STORAGE_KEY = 'lost-magic-tower:art-audit:reviews:v2';
const STATUS_LABELS = Object.freeze({ pending: '待审核', pass: '通过', issue: '异常' });

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTwentyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });
applyDemoThirtyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });

const elements = {
  root: document.querySelector('#audit-root'),
  stats: document.querySelector('#summary-stats'),
  search: document.querySelector('#search'),
  kindFilter: document.querySelector('#kind-filter'),
  statusFilter: document.querySelector('#status-filter'),
  exportButton: document.querySelector('#export-review'),
  resetButton: document.querySelector('#reset-review'),
  empty: document.querySelector('#empty-state'),
  lightbox: document.querySelector('#lightbox'),
  reviewTemplate: document.querySelector('#review-controls-template')
};

const ui = { kind: 'all', status: 'all', query: '' };
let reviews = loadReviews();

function loadReviews() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveReviews() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

function cleanAssetPath(path) {
  return String(path ?? '').split('?')[0];
}

function uniqueBy(items, selector) {
  const seen = new Set();
  return items.filter((item) => {
    const key = selector(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function turnsForCharacter(id) {
  const appearances = [];
  for (const [dialogueId, dialogue] of Object.entries(DIALOGUES)) {
    const turns = dialogue.turns?.length ? dialogue.turns : [dialogue];
    turns.forEach((turn, index) => {
      if (turn.portrait !== id) return;
      appearances.push({
        dialogueId,
        title: dialogue.title,
        index: index + 1,
        total: turns.length,
        speaker: turn.speaker,
        expression: turn.expression ?? DIALOGUE_CAST[id]?.expression ?? 'neutral',
        cg: cleanAssetPath(turn.cg)
      });
    });
  }
  return appearances;
}

function buildCharacters() {
  return Object.keys(DIALOGUE_CAST).map((id) => {
    const appearances = turnsForCharacter(id);
    const expressionKeys = [...new Set([
      DIALOGUE_CAST[id].expression,
      ...appearances.map(({ expression }) => expression)
    ].filter(Boolean))];
    const presentations = expressionKeys.map((expression) => dialoguePresentation(id, expression));
    const avatars = uniqueBy(presentations.map((item) => ({
      expression: item.expression,
      label: item.label,
      path: cleanAssetPath(item.avatar)
    })), ({ path }) => path);
    const stages = uniqueBy(presentations.map((item) => ({
      expression: item.expression,
      label: item.label,
      path: cleanAssetPath(item.stage)
    })), ({ path }) => path);
    const cgScenes = CG_SCENES.filter(({ cast }) => cast.includes(id));
    const firstAppearance = appearances[0];
    return {
      key: `character:${id}`,
      kind: 'character',
      id,
      title: firstAppearance?.speaker ?? id,
      subtitle: `${appearances.length} 句台词 · ${expressionKeys.length} 个表情状态`,
      appearances,
      avatars,
      stages,
      cgScenes,
      signals: KNOWN_SIGNALS[id] ?? []
    };
  });
}

function duplicateSignals(characters) {
  const owners = new Map();
  for (const character of characters) {
    for (const asset of [...character.avatars, ...character.stages]) {
      if (!asset.path) continue;
      if (!owners.has(asset.path)) owners.set(asset.path, new Set());
      owners.get(asset.path).add(character.id);
    }
  }
  for (const character of characters) {
    const duplicated = [...new Set([...character.avatars, ...character.stages]
      .filter(({ path }) => (owners.get(path)?.size ?? 0) > 1)
      .map(({ path }) => path))];
    duplicated.forEach((path) => character.signals.push(`自动线索：此文件同时映射到多个角色：${path}`));
  }
}

const characterRecords = buildCharacters();
duplicateSignals(characterRecords);

const cgRecords = CG_SCENES.map((scene) => ({
  ...scene,
  key: `cg:${scene.id}`,
  kind: 'cg',
  subtitle: `${scene.cast.length} 名角色 · ${scene.role}`
}));

const environmentRecords = [
  ...BACKDROPS.map((asset) => ({ ...asset, key: `backdrop:${asset.id}`, kind: 'environment', subtype: '背景' })),
  ...TRANSITIONS.map((asset) => ({ ...asset, key: `transition:${asset.id}`, kind: 'environment', subtype: '转场' }))
];

const records = [...characterRecords, ...cgRecords, ...environmentRecords];

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function reviewFor(key) {
  if (reviews[key]) return reviews[key];
  const characterId = key.startsWith('character:') ? key.slice('character:'.length) : null;
  const knownSignal = characterId ? KNOWN_SIGNALS[characterId]?.join('\n') : null;
  return knownSignal
    ? { status: 'issue', note: knownSignal, updatedAt: null, source: 'known-signal' }
    : { status: 'pending', note: '', updatedAt: null };
}

function statusBadge(key) {
  const { status } = reviewFor(key);
  return `<span class="status-badge status-${status}">${STATUS_LABELS[status]}</span>`;
}

function imageFigure({ path, label, className = '', eager = false }) {
  if (!path) return '<div class="asset-missing">没有映射文件</div>';
  return `
    <figure class="asset-figure ${className}">
      <button type="button" class="asset-open" data-image-path="${escapeHtml(path)}" data-image-label="${escapeHtml(label)}">
        <img src="${escapeHtml(path)}" alt="${escapeHtml(label)}" loading="${eager ? 'eager' : 'lazy'}" />
        <span class="image-error" hidden>加载失败</span>
      </button>
      <figcaption><strong>${escapeHtml(label)}</strong><code>${escapeHtml(path)}</code></figcaption>
    </figure>`;
}

function reviewControls(key) {
  const fragment = elements.reviewTemplate.content.cloneNode(true);
  const root = fragment.querySelector('.review-box');
  const review = reviewFor(key);
  root.dataset.reviewKey = key;
  root.querySelectorAll('[data-review]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.review === review.status);
  });
  root.querySelector('textarea').value = review.note ?? '';
  return root.outerHTML;
}

function characterCard(character, index) {
  const defaultStage = character.stages[0];
  const otherStages = character.stages.slice(1);
  const searchText = [character.id, character.title, ...character.appearances.flatMap((item) => [item.dialogueId, item.title]), ...character.avatars.map(({ path }) => path), ...character.stages.map(({ path }) => path)].join(' ');
  return `
    <article class="audit-card character-card" data-record-key="${character.key}" data-kind="character" data-search="${escapeHtml(searchText.toLowerCase())}">
      <header class="card-header">
        <div><p class="record-id">${escapeHtml(character.id)}</p><h3>${escapeHtml(character.title)}</h3><p>${escapeHtml(character.subtitle)}</p></div>
        ${statusBadge(character.key)}
      </header>
      ${character.signals.length ? `<div class="signal-list">${character.signals.map((signal) => `<p>⚠ ${escapeHtml(signal)}</p>`).join('')}</div>` : ''}
      <div class="identity-grid">
        <section class="anchor-panel">
          <div class="panel-title"><span>01</span><strong>身份基准候选</strong><small>默认立绘</small></div>
          ${imageFigure({ path: defaultStage?.path, label: `${character.title} · ${defaultStage?.label ?? '默认'}`, className: 'anchor-figure', eager: index < 2 })}
        </section>
        <section class="asset-panel">
          <div class="panel-title"><span>02</span><strong>头像</strong><small>${character.avatars.length} 张</small></div>
          <div class="asset-strip avatars">${character.avatars.map((asset) => imageFigure({ path: asset.path, label: `${asset.label} · ${asset.expression}` })).join('')}</div>
        </section>
        <section class="asset-panel">
          <div class="panel-title"><span>03</span><strong>其他立绘差分</strong><small>${otherStages.length} 张</small></div>
          <div class="asset-strip stages">${otherStages.length ? otherStages.map((asset) => imageFigure({ path: asset.path, label: `${asset.label} · ${asset.expression}` })).join('') : '<div class="asset-missing">无额外立绘差分</div>'}</div>
        </section>
        <section class="asset-panel cg-panel">
          <div class="panel-title"><span>04</span><strong>CG 出场</strong><small>${character.cgScenes.length} 张</small></div>
          <div class="asset-strip cgs">${character.cgScenes.length ? character.cgScenes.map((scene) => imageFigure({ path: scene.path, label: scene.title })).join('') : '<div class="asset-missing">未进入人物 CG</div>'}</div>
        </section>
      </div>
      <details class="mapping-details">
        <summary>查看 ${character.appearances.length} 条台词映射</summary>
        <div class="mapping-list">${character.appearances.map((item) => `<span><code>${escapeHtml(item.dialogueId)}</code> ${escapeHtml(item.index)}/${escapeHtml(item.total)} · ${escapeHtml(item.expression)} · ${escapeHtml(item.title)}</span>`).join('')}</div>
      </details>
      ${reviewControls(character.key)}
    </article>`;
}

function cgCard(scene) {
  const names = scene.cast.map((id) => characterRecords.find((item) => item.id === id)?.title ?? id);
  const searchText = [scene.id, scene.title, scene.path, ...scene.cast, ...names, ...scene.scenes].join(' ').toLowerCase();
  return `
    <article class="audit-card scene-card" data-record-key="${scene.key}" data-kind="cg" data-search="${escapeHtml(searchText)}">
      <header class="card-header"><div><p class="record-id">${escapeHtml(scene.role)}</p><h3>${escapeHtml(scene.title)}</h3><p>${escapeHtml(scene.scenes.join(' · '))}</p></div>${statusBadge(scene.key)}</header>
      ${imageFigure({ path: scene.path, label: scene.title, className: 'wide-figure' })}
      <div class="cast-line"><strong>演员表</strong>${names.map((name, index) => `<span>${escapeHtml(name)}<code>${escapeHtml(scene.cast[index])}</code></span>`).join('')}</div>
      ${scene.referenced === false ? '<p class="candidate-note">候选素材：当前没有剧情引用，仍保留身份一致性审核。</p>' : ''}
      ${reviewControls(scene.key)}
    </article>`;
}

function environmentCard(asset) {
  const searchText = [asset.id, asset.title, asset.path, asset.usage, asset.subtype].join(' ').toLowerCase();
  return `
    <article class="audit-card environment-card" data-record-key="${asset.key}" data-kind="environment" data-search="${escapeHtml(searchText)}">
      <header class="card-header"><div><p class="record-id">${escapeHtml(asset.subtype)}</p><h3>${escapeHtml(asset.title)}</h3><p>${escapeHtml(asset.usage)}</p></div>${statusBadge(asset.key)}</header>
      ${imageFigure({ path: asset.path, label: asset.title, className: 'wide-figure' })}
      ${reviewControls(asset.key)}
    </article>`;
}

function section(title, description, kind, content) {
  return `<section class="record-section" data-section-kind="${kind}"><header class="section-header"><div><p class="eyebrow">${kind === 'character' ? 'IDENTITY MATRIX' : kind === 'cg' ? 'SCENE CAST' : 'WORLD PLATES'}</p><h2>${title}</h2></div><p>${description}</p></header><div class="record-grid">${content}</div></section>`;
}

function render() {
  elements.root.innerHTML = [
    section('角色身份矩阵', '基准候选、头像、立绘差分与 CG 同行比对。', 'character', characterRecords.map(characterCard).join('')),
    section('事件与战斗 CG', '核对人物数量、演员身份、服装和叙事用途。', 'cg', cgRecords.map(cgCard).join('')),
    section('背景与转场', '核对无人背景、场景用途及错误人物混入。', 'environment', environmentRecords.map(environmentCard).join(''))
  ].join('');
  attachImageErrors();
  applyFilters();
  updateStats();
}

function attachImageErrors() {
  document.querySelectorAll('.asset-figure img').forEach((image) => {
    image.addEventListener('error', () => {
      image.closest('.asset-figure')?.classList.add('has-error');
      const message = image.parentElement.querySelector('.image-error');
      if (message) message.hidden = false;
    }, { once: true });
  });
}

function recordMatches(record) {
  const review = reviewFor(record.dataset.recordKey);
  const kindMatch = ui.kind === 'all' || record.dataset.kind === ui.kind;
  const statusMatch = ui.status === 'all' || review.status === ui.status;
  const queryMatch = !ui.query || record.dataset.search.includes(ui.query);
  return kindMatch && statusMatch && queryMatch;
}

function applyFilters() {
  let visible = 0;
  document.querySelectorAll('[data-record-key]').forEach((record) => {
    const match = recordMatches(record);
    record.hidden = !match;
    if (match) visible += 1;
  });
  document.querySelectorAll('[data-section-kind]').forEach((sectionElement) => {
    const hasVisible = [...sectionElement.querySelectorAll('[data-record-key]')].some((record) => !record.hidden);
    sectionElement.hidden = !hasVisible;
  });
  elements.empty.hidden = visible !== 0;
}

function updateStats() {
  const counts = records.reduce((result, record) => {
    const status = reviewFor(record.key).status;
    result[status] += 1;
    return result;
  }, { pending: 0, pass: 0, issue: 0 });
  elements.stats.innerHTML = `
    <div><strong>${characterRecords.length}</strong><span>台词角色</span></div>
    <div><strong>${records.length}</strong><span>审核项目</span></div>
    <div class="issue"><strong>${counts.issue}</strong><span>异常</span></div>
    <div><strong>${counts.pending}</strong><span>待审核</span></div>`;
}

function updateReviewBox(box, status) {
  box.querySelectorAll('[data-review]').forEach((button) => button.classList.toggle('is-active', button.dataset.review === status));
  const card = box.closest('[data-record-key]');
  const badge = card?.querySelector('.status-badge');
  if (badge) {
    badge.className = `status-badge status-${status}`;
    badge.textContent = STATUS_LABELS[status];
  }
}

function setReview(key, patch) {
  reviews[key] = { ...reviewFor(key), ...patch, updatedAt: new Date().toISOString() };
  saveReviews();
  updateStats();
  applyFilters();
}

function openLightbox(path, label) {
  const image = elements.lightbox.querySelector('img');
  image.src = path;
  image.alt = label;
  elements.lightbox.querySelector('strong').textContent = label;
  elements.lightbox.querySelector('code').textContent = path;
  elements.lightbox.showModal();
}

function exportReviews() {
  const payload = {
    auditVersion: AUDIT_VERSION,
    exportedAt: new Date().toISOString(),
    source: location.href,
    summary: records.reduce((result, record) => {
      result[reviewFor(record.key).status] += 1;
      return result;
    }, { pending: 0, pass: 0, issue: 0 }),
    reviews: records.map((record) => ({ key: record.key, title: record.title, kind: record.kind, ...reviewFor(record.key) }))
  };
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tower-art-audit-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

elements.root.addEventListener('click', (event) => {
  const imageButton = event.target.closest('[data-image-path]');
  if (imageButton) {
    openLightbox(imageButton.dataset.imagePath, imageButton.dataset.imageLabel);
    return;
  }
  const reviewButton = event.target.closest('[data-review]');
  if (!reviewButton) return;
  const box = reviewButton.closest('[data-review-key]');
  const status = reviewButton.dataset.review;
  updateReviewBox(box, status);
  setReview(box.dataset.reviewKey, { status });
});

elements.root.addEventListener('input', (event) => {
  if (!event.target.matches('[data-review-key] textarea')) return;
  const box = event.target.closest('[data-review-key]');
  setReview(box.dataset.reviewKey, { note: event.target.value });
});

elements.search.addEventListener('input', () => {
  ui.query = elements.search.value.trim().toLowerCase();
  applyFilters();
});

elements.kindFilter.addEventListener('click', (event) => {
  const button = event.target.closest('[data-kind]');
  if (!button) return;
  ui.kind = button.dataset.kind;
  elements.kindFilter.querySelectorAll('[data-kind]').forEach((item) => item.classList.toggle('is-active', item === button));
  applyFilters();
});

elements.statusFilter.addEventListener('change', () => {
  ui.status = elements.statusFilter.value;
  applyFilters();
});

elements.exportButton.addEventListener('click', exportReviews);
elements.resetButton.addEventListener('click', () => {
  if (!confirm('清空此浏览器中的全部审核状态和备注？')) return;
  reviews = {};
  saveReviews();
  render();
});

elements.lightbox.querySelector('.lightbox-close').addEventListener('click', () => elements.lightbox.close());
elements.lightbox.addEventListener('click', (event) => {
  if (event.target === elements.lightbox) elements.lightbox.close();
});

render();
