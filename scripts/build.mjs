import { copyFile, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'dist');

function replaceRequired(source, before, after, label) {
  if (!source.includes(before)) throw new Error(`${label} patch anchor missing: ${before.slice(0, 96)}`);
  return source.replace(before, after);
}

async function applyEngineProductionPatch() {
  const enginePath = join(outDir, 'src', 'game', 'engine.js');
  let source = await readFile(enginePath, 'utf8');

  source = replaceRequired(
    source,
    "  floorStates[0].map[start.y][start.x] = '.';\n\n  return {\n",
    "  floorStates[0].map[start.y][start.x] = '.';\n\n  const initialRelics = new Set(FLOORS[0]?.initialRelics ?? []);\n  if (initialRelics.size > 0) {\n    const duplicatePickupTokens = new Set([...initialRelics].map((key) => `item:${key}`));\n    for (const floorState of floorStates) {\n      for (const row of floorState.map) {\n        for (let x = 0; x < row.length; x += 1) {\n          if (duplicatePickupTokens.has(row[x])) row[x] = '.';\n        }\n      }\n    }\n  }\n  const initialRelicNames = [...initialRelics].map((key) => RELIC_LABELS[key]).filter(Boolean);\n\n  return {\n",
    'Initial relic setup'
  );
  source = replaceRequired(
    source,
    "    relics: { codex: false, compass: false, lucky: false, ward: false, holy: false },\n    relicNames: [],\n",
    "    relics: {\n      codex: initialRelics.has('codex'),\n      compass: initialRelics.has('compass'),\n      lucky: initialRelics.has('lucky'),\n      ward: initialRelics.has('ward'),\n      holy: initialRelics.has('holy')\n    },\n    relicNames: initialRelicNames,\n",
    'Initial relic state'
  );
  source = replaceRequired(
    source,
    "export function tryMove(state, dx, dy) {\n",
    "export function prepareBossEncounter(state, dx, dy) {\n  if (!state || state.victory) return null;\n  const parsed = parseToken(getTile(state, state.x + dx, state.y + dy));\n  if (parsed.type !== 'enemy') return null;\n  const enemy = ENEMIES[parsed.id];\n  const dialogue = enemy?.boss ? enemy.preBattleDialogue : null;\n  if (!dialogue || state.storySeen.includes(dialogue)) return null;\n  state.storySeen.push(dialogue);\n  addLog(state, `与「${enemy.name}」对峙。`);\n  return {\n    bossEncounter: true,\n    dialogue,\n    enemyId: parsed.id,\n    enemy,\n    moved: false,\n    blocked: false,\n    events: []\n  };\n}\n\nexport function tryMove(state, dx, dy) {\n",
    'Boss encounter prelude'
  );

  const oldShop = `export function buyShopUpgrade(state, optionId) {\n  const option = SHOP_OPTIONS.find((candidate) => candidate.id === optionId);\n  if (!option) return { ok: false, reason: '未知升级。' };\n  const cost = getShopCost(state);\n  if (state.stats.gold < cost) return { ok: false, reason: \`金币不足，需要 \${cost}。\`, cost };\n  state.stats.gold -= cost;\n  state.shopPurchases += 1;\n  applyEffect(state, option.effect);\n  addLog(state, \`商店购买「\${option.label}」，花费 \${cost} 金币。\`);\n  return { ok: true, option, cost, nextCost: getShopCost(state) };\n}\n`;
  const newShop = `export function getShopEffectMultiplier(state) {\n  const multiplier = FLOORS[state?.floor]?.shopEffectMultiplier;\n  return Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;\n}\n\nfunction describeScaledShopOption(option, effect) {\n  if (option.id === 'hp') return \`生命上限与当前生命 +\${effect.maxHp ?? effect.hp ?? 0}\`;\n  if (option.id === 'atk') return \`攻击永久 +\${effect.atk ?? 0}\`;\n  if (option.id === 'def') return \`防御永久 +\${effect.def ?? 0}\`;\n  return option.description;\n}\n\nexport function getShopOptions(state) {\n  const multiplier = getShopEffectMultiplier(state);\n  return SHOP_OPTIONS.map((option) => {\n    const effect = Object.fromEntries(Object.entries(option.effect).map(([key, value]) => [\n      key,\n      Number.isFinite(value) ? Math.ceil(value * multiplier) : value\n    ]));\n    return {\n      ...option,\n      effect,\n      multiplier,\n      description: describeScaledShopOption(option, effect)\n    };\n  });\n}\n\nexport function buyShopUpgrade(state, optionId) {\n  const option = getShopOptions(state).find((candidate) => candidate.id === optionId);\n  if (!option) return { ok: false, reason: '未知升级。' };\n  const cost = getShopCost(state);\n  if (state.stats.gold < cost) return { ok: false, reason: \`金币不足，需要 \${cost}。\`, cost };\n  state.stats.gold -= cost;\n  state.shopPurchases += 1;\n  applyEffect(state, option.effect);\n  addLog(state, \`商店购买「\${option.label}」，花费 \${cost} 金币。\`);\n  return { ok: true, option, cost, nextCost: getShopCost(state) };\n}\n`;
  source = replaceRequired(source, oldShop, newShop, 'Tiered shop engine');

  await writeFile(enginePath, source);
}

