import { ENEMIES, FLOORS, GRID_SIZE, TILE_SIZE, getShopCost } from './game/data.js';
import {
  buyShopUpgrade,
  createInitialState,
  deserializeState,
  getAdjacentEnemyPreviews,
  getCodexEntries,
  getDialogue,
  getProgressPercent,
  getRelicLabels,
  getShopEffectMultiplier,
  getShopOptions,
  initialDialogue,
  resolveWarCouncil,
  serializeState,
  setMagicTier,
  teleportToFloor
} from './game/engine.js';
import {
  getChallengeContractBriefing,
  getSelectedChallengeContract,
  previewChallengeContract,
  selectChallengeContract
} from './game/challenge-contracts.js';
import {
  getRouteDoctrineBriefing,
  getSelectedRouteDoctrine,
  selectRouteDoctrine
} from './game/route-doctrines.js';
import {
  getAct3CharterBriefing,
  getSelectedAct3Charter,
  selectAct3Charter
} from './game/act3-charters.js';
import { describeMagicTier, getMagicTierCapacity, getMagicTierCost } from './game/magic-blade.js';
import {
  getWarCouncilAllies,
  simulateWarCouncil,
  WAR_COUNCIL_LOYALISTS,
  WAR_COUNCIL_MAX_MP_PER_ALLY,
  WAR_COUNCIL_MP_POOL,
  WAR_COUNCIL_MP_STEP
} from './game/war-council.js';
import { getEndingDebrief } from './game/ending-debrief.js';
import { combatRuleCopy, HELP_SECTIONS } from './game/player-copy.js';
import { buildMapUnitHoverPreview } from './game/tactical-interaction.js';
import { createMagicTowerScene } from './game/scene.js';
import { createCanvasTowerScene } from './game/canvas-scene.js';
import { hydratePortraits, portraitUrl } from './game/portraits.js';
import { applySceneThemeV8, installV8VisualLayer } from './game/visual-theme-v8.js';
import { applyV83RenderFixes, installV83UiFixes } from './game/visual-patch-v83.js';

const MANUAL_SAVE_KEY = 'lost-magic-tower:manual:v1';
const AUTO_SAVE_KEY = 'lost-magic-tower:auto:v1';

const $ = (selector) => document.querySelector(selector);
const elements = {
  loading: $('#loading-note'),
  floorNumber: $('#floor-number'),
  floorTitle: $('#floor-title'),
  hp: $('#stat-hp'),
  atk: $('#stat-atk'),
  def: $('#stat-def'),
  gold: $('#stat-gold'),
  sun: $('#card-sun'),
  moon: $('#card-moon'),
  star: $('#card-star'),
  magicTitle: $('#magic-title'),
  magicTierButton: $('#btn-magic-tier'),
  relicList: $('#relic-list'),
  preview: $('#battle-preview'),
  logList: $('#log-list'),
  nearbyButton: $('#btn-nearby'),
  doctrineButton: $('#btn-doctrine'),
  challengeButton: $('#btn-challenges'),
  codexButton: $('#btn-codex'),
  teleportButton: $('#btn-teleport'),
  magicButton: $('#btn-magic'),
  modalRoot: $('#modal-root'),
  modalKicker: $('#modal-kicker'),
  modalTitle: $('#modal-title'),
  modalBody: $('#modal-body'),
  modalActions: $('#modal-actions'),
  modalClose: $('#modal-close')
};

let state = createInitialState();
let scene = null;
let modalClosable = true;
let toastTimer = null;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatNumber(value) {
  return Number.isFinite(value) ? Math.round(value).toLocaleString('zh-CN') : '∞';
}

function specialLabel(enemy) {
  return combatRuleCopy(enemy, { compact: true });
}

function showToast(message, duration = 1700) {
  clearTimeout(toastTimer);
  elements.loading.textContent = message;
  elements.loading.classList.remove('hidden');
  toastTimer = setTimeout(() => elements.loading.classList.add('hidden'), duration);
}

function closeModal() {
  if (!modalClosable) return;
  elements.modalRoot.classList.add('hidden');
  elements.modalBody.replaceChildren();
  elements.modalActions.replaceChildren();
}

function openModal({ kicker = '', title, body = '', actions = [], closable = true, afterOpen = null }) {
  modalClosable = closable;
  elements.modalKicker.textContent = kicker;
  elements.modalTitle.textContent = title;
  elements.modalBody.innerHTML = body;
  elements.modalActions.replaceChildren();
  elements.modalClose.style.visibility = closable ? 'visible' : 'hidden';

  for (const action of actions) {
    const button = document.createElement('button');
    button.textContent = action.label;
    if (action.className) button.className = action.className;
    button.disabled = Boolean(action.disabled);
    button.addEventListener('click', () => {
      if (action.close !== false) {
        modalClosable = true;
        closeModal();
      }
      action.onClick?.();
    });
    elements.modalActions.append(button);
  }

  elements.modalRoot.classList.remove('hidden');
  afterOpen?.();
}

