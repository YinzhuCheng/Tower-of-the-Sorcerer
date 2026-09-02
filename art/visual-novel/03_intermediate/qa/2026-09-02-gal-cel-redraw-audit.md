# 2026-09-02 GAL 赛璐璐统一重画审计

## 冻结项

- `public/assets/anime/characters/**`：立绘与表情差分，保留。
- `public/assets/anime/avatars/**`：头像与表情，保留。

## 统一生成约束

所有新图必须是 **Japanese 2D anime cel-shaded visual novel art, shoujo Galgame aesthetic**。使用清晰而简洁的线稿、平整色块、2–3 阶受控赛璐璐阴影和柔和空气透视；减少微纹理、颗粒、碎屑与高频细节；禁止过度锐化、厚涂、写实材质、3D 渲染、概念设计海报感、文字、标志、水印。

背景统一为 16:9、无人、无 UI，左右保留全身立绘站位，底部 30% 保持低细节。CG 只在关键叙事帧出现人物，并使用现有立绘作为身份参考。转场强调简洁图形层次，避免复杂贴图。

## 本轮替换清单

| 类型 | 运行时文件 | 用途 | 决策 | 核心画面方向 |
| --- | --- | --- | --- | --- |
| BG | `theme-night-tower.webp` | 序章、F8–10、女王场景 | 重画 | 月夜黑曜石高塔入口与封闭王庭；无人 |
| BG | `theme-sun-sanctum.webp` | F11/12/14/17 | 重画 | 日光仪式圣所、空席与登记印；无人 |
| BG | `theme-ocean-archive.webp` | F6/16/18 | 重画 | 潮汐淹没的档案回廊、失落信号灯；无人 |
| BG | `theme-forest-approach.webp` | F1–4、森林序章 | 重画 | 冷晨森林通往同一座高塔；无人 |
| BG | `theme-red-vein.webp` | F5/13 | 重画 | 疲惫的红金救援熔炉与供暖管；无人 |
| BG | `theme-star-mirror.webp` | F7/15 | 重画并修复 | 星镜档案库；当前远端文件损坏 |
| BG | `theme-echo-court.webp` | F19 | 重画 | 月光下沉王座与无字玻璃名牌；无人 |
| BG | `theme-origin-core.webp` | F20 | 重画 | 蓝白登记环环绕破裂印章；无人 |
| BG | `theme-ash-registry.webp` | F21–27 | 重画 | 暖灰档案库、未投递空白信件；无人 |
| BG | `theme-archive-storm.webp` | F28–29 | 重画 | 克制的档案风暴与仍可通行的石阶；无人 |
| BG | `theme-ember-lighthouse.webp` | F30、结局 | 重画 | 破晓余烬灯塔与平静灰港；无人 |
| CG | `liyue-prologue-tower-cg.webp` | 序章关键帧 | 重画 | 璃在月夜塔前，塔门刚封闭 |
| CG | `liyue-critical-cg.webp` | 残血战斗演出 | 重画 | 璃半跪稳住剑势，克制危险感 |
| CG | `liyue-defeat-cg.webp` | 战败预演 | 重画 | 璃力竭但无伤口特写，避免猎奇 |
| CG | `liyue-noctia-truth-cg.webp` | F10 真相 | 重画 | 璃与诺克缇娅查看蓝光回执 |
| CG | `liyue-noctia-afterlight-cg.webp` | 保留的终章候选帧 | 重画 | 璃与诺克缇娅在风暴后的安静余光中 |
| CG | `liyue-noctia-seal-cg.webp` | F10 共同破封 | 重画 | 两人并肩打破封锁，清楚动作剪影 |
| CG | `liyue-echo-ledger-cg.webp` | F19 名簿归还 | 重画 | 璃、诺克缇娅、摄政官与封印名簿 |
| CG | `liyue-noctia-sovereign-cg.webp` | F20 共同归档 | 重画 | 璃、诺克缇娅与主权者面对破裂印章 |
| CG | `liyue-lighthouse-archive-cg.webp` | F30 灯塔转归档 | 重画 | 璃、纱雾、诺克缇娅与柔和灯塔 |
| TRANS | `witness-entry.webp` | 进入见证场 | 重画 | 蓝白索引光、简洁石阶与空白纸页 |
| TRANS | `seal-shatter.webp` | Boss 封印解锁 | 重画 | 紫红封印裂开但不爆炸、不繁复 |

## 不进入本轮的素材

- `theme-forest-sanctuary.webp` 仅供玩法地图主题使用，不由 `gal-root` 加载；本轮不替换。
- 地图格、敌方单位、物品、HUD 与战斗头像不按 GAL 背景标准重画。

## 替换与归档规则

1. 覆盖以上运行时原路径，保证现有代码引用不变。
2. 将被覆盖的运行时原图按同名保存到 `art/visual-novel/07_archive/2026-09-02-pre-cel-redraw/`。
3. 新母版保存到 `art/visual-novel/04_cg/working/2026-09-02-cel-redraw/`，发布版保存到 `art/visual-novel/04_cg/final/2026-09-02-cel-redraw/`。
4. 每张发布图必须通过 WebP 解码、16:9 尺寸、无意外文字/人物（背景）和低噪点目检。
