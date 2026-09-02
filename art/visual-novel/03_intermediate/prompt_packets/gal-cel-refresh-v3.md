# GAL 赛璐璐统一重绘 · 提示词包 v3

## 全批风格锁

每张图必须包含并服从：

> Japanese 2D anime cel-shaded visual novel art, shoujo Galgame aesthetic; clean simple linework, broad flat color shapes, restrained two-step cel shading, soft atmospheric depth, controlled highlights, low visual noise and gentle edges. No photorealism, no 3D render, no painterly concept art, no over-detailed surfaces, no micro-textures, no noisy brushwork, no film grain, no excessive bloom, no extreme contrast, no oversharpening, no crunchy edges, no text, no logo, no watermark.

统一塔身锚点：黑曜石拱门、小型黄铜登记印、蓝白索引灯、一道细紫封印裂隙。普通背景必须 16:9、无人、左右立绘位清爽，底部 30% 为低细节对话框安全区。

第一张 `BG_00 forest approach` 为全批风格参考。其余图只继承它的线条、色块、明暗与空气透视，不复制森林构图。剧情 CG 另以现有立绘作为身份和服装参考，但将细碎服装纹理简化为清晰的赛璐璐色块。

## 普通背景

| ID | 运行时文件 | 场景方向 |
| --- | --- | --- |
| BG-00 | `theme-forest-approach.webp` | 冷色黎明森林入口；远处失落高塔；纯环境开场 |
| BG-01 | `theme-red-vein.webp` | 空避难所仍在工作的红脉炉、供暖管与上行阶梯 |
| BG-02 | `theme-star-mirror.webp` | 月光星镜、无字证据页、三道月相刻痕 |
| BG-03 | `theme-echo-court.webp` | 低矮空王座、月光、无字玻璃名牌、开阔地面 |
| BG-04 | `theme-origin-core.webp` | 破裂钴蓝印戒、宽阔登记环、冷却管；禁止科幻屏幕 |
| BG-05 | `theme-ash-registry.webp` | 暖灰档案库、空白信件、铜灯、修复而非废墟 |
| BG-06 | `theme-archive-storm.webp` | 可读的塔内观测室、少量纸页与一条稳定阶梯 |
| BG-07 | `theme-ember-lighthouse.webp` | 破晓塔顶、余烬灯塔、平静灰港；禁止庆功烟花 |
| BG-08 | `theme-night-tower.webp` | 无声女王空王庭、低王座、月窗与封闭侧门 |
| BG-09 | `theme-sun-sanctum.webp` | 日之圣所、空仪式台、克制太阳纹；庄严但非胜利画面 |
| BG-10 | `theme-ocean-archive.webp` | 浅水档案厅、空白档案牌、远处撤离信标与上行阶梯 |

## 剧情 CG 与转场

| ID | 运行时文件 | 场景方向 |
| --- | --- | --- |
| CG-01 | `liyue-prologue-tower-cg.webp` | 无人物；停战夜高塔与七枚核心的象征镜头 |
| CG-02 | `liyue-noctia-truth-cg.webp` | F10 王庭；璃放低剑，诺克缇娅托住褪色求援光 |
| CG-06 | `liyue-echo-ledger-cg.webp` | F19 摄政官释放名簿，璃与诺克缇娅共同见证 |
| CG-07 | `liyue-lighthouse-archive-cg.webp` | F30 三人背向镜头望向归档灯塔与灰港 |
| CG-08 | `liyue-noctia-seal-cg.webp` | F10 蓝色剑弧与红色封印术共同击碎中央登记封印 |
| CG-09 | `liyue-noctia-sovereign-cg.webp` | F20 主权者托住破裂印戒，璃与诺克缇娅面对后果 |
| TRANS-01 | `witness-entry.webp` | 蓝白档案门、阶梯、少量空白纸页；安静进入见证场 |
| TRANS-02 | `seal-shatter.webp` | 黑色圆形登记封印分成宽阔碎片；红紫张力但不灾难化 |

人物立绘与头像/表情是本轮保护资产，不生成、不替换。战斗弹窗 CG 与未引用素材不属于本轮 GAL 运行时范围。