function showDialogue(dialogueId, after = null, { finalLabel = null } = {}) {
  const dialogue = getDialogue(dialogueId);
  if (!dialogue) return;

  // Boss dialogue is authored as a short exchange rather than a block of
  // exposition.  Older screens only knew the single-speaker format, which
  // silently rendered sequence records as empty content.  Keep both formats
  // valid so existing floor narration remains lightweight while confrontations
  // can reveal competing motives one line at a time.
  if (Array.isArray(dialogue.turns) && dialogue.turns.length > 0) {
    let index = 0;
    const renderTurn = () => {
      const turn = dialogue.turns[index];
      const finalTurn = index === dialogue.turns.length - 1;
      openModal({
        kicker: `${turn.speaker} · ${index + 1}/${dialogue.turns.length}`,
        title: dialogue.title,
        closable: finalLabel ? false : true,
        body: `
          <div class="dialogue-grid">
            <img src="${portraitUrl(turn.portrait)}" alt="${escapeHtml(turn.speaker)}" />
            <div class="dialogue-copy">
              <strong>${escapeHtml(turn.speaker)}</strong>
              <p>${escapeHtml(turn.text).replaceAll('\n', '<br>')}</p>
            </div>
          </div>
        `,
        actions: [
          ...(index > 0 ? [{
            label: '上一句',
            close: false,
            onClick: () => { index -= 1; renderTurn(); }
          }] : []),
          ...(!finalLabel ? [{ label: '跳过叙事', close: true }] : []),
          {
            label: finalTurn ? (finalLabel ?? (state.victory ? '查看通关结算' : '继续')) : '下一句',
            className: 'primary',
            close: finalTurn,
            onClick: () => {
              if (finalTurn) after?.();
              else { index += 1; renderTurn(); }
            }
          }
        ]
      });
    };
    renderTurn();
    return;
  }

  openModal({
    kicker: dialogue.speaker,
    title: dialogue.title,
    closable: finalLabel ? false : true,
    body: `
      <div class="dialogue-grid">
        <img src="${portraitUrl(dialogue.portrait)}" alt="${escapeHtml(dialogue.speaker)}" />
        <div class="dialogue-copy">
          <strong>${escapeHtml(dialogue.speaker)}</strong>
          <p>${escapeHtml(dialogue.text).replaceAll('\n', '<br>')}</p>
        </div>
      </div>
    `,
    actions: [
      ...(!finalLabel ? [{ label: '跳过叙事' }] : []),
      { label: finalLabel ?? (state.victory && dialogueId === 'ending' ? '查看通关结算' : '继续'), className: 'primary', onClick: after }
    ]
  });
}

function updateBattlePreview() {
  const previews = getAdjacentEnemyPreviews(state);
  if (previews.length === 0) {
    elements.preview.className = 'battle-preview muted';
    elements.preview.textContent = '相邻格没有敌人。移动到敌人旁边即可查看固定损伤。';
    return;
  }
  const preview = previews[0];
  const { enemy } = preview;
  const lossClass = preview.winnable ? 'safe' : 'danger';
  const magicBlocked = preview.magicAffordable === false;
  const lossText = preview.heroDamage <= 0
    ? '无法破防'
    : magicBlocked
      ? `MP 不足（需 ${formatNumber(preview.magicCost)}）`
      : `${formatNumber(preview.totalDamage)} HP`;
  const magicText = preview.magicTier > 0
    ? ` · 附刃 ${preview.magicTier} 档（每击 +${preview.magicBonusPerHit}，本战 -${preview.magicCost} MP）`
    : '';
  elements.preview.className = 'battle-preview';
  elements.preview.innerHTML = `
    <div class="preview-enemy">
      <img src="${portraitUrl(enemy.portrait)}" alt="${escapeHtml(enemy.name)}" />
      <div>
        <h4>${escapeHtml(enemy.name)}</h4>
        <p>HP ${formatNumber(enemy.hp)} · ATK ${formatNumber(enemy.atk)} · DEF ${formatNumber(enemy.def)}</p>
        <p>${escapeHtml(specialLabel(enemy))}${magicText}${previews.length > 1 ? ` · 相邻还有 ${previews.length - 1} 名敌人` : ''}</p>
      </div>
    </div>
    <div class="preview-damage">
      <span>${magicBlocked ? '本战不能开始' : '这场会损失'}</span>
      <strong class="${lossClass}">${lossText}</strong>
    </div>
  `;
}

function updateHud() {
  const floor = FLOORS[state.floor];
  elements.floorNumber.textContent = `第 ${floor.number} 阵`;
  elements.floorTitle.textContent = floor.title;
  elements.hp.textContent = `${formatNumber(state.stats.hp)} / ${formatNumber(state.stats.maxHp)}`;
  elements.atk.textContent = formatNumber(state.stats.atk);
  elements.def.textContent = formatNumber(state.stats.def);
  elements.gold.textContent = formatNumber(state.stats.gold);
  elements.sun.textContent = state.cards.sun;
  elements.moon.textContent = state.cards.moon;
  elements.star.textContent = state.cards.star;
  const magic = describeMagicTier(state.magic);
  elements.magicTitle.textContent = magic.unlocked
    ? `魔力 ${magic.mp} / ${magic.maxMp} · 附刃 ${magic.tier} 档`
    : `魔力回收率 ${getProgressPercent(state)}%`;
  elements.magicTierButton.disabled = !magic.unlocked;
  elements.magicButton.disabled = !magic.unlocked;
  elements.challengeButton.disabled = FLOORS[state.floor].number < 11;
  elements.doctrineButton.disabled = FLOORS[state.floor].number < 11;
  elements.doctrineButton.textContent = FLOORS[state.floor].number >= 21 ? '修复章程' : '专家盟约';

  const relics = getRelicLabels(state);
  elements.relicList.innerHTML = relics.length
    ? relics.map((name) => `<span class="relic-badge">${escapeHtml(name)}</span>`).join('')
    : '<span class="muted">尚未获得</span>';

  elements.logList.innerHTML = state.logs.map((message) => `<li>${escapeHtml(message)}</li>`).join('');
  elements.codexButton.disabled = !state.relics.codex;
  elements.teleportButton.disabled = !state.relics.compass;
  updateBattlePreview();
}

