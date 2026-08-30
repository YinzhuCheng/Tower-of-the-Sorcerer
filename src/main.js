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
import { describeMagicTier, getMagicTierCapacity, getMagicTierCost } from './game/magic-blade.js';
import {
  getWarCouncilAllies,
  simulateWarCouncil,
  WAR_COUNCIL_LOYALISTS,
  WAR_COUNCIL_MAX_MP_PER_ALLY,
  WAR_COUNCIL_MP_POOL,
  WAR_COUNCIL_MP_STEP
} from './game/war-council.js';
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
  objective: $('#floor-objective'),
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
  if (enemy.special === 'magic') return `魔法伤害 ${enemy.magicPower}/次`;
  if (enemy.special === 'firstStrike') return '先制攻击';
  if (enemy.special === 'doubleHit') return '二连击';
  return '普通攻击';
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
    actions: [{ label: finalLabel ?? (state.victory && dialogueId === 'ending' ? '查看通关结算' : '继续'), className: 'primary', onClick: after }]
  });
}

function updateBattlePreview() {
  if (!state.relics.codex) {
    elements.preview.className = 'battle-preview muted';
    elements.preview.textContent = '魔眼图鉴尚未取得。第一阵中藏有这件宝物。';
    return;
  }
  const previews = getAdjacentEnemyPreviews(state);
  if (previews.length === 0) {
    elements.preview.className = 'battle-preview muted';
    elements.preview.textContent = '相邻格没有敌人。移动到敌人旁边即可查看固定损伤。';
    return;
  }
  const preview = previews[0];
  const { enemy } = preview;
  const lossClass = preview.winnable ? 'safe' : 'danger';
  const lossText = preview.heroDamage <= 0 ? '无法破防' : `${formatNumber(preview.totalDamage)} HP`;
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
        <p>${escapeHtml(specialLabel(enemy))}${magicText}${previews.length > 1 ? ` · 邻格共 ${previews.length} 名敌人` : ''}</p>
      </div>
    </div>
    <div class="preview-damage">
      <span>预计损伤</span>
      <strong class="${lossClass}">${lossText}</strong>
    </div>
  `;
}

function updateHud() {
  const floor = FLOORS[state.floor];
  elements.floorNumber.textContent = `第 ${floor.number} 阵`;
  elements.floorTitle.textContent = floor.title;
  elements.objective.textContent = floor.objective;
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
    kicker: 'RULES',
    title: '固定数值魔塔规则',
    body: `
      <p><strong>战斗没有随机数。</strong>主角先攻击；若攻击不高于敌人防御，则无法交战。普通敌人的总损伤为：</p>
      <p><code>(需要攻击回合数 - 1) × max(敌方攻击 - 主角防御, 0)</code></p>
      <p>先制敌人会额外攻击一次；二连击每次反击造成两段伤害；魔法攻击无视防御，但可被“静谧耳坠”削减。</p>
      <p>日曜、月辉、星蚀卡分别解除对应颜色的魔力结界。钥匙资源可能决定路线，开启结界前应先查看后方收益。</p>
      <p>魔眼图鉴与层间罗盘为初始持有物：E 打开图鉴，T 打开楼层罗盘。方向键或 WASD 移动；点击相邻格也可行动。</p>
      <p>商店每十层只设置一处：第 5 阵用于第一章的属性转换，第 15 阵额外提供补魔与扩容。商店不是例行补给站；金币、卡片与 MP 都需要为后续门槛保留。</p>
      <p><strong>第二章魔力附刃。</strong>击败第十阵的黯星核心后，魔力恢复为 100 / 100。可在任意非战斗时设置档位；每一档在一场战斗开始时支付 10 MP，并令该场每次主角攻击额外造成 10 点伤害。附刃不能替代物理破防。</p>
    `,
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
    const forecast = report.ok
      ? `
        <div class="war-council-forecast ${report.won ? 'safe' : 'danger'}">
          <strong>${report.won ? '预演结果：可击破全部忠诚随从' : '预演结果：我方会战失败'}</strong>
          <p>${report.records.map((duel, index) => `${index + 1}. ${escapeHtml(duel.left.name)} vs ${escapeHtml(duel.right.name)} → ${escapeHtml(duel.leftWon ? duel.left.name : duel.right.name)}胜（${duel.exchanges} 次交锋）`).join('<br>')}</p>
          ${report.won ? `<p>可支援终局：${report.survivors.map((unit) => `${escapeHtml(unit.name)} ${formatNumber(unit.hp)}/${formatNumber(unit.maxHp)}`).join('；')}。</p>
          <p>${report.modifiers.labels.map(escapeHtml).join('<br>')}</p>` : '<p>调整出战顺序或 MP 配额后再试。敌方配置不会变化。</p>'}
        </div>`
      : `<div class="war-council-forecast danger"><strong>配置无效</strong><p>${escapeHtml(report.reason)}</p></div>`;

    openModal({
      kicker: 'WAR COUNCIL · 全信息固定数值',
      title: `共鸣 MP：${allocated} / ${WAR_COUNCIL_MP_POOL}`,
      body: `
        <div class="dialogue-copy war-council-intro">
          <p>敌方顺序和魔力配额已经公开；我方必须派出三名盟友并分配全部共鸣 MP。胜者带着剩余战意进入下一轮，所有数值均可预演。</p>
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
                  ${allies.map((ally) => `<option value="${ally.id}" ${ally.id === id ? 'selected' : ''}>${escapeHtml(ally.name)} · ${escapeHtml(ally.role)}</option>`).join('')}
                </select>
              </label>
              <label>分配 MP
                <select data-council-mp="${id}">
                  ${Array.from({ length: WAR_COUNCIL_MAX_MP_PER_ALLY / WAR_COUNCIL_MP_STEP + 1 }, (_, step) => step * WAR_COUNCIL_MP_STEP)
                    .map((mp) => `<option value="${mp}" ${mp === plan.allocations[id] ? 'selected' : ''}>${mp} MP</option>`).join('')}
                </select>
              </label>
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
        <p>金币是敌方术式崩解后的残余魔力。本层永久成长效率为 <strong>${Math.round(multiplier * 100)}%</strong>${bonus > 0 ? `（比底层约高 ${bonus}%）` : ''}。</p>
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
    showToast('尚未获得魔眼图鉴。');
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
  openModal({
    kicker: 'CLEAR',
    title: '七重魔法阵解除',
    body: `
      <h3 class="victory-title">魔法重新被选择</h3>
      <p>通关生命：<strong>${formatNumber(state.stats.hp)} / ${formatNumber(state.stats.maxHp)}</strong></p>
      <p>最终攻击 / 防御：<strong>${formatNumber(state.stats.atk)} / ${formatNumber(state.stats.def)}</strong></p>
      <p>战斗次数：<strong>${state.battles}</strong>　行动次数：<strong>${state.turns}</strong></p>
      <p>已回收魔力核心：<strong>${state.cores} / 7</strong></p>
      <p class="muted">可读取旧存档探索其他资源路线，或重开挑战更少商店购买的通关方式。</p>
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
