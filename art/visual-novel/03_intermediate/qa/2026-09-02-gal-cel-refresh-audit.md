# 2026-09-02 GAL 运行时美术审计

审计依据是 `src/main.js` 中 `#gal-root` 的实际加载路径，而不是目录名推测。

## 必须重画并已替换（19）

| 类别 | 数量 | 文件 | 结论 |
| --- | ---: | --- | --- |
| 普通背景 | 11 | `public/assets/anime/themes/theme-{forest-approach,night-tower,sun-sanctum,ocean-archive,red-vein,star-mirror,echo-court,origin-core,ash-registry,archive-storm,ember-lighthouse}.webp` | 旧图偏厚涂/高细节；上一轮 7 张还存在低分辨率、场景语义错位与 `star-mirror` 解码异常。全部重画为无人赛璐璐 GAL 背景。 |
| 剧情 CG | 6 | `liyue-{prologue-tower,noctia-truth,noctia-seal,echo-ledger,noctia-sovereign,lighthouse-archive}-cg.webp` | 旧图偏海报式厚涂。全部按同一背景母版重画；序章改为无人物的七核心环境镜头。 |
| 转场 | 2 | `witness-entry.webp`、`seal-shatter.webp` | 旧图碎纹与锐利细节过多。重画为大形状、低噪点转场。 |

## 保护不动

- `public/assets/anime/characters/`：全部立绘与表情差分。
- `public/assets/anime/avatars/`：全部头像与表情。

## 检查后排除

- `liyue-critical-cg.webp`、`liyue-defeat-cg.webp`：属于战斗弹窗，不进入 `#gal-root`。
- `liyue-noctia-afterlight-cg.webp`：当前没有运行时代码引用。
- `theme-forest-sanctuary.webp`：仅用于地图画布主题，不是 GAL 背景。

## 验收门槛

- 19 张运行时图全部为可解码 WebP，尺寸固定为 `1672x941`。
- 普通背景没有人物、文字或 UI，底部对话框区保持低细节。
- 所有新图遵守 `gal-cel-refresh-v3.md` 的风格锁。
- 运行时路径不变，并通过 `20260902-cel3` 查询版本强制刷新同名静态资源缓存。
- 被换掉的运行时图、WebP 母版与 PNG 源图位于 `07_archive/2026-09-02-pre-cel-gal-refresh/`。

## 最终运行时清单

以下清单由生产入口 `src/demo-main.js` 组装完整 30F 内容后，再沿 `src/main.js` 的 `GAL_BACKDROPS`、`GAL_TRANSITIONS`、`turn.cg` 与 `dialoguePresentation()` 实际解析得到。完整战役含 69 个剧情段、157 个有角色台词回合；普通台词额外保留主角在左侧舞台。

| 分类 | 实际文件数 | 决策 |
| --- | ---: | --- |
| BG | 11 | REDRAW 已完成 |
| CG | 6 | REDRAW 已完成；序章 CG 重分类为短暂的无人环境事件镜头 |
| TRANSITION / FX | 2 | REDRAW 已完成 |
| SPRITE | 21 | KEEP；未改动 |
| FACE / EXPRESSION | 24 | KEEP；未改动 |
| 合计 | 64 | 19 张替换，45 张保护保留 |

### BG（11）

| ID | 运行时文件 | 实际用途 | 人物 | 结论 |
| --- | --- | --- | --- | --- |
| BG-00 | `public/assets/anime/themes/theme-forest-approach.webp` | F1–F4、猫卫长/狐祝/剑圣场景；序章普通台词由专用 night 背景接续 | 无 | REDRAW 完成 |
| BG-08 | `public/assets/anime/themes/theme-night-tower.webp` | 序章普通台词、F8–F10、王庭与女王场景 | 无 | REDRAW 完成 |
| BG-09 | `public/assets/anime/themes/theme-sun-sanctum.webp` | F11、F12、F14、F17 | 无 | REDRAW 完成 |
| BG-10 | `public/assets/anime/themes/theme-ocean-archive.webp` | F6、F16、F18、鲸歌场景 | 无 | REDRAW 完成 |
| BG-01 | `public/assets/anime/themes/theme-red-vein.webp` | F5、F13、龙姬场景 | 无 | REDRAW 完成 |
| BG-02 | `public/assets/anime/themes/theme-star-mirror.webp` | F7、F15、天穹魔女与影织姬场景 | 无 | REDRAW 完成 |
| BG-03 | `public/assets/anime/themes/theme-echo-court.webp` | F19、回声摄政官场景 | 无 | REDRAW 完成 |
| BG-04 | `public/assets/anime/themes/theme-origin-core.webp` | F20、奥术主权者与起源核心场景 | 无 | REDRAW 完成 |
| BG-05 | `public/assets/anime/themes/theme-ash-registry.webp` | F21–F27 | 无 | REDRAW 完成 |
| BG-06 | `public/assets/anime/themes/theme-archive-storm.webp` | F28–F29 | 无 | REDRAW 完成 |
| BG-07 | `public/assets/anime/themes/theme-ember-lighthouse.webp` | F30、终章、档案守望者场景 | 无 | REDRAW 完成 |