function autoSave() {
  try {
    localStorage.setItem(AUTO_SAVE_KEY, serializeState(state));
  } catch (error) {
    console.warn('Autosave failed:', error);
  }
}

function saveGame() {
  try {
    localStorage.setItem(MANUAL_SAVE_KEY, serializeState(state));
    showToast('手动存档已写入浏览器。');
  } catch (error) {
    showToast(`存档失败：${error.message}`);
  }
}

function loadGame() {
  const serialized = localStorage.getItem(MANUAL_SAVE_KEY) ?? localStorage.getItem(AUTO_SAVE_KEY);
  if (!serialized) {
    showToast('没有可读取的存档。');
    return;
  }
  try {
    state = deserializeState(serialized);
    scene?.refresh();
    updateHud();
    showToast('存档读取完成。');
  } catch (error) {
    showToast(`读档失败：${error.message}`);
  }
}

function showHelp() {
  openModal({
    kicker: 'HOW TO PLAY',
    title: '地图与选择说明',
    body: `
      <div class="copy-principles">
        ${HELP_SECTIONS.map((section) => `<section><h3>${escapeHtml(section.title)}</h3><ul>${section.lines.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul></section>`).join('')}
      </div>
      <details class="route-intel-threats">
        <summary>查看完整规则与快捷键</summary>
        <p><strong>伤害公式：</strong><code>(攻击所需回合 - 1) × max(敌方攻击 - 我方防御, 0)</code>。静谧耳坠会降低无视防御的魔法伤害。</p>
        <p><strong>附刃：</strong>第十阵后解锁。每档在下一场战斗开始时消耗 10 MP；该战每次主角攻击额外 +10 伤害，仍需先物理破防。</p>
        <p><strong>专家选择：</strong>F11 选择一座专家宝库，F21 选择一座修复侧库；同一轮中其余同类区域不可进入。选择本身不消耗资源，卡牌和战斗代价会在区域内结算。</p>
        <p><strong>快捷键：</strong>方向键 / WASD 移动；V 查看四邻单位；R 专家盟约或修复章程；C 见证契约；E 图鉴；T 楼层罗盘；M 魔力附刃。触摸对象时，第一次只查看，再点同一格才行动。</p>
      </details>
    `,
    actions: [{ label: '返回游戏', className: 'primary' }]
  });
}

function renderNearbyPreview(preview) {
  if (preview.kind === 'enemy') {
    return `<p>HP ${formatNumber(preview.enemy.hp)} · ATK ${formatNumber(preview.enemy.atk)} · DEF ${formatNumber(preview.enemy.def)}</p>
      <p><strong>预计耗血：</strong>${escapeHtml(preview.damageText)} · ${escapeHtml(preview.remainingText)}</p>
      <p>${escapeHtml(preview.ruleText ?? combatRuleCopy(preview.enemy))}</p>
      ${preview.relationText ? `<p>${escapeHtml(preview.relationText)}</p>` : ''}`;
  }
  const details = preview.details?.length
    ? `<ul>${preview.details.map((entry) => `<li><strong>${escapeHtml(entry.label)}：</strong>${escapeHtml(entry.value)}</li>`).join('')}</ul>`
    : '';
  return `${preview.description ? `<p>${escapeHtml(preview.description)}</p>` : ''}
    ${preview.primaryValue ? `<p><strong>${escapeHtml(preview.primaryLabel ?? '状态')}：</strong>${escapeHtml(preview.primaryValue)}</p>` : ''}${details}`;
}

function showNearbyUnits() {
  const entries = [
    ['上方', state.x, state.y - 1],
    ['右侧', state.x + 1, state.y],
    ['下方', state.x, state.y + 1],
    ['左侧', state.x - 1, state.y]
  ].map(([direction, x, y]) => ({ direction, preview: buildMapUnitHoverPreview(state, x, y) }))
    .filter((entry) => entry.preview && entry.preview.kind !== 'hero');
  openModal({
    kicker: 'NEARBY UNITS · 不消耗资源',
    title: '四邻对象说明',
    body: entries.length
      ? `<div class="route-intel-list">${entries.map(({ direction, preview }) => `<article class="route-intel-floor"><h3>${escapeHtml(direction)} · ${escapeHtml(preview.title)}</h3>${renderNearbyPreview(preview)}</article>`).join('')}</div>`
      : '<p class="muted">四邻没有可交互对象。移动到机关、结界、敌人或物品附近后可再次查看。</p>',
    actions: [{ label: '返回游戏', className: 'primary' }]
  });
}

function showMagicBlade() {
  const magic = describeMagicTier(state.magic);
  if (!magic.unlocked) {
    showToast('第十阵黯星核心尚未解除，魔力附刃仍处于封印状态。');
    return;
  }
  const capacity = getMagicTierCapacity(state.magic);
  openModal({
    kicker: 'ARCANE BLADE',
    title: `魔力附刃 · 当前 MP ${magic.mp} / ${magic.maxMp}`,
    body: `
      <div class="dialogue-copy shop-intro" style="margin-bottom:16px">
        <p>档位只在<strong>下一场战斗开始时</strong>支付一次。每档消耗 10 MP，并使这一场中每次主角攻击额外造成 10 点伤害；仍须先以普通攻击破防。</p>
      </div>
      <div class="shop-grid magic-tier-grid">
        ${Array.from({ length: capacity + 1 }, (_, tier) => {
          const cost = getMagicTierCost(tier);
          const selected = tier === magic.tier;
          const affordable = cost <= magic.mp;
          return `
            <article class="shop-option ${selected ? 'selected-magic-tier' : ''}">
              <h3>${tier === 0 ? '关闭附刃' : `${tier} 档附刃`}</h3>
              <p>${tier === 0 ? '不消耗 MP，以基础攻击结算。' : `本战支付 ${cost} MP · 每次攻击额外 +${cost} 伤害。`}</p>
              <button data-magic-tier="${tier}" ${affordable ? '' : 'disabled'}>${selected ? '当前选择' : affordable ? '设为此档' : 'MP 不足'}</button>
            </article>`;
        }).join('')}
      </div>
    `,
    actions: [{ label: '返回游戏' }],
    afterOpen: () => {
      elements.modalBody.querySelectorAll('[data-magic-tier]').forEach((button) => {
        button.addEventListener('click', () => {
          const result = setMagicTier(state, Number(button.dataset.magicTier));
          if (!result.ok) {
            showToast(result.reason);
            return;
          }
          updateHud();
          autoSave();
          showMagicBlade();
        });
      });
    }
  });
}

function showWarCouncil() {
  const allies = getWarCouncilAllies(state);
  if (allies.length < 3) {
    showToast('可共鸣的守护者不足，无法启动王座前会战。');
    return;
  }

  let plan = {
    order: allies.slice(0, 3).map((ally) => ally.id),
    allocations: Object.fromEntries(allies.slice(0, 3).map((ally) => [ally.id, WAR_COUNCIL_MP_POOL / 3]))
  };

  const render = () => {
    const report = simulateWarCouncil(state, plan);
    const allocated = plan.order.reduce((sum, id) => sum + (Number(plan.allocations[id]) || 0), 0);
    const validPlan = report.ok && allocated === WAR_COUNCIL_MP_POOL;
    const challengeForecast = previewChallengeContract(state, report);
    const forecast = report.ok
      ? `
        <div class="war-council-forecast ${report.won ? 'safe' : 'danger'}">
          <strong>${report.won ? '预演结果：可击破全部忠诚随从' : '预演结果：我方会战失败'}</strong>
          <p>${report.records.map((duel, index) => `${index + 1}. ${escapeHtml(duel.left.name)} vs ${escapeHtml(duel.right.name)} → ${escapeHtml(duel.leftWon ? duel.left.name : duel.right.name)}胜（${duel.exchanges} 次交锋）`).join('<br>')}</p>
          ${report.won ? `<p>可支援终局：${report.survivors.map((unit) => `${escapeHtml(unit.name)} ${formatNumber(unit.hp)}/${formatNumber(unit.maxHp)}`).join('；')}。</p>
          <p>${report.modifiers.labels.map(escapeHtml).join('<br>')}</p>
          ${challengeForecast ? `<p class="challenge-result ${challengeForecast.status === 'would-complete' ? 'safe' : 'danger'}"><strong>见证契约「${escapeHtml(challengeForecast.contract.title)}」：</strong>${challengeForecast.status === 'would-complete' ? '此配置会达成。' : `此配置不会达成：${escapeHtml(challengeForecast.missing.join('；'))}。`}</p>` : ''}` : `<p>调整出战顺序或 MP 配额后再试。敌方配置不会变化。</p>${challengeForecast ? `<p class="challenge-result danger"><strong>见证契约「${escapeHtml(challengeForecast.contract.title)}」：</strong>会战未胜，无法达成。</p>` : ''}`}
        </div>`
      : `<div class="war-council-forecast danger"><strong>配置无效</strong><p>${escapeHtml(report.reason)}</p></div>`;

    openModal({
      kicker: 'WAR COUNCIL · 全信息固定数值',
      title: `共鸣 MP：${allocated} / ${WAR_COUNCIL_MP_POOL}`,
      body: `
        <div class="dialogue-copy war-council-intro">
          <p><strong>这里不会消耗主角 MP。</strong>选择 3 名盟友、决定出场顺序，并分完全部 ${WAR_COUNCIL_MP_POOL} 点共鸣 MP；下方预演会立刻显示结果。</p>
          <p>会战胜者会进入终局。已完成的盟友信物会按卡片列出的条件生效：有的只要上场，有的需要会战存活。</p>
        </div>
        <section class="war-council-enemy-list">
          <h3>敌方既定阵列</h3>
          ${WAR_COUNCIL_LOYALISTS.map((unit, index) => `<p>${index + 1}. <strong>${escapeHtml(unit.name)}</strong> · ${escapeHtml(unit.role)} · 固定 ${unit.mp} MP</p>`).join('')}
        </section>
        <section class="war-council-plan">
          <h3>我方部署</h3>
          ${plan.order.map((id, index) => `
            <article class="war-council-slot">
              <label>第 ${index + 1} 位
                <select data-council-slot="${index}">
                  ${allies.map((ally) => `<option value="${ally.id}" ${ally.id === id ? 'selected' : ''}>${escapeHtml(ally.name)} · ${escapeHtml(ally.role)}${ally.bonded ? ` · ${ally.bondActivation === 'deployed' ? '上场即生效' : '需会战存活'}` : ''}</option>`).join('')}
                </select>
              </label>
              <label>分配 MP
                <select data-council-mp="${id}">
                  ${Array.from({ length: WAR_COUNCIL_MAX_MP_PER_ALLY / WAR_COUNCIL_MP_STEP + 1 }, (_, step) => step * WAR_COUNCIL_MP_STEP)
                    .map((mp) => `<option value="${mp}" ${mp === plan.allocations[id] ? 'selected' : ''}>${mp} MP</option>`).join('')}
                </select>
              </label>
              ${allies.find((ally) => ally.id === id)?.bonded ? `<p class="war-council-bond">生效条件：${allies.find((ally) => ally.id === id).bondActivation === 'deployed' ? '上场即生效' : '会战存活'}；${escapeHtml(allies.find((ally) => ally.id === id).bondEffect)}</p>` : ''}
            </article>`).join('')}
        </section>
        ${forecast}
      `,
      actions: [
        { label: '稍后决定' },
        {
          label: '确认会战',
          className: 'primary',
          disabled: !validPlan || !report.won,
          close: false,
          onClick: () => {
            const result = resolveWarCouncil(state, plan);
            if (!result.ok) {
              showToast(result.reason);
              return;
            }
            modalClosable = true;
            closeModal();
            scene?.refresh();
            updateHud();
            autoSave();
            showToast('共鸣会战获胜：主权者的定额授权已被瓦解。', 2600);
          }
        }
      ],
      afterOpen: () => {
        elements.modalBody.querySelectorAll('[data-council-slot]').forEach((select) => {
          select.addEventListener('change', () => {
            const index = Number(select.dataset.councilSlot);
            const next = select.value;
            const previous = plan.order[index];
            const occupied = plan.order.indexOf(next);
            if (occupied >= 0) [plan.order[index], plan.order[occupied]] = [plan.order[occupied], plan.order[index]];
            else {
              plan.order[index] = next;
              plan.allocations[next] = plan.allocations[previous] ?? 0;
              delete plan.allocations[previous];
            }
            render();
          });
        });
        elements.modalBody.querySelectorAll('[data-council-mp]').forEach((select) => {
          select.addEventListener('change', () => {
            plan.allocations[select.dataset.councilMp] = Number(select.value);
            render();
          });
        });
      }
    });
  };
  render();
}

function showShop() {
  const cost = getShopCost(state);
  const multiplier = getShopEffectMultiplier(state);
  const bonus = Math.max(0, Math.round((multiplier - 1) * 100));
  const options = getShopOptions(state);
  const tier = FLOORS[state.floor]?.shopTierLabel ?? '基础咏唱';
  openModal({
    kicker: `阵间商店 · ${tier}`,
    title: `下一次咏唱需要 ${cost} 金币`,
    body: `
      <div class="dialogue-copy shop-intro" style="margin-bottom:16px">
        <p>每次购买都会立刻获得下列永久效果，并让<strong>下一次价格上升</strong>。本层效果为基础值的 <strong>${Math.round(multiplier * 100)}%</strong>${bonus > 0 ? `（额外 +${bonus}%）` : ''}。</p>
      </div>
      <div class="shop-grid">
        ${options.map((option) => `
          <article class="shop-option">
            <h3>${escapeHtml(option.label)}</h3>
            <p>${escapeHtml(option.description)}</p>
            <button data-shop-option="${option.id}" ${state.stats.gold < cost ? 'disabled' : ''}>购买 · ${cost} 金币</button>
          </article>
        `).join('')}
      </div>
    `,
    actions: [{ label: '离开商店' }],
    afterOpen: () => {
      elements.modalBody.querySelectorAll('[data-shop-option]').forEach((button) => {
        button.addEventListener('click', () => {
          const result = buyShopUpgrade(state, button.dataset.shopOption);
          if (!result.ok) {
            showToast(result.reason);
            return;
          }
          updateHud();
          autoSave();
          showShop();
        });
      });
    }
  });
}

function showCodex() {
  if (!state.relics.codex) {
    showToast('尚未获得魔眼图鉴；敌人仍可直接悬停查看数值和预计耗血。');
    return;
  }
  const entries = getCodexEntries(state);
  openModal({
    kicker: 'TACTICAL CODEX',
    title: '敌人图鉴与当前损伤',
    body: `
      <div class="codex-grid">
        ${entries.map(({ enemy, winnable, totalDamage, heroDamage, magicTier, magicCost, magicBonusPerHit }) => `
          <article class="codex-entry">
            <img src="${portraitUrl(enemy.portrait)}" alt="${escapeHtml(enemy.name)}" />
            <div>
              <h3>${escapeHtml(enemy.name)}</h3>
              <p>HP ${formatNumber(enemy.hp)} · ATK ${formatNumber(enemy.atk)} · DEF ${formatNumber(enemy.def)} · 金币 ${enemy.gold}</p>
              <p>${escapeHtml(specialLabel(enemy))}</p>
              <p class="loss">${heroDamage <= 0 ? '当前无法破防' : `预计损伤 ${formatNumber(totalDamage)} · ${winnable ? '可胜' : '会战败'}`}${magicTier > 0 ? ` · 附刃 ${magicTier} 档：每击 +${magicBonusPerHit}，本战 -${magicCost} MP` : ''}</p>
            </div>
          </article>
        `).join('')}
      </div>
    `,
    actions: [{ label: '关闭图鉴', className: 'primary' }]
  });
}

function showAct3Charter() {
  const briefing = getAct3CharterBriefing(state);
  const selected = getSelectedAct3Charter(state);
  openModal({
    kicker: 'ACT III CHARTER · 信息公开',
    title: selected ? `修复章程 · ${selected.title}` : '签署第三幕修复章程',
    closable: Boolean(selected || state.charter?.legacyOpen),
    body: `
      <div class="dialogue-copy doctrine-intro">
        <p><strong>选择本身不消耗资源。</strong>本轮只会开启一个修复区域；另外两个区域无法进入。</p>
        <p>${selected ? (briefing.completedId ? '已完成。下方保留终局效果，方便复核。' : '已锁定。卡牌和战斗代价会在对应区域结算。') : state.charter?.legacyOpen ? '旧存档保留原有开放状态。' : '离开 F21 前必须选择一次，之后不能更换。'}</p>
      </div>
      <section class="doctrine-list">
        ${briefing.entries.map((charter) => `
          <article class="doctrine-card ${charter.selected ? 'selected-doctrine' : charter.locked ? 'locked-doctrine' : ''}">
            <div class="doctrine-heading"><h3>${escapeHtml(charter.title)}</h3><span>${escapeHtml(charter.difficulty)}</span></div>
            <p><strong>关联区域：</strong>${escapeHtml(charter.route)}</p>
            <p><strong>需要付出：</strong>${escapeHtml(charter.cost)}</p>
            <p><strong>你会失去：</strong>${escapeHtml(charter.risk)}</p>
            <p><strong>终局得到：</strong>${escapeHtml(charter.payoff)}</p>
            ${charter.completed ? '<p class="doctrine-complete">本轮已完成此章程。</p>' : ''}
            ${!selected && !state.charter?.legacyOpen ? `<button data-act3-charter="${escapeHtml(charter.id)}">选择此章程</button>` : charter.selected ? '<p class="doctrine-selected-label">本轮已选择</p>' : charter.locked ? '<p class="doctrine-locked-label">本轮不可进入</p>' : ''}
          </article>`).join('')}
      </section>
    `,
    actions: selected || state.charter?.legacyOpen ? [{ label: '返回游戏', className: 'primary' }] : [],
    afterOpen: () => {
      elements.modalBody.querySelectorAll('[data-act3-charter]').forEach((button) => {
        button.addEventListener('click', () => {
          const result = selectAct3Charter(state, button.dataset.act3Charter);
          if (!result.ok) { showToast(result.reason); return; }
          updateHud();
          autoSave();
          modalClosable = true;
          closeModal();
          showToast(`已选择「${result.charter.title}」。另外两个修复区域本轮不可进入。`, 2600);
        });
      });
    }
  });
}

function showRouteDoctrine() {
  if (FLOORS[state.floor].number >= 21) {
    showAct3Charter();
    return;
  }
  if (FLOORS[state.floor].number < 11) {
    showToast('专家盟约会在第十一阵开放。');
    return;
  }
  const briefing = getRouteDoctrineBriefing(state);
  const selected = getSelectedRouteDoctrine(state);
  openModal({
    kicker: 'ACT II EXPERT PACT · 信息公开',
    title: selected ? `专家盟约 · ${selected.title}` : '签署第二章专家盟约',
    closable: Boolean(selected || state.doctrine?.legacyOpen),
    body: `
      <div class="dialogue-copy doctrine-intro">
        <p><strong>选择不扣资源。</strong>本轮会开启一座专家宝库；F12 月镜宝库不受此选择影响。</p>
        <p>${selected ? '已锁定。下方保留成本和终局效果，方便复核。' : state.doctrine?.legacyOpen ? '旧存档保留原有开放状态。' : '离开 F11 前必须选择一次，之后不能更换。'}</p>
      </div>
      <section class="doctrine-list">
        ${briefing.entries.map((doctrine) => `
          <article class="doctrine-card ${doctrine.selected ? 'selected-doctrine' : doctrine.locked ? 'locked-doctrine' : ''}">
            <div class="doctrine-heading"><h3>${escapeHtml(doctrine.title)}</h3><span>${escapeHtml(doctrine.difficulty)}</span></div>
            <p><strong>关联区域 / 卡牌：</strong>${escapeHtml(doctrine.route)} · ${escapeHtml(doctrine.cardPressure)}</p>
            <p><strong>进入后：</strong>${escapeHtml(doctrine.risk)}</p>
            ${doctrine.midgameSupport ? `<p><strong>中途得到：</strong>${escapeHtml(doctrine.midgameSupport)}</p>` : ''}
            <p><strong>终局效果：</strong>${escapeHtml(doctrine.payoff)}</p>
            <p><strong>会战目标：</strong>${escapeHtml(doctrine.councilGoal)}</p>
            ${doctrine.completed ? `<p class="doctrine-complete">已完成信物「${escapeHtml(doctrine.bondTitle ?? '')}」。</p>` : ''}
            ${!selected && !state.doctrine?.legacyOpen ? `<button data-route-doctrine="${escapeHtml(doctrine.id)}">选择这座宝库</button>` : doctrine.selected ? '<p class="doctrine-selected-label">本轮已选择</p>' : doctrine.locked ? '<p class="doctrine-locked-label">本轮不可进入</p>' : ''}
          </article>
        `).join('')}
      </section>
    `,
    actions: selected || state.doctrine?.legacyOpen ? [{ label: '返回游戏', className: 'primary' }] : [],
    afterOpen: () => {
      elements.modalBody.querySelectorAll('[data-route-doctrine]').forEach((button) => {
        button.addEventListener('click', () => {
          const result = selectRouteDoctrine(state, button.dataset.routeDoctrine);
          if (!result.ok) {
            showToast(result.reason);
            return;
          }
          updateHud();
          autoSave();
          modalClosable = true;
          closeModal();
          showToast(`已选择「${result.doctrine.title}」。其他专家宝库本轮不可进入。`, 2600);
        });
      });
    }
  });
}

function renderChallengeResult(entry) {
  if (!entry.result) return '';
  if (entry.result.status === 'completed') return '<p class="challenge-result safe">本轮已完成挑战。</p>';
  return `<p class="challenge-result danger">本轮未达成：${escapeHtml(entry.result.missing.join('；'))}。普通通关不受影响。</p>`;
}

function showWitnessContracts() {
  if (FLOORS[state.floor].number < 11) {
    showToast('见证契约在第十一阵进入第二章后开放。');
    return;
  }
  const briefing = getChallengeContractBriefing(state);
  const selected = getSelectedChallengeContract(state);
  const councilDone = Boolean(state.council?.completed);
  openModal({
    kicker: 'WITNESS CONTRACTS · 零资源',
    title: selected ? `见证契约 · ${selected.title}` : '签署一份见证契约',
    body: `
      <div class="dialogue-copy challenge-intro">
        <p><strong>这是可选挑战，不是资源交易。</strong>签署、查看和预演都不消耗资源；未完成也不影响普通通关。</p>
        <p>${selected ? '已选择；王座前会战结束后自动判定。' : councilDone ? '会战已结算，本轮没有选择挑战。' : '每轮只能选一项，之后不能更换。下方数字表示现有胜利方案中能完成它的数量。'}</p>
      </div>
      <section class="challenge-contract-list">
        ${briefing.entries.map((entry) => `
          <article class="challenge-contract ${entry.selected ? 'selected-challenge' : ''}">
            <div class="challenge-contract-heading"><h3>${escapeHtml(entry.title)}</h3><span>${escapeHtml(entry.difficulty)}</span></div>
            <p>${escapeHtml(entry.summary)}</p>
            <p class="challenge-detail">${escapeHtml(entry.detail)}</p>
            <p><strong>对应信物：</strong>${escapeHtml(entry.bondRoute ?? '无')} · ${entry.bondComplete ? '已完成' : '尚未完成'}</p>
            ${councilDone ? '' : `<p><strong>公开会战窗口：</strong>${entry.matchingPlanCount} / ${entry.totalWinningPlanCount} 套现有胜利方案会留下该盟友。</p>`}
            ${renderChallengeResult(entry)}
            ${!selected && !councilDone ? `<button data-challenge-contract="${escapeHtml(entry.id)}">签署此契约</button>` : entry.selected ? '<p class="challenge-selected-label">本轮已签署</p>' : ''}
          </article>
        `).join('')}
      </section>
    `,
    actions: [{ label: '返回游戏', className: 'primary' }],
    afterOpen: () => {
      elements.modalBody.querySelectorAll('[data-challenge-contract]').forEach((button) => {
        button.addEventListener('click', () => {
          const result = selectChallengeContract(state, button.dataset.challengeContract);
          if (!result.ok) {
            showToast(result.reason);
            return;
          }
          updateHud();
          autoSave();
          showWitnessContracts();
        });
      });
    }
  });
}

function showTeleport() {
  if (!state.relics.compass) {
    showToast('尚未获得层间罗盘。');
    return;
  }
  const visited = [...state.visitedFloors].sort((a, b) => a - b);
  openModal({
    kicker: 'FLOOR COMPASS',
    title: '选择已到达楼层',
    body: `
      <div class="teleport-grid">
        ${visited.map((floorId) => `
          <button data-floor="${floorId}" ${floorId === state.floor ? 'disabled' : ''}>
            第 ${FLOORS[floorId].number} 阵 · ${escapeHtml(FLOORS[floorId].title)}
          </button>
        `).join('')}
      </div>
    `,
    actions: [{ label: '取消' }],
    afterOpen: () => {
      elements.modalBody.querySelectorAll('[data-floor]').forEach((button) => {
        button.addEventListener('click', () => {
          const result = teleportToFloor(state, Number(button.dataset.floor));
          if (!result.ok) {
            showToast(result.reason);
            return;
          }
          modalClosable = true;
          closeModal();
          scene?.refresh();
          updateHud();
          autoSave();
        });
      });
    }
  });
}

function showVictory() {
  const ending = getEndingDebrief(state);
  openModal({
    kicker: 'CLEAR',
    title: '余烬灯塔解除',
    body: `
      <h3 class="victory-title">${escapeHtml(ending.title)}</h3>
      <p class="ending-debrief">${escapeHtml(ending.text)}</p>
      ${ending.bondTitle ? `<p><strong>已生效盟友信物：</strong>${escapeHtml(ending.bondTitle)}</p>` : ''}
      ${ending.completedCharter ? `<p><strong>完成章程：</strong>${escapeHtml(ending.completedCharter)}</p>` : ''}
      ${ending.survivorName ? `<p><strong>会战幸存者：</strong>${escapeHtml(ending.survivorName)}</p>` : ''}
      ${ending.activatedRules.length ? `<p><strong>终局支援：</strong>${ending.activatedRules.map(escapeHtml).join('；')}</p>` : ''}
      ${state.challenge?.selectedId ? `<p><strong>见证契约：</strong>${escapeHtml(getSelectedChallengeContract(state)?.title ?? '未知')} · ${state.challenge.result?.status === 'completed' ? '已达成' : `未达成${state.challenge.result?.missing?.length ? `（${escapeHtml(state.challenge.result.missing.join('；'))}）` : ''}`}</p>` : ''}
      <p><strong>已完成盟友信物：</strong>${ending.completedBondCount} / 4</p>
      <p>通关生命：<strong>${formatNumber(state.stats.hp)} / ${formatNumber(state.stats.maxHp)}</strong></p>
      <p>最终攻击 / 防御：<strong>${formatNumber(state.stats.atk)} / ${formatNumber(state.stats.def)}</strong></p>
      <p>战斗次数：<strong>${state.battles}</strong>　行动次数：<strong>${state.turns}</strong></p>
      <p>已回收第一章核心：<strong>${state.cores} / 7</strong></p>
      <p class="muted">不同盟友信物、会战幸存者与部署方案会导向不同的战后叙事；它们不是高低排序。</p>
    `,
    actions: [
      { label: '保留结算', className: 'primary' },
      { label: '重新挑战', onClick: confirmReset }
    ]
  });
}

function confirmReset() {
  openModal({
    kicker: 'RESET',
    title: '确认重新开始？',
    body: '<p>当前自动存档与手动存档都会被清除，游戏将返回第一阵。</p>',
    actions: [
      { label: '取消' },
      {
        label: '清除并重开',
        className: 'primary',
        onClick: () => {
          localStorage.removeItem(MANUAL_SAVE_KEY);
          localStorage.removeItem(AUTO_SAVE_KEY);
          state = createInitialState();
          scene?.refresh();
          updateHud();
          autoSave();
          const dialogueId = initialDialogue(state);
          if (dialogueId) showDialogue(dialogueId);
        }
      }
    ]
  });
}

function handleSceneResult(result) {
  updateHud();
  if (result.blocked) showToast(result.reason ?? '无法行动。');
  if (result.openDoctrine) {
    showRouteDoctrine();
    return;
  }
  if (result.openCharter) {
    showAct3Charter();
    return;
  }
  if (result.openCouncil) {
    if (result.dialogue) showDialogue(result.dialogue, showWarCouncil);
    else showWarCouncil();
    return;
  }
  if (result.openShop) showShop();
  if (result.dialogue) {
    showDialogue(result.dialogue, result.victory ? showVictory : null);
  } else if (result.victory) {
    showVictory();
  }
  if (result.moved || result.battle || result.floorChanged) autoSave();
}

async function loadScript(src, timeoutMs = 2500) {
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const timeout = window.setTimeout(() => {
      script.remove();
      reject(new Error(`加载超时：${src}`));
    }, timeoutMs);
    script.src = src;
    script.async = true;
    script.onload = () => {
      window.clearTimeout(timeout);
      resolve();
    };
    script.onerror = () => {
      window.clearTimeout(timeout);
      script.remove();
      reject(new Error(`加载失败：${src}`));
    };
    document.head.append(script);
  });
}

