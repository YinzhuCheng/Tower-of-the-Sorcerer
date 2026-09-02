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