### CG（6）

| ID | 运行时文件 | 实际剧情点 | 人物 | 结论 |
| --- | --- | --- | --- | --- |
| CG-01 | `public/assets/anime/cg/liyue-prologue-tower-cg.webp` | 序章第 1 句的七核心环境定场镜头 | 无 | REDRAW + RECLASSIFY 完成；仅关键镜头显示，下一句立即回到 BG + SPRITE |
| CG-02 | `public/assets/anime/cg/liyue-noctia-truth-cg.webp` | F10 女王真相 | 璃、诺克缇娅 | REDRAW 完成 |
| CG-08 | `public/assets/anime/cg/liyue-noctia-seal-cg.webp` | F10 共同破印 | 璃、诺克缇娅 | REDRAW 完成 |
| CG-06 | `public/assets/anime/cg/liyue-echo-ledger-cg.webp` | F19 名簿归还 | 璃、摄政官、诺克缇娅 | REDRAW 完成 |
| CG-09 | `public/assets/anime/cg/liyue-noctia-sovereign-cg.webp` | F20 印戒问责 | 璃、主权者、诺克缇娅 | REDRAW 完成 |
| CG-07 | `public/assets/anime/cg/liyue-lighthouse-archive-cg.webp` | F30 / 终章灯塔归档 | 璃、纱雾、诺克缇娅 | REDRAW 完成 |

### TRANSITION / FX（2）

| ID | 运行时文件 | 实际用途 | 结论 |
| --- | --- | --- | --- |
| TRANS-01 | `public/assets/anime/transitions/witness-entry.webp` | 普通见证场进入；所有 GAL 场景返回 | REDRAW 完成 |
| TRANS-02 | `public/assets/anime/transitions/seal-shatter.webp` | Boss、F19/F20 与后期关键场景进入 | REDRAW 完成 |

### SPRITE（21，全部 KEEP）

| 运行时文件 | 角色 / 表情职责 |
| --- | --- |
| `public/assets/anime/characters/liyue-dialogue-resolve.webp` | 璃：决意 / 默认 |
| `public/assets/anime/characters/liyue-dialogue-guarded-v2.webp` | 璃：克制 |
| `public/assets/anime/characters/liyue-dialogue-embers-v2.webp` | 璃：战意 |
| `public/assets/anime/characters/shawu-dialogue-gentle.webp` | 纱雾：温柔、担忧、低回、凝神 |
| `public/assets/anime/characters/noctia-dialogue-sorrow.webp` | 诺克缇娅：哀伤 / 威仪 |
| `public/assets/anime/characters/noctia-dialogue-knowing-v2.webp` | 诺克缇娅：了然 |
| `public/assets/anime/characters/noctia-dialogue-cold-v2.webp` | 诺克缇娅：冷峻 |
| `public/assets/anime/characters/yanli-dialogue-embers.webp` | 龙姬·焰璃 |
| `public/assets/anime/characters/yayu-dialogue-guarded.webp` | 影织姬·鸦羽 |
| `public/assets/anime/characters/echo-regent-dialogue-grave.webp` | 回声摄政官：肃穆 |
| `public/assets/anime/characters/echo-regent-dialogue-release.webp` | 回声摄政官：放手 |
| `public/assets/anime/characters/arcane-sovereign-dialogue-regret.webp` | 奥术主权者：愧悔 |
| `public/assets/anime/characters/arcane-sovereign-dialogue-acceptance.webp` | 奥术主权者：承担 |
| `public/assets/anime/characters/archive-warden-dialogue-duty.webp` | 档案守望者：执行 |
| `public/assets/anime/portraits/v1/cat-boss-portrait-runtime.webp` | 猫卫长·米露舞台图 |
| `public/assets/anime/portraits/v1/fox-boss-portrait-runtime.webp` | 狐祝·绯叶舞台图 |
| `public/assets/anime/portraits/v1/whale-boss-portrait-runtime.webp` | 深蓝歌姬·澜音舞台图 |
| `public/assets/anime/portraits/v1/sword-boss-portrait-runtime.webp` | 剑圣·塞蕾娜舞台图 |
| `public/assets/anime/portraits/v1/astral-boss-portrait-runtime.webp` | 天穹魔女·露米舞台图 |
| `public/assets/anime/portraits/v1/merchant-keke-portrait-runtime.webp` | 阵间商人·珂珂舞台图 |
| `public/assets/anime/portraits/v1/crown-magus-portrait-runtime.webp` | 冠冕导师舞台图 |