async function applyVisualReplacementPatch() {
  const scenePath = join(outDir, 'src', 'game', 'anime-canvas-scene.js');
  let source = await readFile(scenePath, 'utf8');
  const replacements = [
    [
      "import { DIRECTIONS, getTile, parseToken, tryMove } from './engine.js';\n",
      "import { DIRECTIONS, getTile, parseToken, prepareBossEncounter, tryMove } from './engine.js';\n"
    ],
    [
      "import { getMapAsset, preloadMapAssets } from './map-assets.js';\n",
      "import { getMapAsset, preloadMapAssets } from './map-assets.js';\nimport { getReplacementAsset, getReplacementAssetMeta, preloadReplacementAssets } from './replacement-assets.js';\n"
    ],
    [
      "      preloadEnemyAssets(),\n      preloadMapAssets()\n",
      "      preloadEnemyAssets(),\n      preloadMapAssets(),\n      preloadReplacementAssets()\n"
    ],
    [
      "    // Facing changes even when movement is blocked, matching classic tile RPGs.\n    this.direction = direction;\n    const result = tryMove(this.bridge.getState(), vector.dx, vector.dy);\n",
      "    // Facing changes even when movement is blocked, matching classic tile RPGs.\n    this.direction = direction;\n    const prelude = prepareBossEncounter(this.bridge.getState(), vector.dx, vector.dy);\n    if (prelude) {\n      const result = { ...prelude, resumeDirection: direction };\n      this.bridge.onResult(result);\n      return result;\n    }\n    const result = tryMove(this.bridge.getState(), vector.dx, vector.dy);\n"
    ],
    [
      "  drawMapAsset(name, x, y, scale = 1, rotation = 0, alpha = 1, offsetY = 0) {\n    const image = getMapAsset(name);\n    if (!image) return false;\n    const size = TILE_SIZE * scale;\n    return this.drawMapImage(image, this.center(x), this.center(y) + offsetY * TILE_SIZE, size, size, rotation, alpha);\n  }\n\n",
      "  drawMapAsset(name, x, y, scale = 1, rotation = 0, alpha = 1, offsetY = 0) {\n    const image = getMapAsset(name);\n    if (!image) return false;\n    const size = TILE_SIZE * scale;\n    return this.drawMapImage(image, this.center(x), this.center(y) + offsetY * TILE_SIZE, size, size, rotation, alpha);\n  }\n\n  drawReplacementAsset(key, x, y, scale = 1) {\n    const image = getReplacementAsset(key);\n    if (!image) return false;\n    const meta = getReplacementAssetMeta(key) ?? {};\n    const resolvedScale = scale * (Number.isFinite(meta.scale) ? meta.scale : 1);\n    const size = TILE_SIZE * resolvedScale;\n    return this.drawMapImage(image, this.center(x), this.center(y), size, size);\n  }\n\n  drawVineGate(x, y) {\n    const cx = this.center(x);\n    const cy = this.center(y);\n    const left = cx - TILE_SIZE * 0.28;\n    const right = cx + TILE_SIZE * 0.28;\n    const top = cy - TILE_SIZE * 0.31;\n    const bottom = cy + TILE_SIZE * 0.35;\n    this.ctx.save();\n    this.ctx.lineCap = 'round';\n    this.ctx.lineJoin = 'round';\n    this.ctx.shadowColor = 'rgba(116,255,166,.55)';\n    this.ctx.shadowBlur = 6;\n    this.ctx.strokeStyle = '#245c3b';\n    this.ctx.lineWidth = 6;\n    this.ctx.beginPath();\n    this.ctx.moveTo(left, bottom);\n    this.ctx.bezierCurveTo(left - 2, cy + 4, left + 2, top + 8, cx, top);\n    this.ctx.bezierCurveTo(right - 2, top + 8, right + 2, cy + 4, right, bottom);\n    this.ctx.stroke();\n    this.ctx.shadowBlur = 0;\n    this.ctx.strokeStyle = '#78d98b';\n    this.ctx.lineWidth = 1.7;\n    this.ctx.beginPath();\n    this.ctx.moveTo(left, bottom);\n    this.ctx.quadraticCurveTo(left + 4, cy - 6, cx, top + 2);\n    this.ctx.quadraticCurveTo(right - 4, cy - 6, right, bottom);\n    this.ctx.stroke();\n    const leaves = [\n      [left - 4, cy + 10, -0.7], [left + 4, cy - 4, 0.6], [left + 2, top + 11, -0.4],\n      [right + 4, cy + 10, 0.7], [right - 4, cy - 4, -0.6], [right - 2, top + 11, 0.4],\n      [cx - 8, top + 2, -0.2], [cx + 8, top + 2, 0.2]\n    ];\n    for (const [lx, ly, rotation] of leaves) {\n      this.ctx.save();\n      this.ctx.translate(lx, ly);\n      this.ctx.rotate(rotation);\n      this.ctx.beginPath();\n      this.ctx.ellipse(0, 0, 5.3, 2.7, 0, 0, Math.PI * 2);\n      this.ctx.fillStyle = '#53b96c';\n      this.ctx.fill();\n      this.ctx.restore();\n    }\n    this.ctx.restore();\n    return true;\n  }\n\n"
    ],
    [
      "    const image = getEnemyAsset(enemy.portrait);\n    const meta = getEnemyAssetMeta(enemy.portrait) ?? {};\n",
      "    const replacementKey = `enemy:${enemy.portrait}`;\n    const replacementImage = getReplacementAsset(replacementKey);\n    const image = replacementImage ?? getEnemyAsset(enemy.portrait);\n    const meta = replacementImage\n      ? (getReplacementAssetMeta(replacementKey) ?? {})\n      : (getEnemyAssetMeta(enemy.portrait) ?? {});\n"
    ],
    [
      "    if (parsed.type === 'gate') {\n      if (!this.drawMapAsset('portal-transfer', x, y, 0.9)) {\n        this.drawTileIcon(parsed.id === 'tri' ? TILE_INDEX.sequenceSwitch : TILE_INDEX.panel, x, y, 0.86);\n      }\n      return;\n    }\n",
      "    if (parsed.type === 'gate') {\n      if (parsed.id === 'vine') {\n        this.drawVineGate(x, y);\n        return;\n      }\n      if (this.drawReplacementAsset(`gate:${parsed.id}`, x, y)) return;\n      if (!this.drawMapAsset('portal-transfer', x, y, 0.9)) {\n        this.drawTileIcon(parsed.id === 'tri' ? TILE_INDEX.sequenceSwitch : TILE_INDEX.panel, x, y, 0.86);\n      }\n      return;\n    }\n"
    ],
    [
      "    if (parsed.type === 'item') {\n      const item = ITEMS[parsed.id];\n      if (item?.kind === 'card') {\n        this.drawItem(ITEM_INDEX[item.card], x, y, 0.68);\n        return;\n      }\n      const index = ITEM_INDEX[parsed.id];\n",
      "    if (parsed.type === 'item') {\n      const item = ITEMS[parsed.id];\n      if (item?.kind === 'card') {\n        this.drawItem(ITEM_INDEX[item.card], x, y, 0.68);\n        return;\n      }\n      if (this.drawReplacementAsset(`item:${parsed.id}`, x, y)) return;\n      const index = ITEM_INDEX[parsed.id];\n"
    ]
  ];

  for (const [before, after] of replacements) {
    source = replaceRequired(source, before, after, 'Visual production');
  }
  await writeFile(scenePath, source);
}

