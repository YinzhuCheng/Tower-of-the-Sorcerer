# Gal 赛璐璐统一重绘 · 提示词契约 v4

日期：2026-09-02。适用范围：`public/assets/anime/themes`、`public/assets/anime/cg`、`public/assets/anime/transitions`。

## 共同风格锁

> Japanese 2D anime cel-shaded visual novel art, classic Japanese shoujo Galgame aesthetic; clean gentle fine linework, broad flat color planes, restrained two-step cel shading, at most one simple highlight per material, television-anime level detail, quiet low-noise finish, gentle anti-aliased edges, cinematic but readable composition. No photorealism, no painterly realism, no 3D render, no western comic style, no mobile-game splash art, no hyper-detail, no micro-texture, no gritty texture, no film grain, no oversharpening, no HDR, no excessive bloom, no lens flare, no clutter, no text, no logo, no watermark.

共同色板：午夜蓝、低饱和靛青、蓝白索引灯、克制紫色裂隙、少量古铜登记印；诺克缇娅仅增加有限酒红色。所有图保持中等对比，禁止死黑。

共同塔体锚点：黑曜石拱门、小型古铜登记印、蓝白索引灯、一条细紫色封印裂隙。锚点只承担世界观连续性，不得堆满画面。

## BG 契约

- 1672×941，16:9。
- 纯环境，无人物、无剪影、无生物。
- 左右各保留立绘站位，底部 30% 降低细节密度。
- 禁止内置对话框、UI 带、边框、伪文字。
- 12 张：forest-approach、forest-sanctuary、night-tower、sun-sanctum、ocean-archive、red-vein、star-mirror、echo-court、origin-core、ash-registry、archive-storm、ember-lighthouse。

## CG 契约

- 1672×941，16:9；仅关键剧情或战斗预演使用，不作为普通对话背景循环播放。
- 旧 CG 仅用于锁定人物脸、发色、服装轮廓、主色、道具和叙事动作；禁止继承厚涂、噪点、微纹理和海报密度。
- 底部 25% 使用真实场景地面/留白，不得画出对话框、半透明横条或 UI。
- 9 张：critical、defeat、prologue-tower、noctia-truth、noctia-afterlight、noctia-seal、echo-ledger、noctia-sovereign、lighthouse-archive。

## 转场契约

- 1672×941，16:9，无人物。
- 使用少量大形状建立单一方向感；禁止密集碎片、粒子风暴和界面化边框。
- 2 张：witness-entry、seal-shatter。

## 一致性工作流

1. 先生成 `theme-forest-approach` 作为系列锚点。
2. 所有 BG 与转场固定引用该锚点，只改变地点和剧情道具。
3. 所有 CG 同时引用锚点与对应旧 CG：前者锁画风，后者锁人物身份和动作。
4. 逐张检查人数、伪文字、UI、尺寸、WebP 可解码性和文本安全区；失败图重做，不进入运行时目录。

