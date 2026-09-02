# Gal 资产审计与替换清单 v4

日期：2026-09-02。结论：立绘、头像和表情差分全部保留；其余已发布 GAL 舞台图统一重画。旧文件进入 `art/visual-novel/archive/pre-celshade-gal-refresh-2026-09-02/`。

| 运行时文件 | 分类 | 用途 | 处理 | 验收重点 |
| --- | --- | --- | --- | --- |
| `themes/theme-forest-approach.webp` | BG | 序章/1–4F 首道门槛 | 重画替换 | 无人、冷晨、塔入口、左右立绘位 |
| `themes/theme-forest-sanctuary.webp` | BG | 森林视觉层 | 重画替换 | 无人、月夜林间圣所、低噪点 |
| `themes/theme-night-tower.webp` | BG | 8–10F 无声王庭 | 重画替换 | 无人、空王座、底部低细节 |
| `themes/theme-sun-sanctum.webp` | BG | 11/12/14/17F 日轮圣所 | 重画替换 | 无人、公开仪式台、非厚涂 |
| `themes/theme-ocean-archive.webp` | BG | 6/16/18F 潮汐档案 | 重画替换 | 无人、室内水渠、平静反光 |
| `themes/theme-red-vein.webp` | BG | 5/13F 赤脉炉室 | 重画替换 | 无人、救援供暖而非战场 |
| `themes/theme-star-mirror.webp` | BG | 7/15F 星镜档案 | 重画替换 | 修复旧损坏 WebP；空镜与空白证页 |
| `themes/theme-echo-court.webp` | BG | 19F 回响王庭 | 重画替换 | 无人、玻璃名牌、开阔中景 |
| `themes/theme-origin-core.webp` | BG | 20F 起源魔源 | 重画替换 | 无人、简化登记环与印戒 |
| `themes/theme-ash-registry.webp` | BG | 21–27F 余烬登记库 | 重画替换 | 无人、无伪文字、修复氛围 |
| `themes/theme-archive-storm.webp` | BG | 28–29F 档案风暴 | 重画替换 | 无人、少量纸片、保留稳定阶梯 |
| `themes/theme-ember-lighthouse.webp` | BG | 30F 余烬灯塔 | 重画替换 | 无人、港湾信号、非胜利海报 |
| `cg/liyue-critical-cg.webp` | 战斗 CG | 残血险胜预演 | 重画替换 | 单人、无敌方、非宣传立绘 |
| `cg/liyue-defeat-cg.webp` | 战斗 CG | 战败预演 | 重画替换 | 单人、无伤口/血腥、仍可读 |
| `cg/liyue-prologue-tower-cg.webp` | 关键 CG | 序章首帧 | 重画替换 | 单次使用；人物小、塔为主焦点 |
| `cg/liyue-noctia-truth-cg.webp` | 关键 CG | 10F 真相对谈 | 重画替换 | 两人对谈、无攻击姿态 |
| `cg/liyue-noctia-afterlight-cg.webp` | 备用关键 CG | 黎明余光 | 重画替换 | 已发布但当前无剧情引用；保持候选一致性 |
| `cg/liyue-noctia-seal-cg.webp` | 高潮 CG | 10F 共同破封 | 重画替换 | 两人协作、已移除误生 UI 横带 |
| `cg/liyue-echo-ledger-cg.webp` | 关键 CG | 19F 名簿归还 | 重画替换 | 三人、封闭名簿、非对峙海报 |
| `cg/liyue-noctia-sovereign-cg.webp` | 关键 CG | 20F 签名承担 | 重画替换 | 三人、破裂印戒、克制构图 |
| `cg/liyue-lighthouse-archive-cg.webp` | 结局 CG | 30F 灯塔归档 | 重画替换 | 璃/纱雾/诺克缇娅、温和收束 |
| `transitions/witness-entry.webp` | 转场 | 见证场进入/返回 | 重画替换 | 无人、单向阶梯、少量纸与登记印 |
| `transitions/seal-shatter.webp` | 转场 | Boss/破封进入 | 重画替换 | 无人、少量大碎片、非粒子爆炸 |

统一技术验收：23/23 为可解码 WebP，1672×941；运行时路径不改名；最终运行时哈希记录于 `05_manifests/gal-cel-refresh-v4-manifest.json`。并行进入远端的 v3 母版与清单保留作上一轮追溯，不再作为 v4 运行时字节基准。