async function ensurePhaser() {
  if (globalThis.__TOWER_FORCE_CANVAS__ === true) return null;
  if (window.Phaser) return window.Phaser;
  const fallbacks = [
    'https://cdnjs.cloudflare.com/ajax/libs/phaser/3.90.0/phaser.min.js',
    'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js'
  ];
  for (const src of fallbacks) {
    try {
      await loadScript(src);
      if (window.Phaser) return window.Phaser;
    } catch (error) {
      console.warn(`Phaser fallback failed: ${src}`, error);
    }
  }
  return null;
}

function bindControls() {
  $('#btn-help').addEventListener('click', showHelp);
  $('#btn-save').addEventListener('click', saveGame);
  $('#btn-load').addEventListener('click', loadGame);
  $('#btn-reset').addEventListener('click', confirmReset);
  elements.codexButton.addEventListener('click', showCodex);
  elements.nearbyButton.addEventListener('click', showNearbyUnits);
  elements.doctrineButton.addEventListener('click', showRouteDoctrine);
  elements.challengeButton.addEventListener('click', showWitnessContracts);
  elements.teleportButton.addEventListener('click', showTeleport);
  elements.magicButton.addEventListener('click', showMagicBlade);
  elements.magicTierButton.addEventListener('click', showMagicBlade);
  elements.modalClose.addEventListener('click', closeModal);
  elements.modalRoot.querySelector('.modal-backdrop').addEventListener('click', closeModal);

  document.querySelectorAll('[data-move]').forEach((button) => {
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      scene?.move(button.dataset.move);
    });
  });

  window.addEventListener('keydown', (event) => {
    if (!elements.modalRoot.classList.contains('hidden')) return;
    if (event.key.toLowerCase() === 'e') showCodex();
    if (event.key.toLowerCase() === 'v') showNearbyUnits();
    if (event.key.toLowerCase() === 'r') showRouteDoctrine();
    if (event.key.toLowerCase() === 'c') showWitnessContracts();
    if (event.key.toLowerCase() === 't') showTeleport();
    if (event.key.toLowerCase() === 'm') showMagicBlade();
  });
}