async function applyTacticalInteractionPatch() {
  const interactionPath = join(outDir, 'src', 'game', 'tactical-interaction.js');
  let source = await readFile(interactionPath, 'utf8');
  source = replaceRequired(
    source,
    "  ITEMS,\n  SHOP_OPTIONS,\n  getShopCost\n} from './data.js';\n",
    "  ITEMS,\n  getShopCost\n} from './data.js';\n",
    'Tactical shop data import'
  );
  source = replaceRequired(
    source,
    "  deserializeState,\n  getFloorState,\n  getTile,\n  parseToken\n} from './engine.js';\n",
    "  deserializeState,\n  getFloorState,\n  getShopEffectMultiplier,\n  getShopOptions,\n  getTile,\n  parseToken\n} from './engine.js';\n",
    'Tactical shop engine import'
  );
  const oldShopHover = `function buildShopHoverPreview(state) {\n  const cost = getShopCost(state);\n  const affordable = state.stats.gold >= cost;\n  return {\n    kind: 'shop',\n    title: '阵间商店 · 珂珂',\n    badge: '商店',\n    tone: affordable ? 'safe' : 'warning',\n    description: '把敌人掉落的金币转换为永久成长；每次购买后价格会上升。',\n    primaryLabel: '下一次购买',\n    primaryValue: \`\${formatNumber(cost)} 金币\`,\n    details: [\n      detail('当前金币', \`\${formatNumber(state.stats.gold)} · \${affordable ? '可以购买' : '金币不足'}\`),\n      ...SHOP_OPTIONS.map((option) => detail(option.label, option.description))\n    ]\n  };\n}\n`;
  const newShopHover = `function buildShopHoverPreview(state) {\n  const cost = getShopCost(state);\n  const affordable = state.stats.gold >= cost;\n  const multiplier = getShopEffectMultiplier(state);\n  const bonus = Math.max(0, Math.round((multiplier - 1) * 100));\n  const options = getShopOptions(state);\n  return {\n    kind: 'shop',\n    title: \`阵间商店 · \${FLOORS[state.floor]?.shopTierLabel ?? '基础咏唱'}\`,\n    badge: bonus > 0 ? \`效率 +\${bonus}%\` : '商店',\n    tone: affordable ? 'safe' : 'warning',\n    description: bonus > 0\n      ? \`本层商店的永久成长效率提高约 \${bonus}%；每次购买后价格仍会全局上升。\`\n      : '把敌人掉落的金币转换为永久成长；每次购买后价格会上升。',\n    primaryLabel: '下一次购买',\n    primaryValue: \`\${formatNumber(cost)} 金币\`,\n    details: [\n      detail('当前金币', \`\${formatNumber(state.stats.gold)} · \${affordable ? '可以购买' : '金币不足'}\`),\n      ...options.map((option) => detail(option.label, option.description))\n    ]\n  };\n}\n`;
  source = replaceRequired(source, oldShopHover, newShopHover, 'Tactical shop hover');
  source = replaceRequired(
    source,
    "  stats.textContent = `HP ${formatNumber(preview.enemy.hp)} · ATK ${formatNumber(preview.enemy.atk)} · DEF ${formatNumber(preview.enemy.def)}`;",
    "  stats.textContent = `HP ${formatNumber(preview.enemy.hp)} · ATK ${formatNumber(preview.enemy.atk)} · DEF ${formatNumber(preview.enemy.def)} · 击败奖励 ${formatNumber(preview.enemy.gold ?? 0)} 金币`;",
    'Enemy gold disclosure'
  );
  await writeFile(interactionPath, source);
}

