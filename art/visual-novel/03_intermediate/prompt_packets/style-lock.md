# 《失落魔法塔》Gal 美术提示词规范

每一条新图提示词都必须包含以下风格锁，不能用“二次元”一词替代：

> **Japanese 2D anime cel-shaded visual novel art, shoujo Galgame aesthetic; clean simple linework, broad flat color shapes, restrained two-step cel shading, soft atmospheric depth, controlled highlights, low visual noise, gentle edges, cinematic but readable composition. No 3D render, no painterly photorealism, no western comic style, no over-detailed surfaces, no micro-textures, no film grain, no oversharpening, no text, no logo, no watermark.**

## 立绘模板

```text
[STYLE LOCK]
Character identity lock: [copy the exact identity sentence from character-canon.json].
Expression: [named expression and eye/mouth direction].
Pose: full body, three-quarter front, feet visible, arms and props fully inside the canvas.
Output: isolated standing sprite, transparent background, centered composition, clear silhouette,
room for a Galgame textbox across the lower 28 percent of the screen.
```

## 背景模板

```text
[STYLE LOCK]
Environment: [specific place, time, weather, narrative mood].
Composition: 16:9 visual-novel background, a clean open middle ground for two full-body standing
sprites, key architectural focal point above the lower textbox line, atmospheric depth, no people.
Output: background only, no character, no text, no UI, no watermark. Keep the bottom 30 percent
low detail for the dialogue UI; avoid noisy brushwork, tiny debris, excessive bloom and sharp micro-contrast.
```

## 验收要点

- 立绘必须从头饰到鞋完整可见；透明边缘干净，不能切到脚、武器或饰物。
- 背景必须留出左、右角色站位和底部对话框，不把视觉焦点塞进 UI 区。
- 背景以大色块、两段式赛璐璐阴影和柔和空气透视为主；拒绝厚涂、照片质感、过度细节化、锐化边缘与噪点。
- 同一角色的发色、瞳色、衣装主色、关键饰品和体态不能漂移。
- 表情通过眉、眼、嘴、肩部姿态一起变化；不能只替换一双眼睛。
