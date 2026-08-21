# 月辉星穹地图素材接口

地图美术采用 manifest 驱动，运行时文件位于 `public/assets/anime/map/`。

## 推荐目录

- `wall/`：主体、横向、纵向、拐角等自动拼接墙体
- `floor/`：连续地面与低对比度变化地面
- `gate/`：日曜、月辉、星蚀结界门
- `stairs/`：上下楼层入口
- `portal/`：传送阵与特殊空间节点

## 添加或替换素材

推荐直接上传透明 WebP（地图格约 58px，运行时建议 80–160px）。上传后只修改 `public/assets/anime/map/manifest.json` 中对应条目的 `file`、`scale` 或 `alpha`，无需修改渲染器。

墙体由 `src/game/autotile.js` 根据上下左右邻接关系选择主体、横向、纵向或拐角素材。逻辑网格仍为 11×11，但渲染层不绘制逐格边框，因此视觉上保持连续迷宫结构。

主角四方向素材继续使用已有 `hero-down/up/left/right` 资源，但现在由 Canvas 最上层直接渲染，不再使用独立 DOM 覆盖层。