async function applyMainProductionPatch() {
  const mainPath = join(outDir, 'src', 'main.js');
  let source = await readFile(mainPath, 'utf8');
  source = replaceRequired(
    source,
    "import { ENEMIES, FLOORS, GRID_SIZE, SHOP_OPTIONS, TILE_SIZE, getShopCost } from './game/data.js';\n",
    "import { ENEMIES, FLOORS, GRID_SIZE, TILE_SIZE, getShopCost } from './game/data.js';\n",
    'Main shop data import'
  );
  source = replaceRequired(
    source,
    "  getProgressPercent,\n  getRelicLabels,\n  initialDialogue,\n",
    "  getProgressPercent,\n  getRelicLabels,\n  getShopEffectMultiplier,\n  getShopOptions,\n  initialDialogue,\n",
    'Main shop engine import'
  );

  const oldDialogue = `function showDialogue(dialogueId, after = null) {\n  const dialogue = getDialogue(dialogueId);\n  if (!dialogue) return;\n  openModal({\n    kicker: dialogue.speaker,\n    title: dialogue.title,\n    body: \`\n      <div class="dialogue-grid">\n        <img src="\${portraitUrl(dialogue.portrait)}" alt="\${escapeHtml(dialogue.speaker)}" />\n        <div class="dialogue-copy">\n          <strong>\${escapeHtml(dialogue.speaker)}</strong>\n          <p>\${escapeHtml(dialogue.text).replaceAll('\\n', '<br>')}</p>\n        </div>\n      </div>\n    \`,\n    actions: [{ label: state.victory && dialogueId === 'ending' ? '查看通关结算' : '继续', className: 'primary', onClick: after }]\n  });\n}\n`;
  const newDialogue = `function showDialogue(dialogueId, after = null, { finalLabel = null } = {}) {\n  const dialogue = getDialogue(dialogueId);\n  if (!dialogue) return;\n  const turns = Array.isArray(dialogue.turns) && dialogue.turns.length\n    ? dialogue.turns\n    : [{ speaker: dialogue.speaker, portrait: dialogue.portrait, text: dialogue.text }];\n  let index = 0;\n\n  const renderTurn = () => {\n    const turn = turns[index];\n    const isLast = index >= turns.length - 1;\n    const label = isLast\n      ? (finalLabel ?? (state.victory ? '查看通关结算' : '继续'))\n      : \`继续 · \${index + 2}/\${turns.length}\`;\n    openModal({\n      kicker: turn.speaker,\n      title: dialogue.title,\n      closable: finalLabel ? false : true,\n      body: \`\n        <div class="dialogue-grid">\n          <img src="\${portraitUrl(turn.portrait)}" alt="\${escapeHtml(turn.speaker)}" />\n          <div class="dialogue-copy">\n            <strong>\${escapeHtml(turn.speaker)}</strong>\n            <p>\${escapeHtml(turn.text).replaceAll('\\n', '<br>')}</p>\n          </div>\n        </div>\n      \`,\n      actions: [{\n        label,\n        className: 'primary',\n        close: isLast,\n        onClick: () => {\n          if (isLast) after?.();\n          else {\n            index += 1;\n            renderTurn();\n          }\n        }\n      }]\n    });\n  };\n\n  renderTurn();\n}\n`;
  source = replaceRequired(source, oldDialogue, newDialogue, 'Multi-turn dialogue');

  source = replaceRequired(
    source,
    "      <p>方向键或 WASD 移动；点击相邻格也可行动。E 打开图鉴，T 打开楼层罗盘。游戏会自动存档，也可使用顶部按钮建立手动存档。</p>\n",
    "      <p>魔眼图鉴与层间罗盘为初始持有物：E 打开图鉴，T 打开楼层罗盘。方向键或 WASD 移动；点击相邻格也可行动。</p>\n      <p>商店只设置在第 1、5、9 阵。越靠后的商店永久成长效率越高，因此可以选择早买保命，或保存金币换取后期更高收益。</p>\n",
    'Help economy disclosure'
  );

  const oldShop = `function showShop() {\n  const cost = getShopCost(state);\n  openModal({\n    kicker: '阵间商店 · 珂珂',\n    title: \`下一次咏唱需要 \${cost} 金币\`,\n    body: \`\n      <div class="dialogue-grid" style="margin-bottom:16px">\n        <img src="\${portraitUrl('merchant')}" alt="阵间商人珂珂" />\n        <div class="dialogue-copy"><p>“金币是敌方术式崩解后的残余魔力。放心使用，它不会影响其他结局。”</p></div>\n      </div>\n      <div class="shop-grid">\n        \${SHOP_OPTIONS.map((option) => \`\n          <article class="shop-option">\n            <h3>\${escapeHtml(option.label)}</h3>\n            <p>\${escapeHtml(option.description)}</p>\n            <button data-shop-option="\${option.id}" \${state.stats.gold < cost ? 'disabled' : ''}>购买 · \${cost} 金币</button>\n          </article>\n        \`).join('')}\n      </div>\n    \`,\n    actions: [{ label: '离开商店' }],\n    afterOpen: () => {\n      elements.modalBody.querySelectorAll('[data-shop-option]').forEach((button) => {\n        button.addEventListener('click', () => {\n          const result = buyShopUpgrade(state, button.dataset.shopOption);\n          if (!result.ok) {\n            showToast(result.reason);\n            return;\n          }\n          updateHud();\n          autoSave();\n          showShop();\n        });\n      });\n    }\n  });\n}\n`;
  const newShop = `function showShop() {\n  const cost = getShopCost(state);\n  const multiplier = getShopEffectMultiplier(state);\n  const bonus = Math.max(0, Math.round((multiplier - 1) * 100));\n  const options = getShopOptions(state);\n  const tier = FLOORS[state.floor]?.shopTierLabel ?? '基础咏唱';\n  openModal({\n    kicker: \`阵间商店 · \${tier}\`,\n    title: \`下一次咏唱需要 \${cost} 金币\`,\n    body: \`\n      <div class="dialogue-copy shop-intro" style="margin-bottom:16px">\n        <p>金币是敌方术式崩解后的残余魔力。本层永久成长效率为 <strong>\${Math.round(multiplier * 100)}%</strong>\${bonus > 0 ? \`（比底层约高 \${bonus}%）\` : ''}。</p>\n      </div>\n      <div class="shop-grid">\n        \${options.map((option) => \`\n          <article class="shop-option">\n            <h3>\${escapeHtml(option.label)}</h3>\n            <p>\${escapeHtml(option.description)}</p>\n            <button data-shop-option="\${option.id}" \${state.stats.gold < cost ? 'disabled' : ''}>购买 · \${cost} 金币</button>\n          </article>\n        \`).join('')}\n      </div>\n    \`,\n    actions: [{ label: '离开商店' }],\n    afterOpen: () => {\n      elements.modalBody.querySelectorAll('[data-shop-option]').forEach((button) => {\n        button.addEventListener('click', () => {\n          const result = buyShopUpgrade(state, button.dataset.shopOption);\n          if (!result.ok) {\n            showToast(result.reason);\n            return;\n          }\n          updateHud();\n          autoSave();\n          showShop();\n        });\n      });\n    }\n  });\n}\n`;
  source = replaceRequired(source, oldShop, newShop, 'Portrait-free tiered shop');

  const oldResult = `function handleSceneResult(result) {\n  updateHud();\n  if (result.blocked) showToast(result.reason ?? '无法行动。');\n  if (result.openShop) showShop();\n  if (result.dialogue) {\n    showDialogue(result.dialogue, result.victory ? showVictory : null);\n  } else if (result.victory) {\n    showVictory();\n  }\n  if (result.moved || result.battle || result.floorChanged) autoSave();\n}\n`;
  const newResult = `function handleSceneResult(result) {\n  updateHud();\n  if (result.blocked) showToast(result.reason ?? '无法行动。');\n  if (result.openShop) showShop();\n  if (result.bossEncounter && result.dialogue) {\n    showDialogue(result.dialogue, () => scene?.move(result.resumeDirection), { finalLabel: '开战' });\n  } else if (result.dialogue) {\n    showDialogue(result.dialogue, result.victory ? showVictory : null);\n  } else if (result.victory) {\n    showVictory();\n  }\n  if (result.moved || result.battle || result.floorChanged || result.bossEncounter) autoSave();\n}\n`;
  source = replaceRequired(source, oldResult, newResult, 'Boss dialogue result flow');

  await writeFile(mainPath, source);
}