async function boot() {
  installV8VisualLayer();
  installV83UiFixes();
  hydratePortraits();
  bindControls();
  updateHud();
  autoSave();
  const bridge = {
    getState: () => state,
    canMove: () => elements.modalRoot.classList.contains('hidden') && !state.victory,
    onResult: handleSceneResult,
    onReady: (readyScene) => {
      scene = readyScene;
      if (readyScene?.ctx) {
        applySceneThemeV8(readyScene);
        applyV83RenderFixes(readyScene);
        readyScene.refresh?.();
      }
      elements.loading.classList.add('hidden');
      const dialogueId = initialDialogue(state);
      if (dialogueId) showDialogue(dialogueId);
    }
  };

  try {
    const Phaser = await ensurePhaser();
    if (Phaser) {
      const SceneClass = createMagicTowerScene(Phaser, bridge);
      new Phaser.Game({
        type: Phaser.AUTO,
        parent: 'game-container',
        width: GRID_SIZE * TILE_SIZE,
        height: GRID_SIZE * TILE_SIZE,
        backgroundColor: '#090914',
        render: { antialias: true, pixelArt: false, roundPixels: true },
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
        scene: [SceneClass]
      });
      return;
    }
    console.info('Phaser CDN unavailable or Canvas explicitly requested; using the local Canvas renderer.');
    createCanvasTowerScene(bridge);
  } catch (error) {
    console.error(error);
    elements.loading.textContent = `启动失败：${error.message}`;
    elements.loading.classList.remove('hidden');
  }
}

boot();