### FACE / EXPRESSION（24，全部 KEEP）

| 运行时文件 | 角色 / 表情职责 |
| --- | --- |
| `public/assets/anime/avatars/liyue-avatar-resolve-cel.webp` | 璃：决意 |
| `public/assets/anime/avatars/liyue-avatar-stern-cel.webp` | 璃：警觉 |
| `public/assets/anime/avatars/liyue-avatar-guarded-cel.webp` | 璃：克制 |
| `public/assets/anime/avatars/liyue-avatar-embers-cel.webp` | 璃：战意 |
| `public/assets/anime/avatars/shawu-avatar-gentle-cel.webp` | 纱雾：温柔 |
| `public/assets/anime/avatars/shawu-avatar-watchful-cel.webp` | 纱雾：担忧 |
| `public/assets/anime/avatars/shawu-avatar-lament-cel.webp` | 纱雾：低回 |
| `public/assets/anime/avatars/shawu-avatar-focus-cel.webp` | 纱雾：凝神 |
| `public/assets/anime/avatars/noctia-avatar-sorrow-cel.webp` | 诺克缇娅：哀伤 |
| `public/assets/anime/avatars/noctia-avatar-grave-cel.webp` | 诺克缇娅：威仪 |
| `public/assets/anime/avatars/noctia-avatar-knowing-cel.webp` | 诺克缇娅：了然 |
| `public/assets/anime/avatars/noctia-avatar-cold-cel.webp` | 诺克缇娅：冷峻 |
| `public/assets/anime/avatars/cat-boss-avatar-alert.webp` | 猫卫长·米露：警惕 |
| `public/assets/anime/avatars/fox-boss-avatar-watchful.webp` | 狐祝·绯叶：审视 |
| `public/assets/anime/avatars/whale-boss-avatar-lament.webp` | 深蓝歌姬·澜音：低回 |
| `public/assets/anime/avatars/sword-boss-avatar-stern.webp` | 剑圣·塞蕾娜：肃然 |
| `public/assets/anime/avatars/dragon-boss-avatar-embers.webp` | 龙姬·焰璃：炽烈 |
| `public/assets/anime/avatars/astral-boss-avatar-focus.webp` | 天穹魔女·露米：推演 |
| `public/assets/anime/avatars/shadow-boss-avatar-guarded.webp` | 影织姬·鸦羽：戒备 |
| `public/assets/anime/avatars/merchant-avatar-knowing.webp` | 阵间商人·珂珂：了然 |
| `public/assets/anime/avatars/echo-regent-avatar-grave.webp` | 回声摄政官：肃穆 |
| `public/assets/anime/avatars/arcane-sovereign-avatar-regret.webp` | 奥术主权者：愧悔 |
| `public/assets/anime/avatars/crown-magus-avatar-certain.webp` | 冠冕导师：执念 |
| `public/assets/anime/avatars/archive-warden-avatar-duty.webp` | 档案守望者：执行 |

## 排除项

- `public/assets/anime/cg/liyue-critical-cg.webp` 与 `liyue-defeat-cg.webp` 只由战斗弹窗读取，不进入 `#gal-root`。
- `public/assets/anime/cg/liyue-noctia-afterlight-cg.webp` 当前没有运行时引用。
- `public/assets/anime/themes/theme-forest-sanctuary.webp` 只由地图画布主题读取。
- `public/assets/anime/characters/*-runtime.webp` 中未被上述 `dialoguePresentation()` 解析出的文件，不计入 GAL 舞台实际清单。

## 职责与切换结论

- 普通台词固定为 `BG + SPRITE + FACE + textbox`。
- `turn.cg` 只在对应回合创建 `.gal-cg`；下一回合重新渲染且没有 `turn.cg` 时，该节点消失，不会残留。
- 有 CG 的回合仍由 `.has-cg` 明确标记；普通 standing sprite 只作为同一回合的数据层存在，视觉样式负责在事件 CG 中隐藏/降级，避免双重人物构图。
- 所有 19 张替换资产都经 `galArtUrl()` 加上 `?v=20260902-cel3`，包含预加载路径与实际渲染路径。
- 旧资产的 Git blob SHA、归档路径、旧母版路径和替换原因见 `07_archive/2026-09-02-pre-cel-gal-refresh/manifest.json`。