function assertBuild(condition, message) {
  if (!condition) throw new Error(`Production build validation failed: ${message}`);
}

async function validateProductionDemoBuild() {
  const moduleUrl = (relativePath) => pathToFileURL(join(outDir, relativePath)).href;
  const data = await import(moduleUrl('src/game/data.js'));
  const content = await import(moduleUrl('src/game/demo-10-floor-content.js'));
  const hardMode = await import(moduleUrl('src/game/demo-10-floor-hard-mode.js'));
  content.applyDemoTenFloorContent({
    enemies: data.ENEMIES,
    floors: data.FLOORS,
    dialogues: data.DIALOGUES,
    gridSize: data.GRID_SIZE
  });
  hardMode.applyDemoTenFloorHardMode({ enemies: data.ENEMIES });

  const engine = await import(moduleUrl('src/game/engine.js'));
  const state = engine.createInitialState();
  assertBuild(state.relics.codex === true && state.relics.compass === true, 'Codex and Compass must be initial relics.');
  assertBuild(!state.floorStates.some((floorState) => floorState.map.some((row) => row.includes('item:codex') || row.includes('item:compass'))), 'Initial relic pickups must not remain as dead map rewards.');

  const shopFloors = data.FLOORS.filter((floor) => floor.map.some((row) => row.includes('shop'))).map((floor) => floor.number);
  assertBuild(JSON.stringify(shopFloors) === JSON.stringify([1, 5, 9]), `Shop floors must be 1/5/9, got ${shopFloors.join('/')}.`);

  const shopSamples = [];
  for (const floorIndex of [0, 4, 8]) {
    state.floor = floorIndex;
    const options = engine.getShopOptions(state);
    shopSamples.push({ floor: data.FLOORS[floorIndex].number, multiplier: engine.getShopEffectMultiplier(state), options });
  }
  assertBuild(shopSamples[0].options.find((option) => option.id === 'atk').effect.atk === 5, 'F1 ATK shop must remain +5.');
  assertBuild(shopSamples[1].options.find((option) => option.id === 'atk').effect.atk === 6, 'F5 ATK shop must scale to +6.');
  assertBuild(shopSamples[2].options.find((option) => option.id === 'atk').effect.atk === 7, 'F9 ATK shop must scale to +7.');
  assertBuild(shopSamples[2].options.find((option) => option.id === 'hp').effect.hp === 1170, 'F9 HP shop must scale to +1170.');

  const preludeState = engine.createInitialState();
  preludeState.x = 7;
  preludeState.y = 1;
  const prelude = engine.prepareBossEncounter(preludeState, 1, 0);
  assertBuild(prelude?.bossEncounter === true && prelude.dialogue === 'bossCatPreDemo', 'F1 boss must open a pre-battle dialogue.');
  assertBuild(engine.prepareBossEncounter(preludeState, 1, 0) === null, 'Boss pre-battle dialogue must trigger only once.');

  const demoSequences = Object.entries(data.DIALOGUES).filter(([id, dialogue]) => id.endsWith('Demo') && Array.isArray(dialogue?.turns));
  assertBuild(demoSequences.length >= 20, 'Every floor must provide pre/post boss dialogue sequences.');
  assertBuild(demoSequences.every(([, dialogue]) => dialogue.turns.length >= 2 && dialogue.turns.length <= 5), 'Boss dialogue sequences must stay within 2-5 turns.');
  assertBuild(data.ENEMIES.blackSealKeeper.magicPower === hardMode.DEMO10_HARD_MODE_PRESSURE.blackSealKeeperMagicPower, 'F9 boss magic pressure mismatch.');
  assertBuild(data.ENEMIES.blackSealKeeper.def === hardMode.DEMO10_HARD_MODE_PRESSURE.blackSealKeeperDef, 'F9 boss DEF pressure mismatch.');
  assertBuild(data.ENEMIES.voidCore.hp > 3400 && data.ENEMIES.voidCore.magicPower > 164, 'F10 final core must receive the high-floor pressure ramp.');

  const quality = await import(moduleUrl('src/game/demo-10-floor-quality.js'));
  const strategy = await import(moduleUrl('src/solver/greedy-strategy.js'));
  const reports = quality.DEMO10_SIMPLE_BUILD_PORTFOLIO.map((shopCycle) => strategy.runGreedyShopStrategy({
    shopCycle,
    holyPolicy: 'immediate',
    maxIterations: 10_000
  }));
  const winners = reports.filter((report) => report.solvable);
  assertBuild(winners.length >= 2, `At least two basic shop cycles must remain playable, got ${winners.length}/6.`);
  assertBuild(winners.length <= 5, `Hard production profile must not make all six basic cycles trivial, got ${winners.length}/6.`);
  assertBuild(winners.some((report) => report.purchaseLog.some((entry) => entry.floor === 9)), 'At least one winning route must use the F9 enhanced shop.');

  console.log('PRODUCTION_DEMO_BUILD', JSON.stringify({
    initialRelics: state.relics,
    shopFloors,
    shopSamples: shopSamples.map((sample) => ({
      floor: sample.floor,
      multiplier: sample.multiplier,
      effects: Object.fromEntries(sample.options.map((option) => [option.id, option.effect]))
    })),
    hardPressure: hardMode.DEMO10_HARD_MODE_PRESSURE,
    simpleBuilds: reports.map((report) => ({
      cycle: report.shopCycle.join('-'),
      solvable: report.solvable,
      floor: report.floor,
      hp: report.final.hp,
      atk: report.final.atk,
      def: report.final.def,
      purchases: report.purchases,
      failure: report.failure
    }))
  }));
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
await copyFile(join(root, 'index.html'), join(outDir, 'index.html'));
await copyFile(join(root, 'styles.css'), join(outDir, 'styles.css'));
await copyFile(join(root, 'anime.css'), join(outDir, 'anime.css'));
await copyFile(join(root, 'ui-v8-4.css'), join(root, 'dist/ui-v8-4.css'));
await copyFile(join(root, 'ui-v8-5.css'), join(root, 'dist/ui-v8-5.css'));
await cp(join(root, 'src'), join(outDir, 'src'), { recursive: true });
await cp(join(root, 'public'), outDir, { recursive: true });
await applyEngineProductionPatch();
await applyVisualReplacementPatch();
await applyTacticalInteractionPatch();
await applyMainProductionPatch();
await validateProductionDemoBuild();
console.log(`Static build written to ${outDir}`);
